from pyramid.response import Response
from pyramid.config import Configurator
from pyramid.events import NewResponse


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    with Configurator(settings=settings) as config:
        # Aktifkan CORS untuk preflight OPTIONS
        config.add_route('cors', '/{catch_all:.*}', request_method="OPTIONS")
        config.add_view(handle_cors, route_name='cors', renderer='json')
        
        # Tambahkan CORS headers ke semua response
        config.add_subscriber(add_cors_headers_to_response, NewResponse)
        
        config.include('pyramid_jinja2')
        config.include('.models')
        config.include('.routes')
        config.scan()
    return config.make_wsgi_app()


def handle_cors(request):
    """Handle preflight OPTIONS requests"""
    response = Response()
    response.headers.update({
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
    })
    return response


def add_cors_headers_to_response(event):
    """Add CORS headers to all responses"""
    response = event.response
    response.headers.update({
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization',
    })