"use strict";
/* Sprites-N-AI · cenário: pisos 16×16 que se encaixam, tileset com bordas e decorações */

function ruidoTile(r,per){const g=[];for(let i=0;i<per*per;i++)g.push(r());const cs=16/per;
  const G=(i,j)=>g[((j%per+per)%per)*per+((i%per+per)%per)];
  return(x,y)=>{const fx=(x+.5)/cs-.5,fy=(y+.5)/cs-.5,x0=Math.floor(fx),y0=Math.floor(fy),tx=fx-x0,ty=fy-y0,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty);
    const a=G(x0,y0)+(G(x0+1,y0)-G(x0,y0))*sx,b=G(x0,y0+1)+(G(x0+1,y0+1)-G(x0,y0+1))*sx;return a+(b-a)*sy}}
const wrapD=d=>d-16*Math.round(d/16);
function voronoi(r,n){const pts=[];for(let i=0;i<n;i++)pts.push([r()*16,r()*16]);
  return(x,y)=>{let d1=1e9,d2=1e9,i1=0,v1=[0,0];pts.forEach((p,i)=>{const dx=wrapD(x+.5-p[0]),dy=wrapD(y+.5-p[1]),d=Math.hypot(dx,dy);if(d<d1){d2=d1;d1=d;i1=i;v1=[dx,dy]}else if(d<d2)d2=d});return{d1,d2,i:i1,dx:v1[0],dy:v1[1]}}}

