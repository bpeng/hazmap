/*********
 * datasources 
http://bb-gracefield.geonet.org.nz/soh/gps_soh.xml
http://bb-gracefield.geonet.org.nz/soh/seis_soh.xml
http://bb-wairakei.geonet.org.nz/soh/seis_soh.xml
*/

/**********************************************************************************
 * map to display geonet network helth status
 * baishan 
 * 19/4/2011
 * 
*********************************************************************************** */
//################################################################################
//###### constants: ##############################################################
//map dimension
var MAP_HEIGHT = 600;
var MAP_WIDTH = 550;
var AVALON_CGPS_DATA_URL = 'data/avalon_gps_soh.xml';
var AVALON_SEISMIC_DATA_URL = 'data/avalon_seis_soh.xml';
var WAIRAKEI_SEISMIC_DATA_URL = 'data/wairakei_seis_soh.xml';
//check the last update time of the data file to decide if data is legacy
var CHECK_DATA_TIME_STATUS = false; //should be true in production
var AUTO_REFRESH = true; //

var PROJ_WGS = new OpenLayers.Projection("EPSG:4326");
var PROJ_NZMG = new OpenLayers.Projection("EPSG:27200");
var PROJ_GOOGLE = new OpenLayers.Projection("EPSG:900913");
var OSM_TILES_URL = "/osm/tiles/";

OpenLayers.IMAGE_RELOAD_ATTEMPTS=2;
OpenLayers.Util.onImageLoadErrorColor = '#cccccc';
OpenLayers.ImgPath='images/'
	
var map,avaloncgpslayer, avalonseimiclayer, wairakeiseismiclayer, currentlayer, timer;

var max_map_bounds = new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508.34);
var  mapCentre = new OpenLayers.LonLat(173.0,-41.0);
var  mapZoomLevel = 5;

var serverTimeDiff = 0; //difference between client and server time
var dataloaded = false;


