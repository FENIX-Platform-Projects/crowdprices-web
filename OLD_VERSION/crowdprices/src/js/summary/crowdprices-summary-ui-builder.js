var CrowdpricesSummaryUIBuilder = function() {

	var result = {
			
		mapObj : "",
			
		theme : "energyblue",

		source : [],
		
		/** base URL for WDS, default: fenixapps.fao.org */
		baseurl : "",
		
		/** language for the tree, default: en */
		language : "e",
		
		/** sends the request to the map after all the UI is initialized **/
		initializedUI : 1,
		counterUI : 0,
		
		/** dropdowns **/
		dateDD : "dateDD",
		
		/** items to pass to the spatial query **/
		dateItem: "",
	
		initUI : function(language) {
			this.language = language;
			
			//if ($.url().param('language') != null) {
			//	CrowdpricesUIBuilder.language = $.url().param('language');
			//} else { 
			//	CrowdpricesUIBuilder.language = 'en';
			//}
			
			var _this = this;
			$.getJSON('src/config/crowdprices-configuration.json', function(data) {
				
				_this.baseurl = data.baseurl;
				
				_this.populateDropDown("date", _this.dateDD);
				
			});
		},
		
		populateDropDown : function(codingSystem, dropDownID) {
			var _this = this;
			$.ajax({
				type: 'GET',
				url: 'http://' + _this.baseurl + '/rest/crowdprices/codes/' + codingSystem + '/' + _this.language,
				dataType: 'json',
				
				success : function(response) {
					
					var data = new Array();
					for (var i = 0 ; i < response.length ; i++) {
						var row = {};
						row["code"] = response[i][0];
						row["label"] = response[i][1];
						data[i] = row;
						//alert("data: " + response[i][0]);
					}
					//alert("data: " + data);
					var source = {
						localdata: data,
		                datatype: "array"
		            };
					//alert("source: " + source);
					var dataAdapter = new $.jqx.dataAdapter(source);
					//alert("dataAdapter: " + dataAdapter);
	                //$("#commodityDD").jqxDropDownList({ width: '200px', height: '25px'});
					 $("#" + dropDownID).jqxDropDownList({
						width : 200,
						height : 25,
						source : dataAdapter,
						displayMember: "label",
						valueMember: "code",
						selectedIndex: 0
					});		
					 
					// sends the request to the map
					 _this.counterUI++;
					if (  _this.counterUI == _this.initializedUI ) {
						_this.getSummaryData();
					}
				},
				error : function(err,b,c) {
					alert(err.status + ", " + b + ", " + c);
				}
			});
		},
		
		getSummaryData : function() {
			var _this = this;
			// bind to 'unselect' and 'select' events
			this.dateItem = $("#"+ this.dateDD).jqxDropDownList('getSelectedItem'); 
			$('#'+ this.dateDD).bind('select', function (event) {
				var date = event.args;
				_this.dateItem = $('#'+ _this.dateDD).jqxDropDownList('getItem', date.index);
				_this.callDataService(_this.dateItem.value);
            });
           
			this.callDataService(this.dateItem.value);
		},

		callDataService : function(dates) {
			
			// getting points
			var _this = this;
			$.ajax({
					type : 'GET',
					url : 'http://'+ _this.baseurl +'/rest/crowdprices/data/summary/null/'+ dates + '/fr',
					dataType : 'json',
					success : function(response) {
						//console.log(response);
						
						// TODO: make it dynamic and multilanguage
						var headers = new Array();
						headers[0] = "Market";
						headers[1] = "Commodity";
						headers[2] = "Variety";
						headers[3] = "Measurement Unit";
						headers[4] = "Unit";
						headers[5] = "Currency";
						headers[6] = "Price";
						
						$("#summarytable").empty();
						$("#summarytable").append(ConvertJsonToTable(response, "tablestyle", headers));
					},
					error : function(err, b, c) {
						alert(err.status + ", " + b + ", " + c);
					}
				});
			}

	};
	
	return result;
}