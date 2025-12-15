'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Camera, Save, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { authApi, uploadApi } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, isCliente, isParticipante, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    // Cliente
    empresa: '',
    cargo: '',
    industria: '',
    // Participante
    profesion: '',
    biografia: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  // ✅ Verificar autenticación
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Cargar datos del usuario
    setFormData({
      nombre: user.nombre || '',
      email: user.email || '',
      telefono: user.telefono || '',
      empresa: user.perfilCliente?.empresa || '',
      cargo: user.perfilCliente?.cargo || '',
      industria: user.perfilCliente?.industria || '',
      profesion: user.perfilParticipante?.profesion || '',
      biografia: user.perfilParticipante?.biografia || '',
    });
    setPreviewUrl(user.avatar || '');
  }, [authLoading, user, router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Subir avatar si hay uno nuevo
      if (avatarFile) {
        await uploadApi.avatar(avatarFile);
      }

      // Actualizar perfil
      await authApi.updateProfile(formData as any);
      
      // Obtener usuario actualizado
      const updatedUser = await authApi.me();
      updateUser(updatedUser.user);
      
      alert('Perfil actualizado correctamente');
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      alert(error.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await authApi.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirmation: passwordData.new_password_confirmation,
      });
      
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
      
      alert('Contraseña actualizada correctamente');
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      alert(error.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const getRoleBadge = (role: { nombre: string }) => {
    const badges: Record<string, React.ReactElement> = {
      cliente: <Badge key="cliente" variant="secondary">🏢 Cliente</Badge>,
      participante: <Badge key="participante" variant="secondary">👨‍💻 Participante</Badge>,
      administrador: <Badge key="admin" variant="secondary">👑 Admin</Badge>,
    };
    return badges[role.nombre] || <Badge key={role.nombre}>{role.nombre}</Badge>;
  };

  // ✅ Loading state
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ No mostrar nada si no hay usuario
  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

        {/* Avatar y Roles */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewUrl} />
                <AvatarFallback className="text-2xl">
                  {user.nombre?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90"
              >
                <Camera className="h-4 w-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{user.nombre}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex gap-2 mt-2">
                {user.roles?.map(role => getRoleBadge(role))}
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Información Personal</TabsTrigger>
            <TabsTrigger value="password">Cambiar Contraseña</TabsTrigger>
          </TabsList>

          {/* Tab: Información Personal */}
          <TabsContent value="info">
            <form onSubmit={handleSubmitInfo} className="space-y-6">
              {/* Datos Generales */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Datos Generales</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nombre">Nombre Completo *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => handleChange('nombre', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Correo Electrónico *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => handleChange('telefono', e.target.value)}
                      placeholder="+591 12345678"
                    />
                  </div>
                </div>
              </Card>

              {/* Datos de Cliente */}
              {isCliente() && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Información de Empresa</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="empresa">Nombre de la Empresa *</Label>
                      <Input
                        id="empresa"
                        value={formData.empresa}
                        onChange={(e) => handleChange('empresa', e.target.value)}
                        placeholder="Ej: TechCorp S.A."
                      />
                    </div>

                    <div>
                      <Label htmlFor="cargo">Cargo</Label>
                      <Input
                        id="cargo"
                        value={formData.cargo}
                        onChange={(e) => handleChange('cargo', e.target.value)}
                        placeholder="Ej: CEO, Director de Innovación..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="industria">Industria/Sector</Label>
                      <Input
                        id="industria"
                        value={formData.industria}
                        onChange={(e) => handleChange('industria', e.target.value)}
                        placeholder="Ej: Tecnología, Salud, Educación..."
                      />
                    </div>
                  </div>
                </Card>
              )}

              {/* Datos de Participante */}
              {isParticipante() && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Información Profesional</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="profesion">Profesión</Label>
                      <Input
                        id="profesion"
                        value={formData.profesion}
                        onChange={(e) => handleChange('profesion', e.target.value)}
                        placeholder="Ej: Desarrollador Full Stack, Diseñador UX/UI..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="biografia">Biografía Profesional</Label>
                      <Textarea
                        id="biografia"
                        value={formData.biografia}
                        onChange={(e) => handleChange('biografia', e.target.value)}
                        rows={5}
                        placeholder="Describe tu experiencia, habilidades y logros profesionales..."
                      />
                    </div>
                  </div>
                </Card>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </form>
          </TabsContent>

          {/* Tab: Cambiar Contraseña */}
          <TabsContent value="password">
            <Card className="p-6">
              <form onSubmit={handleSubmitPassword} className="space-y-4">
                <div>
                  <Label htmlFor="current_password">Contraseña Actual *</Label>
                  <Input
                    id="current_password"
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => handlePasswordChange('current_password', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="new_password">Nueva Contraseña *</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Mínimo 8 caracteres, debe incluir mayúsculas, minúsculas, números y símbolos
                  </p>
                </div>

                <div>
                  <Label htmlFor="new_password_confirmation">Confirmar Nueva Contraseña *</Label>
                  <Input
                    id="new_password_confirmation"
                    type="password"
                    value={passwordData.new_password_confirmation}
                    onChange={(e) => handlePasswordChange('new_password_confirmation', e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  <Lock className="mr-2 h-4 w-4" />
                  {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
