/*! banana-fusion - v1.6.14 - 2016-11-30
 * https://github.com/LucidWorks/banana/wiki
 * Copyright (c) 2016 Andrew Thanalertvisuti; Licensed Apache License */

define("panels/multiseries/module",["angular","app","underscore","jquery","d3"],function(a,b,c,d,e){"use strict";var f=a.module("kibana.panels.multiseries",[]);b.useModule(f),f.controller("multiseries",["$scope","$timeout","timer","dashboard","querySrv","filterSrv",function(b,d,e,f,g,h){b.panelMeta={modals:[{description:"Inspect",icon:"icon-info-sign",partial:"app/partials/inspector.html",show:b.panel.spyable}],editorTabs:[{title:"Queries",src:"app/partials/querySelect.html"}],status:"Experimental",description:"Multiseries chart panel currently support only plotting data of the same field type. You have to define which fields to be plotted on Y-axis fields. Data must have X-axis as timestamp and Y-axis must have values, if not it will be discarded."};var i={queries:{mode:"all",ids:[],query:"*:*",custom:""},size:1e3,max_rows:1e4,field:"timestamp",yAxis:"",right_yAxis:"",fl:"",right_fl:"",spyable:!0,show_queries:!0,interpolate:"basis",right_interpolate:"basis",rightYEnabled:!1,showLegend:!0,showRightLegend:!0,refresh:{enable:!1,interval:2}};c.defaults(b.panel,i),b.init=function(){b.panel.refresh.enable&&b.set_timer(b.panel.refresh.interval),b.$on("refresh",function(){b.get_data()}),b.get_data()},b.set_timer=function(a){b.panel.refresh.interval=a,c.isNumber(b.panel.refresh.interval)?(e.cancel(b.refresh_timer),b.realtime()):e.cancel(b.refresh_timer)},b.realtime=function(){b.panel.refresh.enable?(e.cancel(b.refresh_timer),b.refresh_timer=e.register(d(function(){b.realtime(),b.get_data()},1e3*b.panel.refresh.interval))):e.cancel(b.refresh_timer)},b.get_data=function(){delete b.panel.error,b.panelMeta.loading=!0,b.sjs.client.server(f.current.solr.server+f.current.solr.core_name);var a=b.sjs.Request(),d="";h.getSolrFq()&&(d="&"+h.getSolrFq());var e="&wt=json",i="&fl="+b.panel.field+","+b.panel.fl;b.panel.right_fl&&(i+=","+b.panel.right_fl);var j="&rows="+b.panel.max_rows,k="&sort="+b.panel.field+" asc";b.panel.queries.query=g.getORquery()+d+i+e+j+k,a=null!=b.panel.queries.custom?a.setQuery(b.panel.queries.query+b.panel.queries.custom):a.setQuery(b.panel.queries.query);var l=a.doSearch();l.then(function(a){return c.isUndefined(a.error)?(b.panelMeta.loading=!1,b.data=[],c.isUndefined(a.error)?(b.data=a.response.docs,void b.render()):(b.panel.error=b.parse_error(a.error.msg),void b.render())):void(b.panel.error=b.parse_error(a.error.msg))}),b.panelMeta.loading=!1},b.set_refresh=function(a){b.refresh=a},b.close_edit=function(){b.panel.refresh.enable&&b.set_timer(b.panel.refresh.interval),b.refresh&&b.get_data(),b.refresh=!1,b.$emit("render")},b.render=function(){b.$emit("render")},b.populate_modal=function(c){b.inspector=a.toJson(JSON.parse(c.toString()),!0)},b.pad=function(a){return(10>a?"0":"")+a}}]),f.directive("multiseriesChart",function(){return{restrict:"E",link:function(b,c){function f(){c.html("");var a,f=c[0];if(a=jQuery.extend(!0,[],b.data),-1!==e.keys(a[0]).indexOf(b.panel.field)){var g=d("#multiseries").width(),h=d("#multiseries").parent().parent().parent().parent().height(),i={top:20,right:80,bottom:30,left:50},j=g-i.left-i.right-50,k=h-i.top-i.bottom,l=e.time.format.utc("%Y-%m-%dT%H:%M:%S.%LZ"),m=e.time.format.utc("%Y-%m-%dT%H:%M:%SZ"),n=!1;if(a&&a.length>0){var o=a[0][b.panel.field];n=l.parse(String(o))||m.parse(String(o))}var p;p=n?e.time.scale().range([0,j]):e.scale.linear().range([0,j]);var q=e.scale.linear().range([k,0]),r=e.scale.category10(),s=e.svg.axis().scale(p).orient("bottom"),t=e.svg.axis().scale(q).orient("left"),u=e.svg.line().interpolate(b.panel.interpolate).x(function(a){return p(a.xValue)}).y(function(a){return q(a.yValue)}),v=b.panel.fl.split(",");r.domain(e.keys(a[0]).filter(function(a){return-1!==v.indexOf(a)}));var w,x,y,z;if(b.panel.rightYEnabled){w=e.scale.linear().range([k,0]),x=e.scale.category20b(),y=e.svg.axis().scale(w).orient("right"),z=e.svg.line().interpolate(b.panel.right_interpolate).x(function(a){return p(a.xValue)}).y(function(a){return w(a.yValue)});var A=b.panel.right_fl.split(",");x.domain(e.keys(a[0]).filter(function(a){return-1!==A.indexOf(a)}))}n&&a.forEach(function(a){var c=l.parse(String(a[b.panel.field]));a[b.panel.field]=null!==c?c:m.parse(String(a[b.panel.field]))});var B=r.domain().map(function(c){return{name:c,values:a.map(function(a){return{xValue:a[b.panel.field],yValue:+a[c]}})}});B.forEach(function(a){a.values=a.values.filter(function(a){return!isNaN(a.yValue)})}),p.domain(e.extent(a,function(a){return a[b.panel.field]})),q.domain([e.min(B,function(a){return e.min(a.values,function(a){return a.yValue})}),e.max(B,function(a){return e.max(a.values,function(a){return a.yValue})})]);var C;b.panel.rightYEnabled&&(C=x.domain().map(function(c){return{name:c,values:a.map(function(a){return{xValue:a[b.panel.field],yValue:+a[c]}})}}),w.domain([e.min(C,function(a){return e.min(a.values,function(a){return a.yValue})}),e.max(C,function(a){return e.max(a.values,function(a){return a.yValue})})]));var D=e.select(f).append("svg").attr("width",j+i.left+i.right).attr("height",k+i.top+i.bottom).attr("viewBox","0 0 "+g+" "+h).attr("preserveAspectRatio","xMidYMid").append("g").attr("transform","translate("+i.left+","+i.top+")");D.append("g").attr("class","x axis").attr("transform","translate(0,"+k+")").call(s),D.append("g").attr("class","y axis").call(t).append("text").attr("transform","rotate(-90)").attr("y",6).attr("dy",".71em").style("text-anchor","end").text(b.panel.yAxis);var E=D.selectAll(".yfield").data(B).enter().append("g").attr("class","yfield");E.append("path").attr("class","line").attr("d",function(a){return u(a.values)}).style("stroke",function(a){return r(a.name)}).style("fill","transparent");var F;if(b.panel.rightYEnabled&&(D.append("g").attr("class","y axis").attr("transform","translate("+j+" ,0)").style("fill","blue").call(y).append("text").attr("transform","rotate(-90)").attr("y",6).attr("dy","-1.2em").style("text-anchor","end").text(b.panel.right_yAxis),F=D.selectAll(".yfield_right").data(C).enter().append("g").attr("class","yfield_right"),F.append("path").attr("class","line").attr("d",function(a){return z(a.values)}).style("stroke",function(a){return x(a.name)}).style("fill","transparent")),b.panel.showLegend){var G=D.append("g").attr("class","legend").attr("height",100).attr("width",150).attr("transform","translate(30,40)");G.selectAll("rect").data(B).enter().append("rect").attr("x",j+50).attr("y",function(a,b){return 20*b}).attr("width",10).attr("height",10).style("fill",function(a){return r(a.name)}),G.selectAll("text").data(B).enter().append("text").attr("x",j+65).attr("y",function(a,b){return 20*b+9}).text(function(a){return a.name})}if(b.panel.rightYEnabled&&b.panel.showRightLegend){var H=D.append("g").attr("class","legend").attr("height",100).attr("width",150).attr("transform","translate(30,150)");H.selectAll("rect").data(C).enter().append("rect").attr("x",j+50).attr("y",function(a,b){return 20*b}).attr("width",10).attr("height",10).style("fill",function(a){return x(a.name)}),H.selectAll("text").data(C).enter().append("text").attr("x",j+65).attr("y",function(a,b){return 20*b+9}).text(function(a){return a.name})}}}b.$on("render",function(){f()}),a.element(window).bind("resize",function(){f()}),f()}}})});