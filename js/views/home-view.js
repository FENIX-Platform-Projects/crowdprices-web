/*global define, _:false, $, console, amplify, FM, THREE*/
define([
    'loglevel',
    'jquery',
    'views/base/view',
    'fx-filter/start',
    'config/config',
    'config/events',
    'config/country2table',
    'config/charts',
    'config/tables',
    'config/submodules/fx-filter/config',
    'text!templates/home/template.hbs',
    'i18n!nls/labels',
    'fx-common/WDSClient',
    'config/queries',
    'handlebars',
    'fx-common/utils',
    'moment',
    'leaflet',
    'highstock',
    'bootstrap-table',
    'amplify'
], function (log, $, View, Filter, C, EVT, Country2Table, ChartsConfig, TablesConfig, Items, template, i18nLabels, WDSClient, Q, Handlebars, Utils, Moment, L) {

    'use strict';

    var s = {
        FILTER: "#selectors-el",
        DOWNLOAD_BTN: "#download-btn",
        TABLE_DAILY_DATA: "#table-daily-data",
        TABLE_AGGREGATED_DATA: "#table-aggregated-data",
        CHART_DAILY_PRICES: "#chart-daily-prices",
        CHART_AVERAGE_PRICES: "#chart-average-prices",
    };

    var HomeView = View.extend({

        autoRender: true,

        className: 'home',

        template: template,

        getTemplateData: function () {
            return i18nLabels;
        },

        _initVariables: function () {

            var initialCountry = Items.countries.selector.default[0];

            log.info("Initial country code: " + initialCountry);

            if (!initialCountry) {
                alert("impossible to find default country. Please specify it in config/submodules/fx-filter/config.js");
                return;
            }

            this.current = {};

            //Codelists
            this.cachedResources = {};

            this.codelists = {
                countries: Q.countries,
                markets: this._compile({
                    source: Q.markets,
                    context: {country: initialCountry}
                }),
                commodities: this._compile({
                    source: Q.commodities,
                    context: {country: initialCountry}
                })
            };

            log.info("Initial resource queries");
            log.info(JSON.stringify(this.codelists));

            //download

            this.$downloadBtn = this.$el.find(s.DOWNLOAD_BTN);

            //charts

            this.$chartDailyPrices = this.$el.find(s.CHART_DAILY_PRICES);
            this.$chartAveragePrices = this.$el.find(s.CHART_AVERAGE_PRICES);

            //tables

            this.$tableDailyData = this.$el.find(s.TABLE_DAILY_DATA);
            this.$tableAggregatedData = this.$el.find(s.TABLE_AGGREGATED_DATA);


            log.info("variable initialized successfully");

        },

        _initComponents: function () {

            this.WDSClient = new WDSClient({
                serviceUrl: C.WDS_URL,
                datasource: C.DB_NAME,
                outputType: C.WDS_OUTPUT_TYPE
            });

        },

        _bindEventListeners: function () {

            this.$downloadBtn.on("click", _.bind(this._onDownloadClick, this))

        },

        // handlers

        _onDownloadClick: function () {

            if (this.ready !== true) {
                return;
            }

            var values = this.current.values,
                country = Utils.getNestedProperty("values.countries", values)[0],
                commodities = Utils.getNestedProperty("values.commodities", values),
                time = Utils.getNestedProperty("values.time", values),
                from = _.findWhere(time, {parent: 'from'}).value,
                to = _.findWhere(time, {parent: 'to'}).value,
                markets = Utils.getNestedProperty("values.markets", values);

            var body = {
                country: country,
                markets: markets,
                commodities: commodities,
                from: from,
                to: to
            };

            console.log(body);

            $.ajax({
                type: 'POST',
                url: C.downloadUrl,
                contentType: "application/json",
                data: JSON.stringify(body),
                dataType: 'json'
            });

        },

        // start

        attach: function () {

            log.info("view attached");

            View.prototype.attach.call(this, arguments);

            //update State
            amplify.publish(EVT.stateChange, {menu: 'home'});

            this._initVariables();

            this._initComponents();

            this._bindEventListeners();

            this._preloadResources();

        },

        _onPreloadResourceError: function (e) {
            alert("Impossible to retrieve initial resources");
            log.error(e)
        },

        _preloadResources: function () {

            _.each(this.codelists, _.bind(function (query, cd) {

                this._retrieveResource({
                    query: query,
                    success: _.bind(this._onPreloadResourceSuccess, this, cd),
                    error: _.bind(this._onPreloadResourceError, this)
                });

            }, this));
        },

        _onPreloadResourceSuccess: function (id, response) {

            this.cachedResources[id] = response;

            if (Object.keys(this.cachedResources).length === Object.keys(this.codelists).length) {

                this.ready = true;

                this._onResourcesReady();
            }
        },

        _onResourcesReady: function () {

            var self = this;

            this.filterItems = addCommoditiesCountriesMarketsModelsToFilter();

            this._preloadTimeRange();

            function addCommoditiesCountriesMarketsModelsToFilter() {

                var commodities = self.cachedResources["commodities"] || [],
                    countries = self.cachedResources["countries"] || [],
                    markets = self.cachedResources["markets"] || [],
                    items = $.extend(true, {}, Items);

                // commodities
                if (commodities.length > 1) {
                    commodities.shift();
                }
                Utils.assign(items, "commodities.selector.source", commodities);

                // countries
                if (countries.length > 1) {
                    countries.shift();
                }
                Utils.assign(items, "countries.selector.source", countries);

                // markets
                if (markets.length > 1) {
                    markets.shift();
                }
                Utils.assign(items, "markets.selector.source", markets);
                Utils.assign(items, "markets.selector.default", _.map(markets, function (m) {
                    return m.value;
                }));

                return items;

            }

        },

        _preloadTimeRangeError: function (e) {
            alert("Impossible to retrieve time range");
        },

        _preloadTimeRange: function () {

            var country = Utils.getNestedProperty("countries.selector.default", this.filterItems)[0],
                commodities = Utils.getNestedProperty("commodities.selector.default", this.filterItems),
                markets = Utils.getNestedProperty("markets.selector.default", this.filterItems),
                query = this._compile({
                    source: Q.time,
                    context: {
                        table: Country2Table["country_" + country],
                        country: country,
                        commodities: _.compact(commodities).join("','"),
                        markets: _.compact(markets).join("','")
                    }
                });

            this._retrieveResource({
                query: query,
                success: _.bind(this._preloadTimeRangeSuccess, this),
                error: _.bind(this._preloadTimeRangeError, this)
            });

        },

        _preloadTimeRangeSuccess: function (response) {

            response.shift();

            var range = response[0] || {},
                from = range.from || C.from,
                to = range.to || new Date();

            Utils.assign(this.filterItems, "time.selector.config.min", Moment(from).format("X"));
            Utils.assign(this.filterItems, "time.selector.config.max", Moment(to).format("X"));
            Utils.assign(this.filterItems, "time.selector.config.prettify", function (num) {
                return Moment(num, "X").format(C.format);
            });

            this._initFilter();

        },

        _initFilter: function () {

            this.filter = new Filter({
                el: s.FILTER,
                items: this.filterItems
            }).on("ready", _.bind(this._onFilterReady, this));

        },

        _onFilterReady: function () {

            this.current.values = this.filter.getValues();

            this._buildUI();

        },

        // UI

        _unlock: function () {
            this.$downloadBtn.attr("disabled", false);
        },

        _updateStatistics : function () {},

        _buildUI: function () {

            this._unlock();

            this.ready = true;

            //this._updateStatistics();

            //this._updateMap();

            //this._updateCharts();

            this._updateTables();

        },

        // Map

        _updateMap: function () {

            if (this.markers != null) {
                this.markers.clearLayers();
            }

            if (this.commodityMaps != "") {

                this._retrieveResource({
                    query: map,
                    success: _.bind(this._onUpdateMapSuccess, this),
                    error: _.bind(this._onUpdateMapError, this)
                });

            }

        },

        _onUpdateMapError: function () {
            alert("Impossible to updateMap()")
        },

        _onUpdateMapSuccess: function (data) {

            var desatIcon = L.icon({
                iconUrl: 'img/marker-icon-none.png',
                shadowUrl: 'img/marker-shadow.png',
                iconSize: L.point(28, 28),
                iconAnchor: L.point(28, 28),
                popupAnchor: L.point(-14, -14)
            });

            var desatIconBig = L.icon({
                iconUrl: 'img/marker-icon-none-big.png',
                shadowUrl: 'img/marker-shadow.png',
                iconSize: L.point(109, 109),
                iconAnchor: L.point(109, 109),
                popupAnchor: L.point(-54, -54)
            });

            var foundIcon = L.icon({
                iconUrl: 'img/marker-icon.png',
                shadowUrl: 'img/marker-shadow.png',
                iconSize: L.point(109, 109),
                iconAnchor: L.point(70, 70),
                popupAnchor: L.point(-14, -14)
            });

            var self = this,
                addressPoints = [],
                marketcode = [],
                vendors = [],
                address = 0,
                response = _.rest(data);

            var Cresponse = _.groupBy(response, 'marketcode'),
                globalMarkets = Utils.getNestedProperty("values.markets", this.current.values);

            //console.log(globalMarkets)
            return;
            $.each(globalMarkets, function (k, v) {

                if (!v[0]) {
                    L.marker([v.lat, v.lon], {
                        icon: desatIcon
                    })
                        .bindPopup('<div class="notValued">' + v.name + ' </div>')
                        .on('mouseover', function (e) {
                            e.target.openPopup();
                        })
                        .addTo(emptyMarketLayer);
                }

                v = _.extend(v, Cresponse[v.code]);

                var avgS = "",
                    hasData = v[0] && _.has(v[0], 'avg');

                if (hasData) {
                    avgS = "<br>" + parseFloat(v[0].avg).toFixed(2) + currency + "\/" + munit;
                }

                vendors.push(v.name);
                marketcode.push(v.code);

                if (Cresponse[v.code]) {

                    addressPoints.push([
                        v.lat,
                        v.lon,
                        v.name + avgS,
                        hasData
                    ]);
                }

                address++;
            });

            refreshCluster(addressPoints);

            function refreshCluster(addressPoints) {

                var existingPoints = [],
                    latlngs = [];

                for (var i = 0; i < addressPoints.length; i++) {

                    var point = addressPoints[i];

                    var title = point[2],
                        hasData = point[3],
                        loc = new L.LatLng(point[0], point[1]);

                    existingPoints.push([
                        loc,
                        title
                    ]);

                    var marker = L.marker(loc, {
                        icon: !!hasData ? foundIcon : desatIconBig
                    })
                        .bindPopup('<div class="' + (!hasData && 'notValued') + '">' + title + '</div>')
                        .on('mouseover', function (e) {
                            e.target.openPopup();
                        });

                    if (hasData) {
                        self.markers.addLayer(marker);
                        latlngs.push(loc);
                    }
                }

                if (latlngs.length > 0)
                    self.map.fitBounds(L.latLngBounds(latlngs).pad(0.2));
            }

        },

        // Charts

        _updateCharts: function () {

            this._retrieveResource({
                query: Q.charts,
                success: _.bind(this._updateChartsSuccess, this),
                error: _.bind(this._updateChartsError, this),
                outputType: 'array'
            });

        },

        _updateChartsError: function () {
            alert("Impossible to _updateChartsError()")
        },

        _buildChartsSeries: function (response) {

            var self = this,
                data = _.rest(response),
                averagedata = [],
                resultdata = [],
                aggregated = 0,
                seriesOptions1 = [],
                seriesOptions2 = [],
                j = 0;

            if (data.length === 0) {
                alert("Chart data is empty");
                return;
            }

            _.each(data, function (d) {
                var tmpArray = new Array(2);
                //tmpArray[0] = new Date(this.fulldate).getTime();
                var str = d[11];
                str = str.substring(0, str.length - 2);
                str = str.replace(/-/g, "/");
                var dateObject = new Date(str);
                tmpArray[0] = dateObject.getTime();
                tmpArray[1] = parseFloat(d[8]) / parseFloat(d[9]);
                tmpArray[2] = d[14];
                tmpArray[3] = d[19];

                resultdata.push(tmpArray);
                j++;
                aggregated = aggregated + parseFloat(d[8]);
            });

            //TODO
            //startDate = data[0][11];
            //endDate = data[j - 1][11];

            var temArray = new Array(1);

            temArray[1] = ( aggregated / j );

            if (temArray[1] > 1)
                averagedata.push(temArray);

            var resultdataGmark = _.groupBy(resultdata, function (v) {
                return v[2];//market name
            });

            var resultdataGComm = _.groupBy(resultdata, function (v) {
                return v[3];//commodity name
            });

            var markets = _.keys(resultdataGmark),
                comodities = _.keys(resultdataGComm);

            _.each(comodities, function (comId) {

                _.each(markets, function (marketName) {

                    var m = _.filter(resultdata, function (v) {
                        return v[2] === marketName && v[3] === parseInt(comId);

                    });//resultdataGmark[marketname];

                    if (m.length > 0) {

                        var commodity = Utils.getNestedProperty("labels.commodities", self.current.values)[comId],
                            label = +' @ ' + m[0][2];
                        var data = m.map(function (i) {
                            return [i[0], i[1]]
                        });

                        seriesOptions1.push({
                            name: label,
                            data: data
                        });

                        var sum = 0,
                            avgs = [];

                        _.map(data, function (val) {
                            sum += val[1]
                        });

                        avgs.push(sum / data.length);

                        seriesOptions2.push({	//highchart
                            name: "Avg: " + label,
                            data: avgs,
                            type: 'column'
                        });
                    }

                });
            });

            return {
                dailyPrices: seriesOptions1,
                averagePrices: seriesOptions2
            }

        },

        _updateChartsSuccess: function (response) {

            var series = this._buildChartsSeries(response),
                dailyPricesSeries = series.dailyPrices,
                averagePricesSeries = series.averagePrices;

            this.$chartDailyPrices.highcharts('StockChart', $.extend(true, {}, ChartsConfig.dailyPrices, {series: dailyPricesSeries}));

            this.$chartAveragePrices.highcharts($.extend(true, {}, ChartsConfig.averagePrices, {series: averagePricesSeries}));

        },

        //Tables

        _updateTables: function () {

            this._updateDailyDataTable();

            this._updateAggregatedDataTable();
        },

        _updateDailyDataTableError: function (e) {
            alert("Impossible to _updateDailyDataTableError()");
            log.error(e);
        },

        _updateDailyDataTable: function () {

            this._retrieveResource({
                query: Q.tableDailyData,
                success: _.bind(this._updateDailyDataTableSuccess, this),
                error: _.bind(this._updateDailyDataTableError, this)
            });
        },

        _updateDailyDataTableSuccess: function (response) {

        },

        _updateAggregatedDataTable: function () {

            this._retrieveResource({
                query: Q.tableAggregatedData,
                success: _.bind(this._updateAggregatedDataTableSuccess, this),
                error: _.bind(this._updateAggregatedDataTableError, this)
            });
        },

        _updateAggregatedDataTableError: function (e) {
            alert("Impossible to _updateAggregatedDataTableError()");
            log.error(e);
        },

        _updateAggregatedDataTableSuccess: function (d ) {

            console.log(d)

            var response = _.rest(d);
            var data = [];

            _.each(response, function (element) {

                data.push({
                    gaul0code: element["gaul0code"],
                    vendorname: element["vendorname"],
                    citycode: element["citycode"],
                    code: parseInt(element["code"]),
                    price: parseFloat(element["price"]),
                    fulldate: element["fulldate"],
                    cityname: element["cityname"],
                    commodityname: element["commodityname"],
                    commoditycode: element["commoditycode"],
                    marketname: element["marketname"],
                    marketcode: element["marketcode"],
                    quantity: parseFloat(element["quantity"]),
                    userid: element["userid"],
                    min: element["min"],
                    max: element["max"],
                    avg: element["avg"]
                });
            });

/*            if (tableIsInitAgg) {
                //	console.log("!updateTableAgg");
                $table.bootstrapTable('removeAll');
                $table.bootstrapTable('append', output.table);
            } else {*/
                this.$tableAggregatedData.bootstrapTable($.extend(true, {}, TablesConfig.aggregatedData, { data: data }));
/*
            }*/

        },

        // disposition

        _unbindEventListeners: function () {

        },

        dispose: function () {

            this._unbindEventListeners();

            View.prototype.dispose.call(this, arguments);
        },

        // commons

        _retrieveResource: function (obj) {

            var values = this.filter ? this.filter.getValues() : {},
                countries = Utils.getNestedProperty("values.countries", values),
                country = Array.isArray(countries) ? countries[0] : "",
                markets = Utils.getNestedProperty("values.markets", values),
                anyMarkets = _.reduce(markets, function(memo, num){ return memo + "," + num; }, ""),
                commodities = Utils.getNestedProperty("values.commodities", values),
                anyCommodities = _.reduce(commodities, function(memo, num){ return memo + "," + num; }, ""),
                time = Utils.getNestedProperty("values.time", values),
                fromValue = _.findWhere(time, {parent: 'from'}) ? _.findWhere(time, {parent: 'from'}).value : null,
                toValue = _.findWhere(time, {parent: 'to'}) ? _.findWhere(time, {parent: 'to'}).value : null,
                from = Moment.unix(fromValue).format("YYYY-MM-DD"),
                to = Moment.unix(toValue).format("YYYY-MM-DD"),
                query = this._compile({
                    source: obj.query,
                    context: {
                        table: Country2Table["country_" + country],
                        country: country,
                        markets: _.compact(markets).join("','"),
                        commodities: _.compact(commodities).join("','"),
                        from: from,
                        to: to,
                        anyCommodities : anyCommodities.substring(1),
                        anyMarkets : anyMarkets.substring(1)
                    }
                });

            console.log(anyMarkets)

            //Check if resource is cached otherwise retrieve
            var stored = amplify.store.sessionStorage(query);

            if (C.cache === true && stored) {

                obj.success(query, stored);

            } else {

                console.log(query)

                this.WDSClient.retrieve({
                    payload: {query: query},
                    outputType : obj.outputType || "object",
                    success: function (response) {
                        amplify.store.sessionStorage(query, response);
                        obj.success(response)
                    },
                    error: obj.error
                });
            }
        },

        _compile: function (obj) {

            var template = Handlebars.compile(obj.source);
            return template(obj.context);
        }

    });

    return HomeView;
});
