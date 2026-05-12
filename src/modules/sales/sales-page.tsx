import { useEffect, useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { mockOrders } from "@/data/orders"
import type { ChannelMacro, OrderRecord, OrderStatus, PaymentStatus } from "@/types/analytics"
import { formatCurrency, formatNumber, formatShortDate } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { MultiSelect } from "@/components/ui/multi-select"
import {
  currentMonthRange,
  strictRangeFromDateRange,
  isIsoDateInRange,
} from "@/lib/date-range"
import { CalendarRange, Check, ChevronDown, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL = "__all__"

const CANAL_GLOBAL_OPTIONS = [
  { value: "Shopify", label: "Shopify" },
  { value: "Meta", label: "Meta" },
  { value: "Kommo", label: "Kommo" },
]
const ALL_CANALES = CANAL_GLOBAL_OPTIONS.map((o) => o.value)
const macros: ChannelMacro[] = ["Shopify", "Meta", "Kommo"]

const paymentLabel: Record<PaymentStatus, string> = {
  paid: "Pagado",
  pending: "Pendiente",
  failed: "Fallido",
}
const orderLabel: Record<OrderStatus, string> = {
  completed: "Completado",
  pending: "Pendiente",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
}
const paymentVariant: Record<PaymentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  paid: "default",
  pending: "secondary",
  failed: "destructive",
}
const orderVariant: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  pending: "secondary",
  cancelled: "destructive",
  refunded: "outline",
}

// ─── Estado de pedidos card ────────────────────────────────────────────────────

type OrderStateStats = { paid: number; pending: number; cancelled: number; total: number }

type EstadoCardProps = {
  stats: OrderStateStats
  activePayment: string
  activeOrder: string
  onSelectPaid: () => void
  onSelectPending: () => void
  onSelectCancelled: () => void
}

