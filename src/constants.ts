import { Team, StickerType, StickerRarity, StickerStatus } from './types';

export const INITIAL_TEAMS: Team[] = [
  { id: 'fifa', nome: 'Copa do Mundo FIFA', grupo: '-', continente: 'Mundial', totalFigurinhas: 20, corPrincipal: '#01305D', corSecundaria: '#FFFFFF', bandeiraEmoji: '🏆' },
  
  // Grupo A
  { id: 'mex', nome: 'México', grupo: 'A', continente: 'América do Norte', totalFigurinhas: 20, corPrincipal: '#006847', corSecundaria: '#CE1126', bandeiraEmoji: '🇲🇽' },
  { id: 'rsa', nome: 'África do Sul', grupo: 'A', continente: 'África', totalFigurinhas: 20, corPrincipal: '#007A4D', corSecundaria: '#FFB612', bandeiraEmoji: '🇿🇦' },
  { id: 'kor', nome: 'Coreia do Sul', grupo: 'A', continente: 'Ásia', totalFigurinhas: 20, corPrincipal: '#C60C30', corSecundaria: '#003478', bandeiraEmoji: '🇰🇷' },
  { id: 'cze', nome: 'Tchéquia', grupo: 'A', continente: 'Europa', totalFigurinhas: 20, corPrincipal: '#11457E', corSecundaria: '#D7141A', bandeiraEmoji: '🇨🇿' },
  
  // Grupo B
  { id: 'can', nome: 'Canadá', grupo: 'B', continente: 'América do Norte', totalFigurinhas: 20, corPrincipal: '#FF0000', corSecundaria: '#FFFFFF', bandeiraEmoji: '🇨🇦' },
  { id: 'bih', nome: 'Bósnia e Herzegovina', grupo: 'B', continente: 'Europa', totalFigurinhas: 20, corPrincipal: '#002395', corSecundaria: '#FECB00', bandeiraEmoji: '🇧🇦' },
  { id: 'qat', nome: 'Catar', grupo: 'B', continente: 'Ásia', totalFigurinhas: 20, corPrincipal: '#8D1B3D', corSecundaria: '#FFFFFF', bandeiraEmoji: '🇶🇦' },
  { id: 'sui', nome: 'Suíça', grupo: 'B', continente: 'Europa', totalFigurinhas: 20, corPrincipal: '#D52B1E', corSecundaria: '#FFFFFF', bandeiraEmoji: '🇨🇭' },
  
  // Grupo C
  { id: 'bra', nome: 'Brasil', grupo: 'C', continente: 'América do Sul', totalFigurinhas: 20, corPrincipal: '#00843D', corSecundaria: '#FFCD00', bandeiraEmoji: '🇧🇷' },
  { id: 'mar', nome: 'Marrocos', grupo: 'C', continente: 'África', totalFigurinhas: 20, corPrincipal: '#C1272D', corSecundaria: '#006233', bandeiraEmoji: '🇲🇦' },
  { id: 'hai', nome: 'Haiti', grupo: 'C', continente: 'América Central', totalFigurinhas: 20, corPrincipal: '#00209F', corSecundaria: '#D21034', bandeiraEmoji: '🇭🇹' },
  { id: 'sco', nome: 'Escócia', grupo: 'C', continente: 'Europa', totalFigurinhas: 20, corPrincipal: '#004B87', corSecundaria: '#FFFFFF', bandeiraEmoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  
  // Grupo D
  { id: 'usa', nome: 'EUA', grupo: 'D', continente: 'América do Norte', totalFigurinhas: 20, corPrincipal: '#002868', corSecundaria: '#BF0A30', bandeiraEmoji: '🇺🇸' },
  { id: 'par', nome: 'Paraguai', grupo: 'D', continente: 'América do Sul', totalFigurinhas: 20, corPrincipal: '#D52B1E', corSecundaria: '#0038A8', bandeiraEmoji: '🇵🇾' },
  { id: 'aus', nome: 'Austrália', grupo: 'D', continente: 'Oceania', totalFigurinhas: 20, corPrincipal: '#000031', corSecundaria: '#FFCD00', bandeiraEmoji: '🇦🇺' },
  { id: 'tur', nome: 'Turquia', grupo: 'D', continente: 'Europa', totalFigurinhas: 20, corPrincipal: '#E30A17', corSecundaria: '#FFFFFF', bandeiraEmoji: '🇹🇷' },
  
  // Grupo E
  { id: 'ger', nome: 'Alemanha', grupo: 'E', continente: 'Europa', totalFigurinhas: 20, corPrincipal: '#000000', corSecundaria: '#DD0000', bandeiraEmoji: '🇩🇪' },
  { id: 'cuw', nome: 'Curaçao', grupo: 'E', continente: 'América Central', totalFigurinhas: 20, corPrincipal: '#002B7F', corSecundaria: '#F9E814', bandeiraEmoji: '🇨🇼' },
  { id: 'civ', nome: 'Costa do Marfim', grupo: 'E', continente: 'África', totalFigurinhas: 20, corPrincipal: '#FF8200', corSecundaria: '#009E60', bandeiraEmoji: '🇨🇮' },
  { id: 'ecu', nome: 'Equador', grupo: 'E', continente: 'América do Sul', totalFigurinhas: 20, corPrincipal: '#FFDD00', corSecundaria: '#0033A0', bandeiraEmoji: '🇪🇨' },
  
  // Grupo F
  { id: 'ned', nome: 'Países Baixos', grupo: 'F', continente: 'Europa', totalFigurinhas: 20, corPrincipal: '#F36C21', corSecundaria: '#00143E', bandeiraEmoji: '🇳🇱' },
  { id: 'jpn', nome: 'Japão', grupo: 'F', continente: 'Ásia', totalFigurinhas: 20, corPrincipal: '#000080', corSecundaria: '#FFFFFF', bandeiraEmoji: '🇯🇵' },
  { id: 'swe', nome: 'Suécia', grupo: 'F', continente: 'Europa', totalFigurinhas: 20, corPrincipal: '#006AA7', corSecundaria: '#FECC00', bandeiraEmoji: '🇸🇪' },
  { id: 'tun', nome: 'Tunísia', grupo: 'F', continente: 'África', totalFigurinhas: 20, corPrincipal: '#E70013', corSecundaria: '#FFFFFF', bandeiraEmoji: '🇹🇳' },
  
  // Grupo G
  { id: 'bel', nome: 'Bélgica', grupo: 'G', continente: 'Europa', totalFigurinhas: 20, corPrincipal: '#E30613', corSecundaria: '#000000', bandeiraEmoji: '🇧🇪' },
  { id: 'egy', nome: 'Egito', grupo: 'G', continente: 'África', totalFigurinhas: 20, corPrincipal: '#C8102E', corSecundaria: '#000000', bandeiraEmoji: '🇪🇬' },
  { id: 'irn', nome: 'Irã', grupo: 'G', continente: 'Ásia', totalFigurinhas: 20, corPrincipal: '#239F40', corSecundaria: '#DA0000', bandeiraEmoji: '🇮🇷' },
  { id: 'nzl', nome: 'Nova Zelândia', grupo: 'G', continente: 'Oceania', totalFigurinhas: 20, corPrincipal: '#000000', corSecundaria: '#FFFFFF', bandeiraEmoji: '🇳🇿' },
  
  // Grupo H
  { id: 'esp', nome: 'Espanha', grupo: 'H', continente: 'Europa', totalFigurinhas: 20, corPrincipal: '#AA151B', corSecundaria: '#F1BF00', bandeiraEmoji: '🇪🇸' },
  { id: 'cpv', nome: 'Cabo Verde', grupo: 'H', continente: 'África', totalFigurinhas: 20, corPrincipal: '#003893', corSecundaria: '#CF0921', bandeiraEmoji: '🇨🇻' },
  { id: 'ksa', nome: 'Arábia Saudita', grupo: 'H', continente: 'Ásia', totalFigurinhas: 20, corPrincipal: '#006C35', corSecundaria: '#FFFFFF', bandeiraEmoji: '🇸🇦' },
  { id: 'uru', nome: 'Uruguai', grupo: 'H', continente: 'América do Sul', totalFigurinhas: 20, corPrincipal: '#0038A8', corSecundaria: '#FFFFFF', bandeiraEmoji: '🇺🇾' },
  
  // Grupo I
  { id: 'fra', nome: 'França', grupo: 'I', continente: 'Europa', totalFigurinhas: 20, corPrincipal: '#002395', corSecundaria: '#ED2939', bandeiraEmoji: '🇫🇷' },
  { id: 'sen', nome: 'Senegal', grupo: 'I', continente: 'África', totalFigurinhas: 20, corPrincipal: '#00853F', corSecundaria: '#E31B23', bandeiraEmoji: '🇸🇳' },
  { id: 'irq', nome: 'Iraque', grupo: 'I', continente: 'Ásia', totalFigurinhas: 20, corPrincipal: '#007A3D', corSecundaria: '#DA121A', bandeiraEmoji: '🇮🇶' },
  { id: 'nor', nome: 'Noruega', grupo: 'I', continente: 'Europa', totalFigurinhas: 20, corPrincipal: '#BA0C2F', corSecundaria: '#00205B', bandeiraEmoji: '🇳🇴' },
  
  // Grupo J
  { id: 'arg', nome: 'Argentina', grupo: 'J', continente: 'América do Sul', totalFigurinhas: 20, corPrincipal: '#74ACDF', corSecundaria: '#FFFFFF', bandeiraEmoji: '🇦🇷' },
  { id: 'alg', nome: 'Argélia', grupo: 'J', continente: 'África', totalFigurinhas: 20, corPrincipal: '#006233', corSecundaria: '#D21034', bandeiraEmoji: '🇩🇿' },
  { id: 'aut', nome: 'Áustria', grupo: 'J', continente: 'Europa', totalFigurinhas: 20, corPrincipal: '#ED2939', corSecundaria: '#FFFFFF', bandeiraEmoji: '🇦🇹' },
  { id: 'jor', nome: 'Jordânia', grupo: 'J', continente: 'Ásia', totalFigurinhas: 20, corPrincipal: '#CE1126', corSecundaria: '#000000', bandeiraEmoji: '🇯🇴' },
  
  // Grupo K
  { id: 'por', nome: 'Portugal', grupo: 'K', continente: 'Europa', totalFigurinhas: 20, corPrincipal: '#AA151B', corSecundaria: '#046A38', bandeiraEmoji: '🇵🇹' },
  { id: 'cod', nome: 'RD Congo', grupo: 'K', continente: 'África', totalFigurinhas: 20, corPrincipal: '#007FFF', corSecundaria: '#F7D117', bandeiraEmoji: '🇨🇩' },
  { id: 'uzb', nome: 'Uzbequistão', grupo: 'K', continente: 'Ásia', totalFigurinhas: 20, corPrincipal: '#0099B5', corSecundaria: '#FFFFFF', bandeiraEmoji: '🇺🇿' },
  { id: 'col', nome: 'Colômbia', grupo: 'K', continente: 'América do Sul', totalFigurinhas: 20, corPrincipal: '#FCD116', corSecundaria: '#003893', bandeiraEmoji: '🇨🇴' },
  
  // Grupo L
  { id: 'eng', nome: 'Inglaterra', grupo: 'L', continente: 'Europa', totalFigurinhas: 20, corPrincipal: '#CE1124', corSecundaria: '#FFFFFF', bandeiraEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'cro', nome: 'Croácia', grupo: 'L', continente: 'Europa', totalFigurinhas: 20, corPrincipal: '#FF0000', corSecundaria: '#FFFFFF', bandeiraEmoji: '🇭🇷' },
  { id: 'gha', nome: 'Gana', grupo: 'L', continente: 'África', totalFigurinhas: 20, corPrincipal: '#EF3340', corSecundaria: '#FFCD00', bandeiraEmoji: '🇬🇭' },
  { id: 'pan', nome: 'Panamá', grupo: 'L', continente: 'América Central', totalFigurinhas: 20, corPrincipal: '#DA121A', corSecundaria: '#00205B', bandeiraEmoji: '🇵🇦' },

  { id: 'coke', nome: 'Coca-Cola', grupo: 'Extra', continente: '-', totalFigurinhas: 12, corPrincipal: '#F40009', corSecundaria: '#FFFFFF', bandeiraEmoji: '🥤' },
  { id: 'museum', nome: 'FIFA Museum', grupo: 'Extra', continente: '-', totalFigurinhas: 11, corPrincipal: '#1D428A', corSecundaria: '#FFFFFF', bandeiraEmoji: '🏛️' },
];

export const COLORS = {
  primary: '#0B1D51',
  accent: '#005BBB',
  red: '#E10600',
  green: '#00843D',
  white: '#FFFFFF',
  black: '#0B0B0F',
  lightGray: '#F4F6F8',
  gold: '#D4AF37',
};

export const MOCK_STICKERS_DATA = [
  { codigo: 'BRA1', nome: 'Escudo Brasil', timeId: 'bra', tipo: StickerType.ESCUDO, raridade: StickerRarity.ESPECIAL, isEspecial: true },
  { codigo: 'BRA10', nome: 'Neymar Jr', timeId: 'bra', tipo: StickerType.JOGADOR, raridade: StickerRarity.RARA, isEspecial: false },
  { codigo: 'ARG10', nome: 'Lionel Messi', timeId: 'arg', tipo: StickerType.JOGADOR, raridade: StickerRarity.LEGEND, isLegend: true },
  { codigo: 'LEG1', nome: 'Pelé', timeId: 'leg', tipo: StickerType.LEGEND, raridade: StickerRarity.LEGEND, isLegend: true },
  { codigo: 'USA1', nome: 'Pulisic', timeId: 'usa', tipo: StickerType.JOGADOR, raridade: StickerRarity.COMUM, isEspecial: false },
];
