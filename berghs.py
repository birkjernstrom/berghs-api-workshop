# -*- coding: utf-8 -*-

import requests
from flask import Flask, json, render_template, request as flask_request

app = Flask(__name__)

# Good enough for this demo, but far from persistent ;-)
db = {
    'products': {},
    'hashtags': {}
}

def get_cached_hashtag(product_id, default=None):
    return db['hashtags'].get(product_id, default)

def get_hashtag(store, product):
    product_id = product['id']
    hashtag = get_cached_hashtag(product_id)
    if hashtag:
        return hashtag

    subdomain = store['dashboard_url'].split('/')[-1]
    hashtag = '{0}-{1}'.format(subdomain, product['slug'])
    db['hashtags'][product_id] = hashtag
    return hashtag


def get(url):
    r = requests.get(url)
    if r.status_code / 100 == 2:
        return r.json()

    message = 'Got incorrect HTTP response code! Blame the Hyper students!'
    return dict(error=message)


def get_endpoint_url(access_token, endpoint, *params):
    endpoint = endpoint.format(*params)
    url = 'https://api.tictail.com/v1{0}?access_token={1}'
    return url.format(endpoint, access_token)


def get_store(store_id, access_token):
    return get(get_endpoint_url(access_token, '/stores/{0}', store_id))


def get_products(store_id, access_token):
    return get(get_endpoint_url(access_token, '/stores/{0}/products', store_id))


def get_hashtags(store_id, access_token):
    store_products = db['products'].get(store_id, [])
    if not store_products:
        return json.dumps([])

    hashtags = []
    for product in store_products:
        product_id = product['id']
        hashtags.append({
            'product_id': product_id,
            'hashtag': get_cached_hashtag(product_id, product['hashtag']),
        })

    return json.dumps(hashtags)


def update_hashtags(store_id, access_token):
    resources = flask_request.json
    for resource in resources:
        hashtag = resource['hashtag']
        product_id = resource['product_id']
        # This is one place where Hyper students will thrive. Watch out ;-)
        db['hashtags'][product_id] = hashtag
    return json.dumps(resources)


@app.route('/api/v1/teapot', methods=['GET', 'POST'])
def get_teapot():
    if flask_request.method == 'POST':
        return json.dumps(flask_request.form)
    return json.dumps(flask_request.args)


@app.route('/api/v1/stores/<store_id>/hashtags', methods=['GET', 'PUT'])
def get_or_update_hashtags(store_id):
    access_token = flask_request.args.get('access_token')
    if flask_request.method == 'GET':
        return get_hashtags(store_id, access_token)
    else:
        return update_hashtags(store_id, access_token)


@app.route('/api/v1/stores/<store_id>/products')
def get_store_products(store_id):
    access_token = flask_request.args.get('access_token')
    store = get_store(store_id, access_token)
    if 'error' in store:
        return json.dumps(store)

    products = get_products(store_id, access_token)
    if 'error' in products:
        return json.dumps(products)

    payload = []
    for product in products:
        product['hashtag'] = get_hashtag(store, product)
        payload.append(product)

    db['products'][store_id] = payload
    return json.dumps(payload)


@app.route('/')
def index():
    return render_template('app.html')
