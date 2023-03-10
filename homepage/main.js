// Remove for production
let $ = jQuery;
// /Remove for production

//
// Get Least liked Cryptos
//
$.ajax('https://api.nexthunch.io/api/v1/least_liked_cryptos')
  .done(function(res) {
    const firstSix = res.slice(0, 6);
    console.log(firstSix);
    firstSix.forEach((asset, i) => {
      const $squareContainer = $('.trend-grid.least-liked .trend-asset-square:nth-child(' + (i + 1) + ')');
      const cryptoSymbol = asset.base_currency.toLowerCase();
      console.log(cryptoSymbol);
      $squareContainer.find('.asset-icon').append('<img class="asset-icon-img" src="https://cryptoicons.org/api/icon/' + cryptoSymbol + '/50">');
      $squareContainer.find('.asset-name').append(asset.name);
      $squareContainer.find('.asset-price').append(asset.close_price);
      $squareContainer.find('.asset-p-change').append(asset.change_in_price_24_hr);
    });

  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    console.log(jqXHR);
    console.log(textStatus);
    console.log(errorThrown);
  })
  .always(function() {
  });


//
// Search bar
//
function initSearchbar() {
  // 
  // Load dependencies
  //
  const jqueryUiStyles = document.createElement('link');
  jqueryUiStyles.setAttribute('href','https://code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css');
  jqueryUiStyles.setAttribute('rel','stylesheet');
  document.head.appendChild(jqueryUiStyles);

  const jqueryUiScript = document.createElement('script');
  jqueryUiScript.setAttribute('src','https://code.jquery.com/ui/1.12.1/jquery-ui.js');
  document.head.appendChild(jqueryUiScript);

  jqueryUiScript.onload = function() {
    $('#nav-bar-symbol-search .symbol-search-input').autocomplete({
      source: function(request, response) {
        $.ajax({
          url: "https://api.nexthunch.io/api/v1/symbol_search?q=" + request.term,
          dataType: "json",
          success: function(res) {
            let matchingCrypto = res.data.crypto.map((cryptoSymbolData) => ({
              value: cryptoSymbolData.symbol,
              label: cryptoSymbolData.name + ' - ' + cryptoSymbolData.symbol.toUpperCase(),
              cg_id: cryptoSymbolData.cg_id
            }));

            let matchingStocks = res.data.stocks.map((stockSymbolData) => ({
              value: stockSymbolData.symbol,
              label: stockSymbolData.displaySymbol + ' - ' + stockSymbolData.description
            }));

            let matchingAssetsData = matchingCrypto;
            matchingAssetsData.push(...matchingStocks);

            const sortedMatchingAssetsData = matchingAssetsData.reduce((acc, asset) => {
              if (asset.label.search(new RegExp(request.term, "i")) > -1) {
                return [asset, ...acc];
              }
              return [...acc, asset];
            }, []);

            console.log(sortedMatchingAssetsData);
            response(sortedMatchingAssetsData);
          }
        });
      },
      minLength: 1,
      cacheLength: 0,
      autoFocus: true,
      select: function(event, ui) {
        debugger;
        window.location = '/quote?symbol=' + ui.item.value;
      } //do something with the selected option. refer to jquery ui autocomplete docs for more info
    }).attr("autocomplete", "off").blur(function(){
      let keyEvent = $.Event("keydown");
      keyEvent.keyCode = $.ui.keyCode.ENTER;
      $(this).trigger(keyEvent);
    });

    $('#symbol-search-submit-btn').on('click', function() {
      $('#symbol-search').data('uiAutocomplete')._trigger('select');
    });
  }
}



//
// Run the relevant scripts
//
initSearchbar();
