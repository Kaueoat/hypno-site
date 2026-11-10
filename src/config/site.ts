import photoKaue from '../assets/team/kaue.jpg'
import photoVinicius from '../assets/team/vinicius.jpg'

/**
 * Configurações centrais do site da HYPNO.
 * Edite aqui contatos, links e textos — os componentes leem tudo deste arquivo.
 */

export const contact = {
  /** Número do WhatsApp com DDI + DDD, só dígitos. Ex.: "5511999999999". */
  whatsappNumber: '5511932189849',
  /** Mensagem inicial ao abrir o WhatsApp pelo botão principal. */
  whatsappGreeting: 'Olá, HYPNO! Quero tirar uma ideia do papel.',
  email: 'talkto.hypno@gmail.com',
  instagram: 'https://instagram.com/hypno.tm',
  instagramHandle: '@hypno.tm',
  /**
   * Endpoint opcional para o formulário (Formspree, Getform, API própria...).
   * Vazio = o formulário monta a mensagem e abre o WhatsApp.
   */
  formEndpoint: '',
}

export function whatsappLink(message = contact.whatsappGreeting) {
  const base = contact.whatsappNumber
    ? `https://wa.me/${contact.whatsappNumber}`
    : 'https://wa.me/'
  return `${base}?text=${encodeURIComponent(message)}`
}

export const seo = {
  title: 'HYPNO — Criação de sites e produção audiovisual',
  description:
    'A HYPNO cria sites, landing pages, cardápios digitais e produções audiovisuais que fazem sua marca ser vista.',
  url: 'https://hypno.com.br', // TODO: domínio final
}

export const nav = [
  { id: 'sites', label: 'Criação de Sites' },
  { id: 'audiovisual', label: 'Audiovisual' },
  { id: 'sobre', label: 'Sobre Nós' },
  { id: 'como-funciona', label: 'Como Funciona' },
] as const

export const hero = {
  headline: 'Sua próxima ideia merece ser vista.',
  sub: 'Sites. Audiovisual. Direção criativa.',
  primary: 'Conheça nossos serviços',
  secondary: 'Fale com a Hypno',
}

export const sites = {
  eyebrow: 'Sites',
  headline: 'Sua presença digital começa aqui.',
  description: 'Rápidos, estratégicos e feitos para converter.',
  services: [
    {
      title: 'Desenvolvimento de Sites',
      text: 'Institucionais e sob medida.',
    },
    {
      title: 'Landing Pages',
      text: 'Feitas para converter.',
    },
    {
      title: 'Cardápios Digitais e iFood',
      text: 'Seu cardápio, pronto para vender.',
    },
    {
      title: 'Experiências Digitais',
      text: 'Interfaces que ficam na memória.',
    },
  ],
}

