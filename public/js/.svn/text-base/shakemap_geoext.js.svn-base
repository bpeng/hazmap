/**********************************************************************************
 * map to display real time shaking intensities
 * from geont seismic stations
 * baishan 
 * 19/4/2011
 * 
*********************************************************************************** */
//################################################################################
//###### constants: ##############################################################
//map dimension
var MAP_HEIGHT = 600;
var MAP_WIDTH = 550;
var REAL_TIME_DATA_URL = 'data/realtime-shaking.xml';
var PROJ_WGS = new OpenLayers.Projection("EPSG:4326");
var PROJ_NZMG = new OpenLayers.Projection("EPSG:27200");
var PROJ_GOOGLE = new OpenLayers.Projection("EPSG:900913");
var OSM_TILES_URL = "/osm/tiles/";

OpenLayers.IMAGE_RELOAD_ATTEMPTS=2;
OpenLayers.Util.onImageLoadErrorColor = '#cccccc';
OpenLayers.ImgPath='images/'
var map,shakelayer, select;
var max_map_bounds = new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508.34);

//for spherical projection(google)
var mapOptions = {
	  controls: [],
      projection: PROJ_GOOGLE,
      displayProjection: PROJ_WGS,
      units: "m",
      numZoomLevels: 20,
      maxResolution: 156543.0339,
      maxExtent: new OpenLayers.Bounds(-20037508, -20037508,
                                       20037508, 20037508.34)
  };

/**** openlayers map and event/functions */
 map = new OpenLayers.Map( $('map'), mapOptions ); //   
 	  //override the zoomToMaxExtent function to zoom to the full NZ extent
 map.zoomToMaxExtent = function(){	
	 var point = new OpenLayers.LonLat(173.0,-41.0); 
	  point.transform(PROJ_WGS, map.getProjectionObject());
	  map.setCenter(point, 5); 
};	

map.hidePopups = function(){	
	for(var i = 0; i < map.popups.length; i++){
	   map.popups[i].hide();
    }	
};	
map.events.register('click', map, function (e) {
	map.hidePopups();
});


function getSeismicData() {  
    OpenLayers.Request.GET({
    	url: REAL_TIME_DATA_URL,
        success: parseSeismicData
        //scope: this
        });
}

var xmlformat = new OpenLayers.Format.XML();
//var serializer = new XMLSerializer(); //xml tool
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

//parse xml data and add to shake layer
function parseSeismicData(response){
	 var data = response.responseXML || response.responseText;
	   //alert(response.responseText);
	   if(typeof data == "string") {
          data = OpenLayers.parseXMLString(data);
      }
	   //alert(response.responseText);	   
      if(data && data.nodeType == 9) {
          data = data.documentElement;
      } 
      var stationNodes = xmlformat.getElementsByTagNameNS(data,data.namespaceURI, "station");
      //alert(serializer.serializeToString(stationNodes));
      var features = [];
      if(stationNodes){
    	  for(var i = 0; i < stationNodes.length; i++){
    		  var stationNode = stationNodes[i];
    		  var feature = createPointFeature(stationNode);
    		  if(feature){
    			  features.push(feature);
    		  }    		 
    	  }
      }
      shakelayer.addFeatures(features);     
}

//create a point feature based on xml element
function createPointFeature(stationNode){
	var pointFeature ;
	if(stationNode ){
		var _code = xmlformat.getAttributeNS(stationNode, '', 'code');
		var _name = xmlformat.getAttributeNS(stationNode, '','name');
		var _network = xmlformat.getAttributeNS(stationNode, '','network');		
		var nzmge = xmlformat.getAttributeNS(stationNode, '','nzmge');
		var nzmgn = xmlformat.getAttributeNS(stationNode, '','nzmgn');		
		nzmge = parseFloat(nzmge);
		nzmgn = parseFloat(nzmgn);
		var _wa;	
		if(stationNode.firstChild){
			_wa =  parseFloat( stationNode.firstChild.nodeValue);
		}
		var _mmi = getMMI(_wa);
		var _color = getMMColor( _mmi);		
		var _size = 1.1*getDrawSize(_mmi);//make it a bit bigger
		var point = new OpenLayers.Geometry.Point(nzmge, nzmgn);		
		 point.transform(PROJ_NZMG, map.getProjectionObject());	
		 pointFeature = new OpenLayers.Feature.Vector(point);
		 pointFeature.attributes = {
		     code: _code,
		     name:_name,
		     network:_network,
		     wa:_wa,
		     color:_color,
		     size:_size,
		     size2: (_size + 2),
		     mmi:_mmi
		 };
	}
	return pointFeature;
}

