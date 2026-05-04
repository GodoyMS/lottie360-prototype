import { useState } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginPage() {
  const { session, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? "/dashboard"

  const [email, setEmail] = useState("analista@lottie360.demo")
  const [name, setName] = useState("Equipo Lottie")

  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedEmail = email.trim()
    const trimmedName = name.trim() || "Usuario"
    if (!trimmedEmail) return
    login(trimmedEmail, trimmedName)
    navigate(from, { replace: true })
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-muted/30 p-4">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.55_0.22_264/0.18),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.55_0.2_264/0.25),transparent)]"
        aria-hidden
      />
      <Card className="relative z-10 w-full max-w-sm border-border/80 shadow-lg shadow-black/5 dark:shadow-black/30">
        <CardHeader className="space-y-4 pb-2 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <Sparkles className="size-6" aria-hidden />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Lottie 360
            </CardTitle>
            <CardDescription className="text-balance pt-1.5">
              Inicia sesión para acceder al panel de analítica ecommerce.
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4 mb-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Contraseña</Label>
              <Input
                id="name"
                type="password"
                autoComplete="name"
                placeholder="Tu contraseña"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full">
              Entrar al panel
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Prototipo sin backend: cualquier credencial válida inicia sesión.
            </p>
          </CardFooter>
        </form>
      </Card>
     <div className="pt-4">
     <p className="relative z-10  text-center text-xs text-muted-foreground">
        ¿Necesitas ayuda?{" "}
        <Link
          to="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Contacta a soporte interno
        </Link>
      </p>
     </div>
    </div>
  )
}
