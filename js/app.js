"use strict";
/* Sprites-N-AI · interface: criar, IA, editar, exportar e galeria */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const ARMAZ={get(k,d){try{const v=localStorage.getItem('snai.'+k);return v===null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem('snai.'+k,JSON.stringify(v));return true}catch(e){return false}}};

let tipo='personagem',asset=null,curRow=0,curFrame=0,animF=0,animT=0;
let persP=null,monP=null,itemP=null,cenModo='piso',fotoImg=null,iaArquivo=null,saida=null;
let fundo=ARMAZ.get('fundo','xadrez');

let _tt;function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(_tt);_tt=setTimeout(()=>t.hidden=true,2400)}
const semAcento=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'');
function nomear(s){$('#nome').value=semAcento(String(s).split('-')[0]).toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,32)||'sprite';renderJson()}
function nomeArq(){return semAcento($('#nome').value.trim()||'sprite').toLowerCase().replace(/[^a-z0-9_-]+/g,'_')||'sprite'}

/* ---------- fundo e desenho ---------- */
const FUNDOS={escuro:'#14111f',claro:'#ece8f4',grama:'#5a8a3a',azul:'#3a6ab0'};
function pintarFundo(ctx,W,H,q){if(fundo==='xadrez'||!FUNDOS[fundo]){const css=getComputedStyle(document.documentElement),a=css.getPropertyValue('--check-a').trim(),b=css.getPropertyValue('--check-b').trim();
  q=Math.max(4,q|0);for(let y=0;y*q<H;y++)for(let x=0;x*q<W;x++){ctx.fillStyle=(x+y)%2?a:b;ctx.fillRect(x*q,y*q,q,q)}}else{ctx.fillStyle=FUNDOS[fundo];ctx.fillRect(0,0,W,H)}}
const ehPiso=a=>a&&a.type==='cenario'&&a.params&&a.params.piso;
function desenharPreview(){
  const cv=$('#prev'),ctx=cv.getContext('2d'),S=cv.width;ctx.clearRect(0,0,S,S);
  if(!asset){pintarFundo(ctx,S,S,8);return}
  if(asset.estatico){const cols=Math.max(...asset.rows.map(r=>r.frames.length)),W=cols*asset.w,H=asset.rows.length*asset.h,s=Math.max(1,Math.floor(S/Math.max(W,H)));
    pintarFundo(ctx,S,S,s*4);const ox=Math.floor((S-W*s)/2),oy=Math.floor((S-H*s)/2);asset.rows.forEach((r,j)=>r.frames.forEach((f,i)=>desenharPixels(ctx,f,asset.w,asset.h,s,ox+i*asset.w*s,oy+j*asset.h*s)));return}
  const row=asset.rows[curRow]||asset.rows[0],fr=row.frames[animF%row.frames.length];
  if(ehPiso(asset)){const s=Math.max(1,Math.floor(S/(asset.w*2))),o=Math.floor((S-asset.w*2*s)/2);pintarFundo(ctx,S,S,s*4);for(let j=0;j<2;j++)for(let i=0;i<2;i++)desenharPixels(ctx,fr,asset.w,asset.h,s,o+i*asset.w*s,o+j*asset.h*s);return}
  const s=Math.max(1,Math.floor(S/Math.max(asset.w,asset.h)));pintarFundo(ctx,S,S,s*2);desenharPixels(ctx,fr,asset.w,asset.h,s,Math.floor((S-asset.w*s)/2),Math.floor((S-asset.h*s)/2));
}
function tick(t){if(asset&&!asset.estatico){const row=asset.rows[curRow]||asset.rows[0];if(t-animT>1000/(row.fps||8)){animT=t;animF=(animF+1)%row.frames.length;desenharPreview()}}requestAnimationFrame(tick)}
function desenharFolhaMini(){
  const a=asset,cv=$('#sheet');if(!a){cv.width=cv.height=1;return}
  const cols=Math.max(...a.rows.map(r=>r.frames.length)),s=Math.max(1,Math.min(4,Math.floor(48/a.h)));
  cv.width=cols*a.w*s;cv.height=a.rows.length*a.h*s;const ctx=cv.getContext('2d');pintarFundo(ctx,cv.width,cv.height,s*4);
  a.rows.forEach((r,j)=>r.frames.forEach((f,i)=>desenharPixels(ctx,f,a.w,a.h,s,i*a.w*s,j*a.h*s)));
  if(!a.estatico){ctx.strokeStyle='#ffb547';ctx.lineWidth=2;ctx.strokeRect(1,curRow*a.h*s+1,cv.width-2,a.h*s-2);
    const sc=$('.sheet-scroll'),y=curRow*a.h*s;if(y<sc.scrollTop||y+a.h*s>sc.scrollTop+sc.clientHeight)sc.scrollTop=Math.max(0,y-4);
    if(!$('#tab-editar').hidden){ctx.strokeStyle='#ffffff';ctx.lineWidth=1;ctx.strokeRect(curFrame*a.w*s+.5,curRow*a.h*s+.5,a.w*s-1,a.h*s-1)}}
}
$('#sheet').addEventListener('click',e=>{if(!asset)return;const cv=$('#sheet'),r=cv.getBoundingClientRect(),cols=Math.max(...asset.rows.map(x=>x.frames.length));
  const i=Math.floor((e.clientX-r.left)/r.width*cols),j=Math.floor((e.clientY-r.top)/r.height*asset.rows.length);
  if(asset.rows[j]){curRow=j;curFrame=Math.min(i,asset.rows[j].frames.length-1);animF=0;atualizarTudo()}});

