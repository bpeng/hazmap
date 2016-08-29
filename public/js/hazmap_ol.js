/**********************************************************************************
 * GeoNet Hazard Map -- Openlayers Version
 * 
 * baishan 25/8/2010
 * 
*********************************************************************************** */
//################################################################################
//###### constants: ##############################################################
var WMS_URL_GEONET_IMG = "http://maps.geonet.org.nz/tilecache/tilecache.py?"; // 
//var WMS_URL_GEONET_OSM = "http://hutl13447.gns.cri.nz:8080/geowebcache/service/wms"; // 
var WMS_URL_GEONET_OSM = "http://hutl13447.gns.cri.nz/tilecache/tilecache.py?"; // "http://hutl13447.gns.cri.nz:8080/geoserver/wms"
var WMS_OSM_LAYERS = 'osm_nz';
var WMS_URL_GEONET_LAYER = "http://hutl13447.gns.cri.nz/geoserver/wms"; // same port for feature info please
var WFS_URL_GEONET_LAYER = "http://hutl13447.gns.cri.nz/geoserver/wfs"; //same port please!!
var WFS_FEATURE_NS = "http://hutl13447.gns.cri.nz/geoserver/gns";
var WMS_LAYER_NS = "gns";
var GEOSERVER_LAYER_NAME_QUAKE = "eventlatest_local";
var GEOSERVER_LAYER_NAME_ISOSEISMAL = 'isoseismals';	
	
OpenLayers.Util.onImageLoadErrorColor = 'transparent';
OpenLayers.ImgPath='images/'
//#################################################################################
	
var map;
var publicid = 'swp-av-test2010ltxw';

function getParamVal( name )
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return null;
  else
    return results[1];
}

publicid = getParamVal('publicid');

function init(){
var max_map_bounds = new OpenLayers.Bounds(-180,-90, 180, 90); //l, b. r, t -180,-90,180,90 90,-90,270,90
var restr_bounds = new OpenLayers.Bounds(-360,-90,360,90); //l, b. r, t 
var mapOptions = {
    maxResolution: 0.3515625,
    numZoomLevels: 31,
    projection: new OpenLayers.Projection('EPSG:4326'),   
    maxExtent: max_map_bounds,                 
    restrictedExtent: restr_bounds
  };
map = new OpenLayers.Map('haz-map', mapOptions );
map.zoomToMaxExtent = function(){	
	map.setCenter( new OpenLayers.LonLat(173,-42),3); 
};  

//1. ------ add open street map 
var osmlayer = new OpenLayers.Layer.WMS1_1_1(
    "Map",WMS_URL_GEONET_OSM,
   {
	layers: 'osm_nz', 
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

//3 isoseismal layer
//var filter = 'gns:publicid=\'' + publicid + '\';gns:publicid=\'' + publicid + '\'';
var filter = WMS_LAYER_NS + ':publicid=\'' + publicid +   '\'';
var isoseismalWmsLayer = new OpenLayers.Layer.WMS(
         "Isoseismal", WMS_URL_GEONET_LAYER,
         {
             cql_filter: filter,
             layers: GEOSERVER_LAYER_NAME_ISOSEISMAL,
             isBaseLayer: 'false',
             //styles: 'quake_star',            
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
isoseismalWmsLayer.setVisibility(false);				
map.addLayer(isoseismalWmsLayer);  




//4.------ add quake location
//http://wfs-beta.geonet.org.nz:8080/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=geonet:quake&styles=quake_star&&bbox=0.0,-90.0,360.0,90.0&width=660&height=330&srs=EPSG:4326&format=application/openlayers&cql_filter=geonet:publicid=%27swp-av-test2010mqzz%27


/***********/
//var filter1 = 'gns:publicid=\'' + publicid + '\'';
var quakeWmsLayer = new OpenLayers.Layer.WMS(
         "Quake", WMS_URL_GEONET_LAYER,
         {
             cql_filter: filter,
             layers: WMS_LAYER_NS+ ':' + GEOSERVER_LAYER_NAME_QUAKE,
             isBaseLayer: 'false',
             styles: 'quake_star',            
             srs: 'EPSG:4326',
             format: 'image/jpeg',
             tiled: 'true',
             transparent: 'true',
             tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
         },      
         
         {
        	 isBaseLayer: false, 
        	 buffer: 0,
        	 wrapDateLine: true,
             displayOutsideMaxExtent: true
         } 
     );
			
map.addLayer(quakeWmsLayer);  
//create featureinfo for WMS layers
var featureInfo = new OpenLayers.Control.WMSGetFeatureInfo(
    { url:  WMS_URL_GEONET_LAYER,
      //title: 'Identify features by clicking',
      hover:false,
      maxFeatures:1,
      layers: [quakeWmsLayer],
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

// ------	            
//5. ------ add controls
map.addControl(new OpenLayers.Control.Navigation());
//map.addControl(new OpenLayers.Control.Scale($('scale')));
var mousepos = new OpenLayers.Control.MousePosition({prefix:"Coordinate: ",numDigits:3});
map.addControl(mousepos);
map.addControl(new OpenLayers.Control.LayerSwitcher());         

//if (!map.getCenter()) map.setCenter( new OpenLayers.LonLat(173,-42),3);  
map.zoomToMaxExtent();
}