# Sprites-N-AI

Ferramenta para criar **personagens, monstros, itens e cenários em pixel art** para jogos, feita para funcionar **só com o celular**. É um site simples (HTML + JavaScript), sem instalar nada e sem servidor.

## O que dá para fazer

| Aba | Para que serve |
|---|---|
| **Criar** | Gera assets na hora. Cada um sai de uma *semente* (ex.: `mago-4821`): a mesma semente gera sempre o mesmo resultado. Toque nas variações para escolher. |
| **IA ✦** | Você escreve e a IA cria: um personagem completo a partir de uma descrição, um desenho livre feito pixel por pixel ou um personagem inspirado numa foto. |
| **Editar** | Editor com o dedo: lápis, borracha, balde, conta-gotas, linha, retângulo, clarear, escurecer, mover, espelho, desfazer/refazer, contorno automático, ver o quadro anterior, zoom, paletas famosas (PICO-8, Sweetie 16, Endesga 32) e pedido de ajuste para a IA. |
| **Exportar** | Spritesheet PNG, GIF animado ou só o quadro atual, em 1× a 16×, e os dados para a engine (JSON). |
| **Galeria** | Guarda seus assets no celular, com backup para baixar e abrir de novo. |

### Personagens (32×32)
- 7 raças: humano, elfo, anão, orc, goblin, esqueleto e demônio.
- 11 classes prontas: guerreiro, mago, arqueiro, ladino, cavaleiro, aldeão, realeza, bárbaro, clérigo, pirata e ninja.
- 9 cabelos, 8 chapéus e elmos, 6 roupas, capas, barbas, 6 tipos de olhos e de boca.
- 7 armas (espada, machado, lança, arco, cajado, adaga, martelo) e 2 escudos.
- **4 animações em 4 direções**: parado, andar, atacar (com rastro do golpe, magia ou flecha) e dano.
- Sombras com mudança de tom e contorno colorido, como na pixel art feita à mão.

### Monstros (32×32)
Slime, morcego, fantasma, olho voador, cogumelo, aranha, planta carnívora e criatura aleatória, cada um com as animações parado, mover, atacar e dano.

### Itens (16×16)
28 ícones: armas, escudo, elmo, armadura, bota, anel, amuleto, poção, gema, moeda que gira, chave, baú, pergaminho, livro, comida, coração, estrela, bomba com pavio aceso, flecha e tocha com fogo. As armas e acessórios podem ser de 7 materiais: madeira, ferro, ouro, cristal, fogo, gelo e sombra. Também há um **pacote com 16 itens** de uma vez.

### Cenário
- **Pisos 16×16 que se encaixam sem emenda**: grama, grama com flores, terra, calçada de pedra, tijolo, piso de pedra, madeira, areia, neve, além de água e lava animadas.
- **Tileset com bordas**: um terreno por cima de outro (ex.: grama sobre terra, água sobre areia), com cantos, bordas e cantos internos.
- **Decorações**: árvore, pinheiro, arbusto, pedra, flores, cogumelos, toco, cerca, fogueira animada, cristais, placa, barril e caixote.

### Foto → Pixel
Transforma uma foto ou um desenho feito no papel em pixel art, de 16 a 64 pixels, de 4 a 24 cores, com remoção de fundo.

## Sobre a IA

A aba **IA** usa o Claude. Ela funciona quando a ferramenta é aberta pelo **link do Claude** (no app ou no site), usando a sua conta. Na primeira vez, o Claude pede sua permissão. No site do GitHub Pages a IA não aparece, mas todo o resto funciona.

## Como colocar no ar pelo celular (GitHub Pages)

1. O código precisa estar no branch `main` do repositório.
2. No navegador do celular, abra o repositório no github.com, de preferência na "Versão para computador".
3. Vá em **Settings → Pages**.
4. Em **Source**, escolha **Deploy from a branch**, branch `main` e pasta `/ (root)`. Salve.
5. Depois de 1 ou 2 minutos, o site fica em `https://ninhoplayer6gg.github.io/sprites-n-ai/`.
6. No navegador do celular, use **Adicionar à tela inicial** para abrir como um app.

## Como usar os sprites no seu jogo

1. Na aba **Exportar**, escolha **1×** e toque em **Spritesheet PNG**.
2. Salve a imagem (botão **Baixar**, ou toque e segure a imagem).
3. Na engine, corte a imagem em quadros do tamanho de `larguraQuadro` × `alturaQuadro` (ver os dados JSON). Cada linha é uma animação.
4. Desligue o filtro de suavização da textura (no Godot: *Filter → Nearest*; no Unity: *Filter Mode → Point*) para os pixels ficarem nítidos.

## Organização do código

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Página, visual e abas |
| `js/base.js` | Números aleatórios com semente, cores e o motor de desenho em camadas (sombras e contorno) |
| `js/personagem.js` | Personagens, poses e animações |
| `js/monstros.js` | Monstros |
| `js/itens.js` | Itens |
| `js/cenario.js` | Pisos, tileset com bordas e decorações |
| `js/ia.js` | Conversa com o Claude |
| `js/exportar.js` | PNG, GIF animado e downloads |
| `js/app.js` | Interface, editor e galeria |
