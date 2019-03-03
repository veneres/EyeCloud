''' controller and routes for database overall management'''
import os
from flask import request, jsonify
from app import app, mongo
import logger
import csv
import json

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
            mongo.db.complexity.remove({})
            mongo.db.resolution.remove({})
            mongo.db.user.remove({})
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


@app.route('/clear_complexity_data', methods=['POST'])
def clear_complexity_data():
    credentials = request.get_json()
    if request.method == 'POST':
        if is_valid_credentials(credentials):
            mongo.db.complexity.remove({})
            return jsonify({'ok': True, 'message': 'All complexity data are removed!'}), 200
        else:
            return jsonify({'ok': False, 'message': 'Wrong username and password!'}), 400


@app.route('/clear_resolution_data', methods=['POST'])
def clear_resolution_data():
    credentials = request.get_json()
    if request.method == 'POST':
        if is_valid_credentials(credentials):
            mongo.db.resolution.remove({})
            return jsonify({'ok': True, 'message': 'All resolution data are removed!'}), 200
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
            for row in csv_reader:
                if line_count == 0:
                    line_count += 1
                else:
                    users.add(row[6])
                    station_name = row[1].split('_')[1]
                    data = {'timestamp': row[0], 'stimuliName': row[1], 'fixationIndex': row[2],
                            'fixationDuration': row[3], 'mappedFixationPointX': row[4], 'mappedFixationPointY': row[5],
                            'user': row[6], 'description': row[7], 'station': station_name}
                    json_data = json.dumps(data)
                    mongo.db.fixations.insert_one(json.loads(json_data))
                    line_count += 1
        for user in sorted(users):
            data = {'user': user}
            json_data = json.dumps(data)
            mongo.db.user.insert_one(json.loads(json_data))
        return 'OK'
    except Exception as e:
        return str(e)


@app.route('/recover_complexity_data', methods=['POST'])
def recover_complexity_data():
    credentials = request.get_json()
    if request.method == 'POST':
        if is_valid_credentials(credentials):
            ret_msg = recover_complexity_data_impl()
            if ret_msg == 'OK':
                return jsonify({'ok': True, 'message': 'All complexity data are recovered!'}), 200
            else:
                return jsonify({'ok': False, 'message': 'Error:' + ret_msg}), 400
        else:
            return jsonify({'ok': False, 'message': 'Wrong username and password!'}), 400


def recover_complexity_data_impl():
    try:
        with open(get_data_filepath(COMPLEXITY_DATA_FILENAME), 'r') as file:
            for row in file:
                for station in row.split(','):
                    data = {'station': station.split('(')[0].strip(), 'complexity': station.split('(')[1].split(')')[0]}
                    complexity = int(station.split('(')[1].split(')')[0])
                    if complexity <= 121:
                        data['description'] = 'low'
                    elif 121 < complexity <= 150:
                        data['description'] = 'medium'
                    else:
                        data['description'] = 'high'
                    json_data = json.dumps(data)
                    mongo.db.complexity.insert_one(json.loads(json_data))
        return 'OK'
    except Exception as e:
        return str(e)


@app.route('/recover_resolution_data', methods=['POST'])
def recover_resolution_data():
    credentials = request.get_json()
    if request.method == 'POST':
        if is_valid_credentials(credentials):
            ret_msg = recover_resolution_data_impl()
            if ret_msg == 'OK':
                return jsonify({'ok': True, 'message': 'All resolution data are recovered!'}), 200
            else:
                return jsonify({'ok': False, 'message': 'Error:' + ret_msg}), 400
        else:
            return jsonify({'ok': False, 'message': 'Wrong username and password!'}), 400


def recover_resolution_data_impl():
    try:
        with open(get_data_filepath(RESOLUTION_DATA_FILENAME), 'r', encoding='utf-8') as file:
            for row in file:
                row = row.split('\t')
                data = {'station': row[0].lstrip(), 'width': row[1], 'height': row[2].rstrip()}
                json_data = json.dumps(data)
                mongo.db.resolution.insert_one(json.loads(json_data))
        return 'OK'
    except Exception as e:
        return str(e)


@app.route('/recover_all_data', methods=['POST'])
def recover_all_data():
    credentials = request.get_json()
    if request.method == 'POST':
        if is_valid_credentials(credentials):
            fixation_ret_msg = recover_fixation_data_impl()
            resolution_ret_msg = recover_resolution_data_impl()
            complexity_ret_msg = recover_complexity_data_impl()
            if fixation_ret_msg == 'OK' and resolution_ret_msg == 'OK' and complexity_ret_msg == 'OK':
                return jsonify({'ok': True, 'message': 'All data are recovered!'}), 200
            else:
                return jsonify({'ok': False, 'message': 'Fixation data: ' + fixation_ret_msg
                                                        + ' Resolution data: ' + resolution_ret_msg
                                                        + ' Complexity data: ' + complexity_ret_msg}), 400
        else:
            return jsonify({'ok': False, 'message': 'Wrong username and password!'}), 400