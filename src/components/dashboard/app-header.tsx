import { useNavigate } from "react-router-dom"
import { useTheme } from "next-themes"
import {
  LogOut,
  Monitor,
  Moon,
  Search,
  Sun,
  UserRound,
} from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"

export function AppHeader() {
  const { session, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/80 px-3 backdrop-blur-md md:px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-6" />
      <div className="relative hidden min-w-0 flex-1 md:block md:max-w-md">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Buscar pedidos, campañas o canales…"
          className="h-9 border-border/80 bg-muted/40 pl-9 shadow-none transition-colors focus-visible:bg-background"
          aria-label="Buscar en el panel"
        />
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative size-9 shrink-0 border-border/80"
              aria-label="Tema"
            >
              <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Apariencia</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={theme ?? "system"}
              onValueChange={setTheme}
            >
              <DropdownMenuRadioItem value="light">
                <Sun className="mr-2 size-4" />
                Claro
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <Moon className="mr-2 size-4" />
                Oscuro
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <Monitor className="mr-2 size-4" />
                Sistema
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 gap-2 rounded-lg px-2 font-normal"
            >
              <span className="flex size-8 items-center justify-center rounded-md bg-muted">
                <UserRound className="size-4 text-muted-foreground" />
              </span>
              <span className="hidden max-w-[140px] truncate text-left text-sm leading-tight lg:block">
                <span className="block truncate font-medium">
                  {session?.name ?? "Usuario"}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {session?.email}
                </span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem disabled>
                <UserRound className="mr-2 size-4" />
                {session?.email}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                logout()
                navigate("/login", { replace: true })
              }}
            >
              <LogOut className="mr-2 size-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
