import { useEffect, useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"
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
import { Eye, Filter, MousePointerClick, TrendingUp } from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { mockAdSpend, mockLeads, mockOrders } from "@/data/dashboard"
import { useChannelAttribution } from "@/hooks/use-channel-attribution"
import {
  currentMonthRange,
  filterByStrictRange,
  strictRangeFromDateRange,
} from "@/lib/date-range"
import { resolveAdSpendChannels } from "@/lib/resolve-ad-attribution"
import type { AdChannelMappingRow } from "@/types/ad-channel-mapping"
import { formatCurrency, formatNumber } from "@/lib/format"
import {
  isCpaAlert,
  isRoasAlert,
  CPA_ALERT_THRESHOLD,
  ROAS_ALERT_THRESHOLD,
} from "@/lib/metric-alerts"
import type { ChannelPerformanceRow } from "@/types/analytics"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DateRangePicker } from "@/components/ui/date-picker"
import { MultiSelect } from "@/components/ui/multi-select"
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
import { cn } from "@/lib/utils"

// ─── Constants ────────────────────────────────────────────────────────────────

const CANAL_GLOBAL_OPTIONS = [
  { value: "Shopify", label: "Shopify" },
  { value: "Meta", label: "Meta" },
  { value: "Kommo", label: "Kommo" },
]
const ALL_CANALES = CANAL_GLOBAL_OPTIONS.map((o) => o.value)

/** Thumbnail images mapped by Meta canal_detallado (ad ID). */
const THUMBNAIL_BY_DETALLADO: Record<string, string> = {
  "120243819860760063":
    "https://scontent-fra3-2.xx.fbcdn.net/v/t15.5256-10/615813053_2142552929891083_930418831615400630_n.jpg?_nc_cat=111&ccb=1-7&_nc_eui2=AeH6Q42itN36sgEDAdC1oIdtCUqYnNJ9jngJSpic0n2OeOPIMmj5yD47znWRrQaBvzs&_nc_ohc=9z6fC-peRYoQ7kNvwFMVtOE&_nc_oc=AdqiI41sE2g6iDelDuqCgDhi30NU7V1TBGSGFY2p2Nm37_-EBGLDu1fZZqEhiDLZqqc&_nc_zt=23&_nc_ht=scontent-fra3-2.xx&edm=AEuWsiQEAAAA&_nc_gid=dsEnONf3GWLfCwn-fK8VkA&_nc_tpa=Q5bMBQFYH3Wl6ifxpAzVtpBzGVfEEIFJ-C6PSq8vjvP0Rt1czUsCCl7Kql2eoZ6jvyomp19UMLpiIvDnug&stp=c0.5000x0.5000f_dst-emg0_p1024x1024_q75_tt6&ur=5fad0e&_nc_sid=58080a&oh=00_Af7wYMZlxJYpAQ1jGVONVoejqNRiAgtDCZ_yr-QeBZpjCw&oe=6A0429EF",
  
  "120243876956030063":
    "https://scontent-fra5-1.xx.fbcdn.net/v/t15.5256-10/617707509_2072005180241734_4788325937054842524_n.jpg?_nc_cat=100&ccb=1-7&_nc_eui2=AeFjiVJ2XV4Ga9Hcj7tag6HmnmKyNq792M-eYrI2rv3Yz9fICbGt6WP6L_LHGT7BzV0&_nc_ohc=lmsPbb3LaDEQ7kNvwFSt7dW&_nc_oc=Adp151fNsaua4lZB0mtwyMz2EEP-fcoiRonlcTQztZgeHdKyjKXg6vlSoDSaeH0un8Y&_nc_zt=23&_nc_ht=scontent-fra5-1.xx&edm=AEuWsiQEAAAA&_nc_gid=xJvvDA0KCQ56C0lNdSF7jQ&_nc_tpa=Q5bMBQFV8O_3IdFyJtF4ihid8G-Tz8x6IzVP7vEifrWWhs1UKg8ryCfcoSYm7vSW_NQlnCm02kInQRCpQg&stp=c0.5000x0.5000f_dst-emg0_p1024x1024_q75_tt6&ur=5fad0e&_nc_sid=58080a&oh=00_Af5xqAoh1dDPSGvnvtncEoFUaGAe9AIXTx1PayYou9h8Lg&oe=6A043F95",
  "120243884310180063":
    "https://scontent-fra3-1.xx.fbcdn.net/v/t15.5256-10/616505795_33720761250848556_8679631455732231306_n.jpg?_nc_cat=105&ccb=1-7&_nc_eui2=AeE0ChuzI2SHeCSjzFUSZ_b8Cxbahyk76hYLFtqHKTvqFmmZEbHAVWz0FnkFLVfHu1Q&_nc_ohc=RhWsBkPio-4Q7kNvwE61Pib&_nc_oc=Adp3QPcAE3SDJuTmyMkpAnLFtKHYXZJPiPxXCOTsvBLcBMZ2W-tOL1-aRUH5k7BjcI8&_nc_zt=23&_nc_ht=scontent-fra3-1.xx&edm=AEuWsiQEAAAA&_nc_gid=4trGF8RSQUYf_C03mqH4zA&_nc_tpa=Q5bMBQH0NppRjqq9DLRNz7LFEpzkNC5csKQiPJzF019qPIkS3VzzkC1yWPqsxmQbDiv_K3ffvHmUQBl2iw&stp=c0.5000x0.5000f_dst-emg0_p1024x1024_q75_tt6&ur=5fad0e&_nc_sid=58080a&oh=00_Af5CmyVYMv32QqHxZyGOWrxWws8H3XSFeeoMrGRaVIdmTw&oe=6A0432CF",
}

