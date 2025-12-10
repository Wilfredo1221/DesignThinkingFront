"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/file-upload"
import { ArrowLeft, Rocket, Hash } from 'lucide-react'
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const NICHES = ["Tecnología", "Salud", "Finanzas", "Educación", "Arte", "Sostenibilidad", "Deportes", "Turismo", "Gastronomía", "Moda"]

export default function CreateChallengePage() {
  const [selectedNiches, setSelectedNiches] = useState<string[]>([])

  const toggleNiche = (niche: string) => {
    if (selectedNiches.includes(niche)) {
      setSelectedNiches(selectedNiches.filter(n => n !== niche))
    } else {
      setSelectedNiches([...selectedNiches, niche])
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Publicar Nuevo Reto</h1>
          <p className="text-muted-foreground">Desafía a la comunidad a encontrar soluciones innovadoras</p>
        </div>
      </div>

      <Card className="border-none rounded-3xl p-8 shadow-lg shadow-primary/5 space-y-8 bg-card/50 backdrop-blur-sm">
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Rocket className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Información General</h3>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">Nombre del Reto</Label>
            <Input 
              id="name" 
              placeholder="Ej: Rediseño de Experiencia Bancaria" 
              className="h-14 rounded-xl text-base border-2 focus:border-primary transition-colors" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specs" className="text-base">Especificaciones y Requisitos</Label>
            <Textarea 
              id="specs" 
              placeholder="Detalla qué esperas de las soluciones, criterios de evaluación, restricciones técnicas..." 
              className="min-h-[180px] rounded-xl text-base border-2 focus:border-primary transition-colors resize-none p-4"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Hash className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold">Categorización</h3>
          </div>
          
          <div className="space-y-3">
            <Label className="text-base">Nichos del Reto</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="h-14 rounded-xl gap-2 px-6 border-2 hover:border-primary transition-colors w-full md:w-auto"
                >
                  <Hash className="w-5 h-5 text-primary" />
                  Seleccionar Nichos
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-y-auto rounded-xl">
                {NICHES.map((niche) => (
                  <DropdownMenuItem 
                    key={niche} 
                    onClick={() => toggleNiche(niche)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>#{niche}</span>
                      {selectedNiches.includes(niche) && (
                        <Badge variant="default" className="ml-2">✓</Badge>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {selectedNiches.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedNiches.map(niche => (
                  <Badge
                    key={niche}
                    variant="default"
                    className="cursor-pointer px-3 py-1.5 text-sm"
                    onClick={() => toggleNiche(niche)}
                  >
                    #{niche} ✕
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </div>
            <h3 className="text-xl font-semibold">Fechas y Archivos</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-base">Fecha de Publicación</Label>
              <Input 
                id="start-date" 
                type="date" 
                className="h-14 rounded-xl border-2 focus:border-primary transition-colors" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-base">Fecha Límite</Label>
              <Input 
                id="end-date" 
                type="date" 
                className="h-14 rounded-xl border-2 focus:border-primary transition-colors" 
              />
            </div>
          </div>

          <FileUpload label="Material Adjunto (Guías, Logos, etc.)" />
        </div>

        <div className="pt-4">
          <Button className="w-full h-14 text-lg rounded-xl gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
            <Rocket className="w-5 h-5" />
            Lanzar Reto
          </Button>
        </div>
      </Card>
    </div>
  )
}
