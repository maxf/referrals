from flask import Flask, request, render_template
app = Flask(__name__)

import requests
import logging
import json

es_base_url = 'http://0.0.0.0:9200/_search'

logger = logging.getLogger('debug')


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
    q = request.args.get('q')
    r = es_search(q)
    return render_template('main.html', results=r['hits']['hits'], q=q)
