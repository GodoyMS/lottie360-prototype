import { useContext } from "react"
import { ChannelAttributionContext } from "@/hooks/channel-attribution-context"

export function useChannelAttribution() {
  const ctx = useContext(ChannelAttributionContext)
  if (!ctx) {
    throw new Error(
      "useChannelAttribution debe usarse dentro de ChannelAttributionProvider"
    )
  }
  return ctx
}
