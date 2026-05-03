import React, { useState } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, History, DollarSign, Trash2 } from 'lucide-react';
import { CollectionData, Transaction, TransactionType, CollectionStats, PackageSource } from '../types';
import { formatCurrency } from '../utils/collectionUtils';

interface FinanceProps {
  data: CollectionData;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  stats: CollectionStats;
}

const Finance: React.FC<FinanceProps> = ({ data, addTransaction, deleteTransaction, stats }) => {
  const [form, setForm] = useState({
    tipo: TransactionType.COMPRA_PACOTE,
    descricao: '',
    valor: '',
    quantidadePacotes: '1',
    origemPacote: PackageSource.PANINI,
    data: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.descricao || !form.valor) return;

    addTransaction({
      tipo: form.tipo,
      descricao: form.descricao,
      valor: parseFloat(form.valor),
      data: form.data,
      quantidadePacotes: form.tipo === TransactionType.COMPRA_PACOTE ? parseInt(form.quantidadePacotes) : undefined,
      origemPacote: form.tipo === TransactionType.COMPRA_PACOTE ? form.origemPacote : undefined
    });

    setForm({
      tipo: TransactionType.COMPRA_PACOTE,
      descricao: '',
      valor: '',
      quantidadePacotes: '1',
      origemPacote: PackageSource.PANINI,
      data: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 text-center md:text-left">
        <div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-primary-dark">Financeiro da Coleção</h2>
          <p className="text-sm text-gray-500 font-medium">Controle seus gastos e investimentos no álbum.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-1 space-y-6">
          {/* Form */}
          <div className="glass-card p-5 md:p-6 border border-primary-blue/10 shadow-xl shadow-primary-blue/5">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <Plus className="text-primary-blue" size={20} />
              Lançar Movimentação
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Tipo</label>
                  <select 
                    className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20"
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value as any })}
                  >
                    {Object.values(TransactionType).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Descrição</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 10 pacotinhos"
                    className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20"
                    value={form.descricao}
                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Valor (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="0,00"
                    className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 font-black text-base focus:outline-none focus:ring-2 focus:ring-primary-blue/20"
                    value={form.valor}
                    onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  />
                </div>
                {form.tipo === TransactionType.COMPRA_PACOTE && (
                  <>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Origem do Pacote</label>
                      <select 
                        className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20"
                        value={form.origemPacote}
                        onChange={(e) => setForm({ ...form, origemPacote: e.target.value as PackageSource })}
                      >
                        {Object.values(PackageSource).map(source => (
                          <option key={source} value={source}>{source === PackageSource.PANINI ? 'Panini (7 figs)' : 'McDonald\'s (5 figs)'}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Quantidade Envelopes</label>
                      <input 
                        type="number" 
                        min="1"
                        className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20"
                        value={form.quantidadePacotes}
                        onChange={(e) => setForm({ ...form, quantidadePacotes: e.target.value })}
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Data</label>
                  <input 
                    type="date" 
                    className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20"
                    value={form.data}
                    onChange={(e) => setForm({ ...form, data: e.target.value })}
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-3 md:py-4 bg-primary-dark text-white rounded-xl font-bold text-sm md:text-base hover:bg-primary-blue transition-all shadow-lg active:scale-95"
              >
                Confirmar Lançamento
              </button>
            </form>
          </div>

          <div className="glass-card premium-gradient p-6 text-white">
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Custo Médio p/ Figurinha</p>
            <h4 className="text-3xl font-display font-black">
              {stats.totalFigurinhasCompradas > 0 ? formatCurrency(stats.investimentoTotal / stats.totalFigurinhasCompradas) : 'R$ 0,00'}
            </h4>
            <p className="text-white/50 text-[10px] mt-2 italic">* Baseado no total de figurinhas adquiridas via pacotes ({stats.totalFigurinhasCompradas} figs).</p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="glass-card p-6 flex items-center gap-4 bg-white border border-world-green/10">
               <div className="p-3 bg-world-green/10 text-world-green rounded-xl">
                 <ArrowUpRight size={24} />
               </div>
               <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Investido</p>
                  <p className="text-2xl font-display font-bold text-primary-dark">{formatCurrency(stats.investimentoTotal)}</p>
               </div>
             </div>
             <div className="glass-card p-6 flex items-center gap-4 bg-white border border-world-red/10">
               <div className="p-3 bg-world-red/10 text-world-red rounded-xl">
                 <ArrowDownRight size={24} />
               </div>
               <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Valor Recuperado</p>
                  <p className="text-2xl font-display font-bold text-primary-dark">{formatCurrency(stats.valorRecuperado)}</p>
               </div>
             </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2 text-primary-dark">
              <History className="text-primary-blue" size={24} />
              Histórico de Movimentações
            </h3>
            <div className="space-y-4">
              {data.transactions && data.transactions.length > 0 ? data.transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${t.valor > 0 ? 'bg-world-green/10 text-world-green' : 'bg-world-red/10 text-world-red'}`}>
                      <DollarSign size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.descricao}</p>
                      <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">
                        {t.tipo} {t.quantidadePacotes ? `(${t.quantidadePacotes} envelopes ${t.origemPacote === PackageSource.MCDONALDS ? 'Mc' : 'Panini'})` : ''} • {(() => {
                          const [year, month, day] = t.data.split('-');
                          return `${day}/${month}/${year}`;
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-black ${t.valor > 0 ? 'text-primary-dark' : 'text-world-red'}`}>
                        {formatCurrency(t.valor)}
                      </p>
                    </div>
                    <button 
                      onClick={() => deleteTransaction(t.id)}
                      className="p-2 text-gray-300 hover:text-world-red hover:bg-world-red/5 rounded-lg transition-colors"
                      title="Excluir lançamento"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-gray-400">
                  <Wallet size={32} className="mx-auto mb-4 opacity-20" />
                  <p>Nenhuma movimentação cadastrada ainda.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance;