// ─── Chart configs ─────────────────────────────────────────────────────────────

const spendChartConfig = {
  spend: {
    label: "Inversión",
    theme: { light: "oklch(0.5 0.2 25)", dark: "oklch(0.68 0.16 25)" },
  },
} satisfies ChartConfig

const leadsLineConfig = {
  leads: {
    label: "Leads",
    theme: { light: "oklch(0.52 0.2 264)", dark: "oklch(0.72 0.16 264)" },
  },
} satisfies ChartConfig

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stableExtra(seed: string, mod: number) {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h) % mod
}

function aggregateChannels(
  ads: typeof mockAdSpend,
  leads: typeof mockLeads,
  orders: typeof mockOrders,
  mappings: readonly AdChannelMappingRow[],
  canales: string[]
): ChannelPerformanceRow[] {
  const map = new Map<string, ChannelPerformanceRow>()

  function key(m: string, d: string) {
    return `${m}|${d}`
  }

  for (const a of ads) {
    const { channel_macro, channel_detallado } = resolveAdSpendChannels(a, mappings)
    if (!canales.includes(channel_macro)) continue
    const k = key(channel_macro, channel_detallado)
    let row = map.get(k)
    if (!row) {
      row = { channel_macro, channel_detallado, spend: 0, revenue: 0, leads: 0, orders: 0, cpa: 0, roas: 0 }
      map.set(k, row)
    }
    row.spend += a.spend
    row.revenue += a.revenue_attributed
  }

  for (const l of leads) {
    if (!canales.includes(l.channel_macro)) continue
    const k = key(l.channel_macro, l.channel_detallado)
    let row = map.get(k)
    if (!row) {
      row = { channel_macro: l.channel_macro, channel_detallado: l.channel_detallado, spend: 0, revenue: 0, leads: 0, orders: 0, cpa: 0, roas: 0 }
      map.set(k, row)
    }
    row.leads += 1
  }

  for (const o of orders) {
    if (!canales.includes(o.channel_macro)) continue
    if (o.order_status !== "completed") continue
    const k = key(o.channel_macro, o.channel_detallado)
    let row = map.get(k)
    if (!row) {
      row = { channel_macro: o.channel_macro, channel_detallado: o.channel_detallado, spend: 0, revenue: 0, leads: 0, orders: 0, cpa: 0, roas: 0 }
      map.set(k, row)
    }
    row.orders += 1
  }

  return [...map.values()].map((row) => ({
    ...row,
    roas: row.spend > 0 ? row.revenue / row.spend : 0,
    cpa: row.leads > 0 ? row.spend / row.leads : row.spend,
  }))
}

// ─── Canal stat card (Graficos tab) ───────────────────────────────────────────

type CanalStatCardProps = {
  canal: string
  spend: number
  leads: number
}

