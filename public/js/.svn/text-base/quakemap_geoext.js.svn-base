/**********************************************************************************
 * GeoNet Hazard Map -- GeoEXT Version
 * 
 * baishan 17/9/2010
 * 
*********************************************************************************** */
//################################################################################
//###### constants: ##############################################################
var WMS_URL_GEONET_IMG = "http://maps.geonet.org.nz/tilecache/tilecache.py?"; // 
//var WMS_URL_GEONET_OSM = "http://camden.gns.cri.nz:8080/geowebcache/service/wms"; // 
var WMS_URL_GEONET_OSM = "http://hutl13447.gns.cri.nz/tilecache/tilecache.py?"; // "http://camden.gns.cri.nz:8080/geoserver/wms"
var WMS_OSM_LAYERS = 'osm_nz';
var WMS_URL_GEONET_LAYER = "http://wfs-beta.geonet.org.nz:8080/geoserver/wms"; // 
var WMS_LAYER_NS = "geonet";
var GEOSERVER_LAYER_NAME_QUAKE = "quake";
	
OpenLayers.Util.onImageLoadErrorColor = 'transparent';
OpenLayers.ImgPath='images/'
//#################################################################################

var map;

 Ext.BLANK_IMAGE_URL = "images/default/s.gif";

 Ext.onReady(function() {
	 var max_map_bounds = new OpenLayers.Bounds(-180,-90, 180, 90); //l, b. r, t -180,-90,180,90 90,-90,270,90
	 var restr_bounds = new OpenLayers.Bounds(-360,-90,360,90); //l, b. r, t 
	 var mapOptions = {
	     maxResolution: 0.3515625,
	     numZoomLevels: 31,
	     projection: new OpenLayers.Projection('EPSG:4326'),   
	     maxExtent: max_map_bounds,                 
	     restrictedExtent: restr_bounds
	   };		 
	 			    
      map = new OpenLayers.Map( $('map'), mapOptions ); //   
      	  //override the zoomToMaxExtent function to zoom to the full NZ extent
      map.zoomToMaxExtent = function(){	
	 	map.setCenter( new OpenLayers.LonLat(172.4,-43.6),7); 
	 };
   	
	//1. ------ add open street map 
	var osmlayer = new OpenLayers.Layer.WMS1_1_1(
	    "Map",WMS_URL_GEONET_OSM,
	   {
		layers: WMS_OSM_LAYERS,
		isBaseLayer: true,
		format: 'image/jpeg',	
		maxExtent: max_map_bounds,                 
	    restrictedExtent: restr_bounds
	},
	{
	    tileSize: new OpenLayers.Size(256,256),  
	    wrapDateLine: true
	} 
	);

	map.addLayer(osmlayer);  	
	//------
	//2. ------ add nasa image
	var imglayer = new OpenLayers.Layer.WMS1_1_1( 
	    "Image",  WMS_URL_GEONET_IMG,
	{
		layers: 'nasagm', 
		isBaseLayer: true,
		format: 'image/jpeg',	
		maxExtent: max_map_bounds,                 
		restrictedExtent: restr_bounds
	    },
	    {
	        tileSize: new OpenLayers.Size(256,256),  
	        wrapDateLine: true
	    } 
	); 
	map.addLayer(imglayer); 



	//3 quake wms layer
	var quakesWmsLayer = new OpenLayers.Layer.WMS(
	         "Quakes", WMS_URL_GEONET_LAYER,
	         {
	            // cql_filter: filter,
	             layers: GEOSERVER_LAYER_NAME_QUAKE,
	             isBaseLayer: 'false',
	             styles: 'point_event',            
	             srs: 'EPSG:4326',
	             format: 'image/jpeg',
	            // tiled: 'true',
	             transparent: 'true'
	             //tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
	         },      
	         
	         {
	        	  singleTile: true, 
	        	  opacity: 0.5,
	        	  ratio: 1//,
	         } 
	     );
	//turn off this layer by default to reduce oerhead
	//quakesWmsLayer.setVisibility(false);				
	map.addLayer(quakesWmsLayer);  

	//create featureinfo for WMS layers
	var featureInfo = new OpenLayers.Control.WMSGetFeatureInfo(
	    { url:  WMS_URL_GEONET_LAYER,
	      //title: 'Identify features by clicking',
	      hover:false,
	      maxFeatures:1,
	      layers: [quakesWmsLayer],
	      queryVisible: true,
	      //infoFormat: 'application/vnd.ogc.gml' 
	      eventListeners: {
	        getfeatureinfo: function(event) {
	    	  // alert("" + ( this.constructor.toString()));
	          if(event.text){
	          //add openlayers popup window
	            map.addPopup(new OpenLayers.Popup.FramedCloud(
	                "geonet_quake_info", 
	                map.getLonLatFromPixel(event.xy),
	                null,
	                event.text,
	                null,
	                true
	              )
	            );
	           }
	          }
	        }	                  
	      },
	      { radius: 50}
	    ); 

	map.addControl(featureInfo);
	featureInfo.activate();		

	        		       
		    
     //5. create mappanel
    var mapPanel = new GeoExt.MapPanel({
        title: "Map",
        region: "center",
        map: map			        
    });
	
    //create tree panel  
    var tree = new Ext.tree.TreePanel({
	    region: "west",
	    title: "Layers",
	    width: 100,
	    autoScroll: true,
	    enableDD: true,
	    lines: false,
	    rootVisible: false,
	    root: new GeoExt.tree.LayerContainer({
	        layerStore: mapPanel.layers,
	        //loader: loader,
	        leaf: false,
	        expanded: true
	    })				
		});	
		
	//new Ext.Window			 
    new Ext.Window({
        title: "GeoNet Hazard Map",
        renderTo: document.getElementById('haz-map'),
        height: 620,
        width: 680,
        layout: "border",
        closable: false,
        xtype: "gx_mappanel",
        items: [ mapPanel,tree]
    }).show();

 // ------	            
  //6. ------ add controls
  //map.addControl(new OpenLayers.Control.Navigation());
  //map.addControl(new OpenLayers.Control.Scale($('scale')));
  var mousepos = new OpenLayers.Control.MousePosition({prefix:"Coordinate: ",numDigits:3});
  map.addControl(mousepos);
  //map.addControl(new OpenLayers.Control.LayerSwitcher());  	       
  map.zoomToMaxExtent();			    
});