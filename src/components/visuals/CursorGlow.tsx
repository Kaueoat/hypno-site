import { useEffect, useRef } from 'react'

/** Gradiente roxo bem sutil que acompanha o cursor (só em dispositivos com mouse). */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const cur = { ...target }
    let raf = 0
    let shown = false
    const loop = () => {
      raf = 0
      const k = reduced ? 1 : 0.12
      cur.x += (target.x - cur.x) * k
      cur.y += (target.y - cur.y) * k
      el.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0) translate(-50%, -50%)`
      if (Math.abs(target.x - cur.x) > 0.3 || Math.abs(target.y - cur.y) > 0.3) raf = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX
      target.y = e.clientY
      if (!shown) {
        shown = true
        cur.x = target.x
        cur.y = target.y
        el.style.opacity = '1'
      }
      if (!raf) raf = requestAnimationFrame(loop)
    }
    const onLeave = () => {
      shown = false
      el.style.opacity = '0'
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-0 h-[240px] w-[240px] rounded-full opacity-0 mix-blend-screen transition-opacity duration-700"
      style={{
        background:
          'radial-gradient(closest-side, rgba(196,92,255,0.14), rgba(176,38,255,0.05) 50%, rgba(176,38,255,0) 100%)',
      }}
    />
  )
}
