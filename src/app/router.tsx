import { Navigate, Route, Routes } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import { RequireAuth } from "@/components/dashboard/require-auth"
import { DashboardLayout } from "@/app/dashboard-layout"
import { LoginPage } from "@/modules/auth/login-page"
import { OverviewPage } from "@/modules/dashboard/overview-page"
import { MarketingPage } from "@/modules/marketing/marketing-page"
import { SalesPage } from "@/modules/sales/sales-page"
import { SettingsPage } from "@/modules/settings/settings-page"
import { ParametrosCanalesPage } from "@/modules/parametros-canales/parametros-canales-page"

function RootRedirect() {
  const { session } = useAuth()
  return <Navigate to={session ? "/dashboard" : "/login"} replace />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<OverviewPage />} />
          <Route path="/dashboard/marketing" element={<MarketingPage />} />
          <Route
            path="/dashboard/parametros-canales"
            element={<ParametrosCanalesPage />}
          />
          <Route path="/dashboard/sales" element={<SalesPage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}
