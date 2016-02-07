import requests
import socket
import time

from flask import request
from flask_restful import Resource

# Get current time in milliseconds
current_time = lambda: int(round(time.time() * 1000))

class Server:
    PORT = 3000

    def __init__(self, ip):
        self.ip = ip
        self.last_validation = current_time()

        # Extract keys from array to compress data
        self.location = Server.get_server_location(ip)
        self.location = {
            key: self.location[key] for key in ['country_code', 'city']
        }

        # country_code should be in lowercase
        self.location['country_code'] = (self.location['country_code'] or 'ly').lower()

    def serialize(self):
        """ Serialize object
        :return: Return json
        """
        return {
              'ip':  self.ip
            , 'location': self.location
        }

    def is_alive(self):
        """ Check if server is alive
        :return: returns true if alive
        """
        return current_time() - self.last_validation < 10000

    @staticmethod
    def get_server_location(ip):
        """ Get server location
        :param ip: IP to locate
        :return: request response
        """
        return requests.get('http://freegeoip.net/json/{}'.format(ip)).json()

# Server list
server_list = []

class ServerResource(Resource):
    @staticmethod
    def _remove_dead_servers():
        """ Remove dead servers from list
        :return:
        """
        global server_list
        server_list = [
            val for val in server_list if val.is_alive()
        ]

    def get(self):
        """ Get list of servers registered on server
        :return: Server list
        """
        ServerResource._remove_dead_servers()
        return {
                   'list': [server.serialize() for server in server_list]
               }\
            , 201\
            , {'Access-Control-Allow-Origin': '*'}

    def post(self):
        """ Register new server on servers lists
        :return:
        """
        new_ip = request.form['ip']
        server = next((val for val in server_list if val.ip == new_ip), None)
        if not server:
            server_list.append(Server(new_ip))
        else:
            server.last_validation = current_time()
        return {}, 201
