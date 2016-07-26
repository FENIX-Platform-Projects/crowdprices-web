/*global define, _:false, $, console, amplify, FM, THREE*/
define([
    'jquery',
    'views/base/view',
    'fx-filter/start',
    'config/config',
    'config/events',
    'config/country2table',
    'config/submodules/fx-filter/config',
    'text!templates/home/template.hbs',
    'i18n!nls/labels',
    'fx-common/WDSClient',
    'config/queries',
    'handlebars',
    'fx-common/utils',
    'moment',
    'leaflet',
    'amplify'
], function ($, View, Filter, C, EVT, Country2Table, Items, template, i18nLabels, WDSClient, Q, Handlebars, Utils, Moment, L) {

    'use strict';

    var s = {
        FILTER: "#selectors-el",
        DOWNLOAD_BTN: "#download-btn",
        TABLE_DAILY_DATA : "#tableDaily"
    };

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

    var HomeView = View.extend({

        autoRender: true,

        className: 'home',

        template: template,

        getTemplateData: function () {
            return i18nLabels;
        },

        attach: function () {

            View.prototype.attach.call(this, arguments);

            //update State
            amplify.publish(EVT.stateChange, {menu: 'home'});

            this._initVariables();

            this._initComponents();

            this._bindEventListeners();

            this._preloadResources();

        },

        _initComponents: function () {

            this.WDSClient = new WDSClient({
                serviceUrl: C.WDS_URL,
                datasource: C.DB_NAME,
                outputType: C.WDS_OUTPUT_TYPE
            });

        },

        _initVariables: function () {

            var initialCountry = Items.countries.selector.default[0];

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

            this.$downloadBtn = this.$el.find(s.DOWNLOAD_BTN);

            this.$tableDailyData = this.$el.find(s.TABLE_DAILY_DATA);

        },

        _compile: function (obj) {

            var template = Handlebars.compile(obj.source);
            return template(obj.context);
        },

        _bindEventListeners: function () {

            this.$downloadBtn.on("click", _.bind(this._onDownloadClick, this))

        },

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

            var body ={
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
                dataType:'json'
            })

        },

        _retrieveResource: function (obj) {

            //Check if codelist is cached otherwise retrieve
            var query = obj.query,
                stored = amplify.store.sessionStorage(query);

            if (stored === undefined || stored.length < 2) {

                this.WDSClient.retrieve({
                    payload: {query: query},
                    success: obj.success,
                    error: obj.error
                });

            } else {
                obj.success(query, stored);
            }

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

        _onPreloadResourceError: function (e) {
            alert("Impossible to retrieve initial resources");
        },

        _onPreloadResourceSuccess: function (cd, response) {

            amplify.store.sessionStorage(cd, response);

            this._onResourceCached(cd, response);
        },

        _onResourceCached: function (cl, resource) {

            this.cachedResources[cl] = resource;

            if (Object.keys(this.cachedResources).length === Object.keys(this.codelists).length) {

                this.ready = true;

                this._onResourcesReady();
            }
        },

        _onResourcesReady: function () {

            this.filterItems = this._addCommoditiesCountriesMarketsModelsToFilter();

            this._preloadTime();

        },

        _addCommoditiesCountriesMarketsModelsToFilter: function () {

            var commodities = amplify.store.sessionStorage("commodities") || [],
                countries = amplify.store.sessionStorage("countries") || [],
                markets = amplify.store.sessionStorage("markets") || [],
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

        },

        _preloadTime: function () {

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
                success: _.bind(this._preloadTimeSuccess, this),
                error: _.bind(this._preloadTimeError, this)
            });

        },

        _preloadTimeError: function (e) {
            alert("Impossible to retrieve time range");
        },

        _preloadTimeSuccess: function (response) {

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

            this._buildUI();

        },

        // UI

        _unlock: function () {
            this.$downloadBtn.attr("disabled", false);
        },

        _buildUI: function () {

            this.current.values = this.filter.getValues();

            this._unlock();

            this.ready = true;

            //this._updateMap();

            //this._updateCharts();

            this._updateTables()

        },

        // Map

        _updateMap: function () {

            if (this.markers != null) {
                this.markers.clearLayers();
            }

            if (this.commodityMaps != "") {

                var values = this.current.values,
                    country = Utils.getNestedProperty("values.countries", values)[0],
                    time = Utils.getNestedProperty("values.time", values),
                    markets = Utils.getNestedProperty("values.markets", values),
                    query = this._compile({
                        source: Q.map,
                        context: {
                            table: Country2Table["country_" + country],
                            from: Moment.unix(_.findWhere(time, {parent: 'from'}).value).format("YYYY-MM-DD"),
                            to: Moment.unix(_.findWhere(time, {parent: 'to'}).value).format("YYYY-MM-DD"),
                            markets: _.compact(markets).join("','")
                        }
                    });

                this._retrieveResource({
                    query: query,
                    success: _.bind(this._onUpdateMapSuccess, this),
                    error: _.bind(this._onUpdateMapError, this)
                });

            }

        },

        _onUpdateMapError: function () {
            alert("Impossible to updateMap()")
        },

        _onUpdateMapSuccess: function (data) {

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

            var values = this.current.values,
                country = Utils.getNestedProperty("values.countries", values)[0],
                markets = Utils.getNestedProperty("values.markets", values),
                commodities = Utils.getNestedProperty("values.commodities", values),
                query = this._compile({
                    source: Q.charts,
                    context: {
                        table: Country2Table["country_" + country],
                        country: country,
                        markets: _.compact(markets).join("','"),
                        commodities: _.compact(commodities).join("','")

                    }
                });

            this._retrieveResource({
                query: query,
                success: _.bind(this._updateChartsSuccess, this),
                error: _.bind(this._updateChartsError, this)
            });

            return;
            /*



             var seriesOptions1 = [],
             seriesOptions2 = [],
             seriesOptions3 = [],
             seriesCounter = 0,
             createChart1 = function (item) {
             item.highcharts('StockChart'); // add series: seriesOptions1
             //	console.log(seriesOptions1)
             },
             createChart2 = function (item) {

             item.highcharts(); // series: seriesOptions2


             }
             var index = -1;
             var commodityALL = "";
             var indexName = allMarketName.length;

             //	$.each(checkedMarkets, function(h,marketcode){
             //		indexName--;
             //console.log("allMarketName: "+allMarketName[indexName]);
             var table = countries_tables[nations].table,
             sQuery = "SELECT id, gaul0code, citycode, marketcode, " +
             "munitcode, currencycode, commoditycode, varietycode, price, " +
             "quantity, untouchedprice, fulldate, note, userid, vendorname, vendorcode, lat, lon, commodity.name, commodity.code " +
             "FROM " + table + " , commodity " +
             "WHERE gaul0code = '" + nations.toString() + "' " +
             " AND marketcode IN ('" + _.compact(checkedMarkets).join("','") + "') " +
             " AND commoditycode IN ('" + _.compact(commodityItem).join("','") + "') " +
             " AND commoditycode::int = commodity.code ";

             if (filterPolygonWKT)
             sQuery += " AND ST_contains(ST_GeomFromText('" + filterPolygonWKT + "',4326),geo)";

             sQuery = sQuery + " ORDER BY commoditycode, marketcode, fulldate";

             //console.log ("sQuery: "+sQuery);

             $.ajax({
             type: 'GET',
             url: WDSURI,
             data: {
             payload: '{"query": "' + sQuery + '"}',
             datasource: DATASOURCE,
             outputType: 'array'
             },

             success: function (response) {

             //console.log(response);

             //var data = JSON.parse(response);
             var data = _.rest(response),
             averagedata = [],
             resultdata = [],
             aggregated = 0,
             j = 0;

             if (data.length === 0)
             return;

             $.each(data, function () {
             tmpArray = new Array(2)
             //tmpArray[0] = new Date(this.fulldate).getTime();
             var str = this[11];
             str = str.substring(0, str.length - 2);
             str = str.replace(/-/g, "/");
             var dateObject = new Date(str);
             tmpArray[0] = dateObject.getTime();
             tmpArray[1] = parseFloat(this[8]) / parseFloat(this[9]);
             tmpArray[2] = this[14];
             tmpArray[3] = this[19];

             resultdata.push(tmpArray);
             j++;
             aggregated = aggregated + parseFloat(this[8]);
             });

             startDate = data[0][11];
             endDate = data[j - 1][11];

             temArray = new Array(1);
             //temArray[0] = new Date().getTime();
             temArray[1] = ( aggregated / j );

             if (temArray[1] > 1)
             averagedata.push(temArray);

             var resultdataGmark = _.groupBy(resultdata, function (v) {
             return v[2];//market name
             });

             var resultdataGComm = _.groupBy(resultdata, function (v) {
             return v[3];//commodity name
             });

             //console.log('resultdata', resultdata)

             var markets = _.keys(resultdataGmark),
             comodities = _.keys(resultdataGComm);

             var res = [];
             _.each(comodities, function (comId) {
             //var c = resultdataGComm[marketname];

             _.each(markets, function (marketName) {

             var m = _.filter(resultdata, function (v) {


             //console.log(typeof marketName, typeof comId, v);

             return v[2] === marketName && v[3] === parseInt(comId);

             });//resultdataGmark[marketname];

             if (m.length > 0) {

             var label = commodityNameIndexed[comId] + ' @ ' + m[0][2];
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

             },
             error: function (a) {
             console.log("KO:" + a.responseText);
             return null;
             }
             });

             //	});


             $(document).ajaxStop(function () {
             createChart1($('#hi-stock1'));
             createChart2($('#hi-stock2'));
             if (!isInit) initSlider();
             });*/
        },

        _updateChartsError: function () {
            alert("Impossible to _updateChartsError()")
        },

        _updateChartsSuccess: function (response) {

            var data = _.rest(response),
                averagedata = [],
                resultdata = [],
                aggregated = 0,
                seriesOptions1 = [],
                seriesOptions2 = [],
                j = 0;

            if (data.length === 0) {
                return;
            }

            $.each(data, function (index, d) {

                var tmpArray = new Array(2);
                //tmpArray[0] = new Date(this.fulldate).getTime();
                var str = d[11];
                console.log(str)
                str = str.substring(0, str.length - 2);
                str = str.replace(/-/g, "/");
                var dateObject = new Date(str);
                tmpArray[0] = dateObject.getTime();
                tmpArray[1] = parseFloat(this[8]) / parseFloat(this[9]);
                tmpArray[2] = this[14];
                tmpArray[3] = this[19];

                resultdata.push(tmpArray);
                j++;
                aggregated = aggregated + parseFloat(this[8]);
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

                        var commodity = Utils.getNestedProperty("labels.commodities", this.current.values)[comId],
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

        },

        //Tables

        _updateTables : function () {

            this._updateDailyDataTable();

            this._updateAggregatedDataTable();
        },

        _updateDailyDataTable : function () {

            var values = this.current.values,
                country = Utils.getNestedProperty("values.countries", values)[0],
                time = Utils.getNestedProperty("values.time", values),
                markets = Utils.getNestedProperty("values.markets", values),
                query = this._compile({
                source: Q.tableDailyData,
                context: {
                    table: Country2Table["country_" + country],
                    from: Moment.unix(_.findWhere(time, {parent: 'from'}).value).format("YYYY-MM-DD"),
                    to: Moment.unix(_.findWhere(time, {parent: 'to'}).value).format("YYYY-MM-DD"),
                }
            });

            console.log(query)

            this._retrieveResource({
                query: query,
                success: _.bind(this._updateDailyDataTableSuccess, this),
                error: _.bind(this._updateDailyDataTableError, this)
            });


/*

            var $table = $('#tableDaily');

            var allDatas = [];

            var table = countries_tables[nations].table,
                qString = "SELECT " + table + ".gaul0code, " + table + ".vendorname as vendorname, " + table + ".citycode, city.code, " + table + ".price, " + table + ".fulldate, city.name as cityname, commodity.code, commodity.name as commodityname, " + table + ".commoditycode, market.code, market.name as marketname, " + table + ".marketcode, " + table + ".quantity, " + table + ".userid " +
                    "FROM " + table + ", city, commodity, market " +
                    "WHERE " + table + ".citycode = city.code " +
                    " AND CAST (" + table + ".commoditycode as INT) = commodity.code " +
                    " AND " + table + ".gaul0code = '" + nations.toString() + "' " +
                    " AND commodity.code = ANY('{" + commodityItem.toString() + "}') " +
                    " AND " + table + ".marketcode = ANY('{" + _.compact(checkedMarkets).join(",").toString() + "}') " +
                    " AND CAST(" + table + ".marketcode AS INT) = market.code";

            if ((startDate !== undefined) && (endDate !== undefined)) qString = qString + " AND date>='" + startDate + "' AND date<= '" + endDate + "'";
            //qString = qString + "limit 100";
            qString = qString + " ORDER BY " + table + ".fulldate DESC ";



            $.ajax({
                type: 'GET',
                url: WDSURI,
                data: {
                    payload: '{"query": "' + qString + '"}',
                    datasource: DATASOURCE,
                    outputType: 'object'
                },

                success: function (response) {
                    response = _.rest(response);
                    var output = {
                        table: []
                    };

                    $.each(response, function (index, element) {

                        output.table.push({
                            "gaul0code": element["gaul0code"],
                            "vendorname": element["vendorname"],
                            "citycode": element["citycode"],
                            "code": parseInt(element["code"]),
                            "price": parseFloat(element["price"]),
                            "fulldate": element["fulldate"],
                            "cityname": element["cityname"],
                            //	"code": element["code"],
                            "commodityname": element["commodityname"],
                            "commoditycode": element["commoditycode"],
                            "code": element["code"],
                            "marketname": element["marketname"],
                            "marketcode": element["marketcode"],
                            "quantity": parseFloat(element["quantity"]),
                            "userid": element["userid"]
                        });
                    });

                    if (tableIsInit) {
                        $table.bootstrapTable('removeAll');
                        $table.bootstrapTable('append', output.table);
                    } else {
                        $table.bootstrapTable({
                            columns: [{
                                field: 'cityname',
                                title: 'City',
                                sortable: true,
                                searchable: true
                            }, {
                                field: 'marketname',
                                title: 'Market',
                                sortable: true,
                                searchable: true
                            }, {
                                field: 'vendorname',
                                title: 'Vendor',
                                sortable: true,
                                searchable: true
                            }, {
                                field: 'commodityname',
                                title: 'Commodity',
                                sortable: true,
                                searchable: true
                            }, {
                                field: 'price',
                                title: 'Price (' + currency + ')',
                                sortable: true
                            }, {
                                field: 'quantity',
                                title: 'Quantity (' + munit + ')',
                                sortable: true
                            }, {
                                field: 'fulldate',
                                title: 'Date',
                                sortable: true,
                                searchable: true
                            }, {
                                field: 'userid',
                                title: 'User',
                                sortable: true,
                                searchable: true
                            }],
                            data: output.table,
                            pagination: true,
                            search: true,
                            sortable: true

                        });

                        tableIsInit = true;

                        $("#tblExportCSV").on("click", function () {
                            $table.bootstrapTable('togglePagination');
                            $table.tableExport({type: 'csv'});
                            $table.bootstrapTable('togglePagination');
                        });
                        $("#tblExportXLS").on("click", function () {
                            $table.bootstrapTable('togglePagination');
                            $table.tableExport({type: 'xls'});
                            $table.bootstrapTable('togglePagination');
                        });
                        $("#tblExportJSON").on("click", function () {
                            $table.bootstrapTable('togglePagination');
                            $table.tableExport({type: 'json'});
                            $table.bootstrapTable('togglePagination');
                        });
                    }
                },
                error: function (a) {
                    console.log("KO:" + a.responseText);
                }
            });*/

        },

        _updateDailyDataTableError: function () {
            alert("Impossible to _updateDailyDataTableError()")
        },

        _updateDailyDataTableSuccess: function (response) {

            console.log(response)
        },

        _updateAggregatedDataTable : function () {},

        // disposition

        _unbindEventListeners: function () {

        },

        dispose: function () {

            this._unbindEventListeners();

            View.prototype.dispose.call(this, arguments);
        }

    });

    return HomeView;
});
