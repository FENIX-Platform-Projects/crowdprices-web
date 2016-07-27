/*global define*/

define(function () {

    'use strict';

    return {

        countries: {

            selector: {
                id: "dropdown",
                config: {
                    maxItems: 1
                }
            }
        },

        markets: {

            selector: {
                id: "dropdown",
                source: [
                    {value: "item_1", label: "Item 1"},
                    {value: "item_2", label: "Item 2"}
                ],
                config: {
                    plugins: ['remove_button'],
                    mode: 'multi'
                }
            }
        },

        commodities: {

            selector: {
                id: "dropdown",
                default : ["0"],
                config: {
                    maxItems: 10,
                    plugins: ['remove_button'],
                    mode: 'multi'
                }
            }
        },

        time: {

            selector: {
                id: "range",
                config: {
                    min: 100,
                    max: 200,
                    type: "double"
                }
            }
        }
    };
});