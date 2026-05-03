import { Sticker, StickerType, StickerRarity, StickerStatus } from '../types';

export interface ParseSummary {
  totalLines: number;
  imported: number;
  ignored: number;
  specials: number;
  teams: Set<string>;
  teamCounts: Record<string, number>;
  duplicates: string[];
  errors: string[];
}

export const parseRawChecklist = (text: string): { stickers: Sticker[], summary: ParseSummary } => {
  const lines = text.split('\n');
  const stickers: Sticker[] = [];
  const codes = new Set<string>();
  
  const summary: ParseSummary = {
    totalLines: lines.length,
    imported: 0,
    ignored: 0,
    specials: 0,
    teams: new Set(),
    teamCounts: {},
    duplicates: [],
    errors: []
  };

  let currentSection = 'Seleções';
  let currentSelectionFromHeader = '';
  let globalIndex = 0;

  // Regex patterns
  const foilPattern = /FOIL/i;
  const legendPattern = /Legend|Lenda/i;
  const sectionHeaderPattern = /^(###|##|#)\s+(.+)$/; 

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 2) {
      if (trimmed.length > 0) summary.ignored++;
      return;
    }

    // Check for section headers (e.g., ### México)
    const headerMatch = trimmed.match(sectionHeaderPattern);
    if (headerMatch) {
      currentSelectionFromHeader = headerMatch[2].trim();
      currentSection = 'Seleções';
      return;
    }

    // Skip purely informative lines (like "980 stickers", "Base Stickers Checklist")
    if (/stickers\.?$/i.test(trimmed) || /Exclusive Parallels/i.test(trimmed) || /Listed in Album order/i.test(trimmed)) {
      summary.ignored++;
      return;
    }

    let code = '';
    let name = '';
    let selection = currentSelectionFromHeader;
    let isFoil = foilPattern.test(trimmed);
    let isLegend = legendPattern.test(trimmed);

    // Formato: México - Luis Malagón (MEX2)
    const invertedMatch = trimmed.match(/^(.*?)\s+-\s+(.*?)\s+(?:FOIL\s+)?\((.*?)\)$/i);
    // Formato: MEX2 Luis Malagón - México
    const standardMatchWithDash = trimmed.match(/^([A-Z0-9]+)\s+(.*?)\s+-\s+(.*?)(?:\s+FOIL)?$/i);
    // Formato: 00 Panini Logo FOIL
    const simpleCodeNameFoil = trimmed.match(/^([A-Z0-9]{1,6})\s+(.*?)(?:\s+FOIL)?$/i);
    
    if (invertedMatch) {
        selection = invertedMatch[1].trim();
        name = invertedMatch[2].trim();
        code = invertedMatch[3].trim();
    } else if (standardMatchWithDash) {
        code = standardMatchWithDash[1].trim();
        name = standardMatchWithDash[2].trim();
        selection = standardMatchWithDash[3].trim();
    } else if (simpleCodeNameFoil) {
        code = simpleCodeNameFoil[1].trim();
        const rawName = simpleCodeNameFoil[2].trim();
        
        // Trata nomes que tem um traço como "Lamine Yamal - Espanha"
        const dashSplit = rawName.split(' - ');
        if (dashSplit.length > 1) {
            name = dashSplit[0].trim();
            selection = dashSplit[1].replace(/FOIL/i, '').trim();
        } else {
            name = rawName;
        }

        // Se for apenas número ou começar com FWC, provavelmente é uma seção especial
        if (/^\d+$/.test(code) || code.startsWith('FWC')) {
            if (!selection) selection = 'Copa do Mundo FIFA 2026';
            currentSection = 'Introdução';
        }
    }

    // Refina a seleção baseada no prefixo do código (ex: BRA -> Brasil)
    if (code && !selection) {
        const prefix = code.match(/^[A-Z]+/)?.[0];
        if (prefix === 'FWC') selection = 'Copa do Mundo FIFA 2026';
        else if (prefix === 'MEX') selection = 'México';
        else if (prefix === 'BRA') selection = 'Brasil';
        else if (prefix === 'USA') selection = 'EUA';
        else if (prefix === 'CAN') selection = 'Canadá';
        else if (prefix === 'GER') selection = 'Alemanha';
        else if (prefix === 'ENG') selection = 'Inglaterra';
        else if (prefix === 'FRA') selection = 'França';
        else if (prefix === 'ARG') selection = 'Argentina';
        else if (prefix === 'URU') selection = 'Uruguai';
        else if (prefix === 'NED') selection = 'Países Baixos';
        else if (prefix === 'SUI') selection = 'Suíça';
        else if (prefix === 'CRO') selection = 'Croácia';
        else if (prefix === 'BEL') selection = 'Bélgica';
        else if (prefix === 'POR') selection = 'Portugal';
        else if (prefix === 'ESP') selection = 'Espanha';
        // etc...
    }

    // Special mappings for sections
    if (code === '00' || name.toLowerCase().includes('panini logo')) {
        selection = 'Introdução';
        currentSection = 'Introdução';
    }

    // If still no code, try to handle bulleted list items: * Luis Malágon
    if (!code) {
        const bulletMatch = trimmed.match(/^[\*\-]\s+(.*)$/);
        if (bulletMatch) {
            name = bulletMatch[1].replace(/FOIL/i, '').trim();
            // Prefix selection if available
            const prefix = selection ? selection.substring(0, 3).toUpperCase() : 'TEMP';
            const count = (summary.teamCounts[selection || 'Unassigned'] || 0) + 1;
            code = `${prefix}-TEMP-${count.toString().padStart(3, '0')}`;
            summary.errors.push(`Código gerado: ${code} para "${name}"`);
        } else if (trimmed.length > 5) {
            // General text that might be a name
            name = trimmed.replace(/FOIL/i, '').trim();
            code = `TEMP-${(++globalIndex).toString().padStart(3, '0')}`;
            summary.errors.push(`Linha duvidosa, código gerado: ${code} para "${trimmed}"`);
        }
    }

    if (!code || !name) {
        summary.ignored++;
        return;
    }

    // Determine type
    let type = StickerType.JOGADOR;
    const lowerName = name.toLowerCase();
    const lowerSelection = selection.toLowerCase();
    
    // Determine timeId based on selection name or code prefix
    let timeId = selection ? selection.toLowerCase().replace(/\s+/g, '-') : 'unassigned';
    
    // Better mapping for our known IDs
    if (lowerSelection.includes('museum')) {
        timeId = 'museum';
    } else if (code.startsWith('FWC')) {
        timeId = 'fifa';
    } else if (code.startsWith('COKE')) {
        timeId = 'coke';
    } else {
        const prefixMatch = code.match(/^([A-Z]{3})/i);
        if (prefixMatch) {
            timeId = prefixMatch[1].toLowerCase();
        }
    }

    if (lowerName.includes('team logo') || lowerName.includes('escudo')) type = StickerType.ESCUDO;
    else if (lowerName.includes('team photo') || lowerName.includes('foto da equipe')) type = StickerType.FOTO_EQUIPE;
    else if (lowerName.includes('official emblem') || lowerName.includes('emblema oficial')) type = StickerType.EMBLEMA;
    else if (lowerName.includes('mascot')) type = StickerType.MASCOTE;
    else if (lowerName.includes('slogan')) type = StickerType.SLOGAN;
    else if (lowerName.includes('ball') || lowerName.includes('bola')) type = StickerType.BOLA;
    else if (lowerName.includes('host countries') || lowerName.includes('cidade-sede')) type = StickerType.ESTADIO;
    else if (lowerName.includes('fifa museum') || lowerName.includes('museu')) {
        type = StickerType.OUTRO;
        timeId = 'museum';
    }

    const sticker: Sticker = {
      id: `imp-${Date.now()}-${globalIndex++}`,
      codigo: code,
      numeroGlobal: globalIndex,
      nome: name,
      timeId: timeId,
      timeNome: selection || 'A definir',
      siglaSelecao: selection ? selection.substring(0, 3).toUpperCase() : '',
      paginaAlbum: Math.ceil(globalIndex / 20),
      secaoAlbum: currentSection,
      categoria: isFoil ? 'Especial' : 'Comum',
      tipo: type,
      raridade: isFoil ? StickerRarity.ESPECIAL : StickerRarity.COMUM,
      status: StickerStatus.FALTA,
      quantidade: 0,
      isEspecial: isFoil,
      isLegend: isLegend,
      isFoil: isFoil,
      tenho: false,
      repetida: false,
      quantidadeRepetida: 0,
      faltante: true,
      prioridade: 'Normal',
      favorito: false,
      valorPago: 0,
      valorEstimado: 0,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    if (codes.has(code)) {
      summary.duplicates.push(code);
    }
    codes.add(code);

    stickers.push(sticker);
    summary.imported++;
    if (isFoil) summary.specials++;
    const effSelection = selection || 'A definir';
    summary.teams.add(effSelection);
    summary.teamCounts[effSelection] = (summary.teamCounts[effSelection] || 0) + 1;
  });

  return { stickers, summary };
};

