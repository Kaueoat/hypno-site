import { useRef, useState } from 'react'
import { process } from '../../config/site'
import { useScrollProgress } from '../../hooks/motion'
import { Reveal } from '../ui/Reveal'
import { SectionHeader } from '../ui/SectionHeader'

export function ProcessSection() {
  const fill = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(-1)
  const n = process.steps.length

  const track = useScrollProgress<HTMLOListElement>(
    (p) => {
      if (fill.current) fill.current.style.transform = `scaleY(${p})`
      setActive(p <= 0 ? -1 : Math.min(n - 1, Math.floor(p * n * 0.999 + 0.15)))
    },
    { start: 0.7, end: 0.55 },
  )

  return (
    <section id="como-funciona" aria-labelledby="processo-title" className="relative scroll-mt-20 py-20 md:py-32">
      <div className="wrap">
        <SectionHeader id="processo-title" eyebrow={process.eyebrow} headline={process.headline} />

        <ol ref={track} className="relative mt-16 md:mt-24 md:ml-[33.333%]">
          {/* Linha de progresso */}
          <div aria-hidden="true" className="absolute bottom-6 left-[11px] top-6 w-px bg-line md:left-[15px]">
            <div ref={fill} className="h-full w-full origin-top bg-neon" style={{ transform: 'scaleY(0)' }} />
          </div>

          {process.steps.map((s, i) => {
            const on = i <= active
            const current = i === active
            return (
              <li key={s.n} className="relative grid grid-cols-[24px_1fr] gap-6 pb-10 last:pb-0 md:grid-cols-[32px_1fr] md:gap-10 md:pb-14">
                <span aria-hidden="true" className="relative mt-[10px] flex justify-center md:mt-[14px]">
                  <span
                    className={`h-[11px] w-[11px] rounded-full border transition-all duration-500 md:h-[13px] md:w-[13px] ${
                      on ? 'border-neon bg-neon' : 'border-muted/50 bg-bg'
                    }`}
                    style={current ? { boxShadow: 'var(--glow-sm)' } : undefined}
                  />
                </span>
                <Reveal variant="text" delay={120}>
                  <div className="grid gap-3 md:grid-cols-[120px_1fr] md:gap-8">
                    <span
                      className={`font-mono text-[14px] tabular-nums transition-colors duration-500 md:pt-3 ${on ? 'text-neon' : 'text-muted'}`}
                    >
                      {s.n}
                    </span>
                    <div>
                      <h3 className={`text-[clamp(28px,3.4vw,48px)] font-bold leading-[1.02] tracking-[-0.035em] transition-colors duration-500 ${on ? 'text-ink' : 'text-muted'}`}>
                        {s.title}
                      </h3>
                      <p className="mt-3 max-w-[44ch] text-[17px] leading-relaxed text-muted">{s.text}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
