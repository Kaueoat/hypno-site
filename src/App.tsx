import { useCallback, useEffect, useState } from 'react'
import { hideHero, initMaterialize, materializeHero } from './lib/materialize'
import { Nav } from './components/sections/Nav'
import { Hero } from './components/sections/Hero'
import { WebSection } from './components/sections/WebSection'
import { AudiovisualSection } from './components/sections/AudiovisualSection'
import { AboutSection } from './components/sections/AboutSection'
import { ProcessSection } from './components/sections/ProcessSection'
import { ContactSection } from './components/sections/ContactSection'
import { Footer } from './components/sections/Footer'
import { HalftoneBackground } from './components/visuals/HalftoneBackground'
import { CursorGlow } from './components/visuals/CursorGlow'
import { Intro } from './components/visuals/Intro'
import { GlassFilter } from './components/ui/liquid-glass-button'

type Phase = 'intro' | 'reveal' | 'done'
/**
 * A abertura toca a cada carregamento da página (navegar entre seções não a reinicia,
 * porque é tudo uma página só). Não toca quando o link já aponta para uma seção (#sobre etc.).
 */
function shouldPlayIntro() {
  if (typeof window === 'undefined') return false
  if (window.location.hash && window.location.hash !== '#top') return false
  return true
}

function setPhaseAttr(p: Phase) {
  const root = document.documentElement
  if (p === 'done') delete root.dataset.intro
  else root.dataset.intro = p
}

export default function App() {
  const [phase, setPhase] = useState<Phase>(() => {
    const p: Phase = shouldPlayIntro() ? 'intro' : 'done'
    setPhaseAttr(p) // antes do primeiro paint: sem flash do conteúdo
    if (p === 'intro' && 'scrollRestoration' in history) history.scrollRestoration = 'manual'
    return p
  })
  const [played] = useState(phase === 'intro')

  // Todo o texto do site materializa (bloom + grão) ao entrar na tela
  useEffect(() => {
    const stop = initMaterialize()
    if (played) hideHero()
    else materializeHero(200)
    return stop
  }, [played])

  const onReveal = useCallback(() => {
    setPhaseAttr('reveal')
    setPhase('reveal')
    materializeHero(450)
  }, [])
  const onDone = useCallback(() => {
    setPhaseAttr('done')
    setPhase('done')
  }, [])

  return (
    <>
      {/* Fundo do site inteiro: shader halftone + gradiente roxo do cursor */}
      <HalftoneBackground />
      <CursorGlow />
      <GlassFilter />

      {phase !== 'done' && <Intro onReveal={onReveal} onDone={onDone} />}

      <div id="site" className="relative z-[1]">
        <a
          href="#conteudo"
          className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-full bg-ink px-5 py-3 text-[14px] font-semibold text-bg transition-transform focus:translate-y-0"
        >
          Pular para o conteúdo
        </a>
        <Nav />
        <main id="conteudo">
          <Hero entrance={!played} />
          <WebSection />
          <AudiovisualSection />
          <AboutSection />
          <ProcessSection />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </>
  )
}