const PISOS={
  grama:{nome:'Grama',n:1},grama_flores:{nome:'Grama com flores',n:1},terra:{nome:'Terra',n:1},pedra:{nome:'Calçada de pedra',n:1},tijolo:{nome:'Parede de tijolo',n:1},
  piso:{nome:'Piso de pedra',n:1},madeira:{nome:'Assoalho de madeira',n:1},areia:{nome:'Areia',n:1},agua:{nome:'Água (animada)',n:4},lava:{nome:'Lava (animada)',n:4},neve:{nome:'Neve',n:1},
};
function desenharPiso(tipo,seed,f=0,variante=''){
  // rc escolhe as cores (fica igual nas variações); r espalha os detalhes
  const rc=rng(seed+'|cor|'+tipo),r=rng(seed+'|piso|'+tipo+variante),px=new Array(256).fill(null),S=(x,y,c)=>{px[((y%16+16)%16)*16+((x%16+16)%16)]=c};
  const n4=ruidoTile(r,4),n8=ruidoTile(r,8);
  if(tipo==='grama'||tipo==='grama_flores'){const R=ramp(hsl(95+rc()*25,45+rc()*10,38+rc()*6));
    for(let y=0;y<16;y++)for(let x=0;x<16;x++){const v=n4(x,y)*.65+n8(x,y)*.35;S(x,y,v<.36?R[1]:v>.66?R[3]:R[2])}
    for(let k=0;k<7;k++){const x=rint(r,0,15),y=rint(r,0,15);S(x,y,R[4]);S(x-1,y+1,R[3]);S(x+1,y+1,R[3]);S(x,y+1,R[1])}
    if(tipo==='grama_flores')for(let k=0;k<5;k++){const x=rint(r,0,15),y=rint(r,0,15),c=pick(r,['#ffffff','#ffe060','#ff88b0','#a0c8ff']);S(x,y,c);S(x,y+1,R[1]);S(x+1,y,mix(c,'#000000',.15))}}
  else if(tipo==='terra'){const R=ramp(hsl(25+rc()*8,32+rc()*8,32+rc()*5)),P=ramp('#8a7a6a');
    for(let y=0;y<16;y++)for(let x=0;x<16;x++){const v=n4(x,y)*.6+n8(x,y)*.4;S(x,y,v<.35?R[1]:v>.68?R[3]:R[2])}
    for(let k=0;k<5;k++){const x=rint(r,0,15),y=rint(r,0,15);S(x,y,P[3]);S(x+1,y,P[2]);S(x,y+1,P[1]);S(x+1,y+1,P[0])}
    for(let k=0;k<4;k++)S(rint(r,0,15),rint(r,0,15),R[0])}
  else if(tipo==='pedra'){const base=hsl(220+rc()*20,6+rc()*6,48+rc()*6),V=voronoi(r,7),cores=Array.from({length:7},()=>ramp(variar(base,rc,6,3,5)));
    for(let y=0;y<16;y++)for(let x=0;x<16;x++){const v=V(x,y),e=v.d2-v.d1,R=cores[v.i];
      if(e<1.1)S(x,y,ramp(base)[0]);else if(e<2.3)S(x,y,(v.dx+v.dy)<0?R[3]:R[1]);else S(x,y,n8(x,y)>.75?R[3]:R[2])}}
  else if(tipo==='tijolo'){const base=hsl(8+rc()*14,42+rc()*10,42+rc()*6),mort=ramp('#b4a898'),cs=Array.from({length:8},()=>ramp(variar(base,rc,5,4,5)));
    for(let y=0;y<16;y++)for(let x=0;x<16;x++){const row=y>>2,w=y%4,off=(row%2)*4,bx=(x+off)%8,id=(row*2+(((x+off)%16)>>3))%8,R=cs[id];
      if(w===3||bx===7)S(x,y,w===3&&bx!==7?mort[2]:mort[1]);else if(w===0)S(x,y,R[3]);else if(bx===6||w===2)S(x,y,R[1]);else S(x,y,n8(x,y)>.8?R[3]:R[2])}}
  else if(tipo==='piso'){const base=hsl(30+rc()*190,8+rc()*8,52+rc()*8),cs=Array.from({length:4},()=>ramp(variar(base,rc,4,3,4)));
    for(let y=0;y<16;y++)for(let x=0;x<16;x++){const tx=x%8,ty=y%8,R=cs[(x>>3)+(y>>3)*2];
      S(x,y,tx===7||ty===7?R[0]:tx===0||ty===0?R[3]:tx===6||ty===6?R[1]:R[2])}
    for(let k=0;k<2;k++){let x=rint(r,1,5)+(k?8:0),y=rint(r,1,5)+(k?0:8);for(let s=0;s<3;s++){S(x,y,cs[0][1]);x+=1;y+=rint(r,0,1)}}}
  else if(tipo==='madeira'){const R=ramp(hsl(26+rc()*10,42+rc()*10,40+rc()*6)),seams=[0,1,2,3].map(()=>rint(r,0,15));
    for(let y=0;y<16;y++)for(let x=0;x<16;x++){const row=y>>2,w=y%4;
      if(w===3)S(x,y,R[0]);else if(x===seams[row])S(x,y,R[0]);else if(x===(seams[row]+1)%16)S(x,y,R[3]);else{const g=n8(x*.4,y);S(x,y,w===0?R[3]:g>.68?R[1]:R[2])}}
    for(let row=0;row<4;row++){S(seams[row]+2,row*4+1,R[0]);S(seams[row]-1,row*4+1,R[0])}}
  else if(tipo==='areia'){const R=ramp(hsl(42+rc()*6,50+rc()*10,70+rc()*5)),ph=r()*16;
    for(let y=0;y<16;y++)for(let x=0;x<16;x++){const v=n8(x,y);let c=v<.3?R[1]:v>.75?R[3]:R[2];if(Math.abs(((y+Math.round(2*Math.sin((x+ph)*Math.PI/8)))%6))<1)c=R[3];S(x,y,c)}
    for(let k=0;k<6;k++)S(rint(r,0,15),rint(r,0,15),R[0])}
  else if(tipo==='agua'){const R=ramp(hsl(200+rc()*15,62,42));
    for(let y=0;y<16;y++)for(let x=0;x<16;x++){const v=Math.sin(2*Math.PI*(x+2*y)/16+f*Math.PI/2)*.5+Math.sin(2*Math.PI*(2*x-y)/16-f*Math.PI/2)*.5+(n8(x,y)-.5)*.5;
      S(x,y,v>.82?R[4]:v>.5?R[3]:v<-.68?R[1]:R[2])}
    const sp=[[3,4],[11,9],[7,13],[14,2]][f%4];S(sp[0],sp[1],'#ffffff')}
  else if(tipo==='lava'){const V=voronoi(r,6),C=ramp('#4a1a22'),G=['#ff4a1a','#ff8a1a','#ffc23a','#fff0a0'];
    for(let y=0;y<16;y++)for(let x=0;x<16;x++){const v=V(x,y),e=v.d2-v.d1,b=.5+.5*Math.sin(f*Math.PI/2+v.i*1.7);
      if(e<1.2)S(x,y,G[Math.min(3,Math.round(1+b*2))]);else if(e<2)S(x,y,G[Math.round(b)]);else S(x,y,n8(x,y)>.7?C[3]:(v.dx+v.dy)<-2?C[2]:C[1])}
    const bb=[[4,5],[12,11],[9,3],[2,13]][f%4];S(bb[0],bb[1],G[3])}
  else if(tipo==='neve'){const R=ramp('#dfe8f4');
    for(let y=0;y<16;y++)for(let x=0;x<16;x++){const v=n4(x,y)*.6+n8(x,y)*.4;S(x,y,v<.3?R[1]:v>.7?R[3]:R[2])}
    for(let k=0;k<5;k++)S(rint(r,0,15),rint(r,0,15),'#ffffff')}
  return px;
}
function gerarPiso(tipo,seed){const P=PISOS[tipo];return{type:'cenario',w:16,h:16,params:{piso:tipo,seed},rows:[{name:tipo,fps:4,frames:Array.from({length:P.n},(_,f)=>desenharPiso(tipo,seed,f))}]}}

