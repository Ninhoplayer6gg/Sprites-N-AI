"use strict";
/* Sprites-N-AI · personagens 32×32 desenhados em camadas, com 4 animações em 4 direções */

const RACAS={
  humano:{nome:'Humano',peles:['#f6d5bb','#ecbd96','#d9a077','#b97c55','#8e5a3a','#5f3b27'],orelha:'normal'},
  elfo:{nome:'Elfo',peles:['#fbe4d0','#f2cba8','#e2b590','#c79a78'],orelha:'elfo'},
  anao:{nome:'Anão',peles:['#f3c9a6','#e2ab82','#c88c62','#9b6a48'],orelha:'normal',baixo:true},
  orc:{nome:'Orc',peles:['#7fae5a','#6b9b4b','#93a95d','#5f8d63'],orelha:'pontuda',forte:true,presas:true,nariz:2},
  goblin:{nome:'Goblin',peles:['#9cc44f','#86b043','#b0b84f','#73a35f'],orelha:'goblin',baixo:true,nariz:3},
  esqueleto:{nome:'Esqueleto',peles:['#e8e1cb','#ddd6bf'],orelha:'nenhuma',caveira:true,nariz:0},
  demonio:{nome:'Demônio',peles:['#c9434f','#a83a5f','#8b3c7c','#5c4b8e'],orelha:'pontuda',chifres:true},
};
const OP_PERS={
  raca:Object.keys(RACAS),fisico:['normal','forte'],
  olhos:['normal','grande','fofo','fechado','bravo','brilho'],
  boca:['normal','sorriso','serio','aberta','presas','dentes'],
  barba:['nenhuma','curta','longa','bigode'],
  cabelo:['curto','espetado','longo','rabo','coque','chanel','moicano','afro','careca'],
  roupa:['tunica','regata','armadura','couro','manto','vestido'],
  capa:['nenhuma','curta','longa'],
  chapeu:['nenhum','capuz','mago','elmo','viking','coroa','bandana','chapeu'],
  arma:['nenhuma','espada','machado','lanca','arco','cajado','adaga','martelo'],
  escudo:['nenhum','redondo','cavaleiro'],
  contorno:['colorido','escuro','nenhum'],
};
const ROTULOS={
  humano:'Humano',elfo:'Elfo',anao:'Anão',orc:'Orc',goblin:'Goblin',esqueleto:'Esqueleto',demonio:'Demônio',
  normal:'Normal',forte:'Forte',grande:'Grande',fofo:'Fofo',fechado:'Feliz (fechado)',bravo:'Bravo',brilho:'Brilhando',
  sorriso:'Sorriso',serio:'Sério',aberta:'Aberta',presas:'Presas',dentes:'Dentes',
  nenhuma:'Nenhuma',nenhum:'Nenhum',curta:'Curta',longa:'Longa',bigode:'Bigode',
  curto:'Curto',espetado:'Espetado',longo:'Longo',rabo:'Rabo de cavalo',coque:'Coque',chanel:'Chanel',moicano:'Moicano',afro:'Black power',careca:'Careca',
  tunica:'Túnica',regata:'Regata',armadura:'Armadura',couro:'Couro',manto:'Manto',vestido:'Vestido',
  capuz:'Capuz',mago:'Chapéu de mago',elmo:'Elmo',viking:'Elmo viking',coroa:'Coroa',bandana:'Bandana',chapeu:'Chapéu',
  espada:'Espada',machado:'Machado',lanca:'Lança',arco:'Arco',cajado:'Cajado',adaga:'Adaga',martelo:'Martelo',
  redondo:'Redondo',cavaleiro:'De cavaleiro',colorido:'Colorido',escuro:'Escuro',
  guerreiro:'Guerreiro',arqueiro:'Arqueiro',ladino:'Ladino',aldeao:'Aldeão',realeza:'Realeza',barbaro:'Bárbaro',clerigo:'Clérigo',pirata:'Pirata',ninja:'Ninja',aleatoria:'Qualquer uma',
};
const COR_CABELO=['#2b1e19','#4b3024','#6e4428','#9b5c2f','#c88a3e','#e3c06a','#f2e1a8','#dcd7cf','#8e9097','#b2362f','#d8622c','#3f509c','#6a40a2','#2e8f6a','#e078a9','#59c3d6'];
const COR_OLHOS=['#3b6fd0','#2f9a5c','#7a4a2a','#3a3448','#8a3fb0','#c0392b','#2aa3a3','#d49a1f'];
const CLASSES={
  guerreiro:r=>({roupa:pick(r,['tunica','couro','armadura']),arma:pick(r,['espada','machado','martelo']),escudo:pick(r,['nenhum','redondo','cavaleiro']),chapeu:pick(r,['nenhum','nenhum','elmo','bandana']),capa:pick(r,['nenhuma','curta']),corRoupa:pick(r,['#a83a32','#3c5aa8','#7a5232','#4a7a3a'])}),
  mago:r=>{const c=pick(r,['#5a3fa0','#2f4fa8','#a8323e','#2f7a5a','#3a3554']);return{roupa:'manto',arma:'cajado',escudo:'nenhum',chapeu:pick(r,['mago','mago','capuz','nenhum']),capa:pick(r,['nenhuma','longa']),corRoupa:c,corChapeu:c,corRoupa2:'#e3b341'}},
  arqueiro:r=>({roupa:pick(r,['tunica','couro']),arma:'arco',escudo:'nenhum',chapeu:pick(r,['capuz','chapeu','nenhum']),capa:pick(r,['curta','nenhuma']),corRoupa:pick(r,['#3f7a3a','#5a6b2f','#7a5a32']),corChapeu:pick(r,['#3f6a32','#5a4a2a']),corCapa:pick(r,['#3f6a32','#5a4a2a'])}),
  ladino:r=>({roupa:'couro',arma:'adaga',escudo:'nenhum',chapeu:pick(r,['capuz','bandana','nenhum']),capa:pick(r,['curta','nenhuma']),corRoupa:pick(r,['#3a3548','#2e2a33','#5a2a35']),corChapeu:'#2e2a38',corCapa:'#2e2a38'}),
  cavaleiro:r=>({roupa:'armadura',arma:pick(r,['espada','lanca']),escudo:pick(r,['cavaleiro','redondo']),chapeu:pick(r,['elmo','elmo','nenhum']),capa:pick(r,['longa','curta']),corRoupa:pick(r,['#3c5aa8','#a83a32','#5a3fa0']),corMetal:pick(r,['#b8c2d0','#c9ced8','#d6b24a'])}),
  aldeao:r=>({roupa:pick(r,['tunica','vestido','regata']),arma:'nenhuma',escudo:'nenhum',chapeu:pick(r,['nenhum','chapeu','bandana']),capa:'nenhuma',corRoupa:pick(r,['#8a6a4a','#6a7a5a','#a8784a','#5a6a8a','#b05a5a'])}),
  realeza:r=>({roupa:pick(r,['manto','vestido']),arma:'nenhuma',escudo:'nenhum',chapeu:'coroa',capa:'longa',corRoupa:pick(r,['#7a2f8a','#a82f3e','#2f4fa8']),corCapa:pick(r,['#a82f3e','#7a2f8a']),corRoupa2:'#e3b341'}),
  barbaro:r=>({roupa:'regata',arma:pick(r,['machado','martelo']),escudo:'nenhum',chapeu:pick(r,['viking','nenhum']),capa:pick(r,['nenhuma','curta']),fisico:'forte',corRoupa:pick(r,['#7a5232','#5a4030','#8a6a48']),corCapa:'#7a5a3a'}),
  clerigo:r=>({roupa:'manto',arma:'martelo',escudo:pick(r,['redondo','nenhum']),chapeu:pick(r,['nenhum','capuz']),capa:'nenhuma',corRoupa:pick(r,['#e8e4da','#d8c890','#a8c0d8']),corChapeu:'#e8e4da',corRoupa2:'#e3b341'}),
  pirata:r=>({roupa:pick(r,['tunica','regata']),arma:'espada',escudo:'nenhum',chapeu:pick(r,['bandana','chapeu']),capa:'nenhuma',corRoupa:pick(r,['#e8e4da','#a83a32','#3a3a4a']),corChapeu:pick(r,['#b8302f','#2a2833']),calca:'#2f2f3a'}),
  ninja:r=>({roupa:'couro',arma:'adaga',escudo:'nenhum',chapeu:'bandana',capa:'nenhuma',corRoupa:'#2a2833',calca:'#2a2833',bota:'#1f1d26',corChapeu:pick(r,['#b8302f','#2a2833'])}),
};

