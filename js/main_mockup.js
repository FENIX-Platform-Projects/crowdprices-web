$( document ).ready(function() {
	var itemToInit = 3;
	var counterUI = 0;
	var map = null;
	var markers = null;
	var munit = "Kg";
	var currency = "USD";
	var allAddressPoints = [];
	
	var controlSearch  = null;
	var addressSearch = null; 
	
	var globalURI = "http://fenixapps2.fao.org/restsql-0.8.8/res/"
	//var globalURI = "http://168.202.28.127:8080/restsql-0.8.8/res/"
	
	// WDS
	var WDSURI =  "http://fenixapps2.fao.org/wds-5.2.1/rest/crud/";
	var DATASOURCE = "CROWD";
	//var WDSURI =  "http://168.202.28.127:8080/wds/rest/crud/";
	//var DATASOURCE = "DEV";
	
	/*
	var initLatLon = [-6.816330, 39.276638];	
	var initGaul = 257
	var nations = [257];
	*/

	var initLatLon = [13.453 , -16.578];
	var initGaul = 90;
	var nations = [90];
	
	//console.log("UPD");

	var allDatas = [];
	var allCity = [];
	var allMarket = [];
	var allCommodity = [];

	var allMarketName = [];

	var commodityMaps = "";
	var commodityItem = [];
	var commodityName = [];

	var checkedMarkets = [];
	
	var startDate;
	var endDate;
	
	var tableIsInit = false;	
	var isInit = false;
	var tableObj;
	
	var addressed = 0;
		
	function initUI() {
		// console.log("initUI");		
		populateUI();
		Highcharts.setOptions({
			chart: {
				style: {
					fontFamily: "Roboto",
					fontSize: '10px'
				}
			}
		});
	}
	
	function startUI() {
		console.log("startUI");
		//$(".content").css('visibility', 'visible');
	}
	
	function timestamp(str){
		return new Date(str).getTime();   
	}
	var months = [
			"01", "02", "03",
			"04", "05", "06", "07",
			"08", "09", "10",
			"11", "12"
		];
	
	function formatDate ( date ) {
		//console.log("formatDate: "+date);
		//console.log(date.getFullYear());
		var ret = date.getFullYear() + "-" + months[date.getMonth()] + "-";
		(date.getDate() < 10) ? ret = ret + "0"+ date.getDate() : ret = ret + date.getDate();
		//console.log(ret);
		return ret;
	}
	
	// Write a date as a pretty value.
	function setDate( value ){
		//console.log("setDate: "+value);
		$(this).html(formatDate(new Date(+value)));   
	}

	function updateNations() {
		var countries = $("#countries").chosen().val();
		nations = countries;
		getMarkets(true);

		//populateUI();
		updateValues();
		resizeChosen();
	}

	function updateValues() {					
			var items = $("#commodity").chosen().val();
			var countries = $("#countries").chosen().val();

			munit = "Kg"
			currency = "USD";
			nations = countries;

			var markets = $("#markets").chosen().val();
			//console.log(markets);
			var checkedNames = [];
            var checkedMaps  = "";
			var checkedItems = [];
			allMarketName = [];
			//

			checkedMarkets = markets;
			//checkedMarkets.push("0");

			$.each(checkedMarkets, function(index){
				if (checkedMarkets[index] == 0) allMarketName.push("Undefined Market");
				if (checkedMarkets[index] != 0) allMarketName.push($("#markets option[value='"+checkedMarkets[index]+"']").text());
			});
			allMarketName.reverse();
			console.log("*"+allMarketName.toString());

            if (items){
				$.each(items, function (index) {
					checkedMaps += items[index] + ",";
					checkedItems.push(items[index]);
					checkedNames.push( $("#commodity option[value='"+items[index]+"']").text() );
				});				
	            checkedMaps = checkedMaps.substring(0, checkedMaps.length-1);
	            commodityMaps = checkedMaps;	
				commodityItem = checkedItems;	
				commodityName = checkedNames;	
				//console.log (commodityName);
	            updateView();
			}
	}
	

	
	function populateUI() {
			//console.log("populateUI");
			/* Commodity Selector */			
			$.getJSON( globalURI+'auto.commodity?_output=json', function(data) {
				var sel = $("#commodity");
				var first = "selected";
				$.each(data.commoditys, function() {
						sel.append($("<option "+first+" />").val(this.code).text(this.name));
						first = "";
				});
				$('#commodity').chosen({max_selected_options: 3});
				
				//updateValues();
				$('#commodity').on('change', function(evt, params) {
					//console.log("udadas");
					updateValues();
  				}).trigger('chosen:updated');
				$('#commodity');
				counterUI++;				
				if (  counterUI == itemToInit ) startUI();
				getCountries(false);
			});
			
			/* Countries Selector */
			//

			/* Market Selector */

			//getMarkets(false);

			/* Map */
			//initMap();
		
	}

	function getCountries(clearall) {
		$.getJSON( globalURI+'auto.gaul0?_output=json', function(data) {
			var sel = $("#countries");
			var count = 2;
			data.gaul0s.reverse();
			$.each(data.gaul0s, function() {
//						sel.append($("<option selected />").val(this.code).text(this.name));
				if (this.code == initGaul) var first = "selected";
				sel.append($("<option "+first+" />").val(this.code).text(this.name));
				first = "";
				count--;
				if(count<1) return false;
			});
			//updateValues();

			$('#countries').chosen({max_selected_options: 3});
			$('#countries').on('change', function(evt, params) {
				updateNations();
			}).trigger('chosen:updated');
			$('#countries');

			counterUI++;
			if (  counterUI == itemToInit ) startUI();
			getMarkets(false);

		});

	}

	function getMarkets(clearall){
		if (clearall) {
			$("#markets").empty();
			$('#markets').chosen("destroy");
		}
		$.getJSON( globalURI+'auto.market?_output=json&gaul0='+nations, function(data) {
			var sel = $("#markets");
			var first = "selected";
			//	data.markets.reverse();
			$.each(data.markets, function() {
				//sel.append($("<option selected />").val(this.code).text(this.name));
						sel.append($("<option "+first+" />").val(this.code).text(this.name));
						first = "";
			});


			$('#markets').chosen({max_selected_options: 3});
			$('#markets').on('change', function(evt, params) {
				updateValues();
			}).trigger('chosen:updated');
			$('#markets');
			updateValues();

			counterUI++;
			if (  counterUI == itemToInit ) startUI();
			initMap();
		});
	}
	
	function getFromWDS(query) {
		$.ajax({
		  type: 'GET',
		  url: WDSURI,
		  data: {
			  payload: '{"query": "'+query+'"}',
			  datasource: DATASOURCE,
				  outputType: 'array'
			  },
			  success: function (response) {
				  //console.log(response[1]);
				  return response[1];				  
				  var json = response;
				  if (typeof json == 'string')
					  json = $.parseJSON(response);
				  
				  
				  //console.log("OK:"+JSON.stringify(json));
				  
			  },
			  error: function (a) {
				  console.log("KO:"+a.responseText);
				  return null;                            
			  }
		  });
	}
		
	
	function updateChart() {
			console.log("updateChart");
			var seriesOptions1 = [],
				seriesOptions2 = [],
				seriesOptions3 = [],
				seriesCounter = 0,
				names = commodityName,
				createChart1 = function (item) {
					item.highcharts('StockChart', {
						
						rangeSelector: {
							selected: 4
						},
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
							},
							series: {
								color: '#3faaaa'
							}
						},
		
						tooltip: {
							pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y} '+currency+'/'+munit+'</b> ({point.change}%) <br/>',
							valueDecimals: 2
						},
						
						series: seriesOptions1
					});
				},
				createChart2 = function (item) {
		
					item.highcharts({
						chart: {
							type: 'column'
						},						
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
							pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y} '+currency+'/'+munit+'</b> <br/>',
							valueDecimals: 2
						},
						plotOptions: {
							column: {
								pointPadding: 0.2,
								borderWidth: 0,

							},
							series: {
								color: '#3faaaa'
							}
						},
						
						series: seriesOptions2
					});
				}
			//console.log(startDate,endDate);
			var index = -1;

			$.each(checkedMarkets, function(h,vendorcode){



				if ((startDate !== undefined)&&(endDate !== undefined)) {
					var baseURI1 = globalURI+"auto.dataweb?gaul0code=("+nations+')&vendorcode=('+vendorcode+')&date=>'+startDate+'&date=<'+endDate + "&commoditycode=";
				} else {
					var baseURI1 = globalURI+"auto.dataweb?gaul0code=("+nations+")&vendorcode=("+vendorcode+")&commoditycode=";
				}
				var baseURI2 = globalURI+"auto.market?_output=json";
				//console.log(baseURI1);
				// baseURI+commodityItem[i]+"&_output=json"
				$.each(names, function (i, name) {
					$.getJSON( baseURI1+commodityItem[i]+"&_output=json" , function (data) {
						console.log(baseURI1+commodityItem[i]+"&_output=json")
						if (data.datas.length > 0) {
							data.datas = data.datas.sort(function(a, b) {
								//return (a['fulldate'] > b['fulldate']);
								var A_head = a['date'];
								var A_tail = a['fulldate'];
								var A_UTCDate = A_head+"T"+A_tail.substr(11)+"Z";
								var B_head = b['date'];
								var B_tail = b['fulldate'];
								var B_UTCDate = B_head+"T"+B_tail.substr(11)+"Z";

								return new Date(A_UTCDate) - new Date(B_UTCDate);
							});

							var resultdata = [];
							var averagedata = [];
							var j = 0;
							var aggregated = 0;
							$.each(data.datas, function() {
								tmpArray = new Array(2)
								//tmpArray[0] = new Date(this.fulldate).getTime();
								var str = this.fulldate;
								str = str.substring(0, str.length - 2);
								str = str.replace(/-/g,"/");
								var dateObject = new Date(str);
								tmpArray[0] = dateObject.getTime();
								tmpArray[1] = this.price/this.quantity;
								tmpArray[2] = this.vendorname;
								resultdata.push(tmpArray);
								j++;
								aggregated = aggregated + this.price;
							});

							startDate = data.datas[0].date;
							endDate =  data.datas[j-1].date;



							temArray = new Array(1);
							//temArray[0] = new Date().getTime();
							temArray[1] = ( aggregated / j );
							if (temArray[1] >1) averagedata.push(temArray);

							getMarkers(data.datas);


							index++;
							console.log(index);
							seriesOptions1[index] = {
								name: name + " @ " + allMarketName[index],
								data: resultdata
							};

							seriesOptions2[index] = {
								name: name +" (Avg)" + " @ " + allMarketName[index],
								data: averagedata,
								type: 'column'
							};

							//console.log("i+1["+i+1+"]*h["+h+"]= "+(i*h));
							/*
							 seriesCounter += 1;

							 if (seriesCounter === names.length) {
							 createChart1($('#hi-stock1'),seriesOptions1);
							 //createChart2($('#hi-stock2'));
							 //createChart($('#hi-stock3'));
							 }
							 */
							//console.log("fine1");
						} else {
							/*alert*/console.log("New Data Found - Please reload");
							getMarkers(null);
						}
					});

				});

			});



			//console.log("fine2");
			/*
			$.getJSON(baseURI2, function (data) {
				var resultmark = [];
				$.each(data.markets, function(f,k) {
					tmpArray = new Array(1)
					tmpArray[0] = this.code.replace(/\s/g, '');
					tmpArray[1] = this.name;
					resultmark.push(tmpArray);
				});
				//console.log(resultmark);
				//console.log(data);
					
			});
			*/
			
			
			$(document).ajaxStop(function () { 				
				//console.log("ajaxStop");
				//console.log(seriesOptions1);
				//console.log(seriesOptions2);
				//console.log(seriesOptions3);				
				createChart1($('#hi-stock1'));
				createChart2($('#hi-stock2'));
				if (!isInit) initSlider();
			});
		
	}
	
	function findAndReplace(object, target, value, replacevalue){
	  for(var x in object){
		if(typeof object[x] == 'object') findAndReplace(object[x], target, value, replacevalue);
		if(object[x] == value) object[target] = replacevalue;
	  }
	}	
	
	function reloadTable () {
		console.log("RELOAD");
	}

	function createTable3() {
		var allDatas = [];
		//console.log("createTable3");
		if (tableIsInit) {
			console.log("!createTable3");
			//return;
		}
		var qString = "SELECT data.gaul0code, data.vendorname as vendorname, data.citycode, city.code, data.price, data.fulldate, city.name as cityname, commodity.code, commodity.name as commodityname, data.commoditycode, market.code, market.name as marketname, data.marketcode, data.quantity FROM public.data, public.city, public.commodity, public.market WHERE data.citycode = city.code AND data.commoditycode = commodity.code AND data.gaul0code = '"+nations.toString()+"' AND commodity.code = ANY('{"+commodityItem.toString()+"}') AND data.marketcode = ANY('{"+checkedMarkets.toString()+"}') AND CAST(data.marketcode AS INT) = market.code ORDER BY data.fulldate DESC ";
		//var qString = "SELECT data.gaul0code, commodity.code as commocode, city.name as citycode, market.name as marketcode, data.vendorname, commodity.name as commoditycode, data.price, data.quantity, data.fulldate FROM data, city, vendor, market, commodity WHERE data.citycode = city.code AND CAST(data.marketcode AS INT) = market.code AND data.gaul0code='45' AND commodity.code = ANY('{"+commodityItem.toString()+"}') ORDER BY fulldate ";
		//if ((startDate !== undefined)&&(endDate !== undefined)) qString = qString +" AND date>='"+startDate+"' AND date<= '"+endDate+"'";
		//qString = qString + "limit 100";

		console.log(qString);

		$.ajax({
			type: 'GET',
			url: WDSURI,
			data: {
				payload: '{"query": "'+qString+'"}',
				datasource: DATASOURCE,
				outputType: 'object'
			},
			success: function (response) {
				//console.log("createTable3");
				//console.log(response);
				allDatas = response;
				allDatas.shift();
				if (tableIsInit) {
					console.log("!createTable3");
					$('#table').bootstrapTable('removeAll');
					$('#table').bootstrapTable('append', allDatas);
				} else {
					$('#table').bootstrapTable({
						columns: [{
							field: 'cityname',
							title: 'City',
							sortable: true,
							searchable: true
						}, {
							field: 'marketname',
							title: 'Market',
							sortable: true,
							searchable: true
						}, {
							field: 'vendorname',
							title: 'Vendor',
							sortable: true,
							searchable: true
						}, {
							field: 'commodityname',
							title: 'Commodity',
							sortable: true,
							searchable: true
						}, {
							field: 'price',
							title: 'Price ('+currency+')',
							sortable: true
						}, {
							field: 'quantity',
							title: 'Quantity ('+munit+')',
							sortable: true
						}, {
							field: 'fulldate',
							title: 'Date',
							sortable: true,
							searchable: true
						}],
						data: allDatas,
						pagination: true,
						search: true,
						sortable: true

					});
					tableIsInit = true;
				}
			},
			error: function (a) {
				console.log("KO:"+a.responseText);
			}
		});

	}
	
	function createTable() {	
		/*
		if (tableIsInit) {				
			console.log("!webix");
			tableObj.clearAll()							
		}	
		*/
		var allDatas = [];
		console.log("createTable");
		if (tableIsInit) {
			console.log("!createTable");
			return;
		}

		var qString = "SELECT data.gaul0code, data.vendorname as vendorname, data.citycode, city.code, data.price, data.fulldate, city.name as cityname, commodity.code, commodity.name as commodityname, data.commoditycode, market.code, market.name as marketname, data.marketcode, data.quantity FROM public.data, public.city, public.commodity, public.market WHERE data.citycode = city.code AND data.commoditycode = commodity.code AND data.gaul0code = '"+nations.toString()+"' AND commodity.code = ANY('{"+commodityItem.toString()+"}') AND CAST(data.marketcode AS INT) = market.code ORDER BY data.fulldate DESC ";
		//var qString = "SELECT data.gaul0code, commodity.code as commocode, city.name as citycode, market.name as marketcode, data.vendorname, commodity.name as commoditycode, data.price, data.quantity, data.fulldate FROM data, city, vendor, market, commodity WHERE data.citycode = city.code AND CAST(data.marketcode AS INT) = market.code AND data.gaul0code='45' AND commodity.code = ANY('{"+commodityItem.toString()+"}') ORDER BY fulldate ";
		//if ((startDate !== undefined)&&(endDate !== undefined)) qString = qString +" AND date>='"+startDate+"' AND date<= '"+endDate+"'";
		qString = qString + "limit 100";
		
		$.ajax({
		  type: 'GET',
		  url: WDSURI,
		  data: {
			  payload: '{"query": "'+qString+'"}',
			  datasource: DATASOURCE,
				  outputType: 'object'
			  },
			  success: function (response) {
				console.log(response);
				allDatas = response;
				allDatas.shift();
				tableObj = webix.ui({
				container:"table",
				view:"datatable",
				scrollY:true,
				sizeToContent:true,
				
				on:{
					onBeforeLoad:function(){
						this.showOverlay("Loading...");
					},
					onAfterLoad:function(){
						this.hideOverlay();
						reloadTable();
						if (!this.count()) this.showOverlay("Sorry, there is no data");	
						tableIsInit = true;						
					},
					onDataRequest:function() {
						reloadTable();
					},
					onDataUpdate:function() {
						reloadTable();
					}
				},
					
				pager:{
					container:"table-pager",
					size:30, 
					group:5,
					template:" {common.prev()} {common.pages()} {common.next()}" 
				},
												 /*width:176,*/ /*width:210,*/ /*width:210,*/ /*width:210,*/ /*width:130,*/ /*width:200,*/
				columns:[
		{ id:"citycode", minWidth:170, css: "wx-font" , header:[ "City",{content:"textFilter"}]	},
		{ id:"marketcode",  minWidth:170, css: "wx-font" , header:[ "Market",{content:"textFilter"}] },
		{ id:"vendorname",  minWidth:170, css: "wx-font" , header:[ "Vendor",{content:"textFilter"}] },
		{ id:"commoditycode",  minWidth:170, css: "wx-font" , header:[ "Commodity",{content:"textFilter"}] },
		{ id:"price",  minWidth:170, css: "wx-font" , header:"Price (CFA)", format:webix.Number.numToStr({ 
																											groupDelimiter:",", 
																											groupSize:3, 
																											decimalDelimiter:".", 
																											decimalSize:2})},
		{ id:"quantity",  css: "wx-font" , header:"Quantity (KG)", format:webix.Number.numToStr({ 
																											groupDelimiter:",", 
																											groupSize:3, 
																											decimalDelimiter:".", 
																											decimalSize:2})},																											
		{ id:"fulldate",  css: "wx-font" , header:"Date", format:webix.i18n.fullDateFormatStr, sort: "date"}																											
				],
				autoheight:true,
				
				
				data: allDatas
			});
			  },
			  error: function (a) {
				  console.log("KO:"+a.responseText);						               
			  }
		  });
		  
		  
				
			
	}
	
	function createTable2() {
		console.log("createTable2");
		
		if (tableIsInit) {
			console.log("!createTable");
			return;
		}
		
		allDatas = [];
		allCity = [];
		allMarket = [];
		allCommodity = [];
		
		$.getJSON(globalURI+"auto.city?_output=json", function (data) { allCity = data.citys; });
		$.getJSON(globalURI+"auto.market?_output=json", function (data) { allMarket = data.markets; });
		$.getJSON(globalURI+"auto.commodity?_output=json", function (data) { allCommodity = data.commoditys; });
		
		if (nations == null) nations = initGaul;
		console.log(checkedMarkets.toString());
		$.getJSON(globalURI+"auto.dataweb?vendorcode=("+checkedMarkets.toString()+")&commoditycode=("+commodityItem.toString()+")&gaul0code=("+nations.toString()+ ")&_output=json&_limit=10&_offset=0", function (data) {
				console.log(globalURI+"auto.dataweb?vendorcode=("+checkedMarkets.toString()+")&commoditycode=("+commodityItem.toString()+")&gaul0code=("+nations.toString()+ ")&_output=json&_limit=10&_offset=0");
				console.log(data.datas);
				data.datas = data.datas.sort(function(a, b) {
					//return (a['fulldate'] > b['fulldate']);
					return new Date(b['fulldate']) - new Date(a['fulldate']);
				});	
							
				allDatas = data.datas;
				console.log(data.datas);
			
		});
		
		function mergeArrays(start) {
			console.log("mergeArrays");
			$.each(allCity, function(index,value) {
				//findAndReplace(start, "citycode", value.code.replace(/ /g,""), value.name);
				findAndReplace(start, "citycode", value.code, value.name);
			});
			$.each(allMarket, function(index,value) {
				//findAndReplace(start, "marketcode", value.code.replace(/ /g,""), value.name);
				findAndReplace(start, "marketcode", value.code, value.name);
			});
			$.each(allCommodity, function(index,value) {
				//findAndReplace(start, "commoditycode", value.code.replace(/ /g,""), value.name);
				findAndReplace(start, "commoditycode", value.code, value.name);
			});
			allDatas = start;
			console.log("merged",allDatas);
		}
		
		//
		
		$(document).ajaxStop(function () { 				
			console.log("webix: "+tableIsInit);
			var uri = globalURI+"auto.dataweb?commoditycode=("+commodityItem.toString()+")&gaul0code=("+nations.toString()+ ")&_output=json&_limit=10&_offset=0";
			/*
			console.log("allDatas [B]");
			console.log(allDatas);
			findAndReplace(allDatas, "citycode", "34", "Romaaaaaa");
			console.log("allDatas [A]");
			console.log(allDatas);
			*/
			
			mergeArrays(allDatas);
			
			
					
			
			//tableObj = $("#table").webix_datatable({	
					
			tableObj = webix.ui({
				container:"table",
				view:"datatable",
				scrollY:true,
				sizeToContent:true,
				
				on:{
					onBeforeLoad:function(){
						this.showOverlay("Loading...");
					},
					onAfterLoad:function(){
						this.hideOverlay();
						reloadTable();
						if (!this.count()) this.showOverlay("Sorry, there is no data");	
						tableIsInit = true;						
					},
					onDataRequest:function() {
						reloadTable();
					},
					onDataUpdate:function() {
						reloadTable();
					}
				},
				/*	
				pager:{
					container:"table-pager",
					size:30, 
					group:5,
					template:" {common.prev()} {common.pages()} {common.next()}" 
				},
				*/								 /*width:176,*/ /*width:210,*/ /*width:210,*/ /*width:210,*/ /*width:130,*/ /*width:200,*/
				columns:[
		{ id:"citycode", minWidth:170, css: "wx-font" , header:[ "City",{content:"textFilter"}]	},
		{ id:"marketcode",  minWidth:170, css: "wx-font" , header:[ "Market",{content:"textFilter"}] },
		{ id:"vendorname",  minWidth:170, css: "wx-font" , header:[ "Vendor",{content:"textFilter"}] },
		{ id:"commoditycode",  minWidth:170, css: "wx-font" , header:[ "Commodity",{content:"textFilter"}] },
		{ id:"price",  minWidth:170, css: "wx-font" , header:"Price (CFA)", format:webix.Number.numToStr({ 
																											groupDelimiter:",", 
																											groupSize:3, 
																											decimalDelimiter:".", 
																											decimalSize:2})},
		{ id:"quantity",  css: "wx-font" , header:"Quantity (KG)", format:webix.Number.numToStr({ 
																											groupDelimiter:",", 
																											groupSize:3, 
																											decimalDelimiter:".", 
																											decimalSize:2})},																											
		{ id:"fulldate",  css: "wx-font" , header:"Date", format:webix.i18n.fullDateFormatStr, sort: "date"}																											
				],
				autoheight:true,
				
				
				data: allDatas
			});
			
			webix.event(window, "resize", function () {
				console.log("si");
                tableObj.adjust();
            })
			
		});
		//});
	}

	function initSlider() {

		if ((startDate !== undefined) && (endDate !== undefined)){
			isInit = true;
			//console.log(startDate,endDate);
			//console.log(new Date(startDate),new Date(endDate));
			$("#slider").dateRangeSlider({
				bounds: {min: new Date(startDate), max: new Date(endDate)},
				step: {days:1},
				defaultValues: {min: new Date(startDate), max: new Date(endDate)}
			});

			$("#slider").on("valuesChanged", function(e, data){
				//console.log("Something moved. min: " + data.values.min + " max: " + data.values.max);
				var d1 = formatDate(data.values.min);
				var d2 = formatDate(data.values.max);
				//console.log(startDate, endDate);
				startDate =  d1;
				endDate = d2;
				updateValues();
			});
		} else {
			alert("Dates undefined");
		}
	}

	function initSliderOld() {
		if ((startDate !== undefined) && (endDate !== undefined)){
			isInit = true;
			console.log(startDate,endDate);
			$("#slider").noUiSlider({
			// Create two timestamps to define a range.
				range: {
					min: timestamp(startDate),
					max: timestamp(endDate)
				},
				connect: true,
				
			// Steps of one week
				step: 7 * 24 * 60 * 60 * 1000,
				
			// Two more timestamps indicate the handle starting positions.
				start: [ timestamp(startDate), timestamp(endDate) ],
				
			// No decimals
				format: wNumb({
					decimals: 0
				})
			});
			
			$("#slider").Link('lower').to('-inline-<div class="slider_tooltip"></div>', setDate);
			$("#slider").Link('upper').to('-inline-<div class="slider_tooltip"></div>', setDate);
			
			$("#slider").on({
				change: function(){
					var arr = $("#slider").val();

					var d1 = formatDate(new Date(Number(arr[0])));
					var d2 = formatDate(new Date(Number(arr[1])));
					//console.log(startDate, endDate);
					startDate =  d1;
					endDate = d2; 
					updateValues();
				}
			});
		} else {
			alert("Dates undefined");
		}
	}
	
	function getMarkers(dataarray) {
//		console.log("getMarkers [S]");

		var allMarkers = [];
		var uniqueMarkers = [];
		
		if (dataarray != null) {
			
			var allData = dataarray.sort(function(a, b) {
				return parseInt(a['marketcode']) - parseInt(b['marketcode']);
			});
						
			var uniqueVendors = [];
			var uniqueLat = [];
			var uniqueLon = [];
			
			allAddressPoints = [];
			
			$.each(allData, function(f,k){			
				var temp = [];	
				temp.push(k.lat);
				temp.push(k.lon);
				temp.push(k.vendorname);
				allMarkers.push(temp);		
			});
			$.each(allMarkers, function(i, el){	
				//if($.inArray(el, uniqueVendors) === -1) uniqueVendors.push(el);
				if($.inArray(el[2], uniqueVendors) === -1) {				
					uniqueLat.push(el[0]);
					uniqueLon.push(el[1]);
					uniqueVendors.push(el[2]);
				}
			});
			
			$.each(uniqueVendors, function (f,k) {
				var temp = [];	
				temp.push(new L.LatLng(uniqueLat[f], uniqueLon[f]));
				temp.push(k);
				allAddressPoints.push(temp);
			});
			
		} else {
			allAddressPoints = [];
		}
		
//		console.log("getMarkers [E]");

	
	}
	
	function updateMap2() {
	//	console.log("nations:"+nations);
	//	console.log("checkedMarkets.toString():"+checkedMarkets.toString());

		var URI = globalURI+'auto.vendor?gaul0=('+nations+')&code=('+checkedMarkets.toString()+')&_output=json';
	//	console.log(URI);
		var URI2 = globalURI+'auto.data?vendorcode=';
		// "auto.dataweb?gaul0code=("+nations+ ')&date=>'+startDate+'&date=<'+endDate + "&commoditycode=";
		
		//console.log(URI);

		if (markers != null) { 
			map.removeLayer(markers);
			markers = L.markerClusterGroup({
				showCoverageOnHover: false
			});
			markers.clearLayers()
		}	
		
		if (commodityMaps != "") $.getJSON( URI, function(data)  {
			var vendors = [];
			var lats = []; 
			var lons =[];
			var vendorcode = [];
			var addressPoints = [];	
			address = 0;
			
			$.each(data.vendors, function (f,k) {	
				var qString = "SELECT AVG(price), COUNT(price) FROM data WHERE vendorcode='"+k.code+"'";
				if ((startDate !== undefined)&&(endDate !== undefined)) qString = qString +" AND date>='"+startDate+"' AND date<= '"+endDate+"'";
				var avg = [];
				var avgS = "";
				/*
				avg = getFromWDS(qString);
				console.log(avg);
				//console.log(qString);
				//console.log("danni veri ["+avg+"]");
				var avgS = ""
				if (avg !== undefined) avgS = " - " +( parseInt(avg[1][0]) / parseInt(avg[1][1]) ) + munit +"\/"+ currency;
				*/
				$.ajax({
				  type: 'GET',
				  url: WDSURI,
				  data: {
					  payload: '{"query": "'+qString+'"}',
					  datasource: DATASOURCE,
						  outputType: 'array'
					  },
					  success: function (response) {
						//console.log(response);						
						if (response[1] !== undefined) 
							avgS = " - " +( parseFloat(response[1][0]).toFixed(2) ) + currency +"\/"+ munit;
						vendors.push(k.name);
						vendorcode.push(k.code);
						lats.push(k.lat);
						lons.push(k.lon);
							var temp = [];	
							temp.push(k.lat);
							temp.push(k.lon);
							temp.push(k.name+avgS);
							addressPoints.push(temp);		
							address++ ;
							//console.log(data.vendors.length+" > "+address);
							if ( address >= data.vendors.length ) refreshCluster();						
						
						  
						  
					  },
					  error: function (a) {
						  console.log("KO:"+a.responseText);						               
					  }
				  });				
				
			});	
			/*
			
			// merge them
			if (vendorcode != "") {
				var allK = "";
				var allC = "";
				var allPrice = 0;

				$.each(commodityItem, function (f,k) { allC = allC + k +  ","; });
				allC = allC.substring(0, allC.length - 1);			
				//allK = allK.substring(0, allK.length - 1);
				//console.log(allK);
				console.log(allC);
				$.each(vendorcode, function (f,k){ 
					//console.log(URI2+k+"&commoditycode=("+allC+")");
					$.getJSON (URI2+k+'&commoditycode=('+allC+')&_output=json', function(data) {
						//console.log(URI2+"["+allK+"]&commoditycode=["+allC+"]");
						//console.log(commodityItem);
						$.each(data.datas, function (f,k) {
							console.log(data.datas);
							allPrice = allPrice + k.price;
						});
						/*
						//console.log(uLats[f],uLons[f],uDates[f],uVendor[f]);
						var fLat = uLats[f];
						var fLon = uLons[f];
						var fDate = uDates[f];
						var fVend = uVendor[f];
						var fVcod = uVcode[f];
						var fPrice = 0; 
						$.each(data.datas, function (f,k) {
							//var temp = [];	
							//fLat = k.lat;
							//fLon = k.lon; 
							//fDate = k.date;
							//fVend = k.vendorname
							fPrice = fPrice + k.price;
						});
						fPrice = (fPrice / data.datas.length).toFixed(2);
						if (fLat !== undefined) {
							var temp = [];	
							temp.push(fLat);
							temp.push(fLon);
							temp.push(fDate + " @ " + fVend+" - "+fPrice+" (Avg)"); //KSh 
							//temp.push(true);
							addressPoints.push(temp);
							//console.log("bhy");
						}
						
						address++ ;
						console.log(address,uDates.length);
						if ( address >= uDates.length ) refreshCluster();
						* /
					});	
				
				});
			 }
		*/		
		function refreshCluster() {
				//console.log("refreshCluster inside UpdateMap");
				var desatIcon = L.icon({
					iconUrl: 'img/marker-icon-none.png',
					shadowUrl: 'img/marker-shadow.png'
				});
				
				var foundIcon = L.icon({
					iconUrl: 'img/marker-icon.png',
					shadowUrl: 'img/marker-shadow.png'
				});
				
				var existingPoints = [];
				
				var latlng = L.latLng(addressPoints[0][0], addressPoints[0][1]);
				  for (var i = 0; i < addressPoints.length; i++) {
					  //console.log ("pop!");
					  var a = addressPoints[i];
					  var title = a[2];
					  //console.log(a.toString());
					  var cIcon = desatIcon;
					  var position = new L.LatLng(a[0], a[1]);
					  var temp = [];
					  temp.push(position);
					  temp.push(title);
					  existingPoints.push(temp);
					  var marker = L.marker(position, { title: title, icon: foundIcon });
					  marker.bindPopup(title);
					  markers.addLayer(marker);
				  }
				  
				  var a1Lat = [];
				  var a1Lon = [];
				  var a2Lat = [];				  
				  var a2Lon = [];
				  
				  //console.log(existingPoints.length, allAddressPoints.length);
				  for (var k = 0; k < allAddressPoints.length; k++) {
				  	a1Lat.push(allAddressPoints[k][0]['lat']);				  	
				  	a1Lon.push(allAddressPoints[k][0]['lng']);
				  }				  		  	
				  for (var k = 0; k < existingPoints.length; k++) {
					a2Lat.push(existingPoints[k][0]['lat']);
				  	a2Lon.push(existingPoints[k][0]['lng']);
				  }

					var aresLat = $(a1Lat).not(a2Lat).get();
					var aresLon = $(a1Lon).not(a2Lon).get();
				  
				  for (var j = 0; j < aresLat.length; j++) {
					  var title = "";
					  var cIcon = desatIcon;
					  var marker = L.marker( new L.LatLng(aresLat[j], aresLon[j]) , { title: title, icon: desatIcon });
					  marker.bindPopup(title);
					  markers.addLayer(marker);						  
				  }
				  
				 map.addLayer(markers);	
				 map.panTo(latlng);
				 
				 // Search

				if (controlSearch != null) map.removeControl (controlSearch);
				controlSearch = new L.Control.Search({layer: markers, initial: false, position:'topright'});
				map.addControl( controlSearch );
				
				if (addressSearch != null) map.removeControl (addressSearch);
				addressSearch = new L.Control.GeoSearch({
        		    provider: new L.GeoSearch.Provider.Google(),
					showMarker: false,
		        })
				map.addControl( addressSearch );
				 
			}	
			
		});
	}
	
	function updateMap() {	
		console.log("updateMap : "+commodityMaps);
		//console.log($(".chosen-select").chosen().val());
		//var URI = globalURI+'auto.getmarker?_output=json&commoditycode=('+commodityMaps+')';		
		var URI = globalURI+'auto.getmarker?_output=json&gaul0code=('+nations+')&commoditycode=('+commodityMaps+')';
		console.log(URI);
		var URI2 = URI;
		if (startDate !== undefined) URI2 = URI2 + '&date=>'+startDate+'&date=<'+endDate;			
		if (markers != null) { 
			//map.removeLayer(markers);
			//console.log(markers);
			/*
			map.eachLayer(function (layer){
    			map.removeLayer(layer);
			});
			map.remove();
			*/
			map.removeLayer(markers);
			markers = L.markerClusterGroup({
				markerClusterGroup:false
			});
			//console.log(markers);
			markers.clearLayers()
			//markers = null;
			//console.log("done");
		}	
		// retrieve dates
		if (commodityMaps != "") $.getJSON( URI2, function(data) {
			var dates = [];
			var vendors = [];
			var lats = []; 
			var lons =[];
			var vendorcode = [];
			var addressPoints = [];	
				
			$.each(data.datas, function (f,k) {
				dates.push(k.date);
				vendors.push(k.vendorname);
				vendorcode.push(k.vendorcode);
				lats.push(k.lat);
				lons.push(k.lon);
			});
			// delete duplicates			
			var uDates = [];
			var uVendor = [];
			var uLats = []; 
			var uLons = [];
			var uVcode = [];
			
			$.each(dates, function(i, el){
				if($.inArray(el, uDates) === -1) uDates.push(el);
			});			
			$.each(vendors, function(i, el){
				if($.inArray(el, uVendor) === -1) uVendor.push(el);
			});
			$.each(lats, function(i, el){
				if($.inArray(el, uLats) === -1) uLats.push(el);
			});
			$.each(lons, function(i, el){
				if($.inArray(el, uLons) === -1) uLons.push(el);
			});
			$.each(vendorcode, function(i, el){
				if($.inArray(el, uVcode) === -1) uVcode.push(el);
			});
			
			//console.log (uVcode, vendorcode);
			/*
			console.log(uDates);
			console.log(uVendor);
			console.log(uLats);
			console.log(uLons);
			*/
									
			// merge them
			address = 0;
			if (uDates != "") $.each(uDates, function (f,k){
				$.getJSON (URI+'&date="'+k+'"', function(data) {
		
					//console.log(uLats[f],uLons[f],uDates[f],uVendor[f]);
					var fLat = uLats[f];
					var fLon = uLons[f];
					var fDate = uDates[f];
					var fVend = uVendor[f];
					var fVcod = uVcode[f];
					var fPrice = 0; 
					$.each(data.datas, function (f,k) {
						//var temp = [];	
						//fLat = k.lat;
						//fLon = k.lon; 
						//fDate = k.date;
						//fVend = k.vendorname
						fPrice = fPrice + k.price;
					});
					fPrice = (fPrice / data.datas.length).toFixed(2);
					if (fLat !== undefined) {
						var temp = [];	
						temp.push(fLat);
						temp.push(fLon);
						temp.push(fDate + " @ " + fVend+" - "+fPrice+" (Avg)"); //KSh 
						//temp.push(true);
						addressPoints.push(temp);
						//console.log("bhy");
					}
					
					address++ ;
					//console.log(address,uDates.length);
					if ( address >= uDates.length ) refreshCluster();
				});	
				
			});
			
			function refreshCluster() {
				console.log("refreshCluster in UpdateMap");
//				console.log(addressPoints.length);
				var desatIcon = L.icon({
					iconUrl: 'img/marker-icon-none.png',
					shadowUrl: 'img/marker-shadow.png'
				});
				
				var foundIcon = L.icon({
					iconUrl: 'img/marker-icon.png',
					shadowUrl: 'img/marker-shadow.png'
				});
				
				var existingPoints = [];
				
				var latlng = L.latLng(addressPoints[0][0], addressPoints[0][1]);
				  for (var i = 0; i < addressPoints.length; i++) {
					  //console.log ("pop!");
					  var a = addressPoints[i];
					  var title = a[2];
					  var cIcon = desatIcon;
					  var position = new L.LatLng(a[0], a[1]);
					  var temp = [];
					  temp.push(position);
					  temp.push(title);
					  existingPoints.push(temp);
					  var marker = L.marker(position, { title: title, icon: foundIcon });
					  marker.bindPopup(title);
					  markers.addLayer(marker);
				  }
				  
				  var a1Lat = [];
				  var a1Lon = [];
				  var a2Lat = [];				  
				  var a2Lon = [];
				  
				  //console.log(existingPoints.length, allAddressPoints.length);
				  for (var k = 0; k < allAddressPoints.length; k++) {
				  	a1Lat.push(allAddressPoints[k][0]['lat']);				  	
				  	a1Lon.push(allAddressPoints[k][0]['lng']);
				  }				  		  	
				  for (var k = 0; k < existingPoints.length; k++) {
					a2Lat.push(existingPoints[k][0]['lat']);
				  	a2Lon.push(existingPoints[k][0]['lng']);
				  }

					var aresLat = $(a1Lat).not(a2Lat).get();
					var aresLon = $(a1Lon).not(a2Lon).get();
				  
				  for (var j = 0; j < aresLat.length; j++) {
					  var title = "";
					  var cIcon = desatIcon;
					  var marker = L.marker( new L.LatLng(aresLat[j], aresLon[j]) , { title: title, icon: desatIcon });
					  marker.bindPopup(title);
					  markers.addLayer(marker);						  
				  }
				  
				 map.addLayer(markers);	
				 map.panTo(latlng);
			}
			
		});
		
	
	}
	
	function initMap() {
		//console.log("initMap");
		  var tiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
			  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
			  subdomains: 'abcd',
			  maxZoom: 19
		  });
		  
