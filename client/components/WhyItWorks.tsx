
import React from 'react';
import { TELEGRAM_BOT_URL } from '../constants.tsx';
import { SAMPLE_TALES } from '../data/samples.ts';
import { Tale } from '../types.ts';

interface WhyItWorksProps {
  onStart: () => void;
  onReadSample: (tale: Tale) => void;
  isMiniApp: boolean;
}

const WhyItWorks: React.FC<WhyItWorksProps> = ({ onStart, onReadSample, isMiniApp }) => {
  const handleCta = () => {
    if (!isMiniApp) {
      window.open(TELEGRAM_BOT_URL, '_blank');
    } else {
      onStart();
    }
  };

  return (
    <div className="animate-fade-in bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden pb-20">
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
        
        {/* Header Section */}
        <div className="layout-container flex w-full flex-col items-center">
          <div className="px-4 py-12 md:px-10 lg:px-20 w-full max-w-7xl flex flex-col items-center text-center">
            <div className="flex flex-col gap-6 max-w-3xl">
              <div className="inline-flex items-center gap-2 self-center rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">
                <span className="material-symbols-outlined text-sm">psychology</span>
                <span>Наука и магия</span>
              </div>
              <h1 className="text-slate-900 dark:text-white text-3xl md:text-6xl font-black leading-tight tracking-tight">
                Персонализированные истории, <br/><span className="text-primary">где ваш ребенок — главный герой</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-normal leading-relaxed max-w-2xl mx-auto">
                Исследования показывают, что дети в 3 раза лучше усваивают информацию и мораль сказки, если видят в герое самих себя. Мы вплетаем имена и характер вашего ребенка в каждое приключение.
              </p>
            </div>
          </div>
        </div>

        {/* Chips / Filters Section */}
        <div className="w-full flex justify-center pb-12 px-4">
          <div className="flex gap-3 flex-wrap justify-center max-w-4xl">
            {[
              { icon: 'rocket_launch', label: 'Приключения', active: true },
              { icon: 'auto_awesome', label: 'Магия', active: false },
              { icon: 'pets', label: 'Животные', active: false },
              { icon: 'bedtime', label: 'На ночь', active: false }
            ].map((chip, i) => (
              <div key={i} className={`flex h-10 cursor-pointer items-center justify-center gap-x-2 rounded-full px-6 border transition-all ${chip.active ? 'bg-primary/10 border-primary/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-750'}`}>
                <span className={`material-symbols-outlined text-[20px] ${chip.active ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>{chip.icon}</span>
                <p className={`${chip.active ? 'text-primary font-bold' : 'text-slate-600 dark:text-slate-300 font-medium'} text-sm leading-normal`}>{chip.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Story Cards Grid */}
        <div className="layout-container flex w-full justify-center pb-12">
          <div className="px-4 w-full max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {SAMPLE_TALES.map((sample, idx) => (
                <div key={sample.id} className="group flex flex-col rounded-3xl bg-white dark:bg-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 overflow-hidden border border-slate-100 dark:border-slate-700 h-full">
                  <div className="h-56 w-full bg-cover bg-center relative" style={{ backgroundImage: `url('${sample.heroPhoto}')` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-4 left-6">
                      <span className={`text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-emerald-500' : 'bg-indigo-500'}`}>
                        {idx === 0 ? 'Космос' : idx === 1 ? 'Фэнтези' : 'На ночь'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 p-8">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{sample.title}</h3>
                    <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-8 flex-1 bg-slate-50 dark:bg-slate-700/50 p-6 rounded-2xl italic font-serif">
                      "{sample.pages[0].text.substring(0, 100)}..."
                    </div>
                    <div className="flex items-center justify-end border-t border-slate-100 dark:border-slate-700 pt-6">
                      <button onClick={() => onReadSample(sample)} className="text-primary hover:text-blue-600 font-black text-sm flex items-center gap-2 group-hover:translate-x-1 transition-all">
                        Читать образец <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How it Looks on Device Section */}
        <div className="w-full flex justify-center py-20 px-4">
          <div className="flex flex-col md:flex-row items-center gap-16 max-w-6xl bg-white dark:bg-slate-800 rounded-[48px] p-8 md:p-20 shadow-xl border border-slate-100 dark:border-slate-700">
            <div className="flex-1 flex flex-col gap-10">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">Удобное чтение на любом устройстве</h2>
              <ul className="flex flex-col gap-8">
                {[
                  { t: 'Крупный шрифт', d: 'Удобно читать даже в полумраке перед сном.', i: 'text_fields' },
                  { t: 'Яркие иллюстрации', d: 'ИИ создает качественный арт для каждой главы.', i: 'image' },
                  { t: 'PDF и печать', d: 'Скачивайте файлы или заказывайте книгу в твердом переплете.', i: 'local_library' }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-5">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                      <span className="material-symbols-outlined text-primary text-2xl font-black">check</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{item.t}</h4>
                      <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full flex justify-center relative">
              <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full"></div>
              <div className="relative w-full max-w-[340px] aspect-[9/19] bg-slate-900 rounded-[3rem] border-[12px] border-slate-900 shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-3xl z-20"></div>
                <div className="w-full h-full bg-white relative overflow-hidden flex flex-col">
                  <div className="h-1/2 w-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCwTywJXzMKLRhxE8ijBToJUvmmtQ9_RV4omEuN8qC6RsQW7FpuH8-tJvonnkKdDjnyhHyxh3qaan2oD3-amgEjgJN6RzME9rVpSNicAFKaoulBbm8GHy_rJe3_KFx5QfprgXCO3AuhYaGx9F1jCG7TeGCsRaAQpNe8QSAezn0pB7E4kkd8TBhWGHN_kaCAwX6xpq-OJrMiYqyLeiIIvvA-7Rk6L8QdBgeZI0nI423j2Rrqi0br32O3KPF-znianhO0_Crh9npD4zZx')" }}></div>
                  <div className="p-8 flex flex-col gap-4 text-left">
                    <div className="h-6 w-3/4 bg-slate-100 rounded-lg"></div>
                    <div className="h-3 w-full bg-slate-50 rounded-lg"></div>
                    <div className="h-3 w-full bg-slate-50 rounded-lg"></div>
                    <div className="h-3 w-5/6 bg-slate-50 rounded-lg"></div>
                    <div className="mt-8 flex justify-center">
                      <div className="h-12 w-32 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <div className="h-2 w-16 bg-primary/30 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="w-full flex justify-center py-20 px-4 bg-background-light dark:bg-background-dark">
          <div className="flex flex-col items-center text-center gap-10 max-w-2xl">
            <div className="flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-primary/10 text-primary mb-2 shadow-inner border border-primary/20">
              <span className="material-symbols-outlined text-[40px] font-black">auto_stories</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Создайте сказку для вашего ребенка</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-medium">
              Подарите волшебство уже сегодня. Первая сказка — совершенно бесплатно!
            </p>
            <div className="pt-4 w-full flex justify-center">
              <button onClick={handleCta} className="flex items-center justify-center gap-3 rounded-[2rem] bg-primary px-12 py-7 text-white text-xl font-black shadow-2xl shadow-blue-500/30 hover:scale-105 transition-all w-full sm:w-auto uppercase tracking-widest">
                <span className="material-symbols-outlined font-black">edit_note</span>
                Создать сказку бесплатно
              </button>
            </div>
            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Не требует банковской карты • Моментальный доступ</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyItWorks;
