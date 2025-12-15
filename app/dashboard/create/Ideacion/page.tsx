"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Lightbulb, Hash, Loader2 } from 'lucide-react'
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ideacionApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

const CATEGORIAS = [
  "Tecnología",
  "Salud",
  "Finanzas",
  "Educación",
  "Arte",
  "Sostenibilidad",
  "Deportes",
  "Turismo",
  "Gastronomía",
  "Moda"
]

const AREAS_IMPACTO = [
  "Estudiantes",
  "Docentes",
  "Infraestructura",
  "Procesos",
  "Comunicación",
  "Seguridad",
  "Medio Ambiente",
  "Economía",
  "Sociedad"
]

export default function CreateIdeacionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isCliente, isLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    categoria: "",
    contexto_adicional: "",
    fecha_cierre: "",
  })
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])

  // ✅ Verificar autenticación
  useEffect(() => {
    if (isLoading) return
    
    if (!user) {
      router.push('/login')
      return
    }
    
    if (!isCliente()) {
      toast({
        title: "Acceso denegado",
        description: "Solo los clientes pueden crear ideaciones",
        variant: "destructive",
      })
      router.push('/dashboard')
    }
  }, [isLoading, user, isCliente, router])

  const toggleArea = (area: string) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter(a => a !== area))
    } else {
      setSelectedAreas([...selectedAreas, area])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.categoria) {
      toast({
        title: "Error",
        description: "Debes seleccionar una categoría",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await ideacionApi.create({
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        contexto_adicional: formData.contexto_adicional || undefined,
        areas_impacto: selectedAreas.length > 0 ? selectedAreas : undefined,
        fecha_cierre: formData.fecha_cierre || undefined,
      })

      toast({
        title: "¡Ideación creada!",
        description: "Tu ideación ha sido publicada exitosamente.",
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al crear ideación",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ✅ Mostrar loading mientras verifica auth
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  // ✅ No mostrar nada si no hay usuario (ya redirigió)
  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Publicar Nueva Ideación</h1>
          <p className="text-muted-foreground">Desafía a la comunidad a encontrar soluciones innovadoras</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-none rounded-3xl p-8 shadow-lg shadow-primary/5 space-y-8 bg-card/50 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Información General</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="titulo" className="text-base">Título de la Ideación</Label>
              <Input 
                id="titulo" 
                placeholder="Ej: Mejorar la experiencia del estudiante" 
                className="h-14 rounded-xl text-base border-2 focus:border-primary transition-colors"
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion" className="text-base">Descripción del Problema</Label>
              <Textarea 
                id="descripcion" 
                placeholder="Describe el problema o desafío que quieres resolver. ¿Cuál es el contexto? ¿Por qué es importante?" 
                className="min-h-[180px] rounded-xl text-base border-2 focus:border-primary transition-colors resize-none p-4"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base">Categoría <span className="text-destructive">*</span></Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="h-14 rounded-xl gap-2 px-6 border-2 hover:border-primary transition-colors w-full justify-between"
                    type="button"
                  >
                    <span>{formData.categoria || "Seleccionar categoría"}</span>
                    <Hash className="w-5 h-5 text-primary" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 rounded-xl">
                  {CATEGORIAS.map((cat) => (
                    <DropdownMenuItem 
                      key={cat} 
                      onClick={() => setFormData({...formData, categoria: cat})}
                      className="cursor-pointer"
                    >
                      {cat}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contexto_adicional" className="text-base">Contexto Adicional (Opcional)</Label>
              <Textarea 
                id="contexto_adicional" 
                placeholder="Información adicional que pueda ayudar a los participantes..." 
                className="min-h-[120px] rounded-xl text-base border-2 focus:border-primary transition-colors resize-none p-4"
                value={formData.contexto_adicional}
                onChange={(e) => setFormData({...formData, contexto_adicional: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Hash className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold">Áreas de Impacto</h3>
            </div>
            
            <div className="space-y-3">
              <Label className="text-base">Selecciona las áreas que se verán afectadas (Opcional)</Label>
              <div className="flex flex-wrap gap-2">
                {AREAS_IMPACTO.map(area => (
                  <Badge
                    key={area}
                    variant={selectedAreas.includes(area) ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1.5 text-sm"
                    onClick={() => toggleArea(area)}
                  >
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </div>
              <h3 className="text-xl font-semibold">Fecha Límite</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fecha_cierre" className="text-base">Fecha de Cierre (Opcional)</Label>
              <Input 
                id="fecha_cierre" 
                type="date" 
                className="h-14 rounded-xl border-2 focus:border-primary transition-colors"
                value={formData.fecha_cierre}
                onChange={(e) => setFormData({...formData, fecha_cierre: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="pt-4">
            <Button 
              type="submit"
              className="w-full h-14 text-lg rounded-xl gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Lightbulb className="w-5 h-5" />
                  Publicar Ideación
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}