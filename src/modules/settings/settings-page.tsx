import { useState } from "react"
import { useTheme } from "next-themes"
import { Bell, Monitor, Moon, Palette, Sun, User } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

const themeModes = [
  {
    value: "light" as const,
    title: "Claro",
    description: "Interfaz luminosa para entornos con buena luz.",
    icon: Sun,
  },
  {
    value: "dark" as const,
    title: "Oscuro",
    description: "Reduce fatiga visual en sesiones largas.",
    icon: Moon,
  },
  {
    value: "system" as const,
    title: "Sistema",
    description: "Sigue la preferencia del dispositivo.",
    icon: Monitor,
  },
]

export function SettingsPage() {
  const { session } = useAuth()
  const { theme, setTheme } = useTheme()
  const [emailNotif, setEmailNotif] = useState(true)
  const [freq, setFreq] = useState("daily")

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Ajustes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Preferencias de la cuenta y notificaciones (solo interfaz, sin
          persistencia en servidor).
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="size-4 text-muted-foreground" />
            <CardTitle className="text-base font-medium">Perfil</CardTitle>
          </div>
          <CardDescription>Datos de la sesión actual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Nombre</span>
            <span className="font-medium">{session?.name}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Correo</span>
            <span className="truncate font-mono text-xs">{session?.email}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-muted-foreground" />
            <CardTitle className="text-base font-medium">
              Notificaciones
            </CardTitle>
          </div>
          <CardDescription>
            Controla alertas de rendimiento y resúmenes (mock).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="email-notif">Correo de alertas</Label>
              <p className="text-xs text-muted-foreground">
                CPA y ROAS fuera de umbral
              </p>
            </div>
            <Switch
              id="email-notif"
              checked={emailNotif}
              onCheckedChange={setEmailNotif}
            />
          </div>
          <Separator />
          <div className="grid gap-2">
            <Label htmlFor="freq">Frecuencia del resumen</Label>
            <Select value={freq} onValueChange={setFreq}>
              <SelectTrigger id="freq" className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Casi en tiempo real</SelectItem>
                <SelectItem value="daily">Diario</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="size-4 text-muted-foreground" />
            <CardTitle className="text-base font-medium">Apariencia</CardTitle>
          </div>
          <CardDescription>
            Elige cómo se muestra Lottie 360. Se guarda en{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              localStorage
            </code>{" "}
            (<code className="rounded bg-muted px-1 py-0.5 text-xs">
              lottie360-theme
            </code>
            ).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {themeModes.map((m) => {
              const resolved = theme ?? "system"
              const active = resolved === m.value
              const Icon = m.icon
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setTheme(m.value)}
                  className={cn(
                    "flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all duration-200",
                    "hover:border-primary/40 hover:shadow-md",
                    active
                      ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                      : "border-border/70 bg-card"
                  )}
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="text-sm font-semibold">{m.title}</span>
                  <span className="text-xs leading-snug text-muted-foreground">
                    {m.description}
                  </span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
