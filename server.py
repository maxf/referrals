from flask import Flask, request
app = Flask(__name__)

import requests
import logging

es_base_url = 'http://0.0.0.0:9200/_search'


def es_search(q):
    r = requests.get(es_base_url, params = {'q': q})
    app.logger.info(r.url);
    return r.json()


@app.route('/api/search')
def me_api():
    q = request.args.get('q')
    r = es_search(q)
    return {
        'q': q,
        'result': r
    }
