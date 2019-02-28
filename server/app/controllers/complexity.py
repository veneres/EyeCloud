''' controller and routes for complexity '''
import os
from flask import request, jsonify
from app import app, mongo
import logger

ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
    __name__, filename=os.path.join(ROOT_PATH, 'output.log'))


@app.route('/complexity', methods=['GET', 'POST', 'DELETE', 'PATCH'])
def complexity():
    if request.method == 'GET':
        query = request.args
        data = mongo.db.complexity.find_one(query)
        return jsonify(data), 200

    data = request.get_json()
    if request.method == 'POST':
        if isValidData(data):
            mongo.db.complexity.insert_one(data)
            return jsonify({'ok': True, 'message': 'Complexity record created successfully!'}), 200
        else:
            return jsonify({'ok': False, 'message': 'Bad request parameters!'}), 400

    if request.method == 'DELETE':
        if data.get('station') is not None:
            db_response = mongo.db.complexity.delete_one({'station': data['station']})
            if db_response.deleted_count == 1:
                response = {'ok': True, 'message': 'Complexity record deleted'}
            else:
                response = {'ok': True, 'message': 'No record found'}
            return jsonify(response), 200
        else:
            return jsonify({'ok': False, 'message': 'Bad request parameters!'}), 400

    if request.method == 'PATCH':
        if data.get('query', {}) != {}:
            mongo.db.complexity.update_one(
                data['query'], {'$set': data.get('payload', {})})
            return jsonify({'ok': True, 'message': 'Complexity record updated'}), 200
        else:
            return jsonify({'ok': False, 'message': 'Bad request parameters!'}), 400

# check valid json data that must contain all necessary fields
def isValidData(data):
    return data.get('station') is not None \
                and data.get('complexity') is not None \
                and data.get('description') is not None