/*global define*/
define(function () {

'use strict';

return {
    commodities: "SELECT distinct {{{table}}}.commoditycode as value, commodity.name as label "+
                 "FROM {{{table}}}, commodity "+
                 "WHERE gaul0code = {{{country}}} "+
                    "AND {{{table}}}.commoditycode = commodity.code::VARCHAR",

    countries: "SELECT code as value, name as label FROM gaul0",
    markets: "SELECT code as value, name as label FROM market "+
             "WHERE gaul0 = {{{country}}} ORDER BY code",

    time: "SELECT min(fulldate) as from, max(fulldate) as to "+
          "FROM {{{table}}} "+
          "WHERE marketcode IN ('{{{markets}}}') "+
            "AND gaul0code = {{{country}}} ",
    
    mapInit: "SELECT parentcode, code, name, lang, shown, lat, lon, gaul0 "+
             "FROM market "+
             "WHERE gaul0 = {{{country}}} "+
             "ORDER BY code",
    
    mapUpdate:
        "SELECT avg, count, marketcode "+
                ",munit.name AS munitname ,currency.name AS currencyname "+
                ",commodity.name AS commodityname "+
        "FROM("+
            "SELECT AVG(price), COUNT(price), marketcode, commoditycode "+
                ",munitcode, currencycode "+
            "FROM {{{table}}} "+
            "WHERE "+
                "marketcode IN ('{{{markets}}}') "+
                "AND commoditycode IN ('{{{commodities}}}') "+
                "AND date>='{{{from}}}' AND date<= '{{{to}}}' "+
                "{{#if wkt}} AND ST_contains(ST_GeomFromText('{{{wkt}}}',4326),geo) {{/if}} "+
            "GROUP BY marketcode, commoditycode "+
            ",munitcode, currencycode "+
            ") tmp "+
        "JOIN munit ON munitcode = munit.code::VARCHAR "+
        "JOIN currency ON currencycode = currency.code::VARCHAR "+
        "JOIN commodity ON tmp.commoditycode = commodity.code::VARCHAR ",
/*
//TODO implement MEASURE UNIT/CURRENCY FOR EACH COMMODITY
SELECT distinct quantity, commodity.name, currency.name 
FROM data_gambia 
JOIN munit ON munitcode = munit.code::VARCHAR 
JOIN currency ON currencycode = currency.code::VARCHAR 
JOIN commodity ON commoditycode = commodity.code::VARCHAR 
*/
    chartsAveragePricesByCommodity: "SELECT commoditycode as commodity, commodity.name as label, price FROM ( SELECT commoditycode, AVG(price) as price FROM {{{table}}} WHERE date>='{{{from}}}' AND date<= '{{{to}}}' AND marketcode IN ('{{{markets}}}') AND commoditycode IN ('{{{commodities}}}') GROUP BY commoditycode ) data JOIN commodity ON (commoditycode::int = commodity.code ) ORDER BY commodity.name",
    chartsDailyPricesByCommodity: "SELECT commoditycode as commodity, commodity.name as label, fulldate, price FROM ( SELECT commoditycode, fulldate, AVG(price) as price FROM {{{table}}} WHERE fulldate>='{{{from}}}' AND fulldate<= '{{{to}}}' AND marketcode IN ('{{{markets}}}') AND commoditycode IN ('{{{commodities}}}') GROUP BY commoditycode, fulldate ) data JOIN commodity ON (commoditycode::int = commodity.code ) ORDER BY fulldate, commodity.name",
    
    tableDailyData: 
    "SELECT {{{table}}}.gaul0code, {{{table}}}.vendorname as vendorname, {{{table}}}.citycode, city.code, {{{table}}}.price, {{{table}}}.fulldate, city.name as cityname, commodity.code, commodity.name as commodityname, {{{table}}}.commoditycode, market.code, market.name as marketname, {{{table}}}.marketcode, {{{table}}}.quantity, {{{table}}}.userid "+
            ",munit.name AS munitname, currency.name AS currencyname "+

    "FROM {{{table}}}, city, commodity, market, munit, currency "+
    "WHERE {{{table}}}.citycode = city.code "+
        "AND CAST ({{{table}}}.commoditycode as INT) = commodity.code "+
        "AND {{{table}}}.gaul0code = '{{{country}}}' "+
        "AND commodity.code = ANY('{{{anyCommodities}}}') "+
        "AND {{{table}}}.marketcode = ANY('{{{anyMarkets}}}') "+
        "AND CAST({{{table}}}.marketcode AS INT) = market.code "+
        "AND munit.code = {{{table}}}.munitcode "+
        "AND currency.code = {{{table}}}.currencycode ",

    tableAggregatedData: 
    "SELECT t.cityname,t.marketname,t.vendorname,t.commodityname, min(t.price)min,max(t.price)max, round(avg(t.price)::numeric,2)avg, t.currencyname "+
    "FROM ("+
        "SELECT {{{table}}}.gaul0code, {{{table}}}.vendorname as vendorname, {{{table}}}.citycode, city.code, {{{table}}}.price, {{{table}}}.fulldate,  city.name as cityname, commodity.code, commodity.name as commodityname, {{{table}}}.commoditycode, market.code, market.name as marketname, {{{table}}}.marketcode, {{{table}}}.quantity, {{{table}}}.userid "+
                ", currency.name AS currencyname "+
        "FROM {{{table}}}, city, commodity, market, currency "+
        "WHERE {{{table}}}.citycode = city.code "+
            "AND date>='{{{from}}}' AND date<= '{{{to}}}' "+
            "AND CAST ({{{table}}}.commoditycode as INT) = commodity.code "+
            "AND {{{table}}}.gaul0code = '{{{country}}}' "+
            "AND commodity.code = ANY('{{{anyCommodities}}}') "+
            "AND {{{table}}}.marketcode = ANY('{{{anyMarkets}}}') "+
            "AND CAST({{{table}}}.marketcode AS INT) = market.code "+
            "AND currency.code = {{{table}}}.currencycode "+
        "ORDER BY {{{table}}}.fulldate DESC ) t "+
    "GROUP BY t.cityname,t.marketname,t.vendorname,t.commodityname,t.currencyname "+
    "ORDER BY commodityname ",

    stats : "select 'entries' as name, sum(c) as value from ( select count(*) as c from data union all select count(*) as c from data_cameroon union all select count(*) as c from data_gambia ) t union all select 'markets' as name, count(*) as value from ( select distinct marketcode from ( select distinct marketcode from data union all select distinct marketcode from data_cameroon union all select distinct marketcode from data_gambia ) as t ) t2 union all select 'commodities' as name, count(*) as value from ( select distinct commoditycode from ( select distinct commoditycode from data union all select distinct commoditycode from data_cameroon union all select distinct commoditycode from data_gambia ) as t ) t2"
};
});


