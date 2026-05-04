import { createContext } from "react"
import type { AdChannelMappingRow } from "@/types/ad-channel-mapping"
import type { ChannelDetallado, ChannelMacro } from "@/types/analytics"

export type CreateMappingInput = {
  ad_id: string
  canal_macro: ChannelMacro
  canal_detallado: ChannelDetallado
}

export type UpdateMappingInput = {
  row_id: string
  canal_macro: ChannelMacro
  canal_detallado: ChannelDetallado
}

export type MutationResult =
  | { ok: true }
  | { ok: false; error: string }

export type ChannelAttributionContextValue = {
  mappings: AdChannelMappingRow[]
  /** Se incrementa en cada mutación para forzar recálculo en vistas. */
  revision: number
  updatedAt: number
  createMapping: (input: CreateMappingInput) => MutationResult
  updateMapping: (input: UpdateMappingInput) => MutationResult
  deleteMapping: (rowId: string) => void
  resetToSeed: () => void
}

export const ChannelAttributionContext =
  createContext<ChannelAttributionContextValue | null>(null)
