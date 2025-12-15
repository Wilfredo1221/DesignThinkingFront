'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lightbulb, Heart, MessageCircle, Edit, Trash2, Eye, DollarSign, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth-provider';
import { propuestaApi } from '@/lib/api';

interface Propuesta {
  id: number;
  titulo: string;
  descripcion: string;
  presupuesto: number;
  tiempo_entrega: number;
  likes_count: number;
  comentarios_count: number;
  color?: string;
  proyecto: {
    id: number;
    titulo: string;
    estado: string;
  };
  calificacion_manual?: {
    puntaje_total: number;
  };
  evaluacion_estrategica?: {
    decision: string;
  };
  created_at: string;
}

export default function MyProposalsPage() {
  const router = useRouter();
  const { user, isParticipante, isLoading: authLoading } = useAuth();
  const [propuestas, setPropuestas] = useState<Propuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ✅ Verificar autenticación y rol
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!isParticipante()) {
      alert('Solo los participantes pueden ver esta página');
      router.push('/dashboard');
      return;
    }

    cargarMisPropuestas();
  }, [authLoading, user, isParticipante, router]);

  const cargarMisPropuestas = async () => {
    try {
      const response = await propuestaApi.myProposals();
      setPropuestas(response.propuestas || []);
    } catch (error) {
      console.error('Error al cargar propuestas:', error);
      alert('Error al cargar tus propuestas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propuestaId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta propuesta?')) return;

    setDeletingId(propuestaId);
    try {
      await propuestaApi.delete(propuestaId.toString());
      setPropuestas(prev => prev.filter(p => p.id !== propuestaId));
      alert('Propuesta eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar propuesta:', error);
      alert('Error al eliminar la propuesta');
    } finally {
      setDeletingId(null);
    }
  };

  const getColorBadge = (color?: string) => {
    if (!color) return null;

    const colorMap: Record<string, { bg: string; text: string; label: string }> = {
      verde: { bg: 'bg-green-500', text: 'text-white', label: '🟢 Verde' },
      azul: { bg: 'bg-blue-500', text: 'text-white', label: '🔵 Azul' },
      amarillo: { bg: 'bg-yellow-500', text: 'text-black', label: '🟡 Amarillo' },
      naranja: { bg: 'bg-orange-500', text: 'text-white', label: '🟠 Naranja' },
      rojo: { bg: 'bg-red-500', text: 'text-white', label: '🔴 Rojo' },
    };

    const style = colorMap[color];
    if (!style) return null;

    return (
      <Badge className={`${style.bg} ${style.text}`}>
        {style.label}
      </Badge>
    );
  };

  const getEstadoBadge = (estado: string) => {
    const estados: Record<string, { variant: any; label: string }> = {
      abierto: { variant: 'default', label: 'Abierto' },
      cerrado: { variant: 'secondary', label: 'Cerrado' },
      en_progreso: { variant: 'outline', label: 'En Progreso' },
    };

    const config = estados[estado] || estados.abierto;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDecisionBadge = (decision?: string) => {
    if (!decision) return null;

    const decisions: Record<string, { variant: any; label: string }> = {
      guardar_futuro: { variant: 'outline', label: '📌 Guardado' },
      agendar_reunion: { variant: 'default', label: '📅 Reunión Agendada' },
      posponer: { variant: 'secondary', label: '⏸️ Pospuesto' },
    };

    const config = decisions[decision];
    if (!config) return null;

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // ✅ Loading state
  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {authLoading ? 'Verificando permisos...' : 'Cargando propuestas...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ No mostrar nada si no hay usuario
  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Lightbulb className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Mis Propuestas</h1>
              <p className="text-muted-foreground">
                {propuestas.length} {propuestas.length === 1 ? 'propuesta enviada' : 'propuestas enviadas'}
              </p>
            </div>
          </div>
        </div>

        {propuestas.length === 0 ? (
          <Card className="p-12 text-center">
            <Lightbulb className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No has enviado propuestas aún</h3>
            <p className="text-muted-foreground mb-6">
              Explora los proyectos abiertos y envía tus propuestas
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Ver Proyectos
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6">
            {propuestas.map((propuesta) => (
              <motion.div
                key={propuesta.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {getColorBadge(propuesta.color)}
                        {getEstadoBadge(propuesta.proyecto.estado)}
                        {getDecisionBadge(propuesta.evaluacion_estrategica?.decision)}
                        {propuesta.calificacion_manual && (
                          <Badge variant="secondary">
                            ⭐ {propuesta.calificacion_manual.puntaje_total}/19 pts
                          </Badge>
                        )}
                      </div>

                      {/* Proyecto padre */}
                      <div className="text-sm text-muted-foreground mb-2">
                        Propuesta para: <strong>{propuesta.proyecto.titulo}</strong>
                      </div>

                      {/* Título y Descripción */}
                      <h3 className="text-xl font-bold mb-2">{propuesta.titulo}</h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {propuesta.descripcion}
                      </p>

                      {/* Estadísticas */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-muted-foreground" />
                          <span>{propuesta.likes_count} likes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-muted-foreground" />
                          <span>{propuesta.comentarios_count} comentarios</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>${propuesta.presupuesto}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{propuesta.tiempo_entrega} días</span>
                        </div>
                        <div className="text-muted-foreground">
                          {new Date(propuesta.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => router.push(`/dashboard/project/${propuesta.proyecto.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Proyecto
                      </Button>
                      
                      {propuesta.proyecto.estado === 'abierto' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/proposal/${propuesta.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(propuesta.id)}
                            disabled={deletingId === propuesta.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}