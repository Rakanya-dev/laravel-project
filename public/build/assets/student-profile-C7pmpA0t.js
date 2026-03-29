import{R as g,k as ue,a as fe,u as he,j as r,H as ge,L as be}from"./app-D8Yj4w9f.js";import{b as M,B as xe}from"./button-6SXQYyyh.js";import{A as ye}from"./app-layout-BL2a40bi.js";import{f as L,b as H}from"./date-CjGDCdcv.js";import{t as ve}from"./index-1psDGE8K.js";import{A as je}from"./arrow-left-DvG-Vi_o.js";import{P as we}from"./printer-BXZy_hix.js";import{A as Pe}from"./award-BxMLwe4A.js";import{S as Ne}from"./school-hrLVohQ_.js";import{f as _,p as k,i as T,X as Ae,L as G,A as Oe,d as I,e as Se,k as _e,G as De,g as Q,Z as Ee,a as ee,r as Re,s as $e,R as ke,v as Ce}from"./generateCategoricalChart-CtXpCjt1.js";import{b as ze,P as ie,a as oe}from"./PolarAngleAxis-390WL84J.js";import{F as V}from"./file-text-D4AGozT5.js";import{C as Le}from"./calendar-Daelh0IN.js";/* empty css            */import"./index-4GtlB9as.js";import"./index-GC2lUQB8.js";import"./app-logo-icon-yG8Bxv_k.js";var Te=["cx","cy","innerRadius","outerRadius","gridType","radialLines"];function C(t){"@babel/helpers - typeof";return C=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(e){return typeof e}:function(e){return e&&typeof Symbol=="function"&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},C(t)}function Ie(t,e){if(t==null)return{};var n=Me(t,e),a,s;if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(s=0;s<i.length;s++)a=i[s],!(e.indexOf(a)>=0)&&Object.prototype.propertyIsEnumerable.call(t,a)&&(n[a]=t[a])}return n}function Me(t,e){if(t==null)return{};var n={};for(var a in t)if(Object.prototype.hasOwnProperty.call(t,a)){if(e.indexOf(a)>=0)continue;n[a]=t[a]}return n}function A(){return A=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(t[a]=n[a])}return t},A.apply(this,arguments)}function te(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(t);e&&(a=a.filter(function(s){return Object.getOwnPropertyDescriptor(t,s).enumerable})),n.push.apply(n,a)}return n}function z(t){for(var e=1;e<arguments.length;e++){var n=arguments[e]!=null?arguments[e]:{};e%2?te(Object(n),!0).forEach(function(a){Fe(t,a,n[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):te(Object(n)).forEach(function(a){Object.defineProperty(t,a,Object.getOwnPropertyDescriptor(n,a))})}return t}function Fe(t,e,n){return e=We(e),e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function We(t){var e=Ke(t,"string");return C(e)=="symbol"?e:e+""}function Ke(t,e){if(C(t)!="object"||!t)return t;var n=t[Symbol.toPrimitive];if(n!==void 0){var a=n.call(t,e);if(C(a)!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return(e==="string"?String:Number)(t)}var Be=function(e,n,a,s){var i="";return s.forEach(function(o,l){var p=k(n,a,e,o);l?i+="L ".concat(p.x,",").concat(p.y):i+="M ".concat(p.x,",").concat(p.y)}),i+="Z",i},He=function(e){var n=e.cx,a=e.cy,s=e.innerRadius,i=e.outerRadius,o=e.polarAngles,l=e.radialLines;if(!o||!o.length||!l)return null;var p=z({stroke:"#ccc"},_(e,!1));return g.createElement("g",{className:"recharts-polar-grid-angle"},o.map(function(u){var c=k(n,a,s,u),d=k(n,a,i,u);return g.createElement("line",A({},p,{key:"line-".concat(u),x1:c.x,y1:c.y,x2:d.x,y2:d.y}))}))},Ge=function(e){var n=e.cx,a=e.cy,s=e.radius,i=e.index,o=z(z({stroke:"#ccc"},_(e,!1)),{},{fill:"none"});return g.createElement("circle",A({},o,{className:M("recharts-polar-grid-concentric-circle",e.className),key:"circle-".concat(i),cx:n,cy:a,r:s}))},Ve=function(e){var n=e.radius,a=e.index,s=z(z({stroke:"#ccc"},_(e,!1)),{},{fill:"none"});return g.createElement("path",A({},s,{className:M("recharts-polar-grid-concentric-polygon",e.className),key:"path-".concat(a),d:Be(n,e.cx,e.cy,e.polarAngles)}))},Ue=function(e){var n=e.polarRadius,a=e.gridType;return!n||!n.length?null:g.createElement("g",{className:"recharts-polar-grid-concentric"},n.map(function(s,i){var o=i;return a==="circle"?g.createElement(Ge,A({key:o},e,{radius:s,index:i})):g.createElement(Ve,A({key:o},e,{radius:s,index:i}))}))},le=function(e){var n=e.cx,a=n===void 0?0:n,s=e.cy,i=s===void 0?0:s,o=e.innerRadius,l=o===void 0?0:o,p=e.outerRadius,u=p===void 0?0:p,c=e.gridType,d=c===void 0?"polygon":c,m=e.radialLines,f=m===void 0?!0:m,y=Ie(e,Te);return u<=0?null:g.createElement("g",{className:"recharts-polar-grid"},g.createElement(He,A({cx:a,cy:i,innerRadius:l,outerRadius:u,gridType:d,radialLines:f},y)),g.createElement(Ue,A({cx:a,cy:i,innerRadius:l,outerRadius:u,gridType:d,radialLines:f},y)))};le.displayName="PolarGrid";var U,ae;function qe(){if(ae)return U;ae=1;function t(e){return e&&e.length?e[0]:void 0}return U=t,U}var q,ne;function Ye(){return ne||(ne=1,q=qe()),q}var Xe=Ye();const Ze=ue(Xe);var Je=["key"];function D(t){"@babel/helpers - typeof";return D=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(e){return typeof e}:function(e){return e&&typeof Symbol=="function"&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},D(t)}function Qe(t,e){if(t==null)return{};var n=et(t,e),a,s;if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(s=0;s<i.length;s++)a=i[s],!(e.indexOf(a)>=0)&&Object.prototype.propertyIsEnumerable.call(t,a)&&(n[a]=t[a])}return n}function et(t,e){if(t==null)return{};var n={};for(var a in t)if(Object.prototype.hasOwnProperty.call(t,a)){if(e.indexOf(a)>=0)continue;n[a]=t[a]}return n}function F(){return F=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(t[a]=n[a])}return t},F.apply(this,arguments)}function re(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(t);e&&(a=a.filter(function(s){return Object.getOwnPropertyDescriptor(t,s).enumerable})),n.push.apply(n,a)}return n}function v(t){for(var e=1;e<arguments.length;e++){var n=arguments[e]!=null?arguments[e]:{};e%2?re(Object(n),!0).forEach(function(a){N(t,a,n[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):re(Object(n)).forEach(function(a){Object.defineProperty(t,a,Object.getOwnPropertyDescriptor(n,a))})}return t}function tt(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function se(t,e){for(var n=0;n<e.length;n++){var a=e[n];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(t,de(a.key),a)}}function at(t,e,n){return e&&se(t.prototype,e),n&&se(t,n),Object.defineProperty(t,"prototype",{writable:!1}),t}function nt(t,e,n){return e=W(e),rt(t,ce()?Reflect.construct(e,n||[],W(t).constructor):e.apply(t,n))}function rt(t,e){if(e&&(D(e)==="object"||typeof e=="function"))return e;if(e!==void 0)throw new TypeError("Derived constructors may only return object or undefined");return st(t)}function st(t){if(t===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function ce(){try{var t=!Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}))}catch{}return(ce=function(){return!!t})()}function W(t){return W=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(n){return n.__proto__||Object.getPrototypeOf(n)},W(t)}function it(t,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),e&&X(t,e)}function X(t,e){return X=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(a,s){return a.__proto__=s,a},X(t,e)}function N(t,e,n){return e=de(e),e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function de(t){var e=ot(t,"string");return D(e)=="symbol"?e:e+""}function ot(t,e){if(D(t)!="object"||!t)return t;var n=t[Symbol.toPrimitive];if(n!==void 0){var a=n.call(t,e);if(D(a)!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}var S=(function(t){function e(){var n;tt(this,e);for(var a=arguments.length,s=new Array(a),i=0;i<a;i++)s[i]=arguments[i];return n=nt(this,e,[].concat(s)),N(n,"state",{isAnimationFinished:!1}),N(n,"handleAnimationEnd",function(){var o=n.props.onAnimationEnd;n.setState({isAnimationFinished:!0}),T(o)&&o()}),N(n,"handleAnimationStart",function(){var o=n.props.onAnimationStart;n.setState({isAnimationFinished:!1}),T(o)&&o()}),N(n,"handleMouseEnter",function(o){var l=n.props.onMouseEnter;l&&l(n.props,o)}),N(n,"handleMouseLeave",function(o){var l=n.props.onMouseLeave;l&&l(n.props,o)}),n}return it(e,t),at(e,[{key:"renderDots",value:function(a){var s=this.props,i=s.dot,o=s.dataKey,l=_(this.props,!1),p=_(i,!0),u=a.map(function(c,d){var m=v(v(v({key:"dot-".concat(d),r:3},l),p),{},{dataKey:o,cx:c.x,cy:c.y,index:d,payload:c});return e.renderDotItem(i,m)});return g.createElement(G,{className:"recharts-radar-dots"},u)}},{key:"renderPolygonStatically",value:function(a){var s=this.props,i=s.shape,o=s.dot,l=s.isRange,p=s.baseLinePoints,u=s.connectNulls,c;return g.isValidElement(i)?c=g.cloneElement(i,v(v({},this.props),{},{points:a})):T(i)?c=i(v(v({},this.props),{},{points:a})):c=g.createElement(ze,F({},_(this.props,!0),{onMouseEnter:this.handleMouseEnter,onMouseLeave:this.handleMouseLeave,points:a,baseLinePoints:l?p:null,connectNulls:u})),g.createElement(G,{className:"recharts-radar-polygon"},c,o?this.renderDots(a):null)}},{key:"renderPolygonWithAnimation",value:function(){var a=this,s=this.props,i=s.points,o=s.isAnimationActive,l=s.animationBegin,p=s.animationDuration,u=s.animationEasing,c=s.animationId,d=this.state.prevPoints;return g.createElement(Oe,{begin:l,duration:p,isActive:o,easing:u,from:{t:0},to:{t:1},key:"radar-".concat(c),onAnimationEnd:this.handleAnimationEnd,onAnimationStart:this.handleAnimationStart},function(m){var f=m.t,y=d&&d.length/i.length,x=i.map(function(b,w){var j=d&&d[Math.floor(w*y)];if(j){var h=I(j.x,b.x),P=I(j.y,b.y);return v(v({},b),{},{x:h(f),y:P(f)})}var E=I(b.cx,b.x),O=I(b.cy,b.y);return v(v({},b),{},{x:E(f),y:O(f)})});return a.renderPolygonStatically(x)})}},{key:"renderPolygon",value:function(){var a=this.props,s=a.points,i=a.isAnimationActive,o=a.isRange,l=this.state.prevPoints;return i&&s&&s.length&&!o&&(!l||!Se(l,s))?this.renderPolygonWithAnimation():this.renderPolygonStatically(s)}},{key:"render",value:function(){var a=this.props,s=a.hide,i=a.className,o=a.points,l=a.isAnimationActive;if(s||!o||!o.length)return null;var p=this.state.isAnimationFinished,u=M("recharts-radar",i);return g.createElement(G,{className:u},this.renderPolygon(),(!l||p)&&_e.renderCallByParent(this.props,o))}}],[{key:"getDerivedStateFromProps",value:function(a,s){return a.animationId!==s.prevAnimationId?{prevAnimationId:a.animationId,curPoints:a.points,prevPoints:s.curPoints}:a.points!==s.curPoints?{curPoints:a.points}:null}},{key:"renderDotItem",value:function(a,s){var i;if(g.isValidElement(a))i=g.cloneElement(a,s);else if(T(a))i=a(s);else{var o=s.key,l=Qe(s,Je);i=g.createElement(Ae,F({},l,{key:o,className:M("recharts-radar-dot",typeof a!="boolean"?a.className:"")}))}return i}}])})(fe.PureComponent);N(S,"displayName","Radar");N(S,"defaultProps",{angleAxisId:0,radiusAxisId:0,hide:!1,activeDot:!0,dot:!1,legendType:"rect",isAnimationActive:!De.isSsr,animationBegin:0,animationDuration:1500,animationEasing:"ease"});N(S,"getComposedData",function(t){var e=t.radiusAxis,n=t.angleAxis,a=t.displayedData,s=t.dataKey,i=t.bandSize,o=n.cx,l=n.cy,p=!1,u=[],c=n.type!=="number"?i??0:0;a.forEach(function(m,f){var y=Q(m,n.dataKey,f),x=Q(m,s),b=n.scale(y)+c,w=Array.isArray(x)?Ee(x):x,j=ee(w)?void 0:e.scale(w);Array.isArray(x)&&x.length>=2&&(p=!0),u.push(v(v({},k(o,l,j,b)),{},{name:y,value:x,cx:o,cy:l,radius:j,angle:b,payload:m}))});var d=[];return p&&u.forEach(function(m){if(Array.isArray(m.value)){var f=Ze(m.value),y=ee(f)?void 0:e.scale(f);d.push(v(v({},m),{},{radius:y},k(o,l,y,m.angle)))}else d.push(m)}),{points:u,isRange:p,baseLinePoints:d}});var lt=Re({chartName:"RadarChart",GraphicalChild:S,axisComponents:[{axisType:"angleAxis",AxisComp:ie},{axisType:"radiusAxis",AxisComp:oe}],formatAxisMap:$e,defaultProps:{layout:"centric",startAngle:90,endAngle:-270,cx:"50%",cy:"50%",innerRadius:0,outerRadius:"80%"}});const Y=t=>t==null||t===""?"-":Math.round(Number(t)),ct=t=>{var x,b,w,j;const{student:e,history:n,daycare:a,teacherName:s}=t,i=n.find(h=>h.type.includes("1st")),o=n.find(h=>h.type.includes("2nd")),l=n.find(h=>h.type.includes("3rd")),p=s||"Child Development Worker",u=["Gross Motor","Fine Motor","Self-Help","Receptive Language","Expressive Language","Cognitive","Socio-Emotional"],c=document.createElement("iframe");c.style.position="absolute",c.style.width="0",c.style.height="0",c.style.border="0",c.style.visibility="hidden",document.body.appendChild(c);const d=(x=c.contentWindow)==null?void 0:x.document;if(!d){ve.error("Could not initialize printing."),document.body.removeChild(c);return}const m=new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),f=new Date().getFullYear(),y=`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${e.last_name}_ECCD_Progress_Report</title>
            <style>
                @page { size: portrait; margin: 10mm; }

                body {
                    font-family: "Times New Roman", Times, serif;
                    font-size: 11px;
                    color: #111;
                    margin: 0;
                    padding: 0;
                    line-height: 1.3;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }

                .document-header {
                    text-align: center;
                    margin-bottom: 10px;
                    padding-bottom: 8px;
                    border-bottom: 3px double #000;
                }
                .document-header p { margin: 1px 0; font-size: 10px; text-transform: uppercase; font-weight: bold; color: #333; }
                .document-header h1 { margin: 8px 0 3px 0; font-size: 16px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase; }
                .document-header h2 { margin: 0; font-size: 13px; font-weight: normal; font-style: italic; color: #444; }

                .info-section {
                    font-family: Arial, Helvetica, sans-serif;
                    margin-bottom: 10px;
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 10.5px;
                }
                .info-section td { padding: 3px 4px; vertical-align: bottom; }
                .info-label { font-weight: bold; text-align: right; color: #4b5563; width: 12%; }
                .info-value { border-bottom: 1px solid #000; font-weight: bold; color: #111; }

                .legend-wrapper {
                    border: 1px solid #9ca3af;
                    background-color: #f8fafc;
                    margin-bottom: 12px;
                    border-radius: 2px;
                    font-family: Arial, Helvetica, sans-serif;
                    padding: 2px;
                }
                .legend-table { width: 100%; border-collapse: collapse; font-size: 9px; }
                .legend-table td { padding: 4px 8px; vertical-align: top; }
                .legend-title { font-weight: bold; font-size: 9.5px; text-transform: uppercase; margin-bottom: 4px; color: #1f2937; }
                .legend-badge { display: inline-block; width: 40px; font-weight: bold; }

                table.data-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-family: Arial, Helvetica, sans-serif;
                    border: 1.5px solid #000;
                    margin-bottom: 15px;
                }
                .data-table th, .data-table td {
                    border: 1px solid #000;
                    padding: 5px;
                    vertical-align: middle;
                }
                .data-table th {
                    background-color: #e2e8f0;
                    font-size: 9.5px;
                    text-transform: uppercase;
                    text-align: center;
                }

                .col-domain { background-color: #f8fafc; font-weight: bold; text-align: left; width: 22%; font-size: 10.5px; }
                .col-score { text-align: center; font-size: 11px; width: 13%; }
                .col-scaled { text-align: center; font-size: 12px; font-weight: bold; width: 13%; background-color: #fafafa; }

                .sub-header th { font-size: 8.5px; font-weight: normal; background-color: #f1f5f9; letter-spacing: 0.5px; }
                .eval-meta { font-size: 8px; font-weight: normal; text-transform: none; display: block; margin-top: 2px; }

                .row-sum td { border-top: 2px solid #000; background-color: #f1f5f9; font-weight: bold; font-size: 11px; }
                .row-overall td { background-color: #e2e8f0; font-weight: bold; font-size: 12px; }
                .row-interp td { background-color: #f8fafc; font-style: italic; font-size: 10px; font-weight: bold; color: #334155; }

                .signature-table { width: 100%; border: none; page-break-inside: avoid; margin-top: 30px; }
                .signature-table td { border: none; text-align: center; padding: 5px 20px; vertical-align: bottom; height: 60px; }
                .sig-content { display: inline-block; width: 85%; }
                .sig-line {
                    border-bottom: 1px solid #000;
                    margin-bottom: 4px;
                    padding-bottom: 2px;
                    font-weight: bold;
                    text-transform: uppercase;
                    font-size: 11px;
                    font-family: Arial, sans-serif;
                }
                .sig-title { font-size: 10px; color: #4b5563; }
                .sig-label { font-size: 10px; text-align: left; margin-bottom: 30px; font-style: italic; color: #333; }

                .meta-text { font-size: 8.5px; color: #9ca3af; text-align: right; margin-top: 15px; font-family: Arial, sans-serif; text-transform: uppercase; }
            </style>
        </head>
        <body>

            <div class="document-header">
                <p>Republic of the Philippines</p>
                <p>Early Childhood Care and Development (ECCD) Program</p>
                <h1>CHILD'S DEVELOPMENTAL PROGRESS REPORT</h1>
                <h2>${(a==null?void 0:a.name)||"Child Development Center"}</h2>
            </div>

            <table class="info-section">
                <tr>
                    <td class="info-label">Name:</td>
                    <td class="info-value" colspan="3" style="width: 50%;">
                        ${e.last_name}, ${e.first_name} ${e.middle_name||""}
                    </td>
                    <td class="info-label">Sex:</td>
                    <td class="info-value" style="width: 14%;">
                        ${e.gender||"N/A"}
                    </td>
                </tr>
                <tr>
                    <td class="info-label">Date of Birth:</td>
                    <td class="info-value" style="width: 20%;">
                        ${e.date_of_birth?L(e.date_of_birth):"N/A"}
                    </td>
                    <td class="info-label">School Year:</td>
                    <td class="info-value" style="width: 18%;">
                        ${f} - ${f+1}
                    </td>
                    <td class="info-label">Date Printed:</td>
                    <td class="info-value" style="width: 14%;">
                        ${m}
                    </td>
                </tr>
            </table>

            <div class="legend-wrapper">
                <table class="legend-table">
                    <tr>
                        <td style="width: 50%; border-right: 1px dashed #cbd5e1;">
                            <div class="legend-title">Scaled Score Interpretation (Per Domain)</div>
                            <span class="legend-badge">17 - 19</span> : Highly Advanced Development<br>
                            <span class="legend-badge">14 - 16</span> : Slightly Advanced Development<br>
                            <span class="legend-badge">7 - 13</span> : Average Development<br>
                            <span class="legend-badge">4 - 6</span> : Slight Delay in Development<br>
                            <span class="legend-badge">1 - 3</span> : Significant Delay in Development
                        </td>
                        <td style="width: 50%;">
                            <div class="legend-title">Standard Score Interpretation (Overall)</div>
                            <span class="legend-badge" style="width: 75px;">130 & above</span> : Highly Advanced Development<br>
                            <span class="legend-badge" style="width: 75px;">120 - 129</span> : Slightly Advanced Development<br>
                            <span class="legend-badge" style="width: 75px;">80 - 119</span> : Average Development<br>
                            <span class="legend-badge" style="width: 75px;">70 - 79</span> : Slight Delay in Development<br>
                            <span class="legend-badge" style="width: 75px;">69 & below</span> : Significant Delay in Development
                        </td>
                    </tr>
                </table>
            </div>

            <table class="data-table">
                <thead>
                    <tr>
                        <th rowspan="2" class="col-domain" style="text-align: center;">DEVELOPMENTAL DOMAINS</th>
                        <th colspan="2">
                            ${((b=i==null?void 0:i.type)==null?void 0:b.toUpperCase())||"1ST EVALUATION"}
                            ${i?`<span class="eval-meta">${L(i.date)}<br>Age: ${H(i.age_months,e.date_of_birth,i.date)}</span>`:'<span class="eval-meta">-</span>'}
                        </th>
                        <th colspan="2">
                            ${((w=o==null?void 0:o.type)==null?void 0:w.toUpperCase())||"2ND EVALUATION"}
                            ${o?`<span class="eval-meta">${L(o.date)}<br>Age: ${H(o.age_months,e.date_of_birth,o.date)}</span>`:'<span class="eval-meta">-</span>'}
                        </th>
                        <th colspan="2">
                            ${((j=l==null?void 0:l.type)==null?void 0:j.toUpperCase())||"3RD EVALUATION"}
                            ${l?`<span class="eval-meta">${L(l.date)}<br>Age: ${H(l.age_months,e.date_of_birth,l.date)}</span>`:'<span class="eval-meta">-</span>'}
                        </th>
                    </tr>
                    <tr class="sub-header">
                        <th>Raw</th>
                        <th>Scaled</th>
                        <th>Raw</th>
                        <th>Scaled</th>
                        <th>Raw</th>
                        <th>Scaled</th>
                    </tr>
                </thead>
                <tbody>
                    ${u.map((h,P)=>{const E=K=>!K||!K.domains?null:K.domains.find(B=>{var J;const pe=String(B.name||B.domain_name||((J=B.domain)==null?void 0:J.name)||""),Z=me=>me.toLowerCase().replace(/[- ]/g,"");return Z(pe)===Z(h)}),O=E(i),R=E(o),$=E(l);return`
                                <tr>
                                    <td class="col-domain">${P+1}. ${h}</td>
                                    <td class="col-score">${O?Y(O.score??O.raw_score):"-"}</td>
                                    <td class="col-scaled">${O?O.scaled_score??"-":"-"}</td>
                                    <td class="col-score">${R?Y(R.score??R.raw_score):"-"}</td>
                                    <td class="col-scaled">${R?R.scaled_score??"-":"-"}</td>
                                    <td class="col-score">${$?Y($.score??$.raw_score):"-"}</td>
                                    <td class="col-scaled">${$?$.scaled_score??"-":"-"}</td>
                                </tr>
                            `}).join("")}
                </tbody>
                <tfoot>
                    <tr class="row-sum">
                        <td class="col-domain" style="text-align: right; padding-right: 15px; background-color: transparent;">SUM OF SCALED SCORES:</td>
                        <td colspan="2" class="col-scaled" style="background-color: transparent;">
                            ${i?i.domains.reduce((h,P)=>h+(Number(P.scaled_score)||0),0):"-"}
                        </td>
                        <td colspan="2" class="col-scaled" style="background-color: transparent;">
                            ${o?o.domains.reduce((h,P)=>h+(Number(P.scaled_score)||0),0):"-"}
                        </td>
                        <td colspan="2" class="col-scaled" style="background-color: transparent;">
                            ${l?l.domains.reduce((h,P)=>h+(Number(P.scaled_score)||0),0):"-"}
                        </td>
                    </tr>

                    <tr class="row-overall">
                        <td class="col-domain" style="text-align: right; padding-right: 15px; background-color: transparent;">OVERALL STANDARD SCORE:</td>
                        <td colspan="2" class="col-scaled" style="font-size: 14px; background-color: transparent;">${(i==null?void 0:i.standard_score)||"-"}</td>
                        <td colspan="2" class="col-scaled" style="font-size: 14px; background-color: transparent;">${(o==null?void 0:o.standard_score)||"-"}</td>
                        <td colspan="2" class="col-scaled" style="font-size: 14px; background-color: transparent;">${(l==null?void 0:l.standard_score)||"-"}</td>
                    </tr>

                    <tr class="row-interp">
                        <td class="col-domain" style="text-align: right; padding-right: 15px; background-color: transparent;">INTERPRETATION:</td>
                        <td colspan="2" class="col-scaled" style="font-weight: bold; background-color: transparent; font-size: 10px; color: #334155;">${(i==null?void 0:i.interpretation)||"-"}</td>
                        <td colspan="2" class="col-scaled" style="font-weight: bold; background-color: transparent; font-size: 10px; color: #334155;">${(o==null?void 0:o.interpretation)||"-"}</td>
                        <td colspan="2" class="col-scaled" style="font-weight: bold; background-color: transparent; font-size: 10px; color: #334155;">${(l==null?void 0:l.interpretation)||"-"}</td>
                    </tr>
                </tfoot>
            </table>

            <table class="signature-table">
                <tr>
                    <td>
                        <div class="sig-content">
                            <div class="sig-label">Evaluated by:</div>
                            <div class="sig-line">
                                ${p}
                            </div>
                            <div class="sig-title">Daycare Teacher / Evaluator</div>
                        </div>
                    </td>
                    <td>
                        <div class="sig-content">
                            <div class="sig-label">Acknowledged by:</div>
                            <div class="sig-line">
                                &nbsp;
                            </div>
                            <div class="sig-title">Parent / Guardian Signature</div>
                        </div>
                    </td>
                </tr>
            </table>

            <div class="meta-text">
                System Generated Document • Learner ID: ${e.id||"N/A"}
            </div>

        </body>
        </html>
    `;d.open(),d.write(y),d.close(),setTimeout(()=>{const h=c.contentWindow;h&&(h.focus(),h.print()),setTimeout(()=>document.body.removeChild(c),1e3)},500)},dt=t=>t==null||t===""?"-":Math.round(Number(t));function _t({student:t,history:e,daycare:n,teacherName:a}){var p,u;const{auth:s}=he().props,i=a||(s!=null&&s.user?`${s.user.first_name} ${s.user.last_name}`:null)||((p=s==null?void 0:s.user)==null?void 0:p.name)||"Child Development Worker",o=(((u=e[0])==null?void 0:u.domains)||[]).map((c,d)=>{var y;const m=c.name||c.domain_name||((y=c.domain)==null?void 0:y.name)||`Domain ${d+1}`,f={subject:m};return e.forEach(x=>{const b=x.domains.find(j=>{var h;return(j.name||j.domain_name||((h=j.domain)==null?void 0:h.name))===m}),w=Number(b==null?void 0:b.scaled_score)||0;x.type.includes("1st")&&(f["1st Assessment"]=w),x.type.includes("2nd")&&(f["2nd Assessment"]=w),x.type.includes("3rd")&&(f["3rd Assessment"]=w)}),f}),l=()=>{ct({student:t,history:e,daycare:n,teacherName:i})};return r.jsxs(ye,{breadcrumbs:[{title:"My Students",href:route("teacher.my-students.index")},{title:"Reports",href:"#"},{title:t.first_name,href:"#"}],children:[r.jsx(ge,{title:`${t.first_name}'s Report`}),r.jsxs("div",{className:"w-full space-y-8 p-4 sm:p-6 lg:p-8",children:[r.jsxs("div",{className:"flex items-center justify-between pb-2",children:[r.jsxs(be,{href:route("teacher.my-students.index"),className:"group flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900",children:[r.jsx(je,{className:"size-4 transition-transform group-hover:-translate-x-1"}),"Back to Students"]}),r.jsxs(xe,{onClick:l,className:"bg-blue-600 text-white shadow-md hover:bg-blue-700",children:[r.jsx(we,{className:"mr-2 size-4"})," Print Document"]})]}),r.jsxs("div",{className:"relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8 text-white shadow-xl",children:[r.jsx("div",{className:"absolute -right-20 -top-40 opacity-10 blur-3xl",children:r.jsx("div",{className:"size-96 rounded-full bg-blue-500"})}),r.jsxs("div",{className:"relative z-10 flex flex-col items-center text-center",children:[r.jsxs("div",{className:"mb-2 inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-blue-200 border border-blue-400/20",children:[r.jsx(Pe,{className:"size-3.5"}),"Early Childhood Care and Development"]}),r.jsxs("h1",{className:"mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl",children:[t.first_name," ",t.last_name]}),t.deleted_at&&r.jsx("span",{className:"mt-4 inline-block rounded-full bg-amber-500/20 px-4 py-1.5 text-xs font-bold tracking-wider text-amber-200 border border-amber-500/30",children:"Archived / Alumni Record"}),r.jsx("div",{className:"mt-8 flex flex-wrap justify-center gap-6 sm:gap-12",children:r.jsxs("div",{className:"flex items-center gap-3 rounded-lg bg-white/5 px-5 py-3 backdrop-blur-sm",children:[r.jsx(Ne,{className:"size-5 text-blue-300"}),r.jsxs("div",{className:"text-left",children:[r.jsx("p",{className:"text-[10px] font-bold uppercase tracking-wider text-slate-400",children:"Child Development Center"}),r.jsx("p",{className:"text-sm font-semibold text-slate-100",children:(n==null?void 0:n.name)||"N/A"})]})]})})]})]}),r.jsxs("div",{className:"grid grid-cols-1 gap-8 lg:grid-cols-12",children:[r.jsx("div",{className:"lg:col-span-4 xl:col-span-3",children:r.jsxs("div",{className:"sticky top-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",children:[r.jsxs("div",{className:"border-b border-slate-100 bg-slate-50/50 p-6 text-center",children:[r.jsx("h3",{className:"text-lg font-extrabold text-slate-800",children:"Developmental Radar"}),r.jsx("p",{className:"mt-1 text-xs font-medium text-slate-500",children:"Visualization of scaled scores"})]}),r.jsx("div",{className:"p-6 h-[350px] w-full",children:o.length>0?r.jsx(ke,{width:"100%",height:"100%",children:r.jsxs(lt,{cx:"50%",cy:"50%",outerRadius:"65%",data:o,children:[r.jsx(le,{stroke:"#cbd5e1",strokeDasharray:"3 3"}),r.jsx(ie,{dataKey:"subject",tick:{fill:"#475569",fontSize:10,fontWeight:600}}),r.jsx(oe,{angle:30,domain:[0,19],tick:{fontSize:9,fill:"#94a3b8"}}),r.jsx(S,{name:"1st Assessment",dataKey:"1st Assessment",stroke:"#3b82f6",strokeWidth:2,fill:"#3b82f6",fillOpacity:.2}),r.jsx(S,{name:"2nd Assessment",dataKey:"2nd Assessment",stroke:"#10b981",strokeWidth:2,fill:"#10b981",fillOpacity:.2}),r.jsx(S,{name:"3rd Assessment",dataKey:"3rd Assessment",stroke:"#ec4899",strokeWidth:2,fill:"#ec4899",fillOpacity:.2}),r.jsx(Ce,{wrapperStyle:{fontSize:"11px",fontWeight:500,paddingTop:"10px"}})]})}):r.jsxs("div",{className:"flex h-full flex-col items-center justify-center space-y-3 text-slate-400",children:[r.jsx("div",{className:"rounded-full bg-slate-50 p-4",children:r.jsx(V,{className:"size-6 text-slate-300"})}),r.jsx("p",{className:"text-sm font-medium",children:"Insufficient data"})]})})]})}),r.jsx("div",{className:"lg:col-span-8 xl:col-span-9 s`pace-y-8",children:e.length===0?r.jsxs("div",{className:"flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-500",children:[r.jsx(V,{className:"mb-4 size-8 text-slate-300"}),r.jsx("p",{className:"font-medium",children:"No completed assessments available."})]}):e.map(c=>r.jsxs("div",{className:"overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md",children:[r.jsx("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 bg-slate-50 p-5",children:r.jsxs("div",{className:"flex items-center gap-3",children:[r.jsx("div",{className:"flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600",children:r.jsx(V,{className:"size-5"})}),r.jsxs("div",{children:[r.jsx("h3",{className:"text-base font-extrabold text-slate-900",children:c.type}),r.jsxs("div",{className:"flex items-center gap-1.5 text-xs font-medium text-slate-500",children:[r.jsx(Le,{className:"size-3.5"}),"Tested: ",c.date]})]})]})}),r.jsx("div",{className:"p-0 overflow-x-auto",children:r.jsxs("table",{className:"w-full border-collapse text-left text-sm min-w-[500px]",children:[r.jsx("thead",{className:"bg-white",children:r.jsxs("tr",{className:"border-b border-slate-200",children:[r.jsx("th",{className:"w-[50%] py-3.5 pl-6 font-bold text-slate-500 uppercase tracking-wider text-[10px]",children:"Developmental Domain"}),r.jsx("th",{className:"w-[25%] py-3.5 text-center font-bold text-slate-500 uppercase tracking-wider text-[10px]",children:"Raw Score"}),r.jsx("th",{className:"w-[25%] py-3.5 pr-6 text-center font-bold text-slate-500 uppercase tracking-wider text-[10px]",children:"Scaled Score"})]})}),r.jsx("tbody",{className:"divide-y divide-slate-100",children:c.domains.map((d,m)=>{var f;return r.jsxs("tr",{className:"group hover:bg-slate-50/50 transition-colors",children:[r.jsx("td",{className:"py-3 pl-6 text-slate-700 font-semibold text-xs sm:text-sm",children:d.name||d.domain_name||((f=d.domain)==null?void 0:f.name)||"Unknown Domain"}),r.jsx("td",{className:"py-3 text-center text-slate-500 font-medium",children:dt(d.score??d.raw_score)}),r.jsx("td",{className:"py-3 pr-6 text-center",children:r.jsx("span",{className:"inline-flex min-w-[2rem] items-center justify-center rounded-md bg-blue-50 py-1 px-3 text-sm font-bold text-blue-700",children:d.scaled_score??"-"})})]},m)})}),r.jsx("tfoot",{className:"bg-slate-50",children:r.jsx("tr",{children:r.jsx("td",{colSpan:3,className:"p-0",children:r.jsxs("div",{className:"flex flex-col sm:flex-row border-t border-slate-200 divide-y sm:divide-y-0 sm:divide-x divide-slate-200",children:[r.jsxs("div",{className:"flex-1 p-5 flex flex-col justify-center",children:[r.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-slate-400",children:"Overall Interpretation"}),r.jsx("span",{className:"mt-1 text-sm font-bold text-slate-800",children:c.interpretation})]}),r.jsxs("div",{className:"flex-1 p-5 flex items-center justify-between sm:justify-center gap-4 bg-slate-50/80",children:[r.jsx("span",{className:"text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500",children:"Scaled Score Sum"}),r.jsx("span",{className:"text-xl font-bold text-slate-700",children:c.domains.reduce((d,m)=>d+(Number(m.scaled_score)||0),0)})]}),r.jsxs("div",{className:"flex-1 p-5 flex items-center justify-between sm:justify-end gap-4 bg-blue-50/50",children:[r.jsx("span",{className:"text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-600",children:"Standard Score"}),r.jsx("span",{className:"text-2xl font-black text-blue-700",children:c.standard_score})]})]})})})})]})})]},c.id))})]})]})]})}export{_t as default};