/* tileset com bordas: terreno A por cima do terreno B (5 colunas × 3 linhas) */
const TILESET_NOMES=[['canto_sup_esq','borda_sup','canto_sup_dir','interno_sup_esq','interno_sup_dir'],['borda_esq','centro','borda_dir','interno_inf_esq','interno_inf_dir'],['canto_inf_esq','borda_inf','canto_inf_dir','centro_2','centro_3']];
function gerarTileset(a,b,seed){
  const A=desenharPiso(a,seed),A2=desenharPiso(a,seed,0,'x'),A3=desenharPiso(a,seed,0,'y'),B=desenharPiso(b,seed+'b'),r=rng(seed+'|ts'),J=Array.from({length:256},()=>(r()-.5)*1.6),e=5,rr=6;
  const dentro=(gx,gy)=>{const qx=Math.abs(gx+.5-24)-(24-e)+rr,qy=Math.abs(gy+.5-24)-(24-e)+rr;const d=Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-rr;return d+J[(gy%16)*16+(gx%16)]<0};
  const tile=(fn,tex=A)=>{const m=[];for(let y=0;y<16;y++)for(let x=0;x<16;x++)m.push(fn(x,y));
    const out=m.map((ins,i)=>ins?tex[i]:B[i]);
    for(let i=0;i<256;i++){const x=i%16,y=(i/16)|0,v=(xx,yy)=>xx<0||yy<0||xx>15||yy>15?null:m[yy*16+xx];
      if(m[i]&&(v(x+1,y)===false||v(x-1,y)===false||v(x,y+1)===false||v(x,y-1)===false))out[i]=mix(out[i],'#1a1028',.32);
      else if(!m[i]&&(v(x,y-1)===true||v(x-1,y)===true))out[i]=mix(out[i],'#1a1028',.22)}
    return out};
  const bloco=(tx,ty)=>tile((x,y)=>dentro(tx*16+x,ty*16+y));
  const jit=(x,y)=>J[y*16+x]*.6,ie=(x,y,cx,cy)=>!(((cx?x>15-e+jit(x,y):x<e+jit(x,y)))&&((cy?y>15-e+jit(x,y):y<e+jit(x,y))));
  const rows=[
    [bloco(0,0),bloco(1,0),bloco(2,0),tile((x,y)=>ie(x,y,0,0)),tile((x,y)=>ie(x,y,1,0))],
    [bloco(0,1),bloco(1,1),bloco(2,1),tile((x,y)=>ie(x,y,0,1)),tile((x,y)=>ie(x,y,1,1))],
    [bloco(0,2),bloco(1,2),bloco(2,2),tile(()=>true,A2),tile(()=>true,A3)]];
  return{type:'cenario',w:16,h:16,estatico:true,params:{tileset:[a,b],seed},rows:rows.map((fr,j)=>({name:'linha_'+(j+1),fps:4,frames:fr,nomes:TILESET_NOMES[j]}))};
}

