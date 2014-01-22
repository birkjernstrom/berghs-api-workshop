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

    saveHashtags: function(table) {
      var resource, $field, hashtags = [];
      $('tbody tr', table).each(function(i, row) {
        resource = {};
        $('input', row).each(function(j, field) {
          $field = $(field);
          resource[$field.attr('name')] = $field.val();
        });
        hashtags.push(resource);
      });

      $.ajax({
        type: 'PUT',
        url: this.getEndpointURL('/stores/' + this.store.id + '/hashtags'),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(hashtags),
        success: function(response) {
          TT.native.showStatus('Woop!');
        },
        failure: function() {
          reportError();
        }
      });
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

      for (i = 0; i < count; i++) {
        product = products[i];
        body.append(row(product));
      }

      Nodes.content.append(table);

      var self = this;
      $('#save-btn').click(function(e) {
        e.preventDefault();
        self.saveHashtags(table);
      });
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
