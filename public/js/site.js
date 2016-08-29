var epsg4326 = new OpenLayers.Projection("EPSG:4326");
var PROJ_WGS = new OpenLayers.Projection("EPSG:4326");
var PROJ_GOOGLE = new OpenLayers.Projection("EPSG:900913");
var OSM_TILES_URL = "/osm/tiles/";

var map;
var markers;
var r;

function InitMap() {
  OpenLayers.ImgPath='images/';
  /**
  map = new OpenLayers.Map('map', {
      controls: [
         //new OpenLayers.Control.ArgParser(),
        // new OpenLayers.Control.Attribution(),
         new OpenLayers.Control.LayerSwitcher({activeColor:"#737373"}),
         new OpenLayers.Control.Navigation(), 
         //new OpenLayers.Control.PanZoomBar()
         new OpenLayers.Control.MousePosition({prefix:"Coordinate: ",numDigits:3}),
         new OpenLayers.Control.PanZoomBar({zoomWorldIcon:true, zoomStopHeight:8})
	 //new OpenLayers.Control.ScaleLine(),
	//new OpenLayers.Control.Permalink(),
	// new OpenLayers.Control.Permalink(document.getElementById("viewanchor")),
	// new OpenLayers.Control.Permalink(document.getElementById("orgviewanchor"),"http://www.openstreetmap.org/")
      ],
      units: "m",
      maxResolution: 156543.0339,
      numZoomLevels: 20,
      theme: null,
      displayProjection: epsg4326
   });
  **/
//for spherical projection(google)
  var mapOptions = {
		  theme: null,
  	  controls: [],
        projection: PROJ_GOOGLE,
        displayProjection: PROJ_WGS,
        units: "m",
        numZoomLevels: 20,
        maxResolution: 156543.0339,
        maxExtent: new OpenLayers.Bounds(-20037508, -20037508,
                                         20037508, 20037508.34)
    };

   map = new OpenLayers.Map( $('map'), mapOptions ); //   
   
  
  map.zoomToMaxExtent = function(){        	
	  map.setCenter(centre, zoom); 
  };	
 

/***
   if(/MSIE/.test(navigator.userAgent)) {
   	$('map').style.bottom = "";
	$('menu').style.width = (document.documentElement.clientWidth - 200)+"px";
	$('map').style.height = (document.documentElement.clientHeight - 86)+"px";
	$('map').style.width = (document.documentElement.clientWidth - 200)+"px";
	$('sidebar').style.height = (document.documentElement.clientHeight - 106)+"px";
	window.onresize = function () {
		$('menu').style.width = (document.documentElement.clientWidth - 200)+"px";
		$('map').style.height = (document.documentElement.clientHeight - 86)+"px";
		$('map').style.width = (document.documentElement.clientWidth - 200)+"px";
		$('sidebar').style.height = (document.documentElement.clientHeight - 106)+"px";
	}
   }

   var mapnik1 = new OpenLayers.Layer.OSM.Mapnik("Mapnik", {
      displayOutsideMaxExtent: true,
      wrapDateLine: true
   });
   
     markers = new OpenLayers.Layer.Markers("Markers", { 
      displayInLayerSwitcher: false,
      numZoomLevels: numZoomLevels,
      maxExtent: new OpenLayers.Bounds(-20037508,-20037508,20037508,20037508),
      maxResolution: 156543,
      units: "m",
      projection: "EPSG:900913"
   });
  // map.addLayer(markers);

   mobility = new OpenLayers.Layer.Text("Mobility", {
      numZoomLevels: numZoomLevels,
      maxExtent: new OpenLayers.Bounds(-20037508,-20037508,20037508,20037508),
      maxResolution: 40,
      units: "m",
      visibility: false,
      location: "/markers/mobility.txt",
   });
   
 ***/  
   var mapnik = new OpenLayers.Layer.OSM.Mapnik("Mapnik", 		  
         { 			
 		      displayOutsideMaxExtent: true,
 		      wrapDateLine: true 		   
     	}  , OSM_TILES_URL
   );    
   map.addLayer(mapnik);
   //01. google image
	// create Google Satellite layer
	var imgLayer = new OpenLayers.Layer.Google(
	      "Google Satellite",
	      {
	       type: G_SATELLITE_MAP, 
	       'sphericalMercator': true, 
	       numZoomLevels: 18
	       }
	  );
   map.addLayer(imgLayer); 
  // var numZoomLevels = Math.max(mapnik.numZoomLevels, imgLayer.numZoomLevels);//mapnik.numZoomLevels; 
  // map.addLayer(mobility);
   //map.events.register("moveend", map, updateLocation);
   //map.events.register("changelayer", map, updateLocation);
   
 //6. ------ add controls
   map.addControl(new OpenLayers.Control.PanZoomBar({zoomWorldIcon:true, zoomStopHeight:8}));  
   //map.addControl(new OpenLayers.Control.PanZoom());
   map.addControl(new OpenLayers.Control.Navigation());
   map.addControl(new OpenLayers.Control.LayerSwitcher({activeColor:"#737373"}));
   var mousepos = new OpenLayers.Control.MousePosition({prefix:"Coordinate: ",numDigits:3});
   map.addControl(mousepos);
}

