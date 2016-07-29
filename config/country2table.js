/*global define*/
define(function () {

    'use strict';

    var map = {};
    map[createKey(1)] = "data_afghanistan";
    map[createKey(90)] = "data_gambia";
    map[createKey(45)] = "data_cameroon";

    return map;

    function createKey( code ) {

        return  "country_" +code.toString().toLowerCase();
    }
});
