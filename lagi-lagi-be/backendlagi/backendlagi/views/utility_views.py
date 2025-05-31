# views/utility_views.py
from pyramid.view import view_config
from backendlagi.models import expenseCategory, incomeCategory, WalletType, TransactionType

@view_config(route_name='categories', request_method='GET', renderer='json')
def get_categories(request):
    transaction_type = request.params.get('type', 'all')
    
    if transaction_type == 'expense':
        categories = [
            {
                'value': cat.value, 
                'label': cat.value.replace('_', ' ').replace('dan', '&').title()
            } 
            for cat in expenseCategory
        ]
        return {'status': 'success', 'data': categories}
    elif transaction_type == 'income':
        categories = [
            {
                'value': cat.value, 
                'label': cat.value.replace('_', ' ').title()
            } 
            for cat in incomeCategory
        ]
        return {'status': 'success', 'data': categories}
    else:
        expense_cats = [
            {
                'value': cat.value, 
                'label': cat.value.replace('_', ' ').replace('dan', '&').title(), 
                'type': 'expense'
            } 
            for cat in expenseCategory
        ]
        income_cats = [
            {
                'value': cat.value, 
                'label': cat.value.replace('_', ' ').title(), 
                'type': 'income'
            } 
            for cat in incomeCategory
        ]
        return {
            'status': 'success', 
            'data': {
                'expense': expense_cats, 
                'income': income_cats
            }
        }

@view_config(route_name='wallet_types', request_method='GET', renderer='json')
def get_wallet_types(request):
    wallet_types = [
        {
            'value': wt.value,
            'label': wt.value.replace('_', ' ').title()
        }
        for wt in WalletType
    ]
    return {'status': 'success', 'data': wallet_types}

@view_config(route_name='transaction_types', request_method='GET', renderer='json')
def get_transaction_types(request):
    transaction_types = [
        {
            'value': tt.value,
            'label': tt.value.title()
        }
        for tt in TransactionType
    ]
    return {'status': 'success', 'data': transaction_types}