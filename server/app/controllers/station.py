''' controller and routes for resolution '''
import os
from flask import request, jsonify
from app import app, mongo
import logger

ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
    __name__, filename=os.path.join(ROOT_PATH, 'output.log'))


@app.route('/station', methods=['GET', 'POST', 'DELETE', 'PATCH'])
def station():
    if request.method == 'GET':
        query = request.args
        data = mongo.db.station.find_one(query)
        return jsonify(data), 200

    data = request.get_json()
    if request.method == 'POST':
        if isValidData(data):
            mongo.db.stationf.insert_one(data)
            return jsonify({'ok': True, 'message': 'Station record created successfully!'}), 200
        else:
            return jsonify({'ok': False, 'message': 'Bad request parameters!'}), 400

    if request.method == 'DELETE':
        if data.get('station') is not None:
            db_response = mongo.db.station.delete({'station': data['station']})
            if db_response.deleted_count == 1:
                response = {'ok': True, 'message': 'Station record deleted'}
            else:
                response = {'ok': True, 'message': 'No record found'}
            return jsonify(response), 200
        else:
            return jsonify({'ok': False, 'message': 'Bad request parameters!'}), 400

    if request.method == 'PATCH':
        if data.get('query', {}) != {}:
            mongo.db.station.update(
                data['query'], {'$set': data.get('payload', {})})
            return jsonify({'ok': True, 'message': 'Station record updated'}), 200
        else:
            return jsonify({'ok': False, 'message': 'Bad request parameters!'}), 400

# check valid json data that must contain all necessary fields
def isValidData(data):
    return data.get('name') is not None