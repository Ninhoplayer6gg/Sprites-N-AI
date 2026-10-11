"use strict";
/* Sprites-N-AI · monstros 32×32 com animações parado, mover, atacar e dano */

const M_ANIMS=[{id:'parado',n:4,fps:5},{id:'mover',n:4,fps:8},{id:'atacar',n:4,fps:10},{id:'dano',n:2,fps:6}];
const ESC='#1c1428',BR='#ffffff';
function olhosMonstro(d,estilo,x1,x2,y,cor){
  for(const x of[x1,x2]){
    if(estilo==='fofo'){d.dot(x,y,BR);d.dot(x+1,y,ESC);d.dot(x,y+1,ESC);d.dot(x+1,y+1,ESC)}
    else if(estilo==='bravo'){d.dot(x,y,ESC);d.dot(x,y+1,ESC);d.dot(x+1,y+1,ESC)}
    else if(estilo==='brilho'){d.dot(x,y,cor||'#ff4040');d.dot(x+1,y,cor||'#ff4040')}
    else if(estilo==='fechado'){d.dot(x,y+1,ESC);d.dot(x+1,y+1,ESC)}
    else if(estilo==='dor'){d.dot(x,y,ESC);d.dot(x+1,y+1,ESC)}
    else{d.dot(x,y,ESC);d.dot(x,y+1,ESC)}
  }
  if(estilo==='bravo'){d.dot(x1-1,y-1,ESC);d.dot(x1,y-1,ESC);d.dot(x2+1,y-1,ESC);d.dot(x2+2,y-1,ESC)}
}
// meia-cúpula (slime, fantasma): base = última linha
function cupula(pt,cx,base,w,h){for(let i=0;i<h;i++){const t=(i+.5)/h;let half=(w/2)*Math.pow(Math.max(0,1-Math.pow(t,2.2)),.5);if(i===0)half-=.8;
  const x0=Math.round(cx-half),x1=Math.round(cx+half)-1;if(x1>=x0)pt.hl(base-i,x0,x1)}}

