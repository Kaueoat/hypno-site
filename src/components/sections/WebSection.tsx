import { ArrowUpRight } from 'lucide-react'
import { sites } from '../../config/site'
import { useParallax } from '../../hooks/motion'
import { Reveal } from '../ui/Reveal'
import { SectionHeader } from '../ui/SectionHeader'
import { BrowserMockup, PhoneMockup } from '../visuals/Mockups'

export function WebSection() {
  const phone = useParallax<HTMLDivElement>(0.12)

  return (
    <section id="sites" aria-labelledby="sites-title" className="relative scroll-mt-20 py-20 md:py-32">
      <div className="wrap">
        <SectionHeader id="sites-title" eyebrow={sites.eyebrow} headline={sites.headline} description={sites.description} />

        <div className="relative mt-14 md:mt-20 md:px-[6%]">
          <Reveal variant="mask">
            <BrowserMockup />
          </Reveal>
          <div ref={phone} className="absolute -bottom-20 -right-1 w-[52%] max-w-[230px] sm:w-[30%] md:right-[2%]">
            <Reveal variant="up" delay={200}>
              <PhoneMockup />
            </Reveal>
          </div>
        </div>

        <ul className="mt-28 grid border-t border-line sm:mt-32 sm:grid-cols-2 lg:grid-cols-4">
          {sites.services.map((s, i) => (
            <li key={s.title} className="border-b border-line sm:[&:nth-child(odd)]:border-r lg:border-r lg:last:border-r-0">
              <Reveal delay={i * 80} className="h-full">
                <div className="group flex h-full flex-col gap-3 px-1 py-8 transition-colors duration-500 hover:bg-raised/40 sm:px-6">
                  <ArrowUpRight
                    size={18}
                    aria-hidden="true"
                    className="text-muted transition-[transform,color] duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-neon"
                  />
                  <h3 className="text-[20px] font-bold leading-tight tracking-[-0.02em]">{s.title}</h3>
                  <p className="text-[15px] text-muted">{s.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
