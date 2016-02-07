import sys
from soccer_rest import routes

if __name__ == '__main__':
    sys.exit(routes.run_server() or 0)