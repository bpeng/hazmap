/**********************************************************************************
 * map to display network locations 
 * baishan 
 * 12/7/2013
 * 
*********************************************************************************** */
var netsitesMapClient = {
	//constants
	geoNetOSMUrl : 'http://{s}.geonet.org.nz/osm/tiles/',
	sitesDataURL : "data/network_sites.json",	
	mapImgsDir : "images/",
	mapCenter : new L.LatLng(-41.3, 173.5),
	mapZoom : 5,
	//map vars
	mapCentreLonSign : 1,	//hold the map center property
	map:null, 
	sitesLayer:null,
	colorTable:{
		"purple":"#7F00FF"
	},
	
	instruments : [5332266,5332267, 5332268, 5332269, 5332270, 5332271, 5332272],
	instrumentnames : ['DataLogger temperature', 'DataLogger voltage', 'DataLogger clock', 
                       'Streaming latency', 'Streaming data', 'GNSS satellites', 'Seismometer drift'],	
	
    showCharts:function (site) {    	
		$('#gns-lib-charts').empty();
		if(site && site != 'null'){			
			//<div id='gns-lib-chart' class="librato-metrics"  data-duration="86400"  style="height: 256px; width: 512px;" >
			 for (var i = 0; i < this.instruments.length; i++){			 
				 $('<p/>', {
					 text: this.instrumentnames[i],
				 } ).appendTo('#gns-lib-charts');
				 
				 $('<div/>', {				 
					    'class': 'librato-metrics',
					    'data-duration': '86400',
					    'style': 'height: 256px; width: 512px;',
					    'data-instrument_id': this.instruments[i],
					    'data-source':site
					}).appendTo('#gns-lib-charts');
				 
				 $('<br/>' ).appendTo('#gns-lib-charts');			
			 }		
		}
	},
	
    querySitesData:function(url){
    	$.ajax ({
		    type: "GET",		  
		      url:url,		      
		      dataType: 'json',
	          //processData: false,
	          mimeType: 'application/json',
	          contentType: 'application/json',		 
		      success: function (result){
		    	  netsitesMapClient.parseSitesData(result);
	              //check feature positions
	              netsitesMapClient.checkFeatureLocation(null, netsitesMapClient.sitesLayer);   		    	
		    }
		  });      		     
    },
    
    /** addGeoJSON and store reference to all features ****/
    addGeoJSON2Layer:function(parentLayer, geojson){  
        if(!parentLayer.features){
            parentLayer.features = [];//hold all added features
        }
    	
        if (geojson.features) {//loop thru all features
            for (var i = 0, len = geojson.features.length; i < len; i++) {
                //parentLayer.addGeoJSON(geojson.features[i]);
                this.addGeoJSON2Layer(parentLayer, geojson.features[i] );
            }
            return;
        }
        //add a feature
        var isFeature = (geojson.type == 'Feature'),
        geometry = (isFeature ? geojson.geometry : geojson),
        layer = L.GeoJSON.geometryToLayer(geometry, parentLayer.options.pointToLayer);
		
        if(isFeature){
			layer.options.color = geojson.properties.status;			
		}
        
        parentLayer.fire('featureparse', {
            layer: layer,
            properties: geojson.properties,
            geometryType: geometry.type,
            bbox: geojson.bbox,
            id: geojson.id
        });
		
        parentLayer.addLayer(layer);
        parentLayer.features.push(layer);
    },
	
    /** check feature location, and change feature coordinates to fix the cross dateline issue******/
    checkFeatureLocation : function (e,layer){
        if(layer){
            var lonsign1 = this.map.getCenter().lng/Math.abs(this.map.getCenter().lng);
            var centerChanged = false;
            if(!layer.centerLonSign || layer.centerLonSign != lonsign1){
                layer.centerLonSign = lonsign1;
                centerChanged = true;
            }
            //check bounds changes
            if(layer.bounds && !this.map.getBounds().intersects(layer.bounds)){
                centerChanged = true;
            }
            layer.bounds = this.map.getBounds();   
            //check for features
            if(!e || centerChanged){
                //check feature location
                if(layer.features && layer.features.length){
                    for (var i = 0; i < layer.features.length; i++){
                        var feature = layer.features[i];                
                        if(!this.map.getBounds().contains(feature.getLatLng())){
                            var lonsign2 = feature.getLatLng().lng/Math.abs(feature.getLatLng().lng);                    
                            if(lonsign2 != layer.centerLonSign){                     
                                var newLatlng = new L.LatLng(feature.getLatLng().lat, (layer.centerLonSign*360 + feature.getLatLng().lng),true);
                                feature.setLatLng(newLatlng);                     
                            }                  
                        }
                    }
                }
            }    		
        }
    },
	
	//parse sites data in json format
	parseSitesData : function(jsondata){	
		netsitesMapClient.addGeoJSON2Layer(netsitesMapClient.sitesLayer, jsondata);
	},
	
	 /* open chart for selected site and param   
     * */
    openSitePlot:function(site){
        if( site) {
        	/***********************************************************************************
        	 * 1. this opens the chart in a separate page:
        	 *  var wintitle = 'gns_chart_' + site;
                var winopts = 'location=0,menubar=0,status=0,scrollbars=1,resizable=1,left=300,top=100,width=1024,height=800';
                var url = "network-status.html?site=" +  site;
                window.open(url,wintitle,winopts);
        	 * 
        	 * /           
        	
        	/************************************************************************************
        	 * 2. this create charts in the same page
        	 * Note: it is not possible to load librato charts after document.ready is called as many of the 
        	 * chart stuff are created at document.ready, so to get the charts of selected sites
        	 * we have to reload the document with a site parameter passed on the window url 
        	 * **********************************************************************************/
        	window.location.href = window.location.href.replace(/[\?#].*|$/, "?site=" + site );
        }
        return false;
    },
    
    getURLParameter:function (name) {
        return decodeURI(
            (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
        );
    },
    
	
	//init map and params
	initMap: function(dataURL, imgUrl){
		//urls
		if(imgUrl){
			this.mapImgsDir = imgUrl;
		}
		
		//create map
		this.map = new L.Map('sites-map',
				{ worldCopyJump: false,
	              attributionControl: false
	            });	 
	    
	    var osmGeonetUrl = 'http://{s}.geonet.org.nz/osm/tiles/{z}/{x}/{y}.png',//
	    osmMqUrl = 'http://{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg',//
	    cloudmadeAttribution = '',
	    osmLayerGeonet = new L.TileLayer(osmGeonetUrl, {
	        minZoom : 1,
	        maxZoom : 15,
	        attribution: cloudmadeAttribution,
	        errorTileUrl: 'http://static.geonet.org.nz/osm/images/logo_geonet.png',
	        subdomains:[ 'static1', 'static2', 'static3', 'static4', 'static5']
	    }),
	    osmLayerMq = new L.TileLayer(osmMqUrl, {
	        minZoom : 16,
	        maxZoom : 17,
	        attribution: cloudmadeAttribution,
	        errorTileUrl: 'http://static.geonet.org.nz/osm/images/logo_geonet.png',
	        subdomains:['otile1','otile2','otile3','otile4']
	    });
	    
	    var mqAerialUrl =  "http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg",
	    mqAerialLayer = new L.TileLayer(mqAerialUrl,
	    {
	        maxZoom: 11,
	        minZoom: 1,
	        attribution: cloudmadeAttribution,
	        errorTileUrl: 'http://static.geonet.org.nz/osm/images/logo_geonet.png',
	        subdomains:['oatile1','oatile2','oatile3','oatile4']
	    }
	    );

	    var topoUrl = 'http://{s}.geonet.org.nz/nztopo/{z}/{x}/{y}.png',
	    topoLayer = new L.TileLayer(topoUrl,
	    {
	        maxZoom: 14,
	        minZoom: 12,
	        attribution: cloudmadeAttribution,
	        errorTileUrl: 'http://static.geonet.org.nz/osm/images/logo_geonet.png',
	        subdomains:[ 'static1', 'static2', 'static3', 'static4', 'static5']
	    }
	    );

	    var osmMap = L.layerGroup([osmLayerGeonet, osmLayerMq]);
	    var aerialTopo = L.layerGroup([mqAerialLayer, topoLayer]);
	    osmMap.maxxxxZommm = 17;
	    aerialTopo.maxxxxZommm = 14;
	    //map switcher
	    var baseLayers = {
	        "Map" : osmMap,
	        "Aerial / Topo" : aerialTopo
	    };

	    this.map.addLayer(aerialTopo);

	    L.control.layers(baseLayers).addTo(this.map);
	    //set map zoom on base layer change, !!!!!! use baselayerchange in next version of leaflet!!!!!!
	    this.map.on('layeradd', function(e){
	        if(e.layer.maxxxxZommm ){
	            this.options.maxZoom = e.layer.maxxxxZommm;
	            if(this.getZoom() > e.layer.maxxxxZommm){
	                this.setZoom(e.layer.maxxxxZommm);
	            }
	        }
	    });

		this.map.setView(this.mapCenter, this.mapZoom);//.addLayer(cloudmade); 
		 
		 //2. overlays
		//this.sitesLayer = new L.GeoJSON();
		this.sitesLayer = new L.GeoJSON(null, {	
		    pointToLayer: function (latlng){
		    	 var coord = latlng["coordinates"];
		    	 return L.circleMarker([coord[1], coord[0]], {
		    	        radius: 7,		    	  
		    	        weight: 1,
		    	        opacity: 1,
		    	        fillOpacity: 0.8,
		    	    });		        	
		    }
		});	

		
	    //get feature properties as popup contents
		this.sitesLayer.on("featureparse", function (e) {
			//console.log("featureparse" + JSON.stringify(e.layer));
			if(e.layer && e.properties && e.properties.site && e.properties.popupContent){
				e.layer.bindPopup("Site: " 
						        + '<a href="#" onclick="netsitesMapClient.openSitePlot(\'' + e.properties.site + '\')">'
						        + e.properties.site + '</a>'
			                    + "<br/>Message: " + e.properties.popupContent
			    		);				
			       }
			    }
		);	

		this.map.addLayer(this.sitesLayer);		

		//check feature location for crossing dateline
		this.map.on('moveend', function(e){		
			netsitesMapClient.checkFeatureLocation(e, netsitesMapClient.sitesLayer);			
		 });
		
		//load data from http
		if(dataURL) {
			netsitesMapClient.querySitesData(dataURL);
	    }
	}
};



//starts here
$(document).ready(function () {
	var siteid = netsitesMapClient.getURLParameter('site');	
	console.log(" siteid " + siteid);
	netsitesMapClient.showCharts(siteid);
	netsitesMapClient.initMap(netsitesMapClient.sitesDataURL);
	
});
