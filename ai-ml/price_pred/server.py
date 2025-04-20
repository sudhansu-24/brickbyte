from flask import Flask, request, jsonify, render_template
import pickle
import numpy as np


app = Flask(__name__)

def predict_property_price(model, rental_yield, appreciation_rate, crime_rate, aqi, 
                         transport_score, school_rating, walkability, city):
    
    cities = {
        'Boston': 0, 'Chicago': 0, 'Dallas': 0, 'Denver': 0, 
        'Houston': 0, 'Los Angeles': 0, 'Miami': 0, 'New York City': 0,
        'San Francisco': 0, 'Seattle': 0
    }

    if city in cities:
        cities[city] = 1
    
    input_data = np.array([[
        rental_yield,
        appreciation_rate,
        crime_rate,
        aqi,
        transport_score,
        school_rating,
        walkability,
        *cities.values()  # Unpack city values
    ]])
    
    # Make prediction
    prediction = model.predict(input_data)
    
    return prediction[0]

# Load model and features from their respective files
try:
    with open('price_pred/house_price_model.pkl', 'rb') as model_file:
        model = pickle.load(model_file)

    with open('price_pred/model_features.pkl', 'rb') as features_file:
        feature_names = pickle.load(features_file)
except Exception as e:
    print(f"Error loading model or features: {str(e)}")
    raise

@app.route('/')
def home():
    return render_template('index.html', feature_names=feature_names)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get all form inputs
        input_data = []
        for feature in feature_names[:7]:  # First 7 features are numerical
            value = float(request.form[feature])
            input_data.append(value)

        # Encode the city
        city = request.form['city']
        cities = {
            'Boston': 0, 'Chicago': 0, 'Dallas': 0, 'Denver': 0,
            'Houston': 0, 'Los Angeles': 0, 'Miami': 0, 'New York City': 0,
            'San Francisco': 0, 'Seattle': 0
        }
        if city in cities:
            cities[city] = 1

        # Combine numerical features with city-encoded values
        input_data.extend(cities.values())

        # Convert to numpy array
        input_array = np.array(input_data)

        # Make prediction
        prediction = predict_property_price(
            model,
            rental_yield=input_array[0],
            appreciation_rate=input_array[1],
            crime_rate=input_array[2],
            aqi=input_array[3],
            transport_score=input_array[4],
            school_rating=input_array[5],
            walkability=input_array[6],
            city=city
        )
        
        # Format the prediction as currency
        formatted_prediction = f"${prediction:,.2f}"
        return render_template('index.html', 
                             feature_names=feature_names,
                             prediction=formatted_prediction)

    except Exception as e:
        return render_template('index.html', 
                             feature_names=feature_names,
                             prediction=f"Error: {str(e)}")

if __name__ == '__main__':
    app.run(debug=True)