function aleatorioPers(seed,classe){
  const r=rng(seed+'|pers');
  if(!classe||classe==='aleatoria')classe=pick(r,Object.keys(CLASSES));
  const raca=wpick(r,{humano:46,elfo:14,anao:10,orc:10,goblin:6,esqueleto:7,demonio:7}),R=RACAS[raca];
  const p={classe,raca,fisico:R.forte?'forte':'normal',pele:pick(r,R.peles),
    olhos:R.caveira?'brilho':pick(r,['normal','normal','grande','fofo','bravo']),
    corOlhos:R.caveira||R.chifres?pick(r,['#5ff0ff','#ff5050','#a0ff60','#ffd040']):pick(r,COR_OLHOS),
    boca:R.caveira?'dentes':R.presas?'presas':pick(r,['normal','normal','sorriso','serio']),blush:!R.caveira&&r()<.35,
    barba:raca==='anao'?pick(r,['longa','curta']):(!R.caveira&&r()<.12?pick(r,['curta','bigode','longa']):'nenhuma'),
    cabelo:R.caveira?'careca':pick(r,['curto','curto','espetado','longo','rabo','coque','chanel','moicano','afro','careca']),
    corCabelo:pick(r,COR_CABELO),
    roupa:'tunica',corRoupa:hsl(r()*360,45,45),corRoupa2:pick(r,['#e3b341','#e8e4da','#c0c8d8','#7a3a2a']),
    calca:pick(r,['#4a3f5c','#3f4a5c','#5c4a3a','#3a4a3a','#6a5a48','#2f2f3a']),bota:pick(r,['#5a3a28','#3a2a24','#2a2a34','#6b4a2e']),
    cinto:true,corCinto:pick(r,['#6b4430','#4a3328','#3a2f3a']),capa:'nenhuma',corCapa:pick(r,['#a83236','#3a4fa0','#2f6a3f','#5a3a8a','#2a2a38']),
    chapeu:'nenhum',corChapeu:hsl(r()*360,40,40),arma:'nenhuma',corMetal:pick(r,['#b8c2d0','#c9ced8','#9aa6b8']),corGema:hsl(r()*360,85,60),
    escudo:'nenhum',corEscudo:hsl(r()*360,55,42),sombra:false,contorno:'colorido'};
  Object.assign(p,CLASSES[classe](r));
  if(R.forte)p.fisico='forte';
  if(raca==='anao'&&p.fisico==='normal'&&r()<.5)p.fisico='forte';
  return p;
}
function paletaPers(p){
  const R={pele:ramp(p.pele,'pele'),cabelo:ramp(p.corCabelo),roupa:ramp(p.corRoupa),roupa2:ramp(p.corRoupa2),calca:ramp(p.calca),bota:ramp(p.bota),cinto:ramp(p.corCinto),
    capa:ramp(p.corCapa),chapeu:ramp(p.corChapeu),metal:ramp(p.corMetal),ouro:ramp('#e3b341','quente'),madeira:ramp('#8b5a33','quente'),couro:ramp('#6a4330'),gema:ramp(p.corGema),
    escudo:ramp(p.corEscudo),osso:ramp('#ece2c8','quente'),corda:['#b8b0a0','#d8d0c0','#f0ead8','#fffaf0','#ffffff']};
  return m=>R[m]||R.roupa;
}

/* ---------- cabelos, chapéus e barbas em texto ----------
   Grade de 18 colunas sobre a cabeça: coluna c → x = 7+c; linha r → y = topo da cabeça − 4 + r.
   F = de frente (sobre a cabeça), FB = de frente (atrás do corpo), S = de lado, SB = de lado (atrás), B = de costas. */
