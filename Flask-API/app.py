from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd # Example for data handling

app = Flask(__name__)
CORS(app)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

# Load the trained model
model = pickle.load(open('pickles/iris_log_reg.pkl', 'rb'))
flowers = ["Setosa", "Versicolor", "Virginica"]

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json(force=True)
    # Assuming input data is a dictionary matching model's features
    df = pd.DataFrame([data])
    prediction = model.predict(df)  # returns an index for the flowers list
    index = int(prediction[0])
    return jsonify({'prediction': flowers[index]})

    # return jsonify({'prediction': prediction.tolist()})

if __name__ == '__main__':
    app.run(debug=True)