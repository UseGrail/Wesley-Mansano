import React, { useState } from 'react';
import { 
  Upload, Download, FileJson, Trash2, AlertTriangle, Check, BookOpen, 
  FileText, Clipboard, FileType, CheckCircle2, Info, ChevronDown, 
  ChevronUp, AlertCircle, RefreshCw, Layers, Database
} from 'lucide-react';
import { Sticker, CollectionData, StickerStatus } from '../types';
import { parseRawChecklist, exportToCSV, exportToJSON, ParseSummary } from '../utils/checklistParser';
import { ImageStorage } from '../services/imageStorage';

interface ImportExportProps {
  data: CollectionData;
  importData: (newData: CollectionData) => void;
  onReset: () => void;
}

const ImportExport: React.FC<ImportExportProps> = ({ data, importData, onReset }) => {
  const [importStatus, setImportStatus] = useState<null | 'success' | 'error' | 'warning'>(null);
  const [rawText, setRawText] = useState('');
  const [parsedResult, setParsedResult] = useState<{ stickers: Sticker[], summary: ParseSummary } | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [showTeams, setShowTeams] = useState(false);

  const handleExportJSON = async (includeImages?: boolean) => {
    let stickersToExport = [...data.stickers];
    
    if (includeImages) {
      // Attach base64 images from storage
      stickersToExport = await Promise.all(
        data.stickers.map(async (s) => {
          if (s.hasCustomImage) {
            const base64 = await ImageStorage.getImage(s.id);
            return { ...s, localImageBase64: base64 };
          }
          return s;
        })
      );
    }

    const jsonContent = exportToJSON(stickersToExport);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meu-album-2026-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csvContent = exportToCSV(data.stickers);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minha-colecao-2026.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        let stickers = Array.isArray(imported) ? imported : imported.stickers;

        if (stickers) {
          // If backup contains base64 images, save them to IndexedDB
          for (const s of stickers) {
            if (s.localImageBase64) {
              await ImageStorage.saveImage(s.id, s.localImageBase64);
              s.hasCustomImage = true;
              delete s.localImageBase64; // Clean up memory/state
            }
          }

          importData(Array.isArray(imported) ? { ...data, stickers } : { ...imported, stickers });
          setImportStatus('success');
        } else {
          setImportStatus('error');
        }
      } catch (err) {
        setImportStatus('error');
      }
    };
    reader.readAsText(file);
  };

  const validateChecklist = () => {
    if (!rawText.trim()) return;
    const result = parseRawChecklist(rawText);
    setParsedResult(result);
    
    if (result.stickers.length > 0) {
      if (result.stickers.length === 980) {
        setImportStatus('success');
      } else {
        setImportStatus('warning');
      }
    } else {
      setImportStatus('error');
    }
  };

  const confirmImport = (isMain: boolean) => {
    if (!parsedResult) return;

    if (isMain) {
      // Replace entire collection
      const newData: CollectionData = {
        ...data,
        stickers: parsedResult.stickers,
        totalEsperadoCromos: parsedResult.stickers.length,
        totalEsperadoEspeciais: parsedResult.summary.specials
      };
      importData(newData);
    } else {
      // Append to collection
      const newData: CollectionData = {
        ...data,
        stickers: [...data.stickers, ...parsedResult.stickers]
      };
      importData(newData);
    }
    
    setImportStatus('success');
    setParsedResult(null);
    setRawText('');
  };

  const clearImport = () => {
    setParsedResult(null);
    setRawText('');
    setImportStatus(null);
  };

  const downloadCSVTemplate = () => {
    const csvContent = 'codigo,numeroGlobal,nome,selecao,siglaSelecao,secaoAlbum,categoria,tipo,raridade,especial,legend,foil,quantidade,tenho,repetida,quantidadeRepetida,faltante,prioridade,favorito,valorPago,valorEstimado,origem,dataObtida,observacao\n' +
      'BRA1,1,Escudo Seleção,Brasil,BRA,Seleções,Especial,Escudo da Seleção,Especial,true,false,true,0,false,false,0,true,Normal,false,0,0,,,\n' +
      'BRA2,2,Alisson,Brasil,BRA,Seleções,Comum,Jogador,Comum,false,false,false,0,false,false,0,true,Normal,false,0,0,,,';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modelo-checklist-2026.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderValidationMessage = () => {
    if (!parsedResult) return null;
    const count = parsedResult.stickers.length;
    
    if (count === 980) {
      return (
        <div className="p-4 bg-world-green/10 text-world-green rounded-2xl flex items-center gap-3 border border-world-green/20">
          <CheckCircle2 size={24} />
          <p className="font-bold text-sm">Checklist importada com sucesso. A coleção principal está completa (980 cromos).</p>
        </div>
      );
    } else if (count < 980) {
      return (
        <div className="p-4 bg-world-gold/10 text-world-gold rounded-2xl flex flex-col gap-2 border border-world-gold/20">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} />
            <p className="font-bold text-sm">A checklist importada tem apenas {count} cromos. O álbum físico esperado tem 980. Deseja importar mesmo assim?</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="p-4 bg-primary-blue/10 text-primary-blue rounded-2xl flex flex-col gap-2 border border-primary-blue/20">
          <div className="flex items-center gap-3">
            <Layers size={24} />
            <p className="font-bold text-sm">A checklist importada tem {count} itens. Isso pode incluir extras, cards promocionais ou variações. Deseja importar como coleção principal ou como coleção complementar?</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div>
        <h2 className="font-display font-bold text-3xl text-primary-dark">Importar Checklist Oficial</h2>
        <p className="text-gray-500 mt-2">Cole o conteúdo da checklist copiado de fontes externas para estruturar seu álbum.</p>
      </div>

      <div className="glass-card p-0 overflow-hidden border border-gray-100 shadow-xl">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
             <h3 className="font-bold text-lg flex items-center gap-2">
               <Clipboard className="text-primary-blue" size={20} />
               Conteúdo da Checklist
             </h3>
             <div className="flex gap-4">
                <button 
                  onClick={async () => setRawText(await navigator.clipboard.readText())}
                  className="text-xs font-bold text-primary-blue hover:underline bg-primary-blue/5 px-3 py-1 rounded-full"
                >
                  Colar Texto
                </button>
                <button onClick={clearImport} className="text-xs font-bold text-gray-400 hover:text-world-red">Limpar</button>
             </div>
          </div>
          
          <textarea 
            placeholder="Ex: BRA1 Escudo - Brasil FOIL&#10;BRA2 Alisson - Brasil&#10;MEX1 Escudo - México FOIL"
            className="w-full h-80 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-blue/20"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          ></textarea>

          {!parsedResult && (
            <button 
              onClick={validateChecklist}
              disabled={!rawText.trim()}
              className="w-full py-4 bg-primary-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-blue transition-all disabled:opacity-50 shadow-lg"
            >
              <RefreshCw size={18} />
              Validar Conteúdo
            </button>
          )}
        </div>

        {parsedResult && (
          <div className="bg-gray-50 border-t border-gray-100 p-6 space-y-6 animate-in fade-in slide-in-from-top-4">
            {renderValidationMessage()}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Cromos Lidos</span>
                <span className="text-xl font-black text-primary-dark">{parsedResult.summary.imported}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Especiais</span>
                <span className="text-xl font-black text-world-gold">{parsedResult.summary.specials}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Seleções</span>
                <span className="text-xl font-black text-world-green">{parsedResult.summary.teams.size}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Duplicados</span>
                <span className="text-xl font-black text-world-red">{parsedResult.summary.duplicates.length}</span>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => setShowTeams(!showTeams)}
                className="flex items-center justify-between w-full text-sm font-bold text-gray-600 px-2"
              >
                <span>Cromos por Seleção</span>
                {showTeams ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {showTeams && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 bg-white rounded-xl border border-gray-100 max-h-64 overflow-y-auto">
                  {Object.entries(parsedResult.summary.teamCounts).map(([team, count]) => (
                    <div key={team} className="flex justify-between text-xs px-2 py-1 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <span className="text-gray-500">{team}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              )}

              {parsedResult.summary.errors.length > 0 && (
                <>
                  <button 
                    onClick={() => setShowErrors(!showErrors)}
                    className="flex items-center justify-between w-full text-sm font-bold text-world-red px-2"
                  >
                    <span>Linhas com Alerta ({parsedResult.summary.errors.length})</span>
                    {showErrors ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {showErrors && (
                    <div className="p-4 bg-world-red/5 rounded-xl border border-world-red/10 max-h-40 overflow-y-auto space-y-1">
                      {parsedResult.summary.errors.map((err, idx) => (
                        <p key={idx} className="text-[10px] text-world-red font-mono">{err}</p>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
               <button 
                 onClick={() => confirmImport(true)}
                 className="flex-1 py-4 bg-world-green text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
               >
                 <CheckCircle2 size={18} />
                 Importar como Principal
               </button>
               <button 
                 onClick={() => confirmImport(false)}
                 className="flex-1 py-4 bg-white border-2 border-gray-100 text-primary-dark rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
               >
                 <Layers size={18} />
                 Adicionar como Complementar
               </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-blue/10 rounded-xl flex items-center justify-center text-primary-blue">
              <Download size={20} />
            </div>
            <h3 className="font-bold text-lg">Exportar Base</h3>
          </div>
          <p className="text-sm text-gray-500">Salve seus dados atuais para backups ou integração externa.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button 
              onClick={() => handleExportJSON(true)}
              className="py-3 bg-primary-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-blue transition-all"
            >
              <Database size={16} />
              JSON Completo (Com Imagens)
            </button>
            <button 
              onClick={() => handleExportJSON(false)}
              className="py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
            >
              <FileJson size={16} />
              JSON Leve (Sem Imagens)
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={handleExportCSV}
              className="py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all text-xs"
            >
              <FileType size={16} />
              Exportar CSV
            </button>
            <button 
              onClick={downloadCSVTemplate}
              className="py-3 bg-world-gold/10 text-world-gold rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-world-gold/20 transition-all text-xs"
            >
              <Download size={14} />
              Modelo CSV
            </button>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-world-green/10 rounded-xl flex items-center justify-center text-world-green">
              <Upload size={20} />
            </div>
            <h3 className="font-bold text-lg">Restaurar Backup</h3>
          </div>
          <p className="text-sm text-gray-500">Suba um arquivo de backup (.json) para restaurar sua coleção.</p>
          <label className="w-full py-3 bg-white border-2 border-dashed border-gray-200 text-gray-500 rounded-xl font-bold flex items-center justify-center gap-2 hover:border-world-green hover:bg-world-green/5 transition-all cursor-pointer">
            <Upload size={16} />
            Selecionar JSON
            <input type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
          </label>
        </div>
      </div>

      <div className="p-8 bg-red-50 rounded-3xl border border-red-100 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shadow-inner">
            <Trash2 size={28} />
          </div>
          <div>
            <h3 className="font-black text-red-600 text-lg uppercase tracking-tighter">Zona de Perigo</h3>
            <p className="text-sm text-gray-500">Apaga permanentemente todo o progresso e checklist importada.</p>
          </div>
        </div>
        <button 
          onClick={() => {
            if (confirm('ATENÇÃO: Você perderá TODOS os dados. Tem certeza?')) {
              onReset();
              setImportStatus('success');
            }
          }}
          className="px-10 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
        >
          Limpar Coleção Total
        </button>
      </div>
    </div>
  );
};

export default ImportExport;

