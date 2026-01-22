import { User, Tale } from '../types.ts';

// 🔴 ВАЖНО: Используем Jino напрямую
const API_BASE = 'https://myskaz.ru/api';
const LOCAL_API_BASE = 'http://localhost:3000/api';

// Получаем актуальный API_BASE в зависимости от среды
function getApiBase(): string {
  // Если работаем локально
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return LOCAL_API_BASE;
  }
  
  // Если в Telegram Web App - используем Jino
  if (window.location.hostname.includes('web.telegram.org')) {
    return API_BASE;
  }
  
  // По умолчанию Jino
  return API_BASE;
}

// Вспомогательная функция для конвертации base64 в Blob
function dataURLtoBlob(dataurl: string): Blob {
  try {
    // Проверяем, что это действительно base64
    if (!dataurl.includes('base64')) {
      // Если это уже URL или blob URL, возвращаем пустой blob
      return new Blob();
    }
    
    const arr = dataurl.split(',');
    if (arr.length < 2) {
      return new Blob();
    }
    
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  } catch (error) {
    console.error('Ошибка конвертации base64 в Blob:', error);
    return new Blob();
  }
}

// Улучшенный fetch с retry и CORS обработкой
async function enhancedFetch(url: string, options?: RequestInit, retries = 3): Promise<Response> {
  const apiBase = getApiBase();
  const fullUrl = url.startsWith('http') ? url : `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
  
  const defaultOptions: RequestInit = {
    ...options,
    headers: {
      'Accept': 'application/json',
      ...(options?.headers || {})
    },
    // 🔴 ВАЖНО: Правильные CORS настройки для Telegram
    mode: 'cors',
    credentials: 'omit' as RequestCredentials
  };
  
  // Добавляем Origin только если это не локальный хост
  if (!fullUrl.includes('localhost') && !fullUrl.includes('127.0.0.1')) {
    defaultOptions.headers = {
      ...defaultOptions.headers,
      'Origin': 'https://web.telegram.org'
    };
  }
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📡 Fetch попытка ${attempt}/${retries}:`, {
        url: fullUrl,
        method: defaultOptions.method || 'GET'
      });
      
      const response = await fetch(fullUrl, defaultOptions);
      
      if (response.ok) {
        console.log(`✅ Успешный ответ от ${fullUrl}`);
        return response;
      }
      
      // Если 404 или 500, пробуем retry
      if (response.status >= 500 && attempt < retries) {
        console.warn(`⚠️  Ошибка ${response.status}, пробую снова...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      // Если 400 (bad request) или 401 (unauthorized), не retry
      return response;
      
    } catch (error) {
      console.error(`❌ Ошибка fetch (попытка ${attempt}):`, error);
      
      if (attempt < retries) {
        // Экспоненциальная задержка
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`⏳ Жду ${delay}ms перед следующей попыткой...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  
  throw new Error(`Не удалось выполнить запрос после ${retries} попыток`);
}

function buildUserFormData(user: User): FormData {
  const formData = new FormData();
  formData.append('id', user.id);
  formData.append('name', user.name);
  formData.append('childName', user.childName);
  formData.append('credits', user.credits.toString());
  formData.append('tier', user.tier || 'FREE');

  let newPhotoCount = 0;
  user.childPhotos?.forEach((photo) => {
    if (photo.startsWith('data:')) {
      try {
        const blob = dataURLtoBlob(photo);
        if (blob.size > 0) {
          formData.append('photos', blob, `photo_${newPhotoCount}.png`);
          newPhotoCount += 1;
        }
      } catch (e) {
        console.error('Ошибка конвертации фото:', e);
      }
    }
  });

  return formData;
}

export const ApiService = {
  async getUser(id: string): Promise<User | null> {
    try {
      const res = await enhancedFetch(`/user/${id}`);
      
      if (!res.ok) {
        console.warn(`⚠️  getUser: ${res.status} ${res.statusText}`);
        return null;
      }
      
      const dbData = await res.json();
      
      let extraData: any = {};
      if (dbData.data) {
        try {
          extraData = typeof dbData.data === 'string' ? JSON.parse(dbData.data) : dbData.data;
        } catch (e) {
          console.error('JSON Parse Error', e);
        }
      }

      // 🔴 ВАЖНО: Обрабатываем и локальные и серверные фото
      const childPhotos = extraData.childPhotos || [];
      
      // Если фото - base64 строки, конвертируем в blob URLs для отображения
      const processedPhotos = childPhotos.map((photo: string) => {
        if (photo.startsWith('data:')) {
          // Создаем blob URL из base64
          const blob = dataURLtoBlob(photo);
          return URL.createObjectURL(blob);
        }
        // Если это уже URL (с сервера), оставляем как есть
        return photo.startsWith('http') ? photo : `https://autodet.pro${photo}`;
      });

      return {
        id: String(dbData.id),
        telegramId: String(dbData.id),
        name: dbData.name || extraData.name || '',
        childName: dbData.child_name || extraData.childName || '',
        credits: dbData.credits !== undefined ? dbData.credits : (extraData.credits ?? 3),
        tier: dbData.tier || extraData.tier || 'FREE',
        childPhotos: processedPhotos,
        extraCharacters: extraData.extraCharacters || [],
        createdAt: dbData.created_at ? new Date(dbData.created_at).getTime() : Date.now()
      } as User;
    } catch (err) {
      console.error('GetUser Failure:', err);
      return null;
    }
  },

  async createUser(user: User): Promise<boolean> {
    try {
      localStorage.setItem('skazka_user_id', user.id);

      const formData = buildUserFormData(user);

      const res = await enhancedFetch('/users/create', {
        method: 'POST',
        body: formData
        // 🔴 НЕ добавляем Content-Type для FormData - браузер сам установит
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        console.error('SaveUser Server Error:', err);
        throw new Error(err.error || 'Server rejected save');
      }
      
      return true;
    } catch (e) {
      console.error('CreateUser Failure:', e);
      return false;
    }
  },

  async updateUser(user: User): Promise<boolean> {
    try {
      localStorage.setItem('skazka_user_id', user.id);

      const formData = buildUserFormData(user);
      const res = await enhancedFetch(`/users/${user.id}`, {
        method: 'PUT',
        body: formData
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        console.error('UpdateUser Server Error:', err);
        throw new Error(err.error || 'Server rejected update');
      }

      return true;
    } catch (e) {
      console.error('UpdateUser Failure:', e);
      return false;
    }
  },

  async createTale(userId: string, tale: Tale): Promise<void> {
    try {
      await enhancedFetch('/tales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tale })
      });
      
      console.log('✅ Сказка создана:', tale.id);
    } catch (e) {
      console.error('CreateTale Error:', e);
    }
  },

  async generateTale(params: any, userId: string): Promise<{ tale: Tale; credits?: number } | null> {
    try {
      const res = await enhancedFetch('/tales/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, params })
      }, 1);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || 'Generate failed');
      }

      const data = await res.json();
      return { tale: data.tale, credits: data.credits };
    } catch (error) {
      console.error('GenerateTale Error:', error);
      return null;
    }
  },

  async updateTale(userId: string, tale: Tale): Promise<void> {
    try {
      await enhancedFetch(`/tales/${tale.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tale })
      });
      
      console.log('✅ Сказка обновлена:', tale.id);
    } catch (e) {
      console.error('UpdateTale Error:', e);
    }
  },

  async getTales(userId: string): Promise<Tale[]> {
    try {
      const res = await enhancedFetch(`/tales/${userId}`);
      
      if (!res.ok) {
        console.warn(`⚠️  getTales: ${res.status} ${res.statusText}`);
        return [];
      }
      
      const data = await res.json();
      return data.filter((t: any) => t && t.id);
    } catch (err) {
      console.error('GetTales Error:', err);
      return [];
    }
  },

  async generateStory(params: any, userId: string): Promise<any> {
    try {
      const res = await enhancedFetch('/generate/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params, userId })
      }, 1);
      
      if (!res.ok) {
        throw new Error(`Генерация не удалась: ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error('GenerateStory Error:', error);
      throw error;
    }
  },

  async generateImage(prompt: string, style: string, userId: string): Promise<string> {
    try {
      const res = await enhancedFetch('/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style, userId })
      }, 1);
      
      if (!res.ok) {
        throw new Error(`Генерация изображения не удалась: ${res.status}`);
      }
      
      const data = await res.json();
      return data.imageUrl || '';
    } catch (error) {
      console.error('GenerateImage Error:', error);
      throw error;
    }
  },

  async sendPdfToTelegram(userId: string, pdfBase64: string, filename: string): Promise<boolean> {
    try {
      const res = await enhancedFetch('/tales/send-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, pdfBase64, filename })
      });
      
      return res.ok;
    } catch (e) {
      console.error('SendPdf Error:', e);
      return false;
    }
  },

  haptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;
    try {
      if (['success', 'warning', 'error'].includes(type)) {
        tg.HapticFeedback.notificationOccurred(type);
      } else {
        tg.HapticFeedback.impactOccurred(type);
      }
    } catch (e) {}
  },

  getTelegramData() {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.initData !== "") {
      return {
        user: tg.initDataUnsafe?.user,
        initData: tg.initData,
        platform: tg.platform,
        version: tg.version
      };
    }
    return null;
  },

  // 🔴 НОВАЯ ФУНКЦИЯ: Проверка сервера
  async healthCheck(): Promise<boolean> {
    try {
      const res = await enhancedFetch('/test', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('✅ Сервер здоров:', data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Health Check Error:', error);
      return false;
    }
  },

  // 🔴 НОВАЯ ФУНКЦИЯ: Получение информации о сервере
  async getServerInfo(): Promise<any> {
    try {
      const res = await enhancedFetch('/jino-info', {
        method: 'GET'
      });
      
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (error) {
      console.error('Get Server Info Error:', error);
      return null;
    }
  }
};
