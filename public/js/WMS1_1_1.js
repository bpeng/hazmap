/* 
 * Modifies the default OpenLayers WMS layer implementation by setting
 * wrapDateLine = true, transitionEffect = 'resize', format='image/png'
 * and preventing the loading of tiles outside the latitude range [-90,90]
 * (reducing load on the target WMS server).
 * refer: http://n2.nabble.com/Tiles-outside-maxExtent-being-loaded-td1829360.html#a1829361
 */

OpenLayers.Layer.WMS1_1_1 = OpenLayers.Class(OpenLayers.Layer.WMS, {
    
    /**
     * Constant: DEFAULT_PARAMS
     * {Object} Hashtable of default parameter key/value pairs 
     */
    DEFAULT_PARAMS: { service: "WMS",
                      version: "1.1.1",
                      request: "GetMap",
                      styles: "",
                      exceptions: "application/vnd.ogc.se_inimage",
                      format: "image/png"
                     },
    
    wrapDateLine: true,
    //transitionEffect: 'resize', // Seems to cause strange behaviour sometimes
    srsKey: 'SRS', // Can be overridden by subclasses
    
    /*
     * Overrides function in superclass, preventing the loading of tiles outside
     * the latitude range [-90,90] in EPSG:4326
     */
    getURL: function(bounds) {
        bounds = this.adjustBounds(bounds);
        if (this.isLatLon() && (bounds.bottom >= 90 || bounds.top <= -90)) {
            return  OpenLayers.ImgPath + "blank.png";// TODO: specific to this application
        }       
        var imageSize = this.getImageSize();
        //bounds = new OpenLayers.Bounds(-180,-90, 180, 90);//!!!return the whole extent
        var newParams = {
            'BBOX': this.encodeBBOX ?  bounds.toBBOX() : bounds.toArray(),
            'WIDTH': imageSize.w,
            'HEIGHT': imageSize.h
        };
        return this.getFullRequestString(newParams);
    },
    
    /*
     * returns true if this layer is in lat-lon projection
     */
    isLatLon: function() {
        return this.params[this.srsKey] == 'EPSG:4326' || this.params[this.srsKey] == 'CRS:84';
    },
    
    /*
     * Replaces superclass implementation, allowing for the fact that subclasses
     * might use different keys for the SRS= parameter
     */
    getFullRequestString:function(newParams, altUrl) {
        var projectionCode = this.map.getProjection();
        this.params[this.srsKey] = (projectionCode == "none") ? null : projectionCode;

        return OpenLayers.Layer.Grid.prototype.getFullRequestString.apply(
                                                    this, arguments);
    },
    
    CLASS_NAME: "OpenLayers.Layer.WMS1_1_1"
});

//########################################################
//###### in case of error retrieve wms maps images #######
//########################################################
OpenLayers.Util.onImageLoadError = function() { 
	//alert("OpenLayers.Util.onImageLoadErrorColor " + OpenLayers.Util.onImageLoadErrorColor);
  this._attempts = (this._attempts) ? (this._attempts + 1) : 1;  
  //alert("OpenLayers.Util.onImageLoadErrorColor this._attempts " + this._attempts + " this.urls " + this.urls + " OpenLayers.IMAGE_RELOAD_ATTEMPTS " + OpenLayers.IMAGE_RELOAD_ATTEMPTS + " this " + this);
  if (this._attempts <= OpenLayers.IMAGE_RELOAD_ATTEMPTS) { 
      var urls = this.urls; 
      if (urls && urls instanceof Array && urls.length > 1){ 
          var src = this.src.toString(); 
          var current_url, k; 
          for (k = 0; current_url = urls[k]; k++){ 
              if(src.indexOf(current_url) != -1){ 
                  break; 
              } 
          } 
          var guess = Math.floor(urls.length * Math.random()); 
          var new_url = urls[guess]; 
          k = 0; 
          while(new_url == current_url && k++ < 4){ 
              guess = Math.floor(urls.length * Math.random()); 
              new_url = urls[guess]; 
          } 
          this.src = src.replace(current_url, new_url); 
      } else { //get alternative url and/or layer
          //this.src = this.src; 
    	 // alert("basemap " + map.baseLayer + " altUrl" + map.baseLayer.altUrl + " altLayer " +  map.baseLayer.altLayer  + " layer " +  map.baseLayer.layer );
    	  if(map.baseLayer){
    		  if(map.baseLayer.altUrl && map.baseLayer.url){//replace url
    			  this.src = this.src.replace(map.baseLayer.url, map.baseLayer.altUrl); 
    		  }
    		  if(map.baseLayer.altLayer && map.baseLayer.layer){//replace layer name
    			  this.src = this.src.replace(map.baseLayer.layer, map.baseLayer.altLayer); 
    		  }
    	  }
    	 // alert("basemap " + map.baseLayer + " altUrl" + map.baseLayer.altUrl + " url " +  map.baseLayer.url + " src " + this.src);
      } 
      param = this.src.indexOf("&try="); 
      if (param > 0) { 
          if (this.src.indexOf("&", param) < 0) { 
              this.src = this.src.substring(0, param); 
          } else { 
              this.src = this.src.substring(0, param) + 
              this.src.substring(this.src.indexOf("&", param)); 
          } 
      } 
      this.src = this.src + "&try=" + this._attempts; 
      
  } else { 
  	this.src = OpenLayers.ImgPath + "logo_geonet.png";
    this.style.backgroundColor = "#cccccc";//OpenLayers.Util.onImageLoadErrorColor; 
  } 
  this.style.display = ""; 
}; 
