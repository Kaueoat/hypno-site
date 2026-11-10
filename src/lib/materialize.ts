/**
 * Texto que "materializa" — assinatura da HYPNO (neon + grão do brandkit).
 *
 * Todo texto do site (títulos, parágrafos, rótulos, listas, cards) entra assim ao
 * aparecer na tela: começa invisível, surge feito de GRÃO (máscara de ruído que pisca
 * como película), com BLOOM roxo e desfoque, e vai ficando sólido e nítido devagar.
 *
 * É animado quadro a quadro em JavaScript (não depende de recursos de CSS que nem
 * todo navegador anima). Cada elemento anima uma vez; no fim, todos os estilos
 * temporários são removidos. Com prefers-reduced-motion, mantém grão/bloom/desfoque
 * mas sem deslocamento.
 */

const DURATION = 1200 // ms por elemento
const WORD_STAGGER = 55 // ms entre palavras de um título
const ITEM_STAGGER = 45 // ms entre elementos que entram juntos
const GRAIN_FPS = 14 // "cintilação" do grão

/** Textos que entram no efeito. */
const SELECTOR = [
  'main h2',
  'main h3',
  'main p',
  'main li',
  'main label',
  'main figcaption',
  'main dt',
  'main dd',
  'footer p',
  'footer li',
  'footer span',
].join(',')

/** Áreas que não entram (botões, mockups decorativos, faixa em movimento, frases com efeito próprio). */
const EXCLUDE = '[data-slot="button"], [role="img"], .marquee, [aria-hidden="true"], [data-no-mat], #hero-title, form [role="status"]'

const NOISE = (() => {
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>" +
    "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.62' numOctaves='2' stitchTiles='stitch'/>" +
    "<feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 3.4 -1.3'/></filter>" +
    "<rect width='100%' height='100%' filter='url(#n)'/></svg>"
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
})()

const REDUCED = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const easeIn = (t: number) => t * t * t
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

type Unit = { el: HTMLElement; delay: number; strong: boolean }

function setMask(el: HTMLElement, solid: number, pos: string) {
  const m = `linear-gradient(rgba(0,0,0,${solid.toFixed(3)}),rgba(0,0,0,${solid.toFixed(3)})), ${NOISE}`
  const s = el.style as CSSStyleDeclaration & Record<string, string>
  s.webkitMaskImage = m
  s.maskImage = m
  s.webkitMaskSize = '100% 100%, 220px 220px'
  s.maskSize = '100% 100%, 220px 220px'
  s.webkitMaskPosition = `0 0, ${pos}`
  s.maskPosition = `0 0, ${pos}`
  s.webkitMaskRepeat = 'repeat'
  s.maskRepeat = 'repeat'
  s.setProperty('-webkit-mask-composite', 'source-over')
  s.setProperty('mask-composite', 'add')
  s.setProperty('-webkit-mask-clip', 'no-clip')
  s.setProperty('mask-clip', 'no-clip')
}

function clearStyles(el: HTMLElement) {
  for (const p of [
    'opacity', 'filter', 'text-shadow', 'transform',
    '-webkit-mask-image', 'mask-image', '-webkit-mask-size', 'mask-size',
    '-webkit-mask-position', 'mask-position', '-webkit-mask-repeat', 'mask-repeat',
    '-webkit-mask-composite', 'mask-composite', '-webkit-mask-clip', 'mask-clip', 'will-change',
  ])
    el.style.removeProperty(p)
  el.removeAttribute('data-mat')
}

function frame(u: Unit, t: number, grainPos: string) {
  const { el, strong } = u
  // opacidade sobe cedo; o grão e o bloom seguram a forma "em construção"
  const op = easeOut(clamp01(t / 0.35))
  const blur = (strong ? 7 : 5) * (1 - easeOut(clamp01(t / 0.6)))
  const solid = easeIn(clamp01((t - 0.15) / 0.8)) // grão domina até ~60%
  const bloomIn = easeOut(clamp01((t - 0.05) / 0.3))
  const bloom = bloomIn * (1 - easeInOut(clamp01((t - 0.35) / 0.65)))
  const y = REDUCED ? 0 : (strong ? 0.18 : 0.1) * (1 - easeOut(clamp01(t / 0.8)))
  el.style.opacity = op.toFixed(3)
  el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none'
  el.style.transform = `translateY(${y.toFixed(3)}em)`
  el.style.textShadow =
    bloom > 0.01
      ? `0 0 6px rgba(232,200,255,${(0.85 * bloom).toFixed(3)}), 0 0 18px rgba(196,92,255,${(0.9 * bloom).toFixed(3)}), 0 0 38px rgba(196,92,255,${(0.45 * bloom).toFixed(3)})`
      : 'none'
  setMask(el, solid, grainPos)
}

