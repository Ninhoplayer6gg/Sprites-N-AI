"use strict";
/* Sprites-N-AI · exportar: PNG, GIF animado e downloads */

// codificador LZW do GIF (baseado no omggif, de Dean McNamee, licença MIT)
function _lzw(buf,minCode,ind){
  buf.push(minCode);let sub=buf.length;buf.push(0);
  const clear=1<<minCode,eoi=clear+1;let next=eoi+1,size=minCode+1,cur=0,shift=0;
  const bytes=lim=>{while(shift>=lim){buf.push(cur&255);cur>>=8;shift-=8;if(buf.length===sub+256){buf[sub]=255;sub=buf.length;buf.push(0)}}};
  const emit=c=>{cur|=c<<shift;shift+=size;bytes(8)};
  let ib=ind[0],tab=new Map();emit(clear);
  for(let i=1;i<ind.length;i++){const k=ind[i],key=ib<<8|k,c=tab.get(key);
    if(c===undefined){emit(ib);if(next===4096){emit(clear);next=eoi+1;size=minCode+1;tab=new Map()}else{if(next>=(1<<size))size++;tab.set(key,next++)}ib=k}else ib=c}
  emit(ib);emit(eoi);bytes(1);
  if(sub+1===buf.length)buf[sub]=0;else{buf[sub]=buf.length-sub-1;buf.push(0)}
}
// quadros: arrays de cores ('#rrggbb', '#rrggbbaa' ou null); devolve Uint8Array do GIF
function gifCodificar(quadros,w,h,escala,atrasoCs){
  const pal=['#000000'],idx=new Map();
  const ix=c=>{if(!c)return 0;if(c.length===9&&parseInt(c.slice(7,9),16)<128)return 0;const k=c.slice(0,7).toLowerCase();
    if(idx.has(k))return idx.get(k);if(pal.length<256){idx.set(k,pal.length);pal.push(k);return pal.length-1}
    const[r,g,b]=hex2rgb(k);let bi=1,bd=1e9;for(let i=1;i<pal.length;i++){const[R,G,B]=hex2rgb(pal[i]),d=(r-R)**2+(g-G)**2+(b-B)**2;if(d<bd){bd=d;bi=i}}idx.set(k,bi);return bi};
  const W=w*escala,H=h*escala;
  const inds=quadros.map(q=>{const a=new Uint8Array(W*H);for(let y=0;y<H;y++){const sy=(y/escala)|0;for(let x=0;x<W;x++)a[y*W+x]=ix(q[sy*w+((x/escala)|0)])}return a});
  let n=2;while(n<pal.length)n<<=1;const bits=Math.log2(n);
  const out=[],u16=v=>[v&255,(v>>8)&255],str=s=>[...s].map(c=>c.charCodeAt(0)),add=a=>{for(const b of a)out.push(b)};
  add(str('GIF89a'));add(u16(W));add(u16(H));add([0xF0|(bits-1),0,0]);
  for(let i=0;i<n;i++)add(hex2rgb(pal[i]||'#000000'));
  add([0x21,0xFF,0x0B]);add(str('NETSCAPE2.0'));add([3,1,0,0,0]);
  for(const ind of inds){add([0x21,0xF9,4,(2<<2)|1]);add(u16(atrasoCs));add([0,0]);add([0x2C,0,0,0,0]);add(u16(W));add(u16(H));add([0]);_lzw(out,Math.max(2,bits),ind)}
  out.push(0x3B);return new Uint8Array(out);
}
function desenharPixels(ctx,p,w,h,s,ox=0,oy=0){for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=p[y*w+x];if(c){ctx.fillStyle=c;ctx.fillRect(ox+x*s,oy+y*s,s,s)}}}
function folhaCanvas(a,escala,margem=0){
  const cols=Math.max(...a.rows.map(r=>r.frames.length)),cv=document.createElement('canvas'),ctx=cv.getContext('2d'),fw=a.w*escala+margem,fh=a.h*escala+margem;
  cv.width=cols*fw;cv.height=a.rows.length*fh;
  a.rows.forEach((r,j)=>r.frames.forEach((f,i)=>desenharPixels(ctx,f,a.w,a.h,escala,i*fw,j*fh)));return cv;
}
function quadroCanvas(p,w,h,escala){const cv=document.createElement('canvas');cv.width=w*escala;cv.height=h*escala;desenharPixels(cv.getContext('2d'),p,w,h,escala);return cv}

let _downloads=null;
if(window.claude&&window.claude.use)window.claude.use('downloads').then(d=>{_downloads=d}).catch(()=>{});
// salva um arquivo: dentro do Claude usa a capacidade "downloads"; em outros sites, um link normal
async function baixarArquivo(nome,dados,tipo){
  if(_downloads){try{await _downloads.save({filename:nome,data:dados});return'ok'}catch(e){return e&&e.code==='declined'?'recusado':'erro'}}
  try{const blob=dados instanceof Blob?dados:new Blob([dados],{type:tipo||'application/octet-stream'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=nome;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(url);a.remove()},4000);return'ok'}catch(e){return'erro'}
}
const canvasBlob=cv=>new Promise(res=>cv.toBlob(b=>res(b),'image/png'));
