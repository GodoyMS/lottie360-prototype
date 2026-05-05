import type {
  ChannelPerformanceRow,
  DashboardKpis,
  TimeSeriesPoint,
} from "@/types/analytics"
import type { AdChannelMappingRow } from "@/types/ad-channel-mapping"
import { mockAdSpend } from "@/data/ads"
import { mockLeads } from "@/data/leads"
import { mockOrders } from "@/data/orders"
import {
  eachIsoDayInRange,
  filterByStrictRange,
  type StrictDateRange,
} from "@/lib/date-range"
import { resolveAdSpendChannels } from "@/lib/resolve-ad-attribution"

export function computeDashboardKpis(range: StrictDateRange): DashboardKpis {
  const orders = filterByStrictRange(mockOrders, range)
  const leadsList = filterByStrictRange(mockLeads, range)
  const ads = filterByStrictRange(mockAdSpend, range)

  const revenue = orders
    .filter((o) => o.payment_status === "paid" && o.order_status !== "cancelled")
    .reduce((a, o) => a + o.revenue, 0)

  const production_cost = orders.reduce((a, o) => a + o.cost, 0)

  const orderCount = orders.filter(
    (o) => o.order_status === "completed" || o.order_status === "pending"
  ).length

  const ad_spend = ads.reduce((a, x) => a + x.spend, 0)
  const leads = leadsList.length

  const roas = ad_spend > 0 ? revenue / ad_spend : 0
  const cpa = leads > 0 ? ad_spend / leads : 0

  const orders_paid = orders.filter((o) => o.payment_status === "paid").length
  const orders_pending = orders.filter(
    (o) => o.payment_status === "pending"
  ).length
  const orders_cancelled = orders.filter(
    (o) => o.order_status === "cancelled"
  ).length

  const pairs_sold = orders
    .filter((o) => o.payment_status === "paid" && o.order_status !== "cancelled")
    .reduce((a, o) => a + o.pairs, 0)

  return {
    revenue,
    orders: orderCount,
    roas,
    cpa,
    ad_spend,
    production_cost,
    leads,
    orders_paid,
    orders_pending,
    orders_cancelled,
    pairs_sold,
  }
}

/** Serie diaria alineada al rango; proporcional a KPIs del mismo periodo (sin aleatoriedad). */
export function buildRevenueTimeSeries(
  range: StrictDateRange,
  kpis: DashboardKpis
): TimeSeriesPoint[] {
  const days = eachIsoDayInRange(range)
  const n = Math.max(days.length, 1)

  return days.map((iso, i) => {
    const w =
      0.55 +
      0.45 * Math.sin((i / Math.max(n / 4, 1)) * Math.PI) * (i % 2 === 0 ? 1 : 0.92)
    const revenue = Math.round((kpis.revenue / n) * w)
    const orders = Math.max(
      0,
      Math.round((kpis.orders / n) * w * 0.95)
    )
    const leads = Math.max(
      0,
      Math.round((kpis.leads / n) * w * 0.95)
    )
    const spend = Math.round((kpis.ad_spend / n) * w * 0.95)
    return { date: iso, revenue, orders, leads, spend }
  })
}

function rowKey(m: string, d: string) {
  return `${m}|${d}`
}

export function buildChannelPerformance(
  adChannelMappings: readonly AdChannelMappingRow[],
  range: StrictDateRange
): ChannelPerformanceRow[] {
  const keys = new Map<string, ChannelPerformanceRow>()
  const ads = filterByStrictRange(mockAdSpend, range)
  const leadsList = filterByStrictRange(mockLeads, range)
  const orders = filterByStrictRange(mockOrders, range)

  function ensure(
    macro: ChannelPerformanceRow["channel_macro"],
    det: ChannelPerformanceRow["channel_detallado"]
  ) {
    const k = rowKey(macro, det)
    let cur = keys.get(k)
    if (!cur) {
      cur = {
        channel_macro: macro,
        channel_detallado: det,
        spend: 0,
        revenue: 0,
        leads: 0,
        orders: 0,
        cpa: 0,
        roas: 0,
      }
      keys.set(k, cur)
    }
    return cur
  }

  for (const ad of ads) {
    const { channel_macro, channel_detallado } = resolveAdSpendChannels(
      ad,
      adChannelMappings
    )
    const cur = ensure(channel_macro, channel_detallado)
    cur.spend += ad.spend
    cur.revenue += ad.revenue_attributed
  }

  for (const lead of leadsList) {
    const cur = ensure(lead.channel_macro, lead.channel_detallado)
    cur.leads += 1
  }

  for (const order of orders) {
    if (order.order_status !== "completed") continue
    const cur = ensure(order.channel_macro, order.channel_detallado)
    cur.orders += 1
  }

  return [...keys.values()].map((row) => {
    const roas = row.spend > 0 ? row.revenue / row.spend : 0
    const cpa = row.leads > 0 ? row.spend / row.leads : row.spend
    return { ...row, roas, cpa }
  })
}

export { mockOrders, mockLeads, mockAdSpend }
