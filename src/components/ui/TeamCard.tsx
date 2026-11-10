import { ArrowUpRight } from 'lucide-react'
import { LiquidLayers } from './liquid-glass-button'
import { HypnoSymbol } from '../visuals/HypnoEye'

export type TeamMember = { name: string; role?: string; bio: string; photo: string; href: string }

/** Card de sócio em liquid glass: foto retangular (4:5), nome e bio. O card inteiro é um link externo. */
export function TeamCard({ member, fallbackHref }: { member: TeamMember; fallbackHref: string }) {
  const href = member.href || fallbackHref
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="group relative isolate flex flex-col gap-5 rounded-[28px] p-3 pb-6 outline-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:scale-[1.015] focus-visible:ring-2 focus-visible:ring-neon focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      aria-label={`${member.name} — abrir perfil`}
    >
      <LiquidLayers radius="rounded-[28px]" />

      <div className="relative z-10 aspect-[4/5] overflow-hidden rounded-[20px] bg-raised">
        {member.photo ? (
          <img
            src={member.photo}
            alt={member.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-[transform,filter] duration-700 group-hover:scale-[1.04] group-hover:brightness-110"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted">
            <HypnoSymbol className="w-16 opacity-30" />
            <span className="text-[12px] uppercase tracking-[0.12em]">Foto</span>
          </div>
        )}
      </div>

      <div className="relative z-10 flex items-start justify-between gap-4 px-3">
        <div className="min-w-0">
          <h3 className="text-[22px] font-bold leading-tight tracking-[-0.02em]">{member.name}</h3>
          {member.role && <p className="eyebrow mt-1">{member.role}</p>}
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{member.bio}</p>
        </div>
        <ArrowUpRight
          size={20}
          aria-hidden="true"
          className="mt-1 shrink-0 text-muted transition-[transform,color] duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-neon"
        />
      </div>
    </a>
  )
}