/**
 * @return half of the square size in px to be drawn
 *
 */
function  getDrawSize(mmi) {
	var size = 3;
    if (mmi < 4){//< 4
		size = 3;
	}else if (mmi < 6){//4,5
		size = 4;
	}else if (mmi < 8){//6-7
		size = 5;
	}else if (mmi >= 8){//8+
		size = 6;
	}
	return size;
}


function  getMMColor( mm) {
	var color = "#ffffff";   
	if(mm  < 3){
		//color = new Color(211,211,211); 
		color = '#D3D3D3';//rgb(211,211,211)';
	}else if(mm == 3){
		//color = new Color(176,196,222)'; 
		color = '#B0C4DE';//rgb(176,196,222)';	
	}else if(mm == 4){
		//color = new Color(135,206,235)'; 
		color = '#87CEEB';//rgb(135,206,235)';	
	}else if(mm == 5){
		//color = new Color(154,205,50)'; 
		color = '#9ACD32';//rgb(154,205,50)';	
	}else if(mm == 6){
		//color = new Color(255,255,0)'; 
		color = '#FFFF00';//rgb(255,255,0)';	
	}else if(mm == 7){
		//color = new Color(255,215,0)'; 
		color = '#FFD700';//rgb(255,215,0)';	
	}else if(mm == 8){
		//color = new Color(255,140,0)'; 
		color = '#FF8C00';//rgb(255,140,0)';	
	}else if(mm == 9){
		//color = new Color(255,0,0)'; 
		color = '#FF0000';//rgb(255,0,0)';	
	}else if(mm > 9){
		//color = new Color(205,0,0)'; 
		color = '#CD0000';//rgb(205,0,0);			
	}		
	return color;	
}

function getMMI(wa) {
	var mm = 0;
	if(wa ){
		if(wa  <= 10.0){ //mm3-
			mm = 0;
		}else if(wa <= 50.0){ //mm3
			mm = 3;
		}else if(wa <= 250.0){//mm4
			mm = 4;
		}else if(wa <= 1250.0){//mm5
			mm = 5;
		}else if(wa <= 6250.0){//mm6
			mm = 6;
		}else if(wa <= 31250.0){//mm7
			mm = 7;		
		}else if(wa <= 156250.0){//mm8
			mm = 8;
		}else if(wa <= 781250.0){//mm9
			mm = 9;
		}else if(wa > 781250.0){//mm10
			mm = 10;
		}		
	}	
	return mm;
}

