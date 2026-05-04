import type { TimeRangeFilter } from "@/types/analytics"

function daysForRange(range: TimeRangeFilter): number {
  switch (range) {
    case "day":
      return 1
    case "week":
      return 7
    case "month":
      return 30
    default:
      return 30
  }
}

export function filterByDateRange<T extends { date: string }>(
  items: readonly T[],
  range: TimeRangeFilter
): T[] {
  const days = daysForRange(range)
  const cutoff = new Date()
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setDate(cutoff.getDate() - (days - 1))
  return items.filter((item) => {
    const d = new Date(item.date)
    d.setHours(0, 0, 0, 0)
    return d >= cutoff
  })
}
