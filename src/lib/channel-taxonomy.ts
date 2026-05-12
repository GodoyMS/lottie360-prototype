import type { ChannelDetallado, ChannelMacro } from "@/types/analytics"

export const CHANNEL_MACROS: ChannelMacro[] = ["Shopify", "Meta", "Kommo"]

export const DETALLADOS_BY_MACRO: Record<string, readonly string[]> = {
  Shopify: ["wsp", "cambio", "tiktok", "TB13", "instagram", "referidos"],
  Meta: [
    "120243819860760063",
    "120243819860780063",
    "120243876956030063",
    "120243884310180063",
  ],
  Kommo: ["T72045", "TMR14", "Etiquetas de Lead"],
}

export function detalladosForMacro(macro: string): readonly string[] {
  return DETALLADOS_BY_MACRO[macro] ?? []
}

export function normalizePair(
  macro: string,
  det: string
): { canal_macro: ChannelMacro; canal_detallado: ChannelDetallado } {
  return {
    canal_macro: macro as ChannelMacro,
    canal_detallado: det as ChannelDetallado,
  }
}
