/*global define*/
define(function () {

    'use strict';

    return {

        commodities: "SELECT code as value, name as label FROM commodity", // WHERE gaul0={{{country}}}
        countries: "SELECT code as value, name as label FROM gaul0",
        markets: "SELECT code as value, name as label FROM market WHERE gaul0={{{country}}} ORDER BY code",
        time: "SELECT min(fulldate) as from, max(fulldate) as to FROM {{table}} WHERE  marketcode IN ('{{{markets}}}') AND commoditycode IN ('{{{commodities}}}') AND gaul0code = {{{country}}}",
        map: "SELECT AVG(price), COUNT(price), marketcode FROM {{{table}}} WHERE marketcode IN ('{{{markets}}}')  AND date>='{{{from}}}' AND date<= '{{{to}}}' GROUP BY marketcode ORDER BY marketcode",
        charts: "SELECT id, gaul0code, citycode, marketcode, munitcode, currencycode, commoditycode, varietycode, price, quantity, untouchedprice, fulldate, note, userid, vendorname, vendorcode, lat, lon, commodity.name, commodity.code FROM {{{table}}} , commodity WHERE gaul0code = '{{{country}}}' AND marketcode IN ('{{{markets}}}') AND commoditycode IN ('{{{commodities}}}') AND commoditycode::int = commodity.code ORDER BY commoditycode, marketcode, fulldate",
        tableDailyData: "SELECT {{{table}}}.gaul0code, {{{table}}}.vendorname as vendorname, {{{table}}}.citycode, city.code, {{{table}}}.price, {{{table}}}.fulldate, city.name as cityname, commodity.code, commodity.name as commodityname, {{{table}}}.commoditycode, market.code, market.name as marketname, {{{table}}}.marketcode, {{{table}}}.quantity, {{{table}}}.userid AND date>='{{{from}}}' AND date<= '{{{to}}}' ORDER BY {{{table}}}.fulldate DESC",
        tableAggregatedData: "SELECT t.cityname,t.marketname,t.vendorname,t.commodityname, min(t.price)min, max(t.price)max, round (avg(t.price)::numeric,2) avg  FROM (SELECT  {{{table}}}.gaul0code, {{{table}}}.vendorname as vendorname,  {{{table}}}.citycode, city.code, {{{table}}}.price, {{{table}}}.fulldate,  city.name as cityname, commodity.code, commodity.name as commodityname, {{{table}}}.commoditycode, market.code, market.name as marketname, {{{table}}}.marketcode, {{{table}}}.quantity, {{{table}}}.userid  FROM  {{{table}}} city, ommodity, market WHERE {{{table}}}.citycode = city.code AND date>='{{{from}}}' AND date<= '{{{to}}}' AND CAST ({{{table}}}.commoditycode as INT) = commodity.code AND {{{table}}}.gaul0code = '{{{country}}}}'AND commodity.code = ANY('{ {{{commodities}}} } AND {{{table}}}.marketcode = ANY('{{{markets}}}') AND CAST({{{table}}}.marketcode AS INT) = market.code ORDER BY {{{table}}}.fulldate DESC ) t GROUP BY t.cityname,t.marketname,t.vendorname,t.commodityname ORDER BY commodityname"
    };

});