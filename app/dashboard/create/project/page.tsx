'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Rocket, Calendar, DollarSign, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth-provider';
import { proyectoApi, ideacionApi } from '@/lib/api';

interface IdeaSeleccionada {
  id: number;
  titulo: string;
  descripcion: string;
  votos_count: number;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isCliente, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ideasSeleccionadas, setIdeasSeleccionadas] = useState<IdeaSeleccionada[]>([]);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    nicho: '',
    presupuesto: '', // ✅ Ahora es opcional y único
    fecha_limite: '',
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!isCliente()) {
      alert('Solo los clientes pueden crear proyectos');
      router.push('/dashboard');
      return;
    }

    const ideacionId = searchParams.get('from_ideacion');
    if (ideacionId) {
      cargarIdeasSeleccionadas(ideacionId);
    }
  }, [authLoading, user, isCliente, router, searchParams]);

  const cargarIdeasSeleccionadas = async (ideacionId: string) => {
    try {
      const response = await ideacionApi.getWithFiltro(ideacionId);
      const ideasVerdes = (response.ideas || []).filter((idea: any) => idea.color === 'verde');
      setIdeasSeleccionadas(ideasVerdes);
      
      if (response.ideacion) {
        setFormData(prev => ({
          ...prev,
          titulo: response.ideacion.titulo || '',
          nicho: response.ideacion.categoria || '',
        }));
      }
    } catch (error) {
      console.error('Error al cargar ideas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Enviar datos sin criterios de evaluación
      const proyectoData: any = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        nicho: formData.nicho,
        fecha_limite: formData.fecha_limite,
        ideas_seleccionadas: ideasSeleccionadas.map(idea => idea.id),
      };

      // ✅ Solo agregar presupuesto si se proporcionó
      if (formData.presupuesto) {
        const presupuestoNum = parseFloat(formData.presupuesto);
        proyectoData.presupuesto_min = presupuestoNum;
        proyectoData.presupuesto_max = presupuestoNum;
      }

      console.log('📤 Enviando proyecto:', proyectoData);
      const response = await proyectoApi.create(proyectoData);
      console.log('📥 Respuesta del servidor:', response);
      
      // ✅ Usar el tipo correcto según api.ts
      const proyectoId = response.proyecto?.id;
      
      if (proyectoId) {
        alert('Proyecto creado exitosamente');
        router.push(`/dashboard/project/${proyectoId}`);
      } else {
        console.error('⚠️ No se pudo obtener el ID del proyecto:', response);
        alert('Proyecto creado pero no se pudo obtener el ID');
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('❌ Error al crear proyecto:', error);
      alert(error.message || 'Error al crear el proyecto');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verificando permisos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Rocket className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Crear Nuevo Proyecto</h1>
            <p className="text-muted-foreground">Define tu proyecto para recibir propuestas</p>
          </div>
        </div>

        {ideasSeleccionadas.length > 0 && (
          <Card className="p-6 mb-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-600" />
              Ideas Seleccionadas (Filtro Verde)
            </h3>
            <div className="space-y-3">
              {ideasSeleccionadas.map((idea) => (
                <div key={idea.id} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg">
                  <Badge variant="secondary" className="bg-green-500 text-white">
                    {idea.votos_count} votos
                  </Badge>
                  <div className="flex-1">
                    <h4 className="font-semibold">{idea.titulo}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{idea.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Información Básica</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título del Proyecto *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => handleChange('titulo', e.target.value)}
                  placeholder="Ej: Desarrollo de App Móvil para Delivery"
                  required
                />
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción Detallada *</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  rows={6}
                  placeholder="Describe el proyecto, objetivos, requerimientos, tecnologías preferidas..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="nicho">Nicho o Industria *</Label>
                <Input
                  id="nicho"
                  value={formData.nicho}
                  onChange={(e) => handleChange('nicho', e.target.value)}
                  placeholder="Ej: E-commerce, Salud, Educación"
                  required
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Presupuesto y Plazos
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="presupuesto">Presupuesto Estimado (USD) - Opcional</Label>
                <Input
                  id="presupuesto"
                  type="number"
                  step="0.01"
                  value={formData.presupuesto}
                  onChange={(e) => handleChange('presupuesto', e.target.value)}
                  placeholder="10000"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Si no especificas un presupuesto, los participantes lo propondrán en sus propuestas
                </p>
              </div>

              <div>
                <Label htmlFor="fecha_limite">Fecha Límite para Propuestas *</Label>
                <Input
                  id="fecha_limite"
                  type="datetime-local"
                  value={formData.fecha_limite}
                  onChange={(e) => handleChange('fecha_limite', e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Los participantes podrán enviar propuestas hasta esta fecha
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Sobre los Criterios de Evaluación</h3>
                <p className="text-sm text-muted-foreground">
                  Los criterios de evaluación (funcionalidad, usabilidad, escalabilidad, etc.) 
                  se configurarán después de crear el proyecto, cuando comiences a revisar las 
                  propuestas recibidas. Esto te permitirá ajustar los criterios según las 
                  propuestas que recibas.
                </p>
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creando...' : 'Crear Proyecto'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}