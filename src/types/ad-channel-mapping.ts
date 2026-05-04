import type { ChannelDetallado, ChannelMacro } from "@/types/analytics"

/** Mapeo publicidad → canales (atribución). `row_id` es interno; la tabla de producto usa ad_id + canales. */
export type AdChannelMappingRow = {
  row_id: string
  ad_id: string
  canal_macro: ChannelMacro
  canal_detallado: ChannelDetallado
}
