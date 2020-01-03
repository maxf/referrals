from flask import Flask, request, render_template
app = Flask(__name__)

import requests
import logging

es_base_url = 'http://0.0.0.0:9200/_search'


def es_search(q):
    r = requests.get(es_base_url, params = {'q': q})
    return r.json()


@app.route('/')
def main():
    q = request.args.get('q')
    r = es_search(q)
    return render_template('main.html', results=r['hits']['hits'], q=q)