//for spherical projection(google)
var mapOptions = {
	  theme:null,
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
 	  //override the zoomToMaxExtent function to zoom to the full NZ extent
 mapCentre.transform(PROJ_WGS, PROJ_GOOGLE);
 
 
 /**** functions */
 
 function refreshData() {
	 if(timer){
		 clearTimeout( timer);
	 }
	 if(AUTO_REFRESH){
		 timer = setTimeout("loadStationData()",60000);
	 }	
 }
 
 
 /****	<!-- get the date parameter from page header as a string, and construct a date object, used
   	to get server side time to check the status in the above method, 
   	format: Wed, 27 Apr 2011 01:28:31 GMT -->
   	*/
function getDateParam(response){ 
	if(!dataloaded){//do only once
		var dateheader = response.getResponseHeader("date");
		var dateObjectServer = new Date( dateheader);
		//alert(new Date( dateheader));
		if(dateheader && dateObjectServer){
			var dateObjectClient = new Date();
			serverTimeDiff = (dateObjectClient.getTime() - dateObjectServer.getTime())/1000;
			//alert(dateheader + "\n"  + dateObject + "\n"  + dateObjectServer + "\n" + serverTimeDiff);
			dataloaded = true;
		}	
	}
}
   
 map.zoomToMaxExtent = function(){
	  //var point = mapCentre;
	  //point.transform(PROJ_WGS, map.getProjectionObject());
	  map.setCenter(mapCentre, mapZoomLevel); 
};	

map.hidePopups = function(){	
	for(var i = 0; i < map.popups.length; i++){
	   map.popups[i].hide();
    }	
};	
map.events.register('click', map, function (e) {
	map.hidePopups();
});

//var serializer = new XMLSerializer(); //xml tool
var xmlformat = new OpenLayers.Format.XML();

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/*
 * load source data again for specified layer
 * if not specified, load for current layer
 * */
function  loadStationData(layer){	
	if(!layer){
		layer = currentlayer;
	}
	if(layer && layer.url){
		//alert('loadStationData');
		OpenLayers.Request.GET({
		url: layer.url,
		success:function(response){
	    	parseStationData(response,layer )
	      }
	    //scope: this
	    });
	}
}

function parseStationData(response,layer){
	var data = response.responseXML || response.responseText;
	//alert(response.getResponseHeader("Date"));
	getDateParam(response);
	
	if(typeof data == "string") {
	   data = OpenLayers.parseXMLString(data);
	}
	//alert(response.responseText);	   
	if(data && data.nodeType == 9) {
	   data = data.documentElement;
	} 
	var stationNodes = xmlformat.getElementsByTagNameNS(data,data.namespaceURI, "station");
	//alert(stationNodes);	
	//alert(serializer.serializeToString(stationNodes));
	var features = [];
	if(stationNodes){
	  for(var i = 0; i < stationNodes.length; i++){
		  var stationNode = stationNodes[i];
		  //if(i< 2) alert(serializer.serializeToString(stationNode));
		  var feature = createStationFeature(stationNode, (i< 2));
		  if(feature){
			  features.push(feature);
		  }    		 
	  }
    }
	//alert(features.length);
	layer.addFeatures(features); 
	layer.setVisibility(true);
	//schedule to refresh
	refreshData();
}

//create a point feature based on xml element
function createStationFeature(stationNode, debug){
	var pointFeature ;
	if(stationNode){
		var _code = xmlformat.getAttributeNS(stationNode,'', 'code');
		var _name = xmlformat.getAttributeNS(stationNode, '','name');
		var _status = xmlformat.getAttributeNS(stationNode, '','status');		
		var nzmge = xmlformat.getAttributeNS(stationNode, '','e');
		var nzmgn = xmlformat.getAttributeNS(stationNode, '','n');	
		var _update = xmlformat.getAttributeNS(stationNode, '','update');
		nzmge = parseFloat(nzmge);
		nzmgn = parseFloat(nzmgn);
		_update = parseFloat(_update);
		
		var dataNode =  xmlformat.getElementsByTagNameNS(stationNode, stationNode.namespaceURI, "data")[0];
		var voltageNode =  xmlformat.getElementsByTagNameNS(stationNode,stationNode.namespaceURI, "voltage")[0];
		var temperatureNode =  xmlformat.getElementsByTagNameNS(stationNode,stationNode.namespaceURI, "temperature")[0];
		var satelliteNode =  xmlformat.getElementsByTagNameNS(stationNode,stationNode.namespaceURI, "satellite")[0];
		var memoryNode =  xmlformat.getElementsByTagNameNS(stationNode,stationNode.namespaceURI, "memory")[0];
		
		var datainfo = parseDataInfo(dataNode);
		var _info, _len, rows;
		if(datainfo){
			_info = datainfo[0];
			len = datainfo[1];
			rows = 1;
		}	
		var voltinfo = parseMeterInfo(voltageNode, "Voltage");
		if(voltinfo){
			_info +=  "<br/>" + voltinfo[0];
			if(len < voltinfo[1]){
				len = voltinfo[1];
			}
			rows += 1;
		}
		
		var tempinfo = parseMeterInfo(temperatureNode, "Temperature");
		if(tempinfo){
			_info +=  "<br/>" + tempinfo[0];
			if(len < tempinfo[1]){
				len = tempinfo[1];
			}
			rows += 1;
		}
		
		var sateinfo = parseMeterInfo(satelliteNode, "Satellite");
		if(sateinfo){
			_info +=  "<br/>" + sateinfo[0];
			if(len < sateinfo[1]){
				len = sateinfo[1];
			}
			rows += 1;
		}
		
		var memoinfo = parseMeterInfo(memoryNode, "Memory");
		if(memoinfo){
			_info +=  "<br/>" + memoinfo[0];
			if(len < memoinfo[1]){
				len = memoinfo[1];
			}
			rows += 1;
		}	
		
		//if(debug && temperatureNode)   alert(serializer.serializeToString(temperatureNode));
		var _color = getcolor( _status);
		//test..double check update status and re assign color
		if(CHECK_DATA_TIME_STATUS && _color == "#00ff00"){//check only for green
			_color = checkStatus(_update); //
		}
		
		//var _size =  getmmsize(_mmi,1);//
		 var point = new OpenLayers.Geometry.Point(nzmge, nzmgn);		
		 point.transform(PROJ_NZMG, map.getProjectionObject());	
		 pointFeature = new OpenLayers.Feature.Vector(point);
		 pointFeature.attributes = {
		     code: _code,
		     name:_name,
		     info: _info,
		     infolen:len,
		     inforows: rows,
		     update:_update,
		     color:_color	 
		 };
     }
  return pointFeature;
}

function parseMeterInfo(meterNode, nodename){
	if(meterNode ){		
		var reading = xmlformat.getAttributeNS(meterNode, '','value')
         + " " + xmlformat.getAttributeNS(meterNode, '','unit');
		//log("reading=" + reading);
		
		var len = reading.length;
		var message =  xmlformat.getAttributeNS(meterNode, '','message')
		if(message ){
		var len1 = message.length;
		if(len < len1){
			len = len1
		}
		reading = reading + "<br/>Message: " + message;
		}		
		return [(nodename + " = " + reading), len];
     }	
}

function parseDataInfo(dataNode){	
	if(dataNode ){		
	var last = xmlformat.getAttributeNS(dataNode, '','last');//this.datapath.xpathQuery('@last');
	//log("data last=" + last);
	var len = last.length;
	var message = xmlformat.getAttributeNS(dataNode, '','message')
	if(message != null){
		var len1 = message.length;
		if(len < len1){
			len = len1
		}
		last = last + "<br/>Message: " + message;
		
	}
	return [("data=" + last),  len];
  }
}

function getcolor(cname){
	var color = "#000000";        	
	if(cname == "green"){
		color = "#00ff00";		
	}else if(cname == "red"){
		color = "#ff0000";
	}else if(cname == "purple"){//8E35EF
		color = "#8E35EF";		
	}else if(cname == "yellow"){//
		color = "#ffff00";		
	}			
	return color;	
}

function checkStatus(updateTime){   		
	this.currentTime = Math.round(( (new Date()).getTime() - serverTimeDiff)/1000); //seconds
	var color = "#00ff00";  //green
	if(!checkTimeUpdate(updateTime, this.currentTime)){
		color = "#8E35EF";	//purple 
	} 	
	return color;
}

//check update time is updated
function checkTimeUpdate(chktime, currentTime) { 
	var delay = currentTime - 1*chktime;  
	//alert("checkTimeUpdate delay=" + delay );
	if(delay  >  600){ //test if data is more than 10 minutes
		return false;
	} 
	return true;
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
	      var info ;	
		  var popupLen = 100, popheight= 10;
	      if(feature.attributes){	
	    	  if(feature.attributes.code){
	            info = feature.attributes.code;
	            //feature.label = feature.attributes.code;
	          }	    	  
	         if(feature.attributes.name){
	        	 if(info){
	        		  info +=  " / " + feature.attributes.name;
	        	 }else{
	        		 info =  feature.attributes.name;	 
	        	 }	                      
	         }
	         var infolength = info.length ;       
	         info = "<b>" + info + "</b>";
	         if(feature.attributes.info){
	            info += "<br/>" + feature.attributes.info;
	            if(feature.attributes.infolen){
	            	if(infolength < feature.attributes.infolen){
	            		infolength = feature.attributes.infolen;
	            	}
	            }
	            //inforows
	            //alert(feature.attributes.inforows);
	            if(feature.attributes.inforows){
	            	popheight += popheight*10;
	            }
	          }	         
	         
	         var len = 80 + (infolength - 8)*5;
	         if (len > popupLen ) popupLen = len;	
	         var popSize = new OpenLayers.Size(popupLen, popheight);	        
	      }
	      
	      //alert("feature " + feature.attributes.code);
	       if(!feature.popup){
	    	   feature.popup = new OpenLayers.Popup("Feature Info",
	                  latLon, popSize, info, false);  
	    	   //feature.popup.panMapIfOutOfView = true;
	    	   
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
  map.addLayer(mapLayer);
  
 
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

 //map.addLayer(mapLayer);  
 map.addLayer(imgLayer); 
	
//#############################################################################

//add station layers
var _defaultStyle_station =  new OpenLayers.Style({
	  pointRadius: 4,  
	  fillColor: '${color}',
	  graphicName:'circle',	  
	  strokeWidth: 1.0,
	  strokeColor: '#000066'
	 
	});

var _selectStyle_station =  new OpenLayers.Style({
	  pointRadius: 6,  
	  fillColor: '${color}',
	  graphicName:'circle',	  
	  strokeWidth: 1.0,
	  strokeColor: '#000066'	  
	});

var _styleMap_station = new OpenLayers.StyleMap(
{'default': _defaultStyle_station,
'select': _selectStyle_station
});

avaloncgpslayer = new OpenLayers.Layer.Vector("Avalon-CGPS", {  
	styleMap: _styleMap_station
});
avaloncgpslayer.url = AVALON_CGPS_DATA_URL;	
map.addLayer(avaloncgpslayer); 

avalonseismiclayer = new OpenLayers.Layer.Vector("Avalon-Seismic", {  
	styleMap: _styleMap_station
});
avalonseismiclayer.url = AVALON_SEISMIC_DATA_URL;	
map.addLayer(avalonseismiclayer); 

wairakeiseismiclayer = new OpenLayers.Layer.Vector("Wairakei-Seismic", {  
	styleMap: _styleMap_station
});
wairakeiseismiclayer.url = WAIRAKEI_SEISMIC_DATA_URL;	
map.addLayer(wairakeiseismiclayer); 

var featureSelect = createSelectFeatureControl([avaloncgpslayer, avalonseismiclayer, wairakeiseismiclayer], false);	 
map.addControl(featureSelect);
featureSelect.activate();

//should get url
loadStationData(avaloncgpslayer);

//
currentlayer = avaloncgpslayer;

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
    group: "BaseMap",
    checked: true
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
    group: "BaseMap"       
});
actions["image"] = action; 

// actions to add instrument shaking
action = new GeoExt.Action({
    text: "Avalon CGPS",
    control:new  OpenLayers.Control(),        
    map: map,
    handler: function(){
    	  showStationData( avaloncgpslayer);
	    },
    // button options
    toggleGroup: "stations",
    allowDepress: false,
    tooltip: "Avalon CGPS", 
    checked: true,
    group: "stations"       
});
actions["avalon_cgps"] = action; 

action = new GeoExt.Action({
    text: "Avalon Seismic",
    control:new  OpenLayers.Control(),        
    map: map,
    handler: function(){
    	showStationData( avalonseismiclayer);
	    },
    // button options
    toggleGroup: "stations",
    allowDepress: false,
    tooltip: "Avalon Seismic",  
    group: "stations"       
});

actions["avalon_seismic"] = action; 

action = new GeoExt.Action({
    text: "Wairakei Seismic",
    control:new  OpenLayers.Control(),        
    map: map,
    handler: function(){
    	  showStationData( wairakeiseismiclayer);    	  
	    },
    // button options
    toggleGroup: "stations",
    allowDepress: false,
    tooltip: "Wairakei Seismic",  
    group: "stations"       
});
actions["wairakei_seismic"] = action;


var chck_avalon_cgps =  new Ext.menu.CheckItem(actions["avalon_cgps"])
var chck_avalon_seismic =  new Ext.menu.CheckItem(actions["avalon_seismic"])
var chck_wairakei_seismic =  new Ext.menu.CheckItem(actions["wairakei_seismic"])


function  showStationData(layer){	
	//hide first
	currentlayer.setVisibility(false);
	//load to refresh 
	loadStationData(layer);
	currentlayer = layer;
}

toolbarItems.push("->");    
// add as menu items
toolbarItems.push({
    text: "Options",
    menu: new Ext.menu.Menu({
        items: [new Ext.menu.Item({
		            text: 'Base map'
		        }) ,
            new Ext.menu.CheckItem(actions["map"]),             
            new Ext.menu.CheckItem(actions["image"]) ,  
            // Draw line
            "-" , 
            new Ext.menu.Item({
	            text: 'Network status'
	        }) ,
	        chck_avalon_cgps,chck_avalon_seismic,chck_wairakei_seismic,          
            "-"  
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
    title: "Geonet Network Monitor",
    renderTo: document.getElementById('netwatch-map'),
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