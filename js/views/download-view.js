/*global define, _:false, $, console, amplify, FM, THREE*/
define([
    'jquery',
    'views/base/view',
    'config/config',
    'config/events',
    'text!templates/download/template.hbs',
    'i18n!nls/labels',
    'handlebars',
    'amplify'
], function ($, View, C, EVT, template, i18nLabels) {

    'use strict';

    var DownloadView = View.extend({

        autoRender: true,

        className: 'download',

        template: template,

        getTemplateData: function () {
            return i18nLabels;
        },

        attach: function () {

            View.prototype.attach.call(this, arguments);

            //update State
            amplify.publish(EVT.stateChange, {menu: 'download'});

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

    return DownloadView;
});
