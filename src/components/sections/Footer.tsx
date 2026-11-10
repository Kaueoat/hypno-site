import { contact, nav, tagline, whatsappLink } from '../../config/site'
import { Logo } from '../ui/Logo'

export function Footer() {
  return (
    <footer className="border-t border-line" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="wrap grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="flex flex-col gap-6 md:col-span-5">
          <Logo className="h-7 w-auto self-start" />
          <p className="max-w-[30ch] text-muted">{tagline}</p>
        </div>
        <nav aria-label="Rodapé" className="md:col-span-3">
          <ul className="flex flex-col gap-3 text-[15px]">
            {nav.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="link-line text-muted transition-colors hover:text-ink">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-3 text-[15px] md:col-span-4">
          <a href={whatsappLink()} target="_blank" rel="noopener" className="link-line self-start text-ink">
            WhatsApp
          </a>
          <a href={`mailto:${contact.email}`} className="link-line self-start text-muted hover:text-ink">
            {contact.email}
          </a>
          <a href={contact.instagram} target="_blank" rel="noopener" className="link-line self-start text-muted hover:text-ink">
            Instagram {contact.instagramHandle}
          </a>
        </div>
      </div>
      <div className="wrap flex flex-wrap justify-between gap-4 border-t border-line py-6 text-[13px] text-muted">
        <span>© {new Date().getFullYear()} HYPNO. Todos os direitos reservados.</span>
        <span>Sites · Audiovisual · Direção criativa</span>
      </div>
    </footer>
  )
}
