from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import json
import os
import pandas as pd # Example for data handling

# Get the absolute path of the current file's directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
CORS(app)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

# Iris Section
# Load the trained model using absolute path
iris_model_path = os.path.join(BASE_DIR, 'pickles', 'iris_log_reg.pkl')
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
house_model_path = os.path.join(BASE_DIR, 'pickles', 'house_price_lin_reg.pkl')
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

if __name__ == '__main__':
    app.run(debug=True)