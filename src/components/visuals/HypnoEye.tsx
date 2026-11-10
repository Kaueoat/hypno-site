import { useEffect, useId, useRef, type CSSProperties, type Ref } from 'react'
import { useReducedMotion } from '../../hooks/motion'

/**
 * Símbolo oficial da HYPNO, vivo.
 *
 * Geometria idêntica ao logo (hypno-symbol.svg): amêndoa + íris fatiadas em
 * 4 faixas horizontais com deslocamentos fixos; pupila inteira e nítida.
 *
 * Comportamentos:
 * - Íris/pupila acompanham o cursor (easing + inércia, limitadas à amêndoa).
 * - Glitch sutil de vez em quando: as 4 faixas do logo deslizam alguns pixels e voltam.
 * - Hover: as faixas dão uma leve balançada.
 * - Scroll: as pálpebras fecham o olho conforme a página desce.
 * - Mobile: olhar automático lento + segue o toque.
 */

const ALMOND = 'M24 100 C 62 44, 150 40, 188 100 C 150 160, 62 156, 24 100 Z'
export const IRIS = { cx: 110, cy: 100, r: 36 }
/** Pupila centralizada no anel da íris (as faixas deslocam o anel ~4 unidades para a esquerda) */
export const PUPIL = { cx: 106, cy: 100, r: 16 }
/** [y, altura, deslocamento X] de cada faixa — valores do logo oficial */
const BANDS: [number, number, number][] = [
  [54, 20, -8],
  [77, 20, 0],
  [100, 20, -12],
  [123, 23, -4],
]
export const MAX_X = 30
export const MAX_Y = 11
export const VIEWBOX = '-24 24 248 152'

/**
 * Pálpebras (máscara sobre a arte original — o símbolo nunca é redesenhado).
 * A pálpebra de baixo fica fixa; a de cima desce, como num olho de verdade.
 *   k = 1     → aberto (exatamente o logo)
 *   k ≈ 0.38  → quase fechado (LID_ALMOST): só a parte de baixo da íris aparece
 *   k = 0     → fechado: resta uma linha curva, a "linha dos cílios"
 */
export const LID_ALMOST = 0.38
export function lidPath(k: number) {
  const u1 = (146 + (44 - 146) * k).toFixed(2)
  const u2 = (150 + (40 - 150) * k).toFixed(2)
  return `M18 100 C 62 ${u1}, 150 ${u2}, 194 100 C 150 166, 62 162, 18 100 Z`
}

type ArtProps = {
  uid: string
  holeRef?: Ref<SVGCircleElement>
  pupilRef?: Ref<SVGCircleElement>
  lidRef?: Ref<SVGPathElement>
  bandRefs?: { current: (SVGUseElement | null)[] }
  animated?: boolean
}

export function EyeArt({ uid, holeRef, pupilRef, lidRef, bandRefs, animated }: ArtProps) {
  return (
    <>
      <defs>
        <mask id={`${uid}-m`} maskUnits="userSpaceOnUse" x="-40" y="0" width="280" height="200">
          <rect x="-40" y="0" width="280" height="200" fill="#fff" />
          <circle ref={holeRef} cx={IRIS.cx} cy={IRIS.cy} r={IRIS.r} fill="#000" />
        </mask>
        <path id={`${uid}-eye`} d={ALMOND} mask={`url(#${uid}-m)`} />
        {BANDS.map(([y, h], i) => (
          <clipPath id={`${uid}-b${i}`} key={i}>
            <rect x="-40" y={y} width="280" height={h} />
          </clipPath>
        ))}
        <clipPath id={`${uid}-lid`}>
          <path ref={lidRef} d={lidPath(1)} />
        </clipPath>
      </defs>
      <g clipPath={lidRef ? `url(#${uid}-lid)` : undefined}>
        {BANDS.map(([, , dx], i) => (
          <g
            key={i}
            className={animated ? 'eye-band' : undefined}
            style={animated ? ({ ['--d' as string]: `${120 + i * 90}ms` } as CSSProperties) : undefined}
          >
            <g clipPath={`url(#${uid}-b${i})`}>
              <use
                ref={bandRefs ? (el) => { bandRefs.current[i] = el } : undefined}
                href={`#${uid}-eye`}
                transform={`translate(${dx} 0)`}
              />
            </g>
          </g>
        ))}
        <circle
          ref={pupilRef}
          className={animated ? 'eye-pupil' : undefined}
          cx={PUPIL.cx}
          cy={PUPIL.cy}
          r={PUPIL.r}
        />
      </g>
    </>
  )
}

