# Berghs API Workshop

A small Tictail Demo App which allows store owners to configure Instagram hashtags for their products.
Which of course are used to show Instagram photos of their products in the store - for all the world to see.


## Installation

* Lots of steps (shown during presentation)
* Insert Storefront Snippet

```html
<script>
    var Berghsnippet = {
      accessToken: '<your_token_here>',
      api: 'http://localhost:5000/api/v1',
      productIdentifier: '{{#product_page}}{{#product}}{{identifier}}{{/product}}{{/product_page}}',
      storeIdentifier: {{ store_identifier_encoded }}
    };
</script>
<script src="//localhost:5000/static/js/snippet.js"></script>
```

## Challenges

* There are a couple of ways Hyper students could hack our API. Try to find them.
