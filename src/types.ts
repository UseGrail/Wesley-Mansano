/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum StickerStatus {
  TENHO = 'Tenho',
  FALTA = 'Falta',
  REPETIDA = 'Repetida',
  TROCADA = 'Trocada',
  RESERVADA = 'Reservada',
  DESEJO = 'Desejo',
  COMPRADA = 'Comprada',
}

export enum StickerType {
  JOGADOR = 'Jogador',
  ESCUDO = 'Escudo da Seleção',
  FOTO_EQUIPE = 'Foto da Equipe',
  ESTADIO = 'Estádio',
  MASCOTE = 'Mascotes Oficiais',
  ESPECIAL = 'Especial',
  LEGEND = 'Legend',
  MOMENTO = 'Momento Histórico',
  CIDADE = 'Cidade-sede',
  SINAL = 'Símbolo',
  BOLA = 'Bola Oficial',
  EMBLEMA = 'Emblema Oficial',
  SLOGAN = 'Slogan Oficial',
  OUTRO = 'Outro',
}

export enum StickerRarity {
  COMUM = 'Comum',
  INCOMUM = 'Incomum',
  RARA = 'Rara',
  SUPER_RARA = 'Super Rara',
  ESPECIAL = 'Especial',
  LEGEND = 'Legend',
  BRONZE = 'Bronze',
  PRATA = 'Prata',
  OURO = 'Ouro',
  HOLO = 'Holo',
  DOURADA = 'Dourada',
  PAIXAO = 'Paixão/Foil',
}

export interface Team {
  id: string;
  nome: string;
  sigla?: string;
  grupo?: string;
  continente?: string;
  totalFigurinhas: number;
  corPrincipal: string; // HEX
  corSecundaria?: string; // HEX
  bandeiraEmoji?: string;
  paginaInicial?: number;
}

export interface Sticker {
  id: string;
  codigo: string;
  numeroGlobal?: number;
  nome: string;
  timeId: string;
  timeNome: string;
  siglaSelecao?: string;
  paginaAlbum: number;
  posicaoNaPagina?: number;
  secaoAlbum?: string;
  categoria: string;
  tipo: StickerType;
  posicaoJogador?: string; // Goleiro, Defensor, etc.
  raridade: StickerRarity;
  isEspecial: boolean;
  isLegend: boolean;
  isFoil: boolean;
  quantidade: number;
  status: StickerStatus;
  prioridade: 'Baixa' | 'Média' | 'Alta' | 'Muito Alta' | 'Essencial' | 'Normal';
  favorito: boolean;
  tenho: boolean;
  repetida: boolean;
  quantidadeRepetida: number;
  faltante: boolean;
  valorPago?: number;
  valorEstimado?: number;
  dataObtida?: string;
  origem?: string;
  observacao?: string;
  imageUrl?: string;
  localImageBase64?: string;
  imageSource?: 'upload_manual' | 'url_manual' | 'placeholder';
  hasCustomImage?: boolean;
  imageUploadedAt?: string;
  imageAlt?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export enum TransactionType {
  COMPRA_PACOTE = 'Compra de Pacotinho',
  COMPRA_AVULSA = 'Compra Avulsa',
  TROCA_CUSTO = 'Troca com Custo',
  VENDA_REPETIDA = 'Venda de Repetida',
  FRETE = 'Frete',
  OUTRO = 'Outro',
}

export enum PackageSource {
  PANINI = 'Panini',
  MCDONALDS = 'McDonald\'s',
}

export interface Transaction {
  id: string;
  tipo: TransactionType;
  descricao: string;
  valor: number;
  data: string;
  quantidadePacotes?: number; // Nova propriedade para contar envelopes
  origemPacote?: PackageSource; // Origem para cálculo de figurinhas
  relacionadoAStickerId?: string;
  observacao?: string;
}

export interface CollectionStats {
  totalCadastradas: number;
  totalUnicasTenho: number;
  totalFaltantes: number;
  totalRepetidas: number;
  totalEspeciais: number;
  totalEspeciaisTenho: number;
  totalLegends: number;
  totalLegendsTenho: number;
  percentualConcluido: number;
  percentualEspeciais: number;
  percentualLegends: number;
  timesFinalizados: number;
  timesQuaseFinalizados: number;
  paginasCompletas: number;
  investimentoTotal: number;
  valorRecuperado: number;
  envelopesComprados: number;
  totalFigurinhasCompradas: number;
}

export interface CollectionData {
  ownerName: string;
  albumName: string;
  totalEsperadoCromos: number;
  totalEsperadoEspeciais: number;
  stickers: Sticker[];
  teams: Team[];
  transactions: Transaction[];
  settings: {
    currency: string;
    darkMode: boolean;
    compactMode: boolean;
    animationsEnabled: boolean;
    teamLabel: 'Seleções' | 'Times' | 'Clubes';
  };
}
