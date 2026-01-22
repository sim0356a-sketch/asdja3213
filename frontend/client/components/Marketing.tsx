
import React, { useState } from 'react';
import { BRAND_NAME } from '../constants.tsx';

export const FAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const items = [
    { 
      q: "На какой возраст рассчитаны сказки?", 
      a: "Наш сервис подходит детям от 2 до 8 лет. Мы настраиваем сложность текста, объем страниц и динамику сюжета под возраст вашего ребенка, чтобы история была понятной и увлекательной." 
    },
    { 
      q: "Как создаются иллюстрации с лицом моего ребенка?", 
      a: "Вы загружаете 3-5 фотографий лица ребенка. Наш ИИ анализирует характерные черты и бережно переносит их в выбранный вами художественный стиль, сохраняя 100% узнаваемость во всех сценах книги." 
    },
    { 
      q: "Можно ли получить сказку в виде настоящей книги?", 
      a: "Конечно! В личном кабинете или сразу после создания сказки вы можете заказать печатную версию. Мы напечатаем её на качественной бумаге в твердом переплете и отправим курьером или почтой." 
    },
    { 
      q: "Безопасны ли ваши сказки на ночь для детской психики?", 
      a: `Абсолютно. В "${BRAND_NAME}" все сюжеты проходят фильтрацию: они добрые, поучительные и всегда имеют позитивную развязку. Мы создаем истории, которые помогают засыпать с хорошими мыслями.` 
    },
    { 
      q: "Какие темы доступны для генерации?", 
      a: "Сейчас доступны Космос, Волшебный Лес, Океан, Королевство и Мир Динозавров. Мы постоянно добавляем новые миры и сюжетные линии." 
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-32 px-6 animate-fade-in text-white">
      <div className="text-center mb-24">
        <div className="text-[10px] font-black text-purple-500 uppercase tracking-[0.5em] mb-4">Вопросы и ответы</div>
        <h2 className="text-6xl font-black tracking-tight leading-tight">Магия в деталях</h2>
      </div>

      <div className="space-y-6">
        {items.map((item, i) => (
          <div key={i} className="glass-card rounded-[40px] border border-white/5 overflow-hidden transition-all duration-500">
            <button 
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full p-10 text-left flex justify-between items-center group"
            >
              <h4 className={`font-black text-xl transition-colors pr-10 ${openIdx === i ? 'text-purple-400' : 'text-white'}`}>
                {item.q}
              </h4>
              <span className={`text-3xl transition-transform duration-500 font-light ${openIdx === i ? 'rotate-45 text-purple-500' : 'text-gray-700'}`}>+</span>
            </button>
            <div className={`transition-all duration-500 overflow-hidden ${openIdx === i ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-10 pt-0 text-gray-400 leading-relaxed font-medium text-lg">
                {item.a}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-32 border-t border-white/5 pt-16 text-center space-y-12">
        <div className="flex flex-col items-center gap-6">
           <div className="text-gray-700 text-[10px] font-black uppercase tracking-[0.5em]">Юридическая информация</div>
           <div className="flex flex-wrap justify-center gap-12 text-[11px] font-black uppercase tracking-widest text-purple-500/50">
             <button className="hover:text-purple-500 transition-colors">Публичная оферта</button>
             <button className="hover:text-purple-500 transition-colors">Конфиденциальность</button>
             <button className="hover:text-purple-500 transition-colors">Контакты</button>
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-[11px] font-bold text-gray-800 uppercase tracking-widest">
           <div>#ЗачемЧитатьСказки</div>
           <div>#ЭмоциональныйИнтеллект</div>
           <div>#ПодаркиДетям</div>
        </div>
      </div>
    </div>
  );
};