/*
 * Create a select feature control for specified wfs layer
 */
 var popoffset1 = new OpenLayers.Pixel( 0, 0); //offset for popup location
 var popoffset2 = new OpenLayers.Pixel( 8, 5); 
 function createSelectFeatureControl(layers, popsize) {
	return  new OpenLayers.Control.SelectFeature(layers, 
		{hover: true,
		toggle: true,
		geometryTypes:['OpenLayers.Geometry.Point'],
		onSelect:function(feature){		
		  var xy = feature.geometry;
		  //get some offset
		  var xy1 = map.getLonLatFromPixel(popoffset1); 
		  var xy2 = map.getLonLatFromPixel(popoffset2); 		
		  var latLon = new OpenLayers.LonLat(xy.x + xy2.lon -xy1.lon , xy.y + xy2.lat - xy1.lat)	
	      var info = "";	
		  var popupLen = 200;
	      if(feature.attributes){
	         if(feature.attributes.code){
	            info = feature.attributes.code;
	            //feature.label = feature.attributes.code;
	         }	        
	         if(feature.attributes.name){
	            info +=  " / " +feature.attributes.name;
	            //feature.label = info;
	         }
	         var len = 80 + (info.length - 8)*5;
	         if (len > popupLen ) popupLen = len;	
	         var popSize = new OpenLayers.Size(popupLen, 50);
	         if(feature.attributes.wa){
	            info += "<br/>" + "W-A: " + feature.attributes.wa;
	         }
	         if(feature.attributes.mmi >=0 ){
	            info += "<br/>" + "MMI: " + feature.attributes.mmi;
	         }
	         //alert(feature.attributes.mmi);
	      }
	      
	      //alert("feature " + feature.attributes.code);
	       if(!feature.popup){
	    	   feature.popup = new OpenLayers.Popup("Feature Info",
	                  latLon, popSize, info, false);     
	           map.addPopup(feature.popup);
	          //alert("feature " + feature.isMirror);	         
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
	   //alert("clickFeature");
	  //openLink(feature.layer, feature.attributes.code);
     } 						
	});	
 }; 

//##########################################################################
//###### end of functions		############################################
//##########################################################################

/******************************************************
 * GeoEXT map starts here						*******
 * ****************************************************/
 Ext.BLANK_IMAGE_URL = OpenLayers.ImgPath + "default/s.gif";
 Ext.onReady(function() {	
 var mapLayer;
 var imgLayer;

 //0. google map
//use osm
 mapLayer = new OpenLayers.Layer.OSM.Mapnik("Mapnik", 		  
         { 			
 		      displayOutsideMaxExtent: true,
 		      wrapDateLine: true 		   
     	}  , OSM_TILES_URL
   );    
 
 //01. google image
// create Google Satellite layer
 imgLayer = new OpenLayers.Layer.Google(
      "Google Satellite",
      {
       type: G_SATELLITE_MAP, 
       'sphericalMercator': true, 
       numZoomLevels: 20
       }
  );
 map.addLayer(imgLayer); 
 map.addLayer(mapLayer);  
	
//#############################################################################
var _defaultStyle =  new OpenLayers.Style({
	  pointRadius: '${size}',  
	  fillColor: '${color}',
	  graphicName:'square',	  
	  strokeWidth: 1.0,
	  strokeColor: '#000066'
	 
	});

var _selectStyle =  new OpenLayers.Style({
	  pointRadius: '${size2}',  
	  fillColor: '${color}',
	  graphicName:'square',	  
	  strokeWidth: 1.0,
	  strokeColor: '#000066'	  
	});

var _styleMap = new OpenLayers.StyleMap(
{'default': _defaultStyle,
 'select': _selectStyle
});


shakelayer = new OpenLayers.Layer.Vector("Seismic stations", {  
	styleMap: _styleMap
 });

//
//addPointFeatures(shakelayer);

map.addLayer(shakelayer); 

var featureSelect = createSelectFeatureControl([shakelayer], false);	 
map.addControl(featureSelect);
featureSelect.activate();	

//
getSeismicData();

//5.2 toolbars 
var toolbarItems = [], action, actions = {};
//var layerSwitcher = new OpenLayers.Control.LayerSwitcher();	
//use action toolbars to switch base layers instead of using the layers list below    
action = new GeoExt.Action({
    text: "Map",
    control: new  OpenLayers.Control(),
    map: map,
    // button options
    toggleGroup: "BaseMap",
    allowDepress: false,
    //pressed: true,
    handler:function(){		
		map.setBaseLayer(mapLayer);
    },
    tooltip: "Show map",
    // check item options   
    group: "BaseMap"
    //checked: true
});  
actions["map"] = action;
//action to switch base map
action = new GeoExt.Action({
    text: "Image",
    control:new  OpenLayers.Control(),        
    map: map,
    handler: function(){
    	     this.map.setBaseLayer(imgLayer);
    	     //this.pressed = true;
	    },
    // button options
    toggleGroup: "BaseMap",
    allowDepress: false,
    tooltip: "Show image",   
     checked:true,
    group: "BaseMap"       
});
actions["image"] = action; 
toolbarItems.push("->");    
// add as menu items
toolbarItems.push({
    text: "Options",
    menu: new Ext.menu.Menu({
        items: [ 
            new Ext.menu.CheckItem(actions["map"]),             
            new Ext.menu.CheckItem(actions["image"])                     
        ]
    })
});    
//create the MapPanel
var mapPanel = new GeoExt.MapPanel({
    //title: "Map",
    region: "center",    
    tbar: toolbarItems,
    map: map			        
});
//
var legendPanel = new GeoExt.LegendPanel({
        defaults: {
            labelCls: 'mylabel',
            style: 'padding:5px'
        },
        bodyStyle: 'padding:5px',
        width: 100,
        split: true,
        collapsible: true,
        autoScroll: true,
        region: 'west'
    });

//5.4 show EXT window    
new Ext.Window({
    title: "Geonet Shaking Map",
    renderTo: document.getElementById('shake-map'),
    height: MAP_HEIGHT,
    width: MAP_WIDTH,
    layout: "border",
    closable: false,
    xtype: "gx_mappanel",
    items: [mapPanel]
}).show();

//6. ------ add controls
map.addControl(new OpenLayers.Control.PanZoomBar({zoomWorldIcon:true, zoomStopHeight:8}));  
//map.addControl(new OpenLayers.Control.PanZoom());
map.addControl(new OpenLayers.Control.Navigation());
//map.addControl(new OpenLayers.Control.Scale($('scale')));
var mousepos = new OpenLayers.Control.MousePosition({prefix:"Coordinate: ",numDigits:3});
map.addControl(mousepos);
});