/*global require*/

var pathProjectRoot = "./";
var projectRoot = "./";
var submoduleRoot = './submodules/';

require.config({
    config: {
        text: {
            useXhr: function (url, protocol, hostname, port) {
                return true;
            }
        }
    },
    paths: {
        compilerPaths: pathProjectRoot + 'submodules/fenix-ui-common/js/Compiler',
        commonPaths: pathProjectRoot + 'submodules/fenix-ui-common/js/paths',
        menuPaths: pathProjectRoot + 'submodules/fenix-ui-menu/src/js/paths',
        dashboardPaths: pathProjectRoot + 'submodules/fenix-ui-dashboard/src/js/paths',
        chartPaths: pathProjectRoot + 'submodules/fenix-ui-chart-creator/src/js/paths',
        mapPaths: pathProjectRoot + 'submodules/fenix-ui-map-creator/src/js/paths',
        tablePaths: pathProjectRoot + 'submodules/fenix-ui-table-creator/src/js/paths',
        filterPaths: pathProjectRoot + 'submodules/fenix-ui-filter/src/js/paths',
        analysisPaths: pathProjectRoot + 'submodules/fenix-ui-analysis/src/js/paths',
        olapPaths: pathProjectRoot + 'submodules/fenix-ui-olap/src/js/paths',
        reportPaths: pathProjectRoot + 'submodules/fenix-ui-reports/src/js/paths',
        visualizationPaths: pathProjectRoot + 'submodules/fenix-ui-visualization-box/src/js/paths',
        dataEditorPaths: pathProjectRoot + 'submodules/fenix-ui-DataEditor/js/paths',
        dsdEditorPaths: pathProjectRoot + 'submodules/fenix-ui-DSDEditor/js/paths',
        metadataEditorPaths: pathProjectRoot + 'submodules/fenix-ui-metadata-editor/js/paths',
        metadataViewerPaths: pathProjectRoot + 'submodules/fenix-ui-metadata-viewer/src/js/paths',
        catalogPaths: pathProjectRoot + 'submodules/fenix-ui-catalog/src/js/paths',
        dataManagementPaths: pathProjectRoot + 'submodules/fenix-ui-data-management/src/js/paths',
        fenixMap: pathProjectRoot + 'submodules/fenix-ui-map/src/paths'
    }
});

