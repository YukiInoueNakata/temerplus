import{t as M,a as z,c as E,b as L}from"./exportImage-BjXrQ2ie.js";import{q as W}from"./App-DlyTP2Zd.js";import{c as f}from"./exportProgress-K_Yhp9rL.js";import{i as d}from"./index-x3qAuhWg.js";import"./store-DhOiyLdM.js";import"./ErrorBoundary-BIQlMtz8.js";const j=i=>L(i);function A(i){return new Promise((e,o)=>{const n=new Image;n.onload=()=>e(n),n.onerror=s=>o(s),n.src=i})}function y(i){const e=i.flatMap(t=>[t.innerX,t.innerX+t.innerWidth]),o=i.flatMap(t=>[t.innerY,t.innerY+t.innerHeight]),n=Math.min(...e),s=Math.min(...o);return{x:n,y:s,width:Math.max(...e)-n,height:Math.max(...o)-s}}async function R(i,e){var w,b,x;const o=document.getElementById(i);if(!o)throw new Error(`Element not found: #${i}`);const n=W(e.paperSize,e.customPaperWidthPx,e.customPaperHeightPx),t=1+(e.pages&&e.pages.length>1?e.pages.length:1)+1;(w=e.onProgress)==null||w.call(e,{current:0,total:t,label:d.t("printing:progress.capturingPreview")}),f(e.signal);const P=e.pages&&e.pages.length>1?y(e.pages).width:n.width*96,u=await M(o,{backgroundColor:e.background==="transparent"?void 0:"#ffffff",pixelRatio:z(o,P),filter:j(e)});f(e.signal);let l;if(e.pages&&e.pages.length>1){const r=await A(u),g=y(e.pages),h=r.width/Math.max(1,g.width),m=r.height/Math.max(1,g.height);l=[];let c=0;for(const p of e.pages){c++,f(e.signal),(b=e.onProgress)==null||b.call(e,{current:1+c,total:t,label:d.t("printing:progress.cropping",{n:c,total:e.pages.length})});const S=await E(r,g,p,h,m,e.background);l.push(S.toDataURL("image/png"))}}else l=[u];const k=`${n.width}in ${n.height}in`,$=e.background==="transparent"?"transparent":"#ffffff",v=`<!doctype html>
<html lang="${d.language}">
<head>
<meta charset="utf-8"/>
<title>${d.t("printing:window.title",{n:l.length})}</title>
<style>
  @page { size: ${k}; margin: 0; }
  html, body { margin: 0; padding: 0; background: ${$}; }
  .page {
    width: ${n.width}in;
    height: ${n.height}in;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    page-break-after: always;
    break-after: page;
    box-sizing: border-box;
  }
  .page:last-child { page-break-after: auto; break-after: auto; }
  .page img {
    max-width: 100%;
    max-height: 100%;
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
  .instructions {
    position: fixed;
    top: 8px; left: 8px;
    background: #fffbe6;
    border: 1px solid #e6c200;
    padding: 6px 10px;
    font-family: sans-serif;
    font-size: 12px;
    z-index: 9999;
  }
  /* Safari は @page の size・margin を使わず、自分の余白とヘッダ・フッタを足す。用紙ぴったりの高さだと
     はみ出して何も無いページができたので、印刷のときは印刷できる範囲（100vw × 100vh）に合わせる（2026-11-07） */
  @media print {
    .instructions { display: none; }
    .page { width: 100vw; height: 100vh; }
  }
</style>
</head>
<body>
  <div class="instructions">
    ${d.t(n.width>n.height?"printing:window.instructionsLandscape":"printing:window.instructions")}
    ${d.t("printing:window.closeHint")}
  </div>
${l.map((r,g)=>`  <div class="page"><img src="${r}" alt="page ${g+1}"/></div>`).join(`
`)}
</body>
</html>`;(x=e.onProgress)==null||x.call(e,{current:t,total:t,label:d.t("printing:progress.openWindow")});const a=e.targetWindow&&!e.targetWindow.closed?e.targetWindow:window.open("","_blank","width=960,height=720");if(!a)throw new Error(d.t("printing:error.popupBlocked"));a.document.open(),a.document.write(v),a.document.close(),await new Promise(r=>{const g=()=>{const h=Array.from(a.document.querySelectorAll("img"));if(h.length===0)return r();const m=h.filter(c=>!c.complete);if(m.length===0)return r();Promise.all(m.map(c=>new Promise(p=>{c.addEventListener("load",()=>p(),{once:!0}),c.addEventListener("error",()=>p(),{once:!0})}))).then(()=>r())};a.document.readyState==="complete"?g():a.addEventListener("load",()=>g(),{once:!0})}),a.focus(),a.print()}export{R as printDiagram};