/* decorações */
const DECOR={
  arvore:{nome:'Árvore',w:32,h:32,d(fig,r,f){const T=fig.parte('tronco',{});T.rect(14,20,4,9);T.px(13,28).px(18,28).px(12,28);
    const c=fig.parte('folha',{});c.ell(16,13,11,8.6);c.ell(8.5,16,6,5);c.ell(23.5,16,6,5);c.ell(16,7,7.5,6);c.ell(11,9,5,4.5);c.ell(21,9,5,4.5);
    const l=fig.parte('folha',{plano:true});for(const[x,y,rx,ry]of[[12,7,2.5,1.6],[8,13,2,1.3],[19,5,2,1.3],[15,11,2.2,1.4]])l.ell(x,y,rx,ry,1);
    for(const[x,y,rx,ry]of[[20,18,3,1.4],[11,19,3,1.3],[25,15,1.6,1.4],[16,16,2.4,1.2]])l.ell(x,y,rx,ry,-1);
    if(r()<.4)for(let k=0;k<5;k++)fig.brilho(rint(r,7,24),rint(r,6,19),pick(r,['#ff4a4a','#ffd04a','#ffffff']))}},
  pinheiro:{nome:'Pinheiro',w:32,h:32,d(fig,r){fig.parte('tronco',{}).rect(15,25,3,5);const c=fig.parte('folha',{});
    c.poly([[16.5,1],[23,11],[10,11]]);c.poly([[16.5,6],[25.5,18],[7.5,18]]);c.poly([[16.5,12],[27.5,26],[5.5,26]]);
    const sn=r()<.35,l=fig.parte(sn?'neve':'folha',{plano:true});for(const[y,x0,x1]of[[10,12,21],[17,10,23],[25,8,25]])for(let x=x0;x<=x1;x+=3)l.px(x,y,sn?1:-1);if(sn)l.px(16,2,2).px(16,3,1)}},
  arbusto:{nome:'Arbusto',w:16,h:16,d(fig,r){const c=fig.parte('folha',{});c.ell(8,10.5,7,4.6);c.ell(5,8,4,3.6);c.ell(11,7.5,4,3.6);c.ell(8,6.5,3.2,3);
    if(r()<.6){const cor=pick(r,['#e8343a','#ffd04a','#ff88c0','#5a7aff']);for(const[x,y]of[[4,8],[10,6],[12,11],[6,12],[8,9]])fig.parte('fruta',{plano:true}).dot(x,y,cor)}}},
  pedra:{nome:'Pedra',w:16,h:16,d(fig,r){const p=fig.parte('rocha',{});p.poly([[2.5,14],[1.5,9.5],[4.5,5],[9,3.5],[13.5,6],[14.6,11],[12.5,14.2]]);
    fig.parte('rocha',{plano:true}).px(9,7,-2).px(10,8,-2).px(10,9,-2).px(5,7,1).px(6,6,1).px(7,5,1);if(r()<.5){const m=fig.parte('musgo',{});m.ell(7,5,3.5,1.6);m.ell(10,4.6,2.2,1.2)}}},
  flores:{nome:'Flores',w:16,h:16,d(fig,r){const cs=[pick(r,['#ff5a7a','#ffd04a','#ffffff','#7a8aff','#ff8a3a']),pick(r,['#ff5a7a','#ffd04a','#ffffff','#c07aff'])];
    const st=fig.parte('folha',{plano:true});const fl=[[4,7,13],[8,4,13],[12,8,13],[6,10,14],[10,11,14]];
    for(const[x,y,b]of fl)st.line(x,y+1,x,b,-1);st.px(3,11,0).px(9,9,0).px(13,12,0).px(11,10,0);
    fl.forEach(([x,y],i)=>{const c=cs[i%2],p=fig.parte('fruta',{plano:true});p.dot(x,y-1,c).dot(x-1,y,c).dot(x+1,y,c).dot(x,y+1,mix(c,'#000',.18));p.dot(x,y,'#ffd84a')})}},
  cogumelos:{nome:'Cogumelos',w:16,h:16,d(fig,r){const cor=pick(r,['#d8343a','#a8603a','#3aa8c8','#9a4ad0']);
    for(const[x,y,s]of[[5,13,1],[11,13,.8],[8,14,.6]]){fig.parte('caule',{}).rect(Math.round(x-1*s),Math.round(y-4*s),Math.max(2,Math.round(2*s)),Math.round(4*s)+1);
      const c=fig.parte('chapeu',{});c.ell(x,y-4*s,4*s+.6,2.6*s+.4);for(let yy=Math.round(y-4*s)+1;yy<16;yy++)for(let xx=0;xx<16;xx++)c.del(xx,yy);fig.parte('pinta',{plano:true}).px(Math.round(x-1),Math.round(y-5*s-.5),1)}
    fig._cor=cor}},
  toco:{nome:'Toco',w:16,h:16,d(fig){const t=fig.parte('tronco',{});t.rect(3,8,10,6);t.px(2,13).px(13,13).px(1,14).px(14,14);const tp=fig.parte('anel',{});tp.ell(8,8,5,2.6);fig.parte('tronco',{plano:true}).ell(8,8,2.6,1.2,-1).px(8,8,-2)}},
  cerca:{nome:'Cerca',w:16,h:16,d(fig){const w=fig.parte('tronco',{});w.rect(0,6,16,2);w.rect(0,10,16,2);const p=fig.parte('tronco',{});p.rrect(2,3,3,12,1,0);p.rrect(11,3,3,12,1,0)}},
  fogueira:{nome:'Fogueira',w:16,h:16,n:4,d(fig,r,f){const s=fig.parte('rocha',{});for(const[x,y]of[[2,13],[5,14.5],[9,14.8],[12.6,13.4]])s.ell(x+.5,y,1.8,1.3);
    const l=fig.parte('tronco',{});l.line(3,12,12,9,0);l.line(3,13,12,10,0);l.line(12,12,3,9,-1);l.line(12,13,3,10,-1);
    const fl=[[[7,2],[8,3],[6,4],[7,4],[8,4],[9,4],[6,5],[7,5],[8,5],[9,5],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6],[5,7],[6,7],[7,7],[8,7],[9,7],[10,7],[6,8],[7,8],[8,8],[9,8]],
      [[8,2],[7,3],[8,3],[6,4],[7,4],[8,4],[9,4],[10,4],[6,5],[7,5],[8,5],[9,5],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6],[5,7],[6,7],[7,7],[8,7],[9,7],[10,7],[6,8],[7,8],[8,8],[9,8]],
      [[6,3],[7,3],[9,2],[6,4],[7,4],[8,4],[9,4],[6,5],[7,5],[8,5],[9,5],[10,5],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6],[5,7],[6,7],[7,7],[8,7],[9,7],[10,7],[6,8],[7,8],[8,8],[9,8]],
      [[8,1],[8,2],[7,3],[8,3],[7,4],[8,4],[9,4],[6,5],[7,5],[8,5],[9,5],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6],[5,7],[6,7],[7,7],[8,7],[9,7],[10,7],[6,8],[7,8],[8,8],[9,8]]][f%4];
    for(const[x,y]of fl){const q=y+(Math.abs(x-7.5)>1.5?1:0);fig.brilho(x,y,q<4?'#fff3a0':q<6?'#ffb030':'#e8502a')}
    const sp=[[4,1],[11,2],[3,3],[12,0]][f%4];fig.brilho(sp[0],sp[1],'#ffd060')}},
  cristal:{nome:'Cristais',w:16,h:16,n:4,d(fig,r,f){const c=fig.parte('cristal',{});c.poly([[6,14.5],[5,6],[7,2],[9,6],[9.5,14.5]]);c.poly([[9,14.5],[10,9],[12.5,6],[14,9],[13,14.5]]);c.poly([[2,14.5],[2,10],[3.6,8],[5.5,11],[5.5,14.5]]);
    fig.parte('cristal',{plano:true}).line(7,3,7,13,2).line(12,7,12,13,1).line(3,9,3,13,1);const s=[[7,2],[12,6],[3,8],[10,10]][f%4];fig.brilho(s[0],s[1],'#ffffff');fig.brilho(s[0]+1,s[1],'#ffffffa0',true);fig.brilho(s[0]-1,s[1],'#ffffffa0',true)}},
  placa:{nome:'Placa',w:16,h:16,d(fig){fig.parte('tronco',{}).rect(7,9,2,6);const b=fig.parte('madeira2',{});b.rect(1,2,14,8);const t=fig.parte('madeira2',{plano:true});for(const y of[4,6])for(let x=3;x<=12;x++)if((x+y)%4)t.px(x,y,-2)}},
  barril:{nome:'Barril',w:16,h:16,d(fig){const b=fig.parte('madeira2',{});b.rrect(3,1,10,14,3,3);const s=fig.parte('madeira2',{plano:true});for(const x of[5,8,11])for(let y=2;y<14;y++)s.px(x,y,-1);
    const m=fig.parte('aro',{grad:false});m.hl(4,3,12);m.hl(11,3,12)}},
  caixote:{nome:'Caixote',w:16,h:16,d(fig){const c=fig.parte('madeira2',{});c.rect(1,2,14,13);const fr=fig.parte('madeira2',{plano:true});
    for(let i=1;i<15;i++){fr.px(i,2,1);fr.px(i,14,-1)}for(let j=2;j<15;j++){fr.px(1,j,1);fr.px(14,j,-1)}for(let t=0;t<11;t++)fr.px(3+t,3+t*1.0,-1)}},
};
function desenharDecor(tipo,seed,f=0,cont='colorido'){
  const D=DECOR[tipo],r=rng(seed+'|decor|'+tipo),rp=rng(seed+'|pal|'+tipo);
  const folha=pick(rp,['#4a9a3a','#3a8a4a','#6aa83a','#d8762a','#e05a8a','#2f6a3a']),rocha=pick(rp,['#8a8a9a','#9a8a7a','#7a8090']);
  const M={tronco:ramp('#7a4e2e','quente'),folha:ramp(tipo==='pinheiro'?pick(rp,['#2f6a4a','#3a7a3a']):folha),rocha:ramp(rocha),musgo:ramp('#5a9a3a'),fruta:ramp('#e8343a'),
    caule:ramp('#f0e2c4','pele'),chapeu:ramp(pick(rp,['#d8343a','#a8603a','#3aa8c8','#9a4ad0'])),pinta:ramp('#fff4e0'),anel:ramp('#d8b07a','quente'),neve:ramp('#e8f0fa'),
    cristal:ramp(pick(rp,['#7ae0f0','#c07af0','#7af0a0','#f07ab0'])),madeira2:ramp('#a8743e','quente'),aro:ramp('#6a6a7a')};
  const fig=new Figura(D.w,D.h,m=>M[m]||M.tronco);D.d(fig,r,f);return fig.render({contorno:cont});
}
function gerarDecor(tipo,seed){const D=DECOR[tipo];return{type:'cenario',w:D.w,h:D.h,params:{decor:tipo,seed},rows:[{name:tipo,fps:8,frames:Array.from({length:D.n||1},(_,f)=>desenharDecor(tipo,seed,f))}]}}
