"use strict";
/* Sprites-N-AI · IA: usa o Claude (capacidade "sample") para criar personagens e desenhar pixel art */

const IA={fn:null,imagens:false,ctl:null,pronta:false};
async function iniciarIA(aoMudar){
  try{if(window.claude&&window.claude.use){IA.fn=await window.claude.use('sample');if(IA.fn){try{const l=await IA.fn.limits();IA.imagens=!!(l&&l.images)}catch(e){IA.imagens=false}}}}catch(e){IA.fn=null}
  IA.pronta=true;if(aoMudar)aoMudar();
}
function erroIA(e){const c=e&&e.code;return({
  not_granted:'Você não permitiu que esta página use o Claude. Para liberar, recarregue a página e toque em Permitir.',
  sampling_disabled:'A IA não está disponível na sua conta agora.',rate_limited:'Muitos pedidos seguidos. Espere um pouco e tente de novo.',
  refused:'A IA não quis fazer esse pedido. Tente descrever de outro jeito.',invalid_json:'A resposta da IA veio incompleta. Toque no botão de novo.',
  image_rejected:'Essa foto não funcionou. Tente outra imagem em JPG ou PNG.',images_unavailable:'Mandar fotos para a IA não está disponível aqui.',
  session_expired:'Sua sessão do Claude expirou. Entre de novo e recarregue a página.',empty_completion:'A IA não respondeu nada. Tente uma descrição diferente.',
  prompt_too_large:'O desenho é grande demais para a IA. Tente um tamanho menor.'})[c]||'Algo deu errado na conexão. Tente de novo.'}

