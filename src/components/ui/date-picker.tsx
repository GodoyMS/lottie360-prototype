"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import { CalendarRange } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type DateRangePickerProps = {
  value: DateRange | undefined
  onChange: (next: DateRange | undefined) => void
  /** Texto cuando no hay rango */
  placeholder?: string
  className?: string
  /** Meses visibles en el calendario */
  numberOfMonths?: number
  disabled?: boolean
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Rango de fechas",
  className,
  numberOfMonths = 2,
  disabled,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  const label = React.useMemo(() => {
    if (!value?.from) return placeholder
    const opts = { locale: es }
    if (value.to) {
      return `${format(value.from, "d MMM yyyy", opts)} – ${format(value.to, "d MMM yyyy", opts)}`
    }
    return format(value.from, "d MMM yyyy", opts)
  }, [value, placeholder])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-9 justify-start gap-2 text-left font-normal",
            !value?.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarRange className="size-4 shrink-0 opacity-70" aria-hidden />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          locale={es}
          numberOfMonths={numberOfMonths}
          defaultMonth={value?.from}
          selected={value}
          onSelect={(next) => {
            onChange(next)
            if (next?.from && next?.to) {
              setOpen(false)
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
