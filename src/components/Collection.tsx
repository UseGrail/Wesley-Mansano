import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Filter, SlidersHorizontal, Plus, Grid3X3, List as ListIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// @ts-ignore
import * as ReactWindowNamespace from 'react-window';
import { useDebounce } from 'use-debounce';

const FixedSizeList = (ReactWindowNamespace as any).FixedSizeList || (ReactWindowNamespace as any).default?.FixedSizeList;
import { CollectionData, Sticker, StickerStatus, StickerType, StickerRarity } from '../types';
import StickerCard from './StickerCard';
import StickerDetail from './StickerDetail';

interface CollectionProps {
  data: CollectionData;
  toggleOwned: (id: string) => void;
  updateSticker: (id: string, updates: Partial<Sticker>) => void;
  initialTeamId?: string;
  initialFilter?: 'TUDO' | 'TENHO' | 'FALTA' | 'REPETIDA' | 'ESPECIAL' | 'LEGEND';
}

const Collection: React.FC<CollectionProps> = ({ data, toggleOwned, updateSticker, initialTeamId, initialFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 300);
  const [activeFilter, setActiveFilter] = useState<'TUDO' | 'TENHO' | 'FALTA' | 'REPETIDA' | 'ESPECIAL' | 'LEGEND'>('TUDO');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'numero' | 'nome' | 'time'>('numero');
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [columnCount, setColumnCount] = useState(6);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with initial props
  useEffect(() => {
    setActiveFilter(initialFilter || 'TUDO');
    setSelectedTeam(initialTeamId || 'all');
    setSearchTerm('');
  }, [initialTeamId, initialFilter]);

  // Handle column count for virtualization
  useEffect(() => {
    const updateColumns = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      if (width < 640) setColumnCount(2);
      else if (width < 768) setColumnCount(3);
      else if (width < 1024) setColumnCount(4);
      else if (width < 1280) setColumnCount(5);
      else setColumnCount(6);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const filteredStickers = useMemo(() => {
    return data.stickers.filter(s => {
      const searchLower = debouncedSearch.toLowerCase();
      const matchSearch = 
        s.nome.toLowerCase().includes(searchLower) || 
        s.codigo.toLowerCase().includes(searchLower) ||
        s.timeNome.toLowerCase().includes(searchLower);
      
      const matchTeam = selectedTeam === 'all' || s.timeId === selectedTeam;
      
      let matchFilter = true;
      if (activeFilter === 'TENHO') matchFilter = s.quantidade >= 1;
      if (activeFilter === 'FALTA') matchFilter = s.quantidade === 0;
      if (activeFilter === 'REPETIDA') matchFilter = s.quantidade > 1;
      if (activeFilter === 'ESPECIAL') matchFilter = s.isEspecial;
      if (activeFilter === 'LEGEND') matchFilter = s.isLegend;

      return matchSearch && matchTeam && matchFilter;
    }).sort((a, b) => {
      if (sortBy === 'nome') return a.nome.localeCompare(b.nome);
      if (sortBy === 'time') return a.timeNome.localeCompare(b.timeNome);
      return a.numeroGlobal - b.numeroGlobal;
    });
  }, [data.stickers, debouncedSearch, activeFilter, selectedTeam, sortBy]);

  // Chunk stickers for group rendering in FixedSizeList
  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < filteredStickers.length; i += columnCount) {
      result.push(filteredStickers.slice(i, i + columnCount));
    }
    return result;
  }, [filteredStickers, columnCount]);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const rowStickers = rows[index];
    return (
      <div style={style} className={`grid grid-cols-${columnCount} px-4 py-4 gap-4 md:gap-6`}>
        {rowStickers.map((sticker) => (
          <StickerCard 
            key={sticker.id} 
            sticker={sticker} 
            onToggleOwned={toggleOwned} 
            onUpdateQty={(id, qty) => updateSticker(id, { quantidade: Math.max(0, qty) })}
            onEdit={(s) => setSelectedSticker(s)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 h-full flex flex-col" ref={containerRef}>
      {/* Header & Main Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-center md:text-left">
        <div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-primary-dark">Sua Coleção</h2>
          <p className="text-sm text-gray-500 font-medium">{filteredStickers.length} figurinhas encontradas</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 overflow-x-auto max-w-full no-scrollbar">
           {['TUDO', 'TENHO', 'FALTA', 'REPETIDA', 'ESPECIAL', 'LEGEND'].map((f) => (
             <button
               key={f}
               onClick={() => setActiveFilter(f as any)}
               className={`
                 whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all
                 ${activeFilter === f ? 'bg-primary-dark text-white shadow-md' : 'text-gray-400 hover:text-primary-dark'}
               `}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome, número ou seleção..."
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <select 
            className="w-full pl-4 pr-10 py-3 bg-white rounded-xl border border-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all font-bold text-gray-600"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            <option value="all">Todas Seleções</option>
            {data.teams.map(t => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
          <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
        </div>

        <div className="relative">
          <select 
            className="w-full pl-4 pr-10 py-3 bg-white rounded-xl border border-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all font-bold text-gray-600"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="numero">Ordenar por Nº</option>
            <option value="nome">Ordenar por Nome</option>
            <option value="time">Ordenar por Seleção</option>
          </select>
          <SlidersHorizontal className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
        </div>

        <button className="lg:col-span-2 py-3 bg-primary-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-blue transition-all shadow-lg shadow-primary-dark/10">
          <Plus size={20} />
          Cadastrar Rápido
        </button>
      </div>

      {/* Virtualized List Container */}
      <div className="flex-1 min-h-[500px]">
        {filteredStickers.length > 0 ? (
          FixedSizeList ? (
            <FixedSizeList
              height={600}
              itemCount={rows.length}
              itemSize={280}
              width="100%"
            >
              {Row}
            </FixedSizeList>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
              {filteredStickers.map((sticker) => (
                <StickerCard 
                  key={sticker.id} 
                  sticker={sticker} 
                  onToggleOwned={toggleOwned} 
                  onUpdateQty={(id, qty) => updateSticker(id, { quantidade: Math.max(0, qty) })}
                  onEdit={(s) => setSelectedSticker(s)}
                />
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-white rounded-3xl border border-dashed border-gray-200 py-20">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
               <Search size={40} />
             </div>
             <h3 className="text-xl font-display font-bold text-gray-500">Nenhuma figurinha encontrada</h3>
             <p className="text-gray-400">Tente ajustar seus filtros ou busca.</p>
             <button 
               onClick={() => { setSearchTerm(''); setActiveFilter('TUDO'); setSelectedTeam('all'); }}
               className="mt-6 font-bold text-primary-blue hover:underline"
             >
               Limpar filtros
             </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedSticker && (
          <StickerDetail 
            sticker={selectedSticker}
            onClose={() => setSelectedSticker(null)}
            onUpdate={updateSticker}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Collection;
