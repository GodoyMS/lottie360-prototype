import type {
  ChannelPerformanceRow,
  DashboardKpis,
  TimeSeriesPoint,
} from "@/types/analytics"
import { mockAdSpend } from "@/data/ads"
import { mockLeads } from "@/data/leads"
import { mockOrders } from "@/data/orders"

export function computeDashboardKpis(): DashboardKpis {
  const revenue = mockOrders
    .filter((o) => o.payment_status === "paid" && o.order_status !== "cancelled")
    .reduce((a, o) => a + o.revenue, 0)

  const orders = mockOrders.filter(
    (o) => o.order_status === "completed" || o.order_status === "pending"
  ).length

  const ad_spend = mockAdSpend.reduce((a, x) => a + x.spend, 0)
  const leads = mockLeads.length

  const roas = ad_spend > 0 ? revenue / ad_spend : 0
  const cpa = leads > 0 ? ad_spend / leads : 0

  const orders_paid = mockOrders.filter((o) => o.payment_status === "paid").length
  const orders_pending = mockOrders.filter(
    (o) => o.payment_status === "pending"
  ).length
  const orders_cancelled = mockOrders.filter(
    (o) => o.order_status === "cancelled"
  ).length

  return {
    revenue,
    orders,
    roas,
    cpa,
    ad_spend,
    leads,
    orders_paid,
    orders_pending,
    orders_cancelled,
  }
}

/** Serie diaria sintética coherente con KPIs (últimos 14 días) */
export function buildRevenueTimeSeries(days = 14): TimeSeriesPoint[] {
  const kpis = computeDashboardKpis()
  const today = new Date()
  const points: TimeSeriesPoint[] = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    const w = 0.55 + 0.45 * Math.sin((i / 4) * Math.PI) + Math.random() * 0.12
    const revenue = Math.round((kpis.revenue / days) * w)
    const orders = Math.max(
      1,
      Math.round((kpis.orders / days) * w * (0.85 + Math.random() * 0.3))
    )
    const leads = Math.max(
      1,
      Math.round((kpis.leads / days) * w * (0.9 + Math.random() * 0.25))
    )
    const spend = Math.round((kpis.ad_spend / days) * w * (0.95 + Math.random() * 0.2))
    points.push({ date: iso, revenue, orders, leads, spend })
  }

  return points
}

function rowKey(m: string, d: string) {
  return `${m}|${d}`
}

export function buildChannelPerformance(): ChannelPerformanceRow[] {
  const keys = new Map<string, ChannelPerformanceRow>()

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

  for (const ad of mockAdSpend) {
    const cur = ensure(ad.channel_macro, ad.channel_detallado)
    cur.spend += ad.spend
    cur.revenue += ad.revenue_attributed
  }

  for (const lead of mockLeads) {
    const cur = ensure(lead.channel_macro, lead.channel_detallado)
    cur.leads += 1
  }

  for (const order of mockOrders) {
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
