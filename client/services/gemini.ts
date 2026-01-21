
export const GeminiService = {
  /**
   * Генерация сюжета. Сервер сам решит: Gemini или OpenAI (Fallback).
   */
  async generateStory(params: {
    childName: string;
    childDescription: string;
    theme: string;
    hook: string;
    extraCharacters: any[];
    userId: string;
  }) {
    const res = await fetch('/api/generate/story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params, userId: params.userId })
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Ошибка магических служб");
    }
    
    return await res.json();
  },

  /**
   * Генерация иллюстраций. Сервер сам решит: Gemini или DALL-E (Fallback).
   */
  async generateImage(prompt: string, style: string, userId: string): Promise<string> {
    const res = await fetch('/api/generate/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, style, userId })
    });

    if (!res.ok) {
      // Возвращаем дефолтную картинку при полном сбое всех нейросетей
      return "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1024";
    }

    const data = await res.json();
    return data.imageUrl;
  }
};
