import { useRef, useState, type KeyboardEvent } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { sites } from '../../config/site'
import { useParallax } from '../../hooks/motion'
import { Reveal } from '../ui/Reveal'
import { SectionHeader } from '../ui/SectionHeader'
import { BrowserMockup, PhoneMockup } from '../visuals/Mockups'
import { SiteProjectCard } from '../visuals/SiteProjectCard'

const TABS = [
  { id: 'servicos', label: 'Serviços' },
  { id: 'projetos', label: 'Projetos' },
] as const
type Tab = (typeof TABS)[number]['id']

export function WebSection() {
  const phone = useParallax<HTMLDivElement>(0.12)
  const [tab, setTab] = useState<Tab>('servicos')
  const btns = useRef<(HTMLButtonElement | null)[]>([])
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const i = TABS.findIndex((t) => t.id === tab)
    const n = (i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length
    setTab(TABS[n].id)
    btns.current[n]?.focus()
  }

  return (
    <section id="sites" aria-labelledby="sites-title" className="relative scroll-mt-20 py-20 md:py-32">
      <div className="wrap">
        <SectionHeader id="sites-title" eyebrow={sites.eyebrow} headline={sites.headline} description={sites.description} />

        <div role="tablist" aria-label="Sites" onKeyDown={onKey} className="mt-10 inline-flex rounded-full border border-line bg-raised/60 p-1 backdrop-blur md:mt-14">
          {TABS.map((t, i) => {
            const on = tab === t.id
            return (
              <button
                key={t.id}
                ref={(el) => { btns.current[i] = el }}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={on}
                aria-controls={`panel-${t.id}`}
                tabIndex={on ? 0 : -1}
                onClick={() => setTab(t.id)}
                className={`relative h-10 rounded-full px-5 text-[14px] font-semibold transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-chrome ${on ? 'chrome-bg text-bg' : 'text-muted hover:text-ink'}`}
              >
                {t.label}
                {t.id === 'projetos' && <span className={`ml-2 font-mono text-[11px] ${on ? 'text-bg/70' : 'text-muted/70'}`}>{sites.projects.filter((p) => !p.soon).length}</span>}
              </button>
            )
          })}
        </div>

        <div role="tabpanel" id="panel-servicos" aria-labelledby="tab-servicos" hidden={tab !== 'servicos'} className="tab-panel">
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
                    className="text-muted transition-[transform,color] duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-ink"
                  />
                  <h3 className="text-[20px] font-bold leading-tight tracking-[-0.02em]">{s.title}</h3>
                  <p className="text-[15px] text-muted">{s.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
        </div>

        <div role="tabpanel" id="panel-projetos" aria-labelledby="tab-projetos" hidden={tab !== 'projetos'} className="tab-panel">
          <ul className="mt-14 grid gap-x-6 gap-y-14 md:mt-20 md:grid-cols-2">
            {sites.projects.map((p, i) => (
              <li key={p.title + i} className={i === 0 ? 'md:col-span-2' : ''}>
                <SiteProjectCard p={p} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
