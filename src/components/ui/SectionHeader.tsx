import { Reveal, SplitHeading } from './Reveal'

export function SectionHeader({
  id,
  eyebrow,
  headline,
  description,
  size = 'lg',
}: {
  id: string
  eyebrow: string
  headline: string
  description?: string
  size?: 'lg' | 'xl'
}) {
  return (
    <div className="grid gap-6 md:grid-cols-12 md:items-end md:gap-10">
      <div className="md:col-span-8">
        <Reveal variant="fade">
          <p className="eyebrow mb-5 flex items-center gap-3">
            <span className="h-px w-8 bg-muted/60" aria-hidden="true" />
            {eyebrow}
          </p>
        </Reveal>
        <SplitHeading
          id={id}
          text={headline}
          className={`font-bold tracking-[-0.04em] ${
            size === 'xl'
              ? 'text-[clamp(44px,8.4vw,132px)] leading-[0.9]'
              : 'text-[clamp(36px,5.6vw,80px)] leading-[0.96]'
          }`}
        />
      </div>
      {description && (
        <Reveal variant="text" className="md:col-span-4" delay={350}>
          <p className="max-w-[42ch] text-[17px] leading-relaxed text-muted">{description}</p>
        </Reveal>
      )}
    </div>
  )
}
