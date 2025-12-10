import sys
import os

# Add your project directory to the sys.path
project_home = '/home/kdeak1210/dashboards/Flask-API'
if project_home not in sys.path:
    sys.path = [project_home] + sys.path

# Set environment variables if needed
os.environ['FLASK_ENV'] = 'production'

# Import your Flask app
from app import app as application
