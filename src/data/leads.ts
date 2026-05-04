import type { LeadRecord } from "@/types/analytics"

export const mockLeads: LeadRecord[] = [
  {
    id: "LD-001",
    date: "2026-04-28",
    channel_macro: "Paid Social",
    channel_detallado: "Meta Ads",
    qualified: true,
  },
  {
    id: "LD-002",
    date: "2026-04-28",
    channel_macro: "Search",
    channel_detallado: "Google Ads",
    qualified: true,
  },
  {
    id: "LD-003",
    date: "2026-04-27",
    channel_macro: "Paid Social",
    channel_detallado: "TikTok Ads",
    qualified: false,
  },
  {
    id: "LD-004",
    date: "2026-04-27",
    channel_macro: "Organic",
    channel_detallado: "SEO / Contenido",
    qualified: true,
  },
  {
    id: "LD-005",
    date: "2026-04-26",
    channel_macro: "Email",
    channel_detallado: "CRM Email",
    qualified: true,
  },
  {
    id: "LD-006",
    date: "2026-04-26",
    channel_macro: "Marketplace",
    channel_detallado: "Amazon SP",
    qualified: true,
  },
  {
    id: "LD-007",
    date: "2026-04-25",
    channel_macro: "Paid Social",
    channel_detallado: "Influencers",
    qualified: false,
  },
  {
    id: "LD-008",
    date: "2026-04-25",
    channel_macro: "Paid Social",
    channel_detallado: "YouTube Ads",
    qualified: true,
  },
  ...Array.from({ length: 42 }, (_, i) => {
    const day = 24 - (i % 24)
    const macro =
      (["Paid Social", "Search", "Marketplace", "Organic", "Email"] as const)[
        i % 5
      ]
    const det: LeadRecord["channel_detallado"] =
      macro === "Paid Social"
        ? (["Meta Ads", "TikTok Ads", "Influencers", "YouTube Ads"] as const)[
            i % 4
          ]
        : macro === "Search"
          ? "Google Ads"
          : macro === "Marketplace"
            ? "Amazon SP"
            : macro === "Organic"
              ? "SEO / Contenido"
              : "CRM Email"
    return {
      id: `LD-${String(200 + i).padStart(3, "0")}`,
      date: `2026-04-${String(Math.max(1, day)).padStart(2, "0")}`,
      channel_macro: macro,
      channel_detallado: det,
      qualified: i % 3 !== 0,
    } satisfies LeadRecord
  }),
]
