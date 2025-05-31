# app.py
from pyramid.config import Configurator
from pyramid.renderers import JSON
from backendlagi.models import create_tables
import os

def create_app():
    """Create and configure the Pyramid application"""
    
    # Create database tables
    create_tables()
    
    # Configuration
    settings = {
        'pyramid.reload_templates': True,
        'pyramid.debug_authorization': False,
        'pyramid.debug_notfound': False,
        'pyramid.debug_routematch': False,
        'pyramid.default_locale_name': 'en',
    }
    
    config = Configurator(settings=settings)
    
    # Include routes
    config.include('routes')
    
    # Scan for view functions
    config.scan('views')
    
    # Configure JSON renderer
    json_renderer = JSON()
    json_renderer.add_adapter(None, lambda obj, request: obj)
    config.add_renderer('json', json_renderer)
    
    # Add CORS support
    def add_cors_headers_response_callback(event):
        def cors_headers(request, response):
            response.headers.update({
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST,GET,DELETE,PUT,OPTIONS',
                'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Max-Age': '1728000',
            })
        event.request.add_response_callback(cors_headers)
    
    config.add_subscriber(add_cors_headers_response_callback, 'pyramid.events.NewRequest')
    
    return config.make_wsgi_app()

def main(global_config, **settings):
    """Entry point for pserve"""
    return create_app()