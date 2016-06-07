var CrowdpricesMap = function(mapID) {
	
	var result = {		
			map : "",
			geojsonLayer : "",	
			geojsonLayerDisabled : "",	
			mapID: "",
			theme : "energyblue",	
			/** base URL for WDS, default: fenixapps.fao.org */
			baseurl : "",	
			/** language for the tree, default: en */
			language : "fr",	
			// commodities 
			commoditycodes: "",
			fromdate: "",
			todate: "",
			
			/** cluster markers **/
			geojsonLayer: "",
			// markers: "",
		
			initUI : function(mapID, language) {
				this.mapID = mapID;
				this.language = language;
				//if ($.url().param('language') != null) {
				//	CrowdpricesUIBuilder.language = $.url().param('language');
				//} else { 
				//	CrowdpricesUIBuilder.language = 'en';
				//}
				var _this = this;
				$.getJSON('src/config/crowdprices-configuration.json', function(data) {
					_this.baseurl = data.baseurl;
					_this.createMap();
				});

				// query
				bbox = null;
				l = null;
			},
			
			createMap : function() {
				map = new L.Map(this.mapID, 
					{
						crs:L.CRS.EPSG3857,
					 	fullscreenControl: true,
						fullscreenControlOptions: { // optional
							title:"Show me the fullscreen !"
						},
						attributionControl: false
					});
	

				//map.setView(new L.LatLng(0, 0), 1);
				//map.setView(new L.LatLng(18.987248, -72.742905), 7);
				map.setView(new L.LatLng(0, 0), 1);


                var southWest = new L.LatLng(-4.806364708499998,27.773437499999996);
                var northEast = new L.LatLng(6.162400921526595,48.1640625);
                bounds = new L.LatLngBounds(southWest, northEast);
				//var BBOX = "3143090.6030864473,-511210.84517125867,5412964.595043041,711781.6073915606";
				map.fitBounds(bounds);

				var esriURL='http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.png';
				var esri = new L.TileLayer(esriURL);		
				map.addLayer(esri);



				var gaul1 = new L.TileLayer.WMS('http://hqlprfenixapp1.hq.un.fao.org:10090/geoserver/wms',
					{
						layers:"gaul1_3857",
						styles:"gaul1_line",
						format:"image/png",
						visibility:true,
						transparent:true,
						cql_filter: "adm0_code IN (133)"
					});
				map.addLayer(gaul1)

				var gaul0 = new L.TileLayer.WMS('http://hqlprfenixapp1.hq.un.fao.org:10090/geoserver/wms',
					{
						layers:"gaul0_line",
						styles:"gaul0_line",
						format:"image/png",
						visibility:true,
						transparent:true
					});
				map.addLayer(gaul0);

				drawnItems = new L.FeatureGroup();
				map.addLayer(drawnItems);

				var drawControl = new L.Control.Draw({
					draw: {
						position: 'topleft',
						polygon: {
							allowIntersection: false,
							drawError: {
								color: '#b00b00',
								timeout: 1000
							},
							shapeOptions: {
								color: '#bada55'
							},
							showArea: true
						},
						polyline: {
							metric: false
						},
						circle: {
							shapeOptions: {
								color: '#662d91'
							}
						}
					},
					edit: {
						featureGroup: drawnItems
					}
				});
				map.addControl(drawControl);


				var _this = this;
				map.on('draw:deleted', function (e) {
					console.log('deleted');
					bbox = null;
					_this.updateAll();
				});

				map.on('draw:edited', function (e) {
					console.log('edited', e);
	
					var layers = e.layers;
					    layers.eachLayer(function (layer) {
					        //do whatever you want, most likely save back to db
					        _this.setBBOX(layer);
					    });
				});

				map.on('draw:created', function (e) {
					 console.log('created', e);
					_this.setBBOX(e.layer);
				});

	
				geojsonLayer = new L.GeoJSON();
				geojsonLayerDisabled = new L.GeoJSON();
				
				var _this = this;
				this.removePoints();
				map.on('moveend', function(e) {
					//if ( bbox == null)
						//_this.updateAll();
				});
				
		        new L.Control.GeoSearch({
		            provider: new L.GeoSearch.Provider.OpenStreetMap()
		        }).addTo(map);


/*		       	$('#coordinates').click(function() {
		       		console.log( map.getBounds())
		       		var bounds = map.getBounds(),sw = bounds.getSouthWest(),ne = bounds.getNorthEast();

		       		var bounds = map.getBounds(),sw = bounds.getSouthWest(),ne = bounds.getNorthEast();
        			var BBOX = sw.x + ',' + sw.y +',' + ne.x + ',' + ne.y;
        			alert(BBOX);
		       	});*/


				
				// Markers clusters example
				//markers = new L.MarkerClusterGroup({spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: false});
				//markers.on('clusterclick', function (a) {
				//	a.layer.zoomToBounds();
				//});
				//this.populate();
				//map.addLayer(markers);



				$('#crowdprices').click(
					function() {
						//alert('here');
						html2canvas($("#chart-timeserie"), {
					        onrendered: function(canvas) {
					        	console.log('here');
					            // canvas is the final rendered <canvas> element
					            var myImage = canvas.toDataURL("image/png");
					            window.open(myImage);
					        },
					        useCORS: true
	   					 });
		       	});

			},

			setBBOX: function(layer) {

					console.log(layer)

					if ( l != null ) {
						drawnItems.removeLayer(l);
					}
					l = layer;
					drawnItems.addLayer(l);

					var geojson = layer.toGeoJSON();
					console.log('setBBOX',geojson);
					// console.log(geojson.coordinates);

					var s = '';
					for (var i=0; i<geojson.geometry.coordinates.length; i++) {
						//console.log("-> " + geojson.coordinates[i] );
						for (var j=0; j<geojson.geometry.coordinates[i].length; j++) {
							console.log("-> " + geojson.geometry.coordinates[i][j] );
							var point =  new L.LatLng(geojson.geometry.coordinates[i][j][1], geojson.geometry.coordinates[i][j][0]);
							//var point = map.options.crs.project( new L.LatLng(geojson.geometry.coordinates[i][j][1], geojson.geometry.coordinates[i][j][0]) );
							console.log("point: " + point);
							s += point.x + " " + point.y;
							if ( j < geojson.geometry.coordinates[i].length -1)
								s += ",";
						}
					}
					polygon = s;
					console.log(polygon);

					//var BBOX = sw.lng + "," + sw.lat +"," + ne.lng + ","+ ne.lat;
					bbox = '';
					for (var i=0; i<geojson.geometry.coordinates.length; i++) {
						//console.log("-> " + geojson.coordinates[i] );
						for (var j=0; j<geojson.geometry.coordinates[i].length; j++) {
							console.log("-> " + geojson.geometry.coordinates[i][j] );
							if ( j == 0 )
								bbox += geojson.geometry.coordinates[i][j][0] + ',' + geojson.geometry.coordinates[i][j][1];
							if ( j == 2)
								bbox += ',' + geojson.geometry.coordinates[i][j][0] + ',' + geojson.geometry.coordinates[i][j][1];
						} 
					}

					
					console.log('bbox');
					console.log(bbox);

					this.updateAll();
			},


			
			onEachFeature : function(feature, layer) {
			    // does this feature have a property named popupContent?
			    if (feature.properties && feature.properties.popupContent) {
			        layer.bindPopup(feature.properties.popupContent);
//			        console.log(feature.properties.iconurl);
			        layer.setIcon(new L.Icon({
//			        	iconUrl: 'src/images/marker-icon.png',
                        iconUrl: feature.properties.iconurl,
                        iconAnchor:   [25, 41], // point of the icon which will correspond to marker's location
//                        popupAnchor:  [12, 41] // point from which the popup should open relative to the iconAnchor
//                        iconSize: new L.Point( e.properties.icon_size[0], e.properties.icon_size[1] ),
                        iconAnchor: [12, 41]
                       }));
			    }
			},

			getPoints : function(commoditycodes, fromdate, todate) {
				
//				console.log("GET POINTS!!!");
				
				this.commoditycodes = commoditycodes;
				this.fromdate =  fromdate;
				this.todate = todate;

				// removing old points
				this.removePoints();
				// saving current codes
								
				// getting bbox
				var BBOX = this.getBBOX();

				var URL = 'http://'+ this.baseurl +'/rest/crowdprices/data/points/null/'+ commoditycodes +'/'+ fromdate +'/'+ todate +'/' + BBOX + '/' + this.language + '/null';
				//alert(URL);
				// getting points
				var _this = this;
				$.ajax({
						type : 'GET',
						url : URL,
						dataType : 'json',
						success : function(response) {
							geojsonLayer = new L.GeoJSON();
							geojsonLayer = L.geoJson(response, { onEachFeature : _this.onEachFeature });
							map.addLayer(geojsonLayer);		
						},
						error : function(err, b, c) {
							//alert(err.status + ", " + b + ", " + c);
						}
					});
				
				
				var URLdisabled = 'http://'+ this.baseurl +'/rest/crowdprices/data/points/null/'+ commoditycodes +'/'+ fromdate +'/'+ todate+'/' + BBOX + '/' + this.language + '/disabled';
				//alert(URL);
				// getting points
				var _this = this;
				$.ajax({
						type : 'GET',
						url : URLdisabled,
						dataType : 'json',
						success : function(response) {
							geojsonLayerDisabled = new L.GeoJSON();
							geojsonLayerDisabled = L.geoJson(response, { onEachFeature : _this.onEachFeature });
							map.addLayer(geojsonLayerDisabled);	
						},
						error : function(err, b, c) {
							//alert(err.status + ", " + b + ", " + c);
						}
					});
				

				},
				
				updateAll: function() {
					// removing old points
					Crowdprices.updateAll();
				},


				removePoints: function() {
//					console.log('remove points');
					geojsonLayer.clearLayers();
					geojsonLayerDisabled.clearLayers();
//					map.removeLayer( geojsonLayerDisabled );
//					map.removeLayer( geojsonLayer );
				},
				
				getBBOX: function() {



					

					//getting bbox
					if ( bbox == null ) {

						var bounds = map.getBounds();
						var sw = bounds.getSouthWest();
						var ne = bounds.getNorthEast();
						var BBOX = sw.lng + "," + sw.lat +"," + ne.lng + ","+ ne.lat;
						console.log('BOX:' + BBOX)
						return BBOX;
					}
					else					
						return bbox;
				},
				
				populate:  function() {
					for (var i = 0; i < 100000; i++) {
						var m = new L.Marker(this.getRandomLatLng(map));
						markers.addLayer(m);
					}
					return false;
				},
				
				getRandomLatLng: function(map) {
					var bounds = map.getBounds(),
						southWest = bounds.getSouthWest(),
						northEast = bounds.getNorthEast(),
						lngSpan = northEast.lng - southWest.lng,
						latSpan = northEast.lat - southWest.lat;

					return new L.LatLng(
							southWest.lat + latSpan * Math.random(),
							southWest.lng + lngSpan * Math.random());
				}
				
		};
	return result;
}
