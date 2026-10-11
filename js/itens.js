"use strict";
/* Sprites-N-AI · itens 16×16 (ícones) com materiais e animações */

const TIERS={
  madeira:{nome:'Madeira',lamina:'#a87a4a',detalhe:'#6a4a2e',gema:'#7ad04a'},
  ferro:{nome:'Ferro',lamina:'#b9c3d0',detalhe:'#c8a050',gema:'#4aa8e0'},
  ouro:{nome:'Ouro',lamina:'#ecc64e',detalhe:'#b07a2a',gema:'#e04a5a'},
  cristal:{nome:'Cristal',lamina:'#8ae8f0',detalhe:'#c0c8e0',gema:'#c070f0'},
  fogo:{nome:'Fogo',lamina:'#ff8a3a',detalhe:'#a83a2a',gema:'#ffd040'},
  gelo:{nome:'Gelo',lamina:'#c4f0ff',detalhe:'#6a9ac0',gema:'#e0f8ff'},
  sombra:{nome:'Sombra',lamina:'#7a6aaa',detalhe:'#3a2a4a',gema:'#d040e0'},
};
const CORES_ITEM=['#d8343a','#3a6ad8','#3fae4a','#9a4ad0','#e0a030','#e05a9a','#30b8c0'];
function diag(pt,x0,y0,n,s){for(let t=0;t<n;t++)pt.px(x0+t,y0-t,s)}
const ITENS={
  espada:{nome:'Espada',tier:true,d(fig){const l=fig.parte('lamina',{plano:true});diag(l,6,9,8,1);diag(l,7,9,8,-1);l.px(14,1,1);
    const g=fig.parte('detalhe',{plano:true});for(let k=-2;k<=2;k++)g.px(5+k,9+k,k<0?1:0);
    fig.parte('cabo',{plano:true}).px(5,10,0).px(4,11,-1).px(3,12,0);fig.parte('gema',{}).rect(1,13,2,2)}},
  adaga:{nome:'Adaga',tier:true,d(fig){const l=fig.parte('lamina',{plano:true});diag(l,8,7,5,1);diag(l,9,7,4,-1);l.px(13,2,1);
    const g=fig.parte('detalhe',{plano:true});g.px(6,6,1).px(7,7,0).px(8,8,0);fig.parte('cabo',{plano:true}).px(7,8,0).px(6,9,-1).px(5,10,0);fig.parte('detalhe',{plano:true}).px(4,11,1)}},
  machado:{nome:'Machado',tier:true,d(fig){const m=fig.parte('madeira',{plano:true});diag(m,2,13,10,1);diag(m,3,13,9,-1);
    const h=fig.parte('lamina',{}),e=fig.parte('lamina',{plano:true}),cx=10.5,cy=5.5;
    for(let y=0;y<16;y++)for(let x=0;x<16;x++){const dx=x+.5-cx,dy=y+.5-cy,d=Math.hypot(dx,dy),a=Math.atan2(dy,dx)*180/Math.PI;
      if(d<=5.6&&a>=-30&&a<=120&&d>=1.2){if(d>4.6)e.px(x,y,a<45?2:1);else h.px(x,y)}}
    fig.parte('detalhe',{plano:true}).px(10,5,1).px(11,4,0)}},
  martelo:{nome:'Martelo',tier:true,d(fig){const m=fig.parte('madeira',{plano:true});diag(m,3,13,8,1);diag(m,4,13,7,-1);
    fig.parte('lamina',{}).poly([[9.6,0.8],[15.2,6.4],[12.4,9.2],[6.8,3.6]]);fig.parte('detalhe',{plano:true}).px(10,5,1).px(11,6,0)}},
  lanca:{nome:'Lança',tier:true,d(fig){const m=fig.parte('madeira',{plano:true});diag(m,2,13,9,0);
    const l=fig.parte('lamina',{});l.poly([[9.6,6.4],[9.4,3.6],[15.2,0.8],[12.4,6.6]]);fig.parte('lamina',{plano:true}).line(11,4,14,1,2);fig.parte('detalhe',{plano:true}).px(9,6,1).px(8,7,0)}},
  arco:{nome:'Arco',d(fig){const m=fig.parte('madeira',{plano:true});let pv=null;for(let a=-80;a<=80;a+=4){const r=a*Math.PI/180,P=[3.2+7*Math.cos(r),8+7*Math.sin(r)];if(pv)m.line(pv[0],pv[1],P[0],P[1],a<0?1:0);pv=P}
    fig.parte('corda',{plano:true}).line(4,1,4,15,1);fig.parte('detalhe',{plano:true}).px(10,7,1).px(10,8,0).px(10,9,-1)}},
  cajado:{nome:'Cajado',tier:true,d(fig){const m=fig.parte('madeira',{plano:true});diag(m,2,14,9,1);diag(m,3,14,8,-1);
    fig.parte('detalhe',{plano:true}).px(9,5,1).px(12,8,-1).px(10,6,0);fig.parte('gema',{}).ell(12.5,3.5,2.6,2.6);fig.brilho(11,2,'#ffffff')}},
  escudo:{nome:'Escudo',tier:true,cor:true,d(fig){const pts=d=>[[2.5+d,1.5+d],[13.5-d,1.5+d],[13.5-d,8],[8,14.6-d*1.3],[2.5+d,8]];
    fig.parte('lamina',{}).poly(pts(0));fig.parte('escudo',{}).poly(pts(1.1));const g=fig.parte('detalhe',{plano:true});g.rect(7,3,2,9,0);g.rect(4,6,8,2,0);g.rect(7,3,1,9,1);g.rect(4,6,8,1,1)}},
  elmo:{nome:'Elmo',tier:true,d(fig){const h=fig.parte('lamina',{});h.rrect(3,2,10,12,5,2);h.rect(7,2,2,5,1);h.hl(13,3,12,-1);
    const v=fig.parte('lamina',{plano:true});v.hl(7,4,11,-2);v.rect(7,8,2,3,-2);fig.parte('detalhe',{}).rect(6,0,4,2)}},
  armadura:{nome:'Armadura',tier:true,d(fig){const a=fig.parte('lamina',{});a.rrect(1,3,14,4,2,0);a.poly([[3,6],[13,6],[12,14],[4,14]]);
    for(let x=6;x<=9;x++){a.del(x,3);if(x>6&&x<9)a.del(x,4)}a.hl(9,4,11,-1);a.rect(7,5,2,4,1);fig.parte('detalhe',{grad:false}).hl(12,4,11)}},
  bota:{nome:'Bota',d(fig){const b=fig.parte('couro',{});b.rect(4,2,6,8);b.rrect(4,9,10,5,1,2);fig.parte('couro',{plano:true}).hl(14,4,13,-2);fig.parte('detalhe',{grad:false}).rect(4,2,6,2)}},
  anel:{nome:'Anel',tier:true,d(fig){const a=fig.parte('detalhe',{});a.ell(8,10,5,4);for(let y=0;y<16;y++)for(let x=0;x<16;x++){const dx=(x+.5-8)/3,dy=(y+.5-10)/2;if(dx*dx+dy*dy<=1)a.del(x,y)}
    fig.parte('lamina',{plano:true}).px(6,6,0).px(9,6,0);fig.parte('gema',{}).ell(8,4.5,2.4,2.4)}},
  amuleto:{nome:'Amuleto',tier:true,d(fig){const c=fig.parte('detalhe',{plano:true});for(let k=0;k<5;k++){c.px(3+k,1+k,k%2?-1:1);c.px(12-k,1+k,k%2?-1:1)}
    fig.parte('detalhe',{}).ell(8,10,4.4,4.6);fig.parte('gema',{}).ell(8,10,2.8,3);fig.brilho(7,8,'#ffffff')}},
  pocao:{nome:'Poção',cor:true,anim:'bolhas',d(fig,p){const v=fig.parte('vidro',{}),forma=p.forma||'redonda';
    fig.parte('madeira',{grad:false}).rect(6,0,4,2);v.rect(6,2,4,3);
    if(forma==='redonda')v.ell(8,10,5.6,5.2);else if(forma==='alta')v.rrect(4,5,8,10,2,2);else v.poly([[5.5,4.5],[10.5,4.5],[14,14.5],[2,14.5]]);
    const lq=fig.parte('liquido',{});for(let y=8;y<16;y++)for(let x=0;x<16;x++)if(v.has(x,y)&&v.has(x-1,y)&&v.has(x+1,y)&&v.has(x,y+1))lq.px(x,y);
    fig.parte('liquido',{plano:true}).hl(8,0,15,1);for(let x=0;x<16;x++)if(!lq.has(x,8))fig.partes[fig.partes.length-1].del(x,8);
    fig.brilho(forma==='triangular'?6:5,forma==='alta'?7:8,'#ffffffd0');fig.brilho(forma==='triangular'?6:5,forma==='alta'?8:9,'#ffffff90')}},
  gema:{nome:'Gema',cor:true,d(fig,p){const g=fig.parte('liquido',{}),forma=p.forma||'brilhante';
    if(forma==='redonda'){g.ell(8,8,5.6,5.6);fig.brilho(6,5,'#ffffff');fig.brilho(5,6,'#ffffffb0')}
    else if(forma==='esmeralda'){g.rrect(3,3,10,10,2,2);fig.parte('liquido',{plano:true}).rect(5,5,6,6,1).rect(6,6,4,4,0)}
    else{g.poly([[5,2.5],[11,2.5],[14,6],[2,6]]);g.poly([[2,6],[14,6],[8,14]]);const f=fig.parte('liquido',{plano:true});f.hl(3,6,9,2);f.hl(6,3,12,1);for(let y=7;y<13;y++)f.px(8,y,0)}}},
  moeda:{nome:'Moeda',anim:'girar',d(fig,p,f){const w=[5.6,3.6,1.2,3.6][f||0];const c=fig.parte('ouro',{});c.ell(8,8,w,5.6);
    if(w>3){const s=fig.parte('ouro',{plano:true});s.ell(8,8,w-1.6,4,-1);s.rect(8-(w>5?1:0),5,w>5?2:1,6,1)}}},
  chave:{nome:'Chave',tier:true,d(fig){const a=fig.parte('detalhe',{});a.ell(4.8,4.8,3.4,3.4);for(let y=0;y<16;y++)for(let x=0;x<16;x++){const dx=(x+.5-4.8)/1.5,dy=(y+.5-4.8)/1.5;if(dx*dx+dy*dy<=1)a.del(x,y)}
    const s=fig.parte('detalhe',{plano:true});for(let t=0;t<8;t++){s.px(7+t,7+t,1);s.px(7+t,8+t,-1)}s.px(11,13,0).px(10,14,0).px(13,11,0).px(14,10,0)}},
  bau:{nome:'Baú',tier:true,d(fig){const w=fig.parte('madeira',{});w.rect(1,8,14,7);const t=fig.parte('madeira',{});t.rrect(1,3,14,5,3,0);
    const b=fig.parte('lamina',{grad:false});b.rect(3,3,2,12);b.rect(11,3,2,12);fig.parte('madeira',{plano:true}).hl(8,1,14,-2);
    const l=fig.parte('detalhe',{});l.rect(7,7,2,3);fig.parte('detalhe',{plano:true}).px(7,9,-2)}},
  pergaminho:{nome:'Pergaminho',d(fig){fig.parte('papel',{}).rect(3,3,10,10);const r=fig.parte('papel',{});r.rrect(1,1,14,3,1,1);r.rrect(1,12,14,3,1,1);
    const t=fig.parte('papel',{plano:true});for(const y of[5,7,9])for(let x=5;x<=10;x++)if((x+y)%3)t.px(x,y,-2);fig.parte('tecido',{}).rect(7,10,2,4)}},
  livro:{nome:'Livro',cor:true,d(fig){const c=fig.parte('tecido',{});c.rrect(2,1,11,14,1,1);fig.parte('papel',{grad:false}).rect(12,2,2,12);
    fig.parte('tecido',{plano:true}).rect(2,1,2,14,-2);fig.parte('ouro',{}).rect(6,5,4,4);fig.parte('gema',{plano:true}).rect(7,6,2,2,1)}},
  maca:{nome:'Maçã',cor:true,d(fig){const a=fig.parte('fruta',{});a.ell(6,10,4.2,4.6);a.ell(10,10,4.2,4.6);a.del(8,5);
    fig.parte('madeira',{plano:true}).px(8,3,0).px(8,4,-1);fig.parte('folha',{}).px(9,3).px(10,2).px(11,2).px(10,3);fig.brilho(5,8,'#ffffffc0');fig.brilho(5,9,'#ffffff80')}},
  carne:{nome:'Carne',d(fig){const o=fig.parte('osso',{});o.line(8,8,13,13,0);o.line(9,8,13,12,0);o.rect(12,13,2,2);o.rect(13,12,2,2);
    const c=fig.parte('carne',{});c.ell(6.5,6.5,5,4.6);fig.brilho(4,4,'#ffffffa0')}},
  cogumelo:{nome:'Cogumelo',cor:true,d(fig){fig.parte('caule',{}).rrect(6,8,4,7,1,2);const c=fig.parte('fruta',{});for(let y=2;y<=9;y++){const t=(9.5-y)/7.5,h=7*Math.sqrt(Math.max(0,1-t*t));if(h>.5)c.hl(y,Math.round(8-h),Math.round(8+h)-1)}
    const s=fig.parte('pinta',{plano:true});s.ell(5,6,1.3,1.1).ell(10,4.5,1.4,1.1).ell(11.5,7.5,1,0.9)}},
  coracao:{nome:'Coração',anim:'pulsar',d(fig,p,f){const k=f===1||f===2?.6:0,h=fig.parte('fruta',{});h.ell(5.5,6,3.3+k,3.1+k);h.ell(10.5,6,3.3+k,3.1+k);h.poly([[2.2-k,7],[13.8+k,7],[8,13.6+k]]);fig.brilho(4,4,'#ffffffd0');fig.brilho(4,5,'#ffffff90')}},
  estrela:{nome:'Estrela',anim:'brilhar',d(fig){const pts=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?2.9:7;pts.push([8+Math.cos(a)*r,8.6+Math.sin(a)*r])}fig.parte('ouro',{}).poly(pts)}},
  bomba:{nome:'Bomba',anim:'pavio',d(fig){fig.parte('ferro',{}).ell(7.5,9.5,5.6,5.6);fig.parte('lamina',{grad:false}).rect(9,3,3,2);fig.parte('corda',{plano:true}).px(11,2,0).px(12,1,0);fig.brilho(5,7,'#ffffffa0')}},
  flecha:{nome:'Flecha',tier:true,d(fig){const m=fig.parte('madeira',{plano:true});diag(m,3,12,9,0);const l=fig.parte('lamina',{});l.poly([[11,3.5],[14.5,1.5],[12.5,5]]);l.px(12,3).px(13,2);
    const pn=fig.parte('papel',{plano:true});pn.px(2,12,1).px(1,12,0).px(3,13,0).px(3,14,-1).px(2,11,0).px(4,13,0)}},
  tocha:{nome:'Tocha',anim:'fogo',d(fig){fig.parte('madeira',{}).rect(7,8,2,7);fig.parte('tecido',{}).rect(6,6,4,3)}},
};
function aleatorioItem(seed,tipo){const r=rng(seed+'|i|'+tipo);if(!tipo||tipo==='aleatorio')tipo=pick(r,Object.keys(ITENS));
  const cores={maca:['#d8343a','#7ac83a','#e8c03a'],cogumelo:['#d8343a','#a8603a','#3aa8c8','#9a4ad0'],carne:['#b8583a']}[tipo]||CORES_ITEM;
  return{tipo,tier:pick(r,Object.keys(TIERS)),cor:pick(r,cores),forma:tipo==='pocao'?pick(r,['redonda','alta','triangular']):tipo==='gema'?pick(r,['brilhante','redonda','esmeralda']):null,contorno:'colorido'}}
