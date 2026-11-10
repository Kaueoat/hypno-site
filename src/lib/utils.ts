/** Junta classes condicionais (equivalente leve ao `cn` do shadcn). */
export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ')
}
