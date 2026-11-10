import { useRef } from 'react'
import { about, contact } from '../../config/site'
import { TeamCard } from '../ui/TeamCard'
import { useParallax, useScrollProgress } from '../../hooks/motion'
import { Reveal } from '../ui/Reveal'
import { SectionHeader } from '../ui/SectionHeader'
import { HypnoSymbol } from '../visuals/HypnoEye'

/** Frase que "acende" palavra por palavra conforme o scroll. */
function LightUpStatement({ text }: { text: string }) {
  const words = text.split(' ')
  const spans = useRef<(HTMLSpanElement | null)[]>([])
  const ref = useScrollProgress<HTMLParagraphElement>(
    (p) => {
      const lit = p * words.length * 1.15
      spans.current.forEach((el, i) => {
        if (!el) return
        const v = Math.min(1, Math.max(0, lit - i))
        el.style.opacity = String(0.32 + v * 0.68)
      })
    },
    { start: 0.85, end: 0.55 },
  )
  return (
    <p ref={ref} data-no-mat className="font-display text-[clamp(30px,4.4vw,64px)] font-bold leading-[1.02] tracking-[-0.035em]">
      {words.map((w, i) => (
        <span key={i} ref={(el) => { spans.current[i] = el }} className="transition-opacity duration-300">
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </p>
  )
}

export function AboutSection() {
  const symbol = useParallax<HTMLDivElement>(0.1)
  return (
    <section id="sobre" aria-labelledby="sobre-title" className="relative scroll-mt-20 overflow-hidden py-20 md:py-32">
      <div
        ref={symbol}
        aria-hidden="true"
        className="pointer-events-none absolute -right-[18vw] top-16 w-[70vw] max-w-[980px] text-ink opacity-[0.045] md:-right-[10vw]"
      >
        <HypnoSymbol className="w-full" />
      </div>

      <div className="wrap relative">
        <SectionHeader id="sobre-title" eyebrow={about.eyebrow} headline={about.headline} size="xl" />
        <Reveal variant="text" className="mt-10 md:ml-[50%] md:mt-14">
          <p className="max-w-[30ch] text-[clamp(18px,1.6vw,22px)] leading-[1.5] text-muted">{about.text}</p>
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 md:mt-20 md:ml-auto md:max-w-[760px]">
          {about.team.map((m, i) => (
            <Reveal key={m.name} delay={i * 120} className={i === 1 ? 'sm:mt-16' : ''}>
              <TeamCard member={m} fallbackHref={contact.instagram} />
            </Reveal>
          ))}
        </div>
        <div className="mt-20 border-t border-line pt-10 md:mt-28 md:pt-14">
          <LightUpStatement text={about.statement} />
        </div>
      </div>
    </section>
  )
}
