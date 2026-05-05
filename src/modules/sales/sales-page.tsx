import { useEffect, useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"
import { mockOrders } from "@/data/orders"
import type { ChannelMacro, OrderRecord, OrderStatus, PaymentStatus } from "@/types/analytics"
import { formatCurrency, formatShortDate } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { DateRangePicker } from "@/components/ui/date-picker"
import {
  defaultDateRange,
  strictRangeFromDateRange,
  isIsoDateInRange,
} from "@/lib/date-range"

const ALL = "__all__"

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

const paymentVariant: Record<
  PaymentStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  paid: "default",
  pending: "secondary",
  failed: "destructive",
}

const orderVariant: Record<
  OrderStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  completed: "default",
  pending: "secondary",
  cancelled: "destructive",
  refunded: "outline",
}

const macros: ChannelMacro[] = [
  "Paid Social",
  "Search",
  "Marketplace",
  "Organic",
  "Email",
]

export function SalesPage() {
  const dr0 = defaultDateRange()
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: dr0.from,
    to: dr0.to,
  })
  const strictRange = useMemo(
    () => strictRangeFromDateRange(dateRange),
    [dateRange],
  )
  const [ready, setReady] = useState(false)
  const [orderStatus, setOrderStatus] = useState<string>(ALL)
  const [channel, setChannel] = useState<string>(ALL)
  const [selected, setSelected] = useState<OrderRecord | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 400)
    return () => window.clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    return mockOrders.filter((o) => {
      if (orderStatus !== ALL && o.order_status !== orderStatus) return false
      if (channel !== ALL && o.channel_macro !== channel) return false
      return isIsoDateInRange(o.date, strictRange)
    })
  }, [orderStatus, channel, strictRange])

  if (!ready) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-2/3 max-w-md" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Ventas
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Listado de pedidos con filtros y detalle en modal (datos simulados).
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">Filtros</CardTitle>
          <CardDescription>
            Refina la tabla por fechas, estado y canal macro.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="grid w-full min-w-0 gap-2 sm:max-w-[320px]">
            <Label>Fechas</Label>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              className="w-full"
              numberOfMonths={2}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="f-order">Estado del pedido</Label>
            <Select value={orderStatus} onValueChange={setOrderStatus}>
              <SelectTrigger id="f-order" className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="refunded">Reembolsado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="f-channel">Canal macro</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger id="f-channel" className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos</SelectItem>
                {macros.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="outline"
            className="sm:ml-auto"
            onClick={() => {
              setOrderStatus(ALL)
              setChannel(ALL)
              const d = defaultDateRange()
              setDateRange({ from: d.from, to: d.to })
            }}
          >
            Limpiar filtros
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-medium">Pedidos</CardTitle>
            <CardDescription>
              {filtered.length} resultado(s) · Pulsa una fila para ver detalle
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
              <p className="text-sm font-medium">Sin resultados</p>
              <p className="max-w-sm text-xs text-muted-foreground">
                Prueba a ampliar el periodo o restablecer los filtros.
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setOrderStatus(ALL)
                  setChannel(ALL)
                  const d = defaultDateRange()
                  setDateRange({ from: d.from, to: d.to })
                }}
              >
                Restablecer
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Canal macro</TableHead>
                  <TableHead>Canal detallado</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                  <TableHead className="text-right">Coste</TableHead>
                  <TableHead className="text-right">Pares</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow
                    key={row.order_id}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={() => setSelected(row)}
                  >
                    <TableCell className="whitespace-nowrap tabular-nums text-muted-foreground">
                      {formatShortDate(row.date)}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium">
                      {row.order_id}
                    </TableCell>
                    <TableCell>{row.channel_macro}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.channel_detallado}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(row.revenue)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatCurrency(row.cost)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.pairs}
                    </TableCell>
                    <TableCell>
                      <Badge variant={paymentVariant[row.payment_status]}>
                        {paymentLabel[row.payment_status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={orderVariant[row.order_status]}>
                        {orderLabel[row.order_status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>Pedido {selected.order_id}</DialogTitle>
                <DialogDescription>
                  {formatShortDate(selected.date)} ·{" "}
                  {selected.channel_detallado}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Canal macro</p>
                    <p className="font-medium">{selected.channel_macro}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Canal detallado</p>
                    <p className="font-medium">{selected.channel_detallado}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ingresos</p>
                    <p className="font-mono font-medium tabular-nums">
                      {formatCurrency(selected.revenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Coste atribuido</p>
                    <p className="font-mono font-medium tabular-nums">
                      {formatCurrency(selected.cost)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pares vendidos</p>
                    <p className="font-mono font-medium tabular-nums">
                      {selected.pairs}
                    </p>
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
