# Databricks notebook source
# Import required libraries
from pyspark.sql import functions as F

# Filter for London region, post-2020 data, and specific geographic bounds
df_london_bounded = spark.table("guh_2024.default.dft_traffic_counts_raw_counts") \
    .filter(
        (F.col("year") >= 2020) & 
        (F.lower(F.col("region_name")) == "london") &
        (F.col("latitude") <= 51.58468848165936) &  # Northwest latitude
        (F.col("latitude") >= 51.53132566292637) &  # Southeast latitude
        (F.col("longitude") >= -0.3265453820010378) &  # Northwest longitude
        (F.col("longitude") <= -0.23934140250885028)  # Southeast longitude
    ).select(
        "region_name",
        "road_name",
        "end_junction_road_name",
        "latitude",
        "longitude",
        "link_length_km",
        "link_length_miles",
        "all_motor_vehicles",
        "count_date",
        "year",
        "hour"
    )

# Save the filtered data to a new table with a distinct name
df_london_bounded.write.mode("overwrite").saveAsTable("guh_2024.default.london_traffic_counts_geo_filtered")

# To view the results
display(df_london_bounded)
