import type { AdChannelMappingRow } from "@/types/ad-channel-mapping"
import type { AdSpendRecord } from "@/types/analytics"

export type ResolvedAdChannels = Pick<
  AdSpendRecord,
  "channel_macro" | "channel_detallado"
>

/** Aplica mapeo por `ad_id` si existe; si no, datos crudos del registro de gasto. */
export function resolveAdSpendChannels(
  ad: AdSpendRecord,
  mappings: readonly AdChannelMappingRow[]
): ResolvedAdChannels {
  const hit = mappings.find((m) => m.ad_id === ad.ad_id)
  if (hit) {
    return {
      channel_macro: hit.canal_macro,
      channel_detallado: hit.canal_detallado,
    }
  }
  return {
    channel_macro: ad.channel_macro,
    channel_detallado: ad.channel_detallado,
  }
}

export function buildMappingLookup(
  mappings: readonly AdChannelMappingRow[]
): Map<string, AdChannelMappingRow> {
  const map = new Map<string, AdChannelMappingRow>()
  for (const m of mappings) {
    map.set(m.ad_id, m)
  }
  return map
}
