// Remove for production
let $ = jQuery;
// /Remove for production

var nhLib = {
  homePage: {
    init: function () {
      // Home page specific jQuery functions.
    },
  },
  quotePage: {
    init: function () {
      const today = new Date();
      const days = 86400000; //number of milliseconds in a day
      var todayStr = today.toLocaleDateString("en-GB").split("/").reverse().join("-");
      var oneDayAgo = new Date(today - 1 * days).toLocaleDateString("en-GB").split("/").reverse().join("-");
      var twoDaysAgo = new Date(today - 2 * days).toLocaleDateString("en-GB").split("/").reverse().join("-");
      var threeDaysAgo = new Date(today - 3 * days).toLocaleDateString("en-GB").split("/").reverse().join("-");
      var fourDaysAgo = new Date(today - 4 * days).toLocaleDateString("en-GB").split("/").reverse().join("-");
      var fiveDaysAgo = new Date(today - 5 * days).toLocaleDateString("en-GB").split("/").reverse().join("-");
      var sixDaysAgo = new Date(today - 6 * days).toLocaleDateString("en-GB").split("/").reverse().join("-");
      var sevenDaysAgo = new Date(today - 7 * days).toLocaleDateString("en-GB").split("/").reverse().join("-");

      const urlParams = new URLSearchParams(window.location.search);
      const qp = Object.fromEntries(urlParams);
      const symbol = qp.symbol;
      const cg_id = qp.cg_id;

      // Used for the date range picker; but date range picker not used atm
      var startDate = qp.startDate || oneDayAgo;
      var endDate = qp.endDate || todayStr;

      nhLib.quotePage.getAssetProfile(symbol, cg_id);
      nhLib.quotePage.initPriceTimeChart(symbol, cg_id);
    },
    getAssetProfile: function (symbol, cg_id) {
      $.ajax({
        url: "https://api.nexthunch.io/api/v1/symbol_search?symbol=" + symbol,
        success: function (res) {
          console.log("symbol profile: ", res);

          const pChangeCurrent = parseFloat((res.close_price - res.previousClose) / res.previousClose) * 100;
          const pChangeCurrentStr = pChangeCurrent.toFixed(2) + "%";
          const pChangeIsPositive = pChangeCurrent >= 0;

          // Price Plot header section
          $(".current-asset-price").text("$" + parseFloat(res.close_price).toFixed(2));
          $(".asset-name").text(res.name + " (" + res.symbol + ") ");
          $(".p-change-current").text(pChangeCurrentStr + (pChangeIsPositive ? " ↗" : " ↘"));
          $(".todays-high").text(parseFloat(res.dayHigh).toFixed(2));
          $(".todays-low").text(parseFloat(res.dayLow).toFixed(2));
          if (pChangeIsPositive) {
            $(".p-change-current").addClass("text-green");
          } else {
            $(".p-change-current").addClass("text-red");
          }

          // Daily Metrics Section
          $(".price-change-value").text((parseFloat(res.change_in_price_24_hr) * 100).toFixed(2) + "%");
          $(".volume-value").text(res.volume.toLocaleString());
          $(".average-daily-volume-value").text(res.averageDailyVolume10Day.toLocaleString());
          $(".fifty-two-week-high-value").text(parseFloat(res.fiftyTwoWeekHigh.toLocaleString()).toFixed(2));
          $(".fifty-two-week-low-value").text(parseFloat(res.fiftyTwoWeekLow.toLocaleString()).toFixed(2));
          $(".market-cap-value").text(res.marketCap.toLocaleString());
          $(".start-date-value").text(new Date(res.startDate).toISOString().split("T")[0]);
          $(".fifty-day-avg-value").text(parseFloat(res.fiftyDayAverage.toLocaleString()).toFixed(2));
          $(".two-hundred-day-avg-value").text(parseFloat(res.twoHundredDayAverage.toLocaleString()).toFixed(2));

          // Profile Section
          $(".profile-name").text(res.name ? res.name : "-");
          $(".profile-description").text(res.description ? res.description : "-");
          $(".profile-segment").text(res.blockchain_segment_1 ? res.blockchain_segment_1 : "-");
          $(".profile-supply-limit").text(res.maxSupply ? res.maxSupply : "-");
          $(".profile-suitable-for").text(res.investment_style ? res.investment_style : "-");
          $(".profile-circulating-supply").text(res.circulatingSupply ? res.circulatingSupply : "-");
          $(".profile-market-cap-size").text(res.market_cap_size ? res.market_cap_size : "-");
          $(".profile-risk-level").text(res.risk_level ? res.risk_level : "-");
          $(".profile-strengths").text(res.strengths ? res.strengths : "-");
          $(".profile-weaknesses").text(res.weaknesses ? res.weaknesses : "-");
        },
      });
    },
    initPriceTimeChart: function (symbol, cg_id) {
      const dep1 = nhLib.loadScript("https://code.highcharts.com/stock/highstock.js");
      const dep2 = nhLib.loadScript("https://code.highcharts.com/stock/modules/data.js");
      const dep3 = nhLib.loadScript("https://code.highcharts.com/stock/modules/exporting.js");
      const dep4 = nhLib.loadScript("https://code.highcharts.com/stock/modules/export-data.js");
      const dep5 = nhLib.loadScript("https://code.highcharts.com/stock/modules/accessibility.js");

      Promise.all([dep1, dep2, dep3, dep4, dep5]).then(() => {
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

        $(".price-time-chart-container").append('<div id="price-plot-container"></div>');

        function allTimePricePlotPointsAjax() {
          return $.ajax({
            url: "https://api.nexthunch.io/api/v1/stock_price_plot?ticker=" + symbol + "&duration=alltime",
          });
        }

        function monthlyPricePlotPointsAjax() {
          return $.ajax({
            url: "https://api.nexthunch.io/api/v1/stock_price_plot?ticker=" + symbol + "&duration=monthly",
          });
        }

        function dailyPricePlotPointsAjax() {
          return $.ajax({
            url: "https://api.nexthunch.io/api/v1/stock_price_plot?ticker=" + symbol + "&duration=daily",
          });
        }

        function allTimeVolumePlotPointsAjax() {
          return $.ajax({
            url: "https://api.nexthunch.io/api/v1/stock_volume_plot?ticker=" + symbol + "&duration=alltime",
          });
        }

        function monthlyVolumePlotPointsAjax() {
          return $.ajax({
            url: "https://api.nexthunch.io/api/v1/stock_volume_plot?ticker=" + symbol + "&duration=monthly",
          });
        }

        function dailyVolumePlotPointsAjax() {
          return $.ajax({
            url: "https://api.nexthunch.io/api/v1/stock_volume_plot?ticker=" + symbol + "&duration=daily",
          });
        }

        function serializePriceData(ajaxObj, extendFakeTimeRange = true) {
          const ajaxRes = ajaxObj[0];
          let data = Object.keys(ajaxRes.data).map((timestamp) => {
            return [parseInt(timestamp) * 1000, ajaxRes.data[timestamp].close];
          });

          if (extendFakeTimeRange) {
            data.unshift([Math.round(twoYearsAgo.getTime() / 1000) * 1000, null]);
          }

          return data;
        }

        function serializeVolumeData(ajaxObj, extendFakeTimeRange = true) {
          const ajaxRes = ajaxObj[0];
          let data = Object.keys(ajaxRes.data).map((timestamp) => {
            return [parseInt(timestamp) * 1000, ajaxRes.data[timestamp]];
          });

          if (extendFakeTimeRange) {
            data.unshift([Math.round(twoYearsAgo.getTime() / 1000) * 1000, null]);
          }

          return data;
        }

        function afterSetExtremes(e) {
          const { chart } = e.target;
          chart.showLoading("Loading...");

          const newRangeInMs = Math.round(e.max) - Math.round(e.min);

          if (newRangeInMs <= 86400000) {
            // 1 day ms
            // Use daily minutely data
            $.when(dailyPricePlotPointsAjax(), dailyVolumePlotPointsAjax())
              .done(function (dailyPricePlotPointsAjaxObj, dailyVolumePlotPointsAjaxObj) {
                priceData = serializePriceData(dailyPricePlotPointsAjaxObj);
                volumeData = serializeVolumeData(dailyVolumePlotPointsAjaxObj);

                chart.xAxis[0].setExtremes(priceData[1][0], priceData[priceData.length - 1][0]); // Hack to fix chart not zooming back into 1d range properly after zooming past 1m
                chart.series[0].setData(priceData);
                chart.series[1].setData(volumeData);
                chart.hideLoading();
              })
              .catch((error) => console.error(error.message));
          } else if (newRangeInMs > 86400000 && newRangeInMs <= 2592000000) {
            // 1 month ms
            // Use monthly hourly data
            $.when(monthlyPricePlotPointsAjax(), monthlyVolumePlotPointsAjax())
              .done(function (monthlyPricePlotPointsAjaxObj, monthlyVolumePlotPointsAjaxObj) {
                priceData = serializePriceData(monthlyPricePlotPointsAjaxObj);
                volumeData = serializeVolumeData(monthlyVolumePlotPointsAjaxObj);

                chart.series[0].setData(priceData);
                chart.series[1].setData(volumeData);
                chart.hideLoading();
              })
              .catch((error) => console.error(error.message));
          } else {
            // Use all time data
            $.when(allTimePricePlotPointsAjax(), allTimeVolumePlotPointsAjax())
              .done(function (allTimePricePlotPointsAjaxObj, allTimeVolumePlotPointsAjaxObj) {
                priceData = serializePriceData(allTimePricePlotPointsAjaxObj, false);
                volumeData = serializeVolumeData(allTimeVolumePlotPointsAjaxObj, false);

                chart.series[0].setData(priceData);
                chart.series[1].setData(volumeData);
                chart.hideLoading();
              })
              .catch((error) => console.error(error.message));
          }
        }

        $.when(dailyPricePlotPointsAjax(), dailyVolumePlotPointsAjax()).done(function (dailyPricePlotPointsAjaxObj, dailyVolumePlotPointsAjaxObj) {
          dailyPricePlotPointsAjaxRes = dailyPricePlotPointsAjaxObj[0];
          dailyVolumePlotPointsAjaxRes = dailyVolumePlotPointsAjaxObj[0];

          priceDataArys = [];
          priceDataArys.push(serializePriceData(dailyPricePlotPointsAjaxObj));
          priceData = [...new Set(priceDataArys.flat())]; // Combine different datasets if there are any

          volumeDataArys = [];
          volumeDataArys.push(serializeVolumeData(dailyVolumePlotPointsAjaxObj));
          volumeData = [...new Set(volumeDataArys.flat())];

          // Create the chart
          Highcharts.stockChart("price-plot-container", {
            rangeSelector: {
              buttons: [
                {
                  type: "day",
                  count: 1,
                  text: "1d",
                  title: "View 1 day",
                },
                {
                  type: "week",
                  count: 1,
                  text: "1w",
                  title: "View 1 week",
                },
                {
                  type: "month",
                  count: 1,
                  text: "1m",
                  title: "View 1 month",
                },
                {
                  type: "month",
                  count: 3,
                  text: "3m",
                  title: "View 3 months",
                },
                {
                  type: "month",
                  count: 6,
                  text: "6m",
                  title: "View 6 months",
                },
                {
                  type: "ytd",
                  text: "YTD",
                  title: "View year to date",
                },
                {
                  type: "year",
                  count: 1,
                  text: "1y",
                  title: "View 1 year",
                },
                {
                  type: "all",
                  text: "All",
                  title: "View all",
                },
              ],
              inputEnabled: false, // it supports only days
              selected: 0,
            },
            title: {
              text: "Price",
            },
            legend: {
              enabled: true,
            },
            xAxis: {
              events: {
                afterSetExtremes: afterSetExtremes,
              },
              minRange: 0.1, // 3600 * 1000 // 1 hour
            },
            yAxis: [
              {
                height: "60%",
              },
              {
                top: "60%",
                height: "20%",
              },
              {
                top: "80%",
                height: "20%",
              },
            ],
            plotOptions: {
              series: {
                showInLegend: true,
                accessibility: {
                  exposeAsGroupOnly: true,
                },
              },
            },
            series: [
              {
                id: "price",
                name: "Price",
                data: priceData,
                dataGrouping: {
                  enabled: false,
                },
                tooltip: {
                  valueDecimals: 2,
                },
              },
              {
                type: "column",
                id: "volume",
                name: "Volume",
                data: volumeData,
                dataGrouping: {
                  enabled: false,
                },
                yAxis: 1,
              },
            ],
            scrollbar: {
              enabled: false,
            },
            navigator: {
              enabled: false,
            },
            chart: {
              panning: {
                enabled: false,
              },
            },
          });
        });
      });
    },
  },
  watchlistPage: {
    init: function () {
      // Watchlist page specific jQuery functions.
    },
  },
  feedPage: {
    init: function () {
      // Feed page specific jQuery functions.
    },
  },
  signInPage: {
    init: function () {
      // Sign in page specific jQuery functions.
    },
  },
  loadScript: function (uri) {
    return new Promise((resolve, reject) => {
      const scriptTag = document.createElement("script");
      scriptTag.src = uri;
      scriptTag.async = true;
      scriptTag.onload = () => resolve();

      const bodyTag = document.getElementsByTagName("body")[0];
      bodyTag.appendChild(scriptTag);
    });
  },
  symbolSearchBar: {
    init: function () {
      //
      // Load dependencies
      //
      const jqueryUiStyles = document.createElement("link");
      jqueryUiStyles.setAttribute("href", "https://code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css");
      jqueryUiStyles.setAttribute("rel", "stylesheet");
      document.head.appendChild(jqueryUiStyles);

      const jqueryUiScript = document.createElement("script");
      jqueryUiScript.setAttribute("src", "https://code.jquery.com/ui/1.12.1/jquery-ui.js");
      document.head.appendChild(jqueryUiScript);
      //
      // /Load dependencies
      //

      jqueryUiScript.onload = function () {
        $("#nav-bar-symbol-search .symbol-search-input")
          .autocomplete({
            source: function (request, response) {
              $.ajax({
                url: "https://api.nexthunch.io/api/v1/symbol_search?q=" + request.term,
                dataType: "json",
                success: function (res) {
                  let matchingCrypto = res.data.crypto.map((cryptoSymbolData) => ({
                    value: cryptoSymbolData.symbol,
                    label: cryptoSymbolData.name + " - " + cryptoSymbolData.symbol.toUpperCase(),
                    cg_id: cryptoSymbolData.cg_id,
                  }));

                  let matchingStocks = res.data.stocks.map((stockSymbolData) => ({
                    value: stockSymbolData.symbol,
                    label: stockSymbolData.displaySymbol + " - " + stockSymbolData.description,
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
                },
              });
            },
            minLength: 1,
            cacheLength: 0,
            autoFocus: true,
            select: function (event, ui) {
              window.location = "/quote?symbol=" + ui.item.value + (ui.item.cg_id ? "&cg_id=" + ui.item.cg_id : "");
            }, //do something with the selected option. refer to jquery ui autocomplete docs for more info
          })
          .attr("autocomplete", "off")
          .blur(function () {
            let keyEvent = $.Event("keydown");
            keyEvent.keyCode = $.ui.keyCode.ENTER;
            $(this).trigger(keyEvent);
          });

        $("#symbol-search-submit-btn").on("click", function () {
          $("#symbol-search").data("uiAutocomplete")._trigger("select");
        });
      };
    },
  },
  getLeastLikedCryptos: {
    init: function () {
      $.ajax("https://api.nexthunch.io/api/v1/least_liked_cryptos")
        .done(function (res) {
          const firstSix = res.slice(0, 6);
          console.log(firstSix);
          firstSix.forEach((asset, i) => {
            const $squareContainer = $(".trend-grid.least-liked .trend-asset-square:nth-child(" + (i + 1) + ")");
            const cryptoSymbol = asset.base_currency.toLowerCase();
            console.log(cryptoSymbol);
            $squareContainer
              .find(".asset-icon")
              .append('<img class="asset-icon-img" src="https://cryptoicons.org/api/icon/' + cryptoSymbol + '/50">');
            $squareContainer.find(".asset-name").append(asset.name);
            $squareContainer.find(".asset-price").append(asset.close_price);
            $squareContainer.find(".asset-p-change").append(asset.change_in_price_24_hr);
          });
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR);
          console.log(textStatus);
          console.log(errorThrown);
        })
        .always(function () {});
    },
  },
  datePicker: {
    // Not in use atm
    init: function () {
      const linkTag = document.createElement("link");
      linkTag.setAttribute("href", "https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css");
      linkTag.setAttribute("rel", "stylesheet");
      document.head.appendChild(linkTag);

      const loadScript = nhLib.loadScript("https://cdn.jsdelivr.net/npm/flatpickr");

      loadScript.then(() => {
        const Webflow = Webflow || [];
        Webflow.push(function () {
          document.getElementsByClassName("date").flatpickr({
            dateFormat: "F d, Y",
          });
        });
      });
    },
  },
};

//
// Init following scripts on all pages
//
nhLib.symbolSearchBar.init();

//
// Run the scripts on relevant pages
//
if (window.location.pathname === "/quote") nhLib.quotePage.init();