function atualizarTudo(){
  if(!asset)return;if(curRow>=asset.rows.length)curRow=0;if(curFrame>=asset.rows[curRow].frames.length)curFrame=0;
  const rs=$('#animSel');rs.innerHTML=asset.rows.map((r,i)=>`<option value="${i}">${r.name.replace(/_/g,' ')} · ${r.frames.length} quadro${r.frames.length>1?'s':''}</option>`).join('');rs.value=curRow;
  rs.disabled=!!asset.estatico;const row=asset.rows[curRow];$('#fps').value=row.fps||8;$('#fpsVal').textContent=(row.fps||8)+' fps';$('#fps').disabled=!!asset.estatico;
  const cols=Math.max(...asset.rows.map(r=>r.frames.length));
  $('#meta').textContent=`${asset.w}×${asset.h} px · ${asset.rows.length} linha${asset.rows.length>1?'s':''} · ${cols} coluna${cols>1?'s':''}`;
  desenharFolhaMini();desenharPreview();renderEditor();renderJson();
}
function setAsset(a,o={}){if(!a)return;const ant=o.manterLinha&&asset?asset.rows[curRow]?.name:null;asset=a;curFrame=0;animF=0;curRow=0;
  const alvo=ant||o.linha;if(alvo){const i=a.rows.findIndex(x=>x.name===alvo);if(i>=0)curRow=i}
  if(!o.manterHistorico){ED.desfazer=[];ED.refazer=[]}atualizarTudo()}

/* ---------- criar ---------- */
const CAMPOS_PERS=[
  {g:'Corpo',c:[['raca','sel',OP_PERS.raca],['fisico','sel',OP_PERS.fisico],['pele','cor']]},
  {g:'Rosto',c:[['olhos','sel',OP_PERS.olhos],['corOlhos','cor'],['boca','sel',OP_PERS.boca],['barba','sel',OP_PERS.barba],['blush','chk']]},
  {g:'Cabelo',c:[['cabelo','sel',OP_PERS.cabelo],['corCabelo','cor']]},
  {g:'Roupa',c:[['roupa','sel',OP_PERS.roupa],['corRoupa','cor'],['corRoupa2','cor'],['calca','cor'],['bota','cor'],['cinto','chk'],['corCinto','cor'],['capa','sel',OP_PERS.capa],['corCapa','cor']]},
  {g:'Chapéu',c:[['chapeu','sel',OP_PERS.chapeu],['corChapeu','cor']]},
  {g:'Equipamento',c:[['arma','sel',OP_PERS.arma],['corMetal','cor'],['corGema','cor'],['escudo','sel',OP_PERS.escudo],['corEscudo','cor']]},
  {g:'Acabamento',c:[['contorno','sel',OP_PERS.contorno],['sombra','chk']]},
];
const NOME_CAMPO={raca:'Raça',fisico:'Corpo',pele:'Pele',olhos:'Olhos',corOlhos:'Cor dos olhos',boca:'Boca',barba:'Barba',blush:'Bochechas rosadas',cabelo:'Estilo',corCabelo:'Cor',
  roupa:'Tipo',corRoupa:'Cor principal',corRoupa2:'Cor dos detalhes',calca:'Calça',bota:'Botas',cinto:'Cinto',corCinto:'Cor do cinto',capa:'Capa',corCapa:'Cor da capa',
  chapeu:'Tipo',corChapeu:'Cor',arma:'Arma',corMetal:'Cor do metal',corGema:'Cor da gema',escudo:'Escudo',corEscudo:'Cor do escudo',contorno:'Contorno',sombra:'Sombra no chão'};
function montarCamposPers(){
  const box=$('#persCampos');
  for(const G of CAMPOS_PERS){const det=document.createElement('details');det.className='grupo';det.innerHTML=`<summary>${G.g}</summary>`;
    const fs=document.createElement('div');fs.className='fields';
    for(const[k,tp,ops]of G.c){const f=document.createElement('div'),id='pc-'+k;f.className='field'+(tp==='chk'?' chk':'');
      if(tp==='chk')f.innerHTML=`<label><input type="checkbox" id="${id}"> ${NOME_CAMPO[k]}</label>`;
      else f.innerHTML=`<label class="label" for="${id}">${NOME_CAMPO[k]}</label>`+(tp==='sel'?`<select id="${id}">${ops.map(o=>`<option value="${o}">${ROTULOS[o]||o}</option>`).join('')}</select>`:`<input type="color" id="${id}">`);
      fs.appendChild(f)}
    det.appendChild(fs);box.appendChild(det)}
  let pend=null;
  box.addEventListener('input',e=>{const id=e.target.id;if(!id||!id.startsWith('pc-')||!persP)return;const k=id.slice(3);persP[k]=e.target.type==='checkbox'?e.target.checked:e.target.value;
    if(k==='raca'){const R=RACAS[persP.raca];persP.pele=R.peles[0];persP.fisico=R.forte?'forte':'normal';
      if(R.caveira){persP.olhos='brilho';persP.boca='dentes';persP.blush=false;persP.cabelo='careca'}else if(persP.boca==='dentes')persP.boca='normal';
      if(R.presas)persP.boca='presas';else if(persP.boca==='presas')persP.boca='normal';escreverCamposPers()}
    cancelAnimationFrame(pend);pend=requestAnimationFrame(()=>setAsset(gerarPers(persP,animsPers()),{manterLinha:true}))});
}
function escreverCamposPers(){if(!persP)return;for(const G of CAMPOS_PERS)for(const[k,tp]of G.c){const el=$('#pc-'+k);if(!el)continue;if(tp==='chk')el.checked=!!persP[k];else el.value=persP[k]}}
function animsPers(){const s=$$('#persAnims input:checked').map(i=>i.value);return s.length?s:['andar']}
function opcoes(sel,pares){$(sel).innerHTML=pares.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}

