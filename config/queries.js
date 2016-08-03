/*global define*/
define(function () {

    'use strict';

    return {

        commodities: "SELECT code as value, name as label FROM commodity", // WHERE gaul0={{{country}}}
        countries: "SELECT code as value, name as label FROM gaul0",
        markets: "SELECT code as value, name as label FROM market WHERE gaul0={{{country}}} ORDER BY code",
        time: "SELECT min(fulldate) as from, max(fulldate) as to FROM {{{table}}} WHERE marketcode IN ('{{{markets}}}') AND commoditycode IN ('{{{commodities}}}') AND gaul0code = {{{country}}}",
        mapInit: "SELECT parentcode, code, name, lang, shown, lat, lon, gaul0 FROM market WHERE gaul0={{{country}}} ORDER BY code",
        mapUpdate: "SELECT AVG(price), COUNT(price), marketcode FROM {{{table}}} WHERE marketcode IN ('{{{markets}}}') AND date>='{{{from}}}' AND date<= '{{{to}}}' {{#if wkt}} AND ST_contains(ST_GeomFromText('{{{wkt}}}',4326),geo) {{/if}} GROUP BY marketcode ORDER BY marketcode",
        charts: "SELECT id, gaul0code, citycode, marketcode, munitcode, currencycode, commoditycode, varietycode, price, quantity, untouchedprice, fulldate, note, userid, vendorname, vendorcode, lat, lon, commodity.name, commodity.code FROM {{{table}}} , commodity WHERE gaul0code = '{{{country}}}' AND date>='{{{from}}}' AND date<= '{{{to}}}' AND marketcode IN ('{{{markets}}}') AND commoditycode IN ('{{{commodities}}}') AND commoditycode::int = commodity.code {{#if wkt}} AND ST_contains(ST_GeomFromText('{{{wkt}}}',4326),geo) {{/if}} ORDER BY commoditycode, marketcode, fulldate",
        tableDailyData: "SELECT {{{table}}}.gaul0code, {{{table}}}.vendorname as vendorname, {{{table}}}.citycode, city.code, {{{table}}}.price, {{{table}}}.fulldate, city.name as cityname, commodity.code, commodity.name as commodityname, {{{table}}}.commoditycode, market.code, market.name as marketname, {{{table}}}.marketcode, {{{table}}}.quantity, {{{table}}}.userid FROM {{{table}}}, city, commodity, market WHERE {{{table}}}.citycode = city.code AND CAST ({{{table}}}.commoditycode as INT) = commodity.code AND {{{table}}}.gaul0code = '{{{country}}}' AND commodity.code = ANY('{{{anyCommodities}}}') AND {{{table}}}.marketcode = ANY('{{{anyMarkets}}}') AND CAST({{{table}}}.marketcode AS INT) = market.code",
        tableAggregatedData: "SELECT t.cityname,t.marketname,t.vendorname,t.commodityname, min(t.price)min,max(t.price)max, round(avg(t.price)::numeric,2)avg FROM (SELECT {{{table}}}.gaul0code, {{{table}}}.vendorname as vendorname, {{{table}}}.citycode, city.code, {{{table}}}.price, {{{table}}}.fulldate,  city.name as cityname, commodity.code, commodity.name as commodityname, {{{table}}}.commoditycode, market.code, market.name as marketname, {{{table}}}.marketcode, {{{table}}}.quantity, {{{table}}}.userid FROM {{{table}}}, city, commodity, market WHERE {{{table}}}.citycode = city.code AND date>='{{{from}}}' AND date<= '{{{to}}}' AND CAST ({{{table}}}.commoditycode as INT) = commodity.code AND {{{table}}}.gaul0code = '{{{country}}}' AND commodity.code = ANY('{{{anyCommodities}}}') AND {{{table}}}.marketcode = ANY('{{{anyMarkets}}}') AND CAST({{{table}}}.marketcode AS INT) = market.code ORDER BY {{{table}}}.fulldate DESC ) t GROUP BY t.cityname,t.marketname,t.vendorname,t.commodityname ORDER BY commodityname"
    };

});

