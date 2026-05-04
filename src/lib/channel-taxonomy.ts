import type { ChannelDetallado, ChannelMacro } from "@/types/analytics"

export const CHANNEL_MACROS: ChannelMacro[] = [
  "Paid Social",
  "Search",
  "Marketplace",
  "Organic",
  "Email",
]

export const DETALLADOS_BY_MACRO: Record<
  ChannelMacro,
  readonly ChannelDetallado[]
> = {
  "Paid Social": ["Meta Ads", "TikTok Ads", "Influencers", "YouTube Ads"],
  Search: ["Google Ads", "SEO / Contenido"],
  Marketplace: ["Amazon SP"],
  Organic: ["SEO / Contenido"],
  Email: ["CRM Email"],
}

export function detalladosForMacro(
  macro: ChannelMacro
): readonly ChannelDetallado[] {
  return DETALLADOS_BY_MACRO[macro]
}

export function normalizePair(
  macro: ChannelMacro,
  det: ChannelDetallado
): { canal_macro: ChannelMacro; canal_detallado: ChannelDetallado } {
  const allowed = DETALLADOS_BY_MACRO[macro]
  const canal_detallado = allowed.includes(det)
    ? det
    : (allowed[0] as ChannelDetallado)
  return { canal_macro: macro, canal_detallado }
}
