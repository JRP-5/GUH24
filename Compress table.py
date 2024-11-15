# Databricks notebook source
# Import required libraries
from pyspark.sql import functions as F

# 1. Select specific columns
df_selected = spark.table("guh_2024.default.dft_traffic_counts_raw_counts").select(
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

# 2. Filter for post-2020 data and select columns
df_filtered = spark.table("guh_2024.default.dft_traffic_counts_raw_counts") \
    .filter(F.col("year") >= 2020) \
    .select(
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

# If you want to save the filtered data back to a new table
df_filtered.write.mode("overwrite").saveAsTable("guh_2024.default.traffic_counts_filtered")

# Filter for London region, post-2020 data, and select specific columns
df_london = spark.table("guh_2024.default.dft_traffic_counts_raw_counts") \
    .filter((F.col("year") >= 2020) & (F.lower(F.col("region_name")) == "london")) \
    .select(
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

# Save the filtered data to a new table
df_london.write.mode("overwrite").saveAsTable("guh_2024.default.london_traffic_counts_filtered")

# To view the results
display(df_london)

# COMMAND ----------

# In a notebook cell
dbutils.notebook.entry_point.getDbutils().notebook().getContext().apiToken().get()

# COMMAND ----------

git config --global user.name "dun-stu"
git config --global user.email "amal.malmat@student.manchester.ac.uk"

# COMMAND ----------


