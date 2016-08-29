/*********
 * datasources 
	http://geonet.org.nz/services/shakingmap?externalRef=3468575&agency=g
	http://hutl13447.gns.cri.nz/geonet-services/shakingmap?externalRef=3468575&agency=g
	http://geonet.org.nz/services/quake/pga/nzmg/3468575g
	http://geonet.org.nz/services/quake/pgv/nzmg/3468575g
	http://geonet.org.nz/services/quake/w-a/nzmg/3468575g
*/

/**********************************************************************************
 * map to display felt reports
 * and instrument shaking
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
var FELT_REPORTS_DATA_URL = '/geonet-services/shakingmap?agency=g';
var INSTRUMENT_SHAKING_URL = '/geonet-services/quake';

var PROJ_WGS = new OpenLayers.Projection("EPSG:4326");
var PROJ_NZMG = new OpenLayers.Projection("EPSG:27200");
var PROJ_GOOGLE = new OpenLayers.Projection("EPSG:900913");
var OSM_TILES_URL = ["http://static1.geonet.org.nz/osm/tiles/","http://static2.geonet.org.nz/osm/tiles/",
                     "http://static3.geonet.org.nz/osm/tiles/","http://static4.geonet.org.nz/osm/tiles/",
                     "http://static5.geonet.org.nz/osm/tiles/"];//"/osm/tiles/";


OpenLayers.IMAGE_RELOAD_ATTEMPTS=2;
OpenLayers.Util.onImageLoadErrorColor = '#cccccc';
OpenLayers.ImgPath='images/'
	
var map,reportslayer, quakelayer, pgalayer, pgvlayer, walayer,instrumentMenuItem;

var max_map_bounds = new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508.34);
var  mapCentre = new OpenLayers.LonLat(173.0,-41.0);
var  mapZoomLevel = 5;

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

 map = new OpenLayers.Map( $('map'), mapOptions ); //   
 	  //override the zoomToMaxExtent function to zoom to the full NZ extent
 mapCentre.transform(PROJ_WGS, PROJ_GOOGLE);
 var externalRef = getParamVal('externalRef');
 
 
 /**** functions */
 
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


function getFeltReportsData() { 
  var paramString = OpenLayers.Util.getParameterString({'externalRef': externalRef});
  var _url = OpenLayers.Util.urlAppend(FELT_REPORTS_DATA_URL, paramString);	 
	OpenLayers.Request.GET({
		url: _url,
	    success: parseReportsData
	    //scope: this
	    });
}

function hideInstrumentLayers(){
	pgalayer.setVisibility(false);
	pgvlayer.setVisibility(false);
	walayer.setVisibility(false);
}

/*
 * 	http://geonet.org.nz/services/quake/pga/nzmg/3468575g
	http://geonet.org.nz/services/quake/pgv/nzmg/3468575g
	http://geonet.org.nz/services/quake/w-a/nzmg/3468575g
 * */
function  addInstrumentShaking(instrument){
	//hide all instrument layers
	hideInstrumentLayers();
	
	var layer = getInstrumentLayer(instrument);
	if(layer.loaded){
		layer.setVisibility(true);
		instrumentMenuItem.layerLoaded();
	}else{
		//INSTRUMENT_SHAKING_URL
		 var _url = INSTRUMENT_SHAKING_URL + '/' + instrument + '/nzmg/' + externalRef + 'g';	 
		 OpenLayers.Request.GET({
			url: _url,
		    success:function(response){ 
		    	parseInstrumentData(response,instrument )
		    	}
		    //scope: this
		    });	
	}		
}

function getInstrumentLayer(instrument){
	var layer;
	if(instrument == 'pga'){
		layer = pgalayer;
	}else if(instrument == 'pgv'){
		layer = pgvlayer;
	}else if(instrument == 'w-a'){
		layer = walayer;
	}
	return layer;
}

function parseInstrumentData(response,instrument){ 
	var layer = getInstrumentLayer(instrument);
	
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
	//alert(stationNodes);	
	//alert(serializer.serializeToString(stationNodes));
	var features = [];
	if(stationNodes){
	  for(var i = 0; i < stationNodes.length; i++){
		  var stationNode = stationNodes[i];
		  var feature = createStationFeature(stationNode, instrument);
		  if(feature){
			  features.push(feature);
		  }    		 
	  }
    }
	//alert(features.length);
	layer.addFeatures(features);  
	//mark as loaded
	layer.loaded = true;
	layer.setVisibility(true);
	//call back
	instrumentMenuItem.layerLoaded();
}

