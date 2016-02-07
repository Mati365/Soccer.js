import os

from flask import Flask
from flask_restful import Api

from soccer_rest.servers import ServerResource

app = Flask(__name__)
api = Api(app)

# Add api resources
api.add_resource(ServerResource, '/list')

def run_server():
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))