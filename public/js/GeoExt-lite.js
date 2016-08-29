/*

Copyright (c) 2008-2010, The Open Source Geospatial Foundation
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the Open Source Geospatial Foundation nor the names
      of its contributors may be used to endorse or promote products derived
      from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.

*/

Ext.namespace("GeoExt");GeoExt.Action=Ext.extend(Ext.Action,{control:null,map:null,uScope:null,uHandler:null,uToggleHandler:null,uCheckHandler:null,constructor:function(config){this.uScope=config.scope;this.uHandler=config.handler;this.uToggleHandler=config.toggleHandler;this.uCheckHandler=config.checkHandler;config.scope=this;config.handler=this.pHandler;config.toggleHandler=this.pToggleHandler;config.checkHandler=this.pCheckHandler;var ctrl=this.control=config.control;delete config.control;if(ctrl){if(config.map){config.map.addControl(ctrl);delete config.map;}
if((config.pressed||config.checked)&&ctrl.map){ctrl.activate();}
ctrl.events.on({activate:this.onCtrlActivate,deactivate:this.onCtrlDeactivate,scope:this});}
arguments.callee.superclass.constructor.call(this,config);},pHandler:function(cmp){var ctrl=this.control;if(ctrl&&ctrl.type==OpenLayers.Control.TYPE_BUTTON){ctrl.trigger();}
if(this.uHandler){this.uHandler.apply(this.uScope,arguments);}},pToggleHandler:function(cmp,state){this.changeControlState(state);if(this.uToggleHandler){this.uToggleHandler.apply(this.uScope,arguments);}},pCheckHandler:function(cmp,state){this.changeControlState(state);if(this.uCheckHandler){this.uCheckHandler.apply(this.uScope,arguments);}},changeControlState:function(state){if(state){if(!this._activating){this._activating=true;this.control.activate();this._activating=false;}}else{if(!this._deactivating){this._deactivating=true;this.control.deactivate();this._deactivating=false;}}},onCtrlActivate:function(){var ctrl=this.control;if(ctrl.type==OpenLayers.Control.TYPE_BUTTON){this.enable();}else{this.safeCallEach("toggle",[true]);this.safeCallEach("setChecked",[true]);}},onCtrlDeactivate:function(){var ctrl=this.control;if(ctrl.type==OpenLayers.Control.TYPE_BUTTON){this.disable();}else{this.safeCallEach("toggle",[false]);this.safeCallEach("setChecked",[false]);}},safeCallEach:function(fnName,args){var cs=this.items;for(var i=0,len=cs.length;i<len;i++){if(cs[i][fnName]){cs[i].rendered?cs[i][fnName].apply(cs[i],args):cs[i].on({"render":cs[i][fnName].createDelegate(cs[i],args),single:true});}}}});
Ext.namespace("GeoExt");GeoExt.MapPanel=Ext.extend(Ext.Panel,{map:null,layers:null,center:null,zoom:null,prettyStateKeys:false,extent:null,stateEvents:["aftermapmove","afterlayervisibilitychange","afterlayeropacitychange"],initComponent:function(){if(!(this.map instanceof OpenLayers.Map)){this.map=new OpenLayers.Map(Ext.applyIf(this.map||{},{allOverlays:true}));}
var layers=this.layers;if(!layers||layers instanceof Array){this.layers=new GeoExt.data.LayerStore({layers:layers,map:this.map.layers.length>0?this.map:null});}
if(typeof this.center=="string"){this.center=OpenLayers.LonLat.fromString(this.center);}else if(this.center instanceof Array){this.center=new OpenLayers.LonLat(this.center[0],this.center[1]);}
if(typeof this.extent=="string"){this.extent=OpenLayers.Bounds.fromString(this.extent);}else if(this.extent instanceof Array){this.extent=OpenLayers.Bounds.fromArray(this.extent);}
GeoExt.MapPanel.superclass.initComponent.call(this);this.addEvents("aftermapmove","afterlayervisibilitychange","afterlayeropacitychange");this.map.events.on({"moveend":this.onMoveend,"changelayer":this.onLayerchange,scope:this});},onMoveend:function(){this.fireEvent("aftermapmove");},onLayerchange:function(e){if(e.property){if(e.property==="visibility"){this.fireEvent("afterlayervisibilitychange");}else if(e.property==="opacity"){this.fireEvent("afterlayeropacitychange");}}},applyState:function(state){this.center=new OpenLayers.LonLat(state.x,state.y);this.zoom=state.zoom;var i,l,layer,layerId,visibility,opacity;var layers=this.map.layers;for(i=0,l=layers.length;i<l;i++){layer=layers[i];layerId=this.prettyStateKeys?layer.name:layer.id;visibility=state["visibility_"+layerId];if(visibility!==undefined){visibility=(/^true$/i).test(visibility);if(layer.isBaseLayer){if(visibility){this.map.setBaseLayer(layer);}}else{layer.setVisibility(visibility);}}
opacity=state["opacity_"+layerId];if(opacity!==undefined){layer.setOpacity(opacity);}}},getState:function(){var state;if(!this.map){return;}
var center=this.map.getCenter();state={x:center.lon,y:center.lat,zoom:this.map.getZoom()};var i,l,layer,layerId,layers=this.map.layers;for(i=0,l=layers.length;i<l;i++){layer=layers[i];layerId=this.prettyStateKeys?layer.name:layer.id;state["visibility_"+layerId]=layer.getVisibility();state["opacity_"+layerId]=layer.opacity==null?1:layer.opacity;}
return state;},updateMapSize:function(){if(this.map){this.map.updateSize();}},renderMap:function(){var map=this.map;map.render(this.body.dom);this.layers.bind(map);if(map.layers.length>0){if(this.center||this.zoom!=null){map.setCenter(this.center,this.zoom);}else if(this.extent){map.zoomToExtent(this.extent);}else{map.zoomToMaxExtent();}}},afterRender:function(){GeoExt.MapPanel.superclass.afterRender.apply(this,arguments);if(!this.ownerCt){this.renderMap();}else{this.ownerCt.on("move",this.updateMapSize,this);this.ownerCt.on({"afterlayout":{fn:this.renderMap,scope:this,single:true}});}},onResize:function(){GeoExt.MapPanel.superclass.onResize.apply(this,arguments);this.updateMapSize();},onBeforeAdd:function(item){if(typeof item.addToMapPanel==="function"){item.addToMapPanel(this);}
GeoExt.MapPanel.superclass.onBeforeAdd.apply(this,arguments);},remove:function(item,autoDestroy){if(typeof item.removeFromMapPanel==="function"){item.removeFromMapPanel(this);}
GeoExt.MapPanel.superclass.remove.apply(this,arguments);},beforeDestroy:function(){if(this.ownerCt){this.ownerCt.un("move",this.updateMapSize,this);}
if(this.map&&this.map.events){this.map.events.un({"moveend":this.onMoveend,"changelayer":this.onLayerchange,scope:this});}
if(!this.initialConfig.map||!(this.initialConfig.map instanceof OpenLayers.Map)){if(this.map&&this.map.destroy){this.map.destroy();}}
delete this.map;GeoExt.MapPanel.superclass.beforeDestroy.apply(this,arguments);}});GeoExt.MapPanel.guess=function(){return Ext.ComponentMgr.all.find(function(o){return o instanceof GeoExt.MapPanel;});};Ext.reg('gx_mappanel',GeoExt.MapPanel);
Ext.namespace('GeoExt');GeoExt.LegendPanel=Ext.extend(Ext.Panel,{dynamic:true,layerStore:null,preferredTypes:null,filter:function(record){return true;},initComponent:function(){GeoExt.LegendPanel.superclass.initComponent.call(this);},onRender:function(){GeoExt.LegendPanel.superclass.onRender.apply(this,arguments);if(!this.layerStore){this.layerStore=GeoExt.MapPanel.guess().layers;}
this.layerStore.each(function(record){this.addLegend(record);},this);if(this.dynamic){this.layerStore.on({"add":this.onStoreAdd,"remove":this.onStoreRemove,"clear":this.onStoreClear,scope:this});}},recordIndexToPanelIndex:function(index){var store=this.layerStore;var count=store.getCount();var panelIndex=-1;var legendCount=this.items?this.items.length:0;var record,layer;for(var i=count-1;i>=0;--i){record=store.getAt(i);layer=record.getLayer();var types=GeoExt.LayerLegend.getTypes(record);if(layer.displayInLayerSwitcher&&types.length>0&&(store.getAt(i).get("hideInLegend")!==true)){++panelIndex;if(index===i||panelIndex>legendCount-1){break;}}}
return panelIndex;},getIdForLayer:function(layer){return this.id+"-"+layer.id;},onStoreAdd:function(store,records,index){var panelIndex=this.recordIndexToPanelIndex(index+records.length-1);for(var i=0,len=records.length;i<len;i++){this.addLegend(records[i],panelIndex);}
this.doLayout();},onStoreRemove:function(store,record,index){this.removeLegend(record);},removeLegend:function(record){if(this.items){var legend=this.getComponent(this.getIdForLayer(record.getLayer()));if(legend){this.remove(legend,true);this.doLayout();}}},onStoreClear:function(store){this.removeAllLegends();},removeAllLegends:function(){this.removeAll(true);this.doLayout();},addLegend:function(record,index){if(this.filter(record)===true){var layer=record.getLayer();index=index||0;var legend;var types=GeoExt.LayerLegend.getTypes(record,this.preferredTypes);if(layer.displayInLayerSwitcher&&!record.get('hideInLegend')&&types.length>0){this.insert(index,{xtype:types[0],id:this.getIdForLayer(layer),layerRecord:record,hidden:!((!layer.map&&layer.visibility)||(layer.getVisibility()&&layer.calculateInRange()))});}}},onDestroy:function(){if(this.layerStore){this.layerStore.un("add",this.onStoreAdd,this);this.layerStore.un("remove",this.onStoreRemove,this);this.layerStore.un("clear",this.onStoreClear,this);}
GeoExt.LegendPanel.superclass.onDestroy.apply(this,arguments);}});Ext.reg('gx_legendpanel',GeoExt.LegendPanel);
Ext.namespace("GeoExt","GeoExt.data");GeoExt.data.LayerReader=function(meta,recordType){meta=meta||{};if(!(recordType instanceof Function)){recordType=GeoExt.data.LayerRecord.create(recordType||meta.fields||{});}
GeoExt.data.LayerReader.superclass.constructor.call(this,meta,recordType);};Ext.extend(GeoExt.data.LayerReader,Ext.data.DataReader,{totalRecords:null,readRecords:function(layers){var records=[];if(layers){var recordType=this.recordType,fields=recordType.prototype.fields;var i,lenI,j,lenJ,layer,values,field,v;for(i=0,lenI=layers.length;i<lenI;i++){layer=layers[i];values={};for(j=0,lenJ=fields.length;j<lenJ;j++){field=fields.items[j];v=layer[field.mapping||field.name]||field.defaultValue;v=field.convert(v);values[field.name]=v;}
values.layer=layer;records[records.length]=new recordType(values,layer.id);}}
return{records:records,totalRecords:this.totalRecords!=null?this.totalRecords:records.length};}});
Ext.namespace("GeoExt.data");GeoExt.data.LayerRecord=Ext.data.Record.create([{name:"layer"},{name:"title",type:"string",mapping:"name"}]);GeoExt.data.LayerRecord.prototype.getLayer=function(){return this.get("layer");};GeoExt.data.LayerRecord.prototype.setLayer=function(layer){if(layer!==this.data.layer){this.dirty=true;if(!this.modified){this.modified={};}
if(this.modified.layer===undefined){this.modified.layer=this.data.layer;}
this.data.layer=layer;if(!this.editing){this.afterEdit();}}};GeoExt.data.LayerRecord.prototype.clone=function(id){var layer=this.getLayer()&&this.getLayer().clone();return new this.constructor(Ext.applyIf({layer:layer},this.data),id||layer.id);};GeoExt.data.LayerRecord.create=function(o){var f=Ext.extend(GeoExt.data.LayerRecord,{});var p=f.prototype;p.fields=new Ext.util.MixedCollection(false,function(field){return field.name;});GeoExt.data.LayerRecord.prototype.fields.each(function(f){p.fields.add(f);});if(o){for(var i=0,len=o.length;i<len;i++){p.fields.add(new Ext.data.Field(o[i]));}}
f.getField=function(name){return p.fields.get(name);};return f;};
Ext.namespace("GeoExt.data");GeoExt.data.LayerStoreMixin=function(){return{map:null,reader:null,constructor:function(config){config=config||{};config.reader=config.reader||new GeoExt.data.LayerReader({},config.fields);delete config.fields;var map=config.map instanceof GeoExt.MapPanel?config.map.map:config.map;delete config.map;if(config.layers){config.data=config.layers;}
delete config.layers;var options={initDir:config.initDir};delete config.initDir;arguments.callee.superclass.constructor.call(this,config);if(map){this.bind(map,options);}},bind:function(map,options){if(this.map){return;}
this.map=map;options=options||{};var initDir=options.initDir;if(options.initDir==undefined){initDir=GeoExt.data.LayerStore.MAP_TO_STORE|GeoExt.data.LayerStore.STORE_TO_MAP;}
var layers=map.layers.slice(0);if(initDir&GeoExt.data.LayerStore.STORE_TO_MAP){this.each(function(record){this.map.addLayer(record.getLayer());},this);}
if(initDir&GeoExt.data.LayerStore.MAP_TO_STORE){this.loadData(layers,true);}
map.events.on({"changelayer":this.onChangeLayer,"addlayer":this.onAddLayer,"removelayer":this.onRemoveLayer,scope:this});this.on({"load":this.onLoad,"clear":this.onClear,"add":this.onAdd,"remove":this.onRemove,"update":this.onUpdate,scope:this});this.data.on({"replace":this.onReplace,scope:this});},unbind:function(){if(this.map){this.map.events.un({"changelayer":this.onChangeLayer,"addlayer":this.onAddLayer,"removelayer":this.onRemoveLayer,scope:this});this.un("load",this.onLoad,this);this.un("clear",this.onClear,this);this.un("add",this.onAdd,this);this.un("remove",this.onRemove,this);this.data.un("replace",this.onReplace,this);this.map=null;}},onChangeLayer:function(evt){var layer=evt.layer;var recordIndex=this.findBy(function(rec,id){return rec.getLayer()===layer;});if(recordIndex>-1){var record=this.getAt(recordIndex);if(evt.property==="order"){if(!this._adding&&!this._removing){var layerIndex=this.map.getLayerIndex(layer);if(layerIndex!==recordIndex){this._removing=true;this.remove(record);delete this._removing;this._adding=true;this.insert(layerIndex,[record]);delete this._adding;}}}else if(evt.property==="name"){record.set("title",layer.name);}else{this.fireEvent("update",this,record,Ext.data.Record.EDIT);}}},onAddLayer:function(evt){if(!this._adding){var layer=evt.layer;this._adding=true;this.loadData([layer],true);delete this._adding;}},onRemoveLayer:function(evt){if(this.map.unloadDestroy){if(!this._removing){var layer=evt.layer;this._removing=true;this.remove(this.getById(layer.id));delete this._removing;}}else{this.unbind();}},onLoad:function(store,records,options){if(!Ext.isArray(records)){records=[records];}
if(options&&!options.add){this._removing=true;for(var i=this.map.layers.length-1;i>=0;i--){this.map.removeLayer(this.map.layers[i]);}
delete this._removing;var len=records.length;if(len>0){var layers=new Array(len);for(var j=0;j<len;j++){layers[j]=records[j].getLayer();}
this._adding=true;this.map.addLayers(layers);delete this._adding;}}},onClear:function(store){this._removing=true;for(var i=this.map.layers.length-1;i>=0;i--){this.map.removeLayer(this.map.layers[i]);}
delete this._removing;},onAdd:function(store,records,index){if(!this._adding){this._adding=true;var layer;for(var i=records.length-1;i>=0;--i){layer=records[i].getLayer();this.map.addLayer(layer);if(index!==this.map.layers.length-1){this.map.setLayerIndex(layer,index);}}
delete this._adding;}},onRemove:function(store,record,index){if(!this._removing){var layer=record.getLayer();if(this.map.getLayer(layer.id)!=null){this._removing=true;this.removeMapLayer(record);delete this._removing;}}},onUpdate:function(store,record,operation){if(operation===Ext.data.Record.EDIT){if(record.modified&&record.modified.title){var layer=record.getLayer();var title=record.get("title");if(title!==layer.name){layer.setName(title);}}}},removeMapLayer:function(record){this.map.removeLayer(record.getLayer());},onReplace:function(key,oldRecord,newRecord){this.removeMapLayer(oldRecord);},getByLayer:function(layer){var index=this.findBy(function(r){return r.getLayer()===layer;});if(index>-1){return this.getAt(index);}},destroy:function(){this.unbind();GeoExt.data.LayerStore.superclass.destroy.call(this);}};};GeoExt.data.LayerStore=Ext.extend(Ext.data.Store,new GeoExt.data.LayerStoreMixin);GeoExt.data.LayerStore.MAP_TO_STORE=1;GeoExt.data.LayerStore.STORE_TO_MAP=2;