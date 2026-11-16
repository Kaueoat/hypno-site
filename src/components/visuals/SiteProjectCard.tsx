import { useEffect, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import type { SiteProject } from '../../config/site'

/**
 * Card de site publicado: janela de navegador com o vídeo do site rolando
 * no desktop (mudo, em loop, só toca quando aparece na tela).
 * Clique abre o site real em nova aba. Itens "Em breve" mostram um esqueleto animado.
 */
export function SiteProjectCard({ p }: { p: SiteProject }) {
  const vref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = vref.current
    if (!v) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.2 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [p.video])

  const frame = (
    <div className="overflow-hidden rounded-xl border border-line bg-raised transition-[border-color,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 group-hover:border-[#4a4a55]">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-line" />
        <span className="h-2 w-2 rounded-full bg-line" />
        <span className="h-2 w-2 rounded-full bg-line" />
        <div className="ml-2 flex h-5 flex-1 items-center rounded-full bg-bg px-3 font-mono text-[10px] text-muted">{p.domain}</div>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden bg-bg">
        {p.video && !p.soon ? (
          <video
            ref={vref}
            className="absolute inset-0 h-full w-full object-cover object-top"
            src={p.video}
            poster={p.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={`Prévia do site ${p.title} rolando`}
          />
        ) : (
          <div className="site-skeleton absolute inset-0 p-[7%]" aria-hidden="true">
            <div className="site-skeleton-track">
              {[0, 1].map((k) => (
                <div key={k} className="space-y-[6%] pb-[6%]">
                  <div className="flex justify-between"><div className="h-2 w-[18%] rounded-full bg-ink/30" /><div className="h-2 w-[30%] rounded-full bg-muted/20" /></div>
                  <div className="h-5 w-[70%] rounded bg-ink/15" />
                  <div className="h-5 w-[52%] rounded bg-ink/15" />
                  <div className="h-2 w-[60%] rounded-full bg-muted/20" />
                  <div className="grid grid-cols-3 gap-3"><div className="aspect-[4/3] rounded bg-muted/10" /><div className="aspect-[4/3] rounded bg-muted/10" /><div className="aspect-[4/3] rounded bg-muted/10" /></div>
                </div>
              ))}
            </div>
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink/15 bg-bg/80 px-4 py-1.5 text-[12px] font-medium tracking-wide text-muted backdrop-blur">
              Em breve
            </span>
          </div>
        )}
      </div>
    </div>
  )

  const caption = (
    <div className="mt-4 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-[18px] font-bold leading-tight tracking-[-0.02em]">{p.title}</h3>
        <p className="mt-1 text-[13px] text-muted">
          {p.client}
          {p.year ? ` · ${p.year}` : ''}
        </p>
      </div>
      {p.href && !p.soon && (
        <ArrowUpRight
          size={18}
          aria-hidden="true"
          className="mt-1 shrink-0 text-muted transition-[transform,color] duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-ink"
        />
      )}
    </div>
  )

  if (p.href && !p.soon)
    return (
      <a href={p.href} target="_blank" rel="noopener" className="group block outline-none focus-visible:ring-2 focus-visible:ring-chrome focus-visible:ring-offset-4 focus-visible:ring-offset-bg rounded-xl">
        {frame}
        {caption}
      </a>
    )
  return (
    <div className="group">
      {frame}
      {caption}
    </div>
  )
}
