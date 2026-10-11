"use strict";
/* Sprites-N-AI · base: aleatoriedade, cores, motor de desenho em camadas e utilidades de pixels */

/* ---------- aleatoriedade com semente ---------- */
function hashStr(s){let h=1779033703^s.length;for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353);h=h<<13|h>>>19}return h>>>0}
function rng(seed){let a=hashStr(String(seed));return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const pick=(r,a)=>a[Math.floor(r()*a.length)];
const rint=(r,a,b)=>a+Math.floor(r()*(b-a+1));
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function wpick(r,o){let t=0;for(const k in o)t+=o[k];let x=r()*t;for(const k in o){x-=o[k];if(x<0)return k}return Object.keys(o)[0]}
const PALAVRAS=['heroi','slime','dragao','mago','orc','fada','golem','ninja','pirata','robo','fantasma','cavaleiro','bruxa','goblin','sapo','gato','lobo','rei','elfo','anao','corvo','tigre'];
const novaSemente=()=>PALAVRAS[Math.floor(Math.random()*PALAVRAS.length)]+'-'+Math.floor(Math.random()*9000+1000);

/* ---------- cores ---------- */
function hex2rgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
function rgb2hex(r,g,b){return'#'+[r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('')}
function mix(a,b,t){const p=hex2rgb(a),q=hex2rgb(b);return rgb2hex(p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,p[2]+(q[2]-p[2])*t)}
function hsl(h,s,l){h=((h%360)+360)%360;s=clamp(s,0,100)/100;l=clamp(l,0,100)/100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,9-k(n),1));return rgb2hex(255*f(0),255*f(8),255*f(4))}
function hex2hsl(hex){const[r,g,b]=hex2rgb(hex).map(v=>v/255),mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;
  if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60}
  return[h,s*100,l*100]}
function towards(h,t,amt){const d=((t-h+540)%360)-180;return h+Math.sign(d)*Math.min(Math.abs(d),amt)}
// variação pequena de uma cor (para não repetir sempre o mesmo tom)
function variar(hex,r,dh=8,ds=6,dl=6){const[h,s,l]=hex2hsl(hex);return hsl(h+(r()-.5)*2*dh,s+(r()-.5)*2*ds,l+(r()-.5)*2*dl)}
// rampa de 5 tons com mudança de matiz: sombras puxam para o frio, luzes para o quente
const _rampas=new Map();
function ramp(hex,tipo){
  const key=hex+'|'+(tipo||'');if(_rampas.has(key))return _rampas.get(key);
  let[h,s,l]=hex2hsl(hex);if(s<8)h=230;
  if(tipo==='pele'){const r=[hsl(towards(h,355,12),s+3,l-23),hsl(towards(h,355,6),s+1,l-11),hex,hsl(towards(h,45,5),s-3,l+8),hsl(towards(h,45,10),s-8,l+15)];_rampas.set(key,r);return r}
  const sh=tipo==='quente'?15:250,lh=52;
  const r=[hsl(towards(h,sh,20),s+4,l-26),hsl(towards(h,sh,10),s+2,l-13),hex,hsl(towards(h,lh,8),s-4,l+10),hsl(towards(h,lh,16),s-10,l+19)];
  _rampas.set(key,r);return r}
const CONTORNO='#170f22';
const OLHO_ESCURO='#1c1428';

/* ---------- motor de camadas ----------
   Cada Parte é uma máscara de pixels de um material. A Figura junta as partes em ordem,
   sombreia cada uma pela própria forma (luz vindo de cima e da esquerda), aplica sombras
   projetadas e linhas internas, e no fim põe o contorno. */
