import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"

export function RequireAuth() {
  const { session } = useAuth()
  const location = useLocation()

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
