/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  LayoutDashboard, 
  Contact, 
  Star, 
  Crown, 
  Search, 
  Repeat, 
  Wallet, 
  Settings as SettingsIcon, 
  Plus, 
  Download,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  Award,
  BookOpen,
  RefreshCw,
  Image as ImageIcon,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCollection } from './hooks/useCollection';
import { calculateCollectionStats, formatCurrency, formatPercentage } from './utils/collectionUtils';
import { StickerStatus, StickerType, StickerRarity, TransactionType } from './types';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';

import ImagesDashboard from './components/ImagesDashboard';
import Dashboard from './components/Dashboard';
import TeamsList from './components/TeamsList';
import Specials from './components/Specials';
import Legends from './components/Legends';
import Missing from './components/Missing';
import Duplicates from './components/Duplicates';
import Finance from './components/Finance';
import Settings from './components/Settings';
import PhysicalAlbum from './components/PhysicalAlbum';

export enum Screen {
  DASHBOARD = 'dashboard',

  TEAMS = 'teams',
  SPECIALS = 'specials',
  LEGENDS = 'legends',
  MISSING = 'missing',
  DUPLICATES = 'duplicates',
  FINANCE = 'finance',
  ALBUM = 'album',
  IMAGES = 'images',
  QUICK_ENTRY = 'quick-entry',

  SETTINGS = 'settings',
}

