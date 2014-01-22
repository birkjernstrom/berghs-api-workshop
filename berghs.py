# -*- coding: utf-8 -*-

import requests
from flask import Flask, json, render_template, request as flask_request

app = Flask(__name__)

# Good enough for this demo, but far from persistent ;-)
db = {
    'products': {},
    'hashtags': {}
}


def get_hashtag(store, product):
    hashtag = db['hashtags'].get(product['id'], None)
    if hashtag:
        return hashtag

    subdomain = store['dashboard_url'].split('/')[-1]
    return '{0}-{1}'.format(subdomain, product['slug'])


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


@app.route('/api/v1/teapot', methods=['GET', 'POST'])
def get_teapot():
    if flask_request.method == 'POST':
        return json.dumps(flask_request.form)
    return json.dumps(flask_request.args)


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
    return json.dumps(payload)


@app.route('/')
def index():
    return render_template('app.html')
