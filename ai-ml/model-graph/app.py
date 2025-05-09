import matplotlib
matplotlib.use('Agg')  # Set the backend to non-interactive Agg

from flask import Flask, request, jsonify, render_template
import pandas as pd
from prophet import Prophet
import json
import matplotlib.pyplot as plt
import io
import base64
import seaborn as sns
import os

df = pd.read_csv('Future_years.csv')

app = Flask(__name__)

# Set a seaborn style for better aesthetics
sns.set_theme(style="whitegrid")

# Update the figure size and DPI for better quality
plt.rcParams['figure.figsize'] = [12, 16]
plt.rcParams['figure.dpi'] = 100
plt.rcParams['font.size'] = 12
plt.rcParams['axes.titlesize'] = 16
plt.rcParams['axes.labelsize'] = 14

def create_plot():
    # Center the plot and add padding
    plt.subplots_adjust(top=0.95, bottom=0.1, left=0.1, right=0.9)
    plt.tight_layout(pad=3.0)
    img = io.BytesIO()
    plt.savefig(img, format='png', bbox_inches='tight', dpi=100)
    img.seek(0)
    plot_url = base64.b64encode(img.getvalue()).decode()
    plt.close()
    return plot_url

@app.route('/')
def home():
    # Load regions from JSON file
    with open('Regions.json', 'r') as f:
        regions = json.load(f)['Region_Names']
    return render_template('index.html', regions=regions)

@app.route('/predict', methods=['POST'])
def predict():
    region_name = request.form['region']
    row_idx = df[df['RegionName'] == region_name].index[0]
    
    # Extract data starting from the 6th column (index 5)
    data = pd.DataFrame({
        'Date': df.columns[5:],
        'Property_Value': df.iloc[row_idx, 5:].values
    })
    
    # Convert Date column to datetime
    data['Date'] = pd.to_datetime(data['Date'])
    
    # Sort by date
    data = data.sort_values('Date').reset_index(drop=True)
    
    m = Prophet()
    
    # Rename columns for Prophet
    prophet_data = data.rename(columns={
        'Date': 'ds',
        'Property_Value': 'y'
    })
    
    # Fit the model
    m.fit(prophet_data)
    
    # Create future dates dataframe
    future = m.make_future_dataframe(periods=3650)
    
    # Make predictions
    forecast = m.predict(future)
    
    # Create the main forecast plot with enhanced styling
    fig1 = m.plot(forecast)
    plt.title(f'Property Value Predictions - {region_name}', 
              fontsize=16, 
              fontweight='bold', 
              pad=20)
    # Update x and y axis labels for better clarity
    plt.xlabel('Years', fontsize=14, labelpad=10)
    plt.ylabel('Property Value ($)', fontsize=14, labelpad=10)
    plt.grid(True, linestyle='--', alpha=0.8)

    plt.legend(['Historical Data', 'Forecast', '95% Confidence Interval'], 
              loc='upper left', 
              fontsize=12,
              frameon=True,
              facecolor='white',
              edgecolor='none',
              shadow=True)
    # Center the plot
    plt.subplots_adjust(top=0.95, bottom=0.1, left=0.1, right=0.9)
    plot_url1 = create_plot()

    # Create the components plot with enhanced styling
    fig2 = m.plot_components(forecast)
    # Ensure y-axis intervals are added to the second component plot
    for ax in fig2.get_axes():
        ax.set_title(ax.get_title(), fontsize=14, pad=10)
        ax.tick_params(labelsize=12)
        ax.yaxis.set_major_locator(plt.MaxNLocator(nbins=7))  # Explicitly set more y-axis intervals
        # Center each subplot
        ax.set_position([0.1, ax.get_position().y0, 0.8, ax.get_position().height])
    plt.tight_layout(pad=3.0)
    plot_url2 = create_plot()
    
    return render_template('plot.html', 
                         forecast_plot=plot_url1, 
                         components_plot=plot_url2,
                         region=region_name)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))