function gerar(){
  const seed=$('#semente').value.trim()||'semente';
  if(tipo==='personagem'){persP=aleatorioPers(seed,$('#classe').value);escreverCamposPers();setAsset(gerarPers(persP,animsPers()),{linha:'andar_baixo'});nomear(seed)}
  else if(tipo==='monstro'){monP=aleatorioMonstro(seed,$('#monTipo').value);monP.contorno=$('#monCont').value;monP.sombra=$('#monSombra').checked;setAsset(gerarMonstro(monP),{linha:monP.tipo+'_mover'});nomear(semAcento(MONSTROS[monP.tipo].nome))}
  else if(tipo==='item'){itemP=itemDe(seed);setAsset(gerarItem(itemP));nomear(ITENS[itemP.tipo].nome+'_'+itemP.tier)}
  else if(tipo==='cenario'){
    if(cenModo==='piso'){const t=$('#cenPiso').value;setAsset(gerarPiso(t,seed));nomear(t)}
    else if(cenModo==='tileset'){const a=$('#cenA').value,b=$('#cenB').value;setAsset(gerarTileset(a,b,seed));nomear('tileset_'+a+'_'+b)}
    else{const t=$('#cenDecor').value;setAsset(gerarDecor(t,seed));nomear(t)}}
  else if(tipo==='foto'){if(fotoImg)setAsset(fotoAsset());else toast('Escolha uma foto primeiro')}
}
function itemDe(seed){const p=aleatorioItem(seed,$('#itemTipo').value),t=$('#itemTier').value;if(t!=='aleatorio')p.tier=t;return p}
function tile2x2(p){const b=new Array(32*32);for(let y=0;y<32;y++)for(let x=0;x<32;x++)b[y*32+x]=p[(y%16)*16+(x%16)];return b}
function miniatura(seed){
  if(tipo==='personagem')return{px:desenharPers(aleatorioPers(seed,$('#classe').value),'baixo','parado',0),w:32,h:32};
  if(tipo==='monstro'){const p=aleatorioMonstro(seed,$('#monTipo').value);p.contorno=$('#monCont').value;return{px:desenharMonstro(p,'parado',0),w:32,h:32}}
  if(tipo==='item')return{px:desenharItem(itemDe(seed),0),w:16,h:16};
  if(tipo==='cenario'){if(cenModo==='piso')return{px:tile2x2(desenharPiso($('#cenPiso').value,seed)),w:32,h:32};
    if(cenModo==='decor'){const D=DECOR[$('#cenDecor').value];return{px:desenharDecor($('#cenDecor').value,seed),w:D.w,h:D.h}}
    const ts=gerarTileset($('#cenA').value,$('#cenB').value,seed),b=new Array(48*48);for(let j=0;j<3;j++)for(let i=0;i<3;i++){const fr=ts.rows[j].frames[i];for(let y=0;y<16;y++)for(let x=0;x<16;x++)b[(j*16+y)*48+i*16+x]=fr[y*16+x]}return{px:b,w:48,h:48}}
  return null;
}
function renderVariantes(){
  const box=$('#variantes');box.innerHTML='';
  if(tipo==='foto'){box.innerHTML='<div class="vazio">Escolha uma foto acima para ver o resultado em pixel art.</div>';$('#btnMais').hidden=true;return}
  $('#btnMais').hidden=false;
  for(let k=0;k<12;k++){const sd=novaSemente(),m=miniatura(sd);if(!m)continue;const bt=document.createElement('button');bt.type='button';bt.setAttribute('aria-label','Variação '+sd);
    const cv=document.createElement('canvas');cv.width=cv.height=96;const ctx=cv.getContext('2d'),s=Math.max(1,Math.floor(96/Math.max(m.w,m.h)));
    pintarFundo(ctx,96,96,s*2);desenharPixels(ctx,m.px,m.w,m.h,s,Math.floor((96-m.w*s)/2),Math.floor((96-m.h*s)/2));bt.appendChild(cv);
    bt.onclick=()=>{$$('#variantes button').forEach(x=>x.classList.remove('sel'));bt.classList.add('sel');$('#semente').value=sd;gerar()};box.appendChild(bt)}
}
function selecionarTipo(t,gerarAgora=true){
  tipo=t;$$('#tipoSeg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tipo===t));
  ['personagem','monstro','item','cenario','foto'].forEach(x=>$('#op-'+x).hidden=x!==t);
  if(gerarAgora){if(t!=='foto'){$('#semente').value=novaSemente();gerar()}else if(fotoImg)setAsset(fotoAsset())}
  renderVariantes();
}
function mostrarCenario(){
  $$('#cenSeg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.cen===cenModo));
  $('#f-piso').hidden=cenModo!=='piso';$('#f-tsA').hidden=$('#f-tsB').hidden=cenModo!=='tileset';$('#f-decor').hidden=cenModo!=='decor';
  $('#cenDica').textContent={piso:'O piso se repete sem emenda: coloque lado a lado no mapa. A prévia mostra 4 cópias juntas.',
    tileset:'São 15 peças: cantos, bordas, cantos internos e o meio. O nome de cada peça vai junto nos dados da aba Exportar.',
    decor:'Decorações com fundo transparente para colocar por cima do piso.'}[cenModo];
}

/* ---------- foto → pixel ---------- */
function fotoParaPixels(img,size,ncol,tirarFundo){
  const ar=img.naturalWidth/img.naturalHeight;let w=size,h=Math.max(1,Math.round(size/ar));if(ar<1){h=size;w=Math.max(1,Math.round(size*ar))}
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;const cx=cv.getContext('2d');cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality='high';cx.drawImage(img,0,0,w,h);
  const d=cx.getImageData(0,0,w,h).data,px=[];for(let i=0;i<w*h;i++)if(d[i*4+3]>=128)px.push([d[i*4],d[i*4+1],d[i*4+2]]);
  if(!px.length)return{w,h,p:new Array(w*h).fill(null)};
  const lum=p=>p[0]*.3+p[1]*.59+p[2]*.11,ord=px.slice().sort((a,b)=>lum(a)-lum(b)),k=Math.min(ncol,px.length);
  let cen=[];for(let i=0;i<k;i++)cen.push(ord[Math.floor((i+.5)/k*ord.length)].slice());
  const perto=p=>{let bi=0,bd=1e9;cen.forEach((c,i)=>{const dd=(p[0]-c[0])**2+(p[1]-c[1])**2+(p[2]-c[2])**2;if(dd<bd){bd=dd;bi=i}});return bi};
  for(let it=0;it<10;it++){const s=cen.map(()=>[0,0,0,0]);px.forEach(p=>{const i=perto(p);s[i][0]+=p[0];s[i][1]+=p[1];s[i][2]+=p[2];s[i][3]++});s.forEach((v,i)=>{if(v[3])cen[i]=[v[0]/v[3],v[1]/v[3],v[2]/v[3]]})}
  const hx=cen.map(c=>rgb2hex(c[0],c[1],c[2])),out=new Array(w*h).fill(null);for(let i=0;i<w*h;i++)if(d[i*4+3]>=128)out[i]=hx[perto([d[i*4],d[i*4+1],d[i*4+2]])];
  if(tirarFundo){const bg=out[0],pilha=[];if(bg){for(let x=0;x<w;x++)pilha.push([x,0],[x,h-1]);for(let y=0;y<h;y++)pilha.push([0,y],[w-1,y]);
    while(pilha.length){const[x,y]=pilha.pop();if(x<0||y<0||x>=w||y>=h||out[y*w+x]!==bg)continue;out[y*w+x]=null;pilha.push([x+1,y],[x-1,y],[x,y+1],[x,y-1])}}}
  return{w,h,p:out};
}
function fotoAsset(){const r=fotoParaPixels(fotoImg,+$('#fSize').value,+$('#fCores').value,$('#fFundo').value==='1');
  return{type:'foto',w:r.w,h:r.h,rows:[{name:'imagem',fps:6,frames:[$('#fContorno').checked?contornoArr(r.p,r.w,r.h):r.p]}]}}

/* ---------- IA ---------- */
function estadoIA(){
  const st=$('#iaStatus'),ok=!!IA.fn;
  if(!IA.pronta){st.textContent='Verificando se a IA está disponível…';st.className='ia-status';return}
  st.textContent=ok?'IA pronta. Na primeira vez, o Claude pede sua permissão para usar a sua conta.':'A IA só funciona quando você abre esta ferramenta pelo link do Claude (no app ou no site). Aqui você pode usar os geradores das outras abas.';
  st.className='ia-status '+(ok?'ok':'off');
  $$('.ia-btn').forEach(b=>b.disabled=!ok);$('#iaFotoBtn').disabled=!ok||!iaArquivo||!IA.imagens;$('#iaFotoAviso').hidden=!ok||IA.imagens;
}
let iaOcup=false;
function iaOcupada(sim,msg){iaOcup=sim;$$('.ia-btn').forEach(b=>b.disabled=sim||!IA.fn);$('#iaFotoBtn').disabled=sim||!IA.fn||!iaArquivo||!IA.imagens;
  $$('.ia-parar').forEach(b=>b.hidden=!sim);if(sim&&msg)iaMsg(msg,false,true)}
function iaMsg(t,erro,carregando){const o=$('#iaOut'),novo=o.hidden;o.hidden=false;o.className='ia-out'+(erro?' erro':'')+(carregando?' carregando':'');o.textContent=t;
  if(novo||!carregando)o.scrollIntoView({behavior:'smooth',block:'nearest'})}
async function iaCriarPersonagem(promessa){
  try{const r=await promessa;persP=r.params;selecionarTipo('personagem',false);escreverCamposPers();setAsset(gerarPers(persP,animsPers()),{linha:'andar_baixo'});
    nomear(r.nome||'heroi');iaMsg((r.nome?r.nome+': ':'')+(r.explicacao||'Pronto! O personagem está lá em cima, com todas as animações.'))}
  catch(e){iaMsg(e&&e.code==='cancelled'?'Pedido cancelado.':erroIA(e),!(e&&e.code==='cancelled'))}finally{iaOcupada(false)}
}
$('#iaPersBtn').onclick=()=>{const d=$('#iaPersTxt').value.trim();if(!d){toast('Escreva como é o personagem');return}iaOcupada(true,'A IA está criando o personagem…');iaCriarPersonagem(iaPersonagem(d))};
$('#iaFotoBtn').onclick=()=>{if(!iaArquivo)return;iaOcupada(true,'A IA está olhando a foto…');iaCriarPersonagem(iaFotoPersonagem(iaArquivo))};
$('#iaFoto').onchange=e=>{const f=e.target.files[0];if(!f)return;iaArquivo=f;const rd=new FileReader();rd.onload=()=>{$('#iaFotoPrev').src=rd.result;$('#iaFotoPrev').hidden=false};rd.readAsDataURL(f);estadoIA()};
$('#iaLivreBtn').onclick=async()=>{
  const d=$('#iaLivreTxt').value.trim();if(!d){toast('Escreva o que a IA deve desenhar');return}
  const W=+$('#iaTam').value,a={type:'ia',w:W,h:W,rows:[{name:'desenho_ia',fps:6,frames:[new Array(W*W).fill(null)]}]};
  setAsset(a);nomear(d.split(/\s+/).slice(0,3).join('_'));iaOcupada(true,'A IA está pensando no desenho… pode levar até um minuto.');
  try{const px=await iaDesenhar(d,W,W,$('#iaQual').value==='1',(parcial,n)=>{if(asset!==a)return;a.rows[0].frames[0]=parcial;iaMsg('Desenhando… linha '+n+' de '+W,false,true);desenharPreview();desenharFolhaMini()});
    if(asset===a){a.rows[0].frames[0]=px;atualizarTudo()}iaMsg('Pronto! Você pode retocar na aba Editar ou pedir mudanças para a IA lá.')}
  catch(e){iaMsg(e&&e.code==='cancelled'?'Desenho interrompido.':erroIA(e),!(e&&e.code==='cancelled'))}finally{iaOcupada(false)}
};
$$('.ia-parar').forEach(b=>b.onclick=pararIA);
$$('#iaSeg button').forEach(b=>b.onclick=()=>{$$('#iaSeg button').forEach(x=>x.setAttribute('aria-pressed',x===b));['pers','livre','foto'].forEach(m=>$('#ia-'+m).hidden=m!==b.dataset.ia)});
function chips(sel,alvo,lista){const box=$(sel);lista.forEach(t=>{const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=t;b.onclick=()=>{$(alvo).value=t;$(alvo).focus()};box.appendChild(b)})}

/* ---------- editor ---------- */
const ED={ferr:'lapis',espelho:false,grade:true,fantasma:false,zoom:0,cel:10,pintando:false,ini:null,ult:null,base:null,visit:null,desfazer:[],refazer:[]};
const quadro=()=>asset.rows[curRow].frames[curFrame];
const setQuadro=px=>{asset.rows[curRow].frames[curFrame]=px};
function guardar(){ED.desfazer.push({r:curRow,f:curFrame,px:quadro().slice()});if(ED.desfazer.length>80)ED.desfazer.shift();ED.refazer=[]}
function renderEditor(){
  if(!asset||$('#tab-editar').hidden)return;
  const cv=$('#edCanvas'),avail=Math.max(160,Math.min($('#edWrap').clientWidth-20,640)),base=Math.max(3,Math.floor(avail/Math.max(asset.w,asset.h)));
  ED.cel=Math.max(2,Math.round(base*Math.pow(1.5,ED.zoom)));cv.width=asset.w*ED.cel;cv.height=asset.h*ED.cel;
  pintarEditor();renderQuadros();renderCores();
}
function pintarEditor(px){
  const cv=$('#edCanvas'),ctx=cv.getContext('2d'),c=ED.cel;pintarFundo(ctx,cv.width,cv.height,c);
  const fr=asset.rows[curRow].frames;if(ED.fantasma&&fr.length>1){ctx.globalAlpha=.3;desenharPixels(ctx,fr[(curFrame-1+fr.length)%fr.length],asset.w,asset.h,c);ctx.globalAlpha=1}
  desenharPixels(ctx,px||quadro(),asset.w,asset.h,c);
  if(ED.grade&&c>=6){ctx.strokeStyle='rgba(255,255,255,.09)';ctx.lineWidth=1;ctx.beginPath();for(let x=0;x<=asset.w;x++){ctx.moveTo(x*c+.5,0);ctx.lineTo(x*c+.5,cv.height)}for(let y=0;y<=asset.h;y++){ctx.moveTo(0,y*c+.5);ctx.lineTo(cv.width,y*c+.5)}ctx.stroke()}
  if(ED.espelho){ctx.strokeStyle='rgba(255,181,71,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cv.width/2,0);ctx.lineTo(cv.width/2,cv.height);ctx.stroke()}
}
function renderQuadros(){
  const box=$('#quadros');box.innerHTML='';
  asset.rows[curRow].frames.forEach((f,i)=>{const b=document.createElement('button');b.type='button';b.className=i===curFrame?'sel':'';b.setAttribute('aria-label','Quadro '+(i+1));
    const cv=document.createElement('canvas');cv.width=cv.height=56;const ctx=cv.getContext('2d'),s=Math.max(1,Math.floor(56/Math.max(asset.w,asset.h)));
    pintarFundo(ctx,56,56,s*2);desenharPixels(ctx,f,asset.w,asset.h,s,Math.floor((56-asset.w*s)/2),Math.floor((56-asset.h*s)/2));b.appendChild(cv);
    const n=document.createElement('span');n.textContent=i+1;b.appendChild(n);b.onclick=()=>{curFrame=i;renderEditor();desenharFolhaMini()};box.appendChild(b)});
}
function renderCores(){
  const box=$('#cores'),pal=$('#edPaleta').value;box.innerHTML='';
  const conta=new Map();if(pal==='sprite')for(const r of asset.rows)for(const f of r.frames)for(const c of f)if(c){const k=c.slice(0,7);conta.set(k,(conta.get(k)||0)+1)}
  const lista=pal==='sprite'?[...conta.entries()].sort((a,b)=>b[1]-a[1]).slice(0,32).map(e=>e[0]).sort((a,b)=>{const A=hex2hsl(a),B=hex2hsl(b);return(A[1]<12)-(B[1]<12)||A[0]-B[0]||A[2]-B[2]}):PALETAS[pal]||[];
  for(const c of lista){const b=document.createElement('button');b.type='button';b.style.background=c;b.title=c;b.setAttribute('aria-label','Cor '+c);if(c===$('#edCor').value)b.className='sel';
    b.onclick=()=>{$('#edCor').value=c;if(!['lapis','balde','linha','retangulo'].includes(ED.ferr))setFerr('lapis');renderCores()};box.appendChild(b)}
}
function setFerr(t){ED.ferr=t;$$('#ferramentas [data-f]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.f===t))}
const ptEd=e=>{const r=$('#edCanvas').getBoundingClientRect();return[Math.floor((e.clientX-r.left)/r.width*asset.w),Math.floor((e.clientY-r.top)/r.height*asset.h)]};
function pxSet(px,x,y,cor){const w=asset.w,h=asset.h;const s=xx=>{if(xx>=0&&y>=0&&xx<w&&y<h)px[y*w+xx]=cor};s(x);if(ED.espelho)s(w-1-x)}
function tonalizar(px,x,y,dir){const w=asset.w,h=asset.h;const f=xx=>{if(xx<0||y<0||xx>=w||y>=h)return;const i=y*w+xx;if(ED.visit.has(i))return;ED.visit.add(i);const c=px[i];if(!c)return;const R=ramp(c.slice(0,7));px[i]=dir>0?R[3]:R[1]};f(x);if(ED.espelho)f(w-1-x)}
function linhaPts(a,b,fn){let[x0,y0]=a;const[x1,y1]=b,dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;for(;;){fn(x0,y0);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
function balde(px,w,h,x,y,cor){if(x<0||y<0||x>=w||y>=h)return;const alvo=px[y*w+x];if(alvo===cor)return;const st=[[x,y]];while(st.length){const[a,b]=st.pop();if(a<0||b<0||a>=w||b>=h||px[b*w+a]!==alvo)continue;px[b*w+a]=cor;st.push([a+1,b],[a-1,b],[a,b+1],[a,b-1])}}
function traco(a,b){
  const t=ED.ferr,w=asset.w,h=asset.h;
  if(t==='lapis'||t==='borracha'){const px=quadro(),cor=t==='borracha'?null:$('#edCor').value;linhaPts(a,b,(x,y)=>pxSet(px,x,y,cor))}
  else if(t==='clarear'||t==='escurecer'){const px=quadro();linhaPts(a,b,(x,y)=>tonalizar(px,x,y,t==='clarear'?1:-1))}
  else if(t==='linha'||t==='retangulo'){const px=ED.base.slice(),cor=$('#edCor').value,[x0,y0]=ED.ini,[x1,y1]=b;
    if(t==='linha')linhaPts([x0,y0],[x1,y1],(x,y)=>pxSet(px,x,y,cor));
    else{const xa=Math.min(x0,x1),xb=Math.max(x0,x1),ya=Math.min(y0,y1),yb=Math.max(y0,y1);for(let x=xa;x<=xb;x++){pxSet(px,x,ya,cor);pxSet(px,x,yb,cor)}for(let y=ya;y<=yb;y++){pxSet(px,xa,y,cor);pxSet(px,xb,y,cor)}}
    setQuadro(px)}
  else if(t==='mover')setQuadro(shiftArr(ED.base,w,h,b[0]-ED.ini[0],b[1]-ED.ini[1]));
  pintarEditor();
}
const edCv=$('#edCanvas');
edCv.addEventListener('pointerdown',e=>{if(!asset)return;e.preventDefault();edCv.setPointerCapture(e.pointerId);const p=ptEd(e);
  if(ED.ferr==='conta'){const c=quadro()[p[1]*asset.w+p[0]];if(c){$('#edCor').value=c.slice(0,7);setFerr('lapis');renderCores()}return}
  guardar();ED.ini=p;ED.ult=p;ED.base=quadro().slice();ED.visit=new Set();
  if(ED.ferr==='balde'){const px=quadro();balde(px,asset.w,asset.h,p[0],p[1],$('#edCor').value);if(ED.espelho)balde(px,asset.w,asset.h,asset.w-1-p[0],p[1],$('#edCor').value);fimEdicao();return}
  ED.pintando=true;traco(p,p)});
edCv.addEventListener('pointermove',e=>{if(!ED.pintando)return;const p=ptEd(e);if(p[0]===ED.ult[0]&&p[1]===ED.ult[1])return;traco(ED.ult,p);ED.ult=p});
function fimEdicao(){ED.pintando=false;pintarEditor();desenharFolhaMini();renderQuadros();renderCores();renderJson();desenharPreview()}
edCv.addEventListener('pointerup',()=>{if(ED.pintando)fimEdicao()});edCv.addEventListener('pointercancel',()=>{if(ED.pintando)fimEdicao()});
$$('#ferramentas [data-f]').forEach(b=>b.onclick=()=>setFerr(b.dataset.f));
const alterna=(id,k)=>{$(id).onclick=()=>{ED[k]=!ED[k];$(id).setAttribute('aria-pressed',ED[k]);pintarEditor()}};
alterna('#edEspelho','espelho');alterna('#edGrade','grade');alterna('#edFantasma','fantasma');
function trocarHist(de,para,vazio){const u=de.pop();if(!u){toast(vazio);return}const fr=asset.rows[u.r]&&asset.rows[u.r].frames;if(!fr||!fr[u.f])return;para.push({r:u.r,f:u.f,px:fr[u.f].slice()});fr[u.f]=u.px;curRow=u.r;curFrame=u.f;atualizarTudo()}
$('#edDesfazer').onclick=()=>trocarHist(ED.desfazer,ED.refazer,'Nada para desfazer');
$('#edRefazer').onclick=()=>trocarHist(ED.refazer,ED.desfazer,'Nada para refazer');
$('#edContorno').onclick=()=>{guardar();setQuadro(contornoArr(quadro(),asset.w,asset.h,CONTORNO));fimEdicao();toast('Contorno escuro adicionado')};
$('#edLimpar').onclick=()=>{guardar();setQuadro(new Array(asset.w*asset.h).fill(null));fimEdicao()};
$('#edZoomMenos').onclick=()=>{ED.zoom=Math.max(-2,ED.zoom-1);renderEditor()};
$('#edZoomMais').onclick=()=>{ED.zoom=Math.min(4,ED.zoom+1);renderEditor()};
$('#edPaleta').onchange=renderCores;
$('#qNovo').onclick=()=>{const fr=asset.rows[curRow].frames;fr.splice(curFrame+1,0,new Array(asset.w*asset.h).fill(null));curFrame++;atualizarTudo()};
$('#qDup').onclick=()=>{const fr=asset.rows[curRow].frames;fr.splice(curFrame+1,0,quadro().slice());curFrame++;atualizarTudo();toast('Quadro duplicado')};
$('#qEsq').onclick=()=>{const fr=asset.rows[curRow].frames;if(curFrame<1)return;[fr[curFrame-1],fr[curFrame]]=[fr[curFrame],fr[curFrame-1]];curFrame--;atualizarTudo()};
$('#qDir').onclick=()=>{const fr=asset.rows[curRow].frames;if(curFrame>=fr.length-1)return;[fr[curFrame+1],fr[curFrame]]=[fr[curFrame],fr[curFrame+1]];curFrame++;atualizarTudo()};
$('#qEsp').onclick=()=>{guardar();setQuadro(flipArr(quadro(),asset.w,asset.h));fimEdicao()};
$('#qDel').onclick=()=>{const fr=asset.rows[curRow].frames;if(fr.length<2){toast('A animação precisa de pelo menos 1 quadro');return}fr.splice(curFrame,1);curFrame=Math.max(0,curFrame-1);atualizarTudo();toast('Quadro apagado')};
$('#edBranco').onclick=()=>{const n=+$('#edTam').value;setAsset({type:'desenho',w:n,h:n,rows:[{name:'desenho',fps:6,frames:[new Array(n*n).fill(null)]}]});nomear('desenho');toast('Tela em branco de '+n+'×'+n)};
$('#edIaBtn').onclick=async()=>{
  const t=$('#edIaTxt').value.trim();if(!t){toast('Escreva o que a IA deve mudar');return}if(!IA.fn){toast('A IA só funciona pelo link do Claude');return}
  const a=asset,r=curRow,f=curFrame,orig=quadro().slice();guardar();$('#edIaBtn').disabled=true;$('#edIaParar').hidden=false;$('#edIaMsg').textContent='A IA está pensando…';
  try{const px=await iaEditar(t,orig,a.w,a.h,(parcial,n)=>{if(asset===a){a.rows[r].frames[f]=parcial;$('#edIaMsg').textContent='Redesenhando… linha '+n+' de '+a.h;pintarEditor();desenharPreview()}});
    a.rows[r].frames[f]=px;$('#edIaMsg').textContent='Pronto! Se não gostar, toque em Desfazer.'}
  catch(e){a.rows[r].frames[f]=orig;ED.desfazer.pop();$('#edIaMsg').textContent=e&&e.code==='cancelled'?'Pedido cancelado.':erroIA(e)}
  finally{$('#edIaBtn').disabled=false;$('#edIaParar').hidden=true;if(asset===a)atualizarTudo()}
};
$('#edIaParar').onclick=pararIA;

/* ---------- exportar ---------- */
function dadosEngine(){if(!asset)return{};const sc=+$('#exEscala').value,mg=+$('#exMargem').value;
  return{nome:nomeArq(),arquivo:nomeArq()+'_sheet'+(sc>1?'_'+sc+'x':'')+'.png',larguraQuadro:asset.w*sc,alturaQuadro:asset.h*sc,espacoEntreQuadros:mg,
    colunas:Math.max(...asset.rows.map(r=>r.frames.length)),linhas:asset.rows.length,
    animacoes:asset.rows.map((r,i)=>Object.assign({nome:r.name,linha:i,quadros:r.frames.length,fps:r.fps||8},r.nomes?{pecas:r.nomes}:{}))}}
function renderJson(){$('#exJson').value=JSON.stringify(dadosEngine(),null,2)}
const lerDataURL=blob=>new Promise(res=>{const rd=new FileReader();rd.onload=()=>res(rd.result);rd.readAsDataURL(blob)});
async function mostrarSaida(blob,nome,largura){saida={blob,nome};$('#exImg').src=await lerDataURL(blob);$('#exImg').style.width=Math.min(largura,640)+'px';$('#exOut').hidden=false;
  $('#exBaixar').textContent='Baixar '+nome;$('#exOut').scrollIntoView({behavior:'smooth',block:'nearest'})}
$('#exFolha').onclick=async()=>{const sc=+$('#exEscala').value,cv=folhaCanvas(asset,sc,+$('#exMargem').value);await mostrarSaida(await canvasBlob(cv),nomeArq()+'_sheet'+(sc>1?'_'+sc+'x':'')+'.png',cv.width)};
$('#exQuadro').onclick=async()=>{const sc=+$('#exEscala').value,cv=quadroCanvas(quadro(),asset.w,asset.h,sc);await mostrarSaida(await canvasBlob(cv),nomeArq()+'_quadro'+(sc>1?'_'+sc+'x':'')+'.png',cv.width)};
$('#exGif').onclick=async()=>{const sc=Math.max(1,+$('#exEscala').value),row=asset.rows[curRow],fr=asset.estatico?asset.rows.flatMap(r=>r.frames):row.frames;
  const bytes=gifCodificar(fr,asset.w,asset.h,sc,Math.max(2,Math.round(100/(row.fps||8))));
  await mostrarSaida(new Blob([bytes],{type:'image/gif'}),nomeArq()+'_'+(asset.estatico?'pecas':row.name)+'.gif',asset.w*sc)};
$('#exBaixar').onclick=async()=>{if(!saida)return;const r=await baixarArquivo(saida.nome,saida.blob,saida.blob.type);
  toast(r==='ok'?'Arquivo pronto: '+saida.nome:r==='recusado'?'Download cancelado':'Não deu para baixar aqui. Toque e segure a imagem para salvar.')};
$('#exCopiar').onclick=()=>{const t=$('#exJson');navigator.clipboard.writeText(t.value).then(()=>toast('Dados copiados')).catch(()=>{t.focus();t.select();toast('Texto selecionado: copie pelo menu do celular')})};
$('#exJsonBaixar').onclick=async()=>{const r=await baixarArquivo(nomeArq()+'.json',$('#exJson').value,'application/json');if(r!=='ok')toast(r==='recusado'?'Download cancelado':'Não deu para baixar aqui. Use Copiar dados.')};
$('#exEscala').onchange=renderJson;$('#exMargem').onchange=renderJson;

/* ---------- galeria ---------- */
function lerGaleria(){let g=ARMAZ.get('galeria2',null);if(g)return g;g=[];
  try{const v1=JSON.parse(localStorage.getItem('sprites-n-ai.galeria')||'[]');for(const it of v1){it.asset.rows.forEach(r=>r.fps=r.fps||it.fps||6);g.push({id:it.id,nome:it.nome,pacote:empacotar(it.asset)})}}catch(e){}
  return g}
function gravarGaleria(g){if(!ARMAZ.set('galeria2',g)){toast('A galeria está cheia. Apague alguns itens ou baixe um backup.');return false}return true}
$('#exSalvar').onclick=()=>{if(!asset)return;const g=lerGaleria();g.unshift({id:Date.now(),nome:$('#nome').value||'sprite',pacote:empacotar(asset)});if(gravarGaleria(g)){toast('Salvo na Galeria');renderGaleria()}};
function renderGaleria(){
  const g=lerGaleria(),box=$('#galeria');box.innerHTML='';
  if(!g.length){box.innerHTML='<div class="vazio">Nada salvo ainda. Crie um asset e toque em <b>Salvar na Galeria</b> na aba Exportar.</div>';return}
  for(const it of g){const a=desempacotar(it.pacote);if(!a||!a.rows)continue;const c=document.createElement('div');c.className='card';
    const cv=document.createElement('canvas');cv.width=cv.height=96;const ctx=cv.getContext('2d'),f=a.rows[0].frames[0],s=Math.max(1,Math.floor(96/Math.max(a.w,a.h)));
    pintarFundo(ctx,96,96,s*2);desenharPixels(ctx,f,a.w,a.h,s,Math.floor((96-a.w*s)/2),Math.floor((96-a.h*s)/2));
    const nm=document.createElement('div');nm.className='nm';nm.textContent=it.nome;const info=document.createElement('div');info.className='meta';info.textContent=a.w+'×'+a.h+' · '+a.rows.length+' anim.';
    const row=document.createElement('div');row.className='row';
    const ab=document.createElement('button');ab.className='btn';ab.type='button';ab.textContent='Abrir';
    ab.onclick=()=>{setAsset(a);$('#nome').value=it.nome;if(a.type==='personagem'&&a.params){persP=a.params}mostrarAba('editar');toast('Aberto no editor')};
    const del=document.createElement('button');del.className='btn perigo';del.type='button';del.textContent='Apagar';
    del.onclick=()=>{if(del.dataset.ok){gravarGaleria(lerGaleria().filter(x=>x.id!==it.id));renderGaleria()}else{del.dataset.ok=1;del.textContent='Confirmar'}};
    row.append(ab,del);c.append(cv,nm,info,row);box.appendChild(c)}
}
$('#galBackup').onclick=async()=>{const r=await baixarArquivo('sprites-n-ai-backup.json',JSON.stringify(lerGaleria()),'application/json');toast(r==='ok'?'Backup pronto':r==='recusado'?'Download cancelado':'Não deu para baixar aqui')};
$('#galAbrir').onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{const novos=JSON.parse(rd.result);if(!Array.isArray(novos))throw 0;
  const g=lerGaleria(),ids=new Set(g.map(x=>x.id));let n=0;for(const it of novos)if(it&&it.pacote&&!ids.has(it.id)){g.push(it);n++}
  if(gravarGaleria(g)){toast(n+' asset'+(n===1?'':'s')+' adicionado'+(n===1?'':'s'));renderGaleria()}}catch(err){toast('Esse arquivo não é um backup do Sprites-N-AI')}};rd.readAsText(f);e.target.value=''};

/* ---------- abas e controles ---------- */
function mostrarAba(n){document.body.dataset.aba=n;$$('nav.tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.aba===n));
  ['criar','ia','editar','exportar','galeria'].forEach(x=>$('#tab-'+x).hidden=x!==n);
  if(n==='editar')renderEditor();if(n==='galeria')renderGaleria();if(n==='exportar')renderJson();desenharFolhaMini();ARMAZ.set('aba',n)}
$$('nav.tabs button').forEach(b=>b.onclick=()=>mostrarAba(b.dataset.aba));
$$('#tipoSeg button').forEach(b=>b.onclick=()=>selecionarTipo(b.dataset.tipo));
$$('#cenSeg button').forEach(b=>b.onclick=()=>{cenModo=b.dataset.cen;mostrarCenario();gerar();renderVariantes()});
$('#btnNovo').onclick=()=>{if(tipo!=='foto')$('#semente').value=novaSemente();gerar()};
$('#btnMais').onclick=renderVariantes;
$('#semente').onchange=gerar;
$('#classe').onchange=()=>{$('#semente').value=novaSemente();gerar();renderVariantes()};
$('#persAnims').onchange=()=>{if(persP)setAsset(gerarPers(persP,animsPers()),{manterLinha:true})};
['#monTipo','#itemTipo','#itemTier','#cenPiso','#cenA','#cenB','#cenDecor'].forEach(id=>$(id).onchange=()=>{gerar();renderVariantes()});
['#monCont','#monSombra'].forEach(id=>$(id).onchange=()=>{if(monP){monP.contorno=$('#monCont').value;monP.sombra=$('#monSombra').checked;setAsset(gerarMonstro(monP),{manterLinha:true})}});
$('#btnPacote').onclick=()=>{const s=novaSemente();$('#semente').value=s;setAsset(gerarPacoteItens(s));nomear('pacote_itens')};
['#fSize','#fCores','#fFundo','#fContorno'].forEach(id=>$(id).onchange=()=>{if(fotoImg)setAsset(fotoAsset())});
$('#fArquivo').onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{const im=new Image();im.onload=()=>{fotoImg=im;nomear(f.name.replace(/\.[^.]+$/,''));setAsset(fotoAsset());
  $('#variantes').innerHTML='<div class="vazio">Pronto! Mude o tamanho e as cores acima. Depois retoque na aba Editar.</div>'};im.src=rd.result};rd.readAsDataURL(f)};
$('#animSel').onchange=e=>{curRow=+e.target.value;curFrame=0;animF=0;atualizarTudo()};
$('#fps').oninput=e=>{if(!asset)return;asset.rows[curRow].fps=+e.target.value;$('#fpsVal').textContent=e.target.value+' fps';renderJson()};
$('#nome').oninput=renderJson;
$$('#fundos button').forEach(b=>{b.onclick=()=>{fundo=b.dataset.fundo;ARMAZ.set('fundo',fundo);$$('#fundos button').forEach(x=>x.setAttribute('aria-pressed',x===b));desenharPreview();desenharFolhaMini();renderEditor()};b.setAttribute('aria-pressed',b.dataset.fundo===fundo)});
window.addEventListener('resize',()=>renderEditor());

/* ---------- início ---------- */
(function iniciar(){
  opcoes('#classe',[['aleatoria','Qualquer uma'],...Object.keys(CLASSES).map(k=>[k,ROTULOS[k]||k])]);
  opcoes('#monTipo',Object.keys(MONSTROS).map(k=>[k,MONSTROS[k].nome]));
  opcoes('#monCont',OP_PERS.contorno.map(k=>[k,ROTULOS[k]]));
  opcoes('#itemTipo',[['aleatorio','Qualquer um'],...Object.keys(ITENS).map(k=>[k,ITENS[k].nome])]);
  opcoes('#itemTier',[['aleatorio','Qualquer um'],...Object.keys(TIERS).map(k=>[k,TIERS[k].nome])]);
  const pisos=Object.keys(PISOS).map(k=>[k,PISOS[k].nome]);opcoes('#cenPiso',pisos);opcoes('#cenA',pisos);opcoes('#cenB',pisos);$('#cenA').value='grama';$('#cenB').value='terra';
  opcoes('#cenDecor',Object.keys(DECOR).map(k=>[k,DECOR[k].nome]));
  opcoes('#edPaleta',[['sprite','Cores do sprite'],...Object.keys(PALETAS).map(k=>[k,k])]);
  montarCamposPers();mostrarCenario();
  chips('#iaPersEx','#iaPersTxt',['Cavaleira de armadura dourada','Mago esqueleto de chapéu roxo','Orc bárbaro com elmo viking','Rainha elfa de vestido azul']);
  chips('#iaLivreEx','#iaLivreTxt',['Baú de tesouro com moedas','Dragãozinho vermelho fofo','Espada lendária de fogo','Castelinho de pedra']);
  document.body.dataset.aba='criar';
  $('#semente').value='heroi-7';gerar();renderVariantes();requestAnimationFrame(tick);
  iniciarIA(estadoIA);estadoIA();
  const aba=ARMAZ.get('aba','criar');if(aba!=='criar'&&$('#tab-'+aba))mostrarAba(aba);
})();
