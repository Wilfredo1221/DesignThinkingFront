// lib/api.ts - COMPLETO Y MEJORADO
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export const saveToken = (token: string) => {
  localStorage.setItem('auth_token', token)
}

export const removeToken = () => {
  localStorage.removeItem('auth_token')
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, config)
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
// TIPOS
// ============================================

export interface RegisterData {
  nombre: string
  email: string
  password: string
  password_confirmation: string
  telefono?: string
  tipo_usuario: 'cliente' | 'participante' | 'ambos'
  empresa?: string
  cargo?: string
  industria?: string
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
  email_verified?: boolean
}

export interface Ideacion {
  id: number
  titulo: string
  descripcion: string
  categoria: string
  estado: 'abierta' | 'cerrada'
  fecha_cierre?: string
  created_at?: string
  ideas?: Idea[]
}

export interface Idea {
  id: number
  ideacion_id: number
  titulo: string
  descripcion: string
  votos_count: number
  comentarios_count: number
  color?: 'verde' | 'amarillo' | 'rojo'
  color_filtro?: 'verde' | 'amarillo' | 'rojo'
  seleccionada?: boolean
  created_at: string
  ideacion: {
    id: number
    titulo: string
    estado: string
  }
}

export interface Proyecto {
  id: number
  titulo: string
  descripcion: string
  nicho: string
  estado: 'abierto' | 'cerrado'
  presupuesto_minimo?: number
  presupuesto_maximo?: number
  fecha_limite: string
  funcionalidad?: number
  usabilidad?: number
  tiempo_estimado?: number
  alcance?: number
  presupuesto_estimado?: number
  escalabilidad?: number
  propuestas_count: number
  created_at: string
  cliente: {
    user: {
      nombre: string
      avatar?: string
    }
  }
  propuestas?: Propuesta[]
}

export interface Propuesta {
  id: number
  proyecto_id: number
  titulo: string
  descripcion: string
  presupuesto: number
  tiempo_entrega: number
  likes_count: number
  comentarios_count: number
  color?: 'verde' | 'azul' | 'amarillo' | 'naranja' | 'rojo'
  created_at: string
  participante: {
    id: number
    user: {
      nombre: string
      avatar?: string
    }
  }
  proyecto: {
    id: number
    titulo: string
    estado: string
  }
}

// ============================================
// AUTENTICACIÓN
// ============================================

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

  resendVerification: (email: string) =>
    apiFetch<{ message: string }>('/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
}

// ============================================
// IDEACIONES
// ============================================

