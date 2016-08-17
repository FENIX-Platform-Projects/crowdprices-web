
define(function() {

var FXCDN = '//fenixrepo.fao.org/cdn/js/';

return {
	baseUrl: '../',
	paths: {
		'i18n'                    :FXCDN+'requirejs/plugins/i18n/2.0.4/i18n',
		'text'                    :FXCDN+'requirejs/plugins/text/2.0.11/text',
		'domready'                :FXCDN+'requirejs/plugins/domready/2.0.1/domReady',

		'jquery'                  :FXCDN+'jquery/2.1.1/jquery.min',
		'chosen'                  :FXCDN+'chosen/1.3.0/chosen',
		'bootstrap'               :FXCDN+'bootstrap/3.3.4/js/bootstrap.min',
		'bootstrap-table'         :FXCDN+'bootstrap-table/1.9.1/bootstrap-table.min',
		'underscore'              :FXCDN+'underscore/1.8.0/underscore-min',
		'handlebars'              :FXCDN+'handlebars/2.0.0/handlebars.min',
		'jquery-ui'               :FXCDN+'jquery-ui/1.10.3/jquery-ui-1.10.3.custom.min',

		'highstock'               :FXCDN+'highstock/2.0.1/highstock.src',
		'highstock.exporting'     :FXCDN+'highstock/2.0.1/modules/exporting.src',
		
		'leaflet'                 :FXCDN+'leaflet/0.7.7/leaflet-src',
		'leaflet.markercluster'   :FXCDN+'leaflet/plugins/leaflet.markecluster/1.1/leaflet.markercluster',
		'leaflet.draw'            :FXCDN+'leaflet/plugins/leaflet.draw/0.2.4/leaflet.draw',
		//'leaflet.geosearch'       :FXCDN+'leaflet/plugins/leaflet.geosearch/1.1.0/js/l.control.geosearch',
		//'leaflet.geosearch.google':FXCDN+'leaflet/plugins/leaflet.geosearch/1.1.0/js/l.geosearch.provider.google',
		'leaflet-search'          :FXCDN+'leaflet/plugins/leaflet-search/2.6.0/dist/leaflet-search.min',
		'geojson-utils'           :FXCDN+'geojson-utils/1.1.0/geojson-utils',

		'jquery.nouislider'       :'js/slider/jquery.nouislider.all.min',
		'jQAllRangeSliders-min'   :'js/slider/jQAllRangeSliders-min',
		'sparkilne-charts'        :'js/sparkilne-charts',
		'export-table'            :'js/export-table',		
	},

	shim: {
		'underscore'  : { exports: '_' },

		'chosen'                :['jquery'],
		'jquery-ui'             :['jquery'],
		'bootstrap'             :['jquery'],
		'bootstrap-table'       :['jquery','bootstrap'],
		
		'highstock'             :['jquery'],
		'highstock.exporting'   :['jquery','highstock'],

		'jquery.nouislider'     :['jquery'],
		'jQAllRangeSliders-min' :['jquery'],

		'leaflet.markercluster' :['leaflet'],
		'leaflet.draw'          :['leaflet'],
		'leaflet-search'        :['leaflet'],

        'geojson-utils'         :{exports:'gju'},
        'handlebars'            :{exports:'Handlebars'}
	}
};
});