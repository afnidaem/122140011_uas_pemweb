from pyramid.view import view_config
from pyramid.response import Response
from sqlalchemy.orm import joinedload
from backendlagi.models.base import get_db_session
from backendlagi.models.wallet import Wallet
from backendlagi.models.transaction import Transaction, TransactionType, expenseCategory, incomeCategory
from ..models import Category, TransactionType

@view_config(route_name='get_categories', renderer='json', request_method='GET')
def get_categories(request):
    tipe = request.params.get('transaction_type')

    if tipe not in ['income', 'expense']:
        return Response(json_body={'error': 'transaction_type harus income atau expense'}, status=400)

    # Ambil session dari request (bukan DBSession global)
    session = request.dbsession

    categories = session.query(Category).filter(Category.transaction_type == TransactionType(tipe)).all()
    return [cat.to_dict() for cat in categories]