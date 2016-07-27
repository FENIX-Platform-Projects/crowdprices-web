/*global define*/
define(function () {

    'use strict';

    return {

        //Chaplin JS configuration
        CHAPLINJS_CONTROLLER_SUFFIX: '-controller',
        CHAPLINJS_PROJECT_ROOT: '/crowprices/',
        CHAPLINJS_PUSH_STATE: false,
        CHAPLINJS_SCROLL_TO: false,
        CHAPLINJS_APPLICATION_TITLE: "Crowd prices",

        //Top Menu configuration
        TOP_MENU_CONFIG: 'config/submodules/fx-menu/top_menu.json',
        TOP_MENU_TEMPLATE: 'fx-menu/html/side.html',

        TOP_MENU_AUTH_MODE_HIDDEN_ITEMS: ['login'],
        TOP_MENU_PUBLIC_MODE_HIDDEN_ITEMS: ['logout', "download"],

        DB_NAME: "CROWD",
        WDS_URL: 'http://fenixapps2.fao.org/wds-5.2.1/rest/crud',
        WDS_OUTPUT_TYPE: 'object',

        from : "2016-05-01 00:00:00",
        format : "LL",

        downloadUrl : "http://fenix.fao.org/crowd/export/csv",
        cache: false,

        currency: "USD",
        um : "Kg"

    };
});
