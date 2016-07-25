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
        TOP_MENU_TEMPLATE: 'fx-menu/html/blank-fluid.html',

        TOP_MENU_AUTH_MODE_HIDDEN_ITEMS: ['login'],
        TOP_MENU_PUBLIC_MODE_HIDDEN_ITEMS: ['logout', "download"]


    };
});