const _cur={
  F:{o:3,m:[".....########.....","...############...","..##############..",".################.",".################.",".################.",".##.###..###.####.",".##............##.",".#..............#."]},
  S:{o:3,m:[".....#######......","...##########.....","..############....",".##############...",".###############..",".###############..",".########...###...",".#######..........",".######...........","..####............","...##............."]},
  B:{o:3,m:[".....########.....","...############...","..##############..",".################.",".################.",".################.",".################.",".################.",".################.","..##############..","..##############..","...############..."]},
};
const CABELOS={
  curto:_cur,
  espetado:{
    F:{o:0,m:["....#....#....#...","...##...###..##...","..###..#####.###..","..##############..",".################.",".################.",".################.",".################.",".################.",".#.###.####.###.#.",".#..#........#..#.",".#..............#."]},
    S:{o:0,m:["..#....#..........","..##..###..#......",".####.#######.....",".############.....","##############....",".##############...",".##############...","################..",".###############..","##########..###...",".#######..........","..#####...........","...###............"]},
    B:{o:0,m:["....#....#....#...","...##...###..##...","..###..#####.###..","..##############..",".################.",".################.",".################.",".################.",".################.",".################.",".################.",".################.","#.##############.#","..##############..","...##.####.##....."]},
  },
  longo:{
    F:{o:3,m:[".....########.....","...############...","..##############..",".################.",".################.",".################.",".###.###..###.###.",".##............##.",".##............##.",".##............##.",".##............##.",".###..........###.",".###..........###.",".##............##.",".##............##.","..#............#.."]},
    FB:{o:8,m:[".################.","##################","##################","##################","##################","##################","##################","##################","##################","##################","##################","##################",".################.","..##############.."]},
    S:{o:3,m:[".....#######......","...##########.....","..############....",".##############...",".###############..",".###############..",".########...###...",".#######..........",".#######..........",".#######..........",".######...........",".######...........",".#####............",".#####............",".####.............",".####.............","..##.............."]},
    B:{o:3,m:[".....########.....","...############...","..##############..",".################.",".################.",".################.",".################.",".################.",".################.",".################.",".################.",".################.",".################.",".################.",".################.","..##############..","...############...","....##########...."]},
  },
  rabo:{
    F:{o:3,m:[".....########.....","...############...","..##############..",".################.",".################.",".################.",".##.##########.##.",".#..............#."]},
    S:_cur.S,
    SB:{o:7,m:["##................","###...............","###...............","####..............","####..............","###...............","###...............",".##...............",".##...............","..#..............."]},
    B:{o:3,m:_cur.B.m.concat(["......######......","......######......",".......####.......",".......####.......","........##........"])},
  },
  coque:{
    F:{o:0,m:["......######......",".....########.....","......######......"].concat(_cur.F.m)},
    S:{o:0,m:["..####............",".######...........","..####............"].concat(_cur.S.m)},
    B:{o:0,m:["......######......",".....########.....","......######......"].concat(_cur.B.m)},
  },
  chanel:{
    F:{o:3,m:[".....########.....","...############...","..##############..",".################.",".################.",".################.",".################.",".###..........###.",".###..........###.",".###..........###.",".###..........###.",".####........####.","..##..........##.."]},
    S:{o:3,m:[".....#######......","...##########.....","..############....",".##############...",".###############..",".###############..",".###############..",".#########........",".#########........",".#########........",".#########........",".#########........","..#######........."]},
    B:{o:3,m:[".....########.....","...############...","..##############..",".################.",".################.",".################.",".################.",".################.",".################.",".################.",".################.",".################.","..##############.."]},
  },
  moicano:{
    F:{o:0,m:["........##........",".......####.......",".......####.......",".......####.......",".......####.......",".......####.......","........##........"]},
    S:{o:0,m:["........#####.....","......#######.....","....#########.....","...##########.....","...##.............","..##..............","..##..............","..#..............."]},
    B:{o:0,m:["........##........",".......####.......",".......####.......",".......####.......",".......####.......",".......####.......",".......####.......",".......####.......",".......####.......",".......####.......",".......####.......",".......####.......",".......####.......",".......####.......","........##........"]},
  },
  afro:{afro:true},
  careca:{},
};
const CHAPEUS={
  capuz:{mat:'chapeu',corte:7,
    F:{o:1,m:["......aaaaaa......","....aaaaaaaaaa....","...aaaaaaaaaaaa...","..aaaaaaaaaaaaaa..",".aaaaaaaaaaaaaaaa.",".aaaaaaaaaaaaaaaa.",".aaaa........aaaa.",".aaa..........aaa.",".aa............aa.",".aa............aa.",".aa............aa.",".aa............aa.",".aa............aa.",".aaa..........aaa.",".aaaa........aaaa.","..aaaaaaaaaaaaaa.."]},
    S:{o:1,m:[".....aaaaaa.......","...aaaaaaaaaa.....","..aaaaaaaaaaaa....",".aaaaaaaaaaaaaa...",".aaaaaaaaaaaaaaa..",".aaaaaaaaaaaaaaa..",".aaaaaaaaa........",".aaaaaaaa.........",".aaaaaaaa.........",".aaaaaaaa.........",".aaaaaaaa.........",".aaaaaaaa.........",".aaaaaaaaa........",".aaaaaaaaa........","..aaaaaaaaa.......","..aaaaaaaaaa......"]},
    B:{o:1,m:["......aaaaaa......","....aaaaaaaaaa....","...aaaaaaaaaaaa...","..aaaaaaaaaaaaaa..",".aaaaaaaaaaaaaaaa.",".aaaaaaaaaaaaaaaa.",".aaaaaaaaaaaaaaaa.",".aaaaaaaaaaaaaaaa.",".aaaaaaaaaaaaaaaa.",".aaaaaaaaaaaaaaaa.",".aaaaaaaaaaaaaaaa.",".aaaaaaaaaaaaaaaa.",".aaaaaaaaaaaaaaaa.",".aaaaaaaaaaaaaaaa.",".aaaaaaaaaaaaaaaa.","..aaaaaaaaaaaaaa..","....aaaaaaaaaa....","......aaaaaa......"]}},
  mago:{mat:'chapeu',corte:7,
    F:{o:-2,m:["...........aa.....","..........aaa.....","........aaaaa.....",".......aaaaaa.....","......aaaaaaaa....","....aaaaaaaaaa....","...gggggggggggg...","aaaaaaaaaaaaaaaaaa",".aaaaaaaaaaaaaaaa."]},
    S:{o:-2,m:["..aa..............","..aaa.............","...aaaaa..........","...aaaaaa.........","....aaaaaaaa......","....aaaaaaaaaa....","...gggggggggggg...","aaaaaaaaaaaaaaaaaa","..aaaaaaaaaaaaaa.."]}},
  elmo:{mat:'metal',escondeCabelo:true,escondeRosto:true,
    F:{o:2,m:["........bb........",".....aaaAaaaa.....","...aaaaaAaaaaaa...","..aaaaaaAaaaaaaa..",".aaaaaaaAaaaaaaaa.",".aaaaaaaAaaaaaaaa.",".aaaaaaaAaaaaaaaa.",".aaaaaaaAaaaaaaaa.",".aaa==========aaa.",".aaaaaaa==aaaaaaa.",".aaaaaaa==aaaaaaa.",".aaaaaaaaaaaaaaaa.","..ddddddddddddddd.","...dddddddddddd..."]},
    S:{o:2,m:[".......bb.........",".....aaaaaaa......","...aaaaAAAaaa.....","..aaaaaaaaaaaa....",".aaaaaaaaaaaaaa...",".aaaaaaaaaaaaaaa..",".aaaaaaaaaaaaaaa..",".aaaaaaaaaaaaaaa..",".aaaaaaaaa=====a..",".aaaaaaaaaaaaaaa..",".aaaaaaaaaaaaaaa..",".aaaaaaaaaaaaaaa..","..ddddddddddddd...","...ddddddddddd...."]},
    B:{o:2,m:["........bb........",".....aaaAaaaa.....","...aaaaaAaaaaaa...","..aaaaaaAaaaaaaa..",".aaaaaaaAaaaaaaaa.",".aaaaaaaAaaaaaaaa.",".aaaaaaaAaaaaaaaa.",".aaaaaaaAaaaaaaaa.",".aaaaaaaAaaaaaaaa.",".aaaaaaaaaaaaaaaa.",".aaaaaaaaaaaaaaaa.",".aaaaaaaaaaaaaaaa.","..ddddddddddddddd.","...dddddddddddd..."]}},
  viking:{mat:'metal',corte:9,
    F:{o:0,m:[".h..............h.",".hh............hh.","..hh..........hh..","..hhh.aaaaaa.hhh..","...hhaaaaaaaahh...","..aaaaaaaaaaaaaa..",".aaaaaaaaaaaaaaaa.",".aaaaaaaaaaaaaaaa.",".gggggggggggggggg."]},
    S:{o:0,m:["...h..............","...hh.............","....hh............","....hhhaaaaa......","...aaaaaaaaaaa....","..aaaaaaaaaaaaa...",".aaaaaaaaaaaaaaa..",".aaaaaaaaaaaaaaa..",".ggggggggggggggg.."]}},
  coroa:{mat:'ouro',corte:0,
    F:{o:1,m:["....a...aa...a....","....aa.aaaa.aa....","....aaaaaaaaaa....","....ajaajjaaja...."]},
    S:{o:1,m:["....a...a...a.....","....aa.aaa.aa.....","....aaaaaaaaa.....","....ajaaajaaa....."]}},
  bandana:{mat:'chapeu',corte:9,
    F:{o:3,m:[".....aaaaaaaa.....","...aaaaaaaaaaaa...","..aaaaaaaaaaaaaa..",".aaaaaaaaaaaaaaaa.",".aaaaaaaaaaaaaaaa.",".daaaaaaaaaaaaaad."]},
    S:{o:3,m:[".....aaaaaaa......","...aaaaaaaaaa.....","..aaaaaaaaaaaa....",".aaaaaaaaaaaaaa...","aaaaaaaaaaaaaaaa..","aaaaaaaaaaaaaaa...","aa................","a.a...............","a..a.............."]},
    B:{o:3,m:[".....aaaaaaaa.....","...aaaaaaaaaaaa...","..aaaaaaaaaaaaaa..",".aaaaaaaaaaaaaaaa.",".aaaaaaaaaaaaaaaa.",".aaaaaaaaaaaaaaaa.",".......aaaa.......","......aa..aa......","......a....a......"]}},
  chapeu:{mat:'chapeu',corte:7,
    F:{o:0,m:["......aaaaaa......",".....aaaaaaaa.....","....aaaaaaaaaa....","....aaaaaaaaaa....","....bbbbbbbbbb....","aaaaaaaaaaaaaaaaaa",".aaaaaaaaaaaaaaaa."]},
    S:{o:0,m:[".....aaaaaa.......","....aaaaaaaa......","...aaaaaaaaaa.....","...aaaaaaaaaa.....","...bbbbbbbbbb.....","aaaaaaaaaaaaaaaaa.",".aaaaaaaaaaaaaaa.."]}},
};
const BARBAS={
  curta:{F:{o:11,m:["..#............#..","..##..........##..","..###.#....#.###..","...############...","....##########....",".....########....."]},
         S:{o:11,m:["........#.........","........##........","........###.#.....",".........######...","..........####...."]}},
  longa:{F:{o:11,m:["..#............#..","..##.###..###.##..","..####......####..","..##############..","...############...","...############...","....##########....","....##########....",".....########.....","......######......",".......####.......","........##........"]},
         S:{o:11,m:["........#.........","........##..###...","........####.#....",".........######...",".........#######..","..........######..","..........#####...","...........####...","............##...."]}},
  bigode:{F:{o:12,m:[".....###..###.....","....##......##...."]},S:{o:12,m:["............###...",".............#...."]}},
};
const CHIFRES={F:{o:1,m:["..#............#..","..##..........##..","...##........##...","...##........##..."]},S:{o:1,m:["....#.............","....##............",".....##...........",".....##..........."]}};

