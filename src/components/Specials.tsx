import React, { useMemo, useState, useEffect } from 'react';
import { Star, Sparkles, Trophy, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { CollectionData, Sticker } from '../types';
import StickerCard from './StickerCard';
import { formatPercentage } from '../utils/collectionUtils';

const ITEMS_PER_PAGE = 48;

interface SpecialsProps {
  data: CollectionData;
  toggleOwned: (id: string) => void;
}

const Specials: React.FC<SpecialsProps> = ({ data, toggleOwned }) => {
  const specialStickers = useMemo(() => data.stickers.filter(s => s.isEspecial && !s.isLegend), [data.stickers]);
  const [currentPage, setCurrentPage] = useState(1);
  
  const owned = specialStickers.filter(s => s.quantidade >= 1).length;
  const progress = specialStickers.length > 0 ? (owned / specialStickers.length) * 100 : 0;

  const displayedSpecials = useMemo(() => {
    return specialStickers.slice(0, currentPage * ITEMS_PER_PAGE);
  }, [specialStickers, currentPage]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2 text-primary-blue font-black uppercase tracking-widest text-[10px] md:text-sm mb-1">
            <Sparkles size={16} />
            Especiais & Holos
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-primary-dark">Cartas Especiais</h2>
          <p className="text-sm text-gray-500 mt-2">Destaques, Escudos e momentos brilhantes.</p>
        </div>
        
        <div className="flex justify-center md:justify-end gap-4">
          <div className="glass-card px-4 md:px-6 py-2.5 md:py-3 border-primary-blue/20 bg-primary-blue/5">
             <p className="text-[10px] font-bold text-primary-blue uppercase tracking-widest leading-none mb-1">Progresso</p>
             <div className="flex items-baseline gap-2 justify-center md:justify-start">
               <span className="text-xl md:text-2xl font-display font-black text-primary-dark">{owned}</span>
               <span className="text-xs md:text-sm text-gray-400">/ {specialStickers.length}</span>
               <span className="text-xs md:text-sm font-black text-primary-blue ml-2">{formatPercentage(progress)}</span>
             </div>
          </div>
        </div>
      </div>

      {displayedSpecials.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 items-stretch">
            {displayedSpecials.map((sticker) => (
              <StickerCard 
                key={sticker.id} 
                sticker={sticker} 
                onToggleOwned={toggleOwned} 
              />
            ))}
          </div>

          {displayedSpecials.length < specialStickers.length && (
            <div className="flex justify-center pt-8">
              <button 
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white border-2 border-primary-dark/10 text-primary-dark font-black rounded-2xl hover:bg-primary-dark hover:text-white transition-all shadow-xl text-sm md:text-base active:scale-95"
              >
                <ChevronDown size={18} className="md:w-5 md:h-5" />
                Carregar mais figurinhas
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
           <Star size={48} className="mx-auto text-gray-200 mb-4" />
           <p className="text-gray-500 font-bold">Nenhuma figurinha especial encontrada.</p>
        </div>
      )}
    </div>
  );
};

export default Specials;