export default function App() {
  const { user, logOut } = useAuth();
  const getHashScreen = (): Screen => {
    const hash = window.location.hash.replace('#/', '');
    if (Object.values(Screen).includes(hash as Screen)) {
      return hash as Screen;
    }
    return Screen.DASHBOARD;
  };

  const [activeScreen, setActiveScreenState] = useState<Screen>(getHashScreen());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [collectionFilters, setCollectionFilters] = useState<{ teamId?: string; filter?: string }>({});
  const { data, updateSticker, addSticker, deleteSticker, toggleStickerOwned, addTransaction, deleteTransaction, importData, resetCollection, forceSave } = useCollection();

  React.useEffect(() => {
    const handleHashChange = () => {
      setActiveScreenState(getHashScreen());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const setActiveScreen = (screen: Screen) => {
    window.location.hash = `/${screen}`;
  };

  React.useEffect(() => {
    if (user && !window.location.hash) {
      setActiveScreen(Screen.DASHBOARD);
    }
  }, [user]);

  const stats = useMemo(() => calculateCollectionStats(data.stickers, data.transactions, data.totalEsperadoCromos, data.totalEsperadoEspeciais), [data]);

  if (!user) {
    return <Login />;
  }

  const navItems = [
    { id: Screen.DASHBOARD, label: 'Visão Geral', icon: LayoutDashboard },
    { id: Screen.ALBUM, label: 'Meu Álbum', icon: BookOpen },
    { id: Screen.QUICK_ENTRY, label: 'Cadastro Rápido', icon: Plus },

    { id: Screen.TEAMS, label: 'Seleções', icon: Trophy },
    { id: Screen.SPECIALS, label: 'Especiais', icon: Star },
    { id: Screen.LEGENDS, label: 'Lendas', icon: Crown },
    { id: Screen.MISSING, label: 'Faltantes', icon: Award },
    { id: Screen.DUPLICATES, label: 'Repetidas', icon: Repeat },
    { id: Screen.FINANCE, label: 'Financeiro', icon: Wallet },
    { id: Screen.IMAGES, label: 'Galeria', icon: ImageIcon },

    { id: Screen.SETTINGS, label: 'Configurações', icon: SettingsIcon },
  ];

  const renderScreen = () => {
    switch (activeScreen) {
      case Screen.DASHBOARD:
        return (
          <Dashboard 
            stats={stats} 
            data={data} 
            onNavigate={setActiveScreen} 
            onNavigateToTeam={(teamId) => {
              setCollectionFilters({ teamId });
              setActiveScreen(Screen.ALBUM);
            }} 
          />
        );

      case Screen.TEAMS:
        return (
          <TeamsList 
            data={data} 
            onNavigateToTeam={(teamId) => {
              setCollectionFilters({ teamId });
              setActiveScreen(Screen.ALBUM);
            }} 
          />
        );
      case Screen.SPECIALS:
        return <Specials data={data} toggleOwned={toggleStickerOwned} />;
      case Screen.LEGENDS:
        return <Legends data={data} toggleOwned={toggleStickerOwned} />;
      case Screen.MISSING:
        return <Missing data={data} toggleOwned={toggleStickerOwned} />;
      case Screen.DUPLICATES:
        return <Duplicates data={data} toggleOwned={toggleStickerOwned} />;
      case Screen.FINANCE:
        return <Finance data={data} addTransaction={addTransaction} deleteTransaction={deleteTransaction} stats={stats} />;
      case Screen.IMAGES:
        return <ImagesDashboard data={data} onUpdateSticker={updateSticker} />;
      case Screen.ALBUM:
        return <PhysicalAlbum data={data} onUpdateSticker={updateSticker} initialTeamId={collectionFilters.teamId} />;
      case Screen.QUICK_ENTRY:
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold font-display">Cadastro Rápido</h2>
            <div className="glass-card p-6">
              <input 
                type="text" 
                placeholder="Digite o código (ex: CROMO-001)" 
                className="w-full text-2xl p-4 border border-gray-200 rounded-xl font-mono text-center focus:outline-none focus:ring-2 focus:ring-primary-blue/20"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const code = e.currentTarget.value.trim().toUpperCase();
                    const sticker = data.stickers.find(s => s.codigo === code);
                    if (sticker) {
                      updateSticker(sticker.id, { 
                        quantidade: sticker.quantidade + 1,
                        status: StickerStatus.TENHO,
                        atualizadoEm: new Date().toISOString()
                      });
                      e.currentTarget.value = '';
                    } else {
                      alert('Cromo não encontrado.');
                    }
                  }
                }}
              />
              <p className="text-center text-xs text-gray-500 mt-4 font-bold uppercase tracking-widest">Pressione ENTER para adicionar 1 unidade</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-gray-400 uppercase tracking-tighter">Últimas Adições</h3>
              {data.stickers
                .filter(s => s.quantidade > 0)
                .sort((a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime())
                .slice(0, 5)
                .map(s => (
                  <div key={s.id} className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl flex items-center justify-between">
                    <span className="font-mono text-sm font-bold dark:text-gray-200">{s.codigo}</span>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{s.nome}</span>
                    <span className="px-2 py-1 bg-primary-blue/10 text-primary-blue rounded text-xs font-black">QTDE: {s.quantidade}</span>
                  </div>
                ))}
            </div>
          </div>
        );

      case Screen.SETTINGS:
        return <Settings data={data} setData={(newData) => importData(newData)} />;
      default:
        return (
          <Dashboard 
            stats={stats} 
            data={data} 
            onNavigate={setActiveScreen} 
            onNavigateToTeam={(teamId) => {
              setCollectionFilters({ teamId });
              setActiveScreen(Screen.ALBUM);
            }} 
          />
        );
    }
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row bg-world-gray transition-colors ${data.settings.darkMode ? 'dark' : ''}`}>
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between py-3 px-4 bg-primary-dark text-white border-b border-white/10 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center shadow-lg">
            <Trophy className="text-primary-dark w-5 h-5 flex-shrink-0" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-display font-bold text-[10px] text-world-gold uppercase tracking-widest leading-none mb-1">Copa do Mundo 26</h1>
            <h2 className="font-display font-bold text-lg leading-none truncate max-w-[200px]">
              {navItems.find(item => item.id === activeScreen)?.label || 'Álbum'}
            </h2>
          </div>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white/10 rounded-lg">
          <Menu size={24} />
        </button>
      </header>

      {/* Sidebar Desktop */}
      <aside className={`
        fixed inset-0 z-50 md:relative md:flex md:w-72 md:flex-col bg-primary-dark text-white transform transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center shadow-xl animate-float">
              <Trophy className="text-primary-dark w-7 h-7" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl leading-tight">Copa do Mundo</h1>
              <span className="text-world-gold font-bold text-sm tracking-widest uppercase">2026</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 hover:bg-white/10 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveScreen(item.id);
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${activeScreen === item.id 
                  ? 'bg-world-gold text-primary-dark shadow-[0_0_20px_rgba(212,175,55,0.3)] font-bold' 
                  : 'text-white/60 hover:bg-white/5 hover:text-white'}
              `}
            >
              <item.icon size={20} className={activeScreen === item.id ? '' : 'group-hover:scale-110 transition-transform'} />
              <span>{item.label}</span>
              {activeScreen === item.id && <ChevronRight className="ml-auto" size={16} />}
            </button>
          ))}
          <button
            onClick={async () => {
              await forceSave();
              logOut();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 mt-4 rounded-xl text-white/60 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </nav>

        <div className="p-4 m-4 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-world-gold/20 rounded-lg">
              <TrendingUp size={18} className="text-world-gold" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-white/50 uppercase tracking-wider font-bold">Resumo Geral</p>
              <p className="text-sm font-bold">{formatPercentage(stats.percentualConcluido)} completo</p>
            </div>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${stats.percentualConcluido}%` }}
              className="h-full gold-gradient"
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto bg-world-gray relative pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-4 md:p-8 max-w-7xl mx-auto w-full"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] h-16 bg-primary-dark/95 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-around z-50 px-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        {[
          navItems.find(i => i.id === Screen.DASHBOARD),
          navItems.find(i => i.id === Screen.ALBUM),
          navItems.find(i => i.id === Screen.QUICK_ENTRY),
          navItems.find(i => i.id === Screen.MISSING),
          navItems.find(i => i.id === Screen.DUPLICATES)
        ].map((item, idx) => item && (
          <button
            key={item.id}
            onClick={() => setActiveScreen(item.id)}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${activeScreen === item.id ? 'text-world-gold scale-110' : 'text-white/50 hover:text-white/80'}`}
          >
            <item.icon size={20} fill={activeScreen === item.id ? 'currentColor' : 'none'} />
            <span className="text-[10px] font-black uppercase tracking-tighter truncate max-w-[60px]">{item.label === 'Visão Geral' ? 'Início' : item.label === 'Meu Álbum' ? 'Álbum' : item.label === 'Cadastro Rápido' ? 'Adicionar' : item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

