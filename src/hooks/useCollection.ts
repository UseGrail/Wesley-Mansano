import { useState, useEffect, useCallback, useRef } from 'react';
import { Sticker, Team, Transaction, CollectionData, StickerStatus, StickerType, StickerRarity } from '../types';
import { INITIAL_TEAMS } from '../constants';
import { OFFICIAL_CHECKLIST_TEXT } from '../constants/officialData';
import { parseRawChecklist } from '../utils/checklistParser';
import { validateStickerUpdate } from '../utils/validation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'meu-album-2026-data-v2';

const initialData: CollectionData = {
  ownerName: 'Colecionador',
  albumName: 'Meu Álbum 2026',
  totalEsperadoCromos: 980,
  totalEsperadoEspeciais: 68,
  stickers: [],
  teams: INITIAL_TEAMS,
  transactions: [],
  settings: {
    currency: 'R$',
    darkMode: false,
    compactMode: false,
    animationsEnabled: true,
    teamLabel: 'Seleções',
  },
};

const legendPlayers = [
  'Lionel Messi', 'Cristiano Ronaldo', 'Neymar Jr', 'Kylian Mbappé', 'Erling Haaland',
  'Jude Bellingham', 'Vinícius Júnior', 'Mohamed Salah', 'Kevin De Bruyne', 'Harry Kane',
  'Rodri', 'Lautaro Martínez', 'Son Heung-min', 'Robert Lewandowski', 'Luka Modric',
  'Antoine Griezmann', 'Bukayo Saka', 'Florian Wirtz', 'Jamal Musiala', 'Lamine Yamal'
];

const legendVariants = [
  { suffix: 'REG', name: 'Base', rarity: StickerRarity.LEGEND },
  { suffix: 'BRONZE', name: 'Bronze', rarity: StickerRarity.BRONZE },
  { suffix: 'PRATA', name: 'Prata', rarity: StickerRarity.PRATA },
  { suffix: 'OURO', name: 'Ouro', rarity: StickerRarity.OURO }
];

// Generates stickers using the official parsed data
const generatePlaceholders = (): Sticker[] => {
  const { stickers: parsedStickers } = parseRawChecklist(OFFICIAL_CHECKLIST_TEXT);
  const stickers: Sticker[] = [];
  
  // 1. Process Teams (48 teams x 20 stickers + FIFA)
  let globalPage = 1;
  INITIAL_TEAMS.forEach((team) => {
    if (team.grupo === 'Extra') return; // Skip Coke/Museum for now

    const isFifa = team.id === 'fifa';
    const totalFigs = team.totalFigurinhas;

    for (let i = 1; i <= totalFigs; i++) {
        let code = '';
        if (isFifa) {
            code = i === 1 ? '00' : `FWC${i - 1}`;
        } else {
            code = `${team.id.toUpperCase()}${i}`;
        }

        const existing = parsedStickers.find(s => s.codigo === code);
        
        const sticker: Sticker = existing || {
            id: `p-${team.id}-${i}`,
            codigo: code,
            numeroGlobal: 0, 
            nome: i === 1 ? (isFifa ? 'Logo Panini' : `Escudo ${team.nome}`) : 
                  i === 13 && !isFifa ? `Time Inteiro ${team.nome}` : 
                  `Jogador ${i}`,
            timeId: team.id,
            timeNome: team.nome,
            paginaAlbum: globalPage,
            posicaoNaPagina: i - 1,
            categoria: (i === 1 || (i === 13 && !isFifa)) ? 'Especial' : 'Comum',
            tipo: i === 1 ? (isFifa ? StickerType.EMBLEMA : StickerType.ESCUDO) : 
                  (i === 13 && !isFifa) ? StickerType.FOTO_EQUIPE : 
                  StickerType.JOGADOR,
            raridade: (i === 1 || (i === 13 && !isFifa)) ? StickerRarity.ESPECIAL : StickerRarity.COMUM,
            status: StickerStatus.FALTA,
            quantidade: 0,
            isEspecial: i === 1 || (i === 13 && !isFifa),
            isLegend: false,
            isFoil: i === 1 || (i === 13 && !isFifa),
            prioridade: 'Normal',
            favorito: false,
            tenho: false,
            repetida: false,
            quantidadeRepetida: 0,
            faltante: true,
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString(),
        };

        sticker.paginaAlbum = globalPage;
        sticker.posicaoNaPagina = i - 1;
        
        // Final polish for FWC items from checklist
        if (isFifa && existing) {
            sticker.isEspecial = sticker.nome.toLowerCase().includes('foil');
        }

        stickers.push(sticker);
    }
    globalPage += 1;
  });

  // 2. Extra Stickers (Legends - 80 stickers)
  legendPlayers.forEach((player, pIdx) => {
    legendVariants.forEach((variant) => {
      const code = `LEG-${(pIdx + 1).toString().padStart(2, '0')}-${variant.suffix}`;
      stickers.push({
        id: `legend-${code}`,
        codigo: code,
        numeroGlobal: 1000 + stickers.length,
        nome: `${player} (${variant.name})`,
        timeId: 'legends',
        timeNome: 'Legends',
        paginaAlbum: 99, // Separate section
        posicaoNaPagina: stickers.length,
        categoria: 'Legend',
        tipo: StickerType.LEGEND,
        raridade: variant.rarity,
        status: StickerStatus.FALTA,
        quantidade: 0,
        isEspecial: true,
        isLegend: true,
        isFoil: true,
        prioridade: 'Normal',
        favorito: false,
        tenho: false,
        repetida: false,
        quantidadeRepetida: 0,
        faltante: true,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      });
    });
  });

  // Final numbering update
  stickers.forEach((s, idx) => {
    if (!s.numeroGlobal) s.numeroGlobal = idx + 1;
  });

  return stickers;
};

