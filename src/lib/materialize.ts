/**
 * Texto que "materializa" — assinatura da HYPNO.
 *
 * Todo texto do site (títulos, parágrafos, rótulos, listas, cards) entra assim ao
 * aparecer na tela: começa invisível e DESFOCADO e vai ficando nítido (desfoque → nítido),
 * com uma subida curtinha. Sem brilho colorido e sem grão.
 *
 * Animado quadro a quadro em JavaScript. Cada elemento anima uma vez; no fim, todos
 * os estilos temporários são removidos. Com prefers-reduced-motion, mantém o
 * desfoque mas sem deslocamento.
 */

const DURATION = 1100 // ms por elemento
const WORD_STAGGER = 55 // ms entre palavras de um título
const ITEM_STAGGER = 45 // ms entre elementos que entram juntos

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

const REDUCED = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

type Unit = { el: HTMLElement; delay: number; strong: boolean }

function clearStyles(el: HTMLElement) {
  for (const p of [
    'opacity', 'filter', 'transform', 'will-change',
  ])
    el.style.removeProperty(p)
  el.removeAttribute('data-mat')
}

function frame(u: Unit, t: number) {
  const { el, strong } = u
  const op = easeOut(clamp01(t / 0.5))
  const blur = (strong ? 14 : 9) * (1 - easeOut(clamp01(t / 0.85)))
  const y = REDUCED ? 0 : (strong ? 0.16 : 0.1) * (1 - easeOut(clamp01(t / 0.85)))
  el.style.opacity = op.toFixed(3)
  el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none'
  el.style.transform = `translateY(${y.toFixed(3)}em)`
}

function animate(units: Unit[]) {
  const start = performance.now()
  units.forEach((u) => {
    u.el.style.willChange = 'opacity, filter, transform'
    frame(u, 0)
    u.el.removeAttribute('data-mat')
  })
  const tick = (now: number) => {
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
      frame(u, Math.max(0, t))
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
