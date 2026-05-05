import {
  eachDayOfInterval,
  endOfDay,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns"
import type { DateRange } from "react-day-picker"

/** Rango con inicio y fin inclusivos (normalizado a día). */
export type StrictDateRange = { from: Date; to: Date }

export function defaultDateRange(): StrictDateRange {
  const to = endOfDay(new Date())
  const from = startOfDay(subDays(to, 44))
  return { from, to }
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
