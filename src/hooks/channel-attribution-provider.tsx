import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { toast } from "sonner"
import { buildSeedAdChannelMappings } from "@/data/ad-channel-mappings-seed"
import { normalizePair } from "@/lib/channel-taxonomy"
import {
  ChannelAttributionContext,
  type ChannelAttributionContextValue,
  type CreateMappingInput,
  type MutationResult,
  type UpdateMappingInput,
} from "@/hooks/channel-attribution-context"
import type { AdChannelMappingRow } from "@/types/ad-channel-mapping"

const STORAGE_KEY = "lottie360_ad_channel_mappings_v1"

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
      const ad_id = input.ad_id.trim()
      if (!ad_id) {
        return { ok: false, error: "El ad_id es obligatorio." }
      }
      const { canal_macro, canal_detallado } = normalizePair(
        input.canal_macro,
        input.canal_detallado
      )
      let duplicate = false
      setMappings((prev) => {
        if (prev.some((m) => m.ad_id === ad_id)) {
          duplicate = true
          return prev
        }
        const row: AdChannelMappingRow = {
          row_id: crypto.randomUUID(),
          ad_id,
          canal_macro,
          canal_detallado,
        }
        return [...prev, row]
      })
      if (duplicate) {
        return {
          ok: false,
          error:
            "Ya existe un mapeo para este ad_id. Edítalo o elimínalo primero.",
        }
      }
      bump()
      toast.success("Mapeo creado", {
        description:
          "La atribución de gasto publicitario se recalcula en tiempo real en todo el panel.",
      })
      return { ok: true }
    },
    [bump]
  )

  const updateMapping = useCallback(
    (input: UpdateMappingInput): MutationResult => {
      const { canal_macro, canal_detallado } = normalizePair(
        input.canal_macro,
        input.canal_detallado
      )
      let found = false
      setMappings((prev) => {
        const idx = prev.findIndex((m) => m.row_id === input.row_id)
        if (idx === -1) return prev
        found = true
        const next = [...prev]
        next[idx] = { ...next[idx], canal_macro, canal_detallado }
        return next
      })
      if (!found) {
        return { ok: false, error: "No se encontró el mapeo." }
      }
      bump()
      toast.success("Mapeo actualizado", {
        description: "Los gráficos y tablas por canal reflejan el cambio.",
      })
      return { ok: true }
    },
    [bump]
  )

  const deleteMapping = useCallback(
    (rowId: string) => {
      setMappings((prev) => prev.filter((m) => m.row_id !== rowId))
      bump()
      toast.message("Mapeo eliminado", {
        description:
          "Ese ad_id vuelve a usar los canales definidos en el dataset de gasto.",
      })
    },
    [bump]
  )

  const resetToSeed = useCallback(() => {
    const next = buildSeedAdChannelMappings()
    setMappings(next)
    bump()
    toast.success("Catálogo restaurado", {
      description: "Se han restablecido los mapeos iniciales a partir del mock de anuncios.",
    })
  }, [bump])

  const value = useMemo<ChannelAttributionContextValue>(
    () => ({
      mappings,
      revision,
      updatedAt,
      createMapping,
      updateMapping,
      deleteMapping,
      resetToSeed,
    }),
    [
      mappings,
      revision,
      updatedAt,
      createMapping,
      updateMapping,
      deleteMapping,
      resetToSeed,
    ]
  )

  return (
    <ChannelAttributionContext.Provider value={value}>
      {children}
    </ChannelAttributionContext.Provider>
  )
}
