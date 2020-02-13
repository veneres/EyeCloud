''' controller and routes for APIs'''
import os
from flask import request, jsonify
from app import app, mongo
import logger
import math
from PIL import Image

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


@app.route('/all_fixations/user=<user>/station=<station_name>/from=<int:from_timestamp>-to=<int:to_timestamp>', methods=['GET'])
def get_fixations_by_user_and_station(user, station_name, from_timestamp, to_timestamp):
    if request.method == 'GET':
        data = {}
        data_id = 1
        cursor = mongo.db.fixations.find({'station': station_name, 'user': user})
        for document in cursor:
            timestamp = document['timestamp']
            if from_timestamp <= timestamp <= to_timestamp:
                fixation_point = {'index': document['fixationIndex'], 'timestamp': document['timestamp'],
                                  'x': document['mappedFixationPointX'], 'y': document['mappedFixationPointY'],
                                  'duration': document['fixationDuration']}
                map_data = {'mapName': document['stimuliName'], 'description': document['description']}
                fixation_data = {'station': station_name, 'fixationPoint': fixation_point, 'mapInfo': map_data,
                                 'user': user}
                data[str(data_id)] = fixation_data
                data_id += 1
        return jsonify(data)


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
            if from_timestamp <= timestamp <= to_timestamp:
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
            if from_timestamp <= timestamp <= to_timestamp:
                fixation_point = {'index': document['fixationIndex'], 'timestamp': document['timestamp'],
                                  'x': document['mappedFixationPointX'], 'y': document['mappedFixationPointY'],
                                  'duration': document['fixationDuration']}
                map_data = {'mapName': document['stimuliName'], 'description': document['description']}
                fixation_data = {'station': station_name, 'fixationPoint': fixation_point, 'mapInfo': map_data,
                                 'user': document['user']}
                data[str(data_id)] = fixation_data
                data_id += 1
        return jsonify(data)


@app.route('/all_fixations/stimulus=<string:stimulus_name>', methods=['POST'])
def get_fixations_by_stimulus(stimulus_name):
    if request.method == 'POST' and request.is_json:
        content = request.get_json()
        users = [user['userId'] for user in content['users']]
        timestamp_start = content['timeStampStart']
        timestamp_end = content['timeStampStop']
        data = {}
        data_id = 1
        cursor = mongo.db.fixations.find({'stimuliName': stimulus_name})
        for document in cursor:
            timestamp = document['timestamp']
            if timestamp_start <= timestamp <= timestamp_end and document['user'] in users:
                fixation_point = {'index': document['fixationIndex'], 'timestamp': document['timestamp'],
                                  'x': document['mappedFixationPointX'], 'y': document['mappedFixationPointY'],
                                  'duration': document['fixationDuration']}
                map_data = {'mapName': document['stimuliName'], 'description': document['description']}
                fixation_data = {'station': document['station'], 'fixationPoint': fixation_point, 'mapInfo': map_data,
                                 'user': document['user']}
                data[str(data_id)] = fixation_data
                data_id += 1
        return jsonify(data)


@app.route('/gaze_stripes/stimulus=<string:stimulus_name>', methods=['POST'])
def get_gaze_stripes_by_stimulus(stimulus_name):
    if request.method == 'POST' and request.is_json:
        content = request.get_json()
        users = [user['userId'] for user in content['users']]
        timestamp_start = content['timeStampStart']
        timestamp_end = content['timeStampStop']
        cursor = mongo.db.fixations.find({'stimuliName': stimulus_name})
        data = {}
        data_id = 1
        for u in users:
            data[u] = {}
        for document in cursor:
            timestamp = document['timestamp']
            user = document['user']
            if timestamp_start <= timestamp <= timestamp_end and user in users:
                fixation_point = {'index': document['fixationIndex'], 'timestamp': document['timestamp'],
                                  'x': document['mappedFixationPointX'], 'y': document['mappedFixationPointY'],
                                  'duration': document['fixationDuration']}
                map_data = {'mapName': document['stimuliName'], 'description': document['description']}
                fixation_data = {'station': document['station'], 'fixationPoint': fixation_point, 'mapInfo': map_data,
                                 'user': user}
                data[user][data_id] = fixation_data
                data_id += 1
        filtered_data = {}
        for key in data:
            if len(data[key]) > 0:
                filtered_data[key] = data[key]
        return jsonify(filtered_data)


@app.route('/all_users/stimulus=<string:stimulus_name>', methods=['GET'])
def get_users_by_stimulus(stimulus_name):
    if request.method == 'GET':
        users = set()
        cursor = mongo.db.fixations.find({'stimuliName': stimulus_name})
        for document in cursor:
            users.add(document['user'])
        return jsonify([user_id for user_id in sorted(users, key=get_integer_id)])


def get_integer_id(user):
    return int(user[1:])


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
        g = max_value * (1 - (intensity - 3 * scaling_factor) / max_intensity)

    return r, g, b

