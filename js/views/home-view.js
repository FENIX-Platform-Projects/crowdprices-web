/*global define, _:false, $, console, amplify, FM, THREE*/
define([
    'jquery',
    'views/base/view',
    'config/config',
    'config/events',
    'text!templates/home/template.hbs',
    'i18n!nls/labels',
    'handlebars',
    'amplify'
], function ($, View, C, EVT, template, i18nLabels) {

    'use strict';

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

        },

        _initVariables: function () {

        },

        _bindEventListeners: function () {

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
