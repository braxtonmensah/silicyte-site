const fs=require('fs'),path=require('path');const S=process.argv[2];
const o=JSON.parse(fs.readFileSync(path.join(S,'labcurve_out.json'),'utf8'));
const per={};
for(const l of fs.readFileSync(path.join(S,'sacct.txt'),'utf8').split(/\r?\n/)){if(!l)continue;const [id,sub,st,el,tres]=l.split('|');if(!st||st==='None'||st==='Unknown')continue;const g=(tres||'').match(/gres\/gpu=(\d+)/);if(!g)continue;
 let t=Date.parse(st+'Z');const end=t+(+el)*1000;while(t<end){const d=new Date(t).toISOString().slice(0,10);const next=Date.parse(d+'T00:00:00Z')+864e5;const seg=Math.min(end,next)-t;per[d]=(per[d]||0)+(+g[1])*seg/3.6e6;t=Math.min(end,next);}}
function a(inc){let c=0;const x=[],y=[];inc.forEach((v,i)=>{c+=v;if(c>0){x.push(Math.log(i+1));y.push(Math.log(c));}});const n=x.length,mx=x.reduce((p,q)=>p+q)/n,my=y.reduce((p,q)=>p+q)/n;let sxy=0,sxx=0;for(let i=0;i<n;i++){sxy+=(x[i]-mx)*(y[i]-my);sxx+=(x[i]-mx)**2;}return sxy/sxx;}
function m32(s){return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const inc=o.window.map(d=>per[d]||0);const r=m32(0),al=[];for(let b=0;b<2000;b++){const s=[];while(s.length<inc.length){const st=Math.floor(r()*(inc.length-6));for(let k=0;k<7&&s.length<inc.length;k++)s.push(inc[st+k]);}al.push(a(s));}al.sort((p,q)=>p-q);
console.log(JSON.stringify({gpuh_spread_total_window:+inc.reduce((p,q)=>p+q).toFixed(1),alpha:+a(inc).toFixed(4),ci95:[+al[50].toFixed(4),+al[1950].toFixed(4)],daily:Object.fromEntries(o.window.map(d=>[d,+(per[d]||0).toFixed(1)]))}));
