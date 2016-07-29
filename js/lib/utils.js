/*global define, requirejs*/
define([
    'require',
    'handlebars',
    'underscore',
    'chaplin'
], function (requirejs, Handlebars, _, Chaplin) {

    'use strict';

    // Application-specific utilities
    // ------------------------------

    // Delegate to Chaplin’s utils module
    var utils = Chaplin.utils.beget(Chaplin.utils);

    // Add additional application-specific properties and methods

    // _(utils).extend({
    //   someProperty: 'foo',
    //   someMethod: function() {}
    // });

    Handlebars.registerHelper('isI18n', function (keyword) {

        if (typeof keyword === 'object') {

            var lang = requirejs.s.contexts._.config.i18n.locale;
            return keyword[lang.toUpperCase()];
        }
        else {
            return keyword;
        }
    });

    Handlebars.registerHelper('i18n', function (keyword) {

        var lang;

        try {
            lang = requirejs.s.contexts._.config.i18n.locale;
        } catch (e) {
            lang = "EN";
        }

        return keyword[lang.toUpperCase()];
    });

    Handlebars.registerHelper("each_with_index_1", function (array, fn) {

        var result = '';
        var lang = requirejs.s.contexts._.config.i18n.locale;
        var index = array.data.index + 1;

        if (index === 1 || index % 4 === 1) {

        }

        // return the finished buffer
        return result;

    });

    Handlebars.registerHelper("list_countries_creator", function (array, fn) {

        var countries = array.data.root.countries;
        //var lang = requirejs.s.contexts._.config.i18n.locale;
        var lang = 'en';
        lang = lang.toUpperCase();
        var result = '';

        var firstDone = false;
        var secondDone = false;

        for (var i = 0, length = countries.length; i < length; i++) {
            // first
            if (i === 0 || i % 3 === 0) {
                //result+= '<div>';
                result += '<div class="col-md-4 country-item">' +
                    '<a href="#profile/' + countries[i].code + '">'
                    + countries[i].title[lang] + '</a></div>';
                firstDone = true;
            } else if (i === 1 || firstDone) {
                result += '<div class="col-md-4 country-item">' +
                    '<a href="#profile/' + countries[i].code + '">'
                    + countries[i].title[lang] + '</a></div>';
                firstDone = false;
                secondDone = true;
            } else if (i === 2 || secondDone) {
                result += '<div class="col-md-4 country-item">' +
                    '<a href="#profile/' + countries[i].code + '">'
                    + countries[i].title[lang] + '</a></div>';
                //result+= '</div>';
                secondDone = false;
            }
        }
        /* if(length%3 !== 0) {
         result+= '</div>';
         }*/
        return new Handlebars.SafeString(result);

    });


    //i18n

    utils.getLang = function () {
        var lang;
        try {
            lang = requirejs.s.contexts._.config.i18n.locale.toUpperCase();
        } catch (e) {
        }

        return lang || "EN";
    };

    utils.getLabel = function (obj) {
        return obj[requirejs.s.contexts._.config.i18n.locale.toUpperCase()];
    };

    // i18n

    utils.setI18nToJsTreeConfig = function (config, labels) {

        var core = config.core || {},
            data = core.data || [];

        this.setI18nToArray(data, labels, "menu_");

        if (!config.core) {
            config.core = {};
        }

        config.core.data = data;

        return config;
    };

    utils.setI18nToCountriesSummary = function (config, labels) {

        _.each(config, _.bind(function (obj, key) {
            obj.title = this.getI18nLabel(key, labels);
        }, this));

        return config;
    };

    utils.setI18nToArray = function (array, labels, prefix) {

        _.each(array, _.bind(function (item) {

            item.text = this.getI18nLabel(item.id, labels, prefix);

            if (Array.isArray(item.children)) {
                this.setI18nToArray(item.children, labels, prefix);
            }

        }, this));

        return array;

    };

    utils.getI18nLabel = function (id, labels, prefix) {

        return labels[prefix + id];
    };

    return utils;
});
