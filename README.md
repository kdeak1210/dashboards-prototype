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