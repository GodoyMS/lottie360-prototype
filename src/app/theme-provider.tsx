import type { ReactNode } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="lottie360-theme"
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  )
}
