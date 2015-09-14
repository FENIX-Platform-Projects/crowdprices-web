$( document ).ready(function() {
	var itemToInit = 2;
	var counterUI = 0;
	var map = null;
	var markers = null;
	var allAddressPoints = [];
	
	var globalURI = "http://fenixapps2.fao.org/restsql-0.8.8/res/"
	//var globalURI = "http://168.202.28.127:8080/restsql-0.8.8/res/"

	var initLatLon = [-6.816330, 39.276638];
	var initGaul = 257
	var nations = [];
	
	var allDatas = [];
	var allCity = [];
	var allMarket = [];
	var allCommodity = []; 

	var commodityMaps = "";
	var commodityItem = [];
	var commodityName = [];
	
	var startDate;
	var endDate;
	
	var tableIsInit = false;	
	var isInit = false;
	var tableObj;
	
	var addressed = 0;
		
	function initUI() {
		// console.log("initUI");		
		populateUI();
	}
	
	function startUI() {
		//console.log("startUI");
		$(".content-item").show();
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

	function updateValues() {					
			var items = $("#commodity").chosen().val();	
			var countries = $("#countries").chosen().val();
			var checkedNames = [];
            var checkedMaps  = "";
			var checkedItems = [];
			
			if (countries) {
				var tempCountries = [];
				$.each(countries, function (index) {
					tempCountries.push(parseInt(countries[index]));					
				});
				nations = tempCountries;
			}			
			
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
				$('#commodity').chosen('.chosen-select');
				updateValues();
				$('#commodity').on('change', function(evt, params) {
					//console.log("udadas");
					updateValues();
  				}).trigger('chosen:updated');
				$('#commodity');
				counterUI++;				
				if (  counterUI == itemToInit ) startUI();				
			});
			
			/* Countries Selector */	
					
			$.getJSON( globalURI+'auto.gaul0?_output=json', function(data) {
				var sel = $("#countries");
				$.each(data.gaul0s, function() {
						sel.append($("<option selected />").val(this.code).text(this.name));
				});
				updateValues();
				$('#countries').chosen('.chosen-select');
				$('#countries').on('change', function(evt, params) {
					updateValues();
  				}).trigger('chosen:updated');
				$('#countries');
				
				counterUI++;				
				if (  counterUI == itemToInit ) startUI();				
				
			});
			
			/* Map */			
			initMap();			
		
	}
		
	
	function updateChart() {
			//console.log("updateChart");
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
							text: 'Daily Prices'
						},
						
						credits: false,
						
						yAxis: {
							labels: {
								formatter: function () {
									return (this.value > 0 ? ' + ' : '') + this.value + '%';
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
							pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y} </b> ({point.change}%) <br/>',
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
							text: 'Average Prices'
						},
						xAxis: {
							title: {
								text: null
							},
							labels: {
								enabled: false
							}
						},
						
						yAxis: {
							labels: {
								formatter: function () {
									return this.value + ' ';
								}
							},
							plotLines: [{
								value: 0,
								width: 2,
								color: 'silver'
							}]
						},
						tooltip: {
							pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y} </b> <br/>',
							valueDecimals: 2
						},
						plotOptions: {
							column: {
								pointPadding: 0.2,
								borderWidth: 0
							}
						},
						
						series: seriesOptions2
					});
				}
			//console.log(startDate,endDate);

			if ((startDate !== undefined)&&(endDate !== undefined)) {
				var baseURI1 = globalURI+"auto.dataweb?gaul0code=("+nations.toString()+ ')&date=>'+startDate+'&date=<'+endDate + "&commoditycode=";
			} else {
				var baseURI1 = globalURI+"auto.dataweb?gaul0code=("+nations.toString()+")&commoditycode=";
			}			
			var baseURI2 = globalURI+"auto.market?_output=json";
			//console.log(baseURI1);
			// baseURI+commodityItem[i]+"&_output=json"
			$.each(names, function (i, name) {				
				$.getJSON( baseURI1+commodityItem[i]+"&_output=json" , function (data) {
					//console.log(baseURI1+commodityItem[i]+"&_output=json")
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
							tmpArray = new Array(1)
							//tmpArray[0] = new Date(this.fulldate).getTime();
								var str = this.fulldate;
								str = str.substring(0, str.length - 2);
								str = str.replace(/-/g,"/");
								var dateObject = new Date(str);
							tmpArray[0] = dateObject.getTime();
							tmpArray[1] = this.price;
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
						
						
						seriesOptions1[i] = {
							name: name,
							data: resultdata
						};
						
						seriesOptions2[i] = {
							name: name +" (Avg)",
							data: averagedata,
							type: 'column'
						};
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
						alert("Error! No Data avaiable!");
						getMarkers(null);
					}
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
		//console.log("RELOADRELOADRELOADRELOADRELOADRELOADRELOADRELOADRELOADRELOADRELOADRELOADRELOADRELOADRELOADRELOADRELOADRELOADRELOADRELOAD");
	}
	
	function createTable() {
		
		if (tableIsInit) {
			console.log("!createTable");
			return;
		}
		console.log("createTable");
		allDatas = [];
		
		$.getJSON(globalURI+"auto.city?_output=json", function (data) { allCity = data.citys; });
		$.getJSON(globalURI+"auto.market?_output=json", function (data) { allMarket = data.markets; });
		$.getJSON(globalURI+"auto.commodity?_output=json", function (data) { allCommodity = data.commoditys; });
		
		$.getJSON(globalURI+"auto.data?gaul0code=("+nations.toString()+ ")&_output=json", function (data) {
				data.datas = data.datas.sort(function(a, b) {
					//return (a['fulldate'] > b['fulldate']);
					return new Date(b['fulldate']) - new Date(a['fulldate']);
				});	
				allDatas = data.datas;
				
		});
		
		function mergeArrays(start) {
			console.log("mergeArrays");
			$.each(allCity, function(index,value) {
				findAndReplace(start, "citycode", value.code.replace(/ /g,""), value.name);
			});
			$.each(allMarket, function(index,value) {
				findAndReplace(start, "marketcode", value.code.replace(/ /g,""), value.name);
			});
			$.each(allCommodity, function(index,value) {
				findAndReplace(start, "commoditycode", value.code.replace(/ /g,""), value.name);
			});
			allDatas = start;
			//console.log("merged",allDatas);
		}
		
		//
		
		$(document).ajaxStop(function () { 				
			console.log("webix: "+tableIsInit);
			var uri = globalURI+"auto.data?gaul0code=("+nations.toString()+ ")&_output=json";
			/*
			console.log("allDatas [B]");
			console.log(allDatas);
			findAndReplace(allDatas, "citycode", "34", "Romaaaaaa");
			console.log("allDatas [A]");
			console.log(allDatas);
			*/
			
			mergeArrays(allDatas);
			
			if (tableIsInit) {				
				console.log("!webix");
				tableObj.clearAll()				
				tableObj.load(uri,function(text, data, http_request){					
					var obj = JSON.parse(text);					
					mergeArrays(obj.datas);
					tableObj.parse(obj.datas);
				});
				return;
			}			
			
			tableObj = $("#table").webix_datatable({			
			//tableObj = webix.ui({
				container:"table",
				view:"datatable",
				scrollY:true,
				on:{
					onBeforeLoad:function(){
						//console.log("fuckyeah x0.5! "+tableIsInit);
						this.showOverlay("Loading...");
					},
					onAfterLoad:function(){
						//console.log("fuckyeah x0.75! "+tableIsInit);
						this.hideOverlay();
						if (!this.count()) this.showOverlay("Sorry, there is no data");	
						tableIsInit = true;						
					},
					onDataRequest:function() {
						//console.log("fuckyeah x1.5! "+tableIsInit);
						reloadTable();
					},
					onDataUpdate:function() {
						//console.log("fuckyeah x2! "+tableIsInit);
						reloadTable();
					}
				},	
				pager:{
					container:"table-pager",
					size:50, 
					group:5,
					template:" {common.prev()} {common.pages()} {common.next()}" 
				},								
				columns:[
//					{ id:"id",				width:50,	header:"", 				css:"id"},
					{ id:"fulldate",		width:160,	header:"Date",									format:webix.i18n.fullDateFormatStr, sort: "date"},
					{ id:"citycode",		width:116, 	header:[ "City",{content:"textFilter"}]	},
					{ id:"marketcode",		width:180,	header:[ "Market",{content:"textFilter"}] },
					{ id:"vendorname",		width:200,	header:[ "Vendor",{content:"textFilter"}] },
					{ id:"commoditycode",	width:200,	header:[ "Commodity",{content:"textFilter"}] },
//					{ id:"varietyname",		width:100,	header:[ "Variety",{content:"textFilter"}] },
					{ id:"price",			width:100,	header:"Price",									format:webix.Number.numToStr({ 
																											groupDelimiter:",", 
																											groupSize:3, 
																											decimalDelimiter:".", 
																											decimalSize:2})}           
				],
				autoheight:true,
				autowidth:true,
				data: allDatas
			});
			
			
		});
		//});
	}
	
	function initSlider() {
		isInit = true;
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
		
		$("#slider").Link('lower').to('-inline-<div class="tooltip"></div>', setDate);
		$("#slider").Link('upper').to('-inline-<div class="tooltip"></div>', setDate);
		
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
	
	function updateMap() {	
		//console.log("updateMap : "+commodityMaps);
		//console.log($(".chosen-select").chosen().val());
		//var URI = globalURI+'auto.getmarker?_output=json&commoditycode=('+commodityMaps+')';		
		var URI = globalURI+'auto.getmarker?_output=json&gaul0code=('+nations.toString()+')&commoditycode=('+commodityMaps+')';
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
			markers = L.markerClusterGroup();
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
					if ( address >= uDates.length ) refreshCluster();
				});	
				
			});
			
			function refreshCluster() {
				//console.log(addressPoints.length);
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
		  var tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			  maxZoom: 18,
			  attributionControl: false
		  });
		  
//		  var center = 
		  
		//  if (markers == null) { 
			markers = L.markerClusterGroup();
			map = L.map('map-cluster', {
			 	center: initLatLon, 
				attributionControl: false, 
				zoom: 7, 
				markerZoomAnimation: true,
				layers: [tiles]
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
		updateMap();
		// reload graphs	
		updateChart();	
		// reload table
		createTable();

	}
	
	
	initUI();
});