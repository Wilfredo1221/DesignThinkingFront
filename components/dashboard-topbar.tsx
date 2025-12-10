"use client"

import { Bell, Menu, MessageSquare, PlusCircle, FolderPlus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useAuth } from "@/components/auth-provider"

export function DashboardTopbar() {
  const { user } = useAuth()

  return (
    <header className="h-20 border-b bg-background/80 backdrop-blur-md sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <DashboardSidebar />
          </SheetContent>
        </Sheet>

        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-foreground">Bienvenido, {user?.name || "Usuario"}</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">¡Es un gran día para innovar!</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 rounded-xl shadow-xl border-border/50">
            <div className="p-4 border-b font-medium">Notificaciones</div>
            <div className="max-h-[300px] overflow-y-auto">
              <div className="p-4 hover:bg-muted/50 transition-colors cursor-pointer border-b last:border-0 flex gap-3 items-start">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-full mt-1">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Nuevo mensaje</p>
                  <p className="text-xs text-muted-foreground">Juan te ha enviado un mensaje sobre tu propuesta.</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Hace 5 min</p>
                </div>
              </div>
              <div className="p-4 hover:bg-muted/50 transition-colors cursor-pointer border-b last:border-0 flex gap-3 items-start">
                <div className="bg-purple-100 text-purple-600 p-2 rounded-full mt-1">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Nuevo Reto Publicado</p>
                  <p className="text-xs text-muted-foreground">Banco Futuro ha publicado "Innovación Financiera".</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Hace 1 hora</p>
                </div>
              </div>
              <div className="p-4 hover:bg-muted/50 transition-colors cursor-pointer border-b last:border-0 flex gap-3 items-start">
                <div className="bg-green-100 text-green-600 p-2 rounded-full mt-1">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Nuevo Proyecto Disponible</p>
                  <p className="text-xs text-muted-foreground">Se busca equipo para App de Salud Mental.</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Hace 2 horas</p>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="flex items-center gap-3 pl-4 border-l">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user?.name || "Usuario"}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role || "Invitado"}</p>
          </div>
          <Avatar className="h-10 w-10 border-2 border-primary/10">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "US"}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
