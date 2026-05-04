import type { OrderRecord } from "@/types/analytics"

const macros = [
  "Paid Social",
  "Search",
  "Marketplace",
  "Organic",
  "Email",
] as const

const detalladoByMacro: Record<(typeof macros)[number], OrderRecord["channel_detallado"][]> = {
  "Paid Social": ["Meta Ads", "TikTok Ads", "Influencers"],
  Search: ["Google Ads", "SEO / Contenido"],
  Marketplace: ["Amazon SP"],
  Organic: ["SEO / Contenido"],
  Email: ["CRM Email"],
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function randomOrder(i: number, baseDate: Date): OrderRecord {
  const macro = pick([...macros])
  const channel_detallado = pick(detalladoByMacro[macro])
  const revenue = Math.round(45 + Math.random() * 420)
  const cost = Math.round(revenue * (0.12 + Math.random() * 0.35))
  const roll = Math.random()
  const payment_status =
    roll > 0.88 ? "pending" : roll > 0.94 ? "failed" : "paid"
  const order_roll = Math.random()
  const order_status =
    order_roll > 0.9
      ? "cancelled"
      : order_roll > 0.82
        ? "pending"
        : order_roll > 0.97
          ? "refunded"
          : "completed"

  const d = new Date(baseDate)
  d.setDate(d.getDate() - (i % 45))

  return {
    order_id: `LO-${100420 + i}`,
    date: d.toISOString().slice(0, 10),
    channel_macro: macro,
    channel_detallado,
    revenue,
    cost,
    pairs: Math.max(1, Math.round(revenue / 80 + Math.random() * 3)),
    payment_status,
    order_status,
  }
}

const base = new Date()
export const mockOrders: OrderRecord[] = Array.from({ length: 64 }, (_, i) =>
  randomOrder(i, base)
).sort((a, b) => (a.date < b.date ? 1 : -1))
