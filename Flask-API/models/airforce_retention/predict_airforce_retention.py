"""
Air Force Retention Prediction Script

This script loads the trained retention model and makes predictions
for individual airmen based on their profile information.

Usage:
    python predict_airforce_retention.py
"""

import pandas as pd
import joblib
import sys

def load_model_artifacts():
    """Load all model artifacts from the models directory."""
    try:
        model = joblib.load('models/airforce_retention_model.pkl')
        scaler = joblib.load('models/airforce_retention_scaler.pkl')
        encoders = joblib.load('models/airforce_retention_encoders.pkl')
        feature_info = joblib.load('models/airforce_retention_feature_info.pkl')
        return model, scaler, encoders, feature_info
    except FileNotFoundError as e:
        print(f"Error: Could not find model files. Please run train_airforce_retention_model.py first.")
        print(f"Details: {e}")
        sys.exit(1)

def prepare_input(data, encoders, scaler, feature_columns, requires_scaling):
    """
    Prepare input data for prediction.

    Args:
        data: Dictionary with airman profile information
        encoders: Dictionary of label encoders for categorical variables
        scaler: StandardScaler for numerical features
        feature_columns: List of feature column names
        requires_scaling: Boolean indicating if scaling is needed

    Returns:
        Prepared DataFrame ready for prediction
    """
    # Create DataFrame from input
    df = pd.DataFrame([data])

    # Encode categorical variables
    categorical_columns = ['gender', 'marital_status', 'grade_rank']
    for col in categorical_columns:
        if col not in data:
            raise ValueError(f"Missing required field: {col}")
        df[col + '_encoded'] = encoders[col].transform(df[col])

    # Extract rank level from grade_rank
    df['rank_level'] = df['grade_rank'].str.extract(r'E-(\d+)').astype(int)

    # Select features in correct order
    features = df[feature_columns]

    # Apply scaling if required (for Logistic Regression)
    if requires_scaling:
        features = scaler.transform(features)

    return features

def predict_retention(data, model, scaler, encoders, feature_info):
    """
    Predict retention for an airman.

    Args:
        data: Dictionary with airman profile information
        model: Trained ML model
        scaler: StandardScaler object
        encoders: Dictionary of label encoders
        feature_info: Dictionary with feature column names and model info

    Returns:
        Dictionary with prediction and probability
    """
    features = prepare_input(
        data,
        encoders,
        scaler,
        feature_info['feature_columns'],
        feature_info['requires_scaling']
    )

    # Make prediction
    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]

    return {
        'retained': bool(prediction),
        'retention_probability': probabilities[1],
        'non_retention_probability': probabilities[0]
    }

def main():
    """Main function to demonstrate model usage."""
    print("=" * 80)
    print("AIR FORCE RETENTION PREDICTION")
    print("=" * 80)

    # Load model artifacts
    print("\nLoading model artifacts...")
    model, scaler, encoders, feature_info = load_model_artifacts()
    print(f"Model type: {feature_info['model_type']}")
    print(f"Features used: {len(feature_info['feature_columns'])}")

    # Example predictions for different airman profiles
    test_cases = [
        {
            'name': 'Senior NCO with high retention indicators',
            'age': 35,
            'gender': 'Male',
            'marital_status': 'Married',
            'num_dependents': 2,
            'grade_rank': 'E-7 (MSgt)',
            'salary': 65000,
            'years_of_service': 16,
            'num_prior_reenlistments': 4,
            'bonuses_received': 20000
        },
        {
            'name': 'Young airman, first term',
            'age': 20,
            'gender': 'Female',
            'marital_status': 'Single',
            'num_dependents': 0,
            'grade_rank': 'E-3 (A1C)',
            'salary': 30000,
            'years_of_service': 2,
            'num_prior_reenlistments': 0,
            'bonuses_received': 0
        },
        {
            'name': 'Mid-career NCO with family',
            'age': 28,
            'gender': 'Male',
            'marital_status': 'Married',
            'num_dependents': 2,
            'grade_rank': 'E-6 (TSgt)',
            'salary': 47000,
            'years_of_service': 10,
            'num_prior_reenlistments': 2,
            'bonuses_received': 10000
        },
        {
            'name': 'Junior airman, no retention bonus',
            'age': 21,
            'gender': 'Male',
            'marital_status': 'Single',
            'num_dependents': 0,
            'grade_rank': 'E-4 (SrA)',
            'salary': 35000,
            'years_of_service': 3,
            'num_prior_reenlistments': 0,
            'bonuses_received': 0
        }
    ]

    for i, case in enumerate(test_cases, 1):
        print(f"\n{'=' * 80}")
        print(f"PREDICTION {i}: {case['name']}")
        print("=" * 80)

        # Remove name from data before prediction
        name = case.pop('name')

        print("\nAirman Profile:")
        for key, value in case.items():
            print(f"  {key}: {value}")

        # Make prediction
        result = predict_retention(case, model, scaler, encoders, feature_info)

        print(f"\n{'PREDICTION RESULT':^80}")
        print("-" * 80)
        print(f"  Status: {'WILL BE RETAINED' if result['retained'] else 'WILL NOT BE RETAINED'}")
        print(f"  Retention Probability: {result['retention_probability']:.2%}")
        print(f"  Non-Retention Probability: {result['non_retention_probability']:.2%}")

        # Interpretation
        if result['retention_probability'] >= 0.8:
            confidence = "Very High"
        elif result['retention_probability'] >= 0.6:
            confidence = "High"
        elif result['retention_probability'] >= 0.4:
            confidence = "Moderate"
        else:
            confidence = "Low"

        print(f"  Confidence in Retention: {confidence}")

    print("\n" + "=" * 80)
    print("PREDICTIONS COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    main()
