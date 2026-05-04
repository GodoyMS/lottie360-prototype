import { createContext } from "react"

export type Session = { email: string; name: string } | null

export type AuthContextValue = {
  session: Session
  login: (email: string, name: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