//create a point feature based on xml element
function createStationFeature(stationNode,instrument){
var pointFeature ;
if(stationNode ){
	var _code = xmlformat.getAttributeNS(stationNode, '', 'code');
	var _name = xmlformat.getAttributeNS(stationNode, '','name');
	var _network = xmlformat.getAttributeNS(stationNode, '','network');		
	var nzmge = xmlformat.getAttributeNS(stationNode, '','nzmge');
	var nzmgn = xmlformat.getAttributeNS(stationNode, '','nzmgn');		
	nzmge = parseFloat(nzmge);
	nzmgn = parseFloat(nzmgn);
	var _reading;	
	if(stationNode.firstChild){
		_reading =  parseFloat( stationNode.firstChild.nodeValue);
	}
	var _mmi = getMMI4Instrument(_reading, instrument);
	var _color = getMMColor( _mmi);		
	var _size =  getmmsize(_mmi,1);//
	var point = new OpenLayers.Geometry.Point(nzmge, nzmgn);		
	 point.transform(PROJ_NZMG, map.getProjectionObject());	
	 pointFeature = new OpenLayers.Feature.Vector(point);
	 pointFeature.attributes = {
	     code: _code,
	     name:_name,
	     network:_network,
	     instrument:instrument,
	     reading:_reading,
	     color:_color,
	     size:_size,
	     size2: (_size + 2),
	     mmi:_mmi
	 };
}
return pointFeature;
}


//parse xml data and add to shake layer
function parseReportsData(response){
	 var data = response.responseXML || response.responseText;
	   //alert(response.responseText);
	   if(typeof data == "string") {
          data = OpenLayers.parseXMLString(data);
      }
	   //alert(response.responseText);	   
      if(data && data.nodeType == 9) {
          data = data.documentElement;
      } 
      var mmNodes = xmlformat.getElementsByTagNameNS(data,data.namespaceURI, "mm");
     // alert(mmNodes);
      //alert(serializer.serializeToString(mmNodes));
      var features = [];
      if(mmNodes){
    	  for(var i = 0; i < mmNodes.length; i++){
    		  var mmNode = mmNodes[i];
    		 // alert(mmNode);
    		  if(mmNode ){
    			  var mm = xmlformat.getAttributeNS(mmNode, '', 'val');
    			  mm = parseInt(mm);
    			  for(var j = 0 ; j < mmNode.childNodes.length; j++){
    				  var reportNode = mmNode.childNodes[j];
    				  var feature = createReportFeature(reportNode, mm);
    				  if(feature){
			    			features.push(feature);
			    		} 
    			  }
    		  }
    	  }
      }
      reportslayer.addFeatures(features);  
      //get quake centre and add to map
      var quakeNode = xmlformat.getElementsByTagNameNS(data,data.namespaceURI, "quake")[0];
      //alert(serializer.serializeToString(quakeNode));
      if(quakeNode  ){  
    	var _id = xmlformat.getAttributeNS(quakeNode, '', 'id');
		var nzmge = xmlformat.getAttributeNS(quakeNode, '','nzmge');
		var nzmgn = xmlformat.getAttributeNS(quakeNode, '','nzmgn');		
		nzmge = parseFloat(nzmge);
		nzmgn = parseFloat(nzmgn);
		var _desc = '';
		if(quakeNode.firstChild){
			_desc = quakeNode.firstChild.nodeValue;
			if(_desc){
				_desc = _desc.replace(new RegExp('\n', 'g'), '<br/>');
			}			
		}
		
		 var point = new OpenLayers.Geometry.Point(nzmge, nzmgn);		
		 point.transform(PROJ_NZMG, map.getProjectionObject());	
		 quakeFeature = new OpenLayers.Feature.Vector(point);
		 quakeFeature.attributes = {
			id:_id,
			name: _desc		
		 };
		 //add to quake layer
		 quakelayer.addFeatures([quakeFeature]);  
		 //re centre map
		 mapCentre = new OpenLayers.LonLat(point.x,point.y);
		 mapZoomLevel = mapZoomLevel + 1 ;
		 //mapCentre.transform(PROJ_NZMG, map.getProjectionObject());	
		 map.zoomToMaxExtent();
      }
}

