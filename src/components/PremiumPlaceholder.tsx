import React from 'react';
import { motion } from 'motion/react';
import { 
  User, Shield, Users, MapPin, 
  CircleDot, Award, Star, Compass,
  Sparkles, Flag
} from 'lucide-react';
import { Sticker, StickerType, StickerRarity, StickerStatus } from '../types';
import { INITIAL_TEAMS } from '../constants';

interface PremiumPlaceholderProps {
  sticker: Sticker;
}

const PremiumPlaceholder: React.FC<PremiumPlaceholderProps> = ({ sticker }) => {
  const team = INITIAL_TEAMS.find(t => t.id === sticker.timeId);
  
  const colors = team ? {
    primary: team.corPrincipal,
    secondary: team.corSecundaria
  } : {
    primary: '#01305D', // Default FIFA Blue
    secondary: '#FFFFFF'
  };

  const getIcon = () => {
    switch (sticker.tipo) {
      case StickerType.ESCUDO: return <Flag size={48} />;
      case StickerType.FOTO_EQUIPE: return <Users size={48} />;
      case StickerType.ESTADIO: return <MapPin size={48} />;
      case StickerType.BOLA: return <CircleDot size={48} />;
      case StickerType.EMBLEMA: return <Award size={48} />;
      case StickerType.MASCOTE: return <Compass size={48} />;
      case StickerType.OUTRO: return <Star size={48} />;
      default: return <User size={48} />;
    }
  };

  const getStyles = (sticker: Sticker) => {
    // Basic types
    const isLegend = sticker.isLegend || sticker.raridade === StickerRarity.OURO || sticker.raridade === StickerRarity.PRATA || sticker.raridade === StickerRarity.BRONZE || sticker.raridade === StickerRarity.LEGEND;
    const isFoil = sticker.isFoil || sticker.raridade === StickerRarity.ESPECIAL;

    // Common
    if (!isLegend && !isFoil) {
      return {
        bg: 'bg-gradient-to-br from-gray-50 to-white',
        border: 'border-2 border-white',
        text: 'text-gray-800',
        icon: 'bg-primary-blue/5 text-primary-blue',
        shadow: 'shadow-sm',
        isLegend: false,
        isFoil: false
      };
    }
    // Foil
    if (isFoil && !isLegend) {
      return {
        bg: 'bg-gradient-to-br from-gray-800 via-gray-600 to-gray-800',
        border: 'border-2 border-yellow-500/50',
        text: 'text-white',
        icon: 'bg-yellow-500/10 text-yellow-500',
        shadow: 'shadow-lg shadow-yellow-500/20',
        isLegend: false,
        isFoil: true
      };
    }
    // Legend
    return {
      bg: 'bg-gradient-to-br from-black via-purple-950 to-black',
      border: 'border-2 border-gold-500',
      text: 'text-gold-300',
      icon: 'bg-gold-500/20 text-gold-500',
      shadow: 'shadow-xl shadow-gold-500/30',
      isLegend: true,
      isFoil: false
    };
  };

  const styles = getStyles(sticker);
  const { isLegend, isFoil } = styles;

  const getRarityLabel = () => {
    switch (sticker.raridade) {
      case StickerRarity.OURO: return 'Extra - Gold';
      case StickerRarity.PRATA: return 'Extra - Silver';
      case StickerRarity.BRONZE: return 'Extra - Bronze';
      case StickerRarity.LEGEND: return 'Extra - Regular';
      default: return isFoil ? 'Brilhante' : 'Base';
    }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden flex flex-col items-center justify-center p-4 ${styles.bg} ${styles.border} ${styles.shadow}`}>
      {/* Jogador Comum Details (Green/Red accent) */}
      {!isLegend && !isFoil && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-world-green/10 blur-3xl transform translate-x-10 -translate-y-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-world-red/10 blur-3xl transform -translate-x-10 translate-y-10" />
        </div>
      )}

      {/* Dynamic Background Overlay */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at center, ${colors.secondary}, transparent)`,
        }}
      />
      
      {/* Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Rarity Glows */}
      {isLegend && (
        <div className="absolute inset-0 bg-gradient-to-br from-black via-primary-dark/80 to-world-gold/30 animate-pulse transition-all" />
      )}
      
      {isFoil && !isLegend && (
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-blue/20 via-world-gold/10 to-transparent" />
      )}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-3">
        {/* Type Icon */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`p-6 rounded-full ${styles.shadow} ${styles.icon}`}
        >
          {getIcon()}
        </motion.div>

        <div className="space-y-1 w-full px-2">
          <h4 
            className={`font-black uppercase tracking-tighter leading-tight break-words ${styles.text}`}
            style={{ 
              fontSize: sticker.nome.length > 20 ? '0.7rem' : sticker.nome.length > 15 ? '0.8rem' : isLegend ? '1.125rem' : '1rem' 
            }}
          >
            {sticker.nome}
          </h4>
          <p className="text-[10px] uppercase font-bold text-white/60 tracking-widest truncate">
            {sticker.timeNome}
          </p>
        </div>

        {/* Badges */}
        <div className="flex gap-1">
          {isFoil && (
            <span className="px-2 py-0.5 rounded-full bg-world-gold text-primary-dark text-[8px] font-black uppercase flex items-center gap-1 shadow-lg">
              <Sparkles size={8} />
              Foil
            </span>
          )}
          {isLegend && (
            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase flex items-center gap-1 shadow-lg ${
              sticker.raridade === StickerRarity.OURO ? 'bg-black text-world-gold border border-world-gold/30' :
              sticker.raridade === StickerRarity.PRATA ? 'bg-gray-800 text-gray-200 border border-gray-400' :
              sticker.raridade === StickerRarity.BRONZE ? 'bg-[#5D2B06] text-[#CD7F32] border border-[#CD7F32]/50' :
              'bg-[#1A0033] text-fuchsia-300 border border-fuchsia-500/30'
            }`}>
              <Star size={8} />
              {getRarityLabel()}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[8px] font-bold uppercase backdrop-blur-md">
            {sticker.codigo}
          </span>
        </div>
      </div>

      {/* Corner Details */}
      <div className="absolute top-2 left-2 flex items-center gap-1">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.secondary }} />
      </div>

      {sticker.status === StickerStatus.FALTA && (
        <div className="absolute inset-0 bg-primary-dark/60 backdrop-grayscale flex items-center justify-center">
            <span className="px-4 py-1 border-2 border-white/40 text-white/40 font-black uppercase tracking-widest rounded-lg transform -rotate-12">
                Faltando
            </span>
        </div>
      )}
    </div>
  );
};

export default PremiumPlaceholder;
