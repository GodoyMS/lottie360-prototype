import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import {
  Building2,
  Euro,
  MousePointerClick,
  Package,
  Target,
  TrendingUp,
  TriangleAlert,
  Users,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { KpiStatCard } from "@/components/dashboard/kpi-stat-card";
import {
  buildChannelPerformance,
  buildRevenueTimeSeries,
  computeDashboardKpis,
} from "@/data/dashboard";
import { useChannelAttribution } from "@/hooks/use-channel-attribution";
import { mockOrders } from "@/data/orders";
import { DateRangePicker } from "@/components/ui/date-picker";
import {
  defaultDateRange,
  filterByStrictRange,
  strictRangeFromDateRange,
} from "@/lib/date-range";
import {
  formatChartAxisDate,
  formatCurrency,
  formatNumber,
} from "@/lib/format";
import {
  isCpaAlert,
  isRoasAlert,
  CPA_ALERT_THRESHOLD,
  ROAS_ALERT_THRESHOLD,
} from "@/lib/metric-alerts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const revenueChartConfig = {
  revenue: {
    label: "Ingresos",
    theme: {
      light: "oklch(0.52 0.22 264)",
      dark: "oklch(0.72 0.18 264)",
    },
  },
} satisfies ChartConfig;

const composedChartConfig = {
  orders: {
    label: "Pedidos",
    theme: {
      light: "oklch(0.45 0.15 264)",
      dark: "oklch(0.65 0.16 264)",
    },
  },
  leads: {
    label: "Leads",
    theme: {
      light: "oklch(0.55 0.14 200)",
      dark: "oklch(0.7 0.12 200)",
    },
  },
  spend: {
    label: "Inversión",
    theme: {
      light: "oklch(0.5 0.2 25)",
      dark: "oklch(0.68 0.16 25)",
    },
  },
  revenueLine: {
    label: "Ingresos",
    theme: {
      light: "oklch(0.42 0.18 145)",
      dark: "oklch(0.62 0.14 145)",
    },
  },
} satisfies ChartConfig;

const channelBarConfig = {
  revenue: {
    label: "Ingresos",
    theme: {
      light: "oklch(0.52 0.2 264)",
      dark: "oklch(0.72 0.16 264)",
    },
  },
} satisfies ChartConfig;

