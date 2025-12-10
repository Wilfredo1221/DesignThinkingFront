"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Users, Briefcase, Sparkles } from 'lucide-react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function LandingPage() {
  const [showRoles, setShowRoles] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5 flex flex-col">
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
            P8
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">Pista 8 Inovation</span>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => setShowRoles(false)}>
            Inicio
          </Button>
          <Button onClick={() => setShowRoles(true)}>Iniciar Sesión</Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto w-full relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
        
        <AnimatePresence mode="wait">
          {!showRoles ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-secondary-foreground text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                <span>La plataforma de innovación del futuro</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Comparte ideas, da vida a proyectos
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
                Participa en retos de innovación, conecta con empresas y haz realidad tus propuestas en un entorno colaborativo único.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                <Button 
                  size="lg" 
                  className="text-lg px-8 h-14 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105"
                  onClick={() => setShowRoles(true)}
                >
                  Iniciar Sesión
                </Button>
                <Link href="/register">
                  <Button variant="outline" size="lg" className="text-lg px-8 h-14 rounded-2xl border-2 hover:bg-secondary/50">
                    ¿Eres nuevo? Regístrate
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="roles"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-3xl"
            >
              <h2 className="text-3xl font-bold mb-8">¿Cómo quieres ingresar?</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Link href="/login?role=participant" className="group">
                  <Card className="p-8 h-full flex flex-col items-center justify-center gap-6 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer bg-card/50 backdrop-blur-sm border-2">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <Users className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">Participante</h3>
                      <p className="text-muted-foreground">
                        Propón soluciones, únete a proyectos y demuestra tu talento.
                      </p>
                    </div>
                    <div className="mt-auto pt-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary font-medium flex items-center gap-2">
                      Continuar <ArrowRight className="w-4 h-4" />
                    </div>
                  </Card>
                </Link>

                <Link href="/login?role=client" className="group">
                  <Card className="p-8 h-full flex flex-col items-center justify-center gap-6 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer bg-card/50 backdrop-blur-sm border-2">
                    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <Briefcase className="w-10 h-10 text-secondary-foreground group-hover:text-primary-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">Cliente</h3>
                      <p className="text-muted-foreground">
                        Publica retos, encuentra talento y gestiona proyectos innovadores.
                      </p>
                    </div>
                    <div className="mt-auto pt-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary font-medium flex items-center gap-2">
                      Continuar <ArrowRight className="w-4 h-4" />
                    </div>
                  </Card>
                </Link>
              </div>

              <Button 
                variant="ghost" 
                className="mt-8 text-muted-foreground hover:text-foreground"
                onClick={() => setShowRoles(false)}
              >
                Volver atrás
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground">
        <p>© 2025 Pista 8 Inovation Platform. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
