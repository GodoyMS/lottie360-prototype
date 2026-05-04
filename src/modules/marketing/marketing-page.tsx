import { useEffect, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import { ChevronRight, Filter } from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { mockAdSpend, mockLeads } from "@/data/dashboard"
import { filterByDateRange } from "@/lib/date-filters"
import { formatCurrency, formatNumber } from "@/lib/format"
import {
  isCpaAlert,
  isRoasAlert,
  CPA_ALERT_THRESHOLD,
  ROAS_ALERT_THRESHOLD,
} from "@/lib/metric-alerts"
import type { ChannelPerformanceRow, TimeRangeFilter } from "@/types/analytics"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

const spendChartConfig = {
  spend: {
    label: "Inversión",
    theme: {
      light: "oklch(0.5 0.2 25)",
      dark: "oklch(0.68 0.16 25)",
    },
  },
} satisfies ChartConfig

const leadsLineConfig = {
  leads: {
    label: "Leads",
    theme: {
      light: "oklch(0.52 0.2 264)",
      dark: "oklch(0.72 0.16 264)",
    },
  },
} satisfies ChartConfig

function aggregateChannels(
  ads: typeof mockAdSpend,
  leads: typeof mockLeads
): ChannelPerformanceRow[] {
  const map = new Map<string, ChannelPerformanceRow>()

  function key(m: string, d: string) {
    return `${m}|${d}`
  }

  for (const a of ads) {
    const k = key(a.channel_macro, a.channel_detallado)
    let row = map.get(k)
    if (!row) {
      row = {
        channel_macro: a.channel_macro,
        channel_detallado: a.channel_detallado,
        spend: 0,
        revenue: 0,
        leads: 0,
        orders: 0,
        cpa: 0,
        roas: 0,
      }
      map.set(k, row)
    }
    row.spend += a.spend
    row.revenue += a.revenue_attributed
  }

  for (const l of leads) {
    const k = key(l.channel_macro, l.channel_detallado)
    let row = map.get(k)
    if (!row) {
      row = {
        channel_macro: l.channel_macro,
        channel_detallado: l.channel_detallado,
        spend: 0,
        revenue: 0,
        leads: 0,
        orders: 0,
        cpa: 0,
        roas: 0,
      }
      map.set(k, row)
    }
    row.leads += 1
  }

  return [...map.values()].map((row) => ({
    ...row,
    roas: row.spend > 0 ? row.revenue / row.spend : 0,
    cpa: row.leads > 0 ? row.spend / row.leads : row.spend,
  }))
}

function stableExtra(seed: string, mod: number) {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h) % mod
}

