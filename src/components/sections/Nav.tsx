import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { nav, whatsappLink } from '../../config/site'
import { Logo } from '../ui/Logo'
import { LiquidButton } from '../ui/liquid-glass-button'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Destaca a seção visível no menu
  useEffect(() => {
    const els = nav.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled || open ? 'border-b border-line/70 bg-bg/75 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="wrap flex h-[72px] items-center justify-between gap-6">
        <a href="#top" aria-label="HYPNO — voltar ao início" className="shrink-0" onClick={() => setOpen(false)}>
          <Logo className="h-[26px] w-auto sm:h-[30px]" />
        </a>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-9 text-[14px] text-muted">
            {nav.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  className="link-line transition-colors hover:text-ink aria-[current=true]:text-ink"
                  aria-current={active === n.id ? 'true' : undefined}
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LiquidButton href="#contato" size="sm" className="max-sm:hidden">
            Contato
            <ArrowUpRight size={16} aria-hidden="true" />
          </LiquidButton>
          <LiquidButton
            type="button"
            size="icon"
            className="lg:hidden"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </LiquidButton>
        </div>
      </div>

      {/* Menu mobile */}
      <div
        id="mobile-menu"
        className={`fixed inset-x-0 bottom-0 top-[calc(72px+env(safe-area-inset-top,0px))] bg-bg transition-[opacity,visibility] duration-500 lg:hidden ${
          open ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <nav aria-label="Menu móvel" className="wrap flex h-full flex-col justify-between pb-10 pt-8">
          <ul className="flex flex-col gap-1">
            {nav.map((n, i) => (
              <li
                key={n.id}
                className="transition-[opacity,transform,filter] duration-700"
                style={{
                  transitionDelay: open ? `${80 + i * 60}ms` : '0ms',
                  opacity: open ? 1 : 0,
                  transform: open ? 'none' : 'translateX(-24px)',
                  filter: open ? 'none' : 'blur(6px)',
                }}
              >
                <a
                  href={`#${n.id}`}
                  onClick={() => setOpen(false)}
                  className="block border-b border-line py-4 font-display text-[clamp(30px,8vw,44px)] font-bold tracking-[-0.03em]"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <LiquidButton href={whatsappLink()} target="_blank" rel="noopener" variant="neon" className="self-start">
            Fale com a Hypno
            <ArrowUpRight size={18} aria-hidden="true" />
          </LiquidButton>
        </nav>
      </div>
    </header>
  )
}
