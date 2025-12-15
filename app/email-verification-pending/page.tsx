'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { authApi } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';

export default function EmailVerificationPendingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resentSuccess, setResentSuccess] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('pending_verification_email');
    if (savedEmail) {
      setEmail(savedEmail);
    } else if (user?.email) {
      setEmail(user.email);
    } else {
      router.push('/register');
    }
  }, [user, router]);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setResentSuccess(false);

    try {
      await authApi.resendVerification(email);
      setResentSuccess(true);
      setTimeout(() => setResentSuccess(false), 5000);
    } catch (error: any) {
      alert(error.message || 'Error al reenviar el email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 pl-0">
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Button>
          </Link>
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
            P8
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-8 space-y-6 bg-card/50 backdrop-blur-xl border-2 border-white/50 shadow-xl">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Mail className="h-16 w-16 text-primary" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">Verifica tu email</h1>
              <p className="text-muted-foreground">Hemos enviado un enlace de verificación a:</p>
              <p className="font-semibold text-primary">{email}</p>
            </div>

            <div className="space-y-4 bg-secondary/30 p-4 rounded-xl">
              <p className="text-sm text-muted-foreground"><strong>Pasos para verificar:</strong></p>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Revisa tu bandeja de entrada</li>
                <li>Busca el email de "Pista 8 Innovation"</li>
                <li>Haz clic en el botón "Verificar mi Email"</li>
                <li>Serás redirigido automáticamente</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-4">
                💡 <strong>Nota:</strong> Revisa también tu carpeta de spam.
              </p>
            </div>

            {resentSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/10 border border-green-500/20 text-green-600 p-4 rounded-xl text-sm text-center"
              >
                ✅ Email reenviado correctamente.
              </motion.div>
            )}

            <div className="space-y-3">
              <Button onClick={handleResend} disabled={resending} variant="outline" className="w-full">
                {resending ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Reenviando...</>
                ) : (
                  <><Mail className="w-4 h-4 mr-2" />Reenviar email</>
                )}
              </Button>

              <div className="text-center">
                <Link href="/login">
                  <Button variant="ghost" size="sm">¿Ya verificaste? Inicia sesión</Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="text-center text-sm text-muted-foreground">
          <p>¿No recibiste el email? Espera unos minutos y revisa spam.</p>
        </div>
      </div>
    </div>
  );
}