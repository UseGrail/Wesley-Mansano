import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy } from 'lucide-react';

export default function Login() {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
        setIsLogin(true); // Switch to login after successful signup
      }
    } catch (err: any) {
      if (err.message === 'Email not confirmed') {
        setError('E-mail não confirmado. Verifique sua caixa de entrada ou desative "Confirm email" no painel do Supabase em Authentication > Providers > Email.');
      } else if (err.message === 'Invalid login credentials') {
        setError('Credenciais inválidas. Verifique seu e-mail e senha.');
      } else {
        setError(err.message || 'Ocorreu um erro');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-dark text-white p-4">
      <div className="text-center p-8 glass-card w-full max-w-sm">
        <div className="w-20 h-20 rounded-3xl gold-gradient flex items-center justify-center shadow-xl mx-auto mb-6">
          <Trophy className="text-primary-dark w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Copa do Mundo 2026</h1>
        <p className="text-white/60 mb-8">A Copa da Nossa Família</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu E-mail"
            className="px-4 py-3 bg-white text-gray-900 placeholder-gray-500 rounded-xl outline-none focus:ring-2 focus:ring-world-gold"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua Senha"
            className="px-4 py-3 bg-white text-gray-900 placeholder-gray-500 rounded-xl outline-none focus:ring-2 focus:ring-world-gold"
            required
          />
          
          {error && <p className="text-red-400 text-sm">{error}</p>}
          
          <button 
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-world-gold text-primary-dark font-bold rounded-xl hover:bg-opacity-90 transition-all font-display disabled:opacity-50"
          >
            {isLoading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <button 
          type="button" 
          onClick={() => setIsLogin(!isLogin)} 
          className="text-white/50 hover:text-white text-sm underline"
        >
          {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
        </button>
      </div>
    </div>
  );
}
