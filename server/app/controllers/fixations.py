''' controller and routes for fixations '''
import os
from flask import request, jsonify
from app import app, mongo
import logger

ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
    __name__, filename=os.path.join(ROOT_PATH, 'output.log'))


@app.route('/fixation', methods=['GET', 'POST', 'DELETE', 'PATCH'])
def fixation():
    if request.method == 'GET':
        query = request.args
        data = mongo.db.fixations.find_one(query)
        return jsonify(data), 200

    data = request.get_json()
    if request.method == 'POST':
        if isValidData(data):
            mongo.db.fixations.insert_one(data)
            return jsonify({'ok': True, 'message': 'Fixation record created successfully!'}), 200
        else:
            return jsonify({'ok': False, 'message': 'Bad request parameters!'}), 400

    if request.method == 'DELETE':
        if data.get('timestamp') is not None:
            db_response = mongo.db.fixations.delete_one({'timestamp': data['timestamp']})
            if db_response.deleted_count == 1:
                response = {'ok': True, 'message': 'Fixation record deleted'}
            else:
                response = {'ok': True, 'message': 'No record found'}
            return jsonify(response), 200
        else:
            return jsonify({'ok': False, 'message': 'Bad request parameters!'}), 400

    if request.method == 'PATCH':
        if data.get('query', {}) != {}:
            mongo.db.fixations.update_one(
                data['query'], {'$set': data.get('payload', {})})
            return jsonify({'ok': True, 'message': 'Fixation record updated'}), 200
        else:
            return jsonify({'ok': False, 'message': 'Bad request parameters!'}), 400

# check valid json data that must contain all necessary fields
def isValidData(data):
    return data.get('timestamp') is not None \
                and data.get('stimuliName') is not None \
                and data.get('fixationIndex') is not None \
                and data.get('fixationDuration') is not None \
                and data.get('mappedFixationPointX') is not None \
                and data.get('mappedFixationPointY') is not None \
                and data.get('user') is not None \
                and data.get('description') is not None