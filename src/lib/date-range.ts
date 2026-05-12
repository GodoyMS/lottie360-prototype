import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns"
import type { DateRange } from "react-day-picker"

/** Rango con inicio y fin inclusivos (normalizado a día). */
export type StrictDateRange = { from: Date; to: Date }

/** Rango del mes actual (día 1 del mes → hoy). */
export function currentMonthRange(): StrictDateRange {
  const now = new Date()
  return { from: startOfDay(startOfMonth(now)), to: endOfDay(now) }
}

/** Rango de ayer (00:00 → 23:59). */
export function yesterdayRange(): StrictDateRange {
  const y = subDays(new Date(), 1)
  return { from: startOfDay(y), to: endOfDay(y) }
}

/** Rango del mes pasado (día 1 → último día). */
export function prevMonthRange(): StrictDateRange {
  const lm = subMonths(new Date(), 1)
  return { from: startOfDay(startOfMonth(lm)), to: endOfDay(endOfMonth(lm)) }
}

/** Rango de hoy (00:00 → 23:59). */
export function todayRange(): StrictDateRange {
  const now = new Date()
  return { from: startOfDay(now), to: endOfDay(now) }
}

/** Devuelve el periodo previo equivalente (misma duración, inmediatamente anterior). */
export function previousPeriod(range: StrictDateRange): StrictDateRange {
  const ms = range.to.getTime() - range.from.getTime()
  const to = new Date(range.from.getTime() - 1)
  const from = new Date(to.getTime() - ms)
  return { from: startOfDay(from), to: endOfDay(to) }
}

/** Por defecto: mes actual. */
export function defaultDateRange(): StrictDateRange {
  return currentMonthRange()
}

/** Convierte selección del calendario a rango cerrado. */
export function toStrictRange(
  range: DateRange | undefined
): StrictDateRange | null {
  if (!range?.from) return null
  const a = startOfDay(range.from)
  const b = endOfDay(range.to ?? range.from)
  if (a.getTime() > b.getTime()) {
    return { from: startOfDay(range.to ?? range.from), to: endOfDay(range.from) }
  }
  return { from: a, to: b }
}

export function strictRangeFromDateRange(
  range: DateRange | undefined
): StrictDateRange {
  return toStrictRange(range) ?? defaultDateRange()
}

export function isIsoDateInRange(
  isoDate: string,
  range: StrictDateRange
): boolean {
  const d = parseISO(isoDate)
  if (Number.isNaN(d.getTime())) return false
  return isWithinInterval(d, {
    start: startOfDay(range.from),
    end: endOfDay(range.to),
  })
}

export function eachIsoDayInRange(range: StrictDateRange): string[] {
  const days = eachDayOfInterval({
    start: startOfDay(range.from),
    end: startOfDay(range.to),
  })
  return days.map((d) => format(d, "yyyy-MM-dd"))
}

export function filterByStrictRange<T extends { date: string }>(
  items: readonly T[],
  range: StrictDateRange
): T[] {
  return items.filter((item) => isIsoDateInRange(item.date, range))
}
