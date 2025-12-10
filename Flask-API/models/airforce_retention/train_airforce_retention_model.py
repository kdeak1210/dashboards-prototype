import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    roc_curve
)
import joblib
import os
import warnings
warnings.filterwarnings('ignore')

# Load the data
df = pd.read_csv('airforce_retention_data.csv')

print("=" * 80)
print("AIRFORCE RETENTION MODEL TRAINING")
print("=" * 80)

# Basic dataset info
print(f"\nDataset shape: {df.shape}")
print(f"\nColumn names and types:")
print(df.dtypes)
print(f"\nMissing values:")
print(df.isnull().sum())
print(f"\nTarget variable distribution:")
print(df['retained'].value_counts())
print(f"Retention rate: {df['retained'].sum() / len(df) * 100:.2f}%")

# Data preprocessing
print("\n" + "=" * 80)
print("DATA PREPROCESSING")
print("=" * 80)

# Create a copy for preprocessing
df_processed = df.copy()

# Convert target to binary (True/False -> 1/0)
df_processed['retained'] = df_processed['retained'].astype(int)

# Encode categorical variables
label_encoders = {}
categorical_columns = ['gender', 'marital_status', 'grade_rank']

for col in categorical_columns:
    le = LabelEncoder()
    df_processed[col + '_encoded'] = le.fit_transform(df_processed[col])
    label_encoders[col] = le
    print(f"\n{col} encoding:")
    for i, label in enumerate(le.classes_):
        print(f"  {label} -> {i}")

# Feature engineering: Extract rank level from grade_rank
df_processed['rank_level'] = df_processed['grade_rank'].str.extract(r'E-(\d+)').astype(int)

# Select features for modeling
feature_columns = [
    'age',
    'gender_encoded',
    'marital_status_encoded',
    'num_dependents',
    'rank_level',
    'salary',
    'years_of_service',
    'num_prior_reenlistments',
    'bonuses_received'
]

X = df_processed[feature_columns]
y = df_processed['retained']

print(f"\nFeature set shape: {X.shape}")
print(f"Features used: {feature_columns}")

# Split the data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\nTraining set size: {X_train.shape[0]}")
print(f"Test set size: {X_test.shape[0]}")

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train multiple models
print("\n" + "=" * 80)
print("MODEL TRAINING AND EVALUATION")
print("=" * 80)

models = {
    'Logistic Regression': LogisticRegression(random_state=42, max_iter=1000),
    'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10),
    'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, random_state=42, max_depth=5)
}

results = {}

