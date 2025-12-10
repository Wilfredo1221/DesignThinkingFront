"use client"

import Link from "next/link"
import { usePathname } from 'next/navigation'
import { Home, User, MessageSquare, LogOut, Folder } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()

  const navItems = [
    { href: "/dashboard", label: "Inicio", icon: Home },
    ...(user?.role === "participant" ? [{ href: "/dashboard/my-projects", label: "Mis Proyectos", icon: Folder }] : []),
    { href: "/dashboard/profile", label: "Perfil", icon: User },
    { href: "/dashboard/messages", label: "Mensajes", icon: MessageSquare },
  ]

  return (
    <div className="h-full flex flex-col p-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
          P8
        </div>
        <span className="font-bold text-xl tracking-tight">Pista 8 Inovation</span>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="pt-6 border-t">
        <Link href="/login" onClick={logout}>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </Button>
        </Link>
      </div>
    </div>
  )
}
