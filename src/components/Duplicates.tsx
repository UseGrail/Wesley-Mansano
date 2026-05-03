import React, { useMemo, useState } from 'react';
import { Repeat, Share2, Copy, ChevronDown } from 'lucide-react';
import { CollectionData, Sticker } from '../types';
import StickerCard from './StickerCard';

const ITEMS_PER_PAGE = 48;

interface DuplicatesProps {
  data: CollectionData;
  toggleOwned: (id: string) => void;
}

const Duplicates: React.FC<DuplicatesProps> = ({ data, toggleOwned }) => {
  const duplicates = useMemo(() => data.stickers.filter(s => s.quantidade > 1), [data.stickers]);
  const totalExtra = useMemo(() => duplicates.reduce((acc, s) => acc + (s.quantidade - 1), 0), [duplicates]);
  const [currentPage, setCurrentPage] = useState(1);

  const displayedDuplicates = useMemo(() => {
    return duplicates.slice(0, currentPage * ITEMS_PER_PAGE);
  }, [duplicates, currentPage]);

  const copyToClipboard = () => {
    const text = `Minhas Repetidas Meu Álbum 2026:\n${duplicates.map(s => `${s.codigo} (x${s.quantidade - 1})`).join(', ')}`;
    navigator.clipboard.writeText(text);
    alert('Lista de repetidas copiada!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-center md:text-left text-primary-dark">
        <div>
          <h2 className="font-display font-bold text-2xl md:text-3xl">Repetidas & Trocas</h2>
          <p className="text-sm text-gray-500 font-medium">Você tem {totalExtra} figurinhas extras para trocar.</p>
        </div>
        <button 
          onClick={copyToClipboard}
          className="px-4 md:px-6 py-2.5 md:py-3 bg-primary-dark text-white rounded-xl font-bold text-sm md:text-base flex items-center justify-center gap-2 hover:bg-primary-blue transition-all active:scale-95"
        >
          <Copy size={18} />
          Copiar Códigos
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-3 bg-primary-blue/10 text-primary-blue rounded-2xl">
            <Repeat size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Extras</p>
            <p className="text-2xl font-display font-bold">{totalExtra}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-3 bg-world-gold/10 text-world-gold rounded-2xl">
            <Repeat size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Tipos Repetidos</p>
            <p className="text-2xl font-display font-bold">{duplicates.length}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-3 bg-world-green/10 text-world-green rounded-2xl">
            <Share2 size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Status</p>
            <p className="text-2xl font-display font-bold">Disponível</p>
          </div>
        </div>
      </div>

      {displayedDuplicates.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 items-stretch">
            {displayedDuplicates.map((sticker) => (
              <StickerCard 
                key={sticker.id} 
                sticker={sticker} 
                onToggleOwned={toggleOwned} 
              />
            ))}
          </div>

          {displayedDuplicates.length < duplicates.length && (
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
           <Repeat size={48} className="mx-auto text-gray-200 mb-4" />
           <p className="text-gray-500 font-bold">Você ainda não tem figurinhas repetidas.</p>
        </div>
      )}
    </div>
  );
};

export default Duplicates;