const _CORES_PERS=['pele','corOlhos','corCabelo','corRoupa','corRoupa2','calca','bota','corCinto','corCapa','corChapeu','corMetal','corGema','corEscudo'];
function esquemaPers(){const L=k=>OP_PERS[k].join(' | ');return `Reply with ONLY one JSON object with exactly these keys:
"nome": a short fun name in Portuguese (2 or 3 words)
"raca": ${L('raca')}   (esqueleto has bone skin; orc and goblin are green; demonio has horns)
"fisico": ${L('fisico')}
"pele": skin color as "#rrggbb"
"olhos": ${L('olhos')}
"corOlhos": "#rrggbb"
"boca": ${L('boca')}
"blush": true or false
"barba": ${L('barba')}
"cabelo": ${L('cabelo')}
"corCabelo": "#rrggbb"
"roupa": ${L('roupa')}
"corRoupa": main clothes color "#rrggbb"
"corRoupa2": trim/details color "#rrggbb"
"calca": pants color "#rrggbb"
"bota": boots color "#rrggbb"
"cinto": true or false
"corCinto": "#rrggbb"
"capa": ${L('capa')}
"corCapa": "#rrggbb"
"chapeu": ${L('chapeu')}
"corChapeu": "#rrggbb"
"arma": ${L('arma')}
"corMetal": weapon blade and armor color "#rrggbb"
"corGema": staff orb and gem color "#rrggbb"
"escudo": ${L('escudo')}
"corEscudo": "#rrggbb"
"explicacao": one short sentence in Portuguese telling the player what you chose
Use only the listed values. When something isn't available, pick the closest option. Choose colors that contrast well and read clearly in a tiny 32×32 sprite.`}
function normalizarPers(o,seed){
  const p={...aleatorioPers(seed||novaSemente())};
  if(o&&typeof o==='object'){
    for(const k of Object.keys(OP_PERS)){const v=typeof o[k]==='string'?o[k].trim().toLowerCase():null;if(v&&OP_PERS[k].includes(v))p[k]=v}
    for(const k of _CORES_PERS){const v=typeof o[k]==='string'?o[k].trim():'';if(/^#[0-9a-fA-F]{6}$/.test(v))p[k]=v.toLowerCase()}
    for(const k of['blush','cinto'])if(typeof o[k]==='boolean')p[k]=o[k];
  }
  p.classe='ia';return p;
}
async function iaPersonagem(descricao){
  const prompt=`You design characters for a pixel-art RPG sprite generator (32×32 chibi sprites with walk and attack animations).
Read the player's description (it may be in Portuguese) and choose the generator options that match it best.
${esquemaPers()}

Player's description: """${descricao.slice(0,1200)}"""`;
  IA.ctl=new AbortController();
  const o=await IA.fn.json(prompt,{modelTier:'default',cache:false,signal:IA.ctl.signal});
  return{params:normalizarPers(o),nome:typeof o?.nome==='string'?o.nome.slice(0,40):'',explicacao:typeof o?.explicacao==='string'?o.explicacao.slice(0,240):''};
}
async function iaFotoPersonagem(arquivo){
  const prompt=`The image is a photo or drawing sent by a player (it may show a person, a pet, a toy or a drawing).
Turn it into a fun RPG hero for a 32×32 pixel-art sprite generator: match what you can see (hair style and color, skin tone, eye color, clothing colors, hats or accessories) and pick a fitting class look and weapon. Don't describe or identify who the person is; only choose the sprite options.
${esquemaPers()}`;
  IA.ctl=new AbortController();
  const o=await IA.fn.json(prompt,{images:[arquivo],modelTier:'default',cache:false,signal:IA.ctl.signal});
  return{params:normalizarPers(o),nome:typeof o?.nome==='string'?o.nome.slice(0,40):'',explicacao:typeof o?.explicacao==='string'?o.explicacao.slice(0,240):''};
}

/* ---------- pixel art livre em texto ---------- */
const _CHAVES='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
function lerGradeIA(txt,H){
  const pal={},grade=[];let modo='';
  for(const l of txt.replace(/\r/g,'').split('\n')){const t=l.trim();if(!t||t.startsWith('```'))continue;
    if(/^PALETA/i.test(t)){modo='p';continue}if(/^PIXELS/i.test(t)){modo='g';continue}if(/^FIM/i.test(t))break;
    if(modo==='p'){const m=t.match(/^([A-Za-z0-9])\s*[:=]?\s*(#[0-9a-fA-F]{6})/);if(m)pal[m[1]]=m[2].toLowerCase()}
    else if(modo==='g'&&grade.length<H)grade.push(t.replace(/\s/g,''))}
  return{pal,grade}}
function gradePixels(pal,grade,W,H){const px=new Array(W*H).fill(null);grade.forEach((row,y)=>{if(y>=H)return;for(let x=0;x<W&&x<row.length;x++){const c=pal[row[x]];if(c)px[y*W+x]=c}});return px}
function pixelsTexto(px,W,H){
  const cores=[...new Set(px.filter(Boolean).map(c=>c.slice(0,7)))],usar=cores.slice(0,_CHAVES.length),mapa=new Map();
  usar.forEach((c,i)=>mapa.set(c,_CHAVES[i]));
  const chave=c=>{if(!c)return'.';const k=c.slice(0,7);if(mapa.has(k))return mapa.get(k);const[r,g,b]=hex2rgb(k);let bi=0,bd=1e9;usar.forEach((u,i)=>{const[R,G,B]=hex2rgb(u),d=(r-R)**2+(g-G)**2+(b-B)**2;if(d<bd){bd=d;bi=i}});return _CHAVES[bi]};
  const linhas=[];for(let y=0;y<H;y++){let s='';for(let x=0;x<W;x++)s+=chave(px[y*W+x]);linhas.push(s)}
  return'PALETA\n'+usar.map((c,i)=>_CHAVES[i]+' '+c).join('\n')+'\nPIXELS\n'+linhas.join('\n')+'\nFIM';
}
const _REGRAS_ARTE=`Art direction:
- Classic 16-bit RPG pixel art with a clear, readable silhouette, centered, using most of the canvas but leaving at least 1 transparent pixel on every side.
- A 1-pixel dark outline around the whole subject (a dark, saturated tone of the color next to it, not pure black).
- Light comes from the top-left. Give each material 3 or 4 shades (dark shadow, shadow, base, highlight). Shadows lean cooler (toward blue/purple) and highlights warmer.
- No dithering, no noise, no lone stray pixels, no blurry anti-aliasing. Use 6 to 16 colors in total.
- Transparent background.`;
function _formato(W,H){return `Answer in exactly this format and nothing else:
PALETA
a #1b1325
b #5a3a7a
(one line per color: one letter, a space, a #rrggbb color)
PIXELS
(exactly ${H} lines, each exactly ${W} characters long: "." is transparent, letters are palette colors)
FIM`}
// desenha ao vivo: aoParcial(pixels, linhasProntas) é chamado enquanto a resposta chega
async function iaDesenhar(descricao,W,H,caprichado,aoParcial){
  IA.ctl=new AbortController();
  const prompt=`You are an expert pixel artist making assets for a 2D game.
Draw: "${descricao.slice(0,600)}"
Canvas: ${W} pixels wide and ${H} pixels tall.

${_REGRAS_ARTE}

${_formato(W,H)}`;
  const{text}=await IA.fn(prompt,{modelTier:caprichado?'complex':'default',cache:false,signal:IA.ctl.signal,
    onText:({text})=>{const g=lerGradeIA(text,H);if(g.grade.length)aoParcial(gradePixels(g.pal,g.grade,W,H),g.grade.length)}});
  const g=lerGradeIA(text,H);if(g.grade.length<Math.min(4,H))throw{code:'empty_completion'};
  return gradePixels(g.pal,g.grade,W,H);
}
async function iaEditar(instrucao,px,W,H,aoParcial){
  IA.ctl=new AbortController();
  const prompt=`You are an expert pixel artist. Here is a ${W}×${H} pixel art sprite for a 2D game, written as text ("." is transparent, letters map to the palette colors):
${pixelsTexto(px,W,H)}

Change it like this: "${instrucao.slice(0,500)}"
Keep the same size and style, and keep everything the request doesn't ask to change. You may add new colors to the palette.

${_REGRAS_ARTE}

${_formato(W,H)}`;
  const{text}=await IA.fn(prompt,{modelTier:'default',cache:false,signal:IA.ctl.signal,
    onText:({text})=>{const g=lerGradeIA(text,H);if(g.grade.length)aoParcial(gradePixels(g.pal,g.grade,W,H),g.grade.length)}});
  const g=lerGradeIA(text,H);if(g.grade.length<Math.min(4,H))throw{code:'empty_completion'};
  return gradePixels(g.pal,g.grade,W,H);
}
function pararIA(){if(IA.ctl)IA.ctl.abort()}