function animate(units: Unit[]) {
  const start = performance.now()
  let lastGrain = 0
  let grainPos = '0 0'
  units.forEach((u) => {
    u.el.style.willChange = 'opacity, filter, transform'
    frame(u, 0, grainPos)
    u.el.removeAttribute('data-mat')
  })
  const tick = (now: number) => {
    if (now - lastGrain > 1000 / GRAIN_FPS) {
      lastGrain = now
      grainPos = `${Math.round(Math.random() * 220)}px ${Math.round(Math.random() * 220)}px`
    }
    let running = false
    for (const u of units) {
      const t = (now - start - u.delay) / DURATION
      if (t >= 1) {
        if (u.el.dataset.matDone !== '1') {
          clearStyles(u.el)
          u.el.dataset.matDone = '1'
        }
        continue
      }
      running = true
      frame(u, Math.max(0, t), grainPos)
    }
    if (running) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

/** Divide um elemento em unidades: títulos com palavras separadas animam palavra a palavra. */
function unitsFor(el: HTMLElement, baseDelay: number): Unit[] {
  const words = el.matches('[data-mat-words]') ? Array.from(el.querySelectorAll<HTMLElement>('.split-word')) : []
  if (words.length) return words.map((w, i) => ({ el: w, delay: baseDelay + i * WORD_STAGGER, strong: true }))
  const strong = /^H[1-3]$/.test(el.tagName)
  return [{ el, delay: baseDelay, strong }]
}

function hide(units: Unit[]) {
  units.forEach((u) => u.el.setAttribute('data-mat', 'pending'))
}

export function initMaterialize(): () => void {

  // escolhe os elementos "folha" (sem outro texto selecionado dentro) para não animar duas vezes
  const all = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR)).filter(
    (el) => !el.closest(EXCLUDE) && el.textContent?.trim(),
  )
  const set = new Set(all)
  const targets = all.filter((el) => {
    for (let p = el.parentElement; p; p = p.parentElement) if (set.has(p)) return false
    return true
  })
  // títulos divididos em palavras também entram
  document.querySelectorAll<HTMLElement>('main [data-mat-words]').forEach((h) => {
    if (!targets.includes(h)) targets.push(h)
  })

  const unitMap = new Map<HTMLElement, Unit[]>()
  for (const el of targets) {
    const u = unitsFor(el, 0)
    unitMap.set(el, u)
    hide(u)
  }

  let batch: HTMLElement[] = []
  let batchTimer = 0
  const flush = () => {
    batchTimer = 0
    // ordem de leitura: de cima para baixo, da esquerda para a direita
    batch.sort((a, b) => {
      const ra = a.getBoundingClientRect()
      const rb = b.getBoundingClientRect()
      return Math.abs(ra.top - rb.top) > 8 ? ra.top - rb.top : ra.left - rb.left
    })
    const units: Unit[] = []
    batch.forEach((el, i) => {
      unitsFor(el, i * ITEM_STAGGER).forEach((u) => units.push(u))
    })
    batch = []
    animate(units)
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        io.unobserve(e.target)
        batch.push(e.target as HTMLElement)
      }
      if (batch.length && !batchTimer) batchTimer = window.setTimeout(flush, 30)
    },
    { threshold: 0.2, rootMargin: '0px 0px -6% 0px' },
  )
  targets.forEach((el) => io.observe(el))

  return () => {
    io.disconnect()
    clearTimeout(batchTimer)
    unitMap.forEach((us) => us.forEach((u) => clearStyles(u.el)))
  }
}

/** Hero: materializa o título e a linha de apoio quando o site "acorda". */
export function materializeHero(delay = 350) {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-mat-hero]')).sort(
    (a, b) => Number(a.dataset.matHero) - Number(b.dataset.matHero),
  )
  const units: Unit[] = els.map((el, i) => ({ el, delay: delay + i * 200, strong: el.tagName === 'H1' }))
  animate(units)
}

/** Esconde o texto da Hero antes da abertura (evita aparecer antes da hora). */
export function hideHero() {
  document.querySelectorAll<HTMLElement>('[data-mat-hero]').forEach((el) => el.setAttribute('data-mat', 'pending'))
}
