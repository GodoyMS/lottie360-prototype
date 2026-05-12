import type { AdChannelMappingRow } from "@/types/ad-channel-mapping"
import { DETALLADOS_BY_MACRO, CHANNEL_MACROS } from "@/lib/channel-taxonomy"

/** Default catalog: one row per macro × detallado pair from the taxonomy. */
export function buildSeedAdChannelMappings(): AdChannelMappingRow[] {
  const rows: AdChannelMappingRow[] = []
  for (const macro of CHANNEL_MACROS) {
    for (const det of DETALLADOS_BY_MACRO[macro] ?? []) {
      rows.push({
        row_id: `seed_${macro}_${det}`,
        canal_macro: macro,
        canal_detallado: det,
      })
    }
  }
  return rows
}
