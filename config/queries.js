/*global define*/
define(function () {

    'use strict';

    return {

        commodities: "SELECT code as value, name as label FROM commodity", // WHERE gaul0={{{country}}}
        countries: "SELECT code as value, name as label FROM gaul0",
        markets: "SELECT code as value, name as label FROM market WHERE gaul0={{{country}}} ORDER BY code",
        time: "SELECT min(fulldate) as from, max(fulldate) as to FROM {{{table}}} WHERE marketcode IN ('{{{markets}}}') AND commoditycode IN ('{{{commodities}}}') AND gaul0code = {{{country}}}",
        mapInit: "SELECT parentcode, code, name, lang, shown, lat, lon, gaul0 FROM market WHERE gaul0={{{country}}} ORDER BY code",

        mapUpdate_BACKUP: "SELECT AVG(price), COUNT(price), marketcode FROM {{{table}}} WHERE marketcode IN ('{{{markets}}}') AND date>='{{{from}}}' AND date<= '{{{to}}}' {{#if wkt}} AND ST_contains(ST_GeomFromText('{{{wkt}}}',4326),geo) {{/if}} GROUP BY marketcode ORDER BY marketcode",
        mapUpdate:
            "SELECT avg, count, marketcode, munitcode, commoditycode, commodity.name as commodityname "+
            " FROM("+
                "SELECT AVG(price), COUNT(price), marketcode, munitcode, commoditycode "+
                "FROM {{{table}}} "+
                "WHERE "+
                    "marketcode IN ('{{{markets}}}') "+
                    "AND commoditycode IN ('{{{commodities}}}') "+
                    "AND date>='{{{from}}}' AND date<= '{{{to}}}' "+
                    "{{#if wkt}} AND ST_contains(ST_GeomFromText('{{{wkt}}}',4326),geo) {{/if}} "+
                "GROUP BY marketcode, munitcode, commoditycode "+
                "ORDER BY marketcode, munitcode, commoditycode ) tmp "+
            "JOIN commodity ON tmp.commoditycode = commodity.code::VARCHAR ",
/*  //DEBUG
SELECT avg, count, marketcode, munitcode, commoditycode, name as commodityname 
FROM(
    SELECT AVG(price), COUNT(price), marketcode, munitcode, commoditycode
    FROM data_afghanistan 
    WHERE marketcode IN ('103','102','104','101','98','99','95','96','100','97') 
        AND date>='2016-05-01' 
        AND date<= '2016-06-29'  
        GROUP BY marketcode, munitcode, commoditycode
        ORDER BY marketcode, munitcode, commoditycode ) tmp 
JOIN commodity ON tmp.commoditycode = commodity.code::VARCHAR
*/
        chartsAveragePricesByCommodity: "SELECT commoditycode as commodity, commodity.name as label, price FROM ( SELECT commoditycode, AVG(price) as price FROM {{{table}}} WHERE date>='{{{from}}}' AND date<= '{{{to}}}' AND marketcode IN ('{{{markets}}}') AND commoditycode IN ('{{{commodities}}}') GROUP BY commoditycode ) data JOIN commodity ON (commoditycode::int = commodity.code ) ORDER BY commodity.name",
        chartsDailyPricesByCommodity: "SELECT commoditycode as commodity, commodity.name as label, fulldate, price FROM ( SELECT commoditycode, fulldate, AVG(price) as price FROM {{{table}}} WHERE fulldate>='{{{from}}}' AND fulldate<= '{{{to}}}' AND marketcode IN ('{{{markets}}}') AND commoditycode IN ('{{{commodities}}}') GROUP BY commoditycode, fulldate ) data JOIN commodity ON (commoditycode::int = commodity.code ) ORDER BY fulldate, commodity.name",
        tableDailyData: "SELECT {{{table}}}.gaul0code, {{{table}}}.vendorname as vendorname, {{{table}}}.citycode, city.code, {{{table}}}.price, {{{table}}}.fulldate, city.name as cityname, commodity.code, commodity.name as commodityname, {{{table}}}.commoditycode, market.code, market.name as marketname, {{{table}}}.marketcode, {{{table}}}.quantity, {{{table}}}.userid FROM {{{table}}}, city, commodity, market WHERE {{{table}}}.citycode = city.code AND CAST ({{{table}}}.commoditycode as INT) = commodity.code AND {{{table}}}.gaul0code = '{{{country}}}' AND commodity.code = ANY('{{{anyCommodities}}}') AND {{{table}}}.marketcode = ANY('{{{anyMarkets}}}') AND CAST({{{table}}}.marketcode AS INT) = market.code",
        tableAggregatedData: "SELECT t.cityname,t.marketname,t.vendorname,t.commodityname, min(t.price)min,max(t.price)max, round(avg(t.price)::numeric,2)avg FROM (SELECT {{{table}}}.gaul0code, {{{table}}}.vendorname as vendorname, {{{table}}}.citycode, city.code, {{{table}}}.price, {{{table}}}.fulldate,  city.name as cityname, commodity.code, commodity.name as commodityname, {{{table}}}.commoditycode, market.code, market.name as marketname, {{{table}}}.marketcode, {{{table}}}.quantity, {{{table}}}.userid FROM {{{table}}}, city, commodity, market WHERE {{{table}}}.citycode = city.code AND date>='{{{from}}}' AND date<= '{{{to}}}' AND CAST ({{{table}}}.commoditycode as INT) = commodity.code AND {{{table}}}.gaul0code = '{{{country}}}' AND commodity.code = ANY('{{{anyCommodities}}}') AND {{{table}}}.marketcode = ANY('{{{anyMarkets}}}') AND CAST({{{table}}}.marketcode AS INT) = market.code ORDER BY {{{table}}}.fulldate DESC ) t GROUP BY t.cityname,t.marketname,t.vendorname,t.commodityname ORDER BY commodityname",
        stats : "select 'entries' as name, sum(c) as value from ( select count(*) as c from data union all select count(*) as c from data_cameroon union all select count(*) as c from data_gambia ) t union all select 'markets' as name, count(*) as value from ( select distinct marketcode from ( select distinct marketcode from data union all select distinct marketcode from data_cameroon union all select distinct marketcode from data_gambia ) as t ) t2 union all select 'commodities' as name, count(*) as value from ( select distinct commoditycode from ( select distinct commoditycode from data union all select distinct commoditycode from data_cameroon union all select distinct commoditycode from data_gambia ) as t ) t2"
    };

});


