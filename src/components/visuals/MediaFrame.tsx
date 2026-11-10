import { useEffect, useRef } from 'react'
import { LightTrails, type TrailVariant } from './LightTrails'

/**
 * Moldura de mídia do portfólio.
 * - Com `src`: mostra o vídeo (.mp4/.webm, mudo, em loop) ou a imagem real.
 * - Sem `src`: mostra uma imagem procedural de longa exposição e um selo
 *   "Placeholder", deixando claro que o conteúdo será inserido depois.
 */
export function MediaFrame({
  src,
  poster,
  alt,
  label,
  seed,
  variant,
  className = '',
}: {
  src?: string
  poster?: string
  alt: string
  label: string
  seed: number
  variant: TrailVariant
  className?: string
}) {
  const isVideo = !!src && /\.(mp4|webm|mov)(\?|$)/i.test(src)
  const vref = useRef<HTMLVideoElement>(null)
  // toca só quando está na tela (economiza bateria e dados)
  useEffect(() => {
    const v = vref.current
    if (!v) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.15 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [src])
  return (
    <figure className={`media-frame relative overflow-hidden bg-bg ${className}`}>
      {src ? (
        isVideo ? (
          <video
            ref={vref}
            className="absolute inset-0 h-full w-full object-cover"
            src={src}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={alt}
          />
        ) : (
          <img className="absolute inset-0 h-full w-full object-cover" src={src} alt={alt} loading="lazy" decoding="async" />
        )
      ) : (
        <>
          <LightTrails seed={seed} variant={variant} />
          <figcaption className="absolute left-3 top-3 rounded-full border border-ink/15 bg-bg/70 px-3 py-1 text-[11px] font-medium tracking-wide text-muted backdrop-blur">
            Placeholder · {label}
          </figcaption>
        </>
      )}
    </figure>
  )
}
