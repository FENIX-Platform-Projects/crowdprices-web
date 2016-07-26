/*global define*/
define(function () {

    'use strict';

   return {
       chart_1 : {

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
               text: 'Daily Prices',
               style: {
                   fontFamily: "Roboto",
                   fontSize: '12px'
               }
           },

           credits: false,

           yAxis: {
               labels: {
                   formatter: function () {
                       return (this.value > 0 ? ' + ' : '') + this.value + '%'
                   },
                   style: {
                       fontFamily: "Roboto",
                       fontSize: '10px'
                   }

               },
               plotLines: [{
                   value: 0,
                   width: 2,
                   color: 'silver'
               }]
           },

           plotOptions: {
               series: {
                   compare: 'percent'
               }
           },

           tooltip: {
               pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y} ' + currency + '/' + munit + '</b> ({point.change}%) <br/>',
               valueDecimals: 2
           }
       },
       chart_2 : {
           chart: {
               type: 'column'
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
               text: 'Average Prices',

               style: {
                   fontFamily: "Roboto",
                   fontSize: '12px'
               }

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
               labels: {
                   formatter: function () {
                       return this.value + ' ';
                   },
                   style: {
                       fontFamily: "Roboto",
                       fontSize: '10px'
                   }
               },
               plotLines: [{
                   value: 0,
                   width: 2,
                   color: 'silver'
               }]
           },
           tooltip: {
               pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y} ' + currency + '/' + munit + '</b> <br/>',
               valueDecimals: 2
           },
           plotOptions: {
               column: {
                   pointPadding: 0.2,
                   borderWidth: 0,

               },
               series: {}
           }
       },

   }
});
