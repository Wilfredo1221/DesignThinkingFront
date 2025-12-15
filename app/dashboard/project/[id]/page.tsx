'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Rocket, Plus, Filter, Star, Calendar, MessageCircle, 
  Heart, DollarSign, Clock, Target, CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth-provider';
import { proyectoApi, propuestaApi, filtroApi, reunionApi } from '@/lib/api';

interface Propuesta {
  id: number;
  titulo: string;
  descripcion: string;
  presupuesto: number;
  tiempo_entrega: number;
  likes_count: number;
  comentarios_count: number;
  color?: string;
  participante: {
    id: number;
    user: {
      nombre: string;
      avatar?: string;
    };
  };
  calificacion_manual?: {
    deseable: number;
    factible: number;
    costo: number;
    beneficio: number;
    puntaje_total: number;
  };
  evaluacion_estrategica?: {
    es_estrategico: boolean;
    es_tiempo_indicado: boolean;
    decision: string;
    justificacion?: string;
  };
}

interface Proyecto {
  id: number;
  titulo: string;
  descripcion: string;
  nicho: string;
  estado: string;
  presupuesto_minimo: number;
  presupuesto_maximo: number;
  fecha_limite: string;
  funcionalidad: number;
  usabilidad: number;
  tiempo_estimado: number;
  alcance: number;
  presupuesto_estimado: number;
  escalabilidad: number;
  cliente: {
    user: {
      nombre: string;
      avatar?: string;
    };
  };
  propuestas?: Propuesta[];
  estadisticas_filtro1?: {
    total: number;
    verde: number;
    azul: number;
    amarillo: number;
    naranja: number;
    rojo: number;
  };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isCliente, isParticipante } = useAuth();
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('propuestas');
  const [selectedPropuesta, setSelectedPropuesta] = useState<Propuesta | null>(null);
  
  const [calificando, setCalificando] = useState<number | null>(null);
  const [formCalificacion, setFormCalificacion] = useState({
    deseable: 3,
    factible: 3,
    costo: 2,
    beneficio: 3,
  });

  const [evaluando, setEvaluando] = useState<number | null>(null);
  const [formEvaluacion, setFormEvaluacion] = useState({
    es_estrategico: true,
    es_tiempo_indicado: true,
    decision: 'guardar_futuro',
    justificacion: '',
  });

  const [agendandoReunion, setAgendandoReunion] = useState<number | null>(null);
  const [formReunion, setFormReunion] = useState({
    fecha: '',
    hora: '',
    duracion: '60',
    lugar: '',
    descripcion: '',
  });

  useEffect(() => {
    cargarProyecto();
  }, [params.id]);

  const cargarProyecto = async () => {
    try {
      const response = await proyectoApi.get(params.id as string);
      setProyecto(response.proyecto);
      
      if (isCliente()) {
        await cargarFiltro1();
      }
    } catch (error: unknown) {
      console.error('Error al cargar proyecto:', error);
      alert('Error al cargar el proyecto');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const cargarFiltro1 = async () => {
    try {
      const response = await filtroApi.filtro1(params.id as string);
      setProyecto(prev => prev ? {
        ...prev,
        propuestas: response.propuestas,
        estadisticas_filtro1: response.estadisticas
      } : null);
    } catch (error) {
      console.error('Error al cargar filtro 1:', error);
    }
  };

  const handleLike = async (propuestaId: number) => {
    try {
      await propuestaApi.like(propuestaId.toString());
      await cargarProyecto();
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  const handleCalificar = async (propuestaId: number) => {
    if (!isCliente()) return;

    setCalificando(propuestaId);
    try {
      await filtroApi.filtro2Calificar(propuestaId.toString(), formCalificacion);
      alert('Calificación guardada correctamente');
      await cargarProyecto();
      setSelectedPropuesta(null);
    } catch (error) {
      console.error('Error al calificar:', error);
      alert('Error al guardar calificación');
    } finally {
      setCalificando(null);
    }
  };

  const handleEvaluar = async (propuestaId: number) => {
    if (!isCliente()) return;

    setEvaluando(propuestaId);
    try {
      await filtroApi.filtro3Evaluar(propuestaId.toString(), formEvaluacion);
      alert('Evaluación estratégica guardada');
      
      if (formEvaluacion.decision === 'agendar_reunion') {
        setAgendandoReunion(propuestaId);
      } else {
        await cargarProyecto();
        setSelectedPropuesta(null);
      }
    } catch (error) {
      console.error('Error al evaluar:', error);
      alert('Error al guardar evaluación');
    } finally {
      setEvaluando(null);
    }
  };

  const handleAgendarReunion = async () => {
    if (!agendandoReunion) return;

    try {
      await reunionApi.create({
        ...formReunion,
        fecha_hora: `${formReunion.fecha}T${formReunion.hora}`,
        duracion: parseInt(formReunion.duracion),
        reunionable_type: 'App\\Models\\Propuesta',
        reunionable_id: agendandoReunion,
      });
      
      alert('Reunión agendada correctamente');
      setAgendandoReunion(null);
      setSelectedPropuesta(null);
      await cargarProyecto();
    } catch (error) {
      console.error('Error al agendar reunión:', error);
      alert('Error al agendar reunión');
    }
  };

  const getColorBadge = (color?: string) => {
    if (!color) return null;

    const colorMap: Record<string, { bg: string; text: string; label: string; icon: string }> = {
      verde: { bg: 'bg-green-500', text: 'text-white', label: 'Verde', icon: '🟢' },
      azul: { bg: 'bg-blue-500', text: 'text-white', label: 'Azul', icon: '🔵' },
      amarillo: { bg: 'bg-yellow-500', text: 'text-black', label: 'Amarillo', icon: '🟡' },
      naranja: { bg: 'bg-orange-500', text: 'text-white', label: 'Naranja', icon: '🟠' },
      rojo: { bg: 'bg-red-500', text: 'text-white', label: 'Rojo', icon: '🔴' },
    };

    const style = colorMap[color];
    if (!style) return null;

    return (
      <Badge className={`${style.bg} ${style.text}`}>
        {style.icon} {style.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando proyecto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!proyecto) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Proyecto no encontrado</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge>{proyecto.nicho}</Badge>
                <Badge variant={proyecto.estado === 'abierto' ? 'default' : 'secondary'}>
                  {proyecto.estado}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-2">{proyecto.titulo}</h1>
              <p className="text-muted-foreground text-lg">{proyecto.descripcion}</p>
            </div>

            {isParticipante() && proyecto.estado === 'abierto' && (
              <Button onClick={() => router.push(`/dashboard/create/proposal?proyecto=${proyecto.id}`)}>
                <Plus className="mr-2 h-4 w-4" />
                Enviar Propuesta
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                Presupuesto
              </div>
              <p className="font-bold">${proyecto.presupuesto_minimo} - ${proyecto.presupuesto_maximo}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                Tiempo Máximo
              </div>
              <p className="font-bold">{proyecto.tiempo_estimado} días</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                Fecha Límite
              </div>
              <p className="font-bold">{new Date(proyecto.fecha_limite).toLocaleDateString()}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Rocket className="h-4 w-4" />
                Propuestas
              </div>
              <p className="font-bold">{proyecto.propuestas?.length || 0}</p>
            </Card>
          </div>
        </div>

        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Criterios de Evaluación
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Funcionalidad</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-secondary h-2 rounded-full">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${proyecto.funcionalidad * 10}%` }}
                  />
                </div>
                <span className="font-bold">{proyecto.funcionalidad}/10</span>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Usabilidad</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-secondary h-2 rounded-full">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${proyecto.usabilidad * 10}%` }}
                  />
                </div>
                <span className="font-bold">{proyecto.usabilidad}/10</span>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Alcance</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-secondary h-2 rounded-full">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${proyecto.alcance * 10}%` }}
                  />
                </div>
                <span className="font-bold">{proyecto.alcance}/10</span>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Presupuesto</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-secondary h-2 rounded-full">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${proyecto.presupuesto_estimado * 10}%` }}
                  />
                </div>
                <span className="font-bold">{proyecto.presupuesto_estimado}/10</span>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Escalabilidad</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-secondary h-2 rounded-full">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${proyecto.escalabilidad * 10}%` }}
                  />
                </div>
                <span className="font-bold">{proyecto.escalabilidad}/10</span>
              </div>
            </div>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="propuestas">
              Todas las Propuestas
            </TabsTrigger>
            {isCliente() && (
              <>
                <TabsTrigger value="filtro1">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtro 1: Colores
                </TabsTrigger>
                <TabsTrigger value="filtro2">
                  <Star className="mr-2 h-4 w-4" />
                  Filtro 2: Calificación
                </TabsTrigger>
                <TabsTrigger value="filtro3">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Filtro 3: Estratégico
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="propuestas" className="mt-6">
            {proyecto.propuestas && proyecto.propuestas.length > 0 ? (
              <div className="grid gap-6">
                {proyecto.propuestas.map((propuesta) => (
                  <Card key={propuesta.id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{propuesta.titulo}</h3>
                        <p className="text-muted-foreground mb-4">{propuesta.descripcion}</p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(propuesta.id)}
                          >
                            <Heart className="mr-1 h-4 w-4" />
                            {propuesta.likes_count}
                          </Button>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {propuesta.comentarios_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${propuesta.presupuesto}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {propuesta.tiempo_entrega} días
                          </span>
                        </div>
                      </div>

                      {isCliente() && (
                        <Button onClick={() => setSelectedPropuesta(propuesta)}>
                          Ver Detalles
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No hay propuestas aún</p>
              </Card>
            )}
          </TabsContent>

          {isCliente() && (
            <TabsContent value="filtro1" className="mt-6">
              {proyecto.estadisticas_filtro1 && (
                <Card className="p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Distribución por Colores</h3>
                  <div className="flex gap-4 flex-wrap">
                    <Badge className="bg-green-500 text-white">
                      🟢 Verde: {proyecto.estadisticas_filtro1.verde}
                    </Badge>
                    <Badge className="bg-blue-500 text-white">
                      🔵 Azul: {proyecto.estadisticas_filtro1.azul}
                    </Badge>
                    <Badge className="bg-yellow-500 text-black">
                      🟡 Amarillo: {proyecto.estadisticas_filtro1.amarillo}
                    </Badge>
                    <Badge className="bg-orange-500 text-white">
                      🟠 Naranja: {proyecto.estadisticas_filtro1.naranja}
                    </Badge>
                    <Badge className="bg-red-500 text-white">
                      🔴 Rojo: {proyecto.estadisticas_filtro1.rojo}
                    </Badge>
                  </div>
                </Card>
              )}

              <div className="grid gap-6">
                {proyecto.propuestas?.map((propuesta) => (
                  <Card key={propuesta.id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          {getColorBadge(propuesta.color)}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{propuesta.titulo}</h3>
                        <p className="text-muted-foreground mb-4">{propuesta.descripcion}</p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {propuesta.likes_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${propuesta.presupuesto}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {propuesta.tiempo_entrega} días
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}

          {isCliente() && (
            <TabsContent value="filtro2" className="mt-6">
              <div className="grid gap-6">
                {proyecto.propuestas
                  ?.filter(p => ['verde', 'azul', 'amarillo'].includes(p.color || ''))
                  .map((propuesta) => (
                    <Card key={propuesta.id} className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            {getColorBadge(propuesta.color)}
                            {propuesta.calificacion_manual && (
                              <Badge variant="secondary">
                                ⭐ {propuesta.calificacion_manual.puntaje_total}/19 pts
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-xl font-bold mb-2">{propuesta.titulo}</h3>
                          
                          {propuesta.calificacion_manual ? (
                            <div className="grid grid-cols-4 gap-4 mt-4">
                              <div>
                                <Label className="text-xs">Deseable</Label>
                                <p className="font-bold">{propuesta.calificacion_manual.deseable}/5</p>
                              </div>
                              <div>
                                <Label className="text-xs">Factible</Label>
                                <p className="font-bold">{propuesta.calificacion_manual.factible}/5</p>
                              </div>
                              <div>
                                <Label className="text-xs">Costo</Label>
                                <p className="font-bold">{propuesta.calificacion_manual.costo}/4</p>
                              </div>
                              <div>
                                <Label className="text-xs">Beneficio</Label>
                                <p className="font-bold">{propuesta.calificacion_manual.beneficio}/5</p>
                              </div>
                            </div>
                          ) : (
                            <Button
                              onClick={() => setSelectedPropuesta(propuesta)}
                              variant="outline"
                            >
                              Calificar Propuesta
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          )}

          {isCliente() && (
            <TabsContent value="filtro3" className="mt-6">
              <div className="grid gap-6">
                {proyecto.propuestas
                  ?.filter(p => p.calificacion_manual)
                  .sort((a, b) => 
                    (b.calificacion_manual?.puntaje_total || 0) - 
                    (a.calificacion_manual?.puntaje_total || 0)
                  )
                  .map((propuesta) => (
                    <Card key={propuesta.id} className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            {getColorBadge(propuesta.color)}
                            <Badge variant="secondary">
                              ⭐ {propuesta.calificacion_manual?.puntaje_total}/19 pts
                            </Badge>
                            {propuesta.evaluacion_estrategica && (
                              <Badge>
                                {propuesta.evaluacion_estrategica.decision === 'guardar_futuro' && '📌 Guardado'}
                                {propuesta.evaluacion_estrategica.decision === 'agendar_reunion' && '📅 Reunión'}
                                {propuesta.evaluacion_estrategica.decision === 'posponer' && '⏸️ Pospuesto'}
                              </Badge>
                            )}
                          </div>
                          
                          <h3 className="text-xl font-bold mb-2">{propuesta.titulo}</h3>
                          
                          {propuesta.evaluacion_estrategica ? (
                            <div className="mt-4 p-4 bg-secondary rounded-lg">
                              <div className="grid grid-cols-2 gap-4 mb-2">
                                <div>
                                  <Label className="text-xs">Estratégico</Label>
                                  <p>{propuesta.evaluacion_estrategica.es_estrategico ? '✅ Sí' : '❌ No'}</p>
                                </div>
                                <div>
                                  <Label className="text-xs">Tiempo Indicado</Label>
                                  <p>{propuesta.evaluacion_estrategica.es_tiempo_indicado ? '✅ Sí' : '❌ No'}</p>
                                </div>
                              </div>
                              {propuesta.evaluacion_estrategica.justificacion && (
                                <div className="mt-2">
                                  <Label className="text-xs">Justificación</Label>
                                  <p className="text-sm">{propuesta.evaluacion_estrategica.justificacion}</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <Button
                              onClick={() => setSelectedPropuesta(propuesta)}
                              variant="outline"
                            >
                              Evaluar Estratégicamente
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          )}
        </Tabs>

        {selectedPropuesta && !selectedPropuesta.calificacion_manual && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-4">Calificar: {selectedPropuesta.titulo}</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <Label>Deseable (1-5)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={formCalificacion.deseable}
                    onChange={(e) => setFormCalificacion(prev => ({
                      ...prev,
                      deseable: parseInt(e.target.value)
                    }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ¿Qué tanto deseas esta solución?
                  </p>
                </div>

                <div>
                  <Label>Factible (1-5)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={formCalificacion.factible}
                    onChange={(e) => setFormCalificacion(prev => ({
                      ...prev,
                      factible: parseInt(e.target.value)
                    }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ¿Qué tan factible es implementarla?
                  </p>
                </div>

                <div>
                  <Label>Costo (1-4)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="4"
                    value={formCalificacion.costo}
                    onChange={(e) => setFormCalificacion(prev => ({
                      ...prev,
                      costo: parseInt(e.target.value)
                    }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    1=Muy costoso, 4=Muy económico
                  </p>
                </div>

                <div>
                  <Label>Beneficio (1-5)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={formCalificacion.beneficio}
                    onChange={(e) => setFormCalificacion(prev => ({
                      ...prev,
                      beneficio: parseInt(e.target.value)
                    }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ¿Qué tanto beneficio traerá?
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPropuesta(null)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleCalificar(selectedPropuesta.id)}
                  disabled={!!calificando}
                  className="flex-1"
                >
                  {calificando ? 'Guardando...' : 'Guardar Calificación'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {selectedPropuesta && selectedPropuesta.calificacion_manual && !selectedPropuesta.evaluacion_estrategica && !agendandoReunion && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-4">Evaluación Estratégica: {selectedPropuesta.titulo}</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    id="es_estrategico"
                    checked={formEvaluacion.es_estrategico}
                    onChange={(e) => setFormEvaluacion(prev => ({
                      ...prev,
                      es_estrategico: e.target.checked
                    }))}
                    className="w-5 h-5"
                  />
                  <Label htmlFor="es_estrategico" className="text-base">
                    ¿Es estratégico para la empresa?
                  </Label>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    id="es_tiempo_indicado"
                    checked={formEvaluacion.es_tiempo_indicado}
                    onChange={(e) => setFormEvaluacion(prev => ({
                      ...prev,
                      es_tiempo_indicado: e.target.checked
                    }))}
                    className="w-5 h-5"
                  />
                  <Label htmlFor="es_tiempo_indicado" className="text-base">
                    ¿Es el tiempo indicado?
                  </Label>
                </div>

                <div>
                  <Label>Decisión Final</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={formEvaluacion.decision}
                    onChange={(e) => setFormEvaluacion(prev => ({
                      ...prev,
                      decision: e.target.value
                    }))}
                  >
                    <option value="guardar_futuro">📌 Guardar para el futuro</option>
                    <option value="agendar_reunion">📅 Agendar reunión</option>
                    <option value="posponer">⏸️ Posponer</option>
                  </select>
                </div>

                <div>
                  <Label>Justificación (Opcional)</Label>
                  <Textarea
                    value={formEvaluacion.justificacion}
                    onChange={(e) => setFormEvaluacion(prev => ({
                      ...prev,
                      justificacion: e.target.value
                    }))}
                    rows={4}
                    placeholder="Explica tu decisión..."
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPropuesta(null)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleEvaluar(selectedPropuesta.id)}
                  disabled={!!evaluando}
                  className="flex-1"
                >
                  {evaluando ? 'Guardando...' : 'Guardar Evaluación'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {agendandoReunion && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-4">Agendar Reunión</h3>
              
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fecha</Label>
                    <Input
                      type="date"
                      value={formReunion.fecha}
                      onChange={(e) => setFormReunion(prev => ({
                        ...prev,
                        fecha: e.target.value
                      }))}
                      required
                    />
                  </div>

                  <div>
                    <Label>Hora</Label>
                    <Input
                      type="time"
                      value={formReunion.hora}
                      onChange={(e) => setFormReunion(prev => ({
                        ...prev,
                        hora: e.target.value
                      }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Duración (minutos)</Label>
                  <Input
                    type="number"
                    min="15"
                    step="15"
                    value={formReunion.duracion}
                    onChange={(e) => setFormReunion(prev => ({
                      ...prev,
                      duracion: e.target.value
                    }))}
                    required
                  />
                </div>

                <div>
                  <Label>Lugar</Label>
                  <Input
                    value={formReunion.lugar}
                    onChange={(e) => setFormReunion(prev => ({
                      ...prev,
                      lugar: e.target.value
                    }))}
                    placeholder="Oficina, Zoom, Google Meet..."
                    required
                  />
                </div>

                <div>
                  <Label>Descripción</Label>
                  <Textarea
                    value={formReunion.descripcion}
                    onChange={(e) => setFormReunion(prev => ({
                      ...prev,
                      descripcion: e.target.value
                    }))}
                    rows={3}
                    placeholder="Agenda de la reunión..."
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAgendandoReunion(null);
                    setSelectedPropuesta(null);
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAgendarReunion}
                  className="flex-1"
                >
                  Agendar Reunión
                </Button>
              </div>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  );
}