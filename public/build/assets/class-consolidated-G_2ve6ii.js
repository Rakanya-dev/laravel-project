import{u as m,j as e,H as f,L as g,r as b}from"./app-D8Yj4w9f.js";import{A as u,U as w}from"./app-layout-BL2a40bi.js";import{c as j,B as v}from"./button-6SXQYyyh.js";import{S as N,a as _,b as y,c as k,d as p}from"./select-DWgGcM_a.js";import{t as C}from"./index-1psDGE8K.js";import{A as $}from"./arrow-left-DvG-Vi_o.js";import{P as S}from"./printer-BXZy_hix.js";/* empty css            */import"./index-4GtlB9as.js";import"./index-GC2lUQB8.js";import"./app-logo-icon-yG8Bxv_k.js";import"./check-FBi4djBt.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=[["path",{d:"M12 3v18",key:"108xh3"}],["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M3 9h18",key:"1pudct"}],["path",{d:"M3 15h18",key:"5xshup"}]],h=j("Table",z),i=a=>a==null||a===""?"&ndash;":a,M=a=>{var d;const{rows:n,currentType:c,daycareName:l,teacherName:x}=a,s=document.createElement("iframe");s.style.position="absolute",s.style.width="0",s.style.height="0",s.style.border="0",s.style.visibility="hidden",document.body.appendChild(s);const o=(d=s.contentWindow)==null?void 0:d.document;if(!o){C.error("Could not initialize printing."),document.body.removeChild(s);return}const r=`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Consolidated_${c.replace(" ","_")}</title>
            <style>
                /* Landscape Orientation for Master Sheets */
                @page { size: landscape; margin: 15mm; }
                body {
                    font-family: Arial, Helvetica, sans-serif;
                    color: #000;
                    margin: 0;
                    padding: 0;
                    line-height: 1.3;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }

                /* Official Header */
                .official-header { text-align: center; margin-bottom: 20px; }
                .official-header p { margin: 2px 0; font-size: 10px; text-transform: uppercase; }
                .official-header h1 { margin: 8px 0 4px 0; font-size: 18px; font-weight: bold; text-transform: uppercase; font-family: "Times New Roman", Times, serif; }
                .official-header h2 { margin: 0; font-size: 14px; font-weight: bold; }
                .meta-info { font-size: 11px; margin-top: 5px; font-style: italic; }

                /* Data Matrix */
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 2px solid #000; font-size: 9px; }
                th, td { border: 1px solid #000; padding: 5px 4px; vertical-align: middle; }

                /* Header Rows */
                thead th { background-color: #f0f0f0; text-align: center; font-weight: bold; }
                .col-name { text-align: left; width: 15%; font-size: 10px; }
                .col-sm { width: 3%; }
                .col-domain { width: 6%; }
                .col-score { width: 7%; background-color: #e2e8f0; }
                .col-interp { width: 12%; text-align: left; font-style: italic; color: #333; } /* Added color to make dashes clear */

                /* Data Rows */
                .text-center { text-align: center; }
                .text-left { text-align: left; font-weight: bold; }

                /* Signatures */
                .signature-section { margin-top: 40px; display: flex; justify-content: space-between; padding: 0 50px; page-break-inside: avoid; }
                .sig-box { text-align: center; width: 35%; }
                .sig-line { border-bottom: 1px solid #000; margin-bottom: 5px; height: 30px; display: flex; align-items: flex-end; justify-content: center;}
                .sig-name { font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; }
                .sig-title { font-size: 10px; }

                .empty-state { text-align: center; padding: 30px; font-style: italic; color: #555; }
            </style>
        </head>
        <body>

            <div class="official-header">
                <p>Republic of the Philippines</p>
                <p>Early Childhood Care and Development Council</p>
                <h1>Class Consolidated Evaluation Report</h1>
                <h2>${l||"Daycare Center Name"}</h2>
                <div class="meta-info">Evaluation Period: ${c}</div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th rowspan="2" class="col-name">Learner's Name</th>
                        <th rowspan="2" class="col-sm">Sex</th>
                        <th rowspan="2" class="col-sm">Age<br>(Mo)</th>
                        <th colspan="7">Scaled Scores per Domain</th>
                        <th rowspan="2" class="col-score">Standard<br>Score</th>
                        <th rowspan="2" class="col-interp" style="text-align: center;">Interpretation</th>
                    </tr>
                    <tr>
                        <th class="col-domain">Gross<br>Motor</th>
                        <th class="col-domain">Fine<br>Motor</th>
                        <th class="col-domain">Self<br>Help</th>
                        <th class="col-domain">Recep.<br>Lang.</th>
                        <th class="col-domain">Expr.<br>Lang.</th>
                        <th class="col-domain">Cognitive</th>
                        <th class="col-domain">Socio-<br>Emo.</th>
                    </tr>
                </thead>
                <tbody>
                    ${n.length===0?'<tr><td colspan="12" class="empty-state">No records found for this evaluation period.</td></tr>':""}
                    ${n.map(t=>`
                        <tr>
                            <td class="text-left">${t.name}</td>
                            <td class="text-center">${t.gender?t.gender[0].toUpperCase():"&ndash;"}</td>
                            <td class="text-center">${t.age_years!==null?`${t.age_years}y ${t.age_months}m`:"&ndash;"}</td>

                            <td class="text-center">${i(t.gross_motor)}</td>
                            <td class="text-center">${i(t.fine_motor)}</td>
                            <td class="text-center">${i(t.self_help)}</td>
                            <td class="text-center">${i(t.receptive)}</td>
                            <td class="text-center">${i(t.expressive)}</td>
                            <td class="text-center">${i(t.cognitive)}</td>
                            <td class="text-center">${i(t.socio_emotional)}</td>

                            <td class="text-center font-bold" style="background-color: #f8fafc;">${i(t.standard_score)}</td>
                            <td class="col-interp" style="text-align: center;">${i(t.interpretation)}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>

            <div class="signature-section">
                <div class="sig-box">
                    <div class="sig-line">
                        ${x||"______________________________"}
                    </div>
                    <div class="sig-name"></div>
                    <div class="sig-title">Child Development Worker</div>
                </div>
                <div class="sig-box">
                    <div class="sig-line"></div>
                    <div class="sig-name"></div>
                    <div class="sig-title">Center Head / Supervisor</div>
                </div>
            </div>

        </body>
        </html>
    `;o.open(),o.write(r),o.close(),setTimeout(()=>{const t=s.contentWindow;t&&(t.focus(),t.print()),setTimeout(()=>document.body.removeChild(s),1e3)},500)};function B({rows:a,currentType:n,daycareName:c}){const{auth:l}=m().props,x=l!=null&&l.user?`${l.user.first_name} ${l.user.last_name}`:"Child Development Worker",s=()=>{M({rows:a,currentType:n,daycareName:c,teacherName:x})},o=t=>{b.get(route("teacher.reports.consolidated"),{type:t},{preserveState:!0})},r=t=>typeof t!="number"?"text-slate-400 bg-slate-50/50":t<=3?"bg-red-50 text-red-700 font-bold border-red-100":t>=13?"bg-emerald-50 text-emerald-700 font-bold border-emerald-100":"text-slate-700 bg-white",d=t=>typeof t!="number"?"text-slate-400 bg-slate-50/50":t<=79?"bg-red-100 text-red-800 font-black border-red-200":t>=110?"bg-emerald-100 text-emerald-800 font-black border-emerald-200":"bg-indigo-50 text-indigo-800 font-black border-indigo-100";return e.jsxs(u,{breadcrumbs:[{title:"Reports",href:"#"},{title:"Master Sheet",href:"#"}],children:[e.jsx(f,{title:`Consolidated Record - ${n}`}),e.jsxs("div",{className:"w-full space-y-6 p-4 sm:p-6 lg:p-8",children:[e.jsx("div",{className:"flex items-center justify-between pb-2",children:e.jsxs(g,{href:route("teacher.my-students.index"),className:"group -ml-4 flex items-center gap-2 text-slate-500 transition-colors hover:text-slate-900",children:[e.jsx($,{className:"size-4 transition-transform group-hover:-translate-x-1"}),"Back to My Students"]})}),e.jsxs("div",{className:"flex flex-col justify-between gap-6 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 sm:flex-row sm:items-center",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"flex size-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-inner",children:e.jsx(h,{className:"size-7"})}),e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-extrabold tracking-tight text-slate-900",children:"Class Consolidated Record"}),e.jsxs("p",{className:"mt-1 flex items-center gap-2 text-sm font-medium text-slate-500",children:[e.jsx(w,{className:"size-4"}),c," • ",e.jsxs("strong",{className:"text-slate-700",children:[a.length," Records"]})]})]})]}),e.jsxs("div",{className:"flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center",children:[e.jsxs(N,{value:n,onValueChange:o,children:[e.jsx(_,{className:"h-11 w-full rounded-xl border-slate-200 bg-slate-50 font-medium text-slate-700 focus:ring-indigo-500 sm:w-[220px]",children:e.jsx(y,{placeholder:"Select Assessment"})}),e.jsxs(k,{children:[e.jsx(p,{value:"1st Assessment",children:"1st Evaluation"}),e.jsx(p,{value:"2nd Assessment",children:"2nd Evaluation"}),e.jsx(p,{value:"3rd Assessment",children:"3rd Evaluation"})]})]}),e.jsxs(v,{onClick:s,className:"h-11 bg-indigo-600 text-white font-bold shadow-sm hover:bg-indigo-700",children:[e.jsx(S,{className:"w-4 h-4 mr-2"})," Print Master Sheet"]})]})]}),e.jsx("div",{className:"flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",children:e.jsx("div",{className:"overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)] min-h-[500px]",children:e.jsxs("table",{className:"w-full text-sm text-left border-collapse min-w-[1200px]",children:[e.jsx("thead",{className:"sticky top-0 z-20 bg-slate-100 shadow-sm outline outline-1 outline-slate-200",children:e.jsxs("tr",{className:"h-16",children:[e.jsx("th",{className:"px-4 sticky left-0 z-30 bg-slate-100 outline outline-1 outline-slate-200 w-[220px] text-xs font-bold tracking-widest text-slate-600 uppercase whitespace-nowrap",children:"Learner Name"}),e.jsx("th",{className:"px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase whitespace-nowrap",children:"Sex"}),e.jsxs("th",{className:"px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase whitespace-nowrap",children:["Age",e.jsx("br",{}),"(Mo)"]}),e.jsxs("th",{className:"px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase w-[90px] whitespace-nowrap",children:["Gross",e.jsx("br",{}),"Motor"]}),e.jsxs("th",{className:"px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase w-[90px] whitespace-nowrap",children:["Fine",e.jsx("br",{}),"Motor"]}),e.jsxs("th",{className:"px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase w-[90px] whitespace-nowrap",children:["Self",e.jsx("br",{}),"Help"]}),e.jsxs("th",{className:"px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase w-[90px] whitespace-nowrap",children:["Receptive",e.jsx("br",{}),"Lang."]}),e.jsxs("th",{className:"px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase w-[90px] whitespace-nowrap",children:["Expressive",e.jsx("br",{}),"Lang."]}),e.jsx("th",{className:"px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase w-[90px] whitespace-nowrap",children:"Cognitive"}),e.jsxs("th",{className:"px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase w-[90px] whitespace-nowrap",children:["Socio",e.jsx("br",{}),"Emotional"]}),e.jsxs("th",{className:"px-4 text-center text-[10px] font-extrabold tracking-widest text-indigo-700 bg-indigo-50/50 uppercase w-[110px] whitespace-nowrap",children:["Standard",e.jsx("br",{}),"Score"]}),e.jsx("th",{className:"px-4 w-[200px] text-[10px] font-bold tracking-widest text-slate-500 uppercase whitespace-nowrap",children:"Overall Interpretation"})]})}),e.jsx("tbody",{className:"divide-y divide-slate-100",children:a.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:12,className:"h-64 text-center",children:e.jsxs("div",{className:"flex flex-col items-center justify-center text-slate-400",children:[e.jsx(h,{className:"mb-4 size-10 opacity-30"}),e.jsx("p",{className:"text-base font-medium text-slate-600",children:"No records found."}),e.jsx("p",{className:"text-sm",children:"Complete evaluations in the matrix to populate this sheet."})]})})}):a.map(t=>e.jsxs("tr",{className:"h-14 hover:bg-slate-50/80 transition-colors group",children:[e.jsx("td",{className:"px-4 font-bold text-slate-900 sticky left-0 z-10 bg-white outline outline-1 outline-slate-100 group-hover:bg-slate-50 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] whitespace-nowrap",children:e.jsx("div",{className:"truncate w-[180px]",title:t.name,children:t.name})}),e.jsx("td",{className:"px-2 text-center font-medium text-slate-500 border-r border-slate-100 whitespace-nowrap",children:t.gender?t.gender[0].toUpperCase():"-"}),e.jsx("td",{className:"px-2 text-center font-medium text-slate-500 border-r border-slate-100 whitespace-nowrap",children:t.age_years!==null?`${t.age_years}y ${t.age_months}m`:"-"}),e.jsx("td",{className:`px-2 text-center border-x border-slate-100 whitespace-nowrap ${r(t.gross_motor)}`,children:t.gross_motor}),e.jsx("td",{className:`px-2 text-center border-r border-slate-100 whitespace-nowrap ${r(t.fine_motor)}`,children:t.fine_motor}),e.jsx("td",{className:`px-2 text-center border-r border-slate-100 whitespace-nowrap ${r(t.self_help)}`,children:t.self_help}),e.jsx("td",{className:`px-2 text-center border-r border-slate-100 whitespace-nowrap ${r(t.receptive)}`,children:t.receptive}),e.jsx("td",{className:`px-2 text-center border-r border-slate-100 whitespace-nowrap ${r(t.expressive)}`,children:t.expressive}),e.jsx("td",{className:`px-2 text-center border-r border-slate-100 whitespace-nowrap ${r(t.cognitive)}`,children:t.cognitive}),e.jsx("td",{className:`px-2 text-center border-r border-slate-100 whitespace-nowrap ${r(t.socio_emotional)}`,children:t.socio_emotional}),e.jsx("td",{className:`px-4 text-center border-x-2 border-indigo-100 text-lg whitespace-nowrap ${d(t.standard_score)}`,children:t.standard_score}),e.jsx("td",{className:"px-4 text-xs font-medium text-slate-600 italic bg-slate-50/30 whitespace-nowrap",children:e.jsx("div",{className:"truncate w-[180px]",title:t.interpretation,children:t.interpretation})})]},t.id))})]})})})]})]})}export{B as default};
