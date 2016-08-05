/*global define, amplify*/
define([
    'jquery',
    'chaplin',
    'underscore',
    'config/config',
    'config/events',
    'views/base/view',
    'fx-menu/start',
    'globals/AuthManager',
    'globals/State',
    'i18n!nls/labels',
    'text!templates/site.hbs',
    'highstock.sparkline',
], function ($, Chaplin, _, C, E, View, Menu, AuthManager, State, i18nLabels, template) {

    'use strict';

    var s = {
        LATERAL_MENU_CONTAINER: '#lateral-menu',
        MENU_TOGGLE_BTN : "#menu-toggle",
        WRAPPER: "#wrapper",
        SPARK_LINES: "[data-sparkline]"
    };

    var SiteView = View.extend({

        container: 'body',

        id: 'site-container',

        regions: {
            main: '#page-content'
        },

        template: template,

        getTemplateData: function () {
            return $.extend(true, {}, C, i18nLabels);
        },

        attach: function () {

            View.prototype.attach.call(this, arguments);

            this._initVariables();

            this._bindEventListeners();

            this._initMenu();

            this._initQuickStats();

            //his._initSparkline();

        },

        _initSparkline : function () {

            var start = +new Date(),
                $tds = this.$el.find(s.SPARK_LINES),
                fullLen = $tds.length,
                n = 0;

            function doChunk() {
                var time = +new Date(),
                    i,
                    len = $tds.length,
                    $td,
                    stringdata,
                    arr,
                    data,
                    chart;

                for (i = 0; i < len; i += 1) {
                    $td = $($tds[i]);
                    stringdata = $td.data('sparkline');
                    arr = stringdata.split('; ');
                    data = $.map(arr[0].split(', '), parseFloat);
                    chart = {};

                    if (arr[1]) {
                        chart.type = arr[1];
                    }
                    $td.highcharts('SparkLine', {
                        series: [{
                            data: data,
                            pointStart: 1
                        }],
                        tooltip: {
                            headerFormat: '<span style="font-size: 10px">' + $td.parent().find('th').html() + ', Q{point.x}:</span><br/>',
                            pointFormat: '<b>{point.y}.000</b> USD'
                        },
                        chart: chart
                    });

                    n += 1;

                    // If the process takes too much time, run a timeout to allow interaction with the browser
                    if (new Date() - time > 500) {
                        $tds.splice(0, i + 1);
                        setTimeout(doChunk, 0);
                        break;
                    }

                    // Print a feedback on the performance
                    if (n === fullLen) {
                        $('#result').html('Generated ' + fullLen + ' sparklines in ' + (new Date() - start) + ' ms');
                    }
                }
            }

            doChunk();

        },

        _initVariables: function () {

           this.$toggleMenuBtn = this.$el.find(s.MENU_TOGGLE_BTN);

           this.$wrapper = this.$el.find(s.WRAPPER);
        },

        _bindEventListeners: function () {

            this.$toggleMenuBtn.on("click", _.bind(this._onToggleMenuBtn, this));

            amplify.subscribe(E.stateChange, this, this._onStateUpdate);

        },

        _onToggleMenuBtn: function (e) {

            e.preventDefault();

            this.$wrapper.toggleClass("toggled");

            window.setTimeout(function () {
                amplify.publish("resize");
            }, 550);

        },

        _initMenu: function () {

            var self = this,
                menuConf = {

                    url: C.TOP_MENU_CONFIG,

                    template: C.TOP_MENU_TEMPLATE,

                    container: s.LATERAL_MENU_CONTAINER,

                    callback: _.bind(this._onMenuRendered, this)

                },
                menuConfAuth = _.extend({}, menuConf, {
                    hiddens: C.TOP_MENU_AUTH_MODE_HIDDEN_ITEMS
                }),
                menuConfPub = _.extend({}, menuConf, {
                    hiddens: C.TOP_MENU_PUBLIC_MODE_HIDDEN_ITEMS
                });

            this.authManager = AuthManager.init({
                onLogin: _.bind(function () {
                    self.topMenu.refresh(menuConfAuth);
                    amplify.publish("login");
                }, this),
                onLogout: _.bind(function () {

                    amplify.publish(E.notAuthorized);

                    self.topMenu.refresh(menuConfPub);
                    amplify.publish("logout");
                }, this)
            });

            //Top Menu
            this.topMenu = new Menu(this.authManager.isLogged() ? menuConfAuth : menuConfPub);
        },

        _initQuickStats: function () {

        },

        _onMenuRendered: function () {

            this._onMenuUpdate();

            amplify.subscribe(E.menuUpdate, this, this._onMenuUpdate);
        },

        _onStateUpdate: function (s) {

            State = $.extend(true, State, s);

            amplify.publish(E.menuUpdate);
        },

        _onMenuUpdate: function () {

            this.topMenu.select(State.menu);
        }
    });

    return SiteView;
});