function CanalStatCard({ canal, spend, leads }: CanalStatCardProps) {
  const impressions = Math.round(spend * 42 + stableExtra(`${canal}-imp`, 8000))
  const clicks = Math.round(leads * 18 + stableExtra(`${canal}-clk`, 400))
  const convPct = clicks > 0 ? (leads / clicks) * 100 : 0

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold">{canal}</CardTitle>
        <CardDescription className="text-xs">Métricas simuladas del periodo</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Eye className="size-3" />
              <span className="text-[10px] font-medium uppercase tracking-wide">Impresiones</span>
            </div>
            <span className="font-mono text-base font-semibold tabular-nums">
              {formatNumber(impressions, 0)}
            </span>
            <span className="text-[10px] text-muted-foreground">simulado</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MousePointerClick className="size-3" />
              <span className="text-[10px] font-medium uppercase tracking-wide">Clics</span>
            </div>
            <span className="font-mono text-base font-semibold tabular-nums">
              {formatNumber(clicks, 0)}
            </span>
            <span className="text-[10px] text-muted-foreground">simulado</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="size-3" />
              <span className="text-[10px] font-medium uppercase tracking-wide">Conv. a lead</span>
            </div>
            <span className="font-mono text-base font-semibold tabular-nums">
              {formatNumber(convPct, 1)}%
            </span>
            <span className="text-[10px] text-muted-foreground">leads / clics</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function MarketingPage() {
  const { mappings, revision } = useChannelAttribution()
  const mr = currentMonthRange()
  const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: mr.from, to: mr.to })
  const [selectedCanales, setSelectedCanales] = useState<string[]>(ALL_CANALES)
  const [ready, setReady] = useState(false)

  const strictRange = useMemo(() => strictRangeFromDateRange(dateRange), [dateRange])

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 380)
    return () => window.clearTimeout(t)
  }, [])

  const filteredAds = useMemo(
    () => filterByStrictRange(mockAdSpend, strictRange).filter((a) => selectedCanales.includes(a.channel_macro)),
    [strictRange, selectedCanales]
  )
  const filteredLeads = useMemo(
    () => filterByStrictRange(mockLeads, strictRange).filter((l) => selectedCanales.includes(l.channel_macro)),
    [strictRange, selectedCanales]
  )
  const filteredOrders = useMemo(
    () => filterByStrictRange(mockOrders, strictRange).filter((o) => selectedCanales.includes(o.channel_macro)),
    [strictRange, selectedCanales]
  )

  const rows = useMemo(
    () => aggregateChannels(filteredAds, filteredLeads, filteredOrders, mappings, selectedCanales),
    [filteredAds, filteredLeads, filteredOrders, mappings, revision, selectedCanales]
  )

  const spendByChannel = useMemo(() => {
    const m = new Map<string, number>()
    for (const a of filteredAds) {
      const { channel_detallado } = resolveAdSpendChannels(a, mappings)
      m.set(channel_detallado, (m.get(channel_detallado) ?? 0) + a.spend)
    }
    return [...m.entries()].map(([name, spend]) => ({ name, spend })).sort((a, b) => b.spend - a.spend)
  }, [filteredAds, mappings, revision])

  const leadsByChannel = useMemo(() => {
    const m = new Map<string, number>()
    for (const l of filteredLeads) {
      m.set(l.channel_detallado, (m.get(l.channel_detallado) ?? 0) + 1)
    }
    return [...m.entries()].map(([name, leads]) => ({ name, leads })).sort((a, b) => b.leads - a.leads)
  }, [filteredLeads])

  /** Spend + leads aggregated per canal global for the stat cards */
  const canalGlobalStats = useMemo(() => {
    return selectedCanales.map((canal) => {
      const spend = filteredAds
        .filter((a) => a.channel_macro === canal)
        .reduce((s, a) => s + a.spend, 0)
      const leads = filteredLeads.filter((l) => l.channel_macro === canal).length
      return { canal, spend, leads }
    })
  }, [filteredAds, filteredLeads, selectedCanales])

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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Marketing</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Rendimiento por canal, CPA y ROAS.
        </p>
      </div>

      {/* ── Filter bar (same style as summary) ── */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-muted/10 px-3 py-2 shadow-sm">
        <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
          <Filter className="size-3.5" />
          <span className="text-xs font-medium">Filtros</span>
        </div>
        <div className="h-4 w-px bg-border/60 shrink-0" />
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          className="h-8 text-sm min-w-[140px]"
        />
        <MultiSelect
          options={CANAL_GLOBAL_OPTIONS}
          onValueChange={setSelectedCanales}
          defaultValue={ALL_CANALES}
          placeholder="Canal Global"
          className="h-8 min-w-[160px] max-w-[240px] text-sm"
          maxCount={2}
          animation={0}
        />
      </div>

      <Tabs defaultValue="charts" className="gap-6">
        <TabsList>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="table">Tabla por canal</TabsTrigger>
        </TabsList>

        {/* ── Graficos tab ── */}
        <TabsContent value="charts" className="space-y-6">

          {/* Canal Global stat cards */}
          {canalGlobalStats.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {canalGlobalStats.map(({ canal, spend, leads }) => (
                <CanalStatCard key={canal} canal={canal} spend={spend} leads={leads} />
              ))}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-medium">Inversión por canal detallado</CardTitle>
                <CardDescription>Suma de gasto en el periodo seleccionado</CardDescription>
              </CardHeader>
              <CardContent className="pl-0">
                <ChartContainer config={spendChartConfig} className="aspect-auto h-[280px] w-full">
                  <BarChart data={spendByChannel} margin={{ left: 8, right: 8, top: 8, bottom: 48 }}>
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
                    <YAxis width={44} tickLine={false} axisLine={false} tickFormatter={(v) => formatNumber(Number(v), 0)} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(v) => [formatCurrency(Number(v)), "Inversión"]} />} />
                    <Bar dataKey="spend" fill="var(--color-spend)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-medium">Leads por canal detallado</CardTitle>
                <CardDescription>Conteo en el mismo periodo</CardDescription>
              </CardHeader>
              <CardContent className="pl-0">
                <ChartContainer config={leadsLineConfig} className="aspect-auto h-[280px] w-full">
                  <LineChart data={leadsByChannel} margin={{ left: 8, right: 8, top: 8, bottom: 48 }}>
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
                    <YAxis width={32} tickLine={false} axisLine={false} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(v) => [formatNumber(Number(v), 0), "Leads"]} />} />
                    <Line name="Leads" type="monotone" dataKey="leads" stroke="var(--color-leads)" strokeWidth={2} dot={{ r: 4 }} />
                    <Legend />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tabla tab ── */}
        <TabsContent value="table">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-medium">CPA y ROAS por canal</CardTitle>
              <CardDescription>
                Umbrales: CPA &gt; {CPA_ALERT_THRESHOLD} € · ROAS &lt; {ROAS_ALERT_THRESHOLD}×
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Canal global</TableHead>
                      <TableHead>Canal detallado</TableHead>
                      <TableHead className="text-center w-20">Miniatura</TableHead>
                      <TableHead className="text-right">Leads</TableHead>
                      <TableHead className="text-right">#Pedidos</TableHead>
                      <TableHead className="text-right">%Conv.</TableHead>
                      <TableHead className="text-right">Inversión</TableHead>
                      <TableHead className="text-right">CPA</TableHead>
                      <TableHead className="text-right pr-4">ROAS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                          No hay datos en este periodo.
                        </TableCell>
                      </TableRow>
                    ) : (
                      rows.map((row) => {
                        const convPct = row.leads > 0 ? (row.orders / row.leads) * 100 : 0
                        const thumbnail = THUMBNAIL_BY_DETALLADO[row.channel_detallado]
                        return (
                          <TableRow key={`${row.channel_macro}-${row.channel_detallado}`}>
                            <TableCell className="pl-4 font-medium">{row.channel_macro}</TableCell>
                            <TableCell className="text-muted-foreground font-mono text-xs">
                              {row.channel_detallado}
                            </TableCell>
                            <TableCell className="text-center">
                              {thumbnail ? (
                                <img
                                  src={thumbnail}
                                  alt={`Miniatura ${row.channel_detallado}`}
                                  className="mx-auto h-10 w-10 rounded-md object-cover ring-1 ring-border/40"
                                  loading="lazy"
                                />
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatNumber(row.leads, 0)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatNumber(row.orders, 0)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {row.leads > 0 ? (
                                <span className={cn(convPct < 5 && "text-muted-foreground")}>
                                  {formatNumber(convPct, 1)}%
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatCurrency(row.spend)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              <span className={cn(isCpaAlert(row.cpa) && "font-medium text-amber-700 dark:text-amber-400")}>
                                {formatCurrency(row.cpa, true)}
                              </span>
                              {isCpaAlert(row.cpa) && (
                                <Badge variant="outline" className="ml-1.5 border-amber-500/50 bg-amber-500/10 text-[10px] text-amber-900 dark:text-amber-100">
                                  CPA
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right tabular-nums pr-4">
                              <span className={cn(isRoasAlert(row.roas) && "font-medium text-amber-700 dark:text-amber-400")}>
                                {formatNumber(row.roas, 2)}×
                              </span>
                              {isRoasAlert(row.roas) && (
                                <Badge variant="outline" className="ml-1.5 border-amber-500/50 bg-amber-500/10 text-[10px] text-amber-900 dark:text-amber-100">
                                  ROAS
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