function geoPers(p){const R=RACAS[p.raca]||RACAS.humano,f=p.fisico==='forte';
  return{D:R.baixo?2:0,forte:f,tx0:f?10:11,tx1:f?21:20,aw:f?3:2,lx:f?[11,18]:[12,17],lw:f?4:3,sx0:f?11:12,sx1:f?20:19}}

/* ---------- poses ---------- */
const P_ANIMS=[{id:'parado',n:2,fps:3},{id:'andar',n:4,fps:8},{id:'atacar',n:4,fps:10},{id:'dano',n:2,fps:6}];
const P_DIRS=['baixo','esquerda','direita','cima'];
function armaRepouso(p,dir){const a=p.arma;
  if(dir==='direita')return{ang:{espada:-25,adaga:35,machado:-45,martelo:-45,lanca:-100,cajado:-95,arco:90}[a]??0};
  if(dir==='baixo')return{ang:{espada:-120,adaga:100,machado:-118,martelo:-118,lanca:-110,cajado:-110,arco:-90}[a]??0};
  return{ang:{espada:-80,adaga:80,machado:-80,martelo:-80,lanca:-88,cajado:-88,arco:90}[a]??0}}
function posePers(p,dir,anim,f){
  const P={by:0,bx:0,legs:[0,0],arms:[{x:0,y:0},{x:0,y:0}],fl:{x:0,lift:0},bl:{x:0,lift:0},fa:{x:0,y:0},ba:{x:0,y:0},w:null,olhos:null,boca:null,sway:0};
  const lado=dir==='direita';
  if(anim==='parado')P.by=f%2;
  else if(anim==='andar'){const st=[0,1,0,-1][f%4];P.by=st?1:0;P.sway=st;
    if(lado){P.fl={x:st*3,lift:f===2?1:0};P.bl={x:-st*3,lift:f===0?1:0};P.fa={x:-st*2,y:0};P.ba={x:st*2,y:0}}
    else{P.legs=[st===1?1:0,st===-1?1:0];P.arms=[{x:0,y:-st},{x:0,y:st}]}}
  else if(anim==='dano'){P.olhos='dor';P.boca='aberta';if(lado){P.bx=-1;P.fa={x:-2,y:-2};P.ba={x:-1,y:-1}}else{P.by=-1;P.arms=[{x:-1,y:-2},{x:1,y:-2}]}}
  else if(anim==='atacar')ataquePers(p,dir,f,P);
  if(!P.w)P.w=armaRepouso(p,dir);else if(P.w.ang===undefined)P.w.ang=armaRepouso(p,dir).ang;
  return P;
}
function ataquePers(p,dir,f,P){
  const a=p.arma,lado=dir==='direita',frente=dir==='baixo';
  if(['espada','machado','martelo','adaga'].includes(a)){
    if(lado){const K=[{fa:{x:-3,y:-6},ang:-150,bx:-1},{fa:{x:0,y:-8},ang:-90,bx:0},{fa:{x:4,y:-3},ang:-10,bx:1,r:[-150,-10]},{fa:{x:3,y:0},ang:40,bx:1}][f];
      P.fa=K.fa;P.bx=K.bx;P.w={ang:K.ang,rastro:K.r};P.ba={x:[2,1,-2,-1][f],y:0}}
    else if(frente){const K=[{a:{x:1,y:-9},ang:-60},{a:{x:0,y:-7},ang:-150},{a:{x:0,y:-1},ang:115,r:[-150,115]},{a:{x:0,y:0},ang:100}][f];
      P.arms[0]=K.a;P.w={ang:K.ang,rastro:K.r}}
    else{const K=[{a:{x:0,y:-2},ang:70},{a:{x:0,y:-8},ang:-80},{a:{x:-1,y:-9},ang:-130,r:[70,-130]},{a:{x:0,y:-5},ang:-150}][f];
      P.arms[1]=K.a;P.w={ang:K.ang,rastro:K.r}}
  }else if(a==='lanca'){
    if(lado){const K=[{fa:{x:-2,y:-2},bx:-1},{fa:{x:-4,y:-2},bx:-1},{fa:{x:5,y:-2},bx:1,l:1},{fa:{x:3,y:-1},bx:1}][f];P.fa=K.fa;P.bx=K.bx;P.w={ang:0,linhas:K.l};P.ba={x:[1,2,-1,0][f],y:-1}}
    else if(frente){const K=[{a:{x:0,y:-3},ang:-90},{a:{x:0,y:-5},ang:-90},{a:{x:0,y:2},ang:100,l:1},{a:{x:0,y:0},ang:95}][f];P.arms[0]=K.a;P.w={ang:K.ang,linhas:K.l}}
    else{const K=[{a:{x:0,y:0},ang:-90},{a:{x:0,y:1},ang:-90},{a:{x:0,y:-6},ang:-90,l:1},{a:{x:0,y:-3},ang:-90}][f];P.arms[1]=K.a;P.w={ang:K.ang,linhas:K.l}}
  }else if(a==='arco'){
    const pux=[0,2,3,0][f],fl=f===1||f===2;
    if(lado){P.fa={x:[3,4,4,4][f],y:-3};P.ba={x:[2,0,-1,1][f],y:[-2,-3,-3,-2][f]};P.w={ang:90,puxar:pux,flecha:fl,disparo:f===3}}
    else if(frente){P.arms[0]={x:0,y:[-1,-2,-2,-1][f]};P.arms[1]={x:-1,y:[-1,-2,-2,0][f]};P.w={ang:-90,puxar:pux,flecha:fl}}
    else{P.arms[1]={x:0,y:[-1,-2,-2,-1][f]};P.arms[0]={x:1,y:[-1,-2,-2,0][f]};P.w={ang:90,puxar:pux,flecha:fl}}
  }else if(a==='cajado'){
    const mg=[0,1,2,0][f];
    if(lado){P.fa={x:[1,2,3,1][f],y:[-4,-7,-7,-3][f]};P.w={ang:[-80,-75,-70,-85][f],magia:mg}}
    else if(frente){P.arms[0]={x:0,y:[-3,-6,-7,-2][f]};P.w={ang:-92,magia:mg}}
    else{P.arms[1]={x:0,y:[-3,-6,-7,-2][f]};P.w={ang:-88,magia:mg}}
  }else{
    if(lado){P.fa={x:[-2,-3,5,3][f],y:[-1,-1,-2,-1][f]};P.bx=[0,-1,1,1][f];P.ba={x:[1,1,-2,-1][f],y:0};P.w={impacto:f===2}}
    else if(frente){P.arms[0]={x:[0,0,1,0][f],y:[-1,-2,2,1][f]};P.w={impacto:f===2}}
    else{P.arms[1]={x:[0,0,-1,0][f],y:[-1,-2,-5,-3][f]};P.w={impacto:f===2}}
  }
}

