import type { OrderRecord } from "@/types/analytics"

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

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function addDays(base: Date, n: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}

function randomOrder(i: number, date: Date): OrderRecord {
  const macroRoll = Math.random()
  const channel_macro =
    macroRoll < 0.45 ? "Shopify" : macroRoll < 0.78 ? "Meta" : "Kommo"

  const channel_detallado =
    channel_macro === "Shopify"
      ? pick(shopifyDetallado)
      : channel_macro === "Meta"
        ? pick(metaDetallado)
        : pick(kommoDetallado)

  const revenue = Math.round(45 + Math.random() * 420)
  const cost = Math.round(revenue * (0.12 + Math.random() * 0.35))

  const roll = Math.random()
  const payment_status: OrderRecord["payment_status"] =
    roll > 0.92 ? "pending" : roll > 0.96 ? "failed" : "paid"

  const oRoll = Math.random()
  const order_status: OrderRecord["order_status"] =
    oRoll > 0.9 ? "cancelled" : oRoll > 0.82 ? "pending" : "completed"

  return {
    order_id: `LO-${100420 + i}`,
    date: isoDate(date),
    channel_macro,
    channel_detallado,
    revenue,
    cost,
    pairs: Math.max(1, Math.round(revenue / 80 + Math.random() * 3)),
    payment_status,
    order_status,
  }
}

// Generate orders spread over ~70 days: all of May 2026 (up to 11th) and all of April 2026
const base = new Date("2026-05-11")
const startOffset = 70

export const mockOrders: OrderRecord[] = Array.from({ length: 120 }, (_, i) => {
  const daysBack = Math.floor(Math.random() * startOffset)
  return randomOrder(i, addDays(base, -daysBack))
}).sort((a, b) => (a.date < b.date ? 1 : -1))
