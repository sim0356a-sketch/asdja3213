
import React, { useState, useRef, useEffect } from 'react';
import { Tale } from '../types.ts';
import { ApiService } from '../services/api.ts';

interface TaleReaderProps {
  tale: Tale;
  isMiniApp: boolean;
  onClose: () => void;
  onOrder: (taleId: string) => void;
  onStartCreation?: () => void;
  userId?: string;
  onNotify?: (msg: string, type?: 'success' | 'error') => void;
  isSample?: boolean;
}

const Icons = {
  Download: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Close: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  ArrowDown: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
    </svg>
  )
};

const PageSection = ({ page, index, total, scrollContainerRef }: { page: any, index: number, total: number, scrollContainerRef: React.RefObject<HTMLDivElement> }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(1);
  const [blur, setBlur] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !scrollContainerRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      if (rect.top < -viewportHeight * 0.3) {
        const scrollInside = Math.abs(rect.top + viewportHeight * 0.3);
        const progress = scrollInside / (viewportHeight * 0.7);
        setOpacity(Math.max(0, 1 - progress));
        setBlur(Math.min(15, progress * 30));
      } else {
        setOpacity(1);
        setBlur(0);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [scrollContainerRef]);

  return (
    <div ref={sectionRef} className="relative min-h-[180vh] md:min-h-[200vh] w-full flex flex-col bg-white">
      <div className="sticky top-0 h-screen w-full overflow-hidden z-0 bg-slate-900">
        <img 
          src={page.imageUrl} 
          alt={`Страница ${index + 1}`}
          className="w-full h-full object-cover transition-transform duration-700 ease-out"
          style={{ 
            opacity: opacity,
            filter: `blur(${blur}px)`,
            transform: `scale(${1 + (1 - opacity) * 0.1})`
          }}
        />
        <div 
          className="absolute inset-0 bg-indigo-950/40"
          style={{ opacity: 1 - opacity }}
        ></div>
      </div>

      <div className="relative z-10 px-4 md:px-10 pb-40 mt-[-22vh]">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/95 backdrop-blur-3xl rounded-[48px] md:rounded-[72px] p-8 md:p-24 shadow-[0_40px_100px_rgba(0,0,0,0.25)] border border-white/60 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-full h-2 magic-gradient opacity-30"></div>
            
            <div className="flex items-center gap-4 mb-8">
              <span className="bg-purple-100/80 text-purple-800 px-5 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border border-purple-200">
                Глава {index + 1}
              </span>
            </div>

            <p className="text-2xl md:text-5xl leading-[1.6] md:leading-[1.4] text-slate-900 font-bold italic tracking-tight font-body">
              {page.text}
            </p>
            
            {index + 1 < total && (
              <div className="mt-16 md:mt-24 flex flex-col items-center gap-4 animate-bounce-subtle">
                <div className="h-px w-full bg-slate-100"></div>
                <div className="flex flex-col items-center gap-3 py-4 text-slate-300">
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em] text-slate-400">
                    Листайте ниже
                  </span>
                  <Icons.ArrowDown />
                </div>
              </div>
            )}
            
            {index + 1 === total && (
              <div className="mt-16 md:mt-24 flex flex-col items-center py-4">
                <div className="h-px w-full bg-slate-100 mb-8"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-purple-400">Конец главы</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TaleReader: React.FC<TaleReaderProps> = ({ tale, isMiniApp, onClose, userId, onNotify, isSample, onOrder, onStartCreation }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setScrollProgress(progress);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-white flex flex-col overflow-hidden animate-fade-in select-none">
      
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[2100]">
        <div 
          className="h-full magic-gradient shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Header UI - Pinned Fixed with 30px offset + Safe Area (Notch) */}
      <header 
        className="fixed top-0 left-0 right-0 z-[2050] pb-4 px-4 md:px-8 flex justify-between items-center pointer-events-none"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 30px)' }}
      >
        <div className="bg-white/90 backdrop-blur-2xl border border-white/60 px-5 py-3 md:px-10 md:py-5 rounded-[28px] md:rounded-[40px] shadow-2xl flex items-center gap-6 max-w-[75%] md:max-w-lg pointer-events-auto">
          <div className="flex flex-col min-w-0">
            <h2 className="font-black text-slate-900 truncate text-sm md:text-lg tracking-tight mb-0.5">{tale.title}</h2>
            <div className="text-[8px] md:text-[10px] font-black text-purple-600 uppercase tracking-widest leading-none">Герой: {tale.childName}</div>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="w-12 h-12 md:w-16 md:h-16 bg-white/90 backdrop-blur-2xl border border-white/60 rounded-[24px] md:rounded-[32px] shadow-2xl flex items-center justify-center text-slate-600 hover:text-red-500 transition-all active:scale-90 pointer-events-auto"
        >
          <Icons.Close />
        </button>
      </header>

      {/* Scrollable Story Content */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto no-scrollbar scroll-smooth"
      >
        <div className="flex flex-col">
          {tale.pages.map((page, idx) => (
            <PageSection 
              key={idx} 
              page={page} 
              index={idx} 
              total={tale.pages.length} 
              scrollContainerRef={scrollContainerRef}
            />
          ))}
        </div>

        {/* Ending CTA Card */}
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-20 text-center relative z-20">
          <div className="size-24 md:size-36 rounded-[40px] md:rounded-[56px] magic-gradient flex items-center justify-center text-white mb-10 shadow-3xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <span className="text-4xl md:text-7xl">{isSample ? '✨' : '🏁'}</span>
          </div>
          
          <h2 className="text-4xl md:text-7xl font-black text-indigo-950 mb-8 tracking-tight max-w-4xl leading-tight">
            {isSample ? 'Понравилась история?' : 'Это было незабываемо!'}
          </h2>
          
          <p className="text-slate-500 text-lg md:text-2xl font-semibold max-w-2xl mb-16 leading-relaxed">
            {isSample 
              ? `Вы только что увидели пример того, как ИИ оживляет воображение. Теперь очередь Вашего малыша стать героем!`
              : `Надеемся, ${tale.childName} в восторге от своих приключений. Хотите сохранить эту историю навсегда?`
            }
          </p>

          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
            {isSample ? (
              <>
                <button 
                  onClick={() => { ApiService.haptic('heavy'); onStartCreation?.(); }}
                  className="flex-[2] py-7 md:py-10 magic-gradient text-white rounded-[32px] md:rounded-[40px] font-black uppercase text-xs md:text-base tracking-widest shadow-[0_25px_50px_rgba(139,92,246,0.4)] active:scale-95 transition-all animate-pulse-subtle"
                >
                  Создать свою сказку ✨
                </button>
                <button 
                  onClick={onClose}
                  className="flex-1 py-7 md:py-10 bg-white border border-slate-200 text-slate-400 rounded-[32px] md:rounded-[40px] font-black uppercase text-[10px] md:text-xs tracking-widest active:scale-95 transition-all"
                >
                  Закрыть
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => onOrder(tale.id)}
                  className="flex-[2] py-7 md:py-10 bg-indigo-950 text-white rounded-[32px] md:rounded-[40px] font-black uppercase text-xs md:text-base tracking-widest shadow-2xl active:scale-95 transition-all"
                >
                  Заказать печатную книгу
                </button>
                <button 
                  onClick={onClose}
                  className="flex-1 py-7 md:py-10 bg-white border border-slate-200 text-slate-400 rounded-[32px] md:rounded-[40px] font-black uppercase text-[10px] md:text-xs tracking-widest active:scale-95 transition-all"
                >
                  В библиотеку
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        .font-body { font-family: 'Nunito', sans-serif; }
      `}</style>
    </div>
  );
};

export default TaleReader;
