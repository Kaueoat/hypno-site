import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { hero, whatsappLink } from '../../config/site'
import { HypnoEye } from '../visuals/HypnoEye'
import { LiquidButton } from '../ui/liquid-glass-button'

export function Hero({ entrance = true }: { entrance?: boolean }) {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden"
      style={{ minHeight: 'min(100svh, 1000px)' }}
    >
      <div className="wrap relative flex flex-col pb-10 pt-[104px] md:pb-14" style={{ minHeight: 'inherit' }}>
        <div className="flex flex-1 items-center justify-center py-6 md:py-4">
          <HypnoEye entrance={entrance} className="w-[min(92vw,820px)] md:translate-x-[7%]" />
        </div>

        <div className="grid items-end gap-8 md:grid-cols-12 md:gap-10">
          <h1
            id="hero-title"
            data-mat-hero="0" className="font-display text-[clamp(40px,6.2vw,96px)] font-bold leading-[0.94] tracking-[-0.045em] md:col-span-7"
            style={{ ['--d' as string]: '500ms' }}
          >
            {hero.headline}
          </h1>
          <div
            className="hero-in flex flex-col gap-6 md:col-span-5 md:pb-2 lg:col-span-4 lg:col-start-9"
            style={{ ['--d' as string]: '700ms' }}
          >
            <p className="eyebrow" data-mat-hero="1">{hero.sub}</p>
            <div className="flex flex-wrap gap-3">
              <LiquidButton href="#sites">
                {hero.primary}
                <ArrowDown size={18} aria-hidden="true" />
              </LiquidButton>
              <LiquidButton href={whatsappLink()} target="_blank" rel="noopener" variant="neon">
                {hero.secondary}
                <ArrowUpRight size={18} aria-hidden="true" />
              </LiquidButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
