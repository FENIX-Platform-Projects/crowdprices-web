var CrowdpricesSummary = function() {
	
	var result = {
			
		uiObj : "",
			
		theme : "energyblue",
		
		/** base URL for WDS, default: fenixapps.fao.org */
		baseurl : "",
		
		/** language, default: e (english) */
		language : "e",
		

		/**
		 * This function initiate the user interface and links controllers to the tree
		 */
		initUI : function() {
			// TODO: get the language
			//if ($.url().param('language') != null) {
			//	Crowdprices.language = $.url().param('language');
			//} else { 
			//	Crowdprices.language = 'e';		
			//}
			
			// Setting up the constants
			var _cp = this;
			$.getJSON('src/config/crowdprices-configuration.json', function(data) {
				_cp.baseurl = data.baseurl;
			});

			
			// init interface
			uiObj = new CrowdpricesSummaryUIBuilder();
			uiObj.initUI(this.language);
		
			
			
			//Crowdprices.mapObj = CrowdpricesMap;
			//Crowdprices.mapObj.initUI("map");
			
			//Crowdprices.mapObj2 = CrowdpricesMap;
			//Crowdprices.mapObj.initUI("map2");
		}
	};
	
	return result;
}