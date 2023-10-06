from flask import Flask, jsonify, render_template
from pymongo import MongoClient
from flask_cors import CORS
import math
import os  # <-- Import for environment variables
from flask import g 

app = Flask(__name__)
CORS(app)

# Establish a global connection to the database
connection_string = "mongodb://bird:bird@ac-yaj6jma-shard-00-00.yombdgz.mongodb.net:27017,ac-yaj6jma-shard-00-01.yombdgz.mongodb.net:27017,ac-yaj6jma-shard-00-02.yombdgz.mongodb.net:27017/?replicaSet=atlas-pjw3c3-shard-0&ssl=true&authSource=admin"
client = MongoClient(connection_string)
db = client['bird_db']

# Function to clean up the data
def clean_data(data_list):
    for item in data_list:
        for key, value in item.items():
            if isinstance(value, float) and math.isnan(value):
                item[key] = None
    return data_list

@app.route('/api/birds')
def get_bird_data():  
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

@app.route('/api/birdAgeDistribution/<selectedSpecies>')
def get_bird_age_sex_distribution(selectedSpecies):
    # Fetch data based on the selected species
    data = clean_data(list(db[f'filtered_{selectedSpecies}'].find({}, {'_id': False, 'AGE_DESCRIPTION': True, 'SEX_DESCRIPTION': True})))    
    return jsonify(data)

@app.errorhandler(500)
def internal_error(error):
    return "500 error"

@app.errorhandler(404)
def not_found(error):
    return "404 error", 404

@app.before_request
def before_request():
    g.client = MongoClient(connection_string)
    g.db = g.client['bird_db']

@app.teardown_appcontext
def close_connection(exception):
    client = g.pop('client', None)
    if client is not None:
        client.close()
        
if __name__ == '__main__':
    app.run(port=5000, debug=True)