export const exportToCSV = (stickers: Sticker[]) => {
  const headers = [
    'codigo', 'numeroGlobal', 'nome', 'selecao', 'siglaSelecao', 'secaoAlbum',
    'categoria', 'tipo', 'raridade', 'especial', 'legend', 'foil',
    'quantidade', 'tenho', 'repetida', 'quantidadeRepetida', 'faltante',
    'prioridade', 'favorito', 'valorPago', 'valorEstimado', 'origem',
    'dataObtida', 'observacao'
  ];

  const rows = stickers.map(s => [
    `"${s.codigo}"`,
    s.numeroGlobal,
    `"${s.nome}"`,
    `"${s.timeNome}"`,
    `"${s.siglaSelecao || ''}"`,
    `"${s.secaoAlbum || ''}"`,
    `"${s.categoria}"`,
    `"${s.tipo}"`,
    `"${s.raridade}"`,
    s.isEspecial,
    s.isLegend,
    s.isFoil,
    s.quantidade,
    s.tenho,
    s.repetida,
    s.quantidadeRepetida,
    s.faltante,
    `"${s.prioridade}"`,
    s.favorito,
    s.valorPago || 0,
    s.valorEstimado || 0,
    `"${s.origem || ''}"`,
    `"${s.dataObtida || ''}"`,
    `"${s.observacao || ''}"`
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
};

export const exportToJSON = (stickers: Sticker[]) => {
    return JSON.stringify(stickers, null, 2);
};

