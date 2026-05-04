import type { AdChannelMappingRow } from "@/types/ad-channel-mapping"
import { mockAdSpend } from "@/data/ads"

/** Catálogo inicial: un mapeo por cada `ad_id` distinto en el dataset de gasto. */
export function buildSeedAdChannelMappings(): AdChannelMappingRow[] {
  const seen = new Set<string>()
  const rows: AdChannelMappingRow[] = []

  for (const ad of mockAdSpend) {
    if (seen.has(ad.ad_id)) continue
    seen.add(ad.ad_id)
    rows.push({
      row_id: `seed_${ad.ad_id}`,
      ad_id: ad.ad_id,
      canal_macro: ad.channel_macro,
      canal_detallado: ad.channel_detallado,
    })
  }

  return rows.sort((a, b) => a.ad_id.localeCompare(b.ad_id))
}
