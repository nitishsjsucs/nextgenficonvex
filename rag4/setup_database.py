import sqlite3
import os
import pandas as pd
import random
from datetime import datetime, timedelta

# Create db directory if it doesn't exist
os.makedirs('db', exist_ok=True)

# Connect to SQLite database (creates it if it doesn't exist)
conn = sqlite3.connect('db/earthquake_rag.db')
cursor = conn.cursor()

# Create earthquake events table
cursor.execute('''
CREATE TABLE IF NOT EXISTS earthquake_events (
    id INTEGER PRIMARY KEY,
    time TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    depth REAL,
    magnitude REAL NOT NULL,
    mag_type TEXT,
    place TEXT,
    network TEXT,
    event_id TEXT UNIQUE,
    updated TEXT,
    status TEXT
)
''')

# Create demographic data table (simulated data for ad targeting)
cursor.execute('''
CREATE TABLE IF NOT EXISTS demographics (
    id INTEGER PRIMARY KEY,
    person_id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    latitude REAL,
    longitude REAL,
    house_value REAL,
    has_insurance BOOLEAN,
    income_level TEXT,
    age_group TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
''')

# Read the earthquake CSV data
try:
    df = pd.read_csv('2.5_day (2).csv')
    print(f"Loaded {len(df)} earthquake records")
    
    # Insert earthquake data
    earthquake_data = []
    for _, row in df.iterrows():
        earthquake_data.append((
            row['time'],
            row['latitude'],
            row['longitude'],
            row['depth'],
            row['mag'],
            row['magType'],
            row['place'],
            row['net'],
            row['id'],
            row['updated'],
            row['status']
        ))
    
    cursor.executemany('''
    INSERT OR REPLACE INTO earthquake_events 
    (time, latitude, longitude, depth, magnitude, mag_type, place, network, event_id, updated, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', earthquake_data)
    
    print(f"Inserted {len(earthquake_data)} earthquake records")
    
except Exception as e:
    print(f"Error reading CSV: {e}")
    # Create some sample earthquake data if CSV fails
    sample_earthquakes = [
        ('2025-01-15T10:30:00Z', 34.0522, -118.2437, 10.5, 4.2, 'ml', 'Los Angeles, CA', 'us', 'us123456', '2025-01-15T10:35:00Z', 'reviewed'),
        ('2025-01-15T11:15:00Z', 37.7749, -122.4194, 8.2, 3.8, 'ml', 'San Francisco, CA', 'us', 'us123457', '2025-01-15T11:20:00Z', 'reviewed'),
        ('2025-01-15T12:00:00Z', 40.7128, -74.0060, 12.1, 5.1, 'mb', 'New York, NY', 'us', 'us123458', '2025-01-15T12:05:00Z', 'reviewed'),
    ]
    
    cursor.executemany('''
    INSERT OR REPLACE INTO earthquake_events 
    (time, latitude, longitude, depth, magnitude, mag_type, place, network, event_id, updated, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', sample_earthquakes)

# Generate sample demographic data for ad targeting
# This simulates people who could be targeted for earthquake insurance ads
sample_demographics = []

# Generate realistic demographic data
first_names = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Emily', 'James', 'Jennifer', 'William', 'Ashley', 'Christopher', 'Jessica', 'Daniel', 'Amanda', 'Matthew', 'Stephanie', 'Anthony', 'Melissa']
last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']
cities = ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'Fresno', 'Oakland', 'Long Beach', 'Bakersfield', 'Anaheim', 'Santa Ana']
states = ['CA', 'CA', 'CA', 'CA', 'CA', 'CA', 'CA', 'CA', 'CA', 'CA']

for i in range(1000):
    first_name = random.choice(first_names)
    last_name = random.choice(last_names)
    city = random.choice(cities)
    state = random.choice(states)
    
    # Generate coordinates around major California cities
    if city == 'Los Angeles':
        lat, lon = 34.0522 + random.uniform(-0.5, 0.5), -118.2437 + random.uniform(-0.5, 0.5)
    elif city == 'San Francisco':
        lat, lon = 37.7749 + random.uniform(-0.3, 0.3), -122.4194 + random.uniform(-0.3, 0.3)
    elif city == 'San Diego':
        lat, lon = 32.7157 + random.uniform(-0.3, 0.3), -117.1611 + random.uniform(-0.3, 0.3)
    else:
        lat, lon = 34.0522 + random.uniform(-2, 2), -118.2437 + random.uniform(-2, 2)
    
    # Generate house values (some > 500k for targeting)
    house_value = random.uniform(200000, 2000000)
    
    # Generate insurance status (mix of insured/uninsured)
    has_insurance = random.choice([True, False])
    
    # Generate income levels
    income_levels = ['low', 'medium', 'high']
    income_level = random.choice(income_levels)
    
    # Generate age groups
    age_groups = ['18-25', '26-35', '36-45', '46-55', '56-65', '65+']
    age_group = random.choice(age_groups)
    
    sample_demographics.append((
        f"P{10000 + i}",  # person_id
        first_name,
        last_name,
        f"{first_name.lower()}.{last_name.lower()}@email.com",
        f"555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
        f"{random.randint(100, 9999)} {random.choice(['Main', 'Oak', 'Pine', 'Cedar', 'Elm'])} St",
        city,
        state,
        f"{random.randint(90000, 99999)}",
        lat,
        lon,
        house_value,
        has_insurance,
        income_level,
        age_group
    ))

cursor.executemany('''
INSERT OR REPLACE INTO demographics 
(person_id, first_name, last_name, email, phone, address, city, state, zip_code, latitude, longitude, house_value, has_insurance, income_level, age_group)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
''', sample_demographics)

print(f"Inserted {len(sample_demographics)} demographic records")

# Commit the changes and close the connection
conn.commit()
conn.close()

print("Database created successfully!")
print("\nDatabase Summary:")
print("- Earthquake events table: Contains earthquake data from CSV")
print("- Demographics table: Contains 1000 sample people with house values and insurance status")
print("- Ready for RAG MCP server implementation")

