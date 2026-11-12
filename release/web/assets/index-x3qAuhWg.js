const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./App-DlyTP2Zd.js","./store-DhOiyLdM.js","./ErrorBoundary-BIQlMtz8.js","./App-CLsVoY5W.css","./CrashScreen-DH_kLMit.js"])))=>i.map(i=>d[i]);
(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function n(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(r){if(r.ep)return;r.ep=!0;const i=n(r);fetch(r.href,i)}})();const Dc="modulepreload",Lc=function(e,t){return new URL(e,t).href},Os={},li=function(t,n,o){let r=Promise.resolve();if(n&&n.length>0){const a=document.getElementsByTagName("link"),l=document.querySelector("meta[property=csp-nonce]"),s=(l==null?void 0:l.nonce)||(l==null?void 0:l.getAttribute("nonce"));r=Promise.allSettled(n.map(u=>{if(u=Lc(u,o),u in Os)return;Os[u]=!0;const p=u.endsWith(".css"),f=p?'[rel="stylesheet"]':"";if(!!o)for(let v=a.length-1;v>=0;v--){const w=a[v];if(w.href===u&&(!p||w.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${u}"]${f}`))return;const S=document.createElement("link");if(S.rel=p?"stylesheet":Dc,p||(S.as="script"),S.crossOrigin="",S.href=u,s&&S.setAttribute("nonce",s),document.head.appendChild(S),p)return new Promise((v,w)=>{S.addEventListener("load",v),S.addEventListener("error",()=>w(new Error(`Unable to preload CSS for ${u}`)))})}))}function i(a){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=a,window.dispatchEvent(l),!l.defaultPrevented)throw a}return r.then(a=>{for(const l of a||[])l.status==="rejected"&&i(l.reason);return t().catch(i)})};var Ec=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function au(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function nm(e){if(e.__esModule)return e;var t=e.default;if(typeof t=="function"){var n=function o(){return this instanceof o?Reflect.construct(t,arguments,this.constructor):t.apply(this,arguments)};n.prototype=t.prototype}else n={};return Object.defineProperty(n,"__esModule",{value:!0}),Object.keys(e).forEach(function(o){var r=Object.getOwnPropertyDescriptor(e,o);Object.defineProperty(n,o,r.get?r:{enumerable:!0,get:function(){return e[o]}})}),n}var su={exports:{}},Vr={},lu={exports:{}},j={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Ao=Symbol.for("react.element"),Tc=Symbol.for("react.portal"),Cc=Symbol.for("react.fragment"),_c=Symbol.for("react.strict_mode"),Ac=Symbol.for("react.profiler"),Ic=Symbol.for("react.provider"),Oc=Symbol.for("react.context"),Fc=Symbol.for("react.forward_ref"),Nc=Symbol.for("react.suspense"),Rc=Symbol.for("react.memo"),zc=Symbol.for("react.lazy"),Fs=Symbol.iterator;function Mc(e){return e===null||typeof e!="object"?null:(e=Fs&&e[Fs]||e["@@iterator"],typeof e=="function"?e:null)}var uu={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},du=Object.assign,cu={};function Mn(e,t,n){this.props=e,this.context=t,this.refs=cu,this.updater=n||uu}Mn.prototype.isReactComponent={};Mn.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};Mn.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function pu(){}pu.prototype=Mn.prototype;function Oa(e,t,n){this.props=e,this.context=t,this.refs=cu,this.updater=n||uu}var Fa=Oa.prototype=new pu;Fa.constructor=Oa;du(Fa,Mn.prototype);Fa.isPureReactComponent=!0;var Ns=Array.isArray,hu=Object.prototype.hasOwnProperty,Na={current:null},fu={key:!0,ref:!0,__self:!0,__source:!0};function gu(e,t,n){var o,r={},i=null,a=null;if(t!=null)for(o in t.ref!==void 0&&(a=t.ref),t.key!==void 0&&(i=""+t.key),t)hu.call(t,o)&&!fu.hasOwnProperty(o)&&(r[o]=t[o]);var l=arguments.length-2;if(l===1)r.children=n;else if(1<l){for(var s=Array(l),u=0;u<l;u++)s[u]=arguments[u+2];r.children=s}if(e&&e.defaultProps)for(o in l=e.defaultProps,l)r[o]===void 0&&(r[o]=l[o]);return{$$typeof:Ao,type:e,key:i,ref:a,props:r,_owner:Na.current}}function Gc(e,t){return{$$typeof:Ao,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}function Ra(e){return typeof e=="object"&&e!==null&&e.$$typeof===Ao}function jc(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(n){return t[n]})}var Rs=/\/+/g;function ui(e,t){return typeof e=="object"&&e!==null&&e.key!=null?jc(""+e.key):t.toString(36)}function nr(e,t,n,o,r){var i=typeof e;(i==="undefined"||i==="boolean")&&(e=null);var a=!1;if(e===null)a=!0;else switch(i){case"string":case"number":a=!0;break;case"object":switch(e.$$typeof){case Ao:case Tc:a=!0}}if(a)return a=e,r=r(a),e=o===""?"."+ui(a,0):o,Ns(r)?(n="",e!=null&&(n=e.replace(Rs,"$&/")+"/"),nr(r,t,n,"",function(u){return u})):r!=null&&(Ra(r)&&(r=Gc(r,n+(!r.key||a&&a.key===r.key?"":(""+r.key).replace(Rs,"$&/")+"/")+e)),t.push(r)),1;if(a=0,o=o===""?".":o+":",Ns(e))for(var l=0;l<e.length;l++){i=e[l];var s=o+ui(i,l);a+=nr(i,t,n,s,r)}else if(s=Mc(e),typeof s=="function")for(e=s.call(e),l=0;!(i=e.next()).done;)i=i.value,s=o+ui(i,l++),a+=nr(i,t,n,s,r);else if(i==="object")throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.");return a}function Ro(e,t,n){if(e==null)return e;var o=[],r=0;return nr(e,o,"","",function(i){return t.call(n,i,r++)}),o}function Vc(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n)},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var Ie={current:null},or={transition:null},Wc={ReactCurrentDispatcher:Ie,ReactCurrentBatchConfig:or,ReactCurrentOwner:Na};function mu(){throw Error("act(...) is not supported in production builds of React.")}j.Children={map:Ro,forEach:function(e,t,n){Ro(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return Ro(e,function(){t++}),t},toArray:function(e){return Ro(e,function(t){return t})||[]},only:function(e){if(!Ra(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};j.Component=Mn;j.Fragment=Cc;j.Profiler=Ac;j.PureComponent=Oa;j.StrictMode=_c;j.Suspense=Nc;j.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Wc;j.act=mu;j.cloneElement=function(e,t,n){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var o=du({},e.props),r=e.key,i=e.ref,a=e._owner;if(t!=null){if(t.ref!==void 0&&(i=t.ref,a=Na.current),t.key!==void 0&&(r=""+t.key),e.type&&e.type.defaultProps)var l=e.type.defaultProps;for(s in t)hu.call(t,s)&&!fu.hasOwnProperty(s)&&(o[s]=t[s]===void 0&&l!==void 0?l[s]:t[s])}var s=arguments.length-2;if(s===1)o.children=n;else if(1<s){l=Array(s);for(var u=0;u<s;u++)l[u]=arguments[u+2];o.children=l}return{$$typeof:Ao,type:e.type,key:r,ref:i,props:o,_owner:a}};j.createContext=function(e){return e={$$typeof:Oc,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:Ic,_context:e},e.Consumer=e};j.createElement=gu;j.createFactory=function(e){var t=gu.bind(null,e);return t.type=e,t};j.createRef=function(){return{current:null}};j.forwardRef=function(e){return{$$typeof:Fc,render:e}};j.isValidElement=Ra;j.lazy=function(e){return{$$typeof:zc,_payload:{_status:-1,_result:e},_init:Vc}};j.memo=function(e,t){return{$$typeof:Rc,type:e,compare:t===void 0?null:t}};j.startTransition=function(e){var t=or.transition;or.transition={};try{e()}finally{or.transition=t}};j.unstable_act=mu;j.useCallback=function(e,t){return Ie.current.useCallback(e,t)};j.useContext=function(e){return Ie.current.useContext(e)};j.useDebugValue=function(){};j.useDeferredValue=function(e){return Ie.current.useDeferredValue(e)};j.useEffect=function(e,t){return Ie.current.useEffect(e,t)};j.useId=function(){return Ie.current.useId()};j.useImperativeHandle=function(e,t,n){return Ie.current.useImperativeHandle(e,t,n)};j.useInsertionEffect=function(e,t){return Ie.current.useInsertionEffect(e,t)};j.useLayoutEffect=function(e,t){return Ie.current.useLayoutEffect(e,t)};j.useMemo=function(e,t){return Ie.current.useMemo(e,t)};j.useReducer=function(e,t,n){return Ie.current.useReducer(e,t,n)};j.useRef=function(e){return Ie.current.useRef(e)};j.useState=function(e){return Ie.current.useState(e)};j.useSyncExternalStore=function(e,t,n){return Ie.current.useSyncExternalStore(e,t,n)};j.useTransition=function(){return Ie.current.useTransition()};j.version="18.3.1";lu.exports=j;var za=lu.exports;const Uc=au(za);/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Hc=za,$c=Symbol.for("react.element"),Qc=Symbol.for("react.fragment"),Xc=Object.prototype.hasOwnProperty,Kc=Hc.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,qc={key:!0,ref:!0,__self:!0,__source:!0};function yu(e,t,n){var o,r={},i=null,a=null;n!==void 0&&(i=""+n),t.key!==void 0&&(i=""+t.key),t.ref!==void 0&&(a=t.ref);for(o in t)Xc.call(t,o)&&!qc.hasOwnProperty(o)&&(r[o]=t[o]);if(e&&e.defaultProps)for(o in t=e.defaultProps,t)r[o]===void 0&&(r[o]=t[o]);return{$$typeof:$c,type:e,key:i,ref:a,props:r,_owner:Kc.current}}Vr.Fragment=Qc;Vr.jsx=yu;Vr.jsxs=yu;su.exports=Vr;var zo=su.exports,Ri={},xu={exports:{}},He={},vu={exports:{}},Su={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(e){function t(D,k){var F=D.length;D.push(k);e:for(;0<F;){var _=F-1>>>1,N=D[_];if(0<r(N,k))D[_]=k,D[F]=N,F=_;else break e}}function n(D){return D.length===0?null:D[0]}function o(D){if(D.length===0)return null;var k=D[0],F=D.pop();if(F!==k){D[0]=F;e:for(var _=0,N=D.length,O=N>>>1;_<O;){var ce=2*(_+1)-1,Y=D[ce],K=ce+1,De=D[K];if(0>r(Y,F))K<N&&0>r(De,Y)?(D[_]=De,D[K]=F,_=K):(D[_]=Y,D[ce]=F,_=ce);else if(K<N&&0>r(De,F))D[_]=De,D[K]=F,_=K;else break e}}return k}function r(D,k){var F=D.sortIndex-k.sortIndex;return F!==0?F:D.id-k.id}if(typeof performance=="object"&&typeof performance.now=="function"){var i=performance;e.unstable_now=function(){return i.now()}}else{var a=Date,l=a.now();e.unstable_now=function(){return a.now()-l}}var s=[],u=[],p=1,f=null,c=3,S=!1,v=!1,w=!1,I=typeof setTimeout=="function"?setTimeout:null,m=typeof clearTimeout=="function"?clearTimeout:null,h=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function y(D){for(var k=n(u);k!==null;){if(k.callback===null)o(u);else if(k.startTime<=D)o(u),k.sortIndex=k.expirationTime,t(s,k);else break;k=n(u)}}function b(D){if(w=!1,y(D),!v)if(n(s)!==null)v=!0,ge(T);else{var k=n(u);k!==null&&$(b,k.startTime-D)}}function T(D,k){v=!1,w&&(w=!1,m(d),d=-1),S=!0;var F=c;try{for(y(k),f=n(s);f!==null&&(!(f.expirationTime>k)||D&&!L());){var _=f.callback;if(typeof _=="function"){f.callback=null,c=f.priorityLevel;var N=_(f.expirationTime<=k);k=e.unstable_now(),typeof N=="function"?f.callback=N:f===n(s)&&o(s),y(k)}else o(s);f=n(s)}if(f!==null)var O=!0;else{var ce=n(u);ce!==null&&$(b,ce.startTime-k),O=!1}return O}finally{f=null,c=F,S=!1}}var C=!1,P=null,d=-1,g=5,x=-1;function L(){return!(e.unstable_now()-x<g)}function E(){if(P!==null){var D=e.unstable_now();x=D;var k=!0;try{k=P(!0,D)}finally{k?M():(C=!1,P=null)}}else C=!1}var M;if(typeof h=="function")M=function(){h(E)};else if(typeof MessageChannel<"u"){var X=new MessageChannel,le=X.port2;X.port1.onmessage=E,M=function(){le.postMessage(null)}}else M=function(){I(E,0)};function ge(D){P=D,C||(C=!0,M())}function $(D,k){d=I(function(){D(e.unstable_now())},k)}e.unstable_IdlePriority=5,e.unstable_ImmediatePriority=1,e.unstable_LowPriority=4,e.unstable_NormalPriority=3,e.unstable_Profiling=null,e.unstable_UserBlockingPriority=2,e.unstable_cancelCallback=function(D){D.callback=null},e.unstable_continueExecution=function(){v||S||(v=!0,ge(T))},e.unstable_forceFrameRate=function(D){0>D||125<D?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):g=0<D?Math.floor(1e3/D):5},e.unstable_getCurrentPriorityLevel=function(){return c},e.unstable_getFirstCallbackNode=function(){return n(s)},e.unstable_next=function(D){switch(c){case 1:case 2:case 3:var k=3;break;default:k=c}var F=c;c=k;try{return D()}finally{c=F}},e.unstable_pauseExecution=function(){},e.unstable_requestPaint=function(){},e.unstable_runWithPriority=function(D,k){switch(D){case 1:case 2:case 3:case 4:case 5:break;default:D=3}var F=c;c=D;try{return k()}finally{c=F}},e.unstable_scheduleCallback=function(D,k,F){var _=e.unstable_now();switch(typeof F=="object"&&F!==null?(F=F.delay,F=typeof F=="number"&&0<F?_+F:_):F=_,D){case 1:var N=-1;break;case 2:N=250;break;case 5:N=1073741823;break;case 4:N=1e4;break;default:N=5e3}return N=F+N,D={id:p++,callback:k,priorityLevel:D,startTime:F,expirationTime:N,sortIndex:-1},F>_?(D.sortIndex=F,t(u,D),n(s)===null&&D===n(u)&&(w?(m(d),d=-1):w=!0,$(b,F-_))):(D.sortIndex=N,t(s,D),v||S||(v=!0,ge(T))),D},e.unstable_shouldYield=L,e.unstable_wrapCallback=function(D){var k=c;return function(){var F=c;c=k;try{return D.apply(this,arguments)}finally{c=F}}}})(Su);vu.exports=Su;var Yc=vu.exports;/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Jc=za,Ue=Yc;function B(e){for(var t="https://reactjs.org/docs/error-decoder.html?invariant="+e,n=1;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var wu=new Set,fo={};function sn(e,t){An(e,t),An(e+"Capture",t)}function An(e,t){for(fo[e]=t,e=0;e<t.length;e++)wu.add(t[e])}var bt=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),zi=Object.prototype.hasOwnProperty,Zc=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,zs={},Ms={};function ep(e){return zi.call(Ms,e)?!0:zi.call(zs,e)?!1:Zc.test(e)?Ms[e]=!0:(zs[e]=!0,!1)}function tp(e,t,n,o){if(n!==null&&n.type===0)return!1;switch(typeof t){case"function":case"symbol":return!0;case"boolean":return o?!1:n!==null?!n.acceptsBooleans:(e=e.toLowerCase().slice(0,5),e!=="data-"&&e!=="aria-");default:return!1}}function np(e,t,n,o){if(t===null||typeof t>"u"||tp(e,t,n,o))return!0;if(o)return!1;if(n!==null)switch(n.type){case 3:return!t;case 4:return t===!1;case 5:return isNaN(t);case 6:return isNaN(t)||1>t}return!1}function Oe(e,t,n,o,r,i,a){this.acceptsBooleans=t===2||t===3||t===4,this.attributeName=o,this.attributeNamespace=r,this.mustUseProperty=n,this.propertyName=e,this.type=t,this.sanitizeURL=i,this.removeEmptyString=a}var Be={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e){Be[e]=new Oe(e,0,!1,e,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(e){var t=e[0];Be[t]=new Oe(t,1,!1,e[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(e){Be[e]=new Oe(e,2,!1,e.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(e){Be[e]=new Oe(e,2,!1,e,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e){Be[e]=new Oe(e,3,!1,e.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(e){Be[e]=new Oe(e,3,!0,e,null,!1,!1)});["capture","download"].forEach(function(e){Be[e]=new Oe(e,4,!1,e,null,!1,!1)});["cols","rows","size","span"].forEach(function(e){Be[e]=new Oe(e,6,!1,e,null,!1,!1)});["rowSpan","start"].forEach(function(e){Be[e]=new Oe(e,5,!1,e.toLowerCase(),null,!1,!1)});var Ma=/[\-:]([a-z])/g;function Ga(e){return e[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e){var t=e.replace(Ma,Ga);Be[t]=new Oe(t,1,!1,e,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e){var t=e.replace(Ma,Ga);Be[t]=new Oe(t,1,!1,e,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(e){var t=e.replace(Ma,Ga);Be[t]=new Oe(t,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(e){Be[e]=new Oe(e,1,!1,e.toLowerCase(),null,!1,!1)});Be.xlinkHref=new Oe("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(e){Be[e]=new Oe(e,1,!1,e.toLowerCase(),null,!0,!0)});function ja(e,t,n,o){var r=Be.hasOwnProperty(t)?Be[t]:null;(r!==null?r.type!==0:o||!(2<t.length)||t[0]!=="o"&&t[0]!=="O"||t[1]!=="n"&&t[1]!=="N")&&(np(t,n,r,o)&&(n=null),o||r===null?ep(t)&&(n===null?e.removeAttribute(t):e.setAttribute(t,""+n)):r.mustUseProperty?e[r.propertyName]=n===null?r.type===3?!1:"":n:(t=r.attributeName,o=r.attributeNamespace,n===null?e.removeAttribute(t):(r=r.type,n=r===3||r===4&&n===!0?"":""+n,o?e.setAttributeNS(o,t,n):e.setAttribute(t,n))))}var Dt=Jc.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,Mo=Symbol.for("react.element"),fn=Symbol.for("react.portal"),gn=Symbol.for("react.fragment"),Va=Symbol.for("react.strict_mode"),Mi=Symbol.for("react.profiler"),bu=Symbol.for("react.provider"),ku=Symbol.for("react.context"),Wa=Symbol.for("react.forward_ref"),Gi=Symbol.for("react.suspense"),ji=Symbol.for("react.suspense_list"),Ua=Symbol.for("react.memo"),Et=Symbol.for("react.lazy"),Pu=Symbol.for("react.offscreen"),Gs=Symbol.iterator;function Un(e){return e===null||typeof e!="object"?null:(e=Gs&&e[Gs]||e["@@iterator"],typeof e=="function"?e:null)}var se=Object.assign,di;function Zn(e){if(di===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);di=t&&t[1]||""}return`
`+di+e}var ci=!1;function pi(e,t){if(!e||ci)return"";ci=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(t)if(t=function(){throw Error()},Object.defineProperty(t.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(t,[])}catch(u){var o=u}Reflect.construct(e,[],t)}else{try{t.call()}catch(u){o=u}e.call(t.prototype)}else{try{throw Error()}catch(u){o=u}e()}}catch(u){if(u&&o&&typeof u.stack=="string"){for(var r=u.stack.split(`
`),i=o.stack.split(`
`),a=r.length-1,l=i.length-1;1<=a&&0<=l&&r[a]!==i[l];)l--;for(;1<=a&&0<=l;a--,l--)if(r[a]!==i[l]){if(a!==1||l!==1)do if(a--,l--,0>l||r[a]!==i[l]){var s=`
`+r[a].replace(" at new "," at ");return e.displayName&&s.includes("<anonymous>")&&(s=s.replace("<anonymous>",e.displayName)),s}while(1<=a&&0<=l);break}}}finally{ci=!1,Error.prepareStackTrace=n}return(e=e?e.displayName||e.name:"")?Zn(e):""}function op(e){switch(e.tag){case 5:return Zn(e.type);case 16:return Zn("Lazy");case 13:return Zn("Suspense");case 19:return Zn("SuspenseList");case 0:case 2:case 15:return e=pi(e.type,!1),e;case 11:return e=pi(e.type.render,!1),e;case 1:return e=pi(e.type,!0),e;default:return""}}function Vi(e){if(e==null)return null;if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case gn:return"Fragment";case fn:return"Portal";case Mi:return"Profiler";case Va:return"StrictMode";case Gi:return"Suspense";case ji:return"SuspenseList"}if(typeof e=="object")switch(e.$$typeof){case ku:return(e.displayName||"Context")+".Consumer";case bu:return(e._context.displayName||"Context")+".Provider";case Wa:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Ua:return t=e.displayName||null,t!==null?t:Vi(e.type)||"Memo";case Et:t=e._payload,e=e._init;try{return Vi(e(t))}catch{}}return null}function rp(e){var t=e.type;switch(e.tag){case 24:return"Cache";case 9:return(t.displayName||"Context")+".Consumer";case 10:return(t._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return e=t.render,e=e.displayName||e.name||"",t.displayName||(e!==""?"ForwardRef("+e+")":"ForwardRef");case 7:return"Fragment";case 5:return t;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Vi(t);case 8:return t===Va?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t}return null}function Vt(e){switch(typeof e){case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Bu(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function ip(e){var t=Bu(e)?"checked":"value",n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t),o=""+e[t];if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var r=n.get,i=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return r.call(this)},set:function(a){o=""+a,i.call(this,a)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return o},setValue:function(a){o=""+a},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Go(e){e._valueTracker||(e._valueTracker=ip(e))}function Du(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),o="";return e&&(o=Bu(e)?e.checked?"true":"false":e.value),e=o,e!==n?(t.setValue(e),!0):!1}function fr(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function Wi(e,t){var n=t.checked;return se({},t,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??e._wrapperState.initialChecked})}function js(e,t){var n=t.defaultValue==null?"":t.defaultValue,o=t.checked!=null?t.checked:t.defaultChecked;n=Vt(t.value!=null?t.value:n),e._wrapperState={initialChecked:o,initialValue:n,controlled:t.type==="checkbox"||t.type==="radio"?t.checked!=null:t.value!=null}}function Lu(e,t){t=t.checked,t!=null&&ja(e,"checked",t,!1)}function Ui(e,t){Lu(e,t);var n=Vt(t.value),o=t.type;if(n!=null)o==="number"?(n===0&&e.value===""||e.value!=n)&&(e.value=""+n):e.value!==""+n&&(e.value=""+n);else if(o==="submit"||o==="reset"){e.removeAttribute("value");return}t.hasOwnProperty("value")?Hi(e,t.type,n):t.hasOwnProperty("defaultValue")&&Hi(e,t.type,Vt(t.defaultValue)),t.checked==null&&t.defaultChecked!=null&&(e.defaultChecked=!!t.defaultChecked)}function Vs(e,t,n){if(t.hasOwnProperty("value")||t.hasOwnProperty("defaultValue")){var o=t.type;if(!(o!=="submit"&&o!=="reset"||t.value!==void 0&&t.value!==null))return;t=""+e._wrapperState.initialValue,n||t===e.value||(e.value=t),e.defaultValue=t}n=e.name,n!==""&&(e.name=""),e.defaultChecked=!!e._wrapperState.initialChecked,n!==""&&(e.name=n)}function Hi(e,t,n){(t!=="number"||fr(e.ownerDocument)!==e)&&(n==null?e.defaultValue=""+e._wrapperState.initialValue:e.defaultValue!==""+n&&(e.defaultValue=""+n))}var eo=Array.isArray;function Dn(e,t,n,o){if(e=e.options,t){t={};for(var r=0;r<n.length;r++)t["$"+n[r]]=!0;for(n=0;n<e.length;n++)r=t.hasOwnProperty("$"+e[n].value),e[n].selected!==r&&(e[n].selected=r),r&&o&&(e[n].defaultSelected=!0)}else{for(n=""+Vt(n),t=null,r=0;r<e.length;r++){if(e[r].value===n){e[r].selected=!0,o&&(e[r].defaultSelected=!0);return}t!==null||e[r].disabled||(t=e[r])}t!==null&&(t.selected=!0)}}function $i(e,t){if(t.dangerouslySetInnerHTML!=null)throw Error(B(91));return se({},t,{value:void 0,defaultValue:void 0,children:""+e._wrapperState.initialValue})}function Ws(e,t){var n=t.value;if(n==null){if(n=t.children,t=t.defaultValue,n!=null){if(t!=null)throw Error(B(92));if(eo(n)){if(1<n.length)throw Error(B(93));n=n[0]}t=n}t==null&&(t=""),n=t}e._wrapperState={initialValue:Vt(n)}}function Eu(e,t){var n=Vt(t.value),o=Vt(t.defaultValue);n!=null&&(n=""+n,n!==e.value&&(e.value=n),t.defaultValue==null&&e.defaultValue!==n&&(e.defaultValue=n)),o!=null&&(e.defaultValue=""+o)}function Us(e){var t=e.textContent;t===e._wrapperState.initialValue&&t!==""&&t!==null&&(e.value=t)}function Tu(e){switch(e){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function Qi(e,t){return e==null||e==="http://www.w3.org/1999/xhtml"?Tu(t):e==="http://www.w3.org/2000/svg"&&t==="foreignObject"?"http://www.w3.org/1999/xhtml":e}var jo,Cu=function(e){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(t,n,o,r){MSApp.execUnsafeLocalFunction(function(){return e(t,n,o,r)})}:e}(function(e,t){if(e.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in e)e.innerHTML=t;else{for(jo=jo||document.createElement("div"),jo.innerHTML="<svg>"+t.valueOf().toString()+"</svg>",t=jo.firstChild;e.firstChild;)e.removeChild(e.firstChild);for(;t.firstChild;)e.appendChild(t.firstChild)}});function go(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var oo={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},ap=["Webkit","ms","Moz","O"];Object.keys(oo).forEach(function(e){ap.forEach(function(t){t=t+e.charAt(0).toUpperCase()+e.substring(1),oo[t]=oo[e]})});function _u(e,t,n){return t==null||typeof t=="boolean"||t===""?"":n||typeof t!="number"||t===0||oo.hasOwnProperty(e)&&oo[e]?(""+t).trim():t+"px"}function Au(e,t){e=e.style;for(var n in t)if(t.hasOwnProperty(n)){var o=n.indexOf("--")===0,r=_u(n,t[n],o);n==="float"&&(n="cssFloat"),o?e.setProperty(n,r):e[n]=r}}var sp=se({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function Xi(e,t){if(t){if(sp[e]&&(t.children!=null||t.dangerouslySetInnerHTML!=null))throw Error(B(137,e));if(t.dangerouslySetInnerHTML!=null){if(t.children!=null)throw Error(B(60));if(typeof t.dangerouslySetInnerHTML!="object"||!("__html"in t.dangerouslySetInnerHTML))throw Error(B(61))}if(t.style!=null&&typeof t.style!="object")throw Error(B(62))}}function Ki(e,t){if(e.indexOf("-")===-1)return typeof t.is=="string";switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var qi=null;function Ha(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Yi=null,Ln=null,En=null;function Hs(e){if(e=Fo(e)){if(typeof Yi!="function")throw Error(B(280));var t=e.stateNode;t&&(t=Qr(t),Yi(e.stateNode,e.type,t))}}function Iu(e){Ln?En?En.push(e):En=[e]:Ln=e}function Ou(){if(Ln){var e=Ln,t=En;if(En=Ln=null,Hs(e),t)for(e=0;e<t.length;e++)Hs(t[e])}}function Fu(e,t){return e(t)}function Nu(){}var hi=!1;function Ru(e,t,n){if(hi)return e(t,n);hi=!0;try{return Fu(e,t,n)}finally{hi=!1,(Ln!==null||En!==null)&&(Nu(),Ou())}}function mo(e,t){var n=e.stateNode;if(n===null)return null;var o=Qr(n);if(o===null)return null;n=o[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(o=!o.disabled)||(e=e.type,o=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!o;break e;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(B(231,t,typeof n));return n}var Ji=!1;if(bt)try{var Hn={};Object.defineProperty(Hn,"passive",{get:function(){Ji=!0}}),window.addEventListener("test",Hn,Hn),window.removeEventListener("test",Hn,Hn)}catch{Ji=!1}function lp(e,t,n,o,r,i,a,l,s){var u=Array.prototype.slice.call(arguments,3);try{t.apply(n,u)}catch(p){this.onError(p)}}var ro=!1,gr=null,mr=!1,Zi=null,up={onError:function(e){ro=!0,gr=e}};function dp(e,t,n,o,r,i,a,l,s){ro=!1,gr=null,lp.apply(up,arguments)}function cp(e,t,n,o,r,i,a,l,s){if(dp.apply(this,arguments),ro){if(ro){var u=gr;ro=!1,gr=null}else throw Error(B(198));mr||(mr=!0,Zi=u)}}function ln(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,t.flags&4098&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function zu(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function $s(e){if(ln(e)!==e)throw Error(B(188))}function pp(e){var t=e.alternate;if(!t){if(t=ln(e),t===null)throw Error(B(188));return t!==e?null:e}for(var n=e,o=t;;){var r=n.return;if(r===null)break;var i=r.alternate;if(i===null){if(o=r.return,o!==null){n=o;continue}break}if(r.child===i.child){for(i=r.child;i;){if(i===n)return $s(r),e;if(i===o)return $s(r),t;i=i.sibling}throw Error(B(188))}if(n.return!==o.return)n=r,o=i;else{for(var a=!1,l=r.child;l;){if(l===n){a=!0,n=r,o=i;break}if(l===o){a=!0,o=r,n=i;break}l=l.sibling}if(!a){for(l=i.child;l;){if(l===n){a=!0,n=i,o=r;break}if(l===o){a=!0,o=i,n=r;break}l=l.sibling}if(!a)throw Error(B(189))}}if(n.alternate!==o)throw Error(B(190))}if(n.tag!==3)throw Error(B(188));return n.stateNode.current===n?e:t}function Mu(e){return e=pp(e),e!==null?Gu(e):null}function Gu(e){if(e.tag===5||e.tag===6)return e;for(e=e.child;e!==null;){var t=Gu(e);if(t!==null)return t;e=e.sibling}return null}var ju=Ue.unstable_scheduleCallback,Qs=Ue.unstable_cancelCallback,hp=Ue.unstable_shouldYield,fp=Ue.unstable_requestPaint,pe=Ue.unstable_now,gp=Ue.unstable_getCurrentPriorityLevel,$a=Ue.unstable_ImmediatePriority,Vu=Ue.unstable_UserBlockingPriority,yr=Ue.unstable_NormalPriority,mp=Ue.unstable_LowPriority,Wu=Ue.unstable_IdlePriority,Wr=null,ft=null;function yp(e){if(ft&&typeof ft.onCommitFiberRoot=="function")try{ft.onCommitFiberRoot(Wr,e,void 0,(e.current.flags&128)===128)}catch{}}var rt=Math.clz32?Math.clz32:Sp,xp=Math.log,vp=Math.LN2;function Sp(e){return e>>>=0,e===0?32:31-(xp(e)/vp|0)|0}var Vo=64,Wo=4194304;function to(e){switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return e&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return e}}function xr(e,t){var n=e.pendingLanes;if(n===0)return 0;var o=0,r=e.suspendedLanes,i=e.pingedLanes,a=n&268435455;if(a!==0){var l=a&~r;l!==0?o=to(l):(i&=a,i!==0&&(o=to(i)))}else a=n&~r,a!==0?o=to(a):i!==0&&(o=to(i));if(o===0)return 0;if(t!==0&&t!==o&&!(t&r)&&(r=o&-o,i=t&-t,r>=i||r===16&&(i&4194240)!==0))return t;if(o&4&&(o|=n&16),t=e.entangledLanes,t!==0)for(e=e.entanglements,t&=o;0<t;)n=31-rt(t),r=1<<n,o|=e[n],t&=~r;return o}function wp(e,t){switch(e){case 1:case 2:case 4:return t+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function bp(e,t){for(var n=e.suspendedLanes,o=e.pingedLanes,r=e.expirationTimes,i=e.pendingLanes;0<i;){var a=31-rt(i),l=1<<a,s=r[a];s===-1?(!(l&n)||l&o)&&(r[a]=wp(l,t)):s<=t&&(e.expiredLanes|=l),i&=~l}}function ea(e){return e=e.pendingLanes&-1073741825,e!==0?e:e&1073741824?1073741824:0}function Uu(){var e=Vo;return Vo<<=1,!(Vo&4194240)&&(Vo=64),e}function fi(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function Io(e,t,n){e.pendingLanes|=t,t!==536870912&&(e.suspendedLanes=0,e.pingedLanes=0),e=e.eventTimes,t=31-rt(t),e[t]=n}function kp(e,t){var n=e.pendingLanes&~t;e.pendingLanes=t,e.suspendedLanes=0,e.pingedLanes=0,e.expiredLanes&=t,e.mutableReadLanes&=t,e.entangledLanes&=t,t=e.entanglements;var o=e.eventTimes;for(e=e.expirationTimes;0<n;){var r=31-rt(n),i=1<<r;t[r]=0,o[r]=-1,e[r]=-1,n&=~i}}function Qa(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var o=31-rt(n),r=1<<o;r&t|e[o]&t&&(e[o]|=t),n&=~r}}var q=0;function Hu(e){return e&=-e,1<e?4<e?e&268435455?16:536870912:4:1}var $u,Xa,Qu,Xu,Ku,ta=!1,Uo=[],Ot=null,Ft=null,Nt=null,yo=new Map,xo=new Map,Ct=[],Pp="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Xs(e,t){switch(e){case"focusin":case"focusout":Ot=null;break;case"dragenter":case"dragleave":Ft=null;break;case"mouseover":case"mouseout":Nt=null;break;case"pointerover":case"pointerout":yo.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":xo.delete(t.pointerId)}}function $n(e,t,n,o,r,i){return e===null||e.nativeEvent!==i?(e={blockedOn:t,domEventName:n,eventSystemFlags:o,nativeEvent:i,targetContainers:[r]},t!==null&&(t=Fo(t),t!==null&&Xa(t)),e):(e.eventSystemFlags|=o,t=e.targetContainers,r!==null&&t.indexOf(r)===-1&&t.push(r),e)}function Bp(e,t,n,o,r){switch(t){case"focusin":return Ot=$n(Ot,e,t,n,o,r),!0;case"dragenter":return Ft=$n(Ft,e,t,n,o,r),!0;case"mouseover":return Nt=$n(Nt,e,t,n,o,r),!0;case"pointerover":var i=r.pointerId;return yo.set(i,$n(yo.get(i)||null,e,t,n,o,r)),!0;case"gotpointercapture":return i=r.pointerId,xo.set(i,$n(xo.get(i)||null,e,t,n,o,r)),!0}return!1}function qu(e){var t=qt(e.target);if(t!==null){var n=ln(t);if(n!==null){if(t=n.tag,t===13){if(t=zu(n),t!==null){e.blockedOn=t,Ku(e.priority,function(){Qu(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function rr(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=na(e.domEventName,e.eventSystemFlags,t[0],e.nativeEvent);if(n===null){n=e.nativeEvent;var o=new n.constructor(n.type,n);qi=o,n.target.dispatchEvent(o),qi=null}else return t=Fo(n),t!==null&&Xa(t),e.blockedOn=n,!1;t.shift()}return!0}function Ks(e,t,n){rr(e)&&n.delete(t)}function Dp(){ta=!1,Ot!==null&&rr(Ot)&&(Ot=null),Ft!==null&&rr(Ft)&&(Ft=null),Nt!==null&&rr(Nt)&&(Nt=null),yo.forEach(Ks),xo.forEach(Ks)}function Qn(e,t){e.blockedOn===t&&(e.blockedOn=null,ta||(ta=!0,Ue.unstable_scheduleCallback(Ue.unstable_NormalPriority,Dp)))}function vo(e){function t(r){return Qn(r,e)}if(0<Uo.length){Qn(Uo[0],e);for(var n=1;n<Uo.length;n++){var o=Uo[n];o.blockedOn===e&&(o.blockedOn=null)}}for(Ot!==null&&Qn(Ot,e),Ft!==null&&Qn(Ft,e),Nt!==null&&Qn(Nt,e),yo.forEach(t),xo.forEach(t),n=0;n<Ct.length;n++)o=Ct[n],o.blockedOn===e&&(o.blockedOn=null);for(;0<Ct.length&&(n=Ct[0],n.blockedOn===null);)qu(n),n.blockedOn===null&&Ct.shift()}var Tn=Dt.ReactCurrentBatchConfig,vr=!0;function Lp(e,t,n,o){var r=q,i=Tn.transition;Tn.transition=null;try{q=1,Ka(e,t,n,o)}finally{q=r,Tn.transition=i}}function Ep(e,t,n,o){var r=q,i=Tn.transition;Tn.transition=null;try{q=4,Ka(e,t,n,o)}finally{q=r,Tn.transition=i}}function Ka(e,t,n,o){if(vr){var r=na(e,t,n,o);if(r===null)Pi(e,t,o,Sr,n),Xs(e,o);else if(Bp(r,e,t,n,o))o.stopPropagation();else if(Xs(e,o),t&4&&-1<Pp.indexOf(e)){for(;r!==null;){var i=Fo(r);if(i!==null&&$u(i),i=na(e,t,n,o),i===null&&Pi(e,t,o,Sr,n),i===r)break;r=i}r!==null&&o.stopPropagation()}else Pi(e,t,o,null,n)}}var Sr=null;function na(e,t,n,o){if(Sr=null,e=Ha(o),e=qt(e),e!==null)if(t=ln(e),t===null)e=null;else if(n=t.tag,n===13){if(e=zu(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null);return Sr=e,null}function Yu(e){switch(e){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(gp()){case $a:return 1;case Vu:return 4;case yr:case mp:return 16;case Wu:return 536870912;default:return 16}default:return 16}}var At=null,qa=null,ir=null;function Ju(){if(ir)return ir;var e,t=qa,n=t.length,o,r="value"in At?At.value:At.textContent,i=r.length;for(e=0;e<n&&t[e]===r[e];e++);var a=n-e;for(o=1;o<=a&&t[n-o]===r[i-o];o++);return ir=r.slice(e,1<o?1-o:void 0)}function ar(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Ho(){return!0}function qs(){return!1}function $e(e){function t(n,o,r,i,a){this._reactName=n,this._targetInst=r,this.type=o,this.nativeEvent=i,this.target=a,this.currentTarget=null;for(var l in e)e.hasOwnProperty(l)&&(n=e[l],this[l]=n?n(i):i[l]);return this.isDefaultPrevented=(i.defaultPrevented!=null?i.defaultPrevented:i.returnValue===!1)?Ho:qs,this.isPropagationStopped=qs,this}return se(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Ho)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Ho)},persist:function(){},isPersistent:Ho}),t}var Gn={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Ya=$e(Gn),Oo=se({},Gn,{view:0,detail:0}),Tp=$e(Oo),gi,mi,Xn,Ur=se({},Oo,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Ja,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==Xn&&(Xn&&e.type==="mousemove"?(gi=e.screenX-Xn.screenX,mi=e.screenY-Xn.screenY):mi=gi=0,Xn=e),gi)},movementY:function(e){return"movementY"in e?e.movementY:mi}}),Ys=$e(Ur),Cp=se({},Ur,{dataTransfer:0}),_p=$e(Cp),Ap=se({},Oo,{relatedTarget:0}),yi=$e(Ap),Ip=se({},Gn,{animationName:0,elapsedTime:0,pseudoElement:0}),Op=$e(Ip),Fp=se({},Gn,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),Np=$e(Fp),Rp=se({},Gn,{data:0}),Js=$e(Rp),zp={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Mp={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Gp={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function jp(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=Gp[e])?!!t[e]:!1}function Ja(){return jp}var Vp=se({},Oo,{key:function(e){if(e.key){var t=zp[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=ar(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?Mp[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Ja,charCode:function(e){return e.type==="keypress"?ar(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?ar(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),Wp=$e(Vp),Up=se({},Ur,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Zs=$e(Up),Hp=se({},Oo,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Ja}),$p=$e(Hp),Qp=se({},Gn,{propertyName:0,elapsedTime:0,pseudoElement:0}),Xp=$e(Qp),Kp=se({},Ur,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),qp=$e(Kp),Yp=[9,13,27,32],Za=bt&&"CompositionEvent"in window,io=null;bt&&"documentMode"in document&&(io=document.documentMode);var Jp=bt&&"TextEvent"in window&&!io,Zu=bt&&(!Za||io&&8<io&&11>=io),el=" ",tl=!1;function ed(e,t){switch(e){case"keyup":return Yp.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function td(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var mn=!1;function Zp(e,t){switch(e){case"compositionend":return td(t);case"keypress":return t.which!==32?null:(tl=!0,el);case"textInput":return e=t.data,e===el&&tl?null:e;default:return null}}function eh(e,t){if(mn)return e==="compositionend"||!Za&&ed(e,t)?(e=Ju(),ir=qa=At=null,mn=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Zu&&t.locale!=="ko"?null:t.data;default:return null}}var th={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function nl(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!th[e.type]:t==="textarea"}function nd(e,t,n,o){Iu(o),t=wr(t,"onChange"),0<t.length&&(n=new Ya("onChange","change",null,n,o),e.push({event:n,listeners:t}))}var ao=null,So=null;function nh(e){hd(e,0)}function Hr(e){var t=vn(e);if(Du(t))return e}function oh(e,t){if(e==="change")return t}var od=!1;if(bt){var xi;if(bt){var vi="oninput"in document;if(!vi){var ol=document.createElement("div");ol.setAttribute("oninput","return;"),vi=typeof ol.oninput=="function"}xi=vi}else xi=!1;od=xi&&(!document.documentMode||9<document.documentMode)}function rl(){ao&&(ao.detachEvent("onpropertychange",rd),So=ao=null)}function rd(e){if(e.propertyName==="value"&&Hr(So)){var t=[];nd(t,So,e,Ha(e)),Ru(nh,t)}}function rh(e,t,n){e==="focusin"?(rl(),ao=t,So=n,ao.attachEvent("onpropertychange",rd)):e==="focusout"&&rl()}function ih(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return Hr(So)}function ah(e,t){if(e==="click")return Hr(t)}function sh(e,t){if(e==="input"||e==="change")return Hr(t)}function lh(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var at=typeof Object.is=="function"?Object.is:lh;function wo(e,t){if(at(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),o=Object.keys(t);if(n.length!==o.length)return!1;for(o=0;o<n.length;o++){var r=n[o];if(!zi.call(t,r)||!at(e[r],t[r]))return!1}return!0}function il(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function al(e,t){var n=il(e);e=0;for(var o;n;){if(n.nodeType===3){if(o=e+n.textContent.length,e<=t&&o>=t)return{node:n,offset:t-e};e=o}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=il(n)}}function id(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?id(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function ad(){for(var e=window,t=fr();t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=fr(e.document)}return t}function es(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}function uh(e){var t=ad(),n=e.focusedElem,o=e.selectionRange;if(t!==n&&n&&n.ownerDocument&&id(n.ownerDocument.documentElement,n)){if(o!==null&&es(n)){if(t=o.start,e=o.end,e===void 0&&(e=t),"selectionStart"in n)n.selectionStart=t,n.selectionEnd=Math.min(e,n.value.length);else if(e=(t=n.ownerDocument||document)&&t.defaultView||window,e.getSelection){e=e.getSelection();var r=n.textContent.length,i=Math.min(o.start,r);o=o.end===void 0?i:Math.min(o.end,r),!e.extend&&i>o&&(r=o,o=i,i=r),r=al(n,i);var a=al(n,o);r&&a&&(e.rangeCount!==1||e.anchorNode!==r.node||e.anchorOffset!==r.offset||e.focusNode!==a.node||e.focusOffset!==a.offset)&&(t=t.createRange(),t.setStart(r.node,r.offset),e.removeAllRanges(),i>o?(e.addRange(t),e.extend(a.node,a.offset)):(t.setEnd(a.node,a.offset),e.addRange(t)))}}for(t=[],e=n;e=e.parentNode;)e.nodeType===1&&t.push({element:e,left:e.scrollLeft,top:e.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<t.length;n++)e=t[n],e.element.scrollLeft=e.left,e.element.scrollTop=e.top}}var dh=bt&&"documentMode"in document&&11>=document.documentMode,yn=null,oa=null,so=null,ra=!1;function sl(e,t,n){var o=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;ra||yn==null||yn!==fr(o)||(o=yn,"selectionStart"in o&&es(o)?o={start:o.selectionStart,end:o.selectionEnd}:(o=(o.ownerDocument&&o.ownerDocument.defaultView||window).getSelection(),o={anchorNode:o.anchorNode,anchorOffset:o.anchorOffset,focusNode:o.focusNode,focusOffset:o.focusOffset}),so&&wo(so,o)||(so=o,o=wr(oa,"onSelect"),0<o.length&&(t=new Ya("onSelect","select",null,t,n),e.push({event:t,listeners:o}),t.target=yn)))}function $o(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var xn={animationend:$o("Animation","AnimationEnd"),animationiteration:$o("Animation","AnimationIteration"),animationstart:$o("Animation","AnimationStart"),transitionend:$o("Transition","TransitionEnd")},Si={},sd={};bt&&(sd=document.createElement("div").style,"AnimationEvent"in window||(delete xn.animationend.animation,delete xn.animationiteration.animation,delete xn.animationstart.animation),"TransitionEvent"in window||delete xn.transitionend.transition);function $r(e){if(Si[e])return Si[e];if(!xn[e])return e;var t=xn[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in sd)return Si[e]=t[n];return e}var ld=$r("animationend"),ud=$r("animationiteration"),dd=$r("animationstart"),cd=$r("transitionend"),pd=new Map,ll="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Ut(e,t){pd.set(e,t),sn(t,[e])}for(var wi=0;wi<ll.length;wi++){var bi=ll[wi],ch=bi.toLowerCase(),ph=bi[0].toUpperCase()+bi.slice(1);Ut(ch,"on"+ph)}Ut(ld,"onAnimationEnd");Ut(ud,"onAnimationIteration");Ut(dd,"onAnimationStart");Ut("dblclick","onDoubleClick");Ut("focusin","onFocus");Ut("focusout","onBlur");Ut(cd,"onTransitionEnd");An("onMouseEnter",["mouseout","mouseover"]);An("onMouseLeave",["mouseout","mouseover"]);An("onPointerEnter",["pointerout","pointerover"]);An("onPointerLeave",["pointerout","pointerover"]);sn("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));sn("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));sn("onBeforeInput",["compositionend","keypress","textInput","paste"]);sn("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));sn("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));sn("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var no="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),hh=new Set("cancel close invalid load scroll toggle".split(" ").concat(no));function ul(e,t,n){var o=e.type||"unknown-event";e.currentTarget=n,cp(o,t,void 0,e),e.currentTarget=null}function hd(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var o=e[n],r=o.event;o=o.listeners;e:{var i=void 0;if(t)for(var a=o.length-1;0<=a;a--){var l=o[a],s=l.instance,u=l.currentTarget;if(l=l.listener,s!==i&&r.isPropagationStopped())break e;ul(r,l,u),i=s}else for(a=0;a<o.length;a++){if(l=o[a],s=l.instance,u=l.currentTarget,l=l.listener,s!==i&&r.isPropagationStopped())break e;ul(r,l,u),i=s}}}if(mr)throw e=Zi,mr=!1,Zi=null,e}function te(e,t){var n=t[ua];n===void 0&&(n=t[ua]=new Set);var o=e+"__bubble";n.has(o)||(fd(t,e,2,!1),n.add(o))}function ki(e,t,n){var o=0;t&&(o|=4),fd(n,e,o,t)}var Qo="_reactListening"+Math.random().toString(36).slice(2);function bo(e){if(!e[Qo]){e[Qo]=!0,wu.forEach(function(n){n!=="selectionchange"&&(hh.has(n)||ki(n,!1,e),ki(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[Qo]||(t[Qo]=!0,ki("selectionchange",!1,t))}}function fd(e,t,n,o){switch(Yu(t)){case 1:var r=Lp;break;case 4:r=Ep;break;default:r=Ka}n=r.bind(null,t,n,e),r=void 0,!Ji||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(r=!0),o?r!==void 0?e.addEventListener(t,n,{capture:!0,passive:r}):e.addEventListener(t,n,!0):r!==void 0?e.addEventListener(t,n,{passive:r}):e.addEventListener(t,n,!1)}function Pi(e,t,n,o,r){var i=o;if(!(t&1)&&!(t&2)&&o!==null)e:for(;;){if(o===null)return;var a=o.tag;if(a===3||a===4){var l=o.stateNode.containerInfo;if(l===r||l.nodeType===8&&l.parentNode===r)break;if(a===4)for(a=o.return;a!==null;){var s=a.tag;if((s===3||s===4)&&(s=a.stateNode.containerInfo,s===r||s.nodeType===8&&s.parentNode===r))return;a=a.return}for(;l!==null;){if(a=qt(l),a===null)return;if(s=a.tag,s===5||s===6){o=i=a;continue e}l=l.parentNode}}o=o.return}Ru(function(){var u=i,p=Ha(n),f=[];e:{var c=pd.get(e);if(c!==void 0){var S=Ya,v=e;switch(e){case"keypress":if(ar(n)===0)break e;case"keydown":case"keyup":S=Wp;break;case"focusin":v="focus",S=yi;break;case"focusout":v="blur",S=yi;break;case"beforeblur":case"afterblur":S=yi;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":S=Ys;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":S=_p;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":S=$p;break;case ld:case ud:case dd:S=Op;break;case cd:S=Xp;break;case"scroll":S=Tp;break;case"wheel":S=qp;break;case"copy":case"cut":case"paste":S=Np;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":S=Zs}var w=(t&4)!==0,I=!w&&e==="scroll",m=w?c!==null?c+"Capture":null:c;w=[];for(var h=u,y;h!==null;){y=h;var b=y.stateNode;if(y.tag===5&&b!==null&&(y=b,m!==null&&(b=mo(h,m),b!=null&&w.push(ko(h,b,y)))),I)break;h=h.return}0<w.length&&(c=new S(c,v,null,n,p),f.push({event:c,listeners:w}))}}if(!(t&7)){e:{if(c=e==="mouseover"||e==="pointerover",S=e==="mouseout"||e==="pointerout",c&&n!==qi&&(v=n.relatedTarget||n.fromElement)&&(qt(v)||v[kt]))break e;if((S||c)&&(c=p.window===p?p:(c=p.ownerDocument)?c.defaultView||c.parentWindow:window,S?(v=n.relatedTarget||n.toElement,S=u,v=v?qt(v):null,v!==null&&(I=ln(v),v!==I||v.tag!==5&&v.tag!==6)&&(v=null)):(S=null,v=u),S!==v)){if(w=Ys,b="onMouseLeave",m="onMouseEnter",h="mouse",(e==="pointerout"||e==="pointerover")&&(w=Zs,b="onPointerLeave",m="onPointerEnter",h="pointer"),I=S==null?c:vn(S),y=v==null?c:vn(v),c=new w(b,h+"leave",S,n,p),c.target=I,c.relatedTarget=y,b=null,qt(p)===u&&(w=new w(m,h+"enter",v,n,p),w.target=y,w.relatedTarget=I,b=w),I=b,S&&v)t:{for(w=S,m=v,h=0,y=w;y;y=cn(y))h++;for(y=0,b=m;b;b=cn(b))y++;for(;0<h-y;)w=cn(w),h--;for(;0<y-h;)m=cn(m),y--;for(;h--;){if(w===m||m!==null&&w===m.alternate)break t;w=cn(w),m=cn(m)}w=null}else w=null;S!==null&&dl(f,c,S,w,!1),v!==null&&I!==null&&dl(f,I,v,w,!0)}}e:{if(c=u?vn(u):window,S=c.nodeName&&c.nodeName.toLowerCase(),S==="select"||S==="input"&&c.type==="file")var T=oh;else if(nl(c))if(od)T=sh;else{T=ih;var C=rh}else(S=c.nodeName)&&S.toLowerCase()==="input"&&(c.type==="checkbox"||c.type==="radio")&&(T=ah);if(T&&(T=T(e,u))){nd(f,T,n,p);break e}C&&C(e,c,u),e==="focusout"&&(C=c._wrapperState)&&C.controlled&&c.type==="number"&&Hi(c,"number",c.value)}switch(C=u?vn(u):window,e){case"focusin":(nl(C)||C.contentEditable==="true")&&(yn=C,oa=u,so=null);break;case"focusout":so=oa=yn=null;break;case"mousedown":ra=!0;break;case"contextmenu":case"mouseup":case"dragend":ra=!1,sl(f,n,p);break;case"selectionchange":if(dh)break;case"keydown":case"keyup":sl(f,n,p)}var P;if(Za)e:{switch(e){case"compositionstart":var d="onCompositionStart";break e;case"compositionend":d="onCompositionEnd";break e;case"compositionupdate":d="onCompositionUpdate";break e}d=void 0}else mn?ed(e,n)&&(d="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(d="onCompositionStart");d&&(Zu&&n.locale!=="ko"&&(mn||d!=="onCompositionStart"?d==="onCompositionEnd"&&mn&&(P=Ju()):(At=p,qa="value"in At?At.value:At.textContent,mn=!0)),C=wr(u,d),0<C.length&&(d=new Js(d,e,null,n,p),f.push({event:d,listeners:C}),P?d.data=P:(P=td(n),P!==null&&(d.data=P)))),(P=Jp?Zp(e,n):eh(e,n))&&(u=wr(u,"onBeforeInput"),0<u.length&&(p=new Js("onBeforeInput","beforeinput",null,n,p),f.push({event:p,listeners:u}),p.data=P))}hd(f,t)})}function ko(e,t,n){return{instance:e,listener:t,currentTarget:n}}function wr(e,t){for(var n=t+"Capture",o=[];e!==null;){var r=e,i=r.stateNode;r.tag===5&&i!==null&&(r=i,i=mo(e,n),i!=null&&o.unshift(ko(e,i,r)),i=mo(e,t),i!=null&&o.push(ko(e,i,r))),e=e.return}return o}function cn(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5);return e||null}function dl(e,t,n,o,r){for(var i=t._reactName,a=[];n!==null&&n!==o;){var l=n,s=l.alternate,u=l.stateNode;if(s!==null&&s===o)break;l.tag===5&&u!==null&&(l=u,r?(s=mo(n,i),s!=null&&a.unshift(ko(n,s,l))):r||(s=mo(n,i),s!=null&&a.push(ko(n,s,l)))),n=n.return}a.length!==0&&e.push({event:t,listeners:a})}var fh=/\r\n?/g,gh=/\u0000|\uFFFD/g;function cl(e){return(typeof e=="string"?e:""+e).replace(fh,`
`).replace(gh,"")}function Xo(e,t,n){if(t=cl(t),cl(e)!==t&&n)throw Error(B(425))}function br(){}var ia=null,aa=null;function sa(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var la=typeof setTimeout=="function"?setTimeout:void 0,mh=typeof clearTimeout=="function"?clearTimeout:void 0,pl=typeof Promise=="function"?Promise:void 0,yh=typeof queueMicrotask=="function"?queueMicrotask:typeof pl<"u"?function(e){return pl.resolve(null).then(e).catch(xh)}:la;function xh(e){setTimeout(function(){throw e})}function Bi(e,t){var n=t,o=0;do{var r=n.nextSibling;if(e.removeChild(n),r&&r.nodeType===8)if(n=r.data,n==="/$"){if(o===0){e.removeChild(r),vo(t);return}o--}else n!=="$"&&n!=="$?"&&n!=="$!"||o++;n=r}while(n);vo(t)}function Rt(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?")break;if(t==="/$")return null}}return e}function hl(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"){if(t===0)return e;t--}else n==="/$"&&t++}e=e.previousSibling}return null}var jn=Math.random().toString(36).slice(2),pt="__reactFiber$"+jn,Po="__reactProps$"+jn,kt="__reactContainer$"+jn,ua="__reactEvents$"+jn,vh="__reactListeners$"+jn,Sh="__reactHandles$"+jn;function qt(e){var t=e[pt];if(t)return t;for(var n=e.parentNode;n;){if(t=n[kt]||n[pt]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=hl(e);e!==null;){if(n=e[pt])return n;e=hl(e)}return t}e=n,n=e.parentNode}return null}function Fo(e){return e=e[pt]||e[kt],!e||e.tag!==5&&e.tag!==6&&e.tag!==13&&e.tag!==3?null:e}function vn(e){if(e.tag===5||e.tag===6)return e.stateNode;throw Error(B(33))}function Qr(e){return e[Po]||null}var da=[],Sn=-1;function Ht(e){return{current:e}}function ne(e){0>Sn||(e.current=da[Sn],da[Sn]=null,Sn--)}function ee(e,t){Sn++,da[Sn]=e.current,e.current=t}var Wt={},Ce=Ht(Wt),ze=Ht(!1),tn=Wt;function In(e,t){var n=e.type.contextTypes;if(!n)return Wt;var o=e.stateNode;if(o&&o.__reactInternalMemoizedUnmaskedChildContext===t)return o.__reactInternalMemoizedMaskedChildContext;var r={},i;for(i in n)r[i]=t[i];return o&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=t,e.__reactInternalMemoizedMaskedChildContext=r),r}function Me(e){return e=e.childContextTypes,e!=null}function kr(){ne(ze),ne(Ce)}function fl(e,t,n){if(Ce.current!==Wt)throw Error(B(168));ee(Ce,t),ee(ze,n)}function gd(e,t,n){var o=e.stateNode;if(t=t.childContextTypes,typeof o.getChildContext!="function")return n;o=o.getChildContext();for(var r in o)if(!(r in t))throw Error(B(108,rp(e)||"Unknown",r));return se({},n,o)}function Pr(e){return e=(e=e.stateNode)&&e.__reactInternalMemoizedMergedChildContext||Wt,tn=Ce.current,ee(Ce,e),ee(ze,ze.current),!0}function gl(e,t,n){var o=e.stateNode;if(!o)throw Error(B(169));n?(e=gd(e,t,tn),o.__reactInternalMemoizedMergedChildContext=e,ne(ze),ne(Ce),ee(Ce,e)):ne(ze),ee(ze,n)}var xt=null,Xr=!1,Di=!1;function md(e){xt===null?xt=[e]:xt.push(e)}function wh(e){Xr=!0,md(e)}function $t(){if(!Di&&xt!==null){Di=!0;var e=0,t=q;try{var n=xt;for(q=1;e<n.length;e++){var o=n[e];do o=o(!0);while(o!==null)}xt=null,Xr=!1}catch(r){throw xt!==null&&(xt=xt.slice(e+1)),ju($a,$t),r}finally{q=t,Di=!1}}return null}var wn=[],bn=0,Br=null,Dr=0,Qe=[],Xe=0,nn=null,vt=1,St="";function Xt(e,t){wn[bn++]=Dr,wn[bn++]=Br,Br=e,Dr=t}function yd(e,t,n){Qe[Xe++]=vt,Qe[Xe++]=St,Qe[Xe++]=nn,nn=e;var o=vt;e=St;var r=32-rt(o)-1;o&=~(1<<r),n+=1;var i=32-rt(t)+r;if(30<i){var a=r-r%5;i=(o&(1<<a)-1).toString(32),o>>=a,r-=a,vt=1<<32-rt(t)+r|n<<r|o,St=i+e}else vt=1<<i|n<<r|o,St=e}function ts(e){e.return!==null&&(Xt(e,1),yd(e,1,0))}function ns(e){for(;e===Br;)Br=wn[--bn],wn[bn]=null,Dr=wn[--bn],wn[bn]=null;for(;e===nn;)nn=Qe[--Xe],Qe[Xe]=null,St=Qe[--Xe],Qe[Xe]=null,vt=Qe[--Xe],Qe[Xe]=null}var We=null,Ve=null,oe=!1,ot=null;function xd(e,t){var n=Ke(5,null,null,0);n.elementType="DELETED",n.stateNode=t,n.return=e,t=e.deletions,t===null?(e.deletions=[n],e.flags|=16):t.push(n)}function ml(e,t){switch(e.tag){case 5:var n=e.type;return t=t.nodeType!==1||n.toLowerCase()!==t.nodeName.toLowerCase()?null:t,t!==null?(e.stateNode=t,We=e,Ve=Rt(t.firstChild),!0):!1;case 6:return t=e.pendingProps===""||t.nodeType!==3?null:t,t!==null?(e.stateNode=t,We=e,Ve=null,!0):!1;case 13:return t=t.nodeType!==8?null:t,t!==null?(n=nn!==null?{id:vt,overflow:St}:null,e.memoizedState={dehydrated:t,treeContext:n,retryLane:1073741824},n=Ke(18,null,null,0),n.stateNode=t,n.return=e,e.child=n,We=e,Ve=null,!0):!1;default:return!1}}function ca(e){return(e.mode&1)!==0&&(e.flags&128)===0}function pa(e){if(oe){var t=Ve;if(t){var n=t;if(!ml(e,t)){if(ca(e))throw Error(B(418));t=Rt(n.nextSibling);var o=We;t&&ml(e,t)?xd(o,n):(e.flags=e.flags&-4097|2,oe=!1,We=e)}}else{if(ca(e))throw Error(B(418));e.flags=e.flags&-4097|2,oe=!1,We=e}}}function yl(e){for(e=e.return;e!==null&&e.tag!==5&&e.tag!==3&&e.tag!==13;)e=e.return;We=e}function Ko(e){if(e!==We)return!1;if(!oe)return yl(e),oe=!0,!1;var t;if((t=e.tag!==3)&&!(t=e.tag!==5)&&(t=e.type,t=t!=="head"&&t!=="body"&&!sa(e.type,e.memoizedProps)),t&&(t=Ve)){if(ca(e))throw vd(),Error(B(418));for(;t;)xd(e,t),t=Rt(t.nextSibling)}if(yl(e),e.tag===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(B(317));e:{for(e=e.nextSibling,t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"){if(t===0){Ve=Rt(e.nextSibling);break e}t--}else n!=="$"&&n!=="$!"&&n!=="$?"||t++}e=e.nextSibling}Ve=null}}else Ve=We?Rt(e.stateNode.nextSibling):null;return!0}function vd(){for(var e=Ve;e;)e=Rt(e.nextSibling)}function On(){Ve=We=null,oe=!1}function os(e){ot===null?ot=[e]:ot.push(e)}var bh=Dt.ReactCurrentBatchConfig;function Kn(e,t,n){if(e=n.ref,e!==null&&typeof e!="function"&&typeof e!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(B(309));var o=n.stateNode}if(!o)throw Error(B(147,e));var r=o,i=""+e;return t!==null&&t.ref!==null&&typeof t.ref=="function"&&t.ref._stringRef===i?t.ref:(t=function(a){var l=r.refs;a===null?delete l[i]:l[i]=a},t._stringRef=i,t)}if(typeof e!="string")throw Error(B(284));if(!n._owner)throw Error(B(290,e))}return e}function qo(e,t){throw e=Object.prototype.toString.call(t),Error(B(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e))}function xl(e){var t=e._init;return t(e._payload)}function Sd(e){function t(m,h){if(e){var y=m.deletions;y===null?(m.deletions=[h],m.flags|=16):y.push(h)}}function n(m,h){if(!e)return null;for(;h!==null;)t(m,h),h=h.sibling;return null}function o(m,h){for(m=new Map;h!==null;)h.key!==null?m.set(h.key,h):m.set(h.index,h),h=h.sibling;return m}function r(m,h){return m=jt(m,h),m.index=0,m.sibling=null,m}function i(m,h,y){return m.index=y,e?(y=m.alternate,y!==null?(y=y.index,y<h?(m.flags|=2,h):y):(m.flags|=2,h)):(m.flags|=1048576,h)}function a(m){return e&&m.alternate===null&&(m.flags|=2),m}function l(m,h,y,b){return h===null||h.tag!==6?(h=Ii(y,m.mode,b),h.return=m,h):(h=r(h,y),h.return=m,h)}function s(m,h,y,b){var T=y.type;return T===gn?p(m,h,y.props.children,b,y.key):h!==null&&(h.elementType===T||typeof T=="object"&&T!==null&&T.$$typeof===Et&&xl(T)===h.type)?(b=r(h,y.props),b.ref=Kn(m,h,y),b.return=m,b):(b=hr(y.type,y.key,y.props,null,m.mode,b),b.ref=Kn(m,h,y),b.return=m,b)}function u(m,h,y,b){return h===null||h.tag!==4||h.stateNode.containerInfo!==y.containerInfo||h.stateNode.implementation!==y.implementation?(h=Oi(y,m.mode,b),h.return=m,h):(h=r(h,y.children||[]),h.return=m,h)}function p(m,h,y,b,T){return h===null||h.tag!==7?(h=en(y,m.mode,b,T),h.return=m,h):(h=r(h,y),h.return=m,h)}function f(m,h,y){if(typeof h=="string"&&h!==""||typeof h=="number")return h=Ii(""+h,m.mode,y),h.return=m,h;if(typeof h=="object"&&h!==null){switch(h.$$typeof){case Mo:return y=hr(h.type,h.key,h.props,null,m.mode,y),y.ref=Kn(m,null,h),y.return=m,y;case fn:return h=Oi(h,m.mode,y),h.return=m,h;case Et:var b=h._init;return f(m,b(h._payload),y)}if(eo(h)||Un(h))return h=en(h,m.mode,y,null),h.return=m,h;qo(m,h)}return null}function c(m,h,y,b){var T=h!==null?h.key:null;if(typeof y=="string"&&y!==""||typeof y=="number")return T!==null?null:l(m,h,""+y,b);if(typeof y=="object"&&y!==null){switch(y.$$typeof){case Mo:return y.key===T?s(m,h,y,b):null;case fn:return y.key===T?u(m,h,y,b):null;case Et:return T=y._init,c(m,h,T(y._payload),b)}if(eo(y)||Un(y))return T!==null?null:p(m,h,y,b,null);qo(m,y)}return null}function S(m,h,y,b,T){if(typeof b=="string"&&b!==""||typeof b=="number")return m=m.get(y)||null,l(h,m,""+b,T);if(typeof b=="object"&&b!==null){switch(b.$$typeof){case Mo:return m=m.get(b.key===null?y:b.key)||null,s(h,m,b,T);case fn:return m=m.get(b.key===null?y:b.key)||null,u(h,m,b,T);case Et:var C=b._init;return S(m,h,y,C(b._payload),T)}if(eo(b)||Un(b))return m=m.get(y)||null,p(h,m,b,T,null);qo(h,b)}return null}function v(m,h,y,b){for(var T=null,C=null,P=h,d=h=0,g=null;P!==null&&d<y.length;d++){P.index>d?(g=P,P=null):g=P.sibling;var x=c(m,P,y[d],b);if(x===null){P===null&&(P=g);break}e&&P&&x.alternate===null&&t(m,P),h=i(x,h,d),C===null?T=x:C.sibling=x,C=x,P=g}if(d===y.length)return n(m,P),oe&&Xt(m,d),T;if(P===null){for(;d<y.length;d++)P=f(m,y[d],b),P!==null&&(h=i(P,h,d),C===null?T=P:C.sibling=P,C=P);return oe&&Xt(m,d),T}for(P=o(m,P);d<y.length;d++)g=S(P,m,d,y[d],b),g!==null&&(e&&g.alternate!==null&&P.delete(g.key===null?d:g.key),h=i(g,h,d),C===null?T=g:C.sibling=g,C=g);return e&&P.forEach(function(L){return t(m,L)}),oe&&Xt(m,d),T}function w(m,h,y,b){var T=Un(y);if(typeof T!="function")throw Error(B(150));if(y=T.call(y),y==null)throw Error(B(151));for(var C=T=null,P=h,d=h=0,g=null,x=y.next();P!==null&&!x.done;d++,x=y.next()){P.index>d?(g=P,P=null):g=P.sibling;var L=c(m,P,x.value,b);if(L===null){P===null&&(P=g);break}e&&P&&L.alternate===null&&t(m,P),h=i(L,h,d),C===null?T=L:C.sibling=L,C=L,P=g}if(x.done)return n(m,P),oe&&Xt(m,d),T;if(P===null){for(;!x.done;d++,x=y.next())x=f(m,x.value,b),x!==null&&(h=i(x,h,d),C===null?T=x:C.sibling=x,C=x);return oe&&Xt(m,d),T}for(P=o(m,P);!x.done;d++,x=y.next())x=S(P,m,d,x.value,b),x!==null&&(e&&x.alternate!==null&&P.delete(x.key===null?d:x.key),h=i(x,h,d),C===null?T=x:C.sibling=x,C=x);return e&&P.forEach(function(E){return t(m,E)}),oe&&Xt(m,d),T}function I(m,h,y,b){if(typeof y=="object"&&y!==null&&y.type===gn&&y.key===null&&(y=y.props.children),typeof y=="object"&&y!==null){switch(y.$$typeof){case Mo:e:{for(var T=y.key,C=h;C!==null;){if(C.key===T){if(T=y.type,T===gn){if(C.tag===7){n(m,C.sibling),h=r(C,y.props.children),h.return=m,m=h;break e}}else if(C.elementType===T||typeof T=="object"&&T!==null&&T.$$typeof===Et&&xl(T)===C.type){n(m,C.sibling),h=r(C,y.props),h.ref=Kn(m,C,y),h.return=m,m=h;break e}n(m,C);break}else t(m,C);C=C.sibling}y.type===gn?(h=en(y.props.children,m.mode,b,y.key),h.return=m,m=h):(b=hr(y.type,y.key,y.props,null,m.mode,b),b.ref=Kn(m,h,y),b.return=m,m=b)}return a(m);case fn:e:{for(C=y.key;h!==null;){if(h.key===C)if(h.tag===4&&h.stateNode.containerInfo===y.containerInfo&&h.stateNode.implementation===y.implementation){n(m,h.sibling),h=r(h,y.children||[]),h.return=m,m=h;break e}else{n(m,h);break}else t(m,h);h=h.sibling}h=Oi(y,m.mode,b),h.return=m,m=h}return a(m);case Et:return C=y._init,I(m,h,C(y._payload),b)}if(eo(y))return v(m,h,y,b);if(Un(y))return w(m,h,y,b);qo(m,y)}return typeof y=="string"&&y!==""||typeof y=="number"?(y=""+y,h!==null&&h.tag===6?(n(m,h.sibling),h=r(h,y),h.return=m,m=h):(n(m,h),h=Ii(y,m.mode,b),h.return=m,m=h),a(m)):n(m,h)}return I}var Fn=Sd(!0),wd=Sd(!1),Lr=Ht(null),Er=null,kn=null,rs=null;function is(){rs=kn=Er=null}function as(e){var t=Lr.current;ne(Lr),e._currentValue=t}function ha(e,t,n){for(;e!==null;){var o=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,o!==null&&(o.childLanes|=t)):o!==null&&(o.childLanes&t)!==t&&(o.childLanes|=t),e===n)break;e=e.return}}function Cn(e,t){Er=e,rs=kn=null,e=e.dependencies,e!==null&&e.firstContext!==null&&(e.lanes&t&&(Re=!0),e.firstContext=null)}function Ye(e){var t=e._currentValue;if(rs!==e)if(e={context:e,memoizedValue:t,next:null},kn===null){if(Er===null)throw Error(B(308));kn=e,Er.dependencies={lanes:0,firstContext:e}}else kn=kn.next=e;return t}var Yt=null;function ss(e){Yt===null?Yt=[e]:Yt.push(e)}function bd(e,t,n,o){var r=t.interleaved;return r===null?(n.next=n,ss(t)):(n.next=r.next,r.next=n),t.interleaved=n,Pt(e,o)}function Pt(e,t){e.lanes|=t;var n=e.alternate;for(n!==null&&(n.lanes|=t),n=e,e=e.return;e!==null;)e.childLanes|=t,n=e.alternate,n!==null&&(n.childLanes|=t),n=e,e=e.return;return n.tag===3?n.stateNode:null}var Tt=!1;function ls(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function kd(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,effects:e.effects})}function wt(e,t){return{eventTime:e,lane:t,tag:0,payload:null,callback:null,next:null}}function zt(e,t,n){var o=e.updateQueue;if(o===null)return null;if(o=o.shared,H&2){var r=o.pending;return r===null?t.next=t:(t.next=r.next,r.next=t),o.pending=t,Pt(e,n)}return r=o.interleaved,r===null?(t.next=t,ss(o)):(t.next=r.next,r.next=t),o.interleaved=t,Pt(e,n)}function sr(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194240)!==0)){var o=t.lanes;o&=e.pendingLanes,n|=o,t.lanes=n,Qa(e,n)}}function vl(e,t){var n=e.updateQueue,o=e.alternate;if(o!==null&&(o=o.updateQueue,n===o)){var r=null,i=null;if(n=n.firstBaseUpdate,n!==null){do{var a={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};i===null?r=i=a:i=i.next=a,n=n.next}while(n!==null);i===null?r=i=t:i=i.next=t}else r=i=t;n={baseState:o.baseState,firstBaseUpdate:r,lastBaseUpdate:i,shared:o.shared,effects:o.effects},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}function Tr(e,t,n,o){var r=e.updateQueue;Tt=!1;var i=r.firstBaseUpdate,a=r.lastBaseUpdate,l=r.shared.pending;if(l!==null){r.shared.pending=null;var s=l,u=s.next;s.next=null,a===null?i=u:a.next=u,a=s;var p=e.alternate;p!==null&&(p=p.updateQueue,l=p.lastBaseUpdate,l!==a&&(l===null?p.firstBaseUpdate=u:l.next=u,p.lastBaseUpdate=s))}if(i!==null){var f=r.baseState;a=0,p=u=s=null,l=i;do{var c=l.lane,S=l.eventTime;if((o&c)===c){p!==null&&(p=p.next={eventTime:S,lane:0,tag:l.tag,payload:l.payload,callback:l.callback,next:null});e:{var v=e,w=l;switch(c=t,S=n,w.tag){case 1:if(v=w.payload,typeof v=="function"){f=v.call(S,f,c);break e}f=v;break e;case 3:v.flags=v.flags&-65537|128;case 0:if(v=w.payload,c=typeof v=="function"?v.call(S,f,c):v,c==null)break e;f=se({},f,c);break e;case 2:Tt=!0}}l.callback!==null&&l.lane!==0&&(e.flags|=64,c=r.effects,c===null?r.effects=[l]:c.push(l))}else S={eventTime:S,lane:c,tag:l.tag,payload:l.payload,callback:l.callback,next:null},p===null?(u=p=S,s=f):p=p.next=S,a|=c;if(l=l.next,l===null){if(l=r.shared.pending,l===null)break;c=l,l=c.next,c.next=null,r.lastBaseUpdate=c,r.shared.pending=null}}while(!0);if(p===null&&(s=f),r.baseState=s,r.firstBaseUpdate=u,r.lastBaseUpdate=p,t=r.shared.interleaved,t!==null){r=t;do a|=r.lane,r=r.next;while(r!==t)}else i===null&&(r.shared.lanes=0);rn|=a,e.lanes=a,e.memoizedState=f}}function Sl(e,t,n){if(e=t.effects,t.effects=null,e!==null)for(t=0;t<e.length;t++){var o=e[t],r=o.callback;if(r!==null){if(o.callback=null,o=n,typeof r!="function")throw Error(B(191,r));r.call(o)}}}var No={},gt=Ht(No),Bo=Ht(No),Do=Ht(No);function Jt(e){if(e===No)throw Error(B(174));return e}function us(e,t){switch(ee(Do,t),ee(Bo,e),ee(gt,No),e=t.nodeType,e){case 9:case 11:t=(t=t.documentElement)?t.namespaceURI:Qi(null,"");break;default:e=e===8?t.parentNode:t,t=e.namespaceURI||null,e=e.tagName,t=Qi(t,e)}ne(gt),ee(gt,t)}function Nn(){ne(gt),ne(Bo),ne(Do)}function Pd(e){Jt(Do.current);var t=Jt(gt.current),n=Qi(t,e.type);t!==n&&(ee(Bo,e),ee(gt,n))}function ds(e){Bo.current===e&&(ne(gt),ne(Bo))}var ie=Ht(0);function Cr(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!==void 0){if(t.flags&128)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Li=[];function cs(){for(var e=0;e<Li.length;e++)Li[e]._workInProgressVersionPrimary=null;Li.length=0}var lr=Dt.ReactCurrentDispatcher,Ei=Dt.ReactCurrentBatchConfig,on=0,ae=null,me=null,ve=null,_r=!1,lo=!1,Lo=0,kh=0;function Le(){throw Error(B(321))}function ps(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!at(e[n],t[n]))return!1;return!0}function hs(e,t,n,o,r,i){if(on=i,ae=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,lr.current=e===null||e.memoizedState===null?Lh:Eh,e=n(o,r),lo){i=0;do{if(lo=!1,Lo=0,25<=i)throw Error(B(301));i+=1,ve=me=null,t.updateQueue=null,lr.current=Th,e=n(o,r)}while(lo)}if(lr.current=Ar,t=me!==null&&me.next!==null,on=0,ve=me=ae=null,_r=!1,t)throw Error(B(300));return e}function fs(){var e=Lo!==0;return Lo=0,e}function ct(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return ve===null?ae.memoizedState=ve=e:ve=ve.next=e,ve}function Je(){if(me===null){var e=ae.alternate;e=e!==null?e.memoizedState:null}else e=me.next;var t=ve===null?ae.memoizedState:ve.next;if(t!==null)ve=t,me=e;else{if(e===null)throw Error(B(310));me=e,e={memoizedState:me.memoizedState,baseState:me.baseState,baseQueue:me.baseQueue,queue:me.queue,next:null},ve===null?ae.memoizedState=ve=e:ve=ve.next=e}return ve}function Eo(e,t){return typeof t=="function"?t(e):t}function Ti(e){var t=Je(),n=t.queue;if(n===null)throw Error(B(311));n.lastRenderedReducer=e;var o=me,r=o.baseQueue,i=n.pending;if(i!==null){if(r!==null){var a=r.next;r.next=i.next,i.next=a}o.baseQueue=r=i,n.pending=null}if(r!==null){i=r.next,o=o.baseState;var l=a=null,s=null,u=i;do{var p=u.lane;if((on&p)===p)s!==null&&(s=s.next={lane:0,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null}),o=u.hasEagerState?u.eagerState:e(o,u.action);else{var f={lane:p,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null};s===null?(l=s=f,a=o):s=s.next=f,ae.lanes|=p,rn|=p}u=u.next}while(u!==null&&u!==i);s===null?a=o:s.next=l,at(o,t.memoizedState)||(Re=!0),t.memoizedState=o,t.baseState=a,t.baseQueue=s,n.lastRenderedState=o}if(e=n.interleaved,e!==null){r=e;do i=r.lane,ae.lanes|=i,rn|=i,r=r.next;while(r!==e)}else r===null&&(n.lanes=0);return[t.memoizedState,n.dispatch]}function Ci(e){var t=Je(),n=t.queue;if(n===null)throw Error(B(311));n.lastRenderedReducer=e;var o=n.dispatch,r=n.pending,i=t.memoizedState;if(r!==null){n.pending=null;var a=r=r.next;do i=e(i,a.action),a=a.next;while(a!==r);at(i,t.memoizedState)||(Re=!0),t.memoizedState=i,t.baseQueue===null&&(t.baseState=i),n.lastRenderedState=i}return[i,o]}function Bd(){}function Dd(e,t){var n=ae,o=Je(),r=t(),i=!at(o.memoizedState,r);if(i&&(o.memoizedState=r,Re=!0),o=o.queue,gs(Td.bind(null,n,o,e),[e]),o.getSnapshot!==t||i||ve!==null&&ve.memoizedState.tag&1){if(n.flags|=2048,To(9,Ed.bind(null,n,o,r,t),void 0,null),Se===null)throw Error(B(349));on&30||Ld(n,t,r)}return r}function Ld(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=ae.updateQueue,t===null?(t={lastEffect:null,stores:null},ae.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function Ed(e,t,n,o){t.value=n,t.getSnapshot=o,Cd(t)&&_d(e)}function Td(e,t,n){return n(function(){Cd(t)&&_d(e)})}function Cd(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!at(e,n)}catch{return!0}}function _d(e){var t=Pt(e,1);t!==null&&it(t,e,1,-1)}function wl(e){var t=ct();return typeof e=="function"&&(e=e()),t.memoizedState=t.baseState=e,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Eo,lastRenderedState:e},t.queue=e,e=e.dispatch=Dh.bind(null,ae,e),[t.memoizedState,e]}function To(e,t,n,o){return e={tag:e,create:t,destroy:n,deps:o,next:null},t=ae.updateQueue,t===null?(t={lastEffect:null,stores:null},ae.updateQueue=t,t.lastEffect=e.next=e):(n=t.lastEffect,n===null?t.lastEffect=e.next=e:(o=n.next,n.next=e,e.next=o,t.lastEffect=e)),e}function Ad(){return Je().memoizedState}function ur(e,t,n,o){var r=ct();ae.flags|=e,r.memoizedState=To(1|t,n,void 0,o===void 0?null:o)}function Kr(e,t,n,o){var r=Je();o=o===void 0?null:o;var i=void 0;if(me!==null){var a=me.memoizedState;if(i=a.destroy,o!==null&&ps(o,a.deps)){r.memoizedState=To(t,n,i,o);return}}ae.flags|=e,r.memoizedState=To(1|t,n,i,o)}function bl(e,t){return ur(8390656,8,e,t)}function gs(e,t){return Kr(2048,8,e,t)}function Id(e,t){return Kr(4,2,e,t)}function Od(e,t){return Kr(4,4,e,t)}function Fd(e,t){if(typeof t=="function")return e=e(),t(e),function(){t(null)};if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Nd(e,t,n){return n=n!=null?n.concat([e]):null,Kr(4,4,Fd.bind(null,t,e),n)}function ms(){}function Rd(e,t){var n=Je();t=t===void 0?null:t;var o=n.memoizedState;return o!==null&&t!==null&&ps(t,o[1])?o[0]:(n.memoizedState=[e,t],e)}function zd(e,t){var n=Je();t=t===void 0?null:t;var o=n.memoizedState;return o!==null&&t!==null&&ps(t,o[1])?o[0]:(e=e(),n.memoizedState=[e,t],e)}function Md(e,t,n){return on&21?(at(n,t)||(n=Uu(),ae.lanes|=n,rn|=n,e.baseState=!0),t):(e.baseState&&(e.baseState=!1,Re=!0),e.memoizedState=n)}function Ph(e,t){var n=q;q=n!==0&&4>n?n:4,e(!0);var o=Ei.transition;Ei.transition={};try{e(!1),t()}finally{q=n,Ei.transition=o}}function Gd(){return Je().memoizedState}function Bh(e,t,n){var o=Gt(e);if(n={lane:o,action:n,hasEagerState:!1,eagerState:null,next:null},jd(e))Vd(t,n);else if(n=bd(e,t,n,o),n!==null){var r=Ae();it(n,e,o,r),Wd(n,t,o)}}function Dh(e,t,n){var o=Gt(e),r={lane:o,action:n,hasEagerState:!1,eagerState:null,next:null};if(jd(e))Vd(t,r);else{var i=e.alternate;if(e.lanes===0&&(i===null||i.lanes===0)&&(i=t.lastRenderedReducer,i!==null))try{var a=t.lastRenderedState,l=i(a,n);if(r.hasEagerState=!0,r.eagerState=l,at(l,a)){var s=t.interleaved;s===null?(r.next=r,ss(t)):(r.next=s.next,s.next=r),t.interleaved=r;return}}catch{}finally{}n=bd(e,t,r,o),n!==null&&(r=Ae(),it(n,e,o,r),Wd(n,t,o))}}function jd(e){var t=e.alternate;return e===ae||t!==null&&t===ae}function Vd(e,t){lo=_r=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function Wd(e,t,n){if(n&4194240){var o=t.lanes;o&=e.pendingLanes,n|=o,t.lanes=n,Qa(e,n)}}var Ar={readContext:Ye,useCallback:Le,useContext:Le,useEffect:Le,useImperativeHandle:Le,useInsertionEffect:Le,useLayoutEffect:Le,useMemo:Le,useReducer:Le,useRef:Le,useState:Le,useDebugValue:Le,useDeferredValue:Le,useTransition:Le,useMutableSource:Le,useSyncExternalStore:Le,useId:Le,unstable_isNewReconciler:!1},Lh={readContext:Ye,useCallback:function(e,t){return ct().memoizedState=[e,t===void 0?null:t],e},useContext:Ye,useEffect:bl,useImperativeHandle:function(e,t,n){return n=n!=null?n.concat([e]):null,ur(4194308,4,Fd.bind(null,t,e),n)},useLayoutEffect:function(e,t){return ur(4194308,4,e,t)},useInsertionEffect:function(e,t){return ur(4,2,e,t)},useMemo:function(e,t){var n=ct();return t=t===void 0?null:t,e=e(),n.memoizedState=[e,t],e},useReducer:function(e,t,n){var o=ct();return t=n!==void 0?n(t):t,o.memoizedState=o.baseState=t,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:t},o.queue=e,e=e.dispatch=Bh.bind(null,ae,e),[o.memoizedState,e]},useRef:function(e){var t=ct();return e={current:e},t.memoizedState=e},useState:wl,useDebugValue:ms,useDeferredValue:function(e){return ct().memoizedState=e},useTransition:function(){var e=wl(!1),t=e[0];return e=Ph.bind(null,e[1]),ct().memoizedState=e,[t,e]},useMutableSource:function(){},useSyncExternalStore:function(e,t,n){var o=ae,r=ct();if(oe){if(n===void 0)throw Error(B(407));n=n()}else{if(n=t(),Se===null)throw Error(B(349));on&30||Ld(o,t,n)}r.memoizedState=n;var i={value:n,getSnapshot:t};return r.queue=i,bl(Td.bind(null,o,i,e),[e]),o.flags|=2048,To(9,Ed.bind(null,o,i,n,t),void 0,null),n},useId:function(){var e=ct(),t=Se.identifierPrefix;if(oe){var n=St,o=vt;n=(o&~(1<<32-rt(o)-1)).toString(32)+n,t=":"+t+"R"+n,n=Lo++,0<n&&(t+="H"+n.toString(32)),t+=":"}else n=kh++,t=":"+t+"r"+n.toString(32)+":";return e.memoizedState=t},unstable_isNewReconciler:!1},Eh={readContext:Ye,useCallback:Rd,useContext:Ye,useEffect:gs,useImperativeHandle:Nd,useInsertionEffect:Id,useLayoutEffect:Od,useMemo:zd,useReducer:Ti,useRef:Ad,useState:function(){return Ti(Eo)},useDebugValue:ms,useDeferredValue:function(e){var t=Je();return Md(t,me.memoizedState,e)},useTransition:function(){var e=Ti(Eo)[0],t=Je().memoizedState;return[e,t]},useMutableSource:Bd,useSyncExternalStore:Dd,useId:Gd,unstable_isNewReconciler:!1},Th={readContext:Ye,useCallback:Rd,useContext:Ye,useEffect:gs,useImperativeHandle:Nd,useInsertionEffect:Id,useLayoutEffect:Od,useMemo:zd,useReducer:Ci,useRef:Ad,useState:function(){return Ci(Eo)},useDebugValue:ms,useDeferredValue:function(e){var t=Je();return me===null?t.memoizedState=e:Md(t,me.memoizedState,e)},useTransition:function(){var e=Ci(Eo)[0],t=Je().memoizedState;return[e,t]},useMutableSource:Bd,useSyncExternalStore:Dd,useId:Gd,unstable_isNewReconciler:!1};function tt(e,t){if(e&&e.defaultProps){t=se({},t),e=e.defaultProps;for(var n in e)t[n]===void 0&&(t[n]=e[n]);return t}return t}function fa(e,t,n,o){t=e.memoizedState,n=n(o,t),n=n==null?t:se({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var qr={isMounted:function(e){return(e=e._reactInternals)?ln(e)===e:!1},enqueueSetState:function(e,t,n){e=e._reactInternals;var o=Ae(),r=Gt(e),i=wt(o,r);i.payload=t,n!=null&&(i.callback=n),t=zt(e,i,r),t!==null&&(it(t,e,r,o),sr(t,e,r))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var o=Ae(),r=Gt(e),i=wt(o,r);i.tag=1,i.payload=t,n!=null&&(i.callback=n),t=zt(e,i,r),t!==null&&(it(t,e,r,o),sr(t,e,r))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=Ae(),o=Gt(e),r=wt(n,o);r.tag=2,t!=null&&(r.callback=t),t=zt(e,r,o),t!==null&&(it(t,e,o,n),sr(t,e,o))}};function kl(e,t,n,o,r,i,a){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(o,i,a):t.prototype&&t.prototype.isPureReactComponent?!wo(n,o)||!wo(r,i):!0}function Ud(e,t,n){var o=!1,r=Wt,i=t.contextType;return typeof i=="object"&&i!==null?i=Ye(i):(r=Me(t)?tn:Ce.current,o=t.contextTypes,i=(o=o!=null)?In(e,r):Wt),t=new t(n,i),e.memoizedState=t.state!==null&&t.state!==void 0?t.state:null,t.updater=qr,e.stateNode=t,t._reactInternals=e,o&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=r,e.__reactInternalMemoizedMaskedChildContext=i),t}function Pl(e,t,n,o){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,o),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,o),t.state!==e&&qr.enqueueReplaceState(t,t.state,null)}function ga(e,t,n,o){var r=e.stateNode;r.props=n,r.state=e.memoizedState,r.refs={},ls(e);var i=t.contextType;typeof i=="object"&&i!==null?r.context=Ye(i):(i=Me(t)?tn:Ce.current,r.context=In(e,i)),r.state=e.memoizedState,i=t.getDerivedStateFromProps,typeof i=="function"&&(fa(e,t,i,n),r.state=e.memoizedState),typeof t.getDerivedStateFromProps=="function"||typeof r.getSnapshotBeforeUpdate=="function"||typeof r.UNSAFE_componentWillMount!="function"&&typeof r.componentWillMount!="function"||(t=r.state,typeof r.componentWillMount=="function"&&r.componentWillMount(),typeof r.UNSAFE_componentWillMount=="function"&&r.UNSAFE_componentWillMount(),t!==r.state&&qr.enqueueReplaceState(r,r.state,null),Tr(e,n,r,o),r.state=e.memoizedState),typeof r.componentDidMount=="function"&&(e.flags|=4194308)}function Rn(e,t){try{var n="",o=t;do n+=op(o),o=o.return;while(o);var r=n}catch(i){r=`
Error generating stack: `+i.message+`
`+i.stack}return{value:e,source:t,stack:r,digest:null}}function _i(e,t,n){return{value:e,source:null,stack:n??null,digest:t??null}}function ma(e,t){try{console.error(t.value)}catch(n){setTimeout(function(){throw n})}}var Ch=typeof WeakMap=="function"?WeakMap:Map;function Hd(e,t,n){n=wt(-1,n),n.tag=3,n.payload={element:null};var o=t.value;return n.callback=function(){Or||(Or=!0,Da=o),ma(e,t)},n}function $d(e,t,n){n=wt(-1,n),n.tag=3;var o=e.type.getDerivedStateFromError;if(typeof o=="function"){var r=t.value;n.payload=function(){return o(r)},n.callback=function(){ma(e,t)}}var i=e.stateNode;return i!==null&&typeof i.componentDidCatch=="function"&&(n.callback=function(){ma(e,t),typeof o!="function"&&(Mt===null?Mt=new Set([this]):Mt.add(this));var a=t.stack;this.componentDidCatch(t.value,{componentStack:a!==null?a:""})}),n}function Bl(e,t,n){var o=e.pingCache;if(o===null){o=e.pingCache=new Ch;var r=new Set;o.set(t,r)}else r=o.get(t),r===void 0&&(r=new Set,o.set(t,r));r.has(n)||(r.add(n),e=Uh.bind(null,e,t,n),t.then(e,e))}function Dl(e){do{var t;if((t=e.tag===13)&&(t=e.memoizedState,t=t!==null?t.dehydrated!==null:!0),t)return e;e=e.return}while(e!==null);return null}function Ll(e,t,n,o,r){return e.mode&1?(e.flags|=65536,e.lanes=r,e):(e===t?e.flags|=65536:(e.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(t=wt(-1,1),t.tag=2,zt(n,t,1))),n.lanes|=1),e)}var _h=Dt.ReactCurrentOwner,Re=!1;function _e(e,t,n,o){t.child=e===null?wd(t,null,n,o):Fn(t,e.child,n,o)}function El(e,t,n,o,r){n=n.render;var i=t.ref;return Cn(t,r),o=hs(e,t,n,o,i,r),n=fs(),e!==null&&!Re?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~r,Bt(e,t,r)):(oe&&n&&ts(t),t.flags|=1,_e(e,t,o,r),t.child)}function Tl(e,t,n,o,r){if(e===null){var i=n.type;return typeof i=="function"&&!Ps(i)&&i.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(t.tag=15,t.type=i,Qd(e,t,i,o,r)):(e=hr(n.type,null,o,t,t.mode,r),e.ref=t.ref,e.return=t,t.child=e)}if(i=e.child,!(e.lanes&r)){var a=i.memoizedProps;if(n=n.compare,n=n!==null?n:wo,n(a,o)&&e.ref===t.ref)return Bt(e,t,r)}return t.flags|=1,e=jt(i,o),e.ref=t.ref,e.return=t,t.child=e}function Qd(e,t,n,o,r){if(e!==null){var i=e.memoizedProps;if(wo(i,o)&&e.ref===t.ref)if(Re=!1,t.pendingProps=o=i,(e.lanes&r)!==0)e.flags&131072&&(Re=!0);else return t.lanes=e.lanes,Bt(e,t,r)}return ya(e,t,n,o,r)}function Xd(e,t,n){var o=t.pendingProps,r=o.children,i=e!==null?e.memoizedState:null;if(o.mode==="hidden")if(!(t.mode&1))t.memoizedState={baseLanes:0,cachePool:null,transitions:null},ee(Bn,je),je|=n;else{if(!(n&1073741824))return e=i!==null?i.baseLanes|n:n,t.lanes=t.childLanes=1073741824,t.memoizedState={baseLanes:e,cachePool:null,transitions:null},t.updateQueue=null,ee(Bn,je),je|=e,null;t.memoizedState={baseLanes:0,cachePool:null,transitions:null},o=i!==null?i.baseLanes:n,ee(Bn,je),je|=o}else i!==null?(o=i.baseLanes|n,t.memoizedState=null):o=n,ee(Bn,je),je|=o;return _e(e,t,r,n),t.child}function Kd(e,t){var n=t.ref;(e===null&&n!==null||e!==null&&e.ref!==n)&&(t.flags|=512,t.flags|=2097152)}function ya(e,t,n,o,r){var i=Me(n)?tn:Ce.current;return i=In(t,i),Cn(t,r),n=hs(e,t,n,o,i,r),o=fs(),e!==null&&!Re?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~r,Bt(e,t,r)):(oe&&o&&ts(t),t.flags|=1,_e(e,t,n,r),t.child)}function Cl(e,t,n,o,r){if(Me(n)){var i=!0;Pr(t)}else i=!1;if(Cn(t,r),t.stateNode===null)dr(e,t),Ud(t,n,o),ga(t,n,o,r),o=!0;else if(e===null){var a=t.stateNode,l=t.memoizedProps;a.props=l;var s=a.context,u=n.contextType;typeof u=="object"&&u!==null?u=Ye(u):(u=Me(n)?tn:Ce.current,u=In(t,u));var p=n.getDerivedStateFromProps,f=typeof p=="function"||typeof a.getSnapshotBeforeUpdate=="function";f||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(l!==o||s!==u)&&Pl(t,a,o,u),Tt=!1;var c=t.memoizedState;a.state=c,Tr(t,o,a,r),s=t.memoizedState,l!==o||c!==s||ze.current||Tt?(typeof p=="function"&&(fa(t,n,p,o),s=t.memoizedState),(l=Tt||kl(t,n,l,o,c,s,u))?(f||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount=="function"&&(t.flags|=4194308)):(typeof a.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=o,t.memoizedState=s),a.props=o,a.state=s,a.context=u,o=l):(typeof a.componentDidMount=="function"&&(t.flags|=4194308),o=!1)}else{a=t.stateNode,kd(e,t),l=t.memoizedProps,u=t.type===t.elementType?l:tt(t.type,l),a.props=u,f=t.pendingProps,c=a.context,s=n.contextType,typeof s=="object"&&s!==null?s=Ye(s):(s=Me(n)?tn:Ce.current,s=In(t,s));var S=n.getDerivedStateFromProps;(p=typeof S=="function"||typeof a.getSnapshotBeforeUpdate=="function")||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(l!==f||c!==s)&&Pl(t,a,o,s),Tt=!1,c=t.memoizedState,a.state=c,Tr(t,o,a,r);var v=t.memoizedState;l!==f||c!==v||ze.current||Tt?(typeof S=="function"&&(fa(t,n,S,o),v=t.memoizedState),(u=Tt||kl(t,n,u,o,c,v,s)||!1)?(p||typeof a.UNSAFE_componentWillUpdate!="function"&&typeof a.componentWillUpdate!="function"||(typeof a.componentWillUpdate=="function"&&a.componentWillUpdate(o,v,s),typeof a.UNSAFE_componentWillUpdate=="function"&&a.UNSAFE_componentWillUpdate(o,v,s)),typeof a.componentDidUpdate=="function"&&(t.flags|=4),typeof a.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof a.componentDidUpdate!="function"||l===e.memoizedProps&&c===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||l===e.memoizedProps&&c===e.memoizedState||(t.flags|=1024),t.memoizedProps=o,t.memoizedState=v),a.props=o,a.state=v,a.context=s,o=u):(typeof a.componentDidUpdate!="function"||l===e.memoizedProps&&c===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||l===e.memoizedProps&&c===e.memoizedState||(t.flags|=1024),o=!1)}return xa(e,t,n,o,i,r)}function xa(e,t,n,o,r,i){Kd(e,t);var a=(t.flags&128)!==0;if(!o&&!a)return r&&gl(t,n,!1),Bt(e,t,i);o=t.stateNode,_h.current=t;var l=a&&typeof n.getDerivedStateFromError!="function"?null:o.render();return t.flags|=1,e!==null&&a?(t.child=Fn(t,e.child,null,i),t.child=Fn(t,null,l,i)):_e(e,t,l,i),t.memoizedState=o.state,r&&gl(t,n,!0),t.child}function qd(e){var t=e.stateNode;t.pendingContext?fl(e,t.pendingContext,t.pendingContext!==t.context):t.context&&fl(e,t.context,!1),us(e,t.containerInfo)}function _l(e,t,n,o,r){return On(),os(r),t.flags|=256,_e(e,t,n,o),t.child}var va={dehydrated:null,treeContext:null,retryLane:0};function Sa(e){return{baseLanes:e,cachePool:null,transitions:null}}function Yd(e,t,n){var o=t.pendingProps,r=ie.current,i=!1,a=(t.flags&128)!==0,l;if((l=a)||(l=e!==null&&e.memoizedState===null?!1:(r&2)!==0),l?(i=!0,t.flags&=-129):(e===null||e.memoizedState!==null)&&(r|=1),ee(ie,r&1),e===null)return pa(t),e=t.memoizedState,e!==null&&(e=e.dehydrated,e!==null)?(t.mode&1?e.data==="$!"?t.lanes=8:t.lanes=1073741824:t.lanes=1,null):(a=o.children,e=o.fallback,i?(o=t.mode,i=t.child,a={mode:"hidden",children:a},!(o&1)&&i!==null?(i.childLanes=0,i.pendingProps=a):i=Zr(a,o,0,null),e=en(e,o,n,null),i.return=t,e.return=t,i.sibling=e,t.child=i,t.child.memoizedState=Sa(n),t.memoizedState=va,e):ys(t,a));if(r=e.memoizedState,r!==null&&(l=r.dehydrated,l!==null))return Ah(e,t,a,o,l,r,n);if(i){i=o.fallback,a=t.mode,r=e.child,l=r.sibling;var s={mode:"hidden",children:o.children};return!(a&1)&&t.child!==r?(o=t.child,o.childLanes=0,o.pendingProps=s,t.deletions=null):(o=jt(r,s),o.subtreeFlags=r.subtreeFlags&14680064),l!==null?i=jt(l,i):(i=en(i,a,n,null),i.flags|=2),i.return=t,o.return=t,o.sibling=i,t.child=o,o=i,i=t.child,a=e.child.memoizedState,a=a===null?Sa(n):{baseLanes:a.baseLanes|n,cachePool:null,transitions:a.transitions},i.memoizedState=a,i.childLanes=e.childLanes&~n,t.memoizedState=va,o}return i=e.child,e=i.sibling,o=jt(i,{mode:"visible",children:o.children}),!(t.mode&1)&&(o.lanes=n),o.return=t,o.sibling=null,e!==null&&(n=t.deletions,n===null?(t.deletions=[e],t.flags|=16):n.push(e)),t.child=o,t.memoizedState=null,o}function ys(e,t){return t=Zr({mode:"visible",children:t},e.mode,0,null),t.return=e,e.child=t}function Yo(e,t,n,o){return o!==null&&os(o),Fn(t,e.child,null,n),e=ys(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Ah(e,t,n,o,r,i,a){if(n)return t.flags&256?(t.flags&=-257,o=_i(Error(B(422))),Yo(e,t,a,o)):t.memoizedState!==null?(t.child=e.child,t.flags|=128,null):(i=o.fallback,r=t.mode,o=Zr({mode:"visible",children:o.children},r,0,null),i=en(i,r,a,null),i.flags|=2,o.return=t,i.return=t,o.sibling=i,t.child=o,t.mode&1&&Fn(t,e.child,null,a),t.child.memoizedState=Sa(a),t.memoizedState=va,i);if(!(t.mode&1))return Yo(e,t,a,null);if(r.data==="$!"){if(o=r.nextSibling&&r.nextSibling.dataset,o)var l=o.dgst;return o=l,i=Error(B(419)),o=_i(i,o,void 0),Yo(e,t,a,o)}if(l=(a&e.childLanes)!==0,Re||l){if(o=Se,o!==null){switch(a&-a){case 4:r=2;break;case 16:r=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:r=32;break;case 536870912:r=268435456;break;default:r=0}r=r&(o.suspendedLanes|a)?0:r,r!==0&&r!==i.retryLane&&(i.retryLane=r,Pt(e,r),it(o,e,r,-1))}return ks(),o=_i(Error(B(421))),Yo(e,t,a,o)}return r.data==="$?"?(t.flags|=128,t.child=e.child,t=Hh.bind(null,e),r._reactRetry=t,null):(e=i.treeContext,Ve=Rt(r.nextSibling),We=t,oe=!0,ot=null,e!==null&&(Qe[Xe++]=vt,Qe[Xe++]=St,Qe[Xe++]=nn,vt=e.id,St=e.overflow,nn=t),t=ys(t,o.children),t.flags|=4096,t)}function Al(e,t,n){e.lanes|=t;var o=e.alternate;o!==null&&(o.lanes|=t),ha(e.return,t,n)}function Ai(e,t,n,o,r){var i=e.memoizedState;i===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:o,tail:n,tailMode:r}:(i.isBackwards=t,i.rendering=null,i.renderingStartTime=0,i.last=o,i.tail=n,i.tailMode=r)}function Jd(e,t,n){var o=t.pendingProps,r=o.revealOrder,i=o.tail;if(_e(e,t,o.children,n),o=ie.current,o&2)o=o&1|2,t.flags|=128;else{if(e!==null&&e.flags&128)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Al(e,n,t);else if(e.tag===19)Al(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}o&=1}if(ee(ie,o),!(t.mode&1))t.memoizedState=null;else switch(r){case"forwards":for(n=t.child,r=null;n!==null;)e=n.alternate,e!==null&&Cr(e)===null&&(r=n),n=n.sibling;n=r,n===null?(r=t.child,t.child=null):(r=n.sibling,n.sibling=null),Ai(t,!1,r,n,i);break;case"backwards":for(n=null,r=t.child,t.child=null;r!==null;){if(e=r.alternate,e!==null&&Cr(e)===null){t.child=r;break}e=r.sibling,r.sibling=n,n=r,r=e}Ai(t,!0,n,null,i);break;case"together":Ai(t,!1,null,null,void 0);break;default:t.memoizedState=null}return t.child}function dr(e,t){!(t.mode&1)&&e!==null&&(e.alternate=null,t.alternate=null,t.flags|=2)}function Bt(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),rn|=t.lanes,!(n&t.childLanes))return null;if(e!==null&&t.child!==e.child)throw Error(B(153));if(t.child!==null){for(e=t.child,n=jt(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=jt(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function Ih(e,t,n){switch(t.tag){case 3:qd(t),On();break;case 5:Pd(t);break;case 1:Me(t.type)&&Pr(t);break;case 4:us(t,t.stateNode.containerInfo);break;case 10:var o=t.type._context,r=t.memoizedProps.value;ee(Lr,o._currentValue),o._currentValue=r;break;case 13:if(o=t.memoizedState,o!==null)return o.dehydrated!==null?(ee(ie,ie.current&1),t.flags|=128,null):n&t.child.childLanes?Yd(e,t,n):(ee(ie,ie.current&1),e=Bt(e,t,n),e!==null?e.sibling:null);ee(ie,ie.current&1);break;case 19:if(o=(n&t.childLanes)!==0,e.flags&128){if(o)return Jd(e,t,n);t.flags|=128}if(r=t.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),ee(ie,ie.current),o)break;return null;case 22:case 23:return t.lanes=0,Xd(e,t,n)}return Bt(e,t,n)}var Zd,wa,ec,tc;Zd=function(e,t){for(var n=t.child;n!==null;){if(n.tag===5||n.tag===6)e.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===t)break;for(;n.sibling===null;){if(n.return===null||n.return===t)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};wa=function(){};ec=function(e,t,n,o){var r=e.memoizedProps;if(r!==o){e=t.stateNode,Jt(gt.current);var i=null;switch(n){case"input":r=Wi(e,r),o=Wi(e,o),i=[];break;case"select":r=se({},r,{value:void 0}),o=se({},o,{value:void 0}),i=[];break;case"textarea":r=$i(e,r),o=$i(e,o),i=[];break;default:typeof r.onClick!="function"&&typeof o.onClick=="function"&&(e.onclick=br)}Xi(n,o);var a;n=null;for(u in r)if(!o.hasOwnProperty(u)&&r.hasOwnProperty(u)&&r[u]!=null)if(u==="style"){var l=r[u];for(a in l)l.hasOwnProperty(a)&&(n||(n={}),n[a]="")}else u!=="dangerouslySetInnerHTML"&&u!=="children"&&u!=="suppressContentEditableWarning"&&u!=="suppressHydrationWarning"&&u!=="autoFocus"&&(fo.hasOwnProperty(u)?i||(i=[]):(i=i||[]).push(u,null));for(u in o){var s=o[u];if(l=r!=null?r[u]:void 0,o.hasOwnProperty(u)&&s!==l&&(s!=null||l!=null))if(u==="style")if(l){for(a in l)!l.hasOwnProperty(a)||s&&s.hasOwnProperty(a)||(n||(n={}),n[a]="");for(a in s)s.hasOwnProperty(a)&&l[a]!==s[a]&&(n||(n={}),n[a]=s[a])}else n||(i||(i=[]),i.push(u,n)),n=s;else u==="dangerouslySetInnerHTML"?(s=s?s.__html:void 0,l=l?l.__html:void 0,s!=null&&l!==s&&(i=i||[]).push(u,s)):u==="children"?typeof s!="string"&&typeof s!="number"||(i=i||[]).push(u,""+s):u!=="suppressContentEditableWarning"&&u!=="suppressHydrationWarning"&&(fo.hasOwnProperty(u)?(s!=null&&u==="onScroll"&&te("scroll",e),i||l===s||(i=[])):(i=i||[]).push(u,s))}n&&(i=i||[]).push("style",n);var u=i;(t.updateQueue=u)&&(t.flags|=4)}};tc=function(e,t,n,o){n!==o&&(t.flags|=4)};function qn(e,t){if(!oe)switch(e.tailMode){case"hidden":t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case"collapsed":n=e.tail;for(var o=null;n!==null;)n.alternate!==null&&(o=n),n=n.sibling;o===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:o.sibling=null}}function Ee(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,o=0;if(t)for(var r=e.child;r!==null;)n|=r.lanes|r.childLanes,o|=r.subtreeFlags&14680064,o|=r.flags&14680064,r.return=e,r=r.sibling;else for(r=e.child;r!==null;)n|=r.lanes|r.childLanes,o|=r.subtreeFlags,o|=r.flags,r.return=e,r=r.sibling;return e.subtreeFlags|=o,e.childLanes=n,t}function Oh(e,t,n){var o=t.pendingProps;switch(ns(t),t.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Ee(t),null;case 1:return Me(t.type)&&kr(),Ee(t),null;case 3:return o=t.stateNode,Nn(),ne(ze),ne(Ce),cs(),o.pendingContext&&(o.context=o.pendingContext,o.pendingContext=null),(e===null||e.child===null)&&(Ko(t)?t.flags|=4:e===null||e.memoizedState.isDehydrated&&!(t.flags&256)||(t.flags|=1024,ot!==null&&(Ta(ot),ot=null))),wa(e,t),Ee(t),null;case 5:ds(t);var r=Jt(Do.current);if(n=t.type,e!==null&&t.stateNode!=null)ec(e,t,n,o,r),e.ref!==t.ref&&(t.flags|=512,t.flags|=2097152);else{if(!o){if(t.stateNode===null)throw Error(B(166));return Ee(t),null}if(e=Jt(gt.current),Ko(t)){o=t.stateNode,n=t.type;var i=t.memoizedProps;switch(o[pt]=t,o[Po]=i,e=(t.mode&1)!==0,n){case"dialog":te("cancel",o),te("close",o);break;case"iframe":case"object":case"embed":te("load",o);break;case"video":case"audio":for(r=0;r<no.length;r++)te(no[r],o);break;case"source":te("error",o);break;case"img":case"image":case"link":te("error",o),te("load",o);break;case"details":te("toggle",o);break;case"input":js(o,i),te("invalid",o);break;case"select":o._wrapperState={wasMultiple:!!i.multiple},te("invalid",o);break;case"textarea":Ws(o,i),te("invalid",o)}Xi(n,i),r=null;for(var a in i)if(i.hasOwnProperty(a)){var l=i[a];a==="children"?typeof l=="string"?o.textContent!==l&&(i.suppressHydrationWarning!==!0&&Xo(o.textContent,l,e),r=["children",l]):typeof l=="number"&&o.textContent!==""+l&&(i.suppressHydrationWarning!==!0&&Xo(o.textContent,l,e),r=["children",""+l]):fo.hasOwnProperty(a)&&l!=null&&a==="onScroll"&&te("scroll",o)}switch(n){case"input":Go(o),Vs(o,i,!0);break;case"textarea":Go(o),Us(o);break;case"select":case"option":break;default:typeof i.onClick=="function"&&(o.onclick=br)}o=r,t.updateQueue=o,o!==null&&(t.flags|=4)}else{a=r.nodeType===9?r:r.ownerDocument,e==="http://www.w3.org/1999/xhtml"&&(e=Tu(n)),e==="http://www.w3.org/1999/xhtml"?n==="script"?(e=a.createElement("div"),e.innerHTML="<script><\/script>",e=e.removeChild(e.firstChild)):typeof o.is=="string"?e=a.createElement(n,{is:o.is}):(e=a.createElement(n),n==="select"&&(a=e,o.multiple?a.multiple=!0:o.size&&(a.size=o.size))):e=a.createElementNS(e,n),e[pt]=t,e[Po]=o,Zd(e,t,!1,!1),t.stateNode=e;e:{switch(a=Ki(n,o),n){case"dialog":te("cancel",e),te("close",e),r=o;break;case"iframe":case"object":case"embed":te("load",e),r=o;break;case"video":case"audio":for(r=0;r<no.length;r++)te(no[r],e);r=o;break;case"source":te("error",e),r=o;break;case"img":case"image":case"link":te("error",e),te("load",e),r=o;break;case"details":te("toggle",e),r=o;break;case"input":js(e,o),r=Wi(e,o),te("invalid",e);break;case"option":r=o;break;case"select":e._wrapperState={wasMultiple:!!o.multiple},r=se({},o,{value:void 0}),te("invalid",e);break;case"textarea":Ws(e,o),r=$i(e,o),te("invalid",e);break;default:r=o}Xi(n,r),l=r;for(i in l)if(l.hasOwnProperty(i)){var s=l[i];i==="style"?Au(e,s):i==="dangerouslySetInnerHTML"?(s=s?s.__html:void 0,s!=null&&Cu(e,s)):i==="children"?typeof s=="string"?(n!=="textarea"||s!=="")&&go(e,s):typeof s=="number"&&go(e,""+s):i!=="suppressContentEditableWarning"&&i!=="suppressHydrationWarning"&&i!=="autoFocus"&&(fo.hasOwnProperty(i)?s!=null&&i==="onScroll"&&te("scroll",e):s!=null&&ja(e,i,s,a))}switch(n){case"input":Go(e),Vs(e,o,!1);break;case"textarea":Go(e),Us(e);break;case"option":o.value!=null&&e.setAttribute("value",""+Vt(o.value));break;case"select":e.multiple=!!o.multiple,i=o.value,i!=null?Dn(e,!!o.multiple,i,!1):o.defaultValue!=null&&Dn(e,!!o.multiple,o.defaultValue,!0);break;default:typeof r.onClick=="function"&&(e.onclick=br)}switch(n){case"button":case"input":case"select":case"textarea":o=!!o.autoFocus;break e;case"img":o=!0;break e;default:o=!1}}o&&(t.flags|=4)}t.ref!==null&&(t.flags|=512,t.flags|=2097152)}return Ee(t),null;case 6:if(e&&t.stateNode!=null)tc(e,t,e.memoizedProps,o);else{if(typeof o!="string"&&t.stateNode===null)throw Error(B(166));if(n=Jt(Do.current),Jt(gt.current),Ko(t)){if(o=t.stateNode,n=t.memoizedProps,o[pt]=t,(i=o.nodeValue!==n)&&(e=We,e!==null))switch(e.tag){case 3:Xo(o.nodeValue,n,(e.mode&1)!==0);break;case 5:e.memoizedProps.suppressHydrationWarning!==!0&&Xo(o.nodeValue,n,(e.mode&1)!==0)}i&&(t.flags|=4)}else o=(n.nodeType===9?n:n.ownerDocument).createTextNode(o),o[pt]=t,t.stateNode=o}return Ee(t),null;case 13:if(ne(ie),o=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(oe&&Ve!==null&&t.mode&1&&!(t.flags&128))vd(),On(),t.flags|=98560,i=!1;else if(i=Ko(t),o!==null&&o.dehydrated!==null){if(e===null){if(!i)throw Error(B(318));if(i=t.memoizedState,i=i!==null?i.dehydrated:null,!i)throw Error(B(317));i[pt]=t}else On(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;Ee(t),i=!1}else ot!==null&&(Ta(ot),ot=null),i=!0;if(!i)return t.flags&65536?t:null}return t.flags&128?(t.lanes=n,t):(o=o!==null,o!==(e!==null&&e.memoizedState!==null)&&o&&(t.child.flags|=8192,t.mode&1&&(e===null||ie.current&1?ye===0&&(ye=3):ks())),t.updateQueue!==null&&(t.flags|=4),Ee(t),null);case 4:return Nn(),wa(e,t),e===null&&bo(t.stateNode.containerInfo),Ee(t),null;case 10:return as(t.type._context),Ee(t),null;case 17:return Me(t.type)&&kr(),Ee(t),null;case 19:if(ne(ie),i=t.memoizedState,i===null)return Ee(t),null;if(o=(t.flags&128)!==0,a=i.rendering,a===null)if(o)qn(i,!1);else{if(ye!==0||e!==null&&e.flags&128)for(e=t.child;e!==null;){if(a=Cr(e),a!==null){for(t.flags|=128,qn(i,!1),o=a.updateQueue,o!==null&&(t.updateQueue=o,t.flags|=4),t.subtreeFlags=0,o=n,n=t.child;n!==null;)i=n,e=o,i.flags&=14680066,a=i.alternate,a===null?(i.childLanes=0,i.lanes=e,i.child=null,i.subtreeFlags=0,i.memoizedProps=null,i.memoizedState=null,i.updateQueue=null,i.dependencies=null,i.stateNode=null):(i.childLanes=a.childLanes,i.lanes=a.lanes,i.child=a.child,i.subtreeFlags=0,i.deletions=null,i.memoizedProps=a.memoizedProps,i.memoizedState=a.memoizedState,i.updateQueue=a.updateQueue,i.type=a.type,e=a.dependencies,i.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),n=n.sibling;return ee(ie,ie.current&1|2),t.child}e=e.sibling}i.tail!==null&&pe()>zn&&(t.flags|=128,o=!0,qn(i,!1),t.lanes=4194304)}else{if(!o)if(e=Cr(a),e!==null){if(t.flags|=128,o=!0,n=e.updateQueue,n!==null&&(t.updateQueue=n,t.flags|=4),qn(i,!0),i.tail===null&&i.tailMode==="hidden"&&!a.alternate&&!oe)return Ee(t),null}else 2*pe()-i.renderingStartTime>zn&&n!==1073741824&&(t.flags|=128,o=!0,qn(i,!1),t.lanes=4194304);i.isBackwards?(a.sibling=t.child,t.child=a):(n=i.last,n!==null?n.sibling=a:t.child=a,i.last=a)}return i.tail!==null?(t=i.tail,i.rendering=t,i.tail=t.sibling,i.renderingStartTime=pe(),t.sibling=null,n=ie.current,ee(ie,o?n&1|2:n&1),t):(Ee(t),null);case 22:case 23:return bs(),o=t.memoizedState!==null,e!==null&&e.memoizedState!==null!==o&&(t.flags|=8192),o&&t.mode&1?je&1073741824&&(Ee(t),t.subtreeFlags&6&&(t.flags|=8192)):Ee(t),null;case 24:return null;case 25:return null}throw Error(B(156,t.tag))}function Fh(e,t){switch(ns(t),t.tag){case 1:return Me(t.type)&&kr(),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Nn(),ne(ze),ne(Ce),cs(),e=t.flags,e&65536&&!(e&128)?(t.flags=e&-65537|128,t):null;case 5:return ds(t),null;case 13:if(ne(ie),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(B(340));On()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return ne(ie),null;case 4:return Nn(),null;case 10:return as(t.type._context),null;case 22:case 23:return bs(),null;case 24:return null;default:return null}}var Jo=!1,Te=!1,Nh=typeof WeakSet=="function"?WeakSet:Set,A=null;function Pn(e,t){var n=e.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(o){de(e,t,o)}else n.current=null}function ba(e,t,n){try{n()}catch(o){de(e,t,o)}}var Il=!1;function Rh(e,t){if(ia=vr,e=ad(),es(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var o=n.getSelection&&n.getSelection();if(o&&o.rangeCount!==0){n=o.anchorNode;var r=o.anchorOffset,i=o.focusNode;o=o.focusOffset;try{n.nodeType,i.nodeType}catch{n=null;break e}var a=0,l=-1,s=-1,u=0,p=0,f=e,c=null;t:for(;;){for(var S;f!==n||r!==0&&f.nodeType!==3||(l=a+r),f!==i||o!==0&&f.nodeType!==3||(s=a+o),f.nodeType===3&&(a+=f.nodeValue.length),(S=f.firstChild)!==null;)c=f,f=S;for(;;){if(f===e)break t;if(c===n&&++u===r&&(l=a),c===i&&++p===o&&(s=a),(S=f.nextSibling)!==null)break;f=c,c=f.parentNode}f=S}n=l===-1||s===-1?null:{start:l,end:s}}else n=null}n=n||{start:0,end:0}}else n=null;for(aa={focusedElem:e,selectionRange:n},vr=!1,A=t;A!==null;)if(t=A,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,A=e;else for(;A!==null;){t=A;try{var v=t.alternate;if(t.flags&1024)switch(t.tag){case 0:case 11:case 15:break;case 1:if(v!==null){var w=v.memoizedProps,I=v.memoizedState,m=t.stateNode,h=m.getSnapshotBeforeUpdate(t.elementType===t.type?w:tt(t.type,w),I);m.__reactInternalSnapshotBeforeUpdate=h}break;case 3:var y=t.stateNode.containerInfo;y.nodeType===1?y.textContent="":y.nodeType===9&&y.documentElement&&y.removeChild(y.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(B(163))}}catch(b){de(t,t.return,b)}if(e=t.sibling,e!==null){e.return=t.return,A=e;break}A=t.return}return v=Il,Il=!1,v}function uo(e,t,n){var o=t.updateQueue;if(o=o!==null?o.lastEffect:null,o!==null){var r=o=o.next;do{if((r.tag&e)===e){var i=r.destroy;r.destroy=void 0,i!==void 0&&ba(t,n,i)}r=r.next}while(r!==o)}}function Yr(e,t){if(t=t.updateQueue,t=t!==null?t.lastEffect:null,t!==null){var n=t=t.next;do{if((n.tag&e)===e){var o=n.create;n.destroy=o()}n=n.next}while(n!==t)}}function ka(e){var t=e.ref;if(t!==null){var n=e.stateNode;switch(e.tag){case 5:e=n;break;default:e=n}typeof t=="function"?t(e):t.current=e}}function nc(e){var t=e.alternate;t!==null&&(e.alternate=null,nc(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&(delete t[pt],delete t[Po],delete t[ua],delete t[vh],delete t[Sh])),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}function oc(e){return e.tag===5||e.tag===3||e.tag===4}function Ol(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||oc(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Pa(e,t,n){var o=e.tag;if(o===5||o===6)e=e.stateNode,t?n.nodeType===8?n.parentNode.insertBefore(e,t):n.insertBefore(e,t):(n.nodeType===8?(t=n.parentNode,t.insertBefore(e,n)):(t=n,t.appendChild(e)),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=br));else if(o!==4&&(e=e.child,e!==null))for(Pa(e,t,n),e=e.sibling;e!==null;)Pa(e,t,n),e=e.sibling}function Ba(e,t,n){var o=e.tag;if(o===5||o===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(o!==4&&(e=e.child,e!==null))for(Ba(e,t,n),e=e.sibling;e!==null;)Ba(e,t,n),e=e.sibling}var ke=null,nt=!1;function Lt(e,t,n){for(n=n.child;n!==null;)rc(e,t,n),n=n.sibling}function rc(e,t,n){if(ft&&typeof ft.onCommitFiberUnmount=="function")try{ft.onCommitFiberUnmount(Wr,n)}catch{}switch(n.tag){case 5:Te||Pn(n,t);case 6:var o=ke,r=nt;ke=null,Lt(e,t,n),ke=o,nt=r,ke!==null&&(nt?(e=ke,n=n.stateNode,e.nodeType===8?e.parentNode.removeChild(n):e.removeChild(n)):ke.removeChild(n.stateNode));break;case 18:ke!==null&&(nt?(e=ke,n=n.stateNode,e.nodeType===8?Bi(e.parentNode,n):e.nodeType===1&&Bi(e,n),vo(e)):Bi(ke,n.stateNode));break;case 4:o=ke,r=nt,ke=n.stateNode.containerInfo,nt=!0,Lt(e,t,n),ke=o,nt=r;break;case 0:case 11:case 14:case 15:if(!Te&&(o=n.updateQueue,o!==null&&(o=o.lastEffect,o!==null))){r=o=o.next;do{var i=r,a=i.destroy;i=i.tag,a!==void 0&&(i&2||i&4)&&ba(n,t,a),r=r.next}while(r!==o)}Lt(e,t,n);break;case 1:if(!Te&&(Pn(n,t),o=n.stateNode,typeof o.componentWillUnmount=="function"))try{o.props=n.memoizedProps,o.state=n.memoizedState,o.componentWillUnmount()}catch(l){de(n,t,l)}Lt(e,t,n);break;case 21:Lt(e,t,n);break;case 22:n.mode&1?(Te=(o=Te)||n.memoizedState!==null,Lt(e,t,n),Te=o):Lt(e,t,n);break;default:Lt(e,t,n)}}function Fl(e){var t=e.updateQueue;if(t!==null){e.updateQueue=null;var n=e.stateNode;n===null&&(n=e.stateNode=new Nh),t.forEach(function(o){var r=$h.bind(null,e,o);n.has(o)||(n.add(o),o.then(r,r))})}}function et(e,t){var n=t.deletions;if(n!==null)for(var o=0;o<n.length;o++){var r=n[o];try{var i=e,a=t,l=a;e:for(;l!==null;){switch(l.tag){case 5:ke=l.stateNode,nt=!1;break e;case 3:ke=l.stateNode.containerInfo,nt=!0;break e;case 4:ke=l.stateNode.containerInfo,nt=!0;break e}l=l.return}if(ke===null)throw Error(B(160));rc(i,a,r),ke=null,nt=!1;var s=r.alternate;s!==null&&(s.return=null),r.return=null}catch(u){de(r,t,u)}}if(t.subtreeFlags&12854)for(t=t.child;t!==null;)ic(t,e),t=t.sibling}function ic(e,t){var n=e.alternate,o=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(et(t,e),dt(e),o&4){try{uo(3,e,e.return),Yr(3,e)}catch(w){de(e,e.return,w)}try{uo(5,e,e.return)}catch(w){de(e,e.return,w)}}break;case 1:et(t,e),dt(e),o&512&&n!==null&&Pn(n,n.return);break;case 5:if(et(t,e),dt(e),o&512&&n!==null&&Pn(n,n.return),e.flags&32){var r=e.stateNode;try{go(r,"")}catch(w){de(e,e.return,w)}}if(o&4&&(r=e.stateNode,r!=null)){var i=e.memoizedProps,a=n!==null?n.memoizedProps:i,l=e.type,s=e.updateQueue;if(e.updateQueue=null,s!==null)try{l==="input"&&i.type==="radio"&&i.name!=null&&Lu(r,i),Ki(l,a);var u=Ki(l,i);for(a=0;a<s.length;a+=2){var p=s[a],f=s[a+1];p==="style"?Au(r,f):p==="dangerouslySetInnerHTML"?Cu(r,f):p==="children"?go(r,f):ja(r,p,f,u)}switch(l){case"input":Ui(r,i);break;case"textarea":Eu(r,i);break;case"select":var c=r._wrapperState.wasMultiple;r._wrapperState.wasMultiple=!!i.multiple;var S=i.value;S!=null?Dn(r,!!i.multiple,S,!1):c!==!!i.multiple&&(i.defaultValue!=null?Dn(r,!!i.multiple,i.defaultValue,!0):Dn(r,!!i.multiple,i.multiple?[]:"",!1))}r[Po]=i}catch(w){de(e,e.return,w)}}break;case 6:if(et(t,e),dt(e),o&4){if(e.stateNode===null)throw Error(B(162));r=e.stateNode,i=e.memoizedProps;try{r.nodeValue=i}catch(w){de(e,e.return,w)}}break;case 3:if(et(t,e),dt(e),o&4&&n!==null&&n.memoizedState.isDehydrated)try{vo(t.containerInfo)}catch(w){de(e,e.return,w)}break;case 4:et(t,e),dt(e);break;case 13:et(t,e),dt(e),r=e.child,r.flags&8192&&(i=r.memoizedState!==null,r.stateNode.isHidden=i,!i||r.alternate!==null&&r.alternate.memoizedState!==null||(Ss=pe())),o&4&&Fl(e);break;case 22:if(p=n!==null&&n.memoizedState!==null,e.mode&1?(Te=(u=Te)||p,et(t,e),Te=u):et(t,e),dt(e),o&8192){if(u=e.memoizedState!==null,(e.stateNode.isHidden=u)&&!p&&e.mode&1)for(A=e,p=e.child;p!==null;){for(f=A=p;A!==null;){switch(c=A,S=c.child,c.tag){case 0:case 11:case 14:case 15:uo(4,c,c.return);break;case 1:Pn(c,c.return);var v=c.stateNode;if(typeof v.componentWillUnmount=="function"){o=c,n=c.return;try{t=o,v.props=t.memoizedProps,v.state=t.memoizedState,v.componentWillUnmount()}catch(w){de(o,n,w)}}break;case 5:Pn(c,c.return);break;case 22:if(c.memoizedState!==null){Rl(f);continue}}S!==null?(S.return=c,A=S):Rl(f)}p=p.sibling}e:for(p=null,f=e;;){if(f.tag===5){if(p===null){p=f;try{r=f.stateNode,u?(i=r.style,typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none"):(l=f.stateNode,s=f.memoizedProps.style,a=s!=null&&s.hasOwnProperty("display")?s.display:null,l.style.display=_u("display",a))}catch(w){de(e,e.return,w)}}}else if(f.tag===6){if(p===null)try{f.stateNode.nodeValue=u?"":f.memoizedProps}catch(w){de(e,e.return,w)}}else if((f.tag!==22&&f.tag!==23||f.memoizedState===null||f===e)&&f.child!==null){f.child.return=f,f=f.child;continue}if(f===e)break e;for(;f.sibling===null;){if(f.return===null||f.return===e)break e;p===f&&(p=null),f=f.return}p===f&&(p=null),f.sibling.return=f.return,f=f.sibling}}break;case 19:et(t,e),dt(e),o&4&&Fl(e);break;case 21:break;default:et(t,e),dt(e)}}function dt(e){var t=e.flags;if(t&2){try{e:{for(var n=e.return;n!==null;){if(oc(n)){var o=n;break e}n=n.return}throw Error(B(160))}switch(o.tag){case 5:var r=o.stateNode;o.flags&32&&(go(r,""),o.flags&=-33);var i=Ol(e);Ba(e,i,r);break;case 3:case 4:var a=o.stateNode.containerInfo,l=Ol(e);Pa(e,l,a);break;default:throw Error(B(161))}}catch(s){de(e,e.return,s)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function zh(e,t,n){A=e,ac(e)}function ac(e,t,n){for(var o=(e.mode&1)!==0;A!==null;){var r=A,i=r.child;if(r.tag===22&&o){var a=r.memoizedState!==null||Jo;if(!a){var l=r.alternate,s=l!==null&&l.memoizedState!==null||Te;l=Jo;var u=Te;if(Jo=a,(Te=s)&&!u)for(A=r;A!==null;)a=A,s=a.child,a.tag===22&&a.memoizedState!==null?zl(r):s!==null?(s.return=a,A=s):zl(r);for(;i!==null;)A=i,ac(i),i=i.sibling;A=r,Jo=l,Te=u}Nl(e)}else r.subtreeFlags&8772&&i!==null?(i.return=r,A=i):Nl(e)}}function Nl(e){for(;A!==null;){var t=A;if(t.flags&8772){var n=t.alternate;try{if(t.flags&8772)switch(t.tag){case 0:case 11:case 15:Te||Yr(5,t);break;case 1:var o=t.stateNode;if(t.flags&4&&!Te)if(n===null)o.componentDidMount();else{var r=t.elementType===t.type?n.memoizedProps:tt(t.type,n.memoizedProps);o.componentDidUpdate(r,n.memoizedState,o.__reactInternalSnapshotBeforeUpdate)}var i=t.updateQueue;i!==null&&Sl(t,i,o);break;case 3:var a=t.updateQueue;if(a!==null){if(n=null,t.child!==null)switch(t.child.tag){case 5:n=t.child.stateNode;break;case 1:n=t.child.stateNode}Sl(t,a,n)}break;case 5:var l=t.stateNode;if(n===null&&t.flags&4){n=l;var s=t.memoizedProps;switch(t.type){case"button":case"input":case"select":case"textarea":s.autoFocus&&n.focus();break;case"img":s.src&&(n.src=s.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(t.memoizedState===null){var u=t.alternate;if(u!==null){var p=u.memoizedState;if(p!==null){var f=p.dehydrated;f!==null&&vo(f)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(B(163))}Te||t.flags&512&&ka(t)}catch(c){de(t,t.return,c)}}if(t===e){A=null;break}if(n=t.sibling,n!==null){n.return=t.return,A=n;break}A=t.return}}function Rl(e){for(;A!==null;){var t=A;if(t===e){A=null;break}var n=t.sibling;if(n!==null){n.return=t.return,A=n;break}A=t.return}}function zl(e){for(;A!==null;){var t=A;try{switch(t.tag){case 0:case 11:case 15:var n=t.return;try{Yr(4,t)}catch(s){de(t,n,s)}break;case 1:var o=t.stateNode;if(typeof o.componentDidMount=="function"){var r=t.return;try{o.componentDidMount()}catch(s){de(t,r,s)}}var i=t.return;try{ka(t)}catch(s){de(t,i,s)}break;case 5:var a=t.return;try{ka(t)}catch(s){de(t,a,s)}}}catch(s){de(t,t.return,s)}if(t===e){A=null;break}var l=t.sibling;if(l!==null){l.return=t.return,A=l;break}A=t.return}}var Mh=Math.ceil,Ir=Dt.ReactCurrentDispatcher,xs=Dt.ReactCurrentOwner,qe=Dt.ReactCurrentBatchConfig,H=0,Se=null,fe=null,Pe=0,je=0,Bn=Ht(0),ye=0,Co=null,rn=0,Jr=0,vs=0,co=null,Ne=null,Ss=0,zn=1/0,yt=null,Or=!1,Da=null,Mt=null,Zo=!1,It=null,Fr=0,po=0,La=null,cr=-1,pr=0;function Ae(){return H&6?pe():cr!==-1?cr:cr=pe()}function Gt(e){return e.mode&1?H&2&&Pe!==0?Pe&-Pe:bh.transition!==null?(pr===0&&(pr=Uu()),pr):(e=q,e!==0||(e=window.event,e=e===void 0?16:Yu(e.type)),e):1}function it(e,t,n,o){if(50<po)throw po=0,La=null,Error(B(185));Io(e,n,o),(!(H&2)||e!==Se)&&(e===Se&&(!(H&2)&&(Jr|=n),ye===4&&_t(e,Pe)),Ge(e,o),n===1&&H===0&&!(t.mode&1)&&(zn=pe()+500,Xr&&$t()))}function Ge(e,t){var n=e.callbackNode;bp(e,t);var o=xr(e,e===Se?Pe:0);if(o===0)n!==null&&Qs(n),e.callbackNode=null,e.callbackPriority=0;else if(t=o&-o,e.callbackPriority!==t){if(n!=null&&Qs(n),t===1)e.tag===0?wh(Ml.bind(null,e)):md(Ml.bind(null,e)),yh(function(){!(H&6)&&$t()}),n=null;else{switch(Hu(o)){case 1:n=$a;break;case 4:n=Vu;break;case 16:n=yr;break;case 536870912:n=Wu;break;default:n=yr}n=fc(n,sc.bind(null,e))}e.callbackPriority=t,e.callbackNode=n}}function sc(e,t){if(cr=-1,pr=0,H&6)throw Error(B(327));var n=e.callbackNode;if(_n()&&e.callbackNode!==n)return null;var o=xr(e,e===Se?Pe:0);if(o===0)return null;if(o&30||o&e.expiredLanes||t)t=Nr(e,o);else{t=o;var r=H;H|=2;var i=uc();(Se!==e||Pe!==t)&&(yt=null,zn=pe()+500,Zt(e,t));do try{Vh();break}catch(l){lc(e,l)}while(!0);is(),Ir.current=i,H=r,fe!==null?t=0:(Se=null,Pe=0,t=ye)}if(t!==0){if(t===2&&(r=ea(e),r!==0&&(o=r,t=Ea(e,r))),t===1)throw n=Co,Zt(e,0),_t(e,o),Ge(e,pe()),n;if(t===6)_t(e,o);else{if(r=e.current.alternate,!(o&30)&&!Gh(r)&&(t=Nr(e,o),t===2&&(i=ea(e),i!==0&&(o=i,t=Ea(e,i))),t===1))throw n=Co,Zt(e,0),_t(e,o),Ge(e,pe()),n;switch(e.finishedWork=r,e.finishedLanes=o,t){case 0:case 1:throw Error(B(345));case 2:Kt(e,Ne,yt);break;case 3:if(_t(e,o),(o&130023424)===o&&(t=Ss+500-pe(),10<t)){if(xr(e,0)!==0)break;if(r=e.suspendedLanes,(r&o)!==o){Ae(),e.pingedLanes|=e.suspendedLanes&r;break}e.timeoutHandle=la(Kt.bind(null,e,Ne,yt),t);break}Kt(e,Ne,yt);break;case 4:if(_t(e,o),(o&4194240)===o)break;for(t=e.eventTimes,r=-1;0<o;){var a=31-rt(o);i=1<<a,a=t[a],a>r&&(r=a),o&=~i}if(o=r,o=pe()-o,o=(120>o?120:480>o?480:1080>o?1080:1920>o?1920:3e3>o?3e3:4320>o?4320:1960*Mh(o/1960))-o,10<o){e.timeoutHandle=la(Kt.bind(null,e,Ne,yt),o);break}Kt(e,Ne,yt);break;case 5:Kt(e,Ne,yt);break;default:throw Error(B(329))}}}return Ge(e,pe()),e.callbackNode===n?sc.bind(null,e):null}function Ea(e,t){var n=co;return e.current.memoizedState.isDehydrated&&(Zt(e,t).flags|=256),e=Nr(e,t),e!==2&&(t=Ne,Ne=n,t!==null&&Ta(t)),e}function Ta(e){Ne===null?Ne=e:Ne.push.apply(Ne,e)}function Gh(e){for(var t=e;;){if(t.flags&16384){var n=t.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var o=0;o<n.length;o++){var r=n[o],i=r.getSnapshot;r=r.value;try{if(!at(i(),r))return!1}catch{return!1}}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function _t(e,t){for(t&=~vs,t&=~Jr,e.suspendedLanes|=t,e.pingedLanes&=~t,e=e.expirationTimes;0<t;){var n=31-rt(t),o=1<<n;e[n]=-1,t&=~o}}function Ml(e){if(H&6)throw Error(B(327));_n();var t=xr(e,0);if(!(t&1))return Ge(e,pe()),null;var n=Nr(e,t);if(e.tag!==0&&n===2){var o=ea(e);o!==0&&(t=o,n=Ea(e,o))}if(n===1)throw n=Co,Zt(e,0),_t(e,t),Ge(e,pe()),n;if(n===6)throw Error(B(345));return e.finishedWork=e.current.alternate,e.finishedLanes=t,Kt(e,Ne,yt),Ge(e,pe()),null}function ws(e,t){var n=H;H|=1;try{return e(t)}finally{H=n,H===0&&(zn=pe()+500,Xr&&$t())}}function an(e){It!==null&&It.tag===0&&!(H&6)&&_n();var t=H;H|=1;var n=qe.transition,o=q;try{if(qe.transition=null,q=1,e)return e()}finally{q=o,qe.transition=n,H=t,!(H&6)&&$t()}}function bs(){je=Bn.current,ne(Bn)}function Zt(e,t){e.finishedWork=null,e.finishedLanes=0;var n=e.timeoutHandle;if(n!==-1&&(e.timeoutHandle=-1,mh(n)),fe!==null)for(n=fe.return;n!==null;){var o=n;switch(ns(o),o.tag){case 1:o=o.type.childContextTypes,o!=null&&kr();break;case 3:Nn(),ne(ze),ne(Ce),cs();break;case 5:ds(o);break;case 4:Nn();break;case 13:ne(ie);break;case 19:ne(ie);break;case 10:as(o.type._context);break;case 22:case 23:bs()}n=n.return}if(Se=e,fe=e=jt(e.current,null),Pe=je=t,ye=0,Co=null,vs=Jr=rn=0,Ne=co=null,Yt!==null){for(t=0;t<Yt.length;t++)if(n=Yt[t],o=n.interleaved,o!==null){n.interleaved=null;var r=o.next,i=n.pending;if(i!==null){var a=i.next;i.next=r,o.next=a}n.pending=o}Yt=null}return e}function lc(e,t){do{var n=fe;try{if(is(),lr.current=Ar,_r){for(var o=ae.memoizedState;o!==null;){var r=o.queue;r!==null&&(r.pending=null),o=o.next}_r=!1}if(on=0,ve=me=ae=null,lo=!1,Lo=0,xs.current=null,n===null||n.return===null){ye=1,Co=t,fe=null;break}e:{var i=e,a=n.return,l=n,s=t;if(t=Pe,l.flags|=32768,s!==null&&typeof s=="object"&&typeof s.then=="function"){var u=s,p=l,f=p.tag;if(!(p.mode&1)&&(f===0||f===11||f===15)){var c=p.alternate;c?(p.updateQueue=c.updateQueue,p.memoizedState=c.memoizedState,p.lanes=c.lanes):(p.updateQueue=null,p.memoizedState=null)}var S=Dl(a);if(S!==null){S.flags&=-257,Ll(S,a,l,i,t),S.mode&1&&Bl(i,u,t),t=S,s=u;var v=t.updateQueue;if(v===null){var w=new Set;w.add(s),t.updateQueue=w}else v.add(s);break e}else{if(!(t&1)){Bl(i,u,t),ks();break e}s=Error(B(426))}}else if(oe&&l.mode&1){var I=Dl(a);if(I!==null){!(I.flags&65536)&&(I.flags|=256),Ll(I,a,l,i,t),os(Rn(s,l));break e}}i=s=Rn(s,l),ye!==4&&(ye=2),co===null?co=[i]:co.push(i),i=a;do{switch(i.tag){case 3:i.flags|=65536,t&=-t,i.lanes|=t;var m=Hd(i,s,t);vl(i,m);break e;case 1:l=s;var h=i.type,y=i.stateNode;if(!(i.flags&128)&&(typeof h.getDerivedStateFromError=="function"||y!==null&&typeof y.componentDidCatch=="function"&&(Mt===null||!Mt.has(y)))){i.flags|=65536,t&=-t,i.lanes|=t;var b=$d(i,l,t);vl(i,b);break e}}i=i.return}while(i!==null)}cc(n)}catch(T){t=T,fe===n&&n!==null&&(fe=n=n.return);continue}break}while(!0)}function uc(){var e=Ir.current;return Ir.current=Ar,e===null?Ar:e}function ks(){(ye===0||ye===3||ye===2)&&(ye=4),Se===null||!(rn&268435455)&&!(Jr&268435455)||_t(Se,Pe)}function Nr(e,t){var n=H;H|=2;var o=uc();(Se!==e||Pe!==t)&&(yt=null,Zt(e,t));do try{jh();break}catch(r){lc(e,r)}while(!0);if(is(),H=n,Ir.current=o,fe!==null)throw Error(B(261));return Se=null,Pe=0,ye}function jh(){for(;fe!==null;)dc(fe)}function Vh(){for(;fe!==null&&!hp();)dc(fe)}function dc(e){var t=hc(e.alternate,e,je);e.memoizedProps=e.pendingProps,t===null?cc(e):fe=t,xs.current=null}function cc(e){var t=e;do{var n=t.alternate;if(e=t.return,t.flags&32768){if(n=Fh(n,t),n!==null){n.flags&=32767,fe=n;return}if(e!==null)e.flags|=32768,e.subtreeFlags=0,e.deletions=null;else{ye=6,fe=null;return}}else if(n=Oh(n,t,je),n!==null){fe=n;return}if(t=t.sibling,t!==null){fe=t;return}fe=t=e}while(t!==null);ye===0&&(ye=5)}function Kt(e,t,n){var o=q,r=qe.transition;try{qe.transition=null,q=1,Wh(e,t,n,o)}finally{qe.transition=r,q=o}return null}function Wh(e,t,n,o){do _n();while(It!==null);if(H&6)throw Error(B(327));n=e.finishedWork;var r=e.finishedLanes;if(n===null)return null;if(e.finishedWork=null,e.finishedLanes=0,n===e.current)throw Error(B(177));e.callbackNode=null,e.callbackPriority=0;var i=n.lanes|n.childLanes;if(kp(e,i),e===Se&&(fe=Se=null,Pe=0),!(n.subtreeFlags&2064)&&!(n.flags&2064)||Zo||(Zo=!0,fc(yr,function(){return _n(),null})),i=(n.flags&15990)!==0,n.subtreeFlags&15990||i){i=qe.transition,qe.transition=null;var a=q;q=1;var l=H;H|=4,xs.current=null,Rh(e,n),ic(n,e),uh(aa),vr=!!ia,aa=ia=null,e.current=n,zh(n),fp(),H=l,q=a,qe.transition=i}else e.current=n;if(Zo&&(Zo=!1,It=e,Fr=r),i=e.pendingLanes,i===0&&(Mt=null),yp(n.stateNode),Ge(e,pe()),t!==null)for(o=e.onRecoverableError,n=0;n<t.length;n++)r=t[n],o(r.value,{componentStack:r.stack,digest:r.digest});if(Or)throw Or=!1,e=Da,Da=null,e;return Fr&1&&e.tag!==0&&_n(),i=e.pendingLanes,i&1?e===La?po++:(po=0,La=e):po=0,$t(),null}function _n(){if(It!==null){var e=Hu(Fr),t=qe.transition,n=q;try{if(qe.transition=null,q=16>e?16:e,It===null)var o=!1;else{if(e=It,It=null,Fr=0,H&6)throw Error(B(331));var r=H;for(H|=4,A=e.current;A!==null;){var i=A,a=i.child;if(A.flags&16){var l=i.deletions;if(l!==null){for(var s=0;s<l.length;s++){var u=l[s];for(A=u;A!==null;){var p=A;switch(p.tag){case 0:case 11:case 15:uo(8,p,i)}var f=p.child;if(f!==null)f.return=p,A=f;else for(;A!==null;){p=A;var c=p.sibling,S=p.return;if(nc(p),p===u){A=null;break}if(c!==null){c.return=S,A=c;break}A=S}}}var v=i.alternate;if(v!==null){var w=v.child;if(w!==null){v.child=null;do{var I=w.sibling;w.sibling=null,w=I}while(w!==null)}}A=i}}if(i.subtreeFlags&2064&&a!==null)a.return=i,A=a;else e:for(;A!==null;){if(i=A,i.flags&2048)switch(i.tag){case 0:case 11:case 15:uo(9,i,i.return)}var m=i.sibling;if(m!==null){m.return=i.return,A=m;break e}A=i.return}}var h=e.current;for(A=h;A!==null;){a=A;var y=a.child;if(a.subtreeFlags&2064&&y!==null)y.return=a,A=y;else e:for(a=h;A!==null;){if(l=A,l.flags&2048)try{switch(l.tag){case 0:case 11:case 15:Yr(9,l)}}catch(T){de(l,l.return,T)}if(l===a){A=null;break e}var b=l.sibling;if(b!==null){b.return=l.return,A=b;break e}A=l.return}}if(H=r,$t(),ft&&typeof ft.onPostCommitFiberRoot=="function")try{ft.onPostCommitFiberRoot(Wr,e)}catch{}o=!0}return o}finally{q=n,qe.transition=t}}return!1}function Gl(e,t,n){t=Rn(n,t),t=Hd(e,t,1),e=zt(e,t,1),t=Ae(),e!==null&&(Io(e,1,t),Ge(e,t))}function de(e,t,n){if(e.tag===3)Gl(e,e,n);else for(;t!==null;){if(t.tag===3){Gl(t,e,n);break}else if(t.tag===1){var o=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof o.componentDidCatch=="function"&&(Mt===null||!Mt.has(o))){e=Rn(n,e),e=$d(t,e,1),t=zt(t,e,1),e=Ae(),t!==null&&(Io(t,1,e),Ge(t,e));break}}t=t.return}}function Uh(e,t,n){var o=e.pingCache;o!==null&&o.delete(t),t=Ae(),e.pingedLanes|=e.suspendedLanes&n,Se===e&&(Pe&n)===n&&(ye===4||ye===3&&(Pe&130023424)===Pe&&500>pe()-Ss?Zt(e,0):vs|=n),Ge(e,t)}function pc(e,t){t===0&&(e.mode&1?(t=Wo,Wo<<=1,!(Wo&130023424)&&(Wo=4194304)):t=1);var n=Ae();e=Pt(e,t),e!==null&&(Io(e,t,n),Ge(e,n))}function Hh(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),pc(e,n)}function $h(e,t){var n=0;switch(e.tag){case 13:var o=e.stateNode,r=e.memoizedState;r!==null&&(n=r.retryLane);break;case 19:o=e.stateNode;break;default:throw Error(B(314))}o!==null&&o.delete(t),pc(e,n)}var hc;hc=function(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps||ze.current)Re=!0;else{if(!(e.lanes&n)&&!(t.flags&128))return Re=!1,Ih(e,t,n);Re=!!(e.flags&131072)}else Re=!1,oe&&t.flags&1048576&&yd(t,Dr,t.index);switch(t.lanes=0,t.tag){case 2:var o=t.type;dr(e,t),e=t.pendingProps;var r=In(t,Ce.current);Cn(t,n),r=hs(null,t,o,e,r,n);var i=fs();return t.flags|=1,typeof r=="object"&&r!==null&&typeof r.render=="function"&&r.$$typeof===void 0?(t.tag=1,t.memoizedState=null,t.updateQueue=null,Me(o)?(i=!0,Pr(t)):i=!1,t.memoizedState=r.state!==null&&r.state!==void 0?r.state:null,ls(t),r.updater=qr,t.stateNode=r,r._reactInternals=t,ga(t,o,e,n),t=xa(null,t,o,!0,i,n)):(t.tag=0,oe&&i&&ts(t),_e(null,t,r,n),t=t.child),t;case 16:o=t.elementType;e:{switch(dr(e,t),e=t.pendingProps,r=o._init,o=r(o._payload),t.type=o,r=t.tag=Xh(o),e=tt(o,e),r){case 0:t=ya(null,t,o,e,n);break e;case 1:t=Cl(null,t,o,e,n);break e;case 11:t=El(null,t,o,e,n);break e;case 14:t=Tl(null,t,o,tt(o.type,e),n);break e}throw Error(B(306,o,""))}return t;case 0:return o=t.type,r=t.pendingProps,r=t.elementType===o?r:tt(o,r),ya(e,t,o,r,n);case 1:return o=t.type,r=t.pendingProps,r=t.elementType===o?r:tt(o,r),Cl(e,t,o,r,n);case 3:e:{if(qd(t),e===null)throw Error(B(387));o=t.pendingProps,i=t.memoizedState,r=i.element,kd(e,t),Tr(t,o,null,n);var a=t.memoizedState;if(o=a.element,i.isDehydrated)if(i={element:o,isDehydrated:!1,cache:a.cache,pendingSuspenseBoundaries:a.pendingSuspenseBoundaries,transitions:a.transitions},t.updateQueue.baseState=i,t.memoizedState=i,t.flags&256){r=Rn(Error(B(423)),t),t=_l(e,t,o,n,r);break e}else if(o!==r){r=Rn(Error(B(424)),t),t=_l(e,t,o,n,r);break e}else for(Ve=Rt(t.stateNode.containerInfo.firstChild),We=t,oe=!0,ot=null,n=wd(t,null,o,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(On(),o===r){t=Bt(e,t,n);break e}_e(e,t,o,n)}t=t.child}return t;case 5:return Pd(t),e===null&&pa(t),o=t.type,r=t.pendingProps,i=e!==null?e.memoizedProps:null,a=r.children,sa(o,r)?a=null:i!==null&&sa(o,i)&&(t.flags|=32),Kd(e,t),_e(e,t,a,n),t.child;case 6:return e===null&&pa(t),null;case 13:return Yd(e,t,n);case 4:return us(t,t.stateNode.containerInfo),o=t.pendingProps,e===null?t.child=Fn(t,null,o,n):_e(e,t,o,n),t.child;case 11:return o=t.type,r=t.pendingProps,r=t.elementType===o?r:tt(o,r),El(e,t,o,r,n);case 7:return _e(e,t,t.pendingProps,n),t.child;case 8:return _e(e,t,t.pendingProps.children,n),t.child;case 12:return _e(e,t,t.pendingProps.children,n),t.child;case 10:e:{if(o=t.type._context,r=t.pendingProps,i=t.memoizedProps,a=r.value,ee(Lr,o._currentValue),o._currentValue=a,i!==null)if(at(i.value,a)){if(i.children===r.children&&!ze.current){t=Bt(e,t,n);break e}}else for(i=t.child,i!==null&&(i.return=t);i!==null;){var l=i.dependencies;if(l!==null){a=i.child;for(var s=l.firstContext;s!==null;){if(s.context===o){if(i.tag===1){s=wt(-1,n&-n),s.tag=2;var u=i.updateQueue;if(u!==null){u=u.shared;var p=u.pending;p===null?s.next=s:(s.next=p.next,p.next=s),u.pending=s}}i.lanes|=n,s=i.alternate,s!==null&&(s.lanes|=n),ha(i.return,n,t),l.lanes|=n;break}s=s.next}}else if(i.tag===10)a=i.type===t.type?null:i.child;else if(i.tag===18){if(a=i.return,a===null)throw Error(B(341));a.lanes|=n,l=a.alternate,l!==null&&(l.lanes|=n),ha(a,n,t),a=i.sibling}else a=i.child;if(a!==null)a.return=i;else for(a=i;a!==null;){if(a===t){a=null;break}if(i=a.sibling,i!==null){i.return=a.return,a=i;break}a=a.return}i=a}_e(e,t,r.children,n),t=t.child}return t;case 9:return r=t.type,o=t.pendingProps.children,Cn(t,n),r=Ye(r),o=o(r),t.flags|=1,_e(e,t,o,n),t.child;case 14:return o=t.type,r=tt(o,t.pendingProps),r=tt(o.type,r),Tl(e,t,o,r,n);case 15:return Qd(e,t,t.type,t.pendingProps,n);case 17:return o=t.type,r=t.pendingProps,r=t.elementType===o?r:tt(o,r),dr(e,t),t.tag=1,Me(o)?(e=!0,Pr(t)):e=!1,Cn(t,n),Ud(t,o,r),ga(t,o,r,n),xa(null,t,o,!0,e,n);case 19:return Jd(e,t,n);case 22:return Xd(e,t,n)}throw Error(B(156,t.tag))};function fc(e,t){return ju(e,t)}function Qh(e,t,n,o){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=o,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Ke(e,t,n,o){return new Qh(e,t,n,o)}function Ps(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Xh(e){if(typeof e=="function")return Ps(e)?1:0;if(e!=null){if(e=e.$$typeof,e===Wa)return 11;if(e===Ua)return 14}return 2}function jt(e,t){var n=e.alternate;return n===null?(n=Ke(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&14680064,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n}function hr(e,t,n,o,r,i){var a=2;if(o=e,typeof e=="function")Ps(e)&&(a=1);else if(typeof e=="string")a=5;else e:switch(e){case gn:return en(n.children,r,i,t);case Va:a=8,r|=8;break;case Mi:return e=Ke(12,n,t,r|2),e.elementType=Mi,e.lanes=i,e;case Gi:return e=Ke(13,n,t,r),e.elementType=Gi,e.lanes=i,e;case ji:return e=Ke(19,n,t,r),e.elementType=ji,e.lanes=i,e;case Pu:return Zr(n,r,i,t);default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case bu:a=10;break e;case ku:a=9;break e;case Wa:a=11;break e;case Ua:a=14;break e;case Et:a=16,o=null;break e}throw Error(B(130,e==null?e:typeof e,""))}return t=Ke(a,n,t,r),t.elementType=e,t.type=o,t.lanes=i,t}function en(e,t,n,o){return e=Ke(7,e,o,t),e.lanes=n,e}function Zr(e,t,n,o){return e=Ke(22,e,o,t),e.elementType=Pu,e.lanes=n,e.stateNode={isHidden:!1},e}function Ii(e,t,n){return e=Ke(6,e,null,t),e.lanes=n,e}function Oi(e,t,n){return t=Ke(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}function Kh(e,t,n,o,r){this.tag=t,this.containerInfo=e,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=fi(0),this.expirationTimes=fi(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=fi(0),this.identifierPrefix=o,this.onRecoverableError=r,this.mutableSourceEagerHydrationData=null}function Bs(e,t,n,o,r,i,a,l,s){return e=new Kh(e,t,n,l,s),t===1?(t=1,i===!0&&(t|=8)):t=0,i=Ke(3,null,null,t),e.current=i,i.stateNode=e,i.memoizedState={element:o,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},ls(i),e}function qh(e,t,n){var o=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:fn,key:o==null?null:""+o,children:e,containerInfo:t,implementation:n}}function gc(e){if(!e)return Wt;e=e._reactInternals;e:{if(ln(e)!==e||e.tag!==1)throw Error(B(170));var t=e;do{switch(t.tag){case 3:t=t.stateNode.context;break e;case 1:if(Me(t.type)){t=t.stateNode.__reactInternalMemoizedMergedChildContext;break e}}t=t.return}while(t!==null);throw Error(B(171))}if(e.tag===1){var n=e.type;if(Me(n))return gd(e,n,t)}return t}function mc(e,t,n,o,r,i,a,l,s){return e=Bs(n,o,!0,e,r,i,a,l,s),e.context=gc(null),n=e.current,o=Ae(),r=Gt(n),i=wt(o,r),i.callback=t??null,zt(n,i,r),e.current.lanes=r,Io(e,r,o),Ge(e,o),e}function ei(e,t,n,o){var r=t.current,i=Ae(),a=Gt(r);return n=gc(n),t.context===null?t.context=n:t.pendingContext=n,t=wt(i,a),t.payload={element:e},o=o===void 0?null:o,o!==null&&(t.callback=o),e=zt(r,t,a),e!==null&&(it(e,r,a,i),sr(e,r,a)),a}function Rr(e){if(e=e.current,!e.child)return null;switch(e.child.tag){case 5:return e.child.stateNode;default:return e.child.stateNode}}function jl(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function Ds(e,t){jl(e,t),(e=e.alternate)&&jl(e,t)}function Yh(){return null}var yc=typeof reportError=="function"?reportError:function(e){console.error(e)};function Ls(e){this._internalRoot=e}ti.prototype.render=Ls.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(B(409));ei(e,t,null,null)};ti.prototype.unmount=Ls.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;an(function(){ei(null,e,null,null)}),t[kt]=null}};function ti(e){this._internalRoot=e}ti.prototype.unstable_scheduleHydration=function(e){if(e){var t=Xu();e={blockedOn:null,target:e,priority:t};for(var n=0;n<Ct.length&&t!==0&&t<Ct[n].priority;n++);Ct.splice(n,0,e),n===0&&qu(e)}};function Es(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function ni(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11&&(e.nodeType!==8||e.nodeValue!==" react-mount-point-unstable "))}function Vl(){}function Jh(e,t,n,o,r){if(r){if(typeof o=="function"){var i=o;o=function(){var u=Rr(a);i.call(u)}}var a=mc(t,o,e,0,null,!1,!1,"",Vl);return e._reactRootContainer=a,e[kt]=a.current,bo(e.nodeType===8?e.parentNode:e),an(),a}for(;r=e.lastChild;)e.removeChild(r);if(typeof o=="function"){var l=o;o=function(){var u=Rr(s);l.call(u)}}var s=Bs(e,0,!1,null,null,!1,!1,"",Vl);return e._reactRootContainer=s,e[kt]=s.current,bo(e.nodeType===8?e.parentNode:e),an(function(){ei(t,s,n,o)}),s}function oi(e,t,n,o,r){var i=n._reactRootContainer;if(i){var a=i;if(typeof r=="function"){var l=r;r=function(){var s=Rr(a);l.call(s)}}ei(t,a,e,r)}else a=Jh(n,t,e,r,o);return Rr(a)}$u=function(e){switch(e.tag){case 3:var t=e.stateNode;if(t.current.memoizedState.isDehydrated){var n=to(t.pendingLanes);n!==0&&(Qa(t,n|1),Ge(t,pe()),!(H&6)&&(zn=pe()+500,$t()))}break;case 13:an(function(){var o=Pt(e,1);if(o!==null){var r=Ae();it(o,e,1,r)}}),Ds(e,1)}};Xa=function(e){if(e.tag===13){var t=Pt(e,134217728);if(t!==null){var n=Ae();it(t,e,134217728,n)}Ds(e,134217728)}};Qu=function(e){if(e.tag===13){var t=Gt(e),n=Pt(e,t);if(n!==null){var o=Ae();it(n,e,t,o)}Ds(e,t)}};Xu=function(){return q};Ku=function(e,t){var n=q;try{return q=e,t()}finally{q=n}};Yi=function(e,t,n){switch(t){case"input":if(Ui(e,n),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+t)+'][type="radio"]'),t=0;t<n.length;t++){var o=n[t];if(o!==e&&o.form===e.form){var r=Qr(o);if(!r)throw Error(B(90));Du(o),Ui(o,r)}}}break;case"textarea":Eu(e,n);break;case"select":t=n.value,t!=null&&Dn(e,!!n.multiple,t,!1)}};Fu=ws;Nu=an;var Zh={usingClientEntryPoint:!1,Events:[Fo,vn,Qr,Iu,Ou,ws]},Yn={findFiberByHostInstance:qt,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},ef={bundleType:Yn.bundleType,version:Yn.version,rendererPackageName:Yn.rendererPackageName,rendererConfig:Yn.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:Dt.ReactCurrentDispatcher,findHostInstanceByFiber:function(e){return e=Mu(e),e===null?null:e.stateNode},findFiberByHostInstance:Yn.findFiberByHostInstance||Yh,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var er=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!er.isDisabled&&er.supportsFiber)try{Wr=er.inject(ef),ft=er}catch{}}He.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Zh;He.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Es(t))throw Error(B(200));return qh(e,t,null,n)};He.createRoot=function(e,t){if(!Es(e))throw Error(B(299));var n=!1,o="",r=yc;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(o=t.identifierPrefix),t.onRecoverableError!==void 0&&(r=t.onRecoverableError)),t=Bs(e,1,!1,null,null,n,!1,o,r),e[kt]=t.current,bo(e.nodeType===8?e.parentNode:e),new Ls(t)};He.findDOMNode=function(e){if(e==null)return null;if(e.nodeType===1)return e;var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(B(188)):(e=Object.keys(e).join(","),Error(B(268,e)));return e=Mu(t),e=e===null?null:e.stateNode,e};He.flushSync=function(e){return an(e)};He.hydrate=function(e,t,n){if(!ni(t))throw Error(B(200));return oi(null,e,t,!0,n)};He.hydrateRoot=function(e,t,n){if(!Es(e))throw Error(B(405));var o=n!=null&&n.hydratedSources||null,r=!1,i="",a=yc;if(n!=null&&(n.unstable_strictMode===!0&&(r=!0),n.identifierPrefix!==void 0&&(i=n.identifierPrefix),n.onRecoverableError!==void 0&&(a=n.onRecoverableError)),t=mc(t,null,e,1,n??null,r,!1,i,a),e[kt]=t.current,bo(e),o)for(e=0;e<o.length;e++)n=o[e],r=n._getVersion,r=r(n._source),t.mutableSourceEagerHydrationData==null?t.mutableSourceEagerHydrationData=[n,r]:t.mutableSourceEagerHydrationData.push(n,r);return new ti(t)};He.render=function(e,t,n){if(!ni(t))throw Error(B(200));return oi(null,e,t,!1,n)};He.unmountComponentAtNode=function(e){if(!ni(e))throw Error(B(40));return e._reactRootContainer?(an(function(){oi(null,null,e,!1,function(){e._reactRootContainer=null,e[kt]=null})}),!0):!1};He.unstable_batchedUpdates=ws;He.unstable_renderSubtreeIntoContainer=function(e,t,n,o){if(!ni(n))throw Error(B(200));if(e==null||e._reactInternals===void 0)throw Error(B(38));return oi(e,t,n,!1,o)};He.version="18.3.1-next-f1338f8080-20240426";function xc(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(xc)}catch(e){console.error(e)}}xc(),xu.exports=He;var tf=xu.exports,Wl=tf;Ri.createRoot=Wl.createRoot,Ri.hydrateRoot=Wl.hydrateRoot;const nf=`\uFEFFkey,ja,en,note
"title","匿名化エクスポート","Anonymized export","匿名化して書き出す画面 > 見出し"
"alert.noTargets","匿名化対象が 1 件もありません。
取り込み時に匿名化していないか、追加の対象を入力してください。","There is nothing to anonymize.
No names were anonymized when the transcripts were imported. Enter additional targets.","匿名化して書き出す画面 > 置き換える名前が 1 つも無いときの注意"
"hint.intro","原文に含まれる人名・組織名を仮名に置換した <strong>.tem</strong> を別ファイル名 (<code>{{file}}</code>) で書き出します。元のドキュメントには影響しません。","Saves a <strong>.tem</strong> file in which personal and organization names in the transcripts are replaced with pseudonyms, under a separate file name (<code>{{file}}</code>). The original document is not changed.","匿名化して書き出す画面 > 説明の 1 段目（file は書き出すファイル名。<strong>・<code> のタグは残す）"
"hint.replaced","置換対象: 段落本文・段落の話者欄・SourceRef.quoteText・Box / Line / SDSG の description。","Replaced: paragraph text, paragraph speaker fields, SourceRef.quoteText, and the description of Boxes, Lines and SD/SG.","匿名化して書き出す画面 > 説明の 2 段目（置き換える所。プロパティ名は訳さない）"
"hint.notReplaced","置換しないもの: Box.label / Line.label / SDSG.label (解析者の概念名なので個別確認が必要)。","Not replaced: Box.label / Line.label / SDSG.label (these are the analyst's concept names; check them one by one).","匿名化して書き出す画面 > 説明の 3 段目"
"existing.title","既存の匿名化マップ ({{count}} 件)","Existing anonymization maps ({{count}} entries)","匿名化して書き出す画面 > 取り込み時に作った置き換え表の見出し"
existing.title_one,既存の匿名化マップ ({{count}} 件),Existing anonymization maps ({{count}} entry),件数が 1 のときの英語の形（日本語は使われない）
"existing.none","原文が登録されていません。","No transcripts registered.","匿名化して書き出す画面 > 逐語録が無いとき"
"existing.session","第{{n}}回","Session {{n}}","匿名化して書き出す画面 > 逐語録のインタビューの回"
"existing.count","{{title}}: {{count}} 件","{{title}}: {{count}} entries","匿名化して書き出す画面 > 逐語録ごとの置き換えの数（title は逐語録の題）"
existing.count_one,{{title}}: {{count}} 件,{{title}}: {{count}} entry,件数が 1 のときの英語の形（日本語は使われない）
"additional.title","追加の匿名化対象 (任意)","Additional targets (optional)","匿名化して書き出す画面 > 追加で置き換える名前の節の見出し"
"additional.names","氏名・組織名","Names and organizations","匿名化して書き出す画面 > 入力欄の名前"
"additional.placeholder","コンマ区切り (例: 山田太郎, X 大学, 田中先生)","Comma-separated (e.g. Taro Yamada, X University, Ms. Tanaka)","匿名化して書き出す画面 > 入力欄の例"
"additional.prefix","仮名 prefix","Pseudonym prefix","匿名化して書き出す画面 > 仮名の頭に付ける語の欄"
"cancel","キャンセル","Cancel","匿名化して書き出す画面 > ボタン"
"export","匿名化版を書き出す","Export anonymized copy","匿名化して書き出す画面 > 書き出すボタン"
`,of=`\uFEFFkey,ja,en,note
"alert.demoLoadFailed","デモファイルの読み込みに失敗しました: {{message}}","Failed to load the demo file: {{message}}","警告の窓（起動ウィザードでデモを開けなかったとき）。{{message}} はエラーの内容"
"alert.transcriptDemoLoadFailed","原文連動デモの読み込みに失敗しました: {{message}}","Failed to load the transcript demo: {{message}}","警告の窓（原文連動デモを開けなかったとき）。{{message}} はエラーの内容"
"confirm.restore","前回保存されていないTEM図が見つかりました。
タイトル: {{title}}
自動保存日時: {{savedAt}}

復元しますか？
[OK] 復元する
[キャンセル] 破棄して新規作成","An unsaved TEM diagram from your last session was found.
Title: {{title}}
Autosaved at: {{savedAt}}

Restore it?
[OK] Restore
[Cancel] Discard and start new","確認の窓（起動時に自動保存が残っていたとき）。[OK]・[キャンセル] はブラウザのボタンの名前に合わせる"
"confirm.transcriptPrivacy","この .tem ファイルにはインタビュー原文 ({{count}} 件) が同梱されています。

他者と共有する場合、原文に含まれる個人情報も一緒に共有されます。
共有相手・公開範囲を確認したうえで保存してください。

OK で保存を続行します（次回以降この警告は表示されません）。
キャンセルすると保存を中止します。","This .tem file contains interview transcripts ({{count}}).

If you share it, any personal information in the transcripts is shared too.
Check who you are sharing it with and how widely before saving.

Click OK to continue saving (this warning will not be shown again).
Click Cancel to stop saving.","確認の窓（逐語録を含むファイルを保存するとき）"
"confirm.discardAndOpen","未保存の変更があります。破棄して開きますか？","You have unsaved changes. Discard them and open a file?","確認の窓（未保存のまま ファイル > 開く）"
"confirm.discardAndNew","未保存の変更があります。破棄して新規作成しますか？","You have unsaved changes. Discard them and create a new file?","確認の窓（未保存のまま ファイル > 新規）"
"alert.fileLoadFailed","ファイルの読み込みに失敗しました: {{message}}","Failed to load the file: {{message}}","警告の窓（ファイルを開けなかったとき）。{{message}} はエラーの内容"
"confirm.duplicateSheetNames","現在と同じシート名が {{count}} 件あります:
{{names}}

このまま追加するとシート名が重複します（シート ID は自動でユニーク化されます）。
続行しますか？","{{count}} sheets have the same names as current sheets:
{{names}}

If you add them, sheet names will be duplicated (sheet IDs are made unique automatically).
Continue?","確認の窓（ファイル > 別シートとして開く で名前が重なるとき）。{{names}} はシート名の一覧"
confirm.duplicateSheetNames_one,"現在と同じシート名が {{count}} 件あります:
{{names}}

このまま追加するとシート名が重複します（シート ID は自動でユニーク化されます）。
続行しますか？","{{count}} sheet has the same name as a current sheet:
{{names}}

If you add it, sheet names will be duplicated (sheet IDs are made unique automatically).
Continue?",件数が 1 のときの英語の形（日本語は使われない）
"sheetNameBullet","・{{name}}","- {{name}}","上の確認の窓のシート名の一覧の 1 行"
"alert.noActiveSheet","アクティブシートが見つかりません","The active sheet was not found.","警告の窓（CSV エクスポートで今のシートが見つからないとき）"
"error.exportPreview.title","出力プレビューでエラー","Error in export preview","出力の画面が壊れたときの代わりの窓の見出し"
"error.exportPreview.body","ダイアログの描画中にエラーが発生しました。console にスタックトレースが出ています。","An error occurred while drawing the dialog. The stack trace is in the console.","出力の画面が壊れたときの代わりの窓の本文"
"error.transcript.title","原文ビューアでエラー","Error in transcript viewer","原文ビューアが壊れたときの代わりの窓の見出し"
"error.transcript.body","原文ビューアの描画中にエラーが発生しました。console にスタックトレースが出ています。","An error occurred while drawing the transcript viewer. The stack trace is in the console.","原文ビューアが壊れたときの代わりの窓の本文"
"close","閉じる","Close","エラーの代わりの窓のボタン"
`,rf=`\uFEFFkey,ja,en,note
menu.type,種別（{{count}} 個）,Type ({{count}} boxes),Box の右クリックのメニュー > 種別の見出し（選んでいる Box の数）
menu.type_one,種別（{{count}} 個）,Type ({{count}} box),件数が 1 のときの英語の形（日本語は使われない）
menu.itemUp,{{arrow}} Item レベルを 1 上げる,{{arrow}} Raise Item level by 1,Box の右クリックのメニュー
menu.itemDown,{{arrow}} Item レベルを 1 下げる,{{arrow}} Lower Item level by 1,Box の右クリックのメニュー
menu.edit,文字を編集,Edit text,Box の右クリックのメニュー（Box が 1 つのとき）
menu.delete,削除,Delete,Box の右クリックのメニュー
toolbar.type.title,種別を変える（数字のキー 1〜7 でも変えられます）,Change the type (number keys 1–7 also work),選んだ Box の上に出るツールバー > 種別の選択肢の説明
toolbar.itemUp.title,Item レベルを 1 上げる（Shift と矢印のキーでも動かせます）,Raise Item level by 1 (Shift + arrow keys also work),選んだ Box の上に出るツールバー > ボタンの説明
toolbar.itemDown.title,Item レベルを 1 下げる（Shift と矢印のキーでも動かせます）,Lower Item level by 1 (Shift + arrow keys also work),選んだ Box の上に出るツールバー > ボタンの説明
toolbar.count,{{count}} 個に適用,Applies to {{count}} boxes,選んだ Box の上に出るツールバー > 複数を選んでいるとき
toolbar.count_one,{{count}} 個に適用,Applies to {{count}} box,件数が 1 のときの英語の形（日本語は使われない）
`,af=`\uFEFFkey,ja,en,note
"monochrome.name","モノクロ（既定）","Monochrome (default)","設定 > Box のテーマ > 組み込みテーマの名前"
"monochrome.description","全 Box を白背景・黒枠で統一。工場出荷時の見た目に近い。","White fill and black border for every box. Close to the original look.","設定 > Box のテーマ > 組み込みテーマの説明"
"academic.name","学会発表向け（淡色）","Presentations (pale colors)","設定 > Box のテーマ > 組み込みテーマの名前"
"academic.description","淡い色調で各 Box タイプを区別。スライドや学会ポスター向け。","Pale colors tell the box types apart. For slides and conference posters.","設定 > Box のテーマ > 組み込みテーマの説明"
"colorful.name","カラフル","Colorful","設定 > Box のテーマ > 組み込みテーマの名前"
"colorful.description","各 Box タイプを鮮やかな色で塗り分け。発表時の視認性重視。","Vivid colors for each box type. Easy to see in presentations.","設定 > Box のテーマ > 組み込みテーマの説明"
"simplified.name","簡素化方式（線種は実在性だけ・種別はラベル）","Simplified (line style shows observation only, type shown by label)","設定 > Box のテーマ > 組み込みテーマの名前（記号の簡素化方式）"
"simplified.description","実線＝観察された、点線＝観察されなかった。EFP・OPP などの種別は線種でなく種別ラベルで示す。線の角度にも意味を持たせないので、当てると径路の線をカギ線（L 字の線）にする（あとで線ごとに変えられる）。論文用レポートの記号体系の宣言にそのまま書き出す。","Solid = observed, dashed = not observed. Types such as EFP and OPP are shown by type labels, not by line style. Line angles carry no meaning either, so applying it turns trajectory lines into elbow (L-shaped) lines (each line can be changed later). Written as is into the notation declaration of the paper report.","設定 > Box のテーマ > 組み込みテーマの説明"
"catalogFig21.name","カタログTEA 図 2-1 の例（OPP は楕円・BFP は二重線）","Catalog TEA Fig. 2-1 style (OPP as ellipse, BFP double line)","設定 > Box のテーマ > 組み込みテーマの名前（安田ほか編『カタログTEA』2023 第 2 章 図 2-1 の描き分け）"
"catalogFig21.description","カタログTEA（2023）第 2 章 図 2-1 の描き分け。OPP は楕円、BFP は二重線の四角、EFP は太い実線、P-EFP は太い点線、ありえた経験は細い点線。書籍では決まりではなく「変えるとよい」という勧め。第 10 章の描き分け（実現した EFP は二重線、ありえた EFP は点線の二重の四角）は既定のモノクロとほぼ同じ。","The style of Fig. 2-1 in Catalog TEA (2023, ch. 2): OPP as an ellipse, BFP as a double-line rectangle, EFP with a thick solid line, P-EFP with a thick dashed line, possible experiences with a thin dashed line. The book recommends varying line styles but does not prescribe them. The style of ch. 10 (realized EFP double line, possible EFP dashed double rectangle) is close to the default Monochrome.","設定 > Box のテーマ > 組み込みテーマの説明"
"paperBold.name","論文向け（太枠モノクロ）","Papers (bold monochrome)","設定 > Box のテーマ > 組み込みテーマの名前"
"paperBold.description","モノクロ + 太枠で印刷時の視認性を確保。","Monochrome with bold borders for legibility in print.","設定 > Box のテーマ > 組み込みテーマの説明"
"user.defaultName","テーマ {{n}}","Theme {{n}}","設定 > Box のテーマ > 名前を空にして保存したときの名前（n は番号）"
"imported.name","読み込まれたテーマ","Imported theme","設定 > Box のテーマ > 名前の無いテーマを読み込んだときの名前"
`,sf=`\uFEFFkey,ja,en,note
"noSheet","シートがありません","No sheet","図の画面（シートが 1 枚も無いとき）"
"timeArrow.title","ダブルクリックで非可逆的時間タブを開く","Double-click to open the Irreversible Time tab","図の上の非可逆的時間の矢印の説明（マウスを重ねたとき）"
"zoomIn","ズームイン","Zoom in","図の画面の左下のボタンの説明（マウスを重ねたとき）"
"zoomOut","ズームアウト","Zoom out","図の画面の左下のボタンの説明（マウスを重ねたとき）"
"fitAll","全体フィット","Fit all","図の画面の左下のボタンの説明（マウスを重ねたとき）"
"fitWidth","横幅フィット","Fit width","図の画面の左下のボタンの説明（マウスを重ねたとき）"
"fitHeight","縦幅フィット","Fit height","図の画面の左下のボタンの説明（マウスを重ねたとき）"
"mode.move","移動モード（ドラッグで画面パン、図形編集ロック）（キー: H）","Pan mode (drag to pan; shapes are locked) (key: H)","図の画面の左下のボタンの説明（マウスを重ねたとき）"
"mode.pointer","選択モード（図形を自由に操作）（キー: V）","Select mode (move and edit shapes freely) (key: V)","図の画面の左下のボタンの説明（マウスを重ねたとき）"
"mode.select","範囲選択モード（ドラッグで矩形選択）（キー: M）","Area select mode (drag to select a rectangle) (key: M)","図の画面の左下のボタンの説明（マウスを重ねたとき）"
"paper.custom","カスタム","Custom","図の画面の用紙枠の左上の名前（用紙の大きさを自分で決めたとき）"
"band.top.h","上部 (SD)","Top (SD)","図の画面の SD/SG 帯の名前（横型・上の帯）"
"band.top.v","右側 (SD)","Right (SD)","図の画面の SD/SG 帯の名前（縦型・右の帯）"
"band.bottom.h","下部 (SG)","Bottom (SG)","図の画面の SD/SG 帯の名前（横型・下の帯）"
"band.bottom.v","左側 (SG)","Left (SG)","図の画面の SD/SG 帯の名前（縦型・左の帯）"
`,lf=`\uFEFFkey,ja,en,note
"title","更新情報","What's new","ヘルプ > 更新情報 の窓の見出し"
"close","閉じる","Close","更新情報の窓のボタン"
"kind.new","新機能","New","更新情報の項目の種類"
"kind.improved","改善","Improved","更新情報の項目の種類"
"kind.fixed","修正","Fixed","更新情報の項目の種類"
`,uf=`\uFEFFkey,ja,en,note
auto,自動（既定）,Automatic,色選びの小窓の「既定に戻す」ボタン（呼び出し側が文言を渡さないとき）
noFill,塗りつぶしなし,No fill,色選びの小窓の「色なし」ボタン（呼び出し側が文言を渡さないとき）
section.presets,プリセット,Presets,色選びの小窓の見出し（24 色の見本）
section.recent,最近使った色,Recent colors,色選びの小窓の見出し
section.custom,カスタム,Custom,色選びの小窓の見出し（#RRGGBB の入力欄）
nativePicker,OS 標準のカラーピッカー,System color picker,色選びの小窓の右端の色ボタンの説明（マウスを乗せると出る）
`,df=`\uFEFFkey,ja,en,note
"category.file","ファイル","File","コマンドパレット（Ctrl+K で開く検索窓）の分類の見出し"
"category.edit","編集","Edit","コマンドパレットの分類の見出し"
"category.insert","挿入","Insert","コマンドパレットの分類の見出し"
"category.view","表示","View","コマンドパレットの分類の見出し"
"category.align","整列・サイズ","Align and size","コマンドパレットの分類の見出し"
"category.export","出力","Export","コマンドパレットの分類の見出し"
"category.tools","ツール","Tools","コマンドパレットの分類の見出し"
"category.help","ヘルプ","Help","コマンドパレットの分類の見出し"
"aria","コマンドパレット","Command palette","コマンドパレットの名前（読み上げ用）"
"placeholder","コマンドを検索 (例: 保存, 整列, グリッド, 凡例)","Search commands (e.g. save, align, grid, legend)","コマンドパレットの検索欄の薄い字"
"empty","該当するコマンドがありません","No matching commands","コマンドパレット（検索に当たるものが無いとき）"
"footer.select","↑↓ 選択","↑↓ Select","コマンドパレットの下の操作の案内"
"footer.run","Enter 実行","Enter Run","コマンドパレットの下の操作の案内"
"footer.close","Esc 閉じる","Esc Close","コマンドパレットの下の操作の案内"
"cmd.file.new","新規作成","New","コマンドパレットのコマンド（ファイル）"
"cmd.file.open","開く...","Open...","コマンドパレットのコマンド（ファイル）"
"cmd.file.save","保存","Save","コマンドパレットのコマンド（ファイル）"
"cmd.file.save-as","名前を付けて保存...","Save as...","コマンドパレットのコマンド（ファイル）"
"cmd.edit.undo","元に戻す","Undo","コマンドパレットのコマンド（編集）"
"cmd.edit.redo","やり直し","Redo","コマンドパレットのコマンド（編集）"
"cmd.edit.select-all","全選択","Select all","コマンドパレットのコマンド（編集）"
"cmd.edit.copy","コピー","Copy","コマンドパレットのコマンド（編集）"
"cmd.edit.paste","貼り付け","Paste","コマンドパレットのコマンド（編集）"
"cmd.edit.duplicate","複製","Duplicate","コマンドパレットのコマンド（編集）"
"cmd.edit.delete","削除 (選択中)","Delete selection","コマンドパレットのコマンド（編集）"
"cmd.edit.clear-sel","選択を解除","Clear selection","コマンドパレットのコマンド（編集）"
"cmd.edit.fit-to-label-both","Box を文字に合わせる (幅・高さ)","Fit Box to text (width and height)","コマンドパレットのコマンド（編集）"
"cmd.edit.fit-to-label-w","Box 幅を文字に合わせる","Fit Box width to text","コマンドパレットのコマンド（編集）"
"cmd.edit.fit-to-label-h","Box 高さを文字に合わせる","Fit Box height to text","コマンドパレットのコマンド（編集）"
"cmd.insert.box","Box: {{type}} を追加","Box: Add {{type}}","コマンドパレットのコマンド（挿入）。{{type}} は Box の種類の略号（normal・BFP など）"
"cmd.insert.sdsg","{{type}} を追加 (1個=single / 2個以上=between)","Add {{type}} (1 = single / 2 or more = between)","コマンドパレットのコマンド（挿入）。{{type}} は SD か SG"
"cmd.insert.line.rline","Line: RLine (実線) を追加","Line: Add RLine (solid)","コマンドパレットのコマンド（挿入）"
"cmd.insert.line.xline","Line: XLine (点線) を追加","Line: Add XLine (dashed)","コマンドパレットのコマンド（挿入）"
"cmd.insert.between","2 選択 Box の間に挿入...","Insert between two selected Boxes...","コマンドパレットのコマンド（挿入）"
"cmd.insert.period-labels","時期ラベル...","Period labels...","コマンドパレットのコマンド（挿入）"
"cmd.view.toggle-grid","グリッド: {{state}}","Grid: {{state}}","コマンドパレットのコマンド（表示）。{{state}} は ON か OFF（押した後の状態）"
"cmd.view.toggle-snap","スナップ: {{state}}","Snap: {{state}}","コマンドパレットのコマンド（表示）。{{state}} は ON か OFF"
"cmd.view.toggle-paper","用紙枠: {{state}}","Paper frame: {{state}}","コマンドパレットのコマンド（表示）。{{state}} は ON か OFF"
"cmd.view.toggle-all-ids","全 ID バッジ: 切替","All ID badges: toggle","コマンドパレットのコマンド（表示）"
"cmd.view.toggle-top-ruler","上ルーラー: {{state}}","Top ruler: {{state}}","コマンドパレットのコマンド（表示）。{{state}} は ON か OFF"
"cmd.view.toggle-left-ruler","左ルーラー: {{state}}","Left ruler: {{state}}","コマンドパレットのコマンド（表示）。{{state}} は ON か OFF"
"cmd.view.toggle-legend","凡例: {{state}}","Legend: {{state}}","コマンドパレットのコマンド（表示）。{{state}} は ON か OFF"
"cmd.view.fit-all","フィット: 全要素","Fit: all","コマンドパレットのコマンド（表示）"
"cmd.view.fit-width","フィット: 幅","Fit: width","コマンドパレットのコマンド（表示）"
"cmd.view.fit-height","フィット: 高さ","Fit: height","コマンドパレットのコマンド（表示）"
"cmd.align.left","左揃え","Align left","コマンドパレットのコマンド（整列・サイズ）"
"cmd.align.center-h","水平中央揃え","Center horizontally","コマンドパレットのコマンド（整列・サイズ）"
"cmd.align.right","右揃え","Align right","コマンドパレットのコマンド（整列・サイズ）"
"cmd.align.top","上揃え","Align top","コマンドパレットのコマンド（整列・サイズ）"
"cmd.align.middle","垂直中央揃え","Center vertically","コマンドパレットのコマンド（整列・サイズ）"
"cmd.align.bottom","下揃え","Align bottom","コマンドパレットのコマンド（整列・サイズ）"
"cmd.align.distribute-h","水平等間隔","Distribute horizontally","コマンドパレットのコマンド（整列・サイズ）"
"cmd.align.match-w","幅を揃える","Match width","コマンドパレットのコマンド（整列・サイズ）"
"cmd.align.match-h","高さを揃える","Match height","コマンドパレットのコマンド（整列・サイズ）"
"cmd.align.match-both","サイズを揃える (幅・高さ)","Match size (width and height)","コマンドパレットのコマンド（整列・サイズ）"
"cmd.align.match-fontsize","文字サイズを揃える","Match font size","コマンドパレットのコマンド（整列・サイズ）"
"cmd.export.preview","出力プレビュー...","Export preview...","コマンドパレットのコマンド（出力）"
"cmd.export.paper-report","論文レポート...","Paper report...","コマンドパレットのコマンド（出力）"
"cmd.tools.transcript","インタビュー原文ビューア...","Interview transcript viewer...","コマンドパレットのコマンド（ツール）"
"cmd.tools.settings","設定を開く...","Open settings...","コマンドパレットのコマンド（ツール）"
"cmd.tools.settings.general","設定: 全体","Settings: General","コマンドパレットのコマンド（ツール）。設定の画面のタブを開く"
"cmd.tools.settings.snap","設定: スナップ","Settings: Snap","コマンドパレットのコマンド（ツール）。設定の画面のタブを開く"
"cmd.tools.settings.boxstyle","設定: Box スタイル","Settings: Box style","コマンドパレットのコマンド（ツール）。設定の画面のタブを開く"
"cmd.tools.settings.typelabel","設定: タイプラベル","Settings: Type labels","コマンドパレットのコマンド（ツール）。設定の画面のタブを開く"
"cmd.tools.settings.timearrow","設定: 非可逆的時間","Settings: Irreversible Time","コマンドパレットのコマンド（ツール）。設定の画面のタブを開く"
"cmd.tools.settings.period","設定: 時期区分","Settings: Period","コマンドパレットのコマンド（ツール）。設定の画面のタブを開く"
"cmd.tools.settings.legend","設定: 凡例","Settings: Legend","コマンドパレットのコマンド（ツール）。設定の画面のタブを開く"
"cmd.tools.settings.sdsgspace","設定: SD/SG 配置","Settings: SD/SG placement","コマンドパレットのコマンド（ツール）。設定の画面のタブを開く"
"cmd.tools.settings.project","設定: プロジェクト","Settings: Project","コマンドパレットのコマンド（ツール）。設定の画面のタブを開く"
"cmd.tools.csv-import","CSV インポート...","CSV import...","コマンドパレットのコマンド（ツール）"
"cmd.tools.shift-content","コンテンツをシフト...","Shift content...","コマンドパレットのコマンド（ツール）"
"cmd.tools.resize","リサイズ...","Resize...","コマンドパレットのコマンド（ツール）"
"cmd.help.about","バージョン情報","About","コマンドパレットのコマンド（ヘルプ）"
"about.message","TEMer Plus {{version}}
著者: 中田友貴
ライセンス: PolyForm Noncommercial 1.0.0","TEMer Plus {{version}}
Author: Yuki Inoue Nakata
License: PolyForm Noncommercial 1.0.0","バージョン情報の窓の本文。{{version}} は版番号"
"alert.selectBox","Box を選択してください","Select a Box first.","警告の窓（コマンドパレットで Box を選ばずに実行したとき）"
"alert.selectBoxOrLine","Box か Line を選択してください","Select a Box or Line first.","警告の窓（コマンドパレットで SD/SG を追加するとき）"
"alert.selectTwoOrMore","2 つ以上の Box を選択してください","Select two or more Boxes.","警告の窓（コマンドパレットで矢印・整列・揃えるとき）"
`,cf=`\uFEFFkey,ja,en,note
title,コメント,Comments,プロパティ > 選んだ要素のコメントの見出し
listTitle,このシートのコメント,Comments on this sheet,プロパティ > 何も選んでいないときのコメントの一覧の見出し
noOpen,未解決のコメントはありません,No open comments,上の一覧に未解決のコメントが無いとき
placeholder,コメントを書く（Ctrl+Enter で付ける）,Write a comment (Ctrl+Enter to add),コメントの入力欄
authorPlaceholder,名前（任意）,Name (optional),コメントを書いた人の名前の欄
authorTitle,このブラウザに残し、次のコメントにも使います,Remembered in this browser and used for your next comments,名前の欄の説明（マウスを重ねたとき）
add,付ける,Add,コメントを付けるボタン
addTitle,選んだ要素にコメントを付けます,Add a comment to the selected element,付けるボタンの説明
reply,返信,Reply,返信のボタン
replyPlaceholder,返信を書く（Enter で送る）,Write a reply (Enter to send),返信の入力欄
resolve,解決にする,Resolve,コメントを解決済みにするボタン
reopen,未解決に戻す,Reopen,解決済みのコメントを未解決に戻すボタン
delete,削除,Delete,コメントを消すボタン
deleteReply,削除,Delete,返信を消すボタン
resolved,解決済み,resolved,解決済みの印（日付の後ろ）
showResolved,解決済みを表示（{{count}} 件）,Show resolved ({{count}}),解決済みのコメントを表示するボタン
showResolved_one,解決済みを表示（{{count}} 件）,Show resolved ({{count}}),件数が 1 のときの英語の形
hideResolved,解決済みを隠す,Hide resolved,解決済みのコメントを隠すボタン
replies,返信 {{count}} 件,{{count}} replies,一覧の返信の数
replies_one,返信 {{count}} 件,{{count}} reply,件数が 1 のときの英語の形
jump,押すとその要素を選びます,Click to select the element,一覧の項目の説明（マウスを重ねたとき）
badge,未解決のコメント {{count}} 件（選ぶとプロパティで読めます）,{{count}} open comment(s) (select to read them in Properties),図の上のコメントの印の説明（マウスを重ねたとき）
menu,コメントを付ける,Add comment,Box の右クリックのメニュー
`,pf=`\uFEFFkey,ja,en,note
"report.title","TEMer エラー報告 {{time}}","TEMer error report {{time}}","エラーの詳細（コピーして開発者に送る文）の 1 行目。{{time}} は日時"
"report.message","メッセージ: {{message}}","Message: {{message}}","エラーの詳細の行"
"report.browser","ブラウザ: {{ua}}","Browser: {{ua}}","エラーの詳細の行"
"report.componentStack","部品の位置（componentStack）:","Component location (componentStack):","エラーの詳細の行"
"report.stack","スタック:","Stack:","エラーの詳細の行"
"report.none","（なし）","(none)","エラーの詳細（情報が無いとき）"
"file.defaultTitle","TEM図","TEM diagram","エラー時に保存するファイルの名前（図の題が無いとき）"
"file.suffix","エラー時の退避","crash-backup","エラー時に保存するファイルの名前の一部（題_この語_日時.tem）"
"heading","予期しないエラーが発生しました","An unexpected error occurred","アプリが止まったときの画面の見出し"
"intro","アプリの描画中にエラーが発生しました。作業中の図は次の方法で取り戻せます。","An error occurred while drawing the app. You can recover the diagram you were working on as follows.","アプリが止まったときの画面の本文"
"backup.saving","作業中の図を自動保存に退避しています…","Saving the current diagram to the autosave…","アプリが止まったときの画面（自動保存に退避中）"
"backup.saved","作業中の図を自動保存に退避しました。下の「再読み込み」を押し、表示される確認で「OK（復元する）」を選んでください。「キャンセル」を選ぶと退避した内容は消えます。","The current diagram was saved to the autosave. Click ""Reload"" below and choose ""OK (Restore)"" in the confirmation that appears. If you choose ""Cancel"", the saved content is discarded.","アプリが止まったときの画面（退避できたとき）。ボタン名は reload・saveTem と合わせる"
"backup.failed","自動保存への退避に失敗しました。下の「作業中の図を .tem として保存」で保存してから再読み込みしてください。","Could not save to the autosave. Use ""Save the current diagram as .tem"" below, then reload.","アプリが止まったときの画面（退避できなかったとき）"
"advice","復元してもまたエラーになる場合は、「作業中の図を .tem として保存」でファイルに保存しておき、そのファイルと下の「エラーの詳細」を開発者に送ってください。","If the error happens again after restoring, use ""Save the current diagram as .tem"" to save a file, and send that file and the ""Error details"" below to the developer.","アプリが止まったときの画面の本文"
"saveTem","作業中の図を .tem として保存","Save the current diagram as .tem","アプリが止まったときの画面のボタン"
"copied","コピーしました","Copied","アプリが止まったときの画面のボタン（コピーした後）"
"copyDetails","エラーの詳細をコピー","Copy error details","アプリが止まったときの画面のボタン"
"reload","再読み込み","Reload","アプリが止まったときの画面のボタン"
"details","エラーの詳細","Error details","アプリが止まったときの画面の開閉できる欄の見出し"
`,hf=`\uFEFFkey,ja,en,note
field.ignore,（無視）,(Ignore),CSV・表の取り込み > 列の割り当ての選択肢（取り込まない列）
field.label,ラベル,Label,CSV・表の取り込み > 列の割り当ての選択肢
field.type,種別,Type,CSV・表の取り込み > Box の列の割り当ての選択肢
field.sublabel,サブラベル,Sublabel,CSV・表の取り込み > 列の割り当ての選択肢
field.description,説明,Description,CSV・表の取り込み > 列の割り当ての選択肢
field.width,幅,Width,CSV・表の取り込み > Box の列の割り当ての選択肢
field.height,高さ,Height,CSV・表の取り込み > Box の列の割り当ての選択肢
line.type,種別 (RLine/XLine),Type (RLine/XLine),CSV・表の取り込み > Line の列の割り当ての選択肢
line.shape,形状 (straight/elbow/curve),Shape (straight/elbow/curve),CSV・表の取り込み > Line の列の割り当ての選択肢
sdsg.type,種別 (SD/SG),Type (SD/SG),CSV・表の取り込み > SD/SG の列の割り当ての選択肢
sdsg.attachedto,紐付け対象 (attachedTo),Attached to (attachedTo),CSV・表の取り込み > SD/SG の列の割り当ての選択肢
sdsg.attachedto2,2 つ目の対象 (attachedTo2),Second target (attachedTo2),CSV・表の取り込み > SD/SG の列の割り当ての選択肢
sdsg.anchormode,アンカー方式 (single/between),Anchor mode (single/between),CSV・表の取り込み > SD/SG の列の割り当ての選択肢
sdsg.spacemode,配置モード (attached/band-top/band-bottom),Placement (attached/band-top/band-bottom),CSV・表の取り込み > SD/SG の列の割り当ての選択肢
period.position,位置 (Time Level),Position (Time Level),CSV・表の取り込み > 時期ラベルの列の割り当ての選択肢
error.nolabel,行 {{row}}: ラベルが空のためスキップ,Row {{row}}: skipped (empty label),CSV・表の取り込み > 取り込めなかった行の一覧（Box・時期ラベル）
error.levelnan,行 {{row}}: Level が数値でないためスキップ,Row {{row}}: skipped (Level is not a number),CSV・表の取り込み > 取り込めなかった行の一覧（Box）
error.line.noends,行 {{row}}: from/to が空のためスキップ,Row {{row}}: skipped (from/to is empty),CSV・表の取り込み > 取り込めなかった行の一覧（Line）
error.line.nofrom,行 {{row}}: from={{id}} に該当する Box がないためスキップ,Row {{row}}: skipped (no Box with from={{id}}),CSV・表の取り込み > 取り込めなかった行の一覧（Line）
error.line.noto,行 {{row}}: to={{id}} に該当する Box がないためスキップ,Row {{row}}: skipped (no Box with to={{id}}),CSV・表の取り込み > 取り込めなかった行の一覧（Line）
error.sdsg.noattached,行 {{row}}: attachedTo が空のためスキップ,Row {{row}}: skipped (attachedTo is empty),CSV・表の取り込み > 取り込めなかった行の一覧（SD/SG）
error.sdsg.attachednotfound,行 {{row}}: attachedTo={{id}} に該当する Box/Line がないためスキップ,Row {{row}}: skipped (no Box/Line with attachedTo={{id}}),CSV・表の取り込み > 取り込めなかった行の一覧（SD/SG）
error.sdsg.attached2notfound,行 {{row}}: attachedTo2={{id}} に該当する Box/Line がないため undefined 扱い,Row {{row}}: no Box/Line with attachedTo2={{id}} (left unset),CSV・表の取り込み > 取り込めなかった行の一覧（SD/SG。行は取り込む）
error.period.positionnan,行 {{row}}: 位置 (position) が数値でないためスキップ,Row {{row}}: skipped (position is not a number),CSV・表の取り込み > 取り込めなかった行の一覧（時期ラベル）
`,ff=`\uFEFFkey,ja,en,note
title,CSV インポート,CSV import,CSV 取り込みの画面の題
dragToMove,ドラッグで移動,Drag to move,CSV 取り込み > 題の帯の吹き出し
entity.box,Box,Box,CSV 取り込み > 取り込む対象の選択肢
entity.line,Line（矢印）,Line (arrow),CSV 取り込み > 取り込む対象の選択肢
entity.sdsg,SDSG（社会的方向 / ガイド）,SDSG (social direction / guidance),CSV 取り込み > 取り込む対象の選択肢
entity.period,時期ラベル,Period label,CSV 取り込み > 取り込む対象の選択肢
field.box.ignore,（無視）,(Ignore),CSV 取り込み > Box の列の役割の選択肢
field.box.label,ラベル,Label,CSV 取り込み > Box の列の役割の選択肢
field.box.type,種別,Type,CSV 取り込み > Box の列の役割の選択肢
field.box.timeLevel,Time Level,Time level,CSV 取り込み > Box の列の役割の選択肢
field.box.itemLevel,Item Level,Item level,CSV 取り込み > Box の列の役割の選択肢
field.box.id,ID,ID,CSV 取り込み > Box の列の役割の選択肢
field.box.subLabel,サブラベル,Sublabel,CSV 取り込み > Box の列の役割の選択肢
field.box.description,説明,Description,CSV 取り込み > Box の列の役割の選択肢
field.box.width,幅,Width,CSV 取り込み > Box の列の役割の選択肢
field.box.height,高さ,Height,CSV 取り込み > Box の列の役割の選択肢
field.line.ignore,（無視）,(Ignore),CSV 取り込み > Line の列の役割の選択肢
field.line.id,ID,ID,CSV 取り込み > Line の列の役割の選択肢
field.line.from,From,From,CSV 取り込み > Line の列の役割の選択肢
field.line.to,To,To,CSV 取り込み > Line の列の役割の選択肢
field.line.type,種別 (RLine/XLine),Type (RLine/XLine),CSV 取り込み > Line の列の役割の選択肢
field.line.shape,形状 (straight/elbow/curve),Shape (straight/elbow/curve),CSV 取り込み > Line の列の役割の選択肢
field.line.label,ラベル,Label,CSV 取り込み > Line の列の役割の選択肢
field.line.description,説明,Description,CSV 取り込み > Line の列の役割の選択肢
field.sdsg.ignore,（無視）,(Ignore),CSV 取り込み > SD/SG の列の役割の選択肢
field.sdsg.id,ID,ID,CSV 取り込み > SD/SG の列の役割の選択肢
field.sdsg.type,種別 (SD/SG),Type (SD/SG),CSV 取り込み > SD/SG の列の役割の選択肢
field.sdsg.label,ラベル,Label,CSV 取り込み > SD/SG の列の役割の選択肢
field.sdsg.attachedTo,紐付け対象 (attachedTo),Attached to (attachedTo),CSV 取り込み > SD/SG の列の役割の選択肢
field.sdsg.attachedTo2,2 つ目の対象 (attachedTo2),Second target (attachedTo2),CSV 取り込み > SD/SG の列の役割の選択肢
field.sdsg.anchorMode,アンカー方式 (single/between),Anchor mode (single/between),CSV 取り込み > SD/SG の列の役割の選択肢
field.sdsg.spaceMode,配置モード (attached/band-top/band-bottom),Placement mode (attached/band-top/band-bottom),CSV 取り込み > SD/SG の列の役割の選択肢
field.sdsg.subLabel,サブラベル,Sublabel,CSV 取り込み > SD/SG の列の役割の選択肢
field.sdsg.description,説明,Description,CSV 取り込み > SD/SG の列の役割の選択肢
field.period.ignore,（無視）,(Ignore),CSV 取り込み > 時期ラベルの列の役割の選択肢
field.period.id,ID,ID,CSV 取り込み > 時期ラベルの列の役割の選択肢
field.period.position,位置 (Time Level),Position (time level),CSV 取り込み > 時期ラベルの列の役割の選択肢
field.period.label,ラベル,Label,CSV 取り込み > 時期ラベルの列の役割の選択肢
error.parse,CSV パースに失敗: {{message}},Could not read the CSV: {{message}},CSV 取り込み > 読み込めなかったときの注意
error.noBoxes,インポート可能な Box がありませんでした。ラベル列を割り当てましたか？,There were no Boxes to import. Did you assign a label column?,CSV 取り込み > 取り込めなかったときの注意
error.noLines,インポート可能な Line がありませんでした。from / to 列を割り当て、from/to の値が現在のシートの Box ID と一致する必要があります。,There were no Lines to import. Assign the from / to columns; their values must match Box IDs on the current sheet.,CSV 取り込み > 取り込めなかったときの注意
error.noSdsg,インポート可能な SDSG がありませんでした。type と attachedTo 列が必要です。,There were no SD/SG to import. The type and attachedTo columns are required.,CSV 取り込み > 取り込めなかったときの注意
error.noPeriods,インポート可能な時期ラベルがありませんでした。position と label 列を割り当ててください。,There were no period labels to import. Assign the position and label columns.,CSV 取り込み > 取り込めなかったときの注意
done.boxes,{{boxes}} 件の Box、{{lines}} 件の Line をインポートしました,Imported {{boxes}} Boxes and {{lines}} Lines,CSV 取り込み > 取り込んだ後の知らせ
done.lines,{{count}} 件の Line をインポートしました,Imported {{count}} Lines,CSV 取り込み > 取り込んだ後の知らせ
done.lines_one,{{count}} 件の Line をインポートしました,Imported {{count}} Line,件数が 1 のときの英語の形（日本語は使われない）
done.sdsg,{{count}} 件の SDSG をインポートしました,Imported {{count}} SD/SG,CSV 取り込み > 取り込んだ後の知らせ
done.periods,{{count}} 件の時期ラベルをインポートしました,Imported {{count}} period labels,CSV 取り込み > 取り込んだ後の知らせ
done.periods_one,{{count}} 件の時期ラベルをインポートしました,Imported {{count}} period label,件数が 1 のときの英語の形（日本語は使われない）
done.withWarnings,インポート完了（警告 {{count}} 件）,Import finished ({{count}} warnings),CSV 取り込み > 警告があったときの知らせの見出し
done.withWarnings_one,インポート完了（警告 {{count}} 件）,Import finished ({{count}} warning),件数が 1 のときの英語の形（日本語は使われない）
target,インポート対象,Import as,CSV 取り込み > 取り込む対象の選択のラベル
chooseFile,CSV ファイルを選択してください。1 行目にヘッダがある場合は自動判定します。,Choose a CSV file. A header in the first row is detected automatically.,CSV 取り込み > ファイル選択の説明
spec.heading,仕様メモ ({{target}}):,Format notes ({{target}}):,CSV 取り込み > 列の決まりの見出し
spec.box.required,必須列: ラベル（label）,Required column: label,CSV 取り込み > Box の列の決まり
spec.box.optional,オプション列: 種別 / Time Level / Item Level / ID / サブラベル / 説明 / 幅 / 高さ,Optional columns: type / time level / item level / ID / sublabel / description / width / height,CSV 取り込み > Box の列の決まり
spec.box.types,種別は英名（BFP / EFP / P-EFP / OPP / annotation / 2nd-EFP）または日本語（分岐点・等至点・両極化した等至点・必須通過点・行為・潜在的な行為・セカンド等至点。旧称の 通常・潜在経験 も読めます）,Type is an English code (BFP / EFP / P-EFP / OPP / annotation / 2nd-EFP) or a Japanese name (分岐点・等至点・両極化した等至点・必須通過点・行為・潜在的な行為・セカンド等至点; the former names 通常 and 潜在経験 are also accepted),CSV 取り込み > Box の列の決まり（日本語の種別名はファイルの中で使える語なので英語版でも日本語のまま）
spec.line.required,必須列: from（始点 Box ID）/ to（終点 Box ID）,Required columns: from (start Box ID) / to (end Box ID),CSV 取り込み > Line の列の決まり
spec.line.optional,オプション列: ID / type (RLine/XLine) / shape (straight/elbow/curve) / label / 説明,Optional columns: ID / type (RLine/XLine) / shape (straight/elbow/curve) / label / description,CSV 取り込み > Line の列の決まり
spec.line.before,from / to は,from / to must match a Box ID that exists on the ,CSV 取り込み > Line の列の決まり（太字の「現在のシート」の前）
spec.line.currentSheet,現在のシート,current sheet,CSV 取り込み > Line の列の決まり（太字の部分）
spec.line.after,に存在する Box ID と一致する必要があります,.,CSV 取り込み > Line の列の決まり（太字の「現在のシート」の後）
spec.sdsg.required,必須列: type (SD/SG) / attachedTo（Box または Line ID）,Required columns: type (SD/SG) / attachedTo (Box or Line ID),CSV 取り込み > SD/SG の列の決まり
spec.sdsg.optional,オプション列: ID / label / attachedTo2 / anchorMode (single/between) / spaceMode (attached/band-top/band-bottom) / subLabel / 説明,Optional columns: ID / label / attachedTo2 / anchorMode (single/between) / spaceMode (attached/band-top/band-bottom) / subLabel / description,CSV 取り込み > SD/SG の列の決まり
spec.sdsg.between,attachedTo2 を指定すると between モードになります（明示的に single を指定すれば single）,"Giving attachedTo2 switches to between mode (unless single is set explicitly)",CSV 取り込み > SD/SG の列の決まり
spec.period.required,必須列: position（Time Level の数値）/ label,Required columns: position (time level number) / label,CSV 取り込み > 時期ラベルの列の決まり
spec.period.optional,オプション列: ID,Optional column: ID,CSV 取り込み > 時期ラベルの列の決まり
hasHeader,1 行目はヘッダ,First row is a header,CSV 取り込み > チェックボックスのラベル
delimiter,区切り文字,Delimiter,CSV 取り込み > 読み取った区切り文字のラベル
rowCount,検出行数,Rows found,CSV 取り込み > 行数のラベル
rowCountValue,{{total}}（ヘッダ除外: {{data}}）,"{{total}} (excluding header: {{data}})",CSV 取り込み > 行数の値
chooseAnother,別ファイルを選ぶ,Choose another file,CSV 取り込み > ボタン
mapping.heading,列マッピング,Column mapping,CSV 取り込み > 見出し
mapping.column,列 #,Column #,CSV 取り込み > 列の対応の表の列名
mapping.header,ヘッダ / 値例,Header / example value,CSV 取り込み > 列の対応の表の列名
mapping.assign,割当,Assign to,CSV 取り込み > 列の対応の表の列名
options.heading,配置オプション,Placement options,CSV 取り込み > 見出し
options.defaultType,種別未指定時のデフォルト,Default type when none is given,CSV 取り込み > 設定のラベル（Box）
options.insertMode,挿入方式,Insert mode,CSV 取り込み > 設定のラベル（Box）
options.append,現在のシート末尾に追加（最大 Time_Level の右隣）,Append to the end of the current sheet (after the largest time level),CSV 取り込み > 挿入方式の選択肢
options.between,指定 Box の間に挿入（以降をシフト）,Insert between chosen Boxes (shift the rest),CSV 取り込み > 挿入方式の選択肢
options.newSheet,新規シートに作成,Create on a new sheet,CSV 取り込み > 挿入方式の選択肢
options.after,この Box の直後に挿入,Insert right after this Box,CSV 取り込み > 設定のラベル（Box の間に挿入）
options.none,（指定しない）,(None),CSV 取り込み > Box の選択肢
options.before,またはこの Box の直前に挿入,Or insert right before this Box,CSV 取り込み > 設定のラベル（Box の間に挿入）
options.gap,シフト時のギャップ (px),Gap when shifting (px),CSV 取り込み > 設定のラベル（Box の間に挿入）
options.autoConnect,Box を順次接続,Connect Boxes in order,CSV 取り込み > 設定のラベル（Box）
options.lineType,接続線種,Connecting line type,CSV 取り込み > 設定のラベル（Box）
options.RLine,実線径路（実現した径路）,Solid (realized trajectory),CSV 取り込み > 線の種類の選択肢
options.XLine,点線径路（実現しなかった径路）,Dotted (unrealized trajectory),CSV 取り込み > 線の種類の選択肢
options.defaultLineType,type 未指定時のデフォルト,Default type when none is given,CSV 取り込み > 設定のラベル（Line）
options.RLineCode,実線（RLine）,Solid (RLine),CSV 取り込み > 線の種類の選択肢（Line）
options.XLineCode,点線（XLine）,Dotted (XLine),CSV 取り込み > 線の種類の選択肢（Line）
preview,プレビュー（先頭 5 行）,Preview (first 5 rows),CSV 取り込み > 見出し
cancel,キャンセル,Cancel,CSV 取り込み > ボタン
import,インポート,Import,CSV 取り込み > ボタン
sheet.defaultName,CSV インポート,CSV import,CSV から取り込んで新しく作るシートの名前（図の言語で入る）
`,gf=`\uFEFFkey,ja,en,note
title,データシート,Data sheet,左の表のパネルの題
show,データシートを表示,Show the data sheet,データシート > 畳んだパネルの吹き出し
resize,幅を調整,Resize,データシート > パネルの端の吹き出し
filter,絞り込み,Filter,データシート > 絞り込みの入力欄（薄字）
delete,削除,Delete,データシート > 行の削除ボタンの吹き出し
col.type,種別,Type,データシート > 表の列名
col.label,ラベル,Label,データシート > 表の列名
box.newIdPrompt,新しいIDを入力,Enter a new ID,データシート > Box の ID を変える入力の問い
box.renameFailed,IDの変更に失敗しました（重複または無効なID）,Could not change the ID (duplicate or invalid ID),データシート > ID を変えられなかったときの注意
box.clipboardReadFailed,クリップボードを読み取れませんでした。ブラウザの許可を確認するか、ラベル欄に直接貼り付けてください（複数行は自動で分割されます）。,"Could not read the clipboard. Check the browser permission, or paste directly into a label cell (multiple lines are split automatically).",データシート > クリップボードを読めなかったときの注意
box.clipboardEmpty,クリップボードにテキストがありません。Excel などで行をコピーしてからお使いください。,"There is no text on the clipboard. Copy rows in Excel or another app first.",データシート > クリップボードが空のときの注意
box.selected,選択 {{count}}個,{{count}} selected,データシート > 選んだ Box の数
box.copy,コピー,Copy,データシート > ボタン
box.copy.tip,選択中の {{count}} 行をコピー（下の「挿入」ボタンで貼り付け）,"Copy the {{count}} selected rows (paste with the ""Insert"" buttons below)",データシート > コピーボタンの吹き出し
box.copy.tip_one,選択中の {{count}} 行をコピー（下の「挿入」ボタンで貼り付け）,"Copy the {{count}} selected row (paste with the ""Insert"" buttons below)",件数が 1 のときの英語の形（日本語は使われない）
box.copy.tipNone,行のチェックボックスで出来事を選択してください,Select events with the row checkboxes,データシート > コピーボタンの吹き出し（何も選んでいないとき）
box.clipboardCount,クリップボード {{count}}行,Clipboard: {{count}} rows,データシート > アプリ内のクリップボードの行数
box.clipboardCount_one,クリップボード {{count}}行,Clipboard: {{count}} row,件数が 1 のときの英語の形（日本語は使われない）
box.pasteMode,貼付モード:,Paste mode:,データシート > 貼り付けの方式のラベル
box.pasteMode.tip,クリップボード挿入時の座標決定方式,How positions are set when inserting from the clipboard,データシート > 貼り付けの方式の吹き出し
box.pasteMode.offset,+20 オフセット,+20 offset,データシート > 貼り付けの方式の選択肢
box.pasteMode.midpoint,中間配置（前後 Box の中間 Time）,Midpoint (time halfway between neighboring Boxes),データシート > 貼り付けの方式の選択肢
box.pasteMode.offsetShort,+20オフセット,+20 offset,データシート > 挿入ボタンの吹き出しの中の方式名
box.pasteMode.midpointShort,中間配置,midpoint,データシート > 挿入ボタンの吹き出しの中の方式名
box.selectAll,表示中の全て選択/解除,Select / deselect all shown,データシート > 見出しのチェックボックスの吹き出し
box.select.tip,クリック: 単独選択 / {{ctrl}}クリック: 追加 / Shift+クリック: 範囲選択,Click: select one / {{ctrl}}click: add / Shift+click: select range,データシート > 行のチェックボックスの吹き出し（{{ctrl}} は Ctrl+ か Mac の記号）
box.id.tip,ダブルクリックで変更,Double-click to change,データシート > ID の欄の吹き出し
box.type.tip,変更するとIDも自動更新,Changing it also updates the ID,データシート > 種別の欄の吹き出し
box.label.tip,Excelから複数行コピペ可,You can paste multiple rows from Excel,データシート > ラベルの欄の吹き出し
box.insertBelow.tip,この下にコピーした行を挿入（{{count}} 行、モード: {{mode}}）,"Insert the copied rows below ({{count}} rows, mode: {{mode}})",データシート > 行の挿入ボタンの吹き出し
box.insertBelow.tip_one,この下にコピーした行を挿入（{{count}} 行、モード: {{mode}}）,"Insert the copied row below ({{count}} row, mode: {{mode}})",件数が 1 のときの英語の形（日本語は使われない）
box.insertBelowText.tip,この下に Excel / テキストの行を挿入（OS のクリップボードを 1 行 = 1 Box として読み込みます）,Insert rows from Excel / text below (each line of the system clipboard becomes one Box),データシート > 行の挿入ボタンの吹き出し（アプリ内のクリップボードが空のとき）
box.insertHere.tip,ここに{{count}}個挿入,Insert {{count}} here,データシート > 行の間の挿入ボタンの吹き出し
box.insertHere,＋ここに挿入,+ Insert here,データシート > 行の間の挿入ボタン
box.insertHereN,＋ここに{{count}}個挿入,+ Insert {{count}} here,データシート > 行の間の挿入ボタン（2 個以上）
box.noMatch,該当するBoxがありません,No matching Boxes,データシート > 絞り込みで何も無いとき
box.empty,Boxがありません。下の「+追加」で作成,"No Boxes yet. Create one with ""+ Add new"" below",データシート > Box が無いとき
box.add,＋ 新規追加,+ Add new,データシート > ボタン
box.add.tip,末尾に新規Boxを追加,Add a new Box at the end,データシート > 追加ボタンの吹き出し
box.insertCount,挿入個数:,Insert count:,データシート > 一度に挿入する数のラベル
box.insertCount.tip,挿入ボタンで追加する個数,How many to add with the insert buttons,データシート > 一度に挿入する数の吹き出し
box.insertCount.unit,個,items,データシート > 一度に挿入する数の単位
line.hint,※ Lineはキャンバスで接続,Connect Lines on the canvas,データシート > Line の表の説明
line.RLine,実線,Solid,データシート > 線の種類の選択肢
line.XLine,点線,Dotted,データシート > 線の種類の選択肢
line.empty,Lineがありません,No Lines yet,データシート > Line が無いとき
sdsg.needBox,先に Box を 1 つ以上作成してください,Create at least one Box first,データシート > SD/SG を足せないときの注意
sdsg.addSD,+ SD 追加,+ Add SD,データシート > ボタン
sdsg.addSG,+ SG 追加,+ Add SG,データシート > ボタン
sdsg.attachLine,Line {{id}} に紐づけ,Attach to Line {{id}},データシート > 追加した SD/SG の付け先の説明
sdsg.attachLastBox,最後の Box {{id}} に紐づけ,Attach to the last Box {{id}},データシート > 追加した SD/SG の付け先の説明
sdsg.noBox,Box がありません,No Boxes,データシート > 追加した SD/SG の付け先の説明
sdsg.col.mode,モード,Mode,データシート > SD/SG の表の列名
sdsg.col.target1,対象 1,Target 1,データシート > SD/SG の表の列名
sdsg.col.target2,対象 2,Target 2,データシート > SD/SG の表の列名
sdsg.current,（現: {{id}}）,(current: {{id}}),データシート > 付け先の選択肢（今の付け先が一覧に無いとき）
sdsg.none,（未指定）,(None),データシート > 2 つ目の付け先の選択肢
sdsg.empty,SD/SG はまだありません。上のボタンから追加できます。,No SD/SG yet. Add them with the buttons above.,データシート > SD/SG が無いとき
slot.disabled.tip,クリップボードに貼り付け可能な要素がありません,Nothing on the clipboard to paste,データシート > 挿入の帯の吹き出し
slot.text.tip,OS のクリップボードのテキストを 1 行 = 1 Box として末尾に挿入します（Excel の複数行コピーに対応）,Inserts the system clipboard text at the end with one line = one Box (works with rows copied from Excel),データシート > 挿入の帯の吹き出し
slot.paste.tip,ここにコピーした行を挿入（{{count}} 行）,Insert the copied rows here ({{count}} rows),データシート > 挿入の帯の吹き出し
slot.paste.tip_one,ここにコピーした行を挿入（{{count}} 行）,Insert the copied row here ({{count}} row),件数が 1 のときの英語の形（日本語は使われない）
slot.text,＋ Excel / テキストの行をここに挿入,+ Insert rows from Excel / text here,データシート > 挿入の帯
slot.paste,＋ コピーした行をここに挿入,+ Insert copied rows here,データシート > 挿入の帯
slot.pasteN,＋ コピーした行をここに挿入 ({{count}} 行),+ Insert copied rows here ({{count}} rows),データシート > 挿入の帯（行数つき）
slot.pasteN_one,＋ コピーした行をここに挿入 ({{count}} 行),+ Insert copied row here ({{count}} row),件数が 1 のときの英語の形（日本語は使われない）
row.paste.tip,この下にクリップボードを挿入（{{count}} 行）,Insert the clipboard below ({{count}} rows),データシート > 行の挿入ボタンの吹き出し（SD/SG）
row.paste.tip_one,この下にクリップボードを挿入（{{count}} 行）,Insert the clipboard below ({{count}} row),件数が 1 のときの英語の形（日本語は使われない）
row.clipboardEmpty,クリップボード空,Clipboard is empty,データシート > 行の挿入ボタンの吹き出し（SD/SG）
`,mf=`\uFEFFkey,ja,en,note
label.font,フォント,Font,プロパティ > ラベルの装飾の欄の名前（フォントの種類）
label.fontSize,フォントサイズ,Font size,プロパティ > ラベルの装飾の欄の名前
label.decoration,装飾,Style,プロパティ > ラベルの装飾の欄の名前（太字・斜体・下線のボタンの行）
label.align,左右方向の揃え,Horizontal alignment,プロパティ > ラベルの装飾の欄の名前
label.valign,上下方向の揃え,Vertical alignment,プロパティ > ラベルの装飾の欄の名前
mixed,（混在）,(Mixed),複数選んだ要素で値が違うときの選択肢・入力欄の薄い文字
bold,太字,Bold,太字ボタン「B」の説明（マウスを乗せると出る）
italic,斜体,Italic,斜体ボタン「I」の説明
underline,下線,Underline,下線ボタン「U」の説明
align.left,左揃え,Left,左右方向の揃えの選択肢
align.center,中央,Center,左右方向の揃えの選択肢
align.right,右揃え,Right,左右方向の揃えの選択肢
valign.top,上揃え,Top,上下方向の揃えの選択肢
valign.middle,中央,Middle,上下方向の揃えの選択肢
valign.bottom,下揃え,Bottom,上下方向の揃えの選択肢
`,yf=`\uFEFFkey,ja,en,note
"font.system","システム標準","System default","書式 > フォントの選択肢（ブラウザの標準のフォント）"
"font.hiraginoYuGothic","ヒラギノ角ゴ / 游ゴシック","Hiragino Sans / Yu Gothic","書式 > フォントの選択肢（ゴシック体）"
"font.yuMinchoHiraginoMincho","游明朝 / ヒラギノ明朝","Yu Mincho / Hiragino Mincho","書式 > フォントの選択肢（明朝体）"
"font.meiryo","メイリオ","Meiryo","書式 > フォントの選択肢"
"sample.sheetName","参加者A","Participant A","作例の図 > シートの名前（図の言語）"
"sample.author","中田友貴","Yuki Inoue Nakata","作例の図 > ファイルの作者（図の言語）"
"sample.start","出発点","Starting point","作例の図 > 最初の Box の文字（図の言語）"
"sample.opp","必須通過点","Obligatory passage point","作例の図 > OPP の Box の文字（図の言語）"
"sample.bfp","分岐点","Bifurcation point","作例の図 > BFP の Box の文字（図の言語）"
"sample.efp","等至点","Equifinality point","作例の図 > EFP の Box の文字（図の言語）"
"sample.pefp","両極化した等至点","Polarized equifinality point","作例の図 > P-EFP の Box の文字（図の言語）"
"sample.period","時期{{n}}","Period {{n}}","作例の図 > 時期ラベル（n は番号・図の言語）"
`,xf=`\uFEFFkey,ja,en,note
"title","エラーが発生しました","An error occurred","画面の一部が壊れたときの代わりの表示の見出し"
`,vf=`\uFEFFkey,ja,en,note
"notes.label","メモ（付箋・吹き出し）","Notes (sticky notes and callouts)","出力の画面 > 含めるかを確かめる要素の名前"
"notes.hint","解釈や作業用のメモが図に残っていないか確かめてください","Make sure no interpretive or working notes are left in the diagram","出力の画面 > 含めるかを確かめる要素の説明"
"symbols.label","記号（★・〇 など文字だけのメモ）","Symbols (text-only notes such as ★ or ○)","出力の画面 > 含めるかを確かめる要素の名前"
"symbols.hint","含めるなら、記号の意味を図の説明や本文で示してください","If included, explain the symbols in the figure caption or the text","出力の画面 > 含めるかを確かめる要素の説明"
"comments.label","コメント","Comments","出力の画面 > 含めるかを確かめる要素の名前"
"comments.hint","コメントは図には描けません（論文用レポートには載せられます）","Comments cannot be drawn in the diagram (they can go in the paper report)","出力の画面 > 含めるかを確かめる要素の説明"
"legend.label","凡例","Legend","出力の画面 > 含めるかを確かめる要素の名前"
"legend.hint","含めないなら、記号の意味を図の説明や本文で示してください","If excluded, explain the symbols in the figure caption or the text","出力の画面 > 含めるかを確かめる要素の説明"
"periodLabels.label","時期ラベル（時期区分）","Period labels","出力の画面 > 含めるかを確かめる要素の名前"
"caution.noPeriodLabels","時期ラベル（時期区分）がありません。時期区分を示さないまま出力します。","There are no period labels. The diagram will be exported without periods.","出力の画面 > 図に無いことへの注意"
"caution.noLegend","凡例を含めずに出力します。記号の意味を図の説明や本文で示してください。","Exporting without a legend. Explain the symbols in the figure caption or the text.","出力の画面 > 凡例を含めないと選んだときの注意"
`,Sf=`\uFEFFkey,ja,en,note
"progress.capturing","キャプチャ中...","Capturing...","出力中の表示（PNG・SVG 画像）"
"progress.capturingPreview","プレビューをキャプチャ中...","Capturing preview...","出力中の表示（PNG・SVG 画像）"
"progress.cropping","ページ {{n}} / {{total}} をクロップ中","Cropping page {{n}} of {{total}}","出力中の表示（PNG・SVG 画像・n は何ページ目か）"
"progress.done","完了","Done","出力中の表示（PNG・SVG 画像）"
`,wf=`\uFEFFkey,ja,en,note
"progress.page","PDF ページ {{n}} / {{total}}","PDF page {{n}} of {{total}}","出力中の表示（PDF・n は何ページ目か）"
`,bf=`\uFEFFkey,ja,en,note
"error.missingOptions","exportToPPTX: options.sheet と options.settings が必須です","exportToPPTX: options.sheet and options.settings are required","PowerPoint 出力 > 呼び出しの誤り（開発者向け）"
"progress.slide","スライド {{n}} / {{total}} を生成中","Generating slide {{n}} of {{total}}","出力中の表示（PowerPoint・n は何枚目か）"
"marker.forward","→続","→ cont.","PowerPoint 出力の図 > ページをまたぐ矢印の、次のページへ続く側の印（図の言語）"
"marker.backward","続→","cont. →","PowerPoint 出力の図 > ページをまたぐ矢印の、前のページから続く側の印（図の言語）"
`,kf=`\uFEFFkey,ja,en,note
"default.name","既定（A4 横）","Default (A4 landscape)","出力の画面 > プリセット > 組み込みの名前"
"default.description","初期値。微調整なし、A4 横、両方フィット","Initial settings. No adjustments, A4 landscape, fit both ways","出力の画面 > プリセット > 組み込みの説明"
"conf169.name","学会発表（16:9 スライド）","Presentation (16:9 slide)","出力の画面 > プリセット > 組み込みの名前"
"conf169.description","16:9 スライド向け。文字 +2pt、線 +0.5、両方フィット","For 16:9 slides. Text +2 pt, lines +0.5, fit both ways","出力の画面 > プリセット > 組み込みの説明"
"conf43.name","学会発表（4:3 スライド）","Presentation (4:3 slide)","出力の画面 > プリセット > 組み込みの名前"
"conf43.description","4:3 スライド向け。文字 +2pt、線 +0.5","For 4:3 slides. Text +2 pt, lines +0.5","出力の画面 > プリセット > 組み込みの説明"
"paperA4Landscape.name","論文向け（A4 横）","Paper (A4 landscape)","出力の画面 > プリセット > 組み込みの名前"
"paperA4Landscape.description","論文掲載向け。A4 横、文字サイズ等倍、白背景","For journal figures. A4 landscape, original text size, white background","出力の画面 > プリセット > 組み込みの説明"
"paperA4Portrait.name","論文向け（A4 縦）","Paper (A4 portrait)","出力の画面 > プリセット > 組み込みの名前"
"paperA4Portrait.description","論文掲載向け。A4 縦、文字サイズ等倍、白背景","For journal figures. A4 portrait, original text size, white background","出力の画面 > プリセット > 組み込みの説明"
"slideLarge.name","スライド向け（大文字）","Slides (large text)","出力の画面 > プリセット > 組み込みの名前"
"slideLarge.description","会場後方からも読めるよう文字 +4pt、線太め","Text +4 pt and thicker lines, readable from the back of the room","出力の画面 > プリセット > 組み込みの説明"
"printCheck.name","印刷品質確認用（ID 表示）","Print check (show IDs)","出力の画面 > プリセット > 組み込みの名前"
"printCheck.description","ID バッジ ON、用紙枠 ON、グリッド ON で検証用に","ID badges, paper frame, and grid on, for checking","出力の画面 > プリセット > 組み込みの説明"
"error.emptyName","プリセット名を入力してください","Enter a preset name","出力の画面 > プリセットを名前なしで保存しようとしたときの警告"
`,Pf=`\uFEFFkey,ja,en,note
"title","出力プレビュー","Export preview","出力の画面 > 見出し"
"drag","ドラッグで移動","Drag to move","出力の画面 > 見出しの帯にマウスを載せたときの説明（画面そのものを動かす）"
"close","閉じる","Close","出力の画面 > 閉じるボタン"
"cancel","キャンセル","Cancel","出力の画面 > 出力中の表示 > 取り消すボタン"
"list.separator","、",", ","出力の画面 > 項目を並べるときの区切り（英語はカンマと空白）"
"method","出力方式","Output method","出力の画面 > いちばん上の欄の名前"
"method.png","PNG ファイル（画像）","PNG file (image)","出力の画面 > 出力方式の選択肢"
"method.svg","SVG ファイル（ベクター画像）","SVG file (vector image)","出力の画面 > 出力方式の選択肢"
"method.pdf","PDF ファイル","PDF file","出力の画面 > 出力方式の選択肢"
"method.pptx","PPTX ファイル（PowerPoint）","PPTX file (PowerPoint)","出力の画面 > 出力方式の選択肢"
"method.print","🖨️ プリンターで印刷","🖨️ Print","出力の画面 > 出力方式の選択肢・印刷のときの実行ボタン"
"progress.preparing","準備中...","Preparing...","出力の画面 > 出力中の表示 > 始めの段階"
"progress.exporting","出力中...","Exporting...","出力の画面 > 出力中の表示の見出し・実行ボタン（出力中）"
"notice.exportCanceled","出力をキャンセルしました","Export canceled.","出力の画面 > 下の行のお知らせ"
"notice.printCanceled","印刷準備をキャンセルしました","Print preparation canceled.","出力の画面 > 下の行のお知らせ"
"alert.exportFailed","出力に失敗しました: {{message}}","Export failed: {{message}}","出力の画面 > 出力に失敗したときの注意（message はエラーの内容）"
"alert.printFailed","印刷の準備に失敗しました: {{message}}","Could not prepare printing: {{message}}","出力の画面 > 印刷の準備に失敗したときの注意（message はエラーの内容）"
"error.noSheet","アクティブシートが見つかりません","Active sheet not found","出力の画面 > 出力に失敗したときのエラーの内容"
"preset.title","プリセット","Presets","出力の画面 > プリセットの欄の見出し"
"preset.prompt","プリセット名を入力してください","Enter a preset name","出力の画面 > プリセットを保存するときの入力"
"preset.confirmOverwrite","「{{name}}」を現在の設定で上書きしますか？","Overwrite ""{{name}}"" with the current settings?","出力の画面 > プリセットの上書きの確認（name はプリセット名）"
"preset.confirmDelete","「{{name}}」を削除しますか？","Delete ""{{name}}""?","出力の画面 > プリセットの削除の確認（name はプリセット名）"
"preset.select.tooltip","用途別の出力設定を一発で適用","Apply output settings for a purpose in one step","出力の画面 > プリセットの選択欄の説明"
"preset.select.placeholder","（選択してください）","(Select)","出力の画面 > プリセットの選択欄（未選択）"
"preset.builtin","組み込み","Built-in","出力の画面 > プリセットの選択欄の分類"
"preset.user","ユーザー","User","出力の画面 > プリセットの選択欄の分類（利用者が保存したもの）"
"preset.save","現状を保存...","Save current...","出力の画面 > プリセットのボタン"
"preset.save.tooltip","現在の設定を新しいプリセットとして保存","Save the current settings as a new preset","出力の画面 > プリセットのボタンの説明"
"preset.overwrite","上書き","Overwrite","出力の画面 > プリセットのボタン"
"preset.overwrite.tooltip","選択中のプリセットを現在の設定で上書き","Overwrite the selected preset with the current settings","出力の画面 > プリセットのボタンの説明"
"preset.delete","削除","Delete","出力の画面 > プリセットのボタン"
"preset.delete.tooltip","選択中のプリセットを削除","Delete the selected preset","出力の画面 > プリセットのボタンの説明"
"preset.selectUser","ユーザープリセットを選択してください","Select a user preset","出力の画面 > プリセットのボタンが押せないときの説明"
"mode.single","単一印刷","Single page","出力の画面 > タブ（1 枚に出す）"
"mode.multi","複数印刷（分割）","Multiple pages (split)","出力の画面 > タブ（複数のページに分けて出す）"
"paper.title","用紙とフィット","Paper and fit","出力の画面 > 用紙とフィットの欄の見出し"
"paper.size","用紙サイズ","Paper size","出力の画面 > 用紙とフィットの欄 > 欄の名前"
"paper.margin","用紙内余白比率","Margin ratio","出力の画面 > 用紙とフィットの欄 > 用紙の余白の割合"
"fit","フィット","Fit","出力の画面 > 用紙とフィットの欄 > 図の収め方の欄"
"fit.manual","手動（倍率指定）","Manual (set scale)","出力の画面 > 用紙とフィットの欄 > 収め方の選択肢"
"fit.both","両方に収める","Fit both","出力の画面 > 用紙とフィットの欄 > 収め方の選択肢"
"fit.width","横だけ収める","Fit width","出力の画面 > 用紙とフィットの欄 > 収め方の選択肢"
"fit.height","縦だけ収める","Fit height","出力の画面 > 用紙とフィットの欄 > 収め方の選択肢"
"fit.short","短辺だけ収める（複数印刷向け）","Fit short side (for multiple pages)","出力の画面 > 用紙とフィットの欄 > 収め方の選択肢"
"fit.short.hint.h","横型: 縦方向（短辺）を用紙高さに合わせる。横方向はページ数で分割","Horizontal: fits the vertical direction (short side) to the paper height; the horizontal direction is split into pages.","出力の画面 > 用紙とフィットの欄 > 短辺の説明（横型の図）"
"fit.short.hint.v","縦型: 横方向（短辺）を用紙幅に合わせる。縦方向はページ数で分割","Vertical: fits the horizontal direction (short side) to the paper width; the vertical direction is split into pages.","出力の画面 > 用紙とフィットの欄 > 短辺の説明（縦型の図）"
"fit.globalScale","全体倍率","Overall scale","出力の画面 > 用紙とフィットの欄 > 手動のときの倍率"
"split.title","ページ分割（長辺方向）","Page split (long side)","出力の画面 > 複数印刷のときの欄の見出し"
"split.hint.h","横型レイアウト: x 軸方向（横）に N 分割して出力","Horizontal layout: splits into N pages along the x axis (horizontally).","出力の画面 > ページ分割の欄 > 説明（横型の図）"
"split.hint.v","縦型レイアウト: y 軸方向（縦）に N 分割して出力","Vertical layout: splits into N pages along the y axis (vertically).","出力の画面 > ページ分割の欄 > 説明（縦型の図）"
"split.count","分割数","Number of pages","出力の画面 > ページ分割の欄 > ページ数"
"split.needed.h","用紙の高さに合わせると，この図は約 {{pages}} ページ分です","Fitted to the paper height, this diagram is about {{pages}} pages long","出力の画面 > ページ分割の欄 > ページ数の目安（横型の図。ユーザーの決定で入った文言）"
"split.needed.v","用紙の幅に合わせると，この図は約 {{pages}} ページ分です","Fitted to the paper width, this diagram is about {{pages}} pages long","出力の画面 > ページ分割の欄 > ページ数の目安（縦型の図。ユーザーの決定で入った文言）"
"split.needed.fitsOne","（1 ページに収まります。単一印刷でも足ります）"," (it fits on 1 page; single page is enough)","出力の画面 > ページ分割の欄 > 目安の補足（英語は先頭に空白）"
"split.needed.enough","（{{n}} ページで足ります）"," ({{n}} pages are enough)","出力の画面 > ページ分割の欄 > 目安の補足（英語は先頭に空白）"
"split.needed.shrink","（このページ数では図を縮めて収めます）"," (with this many pages, the diagram is shrunk to fit)","出力の画面 > ページ分割の欄 > 目安の補足（英語は先頭に空白）"
"split.method","分割方式","Split method","出力の画面 > ページ分割の欄 > 区切り方の欄"
"split.method.gap","Box の間の空いた所で区切る（凡例は各ページ）","Split at gaps between Boxes (legend on each page)","出力の画面 > ページ分割の欄 > 区切り方の選択肢（ユーザーの決定で入った文言）"
"split.method.duplicate","SPEC方式（Box複製+続マーカー、PPTX 限定）","SPEC method (duplicated Boxes + continuation markers; PPTX only)","出力の画面 > ページ分割の欄 > 区切り方の選択肢"
"split.overlap","オーバーラップ量 (px)","Overlap (px)","出力の画面 > ページ分割の欄 > ページの重なりの幅"
"split.markers","続マーカーを表示","Show continuation markers","出力の画面 > ページ分割の欄 > チェックボックス"
"split.duplicate.note","※ PPTX 以外ではオーバーラップ方式で出力されます（Box 複製・続マーカーは PPTX 限定機能）","* Formats other than PPTX use the overlap method (duplicated Boxes and continuation markers are PPTX only).","出力の画面 > ページ分割の欄 > 注意"
"split.previewPage","プレビュー: {{page}} / {{total}}","Preview: {{page}} / {{total}}","出力の画面 > ページ分割の欄 > いま見ているページ"
"tune.title","微調整","Fine-tuning","出力の画面 > 微調整の欄の見出し"
"tune.offsetX","位置 X (px)","Offset X (px)","出力の画面 > 微調整の欄 > 欄の名前"
"tune.offsetX.tooltip","用紙中心を基準に全要素を X 方向に平行移動","Shifts all elements in X, relative to the paper center","出力の画面 > 微調整の欄 > 欄の説明"
"tune.offsetY","位置 Y (px)","Offset Y (px)","出力の画面 > 微調整の欄 > 欄の名前"
"tune.offsetY.tooltip","用紙中心を基準に全要素を Y 方向に平行移動","Shifts all elements in Y, relative to the paper center","出力の画面 > 微調整の欄 > 欄の説明"
"tune.fontDelta","文字サイズ ±","Font size ±","出力の画面 > 微調整の欄 > 欄の名前"
"tune.fontScale","文字サイズ ×","Font size ×","出力の画面 > 微調整の欄 > 欄の名前"
"tune.borderDelta","枠線太さ ±","Box border width ±","出力の画面 > 微調整の欄 > 欄の名前"
"tune.lineDelta","線太さ ±","Line width ±","出力の画面 > 微調整の欄 > 欄の名前"
"tune.gapH","Box間距離 横 ×","Box spacing H ×","出力の画面 > 微調整の欄 > 欄の名前（横方向）"
"tune.gapH.tooltip","Box のサイズは維持、横方向の中心間距離のみ拡縮（矢印の長さが変わる）","Keeps Box sizes and scales only the horizontal center-to-center distance (arrow lengths change)","出力の画面 > 微調整の欄 > 欄の説明"
"tune.gapV","Box間距離 縦 ×","Box spacing V ×","出力の画面 > 微調整の欄 > 欄の名前（縦方向）"
"tune.gapV.tooltip","Box のサイズは維持、縦方向の中心間距離のみ拡縮","Keeps Box sizes and scales only the vertical center-to-center distance","出力の画面 > 微調整の欄 > 欄の説明"
"tune.autoCenter","用紙中央に自動配置","Center on paper automatically","出力の画面 > 微調整の欄 > チェックボックス"
"tune.typeLabelDelta","タイプラベル ±","Type label ±","出力の画面 > 微調整の欄 > 欄の名前（Box の種類の表示の文字）"
"tune.subLabelDelta","サブラベル ±","Sub-label ±","出力の画面 > 微調整の欄 > 欄の名前"
"tune.timeArrowDelta","時間矢印文字 ±","Time arrow text ±","出力の画面 > 微調整の欄 > 欄の名前"
"tune.legendDelta","凡例文字 ±","Legend text ±","出力の画面 > 微調整の欄 > 欄の名前"
"tune.periodDelta","時期区分文字 ±","Period text ±","出力の画面 > 微調整の欄 > 欄の名前"
"tune.periodStrokeDelta","時期区分 線太さ ±","Period line width ±","出力の画面 > 微調整の欄 > 欄の名前"
"tune.reset","リセット","Reset","出力の画面 > 微調整の欄 > ボタン"
"output.title","出力設定","Output settings","出力の画面 > 出力設定の欄の見出し"
"output.background","背景","Background","出力の画面 > 出力設定の欄 > 欄の名前"
"output.background.white","白","White","出力の画面 > 出力設定の欄 > 背景の選択肢"
"output.background.transparent","透明","Transparent","出力の画面 > 出力設定の欄 > 背景の選択肢"
"output.grid","グリッドを含める","Include grid","出力の画面 > 出力設定の欄 > チェックボックス"
"output.paperGuides","用紙枠を含める","Include paper frame","出力の画面 > 出力設定の欄 > チェックボックス"
"output.ids","ID バッジを含める","Include ID badges","出力の画面 > 出力設定の欄 > チェックボックス"
"output.pdfMargin","PDF マージン (inch)","PDF margin (inch)","出力の画面 > 出力設定の欄 > 欄の名前"
"output.pptxNote","背景・グリッド・用紙枠は PPTX では無視されます","Background, grid and paper frame are ignored for PPTX.","出力の画面 > 出力設定の欄 > 注意"
"readability.min","紙面での最小の文字: {{pt}} pt（{{what}}）","Smallest text on paper: {{pt}} pt ({{what}})","出力の画面 > プレビューの上の帯（用紙に収めたときにいちばん小さい文字の大きさ）"
"readability.title","用紙の大きさに縮めたときの文字の大きさの見積もりです。Box の文字の自動縮小は数えていないので目安です。","An estimate of text size when the figure is scaled to the paper. Automatic shrinking of Box text is not counted.","上の説明（マウスを重ねたとき）"
"readability.warn","{{min}} pt 未満の文字が {{count}} か所あります。印刷すると読みにくくなります（文字を大きくするか、用紙を大きくしてください）","{{count}} text item(s) smaller than {{min}} pt. They may be hard to read in print (enlarge the text or use a larger paper size).","上の帯の警告（カタログTEA 第 2 章の留意点: 7 pt 以下は読みにくい）"
"readability.ok","{{min}} pt 以上で読めます","At least {{min}} pt; readable","上の帯（読みにくい文字が無いとき）"
"readability.grayscale","グレースケールで見る","View in grayscale","上の帯のチェック（プレビューだけを白黒にする）"
"readability.grayscale.title","モノクロで印刷したときに見分けられるかを確かめます。出力には効きません","Check whether elements can be told apart when printed in black and white. Does not affect the output","上のチェックの説明（マウスを重ねたとき）"
"readability.kind.box","Box の文字","Box text","紙面での最小の文字が何の文字か"
"readability.kind.typeLabel","種別ラベル","type label","同上"
"readability.kind.subLabel","サブラベル","sub-label","同上"
"readability.kind.sdsg","SD/SG の文字","SD/SG text","同上"
"readability.kind.note","メモ","note","同上"
"readability.kind.timeArrow","時間の矢印の文字","time arrow label","同上"
"readability.kind.periodLabel","時期ラベル","period label","同上"
"readability.kind.legend","凡例","legend","同上"
"preview.header","プレビュー（ドラッグ＝位置シフト / ホイール＝全体倍率 に反映）","Preview (drag = shift position / wheel = overall scale)","出力の画面 > 右のプレビューの上の帯"
"run.chooseFirst","出力に含めるかを選んでください: {{items}}","Choose whether to include: {{items}}","出力の画面 > 実行ボタンが押せないときの説明（items は未選択の要素）"
"run.print.tooltip","プリンターで印刷（新規ウィンドウを開いてブラウザの印刷ダイアログを表示）","Print (opens a new window and shows the browser's print dialog)","出力の画面 > 実行ボタンの説明（印刷）"
"run.save.tooltip","{{format}} ファイルとして保存","Save as a {{format}} file","出力の画面 > 実行ボタンの説明（format は PNG など）"
"run.save","💾 {{format}} で保存","💾 Save as {{format}}","出力の画面 > 実行ボタン（format は PNG など）"
"content.title","出力に含める要素の確認","Elements to include in the output","出力の画面 > 下の含める要素の確認の見出し（ユーザーの決定で入った確認）"
"content.remaining","（あと {{n}} 件選んでください）"," (choose {{n}} more)","出力の画面 > 含める要素の確認 > 見出しの補足（英語は先頭に空白）"
"content.done","（選択済み）"," (all chosen)","出力の画面 > 含める要素の確認 > 見出しの補足（英語は先頭に空白）"
"content.count","（{{n}} 件）"," ({{n}})","出力の画面 > 含める要素の確認 > 要素の数（英語は先頭に空白）"
"content.include","含める","Include","出力の画面 > 含める要素の確認 > 選択肢"
"content.exclude","含めない","Exclude","出力の画面 > 含める要素の確認 > 選択肢"
"content.excludeCannotDraw","含めない（図には描けません）","Exclude (cannot be drawn in the diagram)","出力の画面 > 含める要素の確認 > 選択肢（図に描けない要素のとき）"
"content.caution","注意: {{text}}","Note: {{text}}","出力の画面 > 含める要素の確認 > 注意の行（text は注意の内容）"
`,Bf=`\uFEFFkey,ja,en,note
"bullet","・","• ","Word の論文用レポート > 箇条の行頭の記号（英語は記号と空白）"
"label.wrap","【{{label}}】","“{{label}}”","Word の論文用レポート > 事象・経験のラベルを括る括弧（label はラベル）。日本語は TEM 論文 68 本でいちばん多かった【】、英語は英語の TEM 論文 10 本で本文のラベルに使われていた二重引用符（2026-11-10 ユーザー決定．以前は〈〉と⟨⟩）"
"noLabel","（ラベル未設定）","(no label)","Word の論文用レポート > 結果 > ラベルが空の要素"
"title.default","TEM 図報告","TEM diagram report","Word の論文用レポート > 題（図の題が空のとき）"
"notEntered","（未入力）","(not entered)","Word の論文用レポート > 未入力の節（確認画面で「（未入力）と書いて含める」を選んだとき。画面の paperReportDialog の confirm.missing.mark と合わせる）"
"section.notation","記号体系の宣言","Notation declaration","Word の論文用レポート > 節の見出し（用語は terms.csv の notationDeclaration）"
"section.participants","協力者情報","Participants","Word の論文用レポート > 節の見出し"
"section.interview","インタビュー方法","Interview method","Word の論文用レポート > 節の見出し"
"section.visual","表記方針","Notation policy","Word の論文用レポート > 節の見出し（用語は terms.csv の notationPolicy）"
"section.diagram","TEM 図","TEM diagram","Word の論文用レポート > 節の見出し（図を埋め込む節）"
"section.results","結果","Results","Word の論文用レポート > 節の見出し"
"section.glossary","用語凡例（図中略語の説明）","Glossary (abbreviations used in the diagram)","Word の論文用レポート > 節の見出し"
"notation.arakawa","本図の記号は TEMerPlus の既定の表記による。実線と点線の使い分けは荒川・安田・サトウ（2012）を参照し，要素の種別を表す線種は本ツールが定めたものである。","The symbols in this diagram follow the default notation of TEMerPlus. The use of solid and dotted lines draws on Arakawa, Yasuda and Sato (2012); the line styles that mark element types were defined by this tool.","Word の論文用レポート > 記号体系の宣言（基準が既定のとき。荒川ら 2012 が定めるのは実線と点線の使い分けだけで，種別ごとの線種は TEMerPlus の独自。2026-11-12 ユーザー決定）"
"notation.custom","本図は独自の記号体系を用いる（下記参照）。","This diagram uses its own notation (see below).","Word の論文用レポート > 記号体系の宣言（基準が独自のとき）"
"notation.other","その他の記号体系を用いる（下記参照）。","This diagram uses another notation (see below).","Word の論文用レポート > 記号体系の宣言（基準がその他のとき）"
"notation.lines","各要素の枠の線種は次のとおりである。","The border line styles of the elements are as follows.","Word の論文用レポート > 記号体系の宣言 > 線種の一覧の前の文"
"notation.symbols","図中の記号の意味は次のとおりである。","The symbols in the diagram mean the following.","Word の論文用レポート > 記号体系の宣言 > 図に置いた記号（★など）の一覧の前の文"
"notation.symbolNoMeaning","（意味未記入）","(no meaning entered)","Word の論文用レポート > 記号体系の宣言 > 意味が空の記号"
"participants.count","協力者数: {{count}} 名","Number of participants: {{count}}","Word の論文用レポート > 協力者情報"
"participants.description","記述: {{text}}","Description: {{text}}","Word の論文用レポート > 協力者情報（属性など）"
"participants.hsi","HSI 水準: {{text}}","HSI level: {{text}}","Word の論文用レポート > 協力者情報（HSI = 歴史的構造化ご招待。terms.csv の hsi）"
"participants.pseudonyms","仮名: {{names}}","Pseudonyms: {{names}}","Word の論文用レポート > 協力者情報"
"interview.method","方法: {{text}}","Method: {{text}}","Word の論文用レポート > インタビュー方法"
"interview.duration","所要時間/期間: {{text}}","Duration / period: {{text}}","Word の論文用レポート > インタビュー方法"
"interview.times","回数: {{count}} 回","Number of sessions: {{count}}","Word の論文用レポート > インタビュー方法"
"interview.analysis","分析の組合せ: {{text}}","Combined analysis methods: {{text}}","Word の論文用レポート > インタビュー方法（TEM と組み合わせた分析法）"
"interview.notes","備考: {{text}}","Notes: {{text}}","Word の論文用レポート > インタビュー方法"
"convention.notEntered","{{label}}: （未入力）","{{label}}: (not entered)","Word の論文用レポート > 表記方針の 1 行（未入力。label は項目名）"
"convention.noDescription","（説明未記入）","(no description entered)","Word の論文用レポート > 表記方針（意味ありなのに説明が空）"
"convention.yes","{{label}}: 意味あり。{{description}}","{{label}}: meaningful. {{description}}","Word の論文用レポート > 表記方針の 1 行（意味あり。画面の選択肢は visualConventions.csv の meaning.yes）"
"convention.loose","{{label}}: 緩やかに意味あり。{{description}}","{{label}}: loosely meaningful. {{description}}","Word の論文用レポート > 表記方針の 1 行（緩やかに意味あり）"
"convention.no","{{label}}: 意味なし（見栄えのみ）","{{label}}: not meaningful (appearance only)","Word の論文用レポート > 表記方針の 1 行（意味なし）"
"heading.reportNotes","補足","Additional notes","Word の論文用レポート > 表記方針の節の小見出し（概要タブの備考）"
"diagram.failed","（図の埋め込みに失敗しました）","(Could not embed the figure)","Word の論文用レポート > TEM 図の節（画像にできなかったとき）"
"results.intro","本研究では，TEM（複線径路等至性モデリング）を用いて分析を行い，その結果を上記の TEM 図に示した。","This study used Trajectory Equifinality Modeling (TEM) for the analysis, and the results are shown in the TEM diagram above.","Word の論文用レポート > 結果 > 書き出しの文（清書の前提の下書き）"
"results.listing","以下では，図中に描かれた要素（時期区分・各種事象・径路・社会的影響）を漏れなく列挙する。事象や経験のラベルは{{bracket}}で括って示す。","All elements drawn in the diagram (time divisions, events, trajectories and social influences) are listed below. Labels of events and experiences are enclosed in {{bracket}}.","Word の論文用レポート > 結果 > 書き出しの文（bracket は選んだ括弧で括った「…」）"
"results.listing.sdsg","社会的方向づけ（SD）と社会的助勢（SG）のラベルは{{bracket}}で括って示す。","Labels of social direction (SD) and social guidance (SG) are enclosed in {{bracket}}.","Word の論文用レポート > 結果 > SD・SG を Box と別の括弧で括るときの文"
"results.refs.apa","各要素の末尾には，紐付くインタビュー原文の引用を APA 風の括弧表記「（協力者, 第N回, §段落）「…」」 で示す。","Each element ends with quotes from the linked interview transcript in APA-like form: (participant, session N, §paragraph) ""..."".","Word の論文用レポート > 結果 > 引用の書き方の説明（APA 風。ref.apa と合わせる）"
"results.refs.bracket","各要素の末尾には，紐付くインタビュー原文の引用を [原文 T<番号> §<段落>]「…」 の形式で示す。","Each element ends with quotes from the linked interview transcript in the form [Source T<number> §<paragraph>] ""..."".","Word の論文用レポート > 結果 > 引用の書き方の説明（角括弧。ref.bracket と合わせる）"
"ref.unresolved"," [追従不能]"," [could not be traced]","Word の論文用レポート > 結果 > 引用の後ろ（逐語録の段落が見つからない。先頭に空白）"
"ref.unknownParticipant","不明","unknown","Word の論文用レポート > 結果 > APA 風の引用で協力者が分からないとき"
"ref.session","第{{n}}回","session {{n}}","Word の論文用レポート > 結果 > APA 風の引用の回（n は回の番号）"
"ref.apa","（{{cite}}）「{{quote}}」{{unresolved}}","({{cite}}) ""{{quote}}""{{unresolved}}","Word の論文用レポート > 結果 > APA 風の引用（cite は 協力者, 回, §段落。画面の paperReportDialog の export.style.apa の例と合わせる）"
"ref.bracket","[原文 {{transcript}} {{paragraph}}]「{{quote}}」{{unresolved}}","[Source {{transcript}} {{paragraph}}] ""{{quote}}""{{unresolved}}","Word の論文用レポート > 結果 > 角括弧の引用（transcript は逐語録の名前か T1・paragraph は §4 など。画面の export.style.bracket の例と合わせる）"
"desc.text"," — 説明: {{text}}"," — Description: {{text}}","Word の論文用レポート > 結果 > 要素の行の後ろの説明（先頭に空白）"
"desc.notNeeded"," — （説明不要）"," — (no description needed)","Word の論文用レポート > 結果 > 要素の行の後ろ（説明不要にした要素）"
"desc.missing"," — （説明未記入）"," — (no description entered)","Word の論文用レポート > 結果 > 要素の行の後ろ（説明が空）"
"heading.periods","時期区分","Time divisions","Word の論文用レポート > 結果 > 小見出し（用語は terms.csv の period）"
"period.item","期{{n}}: {{label}}  ({{axis}} {{position}})","Time division {{n}}: {{label}}  ({{axis}} {{position}})","Word の論文用レポート > 結果 > 時期区分の 1 行（label は括弧つきの名前・axis は Time level・position は位置）"
"boxType.OPP","必須通過点 (OPP)","Obligatory passage point (OPP)","Word の論文用レポート > 結果 > Box の種別の小見出し（用語は terms.csv）"
"boxType.BFP","分岐点 (BFP)","Bifurcation point (BFP)","同上"
"boxType.EFP","等至点 (EFP)","Equifinality point (EFP)","同上"
"boxType.P-EFP","両極化した等至点 (P-EFP)","Polarized equifinality point (P-EFP)","同上"
"boxType.2nd-EFP","セカンド等至点 (2nd EFP)","Second equifinality point (2nd EFP)","同上"
"boxType.P-2nd-EFP","両極化したセカンド等至点 (P-2nd EFP)","Polarized second equifinality point (P-2nd EFP)","同上"
"boxType.normal","行為の Box","Action Boxes","同上"
"boxType.annotation","潜在的な行為の Box","Potential action Boxes","同上"
"boxType.other","その他（利用者定義の種別）","Other (user-defined types)","同上"
"box.customType","（種別: {{type}}）"," (type: {{type}})","Word の論文用レポート > 結果 > 種別「その他」の Box に添える利用者の種別名"
"box.asSecondary","（主種別: {{type}} との併記）"," (secondary type; primary type: {{type}})","Word の論文用レポート > 結果 > 併記の種別の見出しの下に載せた Box に添える"
"heading.lines","径路 (Line)","Paths (Line)","Word の論文用レポート > 結果 > 小見出し"
"lineType.RLine","実線径路（実現された径路）","Solid line (realized trajectory)","Word の論文用レポート > 結果 > 径路の種類（用語は terms.csv の path.realized）"
"lineType.XLine","点線径路（未実現／潜在的径路）","Dotted line (unrealized or potential trajectory)","Word の論文用レポート > 結果 > 径路の種類（用語は terms.csv の path.unrealized）"
"sdsg.SD","社会的方向づけ (SD)","Social direction (SD)","Word の論文用レポート > 結果 > 小見出し（用語は terms.csv の SD）"
"sdsg.SG","社会的助勢 (SG)","Social guidance (SG)","Word の論文用レポート > 結果 > 小見出し（用語は terms.csv の SG）"
"sdsg.between","{{a}} と {{b}} の間","between {{a}} and {{b}}","Word の論文用レポート > 結果 > SD/SG の対象（2 つの要素の間に置いたとき）"
"sdsg.target","  対象: {{target}}","  Target: {{target}}","Word の論文用レポート > 結果 > SD/SG の行の対象（先頭に空白 2 つ）"
"sheet.heading","シート: {{name}}","Sheet: {{name}}","Word の論文用レポート > 結果 > シートの見出し（シートが複数のとき）"
"sheet.summary","本シートの図要素: Box {{boxes}} 件 / 径路 {{lines}} 件 / SD/SG {{sdsg}} 件 / 時期区分 {{periods}} 件","Elements in this sheet: Boxes {{boxes}} / trajectories {{lines}} / SD/SG {{sdsg}} / time divisions {{periods}}","Word の論文用レポート > 結果 > シートごとの件数"
"heading.notes","注記（図上のメモ）","Notes (memos in the diagram)","Word の論文用レポート > 結果 > 小見出し"
"note.target","（→ {{target}}）"," (→ {{target}})","Word の論文用レポート > 結果 > メモの引き出し線の先"
"heading.comments","コメント","Comments","Word の論文用レポート > 結果 > 小見出し"
"comment.resolved","（解決済み）"," (resolved)","Word の論文用レポート > 結果 > 解決済みのコメントに添える"
"comment.reply","返信: {{text}}","Reply: {{text}}","Word の論文用レポート > 結果 > コメントへの返信"
"glossary.intro","図中で用いた略語は以下のとおりである。","The abbreviations used in the diagram are as follows.","Word の論文用レポート > 用語凡例 > 書き出しの文"
"glossary.OPP","OPP: 必須通過点 (Obligatory Passage Point)","OPP: Obligatory passage point","Word の論文用レポート > 用語凡例の 1 行"
"glossary.BFP","BFP: 分岐点 (Bifurcation Point)","BFP: Bifurcation point","同上"
"glossary.EFP","EFP: 等至点 (Equifinality Point)","EFP: Equifinality point","同上"
"glossary.P-EFP","P-EFP: 両極化した等至点 (Polarized Equifinality Point)","P-EFP: Polarized equifinality point","同上"
"glossary.2nd-EFP","2nd EFP: セカンド等至点 (Second Equifinality Point)","2nd EFP: Second equifinality point","同上"
"glossary.P-2nd-EFP","P-2nd EFP: 両極化したセカンド等至点 (Polarized Second Equifinality Point)","P-2nd EFP: Polarized second equifinality point","同上"
"glossary.SD","SD: 社会的方向づけ (Social Direction)","SD: Social direction","同上"
"glossary.SG","SG: 社会的助勢 (Social Guidance)","SG: Social guidance","同上"
"glossary.RLine","実線径路: 実現された径路（実際に辿られた径路）","Solid-line trajectory: realized trajectory (the trajectory actually taken)","同上"
"glossary.XLine","点線径路: 未実現／潜在的径路","Dotted-line trajectory: unrealized or potential trajectory","同上"
"glossary.timeArrow","非可逆的時間: 左から右（または上から下）へ向かう時間軸","Irreversible Time: the time axis running left to right (or top to bottom)","同上"
`,Df=`\uFEFFkey,ja,en,note
"error.missingOptions","exportToSVGNative: options.sheet と options.settings が必須です","exportToSVGNative: options.sheet and options.settings are required","SVG 出力 > 呼び出しの誤り（開発者向け）"
"progress.page","SVG ページ {{n}} / {{total}}","SVG page {{n}} of {{total}}","出力中の表示（SVG・n は何ページ目か）"
`,Lf=`\uFEFFkey,ja,en,note
error.loadfailed,ファイルの読み込みに失敗しました: {{message}},Failed to load the file: {{message}},.tem を開くとき（ファイル選択の代替経路）の警告ダイアログ
error.invalidjson,無効なJSONです,Invalid JSON,.tem を開くときのエラー（上の警告の中に出る）
error.nosheets,sheets フィールドがありません,The sheets field is missing,.tem を開くときのエラー
error.nosettings,settings フィールドがありません,The settings field is missing,.tem を開くときのエラー
error.nometadata,metadata フィールドがありません,The metadata field is missing,.tem を開くときのエラー
warn.version,"Version mismatch: file={{version}}, app=0.4. 可能な範囲で読み込みます。","Version mismatch: file={{version}}, app=0.4. Loading as much as possible.",.tem を開くとき（版が違う）の開発者コンソールの警告
`,Ef=`\uFEFFkey,ja,en,note
title,表から取り込み（{{step}} / {{lastStep}}）,Import from table ({{step}} / {{lastStep}}),表から取り込みの画面の題
column,列{{n}},Column {{n}},表から取り込み > 見出しの無い列の名前
mode.box.label,Box（出来事の一覧）,Box (list of events),表から取り込み > 取り込み先の選択肢
mode.box.desc,1 行 = 1 Box。ラベル列だけあれば取り込める,One row = one Box. A label column is all you need.,表から取り込み > 取り込み先の説明
mode.line.label,Line（矢印）,Line (arrow),表から取り込み > 取り込み先の選択肢
mode.line.desc,from / to の Box ID で径路を引く,Draw paths from the from / to Box IDs,表から取り込み > 取り込み先の説明
mode.sdsg.label,SD / SG,SD / SG,表から取り込み > 取り込み先の選択肢
mode.sdsg.desc,紐付け先の Box ID と種別,The Box ID it attaches to and its type,表から取り込み > 取り込み先の説明
mode.period.label,時期ラベル,Period label,表から取り込み > 取り込み先の選択肢
mode.period.desc,位置（Time Level）とラベル,Position (time level) and label,表から取り込み > 取り込み先の説明
mode.transcript.label,逐語録,Transcript,表から取り込み > 取り込み先の選択肢
mode.transcript.desc,1 行 = 1 段落。話者・時刻の列は任意,One row = one paragraph. Speaker and time columns are optional.,表から取り込み > 取り込み先の説明
mode.maxqda.label,MAXQDA コード付きセグメント,MAXQDA coded segments,表から取り込み > 取り込み先の選択肢
mode.maxqda.desc,同じセグメントの行を集約し、コードを Box / SD・SG / 時期 / タグに振り分ける,"Merges rows of the same segment and assigns codes to Box / SD, SG / period / tag",表から取り込み > 取り込み先の説明
role.box.ignore,（無視）,(Ignore),表から取り込み > 列の役割の選択肢（Box）
role.box.label,ラベル,Label,表から取り込み > 列の役割の選択肢（Box）
role.box.type,種別,Type,表から取り込み > 列の役割の選択肢（Box）
role.box.timeLevel,Time Level,Time level,表から取り込み > 列の役割の選択肢（Box）
role.box.itemLevel,Item Level,Item level,表から取り込み > 列の役割の選択肢（Box）
role.box.id,ID,ID,表から取り込み > 列の役割の選択肢（Box）
role.box.subLabel,サブラベル,Sublabel,表から取り込み > 列の役割の選択肢（Box）
role.box.description,説明,Description,表から取り込み > 列の役割の選択肢（Box）
role.box.width,幅,Width,表から取り込み > 列の役割の選択肢（Box）
role.box.height,高さ,Height,表から取り込み > 列の役割の選択肢（Box）
role.line.ignore,（無視）,(Ignore),表から取り込み > 列の役割の選択肢（Line）
role.line.id,ID,ID,表から取り込み > 列の役割の選択肢（Line）
role.line.from,From,From,表から取り込み > 列の役割の選択肢（Line）
role.line.to,To,To,表から取り込み > 列の役割の選択肢（Line）
role.line.type,種別 (RLine/XLine),Type (RLine/XLine),表から取り込み > 列の役割の選択肢（Line）
role.line.shape,形状 (straight/elbow/curve),Shape (straight/elbow/curve),表から取り込み > 列の役割の選択肢（Line）
role.line.label,ラベル,Label,表から取り込み > 列の役割の選択肢（Line）
role.line.description,説明,Description,表から取り込み > 列の役割の選択肢（Line）
role.sdsg.ignore,（無視）,(Ignore),表から取り込み > 列の役割の選択肢（SD/SG）
role.sdsg.id,ID,ID,表から取り込み > 列の役割の選択肢（SD/SG）
role.sdsg.type,種別 (SD/SG),Type (SD/SG),表から取り込み > 列の役割の選択肢（SD/SG）
role.sdsg.label,ラベル,Label,表から取り込み > 列の役割の選択肢（SD/SG）
role.sdsg.attachedTo,紐付け対象 (attachedTo),Attached to (attachedTo),表から取り込み > 列の役割の選択肢（SD/SG）
role.sdsg.attachedTo2,2 つ目の対象 (attachedTo2),Second target (attachedTo2),表から取り込み > 列の役割の選択肢（SD/SG）
role.sdsg.anchorMode,アンカー方式 (single/between),Anchor mode (single/between),表から取り込み > 列の役割の選択肢（SD/SG）
role.sdsg.spaceMode,配置モード (attached/band-top/band-bottom),Placement mode (attached/band-top/band-bottom),表から取り込み > 列の役割の選択肢（SD/SG）
role.sdsg.subLabel,サブラベル,Sublabel,表から取り込み > 列の役割の選択肢（SD/SG）
role.sdsg.description,説明,Description,表から取り込み > 列の役割の選択肢（SD/SG）
role.period.ignore,（無視）,(Ignore),表から取り込み > 列の役割の選択肢（時期ラベル）
role.period.id,ID,ID,表から取り込み > 列の役割の選択肢（時期ラベル）
role.period.position,位置 (Time Level),Position (time level),表から取り込み > 列の役割の選択肢（時期ラベル）
role.period.label,ラベル,Label,表から取り込み > 列の役割の選択肢（時期ラベル）
role.transcript.ignore,（無視）,(Ignore),表から取り込み > 列の役割の選択肢（逐語録）
role.transcript.text,本文,Text,表から取り込み > 列の役割の選択肢（逐語録）
role.transcript.speaker,話者,Speaker,表から取り込み > 列の役割の選択肢（逐語録）
role.transcript.timestamp,時刻,Time,表から取り込み > 列の役割の選択肢（逐語録）
role.maxqda.ignore,（無視）,(Ignore),表から取り込み > 列の役割の選択肢（MAXQDA）
role.maxqda.docGroup,文書グループ,Document group,表から取り込み > 列の役割の選択肢（MAXQDA の列名に合わせる）
role.maxqda.docName,文書名（逐語録）,Document name (transcript),表から取り込み > 列の役割の選択肢（MAXQDA）
role.maxqda.code,コード,Code,表から取り込み > 列の役割の選択肢（MAXQDA）
role.maxqda.start,開始,Begin,表から取り込み > 列の役割の選択肢（MAXQDA）
role.maxqda.end,終了,End,表から取り込み > 列の役割の選択肢（MAXQDA）
role.maxqda.segment,セグメント本文,Segment,表から取り込み > 列の役割の選択肢（MAXQDA）
role.maxqda.weight,重み,Weight score,表から取り込み > 列の役割の選択肢（MAXQDA）
role.maxqda.comment,コメント,Comment,表から取り込み > 列の役割の選択肢（MAXQDA）
role.maxqda.area,領域,Area,表から取り込み > 列の役割の選択肢（MAXQDA）
role.maxqda.coverage,範囲 (%),Coverage (%),表から取り込み > 列の役割の選択肢（MAXQDA）
role.maxqda.codedBy,コード付けした人,Coded by,表から取り込み > 列の役割の選択肢（MAXQDA）
role.maxqda.created,作成日,Created,表から取り込み > 列の役割の選択肢（MAXQDA）
role.maxqda.color,色,Color,表から取り込み > 列の役割の選択肢（MAXQDA）
role.maxqda.otherCodes,他のコード（同じセグメントの）,Other codes (of the same segment),表から取り込み > 列の役割の選択肢（MAXQDA）
required.box,必須: ラベル,Required: label,表から取り込み > 手順 3 の説明の前半（必須の列）
required.line,必須: from / to,Required: from / to,表から取り込み > 手順 3 の説明の前半（必須の列）
required.sdsg,必須: 紐付け先,Required: attached to,表から取り込み > 手順 3 の説明の前半（必須の列）
required.period,必須: 位置・ラベル,"Required: position, label",表から取り込み > 手順 3 の説明の前半（必須の列）
required.transcript,必須: 本文,Required: text,表から取り込み > 手順 3 の説明の前半（必須の列）
required.maxqda,必須: 文書名・コード・セグメント本文（開始・終了があると集約が正確。「他のコード」列があれば SD/SG のコードもそこから拾う）,"Required: document name, code, segment (Begin and End make merging more accurate. If there is an ""Other codes"" column, SD/SG codes are also taken from it)",表から取り込み > 手順 3 の説明の前半（必須の列）
error.noRows,読める行がありませんでした,No readable rows were found,表から取り込み > 読み込めなかったときの注意
error.importFailed,取り込みの途中で失敗しました: {{message}},Import failed partway: {{message}},表から取り込み > 取り込めなかったときの注意
error.noBoxes,Box を作れませんでした。「ラベル」を割り当てた列はありますか？,No Boxes could be created. Is there a column assigned to Label?,表から取り込み > 取り込めなかったときの注意
error.noLines,Line を作れませんでした。from / to の列と、存在する Box ID を確認してください,No Lines could be created. Check the from / to columns and that the Box IDs exist.,表から取り込み > 取り込めなかったときの注意
error.noSdsg,SD/SG を作れませんでした。紐付け先の Box ID を確認してください,No SD/SG could be created. Check the Box IDs they attach to.,表から取り込み > 取り込めなかったときの注意
error.noPeriods,時期ラベルを作れませんでした。位置とラベルの列を確認してください,No period labels could be created. Check the position and label columns.,表から取り込み > 取り込めなかったときの注意
error.noTextColumn,「本文」の列を割り当ててください,Assign a column to Text,表から取り込み > 取り込めなかったときの注意
error.noParagraphs,段落を作れませんでした（本文が空）,No paragraphs could be created (the text is empty),表から取り込み > 取り込めなかったときの注意
done.warnings,警告 {{count}} 件:,{{count}} warnings:,表から取り込み > 取り込んだ後の知らせ（警告の一覧の見出し）
done.warnings_one,警告 {{count}} 件:,{{count}} warning:,件数が 1 のときの英語の形（日本語は使われない）
done.boxes,{{boxes}} 件の Box、{{lines}} 件の Line を取り込みました,Imported {{boxes}} Boxes and {{lines}} Lines,表から取り込み > 取り込んだ後の知らせ
done.lines,{{count}} 件の Line を取り込みました,Imported {{count}} Lines,表から取り込み > 取り込んだ後の知らせ
done.lines_one,{{count}} 件の Line を取り込みました,Imported {{count}} Line,件数が 1 のときの英語の形（日本語は使われない）
done.sdsg,{{count}} 件の SD/SG を取り込みました,Imported {{count}} SD/SG,表から取り込み > 取り込んだ後の知らせ
done.periods,{{count}} 件の時期ラベルを取り込みました,Imported {{count}} period labels,表から取り込み > 取り込んだ後の知らせ
done.periods_one,{{count}} 件の時期ラベルを取り込みました,Imported {{count}} period label,件数が 1 のときの英語の形（日本語は使われない）
done.transcript,逐語録「{{title}}」（{{count}} 段落）を取り込みました,"Imported the transcript ""{{title}}"" ({{count}} paragraphs)",表から取り込み > 取り込んだ後の知らせ
done.transcript_one,逐語録「{{title}}」（{{count}} 段落）を取り込みました,"Imported the transcript ""{{title}}"" ({{count}} paragraph)",件数が 1 のときの英語の形（日本語は使われない）
done.maxqda,"逐語録 {{transcripts}} 本（{{paragraphs}} 段落）、Box {{boxes}}、SD/SG {{sdsg}}、時期ラベル {{periods}} を取り込みました","Imported {{transcripts}} transcripts ({{paragraphs}} paragraphs), {{boxes}} Boxes, {{sdsg}} SD/SG and {{periods}} period labels",表から取り込み > 取り込んだ後の知らせ（MAXQDA）
step1.heading,1. ファイルを選ぶ,1. Choose a file,表から取り込み > 手順 1 の見出し
step1.hint,CSV / TSV / Excel（.xlsx / .xls）。Excel は最初の非空シートを読み、あとで切り替えられます。PowerPoint（.pptx）で描いた TEM 図も取り込めます（図形の役割を確かめる画面に進みます）。,"CSV / TSV / Excel (.xlsx / .xls). For Excel, the first non-empty sheet is read; you can switch later. TEM diagrams drawn in PowerPoint (.pptx) can also be imported (you will go on to a screen for checking the role of each shape).",表から取り込み > 手順 1 の説明（ここでのシートは Excel のシート）
step1.drop,ここにファイルをドロップ、またはクリックして選択,"Drop a file here, or click to choose one",表から取り込み > ファイルを落とす枠
step2.heading,2. 取り込み先を選ぶ,2. Choose what to import as,表から取り込み > 手順 2 の見出し
step2.hint,{{filename}}（{{rows}} 行）。列名から「{{mode}}」と推測しました。違えば変えてください。,"{{filename}} ({{rows}} rows). Guessed ""{{mode}}"" from the column names. Change it if that is wrong.",表から取り込み > 手順 2 の説明
step2.sheet,シート,Sheet,表から取り込み > Excel のシートの選択のラベル
step2.sheetOption,{{name}}（{{rows}} 行）,{{name}} ({{rows}} rows),表から取り込み > Excel のシートの選択肢
step2.hasHeader,1 行目は見出し,First row is a header,表から取り込み > チェックボックスのラベル
step2.preview,プレビュー（先頭 {{count}} 行）,Preview (first {{count}} rows),表から取り込み > 見出し
step2.preview_one,プレビュー（先頭 {{count}} 行）,Preview (first {{count}} row),件数が 1 のときの英語の形（日本語は使われない）
step3.heading,3. 列の役割を決める,3. Set the role of each column,表から取り込み > 手順 3 の見出し
step3.hint,{{required}}。見出しから推測した値が入っています。,{{required}}. Values guessed from the headers are filled in.,表から取り込み > 手順 3 の説明（{{required}} は required.* の文）
step3.col.header,列（見出し）,Column (header),表から取り込み > 列の役割の表の列名
step3.col.example,例,Example,表から取り込み > 列の役割の表の列名
step3.col.role,役割,Role,表から取り込み > 列の役割の表の列名
step3.defaultType,種別列が無いときの種別,Type when there is no type column,表から取り込み > 設定のラベル（Box）
step3.autoConnect,順番に矢印でつなぐ,Connect in order with arrows,表から取り込み > 設定のラベル（Box）
toNewSheet,新しいシートに取り込む,Import into a new sheet,表から取り込み > 設定のラベル
step3.transcriptTitle,逐語録のタイトル,Transcript title,表から取り込み > 設定のラベル（逐語録）
step3.keyMode,セグメントの集約キー,Segment merge key,表から取り込み > 設定のラベル（MAXQDA）
step3.keyMode.range,文書グループ・文書名・開始・終了の完全一致（既定）,"Exact match of document group, document name, begin and end (default)",表から取り込み > 集約キーの選択肢
step3.keyMode.text,文書グループ・文書名・本文の一致,"Match of document group, document name and segment text",表から取り込み > 集約キーの選択肢
step4.heading,4. コードをどう扱うか,4. How to use each code,表から取り込み > 手順 4 の見出し（MAXQDA）
step4.hint,{{docs}} 文書・{{segments}} セグメント（元 {{rows}} 行）に集約しました。すべてのコードは段落のタグとして残ります。Box などにするものを選んでください。,"Merged into {{docs}} documents and {{segments}} segments (from {{rows}} rows). All codes are kept as paragraph tags. Choose which ones to turn into Boxes and so on.",表から取り込み > 手順 4 の説明
step4.stackDocs,文書ごとに Item 軸を分ける,Separate the item axis by document,表から取り込み > 設定のラベル（MAXQDA）
step4.multiBox,同じセグメントに Box が複数,Several Boxes in one segment,表から取り込み > 設定のラベル（MAXQDA）
step4.multiBox.tip,1 つのセグメントに Box になるコードが 2 つ以上付いているときの置き方,How to place them when a segment has two or more codes that become Boxes,表から取り込み > 設定の吹き出し
multiBox.stack,同じ時期に縦に並べる（1 コード = 1 Box）,Stack at the same time (one code = one Box),表から取り込み > Box が複数のときの選択肢
multiBox.merge,1 つの Box にまとめる（ラベルを連ねる）,Merge into one Box (join the labels),表から取り込み > Box が複数のときの選択肢
multiBox.sequence,時期をずらして順に並べる,Place them one after another in time,表から取り込み > Box が複数のときの選択肢
step4.col.code,コード,Code,表から取り込み > コードの表の列名
step4.col.count,件数,Count,表から取り込み > コードの表の列名
step4.col.docs,文書,Documents,表から取り込み > コードの表の列名
step4.col.action,扱い,Use as,表から取り込み > コードの表の列名
step4.col.boxType,Box の種別,Box type,表から取り込み > コードの表の列名
action.tag,タグのみ,Tag only,表から取り込み > コードの扱いの選択肢
action.box,Box にする,Make a Box,表から取り込み > コードの扱いの選択肢
action.sd,SD にする,Make an SD,表から取り込み > コードの扱いの選択肢
action.sg,SG にする,Make an SG,表から取り込み > コードの扱いの選択肢
action.period,時期ラベルにする,Make a period label,表から取り込み > コードの扱いの選択肢
back,戻る,Back,表から取り込み > ボタン
cancel,キャンセル,Cancel,表から取り込み > ボタン
next,次へ,Next,表から取り込み > ボタン
import,取り込む,Import,表から取り込み > ボタン
`,Tf=`\uFEFFkey,ja,en,note
"title","2選択間にBox挿入","Insert Boxes between two selected","間に挿入の画面 > 見出し"
"selectTwo","⚠ キャンバスで<strong>2つのBox</strong>を選択してください（Shift+クリック）","⚠ Select <strong>two Boxes</strong> on the canvas (Shift+click).","間に挿入の画面 > Box が 2 つ選ばれていないとき（<strong> のタグは残す）"
"selected.title","選択中のBox","Selected Boxes","間に挿入の画面 > 節の見出し"
"selected.start","開始Box (A)","Start Box (A)","間に挿入の画面 > 時間の早い方の Box"
"selected.end","終了Box (B)","End Box (B)","間に挿入の画面 > 時間の遅い方の Box"
"selected.current","現在Time_Level:","Current Time_Level:","間に挿入の画面 > Box の今の位置（後ろに数値）"
"settings.title","挿入設定","Insert settings","間に挿入の画面 > 節の見出し"
"settings.count","挿入個数","Number of Boxes","間に挿入の画面 > 挿入する Box の数の欄"
"settings.mode","モード","Mode","間に挿入の画面 > 挿入のしかたの欄"
"mode.simple","単純挿入（位置変更なし）","Simple insert (no position change)","間に挿入の画面 > モードの選択肢"
"mode.expandShift","レベル指定+以降シフト","Set level gaps and shift later Boxes","間に挿入の画面 > モードの選択肢"
"settings.splitArrow","📌 A→B の矢印がある場合、自動的に A→C1→...→CN→B に分割されます","📌 If there is an arrow A→B, it is split into A→C1→...→CN→B automatically.","間に挿入の画面 > 説明"
"hint.simple","<strong>単純挿入</strong>:<br/>開始Box ({{start}}) と終了Box ({{end}}) の間に <strong>{{n}}個</strong> を均等配置。<br/>他のBoxの位置は変更されません。","<strong>Simple insert</strong>:<br/>Places <strong>{{n}}</strong> Boxes evenly between the start Box ({{start}}) and the end Box ({{end}}).<br/>Other Boxes do not move.","間に挿入の画面 > 単純挿入の説明（start・end は Time_Level、n は個数。<strong>・<br/> のタグは残す）"
"delta.title","レベル差","Level gaps","間に挿入の画面 > 節の見出し"
"delta.aToC","A → 最初の新Box のレベル差","Gap from A to the first new Box","間に挿入の画面 > レベル差の欄"
"delta.cToB","最後の新Box → B のレベル差","Gap from the last new Box to B","間に挿入の画面 > レベル差の欄"
"hint.expandShift.multi","<strong>レベル指定+以降シフト</strong>:<br/>A (Level {{start}}) はそのまま固定。<br/>新Box は A から <strong>{{aToC}}</strong> レベル離れた位置から <strong>1レベル間隔</strong>で配置。<br/>最後の新Boxから B まで <strong>{{cToB}}</strong> レベル。<br/>→ B の新Level: <strong>{{newEnd}}</strong>（旧 {{oldEnd}}, シフト量 {{shift}}）<br/>B より後ろのBoxもすべて <strong>{{shift}}</strong> レベルずらします。","<strong>Set level gaps and shift later Boxes</strong>:<br/>A (level {{start}}) stays where it is.<br/>New Boxes start <strong>{{aToC}}</strong> levels after A and are placed <strong>1 level apart</strong>.<br/>From the last new Box to B: <strong>{{cToB}}</strong> levels.<br/>→ New level of B: <strong>{{newEnd}}</strong> (was {{oldEnd}}, shift {{shift}})<br/>All Boxes after B are also shifted by <strong>{{shift}}</strong> levels.","間に挿入の画面 > レベル指定のモードの説明（新しい Box が 2 つ以上のとき。タグは残す）"
"hint.expandShift.single","<strong>レベル指定+以降シフト</strong>:<br/>A (Level {{start}}) はそのまま固定。<br/>新Box は A から <strong>{{aToC}}</strong> レベル離れた位置から <strong>1レベル間隔</strong>で配置。<br/>B まで <strong>{{cToB}}</strong> レベル。<br/>→ B の新Level: <strong>{{newEnd}}</strong>（旧 {{oldEnd}}, シフト量 {{shift}}）<br/>B より後ろのBoxもすべて <strong>{{shift}}</strong> レベルずらします。","<strong>Set level gaps and shift later Boxes</strong>:<br/>A (level {{start}}) stays where it is.<br/>New Boxes start <strong>{{aToC}}</strong> levels after A and are placed <strong>1 level apart</strong>.<br/>To B: <strong>{{cToB}}</strong> levels.<br/>→ New level of B: <strong>{{newEnd}}</strong> (was {{oldEnd}}, shift {{shift}})<br/>All Boxes after B are also shifted by <strong>{{shift}}</strong> levels.","間に挿入の画面 > レベル指定のモードの説明（新しい Box が 1 つのとき。タグは残す）"
"cancel","キャンセル","Cancel","間に挿入の画面 > ボタン"
"insert","挿入","Insert","間に挿入の画面 > 実行ボタン"
`,Cf=`\uFEFFkey,ja,en,note
"drag.title","ドラッグで移動","Drag to move","図の上の凡例のつまみの説明（マウスを重ねたとき）"
"legend.title","クリックで選択、ダブルクリックで凡例設定","Click to select; double-click for legend settings","図の上の凡例の説明（マウスを重ねたとき）"
"resize.title","ドラッグで凡例の大きさを変更","Drag to resize the legend","凡例の角のつまみの説明（マウスを重ねたとき）"
`,_f=`\uFEFFkey,ja,en,note
"cp1.title","cp1 をドラッグで移動","Drag to move cp1","曲線の矢印の制御点 1 の説明（マウスを重ねたとき）"
"cp2.title","cp2 をドラッグで移動","Drag to move cp2","曲線の矢印の制御点 2 の説明（マウスを重ねたとき）"
"bend.title.h","L字の折れ位置をドラッグで調整（左右方向）","Drag to adjust the bend of the L-shaped line (left and right)","L 字の矢印の折れ目のつまみの説明（横型）"
"bend.title.v","L字の折れ位置をドラッグで調整（上下方向）","Drag to adjust the bend of the L-shaped line (up and down)","L 字の矢印の折れ目のつまみの説明（縦型）"
`,Af=`\uFEFFkey,ja,en,note
role.ignore,（無視）,(Ignore),MAXQDA の取り込み > 列の役割の名前（画面の表示は importWizardDialog.csv 側）
role.docgroup,文書グループ,Document group,MAXQDA の取り込み > 列の役割の名前
role.docname,文書名（逐語録）,Document name (transcript),MAXQDA の取り込み > 列の役割の名前
role.code,コード,Code,MAXQDA の取り込み > 列の役割の名前
role.start,開始,Beginning,MAXQDA の取り込み > 列の役割の名前
role.end,終了,End,MAXQDA の取り込み > 列の役割の名前
role.segment,セグメント本文,Segment text,MAXQDA の取り込み > 列の役割の名前
role.weight,重み,Weight,MAXQDA の取り込み > 列の役割の名前
role.comment,コメント,Comment,MAXQDA の取り込み > 列の役割の名前
role.area,領域,Area,MAXQDA の取り込み > 列の役割の名前
role.coverage,範囲 (%),Coverage (%),MAXQDA の取り込み > 列の役割の名前
role.codedby,コード付けした人,Coded by,MAXQDA の取り込み > 列の役割の名前
role.created,作成日,Created,MAXQDA の取り込み > 列の役割の名前
role.color,色,Color,MAXQDA の取り込み > 列の役割の名前
role.othercodes,他のコード（同じセグメントの）,Other codes (on the same segment),MAXQDA の取り込み > 列の役割の名前
action.tag,タグのみ,Tag only,MAXQDA の取り込み > コードの扱いの名前（画面の表示は importWizardDialog.csv 側）
action.box,Box にする,Make a Box,MAXQDA の取り込み > コードの扱いの名前
action.sd,SD にする,Make an SD,MAXQDA の取り込み > コードの扱いの名前
action.sg,SG にする,Make an SG,MAXQDA の取り込み > コードの扱いの名前
action.period,時期ラベルにする,Make a period label,MAXQDA の取り込み > コードの扱いの名前
multibox.stack,同じ時期に縦に並べる（1 コード = 1 Box）,Stack in the same period (1 code = 1 Box),MAXQDA の取り込み > 1 つのセグメントに Box のコードが複数あるときの並べ方（画面の表示は importWizardDialog.csv 側）
multibox.merge,1 つの Box にまとめる（ラベルを連ねる）,Merge into one Box (join the labels),MAXQDA の取り込み > 同上
multibox.sequence,時期をずらして順に並べる,Place in sequence over time,MAXQDA の取り込み > 同上
warn.nodoc,「文書名」の列が未指定です。全行を 1 つの逐語録として扱います,No “Document name” column. All rows are treated as one transcript.,MAXQDA の取り込み > 警告
warn.noseg,「セグメント本文」の列が未指定です。段落の本文が空になります,No “Segment text” column. Paragraph text will be empty.,MAXQDA の取り込み > 警告
warn.nocode,「コード」の列が未指定です。タグ・Box は作られません,No “Code” column. No tags or Boxes will be created.,MAXQDA の取り込み > 警告
warn.norange,「開始」「終了」の列が無いため、本文の一致でセグメントを集約します,"No “Beginning”/“End” columns, so segments are grouped by matching text.",MAXQDA の取り込み > 警告
warn.nosegtext,「{{code}}」（{{doc}}）: セグメント本文が無いため Box / SD・SG にできませんでした,“{{code}}” ({{doc}}): could not make a Box or SD/SG (no segment text),MAXQDA の取り込み > 警告
warn.noattach,「{{code}}」（{{doc}}）: 紐付ける Box がまだ無いため SD/SG を作れませんでした。先に Box になるコードを選んでください,“{{code}}” ({{doc}}): could not make the SD/SG (no Box to attach to yet). Choose a code that becomes a Box first.,MAXQDA の取り込み > 警告
`,If=`\uFEFFkey,ja,en,note
"boxType.normal","行為","Action","Word の論文用レポート > 記号体系の宣言 > 各要素の線種の行の種別名（図の言語）"
"boxType.OPP","必須通過点（OPP）","Obligatory passage point (OPP)","同上（用語は terms.csv の boxType.OPP）"
"boxType.BFP","分岐点（BFP）","Bifurcation point (BFP)","同上（用語は terms.csv の boxType.BFP）"
"boxType.EFP","等至点（EFP）","Equifinality point (EFP)","同上（用語は terms.csv の boxType.EFP）"
"boxType.P-EFP","両極化した等至点（P-EFP）","Polarized equifinality point (P-EFP)","同上（用語は terms.csv の boxType.P-EFP）"
"boxType.2nd-EFP","セカンド等至点（2nd EFP）","Second equifinality point (2nd EFP)","同上（用語は terms.csv の boxType.2nd-EFP）"
"boxType.P-2nd-EFP","両極化したセカンド等至点（P-2nd EFP）","Polarized second equifinality point (P-2nd EFP)","同上（用語は terms.csv の boxType.P-2nd-EFP）"
"boxType.annotation","潜在的な行為（実現しなかった行為）","Potential action (unrealized action)","同上（用語は terms.csv の boxType.annotation）"
"boxType.other","その他の種別","Other type","同上"
"stroke.solid","実線","solid line","Word の論文用レポート > 記号体系の宣言 > 枠の線の種類（文の途中に入るので英語は小文字）"
"stroke.double","二重線","double line","同上"
"stroke.dashed","点線","dashed line","同上"
"stroke.dotted","細かい点線","dotted line","同上"
"stroke.double-dashed","二重の点線","double dashed line","同上"
"weight.thick","太い{{stroke}}","thick {{stroke}}","Word の論文用レポート > 記号体系の宣言 > 枠の線の太さ（stroke は線の種類。いちばん多い太さより太い）"
"weight.slightlyThick","やや太い{{stroke}}","slightly thick {{stroke}}","同上（少し太い）"
"weight.thin","細い{{stroke}}","thin {{stroke}}","同上（細い）"
"shape.ellipse","{{stroke}}の楕円","{{stroke}} ellipse","Word の論文用レポート > 記号体系の宣言 > 楕円の枠（stroke は線の種類と太さ。例: 細い実線の楕円）"
"line","{{type}}: {{stroke}}","{{type}}: {{stroke}}","Word の論文用レポート > 記号体系の宣言 > 各要素の線種の 1 行（type は種別名・stroke は線）"
"line.secondaryLabelOnly","{{type}}: 併記の種別ラベルだけで示す（枠は主の種別の線）","{{type}}: shown only by the secondary type label (the border uses the line of the primary type)","Word の論文用レポート > 記号体系の宣言 > 併記にしか使っていない種別の行"
"line.secondaryHidden","{{type}}: 図には示していない（行為・潜在的な行為の Box への併記で，種別ラベルが出ないため）","{{type}}: not shown in the diagram (it is a secondary type on Experience or Latent experience Boxes, which show no type label)","Word の論文用レポート > 記号体系の宣言 > 図に現れない併記の種別の行"
"meaning.realityOnly","Box の線種は実在性だけを表す（{{observed}}＝データの中で観察された経験{{unobserved}}）。","Box line styles show only whether an experience was observed ({{observed}} = experience observed in the data{{unobserved}}).","Word の論文用レポート > 記号体系の宣言 > 線種が表す意味（簡素化方式。observed・unobserved は線の名前）"
"meaning.unobservedPart","，{{stroke}}＝観察されなかった経験",", {{stroke}} = unobserved experience","同上の括弧の中の後半（観察されなかった経験の線）"
"meaning.noAngle","径路の線の角度や向きには意味を持たせず，線はカギ線（L 字の線）で描く。","Trajectory lines carry no meaning in their angle or direction; they are drawn as elbow (L-shaped) lines.","Word の論文用レポート > 記号体系の宣言 > 線種が表す意味（簡素化方式で、径路がすべてカギ線のとき）"
"meaning.typesByLabel","等至点・必須通過点・分岐点などの種別は，線種ではなく図中の種別ラベル（自動採番）で示す。","Types such as equifinality points, obligatory passage points and bifurcation points are shown not by line style but by the type labels in the diagram (numbered automatically).","Word の論文用レポート > 記号体系の宣言 > 線種が表す意味（簡素化方式の 2 文目）"
"meaning.hiddenLabels","ただし，{{types}}の種別ラベルは表示していない。","However, the type labels for {{types}} are not shown.","Word の論文用レポート > 記号体系の宣言 > 種別ラベルを隠した種別があるとき（types は種別名の並び）"
"list.separator","・",", ","上の types の種別名を並べる区切り（英語はカンマと空白）"
"meaning.both","Box の線種は，要素の種別と実在性（観察されたか否か）の両方を表す。","Box line styles show both the element type and whether the experience was observed.","Word の論文用レポート > 記号体系の宣言 > 線種が表す意味（既定の表記）"
"meaning.secondary","2 つの種別を併記した Box は，枠を主の種別の線で描き，併記した種別は種別ラベルで示す。","A Box with two types is drawn with the border of its primary type, and the secondary type is shown by its type label.","Word の論文用レポート > 記号体系の宣言 > 2 つの種別を併記した Box があるとき"
`,Of=`\uFEFFkey,ja,en,note
"title","メモ（ダブルクリック / Enter で編集）","Note (double-click or press Enter to edit)","図の上のメモの説明（マウスを重ねたとき）"
"placeholder.symbol","（記号）","(symbol)","図の上の記号のメモ（文字が空のとき・薄い字）"
"placeholder.note","（メモ）","(note)","図の上のメモ（文字が空のとき・薄い字）"
`,Ff=`\uFEFFkey,ja,en,note
"title","重なりチェック","Overlap check","重なりチェックの画面 > 見出し"
"hint.compute","現在のシート（{{sheet}}）の要素の位置から、視覚的にぶつかっている箇所を計算します。","Finds places where elements visually collide, based on their positions in the current sheet ({{sheet}}).","重なりチェックの画面 > 説明の 1 文目（sheet はシート名）"
"hint.click","行をクリックすると、その要素を選択して画面を寄せます。","Click a row to select the element and scroll to it.","重なりチェックの画面 > 説明の 2 文目"
"none","重なりは見つかりませんでした。","No overlaps found.","重なりチェックの画面 > 重なりが無いとき"
"col.kind","種類","Type","重なりチェックの画面 > 一覧の列の名前（検査の種類）"
"col.detail","内容","Details","重なりチェックの画面 > 一覧の列の名前（重なりの説明）"
"row.tooltip","クリックで該当箇所を選択して表示","Click to select and show this spot","重なりチェックの画面 > 一覧の行にマウスを載せたときの説明"
"statusBar","ステータスバーに件数を常時表示","Always show the count in the status bar","重なりチェックの画面 > 下のチェックボックス"
"close","閉じる","Close","重なりチェックの画面 > 閉じるボタン"
`,Nf=`\uFEFFkey,ja,en,note
"check.labelLabel","ラベル類の重なり","Overlapping labels","重なりチェック > 調べる項目の名前・結果の種類"
"check.boxBox","Box 同士の重なり","Overlapping boxes","重なりチェック > 調べる項目の名前・結果の種類"
"check.textOverflow","テキストのはみ出し","Text overflow","重なりチェック > 調べる項目の名前・結果の種類"
"check.lineLabel","矢印とラベルの衝突","Arrows crossing labels","重なりチェック > 調べる項目の名前・結果の種類"
"part.box","Box","box","重なりチェック > 結果の文の中の部位の名前（Box の本体）"
"part.boxLabel","本文","text","重なりチェック > 結果の文の中の部位の名前（Box の文字）"
"part.subLabel","サブラベル","sublabel","重なりチェック > 結果の文の中の部位の名前"
"part.typeLabel","種別ラベル","type label","重なりチェック > 結果の文の中の部位の名前"
"part.sdsg","SD/SG","SD/SG","重なりチェック > 結果の文の中の部位の名前"
"part.periodLabel","時期ラベル","period label","重なりチェック > 結果の文の中の部位の名前"
"part.timeArrowLabel","時間軸ラベル","time arrow label","重なりチェック > 結果の文の中の部位の名前"
"part.legend","凡例","legend","重なりチェック > 結果の文の中の部位の名前"
"part.note","メモ","note","重なりチェック > 結果の文の中の部位の名前"
"part.line","矢印","arrow","重なりチェック > 結果の文の中の部位の名前"
"describe.withText","{{id}} の{{part}}「{{text}}」","{{id}} {{part}} ""{{text}}""","重なりチェック > 結果の文の中で要素を指す言い方（id は要素の ID、part は部位、text は文字の先頭）"
"describe.plain","{{id}} の{{part}}","{{id}} {{part}}","重なりチェック > 結果の文の中で要素を指す言い方（文字が無いとき）"
"message.overflow.x","{{id}} の本文が枠から横に {{x}}pxはみ出しています","The text of {{id}} overflows its box by {{x}} px horizontally","重なりチェック > 結果の文（テキストのはみ出し・横）"
"message.overflow.y","{{id}} の本文が枠から縦に {{y}}pxはみ出しています","The text of {{id}} overflows its box by {{y}} px vertically","重なりチェック > 結果の文（テキストのはみ出し・縦）"
"message.overflow.both","{{id}} の本文が枠から横に {{x}}px・縦に {{y}}pxはみ出しています","The text of {{id}} overflows its box by {{x}} px horizontally and {{y}} px vertically","重なりチェック > 結果の文（テキストのはみ出し・横と縦）"
"message.overlap","{{a}} と {{b}} が重なっています","{{a}} overlaps {{b}}","重なりチェック > 結果の文（重なり。a と b は要素を指す言い方）"
"message.lineCrosses","矢印 {{id}} が {{target}} の上を通っています","Arrow {{id}} passes over {{target}}","重なりチェック > 結果の文（矢印とラベルの衝突）"
`,Rf=`\uFEFFkey,ja,en,note
"title","論文用レポート","Paper report","論文用レポートの画面 > 見出し"
"drag","ドラッグで移動","Drag to move","論文用レポートの画面 > 見出しの帯にマウスを載せたときの説明（画面そのものを動かす）"
"close","閉じる","Close","論文用レポートの画面 > 閉じるボタン"
"alert.failed","レポート出力に失敗しました: {{message}}","Could not export the report: {{message}}","論文用レポートの画面 > 書き出しに失敗したときの注意（message はエラーの内容）"
"list.separator","、",", ","論文用レポートの画面 > 項目を並べるときの区切り（英語はカンマと空白）"
"tab.general","概要","General","論文用レポートの画面 > タブ"
"tab.notation","記号体系","Notation","論文用レポートの画面 > タブ"
"tab.participants","協力者","Participants","論文用レポートの画面 > タブ"
"tab.interview","インタビュー","Interview","論文用レポートの画面 > タブ"
"tab.visual","表記方針","Notation policy","論文用レポートの画面 > タブ（用語は terms.csv の notationPolicy）"
"tab.export","出力","Export","論文用レポートの画面 > タブ"
"export.title","出力設定","Export settings","論文用レポートの画面 > 出力タブ > 見出し"
"export.includeDiagram","現在のキャンバスを図として含める","Include the current canvas as a figure","論文用レポートの画面 > 出力タブ > チェックボックス"
"export.includeSourceRefs","原文引用 (sourceRefs) を結果セクションに含める","Include source quotes (sourceRefs) in the results section","論文用レポートの画面 > 出力タブ > チェックボックス"
"export.labelBracket.box","結果の節: Box・時期のラベルの括弧","Results: brackets for Box and period labels","論文用レポートの画面 > 出力タブ > ラベルを括る括弧の欄"
"export.labelBracket.sdsg","結果の節: SD・SG のラベルの括弧","Results: brackets for SD and SG labels","同上（SD・SG。論文によっては Box と別の括弧を使う）"
"export.labelBracket.title","結果の節で図の要素のラベルを括る括弧です。TEM の論文では書き方がまちまちなので、投稿先や自分の論文の書き方に合わせて選んでください","The brackets that enclose labels of diagram elements in the Results section. TEM papers differ in this, so choose the one that matches your paper or journal","上の 2 つの欄の説明（マウスを重ねたとき）"
"export.labelBracket.auto","自動（日本語【…】・英語“…”）","Automatic (Japanese 【…】, English “…”)","括弧の選択肢（既定。日本語は調べでいちばん多かった【】。2026-11-10 までは〈〉）"
"export.labelBracket.count","（{{n}} 本）"," ({{n}} papers)","括弧の選択肢の後ろ（TEM 論文 68 本のうち、その括弧を主に使っていた論文の数）"
"export.labelOrder","結果の節: 記号とラベルの順","Results: order of ID and label","論文用レポートの画面 > 出力タブ > 書く順の欄"
"export.labelOrder.idFirst","記号が先（{{example}}）","ID first ({{example}})","書く順の選択肢"
"export.labelOrder.labelFirst","ラベルが先（{{example}}）","Label first ({{example}})","書く順の選択肢"
"export.labelBracket.survey","括弧の後ろの数は、TEM の論文 68 本（2015〜2026 年。TEAと質的探究・質的心理学研究・保育学研究など）で、記号の付いた要素を主にその括弧で示していた論文の数です（2026 年 11 月の調べ。「」は語りの引用にも使われます）。英語の図の「自動」は二重引用符です（英語の TEM 論文 10 本で、本文のラベルを示すのに使われていた形。山括弧⟨⟩や斜体の例はありませんでした）。","The numbers after the brackets are how many of 68 TEM papers (2015–2026; TEA and Qualitative Inquiry, Japanese Journal of Qualitative Psychology, Japanese Journal of Childcare and Early Education, etc.) mainly used that bracket for diagram elements (survey of November 2026; 「」 is also used for quoted narratives). In English diagrams, Automatic uses double quotation marks, the form used for labels in 10 English TEM papers (no angle brackets or italics were found).","上の欄の下の説明"
"export.sourceRefStyle","引用表記スタイル","Quote citation style","論文用レポートの画面 > 出力タブ > 引用の書き方の欄"
"export.style.bracket","[原文 T1 §4]「…」 (角括弧)","[Source T1 §4] ""..."" (square brackets)","論文用レポートの画面 > 出力タブ > 引用の書き方の選択肢（Word のレポートに出る形の例）"
"export.style.apa","（A, 第1回, §4）「…」 (APA 風)","(A, session 1, §4) ""..."" (APA-like)","論文用レポートの画面 > 出力タブ > 引用の書き方の選択肢（Word のレポートに出る形の例）"
"export.hint.intro",".docx（Word 形式）として出力します。レポートには以下が含まれます:","Exports a .docx (Word) file. The report contains:","論文用レポートの画面 > 出力タブ > 説明の 1 行目"
"export.hint.methods","・記号体系 / 協力者 / インタビュー / 表記方針（方法相当）","- Notation / participants / interview / notation policy (the method section)","論文用レポートの画面 > 出力タブ > 説明の箇条"
"export.hint.diagram","・TEM 図（任意・PNG 埋込）","- TEM diagram (optional, embedded as PNG)","論文用レポートの画面 > 出力タブ > 説明の箇条"
"export.hint.results","・<b>結果</b>: 時期区分・OPP・BFP・EFP・P-EFP・2nd EFP・P-2nd EFP・行為・潜在的な行為・径路（実線/点線）・SD・SG を漏れなくリスト化","- <b>Results</b>: a complete list of periods, OPP, BFP, EFP, P-EFP, 2nd EFP, P-2nd EFP, actions, potential actions, trajectories (solid/dotted), SD and SG","論文用レポートの画面 > 出力タブ > 説明の箇条（<b> のタグは残す）"
"export.hint.glossary","・用語凡例","- Glossary of terms","論文用レポートの画面 > 出力タブ > 説明の箇条"
"export.hint.description","各要素の「説明」フィールド（PropertyPanel から編集可）が記入されていればそのまま挿入されます。","If an element has a Description (editable in the property panel), it is inserted as is.","論文用レポートの画面 > 出力タブ > 説明"
"export.hint.confirm","出力の前に確認画面で、入力状況・図にあるメモや記号を載せるか・未入力の項目の扱いを選びます。"," Before exporting, a check screen shows what has been filled in and lets you choose whether to include the notes and symbols in the diagram and how to handle items not filled in.","論文用レポートの画面 > 出力タブ > 説明（前の文の直後に続く。英語は先頭に空白）"
"export.generate","レポートを生成...","Generate report...","論文用レポートの画面 > 出力タブ > 確認画面へ進むボタン"
"general.title","概要","General","論文用レポートの画面 > 概要タブ > 見出し"
"general.docTitle","タイトル","Title","論文用レポートの画面 > 概要タブ > レポートの題の欄"
"general.author","著者","Author","論文用レポートの画面 > 概要タブ > 欄"
"general.notes","備考（レポート末尾）","Notes (end of report)","論文用レポートの画面 > 概要タブ > 欄"
"notation.title","記号体系","Notation","論文用レポートの画面 > 記号体系タブ > 見出し"
"notation.hint","この図で各記号が何を意味するかを宣言します。既定の表記は TEMerPlus の既定の表記で、実線と点線の使い分けは荒川・安田・サトウ（2012）を参照し、種別を表す線種は本ツールが定めたものです。「標準」ではなく出発点です。変えた点があれば補足説明に書きます。","Declares what each symbol means in this diagram. The default is the TEMerPlus default notation: the use of solid and dotted lines draws on Arakawa, Yasuda and Sato (2012), and the line styles that mark element types were defined by this tool. It is a starting point, not a ""standard"". Describe any changes in the additional description.","論文用レポートの画面 > 記号体系タブ > 説明"
"notation.base","基準","Basis","論文用レポートの画面 > 記号体系タブ > どの記号体系に拠るかの欄"
"notation.base.arakawa","TEMerPlus の既定の表記","TEMerPlus default notation","論文用レポートの画面 > 記号体系タブ > 基準の選択肢"
"notation.base.custom","独自","Custom","論文用レポートの画面 > 記号体系タブ > 基準の選択肢"
"notation.base.other","その他","Other","論文用レポートの画面 > 記号体系タブ > 基準の選択肢"
"notation.description","補足説明","Additional description","論文用レポートの画面 > 記号体系タブ > 欄"
"notation.description.placeholder","独自/その他を選択した場合、具体的な記号体系を説明","If you chose Custom or Other, describe the notation you use","論文用レポートの画面 > 記号体系タブ > 入力欄の例"
"notation.symbols.title","図中の記号の意味","Meaning of symbols in the diagram","論文用レポートの画面 > 記号体系タブ > 節の見出し"
"notation.symbols.hint","図に置いた記号（★・〇 など）の意味です。確認画面で「載せる」を選ぶと、記号体系の宣言に書き出します。","The meaning of symbols placed in the diagram (★, 〇, etc.). If you choose Include on the check screen, they are written into the notation declaration.","論文用レポートの画面 > 記号体系タブ > 説明"
"notation.symbols.placeholder","例: 語りの中で本人が強調した転機","e.g. A turning point the participant emphasized in the narrative","論文用レポートの画面 > 記号体系タブ > 記号の意味の入力欄の例"
"participants.title","協力者情報","Participants","論文用レポートの画面 > 協力者タブ > 見出し"
"participants.count","協力者数","Number of participants","論文用レポートの画面 > 協力者タブ > 欄"
"participants.description","記述（属性など）","Description (attributes, etc.)","論文用レポートの画面 > 協力者タブ > 欄"
"participants.hsi","HSI 水準の説明","HSI level description","論文用レポートの画面 > 協力者タブ > 欄（HSI = 歴史的構造化招待）"
"participants.hsi.placeholder","歴史的構造化招待（HSI）の水準の説明","Describe the level of historically structured inviting (HSI)","論文用レポートの画面 > 協力者タブ > 入力欄の例"
"participants.pseudonyms","仮名（カンマ区切り）","Pseudonyms (comma-separated)","論文用レポートの画面 > 協力者タブ > 欄"
"participants.pseudonyms.placeholder","例: A, B, C","e.g. A, B, C","論文用レポートの画面 > 協力者タブ > 入力欄の例"
"interview.title","インタビュー方法","Interview method","論文用レポートの画面 > インタビュータブ > 見出し"
"interview.method","方法","Method","論文用レポートの画面 > インタビュータブ > 欄"
"interview.method.placeholder","半構造化面接 など","e.g. semi-structured interview","論文用レポートの画面 > インタビュータブ > 入力欄の例"
"interview.duration","所要時間/期間","Duration / period","論文用レポートの画面 > インタビュータブ > 欄"
"interview.duration.placeholder","例: 1回あたり約60分、計3回","e.g. about 60 minutes each, 3 sessions","論文用レポートの画面 > インタビュータブ > 入力欄の例"
"interview.times","回数","Number of sessions","論文用レポートの画面 > インタビュータブ > 欄"
"interview.analysis","分析の組合せ","Combined analysis methods","論文用レポートの画面 > インタビュータブ > 欄（TEM と組み合わせた分析法）"
"interview.analysis.placeholder","例: TEM + M-GTA","e.g. TEM + M-GTA","論文用レポートの画面 > インタビュータブ > 入力欄の例"
"interview.notes","備考","Notes","論文用レポートの画面 > インタビュータブ > 欄"
"visual.title","表記方針","Notation policy","論文用レポートの画面 > 表記方針タブ > 見出し"
"visual.hint","図中で意味を持たせた表記について明文化します（学会での透明性向上）。各項目は「意味あり / 緩やかに意味あり / 意味なし」から選びます。","States which visual features carry meaning in the diagram (for transparency in academic reporting). For each item, choose Meaningful / Loosely meaningful / Not meaningful.","論文用レポートの画面 > 表記方針タブ > 説明（選択肢の名前は utils/visualConventions の訳に合わせる）"
"visual.description","説明","Description","論文用レポートの画面 > 表記方針タブ > 項目ごとの説明の欄"
"confirm.title","論文用レポート出力前の確認","Check before exporting the paper report","論文用レポートの画面 > 確認画面 > 見出し"
"confirm.hint","入力は強制しません。「記入しない」まま出力することもできます。","Nothing is required. You can export without filling things in.","論文用レポートの画面 > 確認画面 > 説明"
"confirm.status","入力状況","What has been filled in","論文用レポートの画面 > 確認画面 > 節の見出し"
"confirm.status.detail","（{{detail}}）"," ({{detail}})","論文用レポートの画面 > 確認画面 > 入力状況の補足（英語は先頭に空白）"
"confirm.fillIn","入力する","Fill in","論文用レポートの画面 > 確認画面 > 入力状況の行のボタン（そのタブへ戻る）"
"confirm.inProperties","各要素のプロパティで書けます","Can be written in each element's properties","論文用レポートの画面 > 確認画面 > 入力状況の行の説明"
"confirm.content","図にある要素を載せるか","Include elements from the diagram?","論文用レポートの画面 > 確認画面 > 節の見出し"
"confirm.choose","（選んでください）","(please choose)","論文用レポートの画面 > 確認画面 > まだ選んでいない欄の印"
"confirm.notes.title","メモ（{{n}} 件。うちメモのプロパティで「論文レポートに載せる」にしたもの {{flagged}} 件）","Notes ({{n}}; {{flagged}} of them marked ""Include in paper report"" in the note properties)","論文用レポートの画面 > 確認画面 > メモの欄（n は数・flagged は載せる印の数）"
"confirm.notes.all","すべて注記に載せる","Include all as footnotes","論文用レポートの画面 > 確認画面 > メモの選択肢"
"confirm.notes.flagged","「載せる」にしたものだけ（{{flagged}} 件）","Only those marked ""Include"" ({{flagged}})","論文用レポートの画面 > 確認画面 > メモの選択肢"
"confirm.excludeAndRemove","載せない（図からも除く）","Exclude (also remove from the diagram)","論文用レポートの画面 > 確認画面 > メモ・記号の選択肢"
"confirm.symbols.title","記号（★・〇 など {{n}} 件）","Symbols (★, 〇, etc.; {{n}})","論文用レポートの画面 > 確認画面 > 記号の欄"
"confirm.symbols.include","載せる（図に残し、意味を記号体系の宣言に書く）","Include (keep them in the diagram and write their meanings in the notation declaration)","論文用レポートの画面 > 確認画面 > 記号の選択肢"
"confirm.comments.title","コメント（{{n}} 件）","Comments ({{n}})","論文用レポートの画面 > 確認画面 > コメントの欄"
"confirm.comments.include","結果の「コメント」に載せる","Include under ""Comments"" in the results","論文用レポートの画面 > 確認画面 > コメントの選択肢"
"confirm.exclude","載せない","Exclude","論文用レポートの画面 > 確認画面 > コメントの選択肢"
"confirm.missing","未入力の項目","Items not filled in","論文用レポートの画面 > 確認画面 > 節の見出し"
"confirm.missing.omit","出力に含めない","Leave them out","論文用レポートの画面 > 確認画面 > 未入力の扱いの選択肢"
"confirm.missing.mark","「（未入力）」と書いて含める（Word で抜けが分かる）","Include them marked ""(not entered)"" (so gaps show in Word)","論文用レポートの画面 > 確認画面 > 未入力の扱いの選択肢（印の文字は Word のレポート側で決まる）"
"confirm.continue","記入を続ける","Continue editing","論文用レポートの画面 > 確認画面 > ボタン"
"confirm.chooseFirst","載せるかを選んでください: {{items}}","Choose whether to include: {{items}}","論文用レポートの画面 > 確認画面 > 出力ボタンが押せないときの説明（items は未選択の項目）"
"confirm.generating","生成中...","Generating...","論文用レポートの画面 > 確認画面 > 出力ボタン（作成中）"
"confirm.export","このまま出力する","Export as is","論文用レポートの画面 > 確認画面 > 出力ボタン"
`,zf=`\uFEFFkey,ja,en,note
"A4-landscape","A4 横","A4 landscape","サイズ変更の画面 > 用紙の選択肢"
"A4-portrait","A4 縦","A4 portrait","サイズ変更の画面 > 用紙の選択肢"
"A3-landscape","A3 横","A3 landscape","サイズ変更の画面 > 用紙の選択肢"
"A3-portrait","A3 縦","A3 portrait","サイズ変更の画面 > 用紙の選択肢"
"slide16x9","16:9 スライド（13.33×7.5 in）","16:9 slide (13.33 × 7.5 in)","サイズ変更の画面 > 用紙の選択肢"
"slide4x3","4:3 スライド（10.67×8.0 in）","4:3 slide (10.67 × 8.0 in)","サイズ変更の画面 > 用紙の選択肢"
`,Mf=`\uFEFFkey,ja,en,note
"title","時期ラベル","Period labels","時期ラベルの画面 > 見出し"
"alert.empty","ラベルを入力してください","Enter a label.","時期ラベルの画面 > 空のまま追加したときの注意"
"add.title","新規追加","Add new","時期ラベルの画面 > 追加の節の見出し"
"add.label","時期ラベル","Period label","時期ラベルの画面 > 追加の欄の名前"
"add.placeholder","例: 入学前、就職後","e.g. Before entering school, After getting a job","時期ラベルの画面 > 入力欄の例"
"add.position","Time_Level（時間軸位置）","Time_Level (position on the time axis)","時期ラベルの画面 > 位置の欄の名前"
"add.button","追加","Add","時期ラベルの画面 > 追加ボタン"
"list.title","現在の時期ラベル","Current period labels","時期ラベルの画面 > 一覧の見出し"
"list.none","まだ時期ラベルがありません。","No period labels yet.","時期ラベルの画面 > 一覧が空のとき"
"col.label","ラベル","Label","時期ラベルの画面 > 一覧の列の名前"
"col.range","帯の範囲","Band range","時期ラベルの画面 > 一覧の列の名前（帯の表示のときだけ）"
"range","{{from}} 〜 {{to}}","{{from}} – {{to}}","時期ラベルの画面 > 帯の範囲の値（Time_Level の始まりと終わり）"
"delete","削除","Delete","時期ラベルの画面 > 行の × ボタンの説明"
"hint.band","Time_Level は時間軸上の位置（Box の Time_Level と同じ目盛り）です。帯の表示では、各時期の Time_Level を代表点として、区切りは隣り合う 2 つの時期の Time_Level のちょうど中間に引かれ、ラベルは区切りと区切りの真ん中に置かれます（両端は時間矢印の端）。そのため 1 つの値を変えると両側の区切りが動き、隣の時期の値を越えると順番が入れ替わります。区切りを置きたい位置の前後に、各時期の値を置いてください（範囲は右の列で確認できます）。","Time_Level is the position on the time axis (the same scale as a Box's Time_Level). In the band display, each period's Time_Level is its representative point: a divider is drawn exactly halfway between the Time_Levels of two neighboring periods, and the label is placed midway between its dividers (the outer ends are the ends of the time arrow). So changing one value moves the dividers on both sides, and passing a neighbor's value swaps their order. Place each period's value on either side of where you want a divider (check the ranges in the right column).","時期ラベルの画面 > 下の説明（帯の表示のとき）"
"hint.point","Time_Level は時間軸上の位置（Box の Time_Level と同じ目盛り）で、ラベルの中心がその位置に来ます。","Time_Level is the position on the time axis (the same scale as a Box's Time_Level); the label is centered on it.","時期ラベルの画面 > 下の説明（帯でない表示のとき）"
"hint.toggle","時期ラベルは「表示」タブの「時期」トグルで表示/非表示を切替できます。","Show or hide period labels with the Period toggle on the View tab.","時期ラベルの画面 > 下の説明（「表示」タブ・「時期」トグルはリボンの名前に合わせる）"
"hint.settings","位置の調整（基準・オフセット）は「設定」ダイアログから。","Adjust their position (anchor and offset) in the Settings dialog.","時期ラベルの画面 > 下の説明"
"close","閉じる","Close","時期ラベルの画面 > 閉じるボタン"
`,Gf=`\uFEFFkey,ja,en,note
"title","ダブルクリックで時期区分設定を開く","Double-click to open the Period settings","図の上の時期ラベルの説明（マウスを重ねたとき）"
`,jf=`\uFEFFkey,ja,en,note
error.notpptx,PowerPoint のファイルとして読めませんでした（ppt/presentation.xml がありません）,Could not read the file as PowerPoint (ppt/presentation.xml is missing),PowerPoint の取り込み > ファイルを開いたときのエラー
role.sdsglabel,SD/SG のラベル,SD/SG label,PowerPoint の取り込み > 図形の役割の名前（画面の表示は pptxImportDialog.csv 側）
role.sublabel,サブラベル（Box・SD/SG の下の文字）,Sublabel (text below a Box or SD/SG),PowerPoint の取り込み > 図形の役割の名前
role.line,Line（矢印）,Line (arrow),PowerPoint の取り込み > 図形の役割の名前
role.period,時期ラベル,Period label,PowerPoint の取り込み > 図形の役割の名前
role.note,メモ（付箋）,Note (sticky),PowerPoint の取り込み > 図形の役割の名前
role.timearrow,時間の矢印（取り込まない）,Time arrow (not imported),PowerPoint の取り込み > 図形の役割の名前
role.ignore,（無視）,(Ignore),PowerPoint の取り込み > 図形の役割の名前
reason.sep,・,"; ",PowerPoint の取り込み > 推測の理由を 2 つ以上つなぐ区切り
reason.typeprefix,本文の先頭の種別名,Type name at the start of the text,PowerPoint の取り込み > 図形の役割を推測した理由（Box の種別）
reason.double,二重線,Double outline,PowerPoint の取り込み > 推測の理由（Box の種別を等至点に）
reason.dotted,点線（潜在的な行為として）,Dotted outline (as potential action),PowerPoint の取り込み > 推測の理由（Box の種別）
reason.longarrow,横に長い矢印,Long horizontal arrow,PowerPoint の取り込み > 推測の理由（時間の矢印）
reason.longarrowline,横に長い矢印線（両端に Box が無い）,Long horizontal arrow line (no Box at either end),PowerPoint の取り込み > 推測の理由（時間の矢印）
reason.temername,TEMer の出力（図形の名前）,TEMer output (shape name),PowerPoint の取り込み > 推測の理由（SD/SG）
reason.arrowdown,下向きの矢印,Downward arrow,PowerPoint の取り込み > 推測の理由（SD）
reason.arrowup,上向きの矢印,Upward arrow,PowerPoint の取り込み > 推測の理由（SG）
reason.arrowleft,左向きの矢印（縦型の SD）,Leftward arrow (SD in a vertical diagram),PowerPoint の取り込み > 推測の理由（SD）
reason.arrowright,右向きの矢印（縦型の SG）,Rightward arrow (SG in a vertical diagram),PowerPoint の取り込み > 推測の理由（SG）
reason.arrowdiagonal,向きが斜め（SD と仮定）,Diagonal direction (assumed SD),PowerPoint の取り込み > 推測の理由（SD）
reason.onsdsg,SD/SG の図形に重なる文字,Text over an SD/SG shape,PowerPoint の取り込み > 推測の理由（SD/SG のラベル）
reason.table,表（背景の枠として）,Table (as a background frame),PowerPoint の取り込み > 推測の理由（無視）
reason.picture,画像,Image,PowerPoint の取り込み > 推測の理由（無視）
reason.dashedarrow,点線の矢印,Dashed arrow,PowerPoint の取り込み > 推測の理由（Line）
reason.solidarrow,実線の矢印,Solid arrow,PowerPoint の取り込み > 推測の理由（Line）
reason.nohead,矢じりの無い線（区切り線など）,Line without an arrowhead (e.g. a divider),PowerPoint の取り込み > 推測の理由（無視）
reason.notext,文字の無い図形,Shape without text,PowerPoint の取り込み > 推測の理由（無視）
reason.period,「第N期」で始まる,Starts with a period name (e.g. Phase N),PowerPoint の取り込み > 推測の理由（時期ラベル）
reason.timelabel,時間の矢印のラベル,Label of the time arrow,PowerPoint の取り込み > 推測の理由（無視）
reason.merged,重なっていた文字（{{count}} 個）を合流,Merged {{count}} overlapping texts,PowerPoint の取り込み > 推測の理由（Box）
reason.merged_one,重なっていた文字（{{count}} 個）を合流,Merged {{count}} overlapping text,件数が 1 のときの英語の形（日本語は使われない）
reason.framedtext,枠のある文字,Text in a frame,PowerPoint の取り込み > 推測の理由（Box）
reason.unframedtext,枠の無い文字,Text without a frame,PowerPoint の取り込み > 推測の理由（メモ）
reason.legend,凡例,Legend,PowerPoint の取り込み > 推測の理由（無視）
reason.sdsgbadge,SD/SG の種別バッジ,SD/SG type badge,PowerPoint の取り込み > 推測の理由（無視）
reason.badge,隣の種別バッジ,Adjacent type badge,PowerPoint の取り込み > 推測の理由（Box の種別）
reason.badgeself,種別バッジ（隣の Box の種別に反映）,Type badge (applied to the adjacent Box),PowerPoint の取り込み > 推測の理由（無視）
reason.sublabel,すぐ上の要素のサブラベル,Sublabel of the element just above,PowerPoint の取り込み > 推測の理由（サブラベル）
quote,「{{text}}」,“{{text}}”,PowerPoint の取り込み > 警告の中で図形の文字を囲むかぎ括弧
listsep,、,", ",PowerPoint の取り込み > 警告の中で図形の文字を並べる区切り
arrow.where,"矢印（{{x1}},{{y1}} → {{x2}},{{y2}} pt）","Arrow ({{x1}},{{y1}} → {{x2}},{{y2}} pt)",PowerPoint の取り込み > 警告の頭に付く矢印の位置
warn.skipped,位置を持たない図形（プレースホルダーなど）{{count}} 個は取り込めませんでした: {{list}},Could not import {{count}} shapes without a position (e.g. placeholders): {{list}},PowerPoint の取り込み > 警告
warn.skipped_one,位置を持たない図形（プレースホルダーなど）{{count}} 個は取り込めませんでした: {{list}},Could not import {{count}} shape without a position (e.g. a placeholder): {{list}},件数が 1 のときの英語の形（日本語は使われない）
warn.arrow.nostart,{{where}}: 始点の近くに Box が見つからないため取り込みませんでした,{{where}}: not imported (no Box near the start point),PowerPoint の取り込み > 警告（矢印）
warn.arrow.noend,{{where}}: 終点の近くに Box が見つからないため取り込みませんでした,{{where}}: not imported (no Box near the end point),PowerPoint の取り込み > 警告（矢印）
warn.arrow.samebox,{{where}}: 両端が同じ Box「{{label}}」になるため取り込みませんでした,{{where}}: not imported (both ends attach to the same Box “{{label}}”),PowerPoint の取り込み > 警告（矢印）
warn.arrow.duplicate,{{where}}: 「{{from}}」→「{{to}}」は既にあるため重複を省きました,{{where}}: duplicate skipped (“{{from}}” → “{{to}}” already exists),PowerPoint の取り込み > 警告（矢印）
warn.sdsglabel.unresolved,「{{text}}」: どの SD/SG のラベルか決まらないため使いませんでした,“{{text}}”: not used (could not tell which SD/SG it labels),PowerPoint の取り込み > 警告
warn.sdsg.nolabel,"{{type}}（{{x}},{{y}} pt）: ラベルになる文字が見つかりませんでした（空のまま取り込みます）","{{type}} ({{x}},{{y}} pt): no text found for the label (imported with an empty label)",PowerPoint の取り込み > 警告（SD/SG）
warn.sdsg.nobox,{{type}}「{{label}}」: 紐付ける Box が無いため取り込みませんでした,{{type}} “{{label}}”: not imported (no Box to attach to),PowerPoint の取り込み > 警告（SD/SG）
warn.sublabel.unresolved,「{{text}}」: どの Box・SD/SG のサブラベルか決まらないため使いませんでした,“{{text}}”: not used (could not tell which Box or SD/SG it belongs to),PowerPoint の取り込み > 警告
warn.nobox,Box が 1 つもありません。図形の役割を確認してください,No Boxes. Check the roles of the shapes.,PowerPoint の取り込み > 警告
warn.unlinked,矢印でつながっていない Box が {{count}} 個あります（元の図に矢印が無い場合は取り込み後に引いてください）,"{{count}} Boxes are not connected by arrows (if the original diagram has none, draw them after importing)",PowerPoint の取り込み > 警告
warn.unlinked_one,矢印でつながっていない Box が {{count}} 個あります（元の図に矢印が無い場合は取り込み後に引いてください）,"{{count}} Box is not connected by arrows (if the original diagram has none, draw them after importing)",件数が 1 のときの英語の形（日本語は使われない）
`,Vf=`\uFEFFkey,ja,en,note
title,PowerPoint の TEM 図から取り込み（{{step}} / 3）,Import a TEM diagram from PowerPoint ({{step}} / 3),PowerPoint から取り込みの画面の題
role.box,Box,Box,PowerPoint から取り込み > 図形の役割の選択肢
role.sd,SD,SD,PowerPoint から取り込み > 図形の役割の選択肢（Social direction の略号）
role.sg,SG,SG,PowerPoint から取り込み > 図形の役割の選択肢（Social guidance の略号）
role.sdsgLabel,SD/SG のラベル,SD/SG label,PowerPoint から取り込み > 図形の役割の選択肢
role.subLabel,サブラベル（Box・SD/SG の下の文字）,"Sublabel (text under a Box, SD or SG)",PowerPoint から取り込み > 図形の役割の選択肢
role.line,Line（矢印）,Line (arrow),PowerPoint から取り込み > 図形の役割の選択肢
role.period,時期ラベル,Period label,PowerPoint から取り込み > 図形の役割の選択肢
role.note,メモ（付箋）,Note (sticky note),PowerPoint から取り込み > 図形の役割の選択肢
role.timeArrow,時間の矢印（取り込まない）,Time arrow (not imported),PowerPoint から取り込み > 図形の役割の選択肢
role.ignore,（無視）,(Ignore),PowerPoint から取り込み > 図形の役割の選択肢
error.noSlides,スライドがありませんでした,The file has no slides,PowerPoint から取り込み > 読み込めなかったときの注意
reason.manual,手で変更,Changed by hand,PowerPoint から取り込み > 図形の上の吹き出し（役割を推測した理由）
error.importFailed,取り込みの途中で失敗しました: {{message}},Import failed partway: {{message}},PowerPoint から取り込み > 取り込めなかったときの注意
done.summary,"Box {{boxes}}、Line {{lines}}、SD/SG {{sdsg}}、時期ラベル {{periods}}、メモ {{notes}} を取り込みました","Imported {{boxes}} Boxes, {{lines}} Lines, {{sdsg}} SD/SG, {{periods}} period labels and {{notes}} notes",PowerPoint から取り込み > 取り込んだ後の知らせ
done.warnings,確認してほしいこと {{count}} 件:,{{count}} things to check:,PowerPoint から取り込み > 取り込んだ後の知らせ（警告の一覧の見出し）
done.warnings_one,確認してほしいこと {{count}} 件:,{{count}} thing to check:,件数が 1 のときの英語の形（日本語は使われない）
step1.heading,1. ファイルを選ぶ,1. Choose a file,PowerPoint から取り込み > 手順 1 の見出し
step1.hint,PowerPoint（.pptx）で描いた TEM 図。図形の見た目（枠・吹き出しの向き・矢印・文字）から Box や SD/SG を推測します。,"A TEM diagram drawn in PowerPoint (.pptx). Boxes and SD/SG are guessed from how the shapes look (outline, callout direction, arrows, text).",PowerPoint から取り込み > 手順 1 の説明
step1.drop,ここに .pptx をドロップ、またはクリックして選択,"Drop a .pptx here, or click to choose one",PowerPoint から取り込み > ファイルを落とす枠
step2.heading,2. 図形の役割を確かめる,2. Check the role of each shape,PowerPoint から取り込み > 手順 2 の見出し
step2.hint,{{filename}}・スライド {{slide}}（図形 {{shapes}} 個）。見た目から推測した役割が入っています。違うものは右の一覧で直してください。縮図の図形にマウスを乗せると一覧の行が、行に乗せると縮図の図形が強調されます。,"{{filename}}, slide {{slide}} ({{shapes}} shapes). Roles are guessed from how the shapes look. Fix any wrong ones in the list on the right. Hovering a shape in the preview highlights its row, and hovering a row highlights the shape.",PowerPoint から取り込み > 手順 2 の説明
step2.slide,スライド,Slide,PowerPoint から取り込み > スライドの選択のラベル
step2.slideOption,スライド {{index}}（図形 {{shapes}}）,Slide {{index}} ({{shapes}} shapes),PowerPoint から取り込み > スライドの選択肢
step2.showIgnored,無視する図形も表示,Show ignored shapes,PowerPoint から取り込み > チェックボックス
col.shape,図形,Shape,PowerPoint から取り込み > 図形の一覧の列名
col.role,役割,Role,PowerPoint から取り込み > 図形の一覧の列名
col.detail,詳細,Details,PowerPoint から取り込み > 図形の一覧の列名
shape.tooltip,（{{kind}}・推測: {{reason}}）,"({{kind}}, guessed: {{reason}})",PowerPoint から取り込み > 図形の名前の吹き出し（図形の形と推測の理由）
shape.noText,（{{kind}}）,({{kind}}),PowerPoint から取り込み > 文字の無い図形の表示（図形の形）
line.RLine,実線（実際の径路）,Solid (realized path),PowerPoint から取り込み > 矢印の種類の選択肢
line.XLine,点線（想定される径路）,Dashed (unrealized path),PowerPoint から取り込み > 矢印の種類の選択肢
notSelected,（未選択）,(Not selected),PowerPoint から取り込み > ラベルの持ち主の選択肢
owner.position,"{{role}}（{{x}},{{y}}）","{{role}} ({{x}}, {{y}})",PowerPoint から取り込み > ラベルの持ち主の選択肢（SD/SG と位置）
step3.heading,3. 取り込む内容を確かめる,3. Review what will be imported,PowerPoint から取り込み > 手順 3 の見出し
sep,・,", ",PowerPoint から取り込み > 件数の並びの区切り
count.periodLabels,時期ラベル,Period labels,PowerPoint から取り込み > 件数の並び
count.notes,メモ,Notes,PowerPoint から取り込み > 件数の並び
step3.scale,大きさ（1pt あたりの px）,Scale (px per 1 pt),PowerPoint から取り込み > 設定のラベル
step3.scale.tip,PowerPoint の 1pt を何 px にするか。大きいほど図が広がり、文字に余裕ができます,How many px one PowerPoint pt becomes. Larger values spread the diagram out and give text more room.,PowerPoint から取り込み > 設定の吹き出し
step3.smallToDescription,小さい文字は Box の説明へ,Small text goes to the Box description,PowerPoint から取り込み > 設定のラベル
step3.smallToDescription.tip,Box の中で本文より小さい文字（コード名など）を、ラベルでなく Box の説明に入れる,"Put text smaller than the main text inside a Box (such as code names) into the Box description, not the label",PowerPoint から取り込み > 設定の吹き出し
step3.keepFontSize,元の文字サイズを保つ,Keep the original font size,PowerPoint から取り込み > 設定のラベル
step3.toNewSheet,新しいシートに取り込む,Import into a new sheet,PowerPoint から取り込み > 設定のラベル
step3.verticalWarning,いまの図は縦型です。PowerPoint の配置（横型）のまま取り込むので、取り込み後に向きを確かめてください。,"The current diagram is vertical. The PowerPoint layout (horizontal) is imported as is, so check the orientation after importing.",PowerPoint から取り込み > 縦型の図のときの注意
step3.warnings,確認してほしいこと（{{count}} 件）,Things to check ({{count}}),PowerPoint から取り込み > 警告の一覧の見出し
step3.links,推定した矢印と SD/SG の紐付け,Guessed arrows and SD/SG attachments,PowerPoint から取り込み > 見出し
noLabel,（ラベルなし）,(No label),PowerPoint から取り込み > ラベルの無い SD/SG の表示
back,戻る,Back,PowerPoint から取り込み > ボタン
cancel,キャンセル,Cancel,PowerPoint から取り込み > ボタン
next,次へ,Next,PowerPoint から取り込み > ボタン
import,取り込む,Import,PowerPoint から取り込み > ボタン
`,Wf=`\uFEFFkey,ja,en,note
"title","TEMer 印刷の準備中","TEMer: preparing to print","印刷のウィンドウ > 準備中のタブの題"
"preparing","印刷の準備をしています…","Preparing to print...","印刷のウィンドウ > 準備中の本文"
`,Uf=`\uFEFFkey,ja,en,note
"progress.capturingPreview","プレビューをキャプチャ中...","Capturing preview...","印刷の準備中の表示"
"progress.cropping","ページ {{n}} / {{total}} をクロップ中","Cropping page {{n}} of {{total}}","印刷の準備中の表示（n は何ページ目か）"
"progress.openWindow","印刷ウィンドウを開きます","Opening the print window","印刷の準備中の表示"
"window.title","TEMer 印刷プレビュー ({{n}} ページ)","TEMer print preview ({{n}} pages)","印刷のウィンドウ > タブの題（n はページ数）"
"window.instructions","印刷ダイアログで「用紙サイズ」「向き」がこの用紙に合っているか確認してください。","In the print dialog, check that the paper size and orientation match this paper.","印刷のウィンドウ > 上の案内（縦の用紙）"
"window.instructionsLandscape","印刷ダイアログで「用紙サイズ」「向き」がこの用紙に合っているか確認してください。Safari は向きを自動で合わせないので「横」を選んでください。","In the print dialog, check that the paper size and orientation match this paper. Safari does not set the orientation automatically, so choose Landscape.","印刷のウィンドウ > 上の案内（横の用紙）"
"window.closeHint","ダイアログを閉じたらこのウィンドウも閉じて構いません。","You can close this window after closing the dialog.","印刷のウィンドウ > 上の案内の 2 行目"
"error.popupBlocked","ポップアップがブロックされました。ブラウザのポップアップブロックを解除してください。","The pop-up was blocked. Allow pop-ups for this site in your browser.","印刷 > 印刷のウィンドウを開けなかったときの警告"
`,Hf=`\uFEFFkey,ja,en,note
"panel.show","プロパティを表示","Show properties","プロパティの欄を畳んだときの縦の帯の説明（マウスを乗せると出る）"
"panel.title","プロパティ","Properties","プロパティの欄の見出し"
"panel.resize","幅を調整","Resize","プロパティの欄の左端（幅を変えるつまみ）の説明"
"panel.minimize","最小化","Minimize","プロパティの欄の × ボタンの説明"
"legend.hint","キャンバス上でドラッグ、または下の数値で位置調整。詳細は「詳細設定」から。","Drag it on the canvas or set the position below. More options are in Advanced settings.","プロパティ > 凡例を選んだときの説明"
"legend.includeInExport","エクスポートに含める","Include in export","プロパティ > 凡例の欄の名前"
"legend.showTitle","タイトル表示","Show title","プロパティ > 凡例の欄の名前"
"legend.title","タイトル","Title","プロパティ > 凡例の欄の名前（凡例の題）"
"common.positionXY","位置 X / Y","Position X / Y","プロパティ > 凡例・SD/SG のサブラベルの欄の名前"
"legend.byColumns","列数で指定","By columns","プロパティ > 凡例の指定方式の選択肢"
"legend.byRows","行数で指定","By rows","プロパティ > 凡例の指定方式の選択肢"
"legend.rows","行数","Rows","プロパティ > 凡例の欄の名前（行の数）"
"legend.columns","列数","Columns","プロパティ > 凡例の欄の名前（列の数）"
"legend.showDescriptions","説明文を表示","Show descriptions","プロパティ > 凡例の欄の名前"
"legend.showDescriptions.tooltip","各項目の説明文を横に並べる（幅が増える）","Show each item's description beside it (makes the legend wider)","「説明文を表示」の説明（マウスを乗せると出る）"
"legend.advanced.tooltip","背景色 / 枠線 / フォント / 項目別ラベル上書き 等の詳細設定","Background, border, font, per-item label overrides, and more","「詳細設定...」ボタンの説明"
"legend.advanced","詳細設定...","Advanced settings...","プロパティ > 凡例のボタン（凡例の設定画面を開く）"
"empty.message","図形を選択するとプロパティが表示されます","Select a shape to see its properties","プロパティの欄（何も選んでいないとき）"
"empty.tip","Tip: キャンバスで Box や Line をクリック（Shift+クリックで追加選択）","Tip: Click a Box or Line on the canvas (Shift+click to add to the selection)","プロパティの欄（何も選んでいないとき）のヒント"
"common.label","ラベル","Label","プロパティ > Box・SD/SG のタブの名前と欄の名前（図に出す文字）"
"common.type","種別","Type","プロパティ > Box・SD/SG の基本タブの欄の名前"
"tab.basic","基本","Basic","プロパティ > Box・SD/SG・Line のタブの名前"
"tab.typeLabel","タイプラベル","Type label","プロパティ > Box・SD/SG のタブの名前（種別のバッジ）"
"tab.subLabel","サブラベル","Sub-label","プロパティ > Box・SD/SG のタブの名前・欄の名前"
"tab.autoFit","自動調整","Auto fit","プロパティ > Box・SD/SG のタブの名前"
"tab.endpoint","端点","Endpoints","プロパティ > Line のタブの名前"
"tab.info","詳細","Details","プロパティ > Line のタブの名前"
"common.none","なし","None","選択肢（指定しない）"
"common.widthPx","幅 (px)","Width (px)","プロパティ > Box・SD/SG の欄の名前"
"common.heightPx","高さ (px)","Height (px)","プロパティ > Box・SD/SG の欄の名前"
"common.idBadge","IDバッジ","ID badge","プロパティ > Box・Line の折りたたみの見出し（ID の小さな札）"
"common.fontSize","フォントサイズ","Font size","プロパティの欄の名前"
"common.offsetTimeItem","位置調整 Time / Item (px)","Offset Time / Item (px)","プロパティの欄の名前（時間軸・項目軸方向のずらし）"
"common.offsetTime.tooltip","時間軸方向のオフセット (レイアウト切替に追従)","Offset along the time axis (follows layout changes)","位置調整の左の入力欄の説明"
"common.offsetItem.tooltip","項目軸方向のオフセット","Offset along the item axis","位置調整の右の入力欄の説明"
"common.textColor","文字色","Text color","プロパティの色の欄の名前"
"common.bgColor","背景色","Background color","プロパティの色の欄の名前"
"common.borderColor","枠線色","Border color","プロパティの色の欄の名前"
"color.default222","既定 (#222)","Default (#222)","色選びの小窓の「既定に戻す」ボタン"
"color.default333","既定 (#333)","Default (#333)","色選びの小窓の「既定に戻す」ボタン"
"color.default555","既定 (#555)","Default (#555)","色選びの小窓の「既定に戻す」ボタン"
"color.defaultWhite","既定 (白)","Default (white)","色選びの小窓の「既定に戻す」ボタン"
"color.defaultTransparent","既定 (透明)","Default (transparent)","色選びの小窓の「既定に戻す」ボタン"
"color.defaultNoBorder","既定 (枠なし)","Default (no border)","色選びの小窓の「既定に戻す」ボタン（枠線色）"
"color.defaultTranslucentWhite","既定 (白半透明)","Default (translucent white)","色選びの小窓の「既定に戻す」ボタン"
"common.numbered","連番表記","Numbering","プロパティ > タイプラベルタブの欄の名前"
"common.sameAsBox","（Box本体と同じ）","(Same as Box)","タイプラベル・サブラベルのフォントなどの選択肢（Box の本文の設定を使う）"
"ascii.upright","縦向き","Upright","縦書きのときの半角英数の向きの選択肢"
"ascii.rotated","横倒し","Rotated","縦書きのときの半角英数の向きの選択肢"
"ascii.upright.stacked","縦向き（上下に積む）","Upright (stacked)","縦書きのときの半角英数の向きの選択肢（Box のラベル）"
"ascii.upright.stacked2","縦向き（上下積み）","Upright (stacked)","縦書きのときの半角英数の向きの選択肢（サブラベル）"
"ascii.rotated.traditional","横倒し（伝統的）","Rotated (traditional)","縦書きのときの半角英数の向きの選択肢"
"common.borderWidthPx","枠線太さ (px)","Border width (px)","プロパティ > タイプラベル・サブラベルタブの欄の名前"
"common.borderWidth.tooltip","0 = 枠線なし","0 = no border","枠線太さの入力欄の説明"
"match.width","幅揃え","Match width","複数選んだときの自動調整タブのボタン"
"match.height","高さ揃え","Match height","複数選んだときの自動調整タブのボタン"
"match.size","サイズ揃え","Match size","複数選んだときの自動調整タブのボタン"
"match.fontSize","文字サイズ揃え","Match font size","複数選んだときの自動調整タブのボタン"
"common.paperReport","論文レポート用","For the paper report","プロパティ > Box・Line の節の見出し（論文用レポートに出す説明）"
"common.description","説明文","Description","プロパティ > 論文レポート用の欄の名前"
"common.noDescriptionNeeded","説明不要（自明）","No description needed (self-evident)","プロパティ > 論文レポート用の欄の名前"
"common.delete","削除","Delete","プロパティの欄の下の削除ボタン"
"common.auto","自動","Auto","SD/SG の帯内 Row の入力欄の薄い文字・ボタン"
"box.renameId.prompt","新しいIDを入力","Enter a new ID","Box の ID 変更ボタンを押したときの入力の問い"
"box.renameId.failed","IDの変更に失敗しました（重複または無効なID）","Could not change the ID (duplicate or invalid ID)","Box の ID 変更に失敗したときの知らせ"
"box.renameId","ID変更","Change ID","プロパティ > Box の基本タブの ✎ ボタンの説明"
"box.group.tooltip","ほかの Box をまとめて囲む大きな枠にする（例: 複数の具体的な中身をまとめた P-EFP）。常に背面に描き、枠を動かすと中の Box も一緒に動く。オンにすると文字を横書き・上寄せ（見出し）にする","Make this a large frame that encloses other Boxes (e.g., a P-EFP that groups several concrete items). It is always drawn behind, and the Boxes inside move with it. When on, the text becomes horizontal and top-aligned (as a heading)","「まとめ枠」の説明（マウスを乗せると出る）"
"box.group","まとめ枠","Group frame","プロパティ > Box の基本タブの欄の名前（ほかの Box を囲む枠）"
"box.secondaryType","併記する種別","Secondary type","プロパティ > Box の基本タブの欄の名前（主の種別に加えるもう 1 つの種別）"
"box.secondaryType.tooltip","主種別が枠線の見た目を決め、併記種別は種別ラベルと凡例に追加されます（例: BFP-2 / OPP-1）","The primary type sets the border style; the secondary type is added to the type label and the legend (e.g., BFP-2 / OPP-1)","「併記する種別」の説明"
"box.customTypeLabel","種別ラベル（自由記入）","Type label (free text)","プロパティ > Box の基本タブ（種別「その他」のとき）の欄の名前"
"box.customTypeLabel.placeholder","例: TLMG、促進的記号…","e.g., TLMG, promoter sign…","「種別ラベル（自由記入）」の入力欄の薄い文字"
"box.customTypeLabel.tooltip","空欄なら種別ラベルは表示されません。凡例には入力したラベルで出ます","If empty, no type label is shown. The legend uses the label you enter","「種別ラベル（自由記入）」の説明"
"box.customTypeNumbered","同名の Box に連番を振る","Number Boxes with the same label","プロパティ > Box の基本タブ（種別「その他」のとき）の欄の名前"
"box.position","位置（Time / Item Level）","Position (Time / Item level)","プロパティ > Box の基本タブの欄の名前"
"box.textOrientation","テキスト方向","Text direction","プロパティ > Box のラベルタブの欄の名前"
"box.textOrientation.horizontal","横書き","Horizontal","テキスト方向の選択肢"
"box.textOrientation.vertical","縦書き","Vertical","テキスト方向の選択肢"
"box.asciiUpright","半角英数の向き（縦書き時）","Latin characters (vertical text)","プロパティ > Box のラベルタブの欄の名前（縦書きのときの半角英数の向き）"
"box.numbered.tooltip","OFF にすると種別名のみ表示（例: OPP-1 → OPP）","When off, only the type name is shown (e.g., OPP-1 → OPP)","「連番表記」の説明"
"box.typeLabel.ascii","半角英数向き（縦型）","Latin characters (vertical layout)","プロパティ > Box のタイプラベルタブの欄の名前"
"box.subLabel.ascii","半角英数の向き（縦型）","Latin characters (vertical layout)","プロパティ > Box のサブラベルタブの欄の名前"
"box.subLabel","サブラベル（協力者ID等）","Sub-label (e.g., participant ID)","プロパティ > Box のサブラベルタブの欄の名前"
"box.subLabel.placeholder","例: Aさん","e.g., Participant A","サブラベルの入力欄の薄い文字"
"box.autoFitText","文字サイズを自動調整","Auto-fit text size","プロパティ > Box の自動調整タブの欄の名前"
"box.autoFitText.tooltip","Box に収まる最大サイズへ文字を縮小・拡大","Shrink or enlarge the text to the largest size that fits the Box","「文字サイズを自動調整」の説明"
"box.autoFitBoxMode","Box 自動拡張モード","Box auto-resize mode","プロパティ > Box の自動調整タブの欄の名前"
"box.autoFitBoxMode.inherit","（全体既定に従う）","(Use document default)","Box 自動拡張モードの選択肢"
"box.autoFitBoxMode.none","自動拡張なし","No auto-resize","Box 自動拡張モードの選択肢"
"box.autoFitBoxMode.widthFixed","横幅固定で高さ自動","Fixed width, auto height","Box 自動拡張モードの選択肢"
"box.autoFitBoxMode.heightFixed","高さ固定で横幅自動","Fixed height, auto width","Box 自動拡張モードの選択肢"
"box.autoFit.hint","文字サイズ自動調整が ON のとき自動拡張モードは停止します（同時有効不可）","Auto-resize is paused while auto-fit text size is on (they cannot be used together)","プロパティ > Box の自動調整タブの説明"
"box.fitToLabel.tooltip","現在のラベル文字数に合わせて Box サイズを最小化","Shrink the Box to fit the current label","「Box を文字に合わせる」ボタンの説明"
"box.fitToLabel","Box を文字に合わせる","Fit Box to text","プロパティ > Box の自動調整タブのボタン"
"box.fitTextToBox.tooltip","Box のサイズに合わせて文字サイズを自動調整（1 回適用）","Adjust the text size to fit the Box (applied once)","「文字を Box に合わせる」ボタンの説明"
"box.fitTextToBox","文字を Box に合わせる","Fit text to Box","プロパティ > Box の自動調整タブのボタン"
"box.description.placeholder","この Box の意味・解釈（論文レポートに出力）","Meaning or interpretation of this Box (included in the paper report)","Box の説明文の入力欄の薄い文字"
"sdsg.band.top.h","上部 (SD) に配置","Place at top (SD)","SD/SG の帯位置の選択肢（横型の図）"
"sdsg.band.top.v","右側 (SD) に配置","Place at right (SD)","SD/SG の帯位置の選択肢（縦型の図）"
"sdsg.band.bottom.h","下部 (SG) に配置","Place at bottom (SG)","SD/SG の帯位置の選択肢（横型の図）"
"sdsg.band.bottom.v","左側 (SG) に配置","Place at left (SG)","SD/SG の帯位置の選択肢（縦型の図）"
"sdsg.spaceMode.confirm","配置モードを変更すると、時間/項目オフセットと帯内 Inset がリセットされます。よろしいですか?","Changing the placement mode resets the time/item offsets and the in-band inset. Continue?","SD/SG の配置方式を変えるときの確認の文"
"sdsg.type.SD","SD (社会的方向づけ)","SD (Social direction)","プロパティ > SD/SG の種別の選択肢"
"sdsg.type.SG","SG (社会的助勢)","SG (Social guidance)","プロパティ > SD/SG の種別の選択肢"
"sdsg.attachedTo","紐付け対象 (attachedTo)","Attached to (attachedTo)","プロパティ > SD/SG の基本タブの欄の名前"
"sdsg.attachedTo2","2 つ目の対象 (attachedTo2)","Second target (attachedTo2)","プロパティ > SD/SG の基本タブの欄の名前"
"sdsg.attachedTo2.tooltip","値を選ぶと between モードになります。空（未指定）に戻すと single モードに戻ります","Selecting a value switches to between mode. Clearing it returns to single mode","「2 つ目の対象」の説明"
"sdsg.attachedTo2.none","（未指定 / single モード）","(None / single mode)","「2 つ目の対象」の選択肢（指定しない）"
"sdsg.betweenMode","幅の定義","Width definition","プロパティ > SD/SG の基本タブの欄の名前（2 つの対象の間の幅の測り方）"
"sdsg.betweenMode.edge","Box 外辺から外辺まで（Time 軸両端を覆う）","Outer edge to outer edge (covers both ends on the time axis)","幅の定義の選択肢"
"sdsg.betweenMode.center","Box 中心から Box 中心まで","Box center to Box center","幅の定義の選択肢"
"sdsg.influence","幅で示して複数 Box に影響（案 X）","Show as width and affect multiple Boxes (option X)","プロパティ > SD/SG の折りたたみの見出し"
"sdsg.influence.hint","本体を四角形にし、影響先の各 Box へ太い矢印を 1 本ずつ引きます。矢印は SD/SG の枠から Box の枠まで。","Draws the body as a rectangle with one thick arrow to each affected Box, from the SD/SG border to the Box border.","「幅で示して複数 Box に影響」の説明"
"sdsg.shape","本体の形","Body shape","プロパティ > SD/SG の欄の名前"
"sdsg.shape.pentagon","五角形（ホームベース型）","Pentagon (home plate)","本体の形の選択肢"
"sdsg.shape.rect","四角形（幅で示す）","Rectangle (shows width)","本体の形の選択肢"
"sdsg.influenceTargets","影響先の Box","Affected Boxes","プロパティ > SD/SG の欄の名前（矢印を引く先の Box の一覧）"
"sdsg.influenceStrokeWidth","矢印の太さ (px)","Arrow width (px)","プロパティ > SD/SG の欄の名前"
"sdsg.spaceMode","配置方式","Placement","プロパティ > SD/SG の基本タブの欄の名前"
"sdsg.spaceMode.attached","attached（Box に追従）","attached (follows the Box)","配置方式の選択肢"
"sdsg.spaceMode.band","band（専用帯に配置）","band (in a dedicated band)","配置方式の選択肢"
"sdsg.bandPosition","帯位置","Band position","プロパティ > SD/SG の基本タブの欄の名前"
"sdsg.bandDisabled","⚠ SD/SG 配置機能が OFF です。band モード変更時に自動で ON になります。","⚠ SD/SG placement is off. It turns on automatically when you switch to band mode.","プロパティ > SD/SG の黄色い注意"
"sdsg.outOfRange.hint","row 数が帯の高さを超えています。以下のいずれかで解消:","The rows exceed the band height. Fix it with one of the following:","SD/SG が帯からはみ出したときの赤い注意の 2 行目"
"sdsg.fix.expand.tooltip","帯を縦方向に自動拡張 (manual heightMode に切替 + autoExpandHeight ON)","Expand the band automatically (switches to manual heightMode + autoExpandHeight on)","「帯を拡張」ボタンの説明"
"sdsg.fix.expand","帯を拡張","Expand band","SD/SG がはみ出したときの直し方のボタン"
"sdsg.fix.shrink.tooltip","SDSG を row span に合わせて自動圧縮 (shrinkToFitRow ON)","Shrink the SDSG to fit the row span (shrinkToFitRow on)","「SDSG を圧縮」ボタンの説明"
"sdsg.fix.shrink","SDSG を圧縮","Shrink SDSG","SD/SG がはみ出したときの直し方のボタン"
"sdsg.fix.rowInward.tooltip","選択中 SDSG の row を 1 つ内側 (Box 寄り) へ","Move the selected SDSG one row inward (toward the Boxes)","「row を内側へ」ボタンの説明"
"sdsg.fix.rowInward","row を内側へ","Row inward","SD/SG がはみ出したときの直し方のボタン"
"sdsg.bandDetail","帯モード詳細","Band mode details","プロパティ > SD/SG の折りたたみの見出し"
"sdsg.bandRow","帯内 Row 指定","Row in band","プロパティ > SD/SG の帯モード詳細の欄の名前"
"sdsg.bandRow.tooltip","帯内で割り当てる row を手動指定（0=最内側 Box 群寄り、大きいほど外側）。空欄で自動整列","Set the row in the band manually (0 = innermost, near the Boxes; larger = farther out). Leave empty to arrange automatically","「帯内 Row 指定」の入力欄の説明"
"sdsg.bandRow.up.tooltip","row を 1 つ内側（Box 群寄り）へ","Move one row inward (toward the Boxes)","帯内 Row の ↑ ボタンの説明"
"sdsg.bandRow.down.tooltip","row を 1 つ外側へ","Move one row outward","帯内 Row の ↓ ボタンの説明"
"sdsg.bandRow.auto.tooltip","自動整列に戻す","Back to automatic arrangement","帯内 Row の「自動」ボタンの説明"
"sdsg.bandInsetTime","帯内 Time オフセット (px)","Time offset in band (px)","プロパティ > SD/SG の帯モード詳細の欄の名前"
"sdsg.bandInsetItem","帯内 Item オフセット (px)","Item offset in band (px)","プロパティ > SD/SG の帯モード詳細の欄の名前"
"sdsg.spaceWidth.time","幅 (時間軸, px)","Width (time axis, px)","プロパティ > SD/SG の帯モード詳細の欄の名前（横型の図）"
"sdsg.spaceWidth.item","幅 (アイテム軸, px)","Width (item axis, px)","プロパティ > SD/SG の帯モード詳細の欄の名前（縦型の図）"
"sdsg.spaceHeight.item","高さ (アイテム軸, px)","Height (item axis, px)","プロパティ > SD/SG の帯モード詳細の欄の名前（横型の図）"
"sdsg.spaceHeight.time","高さ (時間軸, px)","Height (time axis, px)","プロパティ > SD/SG の帯モード詳細の欄の名前（縦型の図）"
"sdsg.spaceWidth.time.tooltip","時間軸方向の SDSG 幅。attached Box の幅に制約されないので、前後 Box を跨いで広げられる","SDSG width along the time axis. It is not limited by the attached Box's width, so it can extend across neighboring Boxes","帯モードの幅の入力欄の説明（横型の図）"
"sdsg.spaceWidth.item.tooltip","アイテム軸方向の SDSG 幅。row span が自動クランプする場合があります (shrinkToFitRow)","SDSG width along the item axis. It may be clamped to the row span automatically (shrinkToFitRow)","帯モードの幅の入力欄の説明（縦型の図）"
"sdsg.spaceHeight.item.tooltip","アイテム軸方向の SDSG 高さ。row span が自動クランプする場合があります (shrinkToFitRow)","SDSG height along the item axis. It may be clamped to the row span automatically (shrinkToFitRow)","帯モードの高さの入力欄の説明（横型の図）"
"sdsg.spaceHeight.time.tooltip","時間軸方向の SDSG 高さ。attached Box の高さに制約されないので、前後 Box を跨いで広げられる","SDSG height along the time axis. It is not limited by the attached Box's height, so it can extend across neighboring Boxes","帯モードの高さの入力欄の説明（縦型の図）"
"sdsg.spaceSize.hint.h","幅=時間軸方向、高さ=アイテム軸方向。attached Box の幅を超える値を設定すれば、前後 Box を跨いだ帯内 SDSG も可能。","Width = time axis, height = item axis. A value larger than the attached Box's width makes an in-band SDSG that spans neighboring Boxes.","プロパティ > SD/SG の帯モード詳細の説明（横型の図）"
"sdsg.spaceSize.hint.v","幅=アイテム軸方向、高さ=時間軸方向。attached Box の高さを超える値を設定すれば、前後 Box を跨いだ帯内 SDSG も可能。","Width = item axis, height = time axis. A value larger than the attached Box's height makes an in-band SDSG that spans neighboring Boxes.","プロパティ > SD/SG の帯モード詳細の説明（縦型の図）"
"sdsg.attachedDetail","attached モード詳細","Attached mode details","プロパティ > SD/SG の折りたたみの見出し"
"sdsg.timeOffset","時間オフセット (px)","Time offset (px)","プロパティ > SD/SG の attached モード詳細の欄の名前"
"sdsg.itemOffset","項目オフセット (px)","Item offset (px)","プロパティ > SD/SG の attached モード詳細の欄の名前"
"sdsg.betweenSize.reason","between モードでは時間軸方向のサイズが 2 Box 間のスパンから自動計算されます","In between mode, the size along the time axis is computed from the span between the 2 Boxes","SD/SG の幅・高さが効かないときの説明"
"sdsg.rectRatio","矩形部分の比率","Rectangle ratio","プロパティ > SD/SG の基本タブの欄の名前（五角形の四角い部分の割合）"
"sdsg.idFontSize","IDバッジ フォントサイズ","ID badge font size","プロパティ > SD/SG の欄の名前"
"sdsg.idOffset","IDバッジ位置調整 Time / Item (px)","ID badge offset Time / Item (px)","プロパティ > SD/SG の欄の名前"
"sdsg.label.tooltip","改行できます（キャンバスのダブルクリック編集と同じ）","Line breaks are allowed (same as double-click editing on the canvas)","SD/SG のラベルの入力欄の説明"
"sdsg.fontFamily.uiDefault","（UI 既定）","(UI default)","SD/SG のフォントの選択肢（画面の既定を使う）"
"sdsg.labelArea","配置領域","Label area","プロパティ > SD/SG のラベルタブの欄の名前"
"sdsg.labelArea.tooltip","ラベルを配置する領域。pentagon=五角形全体（既定） / rect=矩形部分のみ","Area where the label is placed. pentagon = whole pentagon (default) / rect = rectangle part only","「配置領域」の説明"
"sdsg.labelArea.pentagon","五角形全体","Whole pentagon","配置領域の選択肢"
"sdsg.labelArea.rect","矩形部分のみ","Rectangle part only","配置領域の選択肢"
"sdsg.labelOffsetTime.tooltip","時間軸方向のラベル位置オフセット (+ で時間が進む方向、− で戻る方向)。レイアウト切替に追従。中央揃え時は視覚補正済","Label offset along the time axis (+ forward in time, − backward). Follows layout changes. Visually corrected when centered","SD/SG のラベルの位置調整の左の入力欄の説明"
"sdsg.labelOffsetItem.tooltip","項目軸方向のラベル位置オフセット。レイアウト切替に追従","Label offset along the item axis. Follows layout changes","SD/SG のラベルの位置調整の右の入力欄の説明"
"sdsg.asciiUpright","ASCII縦向き（縦型レイアウト）","Upright ASCII (vertical layout)","プロパティ > SD/SG の欄の名前"
"sdsg.typeLabel.hint","SD/SG 種別を表すバッジの装飾です。連番表記を ON にすると複数のとき自動で連番化（SD1, SD2, …）。","Style of the badge that shows the SD/SG type. With numbering on, multiple items are numbered automatically (SD1, SD2, …).","プロパティ > SD/SG のタイプラベルタブの説明"
"sdsg.numbered.tooltip","OFF にすると SD / SG のみ表示（連番を付けない）","When off, only SD / SG is shown (no numbers)","SD/SG の「連番表記」の説明"
"sdsg.sameAsBody","（本文と同じ）","(Same as body text)","SD/SG のタイプラベルのフォントの選択肢"
"sdsg.autoFit.singleHint","複数の SD/SG を選択すると「幅揃え」「高さ揃え」「サイズ揃え」「文字サイズ揃え」のバッチ操作が行えます。","Select multiple SD/SG to use the batch operations Match width, Match height, Match size, and Match font size.","プロパティ > SD/SG の自動調整タブの説明（1 つだけ選んだとき）"
"line.type","線種","Line type","プロパティ > Line の基本タブの欄の名前"
"line.type.RLine","実線（実現径路）","Solid (realized path)","線種の選択肢"
"line.type.XLine","点線（未実現径路）","Dashed (unrealized path)","線種の選択肢"
"line.shape","形状","Shape","プロパティ > Line の基本タブの欄の名前"
"line.shape.straight","直線","Straight","形状の選択肢"
"line.shape.elbow","L字接続","Elbow","形状の選択肢"
"line.shape.curve","曲線","Curve","形状の選択肢"
"line.elbowBendRatio","L字 中継位置 (0〜1)","Elbow bend position (0–1)","プロパティ > Line の基本タブの欄の名前"
"line.elbowBendRatio.tooltip","折れ位置の比率。0 = from 寄り / 0.5 = 中央 / 1 = to 寄り","Bend position ratio. 0 = near from / 0.5 = center / 1 = near to","「L字 中継位置」の説明"
"line.curveIntensity","曲率 (0〜1)","Curvature (0–1)","プロパティ > Line の基本タブの欄の名前"
"line.curveIntensity.tooltip","0=ほぼ直線、0.5=標準、1=大きく膨らむ。制御点を手動設定中は無効","0 = almost straight, 0.5 = standard, 1 = strongly curved. Disabled while control points are set manually","「曲率」の説明"
"line.controlPoints","制御点","Control points","プロパティ > Line の基本タブの欄の名前"
"line.controlPoints.manual","手動設定中（Canvas のハンドルでドラッグ編集可）","Manual (drag the handles on the canvas)","制御点の状態"
"line.controlPoints.auto","自動（曲率から算出）","Automatic (from curvature)","制御点の状態"
"line.controlPoints.reset.tooltip","制御点の手動設定を解除して曲率計算に戻す","Clear the manual control points and go back to curvature","「自動に戻す」ボタンの説明"
"line.controlPoints.reset","自動に戻す","Reset to automatic","プロパティ > Line の制御点のボタン"
"line.color","線の色","Line color","プロパティ > Line の基本タブの欄の名前"
"line.strokeWidth","線の太さ (px)","Line width (px)","プロパティ > Line の基本タブの欄の名前"
"line.angleMode","角度モード","Angle mode","プロパティ > Line の端点タブの折りたたみの見出しと欄の名前"
"line.angleMode.disabled","L字 / 曲線形状中は角度モードは無効です。","Angle mode is disabled for elbow and curved lines.","プロパティ > Line の端点タブの説明"
"line.angleDeg","角度 (°)","Angle (°)","プロパティ > Line の端点タブの欄の名前"
"line.angleDeg.tooltip","-85〜85°。時間軸方向 0° を基準、正で視覚的に上（横型）/右（縦型）に傾く","-85 to 85°. 0° is along the time axis; positive values tilt up (horizontal layout) / right (vertical layout)","「角度」の説明"
"line.offsets","始点・終点オフセット","Start and end offsets","プロパティ > Line の端点タブの折りたたみの見出し"
"line.offsets.angleHint","角度モード中はオフセットで端点を調整。マージン（方向沿い）は無効。","In angle mode, adjust the endpoints with the offsets. Margins (along the direction) are disabled.","プロパティ > Line の端点タブの説明"
"line.startOffset","始点 Time / Item (px)","Start Time / Item (px)","プロパティ > Line の端点タブの欄の名前"
"line.endOffset","終点 Time / Item (px)","End Time / Item (px)","プロパティ > Line の端点タブの欄の名前"
"line.startMargin","始点マージン (方向沿い px)","Start margin (along direction, px)","プロパティ > Line の端点タブの欄の名前"
"line.endMargin","終点マージン (方向沿い px)","End margin (along direction, px)","プロパティ > Line の端点タブの欄の名前"
"line.parallel","並列位置","Parallel position","プロパティ > Line の詳細タブの欄の名前（同じ 2 つの Box を結ぶ線の何本目か）"
"line.description.placeholder","この Line の意味・解釈（論文レポートに出力）","Meaning or interpretation of this Line (included in the paper report)","Line の説明文の入力欄の薄い文字"
"note.text","本文","Text","プロパティ > メモの欄の名前"
"note.style","見た目","Appearance","プロパティ > メモの欄の名前"
"note.style.note","付箋（黄色・点線枠）","Sticky note (yellow, dashed border)","メモの見た目の選択肢"
"note.style.callout","吹き出し（白・実線枠）","Callout (white, solid border)","メモの見た目の選択肢"
"note.style.text","文字だけ（枠・背景なし。★・〇 などの記号用）","Text only (no border or background; for symbols such as ★ or 〇)","メモの見た目の選択肢"
"note.symbols","記号","Symbols","プロパティ > メモの欄の名前（★・〇 などのボタン）"
"note.symbols.tooltip","「文字だけ」のメモは先頭の記号を入れ替える（後ろの文字は残る）。ほかのメモは本文の末尾に足す","For text-only notes, replaces the leading symbol (the text after it is kept). For other notes, appends it to the end of the text","記号のボタンの説明"
"note.fontSize","文字サイズ (px)","Font size (px)","プロパティ > メモの欄の名前"
"note.fontSize.default","既定","Default","メモの文字サイズの入力欄の薄い文字"
"note.showLeader","引き出し線","Leader line","プロパティ > メモの欄の名前"
"note.showLeader.tooltip","対象の Box / SD・SG へ点線を引く（既定 OFF）","Draw a dotted line to the target Box or SD/SG (off by default)","「引き出し線」の説明"
"note.leaderTo","対象","Target","プロパティ > メモの欄の名前（引き出し線の先）"
"note.leaderTo.placeholder","（選択）","(Select)","引き出し線の対象の選択肢（未選択）"
"note.includeInReport","レポートに含める","Include in report","プロパティ > メモの欄の名前"
"note.includeInReport.tooltip","論文レポートの「注記」に載せる（既定 OFF）","Include in the Notes section of the paper report (off by default)","「レポートに含める」の説明"
"legend.layoutMode.vertical","指定方式（縦型）","Layout (vertical)","プロパティ > 凡例の欄の名前（縦型の図のときの並べ方）"
"legend.layoutMode.horizontal","指定方式（横型）","Layout (horizontal)","プロパティ > 凡例の欄の名前（横型の図のときの並べ方）"
"label.example","例: これは <b>重要</b> な <color=#cc0000>分岐点</color>","Example: this is an <b>important</b> <color=#cc0000>bifurcation point</color>","プロパティ > Box のラベルの入力欄の下の例（装飾のタグはそのまま表示する）"
"common.count","{{count}}個","{{count}} selected","プロパティの見出しの横の数（複数選んだときの個数）"
"sdsg.mismatch.alert","既定では SD は上部(SD)帯のみ、SG は下部(SG)帯のみ配置可能です。
逆向きに配置するには設定 > SD/SG 配置 で「組合せ制限を解除」を ON にしてください。","By default, SD can only be placed in the top (SD) band and SG only in the bottom (SG) band.
To place them the other way, turn on the option to remove the combination restriction in Settings > SD/SG placement.","SD/SG を逆の帯に置こうとしたときの知らせ"
"sdsg.attachedTo.current","（現: {{id}}）","(Current: {{id}})","紐付け対象の選択肢（今の値が図に無いとき。id は Box などの ID）"
"sdsg.betweenBand.hint","ℹ between + band 組合せ: 時間軸方向の幅は 2 Box 間のスパンで自動計算されます (spaceWidth/spaceHeight の時間軸値は無視)。 row と spaceInsetItem で アイテム軸配置を制御できます。","ℹ between + band: the width along the time axis is computed from the span between the 2 Boxes (time-axis values of spaceWidth/spaceHeight are ignored). Use row and spaceInsetItem to control placement on the item axis.","プロパティ > SD/SG の青い説明"
"sdsg.outOfRange","⚠ 帯からはみ出しています（{{count}}件）","⚠ Outside the band ({{count}})","SD/SG が帯からはみ出したときの赤い注意の 1 行目"
"sdsg.subLabel.multiHint","ラベル本文は単一選択時のみ編集できます（現在 {{count}} 個選択中）。","The label text can be edited only when one item is selected ({{count}} selected).","プロパティ > SD/SG のサブラベルタブの説明（複数選んだとき）"
"sdsg.autoFit.multiHint","選択した {{count}} 個の SD/SG に対するバッチ操作。基準は先頭（選択順の最初）の値。 band モードは spaceWidth/spaceHeight、attached は width/height に反映されます。","Batch operations for the {{count}} selected SD/SG. The first selected item is the reference. In band mode, spaceWidth/spaceHeight are changed; in attached mode, width/height.","プロパティ > SD/SG の自動調整タブの説明（複数選んだとき）"
"line.parallel.value","{{n}} 本目 / {{total}} 本（同一 from→to）","{{n}} of {{total}} (same from→to)","プロパティ > Line の詳細タブの並列位置の値"
"note.hint","解釈やコメントを書く付箋です。Box と違って径路のレベルに乗らず、採番・凡例には出ません。 見た目を「文字だけ」にすると、★・〇 などの強調の記号を図の好きな位置に置けます。","A sticky note for interpretations and comments. Unlike a Box, it is not placed on path levels and is not numbered or shown in the legend. Set Appearance to ""Text only"" to put emphasis symbols such as ★ or 〇 anywhere on the figure.","プロパティ > メモの説明"
"box.type.autoId","（変更時にID自動更新）","(ID updates automatically)","プロパティ > Box の「種別」の欄の名前の後ろの補足"
"box.typeLabel.hint1","Box 種別を表すバッジの装飾です。連番表記を ON にすると同種別 Box が複数のとき自動連番:","Style of the badge that shows the Box type. With numbering on, Boxes of the same type are numbered automatically:","プロパティ > Box のタイプラベルタブの説明の 1 行目"
"box.typeLabel.hint2","EFP / P-EFP: ""EFP"" → ""2nd EFP"" → ""3rd EFP"" … / その他: ""OPP-1"" / ""BFP-2"" …","EFP / P-EFP: ""EFP"" → ""2nd EFP"" → ""3rd EFP"" … / Others: ""OPP-1"" / ""BFP-2"" …","プロパティ > Box のタイプラベルタブの説明の 2 行目（連番の例）"
"note.title","メモ","Note","プロパティ > メモの見出し"
"box.pathType.dashedOnly","点線の径路だけでつながっています（{{count}} 個）。実現しなかった行為なら、種別は「潜在的な行為」（点線の枠）にします。","Connected only by dotted-line trajectories ({{count}}). If the action was not realized, its type should be Potential action (dotted frame).","プロパティ > Box の見出しの下の注意（通常の Box に点線の径路しかつながっていないとき）"
"box.pathType.dashedOnly.fix","潜在的な行為にする","Make it a potential action","上の注意のボタン（種別を潜在経験に変える）"
"box.pathType.dashedOnly.badge","点線の径路だけでつながっています。実現しなかった行為なら、種別を「潜在的な行為」にします（選ぶとプロパティで直せます）","Connected only by dotted-line trajectories. If the action was not realized, make its type Potential action (select the Box to fix it in Properties)","図の上の Box の右上の「!」の説明（マウスを重ねたとき）"
"box.pathType.latentOnSolid","潜在的な行為なのに実線の径路がつながっています（{{count}} 個）。実現した行為なら、種別は「行為」にします。","A potential action connected by a solid-line trajectory ({{count}}). If the action was realized, its type should be Action.","プロパティ > Box の見出しの下の注意（潜在経験の Box に実線の径路がつながっているとき）"
"box.pathType.latentOnSolid.fix","行為にする","Make it an action","上の注意のボタン（種別を行為に変える）"
"box.pathType.latentOnSolid.badge","潜在的な行為なのに実線の径路がつながっています。実現した行為なら、種別を「行為」にします（選ぶとプロパティで直せます）","A potential action connected by a solid-line trajectory. If the action was realized, make its type Action (select the Box to fix it in Properties)","図の上の Box の右上の「!」の説明（マウスを重ねたとき）"
"box.pathType.ignore","このままにする","Keep as is","上の注意のボタン（この Box については以後知らせない）"
"box.pathType.ignore.title","この Box については、以後この注意を出しません","Do not show this notice for this Box again","「このままにする」の説明（マウスを重ねたとき）"
"legend.autoPlacement","時間の矢印の下に自動で置く","Place automatically below the time arrow","プロパティ > 凡例 のチェック（入のとき、図が変わるたびに凡例を置き直す）"
"legend.autoPlacement.title","凡例の右端を時間の矢印の右端にそろえて、矢印の下に置きます。行の数は矢印の長さに収まる最も少ない数にします。凡例をドラッグしたり位置や行の数を入れたりすると、自動の置き方は切れます","Places the legend below the time arrow with its right edge aligned to the arrow's end, using as few rows as fit within the arrow's length. Dragging the legend or entering its position or rows turns this off","上のチェックの説明（マウスを重ねたとき）"
`,$f=`\uFEFFkey,ja,en,note
"state.done","済","Done","論文用レポートの画面 > 確認画面 > 入力状況の表の左の印（入力済み）"
"state.partial","一部","Partial","論文用レポートの画面 > 確認画面 > 入力状況の表の左の印（一部だけ入力）"
"state.missing","未","Missing","論文用レポートの画面 > 確認画面 > 入力状況の表の左の印（未入力）"
"count.partial","{{total}} 件中 {{done}} 件","{{done}} of {{total}}","論文用レポートの画面 > 確認画面 > 入力状況の補足（一部のとき。例: Box の説明 10 件中 8 件）"
"count.all","{{total}} 件","{{total}}","論文用レポートの画面 > 確認画面 > 入力状況の補足（件数）"
"choice.notes","メモ","Notes","論文用レポートの画面 > 確認画面 > 載せるかをまだ選んでいない項目の名前（出力ボタンの説明に並ぶ）"
"choice.symbols","記号","Symbols","同上"
"choice.comments","コメント","Comments","同上"
"item.notation","記号体系の宣言","Notation declaration","論文用レポートの画面 > 確認画面 > 入力状況の項目（用語は terms.csv の notationDeclaration）"
"item.symbolMeanings","記号の意味","Meaning of symbols","論文用レポートの画面 > 確認画面 > 入力状況の項目（図に置いた★などの記号）"
"item.participants","協力者情報","Participants","論文用レポートの画面 > 確認画面 > 入力状況の項目"
"item.interview","インタビュー方法","Interview method","論文用レポートの画面 > 確認画面 > 入力状況の項目"
"item.visual","表記方針: {{label}}","Notation policy: {{label}}","論文用レポートの画面 > 確認画面 > 入力状況の項目（label は表記方針の項目名）"
"item.descBox","Box の説明","Box descriptions","論文用レポートの画面 > 確認画面 > 入力状況の項目"
"item.descLine","径路の説明","Path descriptions","論文用レポートの画面 > 確認画面 > 入力状況の項目"
"item.descSdsg","SD/SG の説明","SD/SG descriptions","論文用レポートの画面 > 確認画面 > 入力状況の項目"
"detail.notation.customEmpty","独自・その他の説明が空","No description for the custom or other notation","論文用レポートの画面 > 確認画面 > 記号体系の宣言が一部のときの補足"
"detail.participants.descriptionEmpty","属性などの記述が空","No description (attributes, etc.)","論文用レポートの画面 > 確認画面 > 協力者情報が一部のときの補足"
"detail.participants.countZero","協力者数が 0","Number of participants is 0","論文用レポートの画面 > 確認画面 > 協力者情報が一部のときの補足"
"detail.interview.methodEmpty","方法が空","No method entered","論文用レポートの画面 > 確認画面 > インタビュー方法が一部のときの補足"
"detail.visual.descriptionEmpty","説明が空","No description","論文用レポートの画面 > 確認画面 > 表記方針の項目が一部のときの補足（意味ありなのに説明が無い）"
`,Qf=`\uFEFFkey,ja,en,note
"title","シートのリサイズ","Resize sheet","リサイズの画面 > 見出し"
"drag","ドラッグで移動","Drag to move","リサイズの画面 > 見出しの帯にマウスを載せたときの説明（画面そのものを動かす）"
"hint.what","アクティブシートの図全体（Box 座標・サイズ、Line、SDSG、時期ラベル位置）を一度にリサイズします。","Resizes the whole diagram on the active sheet at once (Box positions and sizes, Lines, SD/SG, period label positions).","リサイズの画面 > 上の説明"
"hint.undo","実データを変更します。{{key}} で取り消せます。","This changes the actual data. Undo with {{key}}.","リサイズの画面 > 上の説明（key は取り消しのショートカット）"
"alert.invalid","倍率が不正です","Invalid scale.","リサイズの画面 > 倍率が計算できないときの注意"
"alert.noChange","倍率が 1.0 のためリサイズ不要です","The scale is 1.0, so there is nothing to resize.","リサイズの画面 > 倍率が 1 のときの注意"
"confirm.uniform","現在のシートを {{p}}% にリサイズします。","Resize the current sheet to {{p}}%.","リサイズの画面 > 適用前の確認（縦横同じ倍率）"
"confirm.xy","現在のシートを 横 {{x}}% / 縦 {{y}}% にリサイズします。","Resize the current sheet to {{x}}% horizontally / {{y}}% vertically.","リサイズの画面 > 適用前の確認（縦横で別の倍率）"
"confirm.preserveSize","（Box サイズは維持、位置間隔のみ調整）","(Box sizes stay; only spacing changes)","リサイズの画面 > 適用前の確認の 2 行目（位置のみのモード）"
"confirm.sizeOnly","（位置は維持、Box サイズと文字のみ調整）","(Positions stay; only Box and text sizes change)","リサイズの画面 > 適用前の確認の 2 行目（Box と文字のみのモード）"
"confirm.undo","（{{key}} で取り消し可能）","(Undo with {{key}})","リサイズの画面 > 適用前の確認の最後の行"
"mode","モード","Mode","リサイズの画面 > 倍率の決め方の欄"
"mode.percent","パーセント指定","Percentage","リサイズの画面 > モードの選択肢"
"mode.paper","用紙サイズにフィット","Fit to paper size","リサイズの画面 > モードの選択肢"
"independent","縦横を独立して指定","Set width and height separately","リサイズの画面 > チェックボックス"
"scale","倍率 (%)","Scale (%)","リサイズの画面 > 倍率の欄"
"scale.x","横倍率 (%)","Horizontal scale (%)","リサイズの画面 > 倍率の欄"
"scale.y","縦倍率 (%)","Vertical scale (%)","リサイズの画面 > 倍率の欄"
"paperSize","用紙サイズ","Paper size","リサイズの画面 > 用紙の欄"
"fit","フィット方式","Fit","リサイズの画面 > 用紙への収め方の欄"
"fit.both","両方に収める（縦横アスペクト維持）","Fit both (keep aspect ratio)","リサイズの画面 > 収め方の選択肢"
"fit.width","横幅だけ収める","Fit width only","リサイズの画面 > 収め方の選択肢"
"fit.height","縦幅だけ収める","Fit height only","リサイズの画面 > 収め方の選択肢"
"margin","用紙内余白比率","Margin ratio","リサイズの画面 > 用紙の余白の割合の欄"
"scaleMode","スケールモード","Scale mode","リサイズの画面 > 何を拡大縮小するかの節の見出し"
"scaleMode.full","全体（位置・Box サイズ両方）","Everything (positions and Box sizes)","リサイズの画面 > スケールモードの選択肢"
"scaleMode.preserveSize","位置のみ（Box サイズ・文字は維持）","Positions only (keep Box and text sizes)","リサイズの画面 > スケールモードの選択肢"
"scaleMode.sizeOnly","Box と文字のみ（位置は維持）","Boxes and text only (keep positions)","リサイズの画面 > スケールモードの選択肢"
"scaleMode.full.hint","座標・サイズ・文字すべて倍率でスケール","Scales positions, sizes and text.","リサイズの画面 > スケールモードの説明（全体）"
"scaleMode.preserveSize.hint","Box / SDSG のサイズ・フォントは不変、位置（矢印の長さ）のみスケール","Box and SD/SG sizes and fonts stay the same; only positions (arrow lengths) are scaled.","リサイズの画面 > スケールモードの説明（位置のみ）"
"scaleMode.sizeOnly.hint","位置と時期区分は不変、Box / SDSG のサイズ・フォントのみスケール。Box 同士が重なる場合があります","Positions and periods stay the same; only Box and SD/SG sizes and fonts are scaled. Boxes may overlap.","リサイズの画面 > スケールモードの説明（Box と文字のみ）"
"includeFontSize","文字サイズも連動","Scale text size too","リサイズの画面 > チェックボックス"
"preview","プレビュー","Preview","リサイズの画面 > 結果の見込みの枠の見出し"
"preview.empty","（シートに図形がありません）","(The sheet has no shapes)","リサイズの画面 > プレビュー（図が空のとき）"
"preview.current","現在のサイズ:","Current size:","リサイズの画面 > プレビューの行の名前"
"preview.after","リサイズ後:","After resizing:","リサイズの画面 > プレビューの行の名前"
"preview.scale","倍率:","Scale:","リサイズの画面 > プレビューの行の名前"
"preview.xy","横 {{x}} % / 縦 {{y}} %","H {{x}} % / V {{y}} %","リサイズの画面 > プレビューの倍率（縦横で別のとき。H=横・V=縦）"
"preview.note.preserveSize","※ Box サイズは変わらず、Box 間隔（矢印の長さ）のみ調整されます","* Box sizes do not change; only the spacing between Boxes (arrow lengths) is adjusted.","リサイズの画面 > プレビューの注記（位置のみのモード）"
"preview.note.sizeOnly","※ 位置は変わらず、Box と文字のサイズのみ調整されます","* Positions do not change; only Box and text sizes are adjusted.","リサイズの画面 > プレビューの注記（Box と文字のみのモード）"
"cancel","キャンセル","Cancel","リサイズの画面 > ボタン"
"apply","リサイズを適用","Apply resize","リサイズの画面 > 適用ボタン"
`,Xf=`\uFEFFkey,ja,en,note
"badge.new","新","New","リボン > ヘルプ タブ名の横の印（新しい更新があるとき）"
"badge.new.title","新しい更新があります","New updates available","「新」の印の説明（マウスを重ねたとき）"
"palette","コマンド","Commands","リボン右上のボタン（縦型・横型の左）。コマンドパレットを開く"
"palette.title","コマンドパレットを開く ({{key}})。機能を名前で探して実行できます","Open the command palette ({{key}}). Find and run any command by name","コマンドパレットのボタンの説明（マウスを重ねたとき）。{{key}} はショートカット"
"layout.group","レイアウト","Layout","リボン右上の 横型／縦型 切り替えのまとまりの名前（読み上げ用）"
"layout.horizontal","横型","Horizontal","リボン右上のボタン（図の向き）"
"layout.horizontal.title","横型レイアウト（時間軸→右）","Horizontal layout (time flows right)","横型ボタンの説明（マウスを重ねたとき）"
"layout.vertical","縦型","Vertical","リボン右上のボタン（図の向き）"
"layout.vertical.title","縦型レイアウト（時間軸↓）","Vertical layout (time flows down)","縦型ボタンの説明（マウスを重ねたとき）"
"save","保存","Save","リボン右上の保存ボタン"
"save.dirty","● 保存","● Save","リボン右上の保存ボタン（未保存の変更があるとき）"
"save.title","保存 ({{key}})","Save ({{key}})","保存ボタンの説明（マウスを重ねたとき）。{{key}} はショートカット"
"file.group.file","ファイル操作","File","リボン > ファイル のまとまりの名前"
"file.new","新規 ({{key}})","New ({{key}})","リボン > ファイル のボタン。{{key}} はショートカット"
"file.new.title","空のシートで新規作成","Create a new file with an empty sheet","ボタンの説明（マウスを重ねたとき）"
"file.open","開く ({{key}})","Open ({{key}})","リボン > ファイル のボタン。{{key}} はショートカット"
"file.open.title","現在のシートを破棄して開く","Discard the current sheets and open a file","ボタンの説明（マウスを重ねたとき）"
"file.openAsSheets","別シートとして開く","Open as new sheets","リボン > ファイル のボタン"
"file.openAsSheets.title","現状のシートはそのまま、ファイル内のシートを追加","Keep the current sheets and add the sheets from the file","ボタンの説明（マウスを重ねたとき）"
"file.save","保存 ({{key}})","Save ({{key}})","リボン > ファイル のボタン。{{key}} はショートカット"
"file.saveAs","名前を付けて保存","Save as","リボン > ファイル のボタン"
"file.resize","リサイズ...","Resize...","リボン > ファイル のボタン"
"file.resize.title","シート全体を用紙サイズや任意の倍率でリサイズ","Resize the whole sheet to a paper size or any scale","ボタンの説明（マウスを重ねたとき）"
"file.shift","移動...","Move...","リボン > ファイル のボタン（図の要素をまとめて動かす）"
"file.shift.title","選択中の Box または全体を Time/Item 方向に移動","Move the selected Boxes or everything along the Time/Item axis","ボタンの説明（マウスを重ねたとき）"
"file.group.import","インポート","Import","リボン > ファイル のまとまりの名前"
"file.importTable","表から取り込み...","Import from table...","リボン > ファイル のボタン"
"file.importTable.title","CSV / Excel から Box・Line・SD/SG・時期ラベル・逐語録・MAXQDA コード付きセグメントを取り込む（列の役割を指定できる）。PowerPoint（.pptx）で描いた TEM 図も取り込める","Import Boxes, Lines, SD/SG, period labels, transcripts and MAXQDA coded segments from CSV / Excel (you can assign column roles). TEM diagrams drawn in PowerPoint (.pptx) can also be imported","ボタンの説明（マウスを重ねたとき）"
"file.transcript","原文","Transcript","リボン > ファイル のボタン（インタビューの原文）"
"file.transcript.title","インタビュー原文ビューア（取り込み / 編集 / Box とのリンク）","Interview transcript viewer (import / edit / link to Boxes)","ボタンの説明（マウスを重ねたとき）"
"file.transcriptBulk","原文一括","Bulk transcripts","リボン > ファイル のボタン"
"file.transcriptBulk.title","複数ファイル/フォルダから原文を一括取り込み（ファイル名から協力者・回数を自動推測）","Import transcripts from several files or a folder at once (participant and session are guessed from file names)","ボタンの説明（マウスを重ねたとき）"
"file.group.export","出力","Export","リボン > ファイル のまとまりの名前"
"file.export","出力...","Export...","リボン > ファイル のボタン"
"file.export.title","PNG / SVG / PDF / PPTX 出力（設定ダイアログ）","Export as PNG / SVG / PDF / PPTX (opens the export dialog)","ボタンの説明（マウスを重ねたとき）"
"file.csvExport","CSV エクスポート","CSV export","リボン > ファイル のボタン"
"file.csvExport.title","現在シートの Box / Line / SDSG / 時期ラベルを ZIP で CSV エクスポート","Export the Boxes, Lines, SD/SG and period labels of the current sheet as CSV files in a ZIP","ボタンの説明（マウスを重ねたとき）"
"file.paperReport","論文レポート","Paper report","リボン > ファイル のボタン"
"file.paperReport.title","記号体系・協力者・図・結果（全要素リスト）・用語凡例を含む .docx を生成","Create a .docx with the notation, participants, figure, results (list of all elements) and glossary","ボタンの説明（マウスを重ねたとき）"
"file.group.env","環境","Preferences","リボン > ファイル のまとまりの名前"
"file.settings","設定","Settings","リボン > ファイル のボタン"
"file.settings.title","全般設定（レイアウト・フォント・凡例など）","General settings (layout, fonts, legend, etc.)","ボタンの説明（マウスを重ねたとき）"
"home.group.mode","モード","Mode","リボン > 編集 のまとまりの名前（キャンバスの操作モード）"
"home.move","移動","Pan","リボン > 編集 のボタン（画面を動かすモード）"
"home.move.title","ドラッグで画面をパン（キー: H）","Drag to pan the view (key: H)","ボタンの説明（マウスを重ねたとき）"
"home.pointer","選択","Select","リボン > 編集 のボタン（図形を操作するモード）"
"home.pointer.title","図形をクリック・ドラッグで動かす（パン/範囲選択は無効）（キー: V）","Click and drag shapes freely (panning and area selection are off) (key: V)","ボタンの説明（マウスを重ねたとき）"
"home.select","範囲選択","Area select","リボン > 編集 のボタン（ドラッグで囲んで選ぶモード）"
"home.select.title","ドラッグで範囲選択（キー: M）","Drag to select an area (key: M)","ボタンの説明（マウスを重ねたとき）"
"home.group.basic","基本操作","Basics","リボン > 編集 のまとまりの名前"
"home.undo","元に戻す ({{key}})","Undo ({{key}})","リボン > 編集 のボタン。{{key}} はショートカット"
"home.redo","進む ({{key}})","Redo ({{key}})","リボン > 編集 のボタン。{{key}} はショートカット"
"home.copy","コピー","Copy","リボン > 編集 のボタン"
"home.copy.title","選択中の {{count}} 要素をコピー","Copy {{count}} selected items","ボタンの説明（マウスを重ねたとき）"
home.copy.title_one,選択中の {{count}} 要素をコピー,Copy {{count}} selected item,件数が 1 のときの英語の形（日本語は使われない）
"home.paste","貼付","Paste","リボン > 編集 のボタン"
"home.paste.title","クリップボードの {{count}} 要素を貼り付け","Paste {{count}} items from the clipboard","ボタンの説明（マウスを重ねたとき）"
home.paste.title_one,クリップボードの {{count}} 要素を貼り付け,Paste {{count}} item from the clipboard,件数が 1 のときの英語の形（日本語は使われない）
"home.paste.empty","クリップボードが空です","The clipboard is empty","貼付ボタンの説明（貼り付けるものが無いとき）"
"home.delete","削除","Delete","リボン > 編集 のボタン"
"home.delete.title","選択中の {{count}} 要素を削除","Delete {{count}} selected items","ボタンの説明（マウスを重ねたとき）"
home.delete.title_one,選択中の {{count}} 要素を削除,Delete {{count}} selected item,件数が 1 のときの英語の形（日本語は使われない）
"home.noSelection","図形を選択してください","Select shapes first","コピー・削除・複製ボタンの説明（何も選んでいないとき）"
"home.group.edit","編集","Edit","リボン > 編集 のまとまりの名前"
"home.selectAll","全選択","Select all","リボン > 編集 のボタン"
"home.duplicate","複製","Duplicate","リボン > 編集 のボタン"
"home.duplicate.title","選択中の {{count}} 要素を複製","Duplicate {{count}} selected items","ボタンの説明（マウスを重ねたとき）"
home.duplicate.title_one,選択中の {{count}} 要素を複製,Duplicate {{count}} selected item,件数が 1 のときの英語の形（日本語は使われない）
"home.fitBoth","文字に合わせる","Fit to text","リボン > 編集 のボタン（Box の大きさを文字に合わせる）"
"home.fitBoth.title","選択 Box のサイズ（幅・高さとも）をラベルに合わせて最小化","Shrink the selected Boxes (width and height) to fit their labels","ボタンの説明（マウスを重ねたとき）"
"home.fitWidth","幅を文字に","Fit width","リボン > 編集 のボタン"
"home.fitWidth.title","高さは維持し、幅のみをラベルに合わせる","Keep the height and fit only the width to the label","ボタンの説明（マウスを重ねたとき）"
"home.fitHeight","高さを文字に","Fit height","リボン > 編集 のボタン"
"home.fitHeight.title","幅は維持し、高さのみをラベルに合わせる","Keep the width and fit only the height to the label","ボタンの説明（マウスを重ねたとき）"
"home.swap","順序入替(直接)","Swap (direct)","リボン > 編集 のボタン（2 つの Box の位置を入れ替える）"
"home.swapFull","順序入替(全リンク)","Swap (all links)","リボン > 編集 のボタン（2 つの Box を矢印ごと入れ替える）"
"home.shiftAfter","以降シフト","Shift following","リボン > 編集 のボタン（選んだ Box より後ろをまとめてずらす）"
"alert.selectBox","Box を選択してください","Select a Box first.","警告の窓（Box を選ばずにボタンを押したとき）"
"alert.selectTwoBoxes","Box を2つ選択してください","Select exactly two Boxes.","警告の窓（順序入替）"
"alert.selectBaseBox","基準にする Box を 1つ選択してください","Select one Box as the reference.","警告の窓（以降シフト）"
"prompt.shiftLevels","何レベル分シフトしますか？（正=後ろへ、負=前へ）","How many levels to shift? (positive = later, negative = earlier)","入力の窓（以降シフト）"
"alert.nonZero","0以外の数値を入力してください","Enter a number other than 0.","警告の窓（以降シフトの入力が 0 か数でないとき）"
"alert.selectTwoOrMore","2 つ以上の Box を選択してください","Select two or more Boxes.","警告の窓（幅・高さ・サイズ・文字サイズを揃える）"
"arrange.group.align","整列・サイズ","Align and size","リボン > 整理 のまとまりの名前"
"align.left","左揃え","Align left","リボン > 整理 のボタン"
"align.center-h","水平中央","Center horizontally","リボン > 整理 のボタン"
"align.right","右揃え","Align right","リボン > 整理 のボタン"
"align.top","上揃え","Align top","リボン > 整理 のボタン"
"align.middle","垂直中央","Center vertically","リボン > 整理 のボタン"
"align.bottom","下揃え","Align bottom","リボン > 整理 のボタン"
"align.distribute-h","等間隔(横)","Distribute horizontally","リボン > 整理 のボタン"
"arrange.matchWidth","幅を揃える","Match width","リボン > 整理 のボタン"
"arrange.matchWidth.title","選択 Box の幅を先頭のものに揃える","Match the width of the selected Boxes to the first one","ボタンの説明（マウスを重ねたとき）"
"arrange.matchHeight","高さを揃える","Match height","リボン > 整理 のボタン"
"arrange.matchHeight.title","選択 Box の高さを先頭のものに揃える","Match the height of the selected Boxes to the first one","ボタンの説明（マウスを重ねたとき）"
"arrange.matchSize","サイズを揃える","Match size","リボン > 整理 のボタン"
"arrange.matchSize.title","選択 Box の幅と高さを先頭のものに揃える","Match the width and height of the selected Boxes to the first one","ボタンの説明（マウスを重ねたとき）"
"arrange.matchFontSize","文字サイズ揃え","Match font size","リボン > 整理 のボタン"
"arrange.matchFontSize.title","選択 Box の文字サイズを先頭のものに揃える","Match the font size of the selected Boxes to the first one","ボタンの説明（マウスを重ねたとき）"
"arrange.group.check","点検","Check","リボン > 整理 のまとまりの名前"
"arrange.overlap","重なりチェック","Overlap check","リボン > 整理 のボタン"
"arrange.overlap.title","ラベル・Box・矢印がぶつかっている箇所を一覧する","List the places where labels, Boxes and arrows overlap","ボタンの説明（マウスを重ねたとき）"
"arrange.group.order","順序","Order","リボン > 整理 のまとまりの名前（重なりの順）"
"arrange.toFront","最前面","Bring to front","リボン > 整理 のボタン"
"arrange.forward","前面","Bring forward","リボン > 整理 のボタン"
"arrange.backward","背面","Send backward","リボン > 整理 のボタン"
"arrange.toBack","最背面","Send to back","リボン > 整理 のボタン"
"insert.group.note","メモ","Notes","リボン > 挿入 のまとまりの名前"
"insert.note","メモ","Note","リボン > 挿入 のボタン"
"insert.note.title","図上に解釈やコメントを書くメモを置く（採番・凡例には出ない。Box を選択中ならその右上に置く）","Place a note for interpretations or comments on the diagram (not numbered and not shown in the legend; placed at the top right of the selected Box, if any)","ボタンの説明（マウスを重ねたとき）"
"insert.symbol","記号","Symbol","リボン > 挿入 のボタン（★ などの強調の記号）"
"insert.symbol.title","★・〇 などの強調の記号を置く（枠・背景なしの文字だけのメモ。Box を選択中ならその右上の角に重ねる。記号と色はプロパティで変えられる）","Place an emphasis symbol such as ★ or 〇 (a text-only note with no frame or background; placed on the top right corner of the selected Box, if any; change the symbol and color in Properties)","ボタンの説明（マウスを重ねたとき）"
"insert.group.between","2選択間に","Between two","リボン > 挿入 のまとまりの名前"
"insert.between","間に挿入...","Insert between...","リボン > 挿入 のボタン（選んだ 2 つの Box の間に Box を入れる）"
"insert.group.line","Line / 矢印","Line / arrow","リボン > 挿入 のまとまりの名前"
"insert.arrow.title","Box 2 個=単線 / 3 個以上=選択順に順次接続","2 Boxes = one line / 3 or more = connected in selection order","実線径路・点線径路ボタンの説明（マウスを重ねたとき）"
"alert.selectTwoOrMoreForArrow","Box を2つ以上選択してください（2 個=単線、3 個以上=選択順に接続）","Select two or more Boxes (2 = one line, 3 or more = connected in selection order).","警告の窓（矢印の追加）"
"insert.group.sdsgCreate","SD/SG 作成","Add SD/SG","リボン > 挿入 のまとまりの名前"
"insert.addSD","SD追加","Add SD","リボン > 挿入 のボタン"
"insert.addSG","SG追加","Add SG","リボン > 挿入 のボタン"
"insert.sdsg.title","Box 1個=single / 2個=between / 3個以上=Time軸両端2個でbetween","1 Box = single / 2 Boxes = between / 3 or more = between the two at both ends of the Time axis","SD追加・SG追加ボタンの説明（マウスを重ねたとき）"
"alert.selectBoxOrLine","Box または Line を選択してください（SD/SG は選択要素に紐づきます）","Select a Box or Line (the SD/SG is attached to the selected item).","警告の窓（SD/SG の追加）"
"insert.group.sdsgPlace","SD/SG 配置","SD/SG placement","リボン > 挿入 のまとまりの名前"
"insert.togglePlacement","配置切替","Toggle placement","リボン > 挿入 のボタン"
"insert.togglePlacement.title","選択中 SD/SG の配置をトグル: attached を含めば帯モードへ / 全部帯なら attached に戻す（SD→上部帯 / SG→下部帯）","Toggle the placement of the selected SD/SG: if any is attached, move all to bands; if all are in bands, attach them again (SD to the top band / SG to the bottom band)","ボタンの説明（マウスを重ねたとき）"
"alert.selectSDSG","SD/SG を選択してください","Select an SD/SG first.","警告の窓（配置切替）"
"insert.group.other","その他","Other","リボン > 挿入 のまとまりの名前"
"insert.periodLabels","時期ラベル...","Period labels...","リボン > 挿入 のボタン"
"view.group.display","表示","Display","リボン > 表示 のまとまりの名前"
"view.grid","グリッド","Grid","リボン > 表示 のボタン（入のとき後ろに ✓ が付く）"
"view.handles","接続点","Connection points","リボン > 表示 のボタン（入のとき後ろに ✓ が付く）"
"view.handles.title","Box の左右の接続点（矢印をつなぐ丸）の表示を切り替える。文字に重なるときや発表で画面共有するときに隠せる（隠しても矢印はつなげる。出力には常に出ない）","Show or hide the connection points (the circles for attaching arrows) on the left and right of Boxes. Hide them when they overlap text or when sharing your screen (arrows can still be connected; they never appear in exports)","ボタンの説明（マウスを重ねたとき）"
"view.snap","スナップ","Snap","リボン > 表示 のボタン（入のとき後ろに ✓ が付く）"
"view.paperGuides","用紙枠","Paper frame","リボン > 表示 のボタン（入のとき後ろに ✓ が付く）"
"view.ids.title","Box / SDSG / Line の ID バッジ一括トグル (現状: Box={{box}}, SDSG={{sdsg}}, Line={{line}})","Toggle all ID badges of Boxes, SD/SG and Lines (now: Box={{box}}, SDSG={{sdsg}}, Line={{line}})","ID ボタンの説明（マウスを重ねたとき）。{{box}} などは ON か OFF"
"view.boxIds.title","Box の ID バッジ表示切替","Show or hide Box ID badges","ボタンの説明（マウスを重ねたとき）"
"view.sdsgIds.title","SDSG の ID バッジ表示切替","Show or hide SD/SG ID badges","ボタンの説明（マウスを重ねたとき）"
"view.lineIds.title","Line の ID バッジ表示切替（線の中点）","Show or hide Line ID badges (at the middle of each line)","ボタンの説明（マウスを重ねたとき）"
"view.topRuler","上ルーラー","Top ruler","リボン > 表示 のボタン（入のとき後ろに ✓ が付く）"
"view.leftRuler","左ルーラー","Left ruler","リボン > 表示 のボタン（入のとき後ろに ✓ が付く）"
"view.typeLabels","タイプラベル","Type labels","リボン > 表示 のボタン（入のとき後ろに ✓ が付く）"
"view.typeLabels.title","Box / SDSG のタイプラベル（種別バッジ）を一括で表示・非表示","Show or hide all type labels (type badges) of Boxes and SD/SG","ボタンの説明（マウスを重ねたとき）"
"view.sdsgBand","SDSG 帯","SD/SG bands","リボン > 表示 のボタン（入のとき後ろに ✓ が付く）"
"view.sdsgBand.title","SD/SG を上部(SD)帯・下部(SG)帯に配置するモードの ON/OFF（詳細は設定 > SD/SG 配置）","Turn on or off the mode that places SD in the top band and SG in the bottom band (details in Settings > SD/SG placement)","ボタンの説明（マウスを重ねたとき）"
"view.group.elements","図要素","Diagram elements","リボン > 表示 のまとまりの名前"
"view.periods","時期","Periods","リボン > 表示 のボタン（時期ラベルの表示。入のとき後ろに ✓ が付く）"
"view.periodEdit","時期編集...","Edit periods...","リボン > 表示 のボタン"
"view.periodEdit.title","設定の時期区分タブを開く","Open the Period tab in Settings","ボタンの説明（マウスを重ねたとき）"
"view.group.panels","パネル","Panels","リボン > 表示 のまとまりの名前"
"view.data","データ","Data","リボン > 表示 のボタン（データの表のパネル）"
"view.properties","プロパティ","Properties","リボン > 表示 のボタン（プロパティのパネル）"
"view.comments","コメント","Comments","リボン > 表示 のボタン（コメントのモード）"
"view.group.fit","フィット","Fit","リボン > 表示 のまとまりの名前"
"view.fitAll","全体fit","Fit all","リボン > 表示 のボタン"
"view.fitAll.title","時間矢印・時期ラベル・凡例を含め全体を画面に合わせる","Fit everything, including the time arrow, period labels and legend, to the screen","ボタンの説明（マウスを重ねたとき）"
"view.fitWidth","横fit","Fit width","リボン > 表示 のボタン"
"view.fitWidth.title","横幅に合わせる","Fit to the width","ボタンの説明（マウスを重ねたとき）"
"view.fitHeight","縦fit","Fit height","リボン > 表示 のボタン"
"view.fitHeight.title","縦幅に合わせる","Fit to the height","ボタンの説明（マウスを重ねたとき）"
"help.group.support","サポート","Support","リボン > ヘルプ のまとまりの名前"
"help.wizard","起動ウィザード","Startup wizard","リボン > ヘルプ のボタン"
"help.wizard.title","起動時のウィザードを再表示 (新規作成 / プロジェクトを開く / デモを開く)","Show the startup wizard again (new / open project / open demo)","ボタンの説明（マウスを重ねたとき）"
"help.tour","ツアー","Tour","リボン > ヘルプ のボタン（まだ使えない）"
"help.tour.title","チュートリアルツアー (開発中)","Tutorial tour (in development)","ボタンの説明（マウスを重ねたとき）"
"help.manual","マニュアル","Manual","リボン > ヘルプ のボタン"
"help.manual.title","はじめてのガイド（画面の写真つき）を新しいタブで開く","Open the getting started guide (with screenshots) in a new tab","ボタンの説明（マウスを重ねたとき）"
"help.manual.url","https://github.com/YukiInoueNakata/temerplus/blob/master/docs/getting-started.ja.md","https://github.com/YukiInoueNakata/temerplus/blob/master/docs/getting-started.en.md","マニュアルボタンで開くページ（画面の言語の版）"
"help.github","GitHub","GitHub","リボン > ヘルプ のボタン（ソースコード・不具合の報告のページ）"
"help.github.title","GitHub のリポジトリ（ソースコード・更新・不具合の報告）を新しいタブで開く","Open the GitHub repository (source code, updates, issue reports) in a new tab","ボタンの説明（マウスを重ねたとき）"
"help.github.url","https://github.com/YukiInoueNakata/temerplus","https://github.com/YukiInoueNakata/temerplus","GitHub ボタンで開くページ"
"help.author","作者のページ","Author","リボン > ヘルプ のボタン（作者の Web ページ）"
"help.author.title","作者（中田友貴）の Web ページを新しいタブで開く","Open the author (Yuki Inoue Nakata) web page in a new tab","ボタンの説明（マウスを重ねたとき）"
"help.author.url","https://yukiinouenakata.github.io/","https://yukiinouenakata.github.io/","作者のページボタンで開くページ"
"help.video","動画","Videos","リボン > ヘルプ のボタン（まだ使えない）"
"help.video.title","動画リンク (開発中)","Video links (in development)","ボタンの説明（マウスを重ねたとき）"
"help.changelog","更新情報","What's new","リボン > ヘルプ のボタン"
"help.changelog.unseen","更新情報（新）","What's new (new)","リボン > ヘルプ のボタン（まだ見ていない更新があるとき）"
"help.changelog.title","最近の更新（新機能・改善・修正）の一覧","List of recent updates (new features, improvements and fixes)","ボタンの説明（マウスを重ねたとき）"
"help.about","バージョン情報","About","リボン > ヘルプ のボタン"
"help.about.message","TEMer Plus {{version}}
著者: 中田友貴
ライセンス: PolyForm Noncommercial 1.0.0","TEMer Plus {{version}}
Author: Yuki Inoue Nakata
License: PolyForm Noncommercial 1.0.0","バージョン情報の窓の本文。{{version}} は版番号"
`,Kf=`\uFEFFkey,ja,en,note
prompt.size,フォントサイズ (px),Font size (px),文字の装飾ボタン「Aa」を押したときの入力の問い
prompt.color,色 (#ff0000 など),"Color (e.g., #ff0000)",文字の装飾ボタン（色）を押したときの入力の問い
prompt.font,フォント名,Font name,文字の装飾ボタン「Fn」を押したときの入力の問い
bold,太字,Bold,文字の装飾ボタン「B」の説明（マウスを乗せると出る）
italic,斜体,Italic,文字の装飾ボタン「I」の説明
underline,下線,Underline,文字の装飾ボタン「U」の説明
strikethrough,取消線,Strikethrough,文字の装飾ボタン「S」の説明
size,文字サイズ,Font size,文字の装飾ボタン「Aa」の説明
color,文字色,Font color,文字の装飾ボタン（絵の具）の説明
font,フォント,Font,文字の装飾ボタン「Fn」の説明
`,qf=`\uFEFFkey,ja,en,note
empty,まだ切片がありません。「原文」の画面で範囲を選び、右の欄の「切片にする」を押すと、ここに並びます。,"No segments yet. Select a range in the ""Text"" view and press ""Make a segment"" on the right; segments are listed here.",原文ビューア > 切片の一覧 > 切片が無いとき
checkAll,すべて選ぶ,Select all,切片の一覧 > ボタン
uncheckAll,選ぶのをやめる,Clear selection,切片の一覧 > ボタン
check,{{n}} 番を選ぶ,Select No. {{n}},切片の一覧 > 行の選択欄の読み上げ
createBoxes,選んだ切片を Box にする（{{count}}）,Make Boxes from selected ({{count}}),切片の一覧 > ボタン（Box がまだ無い選んだ切片の数）
createBoxes.tip,見出しを文字に、引用を説明に、原文参照つきで Box を作り、原文の順に時間の方向へ並べます。すでに Box がある切片は飛ばします,"Creates Boxes with the heading as the text, the quote as the description, and a source reference, placed in text order along the time axis. Segments that already have a Box are skipped",切片の一覧 > ボタンの説明
created,Box を {{count}} 個作りました,Created {{count}} Boxes,切片の一覧 > Box を作ったあとの知らせ
created_one,Box を {{count}} 個作りました,Created {{count}} Box,件数が 1 のときの英語の形（日本語は使われない）
arrange,Box を原文の順に並べる,Arrange Boxes in text order,切片の一覧 > ボタン
arrange.tip,この逐語録の切片から作った Box を、原文の順に並べ直します。時間の方向の位置の並びは今のまま使い、上下（Item）の位置は変えません,"Reorders the Boxes made from this transcript's segments into text order. The existing positions along the time axis are reused, and the Item positions are kept",切片の一覧 > ボタンの説明
arranged,{{count}} 個の Box を並べ直しました,Rearranged {{count}} Boxes,切片の一覧 > 並べ直したあとの知らせ
arranged_one,{{count}} 個の Box を並べ直しました,Rearranged {{count}} Box,件数が 1 のときの英語の形（日本語は使われない）
arranged.none,すでに原文の順に並んでいます,Already in text order,切片の一覧 > 並べ直す必要が無かったとき
col.label,見出し（Box の文字）,Heading (Box text),切片の一覧 > 列の名前
col.quote,引用,Quote,切片の一覧 > 列の名前（押すと原文の場所へ）
col.type,種別,Type,切片の一覧 > 列の名前
col.item,Item,Item,切片の一覧 > 列の名前（Item レベル）
col.item.tip,Box にしたときの Item レベル（空なら 0 の一列）,Item level of the Box (empty = 0),切片の一覧 > 列の説明
col.note,メモ,Note,切片の一覧 > 列の名前
col.box,Box,Box,切片の一覧 > 列の名前（作った Box の ID）
col.box.tip,図の上でこの Box を選ぶ,Select this Box on the diagram,切片の一覧 > Box の ID のボタンの説明
remove.tip,切片を消す（作った Box は残ります）,Delete the segment (the Box is kept),切片の一覧 > 消すボタンの説明
`,Yf=`\uFEFFkey,ja,en,note
common.auto,自動,Auto,設定（複数の箇所で共通） の空欄の時の表示（自動）
common.autoParen,（自動）,(Auto),設定（複数の箇所で共通） の選択肢（自動）
common.top,上部,Top,設定（複数の箇所で共通） の選択肢（位置）
common.bottom,下部,Bottom,設定（複数の箇所で共通） の選択肢（位置）
common.left,左側,Left,設定（複数の箇所で共通） の選択肢（位置）
common.right,右側,Right,設定（複数の箇所で共通） の選択肢（位置）
common.middle,中央,Middle,設定（複数の箇所で共通） の選択肢（上下の揃え）
common.center,中央,Center,設定（複数の箇所で共通） の選択肢（揃え）
common.bold,太字,Bold,設定（複数の箇所で共通） のボタンのツールチップ
common.italic,斜体,Italic,設定（複数の箇所で共通） のボタンのツールチップ
common.underline,下線,Underline,設定（複数の箇所で共通） のボタンのツールチップ
common.fontSize,フォントサイズ,Font size,設定（複数の箇所で共通） の項目名
common.labelSideHorizontal,ラベル位置（横型レイアウト）,Label position (horizontal layout),設定（複数の箇所で共通） の項目名
common.labelSideVertical,ラベル位置（縦型レイアウト）,Label position (vertical layout),設定（複数の箇所で共通） の項目名
common.itemReference,Item軸の基準,Item axis reference,設定（複数の箇所で共通） の項目名
common.itemReference.max,最大Item_Level（上側）,Max Item_Level (upper side),設定（複数の箇所で共通） の選択肢
common.itemReference.min,最小Item_Level（下側）,Min Item_Level (lower side),設定（複数の箇所で共通） の選択肢
common.offsetFromReference,基準からのオフセット,Offset from reference,設定（複数の箇所で共通） の項目名
common.showWhileEditing,編集中も表示,Show while editing,設定（複数の箇所で共通） の項目名
common.includeInExport,エクスポートに含める,Include in export,設定（複数の箇所で共通） の項目名
common.delete,削除,Delete,設定（複数の箇所で共通） のボタン
common.borderWidthPx,枠線太さ (px),Border width (px),設定（複数の箇所で共通） の項目名
common.backgroundColor,背景色,Background color,設定（複数の箇所で共通） の項目名
common.borderColor,枠線色,Border color,設定（複数の箇所で共通） の項目名
common.textColor,文字色,Text color,設定（複数の箇所で共通） の項目名
common.shape,形状,Shape,設定（複数の箇所で共通） の項目名
common.lineColor,枠線の色,Border color,設定（複数の箇所で共通） の項目名
common.frameColor,枠の色,Frame color,設定（複数の箇所で共通） の項目名
common.label,ラベル,Label,設定（複数の箇所で共通） の項目名・表の見出し
common.display,表示,Display,設定（複数の箇所で共通） の見出し
common.hidden,非表示,Hidden,設定（複数の箇所で共通） の選択肢（ラベルを出さない）
common.show,表示,Show,設定（複数の箇所で共通） の項目名・選択肢
common.hide,非表示,Hide,設定（複数の箇所で共通） の選択肢
common.layout,レイアウト,Layout,設定（複数の箇所で共通） の項目名・見出し
common.title,タイトル,Title,設定（複数の箇所で共通） の項目名・見出し
common.defaultColor,既定 ({{color}}),Default ({{color}}),設定（複数の箇所で共通） の色の既定値の表示（{{color}} は色の値）
common.confirmContinue,よろしいですか?,Continue?,設定（複数の箇所で共通） の確認の文の最後
dialog.title,設定,Settings,設定 の枠 の見出し
dialog.dragToMove,ドラッグで移動,Drag to move,設定 の枠 の見出しのツールチップ
dialog.searchPlaceholder,設定項目を検索...,Search settings...,設定 の枠 の検索欄の薄い字
dialog.close,閉じる,Close,設定 の枠 のボタン
nav.general,全体,General,設定 の左の一覧 のタブ名
nav.general.keywords,レイアウト 言語 locale UI フォントサイズ リボン文字サイズ Level 刻み 用紙枠 paper guide Box 自動拡張 auto expand 文字サイズ自動,layout language locale UI font size ribbon text size level step paper guide Box auto expand auto fit text,設定 の左の一覧 の検索の語（空白区切り・画面には出ない）
nav.snap,スナップ,Snap,設定 の左の一覧 のタブ名
nav.snap.keywords,グリッド grid snap 整列 ガイド guide 距離 刻み,grid snap align alignment guide distance step,設定 の左の一覧 の検索の語（空白区切り・画面には出ない）
nav.group.elements,図要素,Diagram elements,設定 の左の一覧 のグループ名
nav.boxstyle,Box スタイル,Box style,設定 の左の一覧 のタブ名
nav.boxstyle.keywords,Box プリセット 様式 normal BFP OPP EFP P-EFP 2nd annotation 枠線 背景色 文字色 borderColor backgroundColor borderWidth,Box preset style normal BFP OPP EFP P-EFP 2nd annotation border background text color borderColor backgroundColor borderWidth,設定 の左の一覧 の検索の語（空白区切り・画面には出ない）
nav.linestyle,Line（矢印）,Line (arrow),設定 の左の一覧 のタブ名
nav.linestyle.keywords,Line 矢印 径路 既定 default 線種 RLine XLine 形状 straight elbow curve 直線 L字 曲線 色 太さ strokeWidth オフセット offset マージン margin 角度 angle 一括適用 全Lineに適用,Line arrow path default line type RLine XLine shape straight elbow curve color width strokeWidth offset margin angle apply to all lines,設定 の左の一覧 の検索の語（空白区切り・画面には出ない）
nav.typelabel,タイプラベル,Type labels,設定 の左の一覧 のタブ名
nav.typelabel.keywords,種別 バッジ type label 連番 numbered 表示切替 visibility,type badge label numbered visibility,設定 の左の一覧 の検索の語（空白区切り・画面には出ない）
nav.timearrow,非可逆的時間,Irreversible Time,設定 の左の一覧 のタブ名
nav.timearrow.keywords,時間 矢印 arrow irreversible auto insert 線の太さ stroke ラベル位置,time arrow irreversible auto insert line width stroke label position,設定 の左の一覧 の検索の語（空白区切り・画面には出ない）
nav.period,時期区分,Period,設定 の左の一覧 のタブ名
nav.period.keywords,時期 period 区分 divider band 位置 stroke fontSize,period label divider band position stroke fontSize,設定 の左の一覧 の検索の語（空白区切り・画面には出ない）
nav.legend,凡例,Legend,設定 の左の一覧 のタブ名
nav.legend.keywords,凡例 legend タイトル title フォント columns 背景 枠線 項目別 上書き overrides showDescription,legend title font columns background border item overrides showDescription,設定 の左の一覧 の検索の語（空白区切り・画面には出ない）
nav.sdsgspace,SD/SG 配置,SD/SG placement,設定 の左の一覧 のタブ名
nav.sdsgspace.keywords,SD SG 帯 band 配置 row heightLevel offsetLevel autoExpand shrinkToFitRow autoArrange allowMismatched,SD SG band placement row heightLevel offsetLevel autoExpand shrinkToFitRow autoArrange allowMismatched,設定 の左の一覧 の検索の語（空白区切り・画面には出ない）
nav.project,プロジェクト,Project,設定 の左の一覧 のタブ名
nav.project.keywords,プロジェクト project メタデータ metadata タイトル 既定値 defaults Box サイズ フォント,project metadata title defaults Box size font,設定 の左の一覧 の検索の語（空白区切り・画面には出ない）
lineDefaults.type,線種,Line type,設定 > Line（矢印）の既定 の項目名
lineDefaults.RLine,実線（実現径路）,Solid (realized path),設定 > Line（矢印）の既定 の選択肢
lineDefaults.XLine,点線（未実現径路）,Dashed (unrealized path),設定 > Line（矢印）の既定 の選択肢
lineDefaults.straight,直線,Straight,設定 > Line（矢印）の既定 の選択肢（形状）
lineDefaults.elbow,L字接続,Elbow,設定 > Line（矢印）の既定 の選択肢（形状）
lineDefaults.curve,曲線,Curve,設定 > Line（矢印）の既定 の選択肢（形状）
lineDefaults.elbowBendRatio,L字 中継位置 (0〜1),Elbow bend position (0–1),設定 > Line（矢印）の既定 の項目名
lineDefaults.elbowBendRatio.tip,折れ位置の比率。0 = from 寄り / 0.5 = 中央 / 1 = to 寄り,Bend position ratio. 0 = near from / 0.5 = middle / 1 = near to,設定 > Line（矢印）の既定 のツールチップ
lineDefaults.curveIntensity,曲率 (0〜1),Curvature (0–1),設定 > Line（矢印）の既定 の項目名
lineDefaults.curveIntensity.tip,0=ほぼ直線、0.5=標準、1=大きく膨らむ,"0 = nearly straight, 0.5 = standard, 1 = strongly curved",設定 > Line（矢印）の既定 のツールチップ
lineDefaults.color,線の色,Line color,設定 > Line（矢印）の既定 の項目名
lineDefaults.strokeWidth,線の太さ (px),Line width (px),設定 > Line（矢印）の既定 の項目名
general.language,図の言語,Diagram language,設定 > 全体 の項目名（図の表記の言語）
general.uiFontSize,UI フォントサイズ（px）,UI font size (px),設定 > 全体 の項目名
general.ribbonFontSize,リボン文字サイズ（px）,Ribbon text size (px),設定 > 全体 の項目名
general.editing,編集補助,Editing aids,設定 > 全体 の見出し
general.levelStep,Level 調整刻み,Level step,設定 > 全体 の項目名
general.levelStep.hint,プロパティパネルで Item/Time レベルを矢印キー/スピナーで調整する際の刻み幅,Step size when adjusting Item/Time levels with the arrow keys or spinners in the properties panel,設定 > 全体 の説明文
general.boxAutoFit,Box 自動調整（既定）,Box auto-fit (default),設定 > 全体 の小見出し
general.autoFitBoxMode,自動拡張モード（Box 個別未指定時）,Auto-expand mode (when not set per Box),設定 > 全体 の項目名
general.autoFitBoxMode.none,自動拡張なし,No auto-expand,設定 > 全体 の選択肢
general.autoFitBoxMode.widthFixed,横幅固定で高さ自動,"Fixed width, auto height",設定 > 全体 の選択肢
general.autoFitBoxMode.heightFixed,高さ固定で横幅自動,"Fixed height, auto width",設定 > 全体 の選択肢
general.autoFitText,文字サイズ自動調整（既定、全 Box）,"Auto-fit text size (default, all Boxes)",設定 > 全体 の項目名
general.autoFit.hint1,自動拡張: ラベルが収まらない時、どちら側を増やすか（Box 個別プロパティで上書き可）,Auto-expand: which side grows when the label does not fit (can be overridden per Box),設定 > 全体 の説明文（1 行目）
general.autoFit.hint2,文字サイズ自動調整: Box に収まる最大文字サイズを自動設定（同時有効不可。個別設定優先）,Auto-fit text size: sets the largest text size that fits in the Box (cannot be used together with auto-expand; per-Box settings take precedence),設定 > 全体 の説明文（2 行目）
general.lineDefaults,Line（矢印）の既定,Line (arrow) defaults,設定 > 全体 の見出し
general.lineDefaults.hint1,これから引く矢印の初期値です。既存の矢印は変わりません。,Initial values for arrows you draw from now on. Existing arrows are not changed.,設定 > 全体 の説明文（1 文目）
general.lineDefaults.hint2,端点のオフセット・マージン・角度と「全 Line に適用」は「Line（矢印）」タブにあります。,"Endpoint offsets, margins, angle and ""Apply to all lines"" are on the ""Line (arrow)"" tab.",設定 > 全体 の説明文（2 文目）
general.openLineTab,Line（矢印）の詳細設定を開く,Open Line (arrow) details,設定 > 全体 のボタン
paper.title,用紙枠,Paper guide,設定 > 全体 > 用紙枠 の見出し
paper.hint1,表示タブの「用紙枠」ボタンで ON/OFF。横型レイアウトは長辺=横、縦型は長辺=縦。,"Turn on or off with the ""Paper guide"" button on the View tab. In horizontal layout the long side is horizontal; in vertical layout it is vertical.",設定 > 全体 > 用紙枠 の説明文（1 文目）
paper.hint2,短辺中央が Level 0 になるよう描画、枠外は薄グレーでマスク。,Drawn so that the center of the short side is Level 0; the area outside is masked in light gray.,設定 > 全体 > 用紙枠 の説明文（2 文目）
paper.size,用紙サイズ,Paper size,設定 > 全体 > 用紙枠 の項目名
paper.size.A4,A4（1:√2 ≈ 1:1.414）,A4 (1:√2 ≈ 1:1.414),設定 > 全体 > 用紙枠 の選択肢
paper.size.A3,A3（A4 と同比率）,A3 (same ratio as A4),設定 > 全体 > 用紙枠 の選択肢
paper.size.16x9,16:9（スライド）,16:9 (slide),設定 > 全体 > 用紙枠 の選択肢
paper.size.custom,カスタム,Custom,設定 > 全体 > 用紙枠 の選択肢
paper.customShort,カスタム短辺 (px),Custom short side (px),設定 > 全体 > 用紙枠 の項目名
paper.customLong,カスタム長辺 (px),Custom long side (px),設定 > 全体 > 用紙枠 の項目名
paper.pageCount,枚数（長辺方向）,Pages (along the long side),設定 > 全体 > 用紙枠 の項目名
paper.maskOutside,枠外を薄グレーで表示,Gray out the area outside,設定 > 全体 > 用紙枠 の項目名
snap.showGrid,グリッドを表示,Show grid,設定 > スナップ の項目名
snap.enable,スナップを有効化,Enable snap,設定 > スナップ の項目名
snap.hint,「グリッド」は点の表示のみ。「スナップ」は Box ドラッグ時に位置をグリッドに吸着させます（両者は独立）。,"""Grid"" only shows the dots. ""Snap"" makes a Box snap to the grid while dragging (the two are independent).",設定 > スナップ の説明文
snap.gridSpacing,グリッド間隔,Grid spacing,設定 > スナップ の見出し
snap.gridPx,グリッド（px）,Grid (px),設定 > スナップ の項目名
snap.gridPx.hint,グリッド表示の点間隔とスナップ吸着距離を兼ねる（既定 10px）。25〜50 程度にするとスナップの効きが体感しやすくなります。,Used both as the dot spacing of the grid and as the snap distance (default 10px). About 25–50 makes snapping easier to notice.,設定 > スナップ の説明文
snap.alignGuides,整列ガイド,Alignment guides,設定 > スナップ の見出し
snap.alignGuides.show,他 Box と整列時にガイド線を表示,Show guide lines when aligned with other Boxes,設定 > スナップ の項目名
snap.distancePx,距離スナップ（px）,Distance snap (px),設定 > スナップ の項目名
boxTypeLabel.normal,normal（行為）,normal (Action),設定 > タイプラベル と Box スタイル のBox の種類の名前
boxTypeLabel.BFP,BFP（分岐点）,BFP (Bifurcation point),設定 > タイプラベル と Box スタイル のBox の種類の名前
boxTypeLabel.EFP,EFP（等至点）,EFP (Equifinality point),設定 > タイプラベル と Box スタイル のBox の種類の名前
boxTypeLabel.P-EFP,P-EFP（両極化した等至点）,P-EFP (Polarized equifinality point),設定 > タイプラベル と Box スタイル のBox の種類の名前
boxTypeLabel.OPP,OPP（必須通過点）,OPP (Obligatory passage point),設定 > タイプラベル と Box スタイル のBox の種類の名前
boxTypeLabel.2nd-EFP,2nd-EFP（セカンド等至点）,2nd-EFP (Second equifinality point),設定 > タイプラベル と Box スタイル のBox の種類の名前
boxTypeLabel.P-2nd-EFP,P-2nd-EFP（両極化したセカンド等至点）,P-2nd-EFP (Polarized second equifinality point),設定 > タイプラベル と Box スタイル のBox の種類の名前
boxTypeLabel.annotation,annotation（潜在的な行為）,annotation (Potential action),設定 > タイプラベル と Box スタイル のBox の種類の名前
boxTypeLabel.SD,SD（社会的方向づけ）,SD (Social direction),設定 > タイプラベル と Box スタイル の種類の名前
boxTypeLabel.SG,SG（社会的助勢）,SG (Social guidance),設定 > タイプラベル と Box スタイル の種類の名前
typeLabel.title,タイプラベル（種別バッジ）表示,Type label (type badge) visibility,設定 > タイプラベル の見出し
typeLabel.hint,各種別について、キャンバス上のタイプラベルを個別に表示／非表示できます。,Show or hide the type label on the canvas for each type.,設定 > タイプラベル の説明文
typeLabel.bulk,一括:,All:,設定 > タイプラベル の一括のボタンの前の字
typeLabel.showAll,すべて表示,Show all,設定 > タイプラベル のボタン
typeLabel.hideAll,すべて非表示,Hide all,設定 > タイプラベル のボタン
theme.selectTheme,テーマを選択してください,Select a theme.,設定 > Box スタイル の警告の文
theme.confirmApply,"「{{name}}」を適用します。
現在の Box タイプ別プリセットは上書きされます。よろしいですか？","Apply ""{{name}}""?
The current Box presets for each type will be overwritten.",設定 > Box スタイル の確認の文（{{name}} はテーマ名）
theme.confirmResetAll,"すべての Box タイプのプリセットを削除し、自動（工場出荷時）に戻します。
よろしいですか？",Delete the presets for all Box types and return them to Auto (factory defaults)?,設定 > Box スタイル の確認の文
theme.promptName,新しいテーマ名を入力してください:,Enter a name for the new theme:,設定 > Box スタイル の入力を求める文
theme.selectUserToOverwrite,上書き対象のユーザテーマを選択してください,Select a user theme to overwrite.,設定 > Box スタイル の警告の文
theme.confirmOverwrite,ユーザテーマ「{{name}}」を現在の設定で上書きします。よろしいですか？,"Overwrite the user theme ""{{name}}"" with the current settings?",設定 > Box スタイル の確認の文（{{name}} はテーマ名）
theme.selectUserToDelete,削除対象のユーザテーマを選択してください,Select a user theme to delete.,設定 > Box スタイル の警告の文
theme.confirmDelete,ユーザテーマ「{{name}}」を削除します。よろしいですか？,"Delete the user theme ""{{name}}""?",設定 > Box スタイル の確認の文（{{name}} はテーマ名）
theme.selectToExport,エクスポートするテーマを選択してください,Select a theme to export.,設定 > Box スタイル の警告の文
theme.noValidTheme,有効なテーマが見つかりませんでした。JSON 形式を確認してください。,No valid themes were found. Check the JSON format.,設定 > Box スタイル の警告の文
theme.imported,{{n}} 件のテーマをユーザテーマとしてインポートしました,Imported {{n}} theme(s) as user themes.,設定 > Box スタイル の知らせの文（{{n}} は件数）
boxStyle.title,Box スタイルプリセット,Box style presets,設定 > Box スタイル の見出し
boxStyle.hint1,Box タイプごとの既定スタイルを指定できます。,Set the default style for each Box type.,設定 > Box スタイル の説明文（1 文目）
boxStyle.hint2,未指定の項目は「自動」として下位レイヤー（Box 個別値・既定値）に委ねられます。,"Items left unset are ""Auto"" and fall back to lower layers (per-Box values and defaults).",設定 > Box スタイル の説明文（2 文目）
theme.label,テーマ:,Theme:,設定 > Box スタイル のテーマの選択欄の前の字
theme.selectPlaceholder,（選択してください）,(Select),設定 > Box スタイル の選択肢（未選択）
theme.group.builtin,組み込み,Built-in,設定 > Box スタイル の選択肢のグループ名
theme.group.user,ユーザ,User,設定 > Box スタイル の選択肢のグループ名
theme.apply,適用,Apply,設定 > Box スタイル のボタン
theme.apply.tip,選択中のテーマを設定全体に適用,Apply the selected theme to all settings,設定 > Box スタイル のボタンのツールチップ
theme.resetAll,すべて自動に戻す,Reset all to Auto,設定 > Box スタイル のボタン
theme.resetAll.tip,すべての Box タイプを自動（工場出荷時）に戻す,Return all Box types to Auto (factory defaults),設定 > Box スタイル のボタンのツールチップ
theme.saveNew,現状を保存...,Save current...,設定 > Box スタイル のボタン
theme.saveNew.tip,現在の設定を新しいユーザテーマとして保存,Save the current settings as a new user theme,設定 > Box スタイル のボタンのツールチップ
theme.overwrite,上書き,Overwrite,設定 > Box スタイル のボタン
theme.overwrite.tip,ユーザテーマを現在の設定で上書き,Overwrite the user theme with the current settings,設定 > Box スタイル のボタンのツールチップ
theme.delete.tip,ユーザテーマを削除,Delete the user theme,設定 > Box スタイル のボタンのツールチップ
theme.export,エクスポート,Export,設定 > Box スタイル のボタン
theme.export.tip,選択中のテーマを JSON エクスポート,Export the selected theme as JSON,設定 > Box スタイル のボタンのツールチップ
theme.exportCurrent,現在設定をエクスポート,Export current settings,設定 > Box スタイル のボタン
theme.exportCurrent.tip,現在の設定そのものを JSON でエクスポート（テーマ未選択でも OK）,Export the current settings as JSON (no theme selection needed),設定 > Box スタイル のボタンのツールチップ
theme.import,インポート...,Import...,設定 > Box スタイル のボタン
theme.import.tip,JSON ファイルを選んでユーザテーマとしてインポート,Choose a JSON file and import it as user themes,設定 > Box スタイル のボタンのツールチップ
boxStyle.editing,編集中:,Editing:,設定 > Box スタイル の編集中の種類の前の字
boxStyle.borderAndShape,枠線・形状,Border and shape,設定 > Box スタイル の小見出し
boxStyle.borderStyle,枠線スタイル,Border style,設定 > Box スタイル の項目名
boxStyle.border.solid,実線,Solid,設定 > Box スタイル の選択肢（枠線）
boxStyle.border.dashed,破線,Dashed,設定 > Box スタイル の選択肢（枠線）
boxStyle.border.dotted,点線,Dotted,設定 > Box スタイル の選択肢（枠線）
boxStyle.border.double,二重線,Double,設定 > Box スタイル の選択肢（枠線）
boxStyle.shape.rect,矩形,Rectangle,設定 > Box スタイル の選択肢（形状）
boxStyle.shape.ellipse,楕円,Ellipse,設定 > Box スタイル の選択肢（形状）
boxStyle.body,本体の色・文字,Body color and text,設定 > Box スタイル の小見出し
boxStyle.fontSize,文字サイズ (px),Text size (px),設定 > Box スタイル の項目名
boxStyle.typeLabelColors,タイプラベル色,Type label colors,設定 > Box スタイル の小見出し
boxStyle.subLabelColors,サブラベル色,Sub-label colors,設定 > Box スタイル の小見出し
boxStyle.resetType.tip,{{type}} のプリセットを削除し、工場出荷時 + Box 個別設定のみで描画,Delete the {{type}} preset and draw with factory defaults plus per-Box settings only,設定 > Box スタイル のボタンのツールチップ（{{type}} は Box の種類）
boxStyle.resetType,このタイプを工場出荷時に戻す,Reset this type to factory defaults,設定 > Box スタイル のボタン
line.defaultStyle,既定スタイル,Default style,設定 > Line（矢印） の見出し
line.defaultStyle.hint,ここで決めた値が、これから引く矢印の初期値になります。既存の矢印は変わりません（下の「全 Line に適用」で反映できます）。同じ項目は「全体」タブからも変更できます。,"These values become the initial values for arrows you draw from now on. Existing arrows are not changed (use ""Apply to all lines"" below). The same items can also be changed on the ""General"" tab.",設定 > Line（矢印） の説明文
line.endpoints,端点,Endpoints,設定 > Line（矢印） の見出し
line.endpoints.hint,矢印の始点・終点をずらす既定値。角度モードが ON のときオフセットは無効になり、マージンだけが効きます（プロパティパネルの挙動と同じ）。,"Default shifts for the start and end points of arrows. When angle mode is on, offsets are ignored and only margins apply (same as in the properties panel).",設定 > Line（矢印） の説明文
line.startOffset,始点オフセット Time / Item (px),Start offset Time / Item (px),設定 > Line（矢印） の項目名
line.endOffset,終点オフセット Time / Item (px),End offset Time / Item (px),設定 > Line（矢印） の項目名
line.startMargin,始点マージン (px),Start margin (px),設定 > Line（矢印） の項目名
line.startMargin.tip,始点から方向ベクトル沿いに離す距離。重なり回避に使う,Distance to move away from the start point along the direction. Used to avoid overlaps.,設定 > Line（矢印） のツールチップ
line.endMargin,終点マージン (px),End margin (px),設定 > Line（矢印） の項目名
line.angleMode,角度モード,Angle mode,設定 > Line（矢印） の項目名
line.angleDeg,角度 (-85〜85 度),Angle (-85 to 85 degrees),設定 > Line（矢印） の項目名
line.bulk,一括適用,Apply to all,設定 > Line（矢印） の見出し
line.bulk.hint,現在のシート（{{sheet}}）の Line {{n}} 本に既定スタイルを適用します。SD/SG の一括配置と同じくシート単位です。,"Applies the default style to the {{n}} lines on the current sheet ({{sheet}}). Like bulk SD/SG placement, this works per sheet.",設定 > Line（矢印） の説明文（{{sheet}} はシート名、{{n}} は本数）
line.bulk.includeType,線種（実線 / 点線）も揃える,Also unify line type (solid / dashed),設定 > Line（矢印） の項目名
line.bulk.includeType.warn,実現径路（実線）と未実現径路（点線）の区別が失われます。,The distinction between realized (solid) and unrealized (dashed) paths will be lost.,設定 > Line（矢印） の注意の文
line.bulk.resetControlPoints,曲線の手動制御点もリセット,Also reset manual curve control points,設定 > Line（矢印） の項目名
line.bulk.controlPoints.hint,OFF のままなら、Canvas で手動調整した制御点は温存されます（現在のシートで手動設定は {{n}} 本）。,"When off, control points adjusted by hand on the canvas are kept ({{n}} lines on the current sheet have manual control points).",設定 > Line（矢印） の説明文（{{n}} は本数）
line.bulk.confirm.apply,現在のシートの全 Line ({{n}} 本) に既定スタイルを適用します。,Apply the default style to all lines on the current sheet ({{n}}).,設定 > Line（矢印） の確認の文（{{n}} は本数）
line.bulk.confirm.reset,個別に設定した形状・色・太さ・オフセット・マージン・角度はリセットされます。,"Shape, color, width, offsets, margins and angle set on individual lines will be reset.",設定 > Line（矢印） の確認の文
line.bulk.confirm.type,線種も揃えるため、実線 / 点線の区別が失われます。,"Line types will be unified, so the solid / dashed distinction will be lost.",設定 > Line（矢印） の確認の文
line.bulk.confirm.controlPoints,手動で調整した曲線の制御点 ({{n}} 本) も破棄されます。,Manually adjusted curve control points ({{n}} lines) will also be discarded.,設定 > Line（矢印） の確認の文（{{n}} は本数）
line.bulk.apply,既定スタイルを全 Line に適用,Apply default style to all lines,設定 > Line（矢印） のボタン
sdsg.noData,SD/SG 配置の設定データがありません。,No SD/SG placement settings.,設定 > SD/SG 配置 の説明文
sdsg.band.topH,上部 (SD),Top (SD),設定 > SD/SG 配置 の帯の見出し（横型）
sdsg.band.topV,右側 (SD),Right (SD),設定 > SD/SG 配置 の帯の見出し（縦型）
sdsg.band.bottomH,下部 (SG),Bottom (SG),設定 > SD/SG 配置 の帯の見出し（横型）
sdsg.band.bottomV,左側 (SG),Left (SG),設定 > SD/SG 配置 の帯の見出し（縦型）
sdsg.mode,SD/SG 配置モード,SD/SG placement mode,設定 > SD/SG 配置 の見出し
sdsg.mode.hint1,SD/SG を Box 群の外側に用意した「帯」に配置するモードです。,"Places SD/SG in ""bands"" outside the group of Boxes.",設定 > SD/SG 配置 の説明文（1 文目）
sdsg.mode.hint2,時期区分や非可逆的時間の内側に帯を設け、SD/SG を一列に並べます。,"The bands sit inside the period and the irreversible time, and SD/SG are lined up in a row.",設定 > SD/SG 配置 の説明文（2 文目）
sdsg.enable,機能を有効化,Enable,設定 > SD/SG 配置 の項目名
sdsg.enable.hint,OFF: 従来通り attachedTo Box に追従 / ON: 上部(SD)帯・下部(SG)帯を選べる,OFF: follows the attachedTo Box as before / ON: the top (SD) and bottom (SG) bands can be used,設定 > SD/SG 配置 の説明文
sdsg.band.use,この帯を使う,Use this band,設定 > SD/SG 配置 の項目名
sdsg.band.height,帯の高さ,Band height,設定 > SD/SG 配置 の項目名
sdsg.band.height.auto,自動（SDSG/ラベルに合わせる）,Auto (fit SD/SG and label),設定 > SD/SG 配置 の選択肢
sdsg.band.height.manual,手動指定,Manual,設定 > SD/SG 配置 の選択肢
sdsg.band.heightLevel,高さ (Level),Height (Level),設定 > SD/SG 配置 の項目名
sdsg.band.reference,配置基準,Placement reference,設定 > SD/SG 配置 の項目名
sdsg.band.reference.boxes,Box 群の外側（直接）,Outside the Boxes (direct),設定 > SD/SG 配置 の選択肢
sdsg.band.reference.period,時期区分の内側,Inside the period,設定 > SD/SG 配置 の選択肢
sdsg.band.reference.timearrow,非可逆的時間の内側,Inside the irreversible time,設定 > SD/SG 配置 の選択肢
sdsg.band.offsetLevel,基準からの距離 (Level),Distance from reference (Level),設定 > SD/SG 配置 の項目名
sdsg.band.showBorder,編集時に帯範囲を表示,Show band area while editing,設定 > SD/SG 配置 の項目名
sdsg.band.fill,背景塗りつぶし,Background fill,設定 > SD/SG 配置 の項目名
sdsg.band.fill.tinted,薄く塗る,Light tint,設定 > SD/SG 配置 の選択肢
sdsg.band.fill.none,塗らない（枠線のみ）,None (border only),設定 > SD/SG 配置 の選択肢
sdsg.band.labelPosition,ラベル位置,Label position,設定 > SD/SG 配置 の項目名
sdsg.band.labelPosition.topLeft,左上,Top left,設定 > SD/SG 配置 の選択肢
sdsg.band.labelPosition.topRight,右上,Top right,設定 > SD/SG 配置 の選択肢
sdsg.band.labelPosition.bottomLeft,左下,Bottom left,設定 > SD/SG 配置 の選択肢
sdsg.band.labelPosition.bottomRight,右下,Bottom right,設定 > SD/SG 配置 の選択肢
sdsg.behavior,配置の挙動,Placement behavior,設定 > SD/SG 配置 の見出し
sdsg.autoArrange,重なり時に自動整列,Auto-arrange when overlapping,設定 > SD/SG 配置 の項目名
sdsg.autoArrange.hint,ON: 同じ時間位置で重なる SDSG を帯内で自動的に縦積み / OFF: 重なっても整列しない,ON: SD/SG overlapping at the same time position are stacked automatically in the band / OFF: they are not arranged,設定 > SD/SG 配置 の説明文
sdsg.shrinkToFitRow,row が多い時、SDSG を帯内に圧縮,Shrink SD/SG to fit the band when there are many rows,設定 > SD/SG 配置 の項目名
sdsg.shrinkToFitRow.hint,ON: SDSG の高さを row span に合わせて自動圧縮 / OFF: はみ出しを許容（赤枠で警告）。主に manual 高さモードで効果あり,ON: SD/SG height is shrunk to fit the row span / OFF: overflow is allowed (warned with a red frame). Mainly affects manual height mode,設定 > SD/SG 配置 の説明文
sdsg.autoExpandHeight,row が多い時、帯を自動拡張,Auto-expand the band when there are many rows,設定 > SD/SG 配置 の項目名
sdsg.autoExpandHeight.manualOnly,(manual モード時),(manual mode),設定 > SD/SG 配置 の項目名の補足
sdsg.autoExpandHeight.hint1,ON: heightLevel を超える row 数が必要な時、帯を一時的に拡張（描画時のみ、設定値は保持）。,"ON: when more rows than heightLevel are needed, the band is expanded temporarily (only when drawing; the setting is kept).",設定 > SD/SG 配置 の説明文（1 文目）
sdsg.autoExpandHeight.hint2,auto 高さモードでは常に row 数に応じて自動拡張されるため、この設定は manual モード時のみ影響します。,"In auto height mode the band always expands with the number of rows, so this setting only affects manual mode.",設定 > SD/SG 配置 の説明文（2 文目）
sdsg.allowMismatched,組合せ制限を解除,Remove placement restriction,設定 > SD/SG 配置 の項目名
sdsg.allowMismatched.hint,既定では SD は上部(SD)帯のみ、SG は下部(SG)帯のみに配置可能。ON にすると逆向き（SD を下部(SG)帯、SG を上部(SD)帯）も許可されます,"By default SD can be placed only in the top (SD) band and SG only in the bottom (SG) band. When on, the reverse (SD in the bottom (SG) band, SG in the top (SD) band) is also allowed",設定 > SD/SG 配置 の説明文
sdsg.autoFlip,band 位置で方向点を自動反転,Flip the direction point by band position,設定 > SD/SG 配置 の項目名
sdsg.autoFlip.hint,ON: 種別と band 位置が食い違う時（例: SD を下部(SG)帯、SG を上部(SD)帯）に五角形の点を反転させ、常に Box 群を指す向きにします。OFF: 種別固有の向き（SD=下向き / SG=上向き、横型の場合）を維持,"ON: when the type and band position do not match (e.g. SD in the bottom (SG) band, SG in the top (SD) band), the point of the pentagon is flipped so it always points toward the Boxes. OFF: keeps the direction of the type (SD = down / SG = up in horizontal layout)",設定 > SD/SG 配置 の説明文
sdsg.bulk,一括配置,Bulk placement,設定 > SD/SG 配置 の見出し
sdsg.autoPlaceSD,SD の既定配置,Default SD placement,設定 > SD/SG 配置 の項目名
sdsg.autoPlaceSG,SG の既定配置,Default SG placement,設定 > SD/SG 配置 の項目名
sdsg.place.none,配置しない（attached）,Do not place (attached),設定 > SD/SG 配置 の選択肢
sdsg.place.top,上部(SD)帯,Top (SD) band,設定 > SD/SG 配置 の選択肢
sdsg.place.bottomNeedsUnlock,下部(SG)帯（要組合せ解除）,Bottom (SG) band (requires removing the restriction),設定 > SD/SG 配置 の選択肢
sdsg.place.topNeedsUnlock,上部(SD)帯（要組合せ解除）,Top (SD) band (requires removing the restriction),設定 > SD/SG 配置 の選択肢
sdsg.place.bottom,下部(SG)帯,Bottom (SG) band,設定 > SD/SG 配置 の選択肢
sdsg.bulk.confirm,全 SD/SG の配置を既定設定で一括変更します。個別の offset はリセットされます。よろしいですか?,Change the placement of all SD/SG to the default settings? Individual offsets will be reset.,設定 > SD/SG 配置 の確認の文
sdsg.bulk.apply,既定配置を全 SD/SG に適用,Apply default placement to all SD/SG,設定 > SD/SG 配置 のボタン
project.docInfo,ドキュメント情報,Document info,設定 > プロジェクト の見出し
project.createdAt,作成日,Created,設定 > プロジェクト の項目名
project.history,編集履歴,Edit history,設定 > プロジェクト の項目名
project.historyCount,{{n}}/50件,{{n}}/50,設定 > プロジェクト の履歴の件数（{{n}} は件数）
project.defaults,既定値,Defaults,設定 > プロジェクト の見出し
project.defaultBoxSize,Box の既定サイズ,Default Box size,設定 > プロジェクト の小見出し
project.defaultBoxSize.hint1,「挿入」タブで Box を追加するときや CSV インポート時のデフォルトサイズ（ピクセル）。,"Default size (pixels) when adding a Box from the ""Insert"" tab or importing a CSV.",設定 > プロジェクト の説明文（1 文目）
project.defaultBoxSize.hint2,テキスト方向は現在のレイアウトに応じて自動設定されます（横型 → 縦書き / 縦型 → 横書き）。,Text direction is set automatically from the current layout (horizontal → vertical text / vertical → horizontal text).,設定 > プロジェクト の説明文（2 文目）
project.defaultBoxWidth,既定Box幅 (px),Default Box width (px),設定 > プロジェクト の項目名
project.defaultBoxHeight,既定Box高さ (px),Default Box height (px),設定 > プロジェクト の項目名
project.presets,プリセット:,Presets:,設定 > プロジェクト のボタンの前の字
project.preset.tall,縦長 (60×100),Tall (60×100),設定 > プロジェクト のボタン
project.preset.wide,横長 (100×50),Wide (100×50),設定 > プロジェクト のボタン
project.preset.square,正方形 (80×80),Square (80×80),設定 > プロジェクト のボタン
project.textDefaults,文字の既定,Text defaults,設定 > プロジェクト の小見出し
project.defaultFont,既定フォント,Default font,設定 > プロジェクト の項目名
project.defaultFontSize,既定サイズ (pt),Default size (pt),設定 > プロジェクト の項目名
period.bandStyle,描画スタイル,Drawing style,設定 > 時期区分 の項目名
period.bandStyle.band,帯（|---時期1---|---時期2---|）,Band (|---Period 1---|---Period 2---|),設定 > 時期区分 の選択肢
period.bandStyle.tick,点（ラベル + 短い区切り）,Tick (label + short divider),設定 > 時期区分 の選択肢
period.showDividers,区切り線を描画,Draw dividers,設定 > 時期区分 の項目名
period.enterLabel,ラベルを入力してください,Enter a label.,設定 > 時期区分 の警告の文
period.list,時期ラベル（現シート）,Period labels (current sheet),設定 > 時期区分 の見出し
period.list.hint,メインウィンドウの時期ラベルをダブルクリック、または「表示」タブの「時期編集...」でもここが開きます。,"This also opens when you double-click a period label in the main window or use ""Edit periods..."" on the ""View"" tab.",設定 > 時期区分 の説明文
period.newLabel,新規ラベル,New label,設定 > 時期区分 の項目名
period.newLabel.placeholder,例: 入学前,e.g. Before entering school,設定 > 時期区分 の入力欄の薄い字（例）
period.add,追加,Add,設定 > 時期区分 のボタン
period.empty,まだ時期ラベルがありません。,No period labels yet.,設定 > 時期区分 の説明文
legend.targets,表示対象,Items to show,設定 > 凡例 の見出し
legend.autoGenerate,自動生成（使用記号を抽出）,Auto-generate (collect symbols in use),設定 > 凡例 の項目名
legend.includeBoxes,Box 種別を含む,Include Box types,設定 > 凡例 の項目名
legend.realityOnly,簡素化方式の凡例（実線・点線の 2 項目）,Simplified legend (solid and dotted only),設定 > 凡例 の項目名（簡素化方式のテーマを当てると入る）
legend.realityOnly.title,"Box と径路をまとめて，「実現した行為・径路」（実線）と「実現しなかった行為・径路」（点線）の 2 項目にします。簡素化方式のテーマを当てると入ります。","Combines Boxes and trajectories into two items: realized (solid) and unrealized (dotted). Turned on when the simplified theme is applied.",設定 > 凡例 > 簡素化方式の凡例 の説明（マウスを重ねたとき）
legend.includeLines,Line 種別を含む,Include line types,設定 > 凡例 の項目名
legend.includeSDSG,SD/SG を含む,Include SD/SG,設定 > 凡例 の項目名
legend.includeTimeArrow,非可逆的時間を含む,Include irreversible time,設定 > 凡例 の項目名
legend.showTitle,タイトルを表示,Show title,設定 > 凡例 の項目名
legend.titleText,タイトル文字列,Title text,設定 > 凡例 の項目名
legend.titlePosition,タイトルの配置位置,Title position,設定 > 凡例 の項目名
legend.titleWritingMode,タイトルの書き方向,Title writing direction,設定 > 凡例 の項目名
legend.writing.horizontal,横書き,Horizontal,設定 > 凡例 の選択肢（書き方向）
legend.writing.vertical,縦書き,Vertical,設定 > 凡例 の選択肢（書き方向）
legend.titleAlign,タイトルの揃え,Title alignment,設定 > 凡例 の項目名
legend.align.left,左揃え,Left,設定 > 凡例 の選択肢
legend.align.center,中央揃え,Center,設定 > 凡例 の選択肢
legend.align.right,右揃え,Right,設定 > 凡例 の選択肢
legend.titleVerticalAlign,タイトルの上下揃え（左側配置時）,Title vertical alignment (when on the left),設定 > 凡例 の項目名
legend.vAlign.top,上,Top,設定 > 凡例 の選択肢（上下の揃え）
legend.vAlign.bottom,下,Bottom,設定 > 凡例 の選択肢（上下の揃え）
legend.titleFont,タイトル フォント,Title font,設定 > 凡例 の項目名
legend.sameAsBody,（本文と同じ）,(Same as body),設定 > 凡例 の選択肢
legend.titleSize,タイトル サイズ (px),Title size (px),設定 > 凡例 の項目名
legend.titleSize.default,既定 {{n}},Default {{n}},設定 > 凡例 の空欄の時の表示（{{n}} は既定の大きさ）
legend.titleDecoration,タイトル 装飾,Title style,設定 > 凡例 の項目名
legend.layout.hint1,凡例は「列数で指定」または「行数で指定」を選択できます。,"The legend layout can be set ""By columns"" or ""By rows"".",設定 > 凡例 の説明文（1 文目）
legend.layout.hint2,行数指定時は項目数から列数が自動算出されます。,"When set by rows, the number of columns is calculated from the number of items.",設定 > 凡例 の説明文（2 文目）
legend.horizontal.mode,横型: 指定方式,Horizontal: layout by,設定 > 凡例 の項目名
legend.horizontal.rows,横型: 行数,Horizontal: rows,設定 > 凡例 の項目名
legend.horizontal.columns,横型: 列数,Horizontal: columns,設定 > 凡例 の項目名
legend.vertical.mode,縦型: 指定方式,Vertical: layout by,設定 > 凡例 の項目名
legend.vertical.rows,縦型: 行数,Vertical: rows,設定 > 凡例 の項目名
legend.vertical.columns,縦型: 列数,Vertical: columns,設定 > 凡例 の項目名
legend.mode.columns,列数で指定,By columns,設定 > 凡例 の選択肢
legend.mode.rows,行数で指定,By rows,設定 > 凡例 の選択肢
legend.sampleWidth,サンプル図形 幅 (px),Sample shape width (px),設定 > 凡例 の項目名
legend.sampleHeight,サンプル図形 高さ (px),Sample shape height (px),設定 > 凡例 の項目名
legend.bodyFont,本文 フォント,Body font,設定 > 凡例 の項目名
legend.uiDefault,（UI 既定）,(UI default),設定 > 凡例 の選択肢
legend.bodyFontSize,本文 フォントサイズ (px),Body font size (px),設定 > 凡例 の項目名
legend.minWidth,最小幅 (px),Minimum width (px),設定 > 凡例 の項目名
legend.showDescriptions,2行目（説明文）を既定で表示,Show the second line (description) by default,設定 > 凡例 の項目名
legend.fixedSize,サイズ（固定）,Size (fixed),設定 > 凡例 の見出し
legend.fixedSize.hint1,凡例の幅・高さを固定すると、キャンバスのスクロールや zoom に関係なく同じ見た目になります。,Fixing the width and height keeps the legend looking the same regardless of canvas scrolling or zoom.,設定 > 凡例 の説明文（1 文目）
legend.fixedSize.hint2,未入力の場合は内容に合わせて自動。右下のハンドルをドラッグしても調整できます。,"If left empty, the size fits the content. You can also drag the handle at the bottom right.",設定 > 凡例 の説明文（2 文目）
legend.width,幅 (px),Width (px),設定 > 凡例 の項目名
legend.height,高さ (px),Height (px),設定 > 凡例 の項目名
legend.resetSize,自動に戻す,Reset to Auto,設定 > 凡例 のボタン
legend.backgroundAndBorder,背景・枠線,Background and border,設定 > 凡例 の見出し
legend.background,背景,Background,設定 > 凡例 の項目名
legend.background.white,白,White,設定 > 凡例 の選択肢
legend.background.none,透明（背景なし）,Transparent (no background),設定 > 凡例 の選択肢
legend.borderWidth,枠線の太さ (px、0=透明),"Border width (px, 0 = none)",設定 > 凡例 の項目名
legend.separator,タイトルと項目の区切り線,Separator between title and items,設定 > 凡例 の見出し
legend.separator.color,色,Color,設定 > 凡例 の項目名
legend.overrides,項目別の表記 (上書き設定),Per-item text (overrides),設定 > 凡例 の見出し
legend.overrides.hint1,現在使用中の凡例項目について、ラベル（1行目）と説明文（2行目）を上書きできます。,You can override the label (first line) and description (second line) of the legend items in use.,設定 > 凡例 の説明文（1 文目）
legend.overrides.hint2,空欄にすると既定に戻ります。,Leave empty to use the default.,設定 > 凡例 の説明文（2 文目）
legend.overrides.allSecondLine,すべての項目の2行目:,Second line of all items:,設定 > 凡例 のボタンの前の字
legend.overrides.showAll,一括表示,Show all,設定 > 凡例 のボタン
legend.overrides.hideAll,一括非表示,Hide all,設定 > 凡例 のボタン
legend.overrides.resetAll,既定に戻す,Reset to default,設定 > 凡例 のボタン
legend.overrides.resetAll.tip,項目別設定を解除して全体既定に従う,Clear per-item settings and follow the overall default,設定 > 凡例 のボタンのツールチップ
legend.overrides.empty,現シートには凡例項目がありません,The current sheet has no legend items,設定 > 凡例 の説明文
legend.overrides.label,ラベル（1行目）,Label (first line),設定 > 凡例 の項目名
legend.overrides.description,説明（2行目）,Description (second line),設定 > 凡例 の項目名
legend.overrides.showDescription,2行目を表示,Show second line,設定 > 凡例 の項目名
legend.overrides.inheritShown,（全体既定 =表示）,(Default: shown),設定 > 凡例 の選択肢（全体の既定に従う・今は表示）
legend.overrides.inheritHidden,（全体既定 =非表示）,(Default: hidden),設定 > 凡例 の選択肢（全体の既定に従う・今は非表示）
legend.overrides.clear,この項目の上書きを解除,Clear overrides for this item,設定 > 凡例 のボタン
legend.footer.hint,凡例はキャンバス上でドラッグして位置調整、ダブルクリックでこの設定を開けます,Drag the legend on the canvas to move it; double-click it to open these settings,設定 > 凡例 の説明文
timeArrow.autoInsert,エクスポート時に自動挿入,Insert automatically on export,設定 > 非可逆的時間 の項目名
timeArrow.alwaysVisible,編集中も常時表示,Always show while editing,設定 > 非可逆的時間 の項目名
timeArrow.startExtension,開始レベル拡張（minTimeLevel に加算）,Start level extension (added to minTimeLevel),設定 > 非可逆的時間 の項目名
timeArrow.endExtension,終了レベル拡張（maxTimeLevel に加算）,End level extension (added to maxTimeLevel),設定 > 非可逆的時間 の項目名
timeArrow.itemOffset,基準からのオフセット（±レベル）,Offset from reference (± level),設定 > 非可逆的時間 の項目名
timeArrow.itemOffset.tip,+ で外側（基準位置から Box 群の反対側へ）、- で内側（Box 群寄り）,"+ moves outward (away from the Boxes), - moves inward (toward the Boxes)",設定 > 非可逆的時間 のツールチップ
timeArrow.labelOffset,ラベルオフセット (px),Label offset (px),設定 > 非可逆的時間 の項目名
timeArrow.labelAlignHorizontal,ラベル揃え（横型：矢印方向）,Label alignment (horizontal: along the arrow),設定 > 非可逆的時間 の項目名
timeArrow.labelAlign.end,右寄り（矢印先端側）,Right (arrow head side),設定 > 非可逆的時間 の選択肢
timeArrow.labelAlignVertical,ラベル揃え（縦型：矢印方向）,Label alignment (vertical: along the arrow),設定 > 非可逆的時間 の項目名
timeArrow.labelAlign.start,上寄り（矢印始点側）,Top (arrow start side),設定 > 非可逆的時間 の選択肢
timeArrow.labelFont,ラベル フォント,Label font,設定 > 非可逆的時間 の項目名
timeArrow.uiDefault,（UI既定）,(UI default),設定 > 非可逆的時間 の選択肢
timeArrow.labelDecoration,ラベル 装飾,Label style,設定 > 非可逆的時間 の項目名
timeArrow.strokeWidth,線の太さ (pt),Line width (pt),設定 > 非可逆的時間 の項目名
`,Jf=`\uFEFFkey,ja,en,note
"prompt.rename","シート名を変更","Rename sheet","入力の窓（シートのタブをダブルクリック・名前を変更）"
"alert.lastSheet","最後のシートは削除できません","The last sheet cannot be deleted.","警告の窓（シートが 1 枚だけのときに削除）"
"confirm.delete","このシートを削除しますか？（取り消せません）","Delete this sheet? (This cannot be undone.)","確認の窓（シートの削除）"
"tab.title","右クリックで操作メニュー","Right-click for options","画面下のシートのタブの説明（マウスを重ねたとき）"
"add.title","新規シート","New sheet","画面下の + ボタンの説明（マウスを重ねたとき）"
"menu.rename","名前を変更","Rename","シートのタブの右クリックメニュー"
"menu.duplicate","複製","Duplicate","シートのタブの右クリックメニュー"
"menu.moveLeft","← 左へ移動","← Move left","シートのタブの右クリックメニュー"
"menu.moveRight","→ 右へ移動","→ Move right","シートのタブの右クリックメニュー"
"menu.delete","削除","Delete","シートのタブの右クリックメニュー"
"menu.delete.disabled","最後のシートは削除できません","The last sheet cannot be deleted","右クリックメニューの削除の説明（使えないとき・マウスを重ねたとき）"
`,Zf=`\uFEFFkey,ja,en,note
"title","移動 / 一括移動","Move / Batch move","移動の画面 > 見出し"
"drag","ドラッグで移動","Drag to move","移動の画面 > 見出しの帯にマウスを載せたときの説明（画面そのものを動かす）"
"hint","▲▼ を押すと {{step}} Level 単位で即時に移動。数値を直接指定する場合は「移動」ボタンで反映。{{key}} で取り消し可。","Press ▲▼ to move immediately in steps of {{step}} level. To enter values directly, apply them with the Move button. Undo with {{key}}.","移動の画面 > 上の説明（step は 1 回の移動量・key は取り消しのショートカット）"
"axis.time.h","Time_Level 方向（右=＋）","Time_Level direction (right = +)","移動の画面 > 時間軸の欄の名前（横型の図）"
"axis.time.v","Time_Level 方向（下=＋）","Time_Level direction (down = +)","移動の画面 > 時間軸の欄の名前（縦型の図）"
"axis.item.h","Item_Level 方向（上=＋）","Item_Level direction (up = +)","移動の画面 > 項目軸の欄の名前（横型の図）"
"axis.item.v","Item_Level 方向（右=＋）","Item_Level direction (right = +)","移動の画面 > 項目軸の欄の名前（縦型の図）"
"target","対象","Target","移動の画面 > 何を動かすかの欄の名前"
"target.selected","選択中 Box ({{count}}個)","Selected Boxes ({{count}})","移動の画面 > 対象の選択肢（count は選択中の Box の数）"
"target.all","全体（時期/時間矢印/凡例除く）","Everything (except periods, time arrow and legend)","移動の画面 > 対象の選択肢"
"time.back","{{step}} Level 前へ即時移動","Move {{step}} level back now","移動の画面 > ◀ ボタンの説明"
"time.forward","{{step}} Level 後へ即時移動","Move {{step}} level forward now","移動の画面 > ▶ ボタンの説明"
"item.up","{{step}} Level 上（＋）へ即時移動","Move {{step}} level up (+) now","移動の画面 > ▲ ボタンの説明"
"item.down","{{step}} Level 下（－）へ即時移動","Move {{step}} level down (−) now","移動の画面 > ▼ ボタンの説明"
"applyValues","数値で移動","Move by values","移動の画面 > 入力した数値で動かすボタン"
"clearValues","値をクリア","Clear values","移動の画面 > 入力した数値を 0 に戻すボタン"
"close","閉じる","Close","移動の画面 > 閉じるボタン"
`,eg=`\uFEFFkey,ja,en,note
title,原文参照 ({{count}}),Source references ({{count}}),プロパティ > 原文参照の節の見出し（count は件数）
title.unresolved,⚠{{count}} 追従不能,⚠{{count}} not tracked,原文参照の節の見出しの後ろに付く注意（原文の編集で位置が分からなくなった件数）
title.unreferenced,⚠ 未引用,⚠ Not cited,原文参照の節の見出しの後ろに付く注意（逐語録があるのに引用が 0 件）
title.coverage,協力者 {{count}},{{count}} participants,原文参照の節の見出しの後ろに付く協力者の人数
title.coverage_one,協力者 {{count}},{{count}} participant,件数が 1 のときの英語の形（日本語は使われない）
unassigned,(未割当),(unassigned),協力者が割り当てられていない逐語録（協力者の名前の並びの中）
warn.noRefs,原文への引用がありません,No citations from the transcript,原文参照の節の赤い注意の太字
warn.noRefs.hint,この要素は原文ビューアで段落をリンクすると根拠を保証できます。,Link a paragraph in the transcript viewer to ground this element in the data.,原文参照の節の赤い注意の説明
coverage.tooltip,TEM の 1/4/9/16 法則: 4 協力者以上で類型としての強度が高まる,"TEM 1/4/9/16 rule: with 4 or more participants, the pattern becomes stronger as a type",協力者の数の枠の説明（マウスを乗せると出る）
coverage.count,協力者カバレッジ: {{count}} 名,Participant coverage: {{count}},原文参照の節の協力者の数の枠（太字）
coverage.enough,(1/4/9/16 法則: 類型として十分),(1/4/9/16 rule: sufficient as a type),協力者の数の枠の補足（4 名以上）
coverage.multiple,(複数協力者から支持),(supported by multiple participants),協力者の数の枠の補足（2〜3 名）
coverage.single,(単一協力者のみ),(single participant only),協力者の数の枠の補足（1 名）
coverage.targets,対象: {{names}},Participants: {{names}},協力者の数の枠の 2 行目（協力者の仮名の並び）
empty,この要素に紐付く原文引用はまだありません。,No transcript citations are linked to this element yet.,原文参照の節で引用が 0 件のときの文
session,第{{n}}回,Session {{n}},引用の一覧の逐語録の回（インタビューの何回目か）
unknownTranscript,（原文不明）,(Unknown transcript),引用の一覧で逐語録が見つからないとき
quote,「{{text}}」,"""{{text}}""",引用の一覧の引用文を囲むかぎ括弧
unresolved,原文編集により位置追従に失敗しています,Could not track the position after the transcript was edited,引用の一覧の赤い注意
jump,原文へジャンプ,Go to transcript,引用の一覧のボタン
unlink,リンク解除,Unlink,引用の一覧のボタン
confirm.unlink,"このリンクを解除しますか？
（原文と要素自体は残ります）","Remove this link?
(The transcript and the element are kept.)",リンク解除ボタンを押したときの確認の文
openViewer,原文ビューアを開く,Open transcript viewer,原文参照の節の下のボタン
`,tg=`\uFEFFkey,ja,en,note
"title","TEMer へようこそ","Welcome to TEMer","起動ウィザード（アプリを開いたときの窓）の見出し"
"close.title","閉じて空のシートで始める","Close and start with an empty sheet","起動ウィザードの × ボタンの説明（マウスを重ねたとき）"
"main.hint","何から始めますか？ 後からファイル / 原文ビューア / リボンメニューでも切り替えられます。","How would you like to start? You can change this later from the File tab, the transcript viewer or the ribbon.","起動ウィザードの最初の画面の案内"
"newFromFile.title","ファイルから新規作成","New from a file","起動ウィザードのカードの題"
"newFromFile.desc","原文 (インタビュー逐語録) や切片 CSV/Excel を元に TEM 図を作り始める","Start a TEM diagram from transcripts (interview records) or a CSV/Excel file of segments","起動ウィザードのカードの説明"
"openProject.title","プロジェクトを開く","Open a project","起動ウィザードのカードの題"
"openProject.desc","保存済の .tem ファイルを開く ({{key}} 相当)","Open a saved .tem file (same as {{key}})","起動ウィザードのカードの説明。{{key}} はショートカット"
"empty.title","空ファイルから作成","Start from an empty file","起動ウィザードのカードの題"
"empty.desc","空の TEM 図 (時期1 / 時期2) から始める","Start with an empty TEM diagram (Period 1 / Period 2)","起動ウィザードのカードの説明"
"demo.title","デモファイルを開く","Open demo file","起動ウィザードのカードの題（日本語のデモ）"
"demo.desc","架空の例「ピアノの再開」(12 Box / 12 径路 / SD・SG 4 / 3 期)","Fictional example 'Returning to the piano', in Japanese (12 Boxes / 12 paths / 4 SD/SG / 3 periods)","起動ウィザードのカードの説明"
"transcriptDemo.title","原文連動デモを開く","Open transcript demo","起動ウィザードのカードの題"
"transcriptDemo.desc","逐語録と TEM 図のリンク機能のデモ。Box の「原文参照」から逐語録へジャンプ (5 Box / 1 逐語録)","Demo of links between transcripts and the TEM diagram. Jump from a Box's source reference to the transcript (5 Boxes / 1 transcript)","起動ウィザードのカードの説明"
"fromFile.hint","何を元に Box を作成しますか？","What do you want to create Boxes from?","起動ウィザード > ファイルから新規作成 の画面の案内"
"transcript.title","原文 (インタビュー) を 1 ファイル取り込み","Import one transcript file","起動ウィザードのカードの題"
"transcript.desc",".txt / .csv / .xlsx / .docx 形式の逐語録 1 つを取り込み、原文ビューアで段落を選んで Box を作成","Import one transcript in .txt / .csv / .xlsx / .docx format, then select paragraphs in the transcript viewer to create Boxes","起動ウィザードのカードの説明"
"transcriptsBulk.title","原文を複数ファイル/フォルダから一括取り込み","Import transcripts from several files or a folder","起動ウィザードのカードの題"
"transcriptsBulk.desc","A_第1回.docx, A_第2回.docx, B_第1回.docx... をフォルダ選択でまとめて取り込み。ファイル名から協力者・回数を自動推測","Select a folder to import files such as A_1.docx, A_2.docx, B_1.docx... at once. Participant and session are guessed from file names","起動ウィザードのカードの説明（ファイル名の例はその言語でよくある付け方に）"
"csvBoxes.title","切片 (Box) 情報の CSV/Excel から","From a CSV/Excel file of segments (Boxes)","起動ウィザードのカードの題"
"csvBoxes.desc","ラベル・種別・配置などを記載した CSV / Excel / テキストから Box を一括作成","Create Boxes at once from a CSV / Excel / text file listing labels, types, positions and so on","起動ウィザードのカードの説明"
"back","← 戻る","← Back","起動ウィザードのボタン"
"dontShowAgain","次回から表示しない","Don't show this again","起動ウィザードの下のチェックボックス"
"close","閉じる","Close","起動ウィザードのボタン"
`,ng=`\uFEFFkey,ja,en,note
"zoom","ズーム: {{value}}%","Zoom: {{value}}%","画面下の状態の行"
"grid","グリッド: {{state}}","Grid: {{state}}","画面下の状態の行。{{state}} は ON か OFF"
"snap","スナップ: {{state}}","Snap: {{state}}","画面下の状態の行。{{state}} は ON か OFF"
"layout","レイアウト: {{layout}}","Layout: {{layout}}","画面下の状態の行。{{layout}} は 横型 か 縦型（terms の訳）"
"selection","選択: {{count}}","Selected: {{count}}","画面下の状態の行（選んでいる要素の数）"
"overlap","重なり: {{count}} 件","Overlaps: {{count}}","画面下の状態の行（重なりの数）"
"overlap.title","クリックで重なりチェックを開く","Click to open the overlap check","重なりの数の説明（マウスを重ねたとき）"
"unsaved","● 未保存","● Unsaved","画面下の右（保存していない変更があるとき）"
"saved","✓ 保存済み","✓ Saved","画面下の右（保存済みのとき）"
`,og=`\uFEFFkey,ja,en,note
"box.new","新規Box","New box","図 > Box を足したときの最初の文字（図の言語）"
"box.inserted","挿入{{n}}","Inserted {{n}}","図 > 2 つの Box の間に挿入した Box の最初の文字（n は番号・図の言語）"
`,rg=`\uFEFFkey,ja,en,note
error.unsupported,対応していない形式です: {{name}}（対応: .csv / .tsv / .xlsx / .xls）,Unsupported format: {{name}} (supported: .csv / .tsv / .xlsx / .xls),表のファイル（CSV・Excel）を開いたときのエラー
`,ig=`\uFEFFkey,ja,en,note
app.name,TEMer Plus,TEMer Plus,アプリの名前（訳さない）
tem,複線径路等至性モデリング（TEM）,Trajectory Equifinality Modeling (TEM),方法の名前（旧称 複線径路等至性モデル・Trajectory Equifinality Model。モデリングに改称。安田・サトウ編著『TEAによる対人援助プロセスと分岐の記述』表1-2）
tea,複線径路等至性アプローチ（TEA）,Trajectory Equifinality Approach (TEA),方法の名前
boxType.normal,行為,Action,Box の種類（実現した行為・経験。旧称 通常。2026-11-12 安田裕子氏の指摘で改称）
boxType.normal.long,行為,Action,Box の種類の説明
boxType.annotation,潜在的な行為,Potential action,Box の種類（実現しなかったが、ありえた行為。旧称 潜在経験。2026-11-12 改称）
boxType.BFP,分岐点,Bifurcation point,Box の種類。略号 BFP
boxType.EFP,等至点,Equifinality point,Box の種類。略号 EFP
boxType.P-EFP,両極化した等至点,Polarized equifinality point,Box の種類。略号 P-EFP
boxType.OPP,必須通過点,Obligatory passage point,Box の種類。略号 OPP
boxType.2nd-EFP,セカンド等至点,Second equifinality point,Box の種類。略号 2nd EFP。安田・サトウ編著（2022）表1-2 の表記（旧 第 2 等至点・第二等至点）
boxType.P-2nd-EFP,両極化したセカンド等至点,Polarized second equifinality point,Box の種類。略号 P-2nd EFP
boxType.other,その他,Other,Box の種類
line.RLine,実線径路,Solid-line trajectory,実現した径路の矢印（凡例と同じ名前にそろえた。旧 実線矢印。2026-11-10 ユーザー決定。英語は用語集（2025）p. 7 の径路＝trajectory に合わせた（旧 Solid path））
line.XLine,点線径路,Dotted-line trajectory,実現しなかった（想定された）径路の矢印（旧 点線矢印。英語の旧 Dashed path）
path.realized,実現した径路,Realized path,径路の種類
path.unrealized,実現しなかった径路,Unrealized path,径路の種類
SD,社会的方向づけ（SD）,Social direction (SD),径路を妨げる力。略号 SD
SG,社会的助勢（SG）,Social guidance (SG),径路を後押しする力。略号 SG。旧称 社会的ガイド・社会的ガイダンス（安田・サトウ編著『TEAによる対人援助プロセスと分岐の記述』表1-2）
timeArrow,非可逆的時間,Irreversible Time,時間軸の矢印（英語は概念の名前として大文字。凡例と同じ。旧既定 Irreversible time）
period,時期区分,Time division,時期の区切り（英語は用語集（2025）p. 24．画面の短い表示は Period のまま）
periodLabel,時期ラベル,Time division label,時期区分の名前
legend,凡例,Legend,図の記号の説明
sheet,シート,Sheet,1 つのファイルの中の 1 枚の図
box,Box,Box,図の箱（訳さない）
transcript,逐語録,Transcript,インタビューの書き起こし
sourceRef,原文参照,Source reference,Box などと逐語録の箇所を結ぶリンク
notationDeclaration,記号体系の宣言,Notation declaration,論文用レポートの節（Block 1）
notationPolicy,表記方針,Notation policy,論文用レポートの節（11 項目）
paperReport,論文用レポート,Paper report,Word に書き出すレポート
layout.horizontal,横型,Horizontal,図の向き（時間軸が右へ）
layout.vertical,縦型,Vertical,図の向き（時間軸が下へ）
timeLevel,Time レベル,Time level,時間軸の上の位置
itemLevel,Item レベル,Item level,項目軸の上の位置
participant,協力者,Participant,研究に招いた人（HSI の考えでは「ご招待」した人。英語の TEA 文献は participants と呼び、招く動作を invite で表す）
hsi,歴史的構造化ご招待（HSI）,Historically structured inviting (HSI),協力者の選び方。旧称 歴史的構造化サンプリング（HSS）
promoterSign,促進的記号,Promoter sign,TLMG の用語
`,ag=`\uFEFFkey,ja,en,note
title,原文を一括取り込み,Bulk import transcripts,一括取り込みの画面の題
step1.heading,1. ファイル選択 (複数ファイル or フォルダ),1. Choose files (multiple files or a folder),一括取り込み > 手順 1 の見出し
step1.formats,対応形式: .txt / .md / .csv / .tsv / .xlsx / .xls / .docx,Supported formats: .txt / .md / .csv / .tsv / .xlsx / .xls / .docx,一括取り込み > 手順 1 の説明（対応するファイル形式）
step1.filenameHint,ファイル名から協力者・回数を自動推測します。例,"The participant and session number are guessed from the file name. Examples",一括取り込み > 手順 1 の説明（後ろにファイル名の例が続く）
step1.example1,A_第1回.docx,A_session1.docx,一括取り込み > ファイル名の例（その言語で推測できる書き方にする）
step1.folderOrFiles,※ フォルダ選択 (上の input) / または以下から複数ファイル選択:,"Choose a folder above, or choose multiple files below:",一括取り込み > 2 つのファイル選択欄の間の説明
step2.heading,2. 取り込み内容を確認 ({{selected}} / {{total}} 件選択),2. Review ({{selected}} of {{total}} selected),一括取り込み > 手順 2 の見出し
step2.parseErrors,いくつかのファイルでパースに失敗しています (灰色行)。チェックを外すと除外できます。,Some files could not be read (shaded rows). Uncheck them to leave them out.,一括取り込み > 読み込めないファイルがあるときの注意
col.filename,ファイル名,File name,一括取り込み > 表の列名
col.participant,協力者,Participant,一括取り込み > 表の列名
col.session,第N回,Session,一括取り込み > 表の列名（何回目のインタビューか）
col.title,タイトル,Title,一括取り込み > 表の列名
col.note,備考,Notes,一括取り込み > 表の列名
row.paragraphs,{{count}} 段落 / {{format}},{{count}} paragraphs / {{format}},一括取り込み > ファイル名の下の小さな説明（段落の数と形式）
row.paragraphs_one,{{count}} 段落 / {{format}},{{count}} paragraph / {{format}},件数が 1 のときの英語の形（日本語は使われない）
row.tabular,{{count}} 行 / {{format}} (列マッピングは推測値),{{count}} rows / {{format}} (columns guessed),一括取り込み > 表形式のファイルの説明
row.tabular_one,{{count}} 行 / {{format}} (列マッピングは推測値),{{count}} row / {{format}} (columns guessed),件数が 1 のときの英語の形（日本語は使われない）
participant.new,新規作成,New participant,一括取り込み > 協力者の選択肢
participant.none,未割当,Unassigned,一括取り込み > 協力者の選択肢
participant.newName,新規名,New name,一括取り込み > 新しい協力者の名前の入力欄（薄字）
row.guess,推測: {{participant}},Guessed: {{participant}},一括取り込み > 備考の列（ファイル名から推測した協力者）
row.guessWithSession,推測: {{participant}} / 第{{session}}回,Guessed: {{participant}} / session {{session}},一括取り込み > 備考の列（推測した協力者と回数）
step3.heading,3. 一括匿名化 (任意),3. Anonymize all (optional),一括取り込み > 手順 3 の見出し
step3.names,氏名・組織名,Names and organizations,一括取り込み > 匿名化する語の入力欄のラベル
step3.namesPlaceholder,"コンマ区切り (例: 山田太郎, X 大学, 田中)","Comma-separated (e.g. John Smith, X University, Tanaka)",一括取り込み > 匿名化する語の入力欄（薄字）
step3.prefix,仮名 prefix,Pseudonym prefix,一括取り込み > 仮名の頭につける語のラベル
step3.hint,全ファイル共通で適用します。各 Transcript の metadata.anonymizationMap に記録されます。,Applied to all files. Recorded in metadata.anonymizationMap of each transcript.,一括取り込み > 匿名化の説明
progress,取り込み中... {{done}} / {{total}},Importing... {{done}} / {{total}},一括取り込み > 進み具合
doneWithErrors,取り込み完了 (一部エラー):,Import finished (with some errors):,一括取り込み > 一部が失敗したときの見出し
error.parseFailed,{{name}}: パース失敗,{{name}}: could not be read,一括取り込み > 失敗の一覧
error.noParagraphs,{{name}}: 段落が抽出できませんでした,{{name}}: no paragraphs could be extracted,一括取り込み > 失敗の一覧
error.zeroParagraphs,{{name}}: 段落が 0 件 (列推測が外れている可能性があります),{{name}}: 0 paragraphs (the column guess may be wrong),一括取り込み > 失敗の一覧
close,閉じる,Close,一括取り込み > ボタン
cancel,キャンセル,Cancel,一括取り込み > ボタン
importing,取り込み中...,Importing...,一括取り込み > 取り込み中のボタン
importButton,{{count}} 件を一括取り込み,Import {{count}} files,一括取り込み > 取り込むボタン
importButton_one,{{count}} 件を一括取り込み,Import {{count}} file,件数が 1 のときの英語の形（日本語は使われない）
title.session,第{{n}}回,Session {{n}},一括取り込み > 逐語録の題の既定値の回の部分（データに入るので図の言語）
`,sg=`\uFEFFkey,ja,en,note
error.unsupported,"対応していない形式です: {{name}}
対応形式: .txt / .md / .csv / .tsv / .xlsx / .xls / .docx","Unsupported format: {{name}}
Supported: .txt / .md / .csv / .tsv / .xlsx / .xls / .docx",逐語録の取り込み > ファイルを開いたときのエラー（2 行）
error.nottabular,Tabular でないファイルです,Not a tabular file,逐語録の取り込み > 表の形の読み込みでのエラー
error.nosheet,シートが見つかりません,Sheet not found,逐語録の取り込み > 表の形の読み込みでのエラー
error.notparagraph,Paragraph 型でないファイルです,Not a paragraph-type file,逐語録の取り込み > 段落の形の読み込みでのエラー
`,lg=`\uFEFFkey,ja,en,note
title,原文をインポート,Import a transcript,逐語録の取り込みの画面の題
error.empty,インポートデータが空です,There is nothing to import,逐語録の取り込み > 取り込めなかったときの注意
error.zeroParagraphs,段落が 0 件です。列マッピングを確認してください。,There are 0 paragraphs. Check the column mapping.,逐語録の取り込み > 取り込めなかったときの注意
step1.heading,1. ファイルを選択,1. Choose a file,逐語録の取り込み > 手順 1 の見出し
step1.formats,対応形式: .txt / .md / .csv / .tsv / .xlsx / .xls / .docx,Supported formats: .txt / .md / .csv / .tsv / .xlsx / .xls / .docx,逐語録の取り込み > 手順 1 の説明
loading,読み込み中...,Loading...,逐語録の取り込み > ファイルを読んでいる間の表示
step2.heading,2. シート / 列マッピング,2. Sheet / column mapping,逐語録の取り込み > 手順 2 の見出し（表形式のファイル）。ここでのシートは Excel のシート
step2.sheet,シート,Sheet,逐語録の取り込み > Excel のシートの選択のラベル
step2.hasHeader,先頭行をヘッダ扱い,First row is a header,逐語録の取り込み > チェックボックスのラベル
step2.previewRows,プレビュー (先頭 5 行),Preview (first 5 rows),逐語録の取り込み > 見出し
col.speaker,話者,Speaker,逐語録の取り込み > プレビューの列名
col.time,時刻,Time,逐語録の取り込み > プレビューの列名
col.text,本文,Text,逐語録の取り込み > プレビューの列名
step2.previewParagraphs,2. プレビュー (先頭 5 段落),2. Preview (first 5 paragraphs),逐語録の取り込み > 手順 2 の見出し（文章のファイル）
step2.totalParagraphs,合計 {{count}} 段落,{{count}} paragraphs in total,逐語録の取り込み > 段落の数
step2.totalParagraphs_one,合計 {{count}} 段落,{{count}} paragraph in total,件数が 1 のときの英語の形（日本語は使われない）
step3.heading,3. メタデータ,3. Metadata,逐語録の取り込み > 手順 3 の見出し
step3.title,タイトル,Title,逐語録の取り込み > 入力欄のラベル
step3.titlePlaceholder,例: 協力者 A 第1回 (2026-04-15),"e.g. Participant A, session 1 (2026-04-15)",逐語録の取り込み > 題の入力欄（薄字）
step3.participant,協力者,Participant,逐語録の取り込み > 入力欄のラベル
step3.participantNone,（未指定）,(Not specified),逐語録の取り込み > 協力者の選択肢
step3.session,インタビュー回数,Interview session,逐語録の取り込み > 入力欄のラベル
step3.sessionPlaceholder,例: 1 (空欄=未指定),"e.g. 1 (blank = not specified)",逐語録の取り込み > 回数の入力欄（薄字）
step3.sessionHint,同一協力者の第N回。空欄なら順序のみで管理,"Which session with the same participant. If blank, only the order is kept.",逐語録の取り込み > 回数の説明
step3.anonymize,匿名化対象,Names to anonymize,逐語録の取り込み > 入力欄のラベル
step3.anonymizePlaceholder,"氏名・組織名をコンマで区切って入力 (例: 山田太郎, X 大学, 田中)","Enter names and organizations separated by commas (e.g. John Smith, X University, Tanaka)",逐語録の取り込み > 匿名化する語の入力欄（薄字）
step3.prefix,仮名 prefix,Pseudonym prefix,逐語録の取り込み > 仮名の頭につける語のラベル
step3.anonymizeHint,取り込み時に段落本文・話者欄を一括置換します。長い名前から優先で置換 (例: 「山田太郎」が「山田」より先)。元の対応は Transcript.metadata.anonymizationMap に保存され、後で参照・追加が可能です。,"Replaces the names in paragraph text and speaker fields when importing. Longer names are replaced first (e.g. ""John Smith"" before ""Smith""). The original mapping is saved in Transcript.metadata.anonymizationMap so you can check or extend it later.",逐語録の取り込み > 匿名化の説明
chooseAgain,ファイルを選び直す,Choose another file,逐語録の取り込み > ボタン
import,取り込む,Import,逐語録の取り込み > ボタン
close,閉じる,Close,逐語録の取り込み > ボタン
column,列{{n}},Column {{n}},逐語録の取り込み > 見出しの無い列の名前
map.text,本文 列 (必須),Text column (required),逐語録の取り込み > 列の役割のラベル
map.speaker,話者 列 (任意),Speaker column (optional),逐語録の取り込み > 列の役割のラベル
map.none,（なし）,(None),逐語録の取り込み > 列の選択肢
map.timestamp,タイムスタンプ 列 (任意),Timestamp column (optional),逐語録の取り込み > 列の役割のラベル
`,ug=`\uFEFFkey,ja,en,note
title,インタビュー原文ビューア,Transcript viewer,逐語録の画面の題
dragToMove,ドラッグで移動,Drag to move,逐語録の画面 > 題の帯の吹き出し
import,＋ 原文を取り込む,+ Import transcript,逐語録の画面 > ボタン
bulkImport,一括取り込み,Bulk import,逐語録の画面 > ボタン
bulkImport.tip,複数ファイル/フォルダから一括取り込み (ファイル名から協力者・回数を自動推測),Import many files or a folder at once (participant and session are guessed from file names),逐語録の画面 > ボタンの吹き出し
anonExport,匿名化エクスポート,Anonymized export,逐語録の画面 > ボタン
anonExport.tip,人名・組織名を仮名に置換した .tem を別ファイルとして書き出す,Save a separate .tem file with names of people and organizations replaced by pseudonyms,逐語録の画面 > ボタンの吹き出し
popout,別ウィンドウで開く,Open in a new window,逐語録の画面 > ボタンの吹き出し
empty,まだ原文が登録されていません。,No transcripts yet.,逐語録の画面 > 逐語録が無いとき
empty.import,原文ファイルを取り込む,Import a transcript file,逐語録の画面 > 逐語録が無いときのボタン
empty.formats,対応形式: .txt / .csv / .xlsx / .docx,Supported formats: .txt / .csv / .xlsx / .docx,逐語録の画面 > 逐語録が無いときの説明
list.heading,原文 (協力者別),Transcripts (by participant),逐語録の画面 > 左の一覧の見出し
list.confirmDelete,"「{{title}}」を削除しますか？
この原文を参照している全ての SourceRef も削除されます。","Delete ""{{title}}""?
All source references to this transcript will also be deleted.",逐語録の画面 > 削除の確認（2 行）
list.paragraphs,{{count}} 段落 / {{source}},{{count}} paragraphs / {{source}},逐語録の画面 > 左の一覧の小さな説明（段落の数と形式）
list.paragraphs_one,{{count}} 段落 / {{source}},{{count}} paragraph / {{source}},件数が 1 のときの英語の形（日本語は使われない）
session,第{{n}}回,Session {{n}},逐語録の画面 > 何回目のインタビューか
sessionNone,(回数未指定),(no session),逐語録の画面 > 回数が無いとき
unassigned,(未割当),(Unassigned),逐語録の画面 > 協力者が決まっていない逐語録のまとまり
delete,削除,Delete,逐語録の画面 > 左の一覧のボタン
resizeLeft,ドラッグで左ペインの幅を変更,Drag to resize the left pane,逐語録の画面 > 区切りの吹き出し
resizeRight,ドラッグで右ペインの幅を変更,Drag to resize the right pane,逐語録の画面 > 区切りの吹き出し
resize,ドラッグでサイズ変更,Drag to resize,逐語録の画面 > 右下の角の吹き出し
search.placeholder.all,全原文を横断検索,Search all transcripts,逐語録の画面 > 検索欄（薄字）
search.placeholder.participant,同じ協力者の全回を検索,Search all sessions of this participant,逐語録の画面 > 検索欄（薄字）
search.placeholder.current,検索キーワード (現在の原文),Search (current transcript),逐語録の画面 > 検索欄（薄字）
search.scope,検索範囲,Search scope,逐語録の画面 > 検索範囲の吹き出し
search.scope.current,現在の原文,Current transcript,逐語録の画面 > 検索範囲の選択肢
search.scope.participant,同じ協力者の全回,All sessions of this participant,逐語録の画面 > 検索範囲の選択肢
search.scope.all,全原文を横断,All transcripts,逐語録の画面 > 検索範囲の選択肢
search.hits,ヒット {{count}} 段落,{{count}} paragraphs found,逐語録の画面 > 検索の結果の数
search.hits_one,ヒット {{count}} 段落,{{count}} paragraph found,件数が 1 のときの英語の形（日本語は使われない）
search.crossHits,ヒット {{count}} 段落（{{transcripts}} 原文）,{{count}} paragraphs found ({{transcripts}} transcripts),逐語録の画面 > 横断検索の結果の数
search.crossHits_one,ヒット {{count}} 段落（{{transcripts}} 原文）,{{count}} paragraph found ({{transcripts}} transcripts),件数が 1 のときの英語の形（日本語は使われない）
search.bulkLink,一括リンク...,Link all...,逐語録の画面 > ボタン
search.bulkLink.tip,ヒットした段落を Box に一括リンク,Link all found paragraphs to a Box,逐語録の画面 > ボタンの吹き出し
search.crossLink.all,横断一括リンク...,Link all across transcripts...,逐語録の画面 > ボタン
search.crossLink.participant,協力者一括リンク...,Link all for participant...,逐語録の画面 > ボタン
search.crossLink.tip,横断ヒットを Box に一括リンク (複数原文/複数回を 1 Box にまとめる),Link all cross-search hits to a Box (gathers several transcripts / sessions into one Box),逐語録の画面 > ボタンの吹き出し
search.onlyUnlinked,未リンクのみ,Unlinked only,逐語録の画面 > チェックボックス
search.onlyUnlinked.tip,まだ Box にリンクされていない段落だけ表示,Show only paragraphs not yet linked to a Box,逐語録の画面 > チェックボックスの吹き出し
selectTranscript,左ペインから原文を選択してください。,Choose a transcript in the left pane.,逐語録の画面 > 逐語録を選んでいないとき
refs.heading,引用リンク一覧,Source references,逐語録の画面 > 右の一覧の見出し
refs.selectParagraph,段落を選択するとここに表示,Select a paragraph to see its links here,逐語録の画面 > 右の一覧（段落を選んでいないとき）
selection,選択範囲: {{start}}〜{{end}} 文字,Selection: characters {{start}}–{{end}},逐語録の画面 > 選んだ文字の範囲
linkRange,この範囲を Box にリンク,Link this range to a Box,逐語録の画面 > ボタン
onlyUnlinkedShown,未リンク段落のみ表示中: {{shown}} / {{total}} 段落,Showing unlinked paragraphs only: {{shown}} / {{total}},逐語録の画面 > 絞り込み中の表示
paragraph.speaker,話者,Speaker,逐語録の画面 > 段落の編集の入力欄（薄字）
paragraph.time,時刻,Time,逐語録の画面 > 段落の編集の入力欄（薄字）
paragraph.links,{{count}} リンク,{{count}} links,逐語録の画面 > 段落に付いた原文参照の数
paragraph.links_one,{{count}} リンク,{{count}} link,件数が 1 のときの英語の形（日本語は使われない）
paragraph.note,メモ,Note,逐語録の画面 > 段落のメモ（印とボタン）
paragraph.noteClose,メモ閉,Close note,逐語録の画面 > 段落のボタン
paragraph.linkWhole,段落全体をリンク,Link whole paragraph,逐語録の画面 > 段落のボタン
paragraph.preview,プレビュー,Preview,逐語録の画面 > 段落のボタン（編集をやめる）
paragraph.edit,編集,Edit,逐語録の画面 > 段落のボタン
paragraph.split,ここで分割,Split here,逐語録の画面 > 段落のボタン
paragraph.split.tip,キャレット位置でこの段落を 2 つに分割,Split this paragraph in two at the cursor,逐語録の画面 > ボタンの吹き出し
paragraph.merge,結合,Merge,逐語録の画面 > 段落のボタン（前に ↓ が付く）
paragraph.merge.tip,次の段落と結合,Merge with the next paragraph,逐語録の画面 > ボタンの吹き出し
paragraph.merge.confirm,"次の段落と結合しますか？
後段落の引用リンクは前段落に統合され、charStart/charEnd は再計算されます。","Merge with the next paragraph?
Links on the next paragraph move to this one and charStart/charEnd are recalculated.",逐語録の画面 > 結合の確認（2 行）
paragraph.noteHeading,段落メモ,Paragraph note,逐語録の画面 > メモの見出し
paragraph.notePlaceholder,ここは要確認 / 後で再検討 / ...などの分析メモ,"Analysis notes, e.g. needs checking / revisit later / ...",逐語録の画面 > メモの入力欄（薄字）
tag.remove,タグ削除,Remove tag,逐語録の画面 > タグの × の吹き出し
tag.add,+ タグ追加,+ Add tag,逐語録の画面 > タグの入力欄（薄字）
highlight.tip,リンク: {{links}},Links: {{links}},逐語録の画面 > 色付きの箇所の吹き出し
refs.empty,この段落への引用はまだありません。,No links to this paragraph yet.,逐語録の画面 > 右の一覧（リンクが無いとき）
refs.range,範囲 {{start}}〜{{end}},Range {{start}}–{{end}},逐語録の画面 > 右の一覧（文字の範囲）
refs.unresolved,追従不能,Cannot follow,逐語録の画面 > 右の一覧（本文が変わって箇所が分からなくなったリンク）
refs.reconnect,再接続,Reconnect,逐語録の画面 > 右の一覧のボタン
refs.unlink,リンク解除,Unlink,逐語録の画面 > 右の一覧のボタン
quote,「{{text}}」,"""{{text}}""",逐語録の画面 > 引用した文を囲む括弧
link.title,原文を要素にリンク,Link transcript to an element,リンクの作成の画面の題
link.quote,引用テキスト:,Quoted text:,リンクの作成 > ラベル
link.tabNew,新規 Box を作成,Create a new Box,リンクの作成 > タブ
link.tabExisting,既存要素にリンク,Link to an existing element,リンクの作成 > タブ
link.boxType,Box 種別,Box type,リンクの作成 > ラベル
link.boxLabel,Box ラベル,Box label,リンクの作成 > ラベル
link.boxLabelPlaceholder,例: 卒業研究着手（空でも可、後で編集できます）,"e.g. Starting the graduation thesis (can be blank, you can edit it later)",リンクの作成 > 入力欄（薄字）
link.hint1,description には上記引用テキストを自動貼付します。,The quoted text above is pasted into the description automatically.,リンクの作成 > 説明
link.hint2,ラベルが空でも作成可能で、PropertyPanel から後で編集できます。,"You can create it with a blank label, and edit it later in the property panel.",リンクの作成 > 説明
link.kind,種別,Kind,リンクの作成 > リンク先の種類のラベル
link.target,対象,Target,リンクの作成 > リンク先のラベル
link.choose,— 選択 —,— Choose —,リンクの作成 > リンク先の選択肢
link.unnamed,無名,unnamed,リンクの作成 > ラベルの無い要素の表示
link.createBox,リンクした Box を作成,Create linked Box,リンクの作成 > ボタン
link.addLink,リンク追加,Add link,リンクの作成 > ボタン
cancel,キャンセル,Cancel,リンクの画面 > ボタン
bulk.title,検索ヒットを一括リンク,Link all search hits,一括リンクの画面の題
bulk.titleCross,横断検索ヒットを一括リンク,Link all cross-search hits,一括リンクの画面の題
bulk.count,{{count}} 件,{{count}} hits,一括リンク > 題の中の件数
bulk.count_one,{{count}} 件,{{count}} hit,件数が 1 のときの英語の形（日本語は使われない）
bulk.transcripts,{{count}} 原文,{{count}} transcripts,一括リンク > 題の中の逐語録の数
bulk.transcripts_one,{{count}} 原文,{{count}} transcript,件数が 1 のときの英語の形（日本語は使われない）
bulk.boxLabelPlaceholder,例: 指導教員との出会い,e.g. Meeting the supervisor,一括リンク > 入力欄（薄字）
bulk.hint,description には選択した全段落の本文を連結して貼付します（§番号付き）。,The text of all selected paragraphs is joined and pasted into the description (with § numbers).,一括リンク > 説明
bulk.selectAll,全選択,Select all,一括リンク > チェックボックス
bulk.selected,{{selected}} / {{total}} 段落を選択中,{{selected}} / {{total}} paragraphs selected,一括リンク > 選んだ数
bulk.confirmNew,Box 作成 + {{count}} 段落をリンク,Create Box + link {{count}} paragraphs,一括リンク > ボタン
bulk.confirmNew_one,Box 作成 + {{count}} 段落をリンク,Create Box + link {{count}} paragraph,件数が 1 のときの英語の形（日本語は使われない）
bulk.confirmExisting,{{count}} 段落をリンク追加,Link {{count}} paragraphs,一括リンク > ボタン
bulk.confirmExisting_one,{{count}} 段落をリンク追加,Link {{count}} paragraph,件数が 1 のときの英語の形（日本語は使われない）
cross.noMatch,「{{keyword}}」にマッチする段落が見つかりませんでした。,"No paragraphs match ""{{keyword}}"".",逐語録の画面 > 横断検索で何も無いとき
cross.summary,{{participants}} 協力者 / {{transcripts}} 原文に渡って {{hits}} 件のヒット。各行クリックで該当段落へジャンプします。,{{hits}} hits across {{participants}} participants / {{transcripts}} transcripts. Click a row to jump to the paragraph.,逐語録の画面 > 横断検索の結果の説明
cross.groupCount,{{hits}} 件 / {{sessions}} 回,{{hits}} hits / {{sessions}} sessions,逐語録の画面 > 横断検索の協力者ごとの件数
cross.hits,{{count}} 件,{{count}} hits,逐語録の画面 > 横断検索の回ごとの件数
cross.hits_one,{{count}} 件,{{count}} hit,件数が 1 のときの英語の形（日本語は使われない）
cross.jump,クリックで該当段落へジャンプ,Click to jump to the paragraph,逐語録の画面 > 横断検索の行の吹き出し
reconnect.confirmDelete,このリンクを完全に削除しますか？,Delete this link permanently?,リンクの再接続 > 削除の確認
reconnect.title,リンク再接続 ({{type}} / {{id}}),Reconnect link ({{type}} / {{id}}),リンクの再接続の画面の題
reconnect.missing1,元の原文または段落が見つかりません（削除された可能性があります）。,The original transcript or paragraph cannot be found (it may have been deleted).,リンクの再接続 > 注意
reconnect.missing2,リンクを削除して整理することをお勧めします。,We recommend deleting the link to tidy up.,リンクの再接続 > 注意
reconnect.original,元の引用テキスト (スナップショット),Original quoted text (snapshot),リンクの再接続 > 見出し
reconnect.wholeParagraphRef,（段落全体参照）,(Whole paragraph),リンクの再接続 > 段落全体を指すリンクのとき
reconnect.current,現在の段落本文 (§{{n}}),Current paragraph text (§{{n}}),リンクの再接続 > 見出し
reconnect.hint,下記から該当箇所をマウスドラッグで範囲選択するか、段落全体を参照に切り替えてください。,"Drag over the matching part below to select it, or switch to the whole paragraph.",リンクの再接続 > 説明
reconnect.selection,選択範囲: {{start}}〜{{end}} 文字「{{text}}」,"Selection: characters {{start}}–{{end}} ""{{text}}""",リンクの再接続 > 選んだ範囲
reconnect.delete,リンクを削除,Delete link,リンクの再接続 > ボタン
reconnect.useWhole,段落全体を参照に切替,Use whole paragraph,リンクの再接続 > ボタン
reconnect.useSelection,選択範囲で再接続,Reconnect to selection,リンクの再接続 > ボタン
view.text,原文,Text,逐語録の画面 > 中央の欄の切り替え（原文を読む）
view.cuts,切片の一覧（{{count}}）,Segments ({{count}}),逐語録の画面 > 中央の欄の切り替え（切片の一覧）
cut.make,切片にする,Make a segment,逐語録の画面 > 右の欄のボタン（選んだ範囲を切片にする）
cut.make.tip,選んだ範囲を切片にします。見出し・種別を決めてから、切片の一覧で Box にできます,"Makes the selected range a segment. Set its heading and type, then turn it into a Box from the segment list",逐語録の画面 > 右の欄のボタンの説明
cut.makeParagraph,段落全体を切片にする,Make the whole paragraph a segment,逐語録の画面 > 右の欄のボタン（範囲を選んでいないとき）
cut.made,切片にしました（{{label}}）,Segment made ({{label}}),逐語録の画面 > 切片にしたあとの知らせ
`,dg=`\uFEFFkey,ja,en,note
"ribbon.tabs.file","ファイル","File",""
"ribbon.tabs.home","編集","Edit",""
"ribbon.tabs.insert","挿入","Insert",""
"ribbon.tabs.arrange","整理","Arrange",""
"ribbon.tabs.view","表示","View",""
"ribbon.tabs.help","ヘルプ","Help",""
"common.ok","OK","OK",""
"common.cancel","キャンセル","Cancel",""
"common.save","保存","Save",""
"common.delete","削除","Delete",""
"common.close","閉じる","Close",""
"common.apply","適用","Apply",""
"common.loading","読み込み中","Loading",""
"locale.ja","日本語","日本語",""
"locale.en","English","English",""
app.title,TEMer - TEM作図ツール,TEMer - TEM diagram tool,ブラウザのタブに出るページの題
`,cg=`\uFEFFkey,ja,en,note
"item.horizontalLength","横軸（時間軸）の間隔","Spacing on the horizontal (time) axis","表記方針の項目名。論文用レポートの画面の表記方針タブ・確認画面・Word のレポートの表記方針の節"
"item.verticalPosition","縦軸（並置軸）の位置","Position on the vertical (juxtaposition) axis","表記方針の項目名（同上）"
"item.arrowAngle","矢印の角度","Arrow angle","表記方針の項目名（同上）"
"item.arrowLength","矢印の距離（長さ）","Arrow distance (length)","表記方針の項目名（同上）"
"item.boxWidth","Box の横幅","Box width","表記方針の項目名（同上）"
"item.boxHeight","Box の高さ","Box height","表記方針の項目名（同上）"
"item.lineWeight","線の太さ","Line weight","表記方針の項目名（同上）"
"item.colors","色の使用（塗り・枠線・文字）","Use of color (fill, border, text)","表記方針の項目名（同上）"
"item.boxShape","Box の形状（角丸・直角・楕円）","Box shape (rounded, square, ellipse)","表記方針の項目名（同上）"
"item.fontDecoration","フォント装飾（太字・斜体・サイズ）","Font styling (bold, italic, size)","表記方針の項目名（同上）"
"item.textAlignment","テキスト配置（中央・左寄せなど）","Text alignment (center, left, etc.)","表記方針の項目名（同上）"
"hint.boxWidth","時間軸上の位置を Box のどこで読むか（左辺・中心など）も書く","Also state which part of the Box marks its position on the time axis (left edge, center, etc.)","論文用レポートの画面 > 表記方針タブ > Box の横幅の説明欄の例"
"hint.boxHeight","文字量に合わせた（テキスト駆動）か意味を持たせた（意味駆動）か、比べるときの基準（中心など）も書く","Also state whether the height follows the amount of text (text-driven) or carries meaning (meaning-driven), and the reference point used when comparing (center, etc.)","論文用レポートの画面 > 表記方針タブ > Box の高さの説明欄の例"
"meaning.yes","意味あり","Meaningful","論文用レポートの画面 > 表記方針タブ > 意味の度合いの選択肢"
"meaning.loose","緩やかに意味あり","Loosely meaningful","論文用レポートの画面 > 表記方針タブ > 意味の度合いの選択肢"
"meaning.no","意味なし","Not meaningful","論文用レポートの画面 > 表記方針タブ > 意味の度合いの選択肢"
`,z=e=>typeof e=="string",Jn=()=>{let e,t;const n=new Promise((o,r)=>{e=o,t=r});return n.resolve=e,n.reject=t,n},Ul=e=>e==null?"":""+e,pg=(e,t,n)=>{e.forEach(o=>{t[o]&&(n[o]=t[o])})},hg=/###/g,Hl=e=>e&&e.indexOf("###")>-1?e.replace(hg,"."):e,$l=e=>!e||z(e),ho=(e,t,n)=>{const o=z(t)?t.split("."):t;let r=0;for(;r<o.length-1;){if($l(e))return{};const i=Hl(o[r]);!e[i]&&n&&(e[i]=new n),Object.prototype.hasOwnProperty.call(e,i)?e=e[i]:e={},++r}return $l(e)?{}:{obj:e,k:Hl(o[r])}},Ql=(e,t,n)=>{const{obj:o,k:r}=ho(e,t,Object);if(o!==void 0||t.length===1){o[r]=n;return}let i=t[t.length-1],a=t.slice(0,t.length-1),l=ho(e,a,Object);for(;l.obj===void 0&&a.length;)i=`${a[a.length-1]}.${i}`,a=a.slice(0,a.length-1),l=ho(e,a,Object),l!=null&&l.obj&&typeof l.obj[`${l.k}.${i}`]<"u"&&(l.obj=void 0);l.obj[`${l.k}.${i}`]=n},fg=(e,t,n,o)=>{const{obj:r,k:i}=ho(e,t,Object);r[i]=r[i]||[],r[i].push(n)},zr=(e,t)=>{const{obj:n,k:o}=ho(e,t);if(n&&Object.prototype.hasOwnProperty.call(n,o))return n[o]},gg=(e,t,n)=>{const o=zr(e,n);return o!==void 0?o:zr(t,n)},vc=(e,t,n)=>{for(const o in t)o!=="__proto__"&&o!=="constructor"&&(o in e?z(e[o])||e[o]instanceof String||z(t[o])||t[o]instanceof String?n&&(e[o]=t[o]):vc(e[o],t[o],n):e[o]=t[o]);return e},pn=e=>e.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&");var mg={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;"};const yg=e=>z(e)?e.replace(/[&<>"'\/]/g,t=>mg[t]):e;class xg{constructor(t){this.capacity=t,this.regExpMap=new Map,this.regExpQueue=[]}getRegExp(t){const n=this.regExpMap.get(t);if(n!==void 0)return n;const o=new RegExp(t);return this.regExpQueue.length===this.capacity&&this.regExpMap.delete(this.regExpQueue.shift()),this.regExpMap.set(t,o),this.regExpQueue.push(t),o}}const vg=[" ",",","?","!",";"],Sg=new xg(20),wg=(e,t,n)=>{t=t||"",n=n||"";const o=vg.filter(a=>t.indexOf(a)<0&&n.indexOf(a)<0);if(o.length===0)return!0;const r=Sg.getRegExp(`(${o.map(a=>a==="?"?"\\?":a).join("|")})`);let i=!r.test(e);if(!i){const a=e.indexOf(n);a>0&&!r.test(e.substring(0,a))&&(i=!0)}return i},Ca=function(e,t){let n=arguments.length>2&&arguments[2]!==void 0?arguments[2]:".";if(!e)return;if(e[t])return Object.prototype.hasOwnProperty.call(e,t)?e[t]:void 0;const o=t.split(n);let r=e;for(let i=0;i<o.length;){if(!r||typeof r!="object")return;let a,l="";for(let s=i;s<o.length;++s)if(s!==i&&(l+=n),l+=o[s],a=r[l],a!==void 0){if(["string","number","boolean"].indexOf(typeof a)>-1&&s<o.length-1)continue;i+=s-i+1;break}r=a}return r},Mr=e=>e==null?void 0:e.replace("_","-"),bg={type:"logger",log(e){this.output("log",e)},warn(e){this.output("warn",e)},error(e){this.output("error",e)},output(e,t){var n,o;(o=(n=console==null?void 0:console[e])==null?void 0:n.apply)==null||o.call(n,console,t)}};class Gr{constructor(t){let n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};this.init(t,n)}init(t){let n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};this.prefix=n.prefix||"i18next:",this.logger=t||bg,this.options=n,this.debug=n.debug}log(){for(var t=arguments.length,n=new Array(t),o=0;o<t;o++)n[o]=arguments[o];return this.forward(n,"log","",!0)}warn(){for(var t=arguments.length,n=new Array(t),o=0;o<t;o++)n[o]=arguments[o];return this.forward(n,"warn","",!0)}error(){for(var t=arguments.length,n=new Array(t),o=0;o<t;o++)n[o]=arguments[o];return this.forward(n,"error","")}deprecate(){for(var t=arguments.length,n=new Array(t),o=0;o<t;o++)n[o]=arguments[o];return this.forward(n,"warn","WARNING DEPRECATED: ",!0)}forward(t,n,o,r){return r&&!this.debug?null:(z(t[0])&&(t[0]=`${o}${this.prefix} ${t[0]}`),this.logger[n](t))}create(t){return new Gr(this.logger,{prefix:`${this.prefix}:${t}:`,...this.options})}clone(t){return t=t||this.options,t.prefix=t.prefix||this.prefix,new Gr(this.logger,t)}}var ht=new Gr;class ri{constructor(){this.observers={}}on(t,n){return t.split(" ").forEach(o=>{this.observers[o]||(this.observers[o]=new Map);const r=this.observers[o].get(n)||0;this.observers[o].set(n,r+1)}),this}off(t,n){if(this.observers[t]){if(!n){delete this.observers[t];return}this.observers[t].delete(n)}}emit(t){for(var n=arguments.length,o=new Array(n>1?n-1:0),r=1;r<n;r++)o[r-1]=arguments[r];this.observers[t]&&Array.from(this.observers[t].entries()).forEach(a=>{let[l,s]=a;for(let u=0;u<s;u++)l(...o)}),this.observers["*"]&&Array.from(this.observers["*"].entries()).forEach(a=>{let[l,s]=a;for(let u=0;u<s;u++)l.apply(l,[t,...o])})}}class Xl extends ri{constructor(t){let n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{ns:["translation"],defaultNS:"translation"};super(),this.data=t||{},this.options=n,this.options.keySeparator===void 0&&(this.options.keySeparator="."),this.options.ignoreJSONStructure===void 0&&(this.options.ignoreJSONStructure=!0)}addNamespaces(t){this.options.ns.indexOf(t)<0&&this.options.ns.push(t)}removeNamespaces(t){const n=this.options.ns.indexOf(t);n>-1&&this.options.ns.splice(n,1)}getResource(t,n,o){var u,p;let r=arguments.length>3&&arguments[3]!==void 0?arguments[3]:{};const i=r.keySeparator!==void 0?r.keySeparator:this.options.keySeparator,a=r.ignoreJSONStructure!==void 0?r.ignoreJSONStructure:this.options.ignoreJSONStructure;let l;t.indexOf(".")>-1?l=t.split("."):(l=[t,n],o&&(Array.isArray(o)?l.push(...o):z(o)&&i?l.push(...o.split(i)):l.push(o)));const s=zr(this.data,l);return!s&&!n&&!o&&t.indexOf(".")>-1&&(t=l[0],n=l[1],o=l.slice(2).join(".")),s||!a||!z(o)?s:Ca((p=(u=this.data)==null?void 0:u[t])==null?void 0:p[n],o,i)}addResource(t,n,o,r){let i=arguments.length>4&&arguments[4]!==void 0?arguments[4]:{silent:!1};const a=i.keySeparator!==void 0?i.keySeparator:this.options.keySeparator;let l=[t,n];o&&(l=l.concat(a?o.split(a):o)),t.indexOf(".")>-1&&(l=t.split("."),r=n,n=l[1]),this.addNamespaces(n),Ql(this.data,l,r),i.silent||this.emit("added",t,n,o,r)}addResources(t,n,o){let r=arguments.length>3&&arguments[3]!==void 0?arguments[3]:{silent:!1};for(const i in o)(z(o[i])||Array.isArray(o[i]))&&this.addResource(t,n,i,o[i],{silent:!0});r.silent||this.emit("added",t,n,o)}addResourceBundle(t,n,o,r,i){let a=arguments.length>5&&arguments[5]!==void 0?arguments[5]:{silent:!1,skipCopy:!1},l=[t,n];t.indexOf(".")>-1&&(l=t.split("."),r=o,o=n,n=l[1]),this.addNamespaces(n);let s=zr(this.data,l)||{};a.skipCopy||(o=JSON.parse(JSON.stringify(o))),r?vc(s,o,i):s={...s,...o},Ql(this.data,l,s),a.silent||this.emit("added",t,n,o)}removeResourceBundle(t,n){this.hasResourceBundle(t,n)&&delete this.data[t][n],this.removeNamespaces(n),this.emit("removed",t,n)}hasResourceBundle(t,n){return this.getResource(t,n)!==void 0}getResourceBundle(t,n){return n||(n=this.options.defaultNS),this.getResource(t,n)}getDataByLanguage(t){return this.data[t]}hasLanguageSomeTranslations(t){const n=this.getDataByLanguage(t);return!!(n&&Object.keys(n)||[]).find(r=>n[r]&&Object.keys(n[r]).length>0)}toJSON(){return this.data}}var Sc={processors:{},addPostProcessor(e){this.processors[e.name]=e},handle(e,t,n,o,r){return e.forEach(i=>{var a;t=((a=this.processors[i])==null?void 0:a.process(t,n,o,r))??t}),t}};const Kl={},ql=e=>!z(e)&&typeof e!="boolean"&&typeof e!="number";class jr extends ri{constructor(t){let n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};super(),pg(["resourceStore","languageUtils","pluralResolver","interpolator","backendConnector","i18nFormat","utils"],t,this),this.options=n,this.options.keySeparator===void 0&&(this.options.keySeparator="."),this.logger=ht.create("translator")}changeLanguage(t){t&&(this.language=t)}exists(t){let n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{interpolation:{}};if(t==null)return!1;const o=this.resolve(t,n);return(o==null?void 0:o.res)!==void 0}extractFromKey(t,n){let o=n.nsSeparator!==void 0?n.nsSeparator:this.options.nsSeparator;o===void 0&&(o=":");const r=n.keySeparator!==void 0?n.keySeparator:this.options.keySeparator;let i=n.ns||this.options.defaultNS||[];const a=o&&t.indexOf(o)>-1,l=!this.options.userDefinedKeySeparator&&!n.keySeparator&&!this.options.userDefinedNsSeparator&&!n.nsSeparator&&!wg(t,o,r);if(a&&!l){const s=t.match(this.interpolator.nestingRegexp);if(s&&s.length>0)return{key:t,namespaces:z(i)?[i]:i};const u=t.split(o);(o!==r||o===r&&this.options.ns.indexOf(u[0])>-1)&&(i=u.shift()),t=u.join(r)}return{key:t,namespaces:z(i)?[i]:i}}translate(t,n,o){if(typeof n!="object"&&this.options.overloadTranslationOptionHandler&&(n=this.options.overloadTranslationOptionHandler(arguments)),typeof n=="object"&&(n={...n}),n||(n={}),t==null)return"";Array.isArray(t)||(t=[String(t)]);const r=n.returnDetails!==void 0?n.returnDetails:this.options.returnDetails,i=n.keySeparator!==void 0?n.keySeparator:this.options.keySeparator,{key:a,namespaces:l}=this.extractFromKey(t[t.length-1],n),s=l[l.length-1],u=n.lng||this.language,p=n.appendNamespaceToCIMode||this.options.appendNamespaceToCIMode;if((u==null?void 0:u.toLowerCase())==="cimode"){if(p){const L=n.nsSeparator||this.options.nsSeparator;return r?{res:`${s}${L}${a}`,usedKey:a,exactUsedKey:a,usedLng:u,usedNS:s,usedParams:this.getUsedParamsDetails(n)}:`${s}${L}${a}`}return r?{res:a,usedKey:a,exactUsedKey:a,usedLng:u,usedNS:s,usedParams:this.getUsedParamsDetails(n)}:a}const f=this.resolve(t,n);let c=f==null?void 0:f.res;const S=(f==null?void 0:f.usedKey)||a,v=(f==null?void 0:f.exactUsedKey)||a,w=["[object Number]","[object Function]","[object RegExp]"],I=n.joinArrays!==void 0?n.joinArrays:this.options.joinArrays,m=!this.i18nFormat||this.i18nFormat.handleAsObject,h=n.count!==void 0&&!z(n.count),y=jr.hasDefaultValue(n),b=h?this.pluralResolver.getSuffix(u,n.count,n):"",T=n.ordinal&&h?this.pluralResolver.getSuffix(u,n.count,{ordinal:!1}):"",C=h&&!n.ordinal&&n.count===0,P=C&&n[`defaultValue${this.options.pluralSeparator}zero`]||n[`defaultValue${b}`]||n[`defaultValue${T}`]||n.defaultValue;let d=c;m&&!c&&y&&(d=P);const g=ql(d),x=Object.prototype.toString.apply(d);if(m&&d&&g&&w.indexOf(x)<0&&!(z(I)&&Array.isArray(d))){if(!n.returnObjects&&!this.options.returnObjects){this.options.returnedObjectHandler||this.logger.warn("accessing an object - but returnObjects options is not enabled!");const L=this.options.returnedObjectHandler?this.options.returnedObjectHandler(S,d,{...n,ns:l}):`key '${a} (${this.language})' returned an object instead of string.`;return r?(f.res=L,f.usedParams=this.getUsedParamsDetails(n),f):L}if(i){const L=Array.isArray(d),E=L?[]:{},M=L?v:S;for(const X in d)if(Object.prototype.hasOwnProperty.call(d,X)){const le=`${M}${i}${X}`;y&&!c?E[X]=this.translate(le,{...n,defaultValue:ql(P)?P[X]:void 0,joinArrays:!1,ns:l}):E[X]=this.translate(le,{...n,joinArrays:!1,ns:l}),E[X]===le&&(E[X]=d[X])}c=E}}else if(m&&z(I)&&Array.isArray(c))c=c.join(I),c&&(c=this.extendTranslation(c,t,n,o));else{let L=!1,E=!1;!this.isValidLookup(c)&&y&&(L=!0,c=P),this.isValidLookup(c)||(E=!0,c=a);const X=(n.missingKeyNoValueFallbackToKey||this.options.missingKeyNoValueFallbackToKey)&&E?void 0:c,le=y&&P!==c&&this.options.updateMissing;if(E||L||le){if(this.logger.log(le?"updateKey":"missingKey",u,s,a,le?P:c),i){const k=this.resolve(a,{...n,keySeparator:!1});k&&k.res&&this.logger.warn("Seems the loaded translations were in flat JSON format instead of nested. Either set keySeparator: false on init or make sure your translations are published in nested format.")}let ge=[];const $=this.languageUtils.getFallbackCodes(this.options.fallbackLng,n.lng||this.language);if(this.options.saveMissingTo==="fallback"&&$&&$[0])for(let k=0;k<$.length;k++)ge.push($[k]);else this.options.saveMissingTo==="all"?ge=this.languageUtils.toResolveHierarchy(n.lng||this.language):ge.push(n.lng||this.language);const D=(k,F,_)=>{var O;const N=y&&_!==c?_:X;this.options.missingKeyHandler?this.options.missingKeyHandler(k,s,F,N,le,n):(O=this.backendConnector)!=null&&O.saveMissing&&this.backendConnector.saveMissing(k,s,F,N,le,n),this.emit("missingKey",k,s,F,c)};this.options.saveMissing&&(this.options.saveMissingPlurals&&h?ge.forEach(k=>{const F=this.pluralResolver.getSuffixes(k,n);C&&n[`defaultValue${this.options.pluralSeparator}zero`]&&F.indexOf(`${this.options.pluralSeparator}zero`)<0&&F.push(`${this.options.pluralSeparator}zero`),F.forEach(_=>{D([k],a+_,n[`defaultValue${_}`]||P)})}):D(ge,a,P))}c=this.extendTranslation(c,t,n,f,o),E&&c===a&&this.options.appendNamespaceToMissingKey&&(c=`${s}:${a}`),(E||L)&&this.options.parseMissingKeyHandler&&(c=this.options.parseMissingKeyHandler(this.options.appendNamespaceToMissingKey?`${s}:${a}`:a,L?c:void 0))}return r?(f.res=c,f.usedParams=this.getUsedParamsDetails(n),f):c}extendTranslation(t,n,o,r,i){var u,p;var a=this;if((u=this.i18nFormat)!=null&&u.parse)t=this.i18nFormat.parse(t,{...this.options.interpolation.defaultVariables,...o},o.lng||this.language||r.usedLng,r.usedNS,r.usedKey,{resolved:r});else if(!o.skipInterpolation){o.interpolation&&this.interpolator.init({...o,interpolation:{...this.options.interpolation,...o.interpolation}});const f=z(t)&&(((p=o==null?void 0:o.interpolation)==null?void 0:p.skipOnVariables)!==void 0?o.interpolation.skipOnVariables:this.options.interpolation.skipOnVariables);let c;if(f){const v=t.match(this.interpolator.nestingRegexp);c=v&&v.length}let S=o.replace&&!z(o.replace)?o.replace:o;if(this.options.interpolation.defaultVariables&&(S={...this.options.interpolation.defaultVariables,...S}),t=this.interpolator.interpolate(t,S,o.lng||this.language||r.usedLng,o),f){const v=t.match(this.interpolator.nestingRegexp),w=v&&v.length;c<w&&(o.nest=!1)}!o.lng&&r&&r.res&&(o.lng=this.language||r.usedLng),o.nest!==!1&&(t=this.interpolator.nest(t,function(){for(var v=arguments.length,w=new Array(v),I=0;I<v;I++)w[I]=arguments[I];return(i==null?void 0:i[0])===w[0]&&!o.context?(a.logger.warn(`It seems you are nesting recursively key: ${w[0]} in key: ${n[0]}`),null):a.translate(...w,n)},o)),o.interpolation&&this.interpolator.reset()}const l=o.postProcess||this.options.postProcess,s=z(l)?[l]:l;return t!=null&&(s!=null&&s.length)&&o.applyPostProcessor!==!1&&(t=Sc.handle(s,t,n,this.options&&this.options.postProcessPassResolved?{i18nResolved:{...r,usedParams:this.getUsedParamsDetails(o)},...o}:o,this)),t}resolve(t){let n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},o,r,i,a,l;return z(t)&&(t=[t]),t.forEach(s=>{if(this.isValidLookup(o))return;const u=this.extractFromKey(s,n),p=u.key;r=p;let f=u.namespaces;this.options.fallbackNS&&(f=f.concat(this.options.fallbackNS));const c=n.count!==void 0&&!z(n.count),S=c&&!n.ordinal&&n.count===0,v=n.context!==void 0&&(z(n.context)||typeof n.context=="number")&&n.context!=="",w=n.lngs?n.lngs:this.languageUtils.toResolveHierarchy(n.lng||this.language,n.fallbackLng);f.forEach(I=>{var m,h;this.isValidLookup(o)||(l=I,!Kl[`${w[0]}-${I}`]&&((m=this.utils)!=null&&m.hasLoadedNamespace)&&!((h=this.utils)!=null&&h.hasLoadedNamespace(l))&&(Kl[`${w[0]}-${I}`]=!0,this.logger.warn(`key "${r}" for languages "${w.join(", ")}" won't get resolved as namespace "${l}" was not yet loaded`,"This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!")),w.forEach(y=>{var C;if(this.isValidLookup(o))return;a=y;const b=[p];if((C=this.i18nFormat)!=null&&C.addLookupKeys)this.i18nFormat.addLookupKeys(b,p,y,I,n);else{let P;c&&(P=this.pluralResolver.getSuffix(y,n.count,n));const d=`${this.options.pluralSeparator}zero`,g=`${this.options.pluralSeparator}ordinal${this.options.pluralSeparator}`;if(c&&(b.push(p+P),n.ordinal&&P.indexOf(g)===0&&b.push(p+P.replace(g,this.options.pluralSeparator)),S&&b.push(p+d)),v){const x=`${p}${this.options.contextSeparator}${n.context}`;b.push(x),c&&(b.push(x+P),n.ordinal&&P.indexOf(g)===0&&b.push(x+P.replace(g,this.options.pluralSeparator)),S&&b.push(x+d))}}let T;for(;T=b.pop();)this.isValidLookup(o)||(i=T,o=this.getResource(y,I,T,n))}))})}),{res:o,usedKey:r,exactUsedKey:i,usedLng:a,usedNS:l}}isValidLookup(t){return t!==void 0&&!(!this.options.returnNull&&t===null)&&!(!this.options.returnEmptyString&&t==="")}getResource(t,n,o){var i;let r=arguments.length>3&&arguments[3]!==void 0?arguments[3]:{};return(i=this.i18nFormat)!=null&&i.getResource?this.i18nFormat.getResource(t,n,o,r):this.resourceStore.getResource(t,n,o,r)}getUsedParamsDetails(){let t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};const n=["defaultValue","ordinal","context","replace","lng","lngs","fallbackLng","ns","keySeparator","nsSeparator","returnObjects","returnDetails","joinArrays","postProcess","interpolation"],o=t.replace&&!z(t.replace);let r=o?t.replace:t;if(o&&typeof t.count<"u"&&(r.count=t.count),this.options.interpolation.defaultVariables&&(r={...this.options.interpolation.defaultVariables,...r}),!o){r={...r};for(const i of n)delete r[i]}return r}static hasDefaultValue(t){const n="defaultValue";for(const o in t)if(Object.prototype.hasOwnProperty.call(t,o)&&n===o.substring(0,n.length)&&t[o]!==void 0)return!0;return!1}}class Yl{constructor(t){this.options=t,this.supportedLngs=this.options.supportedLngs||!1,this.logger=ht.create("languageUtils")}getScriptPartFromCode(t){if(t=Mr(t),!t||t.indexOf("-")<0)return null;const n=t.split("-");return n.length===2||(n.pop(),n[n.length-1].toLowerCase()==="x")?null:this.formatLanguageCode(n.join("-"))}getLanguagePartFromCode(t){if(t=Mr(t),!t||t.indexOf("-")<0)return t;const n=t.split("-");return this.formatLanguageCode(n[0])}formatLanguageCode(t){if(z(t)&&t.indexOf("-")>-1){let n;try{n=Intl.getCanonicalLocales(t)[0]}catch{}return n&&this.options.lowerCaseLng&&(n=n.toLowerCase()),n||(this.options.lowerCaseLng?t.toLowerCase():t)}return this.options.cleanCode||this.options.lowerCaseLng?t.toLowerCase():t}isSupportedCode(t){return(this.options.load==="languageOnly"||this.options.nonExplicitSupportedLngs)&&(t=this.getLanguagePartFromCode(t)),!this.supportedLngs||!this.supportedLngs.length||this.supportedLngs.indexOf(t)>-1}getBestMatchFromCodes(t){if(!t)return null;let n;return t.forEach(o=>{if(n)return;const r=this.formatLanguageCode(o);(!this.options.supportedLngs||this.isSupportedCode(r))&&(n=r)}),!n&&this.options.supportedLngs&&t.forEach(o=>{if(n)return;const r=this.getLanguagePartFromCode(o);if(this.isSupportedCode(r))return n=r;n=this.options.supportedLngs.find(i=>{if(i===r)return i;if(!(i.indexOf("-")<0&&r.indexOf("-")<0)&&(i.indexOf("-")>0&&r.indexOf("-")<0&&i.substring(0,i.indexOf("-"))===r||i.indexOf(r)===0&&r.length>1))return i})}),n||(n=this.getFallbackCodes(this.options.fallbackLng)[0]),n}getFallbackCodes(t,n){if(!t)return[];if(typeof t=="function"&&(t=t(n)),z(t)&&(t=[t]),Array.isArray(t))return t;if(!n)return t.default||[];let o=t[n];return o||(o=t[this.getScriptPartFromCode(n)]),o||(o=t[this.formatLanguageCode(n)]),o||(o=t[this.getLanguagePartFromCode(n)]),o||(o=t.default),o||[]}toResolveHierarchy(t,n){const o=this.getFallbackCodes(n||this.options.fallbackLng||[],t),r=[],i=a=>{a&&(this.isSupportedCode(a)?r.push(a):this.logger.warn(`rejecting language code not found in supportedLngs: ${a}`))};return z(t)&&(t.indexOf("-")>-1||t.indexOf("_")>-1)?(this.options.load!=="languageOnly"&&i(this.formatLanguageCode(t)),this.options.load!=="languageOnly"&&this.options.load!=="currentOnly"&&i(this.getScriptPartFromCode(t)),this.options.load!=="currentOnly"&&i(this.getLanguagePartFromCode(t))):z(t)&&i(this.formatLanguageCode(t)),o.forEach(a=>{r.indexOf(a)<0&&i(this.formatLanguageCode(a))}),r}}const Jl={zero:0,one:1,two:2,few:3,many:4,other:5},Zl={select:e=>e===1?"one":"other",resolvedOptions:()=>({pluralCategories:["one","other"]})};class kg{constructor(t){let n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};this.languageUtils=t,this.options=n,this.logger=ht.create("pluralResolver"),this.pluralRulesCache={}}addRule(t,n){this.rules[t]=n}clearCache(){this.pluralRulesCache={}}getRule(t){let n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const o=Mr(t==="dev"?"en":t),r=n.ordinal?"ordinal":"cardinal",i=JSON.stringify({cleanedCode:o,type:r});if(i in this.pluralRulesCache)return this.pluralRulesCache[i];let a;try{a=new Intl.PluralRules(o,{type:r})}catch{if(!Intl)return this.logger.error("No Intl support, please use an Intl polyfill!"),Zl;if(!t.match(/-|_/))return Zl;const s=this.languageUtils.getLanguagePartFromCode(t);a=this.getRule(s,n)}return this.pluralRulesCache[i]=a,a}needsPlural(t){let n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},o=this.getRule(t,n);return o||(o=this.getRule("dev",n)),(o==null?void 0:o.resolvedOptions().pluralCategories.length)>1}getPluralFormsOfKey(t,n){let o=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};return this.getSuffixes(t,o).map(r=>`${n}${r}`)}getSuffixes(t){let n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},o=this.getRule(t,n);return o||(o=this.getRule("dev",n)),o?o.resolvedOptions().pluralCategories.sort((r,i)=>Jl[r]-Jl[i]).map(r=>`${this.options.prepend}${n.ordinal?`ordinal${this.options.prepend}`:""}${r}`):[]}getSuffix(t,n){let o=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};const r=this.getRule(t,o);return r?`${this.options.prepend}${o.ordinal?`ordinal${this.options.prepend}`:""}${r.select(n)}`:(this.logger.warn(`no plural rule found for: ${t}`),this.getSuffix("dev",n,o))}}const eu=function(e,t,n){let o=arguments.length>3&&arguments[3]!==void 0?arguments[3]:".",r=arguments.length>4&&arguments[4]!==void 0?arguments[4]:!0,i=gg(e,t,n);return!i&&r&&z(n)&&(i=Ca(e,n,o),i===void 0&&(i=Ca(t,n,o))),i},Fi=e=>e.replace(/\$/g,"$$$$");class Pg{constructor(){var n;let t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};this.logger=ht.create("interpolator"),this.options=t,this.format=((n=t==null?void 0:t.interpolation)==null?void 0:n.format)||(o=>o),this.init(t)}init(){let t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};t.interpolation||(t.interpolation={escapeValue:!0});const{escape:n,escapeValue:o,useRawValueToEscape:r,prefix:i,prefixEscaped:a,suffix:l,suffixEscaped:s,formatSeparator:u,unescapeSuffix:p,unescapePrefix:f,nestingPrefix:c,nestingPrefixEscaped:S,nestingSuffix:v,nestingSuffixEscaped:w,nestingOptionsSeparator:I,maxReplaces:m,alwaysFormat:h}=t.interpolation;this.escape=n!==void 0?n:yg,this.escapeValue=o!==void 0?o:!0,this.useRawValueToEscape=r!==void 0?r:!1,this.prefix=i?pn(i):a||"{{",this.suffix=l?pn(l):s||"}}",this.formatSeparator=u||",",this.unescapePrefix=p?"":f||"-",this.unescapeSuffix=this.unescapePrefix?"":p||"",this.nestingPrefix=c?pn(c):S||pn("$t("),this.nestingSuffix=v?pn(v):w||pn(")"),this.nestingOptionsSeparator=I||",",this.maxReplaces=m||1e3,this.alwaysFormat=h!==void 0?h:!1,this.resetRegExp()}reset(){this.options&&this.init(this.options)}resetRegExp(){const t=(n,o)=>(n==null?void 0:n.source)===o?(n.lastIndex=0,n):new RegExp(o,"g");this.regexp=t(this.regexp,`${this.prefix}(.+?)${this.suffix}`),this.regexpUnescape=t(this.regexpUnescape,`${this.prefix}${this.unescapePrefix}(.+?)${this.unescapeSuffix}${this.suffix}`),this.nestingRegexp=t(this.nestingRegexp,`${this.nestingPrefix}(.+?)${this.nestingSuffix}`)}interpolate(t,n,o,r){var S;let i,a,l;const s=this.options&&this.options.interpolation&&this.options.interpolation.defaultVariables||{},u=v=>{if(v.indexOf(this.formatSeparator)<0){const h=eu(n,s,v,this.options.keySeparator,this.options.ignoreJSONStructure);return this.alwaysFormat?this.format(h,void 0,o,{...r,...n,interpolationkey:v}):h}const w=v.split(this.formatSeparator),I=w.shift().trim(),m=w.join(this.formatSeparator).trim();return this.format(eu(n,s,I,this.options.keySeparator,this.options.ignoreJSONStructure),m,o,{...r,...n,interpolationkey:I})};this.resetRegExp();const p=(r==null?void 0:r.missingInterpolationHandler)||this.options.missingInterpolationHandler,f=((S=r==null?void 0:r.interpolation)==null?void 0:S.skipOnVariables)!==void 0?r.interpolation.skipOnVariables:this.options.interpolation.skipOnVariables;return[{regex:this.regexpUnescape,safeValue:v=>Fi(v)},{regex:this.regexp,safeValue:v=>this.escapeValue?Fi(this.escape(v)):Fi(v)}].forEach(v=>{for(l=0;i=v.regex.exec(t);){const w=i[1].trim();if(a=u(w),a===void 0)if(typeof p=="function"){const m=p(t,i,r);a=z(m)?m:""}else if(r&&Object.prototype.hasOwnProperty.call(r,w))a="";else if(f){a=i[0];continue}else this.logger.warn(`missed to pass in variable ${w} for interpolating ${t}`),a="";else!z(a)&&!this.useRawValueToEscape&&(a=Ul(a));const I=v.safeValue(a);if(t=t.replace(i[0],I),f?(v.regex.lastIndex+=a.length,v.regex.lastIndex-=i[0].length):v.regex.lastIndex=0,l++,l>=this.maxReplaces)break}}),t}nest(t,n){let o=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{},r,i,a;const l=(s,u)=>{const p=this.nestingOptionsSeparator;if(s.indexOf(p)<0)return s;const f=s.split(new RegExp(`${p}[ ]*{`));let c=`{${f[1]}`;s=f[0],c=this.interpolate(c,a);const S=c.match(/'/g),v=c.match(/"/g);(((S==null?void 0:S.length)??0)%2===0&&!v||v.length%2!==0)&&(c=c.replace(/'/g,'"'));try{a=JSON.parse(c),u&&(a={...u,...a})}catch(w){return this.logger.warn(`failed parsing options string in nesting for key ${s}`,w),`${s}${p}${c}`}return a.defaultValue&&a.defaultValue.indexOf(this.prefix)>-1&&delete a.defaultValue,s};for(;r=this.nestingRegexp.exec(t);){let s=[];a={...o},a=a.replace&&!z(a.replace)?a.replace:a,a.applyPostProcessor=!1,delete a.defaultValue;let u=!1;if(r[0].indexOf(this.formatSeparator)!==-1&&!/{.*}/.test(r[1])){const p=r[1].split(this.formatSeparator).map(f=>f.trim());r[1]=p.shift(),s=p,u=!0}if(i=n(l.call(this,r[1].trim(),a),a),i&&r[0]===t&&!z(i))return i;z(i)||(i=Ul(i)),i||(this.logger.warn(`missed to resolve ${r[1]} for nesting ${t}`),i=""),u&&(i=s.reduce((p,f)=>this.format(p,f,o.lng,{...o,interpolationkey:r[1].trim()}),i.trim())),t=t.replace(r[0],i),this.regexp.lastIndex=0}return t}}const Bg=e=>{let t=e.toLowerCase().trim();const n={};if(e.indexOf("(")>-1){const o=e.split("(");t=o[0].toLowerCase().trim();const r=o[1].substring(0,o[1].length-1);t==="currency"&&r.indexOf(":")<0?n.currency||(n.currency=r.trim()):t==="relativetime"&&r.indexOf(":")<0?n.range||(n.range=r.trim()):r.split(";").forEach(a=>{if(a){const[l,...s]=a.split(":"),u=s.join(":").trim().replace(/^'+|'+$/g,""),p=l.trim();n[p]||(n[p]=u),u==="false"&&(n[p]=!1),u==="true"&&(n[p]=!0),isNaN(u)||(n[p]=parseInt(u,10))}})}return{formatName:t,formatOptions:n}},hn=e=>{const t={};return(n,o,r)=>{let i=r;r&&r.interpolationkey&&r.formatParams&&r.formatParams[r.interpolationkey]&&r[r.interpolationkey]&&(i={...i,[r.interpolationkey]:void 0});const a=o+JSON.stringify(i);let l=t[a];return l||(l=e(Mr(o),r),t[a]=l),l(n)}};class Dg{constructor(){let t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};this.logger=ht.create("formatter"),this.options=t,this.formats={number:hn((n,o)=>{const r=new Intl.NumberFormat(n,{...o});return i=>r.format(i)}),currency:hn((n,o)=>{const r=new Intl.NumberFormat(n,{...o,style:"currency"});return i=>r.format(i)}),datetime:hn((n,o)=>{const r=new Intl.DateTimeFormat(n,{...o});return i=>r.format(i)}),relativetime:hn((n,o)=>{const r=new Intl.RelativeTimeFormat(n,{...o});return i=>r.format(i,o.range||"day")}),list:hn((n,o)=>{const r=new Intl.ListFormat(n,{...o});return i=>r.format(i)})},this.init(t)}init(t){let n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{interpolation:{}};this.formatSeparator=n.interpolation.formatSeparator||","}add(t,n){this.formats[t.toLowerCase().trim()]=n}addCached(t,n){this.formats[t.toLowerCase().trim()]=hn(n)}format(t,n,o){let r=arguments.length>3&&arguments[3]!==void 0?arguments[3]:{};const i=n.split(this.formatSeparator);if(i.length>1&&i[0].indexOf("(")>1&&i[0].indexOf(")")<0&&i.find(l=>l.indexOf(")")>-1)){const l=i.findIndex(s=>s.indexOf(")")>-1);i[0]=[i[0],...i.splice(1,l)].join(this.formatSeparator)}return i.reduce((l,s)=>{var f;const{formatName:u,formatOptions:p}=Bg(s);if(this.formats[u]){let c=l;try{const S=((f=r==null?void 0:r.formatParams)==null?void 0:f[r.interpolationkey])||{},v=S.locale||S.lng||r.locale||r.lng||o;c=this.formats[u](l,v,{...p,...r,...S})}catch(S){this.logger.warn(S)}return c}else this.logger.warn(`there was no format function for ${u}`);return l},t)}}const Lg=(e,t)=>{e.pending[t]!==void 0&&(delete e.pending[t],e.pendingCount--)};class Eg extends ri{constructor(t,n,o){var i,a;let r=arguments.length>3&&arguments[3]!==void 0?arguments[3]:{};super(),this.backend=t,this.store=n,this.services=o,this.languageUtils=o.languageUtils,this.options=r,this.logger=ht.create("backendConnector"),this.waitingReads=[],this.maxParallelReads=r.maxParallelReads||10,this.readingCalls=0,this.maxRetries=r.maxRetries>=0?r.maxRetries:5,this.retryTimeout=r.retryTimeout>=1?r.retryTimeout:350,this.state={},this.queue=[],(a=(i=this.backend)==null?void 0:i.init)==null||a.call(i,o,r.backend,r)}queueLoad(t,n,o,r){const i={},a={},l={},s={};return t.forEach(u=>{let p=!0;n.forEach(f=>{const c=`${u}|${f}`;!o.reload&&this.store.hasResourceBundle(u,f)?this.state[c]=2:this.state[c]<0||(this.state[c]===1?a[c]===void 0&&(a[c]=!0):(this.state[c]=1,p=!1,a[c]===void 0&&(a[c]=!0),i[c]===void 0&&(i[c]=!0),s[f]===void 0&&(s[f]=!0)))}),p||(l[u]=!0)}),(Object.keys(i).length||Object.keys(a).length)&&this.queue.push({pending:a,pendingCount:Object.keys(a).length,loaded:{},errors:[],callback:r}),{toLoad:Object.keys(i),pending:Object.keys(a),toLoadLanguages:Object.keys(l),toLoadNamespaces:Object.keys(s)}}loaded(t,n,o){const r=t.split("|"),i=r[0],a=r[1];n&&this.emit("failedLoading",i,a,n),!n&&o&&this.store.addResourceBundle(i,a,o,void 0,void 0,{skipCopy:!0}),this.state[t]=n?-1:2,n&&o&&(this.state[t]=0);const l={};this.queue.forEach(s=>{fg(s.loaded,[i],a),Lg(s,t),n&&s.errors.push(n),s.pendingCount===0&&!s.done&&(Object.keys(s.loaded).forEach(u=>{l[u]||(l[u]={});const p=s.loaded[u];p.length&&p.forEach(f=>{l[u][f]===void 0&&(l[u][f]=!0)})}),s.done=!0,s.errors.length?s.callback(s.errors):s.callback())}),this.emit("loaded",l),this.queue=this.queue.filter(s=>!s.done)}read(t,n,o){let r=arguments.length>3&&arguments[3]!==void 0?arguments[3]:0,i=arguments.length>4&&arguments[4]!==void 0?arguments[4]:this.retryTimeout,a=arguments.length>5?arguments[5]:void 0;if(!t.length)return a(null,{});if(this.readingCalls>=this.maxParallelReads){this.waitingReads.push({lng:t,ns:n,fcName:o,tried:r,wait:i,callback:a});return}this.readingCalls++;const l=(u,p)=>{if(this.readingCalls--,this.waitingReads.length>0){const f=this.waitingReads.shift();this.read(f.lng,f.ns,f.fcName,f.tried,f.wait,f.callback)}if(u&&p&&r<this.maxRetries){setTimeout(()=>{this.read.call(this,t,n,o,r+1,i*2,a)},i);return}a(u,p)},s=this.backend[o].bind(this.backend);if(s.length===2){try{const u=s(t,n);u&&typeof u.then=="function"?u.then(p=>l(null,p)).catch(l):l(null,u)}catch(u){l(u)}return}return s(t,n,l)}prepareLoading(t,n){let o=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{},r=arguments.length>3?arguments[3]:void 0;if(!this.backend)return this.logger.warn("No backend was added via i18next.use. Will not load resources."),r&&r();z(t)&&(t=this.languageUtils.toResolveHierarchy(t)),z(n)&&(n=[n]);const i=this.queueLoad(t,n,o,r);if(!i.toLoad.length)return i.pending.length||r(),null;i.toLoad.forEach(a=>{this.loadOne(a)})}load(t,n,o){this.prepareLoading(t,n,{},o)}reload(t,n,o){this.prepareLoading(t,n,{reload:!0},o)}loadOne(t){let n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:"";const o=t.split("|"),r=o[0],i=o[1];this.read(r,i,"read",void 0,void 0,(a,l)=>{a&&this.logger.warn(`${n}loading namespace ${i} for language ${r} failed`,a),!a&&l&&this.logger.log(`${n}loaded namespace ${i} for language ${r}`,l),this.loaded(t,a,l)})}saveMissing(t,n,o,r,i){var s,u,p,f,c;let a=arguments.length>5&&arguments[5]!==void 0?arguments[5]:{},l=arguments.length>6&&arguments[6]!==void 0?arguments[6]:()=>{};if((u=(s=this.services)==null?void 0:s.utils)!=null&&u.hasLoadedNamespace&&!((f=(p=this.services)==null?void 0:p.utils)!=null&&f.hasLoadedNamespace(n))){this.logger.warn(`did not save key "${o}" as the namespace "${n}" was not yet loaded`,"This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!");return}if(!(o==null||o==="")){if((c=this.backend)!=null&&c.create){const S={...a,isUpdate:i},v=this.backend.create.bind(this.backend);if(v.length<6)try{let w;v.length===5?w=v(t,n,o,r,S):w=v(t,n,o,r),w&&typeof w.then=="function"?w.then(I=>l(null,I)).catch(l):l(null,w)}catch(w){l(w)}else v(t,n,o,r,l,S)}!t||!t[0]||this.store.addResource(t[0],n,o,r)}}}const tu=()=>({debug:!1,initAsync:!0,ns:["translation"],defaultNS:["translation"],fallbackLng:["dev"],fallbackNS:!1,supportedLngs:!1,nonExplicitSupportedLngs:!1,load:"all",preload:!1,simplifyPluralSuffix:!0,keySeparator:".",nsSeparator:":",pluralSeparator:"_",contextSeparator:"_",partialBundledLanguages:!1,saveMissing:!1,updateMissing:!1,saveMissingTo:"fallback",saveMissingPlurals:!0,missingKeyHandler:!1,missingInterpolationHandler:!1,postProcess:!1,postProcessPassResolved:!1,returnNull:!1,returnEmptyString:!0,returnObjects:!1,joinArrays:!1,returnedObjectHandler:!1,parseMissingKeyHandler:!1,appendNamespaceToMissingKey:!1,appendNamespaceToCIMode:!1,overloadTranslationOptionHandler:e=>{let t={};if(typeof e[1]=="object"&&(t=e[1]),z(e[1])&&(t.defaultValue=e[1]),z(e[2])&&(t.tDescription=e[2]),typeof e[2]=="object"||typeof e[3]=="object"){const n=e[3]||e[2];Object.keys(n).forEach(o=>{t[o]=n[o]})}return t},interpolation:{escapeValue:!0,format:e=>e,prefix:"{{",suffix:"}}",formatSeparator:",",unescapePrefix:"-",nestingPrefix:"$t(",nestingSuffix:")",nestingOptionsSeparator:",",maxReplaces:1e3,skipOnVariables:!0}}),nu=e=>{var t,n;return z(e.ns)&&(e.ns=[e.ns]),z(e.fallbackLng)&&(e.fallbackLng=[e.fallbackLng]),z(e.fallbackNS)&&(e.fallbackNS=[e.fallbackNS]),((n=(t=e.supportedLngs)==null?void 0:t.indexOf)==null?void 0:n.call(t,"cimode"))<0&&(e.supportedLngs=e.supportedLngs.concat(["cimode"])),typeof e.initImmediate=="boolean"&&(e.initAsync=e.initImmediate),e},tr=()=>{},Tg=e=>{Object.getOwnPropertyNames(Object.getPrototypeOf(e)).forEach(n=>{typeof e[n]=="function"&&(e[n]=e[n].bind(e))})};class _o extends ri{constructor(){let t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},n=arguments.length>1?arguments[1]:void 0;if(super(),this.options=nu(t),this.services={},this.logger=ht,this.modules={external:[]},Tg(this),n&&!this.isInitialized&&!t.isClone){if(!this.options.initAsync)return this.init(t,n),this;setTimeout(()=>{this.init(t,n)},0)}}init(){var t=this;let n=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},o=arguments.length>1?arguments[1]:void 0;this.isInitializing=!0,typeof n=="function"&&(o=n,n={}),n.defaultNS==null&&n.ns&&(z(n.ns)?n.defaultNS=n.ns:n.ns.indexOf("translation")<0&&(n.defaultNS=n.ns[0]));const r=tu();this.options={...r,...this.options,...nu(n)},this.options.interpolation={...r.interpolation,...this.options.interpolation},n.keySeparator!==void 0&&(this.options.userDefinedKeySeparator=n.keySeparator),n.nsSeparator!==void 0&&(this.options.userDefinedNsSeparator=n.nsSeparator);const i=p=>p?typeof p=="function"?new p:p:null;if(!this.options.isClone){this.modules.logger?ht.init(i(this.modules.logger),this.options):ht.init(null,this.options);let p;this.modules.formatter?p=this.modules.formatter:p=Dg;const f=new Yl(this.options);this.store=new Xl(this.options.resources,this.options);const c=this.services;c.logger=ht,c.resourceStore=this.store,c.languageUtils=f,c.pluralResolver=new kg(f,{prepend:this.options.pluralSeparator,simplifyPluralSuffix:this.options.simplifyPluralSuffix}),p&&(!this.options.interpolation.format||this.options.interpolation.format===r.interpolation.format)&&(c.formatter=i(p),c.formatter.init(c,this.options),this.options.interpolation.format=c.formatter.format.bind(c.formatter)),c.interpolator=new Pg(this.options),c.utils={hasLoadedNamespace:this.hasLoadedNamespace.bind(this)},c.backendConnector=new Eg(i(this.modules.backend),c.resourceStore,c,this.options),c.backendConnector.on("*",function(S){for(var v=arguments.length,w=new Array(v>1?v-1:0),I=1;I<v;I++)w[I-1]=arguments[I];t.emit(S,...w)}),this.modules.languageDetector&&(c.languageDetector=i(this.modules.languageDetector),c.languageDetector.init&&c.languageDetector.init(c,this.options.detection,this.options)),this.modules.i18nFormat&&(c.i18nFormat=i(this.modules.i18nFormat),c.i18nFormat.init&&c.i18nFormat.init(this)),this.translator=new jr(this.services,this.options),this.translator.on("*",function(S){for(var v=arguments.length,w=new Array(v>1?v-1:0),I=1;I<v;I++)w[I-1]=arguments[I];t.emit(S,...w)}),this.modules.external.forEach(S=>{S.init&&S.init(this)})}if(this.format=this.options.interpolation.format,o||(o=tr),this.options.fallbackLng&&!this.services.languageDetector&&!this.options.lng){const p=this.services.languageUtils.getFallbackCodes(this.options.fallbackLng);p.length>0&&p[0]!=="dev"&&(this.options.lng=p[0])}!this.services.languageDetector&&!this.options.lng&&this.logger.warn("init: no languageDetector is used and no lng is defined"),["getResource","hasResourceBundle","getResourceBundle","getDataByLanguage"].forEach(p=>{this[p]=function(){return t.store[p](...arguments)}}),["addResource","addResources","addResourceBundle","removeResourceBundle"].forEach(p=>{this[p]=function(){return t.store[p](...arguments),t}});const s=Jn(),u=()=>{const p=(f,c)=>{this.isInitializing=!1,this.isInitialized&&!this.initializedStoreOnce&&this.logger.warn("init: i18next is already initialized. You should call init just once!"),this.isInitialized=!0,this.options.isClone||this.logger.log("initialized",this.options),this.emit("initialized",this.options),s.resolve(c),o(f,c)};if(this.languages&&!this.isInitialized)return p(null,this.t.bind(this));this.changeLanguage(this.options.lng,p)};return this.options.resources||!this.options.initAsync?u():setTimeout(u,0),s}loadResources(t){var i,a;let o=arguments.length>1&&arguments[1]!==void 0?arguments[1]:tr;const r=z(t)?t:this.language;if(typeof t=="function"&&(o=t),!this.options.resources||this.options.partialBundledLanguages){if((r==null?void 0:r.toLowerCase())==="cimode"&&(!this.options.preload||this.options.preload.length===0))return o();const l=[],s=u=>{if(!u||u==="cimode")return;this.services.languageUtils.toResolveHierarchy(u).forEach(f=>{f!=="cimode"&&l.indexOf(f)<0&&l.push(f)})};r?s(r):this.services.languageUtils.getFallbackCodes(this.options.fallbackLng).forEach(p=>s(p)),(a=(i=this.options.preload)==null?void 0:i.forEach)==null||a.call(i,u=>s(u)),this.services.backendConnector.load(l,this.options.ns,u=>{!u&&!this.resolvedLanguage&&this.language&&this.setResolvedLanguage(this.language),o(u)})}else o(null)}reloadResources(t,n,o){const r=Jn();return typeof t=="function"&&(o=t,t=void 0),typeof n=="function"&&(o=n,n=void 0),t||(t=this.languages),n||(n=this.options.ns),o||(o=tr),this.services.backendConnector.reload(t,n,i=>{r.resolve(),o(i)}),r}use(t){if(!t)throw new Error("You are passing an undefined module! Please check the object you are passing to i18next.use()");if(!t.type)throw new Error("You are passing a wrong module! Please check the object you are passing to i18next.use()");return t.type==="backend"&&(this.modules.backend=t),(t.type==="logger"||t.log&&t.warn&&t.error)&&(this.modules.logger=t),t.type==="languageDetector"&&(this.modules.languageDetector=t),t.type==="i18nFormat"&&(this.modules.i18nFormat=t),t.type==="postProcessor"&&Sc.addPostProcessor(t),t.type==="formatter"&&(this.modules.formatter=t),t.type==="3rdParty"&&this.modules.external.push(t),this}setResolvedLanguage(t){if(!(!t||!this.languages)&&!(["cimode","dev"].indexOf(t)>-1))for(let n=0;n<this.languages.length;n++){const o=this.languages[n];if(!(["cimode","dev"].indexOf(o)>-1)&&this.store.hasLanguageSomeTranslations(o)){this.resolvedLanguage=o;break}}}changeLanguage(t,n){var o=this;this.isLanguageChangingTo=t;const r=Jn();this.emit("languageChanging",t);const i=s=>{this.language=s,this.languages=this.services.languageUtils.toResolveHierarchy(s),this.resolvedLanguage=void 0,this.setResolvedLanguage(s)},a=(s,u)=>{u?(i(u),this.translator.changeLanguage(u),this.isLanguageChangingTo=void 0,this.emit("languageChanged",u),this.logger.log("languageChanged",u)):this.isLanguageChangingTo=void 0,r.resolve(function(){return o.t(...arguments)}),n&&n(s,function(){return o.t(...arguments)})},l=s=>{var p,f;!t&&!s&&this.services.languageDetector&&(s=[]);const u=z(s)?s:this.services.languageUtils.getBestMatchFromCodes(s);u&&(this.language||i(u),this.translator.language||this.translator.changeLanguage(u),(f=(p=this.services.languageDetector)==null?void 0:p.cacheUserLanguage)==null||f.call(p,u)),this.loadResources(u,c=>{a(c,u)})};return!t&&this.services.languageDetector&&!this.services.languageDetector.async?l(this.services.languageDetector.detect()):!t&&this.services.languageDetector&&this.services.languageDetector.async?this.services.languageDetector.detect.length===0?this.services.languageDetector.detect().then(l):this.services.languageDetector.detect(l):l(t),r}getFixedT(t,n,o){var r=this;const i=function(a,l){let s;if(typeof l!="object"){for(var u=arguments.length,p=new Array(u>2?u-2:0),f=2;f<u;f++)p[f-2]=arguments[f];s=r.options.overloadTranslationOptionHandler([a,l].concat(p))}else s={...l};s.lng=s.lng||i.lng,s.lngs=s.lngs||i.lngs,s.ns=s.ns||i.ns,s.keyPrefix!==""&&(s.keyPrefix=s.keyPrefix||o||i.keyPrefix);const c=r.options.keySeparator||".";let S;return s.keyPrefix&&Array.isArray(a)?S=a.map(v=>`${s.keyPrefix}${c}${v}`):S=s.keyPrefix?`${s.keyPrefix}${c}${a}`:a,r.t(S,s)};return z(t)?i.lng=t:i.lngs=t,i.ns=n,i.keyPrefix=o,i}t(){var r;for(var t=arguments.length,n=new Array(t),o=0;o<t;o++)n[o]=arguments[o];return(r=this.translator)==null?void 0:r.translate(...n)}exists(){var r;for(var t=arguments.length,n=new Array(t),o=0;o<t;o++)n[o]=arguments[o];return(r=this.translator)==null?void 0:r.exists(...n)}setDefaultNamespace(t){this.options.defaultNS=t}hasLoadedNamespace(t){let n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};if(!this.isInitialized)return this.logger.warn("hasLoadedNamespace: i18next was not initialized",this.languages),!1;if(!this.languages||!this.languages.length)return this.logger.warn("hasLoadedNamespace: i18n.languages were undefined or empty",this.languages),!1;const o=n.lng||this.resolvedLanguage||this.languages[0],r=this.options?this.options.fallbackLng:!1,i=this.languages[this.languages.length-1];if(o.toLowerCase()==="cimode")return!0;const a=(l,s)=>{const u=this.services.backendConnector.state[`${l}|${s}`];return u===-1||u===0||u===2};if(n.precheck){const l=n.precheck(this,a);if(l!==void 0)return l}return!!(this.hasResourceBundle(o,t)||!this.services.backendConnector.backend||this.options.resources&&!this.options.partialBundledLanguages||a(o,t)&&(!r||a(i,t)))}loadNamespaces(t,n){const o=Jn();return this.options.ns?(z(t)&&(t=[t]),t.forEach(r=>{this.options.ns.indexOf(r)<0&&this.options.ns.push(r)}),this.loadResources(r=>{o.resolve(),n&&n(r)}),o):(n&&n(),Promise.resolve())}loadLanguages(t,n){const o=Jn();z(t)&&(t=[t]);const r=this.options.preload||[],i=t.filter(a=>r.indexOf(a)<0&&this.services.languageUtils.isSupportedCode(a));return i.length?(this.options.preload=r.concat(i),this.loadResources(a=>{o.resolve(),n&&n(a)}),o):(n&&n(),Promise.resolve())}dir(t){var r,i;if(t||(t=this.resolvedLanguage||(((r=this.languages)==null?void 0:r.length)>0?this.languages[0]:this.language)),!t)return"rtl";const n=["ar","shu","sqr","ssh","xaa","yhd","yud","aao","abh","abv","acm","acq","acw","acx","acy","adf","ads","aeb","aec","afb","ajp","apc","apd","arb","arq","ars","ary","arz","auz","avl","ayh","ayl","ayn","ayp","bbz","pga","he","iw","ps","pbt","pbu","pst","prp","prd","ug","ur","ydd","yds","yih","ji","yi","hbo","men","xmn","fa","jpr","peo","pes","prs","dv","sam","ckb"],o=((i=this.services)==null?void 0:i.languageUtils)||new Yl(tu());return n.indexOf(o.getLanguagePartFromCode(t))>-1||t.toLowerCase().indexOf("-arab")>1?"rtl":"ltr"}static createInstance(){let t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},n=arguments.length>1?arguments[1]:void 0;return new _o(t,n)}cloneInstance(){let t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:tr;const o=t.forkResourceStore;o&&delete t.forkResourceStore;const r={...this.options,...t,isClone:!0},i=new _o(r);if((t.debug!==void 0||t.prefix!==void 0)&&(i.logger=i.logger.clone(t)),["store","services","language"].forEach(l=>{i[l]=this[l]}),i.services={...this.services},i.services.utils={hasLoadedNamespace:i.hasLoadedNamespace.bind(i)},o){const l=Object.keys(this.store.data).reduce((s,u)=>(s[u]={...this.store.data[u]},Object.keys(s[u]).reduce((p,f)=>(p[f]={...s[u][f]},p),{})),{});i.store=new Xl(l,r),i.services.resourceStore=i.store}return i.translator=new jr(i.services,r),i.translator.on("*",function(l){for(var s=arguments.length,u=new Array(s>1?s-1:0),p=1;p<s;p++)u[p-1]=arguments[p];i.emit(l,...u)}),i.init(r,n),i.translator.options=r,i.translator.backendConnector.services.utils={hasLoadedNamespace:i.hasLoadedNamespace.bind(i)},i}toJSON(){return{options:this.options,store:this.store,language:this.language,languages:this.languages,resolvedLanguage:this.resolvedLanguage}}}const Q=_o.createInstance();Q.createInstance=_o.createInstance;Q.createInstance;Q.dir;Q.init;Q.loadResources;Q.reloadResources;Q.use;Q.changeLanguage;Q.getFixedT;Q.t;Q.exists;Q.setDefaultNamespace;Q.hasLoadedNamespace;Q.loadNamespaces;Q.loadLanguages;const Cg=/&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34|nbsp|#160|copy|#169|reg|#174|hellip|#8230|#x2F|#47);/g,_g={"&amp;":"&","&#38;":"&","&lt;":"<","&#60;":"<","&gt;":">","&#62;":">","&apos;":"'","&#39;":"'","&quot;":'"',"&#34;":'"',"&nbsp;":" ","&#160;":" ","&copy;":"©","&#169;":"©","&reg;":"®","&#174;":"®","&hellip;":"…","&#8230;":"…","&#x2F;":"/","&#47;":"/"},Ag=e=>_g[e],Ig=e=>e.replace(Cg,Ag);let _a={bindI18n:"languageChanged",bindI18nStore:"",transEmptyNodeValue:"",transSupportBasicHtmlNodes:!0,transWrapTextNodes:"",transKeepBasicHtmlNodesFor:["br","strong","i","p"],useSuspense:!0,unescape:Ig};const Og=(e={})=>{_a={..._a,...e}},om=()=>_a;let wc;const Fg=e=>{wc=e},rm=()=>wc,Ng={type:"3rdParty",init(e){Og(e.options.react),Fg(e)}};var bc={exports:{}};/* @license
Papa Parse
v5.7.0
https://github.com/mholt/PapaParse
License: MIT
*/(function(e,t){((n,o)=>{e.exports=o()})(Ec,function n(){var o=typeof self<"u"?self:typeof window<"u"?window:o!==void 0?o:{},r=!o.document&&!!o.postMessage,i=o.IS_PAPA_WORKER||!1,a={},l=0,s={};function u(d){return d.charCodeAt(0)===65279?d.slice(1):d}function p(d){this._handle=null,this._finished=!1,this._completed=!1,this._halted=!1,this._input=null,this._baseIndex=0,this._partialLine="",this._rowCount=0,this._start=0,this._nextChunk=null,this.isFirstChunk=!0,this._completeResults={data:[],errors:[],meta:{}},(function(g){var x=T(g);x.chunkSize=parseInt(x.chunkSize),g.step||g.chunk||(x.chunkSize=null),this._handle=new w(x),(this._handle.streamer=this)._config=x}).call(this,d),this.parseChunk=function(g,x){var L=parseInt(this._config.skipFirstNLines)||0;if(this.isFirstChunk&&0<L){let M=this._config.newline;M||(E=this._config.quoteChar||'"',M=this._handle.guessLineEndings(g,E)),g=[...g.split(M).slice(L)].join(M)}this.isFirstChunk&&P(this._config.beforeFirstChunk)&&(E=this._config.beforeFirstChunk(g))!==void 0&&(g=E),this.isFirstChunk=!1,this._halted=!1;var L=this._partialLine+g,E=(this._partialLine="",this._handle.parse(L,this._baseIndex,!this._finished));if(!this._handle.paused()&&!this._handle.aborted()){if(g=E.meta.cursor,L=(this._finished||(this._partialLine=L.substring(g-this._baseIndex),this._baseIndex=g),E&&E.data&&(this._rowCount+=E.data.length),this._finished||this._config.preview&&this._rowCount>=this._config.preview),i)o.postMessage({results:E,workerId:s.WORKER_ID,finished:L});else if(P(this._config.chunk)&&!x){if(this._config.chunk(E,this._handle),this._handle.paused()||this._handle.aborted())return void(this._halted=!0);this._completeResults=E=void 0}return this._config.step||this._config.chunk||(this._completeResults.data=this._completeResults.data.concat(E.data),this._completeResults.errors=this._completeResults.errors.concat(E.errors),this._completeResults.meta=E.meta),this._completed||!L||!P(this._config.complete)||E&&E.meta.aborted||(this._config.complete(this._completeResults,this._input),this._completed=!0),L||E&&E.meta.paused||this._nextChunk(),E}this._halted=!0},this._sendError=function(g){P(this._config.error)?this._config.error(g):i&&this._config.error&&o.postMessage({workerId:s.WORKER_ID,error:g,finished:!1})}}function f(d){var g;(d=d||{}).chunkSize||(d.chunkSize=s.RemoteChunkSize),p.call(this,d),this._nextChunk=r?function(){this._readChunk(),this._chunkLoaded()}:function(){this._readChunk()},this.stream=function(x){this._input=x,this._nextChunk()},this._readChunk=function(){if(this._finished)this._chunkLoaded();else{if(g=new XMLHttpRequest,this._config.withCredentials&&(g.withCredentials=this._config.withCredentials),r||(g.onload=C(this._chunkLoaded,this),g.onerror=C(this._chunkError,this)),g.ontimeout=C(this._chunkTimeout,this),g.open(this._config.downloadRequestBody?"POST":"GET",this._input,!r),this._config.downloadTimeout&&!r&&(g.timeout=this._config.downloadTimeout),this._config.downloadRequestHeaders){var x,L=this._config.downloadRequestHeaders;for(x in L)g.setRequestHeader(x,L[x])}var E;this._config.chunkSize&&(E=this._start+this._config.chunkSize-1,g.setRequestHeader("Range","bytes="+this._start+"-"+E));try{g.send(this._config.downloadRequestBody)}catch(M){this._chunkError(M.message)}r&&g.status===0&&this._chunkError()}},this._chunkLoaded=function(){g.readyState===4&&(g.status<200||400<=g.status?this._chunkError():(this._start+=this._config.chunkSize||g.responseText.length,this._finished=!this._config.chunkSize||this._start>=(x=>(x=x.getResponseHeader("Content-Range"))!==null?parseInt(x.substring(x.lastIndexOf("/")+1)):-1)(g),this.parseChunk(g.responseText)))},this._chunkError=function(x){x=g.statusText||x,this._sendError(new Error(x))},this._chunkTimeout=function(){this._chunkError("Request timed out after "+this._config.downloadTimeout+"ms")}}function c(d){(d=d||{}).chunkSize||(d.chunkSize=s.LocalChunkSize),p.call(this,d);var g,x,L=typeof FileReader<"u";this.stream=function(E){this._input=E,x=E.slice||E.webkitSlice||E.mozSlice,L?((g=new FileReader).onload=C(this._chunkLoaded,this),g.onerror=C(this._chunkError,this)):g=new FileReaderSync,this._nextChunk()},this._nextChunk=function(){this._finished||this._config.preview&&!(this._rowCount<this._config.preview)||this._readChunk()},this._readChunk=function(){var E=this._input,M=(this._config.chunkSize&&(M=Math.min(this._start+this._config.chunkSize,this._input.size),E=x.call(E,this._start,M)),g.readAsText(E,this._config.encoding));L||this._chunkLoaded({target:{result:M}})},this._chunkLoaded=function(E){this._start+=this._config.chunkSize,this._finished=!this._config.chunkSize||this._start>=this._input.size,this.parseChunk(E.target.result)},this._chunkError=function(){this._sendError(g.error)}}function S(d){var g;p.call(this,d=d||{}),this.stream=function(x){return g=x,this._nextChunk()},this._nextChunk=function(){var x,L;if(!this._finished)return x=this._config.chunkSize,g=x?(L=g.substring(0,x),g.substring(x)):(L=g,""),this._finished=!g,this.parseChunk(L)}}function v(d){p.call(this,d=d||{});var g=[],x=!0,L=!1;this.pause=function(){p.prototype.pause.apply(this,arguments),this._input.pause()},this.resume=function(){p.prototype.resume.apply(this,arguments),this._input.resume()},this.stream=function(E){this._input=E,this._input.on("data",this._streamData),this._input.on("end",this._streamEnd),this._input.on("error",this._streamError)},this._checkIsFinished=function(){L&&g.length===1&&(this._finished=!0)},this._nextChunk=function(){this._checkIsFinished(),g.length?this.parseChunk(g.shift()):x=!0},this._streamData=C(function(E){try{g.push(typeof E=="string"?E:E.toString(this._config.encoding)),x&&(x=!1,this._checkIsFinished(),this.parseChunk(g.shift()))}catch(M){this._streamError(M)}},this),this._streamError=C(function(E){this._streamCleanUp(),this._sendError(E)},this),this._streamEnd=C(function(){this._streamCleanUp(),L=!0,this._streamData("")},this),this._streamCleanUp=C(function(){this._input.removeListener("data",this._streamData),this._input.removeListener("end",this._streamEnd),this._input.removeListener("error",this._streamError)},this)}function w(d){var g,x,L,E,M=Math.pow(2,53),X=-M,le=/^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/,ge=/^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/,$=this,D=0,k=0,F=!1,_=!1,N=[],O={data:[],errors:[],meta:{}};function ce(U){return d.skipEmptyLines==="greedy"?U.join("").trim()==="":U.length===1&&U[0].length===0}function Y(){if(O&&L&&(De("Delimiter","UndetectableDelimiter","Unable to auto-detect delimiting character; defaulted to '"+s.DefaultDelimiter+"'"),L=!1),d.skipEmptyLines&&(O.data=O.data.filter(function(R){return!ce(R)})),K()){let R=function(he){N.push(he)};if(O)if(Array.isArray(O.data[0])){for(var U=0;K()&&U<O.data.length;U++)O.data[U].forEach(R);O.data.splice(0,1)}else O.data.forEach(R)}function V(R,he){for(var we=d.header?{}:[],J=0;J<R.length;J++){var Z=J,W=R[J],W=((Ze,G)=>(re=>(d.dynamicTypingFunction&&d.dynamicTyping[re]===void 0&&(d.dynamicTyping[re]=d.dynamicTypingFunction(re)),(d.dynamicTyping[re]||d.dynamicTyping)===!0))(Ze)?G==="true"||G==="TRUE"||G!=="false"&&G!=="FALSE"&&((re=>{if(le.test(re)&&(re=parseFloat(re),X<re&&re<M))return 1})(G)?parseFloat(G):ge.test(G)?new Date(G):G===""?null:G):G)(Z=d.header?J>=N.length?"__parsed_extra":N[J]:Z,W=d.transform?d.transform(W,Z):W);Z==="__parsed_extra"?(we[Z]=we[Z]||[],we[Z].push(W)):we[Z]=W}return d.header&&(J>N.length?De("FieldMismatch","TooManyFields","Too many fields: expected "+N.length+" fields but parsed "+J,k+he):J<N.length&&De("FieldMismatch","TooFewFields","Too few fields: expected "+N.length+" fields but parsed "+J,k+he)),we}var ue;O&&(d.header||d.dynamicTyping||d.transform)&&(ue=1,!O.data.length||Array.isArray(O.data[0])?(O.data=O.data.map(V),ue=O.data.length):O.data=V(O.data,0),d.header&&O.meta&&(O.meta.fields=N),k+=ue)}function K(){return d.header&&N.length===0}function De(U,V,ue,R){U={type:U,code:V,message:ue},R!==void 0&&(U.row=R),O.errors.push(U)}P(d.step)&&(E=d.step,d.step=function(U){O=U,K()?Y():(Y(),O.data.length!==0&&(D+=U.data.length,d.preview&&D>d.preview?x.abort():(O.data=O.data[0],E(O,$))))}),this.parse=function(U,V,ue){var R=d.quoteChar||'"',R=(d.newline||(d.newline=this.guessLineEndings(U,R)),L=!1,d.delimiter?P(d.delimiter)&&(d.delimiter=d.delimiter(U),O.meta.delimiter=d.delimiter):((R=((he,we,J,Z,W)=>{var Ze,G,re,Qt;W=W||[",","	","|",";",s.RECORD_SEP,s.UNIT_SEP];for(var un=0;un<W.length;un++){for(var st,Vn=W[un],be=0,lt=0,xe=0,Fe=(re=void 0,new m({comments:Z,delimiter:Vn,newline:we,preview:10}).parse(he)),mt=0;mt<Fe.data.length;mt++)J&&ce(Fe.data[mt])?xe++:(st=Fe.data[mt].length,lt+=st,re===void 0?re=st:0<st&&(be+=Math.abs(st-re),re=st));0<Fe.data.length&&(lt/=Fe.data.length-xe),1.99<lt&&(G===void 0||be<G||be===G&&Qt<lt)&&(G=be,Ze=Vn,Qt=lt)}return{successful:!!(d.delimiter=Ze),bestDelimiter:Ze}})(U,d.newline,d.skipEmptyLines,d.comments,d.delimitersToGuess)).successful?d.delimiter=R.bestDelimiter:(L=!0,d.delimiter=s.DefaultDelimiter),O.meta.delimiter=d.delimiter),T(d));return R.header=K(),d.preview&&d.header&&R.preview++,g=U,x=new m(R),O=x.parse(g,V,ue),Y(),F?{meta:{paused:!0}}:O||{meta:{paused:!1}}},this.paused=function(){return F},this.pause=function(){F=!0,x.abort(),g=P(d.chunk)?"":g.substring(x.getCharIndex())},this.resume=function(){$.streamer._halted?(F=!1,$.streamer.parseChunk(g,!0)):setTimeout($.resume,3)},this.aborted=function(){return _},this.abort=function(){_=!0,x.abort(),O.meta.aborted=!0,P(d.complete)&&d.complete(O),g=""},this.guessLineEndings=function(he,R){he=he.substring(0,1048576);var R=new RegExp(I(R)+"([^]*?)"+I(R),"gm"),ue=(he=he.replace(R,"")).split("\r"),R=he.split(`
`),he=1<R.length&&R[0].length<ue[0].length;if(ue.length===1||he)return`
`;for(var we=0,J=0;J<ue.length;J++)ue[J][0]===`
`&&we++;return we>=ue.length/2?`\r
`:"\r"}}function I(d){return d.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function m(d){var g=(d=d||{}).delimiter,x=d.newline,L=d.comments,E=d.step,M=d.preview,X=d.fastMode,le=null,ge=!1,$=d.quoteChar==null?'"':d.quoteChar,D=$;if(d.escapeChar!==void 0&&(D=d.escapeChar),(typeof g!="string"||-1<s.BAD_DELIMITERS.indexOf(g))&&(g=","),L===g)throw new Error("Comment character same as delimiter");L===!0?L="#":(typeof L!="string"||-1<s.BAD_DELIMITERS.indexOf(L))&&(L=!1),x!==`
`&&x!=="\r"&&x!==`\r
`&&(x=`
`);var k=0,F=!1;this.parse=function(_,N,O){if(typeof _!="string")throw new Error("Input must be a string");var ce=_.length,Y=g.length,K=x.length,De=L.length,U=P(E),V=[],ue=[],R=[],he=k=0;if(!_)return be();if(X||X!==!1&&_.indexOf($)===-1){for(var we=_.split(x),J=0;J<we.length;J++){if(R=we[J],k+=R.length,J!==we.length-1)k+=x.length;else if(O)return be();if(!L||R.substring(0,De)!==L){if(U){if(V=[],Qt(R.split(g)),lt(),F)return be()}else Qt(R.split(g));if(M&&M<=J)return V=V.slice(0,M),be(!0)}}return be()}for(var Z=_.indexOf(g,k),W=_.indexOf(x,k),Ze=new RegExp(I(D)+I($),"g"),G=_.indexOf($,k);;)if(_[k]===$)for(G=k,k++;;){if((G=_.indexOf($,G+1))===-1)return O||ue.push({type:"Quotes",code:"MissingQuotes",message:"Quoted field unterminated",row:V.length,index:k}),st();if(G===ce-1)return st(_.substring(k,G).replace(Ze,$));if($===D&&_[G+1]===D)G++;else if($===D||G===0||_[G-1]!==D){Z!==-1&&Z<G+1&&(Z=_.indexOf(g,G+1));var re=un((W=W!==-1&&W<G+1?_.indexOf(x,G+1):W)===-1?Z:Math.min(Z,W));if(_.substr(G+1+re,Y)===g){R.push(_.substring(k,G).replace(Ze,$)),_[k=G+1+re+Y]!==$&&(G=_.indexOf($,k)),Z=_.indexOf(g,k),W=_.indexOf(x,k);break}if(re=un(W),_.substring(G+1+re,G+1+re+K)===x){if(R.push(_.substring(k,G).replace(Ze,$)),Vn(G+1+re+K),Z=_.indexOf(g,k),G=_.indexOf($,k),U&&(lt(),F))return be();if(M&&V.length>=M)return be(!0);break}ue.push({type:"Quotes",code:"InvalidQuotes",message:"Trailing quote on quoted field is malformed",row:V.length,index:k}),G++}}else if(L&&R.length===0&&_.substring(k,k+De)===L){if(W===-1)return be();k=W+K,W=_.indexOf(x,k),Z=_.indexOf(g,k)}else if(Z!==-1&&(Z<W||W===-1))R.push(_.substring(k,Z)),k=Z+Y,Z=_.indexOf(g,k);else{if(W===-1)break;if(R.push(_.substring(k,W)),Vn(W+K),U&&(lt(),F))return be();if(M&&V.length>=M)return be(!0)}return st();function Qt(xe){V.push(xe),he=k}function un(xe){var Fe=0;return Fe=xe!==-1&&(xe=_.substring(G+1,xe))&&xe.trim()===""?xe.length:Fe}function st(xe){return O||(xe===void 0&&(xe=_.substring(k)),R.push(xe),k=ce,Qt(R),U&&lt()),be()}function Vn(xe){k=xe,Qt(R),R=[],W=_.indexOf(x,k)}function be(xe){if(d.header&&!N&&V.length&&!ge){var Fe=V[0],mt=Object.create(null),si=new Set(Fe);let As=!1;for(let dn=0;dn<Fe.length;dn++){let ut=u(Fe[dn]);if(mt[ut=P(d.transformHeader)?d.transformHeader(ut,dn):ut]){let Wn,Is=mt[ut];for(;Wn=ut+"_"+Is,Is++,si.has(Wn););si.add(Wn),Fe[dn]=Wn,mt[ut]++,As=!0,(le=le===null?{}:le)[Wn]=ut}else mt[ut]=1,Fe[dn]=ut;si.add(ut)}As&&console.warn("Duplicate headers found and renamed."),ge=!0}return{data:V,errors:ue,meta:{delimiter:g,linebreak:x,aborted:F,truncated:!!xe,cursor:he+(N||0),renamedHeaders:le}}}function lt(){E(be()),V=[],ue=[]}},this.abort=function(){F=!0},this.getCharIndex=function(){return k}}function h(d){var g=d.data,x=a[g.workerId],L=!1;if(g.error)x.userError(g.error,g.file);else if(g.results&&g.results.data){var E={abort:function(){L=!0,y(g.workerId,{data:[],errors:[],meta:{aborted:!0}})},pause:b,resume:b};if(P(x.userStep)){for(var M=0;M<g.results.data.length&&(x.userStep({data:g.results.data[M],errors:g.results.errors,meta:g.results.meta},E),!L);M++);delete g.results}else P(x.userChunk)&&(x.userChunk(g.results,E,g.file),delete g.results)}g.finished&&!L&&y(g.workerId,g.results)}function y(d,g){var x=a[d];P(x.userComplete)&&x.userComplete(g),x.terminate(),delete a[d]}function b(){throw new Error("Not implemented.")}function T(d){if(typeof d!="object"||d===null)return d;var g,x=Array.isArray(d)?[]:{};for(g in d)x[g]=T(d[g]);return x}function C(d,g){return function(){d.apply(g,arguments)}}function P(d){return typeof d=="function"}return s.parse=function(d,g){var x=(g=g||{}).dynamicTyping||!1;if(P(x)&&(g.dynamicTypingFunction=x,x={}),g.dynamicTyping=x,g.transform=!!P(g.transform)&&g.transform,g.downloadTimeout!==void 0){var x=parseInt(g.downloadTimeout);if(isNaN(x))throw new Error("Config downloadTimeout value ("+g.downloadTimeout+") not parsable by parseInt(val).");g.downloadTimeout=x}if(!g.worker||!s.WORKERS_SUPPORTED)return x=null,s.NODE_STREAM_INPUT,typeof d=="string"?(d=u(d),x=new(g.download?f:S)(g)):d.readable===!0&&P(d.read)&&P(d.on)?x=new v(g):(o.File&&d instanceof File||d instanceof Object)&&(x=new c(g)),x.stream(d);(x=(()=>{var L;return!!s.WORKERS_SUPPORTED&&(L=(()=>{var E=o.URL||o.webkitURL||null,M=n.toString();return s.BLOB_URL||(s.BLOB_URL=E.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ","(",M,")();"],{type:"text/javascript"})))})(),(L=new o.Worker(L)).onmessage=h,L.id=l++,a[L.id]=L)})()).userStep=g.step,x.userChunk=g.chunk,x.userComplete=g.complete,x.userError=g.error,g.step=P(g.step),g.chunk=P(g.chunk),g.complete=P(g.complete),g.error=P(g.error),delete g.worker,x.postMessage({input:d,config:g,workerId:x.id})},s.unparse=function(d,g){var x=!1,L=!0,E=",",M=`\r
`,X='"',le=X+X,ge=!1,$=null,D=!1,k=((()=>{if(typeof g=="object"){if(typeof g.delimiter!="string"||s.BAD_DELIMITERS.filter(function(N){return g.delimiter.indexOf(N)!==-1}).length||(E=g.delimiter),typeof g.quotes!="boolean"&&typeof g.quotes!="function"&&!Array.isArray(g.quotes)||(x=g.quotes),typeof g.skipEmptyLines!="boolean"&&typeof g.skipEmptyLines!="string"||(ge=g.skipEmptyLines),typeof g.newline=="string"&&(M=g.newline),typeof g.quoteChar=="string"&&(X=g.quoteChar,le=X+X),typeof g.header=="boolean"&&(L=g.header),Array.isArray(g.columns)){if(g.columns.length===0)throw new Error("Option columns is empty");$=g.columns}g.escapeChar!==void 0&&(le=g.escapeChar+X),g.escapeFormulae instanceof RegExp?D=g.escapeFormulae:typeof g.escapeFormulae=="boolean"&&g.escapeFormulae&&(D=/^[=+\-@\t\r].*$/)}})(),new RegExp(I(X),"g"));if(typeof d=="string"&&(d=JSON.parse(d)),Array.isArray(d)){if(!d.length||Array.isArray(d[0]))return F(null,d,ge);if(typeof d[0]=="object")return F($||Object.keys(d[0]),d,ge)}else if(typeof d=="object")return typeof d.data=="string"&&(d.data=JSON.parse(d.data)),Array.isArray(d.data)&&(d.fields||(d.fields=d.meta&&d.meta.fields||$),d.fields||(d.fields=Array.isArray(d.data[0])?d.fields:typeof d.data[0]=="object"?Object.keys(d.data[0]):[]),Array.isArray(d.data[0])||typeof d.data[0]=="object"||(d.data=[d.data])),F(d.fields||[],d.data||[],ge);throw new Error("Unable to serialize unrecognized input");function F(N,O,ce){var Y="",K=(typeof N=="string"&&(N=JSON.parse(N)),typeof O=="string"&&(O=JSON.parse(O)),Array.isArray(N)&&0<N.length),De=!Array.isArray(O[0]);if(K&&L){for(var U=0;U<N.length;U++)0<U&&(Y+=E),Y+=_(N[U],U);0<O.length&&(Y+=M)}for(var V=0;V<O.length;V++){var ue=(K?N:O[V]).length,R=!1,he=K?Object.keys(O[V]).length===0:O[V].length===0;if(ce&&!K&&(R=ce==="greedy"?O[V].join("").trim()==="":O[V].length===1&&O[V][0].length===0),ce==="greedy"&&K){for(var we=[],J=0;J<ue;J++){var Z=De?N[J]:J;we.push(O[V][Z])}R=we.join("").trim()===""}if(!R){for(var W=0;W<ue;W++){0<W&&!he&&(Y+=E);var Ze=K&&De?N[W]:W;Y+=_(O[V][Ze],W)}V<O.length-1&&(!ce||0<ue&&!he)&&(Y+=M)}}return Y}function _(N,O){var ce,Y,K;return N==null?"":N.constructor===Date?isNaN(N.getTime())?"":N.toISOString():(K=!1,D&&typeof N=="string"&&D.test(N)&&(N="'"+N,K=!0),Y=(ce=N.toString()).replace(k,le),(K=K||x===!0||typeof x=="function"&&x(N,O)||Array.isArray(x)&&x[O]||((De,U)=>{for(var V=0;V<U.length;V++)if(-1<De.indexOf(U[V]))return!0;return!1})(Y,s.BAD_DELIMITERS)||-1<Y.indexOf(E)||-1<ce.indexOf(X)||Y.charAt(0)===" "||Y.charAt(Y.length-1)===" ")?X+Y+X:Y)}},s.RECORD_SEP="",s.UNIT_SEP="",s.BYTE_ORDER_MARK="\uFEFF",s.BAD_DELIMITERS=["\r",`
`,'"',s.BYTE_ORDER_MARK],s.WORKERS_SUPPORTED=!r&&!!o.Worker,s.NODE_STREAM_INPUT=1,s.LocalChunkSize=10485760,s.RemoteChunkSize=5242880,s.DefaultDelimiter=",",s.Parser=m,s.ParserHandle=w,s.NetworkStreamer=f,s.FileStreamer=c,s.StringStreamer=S,s.ReadableStreamStreamer=v,i&&(o.onmessage=function(d){d=d.data,s.WORKER_ID===void 0&&d&&(s.WORKER_ID=d.workerId),typeof d.input=="string"?o.postMessage({workerId:s.WORKER_ID,results:s.parse(d.input,d.config),finished:!0}):(o.File&&d.input instanceof File||d.input instanceof Object)&&(d=s.parse(d.input,d.config))&&o.postMessage({workerId:s.WORKER_ID,results:d,finished:!0})}),(f.prototype=Object.create(p.prototype)).constructor=f,(c.prototype=Object.create(p.prototype)).constructor=c,(S.prototype=Object.create(S.prototype)).constructor=S,(v.prototype=Object.create(p.prototype)).constructor=v,s})})(bc);var Rg=bc.exports;const zg=au(Rg),Ts="temer.uiLanguage";function Mg(e=kc(),t=typeof navigator<"u"&&navigator.language||"",n=Wg()){return e==="ja"||e==="en"?e:n||t.toLowerCase().startsWith("ja")||t===""?"ja":"en"}async function Gg(e,t,n=kc()){if(n==="ja"||n==="en")return n;let o=e;if(o!=="ja")try{await t()&&(o="ja")}catch{}return jg(o),o}function jg(e){try{localStorage.setItem(Ts,e)}catch{}}function kc(){try{return typeof localStorage<"u"?localStorage.getItem(Ts):null}catch{return null}}function Vg(e){return e.some(t=>(t.startsWith("temer:")||t.startsWith("temer."))&&t!==Ts)}function Wg(){try{if(typeof localStorage>"u")return!1;const e=[];for(let t=0;t<localStorage.length;t++){const n=localStorage.key(t);n&&e.push(n)}return Vg(e)}catch{return!1}}const Ug=["ja","en"],Hg=new Set(["key","note"]);function $g(e){const t=zg.parse(e.replace(/^﻿/,""),{header:!0,skipEmptyLines:!0});return{languages:(t.meta.fields??[]).filter(o=>!Hg.has(o)),rows:t.data.filter(o=>(o.key??"").trim()!=="")}}function Qg(e){var n;const t={};for(const[o,r]of Object.entries(e)){const i=o.match(/locales\/([^/]+)\.csv$/);if(!i)continue;const a=i[1],{languages:l,rows:s}=$g(r);for(const u of l){t[u]??(t[u]={}),(n=t[u])[a]??(n[a]={});for(const p of s){const f=p[u];f!=null&&f!==""&&(t[u][a][p.key.trim()]=f)}}}return t}const Xg=Object.assign({"./locales/anonymizeExportDialog.csv":nf,"./locales/app.csv":of,"./locales/boxQuickEdit.csv":rf,"./locales/boxThemes.csv":af,"./locales/canvas.csv":sf,"./locales/changelogDialog.csv":lf,"./locales/colorPicker.csv":uf,"./locales/commandPalette.csv":df,"./locales/comments.csv":cf,"./locales/crashScreen.csv":pf,"./locales/csvImport.csv":hf,"./locales/csvImportDialog.csv":ff,"./locales/dataSheet.csv":gf,"./locales/decorationEditor.csv":mf,"./locales/defaults.csv":yf,"./locales/errorBoundary.csv":xf,"./locales/exportContent.csv":vf,"./locales/exportImage.csv":Sf,"./locales/exportPDF.csv":wf,"./locales/exportPPT.csv":bf,"./locales/exportPresets.csv":kf,"./locales/exportPreviewDialog.csv":Pf,"./locales/exportReport.csv":Bf,"./locales/exportSVGNative.csv":Df,"./locales/fileIO.csv":Lf,"./locales/importWizardDialog.csv":Ef,"./locales/insertBetweenDialog.csv":Tf,"./locales/legendOverlay.csv":Cf,"./locales/lineEdge.csv":_f,"./locales/maxqdaImport.csv":Af,"./locales/notationDescribe.csv":If,"./locales/noteNode.csv":Of,"./locales/overlapCheckDialog.csv":Ff,"./locales/overlapDetect.csv":Nf,"./locales/paperReportDialog.csv":Rf,"./locales/paperSizes.csv":zf,"./locales/periodLabelsDialog.csv":Mf,"./locales/periodLabelsOverlay.csv":Gf,"./locales/pptxImport.csv":jf,"./locales/pptxImportDialog.csv":Vf,"./locales/printWindow.csv":Wf,"./locales/printing.csv":Uf,"./locales/propertyPanel.csv":Hf,"./locales/reportStatus.csv":$f,"./locales/resizeDialog.csv":Qf,"./locales/ribbon.csv":Xf,"./locales/richTextToolbar.csv":Kf,"./locales/segmentList.csv":qf,"./locales/settingsDialog.csv":Yf,"./locales/sheetTabs.csv":Jf,"./locales/shiftContentDialog.csv":Zf,"./locales/sourceRefsSection.csv":eg,"./locales/startupWizardDialog.csv":tg,"./locales/statusBar.csv":ng,"./locales/store.csv":og,"./locales/tabularFile.csv":rg,"./locales/terms.csv":ig,"./locales/transcriptBulkImportDialog.csv":ag,"./locales/transcriptImport.csv":sg,"./locales/transcriptImportDialog.csv":lg,"./locales/transcriptViewer.csv":ug,"./locales/translation.csv":dg,"./locales/visualConventions.csv":cg}),Pc=Qg(Xg),Kg=Object.keys(Pc.ja??{}),qg=Mg();Q.use(Ng).init({resources:Pc,lng:qg,fallbackLng:"ja",supportedLngs:Ug,ns:Kg,defaultNS:"translation",keySeparator:!1,interpolation:{escapeValue:!1},returnNull:!1});function Aa(e){typeof document>"u"||(document.documentElement.lang=e,document.title=Q.t("translation:app.title",{lng:e}))}Q.on("languageChanged",Aa);Q.isInitialized?Aa(Q.language):Q.on("initialized",()=>Aa(Q.language));function ii(e){return new Promise((t,n)=>{e.oncomplete=e.onsuccess=()=>t(e.result),e.onabort=e.onerror=()=>n(e.error)})}function Yg(e,t){let n;const o=()=>{if(n)return n;const r=indexedDB.open(e);return r.onupgradeneeded=()=>r.result.createObjectStore(t),n=ii(r),n.then(i=>{i.onclose=()=>n=void 0},()=>{n=void 0}),n};return(r,i)=>o().then(a=>i(a.transaction(t,r).objectStore(t)))}let Ni;function Cs(){return Ni||(Ni=Yg("keyval-store","keyval")),Ni}function Ia(e,t=Cs()){return t("readonly",n=>ii(n.get(e)))}function ou(e,t,n=Cs()){return n("readwrite",o=>(o.put(t,e),ii(o.transaction)))}function ru(e,t=Cs()){return t("readwrite",n=>(n.delete(e),ii(n.transaction)))}const _s="temer-autosave",ai="temer-autosave-meta",im=3e4;function Bc(){return"showSaveFilePicker"in window&&"showOpenFilePicker"in window}async function am(e,t){const n=JSON.stringify(e,null,2),o=new Blob([n],{type:"application/json"}),r=Zg(e.metadata.title||"Untitled")+".tem";if(Bc())try{let i;t?i=t:i=await window.showSaveFilePicker({suggestedName:r,types:[{description:"TEMer Document",accept:{"application/json":[".tem"]}}]});const a=await i.createWritable();return await a.write(o),await a.close(),i}catch(i){if(i.name==="AbortError")return null;console.error("File System Access save failed, falling back to download:",i)}return Jg(o,r),null}async function sm(){if(Bc())try{const[e]=await window.showOpenFilePicker({types:[{description:"TEMer Document",accept:{"application/json":[".tem"]}}]}),n=await(await e.getFile()).text();return{doc:iu(n),handle:e}}catch(e){if(e.name==="AbortError")return null;throw e}return new Promise(e=>{const t=document.createElement("input");t.type="file",t.accept=".tem,application/json",t.onchange=async()=>{var r;const n=(r=t.files)==null?void 0:r[0];if(!n){e(null);return}const o=await n.text();try{const i=iu(o);e({doc:i,handle:null})}catch(i){alert(Q.t("fileIO:error.loadfailed",{message:i.message})),e(null)}},t.click()})}function iu(e){const t=JSON.parse(e);if(!t||typeof t!="object")throw new Error(Q.t("fileIO:error.invalidjson"));if(!Array.isArray(t.sheets))throw new Error(Q.t("fileIO:error.nosheets"));if(!t.settings)throw new Error(Q.t("fileIO:error.nosettings"));if(!t.metadata)throw new Error(Q.t("fileIO:error.nometadata"));t.version&&t.version!=="0.3"&&t.version!=="0.4"&&console.warn(Q.t("fileIO:warn.version",{version:t.version})),t.version==="0.3"&&(t.version="0.4"),Array.isArray(t.transcripts)||(t.transcripts=[]);for(const n of t.sheets)if(n&&Array.isArray(n.annotations)&&!n.notes&&(n.notes=n.annotations,delete n.annotations),n&&!Array.isArray(n.notes)&&(n.notes=[]),n&&Array.isArray(n.sdsg)&&Array.isArray(n.boxes)&&Array.isArray(n.lines)){const o=new Set(n.boxes.map(r=>r.id));for(const r of n.sdsg)r&&!r.attachedType&&typeof r.attachedTo=="string"&&(r.attachedType=o.has(r.attachedTo)?"box":"line"),r&&!r.attachedType2&&typeof r.attachedTo2=="string"&&(r.attachedType2=o.has(r.attachedTo2)?"box":"line")}return t}function Jg(e,t){const n=URL.createObjectURL(e),o=document.createElement("a");o.href=n,o.download=t,o.click(),URL.revokeObjectURL(n)}function Zg(e){return e.replace(/[\/\\:*?"<>|]/g,"_").trim()||"Untitled"}async function lm(e){await ou(_s,e);const t={savedAt:new Date().toISOString(),title:e.metadata.title,version:e.version};await ou(ai,t)}async function em(){return await Ia(ai)!=null}async function um(){const[e,t]=await Promise.all([Ia(_s),Ia(ai)]);return!e||!t?null:{doc:e,meta:t}}async function dm(){await ru(_s),await ru(ai)}async function tm(){try{const o=await Gg(Q.language,em);o!==Q.language&&await Q.changeLanguage(o)}catch{}const[{default:e},{ErrorBoundary:t},{CrashScreen:n}]=await Promise.all([li(()=>import("./App-DlyTP2Zd.js").then(o=>o.A),__vite__mapDeps([0,1,2,3]),import.meta.url),li(()=>import("./ErrorBoundary-BIQlMtz8.js"),[],import.meta.url),li(()=>import("./CrashScreen-DH_kLMit.js"),__vite__mapDeps([4,1]),import.meta.url)]);Ri.createRoot(document.getElementById("root")).render(zo.jsx(Uc.StrictMode,{children:zo.jsx(t,{label:"App",fallback:(o,r)=>zo.jsx(n,{error:o,info:r}),children:zo.jsx(e,{})})}))}tm();export{im as B,zg as P,Uc as R,li as _,om as a,rm as b,tf as c,Ec as d,dm as e,lm as f,au as g,am as h,Q as i,zo as j,sm as k,um as l,Mg as m,nm as n,za as r,jg as s};
