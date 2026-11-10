/**
 * Mockups de interface desenhados em HTML/CSS, no estilo da HYPNO.
 * São ilustrações de serviço (marcadas como "exemplo"), não trabalhos de clientes.
 */

export function BrowserMockup({ className = '' }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-line bg-raised ${className}`}
      role="img"
      aria-label="Exemplo de interface de site em um navegador"
    >
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <div className="ml-3 flex h-6 flex-1 items-center rounded-full bg-bg px-3 font-mono text-[10px] text-muted sm:text-[11px]">
          seunegocio.com.br
        </div>
      </div>
      <div className="relative bg-bg p-5 sm:p-8">
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 rounded-full bg-ink/80" />
          <div className="hidden gap-4 sm:flex">
            <div className="h-2 w-10 rounded-full bg-muted/40" />
            <div className="h-2 w-10 rounded-full bg-muted/40" />
            <div className="h-2 w-10 rounded-full bg-muted/40" />
          </div>
          <div className="h-6 w-16 rounded-full border border-line" />
        </div>
        <div className="mt-8 grid gap-6 sm:mt-12 sm:grid-cols-[1.3fr_1fr] sm:items-end">
          <div>
            <p className="font-display text-[clamp(22px,3.2vw,40px)] font-bold leading-[0.98] tracking-[-0.035em] text-ink">
              Seu produto,
              <br />
              em destaque.
            </p>
            <div className="mt-4 h-2 w-4/5 rounded-full bg-muted/30" />
            <div className="mt-2 h-2 w-3/5 rounded-full bg-muted/30" />
            <div className="mt-6 flex gap-3">
              <span className="inline-flex h-8 items-center rounded-full bg-neon px-4 text-[11px] font-semibold text-bg shadow-[0_0_24px_rgba(196,92,255,0.55)]">
                Quero agora
              </span>
              <span className="inline-flex h-8 items-center rounded-full border border-line px-4 text-[11px] text-muted">
                Saiba mais
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="aspect-[4/5] rounded-lg bg-raised" />
            <div className="mt-6 aspect-[4/5] rounded-lg bg-raised" />
          </div>
        </div>
        <span className="absolute bottom-3 right-4 font-mono text-[10px] uppercase tracking-widest text-muted/70">
          exemplo
        </span>
      </div>
    </div>
  )
}

const MENU = [
  { name: 'Hambúrguer da casa', desc: 'Pão brioche, blend 180 g, cheddar', price: '32,90' },
  { name: 'Batata rústica', desc: 'Alecrim e páprica defumada', price: '18,00' },
  { name: 'Limonada da casa', desc: 'Limão, hortelã e gengibre', price: '12,50' },
]

export function PhoneMockup({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-[34px] border border-line bg-raised p-2 ${className}`}
      role="img"
      aria-label="Exemplo de cardápio digital em um celular"
    >
      <div className="overflow-hidden rounded-[27px] bg-bg">
        <div className="mx-auto mt-2 h-5 w-20 rounded-full bg-raised" />
        <div className="px-4 pb-5 pt-4">
          <p className="eyebrow !text-[9px]">Cardápio digital · exemplo</p>
          <p className="mt-1 font-display text-[19px] font-bold tracking-[-0.03em]">Mais pedidos</p>
          <div className="mt-3 flex gap-1.5">
            {['Lanches', 'Porções', 'Bebidas'].map((c, i) => (
              <span
                key={c}
                className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${
                  i === 0 ? 'bg-ink text-bg' : 'border border-line text-muted'
                }`}
              >
                {c}
              </span>
            ))}
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            {MENU.map((m) => (
              <li key={m.name} className="flex gap-3">
                <div className="h-12 w-12 shrink-0 rounded-lg bg-raised" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-ink">{m.name}</p>
                  <p className="truncate text-[9.5px] text-muted">{m.desc}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-ink">R$ {m.price}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex h-8 items-center justify-center rounded-full bg-ink text-[10px] font-semibold text-bg">
            Ver sacola · 2 itens
          </div>
        </div>
      </div>
    </div>
  )
}

export function CodeCard({ className = '' }: { className?: string }) {
  const lines: [string, string][] = [
    ['text-muted', '// landing page · campanha'],
    ['text-ink', '<Hero'],
    ['text-ink', '  headline="Seu produto, em destaque."'],
    ['text-ink', '  cta={{ label: "Quero agora" }}'],
    ['text-ink', '/>'],
    ['text-muted', '// responsivo · rápido · SEO'],
  ]
  return (
    <div
      className={`rounded-xl border border-line bg-raised/95 p-4 font-mono text-[10.5px] leading-[1.7] backdrop-blur sm:text-[11.5px] ${className}`}
      aria-hidden="true"
    >
      {lines.map(([c, t], i) => (
        <div key={i} className={`${c} whitespace-pre`}>
          <span className="mr-3 inline-block w-3 text-right text-line">{i + 1}</span>
          {t}
        </div>
      ))}
    </div>
  )
}
