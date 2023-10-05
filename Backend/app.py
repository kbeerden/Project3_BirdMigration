from flask import Flask, jsonify
from pymongo import MongoClient
from flask_cors import CORS
from flask import render_template
import math  # <-- Add this import

app = Flask(__name__)
CORS(app)

# Function to clean up the data
def clean_data(data_list):
    for item in data_list:
        for key, value in item.items():
            if isinstance(value, float) and math.isnan(value):
                item[key] = None
    return data_list

@app.route('/api/birds')
def get_bird_data():
    connection_string = "mongodb://bird:bird@ac-yaj6jma-shard-00-00.yombdgz.mongodb.net:27017,ac-yaj6jma-shard-00-01.yombdgz.mongodb.net:27017,ac-yaj6jma-shard-00-02.yombdgz.mongodb.net:27017/?replicaSet=atlas-pjw3c3-shard-0&ssl=true&authSource=admin"
    client = MongoClient(connection_string)
    db = client['bird_db']
    
    # Fetching data from collections and cleaning it
    flamingos = clean_data(list(db['filtered_flamingo'].find({}, {'_id': False})))
    hummingbirds = clean_data(list(db['filtered_hummingbird'].find({}, {'_id': False})))
    owls = clean_data(list(db['filtered_owl'].find({}, {'_id': False})))
    teals = clean_data(list(db['filtered_teal'].find({}, {'_id': False})))
    band_type = clean_data(list(db['band_type'].find({}, {'_id': False, 'band_type': True})))
    event_type = clean_data(list(db['event_type'].find({}, {'_id': False, 'event_type': True})))
    country_state = clean_data(list(db['country_state'].find({}, {'_id': False, 'country_state': True})))
    sex = clean_data(list(db['sex'].find({}, {'_id': False, 'sex': True})))
    species = clean_data(list(db['species'].find({}, {'_id': False, 'species': True})))

    client.close()
    
    # Return cleaned data
    return jsonify({
        'flamingos': flamingos,
        'hummingbirds': hummingbirds,
        'owls': owls,
        'teals': teals,
        'band_type': band_type,
        'event_type': event_type,
        'sex' : sex,
        'species' : species,
        'country_state' : country_state
    })

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(port=5000, debug=True)
