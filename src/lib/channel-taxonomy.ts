import type { ChannelDetallado, ChannelMacro } from "@/types/analytics"

export const CHANNEL_MACROS: ChannelMacro[] = ["Shopify", "Meta", "Kommo"]

export const DETALLADOS_BY_MACRO: Record<
  ChannelMacro,
  readonly ChannelDetallado[]
> = {
  Shopify: ["wsp", "cambio", "tiktok", "TB13", "instagram", "referidos"],
  Meta: [
    "120243819860760063",
    "120243819860780063",
    "120243876956030063",
    "120243884310180063",
  ],
  Kommo: ["T72045", "TMR14", "Etiquetas de Lead"],
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
