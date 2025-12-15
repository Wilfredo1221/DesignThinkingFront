import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, MessageCircle, Heart, X, Send, User, ThumbsUp, Info, Loader2 } from 'lucide-react'

// ============================================
// TIPOS
// ============================================
interface Idea {
  id: number
  titulo: string
  descripcion: string
  beneficios_esperados?: string
  consideraciones_implementacion?: string
  votos_count: number
  porcentaje_votos: number
  color_asignado: string
  participante: {
    nombre: string
    avatar?: string
  }
  comentarios?: Comentario[]
}

interface Comentario {
  id: number
  user: {
    nombre: string
    avatar?: string
  }
  contenido: string
  created_at: string
}

interface Ideacion {
  id: number
  titulo: string
  descripcion: string
  categoria?: string
  estado: string
  total_participaciones?: number
  fecha_cierre?: string
  ideacion?: {
    categoria: string
  }
}

// ============================================
// API SIMULADA (Reemplazar con tu API real)
// ============================================
const API_URL = 'http://localhost:8000/api'

const getToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

async function fetchIdeacion(id: string): Promise<{ ideacion: Ideacion; ideas: Idea[] }> {
  const token = getToken()
  
  // Intentar primero con filtro (para clientes)
  let response = await fetch(`${API_URL}/ideaciones/${id}/filtro`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    }
  })
  
  // Si falla (403/404), usar ruta normal
  if (!response.ok) {
    response = await fetch(`${API_URL}/ideaciones/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    })
  }
  
  if (!response.ok) throw new Error('Error al cargar ideación')
  const data = await response.json()
  
  // Normalizar estructura de respuesta
  return {
    ideacion: data.publicacion || data.ideacion || data,
    ideas: data.ideas || data.ideacion?.ideas || []
  }
}

async function votarIdea(ideaId: number): Promise<void> {
  const token = getToken()
  await fetch(`${API_URL}/ideas/${ideaId}/votar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    }
  })
}

async function comentarIdea(ideaId: number, contenido: string): Promise<void> {
  const token = getToken()
  await fetch(`${API_URL}/ideas/${ideaId}/comentar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ contenido })
  })
}

async function crearIdea(ideacionId: string, data: any): Promise<void> {
  const token = getToken()
  await fetch(`${API_URL}/ideas`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ ...data, ideacion_id: ideacionId })
  })
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function OrbitView({ id }: { id: string }) {
  const [ideacion, setIdeacion] = useState<Ideacion | null>(null)
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [showIdeacionInfo, setShowIdeacionInfo] = useState(false)
  const [showNewIdeaForm, setShowNewIdeaForm] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [id])

  const cargarDatos = async () => {
    try {
      const data = await fetchIdeacion(id)
      setIdeacion(data.ideacion)
      setIdeas(data.ideas)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando ideación...</p>
        </div>
      </div>
    )
  }

  if (!ideacion) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-muted-foreground">No se pudo cargar la ideación</p>
      </div>
    )
  }

  // Calcular posiciones en círculo para las ideas
  const ideasConPosiciones = ideas.map((idea, index) => {
    const angle = (index / ideas.length) * 2 * Math.PI
    const radius = 200
    return {
      ...idea,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    }
  })

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Central Hub - Ideación */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative group cursor-pointer"
          onClick={() => setShowIdeacionInfo(true)}
        >
          {/* Glowing Effect */}
          <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-xl group-hover:bg-primary/30 transition-all duration-500" />
          
          {/* The Oval Shape */}
          <div className="w-64 h-40 bg-card/80 backdrop-blur-xl border-2 border-primary/20 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-6 text-center relative z-10 transition-transform duration-300 group-hover:scale-105">
            <h2 className="text-xl font-bold text-primary mb-1">Ideación</h2>
            <p className="text-sm text-muted-foreground line-clamp-2">{ideacion.titulo}</p>
            <div className="mt-3 flex gap-2 justify-center">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600">
                {ideacion.estado === 'abierto' ? 'Activo' : 'Cerrado'}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-secondary">
                {ideacion.total_participaciones || ideas.length} Ideas
              </span>
            </div>
            <Info className="w-4 h-4 text-muted-foreground absolute top-4 right-6 opacity-50" />
          </div>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowNewIdeaForm(true)}
          className="absolute -bottom-16 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg shadow-primary/30 flex items-center gap-2 font-medium z-20"
        >
          <Plus className="w-5 h-5" />
          Nueva Idea
        </motion.button>
      </div>

      {/* Floating Ideas */}
      {ideasConPosiciones.map((idea, index) => (
        <FloatingBubble
          key={idea.id}
          idea={idea}
          index={index}
          onClick={() => setSelectedIdea(idea)}
        />
      ))}

      {/* Modales */}
      <AnimatePresence>
        {showNewIdeaForm && (
          <NewIdeaForm 
            ideacionId={id}
            onClose={() => setShowNewIdeaForm(false)} 
            onSuccess={cargarDatos}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedIdea && (
          <IdeaModal 
            idea={selectedIdea} 
            onClose={() => setSelectedIdea(null)}
            onUpdate={cargarDatos}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIdeacionInfo && ideacion && (
          <IdeacionInfoModal 
            ideacion={ideacion} 
            onClose={() => setShowIdeacionInfo(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// BURBUJA FLOTANTE (IDEA)
// ============================================
function FloatingBubble({ idea, index, onClick }: any) {
  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      verde: 'bg-green-200 border-green-300',
      amarillo: 'bg-yellow-200 border-yellow-300',
      rojo: 'bg-red-200 border-red-300',
    }
    return colors[color] || 'bg-blue-200 border-blue-300'
  }

  return (
    <motion.div
      className="absolute cursor-pointer z-10"
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={{ 
        x: idea.x, 
        y: idea.y, 
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
      <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center p-2 text-center shadow-lg border-2 border-white/50 backdrop-blur-sm transition-colors ${getColorClass(idea.color_asignado)}`}>
        <span className="text-xs font-bold text-slate-700 line-clamp-2">{idea.titulo}</span>
        <span className="text-[10px] text-slate-500 mt-1">{idea.participante?.nombre || 'Anónimo'}</span>
        <span className="text-[10px] text-slate-600 font-semibold mt-0.5">❤️ {idea.votos_count}</span>
      </div>
    </motion.div>
  )
}

