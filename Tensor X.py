# Databricks notebook source
from pyspark.sql import functions as F
from pyspark.sql.types import StructType, StructField, DoubleType, StringType, BooleanType
import tensorflow as tf
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import json


# Read the data from the geographically bounded table
df = spark.sql("""
    SELECT 
        latitude,
        longitude,
        all_motor_vehicles as vehicle_count,
        count_date,
        hour
    FROM guh_2024.default.london_traffic_counts_geo_filtered
""")

# Convert to pandas for easier processing
pdf = df.toPandas()

# [Previous functions remain unchanged: create_features, train_model, generate_future_dates, calculate_score]

def process_location(lat, lon, location_data):
    # Create features and train model
    features_df = create_features(location_data)
    model = train_model(features_df)
    
    # Generate future dates
    last_date = features_df.index.max()
    future_dates = generate_future_dates(last_date)
    
    # Create future features
    future_features = pd.DataFrame(index=future_dates)
    future_features['hour'] = future_features.index.hour
    future_features['day_of_week'] = future_features.index.dayofweek
    future_features['month'] = future_features.index.month
    
    # Make predictions
    predictions = model.predict(future_features[['hour', 'day_of_week', 'month']].values)
    
    # Calculate max count for scoring
    max_count = max(features_df['vehicle_count'].max(), predictions.max())
    
    # Create JSON structure with explicit type conversion
    results = []
    
    # Historical data
    for idx, row in features_df.iterrows():
        results.append({
            'latitude': float(lat),  # Explicit conversion to float
            'longitude': float(lon),  # Explicit conversion to float
            'datetime': str(idx.strftime('%Y-%m-%d %H:%M:%S')),  # Explicit conversion to string
            'vehicle_count': float(round(row['vehicle_count'], 2)),  # Explicit conversion to float
            'score': float(calculate_score(row['vehicle_count'], max_count)),  # Explicit conversion to float
            'is_forecast': bool(False)  # Explicit conversion to boolean
        })
    
    # Forecast data
    for date, pred in zip(future_dates, predictions):
        results.append({
            'latitude': float(lat),  # Explicit conversion to float
            'longitude': float(lon),  # Explicit conversion to float
            'datetime': str(date.strftime('%Y-%m-%d %H:%M:%S')),  # Explicit conversion to string
            'vehicle_count': float(round(pred[0], 2)),  # Explicit conversion to float
            'score': float(calculate_score(pred[0], max_count)),  # Explicit conversion to float
            'is_forecast': bool(True)  # Explicit conversion to boolean
        })
    
    return results

# Process the filtered location
all_results = []
for (lat, lon), group in pdf.groupby(['latitude', 'longitude']):
    location_results = process_location(lat, lon, group)
    all_results.extend(location_results)

# Define schema explicitly
schema = StructType([
    StructField("latitude", DoubleType(), False),
    StructField("longitude", DoubleType(), False),
    StructField("datetime", StringType(), False),
    StructField("vehicle_count", DoubleType(), False),
    StructField("score", DoubleType(), False),
    StructField("is_forecast", BooleanType(), False)
])

# Create Spark DataFrame with explicit schema
result_df = spark.createDataFrame(all_results, schema=schema)

# Save results to JSON
json_str = json.dumps(all_results, indent=2)
dbutils.fs.put("./traffic_forecasts2.json", json_str, overwrite=True)

# Display the results in Databricks
display(result_df)

# COMMAND ----------

display(result_df)

