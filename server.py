from flask import Flask, request, render_template
app = Flask(__name__)

import requests
import logging
import json
import os

es_base_url = os.getenv('ES_SERVER') + '/_search'

logger = logging.getLogger('debug')

logger.error("ES_SERVER:")
logger.error(os.getenv('ES_SERVER'))



def es_search(q):
    body = {
        "query": {
            "multi_match" : {
                "query": q,
                "type": "cross_fields",
                "operator": "and"
            }
        }
    }


    r = requests.get(es_base_url, data = json.dumps(body), headers={'Content-Type': 'application/json'})

    return r.json()


@app.route('/')
def main():
    q = request.args.get('q', default='')
    r = es_search(q)

    logger.error(r)
    if 'hits' in r:
        if 'hits' in r['hits']:
            results = r['hits']['hits']
        else:
            results = []
    else:
        results = []

    return render_template('main.html', results=results, q=q)
