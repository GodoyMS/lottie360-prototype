import type {
  ChannelPerformanceRow,
  DailyComparativoRow,
  DashboardKpis,
  TimeSeriesPoint,
} from "@/types/analytics"
import { mockAdSpend } from "@/data/ads"
import { mockLeads } from "@/data/leads"
import { mockOrders } from "@/data/orders"
import {
  eachIsoDayInRange,
  filterByStrictRange,
  type StrictDateRange,
} from "@/lib/date-range"
import { resolveAdSpendChannels } from "@/lib/resolve-ad-attribution"

function matchCanal<T extends { channel_macro: string }>(
  item: T,
  canales: string[] | undefined
): boolean {
  if (!canales || canales.length === 0) return true
  return canales.includes(item.channel_macro)
}

export function computeDashboardKpis(
  range: StrictDateRange,
  canales?: string[]
): DashboardKpis {
  const orders = filterByStrictRange(mockOrders, range).filter((o) =>
    matchCanal(o, canales)
  )
  const leadsList = filterByStrictRange(mockLeads, range).filter((l) =>
    matchCanal(l, canales)
  )
  const ads = filterByStrictRange(mockAdSpend, range).filter((a) =>
    matchCanal(a, canales)
  )

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

  const conversion_rate = leads > 0 ? orders_paid / leads : 0

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
    conversion_rate,
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
      0.45 *
        Math.sin((i / Math.max(n / 4, 1)) * Math.PI) *
        (i % 2 === 0 ? 1 : 0.92)
    const revenue = Math.round((kpis.revenue / n) * w)
    const orders = Math.max(0, Math.round((kpis.orders / n) * w * 0.95))
    const leads = Math.max(0, Math.round((kpis.leads / n) * w * 0.95))
    const spend = Math.round((kpis.ad_spend / n) * w * 0.95)
    return { date: iso, revenue, orders, leads, spend }
  })
}

/** Tabla comparativa diaria con métricas por día, ordenada de más reciente a más antiguo. */
export function buildDailyComparativo(
  range: StrictDateRange,
  canales?: string[]
): DailyComparativoRow[] {
  const days = eachIsoDayInRange(range)

  return days
    .map((iso) => {
      const dayRange: StrictDateRange = {
        from: new Date(`${iso}T00:00:00`),
        to: new Date(`${iso}T23:59:59`),
      }

      const orders = filterByStrictRange(mockOrders, dayRange).filter((o) =>
        matchCanal(o, canales)
      )
      const ads = filterByStrictRange(mockAdSpend, dayRange).filter((a) =>
        matchCanal(a, canales)
      )
      const leads = filterByStrictRange(mockLeads, dayRange).filter((l) =>
        matchCanal(l, canales)
      )

      const ventas = orders
        .filter(
          (o) => o.payment_status === "paid" && o.order_status !== "cancelled"
        )
        .reduce((a, o) => a + o.revenue, 0)

      const pedidos = orders.filter(
        (o) => o.order_status === "completed" || o.order_status === "pending"
      ).length

      const inversion = ads.reduce((a, x) => a + x.spend, 0)
      const leadsCount = leads.length
      const cpa = leadsCount > 0 ? inversion / leadsCount : 0
      const roas = inversion > 0 ? ventas / inversion : 0

      // Top canal by revenue
      const canalMap = new Map<string, number>()
      for (const o of orders) {
        if (o.payment_status !== "paid" || o.order_status === "cancelled")
          continue
        canalMap.set(
          o.channel_macro,
          (canalMap.get(o.channel_macro) ?? 0) + o.revenue
        )
      }
      const topCanal =
        [...canalMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"

      return { date: iso, ventas, canal: topCanal, pedidos, inversion, cpa, roas }
    })
    .filter((row) => row.ventas > 0 || row.pedidos > 0 || row.inversion > 0)
    .reverse() // most recent first
}

function rowKey(m: string, d: string) {
  return `${m}|${d}`
}

export function buildChannelPerformance(
  range: StrictDateRange,
  canales?: string[]
): ChannelPerformanceRow[] {
  const keys = new Map<string, ChannelPerformanceRow>()
  const ads = filterByStrictRange(mockAdSpend, range).filter((a) =>
    matchCanal(a, canales)
  )
  const leadsList = filterByStrictRange(mockLeads, range).filter((l) =>
    matchCanal(l, canales)
  )
  const orders = filterByStrictRange(mockOrders, range).filter((o) =>
    matchCanal(o, canales)
  )

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
    const { channel_macro, channel_detallado } = resolveAdSpendChannels(ad)
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
