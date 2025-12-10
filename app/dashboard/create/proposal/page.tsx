"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/file-upload"
import { ArrowLeft, Sparkles } from 'lucide-react'
import Link from "next/link"

export default function CreateProposalPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nueva Propuesta</h1>
          <p className="text-muted-foreground">Comparte tu idea innovadora con el mundo</p>
        </div>
      </div>

      <div className="bg-card border rounded-3xl p-8 shadow-sm space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Título de la propuesta</Label>
          <Input id="title" placeholder="Ej: Sistema de Reciclaje Inteligente" className="h-12 rounded-xl" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción detallada</Label>
          <Textarea 
            id="description" 
            placeholder="Describe tu solución, cómo funciona y qué impacto tendrá..." 
            className="min-h-[200px] rounded-xl resize-none p-4"
          />
        </div>

        <FileUpload />

        <div className="pt-4">
          <Button className="w-full h-12 text-lg rounded-xl gap-2 shadow-lg shadow-primary/20">
            <Sparkles className="w-5 h-5" />
            Publicar Propuesta
          </Button>
        </div>
      </div>
    </div>
  )
}
