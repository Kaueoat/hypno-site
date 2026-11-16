import { useEffect, useRef } from 'react'
import { LID_ALMOST, MAX_Y, SilverSymbol } from './HypnoEye'
import { ChromeEye, type ChromeEyeHandle } from './chrome/ChromeEye'

/**
 * Abertura da HYPNO — "o site acorda".
 *
 * TELA PRETA → OLHO FECHADO → QUASE FECHADO → (pisca) → ABERTO → o olho viaja do centro
 * da tela até o lugar dele na Hero → SITE DESFOCADO → SITE NÍTIDO → HERO COMPLETA.
 *
 * O olho é o mesmo cromo em tempo real da Hero (ChromeEye); as pálpebras são
 * máscaras sobre a arte original (ver `lidPath` em HypnoEye.tsx).
 *
 * Fases: o App controla `data-intro` no <html> ("intro" → "reveal" → removido).
 * Qualquer tecla, toque, clique ou rolagem acelera a abertura — nunca bloqueia o site.
 * Ajuste o ritmo no objeto `TIMELINE`.
 */

type Props = { onReveal: () => void; onDone: () => void }

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2

/** Pálpebra: [duração ms, abertura alvo (0 fechado → 1 aberto), easing] */
type LidStep = [number, number, (t: number) => number]

const TIMELINE = {
  black: 650, // tela desligada
  appear: 900, // a linha do olho fechado acende devagar
  lids: [
    [1000, LID_ALMOST, easeInOutSine], // entreabre (quase fechado)
    [420, LID_ALMOST, easeInOutSine], // fica sonolento
    [260, 0.06, easeInOut], // pisca
    [340, LID_ALMOST + 0.06, easeInOut], // volta a entreabrir
    [1250, 1, easeOut], // abre de vez
  ] as LidStep[],
  hold: 650, // olho aberto em destaque, no centro
  travel: 1700, // viaja até a posição da Hero
}
const START_SCALE = 1.12

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function Intro({ onReveal, onDone }: Props) {
  const overlay = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const eye = useRef<ChromeEyeHandle | null>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.matchMedia('(max-width: 767px)').matches
    const speed = mobile ? 0.85 : 1 // no celular, um pouco mais curto

    let raf = 0
    let alive = true
    let fast = false
    let revealed = false
    let k = 0

    const heroEye = () => document.querySelector<HTMLElement>('[data-hero-eye]')

    const sizeBox = () => {
      const h = heroEye()
      if (h && box.current) box.current.style.width = `${h.getBoundingClientRect().width}px`
    }
    sizeBox()

    const setLid = (v: number) => {
      k = v
      const c = Math.min(1, Math.max(0, v))
      // a íris acorda olhando para baixo e sobe ao centro conforme o olho abre;
      // o reflexo do cromo "desliza" enquanto o olho desperta
      const oy = MAX_Y * 0.75 * (1 - c)
      eye.current?.set({ lid: c, iris: [0, oy], tilt: [-0.6 * (1 - c), 0.5 * (1 - c)] })
    }

    const tween = (ms: number, step: (t: number) => void) =>
      new Promise<void>((resolve) => {
        const dur = ms * speed
        if (dur <= 0 || fast) {
          step(1)
          return resolve()
        }
        const start = performance.now()
        const tick = (now: number) => {
          if (!alive) return resolve()
          const t = fast ? 1 : Math.min(1, (now - start) / dur)
          step(t)
          if (t < 1) raf = requestAnimationFrame(tick)
          else resolve()
        }
        raf = requestAnimationFrame(tick)
      })

    const wait = (ms: number) => (fast ? Promise.resolve() : sleep(ms * speed))

    const reveal = async () => {
      if (revealed || !alive) return
      revealed = true
      const h = heroEye()
      const b = box.current
      const travel = fast ? 700 : TIMELINE.travel * speed
      overlay.current?.style.setProperty('--reveal', `${Math.round(travel * 0.9)}ms`)
      onReveal()
      if (h && b) {
        const hr = h.getBoundingClientRect()
        const br = b.getBoundingClientRect() // inclui a escala inicial; o centro não muda
        const dx = hr.left + hr.width / 2 - (br.left + br.width / 2)
        const dy = hr.top + hr.height / 2 - (br.top + br.height / 2)
        b.style.transition = `transform ${travel}ms cubic-bezier(0.7, 0, 0.18, 1)`
        b.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1)`
      }
      await sleep(travel + 80)
      if (alive) onDone()
    }

    const run = async () => {
      window.scrollTo(0, 0)
      setLid(0)
      if (box.current) box.current.style.transform = `scale(${reduced ? 1 : START_SCALE})`
      // espera as fontes (com limite) para não revelar texto trocando de fonte
      await Promise.race([document.fonts?.ready ?? Promise.resolve(), sleep(1000)])
      if (!alive) return
      sizeBox()


      await wait(TIMELINE.black)
      // 1. olho fechado: a linha acende
      if (box.current) {
        box.current.style.transition = `opacity ${fast ? 200 : TIMELINE.appear * speed}ms ease`
        box.current.style.opacity = '1'
      }
      await wait(TIMELINE.appear)
      // 2. pálpebras: quase fechado → pisca → abre
      for (const [ms, to, ease] of TIMELINE.lids) {
        const from = k
        await tween(ms, (t) => setLid(from + (to - from) * ease(t)))
      }
      setLid(1)
      // 3. em destaque no centro
      await wait(TIMELINE.hold)
      // 4. viaja até a Hero enquanto o site acorda
      await reveal()
    }

    const skip = () => {
      fast = true
    }
    const events = ['keydown', 'pointerdown', 'wheel', 'touchstart'] as const
    events.forEach((e) => window.addEventListener(e, skip, { passive: true, once: true }))
    window.addEventListener('resize', sizeBox)

    run()

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      events.forEach((e) => window.removeEventListener(e, skip))
      window.removeEventListener('resize', sizeBox)
    }
  }, [onReveal, onDone])

  return (
    <div ref={overlay} aria-hidden="true" className="intro-overlay fixed inset-0 z-[200] flex items-center justify-center">
      <div ref={box} className="relative opacity-0 will-change-transform" style={{ aspectRatio: '248 / 152' }}>
        <ChromeEye handle={eye} fallback={<SilverSymbol className="h-full w-full" />} />
      </div>
    </div>
  )
}