//create a point feature based on xml element
function createReportFeature(reportNode, mm){
	var pointFeature ;
	if(reportNode){
		var _place = xmlformat.getAttributeNS(reportNode, '','plc');
		var _count = xmlformat.getAttributeNS(reportNode, '','count');
		var _mmmin = xmlformat.getAttributeNS(reportNode, '','mmmin');		
		var nzmge = xmlformat.getAttributeNS(reportNode, '','nzmge');
		var nzmgn = xmlformat.getAttributeNS(reportNode, '','nzmgn');		
		nzmge = parseFloat(nzmge);
		nzmgn = parseFloat(nzmgn);
		_mmmin = parseInt(_mmmin);
		
		var _mmi = mm;
		if(_mmmin != mm){
			//alert(_mmmin);
			 _mmi = _mmmin + ' - ' + mm;
		}
		var _color = getMMColor(mm);		
		var _size = getmmsize(mm);//make it a bit bigger
		var point = new OpenLayers.Geometry.Point(nzmge, nzmgn);		
		 point.transform(PROJ_NZMG, map.getProjectionObject());	
		 pointFeature = new OpenLayers.Feature.Vector(point);
		 pointFeature.attributes = {
		     name: _place,		    
		     color:_color,
		     count: _count,
		     size:_size,
		     size2: (_size + 2),
		     mmi:_mmi
		 };
	}
	return pointFeature;
}