// ============================================
// FORMULARIO NUEVA IDEA
// ============================================
function NewIdeaForm({ ideacionId, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    beneficios_esperados: '',
    consideraciones_implementacion: '',
  })

  const handleSubmit = async () => {
    if (!formData.titulo || !formData.descripcion) {
      alert('Por favor completa título y descripción')
      return
    }

    setLoading(true)
    try {
      await crearIdea(ideacionId, formData)
      alert('Idea publicada exitosamente')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al publicar idea')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      className="absolute right-4 top-4 bottom-4 w-[500px] bg-card/95 backdrop-blur-xl border rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
    >
      <div className="p-6 border-b flex justify-between items-center bg-primary/5 shrink-0">
        <div>
          <h3 className="text-xl font-bold">Nueva Idea</h3>
          <p className="text-sm text-muted-foreground">Comparte tu solución innovadora</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-destructive/10 rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Título *</label>
          <input 
            type="text"
            value={formData.titulo}
            onChange={(e) => setFormData({...formData, titulo: e.target.value})}
            placeholder="Ej: Sistema de gamificación"
            className="w-full mt-1 px-4 py-2 border rounded-xl"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Descripción *</label>
          <textarea 
            value={formData.descripcion}
            onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
            placeholder="Describe tu idea en detalle..."
            rows={6}
            className="w-full mt-1 px-4 py-2 border rounded-xl resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Beneficios Esperados</label>
          <textarea 
            value={formData.beneficios_esperados}
            onChange={(e) => setFormData({...formData, beneficios_esperados: e.target.value})}
            placeholder="¿Qué beneficios traería?"
            rows={3}
            className="w-full mt-1 px-4 py-2 border rounded-xl resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Consideraciones de Implementación</label>
          <textarea 
            value={formData.consideraciones_implementacion}
            onChange={(e) => setFormData({...formData, consideraciones_implementacion: e.target.value})}
            placeholder="¿Qué se necesita para implementarla?"
            rows={3}
            className="w-full mt-1 px-4 py-2 border rounded-xl resize-none"
          />
        </div>
      </div>

      <div className="p-6 border-t bg-background/95">
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Publicando...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Publicar Idea
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}

// ============================================
// MODAL DE IDEA
// ============================================
function IdeaModal({ idea, onClose, onUpdate }: any) {
  const [comentarios, setComentarios] = useState<Comentario[]>(idea.comentarios || [])
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [votando, setVotando] = useState(false)
  const [comentando, setComentando] = useState(false)

  const handleVotar = async () => {
    setVotando(true)
    try {
      await votarIdea(idea.id)
      await onUpdate()
    } catch (error) {
      console.error('Error al votar:', error)
    } finally {
      setVotando(false)
    }
  }

  const handleComentar = async () => {
    if (!nuevoComentario.trim()) return

    setComentando(true)
    try {
      await comentarIdea(idea.id, nuevoComentario)
      setNuevoComentario('')
      await onUpdate()
    } catch (error) {
      console.error('Error al comentar:', error)
    } finally {
      setComentando(false)
    }
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
        <div className="flex-1">
          <h3 className="text-xl font-bold">{idea.titulo}</h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            {idea.participante?.nombre || 'Anónimo'}
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-destructive/10 rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="prose prose-sm">
          <p className="text-muted-foreground">{idea.descripcion}</p>
          
          {idea.beneficios_esperados && (
            <div className="mt-4">
              <h4 className="font-semibold text-sm">Beneficios Esperados</h4>
              <p className="text-muted-foreground text-sm">{idea.beneficios_esperados}</p>
            </div>
          )}

          {idea.consideraciones_implementacion && (
            <div className="mt-4">
              <h4 className="font-semibold text-sm">Consideraciones</h4>
              <p className="text-muted-foreground text-sm">{idea.consideraciones_implementacion}</p>
            </div>
          )}
        </div>

        <div>
          <button 
            onClick={handleVotar}
            disabled={votando}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-full transition-colors disabled:opacity-50"
          >
            <Heart className="w-4 h-4" />
            {idea.votos_count} Me gusta
          </button>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Comentarios ({comentarios.length})
          </h4>
          
          <div className="space-y-4">
            {comentarios.map((comentario) => (
              <div key={comentario.id} className="space-y-2">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                    {comentario.user?.nombre?.[0] || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="bg-secondary/50 p-3 rounded-2xl rounded-tl-none">
                      <p className="font-medium text-xs mb-1">{comentario.user?.nombre || 'Usuario'}</p>
                      <p className="text-sm">{comentario.contenido}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-background/50">
        <div className="flex gap-2">
          <input 
            type="text"
            placeholder="Escribe un comentario..." 
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleComentar()}
            className="flex-1 px-4 py-2 rounded-full bg-secondary/50 border-transparent"
          />
          <button 
            onClick={handleComentar}
            disabled={comentando}
            className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// MODAL INFO IDEACIÓN
// ============================================
function IdeacionInfoModal({ ideacion, onClose }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      className="absolute right-4 top-4 bottom-4 w-[400px] bg-card/95 backdrop-blur-xl border rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
    >
      <div className="p-6 border-b flex justify-between items-center bg-primary/5">
        <div>
          <h3 className="text-xl font-bold">Información de la Ideación</h3>
          <p className="text-sm text-muted-foreground">Detalles completos</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-destructive/10 rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-2">Título</h4>
          <p className="text-lg font-medium">{ideacion.titulo}</p>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-2">Descripción</h4>
          <p className="text-muted-foreground leading-relaxed">{ideacion.descripcion}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-1">Categoría</h4>
            <p>{ideacion.categoria || ideacion.ideacion?.categoria || 'Sin categoría'}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-1">Estado</h4>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
              ideacion.estado === 'abierto' ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-600'
            }`}>
              {ideacion.estado === 'abierto' ? 'Activo' : 'Cerrado'}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-1">Ideas Recibidas</h4>
            <p className="font-bold text-lg">{ideacion.total_participaciones || 0}</p>
          </div>
          {ideacion.fecha_cierre && (
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Fecha Cierre</h4>
              <p>{new Date(ideacion.fecha_cierre).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}