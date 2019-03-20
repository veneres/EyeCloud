''' controller and routes for APIs'''
import os
from flask import request, jsonify
from app import app, mongo
import logger
import sys
import math
import numpy as np
from tqdm import tqdm

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
        return jsonify(get_fixations_by_user_and_station_aux(user, station_name, from_timestamp, to_timestamp))


def get_fixations_by_user_and_station_aux(user, station_name, from_timestamp, to_timestamp):
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
    return data


@app.route('/all_stations/', methods=['GET'])
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


@app.route('/all_fixations/stimulus=<string:stimulus_name>/from=<int:from_timestamp>-to=<int:to_timestamp>',
           methods=['GET'])
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


@app.route('/all_users/stimulus=<string:stimulus_name>', methods=['GET'])
def get_users_by_stimulus(stimulus_name):
    if request.method == 'GET':
        users = set()
        cursor = mongo.db.fixations.find({'stimuliName': stimulus_name})
        for document in cursor:
            users.add(document['user'])
        return jsonify([user_id for user_id in users])


def rgb_from_intensity(intensity, max_intensity):
    max_value = 255
    r = 0
    b = max_value
    scaling_factor = max_intensity * 0.25
    if intensity <= max_intensity * 0.25:
        g = max_value * intensity / scaling_factor
    elif intensity <= max_intensity * 0.5:
        g = 255
        b = max_value * (1 - ((intensity - scaling_factor) / scaling_factor))
    elif intensity <= max_intensity * 0.75:
        b = 0
        g = 255
        r = max_value * (intensity - 2 * scaling_factor) / scaling_factor
    else:
        b = 0
        r = 255
        g = max_value * (1 - (intensity - 3 * scaling_factor)/ max_intensity)

    return r, g, b


# TODO make this function working for an array of users instead of a single user
# TODO decide if we do the scaling on the frontend or in the backend
@app.route('/heatmap/stimulus=<string:stimulus_name>/user=<user>', methods=['GET'])
def get_heatmap(stimulus_name, user):
    if request.method == 'GET':
        all_stations = mongo.db.station.find()
        associated_station = None
        for station in all_stations:
            for stimulus in station.get("stimuli_list", []):
                # check the stimulus without the file extension
                if stimulus[:-4] == stimulus_name:
                    associated_station = station
                    break
        if associated_station is None:
            return jsonify({'ok': False, 'message': 'Bad request parameters!'}), 400
        map_height = int(associated_station['height'])
        map_width = int(associated_station['width'])
        pixel_matrix = [[0 for _ in range(map_width)] for _ in range(map_height)]
        max_weight_for_red = 0
        # TODO decided if want to make the visual span variable
        visual_span_radius = 30
        # TODO change the hardcoded timestamps
        fixations_points = get_fixations_by_user_and_station_aux(user, associated_station['name'], 0, 9999999999999)
        for key, fixation_point in fixations_points.items():
            x = int(fixation_point['fixationPoint']['x'])
            y = int(fixation_point['fixationPoint']['y'])
            # check if the visual span is inside the pixel matrix
            range_start_x = x - visual_span_radius if x - visual_span_radius > 0 else 0
            range_finish_x = x + visual_span_radius if x + visual_span_radius < map_width - 1 else map_width - 1
            range_start_y = y - visual_span_radius if y - visual_span_radius > 0 else 0
            range_finish_y = y + visual_span_radius if y + visual_span_radius < map_height - 1 else map_height - 1
            for row in range(range_start_y, range_finish_y + 1):
                for column in range(range_start_x, range_finish_x + 1):
                    distance = math.sqrt((x - column) ** 2 + (y - row) ** 2)
                    if distance >  visual_span_radius:
                        continue
                    # linear scaling for the model
                    # TODO decide if we want to add also the Gaussian option
                    # p = probabilty that the user have seen the pixel in specificed visual span
                    p = 1 - distance / (visual_span_radius * 2)
                    duration = int(fixation_point['fixationPoint']['duration'])
                    pixel_matrix[row][column] += duration * p
                    if pixel_matrix[row][column] > max_weight_for_red:
                        max_weight_for_red = pixel_matrix[row][column]
        res = {}
        for row in range(map_height):
            for column in range(map_width):
                if pixel_matrix[row][column] == 0:
                    continue
                r, g, b = rgb_from_intensity(pixel_matrix[row][column], max_weight_for_red)
                if row in res:
                    res[row][column]=[r,g,b]
                else:
                    res[row]={column: [r,g,b]}
        return jsonify(height=map_height, width=map_width, points=res)

@app.route('/timestamp/stimulus=<string:stimulus_name>', methods=['GET'])
def min_max_timestamp(stimulus_name):
    minimum_fix = mongo.db.fixations.find({"stimuliName": "{}.jpg".format(stimulus_name)}).sort([("timestamp",-1)]).limit(1)
    minimum_fix = list(minimum_fix)
    max_fix = mongo.db.fixations.find({"stimuliName": "{}.jpg".format(stimulus_name)}).sort([("timestamp", 1)]).limit(1)
    max_fix = list(max_fix)
    res = {
        "min": minimum_fix[0]['timestamp'],
        "max": max_fix[0]['timestamp']
    }
    return jsonify(res)