function paletaItem(p){const T=TIERS[p.tier]||TIERS.ferro;
  const M={lamina:ramp(T.lamina),detalhe:ramp(T.detalhe,'quente'),gema:ramp(T.gema),cabo:ramp('#6a4330'),madeira:ramp('#9a6a3e','quente'),vidro:ramp('#d2e6f2'),liquido:ramp(p.cor||'#d83a4a'),
    papel:ramp('#efe0bc','quente'),tecido:ramp(p.cor||'#3a5aa8'),fruta:ramp(p.tipo==='coracao'?'#e0303e':(p.cor||'#d8343a')),folha:ramp('#4aa83a'),carne:ramp('#b8583a','quente'),osso:ramp('#ece2c8','quente'),
    ferro:ramp('#3e3a4e'),corda:ramp('#d8c8a0','quente'),ouro:ramp('#e8c048','quente'),pinta:ramp('#fff4e0'),caule:ramp('#f0e2c4','pele'),escudo:ramp(p.cor||'#3a5aa8'),couro:ramp('#7a4a30','quente')};
  return m=>M[m]||M.lamina}
function desenharItem(p,f){
  const I=ITENS[p.tipo],an=I.anim||'brilho';
  const base=(ff,cont)=>{const fig=new Figura(16,16,paletaItem(p));I.d(fig,p,ff);
    if(an==='fogo'){const fl=[[[7,0],[6,1],[7,1],[8,1],[6,2],[7,2],[8,2],[9,2],[6,3],[7,3],[8,3],[9,3],[6,4],[7,4],[8,4],[9,4],[6,5],[7,5],[8,5],[9,5]],
      [[8,0],[7,1],[8,1],[6,2],[7,2],[8,2],[9,2],[6,3],[7,3],[8,3],[9,3],[5,4],[6,4],[7,4],[8,4],[9,4],[6,5],[7,5],[8,5],[9,5]],
      [[7,0],[7,1],[8,1],[6,2],[7,2],[8,2],[9,2],[6,3],[7,3],[8,3],[9,3],[6,4],[7,4],[8,4],[9,4],[10,4],[6,5],[7,5],[8,5],[9,5]]][ff%3];
      for(const[x,y]of fl){const q=y+(Math.abs(x-7.5)>1?1:0);fig.brilho(x,y,q<2?'#fff3a0':q<4?'#ffb030':'#e8502a')}}
    if(an==='pavio'){const c=['#fff3a0','#ffb030','#ffffff','#ff7a30'][ff%4];fig.brilho(13,0,c);fig.brilho(12,0,ff%2?'#ffb030':'#e8502a',true);fig.brilho(14,1,ff%2?'#e8502a':'#ffd060',true)}
    if(an==='bolhas'){const bs=[[[7,12],[9,10]],[[7,11],[9,9],[8,13]],[[7,10],[8,12]],[[9,11],[7,13]]][ff%4];for(const[x,y]of bs)fig.brilho(x,y,'#ffffffa0')}
    return fig.render({contorno:cont})};
  if(an==='girar'||an==='pulsar'||an==='fogo'||an==='pavio'||an==='bolhas')return base(f,p.contorno);
  const px=base(0,p.contorno);if(!f)return px;
  const nu=base(0,'nenhum');
  if(an==='brilhar'){const o=px.slice();const s=[[8,1],[14,6],[11,13]][f-1]||[8,1];for(const[dx,dy,c]of[[0,0,'#ffffff'],[1,0,'#fff8c0'],[-1,0,'#fff8c0'],[0,1,'#fff8c0'],[0,-1,'#fff8c0']]){const x=s[0]+dx,y=s[1]+dy;if(x>=0&&y>=0&&x<16&&y<16)o[y*16+x]=c}return o}
  // brilho diagonal que atravessa o item
  const k=[0,-6,2,10][f];return px.map((c,i)=>{if(!nu[i])return c;const x=i%16,y=(i/16)|0,d=x-y-k;return(d===0||d===1)?mix(c.slice(0,7),'#ffffff',d===0?.65:.4):c});
}
function gerarItem(p){const I=ITENS[p.tipo];return{type:'item',w:16,h:16,params:p,rows:[{name:p.tipo,fps:I.anim==='fogo'||I.anim==='pavio'?8:I.anim==='girar'?8:6,frames:[0,1,2,3].map(f=>desenharItem(p,f))}]}}
function gerarPacoteItens(seed,n=16){const r=rng(seed+'|pacote');const tipos=Object.keys(ITENS),rows=[];
  for(let i=0;i<n;i++){const p=aleatorioItem(seed+'-'+i,pick(r,tipos));rows.push({name:p.tipo+'_'+(i+1),fps:6,frames:[0,1,2,3].map(f=>desenharItem(p,f))})}
  return{type:'item',w:16,h:16,params:{pacote:true,seed},rows}}
