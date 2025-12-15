'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lightbulb, Eye, Edit, Trash2, ThumbsUp, MessageSquare, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ideaApi, type Idea } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';

export default function MyIdeasPage() {
  const router = useRouter();
  const { user, isParticipante, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filtro, setFiltro] = useState<'todas' | 'verde' | 'amarillo' | 'rojo' | 'seleccionadas'>('todas');

  // ✅ Verificar autenticación y rol
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!isParticipante()) {
      alert('Solo los participantes pueden ver sus ideas');
      router.push('/dashboard');
      return;
    }

    fetchIdeas();
  }, [authLoading, user, isParticipante, router]);

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const response = await ideaApi.myIdeas();
      setIdeas(response.ideas || []);
    } catch (error) {
      console.error('Error al cargar ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta idea?')) return;

    try {
      await ideaApi.delete(id.toString());
      setIdeas(ideas.filter(i => i.id !== id));
      alert('Idea eliminada correctamente');
    } catch (error: any) {
      alert('Error al eliminar idea');
    }
  };

  const getColorBadge = (color: string) => {
    const badges = {
      verde: <Badge className="bg-green-500">🟢 Verde - Top</Badge>,
      amarillo: <Badge className="bg-yellow-500">🟡 Amarillo - Media</Badge>,
      rojo: <Badge className="bg-red-500">🔴 Rojo - Baja</Badge>,
    };
    return badges[color as keyof typeof badges] || <Badge>{color}</Badge>;
  };

  const ideasFiltradas = ideas.filter(idea => {
    if (filtro === 'todas') return true;
    if (filtro === 'seleccionadas') return idea.seleccionada;
    const colorIdea = idea.color_filtro || idea.color;
    return colorIdea === filtro;
  });

  // ✅ Loading state
  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {authLoading ? 'Verificando permisos...' : 'Cargando ideas...'}
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Mis Ideas</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona las ideas que has propuesto en diferentes ideaciones
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold">{ideas.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </Card>
          <Card className="p-4 text-center bg-green-500/10">
            <div className="text-2xl font-bold text-green-500">
              {ideas.filter(i => (i.color_filtro || i.color) === 'verde').length}
            </div>
            <div className="text-sm text-muted-foreground">Verdes</div>
          </Card>
          <Card className="p-4 text-center bg-yellow-500/10">
            <div className="text-2xl font-bold text-yellow-500">
              {ideas.filter(i => (i.color_filtro || i.color) === 'amarillo').length}
            </div>
            <div className="text-sm text-muted-foreground">Amarillas</div>
          </Card>
          <Card className="p-4 text-center bg-red-500/10">
            <div className="text-2xl font-bold text-red-500">
              {ideas.filter(i => (i.color_filtro || i.color) === 'rojo').length}
            </div>
            <div className="text-sm text-muted-foreground">Rojas</div>
          </Card>
          <Card className="p-4 text-center bg-primary/10">
            <div className="text-2xl font-bold text-primary">
              {ideas.filter(i => i.seleccionada).length}
            </div>
            <div className="text-sm text-muted-foreground">Seleccionadas</div>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={filtro === 'todas' ? 'default' : 'outline'}
            onClick={() => setFiltro('todas')}
            size="sm"
          >
            Todas
          </Button>
          <Button
            variant={filtro === 'verde' ? 'default' : 'outline'}
            onClick={() => setFiltro('verde')}
            size="sm"
            className="bg-green-500 hover:bg-green-600"
          >
            🟢 Verdes
          </Button>
          <Button
            variant={filtro === 'amarillo' ? 'default' : 'outline'}
            onClick={() => setFiltro('amarillo')}
            size="sm"
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            🟡 Amarillas
          </Button>
          <Button
            variant={filtro === 'rojo' ? 'default' : 'outline'}
            onClick={() => setFiltro('rojo')}
            size="sm"
            className="bg-red-500 hover:bg-red-600"
          >
            🔴 Rojas
          </Button>
          <Button
            variant={filtro === 'seleccionadas' ? 'default' : 'outline'}
            onClick={() => setFiltro('seleccionadas')}
            size="sm"
          >
            <Award className="mr-2 h-4 w-4" />
            Seleccionadas
          </Button>
        </div>

        {/* Lista de Ideas */}
        {ideasFiltradas.length === 0 ? (
          <Card className="p-12 text-center">
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {filtro === 'todas' ? 'No tienes ideas' : `No tienes ideas ${filtro}`}
            </h3>
            <p className="text-muted-foreground mb-4">
              Participa en ideaciones activas para proponer tus ideas
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Ver Ideaciones Activas
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ideasFiltradas.map((idea) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="p-6 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg line-clamp-2 flex-1">
                      {idea.titulo}
                    </h3>
                    {idea.seleccionada && (
                      <Award className="h-5 w-5 text-yellow-500 ml-2" />
                    )}
                  </div>

                  <div className="mb-4">
                    {getColorBadge((idea.color_filtro || idea.color) as string)}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                    {idea.descripcion}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="text-xs text-muted-foreground">
                      Ideación: {idea.ideacion.titulo}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center">
                        <ThumbsUp className="mr-1 h-4 w-4" />
                        {idea.votos_count}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="mr-1 h-4 w-4" />
                        {idea.comentarios_count}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Publicada: {new Date(idea.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => router.push(`/dashboard/ideacion/${idea.ideacion.id}`)}
                      className="flex-1"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver
                    </Button>
                    {idea.ideacion.estado === 'abierta' && !idea.seleccionada && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/dashboard/ideacion/${idea.ideacion.id}?edit=${idea.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(idea.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
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