export const ideacionApi = {
  // ✅ Manejar respuesta de Laravel (puede venir paginada o directa)
  list: async (): Promise<{ ideaciones: Ideacion[] }> => {
    const response = await apiFetch<any>('/ideaciones');
    // Si viene paginada: { data: [...] }
    // Si viene directa: { ideaciones: [...] }
    // Si es array directo: [...]
    if (Array.isArray(response)) {
      return { ideaciones: response };
    }
    if (response.data && Array.isArray(response.data)) {
      return { ideaciones: response.data };
    }
    return { ideaciones: response.ideaciones || [] };
  },

  create: (data: {
    titulo: string
    descripcion: string
    categoria: string
    contexto_adicional?: string
    areas_impacto?: string[]
    fecha_cierre?: string
  }) =>
    apiFetch<{ ideacion: Ideacion }>('/ideaciones', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get: (id: string) =>
    apiFetch<{ ideacion: Ideacion }>(`/ideaciones/${id}`),

  update: (id: string, data: any) =>
    apiFetch<{ ideacion: Ideacion }>(`/ideaciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch(`/ideaciones/${id}`, { method: 'DELETE' }),

  cerrar: (id: string) =>
    apiFetch(`/ideaciones/${id}/cerrar`, { method: 'POST' }),

  getWithFiltro: (id: string) =>
    apiFetch<{ ideacion: Ideacion; ideas: Idea[]; estadisticas: any }>(`/ideaciones/${id}/filtro`),

  seleccionarIdeas: (id: string, ideasIds: number[]) =>
    apiFetch(`/ideaciones/${id}/seleccionar`, {
      method: 'POST',
      body: JSON.stringify({ ideas_ids: ideasIds }),
    }),
}

// ============================================
// IDEAS
// ============================================

export const ideaApi = {
  list: (ideacionId: string) =>
    apiFetch<{ ideas: Idea[] }>(`/ideaciones/${ideacionId}/ideas`),

  create: (data: {
    ideacion_id: number
    titulo: string
    descripcion: string
    beneficios_esperados?: string
    consideraciones_implementacion?: string
  }) =>
    apiFetch<{ idea: Idea }>('/ideas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get: (id: string) =>
    apiFetch<{ idea: Idea }>(`/ideas/${id}`),

  update: (id: string, data: any) =>
    apiFetch<{ idea: Idea }>(`/ideas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch(`/ideas/${id}`, { method: 'DELETE' }),

  votar: (id: string) =>
    apiFetch<{ message: string; votos_count: number }>(`/ideas/${id}/votar`, { method: 'POST' }),

  comentar: (id: string, contenido: string) =>
    apiFetch(`/ideas/${id}/comentar`, {
      method: 'POST',
      body: JSON.stringify({ contenido }),
    }),

  myIdeas: () =>
    apiFetch<{ ideas: Idea[] }>('/mis-ideas'),
}

// ============================================
// PROYECTOS
// ============================================

export const proyectoApi = {
  // ✅ Maneja TANTO proyectos directos COMO publicaciones con proyecto anidado
  getAll: async (): Promise<{ proyectos: Proyecto[] }> => {
    const response = await apiFetch<any>('/proyectos');
    
    // 🐛 Solo en desarrollo: descomentar para debug
    // console.log('📦 Respuesta de /proyectos:', response);
    
    let rawData: any[] = [];
    
    // Caso 1: Laravel paginate { data: [...], current_page, ... }
    if (response.data && Array.isArray(response.data)) {
      rawData = response.data;
    }
    // Caso 2: Array directo [...]
    else if (Array.isArray(response)) {
      rawData = response;
    }
    // Caso 3: { proyectos: [...] }
    else if (response.proyectos && Array.isArray(response.proyectos)) {
      rawData = response.proyectos;
    }
    else {
      console.warn('⚠️ Formato inesperado en /proyectos:', response);
      return { proyectos: [] };
    }
    
    // ✅ NORMALIZAR: Si vienen publicaciones con proyecto anidado, extraer
    const proyectos = rawData.map((item: any) => {
      // Si es una Publicación con proyecto relacionado
      if (item.proyecto && typeof item.proyecto === 'object') {
        return {
          id: item.id,
          titulo: item.titulo,
          descripcion: item.descripcion,
          nicho: item.proyecto.nicho || item.categoria || 'General',
          estado: item.estado,
          presupuesto_minimo: item.proyecto.presupuesto_min ?? item.presupuesto_minimo,
          presupuesto_maximo: item.proyecto.presupuesto_max ?? item.presupuesto_maximo,
          fecha_limite: item.fecha_cierre || item.fecha_limite,
          funcionalidad: item.proyecto.funcionalidad,
          usabilidad: item.proyecto.usabilidad,
          tiempo_estimado: item.proyecto.tiempo_dias ?? item.tiempo_estimado,
          alcance: item.proyecto.alcance,
          presupuesto_estimado: item.proyecto.presupuesto_estimado,
          escalabilidad: item.proyecto.escalabilidad,
          propuestas_count: item.total_participaciones ?? item.propuestas_count ?? 0,
          created_at: item.created_at,
          cliente: item.cliente || { user: { nombre: 'Cliente' } },
          propuestas: item.propuestas
        };
      }
      // Si ya viene como Proyecto directo, devolver tal cual
      return item;
    });
    
    return { proyectos };
  },

  // ✅ Maneja diferentes respuestas al crear
  create: async (data: any): Promise<{ proyecto: Proyecto }> => {
    const response = await apiFetch<any>('/proyectos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Backend puede devolver { publicacion: {...} } o { proyecto: {...} }
    if (response.publicacion) {
      return { proyecto: response.publicacion };
    }
    if (response.proyecto) {
      return { proyecto: response.proyecto };
    }
    return { proyecto: response };
  },

  get: (id: string) =>
    apiFetch<{ proyecto: Proyecto }>(`/proyectos/${id}`),

  update: (id: string, data: any) =>
    apiFetch<{ proyecto: Proyecto }>(`/proyectos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch(`/proyectos/${id}`, { method: 'DELETE' }),

  cerrar: (id: string) =>
    apiFetch(`/proyectos/${id}/cerrar`, { method: 'POST' }),
}

// ============================================
// PROPUESTAS
// ============================================

export const propuestaApi = {
  list: (proyectoId: string) =>
    apiFetch<{ propuestas: Propuesta[] }>(`/proyectos/${proyectoId}/propuestas`),

  create: (proyectoId: string, data: any) =>
    apiFetch<{ propuesta: Propuesta }>('/propuestas', {
      method: 'POST',
      body: JSON.stringify({ ...data, proyecto_id: proyectoId }),
    }),

  get: (id: string) =>
    apiFetch<{ propuesta: Propuesta }>(`/propuestas/${id}`),

  update: (id: string, data: any) =>
    apiFetch<{ propuesta: Propuesta }>(`/propuestas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch(`/propuestas/${id}`, { method: 'DELETE' }),

  like: (id: string) =>
    apiFetch<{ message: string; likes_count: number }>(`/propuestas/${id}/like`, { method: 'POST' }),

  comentar: (id: string, contenido: string) =>
    apiFetch(`/propuestas/${id}/comentar`, {
      method: 'POST',
      body: JSON.stringify({ contenido }),
    }),

  myProposals: () =>
    apiFetch<{ propuestas: Propuesta[] }>('/mis-propuestas'),
}

// ============================================
// FILTROS
// ============================================

export const filtroApi = {
  filtro1: (proyectoId: string) =>
    apiFetch<{ proyecto: Proyecto; propuestas: Propuesta[]; estadisticas: any }>(`/proyectos/${proyectoId}/filtro1`),

  filtro2Calificar: (propuestaId: string, data: {
    deseable: number
    factible: number
    costo: number
    beneficio: number
    notas?: string
  }) =>
    apiFetch('/filtro2/calificar', {
      method: 'POST',
      body: JSON.stringify({ propuesta_id: propuestaId, ...data }),
    }),

  filtro2Ranking: (proyectoId: string) =>
    apiFetch(`/proyectos/${proyectoId}/filtro2/ranking`),

  filtro3Evaluar: (propuestaId: string, data: {
    es_estrategico: boolean
    es_tiempo_indicado: boolean
    decision: string
    justificacion?: string
  }) =>
    apiFetch('/filtro3/evaluar', {
      method: 'POST',
      body: JSON.stringify({ propuesta_id: propuestaId, ...data }),
    }),

  propuestasGuardadas: () =>
    apiFetch<{ propuestas: Propuesta[] }>('/propuestas-guardadas'),
}

// ============================================
// REUNIONES
// ============================================

export interface Reunion {
  id: number
  fecha_hora: string
  duracion: number
  lugar: string
  descripcion?: string
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada'
  cliente: { nombre: string }
  participante: { nombre: string }
}

export const reunionApi = {
  list: () =>
    apiFetch<{ reuniones: Reunion[] }>('/reuniones'),

  proximas: () =>
    apiFetch<{ reuniones: Reunion[] }>('/reuniones-proximas'),

  create: (data: any) =>
    apiFetch<{ reunion: Reunion }>('/reuniones', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get: (id: string) =>
    apiFetch<{ reunion: Reunion }>(`/reuniones/${id}`),

  update: (id: string, data: any) =>
    apiFetch<{ reunion: Reunion }>(`/reuniones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  confirmar: (id: string) =>
    apiFetch(`/reuniones/${id}/confirmar`, { method: 'POST' }),

  cancelar: (id: string) =>
    apiFetch(`/reuniones/${id}/cancelar`, { method: 'POST' }),

  completar: (id: string, notas?: string) =>
    apiFetch(`/reuniones/${id}/completar`, {
      method: 'POST',
      body: JSON.stringify({ notas }),
    }),

  delete: (id: string) =>
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
    apiFetch<{ notificaciones: Notificacion[] }>('/notificaciones'),

  noLeidas: () =>
    apiFetch<{ total: number; notificaciones: Notificacion[] }>('/notificaciones/no-leidas'),

  resumen: () =>
    apiFetch('/notificaciones/resumen'),

  marcarLeida: (id: string) =>
    apiFetch(`/notificaciones/${id}/leer`, { method: 'POST' }),

  marcarTodasLeidas: () =>
    apiFetch('/notificaciones/leer-todas', { method: 'POST' }),

  delete: (id: string) =>
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
    const response = await fetch(`${API_BASE_URL}/api/upload/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al subir avatar')
    }

    return response.json()
  },

  deleteAvatar: () =>
    apiFetch('/upload/avatar', { method: 'DELETE' }),

  document: async (file: File) => {
    const formData = new FormData()
    formData.append('document', file)

    const token = getToken()
    const response = await fetch(`${API_BASE_URL}/api/upload/document`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al subir documento')
    }

    return response.json()
  },
}