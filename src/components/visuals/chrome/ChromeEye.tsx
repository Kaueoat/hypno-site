import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChromeEyeRenderer, type EyeState } from './ChromeEyeRenderer'

/**
 * Canvas do olho em cromo. Quem usa controla o estado pelo `handle`
 * (pálpebra, íris, glitch e inclinação do reflexo); o componente cuida do loop
 * de renderização (só roda quando está na tela e a aba está visível).
 * Sem WebGL, mostra o `fallback` (SVG prata).
 */
export type ChromeEyeHandle = {
  set: (p: Partial<EyeState> & { tilt?: [number, number] }) => void
}

export function ChromeEye({
  handle,
  fallback,
  className = '',
  label,
}: {
  handle: { current: ChromeEyeHandle | null }
  fallback: ReactNode
  className?: string
  label?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const r = new ChromeEyeRenderer(canvas)
    if (!r.ok) {
      setFailed(true)
      return
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const state: EyeState = { lid: 1, iris: [0, 0], bands: [0, 0, 0, 0] }
    const tilt: [number, number] = [0, 0]
    const tiltCur: [number, number] = [0, 0]
    let dirty = true
    let visible = true
    let raf = 0
    const t0 = performance.now()
    let nextSpark = t0 + 2500
    let sparkAt = -1

    const frame = (now: number) => {
      raf = 0
      if (!visible || document.hidden) return
      if (dirty) {
        r.setState(state)
        dirty = false
      }
      tiltCur[0] += (tilt[0] - tiltCur[0]) * 0.06
      tiltCur[1] += (tilt[1] - tiltCur[1]) * 0.06
      // brilho em estrela: pisca de vez em quando
      if (!reduced && now > nextSpark) {
        sparkAt = now
        nextSpark = now + 3500 + Math.random() * 4000
      }
      const st = sparkAt < 0 ? 1 : (now - sparkAt) / 900
      const spark = st < 1 ? Math.sin(st * Math.PI) : 0
      const glint = 0.28 * state.lid + spark * 0.9 * state.lid
      r.render(reduced ? 0 : (now - t0) / 1000, tiltCur, glint)
      if (!reduced) raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }

    handle.current = {
      set: (p) => {
        if (p.lid !== undefined && p.lid !== state.lid) (state.lid = p.lid), (dirty = true)
        if (p.iris && (p.iris[0] !== state.iris[0] || p.iris[1] !== state.iris[1])) (state.iris = [p.iris[0], p.iris[1]]), (dirty = true)
        if (p.bands) (state.bands = [p.bands[0], p.bands[1], p.bands[2], p.bands[3]]), (dirty = true)
        if (p.tilt) (tilt[0] = p.tilt[0]), (tilt[1] = p.tilt[1])
        kick()
      },
    }

    const ro = new ResizeObserver(() => {
      const b = canvas.getBoundingClientRect()
      r.resize(b.width, b.height)
      dirty = true
      kick()
    })
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) kick()
    })
    io.observe(canvas)
    const onVis = () => kick()
    document.addEventListener('visibilitychange', onVis)
    kick()
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      handle.current = null
    }
  }, [handle])

  if (failed) return <>{fallback}</>
  return <canvas ref={ref} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={`block h-full w-full ${className}`} />
}
