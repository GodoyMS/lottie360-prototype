import type { LeadRecord } from "@/types/analytics"

function isoDate(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

const shopifyDetallado = ["wsp", "cambio", "tiktok", "TB13", "instagram", "referidos"] as const
const metaDetallado = [
  "120243819860760063",
  "120243819860780063",
  "120243876956030063",
  "120243884310180063",
] as const
const kommoDetallado = ["T72045", "TMR14", "Etiquetas de Lead"] as const

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

const fixedLeads: LeadRecord[] = [
  // May 2026
  { id: "LD-001", date: isoDate(2026, 5, 11), channel_macro: "Meta", channel_detallado: "120243819860760063", qualified: true },
  { id: "LD-002", date: isoDate(2026, 5, 11), channel_macro: "Kommo", channel_detallado: "T72045", qualified: true },
  { id: "LD-003", date: isoDate(2026, 5, 10), channel_macro: "Shopify", channel_detallado: "wsp", qualified: false },
  { id: "LD-004", date: isoDate(2026, 5, 10), channel_macro: "Meta", channel_detallado: "120243819860780063", qualified: true },
  { id: "LD-005", date: isoDate(2026, 5, 9), channel_macro: "Kommo", channel_detallado: "TMR14", qualified: true },
  { id: "LD-006", date: isoDate(2026, 5, 9), channel_macro: "Shopify", channel_detallado: "TB13", qualified: true },
  { id: "LD-007", date: isoDate(2026, 5, 8), channel_macro: "Meta", channel_detallado: "120243876956030063", qualified: false },
  { id: "LD-008", date: isoDate(2026, 5, 7), channel_macro: "Kommo", channel_detallado: "Etiquetas de Lead", qualified: true },
  // April 2026
  { id: "LD-100", date: isoDate(2026, 4, 30), channel_macro: "Meta", channel_detallado: "120243819860760063", qualified: true },
  { id: "LD-101", date: isoDate(2026, 4, 29), channel_macro: "Shopify", channel_detallado: "cambio", qualified: true },
  { id: "LD-102", date: isoDate(2026, 4, 28), channel_macro: "Meta", channel_detallado: "120243884310180063", qualified: false },
  { id: "LD-103", date: isoDate(2026, 4, 27), channel_macro: "Kommo", channel_detallado: "T72045", qualified: true },
  { id: "LD-104", date: isoDate(2026, 4, 26), channel_macro: "Shopify", channel_detallado: "instagram", qualified: true },
  { id: "LD-105", date: isoDate(2026, 4, 25), channel_macro: "Meta", channel_detallado: "120243876956030063", qualified: true },
]

// Generated leads for April and May 2026
const generated: LeadRecord[] = Array.from({ length: 50 }, (_, i) => {
  const isApril = i < 30
  const day = isApril ? 1 + (i % 29) : 1 + (i % 10)
  const month = isApril ? 4 : 5
  const macroRoll = i % 3
  const channel_macro = macroRoll === 0 ? "Meta" : macroRoll === 1 ? "Shopify" : "Kommo"
  const channel_detallado =
    channel_macro === "Meta"
      ? pick(metaDetallado)
      : channel_macro === "Shopify"
        ? pick(shopifyDetallado)
        : pick(kommoDetallado)

  return {
    id: `LD-${String(200 + i).padStart(3, "0")}`,
    date: isoDate(2026, month, day),
    channel_macro,
    channel_detallado,
    qualified: i % 3 !== 0,
  } satisfies LeadRecord
})

export const mockLeads: LeadRecord[] = [...fixedLeads, ...generated]
