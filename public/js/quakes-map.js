/**
 * define basic variables and functions for the application
 */
var quakesMapApp = {
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
    minIntensity : 3,
    maxQuakes:100,
    map: null,
    quakeStartTime:null,
    allQuakesLayers:[],
    layerControl:null,
    regionMap:false,

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
                    var popup = "<strong>Public ID: </strong>" + feature.properties.publicid + "<br/>" +
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


jQuery(document).ready(function () {
	//initMap();
	 quakesMapApp.loadQuakesData();
    
});

