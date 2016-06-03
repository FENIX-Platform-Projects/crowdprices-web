if (!window.Crowdprices) {
				
		window.Crowdprices = {
			
		uiObj : "",
		mapObj : "",	
		summarytableOBj : "",
		chartObj : "",
			
		theme : "energyblue",
		
		/** base URL for WDS, default: fenixapps.fao.org */
		baseurl : "",
		
		/** language, default: fr (French) */
		language : "en",
		
		commoditycode: "",
		
		fromdate: "",
		
		todate: "",
		

		/**
		 * This function initiate the user interface and links controllers to the tree
		 */
		initUI : function() {
			
			// Setting up the constants
			var _this = this;
			$.getJSON('src/config/crowdprices-configuration.json', function(data) {
				_this.baseurl = data.baseurl;
			});
			
			// init map
			mapObj = new CrowdpricesMap();
			mapObj.initUI('map', this.language);
			
			/** Tooltip **/
			$('#map').powerTip({placement: 's'});
			
			// init summarytable
			summarytableOBj = new CrowdpricesSummaryTable();
			summarytableOBj.initUI('summarytable',  this.language);
			
			// init chart
			chartObj = new Chart();
			chartObj.initUI('chart', this.language);
			
			// init interface
			uiObj = new CrowdpricesUIBuilder();
			uiObj.initUI(this, mapObj, this.language);
			

		},
		
		updateSelection: function(commoditycode, fromdate, todate) {
			this.commoditycode = commoditycode;
			this.fromdate = fromdate;
			this.todate = todate;
			this.updateAll();
		},
		
		updateAll: function() {
			mapObj.getPoints(this.commoditycode, this.fromdate, this.todate);
			var BBOX = mapObj.getBBOX();
			summarytableOBj.updateGrid(this.commoditycode, this.fromdate, this.todate, BBOX);
			chartObj.createChart(this.commoditycode, this.fromdate, this.todate, BBOX);
		},
		
//		updateMap: function(commoditycode, date) {
//			mapObj.getPoints(commoditycode, date);
//		},
//		
//		updateSummaryTable: function(commoditycode, commoditylabel,date) {
//			var BBOX = mapObj.getBBOX();
//			summarytableOBj.updateSummaryTable(commoditycode, commoditylabel, date, BBOX);
//		},
//		
//		updateChart: function(commoditycode, date) {
//			chartObj.createChart(commoditycode, date);
//		},
		
	};
}