/* ---------- armas e escudos ---------- */
function desenharArma(fig,tipo,gx,gy,w){
  if(!tipo||tipo==='nenhuma')return{};
  const a=(w.ang||0)*Math.PI/180,cu=Math.cos(a),su=Math.sin(a);
  const T=(u,v)=>[gx+u*cu-v*su,gy+u*su+v*cu];
  const nx=-su,ny=cu,off=Math.abs(nx)>Math.abs(ny)+.01?[Math.sign(nx),0]:[0,Math.sign(ny)||1];
  const L=(pt,u0,v0,u1,v1,s,k=0)=>{const A=T(u0,v0),B=T(u1,v1);pt.line(A[0]+off[0]*k,A[1]+off[1]*k,B[0]+off[0]*k,B[1]+off[1]*k,s)};
  const info={};
  if(tipo==='espada'||tipo==='adaga'){const n=tipo==='espada'?10:5;
    L(fig.parte('couro',{plano:true}),-1,0,0,0,0);
    const o=fig.parte('ouro',{plano:true});L(o,-2,0,-2,0,1);L(o,1,-2,1,2,0);
    const l=fig.parte('metal',{plano:true});L(l,2,0,n+1,0,1);L(l,2,0,n,0,-1,1);info.ponta=T(n+1,0);
  }else if(tipo==='machado'){
    L(fig.parte('madeira',{plano:true}),-2,0,9,0,0);
    const m=fig.parte('metal',{plano:true});for(let k=1;k<=3;k++)L(m,6,0,9,0,k===3?-1:0,k);L(m,5,0,10,0,1,4);L(m,7,0,8,0,-1,-1);info.ponta=T(10,2);
  }else if(tipo==='martelo'){
    L(fig.parte('madeira',{plano:true}),-2,0,8,0,0);
    const m=fig.parte('metal',{plano:true});for(let k=-2;k<=2;k++)L(m,8,0,11,0,k===-2?1:k===2?-1:0,k);info.ponta=T(11,0);
  }else if(tipo==='lanca'){
    L(fig.parte('madeira',{plano:true}),-7,0,12,0,0);
    const m=fig.parte('metal',{plano:true});L(m,13,0,16,0,1);L(m,13,0,14,0,-1,1);L(m,13,0,14,0,0,-1);info.ponta=T(16,0);
  }else if(tipo==='cajado'){
    L(fig.parte('madeira',{plano:true}),-7,0,9,0,0);
    const pr=fig.parte('madeira',{plano:true});const A=T(9,-1.5),B=T(9,1.5);pr.px(A[0],A[1],1).px(B[0],B[1],-1);
    const c=T(11,0);fig.parte('gema',{}).ell(c[0]+.5,c[1]+.5,1.8,1.8);fig.brilho(c[0]-1,c[1]-1,'#ffffff');info.orbe=c;
  }else if(tipo==='arco'){
    const lim=fig.parte('madeira',{plano:true});let prev=null;
    for(let k=-7;k<=7;k++){const t=k/7,P=T(t*7,-2.4*(1-t*t));if(prev)lim.line(prev[0],prev[1],P[0],P[1],k<0?1:0);prev=P}
    const cd=fig.parte('corda',{plano:true}),d=w.puxar||0,A=T(-7,0),B=T(7,0),M=T(0,d);
    if(d){cd.line(A[0],A[1],M[0],M[1],0);cd.line(M[0],M[1],B[0],B[1],0)}else cd.line(A[0],A[1],B[0],B[1],0);
    if(w.flecha){const P=T(0,-6);L(fig.parte('madeira',{plano:true}),0,d,0,-5,1);fig.parte('metal',{plano:true}).px(P[0],P[1],1);fig.parte('roupa2',{plano:true}).px(M[0],M[1],0)}
    info.ponta=T(0,-7);
  }
  return info;
}
function desenharEscudo(fig,p,cx,cy,costas){
  if(!p.escudo||p.escudo==='nenhum')return;
  const aro=fig.parte('metal',{}),fr=fig.parte(costas?'madeira':'escudo',{});
  if(p.escudo==='redondo'){aro.ell(cx+.5,cy+.5,3.6,4.1);fr.ell(cx+.5,cy+.5,2.6,3.1);if(!costas)fig.parte('ouro',{plano:true}).px(cx,cy,1)}
  else{const pts=d=>[[cx-3+d,cy-4+d],[cx+4-d,cy-4+d],[cx+4-d,cy+1],[cx+.5,cy+5.4-d*1.4],[cx-3+d,cy+1]];aro.poly(pts(0));fr.poly(pts(1));
    if(!costas)fig.parte('roupa2',{plano:true}).rect(cx,cy-2,1,5,0).rect(cx-1,cy-1,3,1,0)}
}
function efeitosArma(fig,w,info,ombro){
  if(w.rastro){const[a0,a1]=w.rastro;const d=((a1-a0+540)%360)-180,n=Math.ceil(Math.abs(d)/5),r=12;
    for(let k=0;k<=n;k++){const a=(a0+d*k/n)*Math.PI/180;fig.brilho(ombro[0]+Math.cos(a)*r,ombro[1]+Math.sin(a)*r,'#ffffffd8',true);fig.brilho(ombro[0]+Math.cos(a)*(r-1),ombro[1]+Math.sin(a)*(r-1),'#bfe0ffa0',true)}}
  if(w.magia&&info.orbe){const[cx,cy]=info.orbe;
    for(let k=0;k<8;k++){const a=k*Math.PI/4;fig.brilho(cx+Math.cos(a)*3,cy+Math.sin(a)*3,'#fff6c8e0',true)}
    if(w.magia>1)for(let k=0;k<8;k++){const a=k*Math.PI/4+Math.PI/8;fig.brilho(cx+Math.cos(a)*5.2,cy+Math.sin(a)*5.2,'#ffffffc8',true)}}
  if(w.linhas&&info.ponta){const[x,y]=info.ponta;const a=(w.ang||0)*Math.PI/180;for(const k of[-2,2])for(let s=2;s<6;s++)fig.brilho(x-Math.cos(a)*s*2-Math.sin(a)*k,y-Math.sin(a)*s*2+Math.cos(a)*k,'#ffffffa8',true)}
  if(w.disparo&&info.ponta){const[x,y]=info.ponta;for(let s=1;s<6;s++)fig.brilho(x+s,y,'#ffffffb0',true)}
}
function estrela(fig,x,y){fig.brilho(x,y,'#ffffff');for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){fig.brilho(x+dx,y+dy,'#fff3b0');fig.brilho(x+2*dx,y+2*dy,'#ffd76ad0')}}

