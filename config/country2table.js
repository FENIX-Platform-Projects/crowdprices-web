/*global define*/
define(function() {
	
    'use strict';

	var map = {
		"1":  "data_1",		//afghanistan
		"45": "data_45",	
		"90": "data_90",
/*		"1":  "data_afghanistan",
		"45": "data_cameroon",	
		"90": "data_gambia"
*/
	};

	return function(code) {
		return map[''+code];
	};
});
