import { createContext } from "react"
import type { AdChannelMappingRow } from "@/types/ad-channel-mapping"

export type CreateMappingInput = {
  canal_macro: string
  canal_detallado: string
}

export type UpdateMappingInput = {
  row_id: string
  canal_macro: string
  canal_detallado: string
}

export type MutationResult =
  | { ok: true }
  | { ok: false; error: string }

export type ChannelAttributionContextValue = {
  mappings: readonly AdChannelMappingRow[]
  /** Increments on every mutation to trigger recalculation in views. */
  revision: number
  updatedAt: number
  createMapping: (input: CreateMappingInput) => MutationResult
  updateMapping: (input: UpdateMappingInput) => MutationResult
  deleteMapping: (rowId: string) => void
  resetToSeed: () => void
}

export const ChannelAttributionContext =
  createContext<ChannelAttributionContextValue | null>(null)
