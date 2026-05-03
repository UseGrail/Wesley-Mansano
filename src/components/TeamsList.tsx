import React, { useMemo } from 'react';
import { Trophy, ArrowRight, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { CollectionData, Team } from '../types';
import { formatPercentage } from '../utils/collectionUtils';

interface TeamsListProps {
  data: CollectionData;
  onNavigateToTeam: (id: string) => void;
}

const TeamsList: React.FC<TeamsListProps> = ({ data, onNavigateToTeam }) => {
  const teamsWithProgress = useMemo(() => {
    return data.teams.map(team => {
      const teamStickers = data.stickers.filter(s => s.timeId === team.id);
      const owned = teamStickers.filter(s => s.quantidade >= 1).length;
      const progress = teamStickers.length > 0 ? (owned / teamStickers.length) * 100 : 0;
      const isCompleted = progress === 100;
      const almostDone = progress >= 80 && progress < 100;
      const specials = teamStickers.filter(s => s.isEspecial).length;
      const legends = teamStickers.filter(s => s.isLegend).length;

      return { ...team, owned, total: teamStickers.length, progress, isCompleted, almostDone, specials, legends };
    });
  }, [data.teams, data.stickers]);

  const groupedTeams = useMemo(() => {
    const groups: Record<string, typeof teamsWithProgress> = {};
    teamsWithProgress.forEach(team => {
      const groupName = team.grupo || 'Outros';
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(team);
    });
    return groups;
  }, [teamsWithProgress]);

  const groupKeys = Object.keys(groupedTeams).sort((a, b) => {
    if (a === '-') return 1;
    if (b === '-') return -1;
    if (a === 'Extra') return 1;
    if (b === 'Extra') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-center md:text-left">
        <div>
          <h1 className="font-display font-black text-3xl md:text-5xl text-primary-dark tracking-tight leading-tight">
            Seleções da <span className="text-world-gold">2026</span>
          </h1>
          <p className="text-gray-500 mt-2 max-w-xl text-sm md:text-lg font-medium">
            Confira as 48 seleções. Clique em cada país para ver os cromos.
          </p>
        </div>
        <div className="flex items-center justify-center md:justify-start gap-4 bg-white p-3 md:p-4 rounded-3xl border border-gray-100 shadow-sm mx-auto md:mx-0">
           <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-world-gold/10 flex items-center justify-center">
             <Trophy className="text-world-gold w-6 h-6 md:w-7 md:h-7" />
           </div>
           <div className="text-left">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Seleções Completas</p>
             <p className="text-xl md:text-2xl font-black text-primary-dark leading-none mt-1">
               {teamsWithProgress.filter(t => t.isCompleted).length} <span className="text-gray-300 font-medium">/ {teamsWithProgress.length}</span>
             </p>
           </div>
        </div>
      </div>

      <div className="space-y-16">
        {groupKeys.map(groupKey => (
          <div key={groupKey} className="space-y-6">
            <div className="flex items-center gap-4 px-2">
              <h3 className="text-2xl font-display font-black text-primary-dark flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-primary-dark text-white flex items-center justify-center text-lg transform -rotate-3 shadow-md">
                  {groupKey === 'Extra' ? 'E' : groupKey === '-' ? 'M' : groupKey}
                </span>
                {groupKey === 'Extra' ? 'Coleções Extras' : groupKey === '-' ? 'Mundial' : `Grupo ${groupKey}`}
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {groupedTeams[groupKey].map((team) => (
                <TeamCard key={team.id} team={team} onClick={() => onNavigateToTeam(team.id)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TeamCard: React.FC<{ team: any; onClick: () => void }> = ({ team, onClick }) => (
  <motion.div 
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:shadow-xl transition-all flex flex-col cursor-pointer overflow-hidden relative group"
  >
    {/* Background color accent */}
    <div 
      className="absolute top-0 right-0 w-24 h-24 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rounded-full -mr-8 -mt-8"
      style={{ backgroundColor: team.corPrincipal }}
    />

    <div className="flex items-center gap-4 mb-5">
      <div className="relative">
        <span className="text-5xl drop-shadow-sm">{team.bandeiraEmoji}</span>
        {team.isCompleted && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-world-green text-white flex items-center justify-center shadow-md animate-in zoom-in duration-300">
            <CheckCircle2 size={14} fill="currentColor" strokeWidth={3} className="text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-bold text-primary-dark leading-tight" style={{ fontSize: team.nome.length > 15 ? '1rem' : '1.25rem' }}>
          {team.nome}
        </h3>
        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-0.5">{team.continente}</p>
      </div>
    </div>

    <div className="space-y-3 mt-auto">
      <div className="flex justify-between items-end">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-primary-dark">{team.owned}</span>
          <span className="text-xs font-bold text-gray-300">/ {team.total}</span>
        </div>
        <div className="text-right">
           <span className={`text-xs font-black px-2 py-0.5 rounded-full ${team.isCompleted ? 'bg-world-green/10 text-world-green' : 'bg-primary-blue/10 text-primary-blue'}`}>
            {formatPercentage(team.progress)}
          </span>
        </div>
      </div>

      <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden border border-gray-100/50 p-[1px]">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${team.progress}%` }}
          className="h-full rounded-full transition-all duration-1000"
          style={{ backgroundColor: team.corPrincipal }}
        />
      </div>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {team.specials > 0 && (
          <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[9px] font-black rounded-lg border border-gray-200 uppercase tracking-tighter">
            {team.specials} Esp
          </span>
        )}
        {team.legends > 0 && (
          <span className="px-2 py-0.5 bg-world-gold/5 text-world-gold text-[9px] font-black rounded-lg border border-world-gold/10 uppercase tracking-tighter">
            {team.legends} Leg
          </span>
        )}
        {team.almostDone && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-secondary-light/20 text-secondary-dark text-[9px] font-black rounded-lg border border-secondary-light/30">
            <div className="w-1 h-1 rounded-full bg-secondary-dark animate-pulse" />
            QUASE LÁ
          </div>
        )}
      </div>
    </div>
    
    <div className="absolute top-1/2 -right-4 -translate-y-1/2 opacity-0 group-hover:opacity-10 dark:opacity-0 transition-opacity">
      <Trophy size={80} style={{ color: team.corPrincipal }} />
    </div>
  </motion.div>
);

export default TeamsList;
