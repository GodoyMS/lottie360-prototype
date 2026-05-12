import type { AdSpendRecord } from "@/types/analytics"

// Meta ad IDs (only Meta runs paid ads in this dataset)
const metaIds = [
  "120243819860760063",
  "120243819860780063",
  "120243876956030063",
  "120243884310180063",
] as const

function isoDate(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

// Fixed ad spend entries for April + May 2026
const fixedEntries: AdSpendRecord[] = [
  // May 2026
  {
    id: "AD-M01",
    ad_id: "120243819860760063",
    date: isoDate(2026, 5, 11),
    channel_macro: "Meta",
    channel_detallado: "120243819860760063",
    spend: 980,
    conversions: 28,
    revenue_attributed: 6400,
  },
  {
    id: "AD-M02",
    ad_id: "120243819860780063",
    date: isoDate(2026, 5, 10),
    channel_macro: "Meta",
    channel_detallado: "120243819860780063",
    spend: 740,
    conversions: 18,
    revenue_attributed: 3800,
  },
  {
    id: "AD-M03",
    ad_id: "120243876956030063",
    date: isoDate(2026, 5, 9),
    channel_macro: "Meta",
    channel_detallado: "120243876956030063",
    spend: 1100,
    conversions: 35,
    revenue_attributed: 9200,
  },
  {
    id: "AD-M04",
    ad_id: "120243884310180063",
    date: isoDate(2026, 5, 8),
    channel_macro: "Meta",
    channel_detallado: "120243884310180063",
    spend: 650,
    conversions: 14,
    revenue_attributed: 2900,
  },
  // April 2026
  {
    id: "AD-A01",
    ad_id: "120243819860760063",
    date: isoDate(2026, 4, 30),
    channel_macro: "Meta",
    channel_detallado: "120243819860760063",
    spend: 1240,
    conversions: 38,
    revenue_attributed: 8420,
  },
  {
    id: "AD-A02",
    ad_id: "120243819860780063",
    date: isoDate(2026, 4, 28),
    channel_macro: "Meta",
    channel_detallado: "120243819860780063",
    spend: 890,
    conversions: 22,
    revenue_attributed: 4100,
  },
  {
    id: "AD-A03",
    ad_id: "120243876956030063",
    date: isoDate(2026, 4, 27),
    channel_macro: "Meta",
    channel_detallado: "120243876956030063",
    spend: 2100,
    conversions: 55,
    revenue_attributed: 18900,
  },
  {
    id: "AD-A04",
    ad_id: "120243884310180063",
    date: isoDate(2026, 4, 26),
    channel_macro: "Meta",
    channel_detallado: "120243884310180063",
    spend: 640,
    conversions: 12,
    revenue_attributed: 2100,
  },
]

// Generated entries spread across April and May 2026
const generated: AdSpendRecord[] = Array.from({ length: 24 }, (_, i) => {
  const adId = metaIds[i % metaIds.length]!
  const isApril = i < 12
  const day = isApril ? 1 + (i % 25) : 1 + (i % 10)
  const month = isApril ? 4 : 5
  return {
    id: `AD-G${String(i + 1).padStart(2, "0")}`,
    ad_id: adId,
    date: isoDate(2026, month, day),
    channel_macro: "Meta" as const,
    channel_detallado: adId,
    spend: 300 + i * 45 + Math.round(Math.random() * 200),
    conversions: 4 + (i % 12),
    revenue_attributed: 1800 + i * 160 + Math.round(Math.random() * 500),
  }
})

export const mockAdSpend: AdSpendRecord[] = [...fixedEntries, ...generated]
