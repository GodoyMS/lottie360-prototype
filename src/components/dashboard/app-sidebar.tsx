import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Megaphone,
  ShoppingCart,
  Settings2,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const nav = [
  {
    title: "Resumen",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Marketing",
    href: "/dashboard/marketing",
    icon: Megaphone,
  },
  {
    title: "Ventas",
    href: "/dashboard/sales",
    icon: ShoppingCart,
  },
  {
    title: "Ajustes",
    href: "/dashboard/settings",
    icon: Settings2,
  },
] as const;

export function AppSidebar() {
  const { pathname } = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="gap-3 p-2">
        <Link
          to="/dashboard"
          className="flex justify-center items-center gap-2 rounded-lg py-1.5 text-left transition-colors hover:bg-sidebar-accent/80"
        >
          <div
            className={cn(
              isCollapsed ? "size-6" : "size-9",
              "flex shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm",
            )}
          >
            <Sparkles className="size-4" aria-hidden />
          </div>
          <div className="grid min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold tracking-tight">
              Lottie 360
            </span>
            <span className="truncate text-xs text-muted-foreground">
              Analytics ecommerce
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(item.href)
                    }
                    tooltip={item.title}
                  >
                    <Link to={item.href}>
                      <item.icon className="size-4 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
        <p className="leading-snug">Versión prototipo · Datos simulados</p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
