var Chart = function() {
	
	var result = {
			
			id: "",
			
			/** language for the tree, default: en */
			language : "en",
			
			/** base URL for CHART service, default: fenixapps.fao.org */
			charturl : "",
			baseurl : "",
			
			commoditycodes: "",
			dates: "",
		
			initUI: function(id, language) {
				this.id = id;
				this.language = language;
				
				var _this = this;
				$.getJSON('src/config/crowdprices-configuration.json', function(data) {
					_this.baseurl = data.baseurl;
					_this.charturl = data.charturl;
				});
			},
			
			createChart: function(commoditycode, fromdate, todate, BBOX) {
				
				$('#chart-timeserie').empty();
				Utils.loadingPanel('chart-timeserie', '350px');
				this.queryDBAndCreateChart_MultipleAxes_Timeseries(commoditycode, fromdate, todate, BBOX);
				
				$('#chart').empty();
				Utils.loadingPanel('chart', '350px');
				this.queryDBAndCreateChart_MultipleAxes(commoditycode, fromdate, todate, BBOX);
				
			},
			
			/**
			 * This function initiate the user interface and links controllers to the tree
			 */
			createBarChartOLD: function(commoditycode, fromdate, todate, BBOX) {
	
				var dataURL = 'http://'+ this.baseurl +'/rest/crowdprices/data/chart/'+ commoditycode+'/'+ fromdate +'/'+ todate + '/' + BBOX + '/'  + this.language;
				
				var _this = this;
				// getting points
				$.ajax({
						type : 'GET',
						url : dataURL,
						dataType : 'json',
						success : function(response) {
							
//							console.log("response: " +response);
							
							if ( response != ''  ) {
								
								var URL = _this.baseURL();
								URL += _this.addType('type', 'column');
	
								// var title
								var title = 'Average+Daily+Price';	
								URL += _this.addValue('title', 'text', title);
								
	//		    		        "&series=" +
	//		    		        "data[name:Tokyo;49.9];" +
	//		    		        "data[name:New_York;83.6];" +
	//		    		        "data[name:Berlin;48.9];" +
	//		    		        "data[name:London;42.4];" +
								URL += "&series=";
				                for (i = 0; i < response.length; i++) {
				                	var row = response[i];
				                	// TODO: make a proper escape or url encoding
				                	var label = row[0].replace(/\'/g,'+');
				                	label = label.replace(/&/g,'+');
				                	URL += "data[name:" + label + ";" + row[1] + "];"; 	
				                }
			            
								$("#" + _this.id)
								// Sets the style of the elements to "display:none"
								    .hide()
								// Appends the hidden elements to the "posts" element
								    .empty().append("<iframe frameborder='0' width=100% height=100% " +
								    			    "src='" + URL +  
								    		        "&yaxis=title[text:Gdes/Kg]" +			    		     
								    			    "&xaxis=categories:Price" +
								    		        "&sharable=false" +
								    		        "&credits=enabled:false'>" +
								    		        "</iframe>")
								// Fades the new content into view
								    .fadeIn();
								}
							else {
								$("#" + _this.id).hide();
							}
							
						},
						error : function(err, b, c) {
							alert(err.status + ", " + b + ", " + c);
						}
					});
			},
			
			baseURL: function(id, value) {
				return "http://" + this.charturl + 
						"out=html" +
				        "&engine=highcharts" +
				        "&chart=renderto:container;";
			},
			
			addType: function(id, value) {
				return id + ":" + value;
			},
			
			addValue: function(id, type, value) {
				return "&" + id + "=" + type + ":" + value;
			},
			
			/**
			 * @param chart Parameters stored in the JSON
			 * @param type 'column', 'line'
			 * @param response Data fetch through WDS
			 */
			queryDBAndCreateChart_MultipleAxes_Timeseries : function(commoditycode, fromdate, todate, BBOX) {

				var type = 'line';
				
				var dataURL = 'http://'+ this.baseurl +'/rest/crowdprices/data/chart2/'+ commoditycode+'/'+ fromdate +'/'+ todate + '/' + BBOX + '/'  + this.language;

				$.ajax({
					type : 'GET',
					url : dataURL,
					success : function(response) {
						
						if ( response == '[]') {
							$('#chart').hide();
						}
						else {
							try {
								$('#chart').show();
								
					            var data = response;
					            if (typeof data == 'string')
					                data = $.parseJSON(response);

								
								var series = [];
								var yAxis = [];
								
								/** Initiate variables */
								var check = [];
								var mus = [];
								var ind = data[0][1];
								var count = 0;
								var maxLength = 0;
								var maxLengthIND = data[0][1];
								
								/** Re-shape data into 'vectors' */
								var vectors = {};
								vectors[ind] = {}; 
								vectors[ind].dates = [];
								vectors[ind].values = [];
								vectors[ind].mus = [];
								
								/** Create a vector for each indicator */
								for (var i = 0 ; i < data.length ; i++) {
		//							console.log("data: " +data);
									if (data[i][1] == ind) {
										count++;
										vectors[ind].dates.push(data[i][0]);
										vectors[ind].values.push(data[i][2]);
										vectors[ind].mus.push(data[i][3]);
									} else {
										check.push(count);
										if (count > maxLength) {
											maxLength = count;
											maxLengthIDX = check.length - 1;
											maxLengthIND = ind;
										}
										ind = data[i][1];
										vectors[ind] = [];
										vectors[ind].dates = [];
										vectors[ind].values = [];
										vectors[ind].mus = [];
										count = 1;
										vectors[ind].dates.push(data[i][0]);
										vectors[ind].values.push(data[i][2]);
										vectors[ind].mus.push(data[i][3]);
									}
								}
								check.push(count);
								
		//						console.log("count: " +count);
								
								/** Collect years from the longest vector */
								var years = [];
								for (var i = 0 ; i < vectors[maxLengthIND].dates.length ; i++)
									years.push(vectors[maxLengthIND].dates[i]);
								
		//						console.log("vectors: " +vectors);
								
	//							console.log("years: " +years);
								
								/** Collect measurement units */
								$.each(vectors, function(k, v) {
									if ($.inArray(vectors[k].mus[0], mus) < 0)
										mus.push(vectors[k].mus[0]);
								});
								
								/** Fill shorter vectors with 'null' values */
								$.each(vectors, function(k, v) {
									var fix = vectors[k].dates.length < maxLength;
									if (fix) {
										for (var i = 0 ; i < years.length ; i++) {
											if ($.inArray(years[i], vectors[k].dates) < 0) {
												vectors[k].dates.splice(i, 0, years[i]);
												vectors[k].values.splice(i, 0, null);
												vectors[k].mus.splice(i, 0, vectors[k].mus[0]);
											}
										}
									}
								});
								
								/** Create objects for Highcharts */
								$.each(vectors, function(k, v) {
									var s = {};
									s.name = k;
									s.type = type;
									s.yAxis = $.inArray(vectors[k].mus[0], mus);
									s.data = [];
									for (var i = 0 ; i < vectors[k].values.length ; i++) {
										if (vectors[k].values[i] != null)
											s.data.push(parseFloat(vectors[k].values[i]));
										else
											s.data.push(null);
									}
									series.push(s);
								});
								
								/** Create a Y-Axis for each measurement unit */
								for (var i = 0 ; i < mus.length ; i++) {
									var a = {};
									a.title = {};
									a.title.text = mus[i];
									a.title.style = {};
									a.title.style.color = FENIXCharts.COLORS[i];
									if (i > 0)
										a.opposite = true;
									a.labels = {};
									a.labels.style = {};
									a.labels.style.color = FENIXCharts.COLORS[i];
									yAxis.push(a);
								}
								
								/** Create chart */
								var chart = {};
								
								chart.object_parameters = {};			
								chart.object_parameters.engine = "highcharts";	
								chart.object_parameters.keyword = "FAOSTAT_DEFAULT_DOUBLE_AXES_TIMESERIES_LINE";
								chart.object_parameters.renderTo = "chart-timeserie";		
								chart.object_parameters.credits = "";
														
								chart.object_parameters.xaxis = {};
								chart.object_parameters.xaxis.rotation = -45;
								
								if ( years.length <= 30 ) {
									chart.object_parameters.xaxis.fontSize = "9px";
								}
								else if ( years.length > 30 && years.length <= 60 ) {
									chart.object_parameters.xaxis.fontSize = "8px";
								}
								else if ( years.length > 60 ) {
									chart.object_parameters.xaxis.fontSize = "7px";
								}
		
								var chart_payload = {};
								chart_payload.engine = chart.object_parameters.engine;
								chart_payload.keyword = chart.object_parameters.keyword;
								chart_payload.renderTo = chart.object_parameters.renderTo;
								chart_payload.categories = years;
								chart_payload.title = '';
								chart_payload.credits = chart.object_parameters.credits;
								chart_payload.yaxis = {};
								chart_payload.yaxis = yAxis;
								chart_payload.xaxis = {};
								if (chart.object_parameters.xaxis != null) {
									chart_payload.xaxis.rotation = chart.object_parameters.xaxis.rotation;
									chart_payload.xaxis.fontSize = chart.object_parameters.xaxis.fontSize;
								}
								chart_payload.series = series;
									
								FENIXCharts.plot(chart_payload);
							} catch(e) {	
								$('#chart').hide();
							}
						}
						
					},
					error : function(err, b, c) {
						//alert(err.status + ", " + b + ", " + c);
					}
					
					
				});	
			},
			
			/**
			 * @param chart Parameters stored in the JSON
			 * @param type 'column', 'line'
			 * @param response Data fetch through WDS
			 */
			queryDBAndCreateChart_MultipleAxes : function(commoditycode, fromdate, todate, BBOX) {
				
				var type = 'column';
				
				
				var dataURL = 'http://'+ this.baseurl +'/rest/crowdprices/data/chart/'+ commoditycode+'/'+ fromdate +'/'+ todate + '/' + BBOX + '/'  + this.language;

				$.ajax({
					type : 'GET',
					url : dataURL,
					success : function(response) {
						console.log(response);
						if ( response == '[]') {
							$('#chart-timeserie').hide();
						}
						else {
							$('#chart-timeserie').show();

							try {
					            var data = response;
					            if (typeof data == 'string')
					                data = $.parseJSON(response);
					            
								var categories = [];
								for (var i = 0 ; i < data.length ; i++) 
									if ($.inArray(data[i][0], categories) < 0)
										categories.push(data[i][0]);
								
								var seriesNumber = data.length / categories.length;
								var series = [];
								var seriesNames = [];
								
								for (var i = 0 ; i < seriesNumber ; i++) {
									seriesNames.push(data[i][1]);
									var tmp = {};
									tmp.name = null;
									tmp.data = [];
									series.push(tmp);
								}
								
								for (var i = 0 ; i < data.length ; i++) {
									series[i % seriesNumber].name = data[i][1];
									series[i % seriesNumber].data.push(parseFloat(data[i][2]));
								}
								
								/** Create chart */
								var chart = {};
								
								chart.object_parameters = {};
								chart.object_parameters.renderTo = "chart";
								chart.object_parameters.credits = "";
								
								var payload = {};
								payload.engine = 'highcharts';
								payload.keyword = 'FAOSTAT_DEFAULT_BAR';
								payload.renderTo = chart.object_parameters.renderTo;
								payload.categories = categories;
								payload.title = '';
								payload.credits = chart.object_parameters.credits;
								payload.series = series;
								payload.yaxis = {};
								payload.yaxis.min = null;
								payload.yaxis.max = null;
								payload.yaxis.step = null;
								payload.yaxis.title = data[0][3];
								
								FENIXCharts.plot(payload);
							} catch(e) {
								$('#chart-timeserie').hide();
							}
						}
					
					},
					error : function(err, b, c) {
						//alert(err.status + ", " + b + ", " + c);
					}
				});	
			}
				
		};
	return result;
}
