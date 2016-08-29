/**********************************************************************************
 * GeoNet Hazard Map -- GeoEXT Version
 * 
 * baishan 25/8/2010
 * 
*********************************************************************************** */
//################################################################################
//###### constants: ##############################################################
var WMS_URL_GEONET_IMG = "http://maps.geonet.org.nz/tilecache/tilecache.py?"; // 
/*** 
 * alternative image url, used when images are unable to retrieve from the main wms server at maps.geonet
***/
var WMS_URL_IMG_ALT = "http://camden.gns.cri.nz/tilecache/tilecache.py?"; // alternative wms image url

//var WMS_URL_GEONET_OSM = "http://camden.gns.cri.nz:8080/geowebcache/service/wms"; // 
var WMS_URL_GEONET_OSM = "http://camden.gns.cri.nz/tilecache/tilecache.py?"; // "http://camden.gns.cri.nz:8080/geoserver/wms"
var WMS_OSM_LAYERS = 'osm_nz';
var WMS_IMG_LAYERS = 'nasagm';
/*** 
 * alternative image layer, used when images are unable to retrieve from the main wms server at maps.geonet
***/
var WMS_IMG_LAYERS_ALT = 'nasasat';

var WMS_URL_GEONET_LAYER = "http://camden.gns.cri.nz/geoserver/wms"; // 
var WFS_URL_GEONET_LAYER = "http://camden.gns.cri.nz/geoserver/wfs"; //same port please!!
var WFS_FEATURE_NS = "http://camden.gns.cri.nz/geoserver/gns";
var WMS_LAYER_NS = "gns";
var GEOSERVER_LAYER_NAME_QUAKE = "eventlatest_local";
var GEOSERVER_LAYER_NAME_ISOSEISMAL = 'isoseismals';	
	
OpenLayers.IMAGE_RELOAD_ATTEMPTS=2;//
OpenLayers.Util.onImageLoadErrorColor = '#cccccc';
OpenLayers.ImgPath='images/'
//#################################################################################