export const useCollection = () => {
  const { user } = useAuth();
  const [data, setData] = useState<CollectionData>(() => {
    // ... we need to be careful with initialization here
    // If not logged in, fetch from localstorage immediately
    if (!user) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    }
    return { ...initialData, stickers: generatePlaceholders() };
  });

  // Sync effect
  useEffect(() => {
    async function loadData() {
      if (user) {
        // Reset to initial state while loading to avoid data leakage
        setData({ ...initialData, stickers: generatePlaceholders() });
        
        const docRef = doc(db, 'collections', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(docSnap.data().data as CollectionData);
        } else {
             // For new user, persist the current state (if any)
            await setDoc(docRef, { uid: user.uid, data: JSON.parse(JSON.stringify(data)) });
        }
      } else {
        // If logged out, reset to local storage or initial
        const storageKey = `${STORAGE_KEY}-guest`;
        const saved = localStorage.getItem(storageKey);
        setData(saved ? JSON.parse(saved) : { ...initialData, stickers: generatePlaceholders() });
      }
    }
    loadData();
  }, [user]);

  // Save effect
  const lastSavedData = useRef<string | null>(null);

  useEffect(() => {
    const getStorageKey = () => user ? `${STORAGE_KEY}-${user.uid}` : `${STORAGE_KEY}-guest`;

    if (!user) {
      localStorage.setItem(getStorageKey(), JSON.stringify(data));
      return;
    }

    const currentDataString = JSON.stringify(data);
    if (lastSavedData.current === currentDataString) {
      return;
    }

    const handler = setTimeout(() => {
      const docRef = doc(db, 'collections', user!.uid);
      setDoc(docRef, { uid: user!.uid, data: JSON.parse(currentDataString) })
        .then(() => {
          lastSavedData.current = currentDataString;
        })
        .catch(err => console.error("Error saving to Firebase:", err));
    }, 5000); // 5 seconds debounce

    return () => clearTimeout(handler);
  }, [data, user]);

  const updateSticker = useCallback((stickerId: string, updates: Partial<Sticker>) => {
    // Optimization: Don't keep large base64 in the main collection state if it's already in IDB
    const rawUpdates = { ...updates };
    if (rawUpdates.localImageBase64) {
      delete rawUpdates.localImageBase64;
    }
    
    // Apply robust validation
    const cleanUpdates = validateStickerUpdate(rawUpdates);

    setData(prev => ({
      ...prev,
      stickers: prev.stickers.map(s => {
        if (s.id === stickerId) {
          const updated = { ...s, ...cleanUpdates };
          
          // Sync quantities and booleans
          updated.tenho = updated.quantidade >= 1;
          updated.repetida = updated.quantidade > 1;
          updated.quantidadeRepetida = Math.max(0, updated.quantidade - 1);
          updated.faltante = updated.quantidade === 0;

          if (updated.quantidade >= 1) {
            updated.status = updated.quantidade > 1 ? StickerStatus.REPETIDA : StickerStatus.TENHO;
          } else {
            updated.status = StickerStatus.FALTA;
          }
          return updated;
        }
        return s;
      })
    }));
  }, []);

  const addSticker = useCallback((stickerBody: Omit<Sticker, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    const newSticker: Sticker = {
      ...stickerBody,
      id,
      tenho: stickerBody.quantidade >= 1,
      repetida: stickerBody.quantidade > 1,
      quantidadeRepetida: Math.max(0, (stickerBody.quantidade || 0) - 1),
      faltante: stickerBody.quantidade === 0,
      criadoEm: now,
      atualizadoEm: now,
    };
    setData(prev => ({
      ...prev,
      stickers: [...prev.stickers, newSticker]
    }));
  }, []);

  const deleteSticker = useCallback((stickerId: string) => {
    setData(prev => ({
      ...prev,
      stickers: prev.stickers.filter(s => s.id !== stickerId)
    }));
  }, []);

  const toggleStickerOwned = useCallback((stickerId: string) => {
    setData(prev => ({
      ...prev,
      stickers: prev.stickers.map(s => {
        if (s.id === stickerId) {
          const isOwned = s.quantidade > 0;
          const newQty = isOwned ? 0 : 1;
          return {
            ...s,
            quantidade: newQty,
            status: newQty > 0 ? StickerStatus.TENHO : StickerStatus.FALTA,
            dataObtida: newQty > 0 ? new Date().toISOString() : undefined,
            atualizadoEm: new Date().toISOString()
          };
        }
        return s;
      })
    }));
  }, []);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setData(prev => ({
      ...prev,
      transactions: [{ ...transaction, id }, ...prev.transactions]
    }));
  }, []);

  const deleteTransaction = useCallback((transactionId: string) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== transactionId)
    }));
  }, []);

  const importData = useCallback((newData: CollectionData) => {
    setData(newData);
  }, []);

  const resetCollection = useCallback(() => {
    setData({ ...initialData, stickers: generatePlaceholders() });
  }, []);

  return {
    data,
    updateSticker,
    addSticker,
    deleteSticker,
    toggleStickerOwned,
    addTransaction,
    deleteTransaction,
    importData,
    resetCollection,
  };
};
