### Requirements
Python https://www.python.org/downloads/

### Flask API
Installation Guide: https://flask.palletsprojects.com/en/stable/installation/
Quickstart Guide: https://flask.palletsprojects.com/en/stable/quickstart/

###### Create 'virtual environment' for python flask project and activate it
```
cd Flask-API
python -m venv .venv
.venv\Scripts\activate
```

###### Add Envision access token for test development purposes
Make sure you are in the Flask-API folder, and create a file called .env
This file will store environment variables which can include personal access tokens for running the app
On line 1, add your envision token in this format then save the file:
```
ENVISION_TOKEN={your token without braces}
```

###### Install dependencies
Make sure you are in the virtual environment
```
pip install -r requirements.txt
```
Runs pip install for flask, flask-cors, pandas, scikit-learn etc

### Run the Flask server
```
flask run --debug
```

### Open the frontend app
Open Frontend/index.html in your browser