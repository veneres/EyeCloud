''' controller and routes for APIs'''
import os
from flask import request, jsonify
from app import app, mongo
import logger

ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
    __name__, filename=os.path.join(ROOT_PATH, 'output.log'))


@app.route('/stimulus/from=<from_value>-to=<to_value>', methods=['GET'])
def get_all_stimulus(from_value, to_value):
    if request.method == 'GET':
        data = {}
        data_id = 1
        cursor = mongo.db.complexity.find({'complexity': {'$gte': from_value, '$lte': to_value}})
        for document in cursor:
            station_name = document['station']
            resolution_document = mongo.db.resolution.find_one({'station': station_name})
            resolution_data = {}
            if resolution_document is not None:
                resolution_data = {'width': resolution_document['width'], 'height': resolution_document['height']}
            station_data = {'station': station_name, 'resolution': resolution_data,
                            'complexity': document['complexity']}
            data[str(data_id)] = station_data
            data_id += 1
        return jsonify(data)


@app.route('/stimulus/<station_name>', methods=['GET'])
def get_stimulus_by_name(station_name):
    if request.method == 'GET':
        data = {}
        document = mongo.db.complexity.find_one({'station': station_name})
        resolution_document = mongo.db.resolution.find_one({'station': station_name})
        resolution_data = {}
        if resolution_document is not None:
            resolution_data = {'width': resolution_document['width'], 'height': resolution_document['height']}
        station_data = {'station': station_name, 'resolution': resolution_data, 'complexity': document['complexity']}
        data['1'] = station_data
        return jsonify(data)


@app.route('/all_users', methods=['GET'])
def get_all_users():
    if request.method == 'GET':
        data = {}
        data_id = 1
        for document in mongo.db.user.find({}):
            data[str(data_id)] = document['user']
            data_id += 1
        return jsonify(data)


@app.route('/all_fixations/user=<user>/station=<station_name>/from=<from_timestamp>-to=<to_timestamp>', methods=['GET'])
def get_fixations_by_user_and_station(user, station_name, from_timestamp, to_timestamp):
    if request.method == 'GET':
        data = {}
        data_id = 1
        cursor = mongo.db.fixations.find({'station': station_name, 'user': user})
        for document in cursor:
            timestamp = document['timestamp']
            if int(from_timestamp) <= int(timestamp) <= int(to_timestamp):
                fixation_point = {'index': document['fixationIndex'], 'timestamp': document['timestamp'],
                                  'x': document['mappedFixationPointX'], 'y': document['mappedFixationPointY'],
                                  'duration': document['fixationDuration']}
                map_data = {'mapName': document['stimuliName'], 'description': document['description']}
                fixation_data = {'station': station_name, 'fixationPoint': fixation_point, 'mapInfo': map_data,
                                 'user': user}
                data[str(data_id)] = fixation_data
                data_id += 1
        return jsonify(data)


@app.route('/all_stations', methods=['GET'])
def get_all_stations():
    if request.method == 'GET':
        cursor = mongo.db.station.find()
        data = [elem for elem in cursor]
        return jsonify(data)

@app.route('/all_fixations/user=<user>/from=<from_timestamp>-to=<to_timestamp>', methods=['GET'])
def get_fixations_by_user(user, from_timestamp, to_timestamp):
    if request.method == 'GET':
        data = {}
        data_id = 1
        cursor = mongo.db.fixations.find({'user': user})
        for document in cursor:
            timestamp = document['timestamp']
            if int(from_timestamp) <= int(timestamp) <= int(to_timestamp):
                fixation_point = {'index': document['fixationIndex'], 'timestamp': document['timestamp'],
                                  'x': document['mappedFixationPointX'], 'y': document['mappedFixationPointY'],
                                  'duration': document['fixationDuration']}
                map_data = {'mapName': document['stimuliName'], 'description': document['description']}
                fixation_data = {'station': document['station'], 'fixationPoint': fixation_point, 'mapInfo': map_data,
                                 'user': user}
                data[str(data_id)] = fixation_data
                data_id += 1
        return jsonify(data)


@app.route('/all_fixations/station=<station_name>/from=<from_timestamp>-to=<to_timestamp>', methods=['GET'])
def get_fixations_by_station(station_name, from_timestamp, to_timestamp):
    if request.method == 'GET':
        data = {}
        data_id = 1
        cursor = mongo.db.fixations.find({'station': station_name})
        for document in cursor:
            timestamp = document['timestamp']
            if int(from_timestamp) <= int(timestamp) <= int(to_timestamp):
                fixation_point = {'index': document['fixationIndex'], 'timestamp': document['timestamp'],
                                  'x': document['mappedFixationPointX'], 'y': document['mappedFixationPointY'],
                                  'duration': document['fixationDuration']}
                map_data = {'mapName': document['stimuliName'], 'description': document['description']}
                fixation_data = {'station': station_name, 'fixationPoint': fixation_point, 'mapInfo': map_data,
                                 'user': document['user']}
                data[str(data_id)] = fixation_data
                data_id += 1
        return jsonify(data)


@app.route('/all_fixations/stimulus=<string:stimulus_name>/from=<int:from_timestamp>-to=<int:to_timestamp>', methods=['GET'])
def get_fixations_by_stimulus(stimulus_name, from_timestamp, to_timestamp):
    if request.method == 'GET':
        data = {}
        data_id = 1
        cursor = mongo.db.fixations.find({'stimuliName': stimulus_name})
        for document in cursor:
            timestamp = document['timestamp']
            if int(from_timestamp) <= int(timestamp) <= int(to_timestamp):
                fixation_point = {'index': document['fixationIndex'], 'timestamp': document['timestamp'],
                                  'x': document['mappedFixationPointX'], 'y': document['mappedFixationPointY'],
                                  'duration': document['fixationDuration']}
                map_data = {'mapName': document['stimuliName'], 'description': document['description']}
                fixation_data = {'station': document['station'], 'fixationPoint': fixation_point, 'mapInfo': map_data,
                                 'user': document['user']}
                data[str(data_id)] = fixation_data
                data_id += 1
        return jsonify(data)