export function HypnoEye({ className = '', entrance = true }: { className?: string; entrance?: boolean }) {
  const uid = 'eye' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const wrapRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<SVGSVGElement>(null)
  const holeRef = useRef<SVGCircleElement>(null)
  const pupilRef = useRef<SVGCircleElement>(null)
  const lidRef = useRef<SVGPathElement>(null)
  const bandRefs = useRef<(SVGUseElement | null)[]>([])
  const reduced = useReducedMotion()

  useEffect(() => {
    const wrap = wrapRef.current
    const hole = holeRef.current
    const pupil = pupilRef.current
    const lid = lidRef.current
    const glow = glowRef.current
    if (!wrap || !hole || !pupil || !lid) return

    const target = { x: 0, y: 0 }
    const cur = { x: 0, y: 0 }
    const glitch = [0, 0, 0, 0]
    let wobbleStart = -1
    let raf = 0
    let visible = true
    let touchUntil = 0
    const touchOnly = window.matchMedia('(hover: none)').matches
    const t0 = performance.now()
    const timers: number[] = []

    /* ---------- íris ---------- */
    const aimAt = (px: number, py: number) => {
      const r = wrap.getBoundingClientRect()
      const cx = r.left + r.width * ((110 + 24) / 248)
      const cy = r.top + r.height * ((100 - 24) / 152)
      const dx = px - cx
      const dy = py - cy
      const dist = Math.hypot(dx, dy) || 1
      const k = Math.min(1, dist / (r.width * 0.55))
      target.x = (dx / dist) * k
      target.y = (dy / dist) * k
    }

    const applyIris = () => {
      let x = cur.x
      let y = cur.y
      const m = Math.hypot(x, y)
      if (m > 1) {
        x /= m
        y /= m
      }
      const ox = x * MAX_X
      const oy = y * MAX_Y
      hole.setAttribute('cx', (IRIS.cx + ox).toFixed(2))
      hole.setAttribute('cy', (IRIS.cy + oy).toFixed(2))
      pupil.setAttribute('cx', (PUPIL.cx + ox).toFixed(2))
      pupil.setAttribute('cy', (PUPIL.cy + oy).toFixed(2))
    }

    /* ---------- faixas (glitch + hover) ---------- */
    const applyBands = (now: number) => {
      let wobbling = false
      bandRefs.current.forEach((el, i) => {
        if (!el) return
        let w = 0
        if (wobbleStart >= 0) {
          const t = (now - wobbleStart) / 1000
          if (t < 0.9) {
            wobbling = true
            w = 5 * Math.sin(t * 26 + i * 1.4) * Math.exp(-t * 4.5) * (i % 2 ? -1 : 1)
          }
        }
        el.setAttribute('transform', `translate(${(BANDS[i][2] + glitch[i] + w).toFixed(2)} 0)`)
      })
      if (!wobbling) wobbleStart = -1
      return wobbling
    }

    const loop = (now: number) => {
      raf = 0
      if (!visible) return
      if (touchOnly && !reduced && now > touchUntil) {
        const t = (now - t0) / 1000
        target.x = Math.sin(t * 0.55) * 0.75 + Math.sin(t * 1.7) * 0.1
        target.y = Math.sin(t * 0.8 + 1.2) * 0.55
      }
      const ease = 0.075
      cur.x += (target.x - cur.x) * ease
      cur.y += (target.y - cur.y) * ease
      applyIris()
      const wobbling = applyBands(now)
      const settled = Math.abs(target.x - cur.x) < 0.001 && Math.abs(target.y - cur.y) < 0.001
      if (!settled || wobbling || (touchOnly && !reduced)) raf = requestAnimationFrame(loop)
    }
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(loop)
    }

    /* Glitch: de tempos em tempos, 2–3 quadros curtos de deslocamento sutil */
    const scheduleGlitch = () => {
      if (reduced) return
      const id = window.setTimeout(() => {
        if (visible && !document.hidden) {
          const frames = 2 + Math.round(Math.random())
          for (let f = 0; f < frames; f++) {
            timers.push(
              window.setTimeout(() => {
                for (let i = 0; i < 4; i++) glitch[i] = Math.random() < 0.65 ? (Math.random() - 0.5) * 10 : 0
                applyBands(performance.now())
              }, f * 70),
            )
          }
          timers.push(
            window.setTimeout(() => {
              glitch.fill(0)
              applyBands(performance.now())
            }, frames * 70 + 40),
          )
        }
        scheduleGlitch()
      }, 3500 + Math.random() * 5000)
      timers.push(id)
    }

    /* ---------- pálpebras no scroll ---------- */
    let lastK = -1
    const applyLid = () => {
      const p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.32)))
      const e = p * p * (3 - 2 * p) // smoothstep
      const k = Math.max(0, 1 - e)
      if (Math.abs(k - lastK) < 0.002) return
      lastK = k
      lid.setAttribute('d', lidPath(k))
      if (glow) {
        glow.style.transform = `scaleY(${(0.15 + 0.85 * k).toFixed(3)})`
        glow.style.opacity = String(0.5 * k)
      }
    }
    let scrollRaf = 0
    const onScroll = () => {
      if (!scrollRaf)
        scrollRaf = requestAnimationFrame(() => {
          scrollRaf = 0
          applyLid()
        })
    }

    /* ---------- eventos ---------- */
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      aimAt(e.clientX, e.clientY)
      kick()
    }
    const onLeave = () => {
      target.x = 0
      target.y = 0
      kick()
    }
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      touchUntil = performance.now() + 2500
      aimAt(t.clientX, t.clientY)
      kick()
    }
    const onEnter = () => {
      if (reduced) return
      wobbleStart = performance.now()
      kick()
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) kick()
    })
    io.observe(wrap)

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    wrap.addEventListener('pointerenter', onEnter)
    applyLid()
    kick()
    // primeiro glitch só depois da animação de entrada
    timers.push(window.setTimeout(scheduleGlitch, 1800))

    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      cancelAnimationFrame(scrollRaf)
      timers.forEach(clearTimeout)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      wrap.removeEventListener('pointerenter', onEnter)
    }
  }, [reduced])

  return (
    <div ref={wrapRef} data-hero-eye className={`hero-eye relative ${className}`} style={{ aspectRatio: '248 / 152' }}>
      {/* Glow oficial: cópia desfocada atrás da forma nítida (fecha junto com o olho) */}
      <svg
        ref={glowRef}
        aria-hidden="true"
        viewBox={VIEWBOX}
        className={`${entrance ? 'eye-glow ' : ''}absolute inset-0 h-full w-full`}
        style={{ fill: 'var(--color-neon)', filter: 'blur(clamp(14px, 3.2vw, 40px))', opacity: 0.5, transformOrigin: '50% 80%' }}
      >
        <EyeArt uid={`${uid}g`} />
      </svg>
      <svg
        role="img"
        aria-label="Símbolo da HYPNO: um olho que acompanha o cursor"
        viewBox={VIEWBOX}
        className="relative h-full w-full"
        style={{ fill: 'var(--color-neon)' }}
      >
        <EyeArt uid={uid} holeRef={holeRef} pupilRef={pupilRef} lidRef={lidRef} bandRefs={bandRefs} animated={entrance} />
      </svg>
    </div>
  )
}

/** Símbolo estático (usos gráficos secundários). */
export function HypnoSymbol({ className = '', color = 'currentColor' }: { className?: string; color?: string }) {
  const uid = 'sym' + useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg aria-hidden="true" viewBox="8 50 184 100" className={className} style={{ fill: color }}>
      <EyeArt uid={uid} />
    </svg>
  )
}
