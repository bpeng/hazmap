/**********************************************************************************
 * map to display volcano locations for data from volcano/services
 * baishan 
 * 26/4/2012
 * 
*********************************************************************************** */
var volcanoMapClient = {
	//constants
	geoNetOSMUrl : 'http://{s}.geonet.org.nz/osm/tiles/',
	volcanoDataURL : "data/volcanos.json",
	volcanoDetailsPageURL : "/volcano/info/",
	mapImgsDir : "images/",
	mapCenter : new L.LatLng(-36, 177.5),
	mapZoom : 5,
	//map vars
	mapCentreLonSign : 1,	//hold the map center property
	map:null, 
	volcanoLayer:null,		
	http_request_volc : false,
	
	//functions
    createRequest:function(){
       var http_request = false;
	   if (window.XMLHttpRequest) { // Mozilla, Safari,...
	         http_request = new XMLHttpRequest();
	         if (http_request.overrideMimeType) {
	            http_request.overrideMimeType('text/xml');
	         }
	      } else if (window.ActiveXObject) { // IE
	         try {
	            http_request = new ActiveXObject("Msxml2.XMLHTTP");
	         } catch (e) {
	            try {
	               http_request = new ActiveXObject("Microsoft.XMLHTTP");
	            } catch (e) {}
	         }
	      }
	   return http_request;
    },   
    
    queryVolcanoData:function(url){   	
    	 this.http_request_volc = false;
	     this.http_request_volc = this.createRequest();
	     //console.log("this.http_request_volc " + this.http_request_volc);
	      if (!this.http_request_volc) {	      
	         return false;
	      }	     
	      this.http_request_volc.onreadystatechange = function(){
	      	//console.log("volcanoMapClient.http_request_volc.status " + volcanoMapClient.http_request_volc.status);
	      	 if ((volcanoMapClient.http_request_volc.readyState == 4) 
	      	          && (volcanoMapClient.http_request_volc.status >= 200)) {  
	      	 	
            	volcanoMapClient.parseVolcanoData(volcanoMapClient.http_request_volc);
                //check feature positions
            	volcanoMapClient.checkFeatureLocation();   
	      	 }
	      }; 
	      //   
	      this.http_request_volc.open('GET', url , true);
	      this.http_request_volc.send(null);	     
    },
	
	//check feature location, and change feature coordinates to fix the cross dateline issue
	checkFeatureLocation : function (e){	
		//console.log("1 ### checkFeatureLocation");
	  var lonsign1 = this.map.getCenter().lng/Math.abs(this.map.getCenter().lng);	
	  //console.log("2 ### checkFeatureLocation");
	  if(!e || this.mapCentreLonSign != lonsign1){
		this.mapCentreLonSign = lonsign1;
		//console.log("3 ### checkFeatureLocation");
		//move layer location
		for (var i = 0; i < this.volcanoLayer.features.length; i++){
			var layer = this.volcanoLayer.features[i];					
			var lonsign2 = layer.getLatLng().lng/Math.abs(layer.getLatLng().lng);
			if(lonsign2 != this.mapCentreLonSign){
				console.log("3-1 ### checkFeatureLocation" + JSON.stringify(layer.getLatLng()) );
				var newLatlng = new L.LatLng(layer.getLatLng().lat, (this.mapCentreLonSign*360 + layer.getLatLng().lng),true);					
				layer.setLatLng(newLatlng);
				console.log("3-2 ### checkFeatureLocation" + JSON.stringify(layer.getLatLng()) );
			}
		  }
		//console.log("4 ### checkFeatureLocation");
		}
	},	
	
	//parse volcano data in json format
	parseVolcanoData : function(response){
			//console.log("response" + response.responseText);
		var jsondata = JSON.parse(response.responseText);
		//console.log("features: " + jsondata.features.length);
		for(var i = 0; i < jsondata.features.length; i++){
			var geojsonpoint = jsondata.features[i];
			var volcFeature = this.volcanoLayer.addGeoJSON(geojsonpoint);
		}
	},
	
	//init map and params
	initMap: function(dataURL, imgUrl, volcDetailsUrl){
		//urls
		if(imgUrl){
			this.mapImgsDir = imgUrl;
		}
		//
		if(volcDetailsUrl){
			volcanoDetailsPageURL = volcDetailsUrl;
		}
		//create map
		this.map = new L.Map('volc-map');
		//1. base layer
		var cloudmadeUrl = this.geoNetOSMUrl + '{z}/{x}/{y}.png',//
			cloudmadeAttribution = '',
			cloudmade = new L.TileLayer(cloudmadeUrl, 
										{maxZoom: 18, 
										 attribution: cloudmadeAttribution,
										 subdomains:['static1','static2','static3','static4','static5']
										}
			);

		this.map.setView(this.mapCenter, this.mapZoom).addLayer(cloudmade); 
		 
		 //2. overlays
		var volcIcon = L.Icon.extend({
		     iconUrl:  this.mapImgsDir + 'volcano.png',
		     iconSize: new L.Point(20, 30),
		     shadowUrl: this.mapImgsDir + 'volcano.png',
			 shadowSize: new L.Point(0, 0),
		     iconAnchor: new L.Point(10,15),
		     popupAnchor: new L.Point(0, 0)
		});				

		this.volcanoLayer = new L.GeoJSON(null, {
		    pointToLayer: function (latlng){
		    	return new  L.Marker(latlng, {icon: new volcIcon()});
		    }
		});	

		this.volcanoLayer.features = [];//hold all added features	

		this.volcanoLayer.addGeoJSON =  function(geojson) {//modify the addGeoJSON function to get reference to all features
			if (geojson.features) {
				for (var i = 0, len = geojson.features.length; i < len; i++) {
					this.addGeoJSON(geojson.features[i]);
				}
				return;
			}
					
			var isFeature = (geojson.type == 'Feature'),
				geometry = (isFeature ? geojson.geometry : geojson),
				layer = L.GeoJSON.geometryToLayer(geometry, this.options.pointToLayer);
			
			this.fire('featureparse', {
				layer: layer, 
				properties: geojson.properties,
				geometryType: geometry.type,
				bbox: geojson.bbox,
				id: geojson.id
			});
			
			this.addLayer(layer);
			this.features.push(layer);
		};
	    //get feature properties as popup contents
		this.volcanoLayer.on("featureparse", function (e) {
			//console.log("featureparse" + JSON.stringify(e.layer));
			if(e.layer && e.properties && e.properties.id && e.properties.alertlevel && e.properties.aviationcode){
				e.layer.bindPopup( 'Volcano: <a href="' 
											+ volcanoMapClient.volcanoDetailsPageURL +  e.properties.id 
			    							+ '" target="GEONET-VOLCANO">' + e.properties.title + '</a>'
			    					+ "<br/>Type: " + e.properties.type
			                        + "<br/>Alert level: " + e.properties.alertlevel
			                        + '<br/>Aviation code: ' + '<span style="font-weight: bold; color: ' 
			                                + e.properties.aviationcolorcode + ';">' 
			                                + e.properties.aviationcode + '</span>'			                                
			    				);
			  }
		});	

		this.map.addLayer(this.volcanoLayer);

		//check feature location for crossing dateline
		this.map.on('moveend', function(e){
			
			volcanoMapClient.checkFeatureLocation(e);
			
		 });
		
		//load data from http
		if(dataURL) {
			volcanoMapClient.queryVolcanoData(dataURL);
	    }
	}
};



//starts here
window.onload = function() {
	//console.log("window.onload " + volcanoDataURL);
	volcanoMapClient.initMap(volcanoMapClient.volcanoDataURL);
};
