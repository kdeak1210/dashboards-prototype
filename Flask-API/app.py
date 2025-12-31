from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from io import StringIO
import os
import requests
import pickle
import joblib
import json
import os
import pandas as pd # Example for data handling

# Load environment variable from .env file
load_dotenv()

# Access Envision Token from key name defined in .env file
ENVISION_TOKEN = os.getenv("ENVISION_TOKEN")

# Get the absolute path of the current file's directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
CORS(app)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

# Iris Section
# Load the trained model using absolute path
iris_model_path = os.path.join(BASE_DIR, 'models/iris_prediction', 'iris_log_reg.pkl')
iris_model = pickle.load(open(iris_model_path, 'rb'))
iris_species = ["Setosa", "Versicolor", "Virginica"]

# API call to handle Iris model requests
@app.route('/predict-iris', methods=['POST'])
def predict_iris():
    data = request.get_json(force=True)
    # Assuming input data is a dictionary matching model's features
    df = pd.DataFrame([data])
    prediction = iris_model.predict(df)  # returns an index for the iris_species list
    index = int(prediction[0])
    return jsonify({'prediction': iris_species[index]})
    # return jsonify({'prediction': prediction.tolist()})

# API call to fetch Iris dataset in JSON format
@app.route('/iris-data', methods=['GET'])
def get_iris_data():
    iris_data_path = os.path.join(BASE_DIR, 'datasets', 'iris.json')
    with open(iris_data_path) as iris_data:
        iris_json = json.load(iris_data)
        return iris_json

# House Price Section
# house_model = pickle.load(open('pickles/house_price_random_forest.pkl', 'rb'))
house_model_path = os.path.join(BASE_DIR, 'models/house_price', 'house_price_lin_reg.pkl')
house_model = pickle.load(open(house_model_path, 'rb'))

# API call to handle house price prediction requests
@app.route('/predict-house', methods=['POST'])
def predict_house():
    data = request.get_json(force=True)
    df = pd.DataFrame([data])
    prediction = house_model.predict(df)[0]
    return jsonify({'prediction': prediction})

# Reference for the house price model prediction function
# def predict_house_price(bedrooms, bathrooms, sqft_lot, waterfront):
#     """
#     Predict house price based on input features.

#     Parameters:
#     -----------
#     bedrooms : int
#         Number of bedrooms
#     bathrooms : float
#         Number of bathrooms
#     sqft_lot : int
#         Square footage of the lot
#     waterfront : int
#         Waterfront property (0 = No, 1 = Yes)

#     Returns:
#     --------
#     float
#         Predicted house price
#     """

# Air Force Retention Section
# Load model artifacts
retention_model_path = os.path.join(BASE_DIR, 'models/airforce_retention', 'airforce_retention_model.pkl')
retention_scaler_path = os.path.join(BASE_DIR, 'models/airforce_retention', 'airforce_retention_scaler.pkl')
retention_encoders_path = os.path.join(BASE_DIR, 'models/airforce_retention', 'airforce_retention_encoders.pkl')
retention_feature_info_path = os.path.join(BASE_DIR, 'models/airforce_retention', 'airforce_retention_feature_info.pkl')

retention_model = joblib.load(retention_model_path)
retention_scaler = joblib.load(retention_scaler_path)
retention_encoders = joblib.load(retention_encoders_path)
retention_feature_info = joblib.load(retention_feature_info_path)

# Prepare input data
# airman_data = {
#     'age': 28,
#     'gender': 'Male',
#     'marital_status': 'Married',
#     'num_dependents': 2,
#     'grade_rank': 'E-6 (TSgt)',
#     'salary': 47000,
#     'years_of_service': 10,
#     'num_prior_reenlistments': 2,
#     'bonuses_received': 10000
# }

# API call to handle Air Force retention prediction requests
@app.route('/predict-retention', methods=['POST'])
def predict_retention():
    data = request.get_json(force=True)

    # Create DataFrame
    # df = pd.DataFrame([airman_data])
    df = pd.DataFrame([data])

    # Encode categorical variables
    for col in ['gender', 'marital_status', 'grade_rank']:
        df[col + '_encoded'] = retention_encoders[col].transform(df[col])

    # Extract rank level
    df['rank_level'] = df['grade_rank'].str.extract(r'E-(\d+)').astype(int)

    # Select features
    features = df[retention_feature_info['feature_columns']]

    # Scale features (Logistic Regression requires scaling)
    features_scaled = retention_scaler.transform(features)

    # Make prediction
    prediction = retention_model.predict(features_scaled)[0]
    probabilities = retention_model.predict_proba(features_scaled)[0]

    return jsonify({
        'retained': bool(prediction),
        'retention_probability': probabilities[1],
        'non_retention_probability': probabilities[0]
    })

# Envision Section - testinc capabilities for future development tasks
hostname = 'https://envision.af.mil'

# API call to query an Envision dataset
@app.route('/envision-dataset', methods=['GET'])
def get_envision_dataset():
    rid = request.args.get('rid')
    row_limit = request.args.get('rowLimit')
    url = f"{hostname}/api/v2/datasets/{rid}/readTable?format=CSV&rowLimit={row_limit}"

    # Format Authorization header as a bearer token
    headers = {
        "Authorization": f"Bearer {ENVISION_TOKEN}"
    }

    # GET Request to Envision API
    try:
        response = requests.get(url, headers=headers, verify=False)
        response.raise_for_status()
        
        df = pd.read_csv(StringIO(response.text))
        
        csv_data = df.to_json(orient="records", indent=4)
        return jsonify(csv_data)
    
    except Exception as e:
        return jsonify({"error": str(e)})

# API call to predict ticket assignment using Envision hosted model
@app.route('/predict_ticket_assignment', methods=['POST'])
def predict_ticket_assignment():
    deployment_rid = "placeholder"
    url = f"{hostname}/foundry-ml-live/api/inference/transform/{deployment_rid}/v2"

    # Get JSON body from incoming request
    data = request.get_json(force=True)

    # Format Authorization header as a bearer token
    headers = {
        "Authorization": f"Bearer {ENVISION_TOKEN}"
    }

    # POST Request to Envision API
    try:
        response = requests.post(url, headers=headers, json=data, verify=False)
        response.raise_for_status()

        # Return the exact same response from Envision
        return jsonify(response.json())

    except Exception as e:
        return jsonify({"error": str(e)})

# API call to fetch Air Force retention dataset
@app.route('/local-retention-dataset', methods=['GET'])
def get_local_retention_dataset(): 

    # Read CSV data
    csv_path = os.path.join(BASE_DIR, 'models/airforce_retention', 'airforce_retention_data.csv')
    df = pd.read_csv(csv_path)

    # Convert DataFrame to JSON format
    csv_data = df.to_dict(orient='records')

    return jsonify(csv_data)

if __name__ == '__main__':
    app.run(debug=True)