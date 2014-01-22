# -*- coding: utf-8 -*-

import requests
from flask import Flask, json, render_template, request as flask_request

app = Flask(__name__)

def get_products(store_id, access_token):
    url = 'https://api.tictail.com/v1/stores/{0}/products?access_token={1}'
    r = requests.get(url.format(store_id, access_token))
    if r.status_code / 100 != 2:
        msg = 'Got incorrect HTTP response code! Blame the Hyper students!'
        return dict(error=msg)

    products = r.json()
    return products


@app.route('/api/v1/stores/<store_id>/products')
def get_store_products(store_id):
    access_token = flask_request.args.get('access_token')
    products = get_products(store_id, access_token)
    return json.dumps(products)

@app.route('/')
def index():
    return render_template('app.html')