require([
    "compilerPaths",
    "commonPaths",
    "menuPaths",
    "filterPaths"
], function (Compiler, Common, Menu, Filter) {

    'use strict';

    var submodules_path = projectRoot + '../../submodules/';

    var commonConfig = Common;
    commonConfig.baseUrl = submodules_path + 'fenix-ui-common/js';

    var menuConfig = Menu;
    menuConfig.baseUrl = submodules_path + '/fenix-ui-menu/src/js';

    var filterConfig = Filter;
    filterConfig.baseUrl = submodules_path + 'fenix-ui-filter/src/js';

    Compiler.resolve([commonConfig, menuConfig, filterConfig],
        {
            placeholders: {"FENIX_CDN": "http://fenixrepo.fao.org/cdn"},

            config: {

                locale: 'en',

                // The path where your JavaScripts are located
                baseUrl: pathProjectRoot + '/js',

                // Specify the paths of vendor libraries
                paths: {

                    underscore: "{FENIX_CDN}/js/underscore/1.7.0/underscore.min",
                    backbone: "{FENIX_CDN}/js/backbone/1.1.2/backbone.min",
                    handlebars: "{FENIX_CDN}/js/handlebars/2.0.0/handlebars",
                    chaplin: "{FENIX_CDN}/js/chaplin/1.1.1/chaplin.min",
                    domReady: "{FENIX_CDN}/js/requirejs/plugins/domready/2.0.1/domReady",
                    i18n: "{FENIX_CDN}/js/requirejs/plugins/i18n/2.0.4/i18n",
                    text: '{FENIX_CDN}/js/requirejs/plugins/text/2.0.12/text',
                    q: '{FENIX_CDN}/js/q/1.1.2/q',

                    loglevel: "{FENIX_CDN}/js/loglevel/1.4.0/loglevel",

                    moment : '{FENIX_CDN}/js/moment/2.12.0/min/moment.min',

                    'fx-common/config/auth_users': '../../config/auth_users.json',

                    //Map
                    'leaflet'                 :'{FENIX_CDN}/js/leaflet/0.7.7/leaflet-src',
                    'leaflet.markercluster'   :'{FENIX_CDN}/js/leaflet/plugins/leaflet.markecluster/1.1/leaflet.markercluster',
                    'leaflet.draw'            :'{FENIX_CDN}/js/leaflet/plugins/leaflet.draw/0.2.4/leaflet.draw',
                    //'leaflet.geosearch'       :'{FENIX_CDN}/js/leaflet/plugins/leaflet.geosearch/1.1.0/js/l.control.geosearch',
                    //'leaflet.geosearch.google':'{FENIX_CDN}/js/leaflet/plugins/leaflet.geosearch/1.1.0/js/l.geosearch.provider.google',
                    'leaflet-search'          :'{FENIX_CDN}/js/leaflet/plugins/leaflet-search/1.9.9/dist/leaflet-search.min',
                    //'leaflet-search'          :'/maps/leaflet-search/src/leaflet-search',
                    'geojson-utils'           :'{FENIX_CDN}/js/geojson-utils/1.1.0/geojson-utils',

                    //nls: "../i18n",
                    config: "../config",
                    json: "../json",
                    nls: "../nls",

                    highstock : '{FENIX_CDN}/js/highstock/2.1.9/js/highstock',
                    'highstock.exporting' : '{FENIX_CDN}/js/highstock/2.1.9/js/modules/exporting',
                    'highstock.no-data' : '{FENIX_CDN}/js/highstock/2.1.9/js/modules/no-data-to-display',
                    'highstock.sparkline' : '{FENIX_CDN}/js/highstock/2.1.9/js/modules/sparkilne-charts',

                    'bootstrap-table' : '{FENIX_CDN}/js/bootstrap-table/1.10.1/docs/dist/bootstrap-table.min',
                    'bootstrap-table.export' : '{FENIX_CDN}/js/bootstrap-table/1.10.1/dist/extensions/export/bootstrap-table-export.min',
                    'tableExport' : '{FENIX_CDN}/js/tableExport.jquery.plugin/1.0/tableExport.min',

                    countup  : '{FENIX_CDN}/js/countUp/1.7.1/countUp.min',
                },

                // Underscore and Backbone are not AMD-capable per default,
                // so we need to use the AMD wrapping of RequireJS
                shim: {

                    'underscore'  : { exports: '_' },

                    'chosen'                :['jquery'],
                    'jquery-ui'             :['jquery'],
                    'bootstrap'             :['jquery'],
                    'bootstrap-table'       :['jquery','bootstrap'],
                    'bootstrap-table.export'       :['bootstrap-table', 'tableExport' ],

                    'highstock'             :['jquery'],
                    'highstock.exporting'   :['jquery','highstock'],
                    'highstock.no-data'     :['jquery','highstock'],
                    'highstock.sparkline'   :['jquery','highstock'],

                    'leaflet.markercluster' :['leaflet'],
                    'leaflet.draw'          :['leaflet'],
                    'leaflet-search'        :['leaflet'],

                    'geojson-utils'         :{exports:'gju'},
                    'handlebars'            :{exports:'Handlebars'}
                },
                waitSeconds: 15
                // For easier development, disable browser caching
                // Of course, this should be removed in a production environment
                //, urlArgs: 'bust=' +  (new Date()).getTime()
            }
        });

    // Bootstrap the application
    require([
        'loglevel',
        'application',
        'routes',
        'config/config',
        'domReady!'
    ], function (log, Application, routes, C) {

        //trace, debug, info, warn, error, silent
        log.setLevel('silent');

        var app = new Application({
            routes: routes,
            controllerSuffix: C.CHAPLINJS_CONTROLLER_SUFFIX,
            root: C.CHAPLINJS_PROJECT_ROOT,
            pushState: C.CHAPLINJS_PUSH_STATE,
            scrollTo: C.CHAPLINJS_SCROLL_TO
        });

    });
});