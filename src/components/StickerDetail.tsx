import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Plus, Minus, Star, MessageCircle, TrendingUp, Calendar, AlertCircle, 
  Trash2, Award, Heart, Check, Info, Upload, Link, Image as ImageIcon,
  ChevronRight, ArrowLeft
} from 'lucide-react';
import { Sticker, StickerStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_TEAMS } from '../constants';
import { ImageStorage, optimizeImage } from '../services/imageStorage';

interface StickerDetailProps {
  sticker: Sticker;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Sticker>) => void;
}

const StickerDetail: React.FC<StickerDetailProps> = ({ sticker, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'finance' | 'image'>('info');
  const [tempUrl, setTempUrl] = useState(sticker.imageUrl || '');
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB.');
      return;
    }

    setIsUploading(true);
    try {
      const optimized = await optimizeImage(file);
      await ImageStorage.saveImage(sticker.id, optimized);
      onUpdate(sticker.id, { 
        hasCustomImage: true, 
        imageSource: 'upload_manual',
        imageUploadedAt: new Date().toISOString()
      });
      setLocalImage(optimized);
    } catch (err) {
      console.error('Error uploading image:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    onUpdate(sticker.id, { 
      imageUrl: tempUrl,
      hasCustomImage: false, 
      imageSource: 'url_manual'
    });
    setLocalImage(tempUrl);
  };

  const removeImage = async () => {
    await ImageStorage.deleteImage(sticker.id);
    onUpdate(sticker.id, { 
      hasCustomImage: false, 
      imageUrl: undefined,
      imageSource: 'placeholder'
    });
    setLocalImage(null);
    setTempUrl('');
  };

  const team = INITIAL_TEAMS.find(t => t.id === sticker.timeId);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-48 bg-primary-dark">
           {localImage ? (
             <img src={localImage} alt={sticker.nome} className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full flex flex-col items-center justify-center text-white/20 p-8" style={{ backgroundColor: team?.corPrincipal }}>
                <span className="text-6xl font-display font-black tracking-tighter opacity-10">{sticker.codigo}</span>
             </div>
           )}
           <button 
             onClick={onClose}
             className="absolute top-4 right-4 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors"
           >
             <X size={20} />
           </button>
           
           <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center gap-3 mb-1">
                <span className="px-2 py-0.5 bg-world-gold text-primary-dark text-[10px] font-black rounded uppercase">
                   {sticker.codigo}
                </span>
                <span className="text-white/60 text-xs font-bold uppercase tracking-widest">{sticker.timeNome}</span>
              </div>
              <h3 
                className="font-display font-bold text-white uppercase leading-tight"
                style={{ fontSize: sticker.nome.length > 20 ? '1.25rem' : '1.5rem' }}
              >
                {sticker.nome}
              </h3>
           </div>
        </div>

        <div className="p-6">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
              <button 
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'info' ? 'bg-primary-dark text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Informação
              </button>
              <button 
                onClick={() => setActiveTab('finance')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'finance' ? 'bg-primary-dark text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Financeiro
              </button>
              <button 
                onClick={() => setActiveTab('image')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'image' ? 'bg-primary-dark text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Imagem
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-6">
              {activeTab === 'info' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Raridade</span>
                      <p className="font-bold text-gray-700">{sticker.raridade}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Categoria</span>
                      <p className="font-bold text-gray-700">{sticker.categoria}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-blue/10 rounded-xl flex items-center justify-center text-primary-blue">
                         <Star size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">Status da Coleção</p>
                        <p className="text-xs text-gray-500">Você possui {sticker.quantidade} deste cromo</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => onUpdate(sticker.id, { quantidade: Math.max(0, sticker.quantidade - 1) })} className="p-2 bg-white rounded-lg border border-gray-200">
                         <Minus size={16} />
                       </button>
                       <span className="w-8 text-center font-black text-lg">{sticker.quantidade}</span>
                       <button onClick={() => onUpdate(sticker.id, { quantidade: sticker.quantidade + 1 })} className="p-2 bg-primary-dark text-white rounded-lg">
                         <Plus size={16} />
                       </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'finance' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                     <span className="text-sm font-bold text-gray-600">Investimento Estimado</span>
                     <span className="text-lg font-black text-primary-dark">R$ {(sticker.quantidade * 1.5).toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-400 italic">Cálculo baseado no preço médio de R$ 1,50 por cromo.</p>
                </motion.div>
              )}

              {activeTab === 'image' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all gap-2"
                    >
                      <Upload size={20} className="text-primary-blue" />
                      <span className="text-[10px] font-black uppercase text-gray-600">Upload Local</span>
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    
                    <button 
                      onClick={removeImage}
                      className="flex flex-col items-center justify-center p-4 bg-red-50 border border-red-100 rounded-2xl hover:bg-red-100 transition-all gap-2"
                    >
                      <Trash2 size={20} className="text-world-red" />
                      <span className="text-[10px] font-black uppercase text-gray-600">Remover Custom</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">URL da Imagem</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Insira a URL direta da imagem..."
                        className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none"
                        value={tempUrl}
                        onChange={(e) => setTempUrl(e.target.value)}
                      />
                      <button onClick={handleUrlSubmit} className="bg-primary-dark text-white p-3 rounded-xl">
                        <Check size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Texto Alternativo (Acessibilidade)</label>
                    <input 
                      type="text"
                      placeholder="Descreva a imagem..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none"
                      value={sticker.imageAlt || ''}
                      onChange={(e) => onUpdate(sticker.id, { imageAlt: e.target.value })}
                    />
                  </div>

                  <button 
                    onClick={removeImage}
                    className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                  >
                    Usar Placeholder Premium
                  </button>
                </motion.div>
              )}
            </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StickerDetail;
