# views/transaction_views.py
from pyramid.view import view_config
from pyramid.httpexceptions import HTTPNotFound, HTTPBadRequest
from backendlagi.models.base import get_db_session
from backendlagi.models.wallet import Wallet
from backendlagi.models.transaction import Transaction, TransactionType, expenseCategory, incomeCategory
from backendlagi.models.category import Category
from datetime import datetime

class TransactionViews:
    
    def __init__(self, request):
        self.request = request
        self.session = get_db_session()
    
    def __del__(self):
        if hasattr(self, 'session'):
            self.session.close()

@view_config(route_name='transactions', request_method='GET', renderer='json')
def get_transactions(request):
    session = get_db_session()
    try:
        # Get query parameters for filtering
        wallet_id = request.params.get('wallet_id')
        transaction_type = request.params.get('type')
        limit = request.params.get('limit', 100)
        
        query = session.query(Transaction)
        
        if wallet_id:
            query = query.filter(Transaction.wallet_id == wallet_id)
        
        if transaction_type:
            try:
                trans_type = TransactionType(transaction_type)
                query = query.filter(Transaction.tipe_transaksi == trans_type)
            except ValueError:
                pass
        
        transactions = query.order_by(Transaction.created_at.desc()).limit(int(limit)).all()
        result = [transaction.to_dict() for transaction in transactions]
        
        return {'status': 'success', 'data': result, 'count': len(result)}
    except Exception as e:
        request.response.status = 500
        return {'status': 'error', 'message': str(e)}
    finally:
        session.close()

@view_config(route_name='transaction_detail', request_method='GET', renderer='json')
def get_transaction(request):
    transaction_id = request.matchdict['id']
    session = get_db_session()
    try:
        transaction = session.query(Transaction).filter(Transaction.id == transaction_id).first()
        if not transaction:
            request.response.status = 404
            return {'status': 'error', 'message': 'Transaction not found'}
        
        return {'status': 'success', 'data': transaction.to_dict()}
    except Exception as e:
        request.response.status = 500
        return {'status': 'error', 'message': str(e)}
    finally:
        session.close()

@view_config(route_name='transactions', request_method='POST', renderer='json')
def create_transaction(request):
    try:
        data = request.json_body
    except:
        request.response.status = 400
        return {'status': 'error', 'message': 'Invalid JSON data'}
    
    # Validate required fields
    required_fields = ['tipe_transaksi', 'jumlah', 'category_id', 'wallet_id', 'tanggal']
    for field in required_fields:
        if field not in data or data[field] is None:
            request.response.status = 400
            return {'status': 'error', 'message': f'Field {field} is required'}
    
    # Validate transaction type
    try:
        tipe_transaksi = TransactionType(data['tipe_transaksi'])
    except ValueError:
        request.response.status = 400
        valid_types = [tt.value for tt in TransactionType]
        return {'status': 'error', 'message': f'Invalid transaction type. Valid types: {valid_types}'}
    
    # Validate amount
    try:
        jumlah = float(data['jumlah'])
        if jumlah <= 0:
            request.response.status = 400
            return {'status': 'error', 'message': 'Amount must be greater than 0'}
    except (ValueError, TypeError):
        request.response.status = 400
        return {'status': 'error', 'message': 'Invalid amount format'}
    
    # Validate category based on transaction type
    if tipe_transaksi == TransactionType.expense:
        valid_categories = [cat.value for cat in expenseCategory]
    else:
        valid_categories = [cat.value for cat in incomeCategory]
    
    if data['category_id'] not in valid_categories:
        request.response.status = 400
        return {
            'status': 'error', 
            'message': f'Invalid category for {tipe_transaksi.value} transaction. Valid categories: {valid_categories}'
        }
    
    session = get_db_session()
    try:
        # Check if wallet exists
        wallet = session.query(Wallet).filter(Wallet.id == data['wallet_id']).first()
        if not wallet:
            request.response.status = 404
            return {'status': 'error', 'message': 'Wallet not found'}
        
        # Check if expense amount doesn't exceed wallet balance
        if tipe_transaksi == TransactionType.expense and jumlah > wallet.saldo_saat_ini:
            request.response.status = 400
            return {
                'status': 'error', 
                'message': f'Insufficient balance. Current balance: {wallet.saldo_saat_ini}'
            }
        
        # Parse date
        try:
            if isinstance(data['tanggal'], str):
                tanggal = datetime.fromisoformat(data['tanggal'].replace('Z', '+00:00'))
            else:
                tanggal = data['tanggal']
        except:
            request.response.status = 400
            return {'status': 'error', 'message': 'Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'}
        
        # Create transaction
        transaction = Transaction(
            tipe_transaksi=tipe_transaksi,
            jumlah=jumlah,
            deskripsi=data.get('deskripsi', ''),
            category_id=data['category_id'],
            wallet_id=data['wallet_id'],
            tanggal=tanggal,
            catatan=data.get('catatan', '')
        )
        
        # Update wallet balance
        if tipe_transaksi == TransactionType.income:
            wallet.saldo_saat_ini += jumlah
        else:
            wallet.saldo_saat_ini -= jumlah
        
        wallet.updated_at = datetime.utcnow()
        
        session.add(transaction)
        session.commit()
        session.refresh(transaction)
        
        result = transaction.to_dict()
        result['wallet_balance'] = wallet.saldo_saat_ini
        
        request.response.status = 201
        return {
            'status': 'success', 
            'data': result, 
            'message': 'Transaction created successfully'
        }
    except Exception as e:
        session.rollback()
        request.response.status = 500
        return {'status': 'error', 'message': str(e)}
    finally:
        session.close()