/* ---------- camadas de cabeça ---------- */
function cabeloCamada(fig,p,cam,gx,gy,ch){
  let est=CABELOS[p.cabelo];if(!est)return;
  if(est.afro&&ch&&p.chapeu!=='coroa')est=CABELOS.curto; // black power some dentro de chapéus
  const princ=cam.length===1;
  if(ch&&ch.escondeCabelo&&princ)return;
  if(est.afro){afroCamada(fig,p,cam,gx,gy,ch);return}
  const def=est[cam];if(!def)return;
  const pt=fig.parte('cabelo',princ?{projeta:1}:{escuro:-1});pt.mask(def.m,gx,gy,def.o);
  if(ch&&ch.corte&&princ)for(let y=0;y<gy+ch.corte;y++)for(let x=0;x<32;x++)pt.del(x,y);
}
function afroCamada(fig,p,cam,gx,gy,ch){
  const cx=gx+9,top=gy+4;
  if(cam==='FB')fig.parte('cabelo',{escuro:-1}).ell(cx,top+3,10.2,8);
  else if(cam==='SB')fig.parte('cabelo',{escuro:-1}).ell(cx-2,top+3,9.5,8);
  else if(cam==='F'||cam==='S'){if(ch&&ch.escondeCabelo)return;const pt=fig.parte('cabelo',{projeta:1});pt.ell(cam==='S'?cx-1:cx,top+1,cam==='S'?7.8:8.5,4.6);
    for(let y=top+5;y<32;y++)for(let x=0;x<32;x++)pt.del(x,y);if(ch&&ch.corte)for(let y=0;y<gy+ch.corte;y++)for(let x=0;x<32;x++)pt.del(x,y)}
  else if(cam==='B'){if(ch&&ch.escondeCabelo)return;fig.parte('cabelo',{}).ell(cx,top+4,10,9)}
}
function chapeuCamada(fig,p,vis,gx,gy){
  const ch=CHAPEUS[p.chapeu];if(!ch)return;
  const def=ch[vis]||ch.F,mats={a:[ch.mat,null],A:[ch.mat,1],d:[ch.mat,-1],'=':[ch.mat,-2],g:['ouro',null],j:['gema',null],b:['roupa2',null],h:['osso',null]};
  const parts={};
  def.m.forEach((row,r)=>{for(let c=0;c<row.length;c++){const mm=mats[row[c]];if(!mm)continue;
    if(!parts[mm[0]])parts[mm[0]]=fig.parte(mm[0],{projeta:mm[0]===ch.mat?1:0});parts[mm[0]].px(gx+c,gy+def.o+r,mm[1])}});
}
function maskCamada(fig,mat,def,gx,gy,o){if(def)fig.parte(mat,o||{}).mask(def.m,gx,gy,def.o)}
function orelhas(head,R,hy,bx,frente){
  const o=R.orelha;if(o==='nenhuma')return;
  const L=[],add=(x,y)=>{L.push([x,y])};
  if(o==='normal'){add(8,hy+6);add(8,hy+7)}
  else if(o==='elfo'){add(8,hy+6);add(8,hy+7);add(7,hy+6);add(7,hy+5);add(6,hy+4)}
  else if(o==='pontuda'){add(8,hy+6);add(8,hy+7);add(7,hy+6);add(7,hy+5)}
  else if(o==='goblin'){for(let y=hy+5;y<=hy+8;y++)add(8,y);for(let y=hy+5;y<=hy+7;y++)add(7,y);add(6,hy+5);add(6,hy+6);add(5,hy+5);add(4,hy+4)}
  for(const[x,y]of L){head.px(x+bx,y);head.px(31-x+bx,y)}
}
function rostoFrente(fig,p,ps,hy,bx){
  const R=RACAS[p.raca]||RACAS.humano,e=ps.olhos||p.olhos,D=OLHO_ESCURO,I=p.corOlhos,W='#ffffff',ey=hy+6,pl=ramp(p.pele,'pele');
  const d=fig.parte('pele',{plano:true}),L=12+bx,Rx=19+bx;
  if(e==='normal')for(const x of[L,Rx]){d.dot(x,ey,D);d.dot(x,ey+1,I)}
  else if(e==='grande')for(const x of[L-1,Rx]){d.dot(x,ey-1,D);d.dot(x+1,ey-1,D);d.dot(x,ey,W);d.dot(x+1,ey,D);d.dot(x,ey+1,I);d.dot(x+1,ey+1,I)}
  else if(e==='fofo')for(const x of[L-1,Rx]){d.dot(x,ey,W);d.dot(x+1,ey,D);d.dot(x,ey+1,D);d.dot(x+1,ey+1,D)}
  else if(e==='fechado')for(const x of[L-1,Rx-1]){d.dot(x,ey+1,D);d.dot(x+1,ey,D);d.dot(x+2,ey+1,D)}
  else if(e==='bravo'){for(const x of[L,Rx]){d.dot(x,ey,D);d.dot(x,ey+1,I)}d.dot(L-1,ey-2,D);d.dot(L,ey-1,D);d.dot(Rx+1,ey-2,D);d.dot(Rx,ey-1,D)}
  else if(e==='brilho'){for(const x of[L-1,Rx])for(let k=0;k<2;k++){d.dot(x+k,ey,D);d.dot(x+k,ey+1,D)}d.dot(L,ey,I);d.dot(Rx,ey,I);fig.brilho(L,ey,I);fig.brilho(Rx,ey,I)}
  else if(e==='dor')for(const x of[L-1,Rx-1]){d.dot(x,ey,D);d.dot(x+1,ey+1,D);d.dot(x+2,ey,D)}
  if(R.caveira){d.dot(15+bx,hy+8,D);d.dot(16+bx,hy+8,D)}
  const b=ps.boca||p.boca,my=hy+9+(R.caveira?1:0);
  if(b==='normal'){d.dot(15+bx,my,pl[0]);d.dot(16+bx,my,pl[0])}
  else if(b==='sorriso'){d.dot(14+bx,my,pl[1]);d.dot(15+bx,my+1,pl[0]);d.dot(16+bx,my+1,pl[0]);d.dot(17+bx,my,pl[1])}
  else if(b==='serio'){d.dot(15+bx,my,pl[1]);d.dot(16+bx,my,pl[1])}
  else if(b==='aberta'){d.dot(15+bx,my,'#4a1626');d.dot(16+bx,my,'#4a1626');d.dot(15+bx,my+1,'#b8404e');d.dot(16+bx,my+1,'#b8404e')}
  else if(b==='presas'){d.dot(15+bx,my,pl[0]);d.dot(16+bx,my,pl[0]);for(const x of[14,17]){d.dot(x+bx,my,'#f4ecd8');d.dot(x+bx,my-1,'#f4ecd8')}}
  else if(b==='dentes'){['#f4ecd8',D,'#f4ecd8','#f4ecd8',D,'#f4ecd8'].forEach((c,i)=>d.dot(13+i+bx,my,c))}
  if(p.blush&&!R.caveira){const bc=mix(p.pele,'#ff5c86',.42);d.dot(11+bx,hy+8,bc);d.dot(20+bx,hy+8,bc)}
}
function rostoLado(fig,p,ps,hy,bx){
  const R=RACAS[p.raca]||RACAS.humano,e=ps.olhos||p.olhos,D=OLHO_ESCURO,I=p.corOlhos,W='#ffffff',ey=hy+6,x=18+bx,pl=ramp(p.pele,'pele');
  const d=fig.parte('pele',{plano:true});
  if(e==='normal'){d.dot(x,ey,D);d.dot(x,ey+1,I)}
  else if(e==='grande'){d.dot(x,ey-1,D);d.dot(x+1,ey-1,D);d.dot(x,ey,W);d.dot(x+1,ey,D);d.dot(x,ey+1,I);d.dot(x+1,ey+1,I)}
  else if(e==='fofo'){d.dot(x,ey,W);d.dot(x+1,ey,D);d.dot(x,ey+1,D);d.dot(x+1,ey+1,D)}
  else if(e==='fechado'){d.dot(x-1,ey+1,D);d.dot(x,ey,D);d.dot(x+1,ey+1,D)}
  else if(e==='bravo'){d.dot(x,ey,D);d.dot(x,ey+1,I);d.dot(x-1,ey-2,D);d.dot(x,ey-1,D)}
  else if(e==='brilho'){for(let k=0;k<2;k++){d.dot(x+k,ey,D);d.dot(x+k,ey+1,D)}d.dot(x+1,ey,I);fig.brilho(x+1,ey,I)}
  else if(e==='dor'){d.dot(x-1,ey,D);d.dot(x,ey+1,D);d.dot(x-1,ey+2,D)}
  if(R.caveira)d.dot(21+bx,hy+8,D);
  const b=ps.boca||p.boca,my=hy+9+(R.caveira?1:0),mx=20+bx;
  if(b==='normal'||b==='serio')d.dot(mx,my,b==='normal'?pl[0]:pl[1]);
  else if(b==='sorriso'){d.dot(mx,my,pl[0]);d.dot(mx-1,my-1,pl[1])}
  else if(b==='aberta'){d.dot(mx,my,'#4a1626');d.dot(mx,my+1,'#b8404e')}
  else if(b==='presas'){d.dot(mx,my,pl[0]);d.dot(mx-1,my,'#f4ecd8');d.dot(mx-1,my-1,'#f4ecd8')}
  else if(b==='dentes'){d.dot(mx-1,my,'#f4ecd8');d.dot(mx,my,D);d.dot(mx+1,my,'#f4ecd8')}
  if(p.blush&&!R.caveira)d.dot(19+bx,hy+8,mix(p.pele,'#ff5c86',.42));
}

