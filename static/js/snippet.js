(function(TT, Settings) {
  var Berghsnippet = function(settings) {
    // Instagram token this time around
    this.settings = settings;
    this.hashtags = {};
    if (this.isProductPage()) {
      var self = this;
      this.getHashtags(function(hashtags) {
        self.getInstagrams(function(hashtag, instagrams) {
          self.renderList(hashtag, instagrams);
        });
      });
    }
  };

  Berghsnippet.prototype = {
    isProductPage: function() {
      return this.settings.productIdentifier.length;
    },

    getHashtags: function(callback) {
      var self = this;
      var url = this.settings.api + '/stores/' + this.settings.storeIdentifier + '/hashtags';
      $.get(url, function(hashtags) {
        var current, count = hashtags.length;
        for (var i = 0; i < count; i++) {
          current = hashtags[i];
          self.hashtags[current.product_id] = current.hashtag;
        }
        callback(self.hashtags);
      }, 'json');
    },

    getInstagrams: function(callback) {
      var hashtag = this.hashtags[this.settings.productIdentifier];
      if (!hashtag) {
        alert('No hashtag found for product :-( Something is wrong');
        return;
      }

      var self = this;
      $.ajax({
        url: 'https://api.instagram.com/v1/tags/' + hashtag + '/media/recent?access_token=' + this.settings.accessToken,
        jsonp: 'callback',
        dataType: 'jsonp',
        success: function(response) {
          callback(hashtag, self.prepareInstagrams(response));
        }
      });
    },

    prepareInstagrams: function(response) {
      var data, count, i, current, ret = [];
      data = response.data;
      count = data.length;

      for (i = 0; i < count; i++) {
        current = data[i];
        ret.push({
          'image': current.images.low_resolution.url,
          'caption': current.caption.text,
          'link': current.link
        });
      }
      return ret;
    },

    renderList: function(hashtag, instagrams) {
      var count = instagrams.length;
      if (!count) {
        return;
      }

      var container, i;
      container = $('<ul class="instagrams">');
      container.append('<li><h2>#' + hashtag + '</h2></li>');
      for (i = 0; i < count; i++) {
        container.append(this.renderItem(instagrams[i]));
      }
      $('.tictail_add_to_cart').before(container);
    },

    renderItem: function(instagram) {
      var container, link, image;
      container = $('<li>');
      link = $('<a>');
      image = $('<img>');

      link.attr('href', instagram.link);
      image.attr('src', instagram.image);
      image.attr('alt', instagram.caption);

      link.append(image);
      container.append(link);
      return container;
    }
  };

  var initSnippet = function() {
    new Berghsnippet(Settings);
  };

  if (!Settings.accessToken) {
    throw Error('No Instagram access_token given. Cannot proceed.');
    alert('Your instagram access_token has not been setup.');
  }

  // Checks if jQuery is present on the page. 
  if (TT.hasjQuery && !TT.hasjQuery()) {
    TT.loadScript('tt-myapp-jq', 'http://code.jquery.com/jquery-1.10.2.js', initSnippet);
  } else {
    initSnippet();
  }
})(window.TT || {}, window.Berghsnippet || {});
