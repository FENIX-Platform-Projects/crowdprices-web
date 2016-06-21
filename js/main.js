$( document ).ready(function() {
	var itemToInit = 3;
	var counterUI = 0;
	var map = null;
	var markers = null;
	var munit = "Kg";
	var currency = "USD";
	var allAddressPoints = [];
	
	var globalURI = "http://fenix.fao.org/restsql-0.8.8/res/";
	//PROD var globalURI = "http://fenixapps2.fao.org/restsql-0.8.8/res/";
	
	// WDS
	var WDSURI =  "http://fenixapps2.fao.org/wds-5.2.1/rest/crud/";
	var WDSURI5 = 'http://fenixapps2.fao.org/wds_5/rest/fenix/query/';
	var DATASOURCE = "CROWD";

	var initLatLon = [13.453 , -16.578];
	var initGauls = [90,45];
	var nations = 90;

	var countries_tables = {
		"90": "data", // data_gambia
		"45": "data", // data_cameroon
		"122": "data"	//italy test
	}

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

	function updateValues() {					
		var items = $("#commodity").chosen().val(),
			markets = $("#markets").chosen().val(),
			checkedNames = [],
			checkedMaps  = "",
			checkedItems = [];

		munit = "Kg"
		currency = "USD";

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

			counterUI++;				
			
			getCountries(false);
		});
	}

	function getCountries() {

		var $sel = $("#countries");

		$.ajax({
			url: globalURI+'auto.gaul0?_output=json', 
			async: false,
			dataType: "json",
			success: function(data) {

				//console.log('getCountries', data);

				$.each(data.gaul0s, function() {
					if( _.contains(initGauls, parseInt(this.code)) )
						$sel.append($("<option />").val(this.code).text(this.name));
				});

				$('#countries').chosen({max_selected_options: 1});

				$('#countries').on('change', function(evt, params) {
					
					nations = evt.currentTarget.value;
				
					getMarkets(true);

					//populateUI();
					updateValues();

					resizeChosen();

				}).trigger('chosen:updated');
				$('#countries');

				counterUI++;
				
				getMarkets(false);
			}
		});

	}

	function getMarkets(clearall){
		if (clearall) {
			$("#markets").empty();
			$('#markets').chosen("destroy");
		}
		$.getJSON( globalURI+'auto.market?_output=json&gaul0='+nations.toString(), function(data) {
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

			$.each(names, function (i, name) {
				
				var table = countries_tables[ nations ],
					sQuery = "SELECT id, gaul0code, citycode, marketcode, munitcode, currencycode, commoditycode, varietycode, price, quantity, untouchedprice, fulldate, note, userid, vendorname, vendorcode, lat, lon, geo "+
							"FROM "+ table + " "+
							"WHERE gaul0code = ANY('{"+nations.toString()+"}') AND marketcode=ANY('{"+marketcode+"}') AND commoditycode='"+commodityItem[i]+"' ";

				sQuery = sQuery + " ORDER BY fulldate";
			
				$.ajax({
					url: WDSURI5,
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

						if(data.length===0)
							return;

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
		console.log("createTable");

		var allDatas = [];

		var table = countries_tables[ nations ],
			qString = "SELECT "+table+".gaul0code, "+table+".vendorname as vendorname, "+table+".citycode, city.code, data.price, data.fulldate, city.name as cityname, commodity.code, commodity.name as commodityname, data.commoditycode, market.code, market.name as marketname, "+table+".marketcode, "+table+".quantity, "+table+".userid "+
			"FROM "+table+", city, commodity, market "+
			"WHERE "+table+".citycode = city.code AND CAST ("+table+".commoditycode as INT) = commodity.code AND "+table+".gaul0code = '"+nations.toString()+"' AND commodity.code = ANY('{"+commodityItem.toString()+"}') AND "+table+".marketcode = ANY('{"+checkedMarkets.toString()+"}') AND CAST("+table+".marketcode AS INT) = market.code";
		
		if ((startDate !== undefined)&&(endDate !== undefined)) qString = qString +" AND date>='"+startDate+"' AND date<= '"+endDate+"'";
		//qString = qString + "limit 100";
		qString = qString + " ORDER BY "+table+".fulldate DESC ";

		//console.log("Q:"+qString);

		$.ajax({

			url: WDSURI5,
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

	//http://stackoverflow.com/questions/24145205/writing-a-function-to-convert-a-circle-to-a-polygon-using-leaflet-js

	function destinationVincenty(lonlat, brng, dist) {
		//rewritten to work with leaflet
	    var VincentyConstants = {
			    a: 6378137,
			    b: 6356752.3142,
			    f: 1/298.257223563  
			},
	    	a = VincentyConstants.a,
	    	b = VincentyConstants.b,
	    	f = VincentyConstants.f,
	    	lon1 = lonlat.lng,
	    	lat1 = lonlat.lat,
	    	s = dist,
	    	pi = Math.PI,
	    	alpha1 = brng * pi/180,
	    	sinAlpha1 = Math.sin(alpha1),
	    	cosAlpha1 = Math.cos(alpha1),
	    	tanU1 = (1-f) * Math.tan( lat1 * pi/180),
	    	cosU1 = 1 / Math.sqrt((1 + tanU1*tanU1)), sinU1 = tanU1*cosU1,
	    	sigma1 = Math.atan2(tanU1, cosAlpha1),
	    	sinAlpha = cosU1 * sinAlpha1,
	    	cosSqAlpha = 1 - sinAlpha*sinAlpha,
	    	uSq = cosSqAlpha * (a*a - b*b) / (b*b),
	    	A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq))),
	    	B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq))),
	    	sigma = s / (b*A), sigmaP = 2*Math.PI;

	    while (Math.abs(sigma-sigmaP) > 1e-12) {
	        var cos2SigmaM = Math.cos(2*sigma1 + sigma),
	        	sinSigma = Math.sin(sigma),
	        	cosSigma = Math.cos(sigma),
	        	deltaSigma = B*sinSigma*(cos2SigmaM+B/4*(cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)-
	            			 B/6*cos2SigmaM*(-3+4*sinSigma*sinSigma)*(-3+4*cos2SigmaM*cos2SigmaM)));
	        sigmaP = sigma;
	        sigma = s / (b*A) + deltaSigma;
	    }
	    var tmp = sinU1*sinSigma - cosU1*cosSigma*cosAlpha1,
	    	lat2 = Math.atan2(sinU1*cosSigma + cosU1*sinSigma*cosAlpha1,
	        (1-f)*Math.sqrt(sinAlpha*sinAlpha + tmp*tmp)),
	    	lambda = Math.atan2(sinSigma*sinAlpha1, cosU1*cosSigma - sinU1*sinSigma*cosAlpha1),
	    	C = f/16*cosSqAlpha*(4+f*(4-3*cosSqAlpha)),
	    	lam = lambda - (1-C) * f * sinAlpha * 
	    		  (sigma + C*sinSigma*(cos2SigmaM+C*cosSigma*(-1+2*cos2SigmaM*cos2SigmaM))),
	    	revAz = Math.atan2(sinAlpha, -tmp),
	    	lamFunc = lon1 + (lam * 180/pi),
	    	lat2a = lat2 * 180/pi;

	    return L.latLng(lamFunc, lat2a);

	}

	function createGeodesicPolygon(origin, radius, sides, rotation, projection) {

		var latlon = origin; //leaflet equivalent
		var angle;
		var new_lonlat, geom_point;
		var points = [];

		for (var i = 0; i < sides; i++) {
		    angle = (i * 360 / sides) + rotation;
		    new_lonlat = destinationVincenty(latlon, angle, radius); 
		    geom_point = L.latLng(new_lonlat.lng, new_lonlat.lat); 

		    points.push(geom_point); 
		}   

		return points; 
	}

	function toWKT(layer) {
	    
	    var lng, lat, coords = [];

	    if (layer instanceof L.Polygon || layer instanceof L.Polyline)
	    {
	        var latlngs = layer.getLatLngs();

	        for (var i = 0; i < latlngs.length; i++) {
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
	    }
	    else if (layer instanceof L.Marker) {
	        return "POINT(" + layer.getLatLng().lng + " " + layer.getLatLng().lat + ")";
	    }
	}
		
	function updateMap() {

		console.log('updateMap',nations)

		var URI = globalURI+'auto.vendor?gaul0=('+nations.toString()+')&code=('+checkedMarkets.toString()+')&_output=json';

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
					"FROM data "+
					"WHERE marketcode = '"+k.code+"' ";

				if( startDate && endDate )
					qString += " AND date>='"+startDate+"'"+
							   " AND date<= '"+endDate+"'";

				if(filterPolygonWKT)
					qString += " AND ST_contains(ST_GeomFromText('"+filterPolygonWKT+"',4326),geo)";


				var avg = [],
					avgS = "";

				$.ajax({
				  type: 'GET',
				  url: WDSURI,
				  data: {
						payload: '{"query": "'+qString+'"}',
						datasource: DATASOURCE,
							outputType: 'array'
						},
						success: function (response) {
							
							var noData = !!response[1][0];

							if(noData)
								avgS = "<br>" + parseFloat(response[1] ? response[1][0] : 0).toFixed(2)+ 
									currency + "\/" + munit;
							else
								avgS = "";

							vendors.push(k.name);
							marketcode.push(k.code);
							lats.push(k.lat);
							lons.push(k.lon);

							var temp = [];
							temp.push(k.lat);
							temp.push(k.lon);
							temp.push(k.name + avgS);
							temp.push(noData);

							addressPoints.push(temp);

							address++;
							
							//console.log(data.vendors.length+" > "+address);

							if ( address >= data.vendors.length )
								refreshCluster();
					  },
					  error: function (a) {
						  //console.log("KO:"+a.responseText);						               
					  }
				  });
			});

		function refreshCluster() {
				//console.log("refreshCluster inside UpdateMap");
				var desatIcon = L.icon({
					iconUrl: 'img/marker-icon-none.png',
					shadowUrl: 'img/marker-shadow.png',
					iconSize: L.point(109,109),
					iconAncho: L.point(109,109)
				});
				
				var foundIcon = L.icon({
					iconUrl: 'img/marker-icon.png',
					shadowUrl: 'img/marker-shadow.png',
					iconSize: L.point(109,109),
					iconAncho: L.point(109,109)
				});
				
				var existingPoints = [];

				//console.log('refreshCluster',addressPoints)
		
				var latlngs = [];
				for (var i = 0; i < addressPoints.length; i++)
				{
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

				  var marker = L.marker(position, { icon: a[3] ? foundIcon : desatIcon });
					
				  marker.bindPopup(title);

				  marker.on('mouseover', function(e) {
				  	e.target.openPopup();
				  });

				  markers.addLayer(marker);
				  
				  if(a[3])
				  	latlngs.push(position);
				}

				map.addLayer(markers);	
				map.fitBounds( L.latLngBounds(latlngs).pad(0.2) );
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
			markerZoomAnimation: true,
			layers: [tiles],
			zoom: 9,
			scrollWheelZoom: false
		});

		window.map = map;

		map.addControl( new L.Control.GeoSearch({
		    provider: new L.GeoSearch.Provider.Google(),
			showMarker: false,
        }) );

		// Initialise the FeatureGroup to store editable layers
		var drawnItems = new L.FeatureGroup();
		map.addLayer(drawnItems);

		var Doptions = {
			position: 'bottomleft',
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

//console.log('draw:created',e.layerType, e.layer)

			if (type === 'circle')
			{
				var origin = layer.getLatLng(); //center of drawn circle
				var radius = layer.getRadius(); //radius of drawn circle
				var projection = L.CRS.EPSG4326;
				var polys = createGeodesicPolygon(origin, radius, 10 , 0, projection); //these are the points that make up the circle
				var coords = []; // store the geometry
				for (var i = 0; i < polys.length; i++) {
				    var geometry = [
				    	parseFloat(polys[i].lat.toFixed(3)),
				    	parseFloat(polys[i].lng.toFixed(3))
				    ]; 
				    coords.push(geometry);
				}

				var polyCircle = L.polygon(coords);
					
				//var geoPolygon = polyCircle.toGeoJSON();
				//L.geoJson(geoPolygon, {style: {color:'#f00'} }).addTo(map);

				filterPolygonWKT = toWKT(polyCircle);
	        }
	        else
				filterPolygonWKT = toWKT(layer);
			
			drawnItems.clearLayers().addLayer(layer);

			updateMap();
		})
		.on('draw:deleted', function (e) {
			console.log('DRAW deleted')
			drawnItems.clearLayers();
		});
	}


	initUI();

	function updateView() {
		updateMap();	
		updateChart();	
		createTable();
	}
	
	
});