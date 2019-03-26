''' controller and routes for database overall management'''
import os
from flask import request, jsonify
from app import app, mongo
import logger
import csv
import json
from os import listdir
from os.path import isfile, join
import sys

ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
    __name__, filename=os.path.join(ROOT_PATH, 'output.log'))

USERNAME = 'EyeCloud'
PASSWORD = 'password123'
FIXATION_DATA_FILENAME = 'all_fixation_data_cleaned_up.csv'
COMPLEXITY_DATA_FILENAME = 'complexity.txt'
RESOLUTION_DATA_FILENAME = 'resolution.txt'


def get_data_filepath(filename):
    return os.path.join(ROOT_PATH, 'app', 'dist', filename)


def is_valid_credentials(data):
    return data.get('username') == USERNAME and data.get('password') == PASSWORD


@app.route('/clear_all_data', methods=['POST'])
def clear_all_data():
    credentials = request.get_json()
    if request.method == 'POST':
        if is_valid_credentials(credentials):
            mongo.db.fixations.remove({})
            mongo.db.station.remove({})
            mongo.db.user.remove({})
            mongo.db.heatmapCache.remove({})
            return jsonify({'ok': True, 'message': 'All documents in collections are removed!'}), 200
        else:
            return jsonify({'ok': False, 'message': 'Wrong username and password!'}), 400


@app.route('/clear_fixation_data', methods=['POST'])
def clear_fixation_data():
    credentials = request.get_json()
    if request.method == 'POST':
        if is_valid_credentials(credentials):
            mongo.db.fixations.remove({})
            mongo.db.user.remove({})
            return jsonify({'ok': True, 'message': 'All fixation data are removed!'}), 200
        else:
            return jsonify({'ok': False, 'message': 'Wrong username and password!'}), 400


@app.route('/clear_station_data', methods=['POST'])
def clear_station_data():
    credentials = request.get_json()
    if request.method == 'POST':
        if is_valid_credentials(credentials):
            mongo.db.station.remove({})
            return jsonify({'ok': True, 'message': 'All station data are removed!'}), 200
        else:
            return jsonify({'ok': False, 'message': 'Wrong username and password!'}), 400


@app.route('/recover_fixation_data', methods=['POST'])
def recover_fixation_data():
    credentials = request.get_json()
    if request.method == 'POST':
        if is_valid_credentials(credentials):
            ret_msg = recover_fixation_data_impl()
            if ret_msg == 'OK':
                return jsonify({'ok': True, 'message': 'All fixation data are recovered!'}), 200
            else:
                return jsonify({'ok': False, 'message': 'Error:' + ret_msg}), 400
        else:
            return jsonify({'ok': False, 'message': 'Wrong username and password!'}), 400


def recover_fixation_data_impl():
    try:
        users = set()
        with open(get_data_filepath(FIXATION_DATA_FILENAME), 'r', encoding='iso-8859-1') as csv_file:
            csv_reader = csv.reader(csv_file, delimiter='\t')
            line_count = 0
            stimulus_dict = {}
            prev_stimulus_name = ""
            prev_user = ""
            min_timestamp = 0
            for row in csv_reader:
                if line_count == 0:
                    line_count += 1
                else:
                    user = row[6]
                    timestamp = int(row[0])
                    station_name = row[1].split('_')[1]
                    stimuli_name = row[1]
                    if prev_stimulus_name != stimuli_name or prev_user != user:
                        min_timestamp = timestamp
                        prev_stimulus_name = stimuli_name
                        prev_user = user
                    users.add(user)
                    if station_name in stimulus_dict:
                        stimulus_dict[station_name].add(stimuli_name)
                    else:
                        stimulus_dict[station_name] = {stimuli_name}
                    data = {'timestamp': timestamp - min_timestamp, 'stimuliName': stimuli_name, 'fixationIndex': int(row[2]),
                            'fixationDuration': int(row[3]), 'mappedFixationPointX': int(row[4]),
                            'mappedFixationPointY': int(row[5]),
                            'user': row[6], 'description': row[7], 'station': station_name}
                    json_data = json.dumps(data)
                    mongo.db.fixations.insert_one(json.loads(json_data))
                    line_count += 1
            add_stimuli_and_stations(stimulus_dict)
        for user in sorted(users):
            data = {'user': user}
            json_data = json.dumps(data)
            mongo.db.user.insert_one(json.loads(json_data))
        return 'OK'
    except Exception as e:
        return str(e)


