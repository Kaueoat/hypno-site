import { useState, type FormEvent } from 'react'
import { ArrowUpRight, Check, MessageCircle } from 'lucide-react'
import { contact, cta, whatsappLink } from '../../config/site'
import { LiquidButton } from '../ui/liquid-glass-button'
import { Reveal, SplitHeading } from '../ui/Reveal'

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent'; link: string } | { kind: 'error'; link: string }

const field =
  'w-full rounded-[4px] border border-line bg-raised px-4 py-3.5 text-[16px] text-ink placeholder:text-muted/70 transition-colors duration-300 hover:border-[#3a3a45] focus:border-neon focus:outline-none'

export function ContactSection() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>
    const next: Record<string, string> = {}
    if (!data.nome?.trim()) next.nome = 'Diga como podemos te chamar.'
    if (!data.servico) next.servico = 'Escolha o serviço que você procura.'
    if (!data.descricao?.trim() || data.descricao.trim().length < 10)
      next.descricao = 'Conte um pouco mais sobre o projeto (mínimo de 10 caracteres).'
    setErrors(next)
    if (Object.keys(next).length) {
      const first = form.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)
      first?.focus()
      return
    }

    const message = [
      `Olá, HYPNO! Meu nome é ${data.nome.trim()}${data.empresa?.trim() ? `, da ${data.empresa.trim()}` : ''}.`,
      `Serviço: ${data.servico}.`,
      `Projeto: ${data.descricao.trim()}`,
    ].join('\n')
    const link = whatsappLink(message)

    if (contact.formEndpoint) {
      setStatus({ kind: 'sending' })
      try {
        const res = await fetch(contact.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error(String(res.status))
        setStatus({ kind: 'sent', link })
        form.reset()
      } catch {
        setStatus({ kind: 'error', link })
      }
      return
    }

    // Sem endpoint: abre o WhatsApp com a mensagem pronta
    window.open(link, '_blank', 'noopener')
    setStatus({ kind: 'sent', link })
  }

  return (
    <section id="contato" aria-labelledby="contato-title" className="relative isolate scroll-mt-20 overflow-hidden py-20 md:py-32">
      <div className="wrap relative grid gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <SplitHeading
            id="contato-title"
            text={cta.headline}
            className="text-[clamp(40px,6.4vw,104px)] font-bold leading-[0.92] tracking-[-0.045em]"
          />
          <Reveal variant="text" delay={400}>
            <p className="mt-8 max-w-[38ch] text-[19px] leading-relaxed text-muted">{cta.text}</p>
          </Reveal>
          <Reveal delay={250}>
            <LiquidButton href={whatsappLink()} target="_blank" rel="noopener" variant="neon" size="xxl" className="mt-10">
              <MessageCircle size={20} aria-hidden="true" />
              {cta.button}
              <ArrowUpRight size={18} aria-hidden="true" />
            </LiquidButton>
          </Reveal>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <Reveal>
            <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5" aria-describedby="form-status">
              <p className="eyebrow">Ou envie pelo formulário</p>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="f-nome" className="text-[14px] text-ink">Nome</label>
                  <input
                    id="f-nome"
                    name="nome"
                    autoComplete="name"
                    className={field}
                    placeholder="Seu nome"
                    aria-invalid={!!errors.nome}
                    aria-describedby={errors.nome ? 'e-nome' : undefined}
                  />
                  {errors.nome && <p id="e-nome" className="text-[13px] text-[#ff5a6e]">{errors.nome}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="f-empresa" className="text-[14px] text-ink">
                    Empresa <span className="text-muted">(opcional)</span>
                  </label>
                  <input id="f-empresa" name="empresa" autoComplete="organization" className={field} placeholder="Nome da empresa" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="f-servico" className="text-[14px] text-ink">Serviço desejado</label>
                <select
                  id="f-servico"
                  name="servico"
                  defaultValue=""
                  className={`${field} appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='12'%20height='8'%20fill='none'%3E%3Cpath%20d='M1%201.5l5%205%205-5'%20stroke='%23a1a1ad'%20stroke-width='1.5'/%3E%3C/svg%3E")] bg-[position:right_16px_center] bg-no-repeat pr-10`}
                  aria-invalid={!!errors.servico}
                  aria-describedby={errors.servico ? 'e-servico' : undefined}
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  {cta.serviceOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                {errors.servico && <p id="e-servico" className="text-[13px] text-[#ff5a6e]">{errors.servico}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="f-descricao" className="text-[14px] text-ink">Descrição do projeto</label>
                <textarea
                  id="f-descricao"
                  name="descricao"
                  rows={5}
                  className={`${field} resize-y`}
                  placeholder="O que você precisa, prazos, referências…"
                  aria-invalid={!!errors.descricao}
                  aria-describedby={errors.descricao ? 'e-descricao' : undefined}
                />
                {errors.descricao && <p id="e-descricao" className="text-[13px] text-[#ff5a6e]">{errors.descricao}</p>}
              </div>
              <LiquidButton type="submit" size="lg" className="mt-2 self-start" disabled={status.kind === 'sending'}>
                {status.kind === 'sending' ? 'Enviando…' : 'Enviar mensagem'}
                <ArrowUpRight size={18} aria-hidden="true" />
              </LiquidButton>

              <div id="form-status" role="status" aria-live="polite" className="min-h-[24px] text-[15px]">
                {status.kind === 'sent' && (
                  <p className="flex flex-wrap items-center gap-2 text-ink">
                    <Check size={18} className="text-neon" aria-hidden="true" />
                    {contact.formEndpoint ? 'Recebemos sua mensagem. Respondemos em breve.' : 'Sua mensagem está pronta no WhatsApp.'}
                    {!contact.formEndpoint && (
                      <a href={status.link} target="_blank" rel="noopener" className="link-line text-muted hover:text-ink">
                        Abrir conversa
                      </a>
                    )}
                  </p>
                )}
                {status.kind === 'error' && (
                  <p className="text-[#ff5a6e]">
                    Não conseguimos enviar agora.{' '}
                    <a href={status.link} target="_blank" rel="noopener" className="underline">
                      Fale com a gente pelo WhatsApp
                    </a>
                    .
                  </p>
                )}
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
