import { Sticker, Team, Transaction, CollectionStats, StickerStatus, TransactionType } from '../types';

export const calculateCollectionStats = (
  stickers: Sticker[],
  transactions: Transaction[],
  targetTotal: number = 980,
  targetSpecials: number = 68
): CollectionStats => {
  let totalRepetidas = 0;
  let totalUnicasTenho = 0;
  let totalEspeciaisTenho = 0;
  let totalLegendsTenho = 0;
  
  const specials: Sticker[] = [];
  const legends: Sticker[] = [];
  const stickersByPage: Record<number, Sticker[]> = {};
  const stickersByTeam: Record<string, Sticker[]> = {};

  // Single pass through stickers to collect data for various stats
  stickers.forEach(s => {
    const isOwned = s.quantidade >= 1;
    
    if (!s.isLegend && isOwned) totalUnicasTenho++;
    if (s.quantidade > 1) totalRepetidas += (s.quantidade - 1);
    
    if (s.isEspecial) {
      specials.push(s);
      if (isOwned) totalEspeciaisTenho++;
    }
    
    if (s.isLegend) {
      legends.push(s);
      if (isOwned) totalLegendsTenho++;
    }
    
    if (!stickersByPage[s.paginaAlbum]) stickersByPage[s.paginaAlbum] = [];
    stickersByPage[s.paginaAlbum].push(s);
    
    if (s.timeId && s.timeId !== 'unassigned' && s.timeId !== 'spec') {
      if (!stickersByTeam[s.timeId]) stickersByTeam[s.timeId] = [];
      stickersByTeam[s.timeId].push(s);
    }
  });

  const totalFaltantes = Math.max(0, targetTotal - totalUnicasTenho);
  const totalEspeciais = Math.max(targetSpecials, specials.length);
  const totalLegends = legends.length;

  const percentualConcluido = targetTotal > 0 ? (totalUnicasTenho / targetTotal) * 100 : 0;
  const percentualEspeciais = totalEspeciais > 0 ? (totalEspeciaisTenho / totalEspeciais) * 100 : 0;
  const percentualLegends = totalLegends > 0 ? (totalLegendsTenho / totalLegends) * 100 : 0;

  // Pages
  let paginasCompletas = 0;
  Object.values(stickersByPage).forEach(pageStickers => {
    if (pageStickers.length > 0 && pageStickers.every(s => s.quantidade >= 1)) {
      paginasCompletas++;
    }
  });

  // Teams
  let timesFinalizados = 0;
  let timesQuaseFinalizados = 0;
  Object.values(stickersByTeam).forEach(teamStickers => {
    const teamOwned = teamStickers.filter(s => s.quantidade >= 1).length;
    const progress = (teamOwned / teamStickers.length) * 100;
    if (progress === 100) timesFinalizados++;
    if (progress >= 80 && progress < 100) timesQuaseFinalizados++;
  });

  const investimentoTotal = transactions
    .filter(t => t.valor > 0)
    .reduce((acc, curr) => acc + curr.valor, 0);

  const valorRecuperado = transactions
    .filter(t => t.valor < 0)
    .reduce((acc, curr) => acc + Math.abs(curr.valor), 0);

  const envelopesComprados = transactions
    .filter(t => t.tipo === TransactionType.COMPRA_PACOTE)
    .reduce((acc, curr) => acc + (curr.quantidadePacotes || 1), 0);

  const totalFigurinhasCompradas = transactions
    .filter(t => t.tipo === TransactionType.COMPRA_PACOTE)
    .reduce((acc, curr) => {
      const qtdEnvelopes = curr.quantidadePacotes || 1;
      const figurinhasPorEnvelope = curr.origemPacote === 'McDonald\'s' ? 5 : 7; // User specified: 5 for Mc, 7 for Panini (default)
      return acc + (qtdEnvelopes * figurinhasPorEnvelope);
    }, 0);

  return {
    totalCadastradas: targetTotal,
    totalUnicasTenho,
    totalFaltantes,
    totalRepetidas,
    totalEspeciais,
    totalEspeciaisTenho,
    totalLegends,
    totalLegendsTenho,
    percentualConcluido,
    percentualEspeciais,
    percentualLegends,
    timesFinalizados,
    timesQuaseFinalizados,
    paginasCompletas,
    investimentoTotal,
    valorRecuperado,
    envelopesComprados,
    totalFigurinhasCompradas
  };
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};
