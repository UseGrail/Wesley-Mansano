import React, { useState, useEffect } from 'react';
import { Plus, Minus, Star, Crown, Info, Repeat, Heart, Sparkles, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Sticker, StickerStatus, StickerRarity } from '../types';
import PremiumPlaceholder from './PremiumPlaceholder';
import { ImageStorage } from '../services/imageStorage';

interface StickerCardProps {
  sticker: Sticker;
  onToggleOwned: (id: string) => void;
  onUpdateQty?: (id: string, qty: number) => void;
  onEdit?: (sticker: Sticker) => void;
}

const StickerCard: React.FC<StickerCardProps> = React.memo(({ sticker, onToggleOwned, onUpdateQty, onEdit }) => {
  const [localImage, setLocalImage] = useState<string | null>(null);
  const isOwned = sticker.quantidade >= 1;
  const isDuplicate = sticker.quantidade > 1;

  useEffect(() => {
    const loadImage = async () => {
      if (sticker.hasCustomImage) {
        const stored = await ImageStorage.getImage(sticker.id);
        setLocalImage(stored || sticker.imageUrl || null);
      } else {
        setLocalImage(sticker.imageUrl || null);
      }
    };
    loadImage();
  }, [sticker.id, sticker.hasCustomImage, sticker.imageUrl]);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={() => onToggleOwned(sticker.id)}
      className={`
        relative group rounded-2xl border-2 p-1 transition-all duration-300
        ${isOwned ? 'opacity-100 border-primary-blue/30' : 'opacity-80 grayscale-[0.3] border-gray-100'}
        ${sticker.isLegend ? 'shadow-2xl shadow-world-gold/20' : 'shadow-lg'}
        cursor-pointer
      `}
    >
      <div className="relative rounded-[14px] overflow-hidden aspect-[3/4] bg-primary-dark">
        {localImage ? (
          <img 
            src={localImage} 
            alt={sticker.imageAlt || sticker.nome} 
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!isOwned ? 'grayscale opacity-50' : ''}`}
            onError={() => setLocalImage(null)}
          />
        ) : (
          <PremiumPlaceholder sticker={sticker} />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        
        {/* Badges */}
        <div className="absolute top-2 md:top-3 left-2 md:left-3 flex flex-col gap-1 z-10">
          <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-white/20 backdrop-blur-md rounded-lg text-[8px] md:text-[10px] font-black text-white border border-white/20 shadow-lg">
            {sticker.codigo}
          </span>
          {(sticker.isFoil || sticker.isEspecial) && (
            <span className="w-5 h-5 md:w-7 md:h-7 bg-world-gold rounded-full flex items-center justify-center text-primary-dark shadow-lg animate-pulse">
              <Sparkles size={10} className="md:w-3.5 md:h-3.5" />
            </span>
          )}
        </div>

        {/* Owned Status Indicator Badge */}
        <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 z-10">
           <div className={`
               w-3 h-3 md:w-4 md:h-4 rounded-full shadow-lg transition-all border-2 border-white/20
               ${isOwned ? 'bg-world-green' : 'bg-gray-400'}
             `}
           />
        </div>

        {/* Info Button - Bottom Right */}
        {onEdit && (
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(sticker); }} 
            className="absolute bottom-2 md:bottom-3 right-2 md:right-3 p-1.5 md:p-2 rounded-lg md:rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-primary-blue transition-all z-10"
          >
            <Info size={14} className="md:w-4 md:h-4" />
          </button>
        )}

        {/* Duplicates Badge */}
        {isDuplicate && (
          <div className="absolute top-2 md:top-3 right-2 md:right-3 flex items-center gap-0.5 bg-world-red text-white px-1.5 py-0.5 rounded-full text-[8px] md:text-[10px] font-black italic shadow-lg z-20">
            <Repeat size={8} />
            x{sticker.quantidade}
          </div>
        )}
      </div>

      {/* Quick Controls Hover Overlay */}
      {isOwned && onUpdateQty && (
        <div className="absolute inset-0 bg-primary-dark/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-2xl z-30 space-y-4">
           <div className="flex items-center gap-4">
             <button 
               onClick={(e) => { e.stopPropagation(); onUpdateQty(sticker.id, sticker.quantidade - 1); }}
               className="p-3 bg-white/10 rounded-full hover:bg-white/20 text-white"
             >
               <Minus size={20} />
             </button>
             <span className="text-3xl font-display font-bold text-white">{sticker.quantidade}</span>
             <button 
               onClick={(e) => { e.stopPropagation(); onUpdateQty(sticker.id, sticker.quantidade + 1); }}
               className="p-3 bg-world-gold rounded-full hover:bg-yellow-400 text-primary-dark"
             >
               <Plus size={20} />
             </button>
           </div>
           <p className="text-xs text-white/60 font-bold uppercase tracking-widest">Ajustar Quantidade</p>
           <button 
             onClick={() => onToggleOwned(sticker.id)}
             className="text-red-400 hover:text-red-300 text-xs font-bold uppercase mt-4"
           >
             Remover Tudo
           </button>
        </div>
      )}
    </motion.div>
  );
});

export default StickerCard;
