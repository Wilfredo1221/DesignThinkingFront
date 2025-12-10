"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/file-upload"
import { ArrowLeft, Briefcase, Plus, X } from 'lucide-react'
import Link from "next/link"
import { Card } from "@/components/ui/card"

export default function CreateProjectPage() {
  const [tasks, setTasks] = useState<string[]>([])
  const [newTask, setNewTask] = useState("")

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, newTask])
      setNewTask("")
    }
  }

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index))
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
          <h1 className="text-3xl font-bold">Nuevo Proyecto</h1>
          <p className="text-muted-foreground">Inicia un proyecto colaborativo de alto impacto</p>
        </div>
      </div>

      <Card className="border-none rounded-3xl p-8 shadow-lg shadow-primary/5 space-y-8 bg-card/50 backdrop-blur-sm">
        {/* Basic Info */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Información General</h3>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">Nombre del Proyecto</Label>
            <Input 
              id="name" 
              placeholder="Ej: App de Salud Mental con IA" 
              className="h-14 rounded-xl text-base border-2 focus:border-primary transition-colors" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base">Descripción del Proyecto</Label>
            <Textarea 
              id="description" 
              placeholder="Describe detalladamente el proyecto, sus objetivos, alcance y expectativas..." 
              className="min-h-[180px] rounded-xl text-base border-2 focus:border-primary transition-colors resize-none p-4"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-base">Fecha de Inicio</Label>
              <Input 
                id="start-date" 
                type="date" 
                className="h-14 rounded-xl border-2 focus:border-primary transition-colors" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-base">Fecha de Cierre</Label>
              <Input 
                id="end-date" 
                type="date" 
                className="h-14 rounded-xl border-2 focus:border-primary transition-colors" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-base">Presupuesto</Label>
              <Input 
                id="budget" 
                placeholder="$ USD" 
                className="h-14 rounded-xl border-2 focus:border-primary transition-colors" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold">Listado de Tareas</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input 
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                placeholder="Escribe una tarea y presiona Enter..." 
                className="h-12 rounded-xl border-2 focus:border-primary transition-colors" 
              />
              <Button onClick={addTask} className="h-12 px-6 rounded-xl">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {tasks.length > 0 && (
              <div className="space-y-2 mt-4">
                {tasks.map((task, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-border/50"
                  >
                    <span className="text-sm">{task}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeTask(index)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <FileUpload label="Documentación del Proyecto" />

        <div className="pt-4">
          <Button className="w-full h-14 text-lg rounded-xl gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
            <Briefcase className="w-5 h-5" />
            Crear Proyecto
          </Button>
        </div>
      </Card>
    </div>
  )
}
