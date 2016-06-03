var CrowdpricesUIBuilder = function() {

	var result = {
			
		//crowdpricesObj : "",
			
	//	mapObj : "",
			
		theme : "energyblue",

		source : [],
		
		/** base URL for WDS, default: fenixapps.fao.org */
		baseurl : "",
		
		/** language  */
		//language : "",
		
		/** sends the request to the map after all the UI is initialized **/
		initializedUI : 2,
		counterUI : 0,
		
		/** dropdowns **/
		commodityDD : "commodityDD",
		dateDD : "dateDD",
		dateFromDD : "dateFromDD",
		dateToDD : "dateToDD",
		
		/** items to pass to the spatial query **/
		commodityItem : "",
		fromdate: "",
		todate: "",
		
		count: "",
	
		initUI : function(crowdpricesObj, mapObj, language) {			
			var _this = this;
			$.getJSON('src/config/crowdprices-configuration.json', function(data) {
				_this.baseurl = data.baseurl;				
				_this.populateDropDown("commodity", _this.commodityDD);
//				_this.populateDropDown("date", _this.dateDD);	
				_this.populateSlider("date");
//				_this.populateDropDownYears("date", _this.dateFromDD, _this.dateToDD);
				
//				$("#date-range").rangeSlider();
//				$("#date-range").rangeSlider({bounds:{min: 2000-20-31, max: 2050}}, {defaultValues: {min: 1961, max: 2010}}, {step: 1});
				// Set date option
			});
		},
		
		populateDropDown : function(codingSystem, dropDownID) {
			var _this = this;
			$.ajax({
				type: 'GET',
				url: 'http://' + _this.baseurl + '/rest/crowdprices/codes/' + codingSystem + '/' + Crowdprices.language,
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
					
					var width = $("#" + dropDownID).width();
					$("#" + dropDownID).jqxDropDownList({
						checkboxes: true,
						width : width,
						height : 25,
						source : dataAdapter,
						displayMember: "label",
						valueMember: "code"
					});		
					$("#" + dropDownID).jqxDropDownList('checkIndex', 0);
					
					$("#" + dropDownID).on('checkChange', function (event) {
						_this.updateValues();
		            });

					 
					// sends the request to the map
					 _this.counterUI++;
					if (  _this.counterUI == _this.initializedUI ) {
						_this.updateValues();
					}
				},
				error : function(err,b,c) {
					//alert(err.status + ", " + b + ", " + c);
				}
			});
		},
		
		populateSlider: function(codingSystem) {
			
			var _this = this;
			$.ajax({
				type: 'GET',
				url: 'http://' + _this.baseurl + '/rest/crowdprices/codes/' + codingSystem + '/' + Crowdprices.language,
				dataType: 'json',
				success : function(response) {
					
					// TODO: get only max e min
					var max = response[0][0];
					var min = response[response.length-1][0];
					
//					console.log("max: " + max);
					
					max = Utils.replaceAll(max, '-', ',');
					min = Utils.replaceAll(min, '-', ',');
					
//					console.log("max: " + max);
					
					$("#dateSlider").dateRangeSlider({
						bounds:{ min: new Date(min), max: new Date(max)}},
						{defaultValues: {min: new Date(max), max: new Date(min)}}, 
						{step: 1}
					);
					
				      var values = $("#dateSlider").dateRangeSlider("values");		
					_this.fromdate = (1900 + values.max.getYear()) + "-" + (values.max.getMonth() + 1) + "-" +  values.max.getDate();
					_this.todate = (1900 + values.min.getYear()) + "-" + (values.min.getMonth() + 1) + "-" +  values.min.getDate();

						// This event will not ne fired
					$("#dateSlider").bind("userValuesChanged", function(e, data){
						_this.updateTimerange();		
					});
						
					// sends the request to the map
					 _this.counterUI++;
					if (  _this.counterUI == _this.initializedUI ) {
						_this.updateValues();
					}
				},
				error : function(err,b,c) {
					//alert(err.status + ", " + b + ", " + c);
				}
			});
		},
		
		
		populateDropDownYears : function(codingSystem, fromDateID, toDateID) {
			var _this = this;
			$.ajax({
				type: 'GET',
				url: 'http://' + _this.baseurl + '/rest/crowdprices/codes/' + codingSystem + '/' + Crowdprices.language,
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
					
					var width = $("#" + fromDateID).width();
					$("#" + fromDateID).jqxDropDownList({
						width : width,
						height : 25,
						source : dataAdapter,
						displayMember: "label",
						valueMember: "code",
						selectedIndex: 0
					});		
					
					var width = $("#" + toDateID).width();
					$("#" + toDateID).jqxDropDownList({
						width : width,
						height : 25,
						source : dataAdapter,
						displayMember: "label",
						valueMember: "code",
						selectedIndex: 0
					});	
					 
					// sends the request to the map
					 _this.counterUI++;
					if (  _this.counterUI == _this.initializedUI ) {
						_this.updateValues();
					}
				},
				error : function(err,b,c) {
					alert(err.status + ", " + b + ", " + c);
				}
			});
		},
		
		updateTimerange: function() {
			
		     var values = $("#dateSlider").dateRangeSlider("values");		
		     this.fromdate = (1900 + values.min.getYear()) + "-" + (values.min.getMonth() + 1) + "-" +  values.min.getDate();
		     this.todate = (1900 + values.max.getYear()) + "-" + (values.max.getMonth() + 1) + "-" +  values.max.getDate();
//				console.log("----fromdate: " + this.fromdate);
//				console.log("----todate: " +this.todate);
		     this.updateView();
		},
		
		updateValues: function() {
			var items = $("#" + this.commodityDD).jqxDropDownList('getCheckedItems');
            var checkedItems = "";
            $.each(items, function (index) {
                checkedItems += this.value + ",";                          
            });
            checkedItems = checkedItems.substring(0, checkedItems.length-1);
            this.commodityItem = checkedItems;
			
            this.updateView();
		},
		
		// Updates the map
		updateView : function() { 
			
			if ( this.commodityItem != '' && this.fromdate != '' && this.todate != '')
				Crowdprices.updateSelection(this.commodityItem, this.fromdate, this.todate);
			else if ( this.commodityItem == '' )
				alert("Please select at least one commodity");

		},
	
		getCount: function(commoditycode, dates) {			
				var URL = 'http://'+ this.baseurl +'/rest/crowdprices/data/count/'+ commoditycode+'/'+ dates;
			
				var _this = this;
				$.ajax({
						type : 'GET',
						url : URL,
						dataType : 'json',
						success : function(response) {
							_this.count = response[0][0];
						},
						error : function(err, b, c) {
							alert(err.status + ", " + b + ", " + c);
						}
					});
		},
			
		checkUpdates: function(commoditycode, dates) {
			var URL = 'http://'+ this.baseurl +'/rest/crowdprices/data/count/'+ commoditycode+'/'+ dates;
			
			var _this = this;
			$.ajax({
					type : 'GET',
					url : URL,
					dataType : 'json',
					success : function(response) {
						// update the view if the number of values is changed
						if ( _this.count != response[0][0] ) {
							_this.updateView();
						}
					},
					error : function(err, b, c) {
						alert(err.status + ", " + b + ", " + c);
					}
				});
		},
	};
	
	return result;
}
