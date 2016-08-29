/*
 * Displays recent earthquakes, data is taken from the json service.
 * @author - Hien Tran 2012, Baishan 8/2013
 */
Date.parseUTC = function (date) {
    var origParse = Date.parse, numericKeys = [ 1, 4, 5, 6, 7, 10, 11 ];
    var timestamp, struct, minutesOffset = 0;
    if ((struct = /^(\d{4})-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2}).(\d{1,10})$/.exec(date))) {
        // avoid NaN timestamps caused by "undefined" values being passed to Date.UTC
        for (var i = 0, k; (k = numericKeys[i]); ++i) {
            struct[k] = +struct[k] || 0;
        }
        // allow undefined days and months
        struct[2] = (+struct[2] || 1) - 1;
        struct[3] = +struct[3] || 1;

        timestamp = Date.UTC(struct[1], struct[2], struct[3], struct[4], struct[5], struct[6]);
    }else {
        timestamp = origParse ? origParse(date) : NaN;
    }
    return new Date(timestamp);
};
/**
 * define basic variables and functions for the application
 */
var quakesMapApp = {
    URL_PREFIX : "/quakes/region/newzealand/",
    GEOJSON_URL : "data/5/100.json",
    ieVersion:-1,
    currentTime:null,

    allQuakeIntensities:['unnoticeable','weak',
    'light','moderate',
    'strong','severe'
    ],
    allQuakeIntensityColors:{
        'unnoticeable':'#A9A9A9',
        'weak':'#696969',
        'light':'#1E90FF',
        'moderate':'#008000',
        'strong':'#FFA500',
        'severe':'#FF0000'
    },
    allQuakeIntensitySizes:{
        'unnoticeable':5,
        'weak':7,
        'light':9,
        'moderate':11,
        'strong':13,
        'severe':15
    },
    intensityList : ["0","3","4","5","6","7"],
    intensityNameList : ['unnoticeable','weak', 'light','moderate', 'strong','severe'],
    maxQuakesList : ["100","500","1000","1500"],
    minIntensity : 3,
    maxQuakes:100,
    map: null,
    quakeStartTime:null,
    allQuakesLayers:[],
    layerControl:null,
    regionMap:false,

    clearOverLays:function(){
        if(this.allQuakesLayers.length > 0){
            for(var index in this.allQuakesLayers){
                this.map.removeLayer(this.allQuakesLayers[index]);
                this.layerControl.removeLayer(this.allQuakesLayers[index]);
                this.allQuakesLayers[index].clearLayers();
            }
            this.allQuakesLayers = [];
        }
    },

    checkMapData:function(minIntensitySel, maxQuakesSel){
        var update = false;
        if(minIntensitySel != this.minIntensity){
            this.minIntensity = minIntensitySel;
            update = true;
        }
        if(maxQuakesSel != this.maxQuakes){
            this.maxQuakes = maxQuakesSel;
            update = true;
        }
        if(update){
            this.loadQuakesData();
        }
    },


    loadQuakesData:function(url){
        if(!url){
            url = this.GEOJSON_URL;
        }
        jQuery.getJSON(url, function (data) {
        	var layer = quakesMapApp.makeQuakesLayer(data);
            map.addLayer(layer);           
            layerControl.addOverlay(layer, "Quakes");        	
        });
        
    },

    makeQuakesLayer:function(data){
        return L.geoJson(data, {
            onEachFeature: function (feature, layer) {
                if (feature.properties) {
                    var popup = "<strong>Public ID: </strong><a href='" + quakesMapApp.URL_PREFIX + feature.properties.publicid + "'>" + feature.properties.publicid + "</a><br/>" +
                    "<strong>Time: </strong>" + feature.properties.nzorigintime + "<br/>" +
                    "<strong>Intensity: </strong><span class='badge " + feature.properties.intensity + "'>" + feature.properties.intensity + "</span><br/>" +
                    "<strong>Magnitude: </strong>" + feature.properties.magnitude.toFixed(1) + "<br/>" +
                    "<strong>Depth: </strong>" + Math.round(feature.properties.depth) + " km<br/>";
                    layer.bindPopup(popup);
                }
            },
            pointToLayer: function (feature, latlng) {
                //var origintime = Date.parseUTC(feature.properties.origintime);
                var intensity = feature.properties.intensity;
                //fix dateline issue
                var lon;
                if (latlng.lng < 0) {
                    lon = latlng.lng + 360;
                }else {
                    lon = latlng.lng;
                }
                var newLatLong = new L.LatLng(latlng.lat, lon, true);
                var quakecolor = quakesMapApp.allQuakeIntensityColors[intensity];
                var quakeSize = quakesMapApp.allQuakeIntensitySizes[intensity];
                if(!quakecolor){
                    quakecolor = '#F5F5F5';
                }
                if(!quakeSize){
                    quakeSize = 5;
                }
                //var age = (quakesMapApp.currentTime - origintime.getTime())/(1000*60*60*24);
                //var range = (quakesMapApp.currentTime - quakesMapApp.quakeStartTime)/(1000*60*60*24);
                //var opacity = 0.2 + 0.8*(range - age)/range;
                return L.circleMarker(newLatLong, {
                    radius: quakeSize,
                    color: quakecolor,
                    fillColor: quakecolor,
                    fillOpacity: 0.6,
                    opacity: 0.6,
                    stroke: 0
                });
            }
        });
    },
    // Returns the version of Windows Internet Explorer or a -1
    // (indicating the use of another browser).
    getIEVersion:function(){
        var rv = - 1;
        // Return value assumes failure.
        if (navigator.appName == 'Microsoft Internet Explorer') {
            var ua = navigator.userAgent;
            var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) != null)
                rv = parseFloat(RegExp.$1);
        }
        return rv;
    }
};

function initMap() {
    var IE_QUAKE_ICON_URL = 'http://static.geonet.org.nz/geonet-2.0.2/images/volcano/quake-icon-ie.png';    

    quakesMapApp.ieVersion = quakesMapApp.getIEVersion();

    quakesMapApp.map = new L.Map('haz-map', {
        attributionControl: false,
        worldCopyJump: false
    }).setView([-41, 174], 5);

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
    
    googleSatellite = new L.Google('SATELLITE');  //ROADMAP, TERRAIN
    
    //map switcher
    var baseLayers = {
        "Map" : osmLayerGeonet,
        "Satellite" : googleSatellite
    };
    quakesMapApp.map.addLayer(osmLayerGeonet);
    //add layer switch
    quakesMapApp.layerControl = L.control.layers(baseLayers);

    quakesMapApp.layerControl.addTo(quakesMapApp.map)   
    
    //load and add quakes layer
    quakesMapApp.loadQuakesData();
};

jQuery(document).ready(function () {
	//initMap();
	 quakesMapApp.loadQuakesData();
    
});

