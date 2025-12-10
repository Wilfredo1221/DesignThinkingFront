"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from "framer-motion"
import { Users, Briefcase, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/components/auth-layout"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"

type Role = "participant" | "client"

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [role, setRole] = useState<Role>("participant")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    login("Ronny Rau", role, "usuario@ejemplo.com")
    
    setIsLoading(false)
    router.push("/dashboard")
  }

  return (
    <AuthLayout 
      title="Crea tu cuenta" 
      subtitle="Únete a la comunidad de innovación Pista 8 Inovation"
    >
      <div className="space-y-6">
        {/* Role Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/50 rounded-xl">
          <button
            onClick={() => setRole("participant")}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-300",
              role === "participant" 
                ? "bg-background text-primary shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="w-4 h-4" />
            Participante
          </button>
          <button
            onClick={() => setRole("client")}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-300",
              role === "client" 
                ? "bg-background text-primary shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Briefcase className="w-4 h-4" />
            Cliente
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input id="name" placeholder="Juan Pérez" required className="h-11 rounded-xl bg-background/50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" placeholder="juan@ejemplo.com" required className="h-11 rounded-xl bg-background/50" />
              </div>

              {role === "participant" ? (
                <div className="space-y-2">
                  <Label htmlFor="institution">Institución (Opcional)</Label>
                  <Input id="institution" placeholder="Universidad / Empresa" className="h-11 rounded-xl bg-background/50" />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa <span className="text-destructive">*</span></Label>
                  <Input id="company" placeholder="Nombre de tu empresa" required className="h-11 rounded-xl bg-background/50" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" type="tel" placeholder="+57 300..." required className="h-11 rounded-xl bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input id="country" placeholder="Colombia" required className="h-11 rounded-xl bg-background/50" />
                </div>
              </div>

              {/* Removed ID number field */}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" placeholder="••••••" required className="h-11 rounded-xl bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar</Label>
                  <Input id="confirm-password" type="password" placeholder="••••••" required className="h-11 rounded-xl bg-background/50" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <Button 
            type="submit" 
            className="w-full h-12 text-lg rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all mt-6" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              "Crear Cuenta"
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground pt-2">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Inicia Sesión
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}
