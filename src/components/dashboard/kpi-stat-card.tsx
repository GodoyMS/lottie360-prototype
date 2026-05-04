import type { LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type KpiStatCardProps = {
  title: string
  description?: string
  value: string
  sub?: string
  icon: LucideIcon
  alert?: "cpa" | "roas" | null
  className?: string
}

export function KpiStatCard({
  title,
  description,
  value,
  sub,
  icon: Icon,
  alert,
  className,
}: KpiStatCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-border/80 shadow-sm transition-shadow hover:shadow-md",
        alert && "ring-1 ring-amber-500/35 dark:ring-amber-400/30",
        className
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardDescription className="text-xs font-medium tracking-wide uppercase">
            {title}
          </CardDescription>
          {description ? (
            <p className="text-[11px] text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4" aria-hidden />
        </span>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <CardTitle className="font-mono text-2xl font-semibold tracking-tight tabular-nums">
            {value}
          </CardTitle>
          {alert === "cpa" ? (
            <Badge
              variant="outline"
              className="border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-100"
            >
              CPA alto
            </Badge>
          ) : null}
          {alert === "roas" ? (
            <Badge
              variant="outline"
              className="border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-100"
            >
              ROAS bajo
            </Badge>
          ) : null}
        </div>
        {sub ? (
          <p className="text-xs text-muted-foreground tabular-nums">{sub}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
