import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

/**
 * Liquid Glass button — adaptado do componente "liquid-glass-button" (shadcn/21st.dev)
 * para o projeto HYPNO, sem dependências extras (@radix-ui/react-slot e cva não são
 * necessários aqui). Mesma construção: camada de sombras internas + camada com
 * backdrop-filter SVG (#container-glass) + conteúdo acima.
 *
 * - `href` → renderiza <a>; sem `href` → <button>.
 * - Formato pill (padrão da marca).
 * - `variant="neon"`: texto e reflexo roxos para a ação principal.
 */

type Variant = 'default' | 'neon'
type Size = 'sm' | 'lg' | 'xl' | 'xxl' | 'icon'

const base =
  'group/liquid relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold tracking-[-0.005em] outline-none transition-transform duration-300 hover:scale-105 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-neon focus-visible:ring-offset-2 focus-visible:ring-offset-bg [&_svg]:pointer-events-none [&_svg]:shrink-0'

const sizes: Record<Size, string> = {
  sm: 'h-10 px-5 text-[14px]',
  lg: 'h-12 px-7 text-[15px]',
  xl: 'h-[52px] px-8 text-[15px]',
  xxl: 'h-14 px-10 text-[16px]',
  icon: 'h-10 w-10',
}

const variants: Record<Variant, string> = {
  default: 'text-ink',
  neon: 'text-neon',
}

/** Sombras da versão escura do componente original (reflexos brancos internos). */
const GLASS_SHADOW =
  '0 0 8px rgba(0,0,0,0.03), 0 2px 6px rgba(0,0,0,0.08), inset 3px 3px 0.5px -3.5px rgba(255,255,255,0.09), inset -3px -3px 0.5px -3.5px rgba(255,255,255,0.85), inset 1px 1px 1px -0.5px rgba(255,255,255,0.6), inset -1px -1px 1px -0.5px rgba(255,255,255,0.6), inset 0 0 6px 6px rgba(255,255,255,0.12), inset 0 0 2px 2px rgba(255,255,255,0.06), 0 0 12px rgba(0,0,0,0.15)'

const NEON_SHADOW =
  '0 0 8px rgba(0,0,0,0.03), 0 2px 6px rgba(0,0,0,0.08), inset 3px 3px 0.5px -3.5px rgba(255,255,255,0.09), inset -3px -3px 0.5px -3.5px rgba(232,200,255,0.85), inset 1px 1px 1px -0.5px rgba(232,200,255,0.6), inset -1px -1px 1px -0.5px rgba(232,200,255,0.6), inset 0 0 6px 6px rgba(196,92,255,0.16), inset 0 0 2px 2px rgba(196,92,255,0.1), 0 0 14px rgba(196,92,255,0.18)'

type Common = { variant?: Variant; size?: Size; className?: string; children: ReactNode }
type AsLink = Common & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'>
type AsButton = Common & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>

function omit(obj: Record<string, unknown>, keys: string[]) {
  const out: Record<string, unknown> = {}
  for (const k in obj) if (!keys.includes(k)) out[k] = obj[k]
  return out
}

export function LiquidLayers({ variant = 'default', radius = 'rounded-full' }: { variant?: Variant; radius?: string }) {
  return (
    <>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-0 ${radius} transition-all duration-300`}
        style={{ boxShadow: variant === 'neon' ? NEON_SHADOW : GLASS_SHADOW }}
      />
      <span
        aria-hidden="true"
        className={`liquid-backdrop pointer-events-none absolute inset-0 -z-10 overflow-hidden ${radius}`}
        style={{ backdropFilter: 'url("#container-glass")' }}
      />
    </>
  )
}

export function LiquidButton(props: AsLink | AsButton) {
  const { variant = 'default', size = 'xl', className, children } = props
  const cls = cn(base, sizes[size], variants[variant], className)
  const inner = (
    <>
      <LiquidLayers variant={variant} />
      <span className="pointer-events-none relative z-10 inline-flex items-center gap-2">{children}</span>
    </>
  )
  const rest = omit(props as unknown as Record<string, unknown>, ['variant', 'size', 'className', 'children'])
  if (props.href !== undefined) {
    return (
      <a data-slot="button" className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {inner}
      </a>
    )
  }
  return (
    <button data-slot="button" className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {inner}
    </button>
  )
}

/**
 * Filtro SVG usado pelo backdrop-filter dos botões. Renderize UMA vez na página
 * (em App). Navegadores sem suporte a backdrop-filter com url() usam o blur da classe
 * `.liquid-backdrop` como alternativa.
 */
export function GlassFilter() {
  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
      <defs>
        <filter id="container-glass" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves={1} seed={1} result="turbulence" />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="70" xChannelSelector="R" yChannelSelector="B" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  )
}