for name, model in models.items():
    print(f"\n{'-' * 80}")
    print(f"Training {name}...")
    print(f"{'-' * 80}")

    # Train the model
    if name == 'Logistic Regression':
        model.fit(X_train_scaled, y_train)
        y_pred = model.predict(X_test_scaled)
        y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]

        # Cross-validation for Logistic Regression
        cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='f1')
    else:
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        y_pred_proba = model.predict_proba(X_test)[:, 1]

        # Cross-validation for tree-based models
        cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='f1')

    # Evaluate
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_pred_proba)

    print(f"\nCross-validation F1 Score: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
    print(f"Test Accuracy: {accuracy:.4f}")
    print(f"Test Precision: {precision:.4f}")
    print(f"Test Recall: {recall:.4f}")
    print(f"Test F1 Score: {f1:.4f}")
    print(f"Test ROC AUC: {roc_auc:.4f}")
    print(f"\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Not Retained', 'Retained']))
    print(f"\nConfusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(cm)
    print(f"  True Negatives: {cm[0,0]}, False Positives: {cm[0,1]}")
    print(f"  False Negatives: {cm[1,0]}, True Positives: {cm[1,1]}")

    results[name] = {
        'model': model,
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'roc_auc': roc_auc,
        'cv_scores': cv_scores,
        'y_pred': y_pred,
        'y_pred_proba': y_pred_proba
    }

# Select best model based on F1 score (better for potentially imbalanced data)
best_model_name = max(results, key=lambda x: results[x]['f1'])
best_model = results[best_model_name]['model']

print("\n" + "=" * 80)
print(f"BEST MODEL: {best_model_name}")
print(f"F1 Score: {results[best_model_name]['f1']:.4f}")
print(f"ROC AUC: {results[best_model_name]['roc_auc']:.4f}")
print(f"Accuracy: {results[best_model_name]['accuracy']:.4f}")
print(f"Precision: {results[best_model_name]['precision']:.4f}")
print(f"Recall: {results[best_model_name]['recall']:.4f}")
print("=" * 80)

# Feature importance (for tree-based models)
if best_model_name in ['Random Forest', 'Gradient Boosting']:
    print("\nFeature Importances:")
    feature_importance = pd.DataFrame({
        'feature': feature_columns,
        'importance': best_model.feature_importances_
    }).sort_values('importance', ascending=False)
    print(feature_importance)

# Hyperparameter tuning for best model
print("\n" + "=" * 80)
print("HYPERPARAMETER TUNING")
print("=" * 80)

if best_model_name == 'Random Forest':
    print("\nPerforming Grid Search for Random Forest...")
    param_grid = {
        'n_estimators': [100, 200, 300],
        'max_depth': [10, 20, None],
        'min_samples_split': [2, 5],
        'min_samples_leaf': [1, 2]
    }
    grid_search = GridSearchCV(
        RandomForestClassifier(random_state=42),
        param_grid,
        cv=5,
        scoring='f1',
        n_jobs=-1,
        verbose=1
    )
    grid_search.fit(X_train, y_train)
    best_model = grid_search.best_estimator_

    print(f"\nBest parameters: {grid_search.best_params_}")
    print(f"Best CV F1 score: {grid_search.best_score_:.4f}")

    # Re-evaluate with tuned model
    y_pred = best_model.predict(X_test)
    y_pred_proba = best_model.predict_proba(X_test)[:, 1]

    print(f"\nTuned model performance:")
    print(f"  Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(f"  Precision: {precision_score(y_test, y_pred):.4f}")
    print(f"  Recall: {recall_score(y_test, y_pred):.4f}")
    print(f"  F1 Score: {f1_score(y_test, y_pred):.4f}")
    print(f"  ROC AUC: {roc_auc_score(y_test, y_pred_proba):.4f}")

elif best_model_name == 'Gradient Boosting':
    print("\nPerforming Grid Search for Gradient Boosting...")
    param_grid = {
        'n_estimators': [100, 200],
        'max_depth': [3, 5, 7],
        'learning_rate': [0.01, 0.1, 0.2],
        'min_samples_split': [2, 5]
    }
    grid_search = GridSearchCV(
        GradientBoostingClassifier(random_state=42),
        param_grid,
        cv=5,
        scoring='f1',
        n_jobs=-1,
        verbose=1
    )
    grid_search.fit(X_train, y_train)
    best_model = grid_search.best_estimator_

    print(f"\nBest parameters: {grid_search.best_params_}")
    print(f"Best CV F1 score: {grid_search.best_score_:.4f}")

    # Re-evaluate with tuned model
    y_pred = best_model.predict(X_test)
    y_pred_proba = best_model.predict_proba(X_test)[:, 1]

    print(f"\nTuned model performance:")
    print(f"  Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(f"  Precision: {precision_score(y_test, y_pred):.4f}")
    print(f"  Recall: {recall_score(y_test, y_pred):.4f}")
    print(f"  F1 Score: {f1_score(y_test, y_pred):.4f}")
    print(f"  ROC AUC: {roc_auc_score(y_test, y_pred_proba):.4f}")
else:
    print(f"\nNo hyperparameter tuning for {best_model_name}")

# Save the best model and preprocessing objects
print("\n" + "=" * 80)
print("SAVING MODEL ARTIFACTS")
print("=" * 80)

# Create models directory if it doesn't exist
os.makedirs('models', exist_ok=True)

# Save the model
model_filename = 'models/airforce_retention_model.pkl'
joblib.dump(best_model, model_filename)
print(f"Model saved to: {model_filename}")

# Save the scaler (if needed)
if best_model_name == 'Logistic Regression':
    scaler_filename = 'models/airforce_retention_scaler.pkl'
    joblib.dump(scaler, scaler_filename)
    print(f"Scaler saved to: {scaler_filename}")

# Save label encoders
encoders_filename = 'models/airforce_retention_encoders.pkl'
joblib.dump(label_encoders, encoders_filename)
print(f"Label encoders saved to: {encoders_filename}")

# Save feature columns list
feature_info = {
    'feature_columns': feature_columns,
    'model_type': best_model_name,
    'requires_scaling': best_model_name == 'Logistic Regression'
}
joblib.dump(feature_info, 'models/airforce_retention_feature_info.pkl')
print(f"Feature info saved to: models/airforce_retention_feature_info.pkl")

print("\n" + "=" * 80)
print("TRAINING COMPLETE!")
print("=" * 80)
print(f"\nBest Model: {best_model_name}")
print(f"Model artifacts saved in 'models/' directory")

# Example prediction
print("\n" + "=" * 80)
print("EXAMPLE PREDICTION")
print("=" * 80)

sample_data = {
    'age': 28,
    'gender': 'Male',
    'marital_status': 'Married',
    'num_dependents': 2,
    'grade_rank': 'E-6 (TSgt)',
    'salary': 47000,
    'years_of_service': 10,
    'num_prior_reenlistments': 2,
    'bonuses_received': 10000
}

print(f"\nSample airman profile:")
for key, value in sample_data.items():
    print(f"  {key}: {value}")

# Prepare sample for prediction
sample_df = pd.DataFrame([sample_data])

# Encode categorical variables
for col in categorical_columns:
    sample_df[col + '_encoded'] = label_encoders[col].transform(sample_df[col])

# Extract rank level
sample_df['rank_level'] = sample_df['grade_rank'].str.extract(r'E-(\d+)').astype(int)

# Select features
sample_features = sample_df[feature_columns]

# Make prediction
if best_model_name == 'Logistic Regression':
    sample_features_scaled = scaler.transform(sample_features)
    prediction = best_model.predict(sample_features_scaled)[0]
    prediction_proba = best_model.predict_proba(sample_features_scaled)[0]
else:
    prediction = best_model.predict(sample_features)[0]
    prediction_proba = best_model.predict_proba(sample_features)[0]

print(f"\nPrediction: {'RETAINED' if prediction == 1 else 'NOT RETAINED'}")
print(f"Retention probability: {prediction_proba[1]:.2%}")
print(f"Non-retention probability: {prediction_proba[0]:.2%}")
print("=" * 80)
