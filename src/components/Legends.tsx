import React, { useMemo } from 'react';
import { Crown, Star, Trophy, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { CollectionData, Sticker, StickerRarity } from '../types';
import StickerCard from './StickerCard';
import { formatPercentage } from '../utils/collectionUtils';

interface LegendsProps {
  data: CollectionData;
  toggleOwned: (id: string) => void;
}

const Legends: React.FC<LegendsProps> = ({ data, toggleOwned }) => {
  const legends = useMemo(() => data.stickers.filter(s => s.isLegend), [data.stickers]);
  const owned = legends.filter(s => s.quantidade >= 1).length;
  const progress = legends.length > 0 ? (owned / legends.length) * 100 : 0;

  return (
    <div className="space-y-10 pb-20">
      {/* Premium Hero Section */}
      <div className="glass-card premium-gradient p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-world-gold/20 rounded-full -mr-32 -mt-32 blur-3xl animate-float"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-blue/20 rounded-full -ml-24 -mb-24 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 gold-gradient rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-world-gold/30">
            <Crown size={40} className="text-primary-dark" />
          </div>
          <h2 className="font-display font-black text-4xl md:text-5xl mb-2 tracking-tight">LEGENDS / LENDAS</h2>
          <p className="text-white/70 max-w-lg mb-8">As figurinhas mais raras, cobiçadas e valiosas da sua coleção. Os verdadeiros mitos do futebol mundial.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
            <StatBox label="Total de Lendas" value={legends.length} />
            <StatBox label="Obtidas" value={owned} />
            <StatBox label="Faltam" value={legends.length - owned} />
            <StatBox label="Concluído" value={formatPercentage(progress)} />
          </div>
        </div>
      </div>

      {/* Legends Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
        {legends.map((sticker) => (
          <StickerCard 
            key={sticker.id} 
            sticker={sticker} 
            onToggleOwned={toggleOwned} 
          />
        ))}
      </div>

      {legends.length === 0 && (
        <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-200">
           <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
           <p className="text-gray-500 font-bold">Nenhuma lenda cadastrada.</p>
        </div>
      )}
    </div>
  );
};

const StatBox = ({ label, value }: { label: string, value: string | number }) => (
  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col items-center">
    <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">{label}</p>
    <p className="text-2xl font-display font-bold text-world-gold">{value}</p>
  </div>
);

export default Legends;
