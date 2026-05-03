import { Sticker } from '../types';

export const validateStickerUpdate = (updates: Partial<Sticker>): Partial<Sticker> => {
  const validated = { ...updates };
  
  // Ensure quantity is not negative
  if (validated.quantidade !== undefined && validated.quantidade < 0) {
      validated.quantidade = 0;
  }
  
  // Force update timestamp to ensure current time
  validated.atualizadoEm = new Date().toISOString();

  return validated;
};
