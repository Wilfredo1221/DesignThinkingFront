"use client"

import { useState } from "react"
import { Search, Filter, Sparkles, Plus, Hash } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ListingCard } from "@/components/listing-card"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

// Mock Data
const MOCK_CHALLENGES = [
  {
    id: "c1",
    type: "challenge" as const,
    title: "Rediseño de Experiencia Bancaria",
    status: "active" as const,
    progress: 65,
    publisher: "Banco Futuro",
    description: "Buscamos ideas innovadoras para transformar la experiencia de nuestros usuarios en sucursales físicas mediante tecnología.",
    likes: 124,
    hashtags: ["Fintech", "UX/UI", "Innovación"],
    startDate: "2025-03-01",
    endDate: "2025-04-15",
  },
  {
    id: "c2",
    type: "challenge" as const,
    title: "Sostenibilidad Urbana 2025",
    status: "active" as const,
    progress: 30,
    publisher: "Alcaldía Metropolitana",
    description: "Propuestas para mejorar la gestión de residuos en zonas residenciales de alta densidad.",
    likes: 89,
    hashtags: ["Sostenibilidad", "SmartCity", "Ecología"],
    startDate: "2025-03-10",
    endDate: "2025-05-01",
  },
]

const MOCK_PROJECTS = [
  {
    id: "p1",
    type: "project" as const,
    title: "App de Salud Mental con IA",
    status: "active" as const,
    progress: 80,
    publisher: "HealthTech Solutions",
    description: "Desarrollo de un asistente virtual empático para acompañamiento psicológico primario.",
    likes: 256,
    hashtags: ["Salud", "IA", "Mobile"],
    startDate: "2025-02-01",
    endDate: "2025-06-30",
    specs: {
      functionality: "Alta",
      budget: "$50,000 USD",
      scalability: "Global",
    }
  },
]

const NICHES = ["Tecnología", "Salud", "Finanzas", "Educación", "Arte", "Sostenibilidad", "Deportes", "Turismo", "Gastronomía", "Moda"]

export default function DashboardPage() {
  const { user } = useAuth()
  const [view, setView] = useState<"challenges" | "projects">("challenges")
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null)

  const data = view === "challenges" ? MOCK_CHALLENGES : MOCK_PROJECTS

  return (
    <div className="space-y-8">
      {/* Header & Filters */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Explorar Mundos
            </h2>
            <p className="text-muted-foreground">Descubre retos y proyectos que cambiarán el futuro.</p>
          </div>
          
          <div className="flex gap-2 items-center">
            {/* View Toggle */}
            <div className="bg-secondary/50 p-1 rounded-xl flex gap-1">
              <button
                onClick={() => setView("challenges")}
                className={cn(
                  "px-6 py-2 rounded-lg text-sm font-medium transition-all",
                  view === "challenges" 
                    ? "bg-background text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Retos
              </button>
              <button
                onClick={() => setView("projects")}
                className={cn(
                  "px-6 py-2 rounded-lg text-sm font-medium transition-all",
                  view === "projects" 
                    ? "bg-background text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Proyectos
              </button>
            </div>

            {/* Create Button */}
            {user?.role === "client" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Crear Nuevo</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuLabel>Opciones de Cliente</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/create/challenge" className="cursor-pointer">Nuevo Reto</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/create/project" className="cursor-pointer">Nuevo Proyecto</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Search & Niches */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nombre, etiqueta o empresa..." 
              className="pl-10 h-12 rounded-xl bg-card/50 border-transparent hover:border-primary/20 focus:border-primary transition-all"
            />
          </div>
          
          {/* Niche Selection */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 rounded-xl gap-2 px-6 border-transparent bg-card/50 hover:bg-card hover:border-primary/20">
                <Hash className="w-4 h-4 text-primary" />
                {selectedNiche || "Filtrar por Nicho"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto rounded-xl">
              <DropdownMenuItem onClick={() => setSelectedNiche(null)} className="cursor-pointer font-medium">
                Todos los nichos
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {NICHES.map((niche) => (
                <DropdownMenuItem 
                  key={niche} 
                  onClick={() => setSelectedNiche(niche)}
                  className={cn("cursor-pointer", selectedNiche === niche && "text-primary font-medium bg-primary/5")}
                >
                  #{niche}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {data.map((item) => (
          <ListingCard key={item.id} data={item} />
        ))}
      </div>
    </div>
  )
}
