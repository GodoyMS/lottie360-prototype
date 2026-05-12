import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { toast } from "sonner"
import { buildSeedAdChannelMappings } from "@/data/ad-channel-mappings-seed"
import {
  ChannelAttributionContext,
  type ChannelAttributionContextValue,
  type CreateMappingInput,
  type MutationResult,
  type UpdateMappingInput,
} from "@/hooks/channel-attribution-context"
import type { AdChannelMappingRow } from "@/types/ad-channel-mapping"

const STORAGE_KEY = "lottie360_ad_channel_mappings_v2"

function loadFromStorage(): AdChannelMappingRow[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    return parsed as AdChannelMappingRow[]
  } catch {
    return null
  }
}

function initialMappings(): AdChannelMappingRow[] {
  return loadFromStorage() ?? buildSeedAdChannelMappings()
}

export function ChannelAttributionProvider({ children }: { children: ReactNode }) {
  const [mappings, setMappings] = useState<AdChannelMappingRow[]>(initialMappings)
  const [revision, setRevision] = useState(0)
  const [updatedAt, setUpdatedAt] = useState(() => Date.now())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings))
    } catch {
      /* ignore */
    }
  }, [mappings])

  const bump = useCallback(() => {
    setRevision((r) => r + 1)
    setUpdatedAt(Date.now())
  }, [])

  const createMapping = useCallback(
    (input: CreateMappingInput): MutationResult => {
      const canal_macro = input.canal_macro.trim()
      const canal_detallado = input.canal_detallado.trim()
      if (!canal_macro) return { ok: false, error: "El canal global es obligatorio." }
      if (!canal_detallado) return { ok: false, error: "El canal detallado es obligatorio." }

      let duplicate = false
      setMappings((prev) => {
        if (prev.some((m) => m.canal_macro === canal_macro && m.canal_detallado === canal_detallado)) {
          duplicate = true
          return prev
        }
        const row: AdChannelMappingRow = {
          row_id: crypto.randomUUID(),
          canal_macro,
          canal_detallado,
        }
        return [...prev, row]
      })
      if (duplicate) {
        return { ok: false, error: "Ya existe un mapeo para este canal global y canal detallado." }
      }
      bump()
      toast.success("Mapeo creado")
      return { ok: true }
    },
    [bump]
  )

  const updateMapping = useCallback(
    (input: UpdateMappingInput): MutationResult => {
      const canal_macro = input.canal_macro.trim()
      const canal_detallado = input.canal_detallado.trim()
      if (!canal_macro) return { ok: false, error: "El canal global es obligatorio." }
      if (!canal_detallado) return { ok: false, error: "El canal detallado es obligatorio." }

      let found = false
      setMappings((prev) => {
        const idx = prev.findIndex((m) => m.row_id === input.row_id)
        if (idx === -1) return prev
        found = true
        const next = [...prev]
        next[idx] = { ...next[idx]!, canal_macro, canal_detallado }
        return next
      })
      if (!found) return { ok: false, error: "No se encontró el mapeo." }
      bump()
      toast.success("Mapeo actualizado")
      return { ok: true }
    },
    [bump]
  )

  const deleteMapping = useCallback(
    (rowId: string) => {
      setMappings((prev) => prev.filter((m) => m.row_id !== rowId))
      bump()
      toast.message("Mapeo eliminado")
    },
    [bump]
  )

  const resetToSeed = useCallback(() => {
    setMappings(buildSeedAdChannelMappings())
    bump()
    toast.success("Catálogo restaurado")
  }, [bump])

  const value = useMemo<ChannelAttributionContextValue>(
    () => ({ mappings, revision, updatedAt, createMapping, updateMapping, deleteMapping, resetToSeed }),
    [mappings, revision, updatedAt, createMapping, updateMapping, deleteMapping, resetToSeed]
  )

  return (
    <ChannelAttributionContext.Provider value={value}>
      {children}
    </ChannelAttributionContext.Provider>
  )
}
