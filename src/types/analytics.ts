export type ChannelMacro = "Shopify" | "Meta" | "Kommo"

export type ChannelDetallado =
  // Shopify channels
  | "wsp"
  | "cambio"
  | "tiktok"
  | "TB13"
  | "instagram"
  | "referidos"
  // Meta ad IDs
  | "120243819860760063"
  | "120243819860780063"
  | "120243876956030063"
  | "120243884310180063"
  // Kommo channels
  | "T72045"
  | "TMR14"
  | "Etiquetas de Lead"

export type PaymentStatus = "paid" | "pending" | "failed"

export type OrderStatus = "completed" | "pending" | "cancelled" | "refunded"

export interface OrderRecord {
  order_id: string
  date: string
  channel_macro: ChannelMacro
  channel_detallado: ChannelDetallado
  revenue: number
  cost: number
  pairs: number
  payment_status: PaymentStatus
  order_status: OrderStatus
}

export interface LeadRecord {
  id: string
  date: string
  channel_macro: ChannelMacro
  channel_detallado: ChannelDetallado
  qualified: boolean
}

export interface AdSpendRecord {
  id: string
  /** Identificador de anuncio/campaña */
  ad_id: string
  date: string
  channel_macro: ChannelMacro
  channel_detallado: ChannelDetallado
  spend: number
  conversions: number
  revenue_attributed: number
}

export interface TimeSeriesPoint {
  date: string
  revenue: number
  orders: number
  leads: number
  spend: number
}

export interface ChannelPerformanceRow {
  channel_macro: ChannelMacro
  channel_detallado: ChannelDetallado
  spend: number
  revenue: number
  leads: number
  orders: number
  cpa: number
  roas: number
}

export interface DashboardKpis {
  revenue: number
  orders: number
  roas: number
  cpa: number
  /** Gasto publicitario en el periodo (para ROAS / CPA) */
  ad_spend: number
  /** Suma de coste de producción (`cost` en pedidos) en el periodo */
  production_cost: number
  leads: number
  orders_paid: number
  orders_pending: number
  orders_cancelled: number
  /** Pares vendidos (pedidos pagados no cancelados) */
  pairs_sold: number
  /** Tasa de conversión leads → pedidos pagados (0–1) */
  conversion_rate: number
}

export interface DailyComparativoRow {
  date: string
  ventas: number
  canal: string
  pedidos: number
  inversion: number
  cpa: number
  roas: number
}

export type TimeRangeFilter = "day" | "week" | "month"
