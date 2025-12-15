'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { AuthLayout } from '@/components/auth-layout';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import type { RegisterData } from '@/lib/api';

export default function RegisterPage() {
  const { register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState<RegisterData>({
    nombre: '',
    email: '',
    password: '',
    password_confirmation: '',
    telefono: '',
    tipo_usuario: 'participante',
    // Campos opcionales
    empresa: '',
    cargo: '',
    industria: '',
    profesion: '',
    biografia: '',
  });

  const handleChange = (field: keyof RegisterData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (formData.password !== formData.password_confirmation) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: 'Error',
        description: 'La contraseña debe tener al menos 8 caracteres',
        variant: 'destructive',
      });
      return;
    }

    // Validar campos requeridos según tipo de usuario
    if ((formData.tipo_usuario === 'cliente' || formData.tipo_usuario === 'ambos') && !formData.empresa) {
      toast({
        title: 'Error',
        description: 'El nombre de la empresa es requerido para clientes',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    console.log('🔵 Registrando usuario...', formData);

    try {
      // ✅ Limpiar campos vacíos antes de enviar
      const cleanData: RegisterData = {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        tipo_usuario: formData.tipo_usuario,
      };

      // Agregar campos opcionales solo si tienen valor
      if (formData.telefono) cleanData.telefono = formData.telefono;
      if (formData.empresa) cleanData.empresa = formData.empresa;
      if (formData.cargo) cleanData.cargo = formData.cargo;
      if (formData.industria) cleanData.industria = formData.industria;
      if (formData.profesion) cleanData.profesion = formData.profesion;
      if (formData.biografia) cleanData.biografia = formData.biografia;

      await register(cleanData);
      
      toast({
        title: '¡Registro exitoso!',
        description: 'Revisa tu email para verificar tu cuenta.',
      });
    } catch (error: any) {
      console.error('🔴 Error en registro:', error);
      toast({
        title: 'Error en el registro',
        description: error.message || 'No se pudo completar el registro',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crear una cuenta"
      subtitle="Únete a nuestra comunidad de innovación"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre completo *</Label>
          <Input
            id="nombre"
            placeholder="Juan Pérez"
            required
            value={formData.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            className="h-12 rounded-xl bg-background/50"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico *</Label>
          <Input
            id="email"
            type="email"
            placeholder="ejemplo@correo.com"
            required
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="h-12 rounded-xl bg-background/50"
          />
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono (opcional)</Label>
          <Input
            id="telefono"
            type="tel"
            placeholder="+591 12345678"
            value={formData.telefono}
            onChange={(e) => handleChange('telefono', e.target.value)}
            className="h-12 rounded-xl bg-background/50"
          />
        </div>

        {/* Contraseña */}
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="h-12 rounded-xl bg-background/50 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Mínimo 8 caracteres
          </p>
        </div>

        {/* Confirmar contraseña */}
        <div className="space-y-2">
          <Label htmlFor="password_confirmation">Confirmar contraseña *</Label>
          <div className="relative">
            <Input
              id="password_confirmation"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              value={formData.password_confirmation}
              onChange={(e) => handleChange('password_confirmation', e.target.value)}
              className="h-12 rounded-xl bg-background/50 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tipo de usuario */}
        <div className="space-y-2">
          <Label>¿Cómo quieres usar la plataforma? *</Label>
          <RadioGroup
            value={formData.tipo_usuario}
            onValueChange={(value) => handleChange('tipo_usuario', value as 'cliente' | 'participante' | 'ambos')}
          >
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="cliente" id="cliente" />
              <Label htmlFor="cliente" className="cursor-pointer flex-1">
                <div className="font-medium">Cliente</div>
                <div className="text-xs text-muted-foreground">Publicar proyectos e ideaciones</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="participante" id="participante" />
              <Label htmlFor="participante" className="cursor-pointer flex-1">
                <div className="font-medium">Participante</div>
                <div className="text-xs text-muted-foreground">Proponer ideas y soluciones</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="ambos" id="ambos" />
              <Label htmlFor="ambos" className="cursor-pointer flex-1">
                <div className="font-medium">Ambos</div>
                <div className="text-xs text-muted-foreground">Publicar y participar</div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Campos de Cliente */}
        {(formData.tipo_usuario === 'cliente' || formData.tipo_usuario === 'ambos') && (
          <div className="space-y-4 p-4 bg-secondary/20 rounded-xl">
            <h3 className="font-semibold">Información de Empresa</h3>
            
            <div className="space-y-2">
              <Label htmlFor="empresa">Nombre de la empresa *</Label>
              <Input
                id="empresa"
                placeholder="TechCorp S.A."
                required
                value={formData.empresa}
                onChange={(e) => handleChange('empresa', e.target.value)}
                className="h-12 rounded-xl bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo (opcional)</Label>
              <Input
                id="cargo"
                placeholder="CEO, Director de Innovación..."
                value={formData.cargo}
                onChange={(e) => handleChange('cargo', e.target.value)}
                className="h-12 rounded-xl bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industria">Industria (opcional)</Label>
              <Input
                id="industria"
                placeholder="Tecnología, Salud, Educación..."
                value={formData.industria}
                onChange={(e) => handleChange('industria', e.target.value)}
                className="h-12 rounded-xl bg-background/50"
              />
            </div>
          </div>
        )}

        {/* Campos de Participante */}
        {(formData.tipo_usuario === 'participante' || formData.tipo_usuario === 'ambos') && (
          <div className="space-y-4 p-4 bg-secondary/20 rounded-xl">
            <h3 className="font-semibold">Información Profesional</h3>
            
            <div className="space-y-2">
              <Label htmlFor="profesion">Profesión (opcional)</Label>
              <Input
                id="profesion"
                placeholder="Desarrollador Full Stack, Diseñador UX/UI..."
                value={formData.profesion}
                onChange={(e) => handleChange('profesion', e.target.value)}
                className="h-12 rounded-xl bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="biografia">Biografía profesional (opcional)</Label>
              <Textarea
                id="biografia"
                placeholder="Describe tu experiencia y habilidades..."
                value={formData.biografia}
                onChange={(e) => handleChange('biografia', e.target.value)}
                className="rounded-xl bg-background/50 min-h-[100px]"
              />
            </div>
          </div>
        )}

        {/* Botón de envío */}
        <Button
          type="submit"
          className="w-full h-12 text-lg rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Registrando...
            </>
          ) : (
            'Crear Cuenta'
          )}
        </Button>

        {/* Link a login */}
        <div className="text-center text-sm text-muted-foreground pt-2">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Inicia sesión aquí
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