/* ---------- corpo ---------- */
function roupaTronco(fig,p,g,y0,bx,frente,lado){
  const x0=lado?g.sx0:g.tx0,x1=lado?g.sx1:g.tx1,w=x1-x0+1;
  const t=fig.parte(p.roupa==='armadura'?'metal':'roupa',{});t.rect(x0+bx,y0,w,7);
  if(p.roupa==='armadura'){t.hl(y0+3,x0+bx,x1+bx,-1);if(frente&&!lado){t.px(15+bx,y0+1,1);t.px(16+bx,y0+1,1)}}
  if(p.roupa==='manto'){const s=fig.parte('roupa',{});
    if(lado)s.poly([[x0+bx,y0+6],[x1+1+bx,y0+6],[x1+2+bx,30],[x0-2+bx,30]]);else s.poly([[x0+bx,y0+6],[x1+1+bx,y0+6],[x1+2+bx,30],[x0-1+bx,30]]);
    const h=fig.parte('roupa2',{grad:false});h.hl(29,lado?x0-2+bx:x0-1+bx,x1+1+bx)}
  if(p.roupa==='vestido'){const s=fig.parte('roupa',{});s.poly([[x0+bx,y0+6],[x1+1+bx,y0+6],[x1+3+bx,27],[x0-2+bx,27]]);fig.parte('roupa2',{grad:false}).hl(26,x0-2+bx,x1+2+bx)}
  if(frente&&!lado){
    if(p.roupa==='tunica'||p.roupa==='manto'||p.roupa==='vestido')fig.parte('pele',{plano:true}).px(15+bx,y0,-1).px(16+bx,y0,-1);
    if(p.roupa==='regata')fig.parte('pele',{plano:true}).hl(y0,14+bx,17+bx,-1);
  }
  if(p.roupa==='couro'&&!lado&&frente)fig.parte('cinto',{plano:true}).line(x0+1+bx,y0,x1-1+bx,y0+5,0);
  if(p.cinto&&p.roupa!=='vestido'){fig.parte('cinto',{grad:false}).hl(y0+6,x0+bx,x1+bx);if(frente||lado){const bxk=lado?x1-1+bx:15+bx;fig.parte('ouro',{plano:true}).px(bxk,y0+6,1).px(bxk+1,y0+6,0)}}
  if(p.capa!=='nenhuma'&&frente&&!lado)fig.parte('ouro',{plano:true}).px(x0+1+bx,y0,1).px(x1-1+bx,y0,1);
}

function frentePers(fig,p,ps,frente){
  const g=geoPers(p),R=RACAS[p.raca]||RACAS.humano,D=g.D,bx=ps.bx,by=ps.by;
  const hy=5+D+by,y0=17+D+by,hip=24+D,gx=7+bx,gy=hy-4,ch=CHAPEUS[p.chapeu]||null;
  const manga=p.roupa==='regata'?'pele':'roupa',mao=p.roupa==='armadura'?'metal':'pele';
  const armaI=frente?0:1;
  const braco=i=>{const a=ps.arms[i],x=(i===0?g.tx0-g.aw:g.tx1+1)+bx;return{a,w:g.aw,sx:x+(g.aw-1)/2,hx:Math.round(x+a.x),hy:y0+5+a.y}};
  const B=[braco(0),braco(1)],alto=i=>ps.arms[i].y<-3;
  const desenhaManga=i=>{const b=B[i];const s=fig.parte(manga,{});s.bar(b.sx,y0,b.sx+b.a.x,y0+4+b.a.y,b.w);
    if(p.roupa==='manto')s.rect(i===0?b.hx-1:b.hx,y0+3+b.a.y,b.w+1,2)};
  const desenhaMao=i=>{const b=B[i];fig.parte(mao,{grad:false}).rect(b.hx,b.hy,b.w,2)};
  const capa=()=>{if(p.capa==='nenhuma')return;const cb=p.capa==='longa'?28:y0+8,c=fig.parte('capa',{});
    if(frente)c.poly([[g.tx0-2+bx,y0],[g.tx1+3+bx,y0],[g.tx1+4+bx+ps.sway,cb],[g.tx0-3+bx+ps.sway,cb]]);
    else c.poly([[g.tx0-1+bx,y0],[g.tx1+2+bx,y0],[g.tx1+2+bx+ps.sway,cb],[g.tx0-1+bx+ps.sway,cb]])};
  let info={};const ombro=[B[armaI].sx,y0+1];
  const arma=()=>{const b=B[armaI];info=desenharArma(fig,p.arma,b.hx+(b.w>2?1:0),b.hy,ps.w)};

  if(frente){capa();cabeloCamada(fig,p,'FB',gx,gy,ch)}
  else{if(p.arma!=='nenhuma')arma();desenharEscudo(fig,p,B[0].hx+(g.aw>2?1:0),y0+4+B[0].a.y,true)}
  for(let i=0;i<2;i++){const lift=ps.legs[i],lx=g.lx[i],top=Math.min(hip,y0+6);
    fig.parte('calca',{grad:false}).rect(lx,top,g.lw,28-lift-top);
    const bt=fig.parte('bota',{grad:false}),x0=i===0?lx-1:lx;bt.rect(x0,28-lift,g.lw+1,3);bt.del(i===0?x0:x0+g.lw,28-lift)}
  roupaTronco(fig,p,g,y0,bx,frente,false);
  for(let i=0;i<2;i++)if(!alto(i))desenhaManga(i);
  if(!frente){for(let i=0;i<2;i++)if(!alto(i))desenhaMao(i);capa()}
  const head=fig.parte('pele',{projeta:1});head.rrect(9+bx,hy,14,12,4,4);orelhas(head,R,hy,bx,frente);
  if(p.cabelo==='careca'&&!ch){head.px(12+bx,hy+1,1).px(13+bx,hy+1,1)}
  if(frente){
    if(!(ch&&ch.escondeRosto))rostoFrente(fig,p,ps,hy,bx);
    if(p.barba!=='nenhuma'&&!(ch&&ch.escondeRosto))maskCamada(fig,'cabelo',(BARBAS[p.barba]||{}).F,gx,gy);
    cabeloCamada(fig,p,'F',gx,gy,ch);
  }else cabeloCamada(fig,p,'B',gx,gy,ch);
  if(R.chifres)maskCamada(fig,'osso',CHIFRES.F,gx,gy);
  chapeuCamada(fig,p,frente?'F':'B',gx,gy);
  for(let i=0;i<2;i++)if(alto(i))desenhaManga(i);
  if(frente){if(p.arma!=='nenhuma')arma();for(let i=0;i<2;i++)desenhaMao(i);desenharEscudo(fig,p,B[1].hx+(g.aw>2?1:0),y0+4+B[1].a.y,false)}
  else for(let i=0;i<2;i++)if(alto(i))desenhaMao(i);
  efeitosArma(fig,ps.w,info,ombro);
  if(ps.w.impacto){const b=B[armaI];estrela(fig,b.hx+(frente?0:1),b.hy+(frente?3:-3))}
}

