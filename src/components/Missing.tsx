import React, { useMemo, useState, useEffect } from 'react';
import { Search, ListFilter, AlertTriangle, CheckCircle2, Award, MessageCircle, ChevronDown } from 'lucide-react';
import { CollectionData, Sticker } from '../types';
import StickerCard from './StickerCard';

const ITEMS_PER_PAGE = 48;

interface MissingProps {
  data: CollectionData;
  toggleOwned: (id: string) => void;
}

const Missing: React.FC<MissingProps> = ({ data, toggleOwned }) => {
  const missingStickers = useMemo(() => {
    return data.stickers
      .filter(s => s.quantidade === 0)
      .sort((a, b) => {
        // Sort by page first, then by position on that page
        if (a.paginaAlbum !== b.paginaAlbum) {
          return (a.paginaAlbum || 0) - (b.paginaAlbum || 0);
        }
        return (a.posicaoNaPagina || 0) - (b.posicaoNaPagina || 0);
      });
  }, [data.stickers]);
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredMissing = useMemo(() => {
    return selectedTeam === 'all' 
      ? missingStickers 
      : missingStickers.filter(s => s.timeId === selectedTeam);
  }, [missingStickers, selectedTeam]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTeam]);

  const displayedMissing = useMemo(() => {
    return filteredMissing.slice(0, currentPage * ITEMS_PER_PAGE);
  }, [filteredMissing, currentPage]);

  const handleShareToWhatsApp = () => {
    const text = `Faltantes Meu Álbum 2026:\n${filteredMissing.map(s => `${s.codigo} - ${s.nome} (${s.timeNome})`).join('\n')}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(text);

    // Open WhatsApp
    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/?text=${encodedText}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-center md:text-left">
        <div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-primary-dark">Lista de Faltantes</h2>
          <p className="text-sm text-gray-500 font-medium">O que você ainda precisa para completar o álbum.</p>
        </div>
        <button 
          onClick={handleShareToWhatsApp}
          className="px-4 md:px-6 py-2.5 md:py-3 bg-world-green text-white rounded-xl font-bold text-sm md:text-base flex items-center justify-center gap-2 hover:bg-green-600 transition-all shadow-lg active:scale-95"
        >
          <MessageCircle size={18} />
          Copiar p/ WhatsApp
        </button>
      </div>

      <div className="flex bg-white p-4 rounded-2xl border border-gray-100 items-center gap-4">
        <ListFilter size={20} className="text-gray-400" />
        <select 
          className="bg-transparent font-bold text-gray-600 focus:outline-none flex-1"
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
        >
          <option value="all">Todas as Seleções</option>
          {data.teams.map(t => (
            <option key={t.id} value={t.id}>{t.nome}</option>
          ))}
        </select>
        <div className="px-3 py-1 bg-primary-blue/10 text-primary-blue rounded-lg font-bold text-sm">
          {filteredMissing.length} itens
        </div>
      </div>

      {displayedMissing.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 items-stretch">
            {displayedMissing.map((sticker) => (
              <StickerCard 
                key={sticker.id} 
                sticker={sticker} 
                onToggleOwned={toggleOwned} 
              />
            ))}
          </div>
          
          {displayedMissing.length < filteredMissing.length && (
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
           <CheckCircle2 size={48} className="mx-auto text-world-green mb-4" />
           <p className="text-gray-500 font-bold">Excelente! Não faltam figurinhas nesta categoria.</p>
        </div>
      )}
    </div>
  );
};

export default Missing;
