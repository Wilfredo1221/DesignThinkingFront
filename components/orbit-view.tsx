"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, MessageCircle, Heart, X, Send, User, Reply, ThumbsUp, Info } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { FileUpload } from "@/components/file-upload"
import { cn } from "@/lib/utils"

// Mock Data
const PROPOSALS = [
  { id: 1, title: "Diseño Minimalista", author: "Ana G.", color: "bg-blue-200", x: -200, y: -120 },
  { id: 2, title: "Enfoque AI", author: "Carlos R.", color: "bg-purple-200", x: 200, y: -100 },
  { id: 3, title: "Gamificación", author: "Luisa M.", color: "bg-green-200", x: -180, y: 140 },
  { id: 4, title: "Blockchain Auth", author: "Pedro S.", color: "bg-orange-200", x: 180, y: 130 },
  { id: 5, title: "Mobile First", author: "Sofia L.", color: "bg-pink-200", x: 0, y: -200 },
  { id: 6, title: "Voice UI", author: "Marco T.", color: "bg-yellow-200", x: -100, y: 200 },
]

export function OrbitView({ id }: { id: string }) {
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null)
  const [showChallengeInfo, setShowChallengeInfo] = useState(false)
  const [showNewProposalForm, setShowNewProposalForm] = useState(false)

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Central Hub (The "Oval") */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative group cursor-pointer"
          onClick={() => setShowChallengeInfo(true)}
        >
          {/* Glowing Effect */}
          <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-xl group-hover:bg-primary/30 transition-all duration-500" />
          
          {/* The Oval Shape */}
          <div className="w-64 h-40 bg-card/80 backdrop-blur-xl border-2 border-primary/20 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-6 text-center relative z-10 transition-transform duration-300 group-hover:scale-105">
            <h2 className="text-xl font-bold text-primary mb-1">Reto #{id}</h2>
            <p className="text-sm text-muted-foreground">Rediseño Bancario</p>
            <div className="mt-3 flex gap-2 justify-center">
              <Badge variant="secondary" className="bg-primary/10 text-primary">Activo</Badge>
              <Badge variant="outline">124 Likes</Badge>
            </div>
            <Info className="w-4 h-4 text-muted-foreground absolute top-4 right-6 opacity-50" />
          </div>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowNewProposalForm(true)}
          className="absolute -bottom-16 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg shadow-primary/30 flex items-center gap-2 font-medium z-20"
        >
          <Plus className="w-5 h-5" />
          Nueva Propuesta
        </motion.button>
      </div>

      {PROPOSALS.map((proposal, index) => (
        <FloatingBubble
          key={proposal.id}
          proposal={proposal}
          index={index}
          onClick={() => setSelectedProposal(proposal.id)}
        />
      ))}

      <AnimatePresence>
        {showNewProposalForm && (
          <NewProposalForm onClose={() => setShowNewProposalForm(false)} />
        )}
      </AnimatePresence>

      {/* Proposal Detail Modal (Floating Tab) */}
      <AnimatePresence>
        {selectedProposal && (
          <ProposalModal 
            proposal={PROPOSALS.find(p => p.id === selectedProposal)!} 
            onClose={() => setSelectedProposal(null)} 
          />
        )}
      </AnimatePresence>

      {/* Challenge Info Side Panel */}
      <AnimatePresence>
        {showChallengeInfo && (
          <ChallengeInfoModal 
            id={id} 
            onClose={() => setShowChallengeInfo(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function FloatingBubble({ proposal, index, onClick }: { proposal: any, index: number, onClick: () => void }) {
  return (
    <motion.div
      className="absolute cursor-pointer z-10"
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={{ 
        x: proposal.x, 
        y: proposal.y, 
        opacity: 1,
        translateY: [0, -10, 0]
      }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        translateY: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.5
        }
      }}
      onClick={onClick}
      whileHover={{ scale: 1.1, zIndex: 20 }}
    >
      <div className={cn(
        "w-24 h-24 rounded-full flex flex-col items-center justify-center p-2 text-center shadow-lg border-2 border-white/50 backdrop-blur-sm transition-colors",
        proposal.color
      )}>
        <span className="text-xs font-bold text-slate-700 line-clamp-2">{proposal.title}</span>
        <span className="text-[10px] text-slate-500 mt-1">{proposal.author}</span>
      </div>
    </motion.div>
  )
}

function NewProposalForm({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      className="absolute right-4 top-4 bottom-4 w-[500px] bg-card/95 backdrop-blur-xl border rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b flex justify-between items-center bg-primary/5 shrink-0">
        <div>
          <h3 className="text-xl font-bold">Nueva Propuesta</h3>
          <p className="text-sm text-muted-foreground">Comparte tu solución innovadora</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-destructive/10 hover:text-destructive rounded-full">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Form Content */}
      <ScrollArea className="flex-1 h-full">
        <div className="p-6 space-y-6 pb-32">
          <div className="space-y-2">
            <Label htmlFor="proposal-title" className="text-base">Título</Label>
            <Input 
              id="proposal-title" 
              placeholder="Ej: Diseño Minimalista" 
              className="h-12 rounded-xl border-2 focus:border-primary transition-colors" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposal-description" className="text-base">Descripción</Label>
            <Textarea 
              id="proposal-description" 
              placeholder="Describe tu propuesta en detalle, incluyendo beneficios, implementación y resultados esperados..." 
              className="min-h-[300px] rounded-xl border-2 focus:border-primary transition-colors resize-none p-4 text-base leading-relaxed"
            />
          </div>

          <FileUpload label="Archivos Adjuntos" />
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-6 border-t bg-background/95 backdrop-blur-md z-20 absolute bottom-0 left-0 right-0">
        <Button className="w-full h-14 text-lg font-semibold rounded-xl gap-2 shadow-lg shadow-primary/20">
          <Send className="w-5 h-5" />
          Publicar Propuesta
        </Button>
      </div>
    </motion.div>
  )
}

function ProposalModal({ proposal, onClose }: { proposal: any, onClose: () => void }) {
  const [comments, setComments] = useState([
    { id: 1, author: "Juan Director", avatar: "JD", text: "¡Me encanta el enfoque minimalista! ¿Podrías expandir sobre la seguridad?", likes: 3, isLiked: false },
    { id: 2, author: "Ana G.", avatar: "AG", text: "Claro, la idea es usar biometría pasiva.", likes: 5, isLiked: false, isAuthor: true },
    { id: 3, author: "Maria L.", avatar: "ML", text: "Excelente propuesta, muy alineada con los objetivos.", likes: 2, isLiked: false },
    { id: 4, author: "Pedro S.", avatar: "PS", text: "Me gusta la paleta de colores.", likes: 1, isLiked: false },
    { id: 5, author: "Sofia L.", avatar: "SL", text: "¿Han considerado la accesibilidad?", likes: 4, isLiked: false },
  ])
  const [newComment, setNewComment] = useState("")

  const toggleLike = (commentId: number) => {
    setComments(comments.map(c => 
      c.id === commentId 
        ? { ...c, likes: c.isLiked ? c.likes - 1 : c.likes + 1, isLiked: !c.isLiked }
        : c
    ))
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return
    setComments([...comments, {
      id: Date.now(),
      author: "Tú",
      avatar: "YO",
      text: newComment,
      likes: 0,
      isLiked: false,
      isAuthor: false
    }])
    setNewComment("")
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      className="absolute right-4 top-4 bottom-4 w-[450px] bg-card/95 backdrop-blur-xl border rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b flex justify-between items-start bg-secondary/30">
        <div>
          <h3 className="text-xl font-bold">{proposal.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            {proposal.author}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-destructive/10 hover:text-destructive rounded-full">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6 pb-4">
            <div className="prose prose-sm text-muted-foreground">
              <p>Esta propuesta se centra en simplificar la interfaz de usuario eliminando pasos innecesarios en las transacciones más comunes.</p>
              <p>Se propone un rediseño completo del dashboard principal, priorizando las acciones más frecuentes y utilizando un lenguaje visual más limpio y moderno.</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="gap-2 flex-1">
                <Heart className="w-4 h-4" /> 24 Likes
              </Button>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Comentarios ({comments.length})
              </h4>
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="space-y-2">
                    <div className={cn("flex gap-3", comment.isAuthor && "flex-row-reverse")}>
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback>{comment.avatar}</AvatarFallback>
                      </Avatar>
                      <div className={cn("flex-1 space-y-1", comment.isAuthor && "flex flex-col items-end")}>
                        <div className={cn(
                          "bg-secondary/50 p-3 rounded-2xl text-sm max-w-[90%]",
                          comment.isAuthor ? "bg-primary/10 rounded-tr-none" : "rounded-tl-none"
                        )}>
                          <p className={cn("font-medium text-xs mb-1", comment.isAuthor && "text-right")}>{comment.author}</p>
                          <p>{comment.text}</p>
                        </div>
                        <div className="flex gap-3 text-xs text-muted-foreground px-2">
                          <button 
                            onClick={() => toggleLike(comment.id)}
                            className={cn("flex items-center gap-1 hover:text-primary transition-colors group", comment.isLiked && "text-primary font-medium")}
                          >
                            <motion.div
                              whileTap={{ scale: 1.5 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              <ThumbsUp className={cn("w-3 h-3", comment.isLiked && "fill-current")} />
                            </motion.div>
                            {comment.likes}
                          </button>
                          <button className="flex items-center gap-1 hover:text-primary transition-colors">
                            <Reply className="w-3 h-3" />
                            Responder
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
        <div className="flex gap-2">
          <Input 
            placeholder="Escribe un comentario..." 
            className="rounded-full bg-secondary/50 border-transparent" 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
          />
          <Button size="icon" className="rounded-full shrink-0" onClick={handleAddComment}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function ChallengeInfoModal({ id, onClose }: { id: string, onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      className="absolute right-4 top-4 bottom-4 w-[400px] bg-card/95 backdrop-blur-xl border rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
    >
      <div className="p-6 border-b flex justify-between items-center bg-primary/5 shrink-0">
        <div>
          <h3 className="text-xl font-bold">Información del Reto</h3>
          <p className="text-sm text-muted-foreground">Detalles completos</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-destructive/10 hover:text-destructive rounded-full">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 h-full">
        <div className="p-6 space-y-6 pb-10">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Título</h4>
            <p className="text-lg font-medium">Rediseño de Experiencia Bancaria #{id}</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Descripción</h4>
            <p className="text-muted-foreground leading-relaxed">
              Buscamos transformar la experiencia de usuario en sucursales físicas mediante la integración de tecnologías digitales que agilicen los trámites y reduzcan los tiempos de espera.
              
              El objetivo es crear un sistema híbrido que permita a los usuarios iniciar trámites desde su móvil y finalizarlos en sucursal sin filas, o viceversa. Se valorará la integración con sistemas biométricos y la accesibilidad para personas mayores.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-muted-foreground">Publicado por</h4>
              <p>Banco Futuro</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-muted-foreground">Fecha límite</h4>
              <p>15 Abr 2025</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-muted-foreground">Presupuesto</h4>
              <p>$15,000 USD</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-muted-foreground">Estado</h4>
              <Badge variant="secondary" className="bg-green-100 text-green-700">Activo</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Requisitos Técnicos</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Diseño responsive (Mobile First)</li>
              <li>Cumplimiento WCAG 2.1 AA</li>
              <li>Prototipo interactivo en Figma</li>
              <li>Documentación de flujos de usuario</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Etiquetas</h4>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">#Fintech</Badge>
              <Badge variant="outline">#UX/UI</Badge>
              <Badge variant="outline">#Innovation</Badge>
              <Badge variant="outline">#Banking</Badge>
            </div>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  )
}
