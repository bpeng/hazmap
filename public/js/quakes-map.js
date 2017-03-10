/**
 * define basic variables and functions for the application
 */
var quakesMapApp = {
    GEOJSON_URL: "data/5/100.json",
    NZ_CENTRE: new L.LatLng(-40.5, 174.5),
    ieVersion: -1,
    currentTime: null,
    lftMap: null,
    allQuakeIntensities: ['unnoticeable', 'weak',
        'light', 'moderate',
        'strong', 'severe'
    ],
    allQuakeIntensityColors: {
        'unnoticeable': '#A9A9A9',
        'weak': '#696969',
        'light': '#1E90FF',
        'moderate': '#008000',
        'strong': '#FFA500',
        'severe': '#FF0000'
    },
    allQuakeIntensitySizes: {
        'unnoticeable': 5,
        'weak': 7,
        'light': 9,
        'moderate': 11,
        'strong': 13,
        'severe': 15
    },
    minIntensity: 3,
    maxQuakes: 100,
    map: null,
    quakeStartTime: null,
    allQuakesLayers: [],
    layerControl: null,
    regionMap: false,

    /***
     * init leaflet basemap
     * ***/
    initBaseMap: function (bingKey) {
        var osmUrl = '//{s}.geonet.org.nz/osm/tiles/{z}/{x}/{y}.png',
                osmLayer = new L.TileLayer(osmUrl, {
                    minZoom: 1,
                    maxZoom: 16,
                    errorTileUrl: '//static.geonet.org.nz/osm/images/logo_geonet.png',
                    subdomains: ['static1', 'static2', 'static3', 'static4', 'static5']
                });
        var BING_KEY = 'AhK092tJ9_a5suB7r0pkgKI6aGSQuUm3MFwP9ygHezQtyeNx8KK8529Lj4p7mxmQ'
        var bingLayer = new L.BingLayer(BING_KEY, {type: "Aerial"});

        var landCoverWms = L.tileLayer.wms('http://maps.gns.cri.nz/geology/wms?&SPHERICALMERCATOR=true&SRS=EPSG:900913', {
            layers: 'lcr:landscape_eco_painted_relief_cached',
            format: 'image/png',
            transparent: true,
            srs: 'EPSG:900913'

        });

        var linzTiles = 'http://tiles-{s}.data-cdn.linz.govt.nz/services;key=df00b26dbc294fc6b64da98e91a01078/tiles/v4/set=2,style=default/EPSG:3857/{z}/{x}/{y}.png';
        var linzSatelliteTiles = L.tileLayer(linzTiles,
                {
                    minZoom: 1,
                    maxZoom: 18,
                    errorTileUrl: '//static.geonet.org.nz/osm/images/logo_geonet.png',
                    subdomains: 'abcd'
                });

        var linzTop50Wms = L.tileLayer.wms('//data.linz.govt.nz/services;key=c2c6f2d210c548fcbcacd69aeaefb22a/r/wms?TILED=true&SRS=EPSG:3857&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap', {
            layers: 'layer-767'
        });

        var gnsTerrainWms = L.tileLayer.wms('//data.gns.cri.nz/gis/services/basemaps/nzdtm_shade/MapServer/WmsServer?TILED=true&SPHERICALMERCATOR=true', {
            layers: 'NZ_DTM_SHADE',
            format: 'image/png',
            transparent: true
        });

        var gnsTopoWms = L.tileLayer.wms('//maps.gns.cri.nz/geology/wms?TILED=true&SPHERICALMERCATOR=true', {
            layers: 'lcr:topobasemap_cached',
            format: 'image/png',
            transparent: true
        });

        var esriWorldTiles = L.tileLayer('//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            minZoom: 1,
            maxZoom: 18,
            errorTileUrl: '//static.geonet.org.nz/osm/images/logo_geonet.png',
        });

        var usgsBaseMapTiles = L.tileLayer('//server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}.png', {
            minZoom: 1,
            maxZoom: 16,
            errorTileUrl: '//static.geonet.org.nz/osm/images/logo_geonet.png',
        });

        baseLayers = {
            "OSM Map": osmLayer,
            "Bing Aerial": bingLayer,
            "GNS NZ Topo WMS": gnsTopoWms,
            "LINZ Aerial": linzSatelliteTiles,
            "LINZ Topo50 WMS": linzTop50Wms,
            "GNS Terrain Model WMS": gnsTerrainWms,
            "Landcover Terrain WMS": landCoverWms,
            "USGS Gray Base": usgsBaseMapTiles,
            "ESRI World Imagery": esriWorldTiles
        };


        var showFelt = this.publicId !== null;

        var baseLayer = osmLayer;
        if (this.mapType === 'volcano' || this.mapType === 'cameras' || this.mapType === 'drums' || this.mapType === 'volcanoEarthquakes') {//switch to aerialTopo
            baseLayer = bingLayer;
        }

        this.lftMap = L.map('geonet-haz-map', {
            worldCopyJump: false,
            attributionControl: showFelt,
            zoom: 18,
            layers: [baseLayer]
        });


        //need to be referenced later
        this.layerControl = L.control.layers(baseLayers, null, {collapsed: true});

        this.layerControl.addTo(this.lftMap);

        this.lftMap.setView(this.NZ_CENTRE, 5);

        this.lftMap.on("overlayadd", function (e) {
            if (e.name === 'Shaking') {//show reports summary
                geonetmapClient.showReportsCount();
            }
            //check layer featureslocation -- for network map
            if (geonetmapClient.ALL_OVERLAYS[e.name]) {
                geonetmapClient.ALL_OVERLAYS[e.name].checkFeatureLocation();

                //setFilterFields
                var data = geonetmapClient.allOverlayData[e.name];
                var endDate = data.features[data.features.length - 1].properties.start;
                geonetmapClient.setFilterFields(Date.parseUTC(endDate));

            }
        });
        this.lftMap.on("overlayremove", function (e) {
            if (e.name === 'Shaking') {//hide report summary
                geonetmapClient.hideReportsTable();
                this.attributionControl.setPrefix("");
            }
        });

        //for the felt reports table
        if (this.lftMap.attributionControl) {
            this.lftMap.attributionControl.setPrefix("");
            /* click listener for the reports table */
            jQuery(".leaflet-control-attribution").click(function () {
                if (!geonetmapClient.feltReportsTableShown) {
                    geonetmapClient.showReportsTable();
                } else {
                    geonetmapClient.hideReportsTable();
                }
            });
        }
    },

    loadQuakesData: function (url) {
        if (!url) {
            url = this.GEOJSON_URL;
        }
        jQuery.getJSON(url, function (data) {
            var layer = quakesMapApp.makeQuakesLayer(data);
            quakesMapApp.lftMap.addLayer(layer);
            quakesMapApp.layerControl.addOverlay(layer, "Quakes");
        });

    },

    makeQuakesLayer: function (data) {
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
                } else {
                    lon = latlng.lng;
                }
                var newLatLong = new L.LatLng(latlng.lat, lon, true);
                var quakecolor = quakesMapApp.allQuakeIntensityColors[intensity];
                var quakeSize = quakesMapApp.allQuakeIntensitySizes[intensity];
                if (!quakecolor) {
                    quakecolor = '#F5F5F5';
                }
                if (!quakeSize) {
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
    getIEVersion: function () {
        var rv = -1;
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


