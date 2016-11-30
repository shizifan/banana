/*! banana-fusion - v1.6.14 - 2016-11-30
 * https://github.com/LucidWorks/banana/wiki
 * Copyright (c) 2016 Andrew Thanalertvisuti; Licensed Apache License */

define("panels/rangeFacet/interval",["kbn"],function(a){"use strict";function b(b){this.string=b;var c=a.describe_interval(b);this.type=c.type,this.ms=1e3*c.sec*c.count,"y"===this.type||"M"===this.type?(this.get=this.get_complex,this.date=new Date(0)):this.get=this.get_simple}return b.prototype={toString:function(){return this.string},after:function(a){return this.get(a,1)},before:function(a){return this.get(a,-1)},get_complex:function(a,b){switch(this.date.setTime(a),this.type){case"M":this.date.setUTCMonth(this.date.getUTCMonth()+b);break;case"y":this.date.setUTCFullYear(this.date.getUTCFullYear()+b)}return this.date.getTime()},get_simple:function(a,b){return a+b*this.ms}},b}),define("panels/rangeFacet/timeSeries",["underscore","./interval"],function(a,b){"use strict";function c(a){return parseFloat(a)}function d(a){return 1e3*Math.floor(a.getTime()/1e3)}var e={};return e.ZeroFilled=function(d){d=a.defaults(d,{interval:"10m",start_date:null,end_date:null,fill_style:"minimal"}),this.interval=new b(d.interval),this._data={},this.start_value=d.start_date&&c(d.start_date),this.end_value=d.end_date&&c(d.end_date),this.opts=d},e.ZeroFilled.prototype.addValue=function(b,e){b=b instanceof Date?d(b):c(b),isNaN(b)||(this._data[b]=a.isUndefined(e)?0:e),this._cached_times=null},e.ZeroFilled.prototype.getOrderedTimes=function(b){var d=a.map(a.keys(this._data),c);return a.isArray(b)&&(d=d.concat(b)),a.uniq(d.sort(function(a,b){return a-b}),!0)},e.ZeroFilled.prototype.getFlotPairs=function(b){var c,d,e=this.getOrderedTimes(b);return c="all"===this.opts.fill_style?this._getAllFlotPairs:this._getMinFlotPairs,d=a.reduce(e,c,[],this),this.start_value&&(0===d.length||d[0][0]>this.start_value)&&d.unshift([this.start_value,null]),this.end_value&&(0===d.length||d[d.length-1][0]<this.end_value)&&d.push([this.end_value,null]),d},e.ZeroFilled.prototype._getMinFlotPairs=function(a,b,c,d){var e,f,g,h;return c>0&&(g=d[c-1],h=this.interval.before(b),h>g&&a.push([h,0])),a.push([b,this._data[b]||0]),d.length>c&&(e=d[c+1],f=this.interval.after(b),e>f&&a.push([f,0])),a},e.ZeroFilled.prototype._getAllFlotPairs=function(a,b,c,d){var e,f;for(a.push([d[c],this._data[d[c]]||0]),e=d[c+1],f=this.interval.after(b);d.length>c&&e>f;f=this.interval.after(f))a.push([f,0]);return a},e}),define("panels/rangeFacet/module",["angular","app","jquery","underscore","kbn","moment","./timeSeries"],function(a,b,c,d,e,f,g){"use strict";var h=a.module("kibana.panels.rangeFacet",[]);b.useModule(h),h.controller("rangeFacet",["$scope","$q","$timeout","timer","querySrv","dashboard","filterSrv",function(b,c,e,f,h,i,j){b.panelMeta={modals:[{description:"Inspect",icon:"icon-info-sign",partial:"app/partials/inspector.html",show:b.panel.spyable}],editorTabs:[{title:"Queries",src:"app/partials/querySelect.html"}],status:"Beta",description:"Histogram view across any numeric field using Solr’s range.facet functionality. Works similar to the time series histogram, allowing selection of ranges, and zooming in/out to the desired numeric range. Range selections in panel are reflected across the entire dashboard."};var k={mode:"count",time_field:"timestamp",queries:{mode:"all",ids:[],query:"*:*",custom:""},max_rows:1e5,value_field:null,fill:0,linewidth:3,auto_int:!0,resolution:100,interval:"10",interval_decimal:1,resolutions:[5,10,25,50,75,100],spyable:!0,zoomlinks:!0,bars:!0,stack:!0,points:!1,lines:!1,lines_smooth:!1,legend:!0,"x-axis":!0,"y-axis":!0,percentage:!1,interactive:!0,options:!0,minimum:0,maximum:1e3,chart_minimum:0,chart_maximum:1e3,tooltip:{value_type:"cumulative",query_as_alias:!1},showChart:!0,show_queries:!0,refresh:{enable:!1,interval:2}};d.defaults(b.panel,k),b.init=function(){b.options=!1,b.panel.refresh.enable&&b.set_timer(b.panel.refresh.interval),b.$on("refresh",function(){b.get_data(),j.idsByTypeAndField("range",b.panel.range_field).length>0?b.panel.showChart=!0:b.panel.showChart=!1}),b.set_configurations(b.panel.minimum,b.panel.maximum),b.get_data()},b.set_timer=function(a){b.panel.refresh.interval=a,d.isNumber(b.panel.refresh.interval)?(f.cancel(b.refresh_timer),b.realtime()):f.cancel(b.refresh_timer)},b.realtime=function(){b.panel.refresh.enable?(f.cancel(b.refresh_timer),b.refresh_timer=f.register(e(function(){b.realtime(),b.get_data()},1e3*b.panel.refresh.interval))):f.cancel(b.refresh_timer)},b.set_precision=function(a){b.panel.resolution=a},b.set_interval=function(a){"auto"!==a?(b.panel.auto_int=!1,b.panel.interval=a):b.panel.auto_int=!0},b.calculate_tick_value=function(a){return a>=1?1:a},b.calculate_tick_decimals=function(a){return a>=1?0:1},b.interval_label=function(a){return a},b.get_facet_range=function(){return j.facetRange(b.panel.range_field)},b.get_interval=function(){var a,c=b.panel.interval;return b.panel.auto_int&&(a=b.get_facet_range(),a&&(c=b.calculate_gap(a.from,a.to,b.panel.resolution,0))),b.panel.interval=c||"10",b.panel.interval},b.set_range_filter=function(a,c){j.removeByTypeAndField("range",b.panel.range_field),j.set({type:"range",from:parseFloat(a).toFixed(b.panel.interval_decimal),to:parseFloat(c).toFixed(b.panel.interval_decimal),field:b.panel.range_field}),i.refresh()},b.set_configurations=function(a,c){b.panel.chart_minimum=parseFloat(a).toFixed(b.panel.interval_decimal),b.panel.chart_maximum=parseFloat(c).toFixed(b.panel.interval_decimal)},b.range_apply=function(){j.set({type:"range",from:parseFloat(b.panel.minimum),to:parseFloat(b.panel.maximum),field:b.panel.range_field}),b.set_configurations(b.panel.minimum,b.panel.maximum),i.refresh()},b.calculate_gap=function(a,c,d,e){if(0!==e)return e;var f=(c-a)/d;if(f>1)return b.round_gap(f);var g=f.toFixed(b.panel.interval_decimal);return 0>=g?1:g},b.round_gap=function(a){return Math.round(a)+1},b.get_data=function(a,e){if(b.panelMeta.loading=!0,d.isUndefined(a)&&(a=0),delete b.panel.error,0!==i.indices.length){var f=b.get_facet_range();b.panel.auto_int&&(b.panel.interval=b.calculate_gap(f.from,f.to,b.panel.resolution,0));var k=b.panel.interval.toString().split(".");k.length>1?b.panel.interval_decimal=k[1].length:b.panel.interval_decimal=0,b.sjs.client.server(i.current.solr.server+i.current.solr.core_name);var l=b.sjs.Request().indices(i.indices[a]);b.panel.queries.ids=h.idsByMode(b.panel.queries),d.each(b.panel.queries.ids,function(a){var c=b.sjs.FilteredQuery(h.getEjsObj(a),j.getBoolFilter(j.ids)),e=b.sjs.DateHistogramFacet(a);if("count"===b.panel.mode)e=e.field(b.panel.time_field);else{if(d.isNull(b.panel.value_field))return void(b.panel.error="In "+b.panel.mode+" mode a field must be specified");e=e.keyField(b.panel.time_field).valueField(b.panel.value_field)}e=e.facetFilter(b.sjs.QueryFilter(c)),l=l.facet(e).size(0)}),b.populate_modal(l);var m="";j.getSolrFq()&&(m="&"+j.getSolrFq());var n="&wt=json",o="&rows=0",p="&facet=true&facet.range="+b.panel.range_field+"&facet.range.start="+parseFloat(b.panel.chart_minimum)+"&facet.range.end="+(parseFloat(b.panel.chart_maximum)+b.calculate_tick_value(parseFloat(b.panel.interval)))+"&facet.range.gap="+b.panel.interval,q=[];b.panel.queries.query="",d.each(b.panel.queries.ids,function(a){var c=h.getQuery(a)+n+o+m+p;b.panel.queries.query+=c+"\n",l=null!==b.panel.queries.custom?l.setQuery(c+b.panel.queries.custom):l.setQuery(c),q.push(l.doSearch())}),c.all(q).then(function(c){var f=b.get_facet_range();b.panelMeta.loading=!1,0===a&&(b.hits=0,b.data=[],e=b.query_id=(new Date).getTime());var i,j,k=0;d.each(b.panel.queries.ids,function(e,l){if(!d.isUndefined(c[l].error))return void(b.panel.error=b.parse_error(c[l].error.msg));d.isUndefined(b.data[k])||0===a?(i=new g.ZeroFilled({start_date:f&&f.from,end_date:f&&f.to,fill_style:"minimal"}),j=0):(i=b.data[k].numeric_series,j=0,b.hits=0),b.range_count=0;for(var m=c[l].facet_counts.facet_ranges[b.panel.range_field].counts,n=0;n<m.length;n++){var o=parseFloat(m[n]).toFixed(b.panel.interval_decimal);n++;var p=m[n];i.addValue(o,p),j+=p,b.hits+=p,b.range_count+=1}b.data[k]={info:h.list[e],numeric_series:i,hits:j},k++}),b.$emit("render")})}},b.zoom=function(a){var c=j.facetRange(b.panel.range_field)[1];d.isUndefined(c)&&(c={from:b.panel.chart_minimum,to:b.panel.chart_maximum});var e=c.to.valueOf()-c.from.valueOf(),f=c.to.valueOf()-e/2,g=f+e*a/2,h=f-e*a/2;b.set_range_filter(h,g),b.set_configurations(h,g),i.refresh()},b.populate_modal=function(c){b.inspector=a.toJson(JSON.parse(c.toString()),!0)},b.set_refresh=function(a){b.refresh=a},b.close_edit=function(){b.panel.refresh.enable&&b.set_timer(b.panel.refresh.interval),b.refresh&&b.get_data(),b.set_range_filter(b.panel.minimum,b.panel.maximum),b.set_configurations(b.panel.minimum,b.panel.maximum),b.refresh=!1,b.$emit("render")},b.render=function(){b.$emit("render")}}]),h.directive("rangefacetChart",["dashboard",function(b){return{restrict:"A",template:"<div></div>",link:function(f,g){function h(){g.css({height:f.panel.height||f.row.height});try{d.each(f.data,function(a){a.label=a.info.alias,a.color=a.info.color})}catch(a){return}var b=f.panel.chart_maximum-f.panel.chart_minimum,e=f.panel.stack?!0:null,h=f.get_facet_range();try{var i={legend:{show:!1},series:{stackpercent:f.panel.stack?f.panel.percentage:!1,stack:f.panel.percentage?null:e,lines:{show:f.panel.lines,fill:0===f.panel.fill?.001:f.panel.fill/10,lineWidth:f.panel.linewidth,steps:!1},bars:{show:f.panel.bars,fill:1,barWidth:b/(1.8*f.range_count),zero:!1,lineWidth:0},points:{show:f.panel.points,fill:1,fillColor:!1,radius:5},shadowSize:1},axisLabels:{show:!0},yaxis:{show:f.panel["y-axis"],min:0,max:f.panel.percentage&&f.panel.stack?100:null,axisLabel:"count"},xaxis:{show:f.panel["x-axis"],min:parseFloat(h.from)-f.calculate_tick_value(parseFloat(f.panel.interval)),max:parseFloat(h.to)+f.calculate_tick_value(parseFloat(f.panel.interval)),autoscaleMargin:f.panel.interval,minTickSize:f.panel.interval,tickDecimals:f.calculate_tick_decimals(f.panel.interval),axisLabel:f.panel.range_field},grid:{backgroundColor:null,borderWidth:0,hoverable:!0,color:"#c8c8c8"}};f.panel.interactive&&(i.selection={mode:"x",color:"#666"});var j=[];f.data.length>1&&(j=Array.prototype.concat.apply([],d.map(f.data,function(a){return a.numeric_series.getOrderedTimes()})),j=d.uniq(j.sort(function(a,b){return a-b}),!0));for(var k=0;k<f.data.length;k++)f.data[k].data=f.data[k].numeric_series.getFlotPairs(j);if(f.panel.lines_smooth)for(var l=0;l<f.data.length;l++){for(var m=[],n=0;n<f.data[l].data.length;n++)0!==f.data[l].data[n][1]&&m.push(f.data[l].data[n]);f.data[l].data=m}f.plot=c.plot(g,f.data,i)}catch(a){console.log(a)}}f.$on("render",function(){h()}),f.set_range_filter(f.panel.chart_minimum,f.panel.chart_maximum),a.element(window).bind("resize",function(){h()});var i=c("<div>");g.bind("plothover",function(a,c,d){var g,h;d?(g=d.series.info.alias||f.panel.tooltip.query_as_alias?'<small style="font-size:0.9em;"><i class="icon-circle" style="color:'+d.series.color+';"></i> '+(d.series.info.alias||d.series.info.query)+"</small><br>":e.query_color_dot(d.series.color,15)+" ",h=f.panel.stack&&"individual"===f.panel.tooltip.value_type?d.datapoint[1]-d.datapoint[2]:d.datapoint[1],i.html(g+b.numberWithCommas(h)+" ["+d.datapoint[0].toFixed(f.panel.interval_decimal)+" - "+(d.datapoint[0]+parseFloat(f.panel.interval)).toFixed(f.panel.interval_decimal)+"]").place_tt(c.pageX,c.pageY)):i.detach()}),g.bind("plotselected",function(a,c){f.set_range_filter(c.xaxis.from,c.xaxis.to),f.set_configurations(c.xaxis.from,c.xaxis.to),b.refresh()})}}}])});