@view_config(route_name='transaction_detail', request_method='PUT', renderer='json')
def update_transaction(request):
    transaction_id = request.matchdict['id']
    
    try:
        data = request.json_body
    except:
        request.response.status = 400
        return {'status': 'error', 'message': 'Invalid JSON data'}
    
    session = get_db_session()
    try:
        transaction = session.query(Transaction).filter(Transaction.id == transaction_id).first()
        if not transaction:
            request.response.status = 404
            return {'status': 'error', 'message': 'Transaction not found'}
        
        wallet = transaction.wallet
        old_amount = transaction.jumlah
        old_type = transaction.tipe_transaksi
        
        # Revert old transaction effect on wallet balance
        if old_type == TransactionType.income:
            wallet.saldo_saat_ini -= old_amount
        else:
            wallet.saldo_saat_ini += old_amount
        
        # Update transaction fields
        if 'tipe_transaksi' in data:
            try:
                transaction.tipe_transaksi = TransactionType(data['tipe_transaksi'])
            except ValueError:
                request.response.status = 400
                valid_types = [tt.value for tt in TransactionType]
                return {'status': 'error', 'message': f'Invalid transaction type. Valid types: {valid_types}'}
        
        if 'jumlah' in data:
            try:
                new_amount = float(data['jumlah'])
                if new_amount <= 0:
                    request.response.status = 400
                    return {'status': 'error', 'message': 'Amount must be greater than 0'}
                transaction.jumlah = new_amount
            except (ValueError, TypeError):
                request.response.status = 400
                return {'status': 'error', 'message': 'Invalid amount format'}
        
        if 'category_id' in data:
            # Validate category
            if transaction.tipe_transaksi == TransactionType.expense:
                valid_categories = [cat.value for cat in expenseCategory]
            else:
                valid_categories = [cat.value for cat in incomeCategory]
            
            if data['category_id'] not in valid_categories:
                request.response.status = 400
                return {
                    'status': 'error', 
                    'message': f'Invalid category for {transaction.tipe_transaksi.value} transaction. Valid categories: {valid_categories}'
                }
            
            transaction.category_id = data['category_id']
        
        if 'deskripsi' in data:
            transaction.deskripsi = data['deskripsi']
        
        if 'catatan' in data:
            transaction.catatan = data['catatan']
        
        if 'tanggal' in data:
            try:
                if isinstance(data['tanggal'], str):
                    transaction.tanggal = datetime.fromisoformat(data['tanggal'].replace('Z', '+00:00'))
                else:
                    transaction.tanggal = data['tanggal']
            except:
                request.response.status = 400
                return {'status': 'error', 'message': 'Invalid date format'}
        
        # Apply new transaction effect on wallet balance
        if transaction.tipe_transaksi == TransactionType.income:
            wallet.saldo_saat_ini += transaction.jumlah
        else:
            if transaction.jumlah > wallet.saldo_saat_ini:
                request.response.status = 400
                return {
                    'status': 'error', 
                    'message': f'Insufficient balance. Current balance: {wallet.saldo_saat_ini}'
                }
            wallet.saldo_saat_ini -= transaction.jumlah
        
        wallet.updated_at = datetime.utcnow()
        session.commit()
        session.refresh(transaction)
        
        result = transaction.to_dict()
        result['wallet_balance'] = wallet.saldo_saat_ini
        
        return {
            'status': 'success', 
            'data': result, 
            'message': 'Transaction updated successfully'
        }
    except Exception as e:
        session.rollback()
        request.response.status = 500
        return {'status': 'error', 'message': str(e)}
    finally:
        session.close()

@view_config(route_name='transaction_detail', request_method='DELETE', renderer='json')
def delete_transaction(request):
    transaction_id = request.matchdict['id']
    session = get_db_session()
    try:
        transaction = session.query(Transaction).filter(Transaction.id == transaction_id).first()
        if not transaction:
            request.response.status = 404
            return {'status': 'error', 'message': 'Transaction not found'}
        
        wallet = transaction.wallet
        transaction_desc = transaction.deskripsi or f"{transaction.tipe_transaksi.value} - {transaction.jumlah}"
        
        # Revert transaction effect on wallet balance
        if transaction.tipe_transaksi == TransactionType.income:
            wallet.saldo_saat_ini -= transaction.jumlah
        else:
            wallet.saldo_saat_ini += transaction.jumlah
        
        wallet.updated_at = datetime.utcnow()
        
        session.delete(transaction)
        session.commit()
        
        return {
            'status': 'success', 
            'message': f'Transaction "{transaction_desc}" deleted successfully',
            'wallet_balance': wallet.saldo_saat_ini
        }
    except Exception as e:
        session.rollback()
        request.response.status = 500
        return {'status': 'error', 'message': str(e)}
    finally:
        session.close()