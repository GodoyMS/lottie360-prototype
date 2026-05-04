import { useEffect, useMemo, useState } from "react";
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
  Euro,
  MousePointerClick,
  Package,
  Wallet,
  Target,
  TrendingUp,
  TriangleAlert,
  SportShoe,
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
  const { mappings, revision } = useChannelAttribution();

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 520);
    return () => window.clearTimeout(t);
  }, []);

  const kpis = useMemo(() => computeDashboardKpis(), []);
  const series = useMemo(() => buildRevenueTimeSeries(14), []);
  const channelPerf = useMemo(
    () => buildChannelPerformance(mappings),
    [mappings, revision],
  );

  const salesByMacro = useMemo(() => {
    const m = new Map<string, number>();
    for (const o of mockOrders) {
      if (o.payment_status !== "paid" || o.order_status === "cancelled")
        continue;
      m.set(o.channel_macro, (m.get(o.channel_macro) ?? 0) + o.revenue);
    }
    return [...m.entries()]
      .map(([channel_macro, revenue]) => ({ channel_macro, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }, []);

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
          title="Inversión ads"
          value={formatCurrency(kpis.ad_spend)}
          sub="Gasto atribuido a campañas"
          icon={Wallet}
        />
        <KpiStatCard
          title="ROAS"
          value={`${formatNumber(kpis.roas, 2)}×`}
          sub="Retorno sobre inversión publicitaria"
          icon={TrendingUp}
          alert={aggRoasAlert ? "roas" : null}
        />
        <KpiStatCard
          title="CPA"
          value={formatCurrency(kpis.cpa, true)}
          sub="Coste por lead"
          icon={Target}
          alert={aggCpaAlert ? "cpa" : null}
        />

        <KpiStatCard
          title="Pares vendidos"
          value={formatNumber(90, 0)}
          sub="Captaciones del periodo"
          icon={SportShoe}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Ingresos en el tiempo
            </CardTitle>
            <CardDescription>Últimos 14 días (serie simulada)</CardDescription>
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
          <CardContent className="space-y-4">
            <div className="flex h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="bg-emerald-500/90 transition-all"
                style={{
                  width: `${(kpis.orders_paid / Math.max(kpis.orders_paid + kpis.orders_pending + kpis.orders_cancelled, 1)) * 100}%`,
                }}
                title="Pagados"
              />
              <div
                className="bg-amber-500/85"
                style={{
                  width: `${(kpis.orders_pending / Math.max(kpis.orders_paid + kpis.orders_pending + kpis.orders_cancelled, 1)) * 100}%`,
                }}
              />
              <div
                className="bg-destructive/80"
                style={{
                  width: `${(kpis.orders_cancelled / Math.max(kpis.orders_paid + kpis.orders_pending + kpis.orders_cancelled, 1)) * 100}%`,
                }}
              />
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <Badge variant="secondary" className="gap-1.5 font-normal">
                <span className="size-2 rounded-full bg-emerald-500" />
                Pagados: {formatNumber(kpis.orders_paid, 0)}
              </Badge>
              <Badge variant="secondary" className="gap-1.5 font-normal">
                <span className="size-2 rounded-full bg-amber-500" />
                Pendientes: {formatNumber(kpis.orders_pending, 0)}
              </Badge>
              <Badge variant="secondary" className="gap-1.5 font-normal">
                <span className="size-2 rounded-full bg-destructive" />
                Cancelados: {formatNumber(kpis.orders_cancelled, 0)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Inversión vs ingresos
          </CardTitle>
          <CardDescription>
            Gasto publicitario e ingresos atribuidos (serie diaria)
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
                width={40}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${Math.round(v / 1000)}k`}
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
      </Card> */}

      {/* <div className="grid gap-6 lg:grid-cols-2">
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
      </div> */}

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-medium">
              Canales en alerta
            </CardTitle>
            <CardDescription>
              CPA &gt; {CPA_ALERT_THRESHOLD} € o ROAS &lt;{" "}
              {ROAS_ALERT_THRESHOLD}×
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
