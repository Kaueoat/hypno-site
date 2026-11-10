import { useEffect, useRef } from 'react'

/**
 * Imagem procedural de "longa exposição": rastros de luz, desfoque e grão.
 * Usada como PLACEHOLDER do portfólio enquanto não há fotos/vídeos reais.
 * Renderiza uma vez por tamanho (não a cada frame) — leve para a página.
 */

export type TrailVariant = 'streaks' | 'orb' | 'figure' | 'rays'

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const NEON = [196, 92, 255]
const WHITE = [250, 250, 250]
const GREY = [161, 161, 173]

function rgba(c: number[], a: number) {
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`
}

function streak(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, w: number, c: number[], a: number, blur: number) {
  const g = ctx.createLinearGradient(x, 0, x + len, 0)
  g.addColorStop(0, rgba(c, 0))
  g.addColorStop(0.55, rgba(c, a))
  g.addColorStop(0.85, rgba(c, a * 0.9))
  g.addColorStop(1, rgba(c, 0))
  ctx.shadowColor = rgba(c, a)
  ctx.shadowBlur = blur
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.ellipse(x + len / 2, y, len / 2, w / 2, 0, 0, Math.PI * 2)
  ctx.fill()
}

function blob(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: number[], a: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, rgba(c, a))
  g.addColorStop(0.45, rgba(c, a * 0.45))
  g.addColorStop(1, rgba(c, 0))
  ctx.fillStyle = g
  ctx.fillRect(x - r, y - r, r * 2, r * 2)
}

export function drawScene(canvas: HTMLCanvasElement, seed: number, variant: TrailVariant) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width
  const h = canvas.height
  const r = rng(seed)
  const s = Math.min(w, h)
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = '#0b0b0f'
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = 'lighter'

  if (variant === 'streaks' || variant === 'figure') {
    const cy = h * (0.35 + r() * 0.3)
    const n = variant === 'figure' ? 22 : 34
    for (let i = 0; i < n; i++) {
      const spread = variant === 'figure' ? 0.22 : 0.42
      const y = cy + (r() - 0.5) * h * spread * 2
      const len = w * (0.25 + r() * 0.85)
      const x = -w * 0.2 + r() * w * 0.8
      const thick = s * (0.004 + r() * r() * 0.07)
      const c = r() < 0.32 ? NEON : r() < 0.6 ? WHITE : GREY
      streak(ctx, x, y, len, thick, c, 0.05 + r() * 0.28, s * (0.015 + r() * 0.07))
    }
    if (variant === 'figure') {
      // forma luminosa vertical, como um corpo em movimento borrado
      const fx = w * (0.4 + r() * 0.2)
      for (let i = 0; i < 9; i++) {
        blob(ctx, fx + (r() - 0.5) * s * 0.18, h * (0.25 + i * 0.07), s * (0.07 + r() * 0.08), i % 3 === 0 ? NEON : WHITE, 0.16)
      }
    }
  }

  if (variant === 'orb') {
    blob(ctx, w * (0.2 + r() * 0.3), h * (0.2 + r() * 0.3), s * 0.75, [214, 170, 255], 0.38)
    blob(ctx, w * (0.5 + r() * 0.3), h * (0.4 + r() * 0.2), s * 0.6, NEON, 0.42)
    blob(ctx, w * 0.8, h * 0.8, s * 0.4, [120, 90, 255], 0.22)
  }

  if (variant === 'rays') {
    const ox = w * (0.15 + r() * 0.2)
    const oy = h * (0.5 + (r() - 0.5) * 0.3)
    for (let i = 0; i < 30; i++) {
      const ang = (r() - 0.5) * 0.9
      const len = w * (0.6 + r() * 0.8)
      ctx.save()
      ctx.translate(ox, oy)
      ctx.rotate(ang)
      streak(ctx, 0, 0, len, 1 + r() * s * 0.025, r() < 0.4 ? NEON : WHITE, 0.06 + r() * 0.25, 6 + r() * 20)
      ctx.restore()
    }
    blob(ctx, ox, oy, s * 0.22, WHITE, 0.35)
  }

  // vinheta
  ctx.globalCompositeOperation = 'source-over'
  ctx.shadowBlur = 0
  const v = ctx.createRadialGradient(w / 2, h / 2, s * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75)
  v.addColorStop(0, 'rgba(11,11,15,0)')
  v.addColorStop(1, 'rgba(11,11,15,0.85)')
  ctx.fillStyle = v
  ctx.fillRect(0, 0, w, h)

  // grão de filme embutido
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * 34
    d[i] += n
    d[i + 1] += n
    d[i + 2] += n
  }
  ctx.putImageData(img, 0, 0)
}

export function LightTrails({
  seed = 1,
  variant = 'streaks',
  className = '',
  drift = true,
}: {
  seed?: number
  variant?: TrailVariant
  className?: string
  drift?: boolean
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    let last = ''
    const render = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const w = Math.max(1, Math.round(rect.width * dpr))
      const h = Math.max(1, Math.round(rect.height * dpr))
      const key = `${Math.round(w / 40)}x${Math.round(h / 40)}`
      if (key === last) return
      last = key
      canvas.width = w
      canvas.height = h
      drawScene(canvas, seed, variant)
    }
    const ro = new ResizeObserver(render)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [seed, variant])
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full ${drift ? 'kenburns' : ''} ${className}`}
    />
  )
}
