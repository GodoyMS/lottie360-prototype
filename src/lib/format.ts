const EUR: Intl.NumberFormatOptions = {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
}

const EUR_DECIMAL: Intl.NumberFormatOptions = {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}

export function formatCurrency(value: number, withDecimals = false): string {
  return new Intl.NumberFormat("es-ES", withDecimals ? EUR_DECIMAL : EUR).format(
    value
  )
}

export function formatNumber(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value)
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return `${formatNumber(value, fractionDigits)} %`
}

export function formatShortDate(isoDate: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate))
}

export function formatChartAxisDate(isoDate: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(new Date(isoDate))
}

export function formatDateTime(isoMs: number): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(isoMs))
}
