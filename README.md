berghs-api-workshop
===================

snippet
===================
<script>
    var Berghsnippet = {
      accessToken: '<your_token_here>',
      api: 'http://localhost:5000/api/v1',
      productIdentifier: '{{#product_page}}{{#product}}{{identifier}}{{/product}}{{/product_page}}',
      storeIdentifier: {{ store_identifier_encoded }}
    };
</script>
<script src="//localhost:5000/static/js/snippet.js"></script>

challenges
===================
[*] There are a couple of ways Hyper students could hack our API. Try to find them.
