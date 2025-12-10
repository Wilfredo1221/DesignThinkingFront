"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Award, Send, Heart, X, Check } from 'lucide-react'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "Ronny Rau",
    bio: "Diseñador UX/UI apasionado por crear experiencias digitales innovadoras. Me especializo en diseño de interfaces y sistemas de diseño.",
    profession: "Diseñador UX/UI",
    location: "Colombia",
    institution: "Universidad Nacional"
  })

  const handleSave = () => {
    setIsEditing(false)
    // Here you would save to backend
  }

  return (
    <div className="space-y-8">
      {/* Header Profile Card */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 w-full bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl" />
        
        <div className="px-8 pb-8">
          <div className="relative -mt-16 flex flex-col md:flex-row items-end md:items-center gap-6">
            <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>RR</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2 mb-2">
              {/* <CHANGE> Updated name to Ronny Rau and added bio */}
              {!isEditing ? (
                <>
                  <h1 className="text-3xl font-bold">{formData.name}</h1>
                  <p className="text-muted-foreground max-w-2xl">{formData.bio}</p>
                  <div className="flex items-center gap-2 text-muted-foreground pt-1">
                    <span>{formData.profession}</span>
                    <span>•</span>
                    <span>{formData.location}</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Badge variant="secondary">Participante</Badge>
                    <Badge variant="outline">Nivel 5</Badge>
                  </div>
                </>
              ) : (
                <div className="space-y-3 w-full max-w-2xl">
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="text-2xl font-bold h-12"
                  />
                  <Textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="min-h-[80px]"
                    placeholder="Cuéntanos sobre ti..."
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input 
                      value={formData.profession}
                      onChange={(e) => setFormData({...formData, profession: e.target.value})}
                      placeholder="Profesión"
                    />
                    <Input 
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Ubicación"
                    />
                  </div>
                  <Input 
                    value={formData.institution}
                    onChange={(e) => setFormData({...formData, institution: e.target.value})}
                    placeholder="Institución"
                  />
                </div>
              )}
            </div>

            {/* <CHANGE> Added edit/save/cancel functionality */}
            <div className="mb-2 flex gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="gap-2 shadow-lg shadow-primary/20">
                  <Edit className="w-4 h-4" />
                  Editar Perfil
                </Button>
              ) : (
                <>
                  <Button onClick={handleSave} className="gap-2 shadow-lg shadow-primary/20">
                    <Check className="w-4 h-4" />
                    Guardar
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline" className="gap-2">
                    <X className="w-4 h-4" />
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex items-center gap-4 hover:shadow-lg transition-shadow border-none bg-card/50 backdrop-blur-sm">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Propuestas Enviadas</p>
            <p className="text-2xl font-bold">12</p>
          </div>
        </Card>

        <Card className="p-6 flex items-center gap-4 hover:shadow-lg transition-shadow border-none bg-card/50 backdrop-blur-sm">
          <div className="p-4 bg-pink-100 text-pink-600 rounded-2xl">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Likes Recibidos</p>
            <p className="text-2xl font-bold">348</p>
          </div>
        </Card>

        <Card className="p-6 flex items-center gap-4 hover:shadow-lg transition-shadow border-none bg-card/50 backdrop-blur-sm">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Retos Ganados</p>
            <p className="text-2xl font-bold">3</p>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Actividad Reciente</h2>
        <Card className="p-6 border-none bg-card/50 backdrop-blur-sm">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 items-start pb-6 border-b last:border-0 last:pb-0">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                <div>
                  <p className="font-medium">Publicaste una nueva propuesta en "Rediseño Bancario"</p>
                  <p className="text-sm text-muted-foreground mt-1">Hace 2 días</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