@app.route('/heatmap/stimulus=<string:stimulus_name>', methods=['POST'])
def get_heatmap(stimulus_name):
    if request.method == 'POST' and request.is_json:
        content = request.get_json()
        users = [user['userId'] for user in content['users']]
        timestamp_start = content['timeStampStart']
        timestamp_end = content['timeStampStop']
        visual_span_radius = content['visualSpan']
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
        for user in users:
            # check cache in mongodb
            cache_document = mongo.db.heatmapCache.find_one({'user': user,
                                                             "timestampStart": timestamp_start,
                                                             "timestampEnd": timestamp_end,
                                                             "visualSpan": visual_span_radius,
                                                             "stimulus": stimulus_name})
            # if it's cached
            if cache_document is not None:
                pixel_matrix_cached = cache_document['matrixSummary']
                # the structure is {<row>:[<column>:value, ...], ...}
                for row, column_dict in pixel_matrix_cached.items():
                    for column, value in column_dict.items():
                        row = int(row)
                        column = int(column)
                        pixel_matrix[row][column] += value
                        if pixel_matrix[row][column] > max_weight_for_red:
                            max_weight_for_red = pixel_matrix[row][column]
            else:
                cursor = mongo.db.fixations.find(
                    {'stimuliName': '{}.jpg'.format(stimulus_name),
                     'user': user
                     })
                fixation_points = []
                # get all the fixations points for the given user, stimulus and timestamps
                for document in cursor:
                    timestamp = document['timestamp']
                    if timestamp_start <= timestamp <= timestamp_end:
                        fixation_point = {'index': document['fixationIndex'], 'timestamp': document['timestamp'],
                                          'x': document['mappedFixationPointX'], 'y': document['mappedFixationPointY'],
                                          'duration': document['fixationDuration']}
                        fixation_points.append(fixation_point)
                # create a new pixel matrix for the given user
                pixel_matrix_user = [[0 for _ in range(map_width)] for _ in range(map_height)]
                for fixation_point in fixation_points:
                    x = fixation_point['x']
                    y = fixation_point['y']
                    # check if the visual span is inside the pixel matrix
                    range_start_x = x - visual_span_radius if x - visual_span_radius > 0 else 0
                    range_finish_x = x + visual_span_radius if x + visual_span_radius < map_width - 1 else map_width - 1
                    range_start_y = y - visual_span_radius if y - visual_span_radius > 0 else 0
                    range_finish_y = y + visual_span_radius if y + visual_span_radius < map_height - 1 else map_height - 1
                    for row in range(range_start_y, range_finish_y + 1):
                        for column in range(range_start_x, range_finish_x + 1):
                            distance = math.sqrt((x - column) ** 2 + (y - row) ** 2)
                            if distance > visual_span_radius:
                                continue
                            # TODO make gaussian model like a parameter
                            # Gaussian model
                            # p = probabilty that the user have seen the pixel in specificed visual span
                            c = 0.17 * (visual_span_radius * 2)
                            p = math.exp(-(distance ** 2) / (2 * c ** 2))
                            # linear model
                            # p = 1 - distance / (visual_span_radius * 2)
                            duration = fixation_point['duration']
                            pixel_matrix[row][column] += duration * p
                            pixel_matrix_user[row][column] += duration * p
                            if pixel_matrix[row][column] > max_weight_for_red:
                                max_weight_for_red = pixel_matrix[row][column]
                # Cache the pixel matrix just obtained
                summary_to_cache = {}
                for row in range(map_height):
                    for column in range(map_width):
                        if pixel_matrix[row][column] == 0:
                            continue
                        if str(row) in summary_to_cache:
                            summary_to_cache[str(row)][str(column)] = pixel_matrix_user[row][column]
                        else:
                            summary_to_cache[str(row)] = {str(column): pixel_matrix_user[row][column]}
                # we store the document in the db
                mongo.db.heatmapCache.insert_one({'user': user,
                                                  "timestampStart": timestamp_start,
                                                  "timestampEnd": timestamp_end,
                                                  "stimulus": stimulus_name,
                                                  "visualSpan": visual_span_radius,
                                                  "matrixSummary": summary_to_cache})
        res = {}
        for row in range(map_height):
            for column in range(map_width):
                if pixel_matrix[row][column] == 0:
                    continue
                r, g, b = rgb_from_intensity(pixel_matrix[row][column], max_weight_for_red)
                if row in res:
                    res[row][column] = [r, g, b]
                else:
                    res[row] = {column: [r, g, b]}
        return jsonify(height=map_height, width=map_width, points=res)


@app.route('/timestamp/stimulus=<string:stimulus_name>', methods=['POST'])
def max_timestamp(stimulus_name):
    if request.method == 'POST' and request.is_json:
        content = request.get_json()
        users_ids = [user['userId'] for user in content]
        max_fix = None
        for user_id in users_ids:
            # retrive all the fixation points for current user in asc order
            sorted_documents = list(
                mongo.db.fixations.find({"stimuliName": "{}.jpg".format(stimulus_name), "user": user_id}).sort(
                    [("timestamp", 1)]))
            max_duration = sorted_documents[-1]['timestamp'] - sorted_documents[0]['timestamp']
            if max_fix is None or max_duration > max_fix:
                max_fix = max_duration
        res = {
            "max": max_fix
        }
        return jsonify(res)

@app.route('/rgb_distribution/stimulus=<string:stimulus_name>/', methods=['GET'])
def rgb_distribution(stimulus_name):
    image_path = os.path.join(ROOT_PATH, "app", "dist", "stimuli", "{}.jpg".format(stimulus_name))
    if os.path.exists(image_path):
        im = Image.open(image_path)
        pix = im.load()
        tl = (int(request.args.get('tlx', 0)), int(request.args.get('tly', 0)))
        br = (int(request.args.get('brx', im.size[0])), int(request.args.get('bry', im.size[1])))
        red_value = 0
        green_value = 0
        blue_value = 0
        tot_pixel = (br[0] - tl[0]) * (br[1] - tl[1])
        for row in range(tl[0], br[0]):
            for column in range(tl[1], br[1]):
                red_value += pix[row,column][0]
                green_value += pix[row,column][1]
                blue_value += pix[row,column][2]
        res = {
            "red": red_value / tot_pixel,
            "green": green_value / tot_pixel,
            "blu": blue_value / tot_pixel
        }
        return jsonify(res)
    else:
        return jsonify({'ok': False, 'message': 'Bad stimulus name'})