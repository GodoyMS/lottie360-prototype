import type { AdSpendRecord } from "@/types/analytics"

export type ResolvedAdChannels = Pick<AdSpendRecord, "channel_macro" | "channel_detallado">

/**
 * Returns the channel_macro / channel_detallado directly from the ad record.
 * The parametros-canales mapping is now a canal registry, not a per-ad lookup.
 */
export function resolveAdSpendChannels(
  ad: AdSpendRecord,
): ResolvedAdChannels {
  return {
    channel_macro: ad.channel_macro,
    channel_detallado: ad.channel_detallado,
  }
}

export function buildMappingLookup() {
  return new Map<string, never>()
}
