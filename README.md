# HYPNO — site institucional

React + TypeScript + Tailwind CSS v4 + Vite. Ícones: Lucide.

## Rodar

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # gera /dist para publicar (Vercel, Netlify, Hostinger...)
```

## Onde editar

| O quê | Arquivo |
| --- | --- |
| **WhatsApp**, e-mail, Instagram, endpoint do formulário | `src/config/site.ts` → `contact` |
| Todos os textos das seções | `src/config/site.ts` |
| Fotos, nomes, bios e links dos sócios | `src/config/site.ts` → `about.team` (fotos em `public/team/`, formato 4:5) |
| Portfólio (vídeo em destaque + galeria) | `src/config/site.ts` → `audiovisual.featured` e `audiovisual.gallery` (preencha `src`) |
| SEO (title, description, Open Graph, JSON-LD) | `index.html` |
| Cores, fontes, glow | `src/styles/index.css` (`@theme` e `:root`) |
| Cores e ajustes do fundo animado | `src/components/visuals/HalftoneBackground.tsx` (`COLORS` e uniforms) |

### WhatsApp
Coloque o número em `contact.whatsappNumber` só com dígitos, com DDI e DDD (ex.: `5511999999999`).
Todos os botões "Fale com a Hypno" e o formulário passam a usar esse número.

### Formulário
- Sem `formEndpoint`: o formulário valida os campos e abre o WhatsApp com a mensagem pronta.
- Com `formEndpoint` (Formspree, Getform, API própria): envia um POST em JSON com `nome`, `empresa`, `servico`, `descricao`.

### Portfólio
Enquanto `src` estiver vazio, cada quadro mostra uma imagem procedural de longa exposição com o selo
"Placeholder". Coloque os arquivos em `public/portfolio/` e aponte `src: '/portfolio/reel.mp4'`.
Vídeos (.mp4/.webm) tocam mudos em loop; imagens carregam com `loading="lazy"`.

## Estrutura

```
src/
  config/site.ts          conteúdo e contatos
  hooks/motion.ts         reveal no scroll, progresso, parallax, reduced-motion
  components/
    ui/                   Reveal, SectionHeader, Grain, Logo
    ui/liquid-glass-button.tsx   LiquidButton (todos os botões) + GlassFilter
    visuals/              HypnoEye (olho: cursor, glitch, hover, fecha no scroll),
                          HalftoneBackground (shader WebGL do fundo), CursorGlow,
                          LightTrails, MediaFrame, Mockups
    sections/             Nav, Hero, WebSection, AudiovisualSection, AboutSection,
                          ProcessSection, ContactSection, Footer
  styles/index.css        tokens da marca, grão, glow, animações
```

## Regras da marca aplicadas
- Preto e branco + roxo neon (#C45CFF / #B026FF) como único acento.
- Glow = forma nítida + cópia desfocada; um elemento brilhando por composição.
- Fundo: shader WebGL "Halftone Dots" (Paper Shaders, Apache-2.0) em preto e cinza, com grão e ripple no cursor.
- Gradiente roxo sutil acompanhando o cursor (só com mouse).
- Sem sombras projetadas, sem degradês decorativos, sem emojis.
- O olho do hero usa a geometria exata do símbolo oficial; só a posição da íris/pupila se move.
- `prefers-reduced-motion` desliga animações automáticas e o grão animado.

## Abertura (o site acorda)
`src/components/visuals/Intro.tsx`: tela preta → olho fechado → pálpebras abrindo → site desfocado → nítido.
Toca a cada carregamento (não reinicia ao navegar entre seções), pula quando o link já aponta para uma seção, e
qualquer clique/tecla/rolagem acelera. Com `prefers-reduced-motion` (ex.: Windows com "Efeitos de animação" desligado) a abertura e o grão continuam, só sem zoom, parallax e movimentos em loop.
Tempos ajustáveis no objeto `TIMELINE` do componente (sequência atual ≈ 7 s).

## Texto no scroll (bloom + grão)
`src/lib/materialize.ts`: TODO o texto do site (títulos palavra por palavra, parágrafos, listas,
rótulos, cards, rodapé) surge feito de grão que cintila, com bloom roxo e desfoque, e fica sólido
devagar (~2,6 s por elemento, em ordem de leitura). Animado quadro a quadro em JS, funciona em
qualquer navegador. Ajuste DURATION, WORD_STAGGER, ITEM_STAGGER e GRAIN_FPS no topo do arquivo.
Para tirar um elemento do efeito, adicione `data-no-mat`.

## Animações
As animações usam IntersectionObserver, CSS e requestAnimationFrame, sem biblioteca extra
(mais leve). Se quiser usar Motion/Framer Motion, `src/components/ui/Reveal.tsx` é o único
ponto a trocar.