const SOMBRA_CH={'#':null,'+':1,'*':2,'-':-1,'=':-2};
class Parte{
  constructor(fig,mat,o){this.f=fig;this.mat=mat;this.o=o||{};this.m=new Uint8Array(fig.w*fig.h);this.sh=null;this.col=null}
  ok(x,y){return x>=0&&y>=0&&x<this.f.w&&y<this.f.h}
  px(x,y,s){x=Math.round(x);y=Math.round(y);if(!this.ok(x,y))return this;const i=y*this.f.w+x;this.m[i]=1;
    if(s!==undefined&&s!==null)(this.sh||(this.sh=new Map())).set(i,s);else if(this.sh)this.sh.delete(i);return this}
  rect(x,y,w,h,s){for(let j=0;j<h;j++)for(let i=0;i<w;i++)this.px(x+i,y+j,s);return this}
  hl(y,x0,x1,s){for(let x=x0;x<=x1;x++)this.px(x,y,s);return this}
  ell(cx,cy,rx,ry,s){for(let y=Math.floor(cy-ry)-1;y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx)-1;x<=Math.ceil(cx+rx);x++){const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry;if(dx*dx+dy*dy<=1)this.px(x,y,s)}return this}
  rrect(x,y,w,h,rt,rb,s){rb=rb??rt;
    for(let j=0;j<h;j++)for(let i=0;i<w;i++){const cx=x+i+.5,cy=y+j+.5;let r=0,ox=0,oy=0;
      if(j<rt&&i<rt){r=rt;ox=x+rt;oy=y+rt}else if(j<rt&&i>=w-rt){r=rt;ox=x+w-rt;oy=y+rt}
      else if(j>=h-rb&&i<rb){r=rb;ox=x+rb;oy=y+h-rb}else if(j>=h-rb&&i>=w-rb){r=rb;ox=x+w-rb;oy=y+h-rb}
      if(r&&(cx-ox)**2+(cy-oy)**2>r*r+.6)continue;this.px(x+i,y+j,s)}return this}
  poly(pts,s){let y0=Infinity,y1=-Infinity;pts.forEach(p=>{y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])});
    for(let y=Math.floor(y0);y<=Math.ceil(y1);y++){const cy=y+.5,xs=[];
      for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]<=cy&&b[1]>cy)||(b[1]<=cy&&a[1]>cy))xs.push(a[0]+(cy-a[1])/(b[1]-a[1])*(b[0]-a[0]))}
      xs.sort((p,q)=>p-q);for(let k=0;k+1<xs.length;k+=2)for(let x=Math.ceil(xs[k]-.5);x<=Math.floor(xs[k+1]-.5);x++)this.px(x,y,s)}return this}
  line(x0,y0,x1,y1,s){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
    const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;
    for(;;){this.px(x0,y0,s);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}return this}
  // barra grossa (braços, pernas): segue de (x0,y0) até (x1,y1) com largura w
  bar(x0,y0,x1,y1,w,s){const n=Math.max(1,Math.round(Math.max(Math.abs(y1-y0),Math.abs(x1-x0))));
    for(let k=0;k<=n;k++){const t=k/n,xc=x0+(x1-x0)*t,yc=y0+(y1-y0)*t;
      if(Math.abs(y1-y0)>=Math.abs(x1-x0)){const xs=Math.round(xc-w/2);for(let i=0;i<w;i++)this.px(xs+i,Math.round(yc),s)}
      else{const ys=Math.round(yc-w/2);for(let i=0;i<w;i++)this.px(Math.round(xc),ys+i,s)}}return this}
  // desenho em texto: '.' vazio, '#' automático, '+' luz, '*' brilho, '-' sombra, '=' sombra forte
  mask(rows,ox,oy,o0=0){rows.forEach((row,r)=>{for(let c=0;c<row.length;c++){const ch=row[c];if(!(ch in SOMBRA_CH))continue;this.px(ox+c,oy+r+o0,SOMBRA_CH[ch])}});return this}
  dot(x,y,hex){x=Math.round(x);y=Math.round(y);if(!this.ok(x,y))return this;const i=y*this.f.w+x;this.m[i]=1;(this.col||(this.col=new Map())).set(i,hex);return this}
  del(x,y){x=Math.round(x);y=Math.round(y);if(this.ok(x,y))this.m[y*this.f.w+x]=0;return this}
  has(x,y){return this.ok(x,y)&&this.m[y*this.f.w+x]===1}
  vazio(){for(let i=0;i<this.m.length;i++)if(this.m[i])return false;return true}
}
class Figura{
  constructor(w,h,pal){this.w=w;this.h=h;this.pal=pal;this.partes=[];this.fx=[]}
  parte(mat,o){const p=new Parte(this,mat,o);this.partes.push(p);return p}
  // efeito por cima de tudo, sem contorno (brilhos, rastros de golpe)
  brilho(x,y,cor,soVazio){this.fx.push([Math.round(x),Math.round(y),cor,!!soVazio])}
  // linha fina sem contorno (pernas de aranha, raios, fios)
  traco(x0,y0,x1,y1,cor,soVazio=true){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
    const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;
    for(;;){this.brilho(x0,y0,cor,soVazio);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
  render(opt={}){
    const W=this.w,H=this.h,N=W*H,top=new Int16Array(N).fill(-1),sh=new Int8Array(N),col=new Array(N).fill(null);
    this.partes.forEach((p,pi)=>{
      let x0=W,y0=H,x1=-1,y1=-1;for(let i=0;i<N;i++)if(p.m[i]){const x=i%W,y=(i/W)|0;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
      if(x1<0)return;const bw=x1-x0+1,bh=y1-y0+1,o=p.o;
      for(let i=0;i<N;i++){if(!p.m[i])continue;const x=i%W,y=(i/W)|0;
        if(p.col&&p.col.has(i)){top[i]=pi;col[i]=p.col.get(i);sh[i]=0;continue}
        let s;
        if(p.sh&&p.sh.has(i))s=p.sh.get(i);
        else if(o.plano)s=0;
        else{s=0;const R=!p.has(x+1,y),B=!p.has(x,y+1),L=!p.has(x-1,y),T=!p.has(x,y-1);
          if(R)s--;if(B&&!o.semBase)s--;if((L||T)&&!o.semLuz)s++;
          if(o.grad!==false){if(bw>=5&&(x-x0)/(bw-1)>.72)s--;if(bh>=7&&(y-y0)/(bh-1)>.84)s--}
          s=clamp(s,-2,1)}
        top[i]=pi;col[i]=null;sh[i]=clamp(s+(o.escuro||0),-2,2)}
    });
    const feito=new Uint8Array(N);
    this.partes.forEach((p,pi)=>{const o=p.o;if(!o.projeta&&!o.linha)return;feito.fill(0);
      for(let i=0;i<N;i++){if(top[i]!==pi)continue;const x=i%W,y=(i/W)|0;
        if(o.projeta)for(let k=1;k<=o.projeta;k++){if(y+k>=H)break;const j=i+k*W;if(top[j]>=0&&top[j]<pi&&!col[j]&&!feito[j]&&!this.partes[top[j]].o.semSombra){sh[j]=Math.max(-2,sh[j]-1);feito[j]=1}}
        if(o.linha)for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const j=ny*W+nx;
          if(top[j]>=0&&top[j]<pi&&(o.linha===true||o.linha.includes(this.partes[top[j]].mat))){sh[i]=Math.min(sh[i],-1)-(o.linhaForte?1:0);break}}
      }});
    const out=new Array(N).fill(null),rp=new Array(N).fill(null);
    for(let i=0;i<N;i++){if(top[i]<0)continue;if(col[i]){out[i]=col[i];continue}const r=this.pal(this.partes[top[i]].mat);out[i]=r[2+clamp(sh[i],-2,2)];rp[i]=r}
    const modo=opt.contorno||'colorido';
    if(modo!=='nenhum'){const src=out.slice();
      for(let i=0;i<N;i++){if(src[i])continue;const x=i%W,y=(i/W)|0;let nb=-1;
        for(const[dx,dy]of[[0,1],[1,0],[0,-1],[-1,0]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;if(src[ny*W+nx]){nb=ny*W+nx;break}}
        if(nb<0)continue;out[i]=(modo==='colorido'&&rp[nb])?mix(rp[nb][0],CONTORNO,.58):CONTORNO}}
    for(const[x,y,c,sv]of this.fx){if(x<0||y<0||x>=W||y>=H)continue;const i=y*W+x;if(sv&&out[i])continue;out[i]=c}
    return out;
  }
}

/* ---------- utilidades de pixels (arrays de cores '#rrggbb' ou null) ---------- */
function flipArr(a,w,h){const b=new Array(w*h).fill(null);for(let y=0;y<h;y++)for(let x=0;x<w;x++)b[y*w+(w-1-x)]=a[y*w+x];return b}
function shiftArr(a,w,h,dx,dy){const b=new Array(w*h).fill(null);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<w&&ny<h)b[ny*w+nx]=a[y*w+x]}return b}
function flashArr(a){return a.map(c=>c?(c.length===7?mix(c,'#ffffff',.78):c):null)}
function contornoArr(a,w,h,cor=CONTORNO){const b=a.slice();for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(a[y*w+x])continue;
  if((x>0&&a[y*w+x-1])||(x<w-1&&a[y*w+x+1])||(y>0&&a[(y-1)*w+x])||(y<h-1&&a[(y+1)*w+x]))b[y*w+x]=cor}return b}
