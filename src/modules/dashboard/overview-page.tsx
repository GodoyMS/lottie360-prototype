import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Euro,
  Filter,
  Package,
  PercentCircle,
  ShoppingBag,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  buildDailyComparativo,
  buildRevenueTimeSeries,
  computeDashboardKpis,
  mockOrders,
} from "@/data/dashboard";
import { filterByStrictRange } from "@/lib/date-range";
import { DateRangePicker } from "@/components/ui/date-picker";
import {
  currentMonthRange,
  previousPeriod,
  strictRangeFromDateRange,
} from "@/lib/date-range";
import {
  formatChartAxisDate,
  formatCurrency,
  formatNumber,
} from "@/lib/format";
import { isCpaAlert, isRoasAlert } from "@/lib/metric-alerts";
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
import { MultiSelect } from "@/components/ui/multi-select";
import { cn } from "@/lib/utils";

const CANAL_GLOBAL_OPTIONS = [
  { value: "Shopify", label: "Shopify" },
  { value: "Meta", label: "Meta" },
  { value: "Kommo", label: "Kommo" },
];

const ALL_CANALES = CANAL_GLOBAL_OPTIONS.map((o) => o.value);

const revenueChartConfig = {
  revenue: {
    label: "Ingresos",
    theme: {
      light: "oklch(0.52 0.22 264)",
      dark: "oklch(0.72 0.18 264)",
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

const ordersLeadsChartConfig = {
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
} satisfies ChartConfig;

// ─── Canal color helper (deterministic, no hardcoded names) ───────────────────

const CANAL_PALETTES = [
  { bg: "bg-blue-600 dark:bg-blue-500",    badge: "border-blue-500/40 bg-blue-500/8 text-blue-700 dark:text-blue-300" },
  { bg: "bg-violet-600 dark:bg-violet-500", badge: "border-violet-500/40 bg-violet-500/8 text-violet-700 dark:text-violet-300" },
  { bg: "bg-emerald-600 dark:bg-emerald-500", badge: "border-emerald-500/40 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300" },
  { bg: "bg-rose-600 dark:bg-rose-500",    badge: "border-rose-500/40 bg-rose-500/8 text-rose-700 dark:text-rose-300" },
  { bg: "bg-amber-600 dark:bg-amber-500",  badge: "border-amber-500/40 bg-amber-500/8 text-amber-700 dark:text-amber-300" },
  { bg: "bg-cyan-600 dark:bg-cyan-500",    badge: "border-cyan-500/40 bg-cyan-500/8 text-cyan-700 dark:text-cyan-300" },
] as const;

function canalPalette(canal: string, allCanales: string[]) {
  const idx = allCanales.indexOf(canal);
  return CANAL_PALETTES[(idx >= 0 ? idx : 0) % CANAL_PALETTES.length]!;
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

type KpiCardProps = {
  title: string;
  value: string;
  icon: React.ElementType;
  alert?: "cpa" | "roas" | null;
  children?: React.ReactNode;
  className?: string;
};

function KpiCard({
  title,
  value,
  icon: Icon,
  alert,
  children,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/70 bg-card px-3 py-2.5 shadow-sm transition-shadow hover:shadow-md",
        alert && "ring-1 ring-amber-500/35 dark:ring-amber-400/30",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </span>
        <Icon className="size-3 text-muted-foreground/60" aria-hidden />
      </div>
      <div className="flex flex-wrap items-baseline gap-1">
        <span className="font-mono text-[15px] font-semibold leading-none tracking-tight tabular-nums">
          {value}
        </span>
        {alert === "cpa" && (
          <Badge
            variant="outline"
            className="border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-100 text-[9px] px-1 py-0 leading-tight"
          >
            CPA alto
          </Badge>
        )}
        {alert === "roas" && (
          <Badge
            variant="outline"
            className="border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-100 text-[9px] px-1 py-0 leading-tight"
          >
            ROAS bajo
          </Badge>
        )}
      </div>
      {children && <div className="mt-1">{children}</div>}
    </div>
  );
}

// ─── Trend chip ───────────────────────────────────────────────────────────────

function TrendChip({ pct }: { pct: number }) {
  const positive = pct >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[10px] font-medium",
        positive
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-rose-500 dark:text-rose-400",
      )}
    >
      {positive ? (
        <ArrowUpRight className="size-2.5" />
      ) : (
        <ArrowDownRight className="size-2.5" />
      )}
      {positive ? "+" : ""}
      {formatNumber(pct, 1)}% vs ant.
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function OverviewPage() {
  const [ready, setReady] = useState(false);
  const mr = currentMonthRange();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: mr.from,
    to: mr.to,
  });
  const [selectedCanales, setSelectedCanales] = useState<string[]>(ALL_CANALES);
  const [comparativoCanal, setComparativoCanal] = useState<string>(ALL_CANALES[0]!);

  const strictRange = useMemo(
    () => strictRangeFromDateRange(dateRange),
    [dateRange],
  );

  const prevRange = useMemo(() => previousPeriod(strictRange), [strictRange]);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 420);
    return () => window.clearTimeout(t);
  }, []);

  // Keep comparativo canal valid when main filter changes
  useEffect(() => {
    if (!selectedCanales.includes(comparativoCanal)) {
      setComparativoCanal(selectedCanales[0] ?? ALL_CANALES[0]!);
    }
  }, [selectedCanales, comparativoCanal]);

  const kpis = useMemo(
    () => computeDashboardKpis(strictRange, selectedCanales),
    [strictRange, selectedCanales],
  );

  const prevKpis = useMemo(
    () => computeDashboardKpis(prevRange, selectedCanales),
    [prevRange, selectedCanales],
  );

  const series = useMemo(
    () => buildRevenueTimeSeries(strictRange, kpis),
    [strictRange, kpis],
  );

  const dailyComparativo = useMemo(
    () => buildDailyComparativo(strictRange, [comparativoCanal]),
    [strictRange, comparativoCanal],
  );

  const salesByGlobal = useMemo(() => {
    const ordersIn = filterByStrictRange(mockOrders, strictRange).filter((o) =>
      selectedCanales.includes(o.channel_macro),
    );
    const m = new Map<string, number>();
    for (const o of ordersIn) {
      if (o.payment_status !== "paid" || o.order_status === "cancelled")
        continue;
      m.set(o.channel_macro, (m.get(o.channel_macro) ?? 0) + o.revenue);
    }
    return [...m.entries()]
      .map(([channel_global, revenue]) => ({ channel_global, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [strictRange, selectedCanales]);

  const revenueTrend =
    prevKpis.revenue > 0
      ? ((kpis.revenue - prevKpis.revenue) / prevKpis.revenue) * 100
      : 0;

  const aggCpaAlert = isCpaAlert(kpis.cpa);
  const aggRoasAlert = isRoasAlert(kpis.roas);

  if (!ready) {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Resumen</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Vista general de ventas, marketing y atribución.
        </p>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex  flex-col md:flex-row flex-wrap items-center gap-2 flex-1">
        <div className="flex justify-start w-full md:w-auto items-center gap-1.5 shrink-0 text-muted-foreground">
          <Filter className="size-3.5" />
          <span className="text-xs font-medium">Filtros</span>
        </div>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          className="h-10 w-full md:w-auto text-sm min-w-[140px]"
        />
        <div className="h-4 hidden md:block w-px bg-border/60 shrink-0" />

        <MultiSelect
          options={CANAL_GLOBAL_OPTIONS}
          onValueChange={setSelectedCanales}
          defaultValue={ALL_CANALES}
          placeholder="Canal Global"
          className=" flex-1  min-w-[160px] bg-card border border-border max-w-[240px] text-sm"
          maxCount={2}
          animation={0}
        />
      </div>

      {/* ── KPI grid (8 cards) ── */}
      <section className="grid gap-2 grid-cols-2 md:grid-cols-4 xl:grid-cols-8">
        {/* 1 · Ingresos */}
        <KpiCard
          title="Ingresos"
          value={formatCurrency(kpis.revenue)}
          icon={Euro}
        >
          <TrendChip pct={revenueTrend} />
        </KpiCard>

        {/* 2 · Pedidos */}
        <KpiCard
          title="Pedidos"
          value={formatNumber(kpis.orders, 0)}
          icon={Package}
        >
          <div className="flex flex-wrap gap-0.5">
            <Badge
              variant="outline"
              className="border-emerald-500/40 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300 text-[9px]  py-0 leading-tight"
            >
              {formatNumber(kpis.orders_paid, 0)} pagados
            </Badge>
            <Badge
              variant="outline"
              className="border-amber-500/40 bg-amber-500/8 text-amber-700 dark:text-amber-300 text-[9px] py-0 leading-tight"
            >
              {formatNumber(kpis.orders_pending, 0)} pendientes
            </Badge>
            <Badge
              variant="outline"
              className="border-rose-500/40 bg-rose-500/8 text-rose-700 dark:text-rose-300 text-[9px]  py-0 leading-tight"
            >
              {formatNumber(kpis.orders_cancelled, 0)} cancelados
            </Badge>
          </div>
        </KpiCard>

        {/* 3 · Pares Vendidos */}
        <KpiCard
          title="Pares Vendidos"
          value={formatNumber(kpis.pairs_sold, 0)}
          icon={ShoppingBag}
        >
          <span className="text-[10px] text-muted-foreground leading-tight">
            {formatNumber(kpis.pairs_sold, 0)} pares en el periodo
          </span>
        </KpiCard>

        {/* 4 · Inversión */}
        <KpiCard
          title="Inversión"
          value={formatCurrency(kpis.ad_spend)}
          icon={Wallet}
        >
          <span className="text-[10px] text-muted-foreground leading-tight">
            Gasto publicitario del periodo
          </span>
        </KpiCard>

        {/* 5 · CPA */}
        <KpiCard
          title="CPA"
          value={formatCurrency(kpis.cpa, true)}
          icon={Target}
          alert={aggCpaAlert ? "cpa" : null}
        >
          <span className="text-[10px] text-muted-foreground leading-tight">
            Inversión / leads
          </span>
        </KpiCard>

        {/* 6 · ROAS */}
        <KpiCard
          title="ROAS"
          value={`${formatNumber(kpis.roas, 2)}×`}
          icon={TrendingUp}
          alert={aggRoasAlert ? "roas" : null}
        >
          <span className="text-[10px] text-muted-foreground leading-tight">
            Ingresos / inversión
          </span>
        </KpiCard>

        {/* 7 · Leads */}
        <KpiCard title="Leads" value={formatNumber(kpis.leads, 0)} icon={Users}>
          <span className="text-[10px] text-muted-foreground leading-tight">
            Captaciones registradas
          </span>
        </KpiCard>

        {/* 8 · %Conversión */}
        <KpiCard
          title="% Conversión"
          value={`${formatNumber(kpis.conversion_rate * 100, 1)}%`}
          icon={PercentCircle}
        >
          <span className="text-[10px] text-muted-foreground leading-tight">
            Pedidos / Ventas ({formatNumber(kpis.orders_paid, 0)}/
            {formatNumber(kpis.leads, 0)})
          </span>
        </KpiCard>
      </section>

      {/* ── Charts ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos en el tiempo
            </CardTitle>
            <CardDescription className="text-xs">
              Serie diaria del rango seleccionado
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <ChartContainer
              config={revenueChartConfig}
              className="aspect-auto h-[220px] w-full"
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
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pedidos vs Leads
            </CardTitle>
            <CardDescription className="text-xs">
              Comparativa diaria
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <ChartContainer
              config={ordersLeadsChartConfig}
              className="aspect-auto h-[220px] w-full"
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
      </div>

      {/* ── Ventas por canal global ── */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Ventas por canal global
          </CardTitle>
          <CardDescription className="text-xs">
            Ingresos por pago confirmado
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-0">
          <ChartContainer
            config={channelBarConfig}
            className="aspect-auto h-[160px] w-full"
          >
            <BarChart
              data={salesByGlobal}
              layout="vertical"
              margin={{ left: 4, right: 24, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="channel_global"
                width={72}
                tickLine={false}
                axisLine={false}
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
                maxBarSize={28}
                fill="var(--color-revenue)"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* ── Comparativo por días ── */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-medium">Comparativo por días</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Métricas diarias · más reciente primero
              </CardDescription>
            </div>
            {/* Canal selector — only visible when 2+ canales selected */}
            {selectedCanales.length > 1 && (
              <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 p-0.5">
                {selectedCanales.map((canal) => (
                  <button
                    key={canal}
                    type="button"
                    onClick={() => setComparativoCanal(canal)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                      comparativoCanal === canal
                        ? cn("shadow-sm text-white", canalPalette(canal, ALL_CANALES).bg)
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    {canal}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {dailyComparativo.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Sin datos para el periodo seleccionado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6 text-xs">Fecha</TableHead>
                    <TableHead className="text-xs text-right">Ventas</TableHead>
                    <TableHead className="text-xs">Canal</TableHead>
                    <TableHead className="text-xs text-right">Pedidos</TableHead>
                    <TableHead className="text-xs text-right">Inversión</TableHead>
                    <TableHead className="text-xs text-right">CPA</TableHead>
                    <TableHead className="text-xs text-right pr-6">ROAS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyComparativo.map((row) => (
                    <TableRow key={row.date} className="group">
                      <TableCell className="pl-6 font-medium tabular-nums text-sm">
                        {new Date(row.date + "T12:00:00").toLocaleDateString(
                          "es-PE",
                          { day: "numeric", month: "short", weekday: "short" },
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm font-medium">
                        {formatCurrency(row.ventas)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] font-medium", canalPalette(comparativoCanal, ALL_CANALES).badge)}
                        >
                          {comparativoCanal}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {formatNumber(row.pedidos, 0)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {row.inversion > 0 ? (
                          formatCurrency(row.inversion)
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {row.cpa > 0 ? (
                          <span className={cn(isCpaAlert(row.cpa) && "font-medium text-amber-700 dark:text-amber-400")}>
                            {formatCurrency(row.cpa, true)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="pr-6 text-right tabular-nums text-sm">
                        {row.roas > 0 ? (
                          <span className={cn(isRoasAlert(row.roas) && "font-medium text-amber-700 dark:text-amber-400")}>
                            {formatNumber(row.roas, 2)}×
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
