"use client"

import { useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Heart,
  Hash,
  Calendar,
  DollarSign,
  Users,
  User,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle2,
  Send,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-provider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data - Replace with real data fetching
const mockProjectData = {
  p1: {
    title: "App de Salud Mental con IA",
    description:
      "Desarrollo de un asistente virtual empático para acompañamiento psicológico primario. La aplicación utilizará procesamiento de lenguaje natural para detectar estados de ánimo y ofrecer ejercicios de mindfulness personalizados.",
    progress: 80,
    likes: 256,
    publisher: "HealthTech Solutions",
    startDate: "2025-02-01",
    endDate: "2025-06-30",
    budget: "$50,000 USD",
    hashtags: ["Salud", "IA", "Mobile"],
    status: "active",
    creator: {
      name: "María González",
      role: "Directora de TI",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    members: [
      { name: "Carlos Ruiz", role: "Full Stack Developer", avatar: "/placeholder.svg?height=80&width=80" },
      { name: "Ana Torres", role: "UI/UX Designer", avatar: "/placeholder.svg?height=80&width=80" },
      { name: "Luis Mendoza", role: "Backend Developer", avatar: "/placeholder.svg?height=80&width=80" },
      { name: "Sofia Vargas", role: "QA Engineer", avatar: "/placeholder.svg?height=80&width=80" },
    ],
    comments: [
      {
        id: 1,
        author: "Carlos Ruiz",
        avatar: "/placeholder.svg?height=60&width=60",
        date: "Hace 2 días",
        text: "El módulo de calificaciones ya está completado al 80%. Necesito feedback sobre la interfaz de ingreso de notas.",
        likes: 8,
      },
      {
        id: 2,
        author: "Ana Torres",
        avatar: "/placeholder.svg?height=60&width=60",
        date: "Hace 1 día",
        text: "He actualizado los wireframes del dashboard de estudiantes. ¿Podemos revisarlos en la próxima reunión?",
        likes: 5,
      },
    ],
  },
  p2: {
    title: "App de Delivery con IA",
    description:
      "Crear una aplicación móvil de delivery que utilice inteligencia artificial para optimizar rutas de entrega, predecir demanda y mejorar la experiencia del usuario con recomendaciones personalizadas.",
    progress: 72,
    likes: 203,
    publisher: "FoodTech Solutions",
    startDate: "1 Febrero 2025",
    endDate: "30 Abril 2025",
    budget: "$30,000 - $45,000",
    hashtags: ["Mobile", "IA", "React Native", "Machine Learning"],
    status: "active",
    creator: {
      name: "Roberto Sánchez",
      role: "CEO",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    members: [
      { name: "Diana López", role: "Mobile Developer", avatar: "/placeholder.svg?height=80&width=80" },
      { name: "Fernando Castro", role: "ML Engineer", avatar: "/placeholder.svg?height=80&width=80" },
      { name: "Patricia Rojas", role: "Product Manager", avatar: "/placeholder.svg?height=80&width=80" },
    ],
    comments: [
      {
        id: 1,
        author: "Diana López",
        avatar: "/placeholder.svg?height=60&width=60",
        date: "Hace 3 días",
        text: "La integración con el sistema de pagos está funcionando perfectamente. Probado en iOS y Android.",
        likes: 15,
      },
    ],
  },
  "1": {
    title: "E-commerce Sostenible",
    description:
      "Plataforma de comercio electrónico dedicada exclusivamente a productos sustentables y de bajo impacto ambiental. Buscamos desarrolladores comprometidos con el medio ambiente para crear una experiencia de compra única y ecológica.",
    progress: 65,
    likes: 89,
    publisher: "EcoStore Inc.",
    startDate: "2025-01-15",
    endDate: "2025-06-30",
    budget: "$5,000 - $8,000",
    hashtags: ["React", "Node.js", "GreenTech"],
    status: "active",
    creator: {
      name: "Elena Vega",
      role: "Fundadora",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    members: [
      { name: "Juan Pérez", role: "Frontend Dev", avatar: "/placeholder.svg?height=80&width=80" },
      { name: "Laura M.", role: "Sustainability Expert", avatar: "/placeholder.svg?height=80&width=80" },
    ],
    comments: [
      {
        id: 1,
        author: "Juan Pérez",
        avatar: "/placeholder.svg?height=60&width=60",
        date: "Hace 5 días",
        text: "La estructura de la base de datos para los productos eco-friendly está lista.",
        likes: 12,
      },
    ],
  },
  "3": {
    title: "App de Meditación AI",
    description:
      "Aplicación móvil que utiliza inteligencia artificial para generar sesiones de meditación personalizadas basadas en el estado de ánimo del usuario, detectado a través de voz y patrones de uso.",
    progress: 30,
    likes: 156,
    publisher: "Mindful Tech",
    startDate: "2025-02-01",
    endDate: "2025-08-15",
    budget: "$10,000+",
    hashtags: ["Flutter", "Python", "AI"],
    status: "active",
    creator: {
      name: "David Chen",
      role: "CTO",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    members: [
      { name: "Sarah Connor", role: "AI Specialist", avatar: "/placeholder.svg?height=80&width=80" },
      { name: "Mike Ross", role: "Mobile Dev", avatar: "/placeholder.svg?height=80&width=80" },
    ],
    comments: [],
  },
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = params.id as string
  const isFromMyProjects = searchParams.get("source") === "my-projects"
  const project = mockProjectData[projectId as keyof typeof mockProjectData]

  const [liked, setLiked] = useState(false)
  const [localLikes, setLocalLikes] = useState(project?.likes || 0)
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState(project?.comments || [])
  const { user } = useAuth()
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [selectedRole, setSelectedRole] = useState("")
  const [joinSuccess, setJoinSuccess] = useState(false)

  const handleLike = () => {
    if (!liked) {
      setLocalLikes(localLikes + 1)
      setLiked(true)
    } else {
      setLocalLikes(localLikes - 1)
      setLiked(false)
    }
  }

  const handlePublishComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        author: "Ronny Rau",
        avatar: "/placeholder.svg?height=60&width=60",
        date: "Ahora",
        text: newComment,
        likes: 0,
      }
      setComments([...comments, comment])
      setNewComment("")
    }
  }

  const handleJoinProject = () => {
    if (selectedRole) {
      setJoinSuccess(true)
      setTimeout(() => {
        setShowJoinForm(false)
        setJoinSuccess(false)
        setSelectedRole("")
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-primary/10">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 mb-3">
                      {project.status === "active" ? "Activo" : "Completado"}
                    </Badge>
                    <h1 className="text-4xl font-bold mb-3 text-balance">{project.title}</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Publicado por {project.publisher}
                    </p>
                  </div>
                  <Button
                    variant={liked ? "default" : "outline"}
                    size="lg"
                    onClick={handleLike}
                    className={liked ? "bg-red-500 hover:bg-red-600" : ""}
                  >
                    <Heart className={`w-5 h-5 mr-2 ${liked ? "fill-current" : ""}`} />
                    {localLikes}
                  </Button>
                </div>

                {/* Progress */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Progreso del Proyecto
                    </span>
                    <span className="text-2xl font-bold text-primary">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-3" />
                </div>

                {/* Description */}
                <Separator className="my-6" />
                <div>
                  <h3 className="text-lg font-semibold mb-3">Descripción</h3>
                  <p className="text-muted-foreground leading-relaxed">{project.description}</p>
                </div>

                {/* Hashtags */}
                <div className="flex flex-wrap gap-2 mt-6">
                  {project.hashtags.map((tag) => (
                    <Badge key={tag} variant="outline" className="bg-primary/5">
                      <Hash className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Project Details Card */}
            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Detalles del Proyecto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5">
                    <Calendar className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha de Inicio</p>
                      <p className="font-semibold">{project.startDate}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5">
                    <Clock className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha de Entrega</p>
                      <p className="font-semibold">{project.endDate}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5">
                    <DollarSign className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Presupuesto</p>
                      <p className="font-semibold">{project.budget}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5">
                    <Users className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Miembros del Equipo</p>
                      <p className="font-semibold">{project.members.length} miembros</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Comentarios ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* New Comment Form */}
                <div className="space-y-3">
                  <Textarea
                    placeholder="Escribe un comentario..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="resize-none min-h-[100px]"
                  />
                  <Button onClick={handlePublishComment} disabled={!newComment.trim()}>
                    <Send className="w-4 h-4 mr-2" />
                    Publicar Comentario
                  </Button>
                </div>

                <Separator />

                {/* Comments List */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4 p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <Avatar>
                        <AvatarImage src={comment.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{comment.author[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold">{comment.author}</p>
                            <p className="text-xs text-muted-foreground">{comment.date}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500">
                            <Heart className="w-4 h-4 mr-1" />
                            {comment.likes}
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{comment.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator Card */}
            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Creado por</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={project.creator.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{project.creator.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">{project.creator.name}</p>
                    <p className="text-sm text-muted-foreground">{project.creator.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Members Card */}
            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Miembros y Roles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.members.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <Avatar>
                        <AvatarImage src={member.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Participar button for participants only */}
                {user?.role === "participante" && !isFromMyProjects && (
                  <div className="mt-6">
                    <AnimatePresence>
                      {!showJoinForm ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <Button onClick={() => setShowJoinForm(true)} className="w-full" size="lg">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Participar
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4 p-4 rounded-lg bg-primary/5 border border-primary/20"
                        >
                          {!joinSuccess ? (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="role">Selecciona tu rol</Label>
                                <Select value={selectedRole} onValueChange={setSelectedRole}>
                                  <SelectTrigger id="role">
                                    <SelectValue placeholder="Elegir rol..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="frontend">Frontend Developer</SelectItem>
                                    <SelectItem value="backend">Backend Developer</SelectItem>
                                    <SelectItem value="fullstack">Full Stack Developer</SelectItem>
                                    <SelectItem value="designer">UI/UX Designer</SelectItem>
                                    <SelectItem value="qa">QA Engineer</SelectItem>
                                    <SelectItem value="pm">Product Manager</SelectItem>
                                    <SelectItem value="devops">DevOps Engineer</SelectItem>
                                    <SelectItem value="data">Data Scientist</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={handleJoinProject} disabled={!selectedRole} className="flex-1">
                                  <UserPlus className="w-4 h-4 mr-2" />
                                  Unirme
                                </Button>
                                <Button variant="outline" onClick={() => setShowJoinForm(false)} className="flex-1">
                                  Cancelar
                                </Button>
                              </div>
                            </>
                          ) : (
                            <motion.div
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              className="flex items-center justify-center gap-2 text-green-600 py-4"
                            >
                              <CheckCircle2 className="w-6 h-6" />
                              <span className="font-semibold">¡Te has unido al proyecto!</span>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Niches Card */}
            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  Nichos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.hashtags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-primary/10">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
