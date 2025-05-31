def includeme(config):
    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_route('home', '/')

    """Wallet routes configuration"""
    # Wallet routes
    config.add_route('wallets', '/api/wallets')
    config.add_route('wallet_detail', '/api/wallets/{id}')
    config.add_route('wallet_balance', '/api/wallets/{id}/balance')

    """Transaction routes configuration"""
    # Transaction routes
    config.add_route('transactions', '/api/transactions')
    config.add_route('transaction_detail', '/api/transactions/{id}')

    """Utility routes configuration"""
    # Utility routes
    config.add_route('categories', '/api/categories')
    config.add_route('wallet_types', '/api/wallet-types')
    config.add_route('transaction_types', '/api/transaction-types')

    config.add_route('get_categories', '/api/categories')
