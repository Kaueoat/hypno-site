import lockup from '../../assets/hypno-lockup-dark.svg'

/** Logo oficial (símbolo + nome), versão para fundo escuro. Não editar a arte. */
export function Logo({ className = 'h-7 w-auto' }: { className?: string }) {
  return <img src={lockup} alt="HYPNO" className={className} width={512} height={117} />
}
