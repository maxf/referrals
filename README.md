# referrals


## Elasticsearch setup

with docker:

    $ docker pull docker.elastic.co/elasticsearch/elasticsearch:7.5.1
    $ docker run -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.5.1

## Server

Setup:

    $ python3 -m venv venv
    $ pip install flask requests
    $ FLASK_APP=server.py FLASK_ENV=development flask run
