'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Sparkles, Rocket, Filter, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ListingCard } from '@/components/listing-card';
import { useAuth } from '@/components/auth-provider';
import { ideacionApi, proyectoApi, type Ideacion, type Proyecto } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isCliente, isParticipante, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('ideaciones');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNicho, setSelectedNicho] = useState('all');
  
  const [ideaciones, setIdeaciones] = useState<Ideacion[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (authLoading) {
      console.log('⏳ Esperando autenticación...')
      return;
    }
    
    if (!user) {
      console.log('❌ No hay usuario, redirigiendo a login...')
      router.push('/login');
      return;
    }
    
    console.log('✅ Usuario autenticado:', user.nombre)
    cargarDatos();
  }, [authLoading, user, router]);

  const cargarDatos = async () => {
    setDataLoading(true);
    try {
      console.log('📡 Cargando datos del dashboard...')
      
      const [ideacionesRes, proyectosRes] = await Promise.all([
        ideacionApi.list(),
        proyectoApi.getAll()
      ]);

      console.log('📦 Respuesta ideaciones:', ideacionesRes);
      console.log('📦 Respuesta proyectos:', proyectosRes);

      // ✅ Usar directamente las propiedades del tipo definido
      const ideacionesData = ideacionesRes.ideaciones || [];
      const proyectosData = proyectosRes.proyectos || [];

      console.log('✅ Datos cargados:', {
        ideaciones: ideacionesData.length,
        proyectos: proyectosData.length,
        ideacionesRaw: ideacionesData,
        proyectosRaw: proyectosData
      })

      setIdeaciones(ideacionesData);
      setProyectos(proyectosData);
    } catch (error: any) {
      console.error('❌ Error al cargar datos:', error);
      if (error.message?.includes('Unauthenticated')) {
        console.log('🔄 Token inválido, redirigiendo al login...')
        router.push('/login');
      }
    } finally {
      setDataLoading(false);
    }
  };

  const filteredIdeaciones = ideaciones.filter(ideacion => {
    const matchesSearch = ideacion.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ideacion.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNicho = selectedNicho === 'all' || ideacion.categoria === selectedNicho;
    return matchesSearch && matchesNicho;
  });

  const filteredProyectos = proyectos.filter(proyecto => {
    const matchesSearch = proyecto.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proyecto.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNicho = selectedNicho === 'all' || proyecto.nicho === selectedNicho;
    return matchesSearch && matchesNicho;
  });

  const nichos = Array.from(
    new Set([
      ...ideaciones.map(i => i.categoria),
      ...proyectos.map(p => p.nicho)
    ])
  ).filter(Boolean);

  if (authLoading || dataLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {authLoading ? 'Verificando autenticación...' : 'Cargando datos...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Bienvenido, {user.nombre}
            </h1>
            <p className="text-muted-foreground text-lg">
              Explora ideaciones y proyectos de innovación
            </p>
          </div>

          {isCliente() && (
            <div className="flex gap-2">
              <Button onClick={() => router.push('/dashboard/create/ideacion')}>
                <Sparkles className="mr-2 h-4 w-4" />
                Nueva Ideación
              </Button>
              <Button onClick={() => router.push('/dashboard/create/project')}>
                <Rocket className="mr-2 h-4 w-4" />
                Nuevo Proyecto
              </Button>
            </div>
          )}
        </div>

        {/* Filtros */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por título o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedNicho === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedNicho('all')}
              >
                Todos
              </Button>
              {nichos.map((nicho) => (
                <Button
                  key={nicho}
                  variant={selectedNicho === nicho ? 'default' : 'outline'}
                  onClick={() => setSelectedNicho(nicho)}
                >
                  {nicho}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="ideaciones">
              <Sparkles className="mr-2 h-4 w-4" />
              Ideaciones ({filteredIdeaciones.length})
            </TabsTrigger>
            <TabsTrigger value="proyectos">
              <Rocket className="mr-2 h-4 w-4" />
              Proyectos ({filteredProyectos.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Ideaciones */}
          <TabsContent value="ideaciones">
            {filteredIdeaciones.length === 0 ? (
              <Card className="p-12 text-center">
                <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No se encontraron ideaciones</h3>
                <p className="text-muted-foreground">
                  {isCliente() ? 'Crea tu primera ideación' : 'Aún no hay ideaciones disponibles'}
                </p>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredIdeaciones.map((ideacion) => (
                  <motion.div
                    key={ideacion.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ListingCard
                      data={{
                        id: ideacion.id.toString(),
                        type: 'challenge',
                        title: ideacion.titulo,
                        status: ideacion.estado === 'abierta' ? 'active' : 'completed',
                        progress: 0,
                        publisher: 'Sistema',
                        description: ideacion.descripcion,
                        likes: ideacion.ideas?.length || 0,
                        hashtags: [ideacion.categoria],
                        startDate: new Date(ideacion.created_at || Date.now()).toLocaleDateString(),
                        endDate: ideacion.fecha_cierre ? new Date(ideacion.fecha_cierre).toLocaleDateString() : 'Sin fecha'
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab: Proyectos */}
          <TabsContent value="proyectos">
            {filteredProyectos.length === 0 ? (
              <Card className="p-12 text-center">
                <Rocket className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No se encontraron proyectos</h3>
                <p className="text-muted-foreground">
                  {isCliente() ? 'Crea tu primer proyecto' : 'Aún no hay proyectos disponibles'}
                </p>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProyectos.map((proyecto) => (
                  <motion.div
                    key={proyecto.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ListingCard
                      data={{
                        id: proyecto.id.toString(),
                        type: 'project',
                        title: proyecto.titulo,
                        status: proyecto.estado === 'abierto' ? 'active' : 'completed',
                        progress: 0,
                        publisher: proyecto.cliente?.user?.nombre || 'Cliente',
                        description: proyecto.descripcion,
                        likes: proyecto.propuestas_count || 0,
                        hashtags: [proyecto.nicho],
                        startDate: new Date(proyecto.created_at).toLocaleDateString(),
                        endDate: new Date(proyecto.fecha_limite).toLocaleDateString(),
                        specs: {
                          functionality: proyecto.funcionalidad ? `${proyecto.funcionalidad}/10` : 'N/A',
                          budget: proyecto.presupuesto_minimo 
                            ? `$${proyecto.presupuesto_minimo} - $${proyecto.presupuesto_maximo}`
                            : 'A consultar',
                          scalability: proyecto.escalabilidad ? `${proyecto.escalabilidad}/10` : 'N/A'
                        }
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Links */}
        {isParticipante() && (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Card
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/dashboard/my-ideas')}
            >
              <Sparkles className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Mis Ideas</h3>
              <p className="text-sm text-muted-foreground">
                Ve todas las ideas que has compartido
              </p>
            </Card>

            <Card
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/dashboard/my-proposals')}
            >
              <Rocket className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Mis Propuestas</h3>
              <p className="text-sm text-muted-foreground">
                Revisa tus propuestas enviadas
              </p>
            </Card>

            <Card
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/dashboard/profile')}
            >
              <TrendingUp className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Mi Perfil</h3>
              <p className="text-sm text-muted-foreground">
                Actualiza tu información profesional
              </p>
            </Card>
          </div>
        )}

        {isCliente() && (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Card
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/dashboard/my-projects')}
            >
              <Rocket className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Mis Proyectos</h3>
              <p className="text-sm text-muted-foreground">
                Gestiona tus proyectos y revisa propuestas
              </p>
            </Card>

            <Card
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/dashboard/profile')}
            >
              <Filter className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sistema de Filtros</h3>
              <p className="text-sm text-muted-foreground">
                Evalúa y selecciona las mejores propuestas
              </p>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  );
}