/*global define, _:false, $, console, amplify, FM, THREE*/
define([
    'jquery',
    'views/base/view',
    'fx-filter/start',
    'config/config',
    'config/events',
    'config/submodules/fx-filter/config',
    'text!templates/home/template.hbs',
    'i18n!nls/labels',
    'handlebars',
    'amplify'
], function ($, View, Filter,  C, EVT, Items, template, i18nLabels) {

    'use strict';

    var s = {
        FILTER : "#selectors-el"
    };

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

            this._bindEventListeners();

            this._initFilter();

        },

        _initVariables: function () {

        },

        _bindEventListeners: function () {

        },

        _initFilter: function () {

            this.filter = new Filter({
                el: s.FILTER,
                items: Items
            });

        },

        _unbindEventListeners: function () {

        },

        dispose: function () {

            this._unbindEventListeners();

            View.prototype.dispose.call(this, arguments);
        }

    });

    return HomeView;
});
