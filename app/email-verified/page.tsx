'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function EmailVerifiedPage() {
  const router = useRouter();

  useEffect(() => {
    // Limpiar localStorage
    localStorage.removeItem('pending_verification_email');
    
    // Redirigir automáticamente después de 3 segundos
    const timeout = setTimeout(() => {
      router.push('/login');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 space-y-6 bg-card/50 backdrop-blur-xl border-2 border-white/50 shadow-xl text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="p-4 bg-green-500/10 rounded-full">
                <CheckCircle className="h-20 w-20 text-green-500" />
              </div>
            </motion.div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-green-600">¡Email Verificado!</h1>
              <p className="text-muted-foreground">
                Tu cuenta ha sido activada exitosamente.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Serás redirigido al login en 3 segundos...
              </p>
              
              <Button 
                onClick={() => router.push('/login')} 
                className="w-full"
              >
                Ir al Login Ahora
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}