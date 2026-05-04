import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { AuthContext, type Session } from "@/hooks/auth-context"

const STORAGE_KEY = "lottie360_session"

function readSession(): Session {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Session
    if (!parsed?.email) return null
    return parsed
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(() => readSession())

  const login = useCallback((email: string, name: string) => {
    const next: NonNullable<Session> = { email, name }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setSession(next)
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setSession(null)
  }, [])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setSession(readSession())
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const value = useMemo(
    () => ({ session, login, logout }),
    [session, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
