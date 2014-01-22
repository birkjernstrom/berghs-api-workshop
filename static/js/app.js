(function($, TT, Handlebars) {
  var Nodes = {
    content: $('#content'),
    template: {
      product: {
        empty: $('#template-zero-products').html(),
        table: $('#template-product-table').html(),
        row: $('#template-product-row').html()
      }
    }
  };

  var resetContent = function() {
    Nodes.content.empty();
  }

  var Berghsgram = function(store, accessToken) {
    this.store = store;
    this.accessToken = accessToken;
    this.base = window.location.origin + '/api/v1';

    var self = this;
    this.getProducts(function(products) {
        self.renderProducts(products);
    });
  };

  Berghsgram.prototype = {
    getEndpointURL: function(endpoint) {
      return this.base + endpoint + '?access_token=' + this.accessToken;
    },

    getProducts: function(callback) {
      var endpointURL = this.getEndpointURL('/stores/' + this.store.id + '/products');
      $.get(endpointURL, function(response) {
        if (response.error) {
          return reportError(response.error);
        }

        callback(response);
      }, 'json');
    },

    renderProducts: function(products) {
      resetContent();

      var count = products.length;
      if (!count) {
        return this.renderZeroProducts();
      }

      var row, table, body, i, product;
      row = Handlebars.compile(Nodes.template.product.row);
      table = $(Handlebars.compile(Nodes.template.product.table)());
      body = $('tbody', table);

      console.log('table', table);
      for (i = 0; i < count; i++) {
        product = products[i];
        console.log('product', product);
        var foo = row(product);
        console.log('row', foo);
        body.append(foo);
      }
      Nodes.content.append(table);
    },

    renderZeroProducts: function() {
      Nodes.content.append(Handlebars.compile(Nodes.template.product.empty)());
    }
  };

  var reportError = function(message) {
    message = message || 'Something went wrong';
    alert(message);
  }

  var appStart = function() {
    TT.api.get('v1/me').done(function(store) {
      new Berghsgram(store, TT.api.accessToken);
    }).fail(reportError);
  }

  TT.native.init().done(appStart).fail(reportError);
})(window.jQuery || {}, window.TT || {}, window.Handlebars || {});
