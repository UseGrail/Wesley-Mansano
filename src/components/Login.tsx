import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy } from 'lucide-react';

export default function Login() {
  const { signInWithGoogle } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-dark text-white">
      <div className="text-center p-8 glass-card">
         <div className="w-20 h-20 rounded-3xl gold-gradient flex items-center justify-center shadow-xl mx-auto mb-6">
            <Trophy className="text-primary-dark w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Copa do Mundo 2026</h1>
        <p className="text-white/60 mb-8">A Copa da Nossa Família</p>
        <button 
          onClick={signInWithGoogle}
          className="px-6 py-3 bg-world-gold text-primary-dark font-bold rounded-xl hover:bg-opacity-90 transition-all font-display"
        >
          Login com Google
        </button>
      </div>
    </div>
  );
}
