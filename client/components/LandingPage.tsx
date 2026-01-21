
import React from 'react';
import { TELEGRAM_BOT_URL } from '../constants.tsx';
import { Tale } from '../types.ts';
import { SAMPLE_TALES } from '../data/samples.ts';
import shetkaImage from '../uploads/shetka.png';

interface LandingPageProps {
  onStart: () => void;
  onPricing: () => void;
  onReadSample: (tale: Tale) => void;
  authenticated: boolean;
  isMiniApp: boolean;
}

const FeatureIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'eq': return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
    case 'safety': return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
    case 'brain': return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
    default: return null;
  }
};

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onPricing, onReadSample, authenticated, isMiniApp }) => {
  const handleCta = () => {
    if (!isMiniApp) {
      window.open(TELEGRAM_BOT_URL, '_blank');
    } else {
      onStart();
    }
  };

  return (
    <div className="animate-fade-in flex flex-col gap-0 overflow-x-hidden font-body text-slate-900 selection:bg-primary/10 selection:text-primary">
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 py-12 lg:py-20 overflow-hidden bg-transparent">
        <div className="max-w-[1300px] mx-auto w-full relative z-10">
          <div className="flex flex-col items-center text-center gap-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 border border-white/60 text-purple-600 text-[10px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Персонализированная магия ИИ
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black leading-[1.05] tracking-tight text-slate-900">
              Ваш ребенок — <br />
              <span className="text-transparent bg-clip-text magic-gradient">герой каждой сказки</span>
            </h1>
            <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
              Создавайте захватывающие истории с иллюстрациями, где главный герой выглядит как ваш малыш. Сохраните магию детства в каждой странице.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
              <button 
                onClick={handleCta}
                className="flex items-center justify-center gap-3 rounded-[24px] h-16 md:h-20 px-10 magic-gradient text-white shadow-2xl shadow-purple-500/40 hover:scale-[1.02] active:scale-95 transition-all text-lg font-black uppercase tracking-widest"
              >
                <span>Начать бесплатно</span>
              </button>
              <button 
                onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center justify-center h-16 md:h-20 px-10 rounded-[24px] bg-white/40 border border-white/60 text-slate-700 hover:bg-white/60 transition-all text-lg font-bold shadow-sm backdrop-blur-md"
              >
                Как это работает?
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase / Sample Tales Section */}
      <section className="py-24 px-6 bg-transparent relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 md:mb-20">
            <div className="text-[10px] font-black text-purple-600 uppercase tracking-[0.4em] mb-4">Примеры работ</div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900">Взгляните на магию</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {SAMPLE_TALES.map((tale, idx) => (
              <div 
                key={tale.id} 
                className="group flex flex-col rounded-[48px] bg-white/80 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer h-full backdrop-blur-sm"
                onClick={() => onReadSample(tale)}
              >
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img 
                    src={tale.pages[0]?.imageUrl} 
                    alt={tale.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s]" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  <div className="absolute top-6 left-6">
                    <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest text-indigo-950 shadow-lg border border-white">
                      {idx === 0 ? '🚀 Космос' : idx === 1 ? '🦄 Страна игрушек' : '🌲 Лес'}
                    </span>
                  </div>
                  <div className="absolute bottom-8 left-8 right-8">
                     <h3 className="text-2xl font-black text-white leading-tight drop-shadow-md">{tale.title}</h3>
                  </div>
                </div>
                <div className="p-8 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Главный герой</span>
                    <span className="font-bold text-indigo-900">{tale.childName}</span>
                  </div>
                  <div className="w-12 h-12 magic-gradient text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <button 
              onClick={handleCta}
              className="text-purple-600 font-black text-sm uppercase tracking-widest hover:text-purple-800 transition-colors flex items-center gap-3 mx-auto"
            >
              Создать свою историю <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </section>

      {/* Pedagogical Benefits */}
      <section id="benefits" className="py-24 md:py-32 px-6 relative bg-transparent">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 md:mb-24">
            <div className="text-[10px] md:text-xs font-black text-purple-600 uppercase tracking-[0.4em] mb-4">Развитие через воображение</div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6 text-slate-900">Почему это важно?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { type: 'eq', title: 'Эмоциональная связь', desc: 'Персонализированные истории помогают ребенку лучше понимать свои чувства и развивать эмпатию.' },
              { type: 'safety', title: 'Безопасное обучение', desc: 'Герой, похожий на ребенка, учит правилам и ценностям через личный пример в сказочном мире.' },
              { type: 'brain', title: 'Любовь к чтению', desc: 'Когда ребенок видит себя на страницах книги, интерес к книгам возрастает в разы.' }
            ].map((f, i) => (
              <div key={i} className="group flex flex-col p-12 rounded-[48px] bg-white/60 backdrop-blur-md border border-white/60 shadow-sm hover:bg-white hover:shadow-xl transition-all duration-500">
                <div className="size-20 rounded-[24px] bg-white shadow-sm flex items-center justify-center text-purple-600 mb-8 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                  <FeatureIcon type={f.type} />
                </div>
                <h3 className="text-2xl font-black mb-4 text-slate-900">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Habits & Education Block */}
      <section className="py-20 px-6 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20 bg-white/80 backdrop-blur-xl rounded-[64px] p-10 md:p-20 border border-white/60 shadow-2xl overflow-hidden relative">
            <div className="absolute -top-24 -right-24 size-64 bg-purple-200/30 blur-[80px] rounded-full"></div>
            <div className="flex-1 space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest border border-blue-100">
                Воспитание без слез
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                Объясняйте сложные <span className="text-primary">вещи легко</span>
              </h2>
              <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed">
                Трудно уговорить ребенка чистить зубы или вовремя ложиться спать? <br />
                Вплетите это в сюжет! Когда любимый герой (так похожий на самого ребенка) отправляется в поход против дракона «Кариеса», скучная рутина превращается в великую миссию.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="size-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=user${i}`} alt="user" />
                    </div>
                  ))}
                </div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Выбор 10 000+ осознанных родителей</span>
              </div>
            </div>
            <div className="flex-1 w-full max-w-[400px] relative">
              <div className="aspect-square rounded-[48px] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700 border-8 border-white">
<img 
  src={shetkaImage} 
  alt="Щетка" 
  className="w-full h-full object-cover"
/>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 animate-float">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"></path></svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Результат</div>
                    <div className="text-xs font-black text-indigo-950">Чистка зубов становится игрой</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full py-32 md:py-48 px-6 relative overflow-hidden bg-transparent">
        <div className="flex flex-col items-center text-center gap-12 max-w-4xl mx-auto relative z-10">
          <div className="size-24 items-center justify-center rounded-[32px] bg-white text-purple-600 flex shadow-xl border border-white/60 backdrop-blur-md">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3"/><path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5"/></svg>
          </div>
          <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tight">
            Подарите сказку, <br />где ваш ребенок — главный герой
          </h2>
          <div className="pt-8 w-full flex flex-col items-center gap-8">
            <button 
              onClick={handleCta}
              className="flex items-center justify-center gap-4 rounded-[32px] magic-gradient px-16 py-8 text-white text-2xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto uppercase tracking-widest"
            >
              Начать бесплатно
            </button>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Моментальный доступ • Регистрация не требуется</p>
          </div>
        </div>
      </section>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
