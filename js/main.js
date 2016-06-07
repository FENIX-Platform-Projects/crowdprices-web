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
	
	var globalURI = "http://fenix.fao.org/restsql-0.8.8/res/";
	//PROD var globalURI = "http://fenixapps2.fao.org/restsql-0.8.8/res/";
	
	// WDS
	var WDSURI =  "http://fenixapps2.fao.org/wds-5.2.1/rest/crud/";
	var DATASOURCE = "CROWD";

	var initLatLon = [13.453 , -16.578];
	var initGaul = 90;
	var nations = [90];


	var allMarketName = [];

	var commodityMaps = "";
	var commodityItem = [];
	var commodityName = [];

	var checkedMarkets = [];
	
	var startDate;
	var endDate;

	var filterPolygonWKT;

	var tableIsInit = false;	
	var isInit = false;


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
	
	function updateNations() {
		var countries = $("#countries").chosen().val();
		nations = countries;
		getMarkets(true);

		//populateUI();
		updateValues();
		resizeChosen();
	}

	function updateValues() {					
		var items = $("#commodity").chosen().val(),
			countries = $("#countries").chosen().val(),
			markets = $("#markets").chosen().val(),
			checkedNames = [],
			checkedMaps  = "",
			checkedItems = [];

		munit = "Kg"
		currency = "USD";
		nations = countries;
		allMarketName = [];
		//

		checkedMarkets = markets;
		//checkedMarkets.push("0");

		$.each(checkedMarkets, function(index){
			if (checkedMarkets[index] == 0)
				allMarketName.push("Undefined Market");
			
			if (checkedMarkets[index] != 0)
				allMarketName.push($("#markets option[value='"+checkedMarkets[index]+"']").text());
		});
		allMarketName.reverse();
		//console.log("*"+allMarketName.toString());

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
			var first = "";
			$.each(data.commoditys, function() {
				if(this.code == 38) first = "selected";
					sel.append($("<option "+first+" />").val(this.code).text(this.name));
					first = "";
			});
			$('#commodity').chosen({max_selected_options: 10});
			
			//updateValues();
			$('#commodity').on('change', function(evt, params) {
				//console.log("udadas");
				updateDates();
				updateValues();
				}).trigger('chosen:updated');
			$('#commodity');
			counterUI++;				
			
			getCountries(false);
		});
	}

	function getCountries(clearall) {
		$.getJSON( globalURI+'auto.gaul0?_output=json', function(data) {
			var sel = $("#countries");
			var count = 2;
			data.gaul0s.reverse();

			$.each(data.gaul0s, function() {
				if(this.code == initGaul)
					sel.append($("<option />").val(this.code).text(this.name));
			});

			$('#countries').chosen({max_selected_options: 1});
			$('#countries').on('change', function(evt, params) {
				updateNations();
			}).trigger('chosen:updated');
			$('#countries');

			counterUI++;
			
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
						//first = "";
			});


			$('#markets').chosen({max_selected_options: 5});
			$('#markets').on('change', function(evt, params) {
				updateDates();
				updateValues();
			}).trigger('chosen:updated');
			$('#markets');
			updateValues();

			counterUI++;
			

			initMap();
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
						colors: [ //Colori delle charts
							'#3faaaa',
							'#76BE94',
							'#744490',
							'#E10079',
							'#2D1706',
							'#F1E300',
							'#F7AE3C',
							'#DF3328'
						],
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

							}
						},
		
						tooltip: {
							pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y} '+currency+'/'+munit+'</b> ({point.change}%) <br/>',
							valueDecimals: 2
						},
						
						series: seriesOptions1
					});
					//	console.log(seriesOptions1)
				},
				createChart2 = function (item) {
		
					item.highcharts({
						chart: {
							type: 'column'
						},
						colors: [ //Colori delle charts
							'#3faaaa',
							'#76BE94',
							'#744490',
							'#E10079',
							'#2D1706',
							'#F1E300',
							'#F7AE3C',
							'#DF3328'
						],
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

							}
						},
						
						series: seriesOptions2
					});
				}
			//console.log(startDate,endDate);
			var index = -1;
			var indexName = allMarketName.length;
			//console.log("prev "+indexName)
			//console.log("prev "+allMarketName.toString())

			$.each(checkedMarkets, function(h,marketcode){
				indexName--;
				//console.log("allMarketName: "+allMarketName[indexName]);

				if ((startDate !== undefined)&&(endDate !== undefined)) {
					var baseURI1 = globalURI+"auto.dataweb?gaul0code=("+nations+')&marketcode=('+marketcode+')&date=>'+startDate+'&date=<'+endDate+"&commoditycode=";
				} else {
					var baseURI1 = globalURI+"auto.dataweb?gaul0code=("+nations+")&marketcode=("+marketcode+")&commoditycode=";
				}
				var baseURI2 = globalURI+"auto.market?_output=json";
				//console.log(baseURI1);
				// baseURI+commodityItem[i]+"&_output=json"
				$.each(names, function (i, name) {

					var sQuery = "SELECT data.id, data.gaul0code, data.citycode, data.marketcode, data.munitcode, data.currencycode, data.commoditycode, data.varietycode, data.price, data.quantity, data.untouchedprice, data.fulldate, data.note, data.userid, data.vendorname, data.vendorcode, data.lat, data.lon, data.geo FROM data WHERE gaul0code=ANY('{"+nations+"}') and marketcode=ANY('{"+marketcode+"}') and commoditycode='"+commodityItem[i]+"' ";
					sQuery = sQuery + " ORDER BY fulldate";
					//console.log("sQuery "+sQuery);
					$.ajax({
						url: 'http://fenixapps2.fao.org/wds_5/rest/fenix/query/',
						type: 'POST',
						data: {
							datasource: 'CROWD',
							query: sQuery,
							outputType: 'array'
						},
						success: function (response) {
							//console.log(response);
							var data = JSON.parse(response);
							var resultdata = [];
							var averagedata = [];
							var j = 0;
							var aggregated = 0;

							var output = {datas:[]};
							$.each(data, function(index,element){

								output.datas.push({
									"id": element[0],
									"gaul0code": element[1],
									"citycode": element[2],
									"marketcode": element[3],
									"munitcode": element[4],
									"currencycode": element[5],
									"commoditycode": element[6],
									"varietycode": element[7],
									"price": element[8],
									"untouchedprice": element[9],
									"fulldate": element[10],
									"note": element[11],
									"userid": element[12],
									"vendorname": element[13],
									"vendorcode": element[14],
									"lat": element[15],
									"lon": element[16],
									"geo": element[17]
								});
								//console.log(element)
							});



							 $.each(data, function() {
								 tmpArray = new Array(2)
								 //tmpArray[0] = new Date(this.fulldate).getTime();
								 var str = this[11];
								 str = str.substring(0, str.length - 2);
								 str = str.replace(/-/g,"/");
								 var dateObject = new Date(str);
								 tmpArray[0] = dateObject.getTime();
								 tmpArray[1] = parseFloat(this[8])/parseFloat(this[9]);
								 tmpArray[2] = this[14];


								 resultdata.push(tmpArray);
								 j++;
								 aggregated = aggregated + parseFloat(this[8]);
							 });

							 startDate = data[0][11];
							 endDate =  data[j-1][11];

							 temArray = new Array(1);
							 //temArray[0] = new Date().getTime();
							 temArray[1] = ( aggregated / j );
							 if (temArray[1] >1) averagedata.push(temArray);

							//console.log(data);
							getMarkers(data);


							//console.log("h:"+h+" - "+allMarketName[indexName],indexName);
							index++;

							seriesOptions1[index] = {
								name: name + " @ " + allMarketName[h],
								data: resultdata
							};

							seriesOptions2[index] = {
								name: name +" (Avg)" + " @ " + allMarketName[h],
								data: averagedata,
								type: 'column'
							};


						},
						error: function (a) {
							console.log("KO:"+a.responseText);
							return null;
						}
					});
				});

			});
			
			
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
	

	function createTable() {
		var allDatas = [];
		console.log("createTable");
		if (tableIsInit) {
			//console.log("!createTable3");
			//return;
		}
		var qString = "SELECT data.gaul0code, data.vendorname as vendorname, data.citycode, city.code, data.price, data.fulldate, city.name as cityname, commodity.code, commodity.name as commodityname, data.commoditycode, market.code, market.name as marketname, data.marketcode, data.quantity, data.userid FROM public.data, public.city, public.commodity, public.market WHERE data.citycode = city.code AND CAST (data.commoditycode as INT)  = commodity.code AND data.gaul0code = '"+nations.toString()+"' AND commodity.code = ANY('{"+commodityItem.toString()+"}') AND data.marketcode = ANY('{"+checkedMarkets.toString()+"}') AND CAST(data.marketcode AS INT) = market.code";
		//var qString = "SELECT data.gaul0code, commodity.code as commocode, city.name as citycode, market.name as marketcode, data.vendorname, commodity.name as commoditycode, data.price, data.quantity, data.fulldate FROM data, city, vendor, market, commodity WHERE data.citycode = city.code AND CAST(data.marketcode AS INT) = market.code AND data.gaul0code='45' AND commodity.code = ANY('{"+commodityItem.toString()+"}') ORDER BY fulldate ";
		if ((startDate !== undefined)&&(endDate !== undefined)) qString = qString +" AND date>='"+startDate+"' AND date<= '"+endDate+"'";
		//qString = qString + "limit 100";
		qString = qString + " ORDER BY data.fulldate DESC ";

		//console.log("Q:"+qString);

		$.ajax({

			url: 'http://fenixapps2.fao.org/wds_5/rest/fenix/query/',
			type: 'POST',
			data: {
				datasource: 'CROWD',
				query: qString,
				outputType: 'array'
			},

			success: function (response) {
				console.log("createTable success");
				allDatas = JSON.parse(response);
				var output = {table:[]};
				$.each(allDatas, function(index,element){

					output.table.push({
						"gaul0code": element[0],
						"vendorname": element[1],
						"citycode": element[2],
						"code": parseInt(element[3]),
						"price": parseFloat(element[4]),
						"fulldate": element[5],
						"cityname": element[6],
					//	"code": element[7],
						"commodityname": element[8],
						"commoditycode": element[9],
						"code": element[10],
						"marketname": element[11],
						"marketcode": element[12],
						"quantity": parseFloat(element[13]),
						"userid": element[14]
					});
				});

				if (tableIsInit) {
				//	console.log("!createTable");
					$('#table').bootstrapTable('removeAll');
					$('#table').bootstrapTable('append', output.table);
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
						}, {
							field: 'userid',
							title: 'User',
							sortable: true,
							searchable: true
						}],
						data: output.table,
						pagination: true,
						search: true,
						sortable: true

					});
					tableIsInit = true;
					$("#tblExportCSV").on("click", function(){
						$('#table').bootstrapTable('togglePagination');
						$('#table').tableExport({type:'csv'});
						$('#table').bootstrapTable('togglePagination');
					});
					$("#tblExportXLS").on("click", function(){
						$('#table').bootstrapTable('togglePagination');
						$('#table').tableExport({type:'xls'});
						$('#table').bootstrapTable('togglePagination');
					});
					$("#tblExportJSON").on("click", function(){
						$('#table').bootstrapTable('togglePagination');
						$('#table').tableExport({type:'json'});
						$('#table').bootstrapTable('togglePagination');
					});
				}
			},
			error: function (a) {
				console.log("KO:"+a.responseText);
			}


		});
	}


	function updateDates() {
		console.log(" updateDates "+isInit);
		var squery = "select min(fulldate) as startDate, max(fulldate) as endDate from data WHERE marketcode=("+checkedMarkets.toString()+")&commoditycode=("+commodityItem.toString()+")&gaul0code=("+nations.toString()+ ")";
		$.ajax({
			type: 'GET',
			url: WDSURI,
			data: {
				payload: '{"query": "'+squery+'"}',
				datasource: DATASOURCE,
				outputType: 'array'
			},
			success: function (response) {
				console.log("Dates defined",response);
				//console.log(startDate,endDate);
				//console.log(new Date(response[0]),new Date(response[1]));
				if(response[1]) {
					var s1 = response[1][0];
					var s2 = response[1][1];
					var d1 = (s1.substring(0,10));
					var d2 = (s2.substring(0,10));


					startDate = d1;
					endDate = d2;
					console.log(startDate,endDate);
					if (isInit) updateSlider();
				}
			},
			error: function (a) {
				console.log("Dates undefined");
				console.log("KO:"+a.responseText);
				return null;
			}
		});

	}

	function updateSlider() {

		console.log("Dates added");
		$("#slider").dateRangeSlider("destroy");
		console.log(startDate,endDate);
		createSlider();

	}

	function createSlider() {
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
		isInit = true;
	}

	function initSlider() {
		console.log("initSlider")
		if (!isInit) {
			console.log("!initSlider")
			if ((startDate !== undefined) && (endDate !== undefined)){
				//isInit = true;
				//console.log(startDate,endDate);
				//console.log(new Date(startDate),new Date(endDate));
				createSlider();
			} else {
				console.log("Dates undefined");
			}
		} else {
			//$("#slider").dateRangeSlider("destroy");
			console.log("Dates added");
		}
	}


	function getMarkers(dataarray) {
//		console.log("getMarkers [S]");

		var allMarkers = [];
		var uniqueMarkers = [];
		
		if (dataarray != null) {
			/*
			var allData = dataarray.sort(function(a, b) {
				return parseInt(a['marketcode']) - parseInt(b['marketcode']);
			});
			*/
			var allData = dataarray;

			//console.log(allData);

			var uniqueVendors = [];
			var uniqueLat = [];
			var uniqueLon = [];
			var uniqueCommody = [];
			
			allAddressPoints = [];
			
			$.each(allData, function(f,k){
				//console.log(k.commoditys[0].name);
				var temp = [];	
				temp.push(k[16]);
				temp.push(k[17]);
				temp.push(k[14]);
				//temp.push(k.commoditys[0].name)
				allMarkers.push(temp);
				//console.log(temp);
			});
			$.each(allMarkers, function(i, el){	
				//if($.inArray(el, uniqueVendors) === -1) uniqueVendors.push(el);
				if($.inArray(el[2], uniqueVendors) === -1) {				
					uniqueLat.push(el[0]);
					uniqueLon.push(el[1]);
					uniqueVendors.push(el[2]);
					uniqueCommody.push(el[3]);
				}
			});
			
			$.each(uniqueVendors, function (f,k) {
				var temp = [];	
				temp.push(new L.LatLng(uniqueLat[f], uniqueLon[f]));
				temp.push(k);
				temp.push(uniqueCommody[f]);
				allAddressPoints.push(temp);
			});
			
		} else {
			allAddressPoints = [];
		}

	}

	function toWKT(layer) {
	    var lng, lat, coords = [];
	    if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
	        var latlngs = layer.getLatLngs();
	        for (var i = 0; i < latlngs.length; i++) {
		    	latlngs[i]
		    	coords.push(latlngs[i].lng + " " + latlngs[i].lat);
		        if (i === 0) {
		        	lng = latlngs[i].lng;
		        	lat = latlngs[i].lat;
		        }
		};
	        if (layer instanceof L.Polygon) {
	            return "POLYGON((" + coords.join(",") + "," + lng + " " + lat + "))";
	        } else if (layer instanceof L.Polyline) {
	            return "LINESTRING(" + coords.join(",") + ")";
	        }
	    } else if (layer instanceof L.Marker) {
	        return "POINT(" + layer.getLatLng().lng + " " + layer.getLatLng().lat + ")";
	    }
	}
		
	function updateMap2() {

		var URI = globalURI+'auto.vendor?gaul0=('+nations+')&code=('+checkedMarkets.toString()+')&_output=json';

		if (markers != null) { 
			map.removeLayer(markers);
			markers = L.markerClusterGroup({
				showCoverageOnHover: false
			});
			markers.clearLayers()
		}
		
		if (commodityMaps != "")
			$.getJSON( URI, function(data)  {

			var vendors = [];
			var lats = []; 
			var lons =[];
			var marketcode = [];
			var addressPoints = [];	
			address = 0;
			
			$.each(data.vendors, function (f,k) {	
				
				var qString = "SELECT AVG(price), COUNT(price) "+
					"FROM data WHERE "+
					"marketcode = '"+k.code+"' ";
				
				if( startDate !== undefined && endDate !== undefined )
					qString += " AND date>='"+startDate+"'"+
							   " AND date<= '"+endDate+"'";

console.log('updateMap2',qString)

				var avg = [];
				var avgS = "";

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
						marketcode.push(k.code);
						lats.push(k.lat);
						lons.push(k.lon);

						var temp = [];	
						temp.push(k.lat);
						temp.push(k.lon);
						temp.push(k.name+avgS);
						
						addressPoints.push(temp);		
						address++ ;
						//console.log(data.vendors.length+" > "+address);
						if ( address >= data.vendors.length )
							refreshCluster();						
					
					  },
					  error: function (a) {
						  console.log("KO:"+a.responseText);						               
					  }
				  });
			});

		function refreshCluster() {
				//console.log("refreshCluster inside UpdateMap");
				var desatIcon = L.icon({
					iconUrl: 'img/marker-icon-none.png',
					shadowUrl: 'img/marker-shadow.png'
				});
				
				var foundIcon = L.icon({
					iconUrl: 'img/marker-icon.png',
					shadowUrl: 'img/marker-shadow.png',
					iconSize: L.point(109,109),
					iconAncho: L.point(109,109)
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

					  var marker = L.marker(position, { icon: foundIcon });


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
					  //marker.bindPopup(title);
					  markers.addLayer(marker);						  
				  }
				  
				 map.addLayer(markers);	
				 map.panTo(latlng);
				 
				 // Search

				if(controlSearch)
					L.control.search({
						layer: markers,
						initial: false,
						position:'topright'
					}).addTo(map);
				
				if (addressSearch != null) map.removeControl (addressSearch);
				addressSearch = new L.Control.GeoSearch({
        		    provider: new L.GeoSearch.Provider.Google(),
					showMarker: false,
		        })
				map.addControl( addressSearch );
				 
			}	
			
		});
	}

	function initMap() {

		var tiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
				subdomains: 'abcd',
				maxZoom: 19
			});

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
				polyline: false,
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
			
			filterPolygonWKT = toWKT(layer);

			console.log('SELECTION toWKT', filterPolygonWKT )

			drawnItems.addLayer(layer);
		});		  

	}

	function updateView() {
		//console.log("UpdView");
		// reload map
		updateMap2();
		// reload graphs	
		updateChart();	
		// reload table
		createTable();

	}
	
	
	initUI();
});