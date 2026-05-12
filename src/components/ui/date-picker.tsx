"use client"

import * as React from "react"
import {
  endOfDay,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns"
import { es } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import { CalendarRange, Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type PeriodPreset = "today" | "yesterday" | "this_month" | "last_month" | "custom"

const PRESETS: { id: PeriodPreset; label: string }[] = [
  { id: "today", label: "Hoy" },
  { id: "yesterday", label: "Ayer" },
  { id: "this_month", label: "Este mes" },
  { id: "last_month", label: "Mes pasado" },
  { id: "custom", label: "Personalizado" },
]

function getPresetRange(preset: Exclude<PeriodPreset, "custom">): DateRange {
  const now = new Date()
  switch (preset) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) }
    case "yesterday": {
      const y = subDays(now, 1)
      return { from: startOfDay(y), to: endOfDay(y) }
    }
    case "this_month":
      return { from: startOfMonth(now), to: endOfDay(now) }
    case "last_month": {
      const lm = subMonths(now, 1)
      return { from: startOfMonth(lm), to: endOfMonth(lm) }
    }
  }
}

const fmtDay = (d: Date) => format(d, "yyyy-MM-dd")

function detectPreset(value: DateRange | undefined): PeriodPreset {
  if (!value?.from) return "this_month"
  const now = new Date()
  if (
    fmtDay(value.from) === fmtDay(startOfDay(now)) &&
    (!value.to || fmtDay(value.to) === fmtDay(endOfDay(now)))
  )
    return "today"
  const y = subDays(now, 1)
  if (
    fmtDay(value.from) === fmtDay(startOfDay(y)) &&
    (!value.to || fmtDay(value.to) === fmtDay(endOfDay(y)))
  )
    return "yesterday"
  if (
    fmtDay(value.from) === fmtDay(startOfMonth(now)) &&
    (!value.to || fmtDay(value.to) === fmtDay(endOfDay(now)))
  )
    return "this_month"
  const lm = subMonths(now, 1)
  if (
    fmtDay(value.from) === fmtDay(startOfMonth(lm)) &&
    (!value.to || fmtDay(value.to) === fmtDay(endOfMonth(lm)))
  )
    return "last_month"
  return "custom"
}

type DateRangePickerProps = {
  value: DateRange | undefined
  onChange: (next: DateRange | undefined) => void
  placeholder?: string
  className?: string
  /** @deprecated kept for compat, ignored */
  numberOfMonths?: number
  disabled?: boolean
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Seleccionar periodo",
  className,
  disabled,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [activePreset, setActivePreset] = React.useState<PeriodPreset>(() =>
    detectPreset(value)
  )
  const [customRange, setCustomRange] = React.useState<DateRange | undefined>(value)

  // Keep customRange in sync when value changes externally
  React.useEffect(() => {
    if (detectPreset(value) === "custom") {
      setCustomRange(value)
    }
  }, [value])

  const label = React.useMemo(() => {
    if (activePreset !== "custom") {
      return PRESETS.find((p) => p.id === activePreset)?.label ?? placeholder
    }
    if (!value?.from) return placeholder
    const opts = { locale: es }
    if (value.to && fmtDay(value.from) !== fmtDay(value.to)) {
      return `${format(value.from, "d MMM", opts)} – ${format(value.to, "d MMM yyyy", opts)}`
    }
    return format(value.from, "d MMM yyyy", opts)
  }, [value, activePreset, placeholder])

  function selectPreset(preset: PeriodPreset) {
    setActivePreset(preset)
    if (preset !== "custom") {
      onChange(getPresetRange(preset))
      setOpen(false)
    } else {
      // Enter custom mode; seed calendar from current value
      setCustomRange(value)
    }
  }

  function applyCustom() {
    if (customRange?.from) {
      onChange(
        customRange.to
          ? customRange
          : { from: customRange.from, to: customRange.from }
      )
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-9 justify-between gap-2 text-left font-normal",
            !value?.from && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <CalendarRange className="size-4 shrink-0 opacity-60" aria-hidden />
            <span className="truncate">{label}</span>
          </div>
          <ChevronDown className="size-3.5 shrink-0 opacity-40" aria-hidden />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-0 shadow-lg"
        align="start"
        onInteractOutside={() => setOpen(false)}
      >
        <div className="flex">
          {/* Presets sidebar */}
          <div className="flex min-w-[136px] flex-col gap-0.5 border-r border-border/60 p-2">
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Periodo
            </p>
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => selectPreset(preset.id)}
                className={cn(
                  "flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm text-left transition-colors",
                  "hover:bg-muted/60",
                  activePreset === preset.id
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-foreground"
                )}
              >
                {preset.label}
                {activePreset === preset.id && (
                  <Check className="ml-2 size-3.5 text-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Calendar panel — only in custom mode */}
          {activePreset === "custom" && (
            <div className="flex flex-col">
              <Calendar
                mode="range"
                locale={es}
                numberOfMonths={2}
                defaultMonth={customRange?.from ?? value?.from}
                selected={customRange}
                onSelect={(next) => {
                  // Never auto-close; let user press Apply
                  setCustomRange(next)
                }}
                className="p-3"
              />
              <div className="flex items-center justify-end gap-2 border-t border-border/60 px-3 py-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={applyCustom}
                  disabled={!customRange?.from}
                >
                  Aplicar
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