export function OverviewPage() {
  const [ready, setReady] = useState(false);
  const { mappings } = useChannelAttribution();
  const initialDr = defaultDateRange();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: initialDr.from,
    to: initialDr.to,
  });

  const strictRange = useMemo(
    () => strictRangeFromDateRange(dateRange),
    [dateRange],
  );

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 520);
    return () => window.clearTimeout(t);
  }, []);

  const kpis = useMemo(
    () => computeDashboardKpis(strictRange),
    [strictRange],
  );
  const series = useMemo(
    () => buildRevenueTimeSeries(strictRange, kpis),
    [strictRange, kpis],
  );
  const channelPerf = useMemo(
    () => buildChannelPerformance(mappings, strictRange),
    [mappings, strictRange],
  );

  const salesByMacro = useMemo(() => {
    const ordersIn = filterByStrictRange(mockOrders, strictRange);
    const m = new Map<string, number>();
    for (const o of ordersIn) {
      if (o.payment_status !== "paid" || o.order_status === "cancelled")
        continue;
      m.set(o.channel_macro, (m.get(o.channel_macro) ?? 0) + o.revenue);
    }
    return [...m.entries()]
      .map(([channel_macro, revenue]) => ({ channel_macro, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [strictRange]);

  const aggCpaAlert = isCpaAlert(kpis.cpa);
  const aggRoasAlert = isRoasAlert(kpis.roas);

  const alertChannels = useMemo(
    () => channelPerf.filter((r) => isCpaAlert(r.cpa) || isRoasAlert(r.roas)),
    [channelPerf],
  );

  if (!ready) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Resumen
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Vista general de ventas, marketing y atribución. Datos simulados para
          presentación interna.
        </p>
      </div>

      <Card className="border-border/70 bg-muted/15 shadow-sm">
        <CardHeader className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">Periodo</CardTitle>
            <CardDescription className="text-xs">
              Filtra KPIs, gráficos y tablas de este resumen.
            </CardDescription>
          </div>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            className="w-full min-w-0 sm:w-[min(100%,320px)]"
            numberOfMonths={2}
          />
        </CardHeader>
      </Card>

      {(aggCpaAlert || aggRoasAlert) && (
        <Alert className="border-amber-500/40 bg-amber-500/8 dark:bg-amber-500/10">
          <TriangleAlert className="text-amber-600 dark:text-amber-400" />
          <AlertTitle>Alertas de rendimiento</AlertTitle>
          <AlertDescription className="text-pretty">
            {aggCpaAlert ? (
              <span className="block">
                El CPA global ({formatCurrency(kpis.cpa, true)}) supera el
                objetivo de {CPA_ALERT_THRESHOLD.toFixed(0)} €.
              </span>
            ) : null}
            {aggRoasAlert ? (
              <span className="mt-1 block">
                El ROAS global ({formatNumber(kpis.roas, 2)}×) está por debajo
                del mínimo recomendado {ROAS_ALERT_THRESHOLD.toFixed(0)}×.
              </span>
            ) : null}
          </AlertDescription>
        </Alert>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiStatCard
          title="Ingresos"
          value={formatCurrency(kpis.revenue)}
          sub="Pedidos pagados confirmados"
          icon={Euro}
        />
        <KpiStatCard
          title="Pedidos"
          value={formatNumber(kpis.orders, 0)}
          sub={`${formatNumber(kpis.orders_paid, 0)} pagados · ${formatNumber(kpis.orders_pending, 0)} pendientes`}
          icon={Package}
        />
        <KpiStatCard
          title="Coste de producción"
          value={formatCurrency(kpis.production_cost)}
          sub="Suma del coste de producción en pedidos del periodo"
          icon={Building2}
        />
        <KpiStatCard
          title="ROAS"
          value={`${formatNumber(kpis.roas, 2)}×`}
          sub="Ingresos / inversión publicitaria del periodo"
          icon={TrendingUp}
          alert={aggRoasAlert ? "roas" : null}
        />
        <KpiStatCard
          title="CPA"
          value={formatCurrency(kpis.cpa, true)}
          sub="Inversión publicitaria / leads del periodo"
          icon={Target}
          alert={aggCpaAlert ? "cpa" : null}
        />
        <KpiStatCard
          title="Leads"
          value={formatNumber(kpis.leads, 0)}
          sub="Captaciones registradas en el periodo"
          icon={Users}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Ingresos en el tiempo
            </CardTitle>
            <CardDescription>
              Serie diaria proporcional a los KPIs del rango seleccionado.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <ChartContainer
              config={revenueChartConfig}
              className="aspect-auto h-[280px] w-full"
            >
              <AreaChart
                data={series}
                margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillRev" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-revenue)"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-revenue)"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={formatChartAxisDate}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => formatNumber(Number(v), 0)}
                  width={44}
                />
                <ChartTooltip
                  cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, p) =>
                        p[0]?.payload?.date
                          ? formatChartAxisDate(p[0].payload.date as string)
                          : ""
                      }
                      formatter={(value) => [
                        formatCurrency(Number(value)),
                        "Ingresos",
                      ]}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  fill="url(#fillRev)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Estado de pedidos
            </CardTitle>
            <CardDescription>
              Distribución en el dataset simulado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(() => {
              const tot = Math.max(
                kpis.orders_paid + kpis.orders_pending + kpis.orders_cancelled,
                1,
              );
              const rows = [
                {
                  key: "paid",
                  label: "Pagados",
                  count: kpis.orders_paid,
                  pct: (kpis.orders_paid / tot) * 100,
                  bar: "from-emerald-400/95 via-emerald-500/90 to-emerald-600/75",
                  ring: "ring-emerald-500/15",
                },
                {
                  key: "pending",
                  label: "Pendientes de pago",
                  count: kpis.orders_pending,
                  pct: (kpis.orders_pending / tot) * 100,
                  bar: "from-amber-300/95 via-amber-400/90 to-amber-500/80",
                  ring: "ring-amber-500/15",
                },
                {
                  key: "cancelled",
                  label: "Cancelados",
                  count: kpis.orders_cancelled,
                  pct: (kpis.orders_cancelled / tot) * 100,
                  bar: "from-rose-400/90 via-destructive/85 to-destructive/70",
                  ring: "ring-destructive/15",
                },
              ];
              return rows.map((row) => (
                <div
                  key={row.key}
                  className={`rounded-xl border border-border/50 bg-linear-to-br from-muted/40 to-muted/15 p-3 shadow-sm ring-1 ${row.ring} transition-all duration-300 hover:border-border hover:shadow-md`}
                >
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium tracking-tight">
                      {row.label}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {formatNumber(row.count, 0)}
                      </span>
                      <span className="mx-1.5 text-border">·</span>
                      {formatNumber(row.pct, 1)}%
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted/70 shadow-inner">
                    <div
                      className={`h-full rounded-full bg-linear-to-r ${row.bar} transition-all duration-700 ease-out`}
                      style={{ width: `${Math.max(row.pct, row.count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </div>
              ));
            })()}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Inversión publicitaria vs ingresos
          </CardTitle>
          <CardDescription>
            Gasto en ads e ingresos atribuidos en el rango seleccionado.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-0">
          <ChartContainer
            config={composedChartConfig}
            className="aspect-auto h-[300px] w-full"
          >
            <ComposedChart
              data={series}
              margin={{ left: 8, right: 12, top: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickFormatter={formatChartAxisDate}
                tickMargin={8}
              />
              <YAxis
                yAxisId="left"
                width={44}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatNumber(Number(v), 0)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, p) =>
                      p[0]?.payload?.date
                        ? formatChartAxisDate(p[0].payload.date as string)
                        : ""
                    }
                  />
                }
              />
              <Bar
                yAxisId="left"
                dataKey="spend"
                fill="var(--color-spend)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
                name="Inversión"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenueLine)"
                strokeWidth={2}
                dot={false}
                name="Ingresos"
              />
              <Legend />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Pedidos vs leads
            </CardTitle>
            <CardDescription>Comparativa diaria</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <ChartContainer
              config={composedChartConfig}
              className="aspect-auto h-[280px] w-full"
            >
              <BarChart
                data={series}
                margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatChartAxisDate}
                  tickMargin={8}
                />
                <YAxis width={32} tickLine={false} axisLine={false} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, p) =>
                        p[0]?.payload?.date
                          ? formatChartAxisDate(p[0].payload.date as string)
                          : ""
                      }
                    />
                  }
                />
                <Bar
                  name="Pedidos"
                  dataKey="orders"
                  fill="var(--color-orders)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  name="Leads"
                  dataKey="leads"
                  fill="var(--color-leads)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Legend />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Ventas por canal macro
            </CardTitle>
            <CardDescription>Ingresos por pago confirmado</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <ChartContainer
              config={channelBarConfig}
              className="aspect-auto h-[220px] w-full"
            >
              <BarChart
                data={salesByMacro}
                layout="vertical"
                margin={{ left: 4, right: 16, top: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="channel_macro"
                  width={120}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => String(v).slice(0, 18)}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [
                        formatCurrency(Number(value)),
                        "Ingresos",
                      ]}
                    />
                  }
                />
                <Bar
                  dataKey="revenue"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={22}
                  fill="var(--color-revenue)"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-medium">
              Canales en alerta
            </CardTitle>
            <CardDescription>
              CPA &gt; {CPA_ALERT_THRESHOLD} € o ROAS &lt;{" "}
              {ROAS_ALERT_THRESHOLD}× · Mismo periodo que arriba.
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit shrink-0 gap-1">
            <MousePointerClick className="size-3.5" />
            {alertChannels.length} canal(es)
          </Badge>
        </CardHeader>
        <CardContent>
          {alertChannels.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No hay canales por encima de los umbrales en este periodo.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Canal macro</TableHead>
                  <TableHead>Canal detallado</TableHead>
                  <TableHead className="text-right">CPA</TableHead>
                  <TableHead className="text-right">ROAS</TableHead>
                  <TableHead className="text-right">Inversión</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alertChannels.map((row) => (
                  <TableRow
                    key={`${row.channel_macro}-${row.channel_detallado}`}
                  >
                    <TableCell className="font-medium">
                      {row.channel_macro}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.channel_detallado}
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
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(row.spend)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
