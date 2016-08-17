/*global define*/
define([
    'config/config'
], function (C) {

    'use strict';

    return {

        aggregatedData: {
            columns: [{
                field: 'cityname',
                title: 'City',
                sortable: true,
                searchable: true
            }, {
                field: 'marketname',
                title: 'Market',
                sortable: true,
                searchable: true
            }, {
                field: 'vendorname',
                title: 'Vendor',
                sortable: true,
                searchable: true
            }, {
                field: 'commodityname',
                title: 'Commodity',
                sortable: true,
                searchable: true
            }, {
                field: 'avg',
                title: 'Average',
                sortable: true
            }, {
                field: 'min',
                title: 'Minimum',
                sortable: true
            }, {
                field: 'max',
                title: 'Maximum',
                sortable: true
            }, {
                field: 'currencyname',
                title: 'Currency',
                sortable: true
            }],
            pagination: true,
            search: true,
            sortable: true
        },

        rawData : {
            columns: [{
                field: 'cityname',
                title: 'City',
                sortable: true,
                searchable: true
            }, {
                field: 'marketname',
                title: 'Market',
                sortable: true,
                searchable: true
            }, {
                field: 'vendorname',
                title: 'Vendor',
                sortable: true,
                searchable: true
            }, {
                field: 'commodityname',
                title: 'Commodity',
                sortable: true,
                searchable: true
            }, {
                field: 'price',
                title: 'Price',
                sortable: true
            }, {
                field: 'quantity',
                title: 'Quantity',
                sortable: true
            }, {
                field: 'munitname',
                title: 'Unit',
                sortable: true
            }, {
                field: 'currencyname',
                title: 'Currency',
                sortable: true
            }, {
                field: 'fulldate',
                title: 'Date',
                sortable: true,
                searchable: true
            }, {
                field: 'userid',
                title: 'User',
                sortable: true,
                searchable: true
            }],
            pagination: true,
            search: true,
            sortable: true

        },

        dailyData : {
            columns: [{
                field: 'cityname',
                title: 'City',
                sortable: true,
                searchable: true
            }, {
                field: 'marketname',
                title: 'Market',
                sortable: true,
                searchable: true
            }, {
                field: 'vendorname',
                title: 'Vendor',
                sortable: true,
                searchable: true
            }, {
                field: 'commodityname',
                title: 'Commodity',
                sortable: true,
                searchable: true
            }, {
                field: 'price',
                title: 'Price',
                sortable: true
            }, {
                field: 'quantity',
                title: 'Quantity',
                sortable: true
            }, {
                field: 'munitname',
                title: 'Unit',
                sortable: true
            }, {
                field: 'currencyname',
                title: 'Currency',
                sortable: true
            }, {
                field: 'fulldate',
                title: 'Date',
                sortable: true,
                searchable: true
            }, {
                field: 'userid',
                title: 'User',
                sortable: true,
                searchable: true
            }],
            pagination: true,
            search: true,
            sortable: true

        }
    }
});
