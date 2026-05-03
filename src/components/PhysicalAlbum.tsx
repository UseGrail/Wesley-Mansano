import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, BookOpen, Copy, CheckCircle2, Star, User, Flag, Search } from 'lucide-react';
import { CollectionData, Sticker, StickerStatus, StickerType } from '../types';
import { INITIAL_TEAMS } from '../constants';

interface PhysicalAlbumProps {
  data: CollectionData;
  onUpdateSticker: (id: string, updates: Partial<Sticker>) => void;
  initialTeamId?: string;
}

const PhysicalAlbum: React.FC<PhysicalAlbumProps> = ({ data, onUpdateSticker, initialTeamId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    if (initialTeamId) {
      const teamSticker = data.stickers.find(s => s.timeId === initialTeamId && s.paginaAlbum);
      if (teamSticker && teamSticker.paginaAlbum) {
        setCurrentPage(teamSticker.paginaAlbum);
      }
    }
  }, [initialTeamId, data.stickers]);
  
  const totalPages = Math.max(...data.stickers.map(s => s.paginaAlbum || 0), 1);
  
  const pageStickers = data.stickers
    .filter(s => s.paginaAlbum === currentPage && s.codigo && s.codigo.trim() !== '')
    .sort((a, b) => (a.posicaoNaPagina || 0) - (b.posicaoNaPagina || 0));

  const teamOnPage = pageStickers.length > 0 
    ? INITIAL_TEAMS.find(t => t.id === pageStickers[0].timeId)
    : null;

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const pageProgress = pageStickers.length > 0 
    ? (pageStickers.filter(s => s.quantidade >= 1).length / pageStickers.length) * 100 
    : 0;

  const copyMissingToClipboard = () => {
    const missing = pageStickers.filter(s => s.quantidade === 0).map(s => s.codigo).join(', ');
    navigator.clipboard.writeText(`Faltantes da Página ${currentPage}: ${missing}`);
    alert('Lista de faltantes copiada!');
  };

  const toggleSticker = (sticker: Sticker) => {
    const newQty = sticker.quantidade === 0 ? 1 : 0;
    onUpdateSticker(sticker.id, { 
      quantidade: newQty,
      status: newQty > 0 ? StickerStatus.TENHO : StickerStatus.FALTA,
      atualizadoEm: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-dark rounded-2xl flex items-center justify-center text-white shadow-lg overflow-hidden relative group">
             {teamOnPage ? (
               <span className="text-3xl z-10">{teamOnPage.bandeiraEmoji}</span>
             ) : (
               <BookOpen size={24} className="z-10" />
             )}
             {teamOnPage && (
               <div 
                 className="absolute inset-0 opacity-20" 
                 style={{ backgroundColor: teamOnPage.corPrincipal }}
               />
             )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-3xl text-primary-dark uppercase tracking-tighter">
                {teamOnPage ? teamOnPage.nome : 'Simulador'}
              </h2>
              {teamOnPage?.grupo && teamOnPage.grupo !== '-' && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[10px] font-black rounded uppercase">
                  Grupo {teamOnPage.grupo}
                </span>
              )}
            </div>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
              Página {currentPage} de {totalPages} • {teamOnPage?.continente || 'Especial'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={copyMissingToClipboard}
            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            title="Copiar faltantes da página"
          >
            <Copy size={20} />
          </button>
        </div>
      </div>

      {/* Navigation & Progress */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <button 
          onClick={prevPage} 
          disabled={currentPage === 1}
          className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={28} />
        </button>
        
        <div className="flex flex-col items-center flex-1 max-w-xs">
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-2">
            <motion.div 
              className="h-full bg-world-green" 
              initial={{ width: 0 }}
              animate={{ width: `${pageProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Progresso da Página: {Math.round(pageProgress)}%</span>
        </div>

        <button 
          onClick={nextPage} 
          disabled={currentPage === totalPages}
          className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Grid de Figurinhas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <AnimatePresence mode="popLayout">
          {pageStickers.map((sticker) => (
            <motion.div
              key={sticker.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => toggleSticker(sticker)}
              className={`
                aspect-[3/4] relative rounded-lg cursor-pointer transition-all duration-300 group
                ${sticker.quantidade > 0 
                  ? 'bg-white shadow-md ring-1 ring-black/5 ring-inset ring-offset-2 ring-offset-white ring-gray-100' 
                  : 'bg-world-gray border-2 border-dashed border-gray-300'}
                ${sticker.isEspecial ? 'overflow-hidden' : ''}
              `}
            >
              {/* Sticker Content */}
              {sticker.quantidade > 0 ? (
                <div className="absolute inset-0 p-1 flex flex-col items-center justify-center text-center">
                  <div className="w-full h-full rounded-md overflow-hidden relative border border-gray-100 shadow-inner bg-gray-50 flex flex-col items-center justify-center">
                    {sticker.isEspecial && (
                      <div className="absolute inset-0 bg-gradient-to-br from-world-gold/20 via-transparent to-world-gold/40 z-10"></div>
                    )}
                    <span className="text-[9px] font-black text-primary-dark/60 uppercase mb-0.5 z-20">{sticker.codigo}</span>
                    <p className="text-[8px] font-black leading-tight text-primary-blue uppercase truncate w-full px-1 z-20">{sticker.nome}</p>
                    
                    {sticker.quantidade > 1 && (
                      <div className="absolute top-1 right-1 px-1 bg-world-red text-white flex items-center justify-center rounded text-[8px] font-black shadow-sm z-30">
                        x{sticker.quantidade}
                      </div>
                    )}
                    
                    <div className="absolute bottom-1 right-1 text-world-green z-30">
                       <CheckCircle2 size={12} fill="currentColor" className="text-white bg-world-green rounded-full shadow-sm" />
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-500 group-hover:scale-105`}
                  style={{ 
                    backgroundColor: teamOnPage ? `${teamOnPage.corPrincipal}08` : '#F9FAFB'
                  }}
                >
                  <div className="flex flex-col items-center justify-center opacity-30 group-hover:opacity-60 transition-opacity">
                    <span className="text-[10px] font-black text-gray-500 mb-2">{sticker.codigo}</span>
                    
                    {/* Silhouette Logic */}
                    <div 
                      className="mb-1"
                      style={{ color: sticker.isEspecial ? '#D4AF37' : teamOnPage ? teamOnPage.corPrincipal : '#9CA3AF' }}
                    >
                      {sticker.tipo === StickerType.JOGADOR ? (
                        <User size={36} strokeWidth={1.5} />
                      ) : sticker.tipo === StickerType.ESCUDO ? (
                        <Flag size={36} strokeWidth={1.5} />
                      ) : sticker.tipo === StickerType.FOTO_EQUIPE ? (
                        <div className="flex -space-x-2 items-center">
                          <User size={20} strokeWidth={1.5} />
                          <User size={28} strokeWidth={2} />
                          <User size={20} strokeWidth={1.5} />
                        </div>
                      ) : sticker.tipo === StickerType.ESTADIO ? (
                        <div className="relative">
                          <div className="w-12 h-7 border-2 border-current rounded-full flex items-center justify-center">
                            <div className="w-8 h-4 border border-current rounded-full opacity-50"></div>
                          </div>
                        </div>
                      ) : (
                        <Star size={28} strokeWidth={1.5} />
                      )}
                    </div>
                  </div>

                  {sticker.isEspecial && !sticker.tipo.includes('Escudo') && (
                    <div className="absolute top-2 right-2">
                      <Star size={10} className="text-world-gold fill-world-gold/20" />
                    </div>
                  )}
                </div>
              )}

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-primary-blue/0 group-hover:bg-primary-blue/5 transition-colors rounded-lg"></div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {pageStickers.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium italic">Nenhuma figurinha cadastrada nesta página.</p>
          <p className="text-xs text-gray-400 mt-2">Pode ser necessário importar o checklist.</p>
        </div>
      )}
    </div>
  );
};

export default PhysicalAlbum;
