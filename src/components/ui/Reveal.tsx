import type { CSSProperties, ElementType, ReactNode } from 'react'
import { useReveal } from '../../hooks/motion'

type Props = {
  children: ReactNode
  as?: ElementType
  variant?: 'up' | 'blur' | 'mask' | 'fade' | 'text'
  delay?: number
  className?: string
  style?: CSSProperties
}

/** Envolve qualquer bloco com uma animação de entrada no scroll. */
export function Reveal({ children, as: Tag = 'div', variant = 'up', delay = 0, className, style }: Props) {
  const ref = useReveal<HTMLElement>()
  return (
    <Tag
      ref={ref}
      data-reveal={variant}
      className={className}
      style={{ ...style, ['--d' as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}

/** Título com entrada palavra por palavra (motion blur). */
export function SplitHeading({
  text,
  as: Tag = 'h2',
  className,
  id,
}: {
  text: string
  as?: ElementType
  className?: string
  id?: string
}) {
  const words = text.split(' ')
  return (
    <Tag id={id} className={className} aria-label={text} data-mat-words="">
      {words.map((w, i) => (
        <span key={i} aria-hidden="true">
          <span className="split-word">
            {w}
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}
