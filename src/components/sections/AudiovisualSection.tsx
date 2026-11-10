import { useEffect, useState } from 'react'
import { Play } from 'lucide-react'
import { audiovisual } from '../../config/site'
import { useReducedMotion } from '../../hooks/motion'
import { Reveal } from '../ui/Reveal'
import { SectionHeader } from '../ui/SectionHeader'
import { MediaFrame } from '../visuals/MediaFrame'
import type { TrailVariant } from '../visuals/LightTrails'

/** Timecode correndo, como num monitor de câmera. */
function Timecode() {
  const [t, setT] = useState(0)
  const reduced = useReducedMotion()
  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => setT((v) => v + 1), 1000 / 24)
    return () => clearInterval(id)
  }, [reduced])
  const f = t % 24
  const s = Math.floor(t / 24) % 60
  const m = Math.floor(t / 1440) % 60
  const p = (n: number) => String(n).padStart(2, '0')
  return <span className="tabular-nums">00:{p(m)}:{p(s)}:{p(f)}</span>
}

const VARIANTS: TrailVariant[] = ['rays', 'orb', 'streaks']

export function AudiovisualSection() {
  const { featured, gallery } = audiovisual
  const marqueeText = audiovisual.services.map((s) => s.title)

  return (
    <section id="audiovisual" aria-labelledby="av-title" className="relative isolate scroll-mt-20 overflow-hidden py-20 md:py-32">
      <div className="wrap relative">
        <SectionHeader
          id="av-title"
          eyebrow={audiovisual.eyebrow}
          headline={audiovisual.headline}
          description={audiovisual.description}
          size="xl"
        />

        {/* Vídeo em destaque */}
        <Reveal variant="mask" className="mt-14 md:mt-20">
          <div className="relative">
            <MediaFrame
              src={featured.src}
              poster={featured.poster}
              alt={featured.title}
              label="vídeo em destaque"
              seed={7}
              variant="figure"
              className="aspect-[4/5] w-full rounded-lg sm:aspect-video"
            />
            {featured.src ? (
              <div className="mt-3 text-[13px]">
                <div className="flex justify-between gap-4">
                  <span className="text-ink">{featured.client} — {featured.title}</span>
                  <span className="text-muted">Vídeo em destaque</span>
                </div>
                {featured.credits && <p className="mt-1 text-[11px] leading-snug text-muted/80">{featured.credits}</p>}
              </div>
            ) : (
            <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 font-mono text-[11px] uppercase tracking-[0.12em] text-ink/80 sm:p-6"
            >
              <div className="flex justify-end gap-4">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-ink" />
                  REC
                </span>
                <Timecode />
              </div>
              <div className="flex items-end justify-between gap-4">
                <span>4K · 24 fps</span>
                <span className="text-right normal-case tracking-normal">{featured.client || 'Seu reel aqui'}</span>
              </div>
            </div>
            <div className="absolute inset-0 grid place-items-center">
              <span
                className="grid h-20 w-20 place-items-center rounded-full bg-neon text-bg sm:h-24 sm:w-24"
                style={{ boxShadow: 'var(--glow-md)' }}
                aria-hidden="true"
              >
                <Play size={28} fill="currentColor" className="translate-x-[2px]" />
              </span>
            </div>
            </>
            )}
          </div>
        </Reveal>
      </div>

      {/* Serviços em movimento */}
      <div className="relative mt-16 overflow-hidden border-y border-line py-6 md:mt-24">
        <ul className="sr-only">
          {marqueeText.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <div className="marquee" aria-hidden="true">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center">
              {marqueeText.map((t) => (
                <span key={t + k} className="flex items-center font-display text-[clamp(28px,4.4vw,64px)] font-bold tracking-[-0.03em] text-ink/90">
                  <span className="px-6 md:px-10" style={{ textShadow: '-14px 0 10px rgba(250,250,250,0.12)' }}>
                    {t}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-muted/50" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Galeria */}
      <div className="wrap relative mt-16 md:mt-24">
        <div className="grid gap-3 sm:grid-cols-12 md:gap-4">
          {gallery.map((g, i) => (
            <Reveal
              key={g.title}
              variant="mask"
              delay={i * 120}
              className={`${g.orientation === 'vertical' ? 'sm:col-span-4' : 'sm:col-span-6 sm:mt-6'} ${i === 1 ? 'sm:mt-16' : ''}`}
            >
              <MediaFrame
                src={g.src}
                poster={g.poster}
                alt={`${g.title} — ${g.kind}`}
                label={g.kind.toLowerCase()}
                seed={20 + i * 13}
                variant={VARIANTS[i % VARIANTS.length]}
                className={`w-full rounded-md ${g.orientation === 'vertical' ? 'aspect-[3/4]' : 'aspect-video'}`}
              />
              <div className="mt-3 flex justify-between text-[13px]">
                <span className="text-ink">{g.title}</span>
                <span className="text-muted">{g.kind}</span>
              </div>
              {g.credits && <p className="mt-1 text-[11px] leading-snug text-muted/80">{g.credits}</p>}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
