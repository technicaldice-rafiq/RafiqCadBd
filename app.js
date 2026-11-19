(()=>{"use strict";
const canvas=document.getElementById("cad"),ctx=canvas.getContext("2d");
const $=id=>document.getElementById(id);
let objects=[],undoStack=[],redoStack=[],tool="select",layer="0",color="#183b68",lineWidth=2,grid=true,unit="m";
let view={x:0,y:0,scale:35},draft=null,selected=-1,dragging=false,last=null,pan=false,polyPts=[];
const saveState=()=>{undoStack.push(JSON.stringify(objects));if(undoStack.length>80)undoStack.shift();redoStack=[]};
const toast=m=>{let t=$("toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)};
const resize=()=>{let r=canvas.getBoundingClientRect(),d=window.devicePixelRatio||1;canvas.width=Math.max(1,Math.round(r.width*d));canvas.height=Math.max(1,Math.round(r.height*d));ctx.setTransform(d,0,0,d,0,0);draw()};
const screenToWorld=(x,y)=>({x:(x-view.x)/view.scale,y:(y-view.y)/view.scale});
const worldToScreen=p=>({x:p.x*view.scale+view.x,y:p.y*view.scale+view.y});
function draw(){let r=canvas.getBoundingClientRect(),w=r.width,h=r.height;ctx.clearRect(0,0,w,h);ctx.fillStyle="#fff";ctx.fillRect(0,0,w,h);
 if(grid){let step=view.scale;let major=step*5;if(step>7){ctx.beginPath();ctx.strokeStyle="#e8edf2";ctx.lineWidth=1;for(let x=((view.x%step)+step)%step;x<w;x+=step){ctx.moveTo(x,0);ctx.lineTo(x,h)}for(let y=((view.y%step)+step)%step;y<h;y+=step){ctx.moveTo(0,y);ctx.lineTo(w,y)}ctx.stroke();ctx.beginPath();ctx.strokeStyle="#d4dde7";for(let x=((view.x%major)+major)%major;x<w;x+=major){ctx.moveTo(x,0);ctx.lineTo(x,h)}for(let y=((view.y%major)+major)%major;y<h;y+=major){ctx.moveTo(0,y);ctx.lineTo(w,y)}ctx.stroke()}}
 // axes
 let o=worldToScreen({x:0,y:0});ctx.strokeStyle="#9aa9b8";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(o.x,0);ctx.lineTo(o.x,h);ctx.moveTo(0,o.y);ctx.lineTo(w,o.y);ctx.stroke();
 objects.forEach((obj,i)=>drawObj(obj,i===selected));if(draft)drawObj(draft,true,true);
 updateArea();
}
function drawObj(o,sel=false,preview=false){ctx.save();ctx.strokeStyle=sel?"#e59e00":o.color||color;ctx.fillStyle=o.color||color;ctx.lineWidth=(o.width||lineWidth)+(sel?1.5:0);ctx.setLineDash(preview?[5,4]:[]);let pts=o.points||[];
 const p=pts.map(worldToScreen);
 ctx.beginPath();
 if(o.type==="line"||o.type==="dimension"){if(p.length>1){ctx.moveTo(p[0].x,p[0].y);ctx.lineTo(p[1].x,p[1].y)}}
 else if(o.type==="polyline"||o.type==="rectangle"){if(p.length){ctx.moveTo(p[0].x,p[0].y);p.slice(1).forEach(q=>ctx.lineTo(q.x,q.y));if(o.closed||o.type==="rectangle")ctx.closePath()}}
 else if(o.type==="circle"&&p.length){let rad=Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y);ctx.arc(p[0].x,p[0].y,rad,0,Math.PI*2)}
 else if(o.type==="arc"&&p.length>2){let c=p[0],a=Math.atan2(p[1].y-c.y,p[1].x-c.x),b=Math.atan2(p[2].y-c.y,p[2].x-c.x),rad=Math.hypot(p[1].x-c.x,p[1].y-c.y);ctx.arc(c.x,c.y,rad,a,b)}
 if(o.type==="text"&&p.length){ctx.font=`${Math.max(12,(o.height||0.5)*view.scale)}px Arial`;ctx.fillText(o.text||"Text",p[0].x,p[0].y)}
 else{ctx.stroke();if(o.type==="dimension"&&p.length>1){let len=dist(pts[0],pts[1]);ctx.font="12px Arial";ctx.fillText(len.toFixed(2)+" "+unit,(p[0].x+p[1].x)/2,(p[0].y+p[1].y)/2-7)}}
 if(sel&&p.length){ctx.fillStyle="#e59e00";p.forEach(q=>{ctx.fillRect(q.x-3,q.y-3,6,6)})}ctx.restore()}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function pointer(e){let r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top}}
function nearest(pt){let best=-1,bd=12;objects.forEach((o,i)=>(o.points||[]).forEach(p=>{let q=worldToScreen(p),d=Math.hypot(q.x-pt.x,q.y-pt.y);if(d<bd){bd=d;best=i}}));return best}
function hit(pt){for(let i=objects.length-1;i>=0;i--){let o=objects[i],ps=o.points||[];if(ps.some(p=>{let q=worldToScreen(p);return Math.hypot(q.x-pt.x,q.y-pt.y)<14}))return i;if(ps.length>=2){for(let j=1;j<ps.length;j++){let a=worldToScreen(ps[j-1]),b=worldToScreen(ps[j]),dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((pt.x-a.x)*dx+(pt.y-a.y)*dy)/(dx*dx+dy*dy||1))),d=Math.hypot(pt.x-a.x-t*dx,pt.y-a.y-t*dy);if(d<9)return i}}}return -1}
function setTool(t){tool=t;document.querySelectorAll(".tool").forEach(b=>b.classList.toggle("active",b.dataset.tool===t));$("toolStatus").textContent=t.toUpperCase();toast("Tool: "+t)}
document.querySelectorAll(".tool").forEach(b=>b.addEventListener("click",()=>setTool(b.dataset.tool)));
canvas.addEventListener("pointerdown",e=>{canvas.setPointerCapture(e.pointerId);let s=pointer(e),w=screenToWorld(s.x,s.y);$("coord").textContent=`X: ${w.x.toFixed(2)} · Y: ${(-w.y).toFixed(2)}`;
 if(e.button===1||e.shiftKey){pan=true;last=s;return}
 if(tool==="select"){selected=hit(s);if(selected>=0){saveState();dragging=true;last=w}else{pan=true;last=s}draw();return}
 if(tool==="delete"){let i=hit(s);if(i>=0){saveState();objects.splice(i,1);selected=-1;draw();toast("Object deleted")}return}
 if(tool==="polyline"){if(!draft){draft={type:"polyline",points:[w],color,layer,width:lineWidth};polyPts=[w]}else{draft.points.push(w);polyPts.push(w)}draw();return}
 if(tool==="text"){let txt=prompt("Enter drawing text:","Plot No.");if(txt){saveState();objects.push({type:"text",points:[w],text:txt,color,layer,height:.45,width:lineWidth});draw()}return}
 if(tool==="line"||tool==="rectangle"||tool==="circle"||tool==="dimension"){draft={type:tool,points:[w],color,layer,width:lineWidth};draw();return}
 if(tool==="arc"){if(!draft)draft={type:"arc",points:[w],color,layer,width:lineWidth};else if(draft.points.length<3){draft.points.push(w);if(draft.points.length===3){saveState();objects.push(draft);draft=null}}draw()}
});
canvas.addEventListener("pointermove",e=>{let s=pointer(e),w=screenToWorld(s.x,s.y);$("coord").textContent=`X: ${w.x.toFixed(2)} · Y: ${(-w.y).toFixed(2)}`;
 if(pan&&last){view.x+=s.x-last.x;view.y+=s.y-last.y;last=s;draw();return}
 if(dragging&&selected>=0&&last){let o=objects[selected],dx=w.x-last.x,dy=w.y-last.y;o.points=o.points.map(p=>({x:p.x+dx,y:p.y+dy}));last=w;draw();return}
 if(draft&&["line","rectangle","circle","dimension"].includes(draft.type)){if(draft.points.length===1){draft.points[1]=w;draw()}}
});
canvas.addEventListener("pointerup",e=>{let s=pointer(e),w=screenToWorld(s.x,s.y);if(pan){pan=false;last=null;return}if(dragging){dragging=false;last=null;draw();return}if(draft&&["line","rectangle","circle","dimension"].includes(draft.type)){draft.points[1]=w;if(draft.type==="rectangle"){let a=draft.points[0],b=w;draft.points=[a,{x:b.x,y:a.y},b,{x:a.x,y:b.y}];draft.closed=true}saveState();objects.push(draft);draft=null;draw()}});
canvas.addEventListener("dblclick",()=>{if(draft&&draft.type==="polyline"){saveState();draft.closed=true;objects.push(draft);draft=null;polyPts=[];draw();toast("Polyline closed")}});
canvas.addEventListener("wheel",e=>{e.preventDefault();let s=pointer(e),before=screenToWorld(s.x,s.y),factor=e.deltaY<0?1.12:.89;view.scale=Math.max(3,Math.min(250,view.scale*factor));let after=worldToScreen(before);view.x+=s.x-after.x;view.y+=s.y-after.y;draw()},{passive:false});
function updateArea(){if(selected>=0&&objects[selected]?.type==="polyline"&&objects[selected].closed){let a=polygonArea(objects[selected].points);$("areaInfo").textContent=`Area: ${a.toFixed(3)} sq ${unit} · ${(a/4046.856).toFixed(4)} acre · ${(a/40.46856).toFixed(3)} শতক`}else $("areaInfo").textContent="Select a closed polyline to calculate area."}
function polygonArea(p){let s=0;for(let i=0;i<p.length;i++){let q=p[(i+1)%p.length];s+=p[i].x*q.y-q.x*p[i].y}return Math.abs(s/2)}
$("closePolyBtn").onclick=()=>{if(draft?.type==="polyline"&&draft.points.length>=3){saveState();draft.closed=true;objects.push(draft);draft=null;draw();toast("Boundary closed")}else toast("Draw at least 3 polyline points first")};
$("color").oninput=e=>color=e.target.value;$("lineWidth").onchange=e=>lineWidth=Math.max(1,Math.min(12,+e.target.value||2));$("layerSelect").onchange=e=>layer=e.target.value;$("unit").onchange=e=>{unit=e.target.value;draw()};$("gridBtn").onclick=()=>{grid=!grid;$("gridBtn").textContent=grid?"Grid ✓":"Grid ✕";draw()};
$("undoBtn").onclick=()=>{if(undoStack.length){redoStack.push(JSON.stringify(objects));objects=JSON.parse(undoStack.pop());selected=-1;draw()}};$("redoBtn").onclick=()=>{if(redoStack.length){undoStack.push(JSON.stringify(objects));objects=JSON.parse(redoStack.pop());draw()}};
$("fitBtn").onclick=()=>{if(!objects.length){view={x:canvas.clientWidth/2,y:canvas.clientHeight/2,scale:35};draw();return}let pts=objects.flatMap(o=>o.points||[]),xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),minx=Math.min(...xs),maxx=Math.max(...xs),miny=Math.min(...ys),maxy=Math.max(...ys);let pad=45;view.scale=Math.max(3,Math.min(180,Math.min((canvas.clientWidth-pad*2)/(maxx-minx||1),(canvas.clientHeight-pad*2)/(maxy-miny||1))));view.x=canvas.clientWidth/2-(minx+maxx)/2*view.scale;view.y=canvas.clientHeight/2-(miny+maxy)/2*view.scale;draw()};
function project(){return {app:"RAFIQ LAND SURVEY CAD",version:1,unit,objects}}
function saveLocal(){localStorage.setItem("rafiqCadDrawing",JSON.stringify(project()));toast("Drawing saved on this device")}
$("saveBtn").onclick=saveLocal;
$("newBtn").onclick=()=>{if(objects.length&&!confirm("Start a new drawing? Save current work first if needed."))return;saveState();objects=[];selected=-1;draft=null;view={x:canvas.clientWidth/2,y:canvas.clientHeight/2,scale:35};draw()};
$("openBtn").onclick=()=>$("fileInput").click();
$("fileInput").onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let txt=await f.text();if(f.name.toLowerCase().endsWith(".dxf")){toast("DXF import is planned for the next engine module");return}let data=JSON.parse(txt);if(!Array.isArray(data.objects))throw Error();saveState();objects=data.objects;unit=data.unit||"m";$("unit").value=unit;selected=-1;$("fitBtn").click();toast("Drawing opened")}catch(err){toast("Could not open this file")}e.target.value=""};
function dxf(){let out=["0","SECTION","2","HEADER","9","$INSUNITS","70",unit==="ft"?"2":unit==="mm"?"4":"6","0","ENDSEC","0","SECTION","2","ENTITIES"];objects.forEach(o=>{let p=o.points||[],ly=o.layer||"0";if(o.type==="line"||o.type==="dimension"){if(p.length<2)return;out.push("0","LINE","8",ly,"10",p[0].x,"20",p[0].y,"30","0","11",p[1].x,"21",p[1].y,"31","0")}else if(o.type==="circle"&&p.length>1){out.push("0","CIRCLE","8",ly,"10",p[0].x,"20",p[0].y,"30","0","40",dist(p[0],p[1]))}else if(["polyline","rectangle"].includes(o.type)&&p.length>1){out.push("0","LWPOLYLINE","8",ly,"90",p.length,"70",o.closed||o.type==="rectangle"?"1":"0");p.forEach(q=>out.push("10",q.x,"20",q.y))}else if(o.type==="text"&&p.length){out.push("0","TEXT","8",ly,"10",p[0].x,"20",p[0].y,"30","0","40",o.height||.5,"1",o.text||"Text")}});out.push("0","ENDSEC","0","EOF");let blob=new Blob([out.join("\r\n")],{type:"application/dxf"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="rafiq-land-survey.dxf";a.click();URL.revokeObjectURL(a.href);toast("DXF exported (basic entities)") }
$("exportBtn").onclick=dxf;
$("menuBtn").onclick=()=>{let choice=prompt("Type: PDF / JSON / PRINT / ABOUT","PDF");if(!choice)return;choice=choice.toUpperCase();if(choice==="PDF"||choice==="PRINT"){window.print()}else if(choice==="JSON"){let blob=new Blob([JSON.stringify(project(),null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="rafiq-drawing.json";a.click();URL.revokeObjectURL(a.href)}else alert("RAFIQ LAND SURVEY CAD · Version 0.1 · New independent project")};
if("serviceWorker"in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js").catch(()=>{});
let local=localStorage.getItem("rafiqCadDrawing");if(local){try{let p=JSON.parse(local);objects=p.objects||[];unit=p.unit||"m";$("unit").value=unit}catch{}}
window.addEventListener("resize",resize);resize();view.x=canvas.clientWidth/2;view.y=canvas.clientHeight/2;draw();
})();