function getmmsize(mm, type){
    var size = 5;        	
	if(mm  < 4){
		size = 5;		
	}else if(mm < 6){
		size = 6;
	}else if(mm < 8){
		size = 7;	
	}else if(mm >= 8){
		size = 8;	
	}
	if(type == 1){//for seismic station (square)
		size = size - 1;
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

function  getMMI4Instrument(value, instrument){
	var mmi = 0;
	if(instrument == 'pga'){
		mmi = getMMI4Pga(value);
	}else if(instrument == 'pgv'){
		mmi = getMMI4Pgv(value);
	}else if(instrument == 'w-a'){
		mmi = getMMI4Wa(value);
	}	
	return mmi;
}

function getMMI4Wa(wa) {
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

function getMMI4Pga(pga) {
//pga colors pgaoverlay
	//return map.getStationColor(this.reading);
	var mm = 0;        	
	if(pga  <= 0.51){ //mm3-
		mm = 1;
	}else if(pga <= 1.1){ //mm3
		mm = 3;
	}else if(pga <= 2.5){//mm4
		mm = 4;
	}else if(pga <= 5.6){//mm5
		mm = 5;
	}else if(pga <= 12.6){//mm6
		mm = 6;
	}else if(pga <= 28.0){//mm7
		mm = 7;		
	}else if(pga <= 62.0){//mm8
		mm = 8;
	}else if(pga <= 138.0){//mm9
		mm = 9;
	}else if(pga > 138.0){//mm10
		mm = 10;
	}			
	return mm;				
}  

function getMMI4Pgv(pgv) {
	var mm = 0;        	
if(pgv <= 0.3){
	mm = 1;//
}else if(pgv <=  0.9){
	mm = 3;//
}else if(pgv <= 2.2){
	mm = 4;//
}else if(pgv <=  4.9){
	mm = 5;
}else if(pgv <=  11.2){
	mm = 6;
}else if(pgv <=  26.0){
	mm = 7;
}else if(pgv <= 57.0){//mm8
	mm = 8;
}else if(pgv <= 129.0){//mm9
	mm = 9;
}else if(pgv > 129.0){//mm10
	mm = 10
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
	      var info ;	
		  var popupLen = 100;
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
	         var len = 80 + (info.length - 8)*5;
	         if(info.indexOf('<br/>') > 0){
	        	 len = 80 + (info.indexOf('<br/>') - 8)*5;
	         }
	         
	         if (len > popupLen ) popupLen = len;	
	         var popSize = new OpenLayers.Size(popupLen, 50);
	         
	         //for instrument shaking
	         if(feature.attributes.instrument && feature.attributes.reading ){
	            info += "<br/>" + feature.attributes.instrument.toUpperCase() + ": " + feature.attributes.reading;
	         }
	         
	         if(feature.attributes.mmi  ){
	            info += "<br/>" + "MM: " + feature.attributes.mmi;
	         }
	         //for felt reports
	         if(feature.attributes.count){
	            info += "<br/>" + "Reports: " + feature.attributes.count;
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

 map.addLayer(mapLayer);  
 map.addLayer(imgLayer); 
	
//#############################################################################
var _defaultStyle_reports =  new OpenLayers.Style({
	  pointRadius: '${size}',  
	  fillColor: '${color}',
	  graphicName:'circle',	  
	  strokeWidth: 1.0,
	  strokeColor: '#000066'
	 
	});

var _selectStyle_reports =  new OpenLayers.Style({
	  pointRadius: '${size2}',  
	  fillColor: '${color}',
	  graphicName:'circle',	  
	  strokeWidth: 1.0,
	  strokeColor: '#000066'	  
	});

var _styleMap_reports = new OpenLayers.StyleMap(
{'default': _defaultStyle_reports,
 'select': _selectStyle_reports
});


reportslayer = new OpenLayers.Layer.Vector("Felt Reports", {  
	styleMap: _styleMap_reports
 });
	

//
//addPointFeatures(reportslayer);

map.addLayer(reportslayer); 


//=== create quake layer
var defaultStyle_quake = new OpenLayers.Style({
   pointRadius: 10,  
   externalGraphic: OpenLayers.ImgPath + 'quake.png'
});
var selectStyle_quake = new OpenLayers.Style({
   pointRadius: 12,
   externalGraphic: OpenLayers.ImgPath + 'quake.png'
});
var styleMap_quake = new OpenLayers.StyleMap(
{'default': defaultStyle_quake,
 'select': selectStyle_quake
});

quakelayer = new OpenLayers.Layer.Vector("Epicentre", {  
	styleMap: styleMap_quake
 });
map.addLayer(quakelayer); 

//add instrument shaking layers
var _defaultStyle_station =  new OpenLayers.Style({
	  pointRadius: '${size}',  
	  fillColor: '${color}',
	  graphicName:'square',	  
	  strokeWidth: 1.0,
	  strokeColor: '#000066'
	 
	});

var _selectStyle_station =  new OpenLayers.Style({
	  pointRadius: '${size2}',  
	  fillColor: '${color}',
	  graphicName:'square',	  
	  strokeWidth: 1.0,
	  strokeColor: '#000066'	  
	});

var _styleMap_station = new OpenLayers.StyleMap(
{'default': _defaultStyle_station,
'select': _selectStyle_station
});

pgalayer = new OpenLayers.Layer.Vector("PGA", {  
	styleMap: _styleMap_station
});
pgalayer.loaded = false;
map.addLayer(pgalayer); 

pgvlayer = new OpenLayers.Layer.Vector("PGV", {  
	styleMap: _styleMap_station
});
pgvlayer.loaded = false;
map.addLayer(pgvlayer); 

walayer = new OpenLayers.Layer.Vector("W-A", {  
	styleMap: _styleMap_station
});
walayer.loaded = false;
map.addLayer(walayer); 

var featureSelect = createSelectFeatureControl([reportslayer, quakelayer, pgalayer,pgvlayer,walayer], false);	 
map.addControl(featureSelect);
featureSelect.activate();

//should get url
getFeltReportsData();

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
    text: "PGA",
    control:new  OpenLayers.Control(),        
    map: map,
    handler: function(){
    	addInstrumentShaking('pga');
	    },
    // button options
    toggleGroup: "instrument",
    allowDepress: false,
    tooltip: "Show PGA",  
    group: "instrument"       
});
actions["pga"] = action; 

action = new GeoExt.Action({
    text: "PGV",
    control:new  OpenLayers.Control(),        
    map: map,
    handler: function(){
    	  addInstrumentShaking('pgv'); 
	    },
    // button options
    toggleGroup: "instrument",
    allowDepress: false,
    tooltip: "Show PGV",  
    group: "instrument"       
});

actions["pgv"] = action; 

action = new GeoExt.Action({
    text: "W-A",
    control:new  OpenLayers.Control(),        
    map: map,
    handler: function(){
    	  addInstrumentShaking('w-a');
	    },
    // button options
    toggleGroup: "instrument",
    allowDepress: false,
    tooltip: "Show W-A",  
    group: "instrument"       
});
actions["wa"] = action;

instrumentMenuItem = new Ext.menu.Item({
    text: 'Add instrument shaking',
    handler: removeInstrumentShaking
});

instrumentMenuItem.layerLoaded = function(){
	this.setText( 'Remove instrument shaking');
}

var chckpga =  new Ext.menu.CheckItem(actions["pga"])
var chckpgv =  new Ext.menu.CheckItem(actions["pgv"])
var chckwa =  new Ext.menu.CheckItem(actions["wa"])

function  removeInstrumentShaking(){
	//alert(instrumentMenuItem.text);
	if(instrumentMenuItem.text =='Remove instrument shaking'){
		hideInstrumentLayers();
		chckpga.setChecked(false);
		chckpgv.setChecked(false);
		chckwa.setChecked(false);
		instrumentMenuItem.setText ( 'Add instrument shaking');
	}else{
		//instrumentMenuItem.setText( 'Remove instrument shaking');
	}	
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
            instrumentMenuItem,
            chckpga,chckpgv,chckwa,          
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
    title: "Geonet Felt Reports",
    renderTo: document.getElementById('felt-map'),
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