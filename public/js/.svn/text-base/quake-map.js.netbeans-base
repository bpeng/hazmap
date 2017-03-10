/*******************************************************************************
 * OpenLayers map for GeoNet quakes										********
 * base map: open street map rendered by mapnik							********
 * quake layer: vector layer from geoserver in GeoJson format			********
 * 																		********
********************************************************************************/
//###### 1. constants: #################*/
var quakeMapApp = {	
	GEOSERVER_URL : "/geoserver/geonet/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=geonet:quake&outputFormat=json",
	PROJ_WGS : new OpenLayers.Projection("EPSG:4326"),
	PROJ_GOOGLE : new OpenLayers.Projection("EPSG:900913"),
	OSM_TILES_URL : "http://camden.gns.cri.nz/osm/tiles/",	
	//the images direction for ol map
	OL_IMAGES : "http://camden.gns.cri.nz/osm/images/",		
	max_map_bounds: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508.34),
	mapOptions:{
		  theme: null,
		  controls: [],
	      projection: new OpenLayers.Projection("EPSG:900913"),
	      displayProjection: new OpenLayers.Projection("EPSG:4326"),
	      units: "m",
	      numZoomLevels: 20,
	      maxResolution: 156543.0339,
	      maxExtent: new OpenLayers.Bounds(-20037508, -20037508,
	                                       20037508, 20037508.34)
	  }, 
	mapCentre : new OpenLayers.LonLat(173.0,-41.0),
	mapZoomLevel: 5	,
	popoffset1: new OpenLayers.Pixel( 0, 0), //offset for popup location
	popoffset2: new OpenLayers.Pixel( 8, 5)
};

/*###################################
 * 2. JsonMapClient  * 
 *###################################**/
OpenLayers.JsonMapClient = OpenLayers.Class({ 
	//2.1. properties
	map: null,	
	styleMap_quake: null,
	jsonFormat : null,
	  
   //2.2 functions
   initialize: function (options) {
       OpenLayers.Util.extend(this, options);   
        //map styles
        var defaultStyle_quake = new OpenLayers.Style({
     	    pointRadius: 10,  
     	    externalGraphic: OpenLayers.ImgPath + 'quake.png'
     	 });
     	 
        var selectStyle_quake = new OpenLayers.Style({
     	    pointRadius: 12,
     	    externalGraphic: OpenLayers.ImgPath + 'quake.png'
     	 });
        
     	 this.styleMap_quake = new OpenLayers.StyleMap(
     	 {'default': defaultStyle_quake,
     	  'select': selectStyle_quake
     	 }); 
     	 
     	 this.jsonFormat= new OpenLayers.Format.GeoJSON({
		  'internalProjection': quakeMapApp.PROJ_GOOGLE,
		  'externalProjection': quakeMapApp.PROJ_WGS
	  });
   },   
	 
	 //function to retrieve quake data from geoserver
	 queryQuakeData: function(publicid) {
	  var paramString = OpenLayers.Util.getParameterString({'cql_filter': "publicid='" + publicid + "'"});
	  var _url = OpenLayers.Util.urlAppend(quakeMapApp.GEOSERVER_URL, paramString);	
	  var client = this;
		OpenLayers.Request.GET({
			url: _url,
		    success: function(response){
		    	client.parseQuakeData(response, client.map);
		    }
		    //scope: this
		    });
	},
	
	// function to parse json data and create a vector layer
    parseQuakeData: function(response, map) {
    	if(map){
    		this.map = map;
    	}
		var data = response.responseXML || response.responseText;
		 //alert(JSON.stringify(data));	
	    var json = this.jsonFormat.read(data);
	    //alert(JSON.stringify(json));
	    quakelayer = new OpenLayers.Layer.Vector("Quake", {  
	     	styleMap: this.styleMap_quake
	      });
	    //alert(this.map);
	    this.map.addLayer(quakelayer);
	    quakelayer.addFeatures(json); 
	    var featureSelect = this.createSelectFeatureControl([quakelayer], false);	 
	    this.map.addControl(featureSelect);
	    featureSelect.activate();
	    
	    var quake = quakelayer.features[0];
	    if(quake){//recentre map to quake centre
	    	var point = quake.geometry;
	    	//alert(JSON.stringify(quake.geometry));
	    	quakeMapApp.mapCentre = new OpenLayers.LonLat(point.x,point.y);
	    	quakeMapApp.mapZoomLevel = quakeMapApp.mapZoomLevel + 1 ;
			 //mapCentre.transform(PROJ_NZMG, map.getProjectionObject());	
	    	this.map.zoomToMaxExtent();
	    }   
	   
	 },  
	 
	 /*
	   *  
	   * Create a select feature control for specified vector layer
	   */ 	
    createSelectFeatureControl: function (layers, popsize) {
 	    return  new OpenLayers.Control.SelectFeature(layers, 
 		{hover: true,
 		toggle: true,
 		geometryTypes:['OpenLayers.Geometry.Point'],
 		onSelect:function(feature){	  		  
 		  var xy = feature.geometry;
 		  //get some offset
 		 //alert(JSON.stringify(this.popoffset2));
 		  var xy1 = this.map.getLonLatFromPixel(quakeMapApp.popoffset1); 
 		  var xy2 = this.map.getLonLatFromPixel(quakeMapApp.popoffset2); 		
 		  var latLon = new OpenLayers.LonLat(xy.x + xy2.lon -xy1.lon , xy.y + xy2.lat - xy1.lat)	
 	      var info ;	
 		  var popupLen = 260;
 	      if(feature.attributes){	
 	    	  if(feature.attributes.magnitude){
 	            info = "Magnitude: " + feature.attributes.magnitude;
 	            //feature.label = feature.attributes.code;
 	          }	    	  
 	         if(feature.attributes.depth){
 	        	 info +=  "<br/>Depth: " + feature.attributes.depth;
 	         }
 	        if(feature.attributes.origintime){
	        	 info +=  "<br/>Oringin Time: " + feature.attributes.origintime;
	         }
 	         var len = 80 + (info.length - 8)*5;
 	         if(info.indexOf('<br/>') > 0){
 	        	 len = 80 + (info.indexOf('<br/>') - 8)*5;
 	         }
 	         
 	         if (len > popupLen ) popupLen = len;	
 	         var popSize = new OpenLayers.Size(popupLen, 60); 	        
 	      }
 	      
 	      //alert("feature " + feature.attributes.code);
 	       if(!feature.popup){
 	    	   feature.popup = new OpenLayers.Popup("Feature Info",
 	                  latLon, popSize, info, false); 
 	    	  feature.popup.panMapIfOutOfView = true;
 	          this.map.addPopup(feature.popup); 	                 
 	         }else{
 	        	feature.popup.lonlat = latLon;
 	        	feature.popup.updatePosition();
 	        	//setSize:function
 	        	feature.popup.setSize(popSize);
 	        	if(feature.layer.getVisibility()){
 	        		feature.popup.show();
 	        	}
 	         }
 		},
 		onUnselect:function(feature){
 		  if(feature.popup){
 		      feature.popup.hide();
 		   }		
 		},
 		
 	  clickFeature: function(feature) {	 	
      } 						
 	});	
  },  
	
  destroy: function () {
   },
  
  CLASS_NAME: "OpenLayers.JsonMapClient"
});   
 

