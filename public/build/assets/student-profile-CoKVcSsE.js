import{R as x,g as ue,a as Q,u as ge,j as r,H as xe,L as be}from"./app-X2DO5V-N.js";import{a as M,B as he}from"./button-BWHX8qxf.js";import{A as ve}from"./app-layout-mCF9AMFf.js";import{f as L,b as H}from"./date-CjGDCdcv.js";import{t as ye}from"./index-1PX1JcFD.js";import{A as we}from"./arrow-left-CCQgMIpR.js";import{P as je}from"./printer-DIvqFnE3.js";import{A as Pe}from"./award-DVlvxRAI.js";import{S as Ne}from"./school-CT0L-Oeb.js";import{f as _,p as $,i as T,Q as Ae,L as G,A as ke,d as I,e as Oe,k as Se,G as _e,g as ee,U as De,a as te,r as Ee,s as Re,R as $e,v as ze}from"./generateCategoricalChart-DoczJIJW.js";import{b as Ce,P as oe,a as le}from"./PolarAngleAxis-DsTaQfR5.js";import{F as U}from"./file-text-BIpIlGy7.js";import{C as Le}from"./calendar-BvrF_RiI.js";/* empty css            */import"./index-Cfw3EVn9.js";import"./index-BMW8KLm5.js";var Te=["cx","cy","innerRadius","outerRadius","gridType","radialLines"];function z(t){"@babel/helpers - typeof";return z=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(e){return typeof e}:function(e){return e&&typeof Symbol=="function"&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},z(t)}function Ie(t,e){if(t==null)return{};var n=Me(t,e),a,s;if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(s=0;s<i.length;s++)a=i[s],!(e.indexOf(a)>=0)&&Object.prototype.propertyIsEnumerable.call(t,a)&&(n[a]=t[a])}return n}function Me(t,e){if(t==null)return{};var n={};for(var a in t)if(Object.prototype.hasOwnProperty.call(t,a)){if(e.indexOf(a)>=0)continue;n[a]=t[a]}return n}function A(){return A=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(t[a]=n[a])}return t},A.apply(this,arguments)}function ae(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(t);e&&(a=a.filter(function(s){return Object.getOwnPropertyDescriptor(t,s).enumerable})),n.push.apply(n,a)}return n}function C(t){for(var e=1;e<arguments.length;e++){var n=arguments[e]!=null?arguments[e]:{};e%2?ae(Object(n),!0).forEach(function(a){Fe(t,a,n[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):ae(Object(n)).forEach(function(a){Object.defineProperty(t,a,Object.getOwnPropertyDescriptor(n,a))})}return t}function Fe(t,e,n){return e=We(e),e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function We(t){var e=Ke(t,"string");return z(e)=="symbol"?e:e+""}function Ke(t,e){if(z(t)!="object"||!t)return t;var n=t[Symbol.toPrimitive];if(n!==void 0){var a=n.call(t,e);if(z(a)!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return(e==="string"?String:Number)(t)}var Be=function(e,n,a,s){var i="";return s.forEach(function(o,l){var m=$(n,a,e,o);l?i+="L ".concat(m.x,",").concat(m.y):i+="M ".concat(m.x,",").concat(m.y)}),i+="Z",i},He=function(e){var n=e.cx,a=e.cy,s=e.innerRadius,i=e.outerRadius,o=e.polarAngles,l=e.radialLines;if(!o||!o.length||!l)return null;var m=C({stroke:"#ccc"},_(e,!1));return x.createElement("g",{className:"recharts-polar-grid-angle"},o.map(function(g){var c=$(n,a,s,g),f=$(n,a,i,g);return x.createElement("line",A({},m,{key:"line-".concat(g),x1:c.x,y1:c.y,x2:f.x,y2:f.y}))}))},Ge=function(e){var n=e.cx,a=e.cy,s=e.radius,i=e.index,o=C(C({stroke:"#ccc"},_(e,!1)),{},{fill:"none"});return x.createElement("circle",A({},o,{className:M("recharts-polar-grid-concentric-circle",e.className),key:"circle-".concat(i),cx:n,cy:a,r:s}))},Ue=function(e){var n=e.radius,a=e.index,s=C(C({stroke:"#ccc"},_(e,!1)),{},{fill:"none"});return x.createElement("path",A({},s,{className:M("recharts-polar-grid-concentric-polygon",e.className),key:"path-".concat(a),d:Be(n,e.cx,e.cy,e.polarAngles)}))},Ve=function(e){var n=e.polarRadius,a=e.gridType;return!n||!n.length?null:x.createElement("g",{className:"recharts-polar-grid-concentric"},n.map(function(s,i){var o=i;return a==="circle"?x.createElement(Ge,A({key:o},e,{radius:s,index:i})):x.createElement(Ue,A({key:o},e,{radius:s,index:i}))}))},de=function(e){var n=e.cx,a=n===void 0?0:n,s=e.cy,i=s===void 0?0:s,o=e.innerRadius,l=o===void 0?0:o,m=e.outerRadius,g=m===void 0?0:m,c=e.gridType,f=c===void 0?"polygon":c,d=e.radialLines,p=d===void 0?!0:d,b=Ie(e,Te);return g<=0?null:x.createElement("g",{className:"recharts-polar-grid"},x.createElement(He,A({cx:a,cy:i,innerRadius:l,outerRadius:g,gridType:f,radialLines:p},b)),x.createElement(Ve,A({cx:a,cy:i,innerRadius:l,outerRadius:g,gridType:f,radialLines:p},b)))};de.displayName="PolarGrid";var V,ne;function qe(){if(ne)return V;ne=1;function t(e){return e&&e.length?e[0]:void 0}return V=t,V}var q,re;function Ye(){return re||(re=1,q=qe()),q}var Qe=Ye();const Xe=ue(Qe);var Ze=["key"];function D(t){"@babel/helpers - typeof";return D=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(e){return typeof e}:function(e){return e&&typeof Symbol=="function"&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},D(t)}function Je(t,e){if(t==null)return{};var n=et(t,e),a,s;if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(s=0;s<i.length;s++)a=i[s],!(e.indexOf(a)>=0)&&Object.prototype.propertyIsEnumerable.call(t,a)&&(n[a]=t[a])}return n}function et(t,e){if(t==null)return{};var n={};for(var a in t)if(Object.prototype.hasOwnProperty.call(t,a)){if(e.indexOf(a)>=0)continue;n[a]=t[a]}return n}function F(){return F=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(t[a]=n[a])}return t},F.apply(this,arguments)}function se(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(t);e&&(a=a.filter(function(s){return Object.getOwnPropertyDescriptor(t,s).enumerable})),n.push.apply(n,a)}return n}function y(t){for(var e=1;e<arguments.length;e++){var n=arguments[e]!=null?arguments[e]:{};e%2?se(Object(n),!0).forEach(function(a){N(t,a,n[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):se(Object(n)).forEach(function(a){Object.defineProperty(t,a,Object.getOwnPropertyDescriptor(n,a))})}return t}function tt(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function ie(t,e){for(var n=0;n<e.length;n++){var a=e[n];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(t,pe(a.key),a)}}function at(t,e,n){return e&&ie(t.prototype,e),n&&ie(t,n),Object.defineProperty(t,"prototype",{writable:!1}),t}function nt(t,e,n){return e=W(e),rt(t,ce()?Reflect.construct(e,n||[],W(t).constructor):e.apply(t,n))}function rt(t,e){if(e&&(D(e)==="object"||typeof e=="function"))return e;if(e!==void 0)throw new TypeError("Derived constructors may only return object or undefined");return st(t)}function st(t){if(t===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function ce(){try{var t=!Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}))}catch{}return(ce=function(){return!!t})()}function W(t){return W=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(n){return n.__proto__||Object.getPrototypeOf(n)},W(t)}function it(t,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),e&&X(t,e)}function X(t,e){return X=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(a,s){return a.__proto__=s,a},X(t,e)}function N(t,e,n){return e=pe(e),e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function pe(t){var e=ot(t,"string");return D(e)=="symbol"?e:e+""}function ot(t,e){if(D(t)!="object"||!t)return t;var n=t[Symbol.toPrimitive];if(n!==void 0){var a=n.call(t,e);if(D(a)!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}var S=(function(t){function e(){var n;tt(this,e);for(var a=arguments.length,s=new Array(a),i=0;i<a;i++)s[i]=arguments[i];return n=nt(this,e,[].concat(s)),N(n,"state",{isAnimationFinished:!1}),N(n,"handleAnimationEnd",function(){var o=n.props.onAnimationEnd;n.setState({isAnimationFinished:!0}),T(o)&&o()}),N(n,"handleAnimationStart",function(){var o=n.props.onAnimationStart;n.setState({isAnimationFinished:!1}),T(o)&&o()}),N(n,"handleMouseEnter",function(o){var l=n.props.onMouseEnter;l&&l(n.props,o)}),N(n,"handleMouseLeave",function(o){var l=n.props.onMouseLeave;l&&l(n.props,o)}),n}return it(e,t),at(e,[{key:"renderDots",value:function(a){var s=this.props,i=s.dot,o=s.dataKey,l=_(this.props,!1),m=_(i,!0),g=a.map(function(c,f){var d=y(y(y({key:"dot-".concat(f),r:3},l),m),{},{dataKey:o,cx:c.x,cy:c.y,index:f,payload:c});return e.renderDotItem(i,d)});return x.createElement(G,{className:"recharts-radar-dots"},g)}},{key:"renderPolygonStatically",value:function(a){var s=this.props,i=s.shape,o=s.dot,l=s.isRange,m=s.baseLinePoints,g=s.connectNulls,c;return x.isValidElement(i)?c=x.cloneElement(i,y(y({},this.props),{},{points:a})):T(i)?c=i(y(y({},this.props),{},{points:a})):c=x.createElement(Ce,F({},_(this.props,!0),{onMouseEnter:this.handleMouseEnter,onMouseLeave:this.handleMouseLeave,points:a,baseLinePoints:l?m:null,connectNulls:g})),x.createElement(G,{className:"recharts-radar-polygon"},c,o?this.renderDots(a):null)}},{key:"renderPolygonWithAnimation",value:function(){var a=this,s=this.props,i=s.points,o=s.isAnimationActive,l=s.animationBegin,m=s.animationDuration,g=s.animationEasing,c=s.animationId,f=this.state.prevPoints;return x.createElement(ke,{begin:l,duration:m,isActive:o,easing:g,from:{t:0},to:{t:1},key:"radar-".concat(c),onAnimationEnd:this.handleAnimationEnd,onAnimationStart:this.handleAnimationStart},function(d){var p=d.t,b=f&&f.length/i.length,h=i.map(function(v,P){var w=f&&f[Math.floor(P*b)];if(w){var u=I(w.x,v.x),j=I(w.y,v.y);return y(y({},v),{},{x:u(p),y:j(p)})}var k=I(v.cx,v.x),O=I(v.cy,v.y);return y(y({},v),{},{x:k(p),y:O(p)})});return a.renderPolygonStatically(h)})}},{key:"renderPolygon",value:function(){var a=this.props,s=a.points,i=a.isAnimationActive,o=a.isRange,l=this.state.prevPoints;return i&&s&&s.length&&!o&&(!l||!Oe(l,s))?this.renderPolygonWithAnimation():this.renderPolygonStatically(s)}},{key:"render",value:function(){var a=this.props,s=a.hide,i=a.className,o=a.points,l=a.isAnimationActive;if(s||!o||!o.length)return null;var m=this.state.isAnimationFinished,g=M("recharts-radar",i);return x.createElement(G,{className:g},this.renderPolygon(),(!l||m)&&Se.renderCallByParent(this.props,o))}}],[{key:"getDerivedStateFromProps",value:function(a,s){return a.animationId!==s.prevAnimationId?{prevAnimationId:a.animationId,curPoints:a.points,prevPoints:s.curPoints}:a.points!==s.curPoints?{curPoints:a.points}:null}},{key:"renderDotItem",value:function(a,s){var i;if(x.isValidElement(a))i=x.cloneElement(a,s);else if(T(a))i=a(s);else{var o=s.key,l=Je(s,Ze);i=x.createElement(Ae,F({},l,{key:o,className:M("recharts-radar-dot",typeof a!="boolean"?a.className:"")}))}return i}}])})(Q.PureComponent);N(S,"displayName","Radar");N(S,"defaultProps",{angleAxisId:0,radiusAxisId:0,hide:!1,activeDot:!0,dot:!1,legendType:"rect",isAnimationActive:!_e.isSsr,animationBegin:0,animationDuration:1500,animationEasing:"ease"});N(S,"getComposedData",function(t){var e=t.radiusAxis,n=t.angleAxis,a=t.displayedData,s=t.dataKey,i=t.bandSize,o=n.cx,l=n.cy,m=!1,g=[],c=n.type!=="number"?i??0:0;a.forEach(function(d,p){var b=ee(d,n.dataKey,p),h=ee(d,s),v=n.scale(b)+c,P=Array.isArray(h)?De(h):h,w=te(P)?void 0:e.scale(P);Array.isArray(h)&&h.length>=2&&(m=!0),g.push(y(y({},$(o,l,w,v)),{},{name:b,value:h,cx:o,cy:l,radius:w,angle:v,payload:d}))});var f=[];return m&&g.forEach(function(d){if(Array.isArray(d.value)){var p=Xe(d.value),b=te(p)?void 0:e.scale(p);f.push(y(y({},d),{},{radius:b},$(o,l,b,d.angle)))}else f.push(d)}),{points:g,isRange:m,baseLinePoints:f}});var lt=Ee({chartName:"RadarChart",GraphicalChild:S,axisComponents:[{axisType:"angleAxis",AxisComp:oe},{axisType:"radiusAxis",AxisComp:le}],formatAxisMap:Re,defaultProps:{layout:"centric",startAngle:90,endAngle:-270,cx:"50%",cy:"50%",innerRadius:0,outerRadius:"80%"}});const Y=t=>t==null||t===""?"-":Math.round(Number(t)),dt=t=>{var h,v,P,w;const{student:e,history:n,daycare:a,teacherName:s}=t,i=n.find(u=>u.type.includes("1st")),o=n.find(u=>u.type.includes("2nd")),l=n.find(u=>u.type.includes("3rd")),m=s||"Child Development Worker",g=["Gross Motor","Fine Motor","Self-Help","Receptive Language","Expressive Language","Cognitive","Socio-Emotional"],c=document.createElement("iframe");c.style.position="absolute",c.style.width="0",c.style.height="0",c.style.border="0",c.style.visibility="hidden",document.body.appendChild(c);const f=(h=c.contentWindow)==null?void 0:h.document;if(!f){ye.error("Could not initialize printing."),document.body.removeChild(c);return}const d=new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),p=new Date().getFullYear(),b=`
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
                        ${p} - ${p+1}
                    </td>
                    <td class="info-label">Date Printed:</td>
                    <td class="info-value" style="width: 14%;">
                        ${d}
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
                            ${((v=i==null?void 0:i.type)==null?void 0:v.toUpperCase())||"1ST EVALUATION"}
                            ${i?`<span class="eval-meta">${L(i.date)}<br>Age: ${H(i.age_months,e.date_of_birth,i.date)}</span>`:'<span class="eval-meta">-</span>'}
                        </th>
                        <th colspan="2">
                            ${((P=o==null?void 0:o.type)==null?void 0:P.toUpperCase())||"2ND EVALUATION"}
                            ${o?`<span class="eval-meta">${L(o.date)}<br>Age: ${H(o.age_months,e.date_of_birth,o.date)}</span>`:'<span class="eval-meta">-</span>'}
                        </th>
                        <th colspan="2">
                            ${((w=l==null?void 0:l.type)==null?void 0:w.toUpperCase())||"3RD EVALUATION"}
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
                    ${g.map((u,j)=>{const k=K=>!K||!K.domains?null:K.domains.find(B=>{var J;const me=String(B.name||B.domain_name||((J=B.domain)==null?void 0:J.name)||""),Z=fe=>fe.toLowerCase().replace(/[- ]/g,"");return Z(me)===Z(u)}),O=k(i),E=k(o),R=k(l);return`
                                <tr>
                                    <td class="col-domain">${j+1}. ${u}</td>
                                    <td class="col-score">${O?Y(O.score??O.raw_score):"-"}</td>
                                    <td class="col-scaled">${O?O.scaled_score??"-":"-"}</td>
                                    <td class="col-score">${E?Y(E.score??E.raw_score):"-"}</td>
                                    <td class="col-scaled">${E?E.scaled_score??"-":"-"}</td>
                                    <td class="col-score">${R?Y(R.score??R.raw_score):"-"}</td>
                                    <td class="col-scaled">${R?R.scaled_score??"-":"-"}</td>
                                </tr>
                            `}).join("")}
                </tbody>
                <tfoot>
                    <tr class="row-sum">
                        <td class="col-domain" style="text-align: right; padding-right: 15px; background-color: transparent;">SUM OF SCALED SCORES:</td>
                        <td colspan="2" class="col-scaled" style="background-color: transparent;">
                            ${i?i.domains.reduce((u,j)=>u+(Number(j.scaled_score)||0),0):"-"}
                        </td>
                        <td colspan="2" class="col-scaled" style="background-color: transparent;">
                            ${o?o.domains.reduce((u,j)=>u+(Number(j.scaled_score)||0),0):"-"}
                        </td>
                        <td colspan="2" class="col-scaled" style="background-color: transparent;">
                            ${l?l.domains.reduce((u,j)=>u+(Number(j.scaled_score)||0),0):"-"}
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
                                ${m}
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
    `;f.open(),f.write(b),f.close(),setTimeout(()=>{const u=c.contentWindow;u&&(u.focus(),u.print()),setTimeout(()=>document.body.removeChild(c),1e3)},500)},ct=t=>t==null||t===""?"-":Math.round(Number(t));function Ot({student:t,history:e,daycare:n,teacherName:a}){var c,f;const{auth:s}=ge().props,[i,o]=Q.useState(!1);Q.useEffect(()=>{const d=()=>{o(document.documentElement.classList.contains("dark"))};d();const p=new MutationObserver(d);return p.observe(document.documentElement,{attributes:!0,attributeFilter:["class"]}),()=>p.disconnect()},[]);const l=a||(s!=null&&s.user?`${s.user.first_name} ${s.user.last_name}`:null)||((c=s==null?void 0:s.user)==null?void 0:c.name)||"Child Development Worker",m=(((f=e[0])==null?void 0:f.domains)||[]).map((d,p)=>{var v;const b=d.name||d.domain_name||((v=d.domain)==null?void 0:v.name)||`Domain ${p+1}`,h={subject:b};return e.forEach(P=>{const w=P.domains.find(j=>{var k;return(j.name||j.domain_name||((k=j.domain)==null?void 0:k.name))===b}),u=Number(w==null?void 0:w.scaled_score)||0;P.type.includes("1st")&&(h["1st Assessment"]=u),P.type.includes("2nd")&&(h["2nd Assessment"]=u),P.type.includes("3rd")&&(h["3rd Assessment"]=u)}),h}),g=()=>{dt({student:t,history:e,daycare:n,teacherName:l})};return r.jsxs(ve,{breadcrumbs:[{title:"My Students",href:route("teacher.my-students.index")},{title:"Reports",href:"#"},{title:t.first_name,href:"#"}],children:[r.jsx(xe,{title:`${t.first_name}'s Report`}),r.jsxs("div",{className:"w-full space-y-8 p-4 sm:p-6 lg:p-8 transition-colors duration-200",children:[r.jsxs("div",{className:"flex items-center justify-between pb-2",children:[r.jsxs(be,{href:route("teacher.my-students.index"),className:"group flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-white",children:[r.jsx(we,{className:"size-4 transition-transform group-hover:-translate-x-1"}),"Back to Students"]}),r.jsxs(he,{onClick:g,className:"bg-indigo-600 dark:bg-indigo-600 text-white font-bold shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-500 h-11 rounded-xl transition-colors",children:[r.jsx(je,{className:"mr-2 size-4"})," Print Document"]})]}),r.jsxs("div",{className:"relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl dark:shadow-indigo-900/10",children:[r.jsx("div",{className:"absolute -right-20 -top-40 opacity-20 blur-3xl",children:r.jsx("div",{className:"size-96 rounded-full bg-indigo-500"})}),r.jsxs("div",{className:"relative z-10 flex flex-col items-center text-center",children:[r.jsxs("div",{className:"mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-200 border border-white/10 backdrop-blur-md",children:[r.jsx(Pe,{className:"size-3.5"}),"Early Childhood Care and Development"]}),r.jsxs("h1",{className:"mt-4 text-4xl font-black tracking-tight sm:text-5xl",children:[t.first_name," ",t.last_name]}),t.deleted_at&&r.jsx("span",{className:"mt-4 inline-block rounded-full bg-amber-500/20 px-4 py-1.5 text-xs font-bold tracking-wider text-amber-200 border border-amber-500/30 backdrop-blur-sm",children:"Archived / Alumni Record"}),r.jsx("div",{className:"mt-8 flex flex-wrap justify-center gap-6 sm:gap-12",children:r.jsxs("div",{className:"flex items-center gap-3 rounded-2xl bg-white/5 px-6 py-3 border border-white/10 backdrop-blur-sm",children:[r.jsx(Ne,{className:"size-5 text-indigo-300"}),r.jsxs("div",{className:"text-left",children:[r.jsx("p",{className:"text-[10px] font-bold uppercase tracking-wider text-slate-400",children:"Child Development Center"}),r.jsx("p",{className:"text-sm font-bold text-slate-100",children:(n==null?void 0:n.name)||"N/A"})]})]})})]})]}),r.jsxs("div",{className:"grid grid-cols-1 gap-8 lg:grid-cols-12",children:[r.jsx("div",{className:"lg:col-span-4 xl:col-span-3",children:r.jsxs("div",{className:"sticky top-8 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors",children:[r.jsxs("div",{className:"border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-950/50 p-6 text-center",children:[r.jsx("h3",{className:"text-lg font-extrabold text-slate-800 dark:text-white",children:"Developmental Radar"}),r.jsx("p",{className:"mt-1 text-xs font-medium text-slate-500 dark:text-slate-400",children:"Visualization of scaled scores"})]}),r.jsx("div",{className:"p-4 h-[350px] w-full",children:m.length>0?r.jsx($e,{width:"100%",height:"100%",children:r.jsxs(lt,{cx:"50%",cy:"50%",outerRadius:"65%",data:m,children:[r.jsx(de,{stroke:i?"#334155":"#cbd5e1",strokeDasharray:"3 3"}),r.jsx(oe,{dataKey:"subject",tick:{fill:i?"#94a3b8":"#475569",fontSize:10,fontWeight:600}}),r.jsx(le,{angle:30,domain:[0,19],tick:{fontSize:9,fill:i?"#64748b":"#94a3b8"}}),r.jsx(S,{name:"1st Assessment",dataKey:"1st Assessment",stroke:"#6366f1",strokeWidth:2,fill:"#6366f1",fillOpacity:.2}),r.jsx(S,{name:"2nd Assessment",dataKey:"2nd Assessment",stroke:"#10b981",strokeWidth:2,fill:"#10b981",fillOpacity:.2}),r.jsx(S,{name:"3rd Assessment",dataKey:"3rd Assessment",stroke:"#f43f5e",strokeWidth:2,fill:"#f43f5e",fillOpacity:.2}),r.jsx(ze,{wrapperStyle:{fontSize:"10px",fontWeight:600,paddingTop:"10px",color:i?"#94a3b8":"#475569"}})]})}):r.jsxs("div",{className:"flex h-full flex-col items-center justify-center space-y-3 text-slate-400 dark:text-slate-600",children:[r.jsx("div",{className:"rounded-full bg-slate-50 dark:bg-zinc-800 p-4",children:r.jsx(U,{className:"size-6 text-slate-300 dark:text-slate-700"})}),r.jsx("p",{className:"text-sm font-medium",children:"Insufficient data"})]})})]})}),r.jsx("div",{className:"lg:col-span-8 xl:col-span-9 space-y-8",children:e.length===0?r.jsxs("div",{className:"flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-900/50 text-slate-500 transition-colors",children:[r.jsx(U,{className:"mb-4 size-8 text-slate-300 dark:text-slate-700"}),r.jsx("p",{className:"font-medium",children:"No completed assessments available."})]}):e.map(d=>r.jsxs("div",{className:"overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-all hover:shadow-md",children:[r.jsx("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950/50 p-5 transition-colors",children:r.jsxs("div",{className:"flex items-center gap-3",children:[r.jsx("div",{className:"flex size-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400",children:r.jsx(U,{className:"size-5"})}),r.jsxs("div",{children:[r.jsx("h3",{className:"text-base font-extrabold text-slate-900 dark:text-white transition-colors",children:d.type}),r.jsxs("div",{className:"flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400",children:[r.jsx(Le,{className:"size-3.5"}),"Tested: ",d.date]})]})]})}),r.jsx("div",{className:"p-0 overflow-x-auto",children:r.jsxs("table",{className:"w-full border-collapse text-left text-sm min-w-[500px]",children:[r.jsx("thead",{children:r.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-800",children:[r.jsx("th",{className:"w-[50%] py-3.5 pl-6 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]",children:"Developmental Domain"}),r.jsx("th",{className:"w-[25%] py-3.5 text-center font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]",children:"Raw Score"}),r.jsx("th",{className:"w-[25%] py-3.5 pr-6 text-center font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]",children:"Scaled Score"})]})}),r.jsx("tbody",{className:"divide-y divide-slate-100 dark:divide-slate-800",children:d.domains.map((p,b)=>{var h;return r.jsxs("tr",{className:"group hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors",children:[r.jsx("td",{className:"py-3 pl-6 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm",children:p.name||p.domain_name||((h=p.domain)==null?void 0:h.name)||"Unknown Domain"}),r.jsx("td",{className:"py-3 text-center text-slate-500 dark:text-slate-400 font-medium",children:ct(p.score??p.raw_score)}),r.jsx("td",{className:"py-3 pr-6 text-center",children:r.jsx("span",{className:"inline-flex min-w-[2.5rem] items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10 py-1 px-3 text-sm font-bold text-indigo-700 dark:text-indigo-400 transition-colors",children:p.scaled_score??"-"})})]},b)})}),r.jsx("tfoot",{className:"bg-slate-50 dark:bg-zinc-950/50",children:r.jsx("tr",{children:r.jsx("td",{colSpan:3,className:"p-0",children:r.jsxs("div",{className:"flex flex-col sm:flex-row border-t border-slate-200 dark:border-slate-800 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800",children:[r.jsxs("div",{className:"flex-1 p-5 flex flex-col justify-center",children:[r.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500",children:"Overall Interpretation"}),r.jsx("span",{className:"mt-1 text-sm font-bold text-slate-800 dark:text-slate-200",children:d.interpretation})]}),r.jsxs("div",{className:"flex-1 p-5 flex items-center justify-between sm:justify-center gap-4",children:[r.jsx("span",{className:"text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400",children:"Scaled Score Sum"}),r.jsx("span",{className:"text-xl font-black text-slate-700 dark:text-slate-300",children:d.domains.reduce((p,b)=>p+(Number(b.scaled_score)||0),0)})]}),r.jsxs("div",{className:"flex-1 p-5 flex items-center justify-between sm:justify-end gap-4 bg-indigo-50/50 dark:bg-indigo-500/10",children:[r.jsx("span",{className:"text-[10px] sm:text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400",children:"Standard Score"}),r.jsx("span",{className:"text-2xl font-black text-indigo-700 dark:text-indigo-300",children:d.standard_score})]})]})})})})]})})]},d.id))})]})]})]})}export{Ot as default};
