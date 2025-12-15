'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Rocket, Plus, Eye, Edit, Trash2, Clock, DollarSign, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth-provider';
import { proyectoApi, type Proyecto } from '@/lib/api';

export default function MyProjectsPage() {
  const router = useRouter();
  const { user, isCliente, isLoading: authLoading } = useAuth();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!isCliente()) {
      alert('Solo los clientes pueden ver esta página');
      router.push('/dashboard');
      return;
    }

    cargarMisProyectos();
  }, [authLoading, user, isCliente, router]);

  const cargarMisProyectos = async () => {
    try {
      const response = await proyectoApi.getAll();
      setProyectos(response.proyectos || []);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      alert('Error al cargar tus proyectos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (proyectoId: number) => {
    if (!confirm('¿Estás seguro de eliminar este proyecto? Se eliminarán todas las propuestas.')) return;

    setDeletingId(proyectoId);
    try {
      await proyectoApi.delete(proyectoId.toString());
      setProyectos(prev => prev.filter(p => p.id !== proyectoId));
      alert('Proyecto eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
      alert('Error al eliminar el proyecto');
    } finally {
      setDeletingId(null);
    }
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

  const getDaysRemaining = (fechaLimite: string) => {
    const now = new Date();
    const limit = new Date(fechaLimite);
    const diff = Math.ceil((limit.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return <span className="text-red-500">Expirado</span>;
    if (diff === 0) return <span className="text-orange-500">Hoy</span>;
    if (diff === 1) return <span className="text-orange-500">Mañana</span>;
    return <span>{diff} días restantes</span>;
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {authLoading ? 'Verificando permisos...' : 'Cargando proyectos...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

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
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Mis Proyectos</h1>
              <p className="text-muted-foreground">
                {proyectos.length} {proyectos.length === 1 ? 'proyecto publicado' : 'proyectos publicados'}
              </p>
            </div>
          </div>

          <Button onClick={() => router.push('/dashboard/create/project')}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proyecto
          </Button>
        </div>

        {proyectos.length === 0 ? (
          <Card className="p-12 text-center">
            <Rocket className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No has creado proyectos aún</h3>
            <p className="text-muted-foreground mb-6">
              Crea tu primer proyecto para recibir propuestas de participantes
            </p>
            <Button onClick={() => router.push('/dashboard/create/project')}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Proyecto
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6">
            {proyectos.map((proyecto) => (
              <motion.div
                key={proyecto.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        {getEstadoBadge(proyecto.estado)}
                        <Badge variant="outline">{proyecto.nicho}</Badge>
                      </div>

                      <h3 className="text-xl font-bold mb-2">{proyecto.titulo}</h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {proyecto.descripcion}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{proyecto.propuestas_count} propuestas</span>
                        </div>

                        {proyecto.presupuesto_minimo && proyecto.presupuesto_maximo && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>${proyecto.presupuesto_minimo} - ${proyecto.presupuesto_maximo}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {getDaysRemaining(proyecto.fecha_limite)}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Creado: {new Date(proyecto.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => router.push(`/dashboard/project/${proyecto.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Propuestas
                      </Button>
                      
                      {proyecto.estado === 'abierto' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/project/${proyecto.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(proyecto.id)}
                            disabled={deletingId === proyecto.id}
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