from flask import Flask, jsonify
from pymongo import MongoClient
from flask_cors import CORS
from flask import render_template

app = Flask(__name__)
CORS(app)

@app.route('/api/birds')
def get_bird_data():
    connection_string = "mongodb://bird:bird@ac-yaj6jma-shard-00-00.yombdgz.mongodb.net:27017,ac-yaj6jma-shard-00-01.yombdgz.mongodb.net:27017,ac-yaj6jma-shard-00-02.yombdgz.mongodb.net:27017/?replicaSet=atlas-pjw3c3-shard-0&ssl=true&authSource=admin"
    client = MongoClient(connection_string)
    db = client['bird_db']
    
    # Fetching data from collections
    flamingos = list(db['filtered_flamingo'].find({}, {'_id': False}))
    hummingbirds = list(db['filtered_hummingbird'].find({}, {'_id': False}))
    owls = list(db['filtered_owl'].find({}, {'_id': False}))
    teals = list(db['filtered_teal'].find({}, {'_id': False}))
    band_type = list(db['band_type'].find({}, {'_id': False, 'band_type': True}))
    event_type = list(db['event_type'].find({}, {'_id': False, 'event_type': True}))
    country_state = list(db['country_state'].find({}, {'_id': False, 'country_state': True}))
    sex = list(db['sex'].find({}, {'_id': False, 'sex': True}))
    species = list(db['species'].find({}, {'_id': False, 'species': True}))

    client.close()
    
    # Return data from all collections
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
