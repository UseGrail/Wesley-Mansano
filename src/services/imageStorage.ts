import { set, get, del, keys, clear } from 'idb-keyval';

export const ImageStorage = {
  saveImage: async (stickerId: string, base64: string) => {
    try {
      await set(`img-${stickerId}`, base64);
    } catch (err) {
      console.error('Error saving image to IndexedDB:', err);
    }
  },

  getImage: async (stickerId: string): Promise<string | null> => {
    try {
      return await get(`img-${stickerId}`);
    } catch (err) {
      console.error('Error getting image from IndexedDB:', err);
      return null;
    }
  },

  deleteImage: async (stickerId: string) => {
    try {
      await del(`img-${stickerId}`);
    } catch (err) {
      console.error('Error deleting image from IndexedDB:', err);
    }
  },

  getAllImageKeys: async () => {
    try {
      const allKeys = await keys();
      return allKeys.filter(k => typeof k === 'string' && k.startsWith('img-')) as string[];
    } catch (err) {
      console.error('Error getting all image keys:', err);
      return [];
    }
  },

  clearAllImages: async () => {
    try {
      await clear();
    } catch (err) {
      console.error('Error clearing images:', err);
    }
  },

  getStats: async () => {
    const allKeys = await ImageStorage.getAllImageKeys();
    let totalSize = 0;
    for (const key of allKeys) {
      const val = await get(key);
      if (typeof val === 'string') {
        totalSize += val.length;
      }
    }
    return {
      count: allKeys.length,
      sizeBytes: totalSize * 0.75, // Base64 overhead estimate
    };
  }
};

export const optimizeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Export as WebP or JPEG for better compression
        const dataUrl = canvas.toDataURL('image/webp', 0.7);
        resolve(dataUrl);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};
