/*global define*/
define(function () {
    'use strict';

    // The routes for the application. This module returns a function.
    // `match` is match method of the Router
    return function (match) {
        //match('', 'home#show');
        //match('home', 'home#show');
        //match('download', 'download#show');
       // match('*anything', '404#show');
        match('*anything', 'home#show');
    };
});
