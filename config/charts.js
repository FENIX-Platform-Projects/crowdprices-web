/*global define*/
define([
    'config/config'
], function (C) {

    'use strict';

    return {

        dailyPrices: {

            chart: {
                style: {
                    fontFamily: 'FrutigerLTW02-45Light',

                },
                backgroundColor:'rgba(255, 255, 255, 0)'
            },

            rangeSelector: {
                selected: 4
            },
            colors: [ //Colori delle charts
                '#3faaaa',
                '#76BE94',
                '#744490',
                '#E10079',
                '#2D1706',
                '#F1E300',
                '#F7AE3C',
                '#DF3328'
            ],
            title: {
                text: null

            },

            credits: false,

            yAxis: {
                labels: {
                    formatter: function () {
                        return (this.value > 0 ? ' + ' : '') + this.value + '%'
                    }


                },
                plotLines: [{
                    value: 0,
                    width: 2,
                    color: 'silver'
                }]
            },
            xAxis: {
                labels: {



                }
            },

            plotOptions: {
                series: {
                    compare: 'percent'
                }
            },

            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y} ' + C.currency + '/' + C.um + '</b> ({point.change}%) <br/>',
                valueDecimals: 2
            }
        },

        averagePrices: {
            chart: {
                type: 'column',
                style: {
                    fontFamily: 'FrutigerLTW02-45Light',
                    fontSize: '1px'
                },
                backgroundColor:'rgba(255, 255, 255, 0)'

            },

            colors: [ //Colori delle charts
                '#3faaaa',
                '#76BE94',
                '#744490',
                '#E10079',
                '#2D1706',
                '#F1E300',
                '#F7AE3C',
                '#DF3328'
            ],
            title: {
                text: null



            },
            xAxis: {
                title: {
                    text: null
                },
                labels: {
                    enabled: false
                }
            },




            credits: false,

            yAxis: {

                title: {


                },

                labels: {
                    formatter: function () {
                        return this.value + ' ';
                    },

                },
                plotLines: [{
                    value: 0,
                    width: 2,
                    color: 'silver'
                }]
            },
            legend: {

                itemMarginTop: 5,
                itemMarginBottom: 5

            },
            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y} ' + C.currency + '/' + C.um + '</b> <br/>',
                valueDecimals: 2
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0

                },
                series: {}
            }
        }
    }
});