export const audiovisual = {
  eyebrow: 'Audiovisual',
  headline: 'Transformamos ideias em imagens.',
  description: 'Vídeo, foto e direção criativa.',
  services: [
    {
      title: 'Produção de Vídeos',
      text: 'Captação profissional para marcas, empresas, produtos, eventos e campanhas.',
    },
    {
      title: 'Fotografia',
      text: 'Fotografia comercial, institucional, produtos, ambientes e conteúdos para redes sociais.',
    },
    {
      title: 'Edição de Vídeos',
      text: 'Montagem, tratamento de imagem, ritmo, efeitos, motion design e finalização profissional.',
    },
    {
      title: 'Conteúdo para Redes Sociais',
      text: 'Reels, vídeos promocionais, campanhas, vídeos institucionais e conteúdos estratégicos.',
    },
    {
      title: 'Direção Criativa',
      text: 'Conceituação visual, planejamento de conteúdo e desenvolvimento de ideias para campanhas.',
    },
  ],
  /**
   * Portfólio. Arquivos em public/portfolio/ (trechos curtos, mudos, em loop).
   * `orientation`: 'vertical' (quadro 3:4) ou 'horizontal' (quadro largo).
   * Sem `src`, o quadro mostra um placeholder identificado.
   */
  featured: {
    title: 'Dia dos Pais',
    client: 'Santos FC × Novibet',
    src: 'portfolio/santos-novibet.mp4',
    poster: 'portfolio/santos-novibet.jpg',
    credits: 'Gravado por Kauê Oliveira e Brenno Valim (Takeover). Editado por Takeover Filmes.',
  },
  gallery: [
    {
      title: 'Disney+ × AOC',
      kind: 'Conteúdo para redes',
      orientation: 'vertical',
      src: 'portfolio/disney-aoc.mp4',
      poster: 'portfolio/disney-aoc.jpg',
      credits: 'Gravado por Lucas. Editado por Kauê Oliveira.',
    },
    {
      title: 'Sanrio — Hello Kitty',
      kind: 'Sorteio',
      orientation: 'vertical',
      src: 'portfolio/sanrio-vertical.mp4',
      poster: 'portfolio/sanrio-vertical.jpg',
      credits: 'Gravado por Lucas. Editado por Kauê Oliveira.',
    },
    {
      title: 'Santos TV × Novibet',
      kind: 'Conteúdo para redes',
      orientation: 'vertical',
      src: 'portfolio/santos-ct.mp4',
      poster: 'portfolio/santos-ct.jpg',
      credits: 'Gravado por Santos TV. Editado por Kauê Oliveira.',
    },
    {
      title: 'Nave — Gusmão & Labrunie',
      kind: 'Vídeo institucional',
      orientation: 'horizontal',
      src: 'portfolio/gusmao-labrunie.mp4',
      poster: 'portfolio/gusmao-labrunie.jpg',
      credits: 'Gravado por Lucas e Victor Castro (Takeover). Editado por Kauê Oliveira e Takeover Filmes.',
    },
    {
      title: 'Sanrio — Itabags',
      kind: 'Vídeo para YouTube',
      orientation: 'horizontal',
      src: 'portfolio/sanrio-horizontal.mp4',
      poster: 'portfolio/sanrio-horizontal.jpg',
      credits: 'Gravado por Lucas. Editado por Kauê Oliveira.',
    },
  ] as {
    title: string
    kind: string
    orientation: 'vertical' | 'horizontal'
    src: string
    poster?: string
    credits?: string
  }[],
}

export const about = {
  eyebrow: 'Sobre nós',
  headline: 'Não fazemos mais do mesmo.',
  text: 'Criatividade, tecnologia e estratégia. Entre o digital e o audiovisual.',
  statement: 'Enxergamos possibilidades onde outros veem o comum.',
  /**
   * Sócios. Fotos em src/assets/team/ (4:5, já tratadas: P&B + roxo + grão).
   * `href`: link externo do card (Instagram pessoal, LinkedIn, portfólio). Vazio = Instagram da HYPNO.
   */
  team: [
    {
      name: 'Kauê Oliveira',
      bio: 'Produtor audiovisual e videomaker focado em narrativas digitais dinâmicas e conteúdo de alta performance para esporte e entretenimento. Direção de fotografia, captação e edição em projetos com marcas como Novibet e Santos FC.',
      photo: photoKaue,
      href: '',
    },
    {
      name: 'Vinicius Gabriel',
      bio: 'Sou um profissional criativo, com habilidades em edição de vídeo, VFX e motion design utilizando Adobe After Effects. Também trabalho com design gráfico, desenvolvimento de sites e ferramentas de inteligência artificial. Gosto de aprender coisas novas, explorar tecnologias e transformar ideias em projetos criativos e funcionais.',
      photo: photoVinicius,
      href: '',
    },
  ],
}

export const process = {
  eyebrow: 'Como funciona',
  headline: 'Do primeiro contato ao resultado.',
  steps: [
    {
      n: '01',
      title: 'Conversa',
      text: 'Entendemos o que você precisa.',
    },
    {
      n: '02',
      title: 'Planejamento',
      text: 'Direção, estratégia e estrutura.',
    },
    {
      n: '03',
      title: 'Produção',
      text: 'Criamos cada detalhe.',
    },
    {
      n: '04',
      title: 'Entrega',
      text: 'Pronto para ganhar espaço.',
    },
  ],
}

export const cta = {
  headline: 'Vamos tirar sua ideia do papel?',
  text: 'Conte o que você precisa.',
  button: 'Fale com a Hypno',
  serviceOptions: [
    'Criação de site',
    'Landing page',
    'Cardápio digital / iFood',
    'Produção de vídeo',
    'Fotografia',
    'Edição de vídeo',
    'Conteúdo para redes sociais',
    'Direção criativa',
    'Outro',
  ],
}

export const tagline = 'Tudo é neutro até algo importar. Aí brilha.'