/*#####################################################
 * 	3.	 Openlayers map starts here				#######
 * ###################################################*/
 OpenLayers.IMAGE_RELOAD_ATTEMPTS=2;
 OpenLayers.Util.onImageLoadErrorColor = '#cccccc';
 OpenLayers.ImgPath = quakeMapApp.OL_IMAGES;
 
 function initQuakeMap(publicid){	 
	 var map = new OpenLayers.Map($('haz-map'), quakeMapApp.mapOptions ); //   
	  //override the zoomToMaxExtent function to zoom to the full NZ extent
	 quakeMapApp.mapCentre.transform(quakeMapApp.PROJ_WGS, quakeMapApp.PROJ_GOOGLE);
	 
	 //var point1 =  new OpenLayers.LonLat(164.0,-47.0);
	// var point2 =  new OpenLayers.LonLat(180.0,-32.0);
	// point1.transform(quakeMapApp.PROJ_WGS, quakeMapApp.PROJ_GOOGLE);
	// point2.transform(quakeMapApp.PROJ_WGS, quakeMapApp.PROJ_GOOGLE);
	// alert(JSON.stringify(point1) + "  " + JSON.stringify( point2));
	 
	 map.zoomToMaxExtent = function(){	
		 map.setCenter(quakeMapApp.mapCentre, quakeMapApp.mapZoomLevel); 
	 };	

	 map.hidePopups = function(){	
		for(var i = 0; i < map.popups.length; i++){
			map.popups[i].hide();
	    }	
	};	
	map.events.register('click', map, function (e) {
		map.hidePopups();
	});
	 
	//use osm Mapnik as base map
	var mapLayer = new OpenLayers.Layer.OSM.Mapnik("Mapnik", 		  
	    { 			
		  displayOutsideMaxExtent: true,
		  wrapDateLine: true 		   
		}  , quakeMapApp.OSM_TILES_URL
	  ); 

	map.addLayer(mapLayer);  

// add overlay
 var olMapClient = new OpenLayers.JsonMapClient({map:map});
	//get quake data
	//2011a470555
  olMapClient.queryQuakeData(publicid );

// ------ add map controls
map.addControl(new OpenLayers.Control.PanZoomBar({zoomWorldIcon:true, zoomStopHeight:8}));  
//map.addControl(new OpenLayers.Control.PanZoom());
map.addControl(new OpenLayers.Control.Navigation());
//map.addControl(new OpenLayers.Control.Scale($('scale')));
var mousepos = new OpenLayers.Control.MousePosition({prefix:"Coordinate: ",numDigits:3});
map.addControl(mousepos);
map.zoomToMaxExtent();
};


//this should be called from the page
//window.onload = initQuakeMap('2011a470555');

