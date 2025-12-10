// lib/api.ts
// Servicio API central para comunicación con Laravel Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Tipos de respuesta
interface ApiResponse<T> {
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

// Configuración de Sanctum para cookies CSRF
const sanctumConfig = {
  credentials: 'include' as RequestCredentials,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
}

// Helper: Obtener token de localStorage
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

// Helper: Guardar token
export const saveToken = (token: string) => {
  localStorage.setItem('auth_token', token)
}

// Helper: Eliminar token
export const removeToken = () => {
  localStorage.removeItem('auth_token')
}

// Fetch wrapper con manejo de errores y token
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  
  const config: RequestInit = {
    ...sanctumConfig,
    ...options,
    headers: {
      ...sanctumConfig.headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    
    // Si es 401, el token expiró
    if (response.status === 401) {
      removeToken()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición')
    }

    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// ============================================
// AUTENTICACIÓN
// ============================================

export interface RegisterData {
  nombre: string
  email: string
  password: string
  password_confirmation: string
  telefono?: string
  tipo_usuario: 'cliente' | 'participante' | 'ambos'
  // Cliente
  empresa?: string
  cargo?: string
  industria?: string
  // Participante
  profesion?: string
  biografia?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface User {
  id: number
  nombre: string
  email: string
  telefono?: string
  avatar?: string
  email_verified_at?: string
  roles: Array<{ nombre: string }>
  perfilCliente?: any
  perfilParticipante?: any
}

export interface AuthResponse {
  message: string
  user: User
  access_token: string
  token_type: string
}

export const authApi = {
  register: (data: RegisterData) =>
    apiFetch<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: LoginData) =>
    apiFetch<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiFetch('/logout', { method: 'POST' }),

  me: () =>
    apiFetch<{ user: User }>('/me'),

  updateProfile: (data: Partial<User>) =>
    apiFetch('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (data: { current_password: string; new_password: string; new_password_confirmation: string }) =>
    apiFetch('/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// ============================================
// IDEACIONES
// ============================================

export interface Ideacion {
  id: number
  publicacion_id: number
  categoria: string
  contexto_adicional?: string
  areas_impacto?: string[]
  publicacion: {
    id: number
    cliente_id: number
    titulo: string
    descripcion: string
    tipo: 'ideacion'
    estado: 'abierto' | 'cerrado' | 'archivado'
    total_participaciones: number
    fecha_cierre?: string
    cliente: {
      nombre: string
      email: string
    }
  }
  ideas?: Idea[]
}

export interface Idea {
  id: number
  ideacion_id: number
  participante_id: number
  titulo: string
  descripcion: string
  beneficios_esperados?: string
  consideraciones_implementacion?: string
  votos_count: number
  porcentaje_votos: number
  color_asignado: 'verde' | 'amarillo' | 'rojo' | 'sin_asignar'
  estado: 'activa' | 'seleccionada_proyecto' | 'archivada'
  participante: {
    nombre: string
    email: string
  }
  comentarios?: Comentario[]
}

export interface Comentario {
  id: number
  user_id: number
  contenido: string
  created_at: string
  user: {
    nombre: string
    avatar?: string
  }
}

export const ideacionApi = {
  list: () =>
    apiFetch<{ data: Ideacion[] }>('/ideaciones'),

  create: (data: {
    titulo: string
    descripcion: string
    categoria: string
    contexto_adicional?: string
    areas_impacto?: string[]
    fecha_cierre?: string
  }) =>
    apiFetch('/ideaciones', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get: (id: number) =>
    apiFetch<{ publicacion: Ideacion; estadisticas: any }>(`/ideaciones/${id}`),

  update: (id: number, data: any) =>
    apiFetch(`/ideaciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch(`/ideaciones/${id}`, { method: 'DELETE' }),

  cerrar: (id: number) =>
    apiFetch(`/ideaciones/${id}/cerrar`, { method: 'POST' }),

  verConFiltro: (id: number) =>
    apiFetch<{ publicacion: Ideacion; ideas: Idea[]; estadisticas: any }>(`/ideaciones/${id}/filtro`),

  seleccionarIdeas: (id: number, ideasIds: number[]) =>
    apiFetch(`/ideaciones/${id}/seleccionar`, {
      method: 'POST',
      body: JSON.stringify({ ideas_ids: ideasIds }),
    }),
}

// ============================================
// IDEAS
// ============================================

export const ideaApi = {
  list: (ideacionId: number) =>
    apiFetch<{ data: Idea[] }>(`/ideaciones/${ideacionId}/ideas`),

  create: (data: {
    ideacion_id: number
    titulo: string
    descripcion: string
    beneficios_esperados?: string
    consideraciones_implementacion?: string
  }) =>
    apiFetch('/ideas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get: (id: number) =>
    apiFetch<Idea>(`/ideas/${id}`),

  update: (id: number, data: any) =>
    apiFetch(`/ideas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch(`/ideas/${id}`, { method: 'DELETE' }),

  votar: (id: number) =>
    apiFetch<{ message: string; votos_count: number; color_asignado: string }>(`/ideas/${id}/votar`, { method: 'POST' }),

  comentar: (id: number, contenido: string) =>
    apiFetch(`/ideas/${id}/comentar`, {
      method: 'POST',
      body: JSON.stringify({ contenido }),
    }),

  misIdeas: () =>
    apiFetch<{ data: Idea[] }>('/mis-ideas'),
}

// ============================================
// PROYECTOS
// ============================================

export interface Proyecto {
  id: number
  publicacion_id: number
  ideacion_origen_id?: number
  idea_origen_id?: number
  funcionalidad?: string
  usabilidad?: string
  tiempo_dias?: number
  alcance?: string
  presupuesto_min?: number
  presupuesto_max?: number
  escalabilidad?: string
  publicacion: {
    id: number
    cliente_id: number
    titulo: string
    descripcion: string
    tipo: 'proyecto'
    estado: 'abierto' | 'en_evaluacion' | 'cerrado' | 'archivado'
    criterios_publicos: boolean
    total_participaciones: number
    fecha_cierre?: string
    cliente: {
      nombre: string
      email: string
    }
  }
  propuestas?: Propuesta[]
}

export interface Propuesta {
  id: number
  proyecto_id: number
  participante_id: number
  titulo: string
  descripcion: string
  detalles_tecnicos?: string
  costo_estimado: number
  cronograma?: string
  tiempo_estimado_dias?: number
  likes_count: number
  porcentaje_likes: number
  color_asignado: 'verde' | 'azul' | 'amarillo' | 'naranja' | 'rojo' | 'sin_asignar'
  puntaje_manual?: number
  estado: 'pendiente' | 'evaluando' | 'aprobada' | 'rechazada' | 'guardada'
  participante: {
    nombre: string
    email: string
  }
  comentarios?: Comentario[]
}

export const proyectoApi = {
  list: () =>
    apiFetch<{ data: Proyecto[] }>('/proyectos'),

  create: (data: {
    titulo: string
    descripcion: string
    criterios_publicos?: boolean
    ideacion_origen_id?: number
    idea_origen_id?: number
    funcionalidad?: string
    usabilidad?: string
    tiempo_dias?: number
    alcance?: string
    presupuesto_min?: number
    presupuesto_max?: number
    escalabilidad?: string
    fecha_cierre?: string
  }) =>
    apiFetch('/proyectos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get: (id: number) =>
    apiFetch<Proyecto>(`/proyectos/${id}`),

  update: (id: number, data: any) =>
    apiFetch(`/proyectos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch(`/proyectos/${id}`, { method: 'DELETE' }),

  cerrar: (id: number) =>
    apiFetch(`/proyectos/${id}/cerrar`, { method: 'POST' }),
}

// ============================================
// PROPUESTAS
// ============================================

export const propuestaApi = {
  list: (proyectoId: number) =>
    apiFetch<{ data: Propuesta[] }>(`/proyectos/${proyectoId}/propuestas`),

  create: (data: {
    proyecto_id: number
    titulo: string
    descripcion: string
    detalles_tecnicos?: string
    costo_estimado: number
    cronograma?: string
    tiempo_estimado_dias?: number
  }) =>
    apiFetch('/propuestas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get: (id: number) =>
    apiFetch<Propuesta>(`/propuestas/${id}`),

  update: (id: number, data: any) =>
    apiFetch(`/propuestas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch(`/propuestas/${id}`, { method: 'DELETE' }),

  like: (id: number) =>
    apiFetch<{ message: string; likes_count: number; color_asignado: string }>(`/propuestas/${id}/like`, { method: 'POST' }),

  comentar: (id: number, contenido: string) =>
    apiFetch(`/propuestas/${id}/comentar`, {
      method: 'POST',
      body: JSON.stringify({ contenido }),
    }),

  misPropuestas: () =>
    apiFetch<{ data: Propuesta[] }>('/mis-propuestas'),
}

// ============================================
// FILTROS
// ============================================

export const filtroApi = {
  filtro1: (proyectoId: number) =>
    apiFetch<{ proyecto: Proyecto; propuestas: Propuesta[]; estadisticas: any }>(`/proyectos/${proyectoId}/filtro1`),

  filtro2Calificar: (data: {
    propuesta_id: number
    deseable: number
    factible: number
    costo: number
    beneficio: number
    notas?: string
  }) =>
    apiFetch('/filtro2/calificar', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  filtro2Ranking: (proyectoId: number) =>
    apiFetch(`/proyectos/${proyectoId}/filtro2/ranking`),

  filtro3Evaluar: (data: {
    propuesta_id: number
    es_estrategico: boolean
    es_tiempo_indicado?: boolean
    justificacion?: string
  }) =>
    apiFetch('/filtro3/evaluar', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  propuestasGuardadas: () =>
    apiFetch<{ propuestas: Propuesta[] }>('/propuestas-guardadas'),
}

// ============================================
// REUNIONES
// ============================================

export interface Reunion {
  id: number
  reunion_sobre_id: number
  reunion_sobre_type: string
  cliente_id: number
  participante_id: number
  fecha_hora: string
  agenda?: string
  notas?: string
  link_reunion?: string
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada'
  cliente: { nombre: string }
  participante: { nombre: string }
}

export const reunionApi = {
  list: () =>
    apiFetch<{ data: Reunion[] }>('/reuniones'),

  proximas: () =>
    apiFetch<Reunion[]>('/reuniones-proximas'),

  create: (data: {
    tipo: 'idea' | 'propuesta'
    registro_id: number
    participante_id: number
    fecha_hora: string
    agenda?: string
    link_reunion?: string
  }) =>
    apiFetch('/reuniones', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get: (id: number) =>
    apiFetch<Reunion>(`/reuniones/${id}`),

  update: (id: number, data: any) =>
    apiFetch(`/reuniones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  confirmar: (id: number) =>
    apiFetch(`/reuniones/${id}/confirmar`, { method: 'POST' }),

  cancelar: (id: number) =>
    apiFetch(`/reuniones/${id}/cancelar`, { method: 'POST' }),

  completar: (id: number, notas?: string) =>
    apiFetch(`/reuniones/${id}/completar`, {
      method: 'POST',
      body: JSON.stringify({ notas }),
    }),

  delete: (id: number) =>
    apiFetch(`/reuniones/${id}`, { method: 'DELETE' }),
}

// ============================================
// NOTIFICACIONES
// ============================================

export interface Notificacion {
  id: number
  user_id: number
  tipo: string
  titulo: string
  mensaje: string
  data?: any
  leida: boolean
  created_at: string
}

export const notificacionApi = {
  list: () =>
    apiFetch<{ data: Notificacion[] }>('/notificaciones'),

  noLeidas: () =>
    apiFetch<{ total: number; notificaciones: Notificacion[] }>('/notificaciones/no-leidas'),

  resumen: () =>
    apiFetch('/notificaciones/resumen'),

  marcarLeida: (id: number) =>
    apiFetch(`/notificaciones/${id}/leer`, { method: 'POST' }),

  marcarTodasLeidas: () =>
    apiFetch('/notificaciones/leer-todas', { method: 'POST' }),

  delete: (id: number) =>
    apiFetch(`/notificaciones/${id}`, { method: 'DELETE' }),

  limpiarLeidas: () =>
    apiFetch('/notificaciones/limpiar-leidas', { method: 'DELETE' }),
}

// ============================================
// FILE UPLOAD
// ============================================

export const uploadApi = {
  avatar: async (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)

    const token = getToken()
    const response = await fetch(`${API_BASE_URL}/upload/avatar`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    return response.json()
  },

  deleteAvatar: () =>
    apiFetch('/upload/avatar', { method: 'DELETE' }),

  document: async (file: File, type: 'propuesta' | 'idea', relatedId: number) => {
    const formData = new FormData()
    formData.append('document', file)
    formData.append('type', type)
    formData.append('related_id', relatedId.toString())

    const token = getToken()
    const response = await fetch(`${API_BASE_URL}/upload/document`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    return response.json()
  },
}