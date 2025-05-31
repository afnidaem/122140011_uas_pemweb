# views/wallet_views.py
from pyramid.view import view_config
from pyramid.httpexceptions import HTTPNotFound, HTTPBadRequest
from backendlagi.models import get_db_session, Wallet, WalletType
from datetime import datetime

class WalletViews:
    
    def __init__(self, request):
        self.request = request
        self.session = get_db_session()
    
    def __del__(self):
        if hasattr(self, 'session'):
            self.session.close()

@view_config(route_name='wallets', request_method='GET', renderer='json')
def get_wallets(request):
    session = get_db_session()
    try:
        wallets = session.query(Wallet).all()
        result = [wallet.to_dict() for wallet in wallets]
        return {'status': 'success', 'data': result}
    except Exception as e:
        request.response.status = 500
        return {'status': 'error', 'message': str(e)}
    finally:
        session.close()

@view_config(route_name='wallet_detail', request_method='GET', renderer='json')
def get_wallet(request):
    wallet_id = request.matchdict['id']
    session = get_db_session()
    try:
        wallet = session.query(Wallet).filter(Wallet.id == wallet_id).first()
        if not wallet:
            request.response.status = 404
            return {'status': 'error', 'message': 'Wallet not found'}
        
        return {'status': 'success', 'data': wallet.to_dict()}
    except Exception as e:
        request.response.status = 500
        return {'status': 'error', 'message': str(e)}
    finally:
        session.close()

@view_config(route_name='wallets', request_method='POST', renderer='json')
def create_wallet(request):
    try:
        data = request.json_body
    except:
        request.response.status = 400
        return {'status': 'error', 'message': 'Invalid JSON data'}
    
    # Validate required fields
    required_fields = ['nama_dompet', 'tipe_dompet']
    for field in required_fields:
        if field not in data or not data[field]:
            request.response.status = 400
            return {'status': 'error', 'message': f'Field {field} is required'}
    
    # Validate wallet type
    try:
        tipe_dompet = WalletType(data['tipe_dompet'].lower())
    except ValueError:
        request.response.status = 400
        valid_types = [wt.value for wt in WalletType]
        return {'status': 'error', 'message': f'Invalid wallet type. Valid types: {valid_types}'}
    
    session = get_db_session()
    try:
        wallet = Wallet(
            nama_dompet=data['nama_dompet'],
            deskripsi=data.get('deskripsi', ''),
            saldo_awal=float(data.get('saldo_awal', 0.0)),
            tipe_dompet=tipe_dompet,
            warna=data.get('warna', '#000000')
        )
        session.add(wallet)
        session.commit()
        session.refresh(wallet)
        
        request.response.status = 201
        return {
            'status': 'success', 
            'data': wallet.to_dict(), 
            'message': 'Wallet created successfully'
        }
    except Exception as e:
        session.rollback()
        request.response.status = 500
        return {'status': 'error', 'message': str(e)}
    finally:
        session.close()

@view_config(route_name='wallet_detail', request_method='PUT', renderer='json')
def update_wallet(request):
    wallet_id = request.matchdict['id']
    
    try:
        data = request.json_body
    except:
        request.response.status = 400
        return {'status': 'error', 'message': 'Invalid JSON data'}
    
    session = get_db_session()
    try:
        wallet = session.query(Wallet).filter(Wallet.id == wallet_id).first()
        if not wallet:
            request.response.status = 404
            return {'status': 'error', 'message': 'Wallet not found'}
        
        # Update fields
        if 'nama_dompet' in data:
            wallet.nama_dompet = data['nama_dompet']
        if 'deskripsi' in data:
            wallet.deskripsi = data['deskripsi']
        if 'tipe_dompet' in data:
            try:
                wallet.tipe_dompet = WalletType(data['tipe_dompet'])
            except ValueError:
                request.response.status = 400
                valid_types = [wt.value for wt in WalletType]
                return {'status': 'error', 'message': f'Invalid wallet type. Valid types: {valid_types}'}
        if 'warna' in data:
            wallet.warna = data['warna']
        
        wallet.updated_at = datetime.utcnow()
        session.commit()
        session.refresh(wallet)
        
        return {
            'status': 'success', 
            'data': wallet.to_dict(), 
            'message': 'Wallet updated successfully'
        }
    except Exception as e:
        session.rollback()
        request.response.status = 500
        return {'status': 'error', 'message': str(e)}
    finally:
        session.close()

@view_config(route_name='wallet_detail', request_method='DELETE', renderer='json')
def delete_wallet(request):
    wallet_id = request.matchdict['id']
    session = get_db_session()
    try:
        wallet = session.query(Wallet).filter(Wallet.id == wallet_id).first()
        if not wallet:
            request.response.status = 404
            return {'status': 'error', 'message': 'Wallet not found'}
        
        wallet_name = wallet.nama_dompet
        session.delete(wallet)
        session.commit()
        
        return {
            'status': 'success', 
            'message': f'Wallet "{wallet_name}" deleted successfully'
        }
    except Exception as e:
        session.rollback()
        request.response.status = 500
        return {'status': 'error', 'message': str(e)}
    finally:
        session.close()

@view_config(route_name='wallet_balance', request_method='GET', renderer='json')
def get_wallet_balance(request):
    wallet_id = request.matchdict['id']
    session = get_db_session()
    try:
        wallet = session.query(Wallet).filter(Wallet.id == wallet_id).first()
        if not wallet:
            request.response.status = 404
            return {'status': 'error', 'message': 'Wallet not found'}
        
        return {
            'status': 'success', 
            'data': {
                'wallet_id': wallet.id,
                'wallet_name': wallet.nama_dompet,
                'saldo_awal': wallet.saldo_awal,
                'saldo_saat_ini': wallet.saldo_saat_ini
            }
        }
    except Exception as e:
        request.response.status = 500
        return {'status': 'error', 'message': str(e)}
    finally:
        session.close()