function sombraChao(a,w,h,cx,cy,rx,ry){const b=a.slice();for(let y=0;y<h;y++)for(let x=0;x<w;x++){const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry;if(dx*dx+dy*dy<=1&&!b[y*w+x])b[y*w+x]='#1a10285c'}return b}
function coresDe(a){const s=new Set();a.forEach(c=>c&&s.add(c));return[...s]}

/* ---------- paletas famosas para o editor ---------- */
const PALETAS={
  'PICO-8':['#000000','#1d2b53','#7e2553','#008751','#ab5236','#5f574f','#c2c3c7','#fff1e8','#ff004d','#ffa300','#ffec27','#00e436','#29adff','#83769c','#ff77a8','#ffccaa'],
  'Sweetie 16':['#1a1c2c','#5d275d','#b13e53','#ef7d57','#ffcd75','#a7f070','#38b764','#257179','#29366f','#3b5dc9','#41a6f6','#73eff7','#f4f4f4','#94b0c2','#566c86','#333c57'],
  'Endesga 32':['#be4a2f','#d77643','#ead4aa','#e4a672','#b86f50','#733e39','#3e2731','#a22633','#e43b44','#f77622','#feae34','#fee761','#63c74d','#3e8948','#265c42','#193c3e','#124e89','#0099db','#2ce8f5','#ffffff','#c0cbdc','#8b9bb4','#5a6988','#3a4466','#262b44','#181425','#ff0044','#68386c','#b55088','#f6757a','#e8b796','#c28569'],
};

/* ---------- guardar assets de forma compacta ---------- */
const _ALFA='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-!$%&()*+,;<=>?@[]^{|}~:/';
function empacotar(a){const pal=[],idx=new Map();const cod=c=>{if(!c)return'.';if(!idx.has(c)){idx.set(c,pal.length);pal.push(c)}const n=idx.get(c);return n<_ALFA.length?_ALFA[n]:'.'};
  return{v:2,type:a.type,w:a.w,h:a.h,params:a.params||null,pal,rows:a.rows.map(r=>({name:r.name,fps:r.fps||8,frames:r.frames.map(f=>f.map(cod).join(''))}))}}
function desempacotar(o){if(!o||o.v!==2)return o;
  return{type:o.type,w:o.w,h:o.h,params:o.params,rows:o.rows.map(r=>({name:r.name,fps:r.fps,frames:r.frames.map(s=>[...s].map(ch=>ch==='.'?null:o.pal[_ALFA.indexOf(ch)]||null))}))}}
