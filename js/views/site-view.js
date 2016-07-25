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
    'text!templates/site.hbs'
], function ($, Chaplin, _, C, E, View, Menu, AuthManager, State, i18nLabels, template) {

    'use strict';

    var s = {
        LATERAL_MENU_CONTAINER: '#lateral-menu',
        MENU_TOGGLE_BTN : "#menu-toggle",
        WRAPPER: "#wrapper"
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
                }, this),
                onLogout: _.bind(function () {

                    amplify.publish(E.notAuthorized);

                    self.topMenu.refresh(menuConfPub);
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
