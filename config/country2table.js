/*global define*/
define(function () {

    'use strict';

    var map = {};
    map[createKey(1)] = "data";

    return map;

    function createKey( code ) {
        return  "country_" +code.toString();
    }
});
