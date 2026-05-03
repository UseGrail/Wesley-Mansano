import React from 'react';
import { Settings as SettingsIcon, User, Moon, Trash2, Globe, ShieldCheck, Info, LogOut } from 'lucide-react';
import { CollectionData } from '../types';
import { useAuth } from '../context/AuthContext';

interface SettingsProps {
  data: CollectionData;
  setData: (data: CollectionData) => void;
}

const Settings: React.FC<SettingsProps> = ({ data, setData }) => {
  const { logOut } = useAuth();
  const updateSettings = (updates: Partial<CollectionData['settings']>) => {
    setData({
      ...data,
      settings: { ...data.settings, ...updates }
    });
  };

  const resetData = () => {
    if (confirm('ATENÇÃO: Isso apagará TODOS os seus dados e resetará a coleção. Esta ação não pode ser desfeita. Tem certeza?')) {
      if (confirm('CONFIRMAÇÃO FINAL: Tem certeza mesmo que deseja resetar tudo?')) {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="font-display font-bold text-3xl text-primary-dark">Configurações</h2>
        <p className="text-gray-500">Personalize sua experiência no álbum.</p>
      </div>

      <div className="space-y-6">
        {/* Account */}
        <section className="glass-card p-6">
           <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
            <User className="text-primary-blue" size={20} />
            Conta
          </h3>
          <button 
            onClick={logOut}
            className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 transition-all font-display"
          >
            <LogOut size={18} />
            Sair da conta
          </button>
        </section>

        {/* Profile */}
        <section className="glass-card p-6">
          <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
            <User className="text-primary-blue" size={20} />
            Perfil & Álbum
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Nome do Colecionador</label>
              <input 
                type="text" 
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-primary-blue/20"
                value={data.ownerName}
                onChange={(e) => setData({ ...data, ownerName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Título do Álbum</label>
              <input 
                type="text" 
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-primary-blue/20"
                value={data.albumName}
                onChange={(e) => setData({ ...data, albumName: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="glass-card p-6">
          <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
            <Globe className="text-primary-blue" size={20} />
            Preferências
          </h3>
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
               <div>
                 <p className="font-bold">Modo Escuro</p>
                 <p className="text-xs text-gray-400">Ativa o tema escuro em todo o app.</p>
               </div>
               <button 
                 onClick={() => updateSettings({ darkMode: !data.settings.darkMode })}
                 className={`w-12 h-6 rounded-full relative transition-colors ${data.settings.darkMode ? 'bg-world-green' : 'bg-gray-300'}`}
               >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${data.settings.darkMode ? 'right-1' : 'left-1'}`}></div>
               </button>
             </div>

             <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
               <div>
                 <p className="font-bold">Animações</p>
                 <p className="text-xs text-gray-400">Ativa transições e efeitos visuais.</p>
               </div>
               <button 
                 onClick={() => updateSettings({ animationsEnabled: !data.settings.animationsEnabled })}
                 className={`w-12 h-6 rounded-full relative transition-colors ${data.settings.animationsEnabled ? 'bg-world-green' : 'bg-gray-300'}`}
               >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${data.settings.animationsEnabled ? 'right-1' : 'left-1'}`}></div>
               </button>
             </div>

             <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
               <div>
                 <p className="font-bold">Rótulo das Equipes</p>
                 <p className="text-xs text-gray-400">Como você prefere chamar as equipes?</p>
               </div>
               <select 
                 className="p-2 bg-white rounded-lg border border-gray-200 font-bold text-sm"
                 value={data.settings.teamLabel}
                 onChange={(e) => updateSettings({ teamLabel: e.target.value as any })}
               >
                 <option value="Seleções">Seleções</option>
                 <option value="Times">Times</option>
                 <option value="Clubes">Clubes</option>
               </select>
             </div>
          </div>
        </section>

        {/* Security */}
        <section className="glass-card p-6 border-red-100">
          <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2 text-world-red">
            <Trash2 size={20} />
            Zona de Perigo
          </h3>
          <div className="p-4 bg-red-50 rounded-2xl flex flex-col items-start gap-4">
             <div className="flex gap-4">
                <ShieldCheck className="text-red-500 flex-shrink-0" size={24} />
                <div>
                   <p className="font-bold text-red-900">Limpar Todos os Dados</p>
                   <p className="text-sm text-red-700">Isso apagará permanentemente todas as suas figurinhas, times e transações registradas. Não há volta.</p>
                </div>
             </div>
             <button 
              onClick={resetData}
              className="px-6 py-3 bg-world-red text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/10"
             >
               Resetar Minha Coleção
             </button>
          </div>
        </section>

        <div className="text-center pt-8">
           <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Meu Álbum 2026 • Versão 1.0.0 Premium</p>
           <p className="text-[10px] text-gray-300 mt-1">Desenvolvido com excelência para colecionadores de elite.</p>
        </div>
<div className="animate-in fade-in slide-in-from-bottom-4 delay-500">
          <div className="glass-card p-6 bg-blue-50 border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-2xl text-primary-gray shadow-sm">
                <Info size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-primary-dark">Nota de Transparência</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  As imagens personalizadas são adicionadas pelo próprio usuário para uso pessoal. 
                  O aplicativo "Meu Álbum 2026" não fornece, armazena em servidores nem distribui imagens oficiais protegidas por direitos autorais. 
                  Placeholders visuais são gerados localmente para auxiliar na organização.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
