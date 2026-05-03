import React, { useMemo } from 'react';
import { 
  Trophy, 
  Star, 
  Crown, 
  Repeat, 
  Wallet, 
  Target,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Plus,
  TrendingUp,
  Award,
  Package
} from 'lucide-react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { CollectionData, CollectionStats } from '../types';
import { formatCurrency, formatPercentage } from '../utils/collectionUtils';

interface DashboardProps {
  stats: CollectionStats;
  data: CollectionData;
  onNavigate: (screen: any) => void;
  onNavigateToTeam: (teamId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, data, onNavigate, onNavigateToTeam }) => {
  const chartData = useMemo(() => [
    { name: 'Tenho', value: stats.totalUnicasTenho },
    { name: 'Falta', value: stats.totalFaltantes },
  ], [stats.totalUnicasTenho, stats.totalFaltantes]);

  const teamProgressData = useMemo(() => {
    return data.teams
      .filter(t => t.id !== 'spec' && t.id !== 'leg')
      .map(team => {
        const teamStickers = data.stickers.filter(s => s.timeId === team.id);
        const owned = teamStickers.filter(s => s.quantidade >= 1).length;
        const progress = teamStickers.length > 0 ? (owned / teamStickers.length) * 100 : 0;
        return { name: team.nome, progress };
      })
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);
  }, [data.teams, data.stickers]);

  const nextGoal = useMemo(() => {
    const teamProgress = data.teams
      .filter(t => t.id !== 'spec' && t.id !== 'leg')
      .map(team => {
        const teamStickers = data.stickers.filter(s => s.timeId === team.id);
        const owned = teamStickers.filter(s => s.quantidade >= 1).length;
        return { 
          ...team, 
          owned, 
          total: teamStickers.length,
          progress: teamStickers.length > 0 ? (owned / teamStickers.length) * 100 : 0
        };
      });

    return teamProgress
      .filter(t => t.progress < 100 && t.total > 0)
      .sort((a, b) => b.progress - a.progress)[0];
  }, [data.teams, data.stickers]);

  const teamsOriginal = data.teams;

  const criticalMissing = useMemo(() => {
    return data.stickers
      .filter(s => s.quantidade === 0 && (s.isEspecial || s.isLegend))
      .slice(0, 4);
  }, [data.stickers]);

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-primary-blue font-bold tracking-widest uppercase text-[10px] md:text-sm mb-1 text-center md:text-left">Status da Coleção</p>
          <h2 className="font-display font-bold text-2xl md:text-4xl text-primary-dark text-center md:text-left">Copa do Mundo <span className="text-world-gold">2026</span></h2>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
            <span className="px-2 py-1 bg-world-gold/10 text-world-gold rounded-lg text-[10px] md:text-xs font-black uppercase tracking-tighter">Álbum Físico</span>
            <span className="text-gray-400 text-sm">•</span>
            <p className="text-gray-500 text-xs md:text-sm">
              {stats.percentualConcluido < 10 ? 'Coleção em fase inicial' : 
               stats.percentualConcluido < 40 ? 'Boa evolução' :
               stats.percentualConcluido < 70 ? 'Coleção avançada' :
               stats.percentualConcluido < 95 ? 'Quase perto de completar!' : 'Coleção perfeita'}
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-center md:justify-end">
          <button 
            onClick={() => onNavigate('quick-entry')}
            className="px-4 md:px-6 py-2.5 md:py-3 bg-primary-dark text-white rounded-xl font-bold text-sm md:text-base flex items-center gap-2 hover:bg-primary-blue transition-all shadow-lg"
          >
            <Plus size={18} />
            Cadastro Rápido
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Progress Card */}
        <div className="lg:col-span-2 glass-card p-4 md:p-6 flex flex-col md:flex-row items-center gap-6 md:gap-8 bg-gradient-to-br from-white to-world-gray relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-world-gold/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="w-40 h-40 md:w-48 md:h-48 relative flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell key="cell-0" fill="#D4AF37" />
                  <Cell key="cell-1" fill="#E5E7EB" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl md:text-3xl font-display font-bold text-primary-dark">{formatPercentage(stats.percentualConcluido)}</span>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">Concluído</span>
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-2 gap-4 md:gap-6 w-full">
            <StatSmall label="Obtidos" value={`${stats.totalUnicasTenho}`} subValue={`/ ${stats.totalCadastradas}`} icon={CheckCircle2} color="text-world-green" />
            <StatSmall label="Faltam" value={stats.totalFaltantes} icon={AlertCircle} color="text-world-red" />
            <StatSmall label="Total Figurinhas" value={stats.totalFigurinhasCompradas} icon={Award} color="text-primary-blue" />
            <StatSmall label="Valor Médio/Fig" value={formatCurrency(stats.totalFigurinhasCompradas > 0 ? stats.investimentoTotal / stats.totalFigurinhasCompradas : 0)} icon={Wallet} color="text-world-green" />
          </div>
        </div>

        {/* Goal Card */}
        <div className="glass-card premium-gradient p-5 md:p-6 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60 text-[10px] md:text-xs font-bold uppercase tracking-widest">Foco Atual</span>
              <Target className="text-world-gold" size={20} />
            </div>
            {nextGoal ? (
              <>
                <h3 className="text-xl md:text-2xl font-display font-bold mb-1">{nextGoal.nome}</h3>
                <p className="text-white/70 text-xs md:text-sm leading-tight">Faltam {nextGoal.total - nextGoal.owned} cromos para fechar este time.</p>
                <div className="mt-4 md:mt-6 space-y-2">
                  <div className="flex justify-between text-[10px] md:text-xs font-bold">
                    <span>Progresso</span>
                    <span>{formatPercentage(nextGoal.progress)}</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 md:h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-world-gold transition-all duration-500" style={{ width: `${nextGoal.progress}%` }}></div>
                  </div>
                </div>
              </>
            ) : (
              <h3 className="text-xl md:text-2xl font-display font-bold">Álbum Completo! 🏆</h3>
            )}
          </div>
          <button 
            onClick={() => nextGoal && onNavigateToTeam(nextGoal.id)}
            className="mt-6 w-full py-2.5 md:py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-colors border border-white/10"
          >
            Ver Time
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* Second Row: Specials, Legends, Finance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MiniCard 
          title="Especiais" 
          value={stats.totalEspeciaisTenho} 
          total={data.totalEsperadoEspeciais} 
          percent={stats.percentualEspeciais}
          icon={Star} 
          color="bg-primary-blue" 
          onClick={() => onNavigate('specials')}
        />
        <MiniCard 
          title="Legends" 
          value={stats.totalLegendsTenho} 
          total={stats.totalLegends} 
          percent={stats.percentualLegends}
          icon={Crown} 
          color="bg-world-gold" 
          darkIcon
          onClick={() => onNavigate('legends')}
        />
        <MiniCard 
          title="Pacotinhos" 
          value={stats.envelopesComprados} 
          subtitle="Comprados"
          icon={Package} 
          color="bg-world-green" 
          onClick={() => onNavigate('finance')}
        />
        <MiniCard 
          title="Investido" 
          value={formatCurrency(stats.investimentoTotal)} 
          subtitle="Valor total gasto"
          icon={Wallet} 
          color="bg-world-red" 
          onClick={() => onNavigate('finance')}
        />
      </div>

      {/* Highlights & Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
            <Trophy className="text-world-gold" size={20} />
            Top Seleções em Progresso
          </h3>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={teamProgressData} 
                layout="vertical" 
                margin={{ left: 20 }}
                onClick={(data) => {
                  if (data && data.activeLabel) {
                    const team = teamProgressData.find(t => t.name === data.activeLabel);
                    const actualTeam = teamsOriginal.find(t => t.nome === data.activeLabel);
                    if (actualTeam) onNavigateToTeam(actualTeam.id);
                  }
                }}
              >
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-primary-dark text-white p-2 rounded-lg text-xs font-bold shadow-xl">
                          {payload[0].value?.toString().slice(0, 4)}%
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="progress" fill="#005BBB" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-xl flex items-center gap-2">
              <AlertCircle className="text-world-red" size={20} />
              Faltantes Críticas
            </h3>
            <button onClick={() => onNavigate('missing')} className="text-primary-blue text-xs font-bold hover:underline">Ver todas</button>
          </div>
          <div className="space-y-4">
            {criticalMissing.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => onNavigateToTeam(s.timeId)}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-world-gold/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${s.isLegend ? 'bg-world-gold/10 text-world-gold' : 'bg-primary-blue/10 text-primary-blue'}`}>
                      {s.isLegend ? <Crown size={16} /> : <Star size={16} />}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{s.nome}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{s.codigo} • {s.timeNome}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-black text-gray-400">Pág {s.paginaAlbum}</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatSmall = ({ label, value, subValue, icon: Icon, color }: any) => (
  <div className="flex items-center gap-3 md:gap-4">
    <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-gray-50 ${color}`}>
      <Icon size={18} className="md:w-5 md:h-5" />
    </div>
    <div>
      <p className="text-[9px] md:text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-0.5">
        <p className="text-lg md:text-2xl font-display font-bold text-primary-dark leading-none">{value}</p>
        {subValue && <span className="text-[10px] md:text-xs text-gray-400 font-bold">{subValue}</span>}
      </div>
    </div>
  </div>
);

const MiniCard = ({ title, value, total, percent, subtitle, icon: Icon, color, darkIcon, onClick }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    onClick={onClick}
    className="glass-card p-4 md:p-5 cursor-pointer group active:scale-95 transition-transform"
  >
    <div className="flex items-start justify-between mb-3 md:mb-4">
      <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl ${color} shadow-lg ${darkIcon ? 'text-primary-dark' : 'text-white'} group-hover:scale-110 transition-transform`}>
        <Icon size={20} className="md:w-5 md:h-5" />
      </div>
      {percent !== undefined && (
        <span className="text-[10px] md:text-xs font-bold text-gray-400">{formatPercentage(percent)}</span>
      )}
    </div>
    <p className="text-[10px] md:text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">{title}</p>
    <div className="flex items-baseline gap-1">
      <h4 className="text-xl md:text-2xl font-display font-bold text-primary-dark leading-none">{value}</h4>
      {total && <span className="text-xs text-gray-400 font-bold">/ {total}</span>}
    </div>
    {subtitle && <p className="text-[9px] md:text-[10px] text-gray-500 mt-1 uppercase font-bold">{subtitle}</p>}
  </motion.div>
);

export default Dashboard;
