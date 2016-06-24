$( document ).ready(function() {
	var itemToInit = 3,
		counterUI = 0,
		map = null,
		mapInit = false,
		markers = null,
		munit = "Kg",
		currency = "USD",
		allAddressPoints = [],
		globalMarkets;
	
	var globalURI = "http://fenix.fao.org/restsql-0.8.8/res/",
	//PROD globalURI = "http://fenixapps2.fao.org/restsql-0.8.8/res/";
	
	// WDS
		WDSURI = 'http://fenixapps2.fao.org/wds-5.2.1/rest/crud/',
		DATASOURCE = "CROWD",
		countries_tables = {
			"1": { // afganistan demo
				"name": "Demo",
				"table": "data",
				"currency": "USD"
			},
			"90": {
				"table": "data_gambia",
				"currency": "GMD"
			},
			"45": {
				"table": "data_cameroon",
				"currency": "CFA"
			}
		};
	var initGauls = [90,1,45];
	var nations = 1;

	var allMarketName = [];

	var commodityMaps = "";
	var commodityItem = [];
	var commodityName = [];

	var checkedMarkets = [];
	
	var startDate;
	var endDate;

	var filterPolygonWKT;

	var tableIsInit = false;	
	var tableIsInitAgg = false;	
	var isInit = false;


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
		currency = countries_tables[ ''+nations ].currency;

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
		$.ajax({
			type: 'GET',
			url: WDSURI,
			data: {
				payload: '{"query": "SELECT code, name, lang, divisor, shown, countries, groups FROM commodity"}',
				datasource: DATASOURCE,
				outputType: 'object'
			},
			success: function (response) {
				var sel = $("#commodity");
				var first = "";
				$.each(response, function() {
					if(this.code == 36)
						first = "selected";
					sel.append($("<option "+first+" />").val(this.code).text(this.name));
					first = "";
				});
				$('#commodity').chosen({max_selected_options: 10});

				$('#commodity').on('change', function(evt, params) {
					
					updateDates();
					updateValues();

				}).trigger('chosen:updated');

				counterUI++;

				getCountries(false);
				updateValues();
				updateDates();
			},
			error: function (a) {
				console.log("populateUI Error");
				return null;
			}
		});


	}

	function getCountries() {

		var $sel = $("#countries");

		$.ajax({
			type: 'GET',
			url: WDSURI,
			data: {
				payload: '{"query": "SELECT code, name FROM gaul0"}',
				datasource: DATASOURCE,
				outputType: 'object'
			},
			async: false,
			dataType: "json",
			success: function(data) {

				//console.log('getCountries', data);

				$.each(data, function() {
					var selezionato = "";
					if (parseInt(this.code) === nations)
						selezionato = "selected";

					if( _.contains(initGauls, parseInt(this.code)) )
						$sel.append($("<option "+selezionato+" />")
							.val(this.code)
							.text(countries_tables[this.code].name || this.name));
				});

				$('#countries').chosen({max_selected_options: 1});

				$('#countries').on('change', function(evt, params) {

					nations = evt.currentTarget.value;
					getMarkets(true);

					updateValues();
					resizeChosen();

				}).trigger('chosen:updated').trigger("changed");

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

		$.ajax({
			type: 'GET',
			url: WDSURI,
			data: {
				payload: '{"query": "SELECT parentcode, code, name, lang, shown, lat, lon, geo, gaul0 FROM market WHERE gaul0='+nations.toString()+' ORDER BY code"}',
				datasource: DATASOURCE,
				outputType: 'object'
			},
			async: false,
			dataType: "json",
			success: function (data) {
				globalMarkets = data;
				globalMarkets = _.rest(globalMarkets);
				var sel = $("#markets");
				var first = "selected";
				//	data.markets.reverse();
				$.each(data, function () {
					sel.append($("<option " + first + " />").val(this.code).text(this.name));
				});

				$('#markets').on('change', function () {
					
					updateDates();
					updateValues();

				}).trigger('chosen:updated');

				updateValues();
				updateDates();

				counterUI++;

				if(mapInit===false)
					initMap();
			}
		});
	}
	

	
	function updateChart() {
		
		console.log("updateChart");

		var seriesOptions1 = [],
			seriesOptions2 = [],
			seriesOptions3 = [],
			seriesCounter = 0,
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
			var index = -1;
			var commodityALL = "";
			var indexName = allMarketName.length;

			//	$.each(checkedMarkets, function(h,marketcode){
			//		indexName--;
					//console.log("allMarketName: "+allMarketName[indexName]);
			var table  = countries_tables[nations].table,
				sQuery = "SELECT id, gaul0code, citycode, marketcode, munitcode, currencycode, commoditycode, varietycode, price, quantity, untouchedprice, fulldate, note, userid, vendorname, vendorcode, lat, lon, geo " +
					"FROM "+ table + " "+
					"WHERE gaul0code = '"+nations.toString()+"' "+
						" AND marketcode IN ('"+_.compact(checkedMarkets).join("','")+"') "+
						" AND commoditycode IN ('"+_.compact(commodityItem).join("','")+"') ";

				if(filterPolygonWKT)
					sQuery += " AND ST_contains(ST_GeomFromText('" + filterPolygonWKT + "',4326),geo)";


				sQuery = sQuery + " ORDER BY commoditycode, marketcode, fulldate";

				//console.log ("sQuery: "+sQuery);

			$.ajax({
				type: 'GET',
				url: WDSURI,
				data: {
					payload: '{"query": "'+sQuery+'"}',
					datasource: DATASOURCE,
					outputType: 'array'
				},

				success: function (response) {

					//console.log(response);

					//var data = JSON.parse(response);
					var data = _.rest(response),
						averagedata = [],
						resultdata = [],
						aggregated = 0,
						j = 0;

					if(data.length===0)
						return;

					/*		data			
					{
						"id": v["id"],
						"gaul0code": v["gaul0code"],
						"citycode": v["citycode"],
						"marketcode": v["marketcode"],
						"munitcode": v["munitcode"],
						"currencycode": v["currencycode"],
						"commoditycode": v["commoditycode"],
						"varietycode": v["varietycode"],
						"price": v["price"],
						"untouchedprice": v["untouchedprice"],
						"fulldate": v["fulldate"],
						"note": v["note"],
						"userid": v["userid"],
						"vendorname": v["vendorname"],
						"vendorcode": v["vendorcode"],
						"lat": v["lat"],
						"lon": v["lon"],
						"geo": v["geo"]
					}
					*/

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
					
					if(temArray[1]>1)
						averagedata.push(temArray);

					var resultdataG = _.groupBy(resultdata, function(v) {
						return v[2];//market name
					});
					var resultdataA = [];
					_.each(resultdataG, function(v,k) {	
						resultdataA.push( v );
					});

					_.each(resultdataA, function(vals, k) {
						
						var sum = 0,
							avgs = []

						_.map(vals, function(val) {
							sum += val[1]
						});

						avgs.push( sum / vals.length );

						seriesOptions1[k] = {
							name: name + " @ "+ allMarketName[k],
							data: vals
						};

						seriesOptions2[k] = {
							name: name +" (Avg)" + " @ "+ allMarketName[k],
							data: avgs,
							type: 'column'
						};
					});

					console.log("EBBASTACOSTORUMORE",seriesOptions1,seriesOptions2);

				},
				error: function (a) {
					console.log("KO:"+a.responseText);
					return null;
				}
			});

	//	});
		
		
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
	

	function createTableDaily() {

		var $table = $('#tableDaily');

		var allDatas = [];

		var table = countries_tables[ nations ].table,
			qString = "SELECT "+table+".gaul0code, "+table+".vendorname as vendorname, "+table+".citycode, city.code, data.price, data.fulldate, city.name as cityname, commodity.code, commodity.name as commodityname, data.commoditycode, market.code, market.name as marketname, "+table+".marketcode, "+table+".quantity, "+table+".userid "+
				"FROM "+table+", city, commodity, market "+
				"WHERE "+table+".citycode = city.code "+
				" AND CAST ("+table+".commoditycode as INT) = commodity.code "+
				" AND "+table+".gaul0code = '"+nations.toString()+"' "+
				" AND commodity.code = ANY('{"+commodityItem.toString()+"}') "+
				" AND "+table+".marketcode = ANY('{"+_.compact(checkedMarkets).join(",").toString()+"}') "+
				" AND CAST("+table+".marketcode AS INT) = market.code";
		
		if ((startDate !== undefined)&&(endDate !== undefined)) qString = qString +" AND date>='"+startDate+"' AND date<= '"+endDate+"'";
		//qString = qString + "limit 100";
		qString = qString + " ORDER BY "+table+".fulldate DESC ";

		$.ajax({
			type: 'GET',
			url: WDSURI,
			data: {
				payload: '{"query": "'+qString+'"}',
				datasource: DATASOURCE,
				outputType: 'object'
			},

			success: function (response) {
				response = _.rest(response);
				var output = {
					table:[]
				};

				$.each(response, function(index,element){

					output.table.push({
						"gaul0code": element["gaul0code"],
						"vendorname": element["vendorname"],
						"citycode": element["citycode"],
						"code": parseInt(element["code"]),
						"price": parseFloat(element["price"]),
						"fulldate": element["fulldate"],
						"cityname": element["cityname"],
					//	"code": element["code"],
						"commodityname": element["commodityname"],
						"commoditycode": element["commoditycode"],
						"code": element["code"],
						"marketname": element["marketname"],
						"marketcode": element["marketcode"],
						"quantity": parseFloat(element["quantity"]),
						"userid": element["userid"]
					});
				});

				if (tableIsInit) {
					$table.bootstrapTable('removeAll');
					$table.bootstrapTable('append', output.table);
				} else {
					$table.bootstrapTable({
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
						$table.bootstrapTable('togglePagination');
						$table.tableExport({type:'csv'});
						$table.bootstrapTable('togglePagination');
					});
					$("#tblExportXLS").on("click", function(){
						$table.bootstrapTable('togglePagination');
						$table.tableExport({type:'xls'});
						$table.bootstrapTable('togglePagination');
					});
					$("#tblExportJSON").on("click", function(){
						$table.bootstrapTable('togglePagination');
						$table.tableExport({type:'json'});
						$table.bootstrapTable('togglePagination');
					});
				}
			},
			error: function (a) {
				console.log("KO:"+a.responseText);
			}
		});
	}


	function createTableAgg() {

		var $table = $('#tableAgg');

		var allDatas = [];

		var table = countries_tables[ nations ].table,
			datesdefined = ((startDate !== undefined)&&(endDate !== undefined)) ?			
			" AND date>='"+startDate+"' AND date<= '"+endDate+"'" : '',		
			qString = 
				/*"SELECT MIN("+table+".price) AS min, MAX("+table+".price) AS max, "+
						table+".gaul0code, "+table+".vendorname as vendorname, "+table+".citycode, city.code, data.price, data.fulldate, city.name as cityname, commodity.code, commodity.name as commodityname, data.commoditycode, market.code, market.name as marketname, "+table+".marketcode, "+table+".quantity, "+table+".userid "+
				
				"FROM "+table+", city, commodity, market "+

				"WHERE "+table+".citycode = city.code "+
				" AND CAST ("+table+".commoditycode as INT) = commodity.code "+
				" AND "+table+".gaul0code = '"+nations.toString()+"' "+
				" AND commodity.code = ANY('{"+commodityItem.toString()+"}') "+
				" AND "+table+".marketcode = ANY('{"+_.compact(checkedMarkets).join(",")+"}') "+
				" AND CAST("+table+".marketcode AS INT) = market.code";
				*/
qString = 
"SELECT t.cityname,t.marketname,t.vendorname,t.commodityname, min(t.price)min, max(t.price)max, round (avg(t.price)::numeric,2) avg "+
"FROM "+
"(SELECT  "+
	""+table+".gaul0code, "+table+".vendorname as vendorname,  "+
	""+table+".citycode, city.code, "+table+".price, "+table+".fulldate,  "+
	"city.name as cityname, commodity.code, commodity.name as commodityname,  "+
	""+table+".commoditycode, market.code, market.name as marketname,  "+
	""+table+".marketcode, "+table+".quantity, "+table+".userid  "+
	"FROM 	"+table+", "+
		"city, "+
		"commodity, "+
		"market  "+
	"WHERE "+table+".citycode = city.code "+
		datesdefined+
		"AND CAST ("+table+".commoditycode as INT) = commodity.code "+
		"AND "+table+".gaul0code = '"+nations.toString()+"'   "+
		"AND commodity.code = ANY('{"+commodityItem.toString()+"}') "+
		"AND "+table+".marketcode = ANY('{"+_.compact(checkedMarkets).join(",")+"}')   "+
		"AND CAST("+table+".marketcode AS INT) = market.code  "+
	"ORDER BY "+table+".fulldate DESC "+
") t "+

"GROUP BY t.cityname,t.marketname,t.vendorname,t.commodityname "+
"ORDER BY commodityname";

		console.log("createTableAgg: "+qString);

		$.ajax({
			type: 'GET',
			url: WDSURI,
			data: {
				payload: '{"query": "'+qString+'"}',
				datasource: DATASOURCE,
				outputType: 'object'
			},

			success: function (response) {

				response = _.rest(response);
				var output = {
					table:[]
				};
				
				$.each(response, function(index,element){

					output.table.push({
						"gaul0code": element["gaul0code"],
						"vendorname": element["vendorname"],
						"citycode": element["citycode"],
						"code": parseInt(element["code"]),
						"price": parseFloat(element["price"]),
						"fulldate": element["fulldate"],
						"cityname": element["cityname"],
					//	"code": element["code"],
						"commodityname": element["commodityname"],
						"commoditycode": element["commoditycode"],
						"code": element["code"],
						"marketname": element["marketname"],
						"marketcode": element["marketcode"],
						"quantity": parseFloat(element["quantity"]),
						"userid": element["userid"],
						"min": element["min"],
						"max": element["max"],
						"avg": element["avg"]
					});
				});

				if (tableIsInitAgg) {
				//	console.log("!createTableAgg");
					$table.bootstrapTable('removeAll');
					$table.bootstrapTable('append', output.table);
				} else {
					$table.bootstrapTable({
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
							field: 'avg',
							title: 'Average ('+currency+')',
							sortable: true
						}, {
							field: 'min',
							title: 'Minimum ('+currency+')',
							sortable: true
						}, {
							field: 'max',
							title: 'Maximum ('+currency+')',
							sortable: true
						}],
						data: output.table,
						pagination: true,
						search: true,
						sortable: true

					});
					
					tableIsInitAgg = true;
				}
			},
			error: function (a) {
				console.log("KO:"+a.responseText);
			}
		});
	}

	function updateDates() {

		var table = countries_tables[ nations ].table,
			sQuery =
			" SELECT min(fulldate) as startDate, max(fulldate) as endDate "+
			" FROM "+table+" "+
			" WHERE marketcode IN ('"+_.compact(checkedMarkets).join("','")+"') "+
				" AND commoditycode IN ('"+_.compact(commodityItem).join("','")+"') "+
				" AND gaul0code = "+nations.toString()+" ";

		//console.log("updateDates()", sQuery);

		$.ajax({
			type: 'GET',
			url: WDSURI,
			data: {
				payload: '{"query": "'+sQuery+'"}',
				datasource: DATASOURCE,
				outputType: 'array'
			},
			success: function (response) {

				//console.log("Dates defined",response);
				//console.log(startDate,endDate);
				//console.log(new Date(response[0]),new Date(response[1]));
				if(response[1]) {
					var s1 = response[1][0],
						s2 = response[1][1],
						d1 = (s1.substring(0,10)),
						d2 = (s2.substring(0,10));

					startDate = d1;
					endDate = d2;
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

		if (markers != null) {
			map.removeLayer(markers);
			markers = L.markerClusterGroup({
				showCoverageOnHover: false
			});
			markers.clearLayers()
		}
		
		if (commodityMaps != "") {
			//console.log(checkedMarkets);
			var table = countries_tables[nations].table,
			//  AND date>='2015-12-01' AND date<= '2015-12-31'
				qString = "SELECT AVG(price), COUNT(price), marketcode " +
					" FROM " + table + " "+
					" WHERE marketcode IN ('" + _.compact(checkedMarkets).join("','") + "') ";

			if (startDate && endDate)
				qString += " AND date>='" + startDate + "'" +
					" AND date<= '" + endDate + "'";

			if (filterPolygonWKT)
				qString += " AND ST_contains(ST_GeomFromText('" + filterPolygonWKT + "',4326),geo)";

			qString += " GROUP BY marketcode ORDER BY marketcode";

			//console.log('qString: ',qString);

			$.ajax({
				type: 'GET',
				url: WDSURI,
				data: {
					payload: '{"query": "'+qString+'"}',
					datasource: DATASOURCE,
					outputType: 'object'
				},
				success: function (response) {

					var vendors = [];
					var marketcode = [];
					var addressPoints = [];

					address = 0;
					response = _.rest(response);

					var Cresponse = _.groupBy(response,'marketcode');
					var CglobalMarkets = _.groupBy(globalMarkets,'code');


					$.each(globalMarkets, function (k, v) {

					//console.log(v);

						v = _.extend(v, Cresponse[v.code] );

						var avg = [],
							avgS = "",
							noData = !!v[0];

							if (noData)
								avgS = "<br>" + parseFloat(v[0].avg).toFixed(2) + currency + "\/" + munit;

							vendors.push(v.name);
							marketcode.push(v.code);

							var temp = [];
							temp.push(v.lat);			//0
							temp.push(v.lon);			//1
							temp.push(v.name + avgS);	//2
							temp.push(noData);			//3

							if(Cresponse[v.code])
								addressPoints.push(temp);

							address++;
					});

					refreshCluster();

					function refreshCluster() {
						//console.log("refreshCluster inside UpdateMap");
						var desatIcon = L.icon({
							iconUrl: 'img/marker-icon-none.png',
							shadowUrl: 'img/marker-shadow.png',
							iconSize: L.point(109, 109),
							iconAncho: L.point(109, 109)
						});

						var foundIcon = L.icon({
							iconUrl: 'img/marker-icon.png',
							shadowUrl: 'img/marker-shadow.png',
							iconSize: L.point(109, 109),
							iconAncho: L.point(109, 109)
						});

						var existingPoints = [];

						//console.log('refreshCluster',addressPoints)

						var latlngs = [];
						for (var i = 0; i < addressPoints.length; i++) {
							//console.log ("pop!");
							var a = addressPoints[i];

							var title = a[2];
							//console.log(a.toString());
							var cIcon = desatIcon;
							var loc = new L.LatLng(a[0], a[1]);
							var temp = [];
							temp.push(loc);
							temp.push(title);

							existingPoints.push(temp);

							var marker = L.marker(loc, {icon: a[3] ? foundIcon : desatIcon});

							marker.bindPopup('<div class="' + (!a[3] && 'notValued') + '">' + title + '</div>');

							marker.on('mouseover', function (e) {
								e.target.openPopup();
							});

							markers.addLayer(marker);

							if (a[3])
								latlngs.push(loc);
						}

						map.addLayer(markers)
						
						if(latlngs.length>0)
							map.fitBounds(L.latLngBounds(latlngs).pad(0.2));
					}
				}
			});

		}

	}

	function initMap() {

		mapInit=true;

		var tiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
				subdomains: 'abcd',
				maxZoom: 19
			});

		markers = L.markerClusterGroup({
			showCoverageOnHover: false
		});

		map = L.map('map-cluster', {
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

		var drawOpts = {
			position: 'bottomleft',
			draw: {					
				marker: false,
				polyline: false,
				polygon: {
					allowIntersection: false,
					drawError: {
						color: '#399BCC',
						timeout: 1000
					},
					shapeOptions: {
						color: '#3FAAA9',
						fillColor: '#3FAAA9',
						fillOpacity: 0.1
					},
					showArea: true
				},
				circle: {
					shapeOptions: {
						color: '#3FAAA9',
						fillColor: '#3FAAA9',
						fillOpacity: 0.1
					}
				}					
			},
			edit: {
				featureGroup: drawnItems,
				edit: false
			}
		};

		var drawControl = new L.Control.Draw(drawOpts);

		map.addControl(drawControl);

		map.on('draw:created', function (e) {
			var type = e.layerType,
				layer = e.layer;

			if (type === 'circle')
			{
				var origin = layer.getLatLng(); //center of drawn circle
				var radius = layer.getRadius(); //radius of drawn circle
				var projection = L.CRS.EPSG4326;
				var polys = createGeodesicPolygon(origin, radius, 10 , 0, projection); //these are the points that make up the circle
				var coords = [];
				for (var i = 0; i < polys.length; i++) {
				    var geometry = [
				    	parseFloat(polys[i].lat.toFixed(3)),
				    	parseFloat(polys[i].lng.toFixed(3))
				    ]; 
				    coords.push(geometry);
				}

				var polyCircle = L.polygon(coords);

				filterPolygonWKT = toWKT(polyCircle);
	        }
	        else
				filterPolygonWKT = toWKT(layer);
			
			drawnItems.clearLayers()
				.addLayer(layer);

			drawnItems.setStyle(drawOpts.draw.polygon.shapeOptions);

			updateView();
		})
		.on('draw:deleted', function (e) {
			drawnItems.clearLayers();
			filterPolygonWKT = '';
			updateView();
		});
	}

	populateUI();
	
	Highcharts.setOptions({
		chart: {
			style: {
				fontFamily: "Roboto",
				fontSize: '10px'
			}
		}
	});

	function updateView() {
		updateMap();	
		updateChart();
		createTableDaily();
		createTableAgg();
	}
	
	
});