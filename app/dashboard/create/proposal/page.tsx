'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { proyectoApi, propuestaApi, type Proyecto } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';

export default function CreateProposalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isParticipante, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [selectedProyecto, setSelectedProyecto] = useState<Proyecto | null>(null);
  
  const [formData, setFormData] = useState({
    proyecto_id: '',
    titulo: '',
    descripcion: '',
    presupuesto_propuesto: '',
    tiempo_estimado: '',
    tecnologias: '',
    metodologia: '',
    equipo_requerido: '',
    riesgos: '',
    beneficios: '',
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!isParticipante()) {
      alert('Solo los participantes pueden crear propuestas');
      router.push('/dashboard');
      return;
    }

    fetchProyectos();
    
    const proyectoId = searchParams.get('proyecto');
    if (proyectoId) {
      setFormData(prev => ({ ...prev, proyecto_id: proyectoId }));
    }
  }, [authLoading, user, isParticipante, router, searchParams]);

  useEffect(() => {
    if (formData.proyecto_id) {
      const proyecto = proyectos.find(p => p.id.toString() === formData.proyecto_id);
      setSelectedProyecto(proyecto || null);
    }
  }, [formData.proyecto_id, proyectos]);

  const fetchProyectos = async () => {
    try {
      const response = await proyectoApi.getAll();
      const proyectosAbiertos = (response.proyectos || []).filter(
        (p) => p.estado === 'abierto'
      );
      setProyectos(proyectosAbiertos);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        presupuesto: parseFloat(formData.presupuesto_propuesto),
        tiempo_entrega: parseInt(formData.tiempo_estimado),
        tecnologias: formData.tecnologias,
        metodologia: formData.metodologia,
        equipo_requerido: formData.equipo_requerido,
        riesgos: formData.riesgos,
        beneficios: formData.beneficios,
      };

      await propuestaApi.create(formData.proyecto_id, payload);
      alert('Propuesta enviada exitosamente');
      router.push(`/dashboard/project/${formData.proyecto_id}`);
    } catch (error: any) {
      console.error('Error al crear propuesta:', error);
      alert('Error al crear la propuesta');
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
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Crear Nueva Propuesta</h1>
        <p className="text-muted-foreground mb-8">
          Propón tu solución innovadora para un proyecto existente
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Proyecto Objetivo</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="proyecto_id">Selecciona el Proyecto *</Label>
                <Select 
                  value={formData.proyecto_id} 
                  onValueChange={(value) => handleChange('proyecto_id', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elige un proyecto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {proyectos.map(proyecto => (
                      <SelectItem key={proyecto.id} value={proyecto.id.toString()}>
                        {proyecto.titulo} - {proyecto.cliente.user.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProyecto && (
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">{selectedProyecto.titulo}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{selectedProyecto.descripcion}</p>
                  {selectedProyecto.presupuesto_minimo && selectedProyecto.presupuesto_maximo && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4" />
                      <span>Presupuesto: ${selectedProyecto.presupuesto_minimo.toLocaleString()} - ${selectedProyecto.presupuesto_maximo.toLocaleString()} USD</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Información de la Propuesta</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título de la Propuesta *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => handleChange('titulo', e.target.value)}
                  placeholder="Ej: Sistema ERP con IA y Machine Learning"
                  required
                />
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción General *</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  placeholder="Describe tu propuesta de solución, cómo aborda los requisitos del proyecto..."
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="presupuesto_propuesto">Presupuesto Propuesto (USD) *</Label>
                  <Input
                    id="presupuesto_propuesto"
                    type="number"
                    step="0.01"
                    value={formData.presupuesto_propuesto}
                    onChange={(e) => handleChange('presupuesto_propuesto', e.target.value)}
                    placeholder="8500"
                    required
                  />
                  {selectedProyecto && selectedProyecto.presupuesto_minimo && selectedProyecto.presupuesto_maximo && formData.presupuesto_propuesto && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {parseFloat(formData.presupuesto_propuesto) >= selectedProyecto.presupuesto_minimo &&
                       parseFloat(formData.presupuesto_propuesto) <= selectedProyecto.presupuesto_maximo
                        ? '✅ Dentro del presupuesto'
                        : '⚠️ Fuera del rango del presupuesto'}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="tiempo_estimado">Tiempo Estimado (días) *</Label>
                  <Input
                    id="tiempo_estimado"
                    type="number"
                    value={formData.tiempo_estimado}
                    onChange={(e) => handleChange('tiempo_estimado', e.target.value)}
                    placeholder="Ej: 120"
                    required
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Detalles Técnicos</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="tecnologias">Tecnologías a Utilizar *</Label>
                <Textarea
                  id="tecnologias"
                  value={formData.tecnologias}
                  onChange={(e) => handleChange('tecnologias', e.target.value)}
                  placeholder="Ej: React, Node.js, PostgreSQL, AWS, Docker..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="metodologia">Metodología de Trabajo *</Label>
                <Textarea
                  id="metodologia"
                  value={formData.metodologia}
                  onChange={(e) => handleChange('metodologia', e.target.value)}
                  placeholder="Ej: Desarrollo ágil con sprints de 2 semanas, daily standups..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="equipo_requerido">Equipo Requerido *</Label>
                <Textarea
                  id="equipo_requerido"
                  value={formData.equipo_requerido}
                  onChange={(e) => handleChange('equipo_requerido', e.target.value)}
                  placeholder="Ej: 2 desarrolladores full-stack, 1 diseñador UX/UI, 1 QA..."
                  rows={3}
                  required
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Análisis</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="riesgos">Riesgos Identificados *</Label>
                <Textarea
                  id="riesgos"
                  value={formData.riesgos}
                  onChange={(e) => handleChange('riesgos', e.target.value)}
                  placeholder="Describe los posibles riesgos y cómo los mitigarías..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="beneficios">Beneficios Esperados *</Label>
                <Textarea
                  id="beneficios"
                  value={formData.beneficios}
                  onChange={(e) => handleChange('beneficios', e.target.value)}
                  placeholder="Describe los beneficios y el valor que aportará esta solución..."
                  rows={3}
                  required
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading || !formData.proyecto_id}
              className="flex-1"
            >
              {loading ? 'Enviando...' : 'Enviar Propuesta'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}