export function MarketingPage() {
  const [range, setRange] = useState<TimeRangeFilter>("month")
  const [ready, setReady] = useState(false)
  const [drill, setDrill] = useState<ChannelPerformanceRow | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 380)
    return () => window.clearTimeout(t)
  }, [])

  const filteredAds = useMemo(
    () => filterByDateRange(mockAdSpend, range),
    [range]
  )
  const filteredLeads = useMemo(
    () => filterByDateRange(mockLeads, range),
    [range]
  )

  const rows = useMemo(
    () => aggregateChannels(filteredAds, filteredLeads),
    [filteredAds, filteredLeads]
  )

  const spendByChannel = useMemo(() => {
    const m = new Map<string, number>()
    for (const a of filteredAds) {
      m.set(
        a.channel_detallado,
        (m.get(a.channel_detallado) ?? 0) + a.spend
      )
    }
    return [...m.entries()]
      .map(([name, spend]) => ({ name, spend }))
      .sort((a, b) => b.spend - a.spend)
  }, [filteredAds])

  const leadsByChannel = useMemo(() => {
    const m = new Map<string, number>()
    for (const l of filteredLeads) {
      m.set(
        l.channel_detallado,
        (m.get(l.channel_detallado) ?? 0) + 1
      )
    }
    return [...m.entries()]
      .map(([name, leads]) => ({ name, leads }))
      .sort((a, b) => b.leads - a.leads)
  }, [filteredLeads])

  if (!ready) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Marketing
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Rendimiento por canal, CPA y ROAS. Explora el detalle simulando un
            drill-down en la tabla.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" aria-hidden />
          <Select
            value={range}
            onValueChange={(v) => setRange(v as TimeRangeFilter)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Último día</SelectItem>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="charts" className="gap-6">
        <TabsList>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="table">Tabla por canal</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  Inversión por canal detallado
                </CardTitle>
                <CardDescription>
                  Suma de gasto en el periodo seleccionado
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-0">
                <ChartContainer
                  config={spendChartConfig}
                  className="aspect-auto h-[280px] w-full"
                >
                  <BarChart
                    data={spendByChannel}
                    margin={{ left: 8, right: 8, top: 8, bottom: 48 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-28}
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      width={44}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => formatNumber(Number(v), 0)}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(v) => [
                            formatCurrency(Number(v)),
                            "Inversión",
                          ]}
                        />
                      }
                    />
                    <Bar
                      dataKey="spend"
                      fill="var(--color-spend)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  Leads por canal detallado
                </CardTitle>
                <CardDescription>Conteo en el mismo periodo</CardDescription>
              </CardHeader>
              <CardContent className="pl-0">
                <ChartContainer
                  config={leadsLineConfig}
                  className="aspect-auto h-[280px] w-full"
                >
                  <LineChart
                    data={leadsByChannel}
                    margin={{ left: 8, right: 8, top: 8, bottom: 48 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-28}
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      width={32}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(v) => [
                            formatNumber(Number(v), 0),
                            "Leads",
                          ]}
                        />
                      }
                    />
                    <Line
                      name="Leads"
                      type="monotone"
                      dataKey="leads"
                      stroke="var(--color-leads)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Legend />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="table">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-medium">
                CPA y ROAS por canal
              </CardTitle>
              <CardDescription>
                Umbrales: CPA &gt; {CPA_ALERT_THRESHOLD} € · ROAS &lt;{" "}
                {ROAS_ALERT_THRESHOLD}×
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="overflow-x-auto rounded-lg border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10" />
                      <TableHead>Canal macro</TableHead>
                      <TableHead>Canal detallado</TableHead>
                      <TableHead className="text-right">Leads</TableHead>
                      <TableHead className="text-right">Inversión</TableHead>
                      <TableHead className="text-right">CPA</TableHead>
                      <TableHead className="text-right">ROAS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="py-12 text-center text-muted-foreground"
                        >
                          No hay datos en este periodo.
                        </TableCell>
                      </TableRow>
                    ) : (
                      rows.map((row) => (
                        <TableRow
                          key={`${row.channel_macro}-${row.channel_detallado}`}
                          className="cursor-pointer transition-colors hover:bg-muted/50"
                          onClick={() => setDrill(row)}
                        >
                          <TableCell>
                            <ChevronRight className="size-4 text-muted-foreground" />
                          </TableCell>
                          <TableCell className="font-medium">
                            {row.channel_macro}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {row.channel_detallado}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatNumber(row.leads, 0)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCurrency(row.spend)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            <span
                              className={
                                isCpaAlert(row.cpa)
                                  ? "font-medium text-amber-700 dark:text-amber-400"
                                  : ""
                              }
                            >
                              {formatCurrency(row.cpa, true)}
                            </span>
                            {isCpaAlert(row.cpa) ? (
                              <Badge
                                variant="outline"
                                className="ml-2 border-amber-500/50 bg-amber-500/10 text-[10px] text-amber-900 dark:text-amber-100"
                              >
                                CPA
                              </Badge>
                            ) : null}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            <span
                              className={
                                isRoasAlert(row.roas)
                                  ? "font-medium text-amber-700 dark:text-amber-400"
                                  : ""
                              }
                            >
                              {formatNumber(row.roas, 2)}×
                            </span>
                            {isRoasAlert(row.roas) ? (
                              <Badge
                                variant="outline"
                                className="ml-2 border-amber-500/50 bg-amber-500/10 text-[10px] text-amber-900 dark:text-amber-100"
                              >
                                ROAS
                              </Badge>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {drill ? (
                <Card className="border-primary/20 bg-muted/20 shadow-inner">
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base">
                        Detalle: {drill.channel_detallado}
                      </CardTitle>
                      <CardDescription>
                        {drill.channel_macro} · Vista simulada de embudo
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDrill(null)}
                    >
                      Cerrar
                    </Button>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-border/60 bg-background/80 p-4">
                      <p className="text-xs text-muted-foreground">
                        Impresiones (simulado)
                      </p>
                      <p className="mt-1 font-mono text-xl font-semibold tabular-nums">
                        {formatNumber(
                          Math.round(
                            drill.spend * 42 +
                              stableExtra(
                                `${drill.channel_detallado}-imp`,
                                8000
                              )
                          ),
                          0
                        )}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/80 p-4">
                      <p className="text-xs text-muted-foreground">
                        Clics (simulado)
                      </p>
                      <p className="mt-1 font-mono text-xl font-semibold tabular-nums">
                        {formatNumber(
                          Math.round(
                            drill.leads * 18 +
                              stableExtra(`${drill.channel_detallado}-clk`, 400)
                          ),
                          0
                        )}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/80 p-4">
                      <p className="text-xs text-muted-foreground">
                        Conv. a lead
                      </p>
                      <p className="mt-1 font-mono text-xl font-semibold tabular-nums">
                        {formatNumber(
                          drill.leads > 0
                            ? (drill.leads / (drill.leads * 18 + 200)) * 100
                            : 0,
                          1
                        )}
                        %
                      </p>
                    </div>
                    <Separator className="sm:col-span-3" />
                    <p className="text-sm text-muted-foreground sm:col-span-3">
                      En un entorno real, aquí enlazaríamos campañas, creatividades
                      y cohortes. Este bloque solo ilustra el patrón de drill-down.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Pulsa una fila para ver el detalle simulado del canal.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