//		  var center = 
		  
		//  if (markers == null) { 
			markers = L.markerClusterGroup({
				showCoverageOnHover: false
			});
			map = L.map('map-cluster', {
			 	center: initLatLon,
				attributionControl: false,
				zoom: 5,
				markerZoomAnimation: true,
				layers: [tiles],
				scrollWheelZoom: false
			});
			// Initialise the FeatureGroup to store editable layers
			var drawnItems = new L.FeatureGroup();
			map.addLayer(drawnItems);
			
			var Doptions = {
				position: 'topleft',
				draw: {					
					marker: false,
					polygon: {
						allowIntersection: false,
						drawError: {
							color: '#399BCC',
							timeout: 1000
						},
						shapeOptions: {
							color: '#399BCC'
						},
						showArea: true
					},
					polyline: {
						metric: true
					},
					circle: {
						shapeOptions: {
							color: '#399BCC'
						}
					}					
				},
				edit: {
					featureGroup: drawnItems
				}
			};
			
			var drawControl = new L.Control.Draw(Doptions);
			map.addControl(drawControl);			  
			
			map.on('draw:created', function (e) {
				var type = e.layerType,
					layer = e.layer;
			
				drawnItems.addLayer(layer);
			});


		//  } else { 
		//	  markers = L.markerClusterGroup();
			  //map.addLayer(markers);
		//  }
		  
	}
	
	

	function updateView() {

		//console.log("UpdView");
		// reload map
		//updateMap();
		updateMap2();
		// reload graphs	
		updateChart();	
		// reload table
		createTable3();

	}
	
	
	initUI();
});