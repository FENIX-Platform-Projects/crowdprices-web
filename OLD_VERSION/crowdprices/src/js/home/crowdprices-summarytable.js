var CrowdpricesSummaryTable = function(id) {

	var result = {

		id : "",

		/** base URL for WDS, default: fenixapps.fao.org */
		baseurl : "",

		/** language for the tree, default: en */
		language : "en",

		// commodities
		commoditycodes : "",
		dates : "",

		dataAdapter : "",
		
		dataAdapterAggregated : "",
		
		source: "",
		
		sourceAggregated: "",
		
		isGridCreated: false,
		
		isGridAggregatedCreated: false,

		initUI : function(id, language) {
			this.id = id;
			this.language = language;

			var _this = this;
			$.getJSON('src/config/crowdprices-configuration.json', function(data) {
				_this.baseurl = data.baseurl;
			});
		},
		
		updateGrid : function(commoditycode, fromdate, todate, BBOX) {
			this.updateSummaryTableGrid(commoditycode, fromdate, todate, BBOX);
			this.updateSummaryTableGridAggregated(commoditycode, fromdate, todate, BBOX);
		},

		
		updateSummaryTableGrid : function(commoditycode, fromdate, todate, BBOX) {

			var URL = 'http://' + this.baseurl
			+ '/rest/crowdprices/data/summary2/' + commoditycode + '/'
			+ fromdate + '/' + todate + '/' + BBOX + '/'
			+ this.language;
			
			

			// prepare the data
			this.source = {
				datatype : "json",
				datafields : [ {
					name : '0',
					type : 'string'
				}, {
					name : '1',
					type : 'string'
				}, {
					name : '2',
					type : 'string'
				}, {
					name : '3',
					type : 'string'
				}, 
				{
					name : '4',
					type : 'string'
				},
				{
					name : '5',
					type : 'string'
				}, {
					name : '6',
					type : 'double'
				} 
				],
				url : URL
			};
		
			this.dataAdapter = new $.jqx.dataAdapter(this.source);
			
			if ( !this.isGridCreated ) {
				this.createGrid();
				this.isGridCreated = true;
			}
			else {
				this.dataAdapter = new $.jqx.dataAdapter(this.source);
				$("#table").jqxGrid({
					source : this.dataAdapter
				});
			}
		},
		
		createGrid: function() {
			$("#table").jqxGrid({
				width : "880px",
//				autowidth : true,
				height: "400px",
//				autoheight : true,
				source : this.dataAdapter,
				columnsresize : true,
				sortable : true,
				filterable : true,
				pageable : false,
				groupable : true,
				showfilterrow: true,
				
				pagesize : 20,
				pagesizeoptions : [ '20', '50', '100' ],
				showfiltercolumnbackground : true,
				autoshowfiltericon : false,
				columns : [ {
//					text : 'City',
//					datafield : '0',
//					filtertype : 'checkedlist',
//					filtercondition : 'contains'
//					,	width: 132
//				}, {
//					text : 'Market',
//					datafield : '1',
//					filtertype : 'checkedlist',
//					filtercondition : 'contains'
//					,	width: 132 
//				}, {
//					text : 'Commodity',
//					datafield : '2',
//					filtertype : 'checkedlist',
//					filtercondition : 'contains'
//					,	width: 132 
//				}, {
//					text : 'Variety',
//					datafield : '3',
//					filtertype : 'checkedlist',
//					filtercondition : 'contains'
//					,	width: 132 						
//				}, {
//					text : 'Date',
//					datafield : '4'
//					,	width: 132 						
//				}, {
//					text : 'Measurement Unit',
//					datafield : '5'
//					,	width: 132 
//				}, {
//					text : 'Price',
//					datafield : '6'
//					,	width: 132 
					
					text : 'Commodity',
					datafield : '0',
					filtertype : 'checkedlist',
					filtercondition : 'contains'
					,	width: 150 
				},
 /**{
					text : 'Variety',
					datafield : '1',
					filtertype : 'checkedlist',
					filtercondition : 'contains'
					,	width: 215 						
				},**/
 {
					text : 'Date',
					datafield : '2'
					,	width: 100 						
				}, {
					text : 'Measurement Unit',
					datafield : '3',
					filtertype : 'checkedlist',
					filtercondition : 'contains'
					,	width: 160 
				}, {
					text : 'Average Price',
					datafield : '4'
					,	width: 150 
				}, {
					text : 'Minimum Price',
					datafield : '5'
					,	width: 150 
				}, {
					text : 'Maximum Price',
					datafield : '6'
					,	width: 150 
				} 


				]
			});
		},
		
		updateSummaryTableGridAggregated : function(commoditycode, fromdate, todate, BBOX) {

			var URL = 'http://' + this.baseurl
			+ '/rest/crowdprices/data/summaryaggregated/' + commoditycode + '/'
			+ fromdate + '/' + todate + '/' + BBOX + '/'
			+ this.language;
			
//			console.log(URL);

			// prepare the data
			this.sourceAggregated = {
				datatype : "json",
				datafields : [ {
					name : '0',
					type : 'string'
				}, {
					name : '1',
					type : 'string'
				}, {
					name : '2',
					type : 'string'
				}, {
					name : '3',
					type : 'string'
				}, {
					name : '4',
					type : 'string'
				}, {
					name : '5',
					type : 'double'
				}, {
					name : '6',
					type : 'double'
				}, {
					name : '7',
					type : 'double'
				}
//				, {
//					name : '6',
//					type : 'double'
//				} 
				],
				url : URL
			};
		
			this.dataAdapterAggregated = new $.jqx.dataAdapter(this.sourceAggregated);
			
			if ( !this.isGridAggregatedCreated ) {
				this.createGridAggregated();
				this.isGridAggregatedCreated = true;
			}
			else {
				this.dataAdapterAggregated = new $.jqx.dataAdapter(this.sourceAggregated);
				$("#tableAggregated").jqxGrid({
					source : this.dataAdapterAggregated
				});
			}
			
			
		},
		
		createGridAggregated: function() {
			$("#tableAggregated").jqxGrid({
				width : "880px",
				height: "400px",
//				autoheight : true,
				source : this.dataAdapterAggregated,
				columnsresize : true,
				sortable : true,
				filterable : true,
				pageable : false,
				groupable : true,
				showfilterrow: true,
				
				pagesize : 20,
				pagesizeoptions : [ '20', '50', '100' ],
				showfiltercolumnbackground : true,
				autoshowfiltericon : false,
				columns : [ 
				{
					text : 'City',
					datafield : '0',
					filtertype : 'checkedlist',
					filtercondition : 'contains'
					,	width: 140 
				}, 
				{
					text : 'Market',
					datafield : '1',
					filtertype : 'checkedlist',
					filtercondition : 'contains'
					,	width: 140 
				}, {
					text : 'Commodity',
					datafield : '2',
					filtertype : 'checkedlist',
					filtercondition : 'contains'
					,	width: 170 	
				},
 /**{
					text : 'Variety',
					datafield : '3',
					filtertype : 'checkedlist',
					filtercondition : 'contains'
						
					,	width: 185 
				}, **/
{
					text : 'Measurement Unit',
					datafield : '4',
					filtertype : 'checkedlist',
					filtercondition : 'contains'
					,	width: 130 
				}, {
					text : 'Average Price',
					datafield : '5'
					,	width: 100 
				}, {
					text : 'Minimum Price',
					datafield : '6'
					,	width: 100 
				}, {
					text : 'Maximum Price',
					datafield : '7'
					,	width: 100 
				}
//				, {
//					text : 'DN',
//					datafield : '6',
//					filtertype : 'textbox',
//					filtercondition : 'contains'
//				} 
				]
			});
		}

	};

	return result;
}
