import { useEffect, useRef, useState, type RefObject } from 'react'

/** true quando o usuário pediu menos movimento no sistema. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

/**
 * Revela um elemento quando ele entra na tela.
 * Elementos que já estão visíveis no carregamento nunca ficam escondidos.
 */
export function useReveal<T extends HTMLElement>(threshold = 0.15): RefObject<T | null> {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.92) {
      el.setAttribute('data-fx-done', '') // já visível: sem animação
      return
    }
    el.setAttribute('data-pending', '')
    let doneTimer = 0
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.removeAttribute('data-pending')
            io.disconnect()
            // tira a máscara de grão depois que o texto materializou (performance)
            doneTimer = window.setTimeout(() => el.setAttribute('data-fx-done', ''), 3600)
          }
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      clearTimeout(doneTimer)
    }
  }, [threshold])
  return ref
}

/**
 * Progresso (0 → 1) de um elemento atravessando a tela.
 * 0 = topo do elemento no `start` da viewport; 1 = base do elemento no `end`.
 */
export function useScrollProgress<T extends HTMLElement>(
  onProgress: (p: number) => void,
  { start = 0.75, end = 0.5 }: { start?: number; end?: number } = {},
) {
  const ref = useRef<T | null>(null)
  const cb = useRef(onProgress)
  cb.current = onProgress
  useEffect(() => {
    let raf = 0
    const tick = () => {
      raf = 0
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const total = r.height + vh * (start - end)
      const p = Math.min(1, Math.max(0, (vh * start - r.top) / Math.max(1, total)))
      cb.current(p)
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    tick()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
      cancelAnimationFrame(raf)
    }
  }, [start, end])
  return ref
}

/** Parallax discreto: desloca o elemento em Y conforme o scroll. */
export function useParallax<T extends HTMLElement>(speed = 0.08) {
  const ref = useRef<T | null>(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    let raf = 0
    const tick = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const center = r.top + r.height / 2 - window.innerHeight / 2
      el.style.transform = `translate3d(0, ${(-center * speed).toFixed(1)}px, 0)`
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    tick()
    window.addEventListener('scroll', on, { passive: true })
    return () => {
      window.removeEventListener('scroll', on)
      cancelAnimationFrame(raf)
    }
  }, [speed, reduced])
  return ref
}
