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



def es_search(q, first, size):
    body = {
        "from": first,
        "size": size,
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
    first = int(request.args.get('p', default='0'))
    first = max(0, first)
    size = 10
    r = es_search(q, first, size)
    nbResults = 0

    logger.error(r)
    if 'hits' in r:
        nbResults = r['hits']['total']['value']
        if 'hits' in r['hits']:
            results = r['hits']['hits']
        else:
            results = []
    else:
        results = []

    return render_template('main.html', results=results, q=q, nbResults=nbResults, first=int(first), last=min(nbResults, first+size), size=size)
