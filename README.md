# Sprites-N-AI

Ferramenta para gerar **personagens, monstros, itens, terrenos e sprites em pixel art** para jogos, feita para funcionar **só com o celular**: é uma página web (um único arquivo `index.html`), sem instalar nada e sem servidor.

## O que ela faz

| Aba | Para que serve |
|---|---|
| **Gerar** | Cria assets automaticamente. Cada um sai de uma *semente* (ex.: `mago-4821`): a mesma semente sempre gera o mesmo resultado. |
| **Editar** | Editor de pixel art com o dedo: lápis, borracha, balde, conta-gotas, modo espelho, desfazer e quadros de animação. |
| **Exportar** | Gera o PNG da spritesheet (ou de um quadro) em 1×, 2×, 4×, 8× ou 16×, e os dados (JSON) para usar na engine. |
| **Galeria** | Guarda seus assets no navegador do celular para abrir depois. |

### Tipos de asset

- **Personagem** (32×32): andar em 4 direções (baixo, esquerda, direita, cima), 4 quadros cada. Dá para escolher pele, cabelo, estilo do cabelo, olhos, roupa, calça, botas e equipamento (espada, cajado, escudo).
- **Monstro** (16×16): criaturas, naves e robôs simétricos, com animação de 2 quadros.
- **Item** (16×16): poção, gema, moeda, espada e escudo, com brilho animado.
- **Terreno** (16×16): grama, terra, pedra, água animada, areia e madeira. Os tiles emendam sem costura.
- **Foto → Pixel**: transforma uma foto ou um desenho feito no papel em pixel art (16 a 64 px, 4 a 24 cores, com remoção de fundo).

## Como colocar no ar pelo celular (GitHub Pages)

1. Abra este repositório no navegador do celular (github.com), de preferência em "Versão para computador".
2. Vá em **Settings → Pages**.
3. Em **Source**, escolha **Deploy from a branch**, branch `main` e pasta `/ (root)`. Salve.
4. Depois de 1 ou 2 minutos, o site fica em `https://ninhoplayer6gg.github.io/sprites-n-ai/`.
5. No navegador do celular, use **Adicionar à tela inicial** para abrir como um app.

## Como usar os sprites no seu jogo

1. Na aba **Exportar**, escolha **1×** e toque em **Spritesheet PNG**.
2. Salve a imagem (botão **Baixar** ou toque e segure a imagem).
3. Na engine, corte a imagem em quadros do tamanho de `larguraQuadro` × `alturaQuadro` (ver os dados JSON). Cada linha é uma animação.
4. Desligue o filtro/suavização da textura (em Godot: *Filter → Nearest*) para os pixels ficarem nítidos.

## Ideias para as próximas versões

- Mais partes de personagem (chapéus, armaduras, capas) e animações de ataque.
- Exportar GIF animado.
- Ligar a uma IA de geração de imagens (precisa de uma chave de API, que costuma ser paga).