var map;
var publicid = 'swp-av-test2010ltxw';
var mapCentre = false;

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

 Ext.BLANK_IMAGE_URL = OpenLayers.ImgPath + "default/s.gif";
 
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
    	  //alert("mapCentre " + mapCentre);
    	  if(mapCentre){
    		  map.setCenter(mapCentre,3); 
    	  }else{
    		  map.setCenter( new OpenLayers.LonLat(173,-42),3); 
    	  }
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
		layers: WMS_IMG_LAYERS, 
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
	//set a alternative url and/or alternative layer for this layer in case of error retrieving image
	if(WMS_URL_IMG_ALT){
		imglayer.altUrl = WMS_URL_IMG_ALT;
	}
	//WMS_IMG_LAYERS_ALT
	imglayer.layer = WMS_IMG_LAYERS;
	if(WMS_IMG_LAYERS_ALT){
		imglayer.altLayer = WMS_IMG_LAYERS_ALT;
	}
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


	//########################################
	//4.------ add quake location quake WFS layer
	//publicid = getParamVal('publicid');
	var quakeIdFilter = new OpenLayers.Filter.Comparison({
	    type: OpenLayers.Filter.Comparison.EQUAL_TO,
	    property: 'publicid',
	    value: publicid
	});

	var defaultStyle = new OpenLayers.Style({
	  pointRadius: 8,  
	   externalGraphic: 'images/quake.png'
	});
	var selectStyle = new OpenLayers.Style({
	   pointRadius: 10,
	   externalGraphic: 'images/quake.png'
	});
	var styleMap = new OpenLayers.StyleMap(
	{'default': defaultStyle,
	 'select': selectStyle
	});

	/**
	 * http://www.mail-archive.com/users@openlayers.org/msg09580.html
	 * check if the bounds is moved to the west of the max_map_bounds, 
	 * shift it to the east to retrieve features from geoserver,
	 * this is a temperory solution to the Wrapdateline issue 
	 */
	var bbox = new OpenLayers.Strategy.BBOX();
	bbox.createFilter = function(){
		if(max_map_bounds.contains(this.bounds.left, this.bounds.top)){//normal
			//alert("this.bounds " + this.bounds);
			return OpenLayers.Strategy.BBOX.prototype.createFilter.apply(this, arguments);
		}else{//wrapeDateline applies
			var newBounds = this.bounds.clone();
			//shift the bounds to the east
			newBounds = newBounds.add(max_map_bounds.getWidth(), 0);
			//alert("this.bounds " + this.bounds);
			return new OpenLayers.Filter.Spatial(
			{
				type:OpenLayers.Filter.Spatial.BBOX,
				property:'origin_geom',
				value: newBounds 
			}		
		   );
		}
	};

	var quakeWfslayer =new OpenLayers.Layer.Vector(
		"Quake", 
	 {
	    strategies: [bbox], 
	    styleMap: styleMap,
	    protocol: new OpenLayers.Protocol.WFS({
	    url: WFS_URL_GEONET_LAYER,
	    geometryName : 'origin_geom',
	    srsName: 'EPSG:4326',
	    version: "1.1.0" ,
	    featureType: GEOSERVER_LAYER_NAME_QUAKE,
	    defaultFilter: quakeIdFilter, //
	    maxExtent: max_map_bounds, 
	    featureNS: WFS_FEATURE_NS 
	  })
	 }
	 );

	 /*
	 * add a mirror point 360 to the west of the feature, so that it will be displayed
	 * when the map's extent becomes < -180 as a result of the warpdateline function
	 * of the base layer, this is only applicable for point 
	 */
	quakeWfslayer.onFeatureInsert= function(feature) {		
		if(!feature.isMirror){		
			if(!feature.onScreen()){//this.features.length == 1 &&
				if(!max_map_bounds.contains(this.getExtent().left, this.getExtent().top)){//feature.geometry.x > 0 && 
					var featureMirror = new OpenLayers.Feature.Vector(
							new OpenLayers.Geometry.Point((feature.geometry.x - max_map_bounds.getWidth()), feature.geometry.y),
							feature.attributes,
							feature.style);
					featureMirror.isMirror = true;
					feature.isMirror = false;
					this.addFeatures([featureMirror]);
				}
			}else{
				if(!mapCentre){//set map centre to the quake location
					//mapCentre = feature.lonlat;
					mapCentre = new OpenLayers.LonLat(feature.geometry.x,feature.geometry.y);				
					map.zoomToMaxExtent();	
				}
			}
		}
	};
	var popsize = false;
	// Create a select feature control and add it to the map.
	var select = new OpenLayers.Control.SelectFeature(quakeWfslayer, 
		{hover: true,	
		onSelect:function(feature){
		  var xy = feature.geometry;
		  //get some offset
		  var xy1 = map.getLonLatFromPixel(new OpenLayers.Pixel( 0, 0)); 
		  var xy2 = map.getLonLatFromPixel(new OpenLayers.Pixel( 8, 5)); 		
		  var latLon = new OpenLayers.LonLat(xy.x + xy2.lon -xy1.lon , xy.y + xy2.lat - xy1.lat)	
	      var info = "";
	      if(feature.attributes){
	         if(feature.attributes.magnitude){
	            info = "Mag: " + feature.attributes.magnitude;
	            feature.label = feature.attributes.magnitude;
	         }
	         if(feature.attributes.origintime){
	            info += "<br/>" + "Time: " + feature.attributes.origintime;
	         }
	      }
	      //alert("feature " + feature.attributes.code);
	       if(!feature.popup){
	    	   feature.popup = new OpenLayers.Popup("Feature Info",
	                  latLon,     
	                  new OpenLayers.Size(200, 39),
	                  info,
	                  false);     
	           map.addPopup(feature.popup);
	          //alert("feature " + feature.isMirror);
	           if(popsize){	        	   
	        	   feature.popup.setSize(popsize); 
	        	   //alert("popsize " + popsize);	
	           }else if(!feature.isMirror){	 
	        	   feature.popup.updateSize();
	        	   popsize = feature.popup.size
	        	   //feature.popup.updateSize doesn't seem to do a good job in the wrapdateline extent
	        	   //alert("feature " + feature.geometry.x);	        	   
	           }
	         }else{
	        	feature.popup.lonlat = latLon;
	        	feature.popup.updatePosition();
	            feature.popup.show();
	         }
		},
		onUnselect:function(feature){
		  if(feature.popup){
		      feature.popup.hide();
		   }		  
		},
		
		clickFeature: function(feature) {			 
		 // openLink(this.layer, feature.attributes.code);
			if(feature.popup){
		        feature.popup.toggle();
		     }			
	     } 
						
	});	
	
	map.hidePopups = function(){
		//hide all popups
		//alert("map.popups.length " + map.popups.length);
		for(var i = 0; i < map.popups.length; i++){
		  map.popups[i].hide();
	    }
	};
	
	map.events.register('click', map, function (e) {
		this.hidePopups();
	});
	 
	map.addControl(select);
	select.activate();

	map.addLayer(quakeWfslayer);	        		       
		    
     //5. create mappanel    
	var mapPanel = new GeoExt.MapPanel({
        title: "Map",
        region: "center",    
       // tbar: toolbarItems,
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
	    collapsible: true,
        collapseMode: "mini",
	    root: new GeoExt.tree.LayerContainer({
	        layerStore: mapPanel.layers,
	        //loader: loader,
	        leaf: false,
	        expanded: true
	    }),
	     listeners: {
            click: function(node) {
    		if (node.getUI().checkbox){
    			if (node.getUI().checkbox.type == 'checkbox'){//check or uncheck the node
    				node.getUI().toggleCheck();
    			}else if (node.getUI().checkbox.type == 'radio'){
    				if(!node.getUI().isChecked()){// no uncheck for radio					
    					node.getUI().toggleCheck();
  				   }
    			}
        	}
          }
	     }
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
  //map.zoomToMaxExtent();			    
});