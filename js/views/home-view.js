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
    'leaflet.geosearch.google',
    'leaflet.markercluster',
    'leaflet.draw',
    'highstock',
    'highstock.no-data',
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
        TABLE_DOWNLOAD_BUTTONS: "[data-download]",
        NO_DATA_ALERT: "#no-data-alert"
    };

/*    var desatIcon = L.icon({
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
    });*/

    var desatIcon = L.divIcon({
        className: 'marker-desat-icon',
        html: '<div><span><span></div>'
    });

    var desatIconBig = L.divIcon({
        className: 'marker-desat-icon',
        html: '<div><span><span></div>'
    });
    var foundIcon = L.divIcon({
        className: 'marker-found-icon',
        html: '<div><span><span></div>'
    });

    var HomeView = View.extend({

        autoRender: true,

        className: 'home',

        template: template,

        getTemplateData: function () {
            return i18nLabels;
        },

        _resetCachedResources: function (country) {

            //Codelists
            this.cachedResources = {};

            this.codelists = {
                countries: Q.countries,
                markets: this._compile({
                    source: Q.markets,
                    context: {country: country}
                }),
                commodities: this._compile({
                    source: Q.commodities,
                    context: {country: country}
                }),
                map: this._compile({
                    source: Q.mapInit,
                    context: {country: country}
                })
            };

            log.info("Resources reset");
            log.info(JSON.stringify(this.codelists));

        },

        _initVariables: function () {

            var initialCountry = C.country;

            log.info("Initial country code: " + initialCountry);

            if (!initialCountry) {
                alert("impossible to find default country. Please specify it in config/config.js");
                log.error("impossible to find default country. Please specify it in config/config.js");
                return;
            }

            this.current = {};

            //data download

            this.$downloadBtn = this.$el.find(s.DOWNLOAD_BTN);

            //charts

            this.$chartDailyPrices = this.$el.find(s.CHART_DAILY_PRICES);
            this.$chartAveragePrices = this.$el.find(s.CHART_AVERAGE_PRICES);

            //tables

            this.$tableDailyData = this.$el.find(s.TABLE_DAILY_DATA);
            this.$tableAggregatedData = this.$el.find(s.TABLE_AGGREGATED_DATA);

            this.$tableDownloadButtons = this.$el.find(s.TABLE_DOWNLOAD_BUTTONS);

            this.searchTimeout = false;

            this.$noDataAlert = this.$el.find(s.NO_DATA_ALERT);

            log.info("Variables initialized successfully");

        },

        _initComponents: function () {

            this.WDSClient = new WDSClient({
                serviceUrl: C.WDS_URL,
                datasource: C.DB_NAME,
                outputType: C.WDS_OUTPUT_TYPE
            });

            //hide no data alert
            this.$noDataAlert.hide();

        },

        _bindEventListeners: function () {

            this.$downloadBtn.on("click", _.bind(this._onDownloadClick, this))
        },

        // handlers

        _onDownloadClick: function () {

            if (this.ready !== true) {
                return;
            }

            var values = this.filter.getValues(),
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
                from: parseInt(from) * 1000,
                to: parseInt(to) * 1000
            };

            $.ajax({
                type: 'POST',
                url: C.downloadUrl,
                contentType: "application/json",
                data: JSON.stringify(body),
                dataType: 'json',
                success: _.bind(this._onDownloadSuccess, this),
                error: _.bind(this._onDownloadError, this)
            });

        },

        _onDownloadError: function (e) {
            alert("Impossible to download CSV file");
            log.error(e)
        },

        _onDownloadSuccess: function (csvContent) {

            var self = this;

            if (csvContent) {
                var encodedUri = encodeURI(csvContent);
                window.open(encodedUri);
            } else {
                this.$noDataAlert.show();

                self.$noDataAlert.fadeOut(3000, function () {
                    self.$noDataAlert.hide();
                })
            }
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

            this._buildUI(C.country);

        },

        _onPreloadResourceError: function (e) {
            alert("Impossible to retrieve initial resources");
            log.error(e)
        },

        _preloadResources: function (country) {

            this._resetCachedResources(country);

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

            this.filterConfig = addCommoditiesCountriesMarketsModelsToFilter();

            this._initMap();

            this._preloadTimeRange();

            function addCommoditiesCountriesMarketsModelsToFilter() {

                var commodities = self.cachedResources["commodities"] || [],
                    countries = self.cachedResources["countries"] || [],
                    markets = self.cachedResources["markets"] || [],
                    items = {};

                // commodities
                if (commodities.length > 1) {
                    commodities.shift();
                }
                Utils.assign(items, "commodities.source", commodities);

                // countries
                if (countries.length > 1) {
                    countries.shift();
                }
                Utils.assign(items, "countries.source", countries);
                Utils.assign(items, "countries.default", [C.country]);

                // markets
                if (markets.length > 1) {
                    markets.shift();
                }
                Utils.assign(items, "markets.source", markets);
                Utils.assign(items, "markets.default", _.map(markets, function (m) {
                    return m.value;
                }));

                return items;
            }

        },

        _preloadTimeRangeError: function (e) {
            alert("Impossible to retrieve time range");
        },

        _preloadTimeRange: function () {

            var country = Utils.getNestedProperty("countries.default", this.filterConfig)[0],
                commodities = Utils.getNestedProperty("commodities.default", this.filterConfig),
                markets = Utils.getNestedProperty("markets.default", this.filterConfig),
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

            Utils.assign(this.filterConfig, "time.min", Moment(from).format("X"));
            Utils.assign(this.filterConfig, "time.max", Moment(to).format("X"));
            Utils.assign(this.filterConfig, "time.prettify", function (num) {
                return Moment(num, "X").format(C.format);
            });

            this._initFilter();

        },

        _initFilter: function () {

            var self = this;

            if (this.filter) {

                var sources = buildFilterSources();

                this.filter.setSources(sources);

                var values = buildFilterDefaultValues();

                this.filter.setValues(values);

            } else {

                var items = buildFilterItems();

                this.filter = new Filter({
                    el: s.FILTER,
                    items: items
                })
                    .on("ready", _.bind(this._onFilterReady, this))
                    .on("change", _.bind(this._onFilterChange, this))

            }

            this._unlock();

            function buildFilterItems() {

                var items = $.extend(true, {}, Items),
                    conf = self.filterConfig;

                //commodities

                Utils.assign(items, "commodities.selector.source", Utils.getNestedProperty("commodities.source", conf));

                // countries

                Utils.assign(items, "countries.selector.source", Utils.getNestedProperty("countries.source", conf));
                Utils.assign(items, "countries.selector.default", Utils.getNestedProperty("countries.default", conf));

                // markets

                Utils.assign(items, "markets.selector.source", Utils.getNestedProperty("markets.source", conf));
                Utils.assign(items, "markets.selector.default", Utils.getNestedProperty("markets.default", conf));

                // time

                Utils.assign(items, "time.selector.config.min", Utils.getNestedProperty("time.min", conf));
                Utils.assign(items, "time.selector.config.max", Utils.getNestedProperty("time.max", conf));
                Utils.assign(items, "time.selector.config.prettify", Utils.getNestedProperty("time.prettify", conf));

                return items;
            }

            function buildFilterSources() {

                var sources = {},
                    conf = self.filterConfig;

                //commodities

                Utils.assign(sources, "commodities", Utils.getNestedProperty("commodities.source", conf));

                // markets

                Utils.assign(sources, "markets", Utils.getNestedProperty("markets.source", conf));

                // time

                var timeSource = [];

                timeSource.push({value: Utils.getNestedProperty("time.min", conf), parent: "from"});
                timeSource.push({value: Utils.getNestedProperty("time.min", conf), parent: "to"});

                Utils.assign(sources, "time", timeSource);

                return sources;
            }

            function buildFilterDefaultValues() {

                var values = {},
                    conf = self.filterConfig;

                // markets

                var c = Utils.getNestedProperty("markets.source", conf),
                    array = _.map(c, function (m) {
                        return m.value;
                    });

                Utils.assign(values, "values.markets", array);

                return values;
            }

        },

        _onFilterReady: function () {

            this.current.values = this.filter.getValues();

            this._buildVisualizationObjects();

        },

        _onFilterChange: function () {

            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
                log.info("Abort search timeout");
            }

            this.searchTimeout = window.setTimeout(_.bind(function () {
                this._refresh();
            }, this), C.refreshTimeoutInterval);

        },

        _refresh: function () {

            var values = this.filter.getValues(),
                counties = Utils.getNestedProperty("values.countries", values);

            if (_.isEqual(counties, Utils.getNestedProperty("values.countries", this.current.values))) {

                this._updateUI();

            } else {

                this._rebuildUi(counties[0]);
            }

            this.current.values = values;
        },

        _buildVisualizationObjects: function () {

            log.info("Build visualization objects");

            this._buildMap();

            this._buildCharts();

            this._buildTables();
        },

        _rebuildUi: function (country) {

            this._disposeUI();

            this._resetCachedResources(country);

            this._buildUI(country);

        },

        // UI

        _disposeUI: function () {

            this._lock();

            this._disposeCharts();

            this._disposeMap();

            this._disposeTables();
        },

        _lock: function () {
            this.$downloadBtn.attr("disabled", true);
        },

        _unlock: function () {
            this.$downloadBtn.attr("disabled", false);
        },

        _buildUI: function (country) {

            if (!country) {
                alert("Impossible to build UI. Please specify country.");
                return;
            }

            log.info("Build interface for country: " + country);

            this._lock();

            this._preloadResources(country);

        },

        _updateUI: function () {

            log.info("Update UI");

            this._updatedCharts();

            this._updateMap();
        },

        // Map

        _initMap: function () {

            this.mapMarkets = _.rest(this.cachedResources["map"]);

            log.info("map Markets", this.mapMarkets);

            var self = this,
                tiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
                    subdomains: 'abcd',
                    maxZoom: 19
                });

            this.map = L.map('map-cluster', {
                attributionControl: false,
                markerZoomAnimation: true,
                layers: [tiles],
                zoom: 9,
                maxZoom: 9,
                scrollWheelZoom: false
            });

            window.map = this.map;

            map.addControl(new L.Control.GeoSearch({
                provider: new L.GeoSearch.Provider.Google(),
                showMarker: false
            }));


            /*markers = L.markerClusterGroup({
             showCoverageOnHover: false
             }).addTo(map);*/
            this.markers = L.layerGroup().addTo(this.map);

            this.emptyMarketLayer = L.layerGroup().addTo(this.map);
            //emptyMarketLayer = L.featureGroup([]).addTo(map);
            //emptyMarketLayer = L.markerClusterGroup({
            //	showCoverageOnHover: false
            //});

            // Initialise the FeatureGroup to store editable layers
            var drawnItems = new L.FeatureGroup();

            map.addLayer(drawnItems);

            var drawOpts = {
                position: 'bottomleft',
                draw: {
                    marker: false,
                    polyline: false,
                    polygon: {
                        allowIntersection: false,
                        drawError: {
                            color: '#399BCC',
                            timeout: 1000
                        },
                        shapeOptions: {
                            color: '#3FAAA9',
                            fillColor: '#3FAAA9',
                            fillOpacity: 0.1
                        },
                        showArea: true
                    },
                    circle: {
                        shapeOptions: {
                            color: '#3FAAA9',
                            fillColor: '#3FAAA9',
                            fillOpacity: 0.1
                        }
                    }
                },
                edit: {
                    featureGroup: drawnItems,
                    edit: false
                }
            };

            var drawControl = new L.Control.Draw(drawOpts);

            this.map.addControl(drawControl);

            log.info("Map initialized");

            this.map.on('draw:created', function (e) {
                var type = e.layerType,
                    layer = e.layer;

                if (type === 'circle') {
                    var origin = layer.getLatLng(); //center of drawn circle
                    var radius = layer.getRadius(); //radius of drawn circle
                    var projection = L.CRS.EPSG4326;
                    var polys = self._createGeodesicPolygon(origin, radius, 10, 0, projection); //these are the points that make up the circle
                    var coords = [];
                    for (var i = 0; i < polys.length; i++) {
                        var geometry = [
                            parseFloat(polys[i].lat.toFixed(3)),
                            parseFloat(polys[i].lng.toFixed(3))
                        ];
                        coords.push(geometry);
                    }

                    var polyCircle = L.polygon(coords);

                    self.filterPolygonWKT = self._toWKT(polyCircle);
                }
                else{
                    self.filterPolygonWKT = self._toWKT(layer);
                }

                drawnItems.clearLayers()
                    .addLayer(layer);

                drawnItems.setStyle(drawOpts.draw.polygon.shapeOptions);

                self._updateUI();

            })
                .on('draw:deleted', function (e) {
                    drawnItems.clearLayers();
                    delete self.filterPolygonWKT;
                    self._updateUI();
                });
        },

        _buildMap: function () {

            this._updateMap();
        },

        _toWKT: function (layer) {

            var lng, lat, coords = [];

            if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
                var latlngs = layer.getLatLngs();

                for (var i = 0; i < latlngs.length; i++) {
                    coords.push(latlngs[i].lng + " " + latlngs[i].lat);
                    if (i === 0) {
                        lng = latlngs[i].lng;
                        lat = latlngs[i].lat;
                    }
                }

                if (layer instanceof L.Polygon) {
                    return "POLYGON((" + coords.join(",") + "," + lng + " " + lat + "))";

                } else if (layer instanceof L.Polyline) {
                    return "LINESTRING(" + coords.join(",") + ")";
                }
            }
            else if (layer instanceof L.Marker) {
                return "POINT(" + layer.getLatLng().lng + " " + layer.getLatLng().lat + ")";
            }
        },

        _destinationVincenty: function (lonlat, brng, dist) {
            //rewritten to work with leaflet
            var VincentyConstants = {
                    a: 6378137,
                    b: 6356752.3142,
                    f: 1 / 298.257223563
                },
                a = VincentyConstants.a,
                b = VincentyConstants.b,
                f = VincentyConstants.f,
                lon1 = lonlat.lng,
                lat1 = lonlat.lat,
                s = dist,
                pi = Math.PI,
                alpha1 = brng * pi / 180,
                sinAlpha1 = Math.sin(alpha1),
                cosAlpha1 = Math.cos(alpha1),
                tanU1 = (1 - f) * Math.tan(lat1 * pi / 180),
                cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1)), sinU1 = tanU1 * cosU1,
                sigma1 = Math.atan2(tanU1, cosAlpha1),
                sinAlpha = cosU1 * sinAlpha1,
                cosSqAlpha = 1 - sinAlpha * sinAlpha,
                uSq = cosSqAlpha * (a * a - b * b) / (b * b),
                A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq))),
                B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq))),
                sigma = s / (b * A), sigmaP = 2 * Math.PI;

            while (Math.abs(sigma - sigmaP) > 1e-12) {
                var cos2SigmaM = Math.cos(2 * sigma1 + sigma),
                    sinSigma = Math.sin(sigma),
                    cosSigma = Math.cos(sigma),
                    deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
                        B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
                sigmaP = sigma;
                sigma = s / (b * A) + deltaSigma;
            }
            var tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1,
                lat2 = Math.atan2(sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1,
                    (1 - f) * Math.sqrt(sinAlpha * sinAlpha + tmp * tmp)),
                lambda = Math.atan2(sinSigma * sinAlpha1, cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1),
                C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha)),
                lam = lambda - (1 - C) * f * sinAlpha *
                    (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM))),
                revAz = Math.atan2(sinAlpha, -tmp),
                lamFunc = lon1 + (lam * 180 / pi),
                lat2a = lat2 * 180 / pi;

            return L.latLng(lamFunc, lat2a);

        },

        _createGeodesicPolygon: function (origin, radius, sides, rotation, projection) {

            var latlon = origin; //leaflet equivalent
            var angle;
            var new_lonlat, geom_point;
            var points = [];

            for (var i = 0; i < sides; i++) {
                angle = (i * 360 / sides) + rotation;
                new_lonlat = this._destinationVincenty(latlon, angle, radius);
                geom_point = L.latLng(new_lonlat.lng, new_lonlat.lat);

                points.push(geom_point);
            }

            return points;
        },

        _zoomToCountry: function (code) {

            var url = ZOOM_TO_BBOX + 'country/adm0_code/' + code;

            $.ajax({
                type: "GET",
                url: url,
                success: function (response) {
                    map.fitBounds(response);
                }
            });
        },

        _updateMap: function () {

            log.info("update map")

            if (this.markers != null) {
                this.markers.clearLayers();
            }

            this._retrieveResource({
                query: Q.mapUpdate,
                success: _.bind(this._onUpdateMapSuccess, this),
                error: _.bind(this._onUpdateMapError, this)
            });
        },

        _onUpdateMapError: function () {
            alert("Impossible to updateMap()")
        },

        _onUpdateMapSuccess: function (data) {

            log.info("Map data: " + JSON.stringify(data));
            log.info("Map data: " + JSON.stringify(data));

            var self = this,
                addressPoints = [],
                marketcode = [],
                vendors = [],
                address = 0,
                response = _.rest(data);

            var Cresponse = _.groupBy(response, 'marketcode');

            $.each(this.mapMarkets, function (k, v) {
                if (!v[0]) {

                    L.marker([v.lat, v.lon], {
                        icon: desatIcon
                    })
                        .bindPopup('<div class="notValued">' + v.name + ' </div>')
                        .on('mouseover', function (e) {
                            e.target.openPopup();
                        })
                        .addTo(self.emptyMarketLayer);
                }

                v = _.extend(v, Cresponse[v.code]);

                var avgS = "",
                    hasData = v[0] && _.has(v[0], 'avg');

                if (hasData) {
                    avgS = "<br>" + parseFloat(v[0].avg).toFixed(2) + C.currency + "\/" + C.um;
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

            this._refreshCluster(addressPoints);
        },

        _refreshCluster: function (addressPoints) {

            log.info("Refresh cluster", JSON.stringify(addressPoints));
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
                    this.markers.addLayer(marker);
                    latlngs.push(loc);
                }
            }

            log.info("Lat and longs", latlngs);

            if (latlngs.length > 0) {
                this.map.fitBounds(L.latLngBounds(latlngs).pad(0.2));
            }
        },

        _disposeMap: function (data) {

        },

        // Charts

        _buildCharts: function () {

            this._retrieveChartsResources({
                success: _.bind(this._buildChartsSuccess, this),
                error: _.bind(this._buildChartsError, this)
            });
        },

        _updatedCharts: function () {

            this._disposeCharts();

            this._retrieveChartsResources({
                success: _.bind(this._buildChartsSuccess, this),
                error: _.bind(this._buildChartsError, this)
            });
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

            if (data.length !== 0) {

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

            }
            else {
                log.warn("Chart data is empty");
            }

            return {
                dailyPrices: seriesOptions1,
                averagePrices: seriesOptions2
            }

        },

        _buildChartsSuccess: function (response) {

            var series = this._buildChartsSeries(response),
                dailyPricesSeries = series.dailyPrices,
                averagePricesSeries = series.averagePrices;

            this.$chartDailyPrices.highcharts('StockChart', $.extend(true, {}, ChartsConfig.dailyPrices, {series: dailyPricesSeries}));

            this.$chartAveragePrices.highcharts($.extend(true, {}, ChartsConfig.averagePrices, {series: averagePricesSeries}));

        },

        _retrieveChartsResources: function (obj) {

            this._retrieveResource({
                query: Q.charts,
                success: obj.success,
                error: obj.error,
                outputType: 'array'
            });
        },

        _buildChartsError: function () {
            alert("Impossible to _updateChartsError()")
        },

        _disposeCharts: function () {

            this.$chartDailyPrices.highcharts("destroy");

            this.$chartAveragePrices.highcharts("destroy");
        },

        // Tables

        _buildTables: function () {

            this._updateDailyDataTable();

            this._updateAggregatedDataTable();

            this._bindTableDownloadButtonsEvents();
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

        _updateDailyDataTableSuccess: function (d) {

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
                    userid: element["userid"]
                });
            });

            this.$tableDailyData.bootstrapTable($.extend(true, {}, TablesConfig.dailyData, {data: data}));
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

        _updateAggregatedDataTableSuccess: function (d) {

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

            this.$tableAggregatedData.bootstrapTable($.extend(true, {}, TablesConfig.aggregatedData, {data: data}));

        },

        _bindTableDownloadButtonsEvents: function () {

            this.$tableDownloadButtons.on("click", function () {

                var $this = $(this),
                    table = $this.data('table'),
                    format = $this.data('download');

                switch (table) {
                    case "daily" :
                        this.$tableDailyData.bootstrapTable('togglePagination');
                        this.$tableDailyData.tableExport({type: format});
                        this.$tableDailyData.bootstrapTable('togglePagination');
                        break;
                    case "aggregated" :
                        this.$tableAggregatedData.bootstrapTable('togglePagination');
                        this.$tableAggregatedData.tableExport({type: format});
                        this.$tableAggregatedData.bootstrapTable('togglePagination');
                        break;
                }

            })
        },

        _unbindTableDownloadButtonsEvents: function () {

            this.$tableDownloadButtons.off();
        },

        _disposeTables: function () {

            this._unbindTableDownloadButtonsEvents();

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
                anyMarkets = _.reduce(markets, function (memo, num) {
                    return memo + "," + num;
                }, ""),
                commodities = Utils.getNestedProperty("values.commodities", values),
                anyCommodities = _.reduce(commodities, function (memo, num) {
                    return memo + "," + num;
                }, ""),
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
                        anyCommodities: "{" + anyCommodities.substring(1) + "}",
                        anyMarkets: "{" + anyMarkets.substring(1) + "}",
                        wkt : this.filterPolygonWKT
                    }
                });

            //Check if resource is cached otherwise retrieve
            var stored = amplify.store.sessionStorage(query);

            if (C.cache === true && stored) {

                obj.success(query, stored);

            } else {

                log.warn(query);

                this.WDSClient.retrieve({
                    payload: {query: query},
                    outputType: obj.outputType || "object",
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
