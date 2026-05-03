import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Image as ImageIcon, Upload, Trash2, Search, Filter, 
  CheckCircle2, AlertCircle, Info, Database, Layers, 
  ChevronRight, RefreshCw, X, FileImage
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDebounce } from 'use-debounce';
import { Sticker, CollectionData, StickerType, StickerRarity } from '../types';
import { ImageStorage, optimizeImage } from '../services/imageStorage';
import { INITIAL_TEAMS } from '../constants';

interface ImagesDashboardProps {
  data: CollectionData;
  onUpdateSticker: (id: string, updates: Partial<Sticker>) => void;
}

const ImagesDashboard: React.FC<ImagesDashboardProps> = ({ data, onUpdateSticker }) => {
  const [stats, setStats] = useState({ count: 0, sizeBytes: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 300);
  const [filter, setFilter] = useState<'all' | 'custom' | 'placeholder' | 'special' | 'legend'>('all');
  const [batchFiles, setBatchFiles] = useState<{ file: File, status: 'pending' | 'success' | 'error', matchedId?: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadStats = useCallback(async () => {
    const s = await ImageStorage.getStats();
    setStats(s);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats, data.stickers]);

  const filteredStickers = useMemo(() => {
    return data.stickers.filter((s: Sticker) => {
      const searchLower = debouncedSearch.toLowerCase();
      const matchesSearch = s.nome.toLowerCase().includes(searchLower) || 
                           s.codigo.toLowerCase().includes(searchLower) ||
                           s.timeNome.toLowerCase().includes(searchLower);
      
      if (filter === 'custom') return matchesSearch && s.hasCustomImage;
      if (filter === 'placeholder') return matchesSearch && !s.hasCustomImage;
      if (filter === 'special') return matchesSearch && s.isEspecial;
      if (filter === 'legend') return matchesSearch && s.isLegend;
      return matchesSearch;
    });
  }, [data.stickers, debouncedSearch, filter]);

  const displayedStickers = useMemo(() => filteredStickers.slice(0, 48), [filteredStickers]);

  const handleBatchSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    const newFiles = files.map(file => {
      const fileName = file.name.split('.')[0].toUpperCase();
      const matched = data.stickers.find(s => s.codigo.toUpperCase() === fileName);
      const status: 'pending' | 'success' | 'error' = matched ? 'pending' : 'error';
      return {
        file,
        status,
        matchedId: matched?.id
      };
    });
    setBatchFiles(newFiles);
  };

  const processBatch = async () => {
    setIsProcessing(true);
    for (let i = 0; i < batchFiles.length; i++) {
      const item = batchFiles[i];
      if (item.status === 'pending' && item.matchedId) {
        try {
          const optimized = await optimizeImage(item.file);
          await ImageStorage.saveImage(item.matchedId, optimized);
          onUpdateSticker(item.matchedId, { 
            hasCustomImage: true, 
            imageSource: 'upload_manual',
            imageUploadedAt: new Date().toISOString()
          });
          setBatchFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'success' } : f));
        } catch (err) {
          setBatchFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error' } : f));
        }
      }
    }
    setIsProcessing(false);
    loadStats();
  };

  const clearAllImages = async () => {
    if (confirm('Deseja remover TODAS as imagens personalizadas? Isso não pode ser desfeito.')) {
      await ImageStorage.clearAllImages();
      data.stickers.forEach(s => {
        if (s.hasCustomImage) {
          onUpdateSticker(s.id, { 
            hasCustomImage: false, 
            imageSource: 'placeholder' 
          });
        }
      });
      loadStats();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div>
        <h2 className="font-display font-bold text-3xl text-primary-dark">Gerenciar Imagens</h2>
        <p className="text-gray-500 mt-2">Personalize o visual do seu álbum e gerencie seus uploads.</p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-6 flex flex-col gap-1 border-l-4 border-l-primary-blue">
          <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Personalizadas</span>
          <span className="text-3xl font-black text-primary-dark">{stats.count}</span>
          <span className="text-[10px] text-gray-400">Em IndexedDB</span>
        </div>
        <div className="glass-card p-6 flex flex-col gap-1 border-l-4 border-l-world-green">
          <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Placeholders</span>
          <span className="text-3xl font-black text-primary-dark">{data.stickers.length - stats.count}</span>
          <span className="text-[10px] text-gray-400">Visuais Premium</span>
        </div>
        <div className="glass-card p-6 flex flex-col gap-1 border-l-4 border-l-world-gold">
          <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Espaço Usado</span>
          <span className="text-3xl font-black text-primary-dark">{(stats.sizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
          <span className="text-[10px] text-gray-400">Otimizado</span>
        </div>
        <div className="glass-card p-6 flex flex-col gap-1 border-l-4 border-l-primary-dark">
          <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Total Cromos</span>
          <span className="text-3xl font-black text-primary-dark">{data.stickers.length}</span>
          <span className="text-[10px] text-gray-400">Base Ativa</span>
        </div>
      </div>

      {/* Batch Import */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <Layers className="text-primary-blue" size={20} />
            Importação em Lote
          </h3>
          <div className="p-2 bg-blue-50 text-primary-blue rounded-lg">
             <AlertCircle size={16} />
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Dica Royale: Nomeie seus arquivos como o código do cromo (ex: <code className="bg-gray-100 px-1 rounded">BRA1.jpg</code>) para vinculação automática.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex-1 py-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary-blue hover:bg-primary-blue/5 transition-all cursor-pointer">
             <Upload size={24} className="text-gray-400" />
             <span className="text-sm font-bold text-gray-600">Selecionar Várias Imagens</span>
             <input type="file" multiple accept="image/*" className="hidden" onChange={handleBatchSelect} />
          </label>
        </div>

        {batchFiles.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
            <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 font-black uppercase text-gray-400 sticky top-0">
                  <tr>
                    <th className="p-3">Arquivo</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {batchFiles.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-3 font-mono">{item.file.name}</td>
                      <td className="p-3">
                        {item.status === 'pending' && <span className="text-world-gold font-bold">Pendente</span>}
                        {item.status === 'success' && <span className="text-world-green font-bold">Vinculado</span>}
                        {item.status === 'error' && <span className="text-world-red font-bold">Não encontrado</span>}
                      </td>
                      <td className="p-3 font-bold">{item.matchedId ? item.file.name.split('.')[0] : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={processBatch}
                disabled={isProcessing || !batchFiles.some(f => f.status === 'pending')}
                className="flex-1 py-3 bg-primary-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                Processar {batchFiles.filter(f => f.status === 'pending').length} Imagens
              </button>
              <button 
                onClick={() => setBatchFiles([])}
                className="px-6 py-3 border border-gray-100 text-gray-400 rounded-xl font-bold hover:text-world-red"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Explorer */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por código ou nome..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-blue/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">Todos</option>
              <option value="custom">Com Imagem</option>
              <option value="placeholder">Placeholder</option>
              <option value="special">Especial</option>
              <option value="legend">Legend</option>
            </select>
            <button 
               onClick={clearAllImages}
               className="p-3 text-world-red bg-red-50 rounded-xl hover:bg-red-100 transition-all"
               title="Limpar todas as imagens"
            >
               <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {displayedStickers.map(s => (
            <div key={s.id} className="aspect-[3/4] bg-primary-dark rounded-lg overflow-hidden border border-gray-100 shadow-sm relative group">
              {s.hasCustomImage ? (
                <div className="w-full h-full flex items-center justify-center bg-world-green/10">
                  <span className="text-[8px] font-black uppercase text-world-green">CUST</span>
                  <div className="absolute top-1 right-1">
                    <CheckCircle2 size={10} className="text-world-green" />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                   <ImageIcon size={16} className="text-gray-300" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 p-1 bg-black/60 backdrop-blur-sm">
                <p className="text-[8px] font-black text-white text-center truncate">{s.codigo}</p>
              </div>
            </div>
          ))}
        </div>
        {filteredStickers.length > 48 && (
          <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">
            Mostrando apenas os primeiros 48 cromos.
          </p>
        )}
      </div>

      <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl flex items-start gap-4">
        <Info className="text-primary-blue shrink-0 mt-1" size={20} />
        <div className="space-y-1">
          <h4 className="font-bold text-primary-dark text-sm">Privacidade e Uso</h4>
          <p className="text-xs text-primary-gray leading-relaxed">
            Todas as imagens importadas são armazenadas localmente no banco de dados do seu navegador (IndexedDB). 
            O app não envia suas fotos pessoais para nenhum servidor externo. 
            Em caso de troca de dispositivo, utilize a função de exportar backup completo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImagesDashboard;
