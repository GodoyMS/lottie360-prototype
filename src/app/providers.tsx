import type { ReactNode } from "react"
import { AuthProvider } from "@/hooks/auth-provider"
import { ThemeProvider } from "@/app/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster richColors position="top-center" />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