function EstadoPedidosCard({
  stats,
  activePayment,
  activeOrder,
  onSelectPaid,
  onSelectPending,
  onSelectCancelled,
}: EstadoCardProps) {
  const total = Math.max(stats.total, 1)

  const rows = [
    {
      label: "Pagados",
      count: stats.paid,
      pct: (stats.paid / total) * 100,
      bar: "bg-gradient-to-r from-emerald-400 to-emerald-500",
      ring: "ring-emerald-500/20",
      activeBg: "bg-emerald-500/8 border-emerald-500/30",
      isActive: activePayment === "paid",
      onClick: onSelectPaid,
    },
    {
      label: "Pendientes de pago",
      count: stats.pending,
      pct: (stats.pending / total) * 100,
      bar: "bg-gradient-to-r from-amber-300 to-amber-400",
      ring: "ring-amber-500/20",
      activeBg: "bg-amber-500/8 border-amber-500/30",
      isActive: activePayment === "pending",
      onClick: onSelectPending,
    },
    {
      label: "Cancelados",
      count: stats.cancelled,
      pct: (stats.cancelled / total) * 100,
      bar: "bg-gradient-to-r from-rose-400 to-rose-500",
      ring: "ring-rose-500/20",
      activeBg: "bg-rose-500/8 border-rose-500/30",
      isActive: activeOrder === "cancelled",
      onClick: onSelectCancelled,
    },
  ]

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-3 pt-4 px-5">
        <CardTitle className="text-sm font-medium">Estado de pedidos</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-2">
        {rows.map((row) => (
          <button
            key={row.label}
            type="button"
            onClick={row.onClick}
            className={cn(
              "w-full rounded-xl border p-3 text-left transition-all duration-200",
              "hover:shadow-sm hover:border-border",
              row.isActive
                ? cn("shadow-sm ring-1", row.ring, row.activeBg)
                : "border-border/40 bg-muted/10 hover:bg-muted/30",
            )}
          >
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <span className={cn("text-sm font-medium", row.isActive ? "text-foreground" : "text-foreground/80")}>
                {row.label}
              </span>
              <span className="text-xs tabular-nums text-muted-foreground shrink-0">
                <span className="font-semibold text-foreground">{formatNumber(row.count, 0)}</span>
                <span className="mx-1 text-border/80">·</span>
                {formatNumber(row.pct, 1)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted/60">
              <div
                className={cn("h-full rounded-full transition-all duration-700 ease-out", row.bar)}
                style={{ width: `${Math.max(row.pct, row.count > 0 ? 3 : 0)}%` }}
              />
            </div>
          </button>
        ))}
        {(activePayment !== ALL || activeOrder !== ALL) && (
          <p className="pt-1 text-center text-[11px] text-muted-foreground">
            Haz clic en un estado activo para deseleccionar
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SalesPage() {
  const mr = currentMonthRange()
  const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: mr.from, to: mr.to })
  const strictRange = useMemo(() => strictRangeFromDateRange(dateRange), [dateRange])
  const [ready, setReady] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<string>(ALL)
  const [orderStatus, setOrderStatus] = useState<string>(ALL)
  const [selectedCanales, setSelectedCanales] = useState<string[]>(ALL_CANALES)
  const [selected, setSelected] = useState<OrderRecord | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 400)
    return () => window.clearTimeout(t)
  }, [])

  /** Base: date + canal filtered (no payment/status filter) — used for stats */
  const baseOrders = useMemo(
    () =>
      mockOrders.filter(
        (o) =>
          selectedCanales.includes(o.channel_macro) &&
          isIsoDateInRange(o.date, strictRange),
      ),
    [strictRange, selectedCanales],
  )

  /** Fully filtered: applies all active filters */
  const filtered = useMemo(
    () =>
      baseOrders.filter((o) => {
        if (paymentStatus !== ALL && o.payment_status !== paymentStatus) return false
        if (orderStatus !== ALL && o.order_status !== orderStatus) return false
        return true
      }),
    [baseOrders, paymentStatus, orderStatus],
  )

  const stats: OrderStateStats = useMemo(() => {
    const paid = baseOrders.filter((o) => o.payment_status === "paid").length
    const pending = baseOrders.filter((o) => o.payment_status === "pending").length
    const cancelled = baseOrders.filter((o) => o.order_status === "cancelled").length
    return { paid, pending, cancelled, total: baseOrders.length }
  }, [baseOrders])

  function resetFilters() {
    setPaymentStatus(ALL)
    setOrderStatus(ALL)
    setSelectedCanales(ALL_CANALES)
    const d = currentMonthRange()
    setDateRange({ from: d.from, to: d.to })
  }

  function handleEstadoClick(type: "paid" | "pending" | "cancelled") {
    if (type === "paid") {
      if (paymentStatus === "paid") { setPaymentStatus(ALL) } else { setPaymentStatus("paid"); setOrderStatus(ALL) }
    } else if (type === "pending") {
      if (paymentStatus === "pending") { setPaymentStatus(ALL) } else { setPaymentStatus("pending"); setOrderStatus(ALL) }
    } else {
      if (orderStatus === "cancelled") { setOrderStatus(ALL) } else { setOrderStatus("cancelled"); setPaymentStatus(ALL) }
    }
  }

  if (!ready) {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32 max-w-full" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ventas</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Listado de pedidos con filtros y detalle (datos simulados).
        </p>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-col md:flex-row flex-wrap items-center gap-2">

        {/* ── Single dropdown for Periodo + Pago + Estado ── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-10 w-full md:w-auto justify-between gap-2 text-sm font-normal",
                (paymentStatus !== ALL || orderStatus !== ALL) &&
                  "border-primary/50 bg-primary/5 text-primary",
              )}
            >
              <Filter className="size-3.5 shrink-0 opacity-60" />
             Filtros
              <ChevronDown className="size-3.5 opacity-40 shrink-0" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-52">

            {/* Periodo sub */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2">
                <CalendarRange className="size-3.5 opacity-60" />
                <span>Periodo</span>
                {dateRange?.from && (
                  <span className="ml-auto text-[10px] text-muted-foreground truncate max-w-[80px]">
                    {format(dateRange.from, "d MMM", { locale: es })}
                    {dateRange.to ? `–${format(dateRange.to, "d MMM", { locale: es })}` : ""}
                  </span>
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent
                  className="p-0 w-auto"
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  onInteractOutside={(e) => e.preventDefault()}
                >
                  <Calendar
                    mode="range"
                    locale={es}
                    numberOfMonths={2}
                    selected={dateRange}
                    defaultMonth={dateRange?.from}
                    onSelect={setDateRange}
                    className="p-3"
                  />
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            {/* Pago sub */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2">
                <span>Pago</span>
                {paymentStatus !== ALL && (
                  <span className="ml-auto text-[10px] font-medium text-primary">
                    {paymentLabel[paymentStatus as PaymentStatus]}
                  </span>
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-44">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Estado de pago</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {([ALL, "paid", "pending", "failed"] as const).map((val) => (
                      <DropdownMenuItem
                        key={val}
                        onSelect={() => setPaymentStatus(val)}
                        className="gap-2"
                      >
                        <Check className={cn("size-3.5 shrink-0", paymentStatus === val ? "opacity-100" : "opacity-0")} />
                        {val === ALL ? "Todos" : paymentLabel[val]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            {/* Estado sub */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2">
                <span>Estado</span>
                {orderStatus !== ALL && (
                  <span className="ml-auto text-[10px] font-medium text-primary">
                    {orderLabel[orderStatus as OrderStatus]}
                  </span>
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-44">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Estado del pedido</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {([ALL, "completed", "pending", "cancelled", "refunded"] as const).map((val) => (
                      <DropdownMenuItem
                        key={val}
                        onSelect={() => setOrderStatus(val)}
                        className="gap-2"
                      >
                        <Check className={cn("size-3.5 shrink-0", orderStatus === val ? "opacity-100" : "opacity-0")} />
                        {val === ALL ? "Todos" : orderLabel[val]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            {(paymentStatus !== ALL || orderStatus !== ALL) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={resetFilters}
                  className="text-muted-foreground text-xs justify-center"
                >
                  Limpiar filtros
                </DropdownMenuItem>
              </>
            )}

          </DropdownMenuContent>
        </DropdownMenu>

        {/* Canal Global */}
        <MultiSelect
          options={CANAL_GLOBAL_OPTIONS}
          onValueChange={setSelectedCanales}
          defaultValue={ALL_CANALES}
          placeholder="Canal Global"
          className="flex-1 min-w-[160px] bg-card border border-border max-w-[240px] text-sm h-10"
          maxCount={2}
          animation={0}
        />

        {(paymentStatus !== ALL || orderStatus !== ALL) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-10 text-xs text-muted-foreground hover:text-foreground shrink-0"
            onClick={resetFilters}
          >
            Limpiar
          </Button>
        )}
      </div>

      {/* ── Pedidos table ── */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-3">
          <div>
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} resultado(s) · haz clic en una fila para ver detalle
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-b-xl border-t border-dashed border-border py-16 text-center">
              <p className="text-sm font-medium">Sin resultados</p>
              <p className="max-w-sm text-xs text-muted-foreground">
                Prueba a ampliar el periodo o restablecer los filtros.
              </p>
              <Button type="button" variant="secondary" size="sm" onClick={resetFilters}>
                Restablecer
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Fecha</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Canal global</TableHead>
                    <TableHead>Canal detallado</TableHead>
                    <TableHead className="text-right">Ingresos</TableHead>
                    <TableHead className="text-right">Coste</TableHead>
                    <TableHead className="text-right">Pares</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead className="pr-4">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row) => (
                    <TableRow
                      key={row.order_id}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                      onClick={() => setSelected(row)}
                    >
                      <TableCell className="pl-4 whitespace-nowrap tabular-nums text-muted-foreground">
                        {formatShortDate(row.date)}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-medium">{row.order_id}</TableCell>
                      <TableCell>{row.channel_macro}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {row.channel_detallado}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(row.revenue)}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {formatCurrency(row.cost)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{row.pairs}</TableCell>
                      <TableCell>
                        <Badge variant={paymentVariant[row.payment_status]}>
                          {paymentLabel[row.payment_status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-4">
                        <Badge variant={orderVariant[row.order_status]}>
                          {orderLabel[row.order_status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Estado de pedidos ── */}
      <EstadoPedidosCard
        stats={stats}
        activePayment={paymentStatus}
        activeOrder={orderStatus}
        onSelectPaid={() => handleEstadoClick("paid")}
        onSelectPending={() => handleEstadoClick("pending")}
        onSelectCancelled={() => handleEstadoClick("cancelled")}
      />

      {/* ── Order detail modal ── */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>Pedido {selected.order_id}</DialogTitle>
                <DialogDescription>
                  {formatShortDate(selected.date)} · {selected.channel_detallado}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Canal global</p>
                    <p className="font-medium">{selected.channel_macro}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Canal detallado</p>
                    <p className="font-medium font-mono text-xs">{selected.channel_detallado}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ingresos</p>
                    <p className="font-mono font-medium tabular-nums">{formatCurrency(selected.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Coste atribuido</p>
                    <p className="font-mono font-medium tabular-nums">{formatCurrency(selected.cost)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pares vendidos</p>
                    <p className="font-mono font-medium tabular-nums">{selected.pairs}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Margen bruto (sim.)</p>
                    <p className="font-mono font-medium tabular-nums">
                      {formatCurrency(selected.revenue - selected.cost)}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  <Badge variant={paymentVariant[selected.payment_status]}>
                    Pago: {paymentLabel[selected.payment_status]}
                  </Badge>
                  <Badge variant={orderVariant[selected.order_status]}>
                    Pedido: {orderLabel[selected.order_status]}
                  </Badge>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
