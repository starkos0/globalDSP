import{aa as o}from"./chunk-BHHZEHAT.js";var p=(()=>{let t=class t{transform(e){if(e==null)return"No power";let n=["W","kW","MW","GW","TW"],i=0;for(;e>=1e3&&i<n.length-1;)e/=1e3,i++;return`${e.toFixed(2)} ${n[i]}`}};t.\u0275fac=function(n){return new(n||t)},t.\u0275pipe=o({name:"powerConversion",type:t,pure:!0,standalone:!0});let r=t;return r})();export{p as PowerConversionPipe};