@app.route('/recover_station_data', methods=['POST'])
def recover_station_data():
    """
    Only for resolution and complexity not for the array of stimuli
    :return: void
    """
    credentials = request.get_json()
    if request.method == 'POST':
        if is_valid_credentials(credentials):
            resolution_resp = recover_resolution_data_impl()
            complexity_resp = recover_complexity_data_impl()
            if resolution_resp == "OK" and complexity_resp == "OK":
                return jsonify({'ok': True, 'message': 'All resolution data are recovered!'}), 200
            elif complexity_resp != "OK":
                return jsonify({'ok': False, 'message': 'Error:' + complexity_resp}), 400
            else:
                return jsonify({'ok': False, 'message': 'Error:' + resolution_resp}), 400
        else:
            return jsonify({'ok': False, 'message': 'Wrong username and password!'}), 400


def recover_complexity_data_impl():
    try:
        with open(get_data_filepath(COMPLEXITY_DATA_FILENAME), 'r') as file:
            for row in file:
                for station in row.split(','):
                    station_name = station.split('(')[0].strip()
                    complexity = int(station.split('(')[1].split(')')[0])
                    description = 'high'
                    if complexity <= 121:
                        description = 'low'
                    elif 121 < complexity <= 150:
                        description = 'medium'
                    if mongo.db.station.find({'name': station_name}).count() == 0:
                        data = {'name': station_name, 'complexity': complexity, 'description': description}
                        mongo.db.station.insert_one(data)
                    else:
                        mongo.db.station.update_one({'name': station_name},
                                                    {"$set": {'complexity': complexity, 'description': description}})
        return 'OK'
    except Exception as e:
        print(e)
        return str(e)


def recover_resolution_data_impl():
    try:
        with open(get_data_filepath(RESOLUTION_DATA_FILENAME), 'r', encoding='utf-8') as file:
            for row in file:
                row = row.split('\t')
                station_name = row[0].lstrip()
                width = row[1]
                height = row[2].rstrip()
                if mongo.db.station.find({'name': station_name}).count() == 0:
                    data = {'name': station_name,
                            'width': width, 'height': height}

                    mongo.db.station.insert_one(data)
                else:
                    mongo.db.station.update_one({'name': station_name}, {"$set": {'width': width, 'height': height}})
        return 'OK'
    except Exception as e:
        return str(e)


def add_stimuli_and_stations(stimulus_dict):
    try:
        for station_name, set_of_stimuli in stimulus_dict.items():
            if mongo.db.station.find({"name": station_name}).count() == 0:
                mongo.db.station.insert_one({"name": station_name,
                                             "stimuli_list": [stimulus for stimulus in set_of_stimuli]})
            else:
                mongo.db.station.update_one({"name": station_name},
                                            {"$set": {"stimuli_list": [stimulus for stimulus in set_of_stimuli]}})
        return "OK"
    except Exception as e:
        print(e)
        return str(e)


@app.route('/recover_all_data', methods=['POST'])
def recover_all_data():
    credentials = request.get_json()
    if request.method == 'POST':
        if is_valid_credentials(credentials):
            fixation_ret_msg = recover_fixation_data_impl()
            print("Fixation imported")
            resolution_ret_msg = recover_resolution_data_impl()
            print("Resultion imported")
            complexity_ret_msg = recover_complexity_data_impl()
            if fixation_ret_msg == 'OK' and resolution_ret_msg == 'OK' and complexity_ret_msg == 'OK':
                return jsonify({'ok': True, 'message': 'All data are recovered!'}), 200
            else:
                return jsonify({'ok': False, 'message': 'Fixation data: ' + fixation_ret_msg
                                                        + ' Resolution data: ' + resolution_ret_msg
                                                        + ' Complexity data: ' + complexity_ret_msg}), 400
        else:
            return jsonify({'ok': False, 'message': 'Wrong username and password!'}), 400
