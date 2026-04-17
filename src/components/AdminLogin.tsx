import React, { useState } from 'react';
import { Lock, Key, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user.email === 'abdimorales2007@gmail.com') {
        onLogin();
      } else {
        setError('Este correo no tiene permisos de administrador.');
        await auth.signOut();
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      setError('Error al iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center mesh-gradient px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-12 rounded-[40px] shadow-2xl text-center border-8 border-white"
      >
        <div className="w-24 h-24 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <Lock size={40} className="text-terracotta" />
        </div>
        <h2 className="text-4xl font-serif text-brown-dark mb-4">Acceso Admin</h2>
        <p className="text-brown-dark/60 mb-10 leading-relaxed">
          Usa tu cuenta de Google autorizada para entrar al panel.
        </p>
        
        <div className="space-y-6">
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-xl"
            >
              {error}
            </motion.p>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-brown-dark/10 hover:border-terracotta p-6 rounded-2xl transition-all duration-300 group shadow-sm hover:shadow-md"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-8 h-8" />
            <span className="text-brown-dark text-xl font-medium group-hover:text-terracotta">Entrar con Google</span>
          </button>
        </div>

        <p className="mt-12 text-xs text-brown-dark/40 italic">
          Solo personal autorizado: abdimorales2007@gmail.com
        </p>
      </motion.div>
    </div>
  );
}