const MONSTROS={
  slime:{nome:'Slime',
    param:r=>({cor:hsl(pick(r,[100,130,190,210,280,320,30,0]),55+r()*25,52+r()*10),olhos:pick(r,['fofo','fofo','normal','bravo']),enfeite:pick(r,['nenhum','nenhum','coroa','folha','chifre']),bolhas:r()<.7}),
    desenhar(fig,p,anim,f){
      const F={parado:[[20,13,0],[21,12,0],[22,12,0],[21,12,0]],mover:[[23,11,0],[17,16,1],[18,15,4],[22,12,0]],atacar:[[24,10,0],[18,17,2],[21,15,0],[20,13,0]],dano:[[20,13,0],[23,11,0]]}[anim][f];
      const[w,h,lift]=F,base=29-lift,cx=16,top=base-h+1;
      const b=fig.parte('corpo',{});cupula(b,cx,base,w,h);
      const d=fig.parte('corpo',{plano:true}),ey=base-Math.round(h*.58),dx=Math.round(w*.2);
      if(p.bolhas){const c=ramp(p.cor)[3];d.dot(cx+dx+1,base-2,c);d.dot(cx-dx-2,base-3,c);d.dot(cx+2,base-4,c)}
      const est=anim==='dano'&&f===1?'dor':p.olhos;olhosMonstro(d,est,cx-dx-1,cx+dx-1,ey,null);
      const my=ey+3;
      if(anim==='atacar'&&f>0&&f<3){d.dot(cx-2,my,ESC);d.dot(cx-1,my,ESC);d.dot(cx,my,ESC);d.dot(cx+1,my,ESC);d.dot(cx-1,my+1,'#c03a4a');d.dot(cx,my+1,'#c03a4a');d.dot(cx-2,my,'#f4ecd8');d.dot(cx+1,my,'#f4ecd8')}
      else{d.dot(cx-1,my,ESC);d.dot(cx,my,ESC)}
      fig.brilho(cx-dx-3,top+2,'#ffffffe0');fig.brilho(cx-dx-2,top+2,'#ffffffb0');fig.brilho(cx-dx-3,top+3,'#ffffffb0');
      if(p.enfeite==='coroa'){const c=fig.parte('ouro',{});c.rect(cx-3,top-2,6,2);c.px(cx-3,top-3).px(cx-1,top-3).px(cx+1,top-3).px(cx+2,top-3);fig.parte('gema',{plano:true}).px(cx-1,top-2,1)}
      else if(p.enfeite==='folha'){const l=fig.parte('folha',{});l.px(cx,top-1).px(cx,top-2).px(cx+1,top-3).px(cx+2,top-3).px(cx+2,top-4).px(cx+1,top-2)}
      else if(p.enfeite==='chifre'){const l=fig.parte('osso',{});l.px(cx-1,top-1).px(cx-1,top-2).px(cx,top-1).px(cx,top-2).px(cx,top-3)}
    }},
  morcego:{nome:'Morcego',
    param:r=>({cor:pick(r,['#5a3f7a','#4a3a3a','#3a3f5a','#7a3a4a','#4a4a4a']),olho:pick(r,['#ff4040','#ffd040','#60ff80'])}),
    desenhar(fig,p,anim,f){
      const ASAS={cima:[[12,14],[10,9],[7,5],[4,3],[2,5],[3,8],[2,11],[5,12],[7,14],[9,15]],meio:[[12,14],[8,11],[4,10],[1,11],[2,14],[1,17],[4,16],[6,18],[8,16],[10,17]],baixo:[[12,15],[9,17],[6,20],[3,24],[5,24],[7,22],[8,24],[10,21],[11,22],[12,18]]};
      let pos=['cima','meio','baixo','meio'][f%4],by={cima:1,meio:0,baixo:-1}[pos],bx=0,boca=false;
      if(anim==='mover'){by+=[0,-1,0,1][f]}
      if(anim==='atacar'){pos=['cima','cima','baixo','meio'][f];by=[ -2,3,4,0][f];boca=f===1||f===2}
      if(anim==='dano'){pos='meio';by=-1;bx=-1}
      const asa=fig.parte('asa',{});
      for(const s of[1,-1]){const pts=ASAS[pos].map(([x,y])=>[s>0?x+bx:32-x+bx,y+by]);asa.poly(pts)}
      const osso=fig.parte('asa',{plano:true});
      for(const s of[1,-1]){const pts=ASAS[pos],sx=(x)=>s>0?x+bx:31-x+bx;osso.line(sx(12),14+by,sx(pts[3][0]),pts[3][1]+by,-2)}
      const c=fig.parte('corpo',{});c.ell(16+bx,15+by,4.6,4.4);
      fig.parte('corpo',{}).poly([[12.5+bx,12+by],[13+bx,7.5+by],[15.2+bx,11+by]]).poly([[19.5+bx,12+by],[19+bx,7.5+by],[16.8+bx,11+by]]);
      fig.parte('barriga',{}).ell(16+bx,17+by,2.4,2);
      const d=fig.parte('corpo',{plano:true});
      if(anim==='dano'&&f===1){d.dot(13+bx,14+by,ESC);d.dot(14+bx,15+by,ESC);d.dot(18+bx,14+by,ESC);d.dot(17+bx,15+by,ESC)}
      else{d.dot(13+bx,14+by,p.olho);d.dot(14+bx,14+by,p.olho);d.dot(17+bx,14+by,p.olho);d.dot(18+bx,14+by,p.olho);fig.brilho(13+bx,14+by,'#ffffff')}
      if(boca){for(let x=14;x<=17;x++)d.dot(x+bx,17+by,ESC);d.dot(15+bx,18+by,'#c03a4a');d.dot(16+bx,18+by,'#c03a4a');d.dot(14+bx,18+by,'#f4ecd8');d.dot(17+bx,18+by,'#f4ecd8')}
      else{d.dot(14+bx,17+by,'#f4ecd8');d.dot(17+bx,17+by,'#f4ecd8')}
    }},
  fantasma:{nome:'Fantasma',
    param:r=>({cor:pick(r,['#e8eef8','#cfe6ff','#d6f5e0','#e6d8ff','#fff0d0']),olhos:pick(r,['oval','oval','bravo','vazio']),lingua:r()<.4}),
    desenhar(fig,p,anim,f){
      let by=[0,-1,-1,0][f%4],ph=f%4,braco=0,boca=1,esc=1;
      if(anim==='mover'){by=[0,-1,-2,-1][f];ph=(f*2)%4}
      if(anim==='atacar'){by=[1,-2,-2,0][f];braco=[0,-3,-3,-1][f];boca=[1,3,3,1][f]}
      if(anim==='dano'){by=-1}
      const b=fig.parte('corpo',{});
      for(let x=8;x<=23;x++){const dx=(x+.5-16)/8,dy=Math.sqrt(Math.max(0,1-dx*dx))*8;const t=Math.round(13+by-dy),bot=24+by+[0,1,2,1][(x+ph)%4];for(let y=t;y<=bot;y++)b.px(x,y)}
      const a=fig.parte('corpo',{});a.ell(7.5,18+by+braco,2,1.6);a.ell(24.5,18+by+braco,2,1.6);
      const d=fig.parte('corpo',{plano:true}),oy=13+by;
      if(anim==='dano'&&f===1){for(const x of[12,18]){d.dot(x,oy+1,ESC);d.dot(x+1,oy,ESC);d.dot(x+1,oy+2,ESC)}}
      else if(p.olhos==='vazio'){for(const x of[12,18])for(let k=0;k<3;k++){d.dot(x,oy+k,ESC);d.dot(x+1,oy+k,ESC)}}
      else{for(const x of[12,18])for(let k=0;k<3;k++){d.dot(x,oy+k,ESC);d.dot(x+1,oy+k,ESC)}d.dot(12,oy,BR);d.dot(18,oy,BR);
        if(p.olhos==='bravo'){d.dot(11,oy-1,ESC);d.dot(12,oy-1,ESC);d.dot(19,oy-1,ESC);d.dot(20,oy-1,ESC)}}
      const my=oy+5;for(let k=0;k<boca;k++){d.dot(15,my+k,ESC);d.dot(16,my+k,ESC);if(boca>1){d.dot(14,my+k,ESC);d.dot(17,my+k,ESC)}}
      if(p.lingua&&boca>1){d.dot(15,my+boca-1,'#e05a7a');d.dot(16,my+boca-1,'#e05a7a')}
      fig.brilho(11,9+by,'#ffffffd0');fig.brilho(10,10+by,'#ffffffa0');
    }},
  olho:{nome:'Olho voador',
    param:r=>({iris:pick(r,['#3b8fd0','#3fae5a','#d0a040','#a050d0','#d04050']),veias:r()<.75,carne:pick(r,['#d8788a','#b88ad8','#7ab8a0'])}),
    desenhar(fig,p,anim,f){
      let by=[0,-1,-1,0][f%4],lx=0,ly=0,palp=0,pup=1.6,brilho=false,ph=f;
      if(anim==='parado')palp=[0,0,4,0][f];
      if(anim==='mover'){lx=[1,2,1,0][f];by=[0,-1,-2,-1][f]}
      if(anim==='atacar'){pup=[1.6,1,0.8,1.6][f];brilho=f===1||f===2;by=[1,0,0,0][f]}
      if(anim==='dano'){palp=f===1?6:0;by=-1;lx=-1}
      const cy=14+by;
      const t=fig.parte('carne',{});for(const[x0,k]of[[13,0],[16,1],[19,2]]){let x=x0;for(let y=cy+7;y<=cy+13;y++){t.px(x,y);t.px(x+(((y+ph+k)%4)<2?1:0),y);x+=(((y+ph+k)%4)===0?1:((y+ph+k)%4)===2?-1:0)}}
      fig.parte('esclera',{}).ell(16,cy,8,8);
      if(p.veias){const v=fig.parte('veia',{plano:true});v.line(9,cy+2,11,cy+1,0).line(22,cy-3,20,cy-2,0).line(12,cy+6,13,cy+4,0).line(21,cy+5,20,cy+4,0)}
      const ir=fig.parte('iris',{});ir.ell(16+lx,cy+ly,4,4);
      const d=fig.parte('iris',{plano:true});const pc=brilho?'#ff2a2a':ESC;
      for(let y=Math.floor(cy+ly-2.2);y<=cy+ly+2;y++)for(let x=Math.floor(16+lx-pup);x<=16+lx+pup;x++){const dx=(x+.5-(16+lx))/pup,dy=(y+.5-(cy+ly))/2.2;if(dx*dx+dy*dy<=1)d.dot(x,y,pc)}
      if(palp){const pl=fig.parte('palpebra',{});pl.ell(16,cy,8.2,8.2);for(let y=Math.round(cy-8+palp*2);y<32;y++)for(let x=0;x<32;x++)pl.del(x,y)}
      fig.brilho(13,cy-5,'#ffffff');fig.brilho(12,cy-4,'#ffffffc0');
      if(brilho)for(let k=0;k<8;k++){const a=k*Math.PI/4;fig.brilho(16+Math.cos(a)*10.5,cy+Math.sin(a)*10.5,'#ffd0d0c0',true)}
    }},
  cogumelo:{nome:'Cogumelo',
    param:r=>({cor:pick(r,['#d8403a','#a8603a','#4a70d0','#9a50c0','#e08a30']),pinta:pick(r,['#fff4e0','#ffe080']),olhos:pick(r,['normal','fofo','bravo'])}),
    desenhar(fig,p,anim,f){
      let by=0,pe=[0,0],lift=0,esporos=false;
      if(anim==='parado')by=[0,1,1,0][f];
      if(anim==='mover'){pe=[[1,0],[0,0],[0,1],[0,0]][f];by=[0,-1,0,-1][f]}
      if(anim==='atacar'){by=[2,-3,-1,0][f];lift=[0,3,1,0][f];esporos=f===2}
      if(anim==='dano')by=-1;
      const pes=fig.parte('pe',{});pes.ell(12.5,27.5-pe[0]-lift,2.6,1.7);pes.ell(19.5,27.5-pe[1]-lift,2.6,1.7);
      const c=fig.parte('caule',{});c.rrect(11,13+by-lift,10,12,3,4);
      fig.parte('caule',{}).ell(10.5,19+by-lift,1.4,1.2).ell(21.5,19+by-lift,1.4,1.2);
      const cap=fig.parte('corpo',{});for(let y=3;y<=13;y++){const t=(13.5-y)/9.5;const half=11*Math.sqrt(Math.max(0,1-t*t));if(half>0.5)cap.hl(y+by-lift,Math.round(16-half),Math.round(16+half)-1)}
      fig.parte('lamela',{grad:false}).hl(14+by-lift,8,23);
      const pt=fig.parte('pinta',{plano:true});for(const[x,y,rx,ry]of[[11,8,2.1,1.6],[19,6,2.3,1.7],[22.5,10.5,1.5,1.2],[14.5,11,1.4,1.1],[8,11.5,1.1,1]])pt.ell(x,y+by-lift,rx,ry);
      const d=fig.parte('caule',{plano:true}),ey=17+by-lift;
      olhosMonstro(d,anim==='dano'&&f===1?'dor':p.olhos,13,18,ey);
      d.dot(15,ey+3,ESC);d.dot(16,ey+3,ESC);
      if(esporos)for(const[x,y]of[[5,4],[26,3],[3,9],[28,8],[8,1],[23,0],[16,0]])fig.brilho(x,y+by,'#e8ffb0d0',true);
    }},
  aranha:{nome:'Aranha',
    param:r=>({cor:pick(r,['#2a2433','#4a3328','#3a2a4a','#2f4a3a']),marca:pick(r,['#d83a3a','#e0b030','#40c0d0']),olho:pick(r,['#ff3a3a','#ffd040'])}),
    desenhar(fig,p,anim,f){
      let by=0,ph=f%2,frente=0,boca=false;
      if(anim==='parado')by=[0,0,1,1][f];
      if(anim==='mover')ph=f;
      if(anim==='atacar'){frente=[3,4,0,1][f];by=[-1,-2,2,0][f];boca=f===1||f===2}
      if(anim==='dano')by=-1;
      const pc=ramp(mix(p.cor,'#000000',.2));
      [11,14,17,20].forEach((yy,i)=>{const sobe=((i+ph)%2)?1:0,fr=i===3?frente:0;
        for(const s of[1,-1]){const X=x=>s>0?x:31-x;const y=yy+by,kx=24+(i===0?1:0)-(i===3?1:0),ky=y-4-sobe-fr+(i>1?1:0),fx=28+(i%2)-(i===3?1:0),fy=y+3+i-sobe*2-fr;
          fig.traco(X(19),y,X(kx),ky,pc[1]);fig.traco(X(kx),ky,X(fx),fy,pc[0]);fig.brilho(X(kx),ky,pc[3],true)}});
      fig.parte('corpo',{}).ell(16,11+by,6.5,6);
      const mk=fig.parte('marca',{plano:true});mk.px(15,8+by,0).px(16,8+by,0).px(15,9+by,1).px(16,9+by,1).px(15,11+by,0).px(16,11+by,0).px(14,12+by,0).px(17,12+by,0);
      fig.parte('corpo',{}).ell(16,18+by,4.3,3.4);
      const d=fig.parte('corpo',{plano:true});
      if(anim==='dano'&&f===1){d.dot(14,17+by,ESC);d.dot(17,17+by,ESC)}
      else{d.dot(14,17+by,p.olho);d.dot(17,17+by,p.olho);d.dot(15,16+by,p.olho);d.dot(16,16+by,p.olho);fig.brilho(14,17+by,'#ffffff')}
      const pr=fig.parte('presa',{});pr.px(14,21+by+(boca?1:0)).px(17,21+by+(boca?1:0));if(boca){d.dot(15,21+by,'#c03a4a');d.dot(16,21+by,'#c03a4a')}
    }},
  planta:{nome:'Planta carnívora',
    param:r=>({cor:pick(r,['#c83a4a','#8a3ab0','#e07030','#d04a90']),pinta:pick(r,['#fff4e0','#ffe080']),folha:pick(r,['#3f9a3a','#2f7a4a','#6aa03a'])}),
    desenhar(fig,p,anim,f){
      let sw=[0,1,0,-1][f%4],ab=[1,2,1,0][f%4],hy=0;
      if(anim==='mover'){sw=[0,2,0,-2][f];ab=[1,1,2,1][f]}
      if(anim==='atacar'){sw=[-1,3,4,1][f];ab=[4,5,0,1][f];hy=[0,1,2,0][f]}
      if(anim==='dano'){sw=-2;ab=0}
      const cx=16+sw;
      const fo=fig.parte('folha',{});fo.poly([[15,28],[9,24],[6,25],[10,29]]);fo.poly([[17,28],[23,24],[26,25],[22,29]]);
      fig.parte('haste',{grad:false}).bar(16,29,cx,19+hy,2);
      const m=13+hy,sup=fig.parte('corpo',{}),inf=fig.parte('corpo',{});
      sup.ell(cx,m,8.5,7.5);for(let y=m;y<32;y++)for(let x=0;x<32;x++)sup.del(x,y);
      inf.ell(cx,m+ab,7.5,4.5);for(let y=0;y<m+ab;y++)for(let x=0;x<32;x++)inf.del(x,y);
      const d=fig.parte('corpo',{plano:true});
      if(ab>0)for(let y=m;y<m+ab;y++)for(let x=cx-7;x<=cx+6;x++){d.dot(x,y,y===m?'#4a1020':'#7a2030')}
      for(let x=cx-6;x<=cx+5;x+=2){d.dot(x,m-1,'#f4ecd8');d.dot(x+1,m+ab,'#f4ecd8')}
      const pt=fig.parte('pinta',{plano:true});pt.ell(cx-3.5,8+hy,1.5,1.2).ell(cx+2,6.5+hy,1.6,1.2).ell(cx+5,10+hy,1.1,1);
    }},
  mutante:{nome:'Criatura aleatória',
    param:r=>{const n=rint(r,2,4),blobs=[];for(let i=0;i<n;i++)blobs.push([r()*6,8+r()*16,2+r()*5,2+r()*4]);
      return{cor:hsl(r()*360,45+r()*35,48),cor2:hsl(r()*360,50,58),blobs,olhos:rint(r,1,3),chifres:r()<.5,boca:r()<.7}},
    desenhar(fig,p,anim,f){
      let by=[0,1,1,0][f%4],sq=0;
      if(anim==='mover'){by=[0,-2,0,-1][f];sq=[1,0,1,0][f]}
      if(anim==='atacar'){by=[1,-2,-1,0][f];sq=[1,-1,0,0][f]}
      if(anim==='dano')by=-1;
      const c=fig.parte('corpo',{});c.ell(16,18+by,9+sq,8-sq);
      const c2=fig.parte('corpo2',{});for(const[dx,y,rx,ry]of p.blobs){c2.ell(16+dx,y+by,rx,ry);c2.ell(16-dx,y+by,rx,ry)}
      fig.parte('corpo',{}).ell(16,24.5+by,6.5,3);
      if(p.chifres){const h=fig.parte('osso',{});h.px(11,9+by).px(10,8+by).px(10,7+by).px(20,9+by).px(21,8+by).px(21,7+by)}
      const d=fig.parte('corpo',{plano:true}),ey=15+by;
      const xs=p.olhos===1?[15]:p.olhos===2?[12,18]:[11,15,19];
      for(const x of xs){if(anim==='dano'&&f===1){d.dot(x,ey+1,ESC);d.dot(x+1,ey+1,ESC)}else{d.dot(x,ey,BR);d.dot(x+1,ey,ESC);d.dot(x,ey+1,ESC);d.dot(x+1,ey+1,ESC)}}
      if(p.boca){const ab=anim==='atacar'&&f>0&&f<3;for(let x=13;x<=18;x++)d.dot(x,ey+5,ESC);if(ab)for(let x=13;x<=18;x++)d.dot(x,ey+6,x%2?'#f4ecd8':'#8a2a3a');else{d.dot(14,ey+6,'#f4ecd8');d.dot(17,ey+6,'#f4ecd8')}}
    }},
};
function aleatorioMonstro(seed,tipo){const r=rng(seed+'|m|'+tipo);return Object.assign({tipo,contorno:'colorido',sombra:false},MONSTROS[tipo].param(r))}
function paletaMonstro(p){
  const base=p.cor||'#6a9a4a';
  const M={corpo:ramp(base),corpo2:ramp(p.cor2||base),barriga:ramp(mix(base,'#f0e0d0',.35)),asa:ramp(mix(base,'#20182a',.25)),ouro:ramp('#e3b341','quente'),gema:ramp('#e04a5a'),folha:ramp(p.folha||'#4aa83a'),
    osso:ramp('#ece2c8','quente'),esclera:ramp('#f2ebe6','pele'),iris:ramp(p.iris||'#3b8fd0'),veia:['#8a2030','#a8303f','#c84a5a','#d86a78','#e88a98'],carne:ramp(p.carne||'#d8788a','pele'),
    palpebra:ramp(p.carne||'#d8788a','pele'),caule:ramp('#f0e2c4','pele'),lamela:ramp('#d8c4a0'),pinta:ramp(p.pinta||'#fff4e0'),pe:ramp('#8a5a3a','quente'),
    perna:ramp(mix(base,'#8a7a90',.25)),haste:ramp('#3f8a3a'),marca:ramp(p.marca||'#d83a3a'),presa:ramp('#e8e0d0')};
  return m=>M[m]||M.corpo;
}
function desenharMonstro(p,anim,f){
  if(anim==='dano'&&f===0)return flashArr(desenharMonstro(p,'parado',0));
  const fig=new Figura(32,32,paletaMonstro(p));MONSTROS[p.tipo].desenhar(fig,p,anim,f);
  let px=fig.render({contorno:p.contorno});if(p.sombra)px=sombraChao(px,32,32,16,30.5,8,1.5);return px;
}
function gerarMonstro(p){
  return{type:'monstro',w:32,h:32,params:p,rows:M_ANIMS.map(a=>({name:p.tipo+'_'+a.id,fps:a.fps,frames:Array.from({length:a.n},(_,f)=>desenharMonstro(p,a.id,f))}))};
}