function ladoPers(fig,p,ps){
  const g=geoPers(p),R=RACAS[p.raca]||RACAS.humano,D=g.D,bx=ps.bx,by=ps.by;
  const hy=5+D+by,y0=17+D+by,hip=24+D,gx=7+bx,gy=hy-4,ch=CHAPEUS[p.chapeu]||null;
  const manga=p.roupa==='regata'?'pele':'roupa',mao=p.roupa==='armadura'?'metal':'pele',sx=15.5+bx;
  if(p.capa!=='nenhuma'){const cb=p.capa==='longa'?28:y0+8,sw=Math.abs(ps.sway);
    fig.parte('capa',{}).poly([[g.sx0-1+bx,y0],[g.sx0+3+bx,y0],[g.sx0+2+bx-sw,cb],[g.sx0-4+bx-sw,cb]])}
  cabeloCamada(fig,p,'SB',gx,gy,ch);
  if(p.escudo!=='nenhum'){const e=fig.parte('metal',{});e.ell(g.sx1+2+bx,y0+4,1.6,4.2);fig.parte('escudo',{}).ell(g.sx1+1.6+bx,y0+4,1,3.2)}
  const ba=ps.ba;
  fig.parte(manga,{escuro:-1}).bar(sx,y0+1,sx+ba.x,y0+5+ba.y,g.aw);fig.parte(mao,{escuro:-1,grad:false}).rect(Math.round(sx+ba.x-(g.aw-1)/2),y0+5+ba.y,g.aw,2);
  const perna=(L,esc)=>{const top=Math.min(hip,y0+6),ax=15.5+L.x;
    fig.parte('calca',{escuro:esc,grad:false}).bar(15.5,top,ax,27-L.lift,g.lw);
    const b0=Math.round(ax-g.lw/2),bt=fig.parte('bota',{escuro:esc,grad:false});bt.rect(b0,28-L.lift,g.lw,1);bt.rect(b0,29-L.lift,g.lw+1,2)};
  perna(ps.bl,-1);perna(ps.fl,0);
  roupaTronco(fig,p,g,y0,bx,true,true);
  const head=fig.parte('pele',{projeta:1});head.rrect(10+bx,hy,12,12,4,4);
  const nz=R.nariz??1;if(nz>=1)head.px(22+bx,hy+7);if(nz>=2)head.px(22+bx,hy+8);if(nz>=3)head.px(23+bx,hy+7);
  if(R.orelha==='normal'||R.orelha==='pontuda')fig.parte('pele',{plano:true}).px(15+bx,hy+6,-1).px(15+bx,hy+7,-1);
  if(p.cabelo==='careca'&&!ch)head.px(13+bx,hy+1,1).px(14+bx,hy+1,1);
  if(!(ch&&ch.escondeRosto)){rostoLado(fig,p,ps,hy,bx);if(p.barba!=='nenhuma')maskCamada(fig,'cabelo',(BARBAS[p.barba]||{}).S,gx,gy)}
  cabeloCamada(fig,p,'S',gx,gy,ch);
  const ear=R.orelha;if(!(ch&&(ch.escondeCabelo||p.chapeu==='capuz'))){const e=fig.parte('pele',{});
    if(ear==='elfo'){e.px(14+bx,hy+6).px(13+bx,hy+5).px(12+bx,hy+4).px(14+bx,hy+7)}
    else if(ear==='pontuda'){e.px(14+bx,hy+6).px(13+bx,hy+5).px(14+bx,hy+7)}
    else if(ear==='goblin'){for(let y=hy+5;y<=hy+8;y++)e.px(14+bx,y);e.px(13+bx,hy+5).px(13+bx,hy+6).px(12+bx,hy+5).px(11+bx,hy+4).px(10+bx,hy+4)}}
  if(R.chifres)maskCamada(fig,'osso',CHIFRES.S,gx,gy);
  chapeuCamada(fig,p,'S',gx,gy);
  const fa=ps.fa;
  fig.parte(manga,{linha:true}).bar(sx,y0+1,sx+fa.x,y0+5+fa.y,g.aw);
  const hx=Math.round(sx+fa.x-(g.aw-1)/2),hyy=y0+5+fa.y;
  const info=desenharArma(fig,p.arma,hx+(g.aw>2?1:0),hyy,ps.w);
  fig.parte(mao,{grad:false}).rect(hx,hyy,g.aw,2);
  efeitosArma(fig,ps.w,info,[sx,y0+1]);
  if(ps.w.impacto)estrela(fig,hx+4,hyy);
}

function desenharPers(p,dir,anim,f){
  if(dir==='esquerda')return flipArr(desenharPers(p,'direita',anim,f),32,32);
  if(anim==='dano'&&f===0)return flashArr(desenharPers(p,dir,'parado',0));
  const fig=new Figura(32,32,paletaPers(p)),ps=posePers(p,dir,anim,f);
  if(dir==='direita')ladoPers(fig,p,ps);else frentePers(fig,p,ps,dir==='baixo');
  let px=fig.render({contorno:p.contorno});
  if(p.sombra)px=sombraChao(px,32,32,16,31,8,1.6);
  return px;
}
function gerarPers(p,anims){
  const rows=[];
  for(const a of P_ANIMS){if(anims&&!anims.includes(a.id))continue;
    for(const d of P_DIRS)rows.push({name:a.id+'_'+d,fps:a.fps,frames:Array.from({length:a.n},(_,f)=>desenharPers(p,d,a.id,f))})}
  return{type:'personagem',w:32,h:32,rows,params:p};
}
