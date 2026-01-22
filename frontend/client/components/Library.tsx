
import React from 'react';
import { Tale } from '../types.ts';

interface LibraryProps {
  tales: Tale[];
  isMiniApp: boolean;
  onRead: (taleId: string) => void;
  onOrder: (taleId: string) => void;
  onNavigateToCreate: () => void;
}

const Icons = {
  Print: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
    </svg>
  ),
  Read: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
};

const Library: React.FC<LibraryProps> = ({ tales, onRead, onOrder, onNavigateToCreate }) => {
  if (tales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-10 text-center animate-fade-in" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 140px)' }}>
        <div className="w-40 h-40 glass-card rounded-full flex items-center justify-center mb-10 text-purple-400">
          <span className="text-6xl">📖</span>
        </div>
        <h2 className="text-3xl font-black text-indigo-950 mb-4">Ваша полка пуста</h2>
        <p className="text-slate-500 mb-12 font-medium">Создайте свою первую сказку, и она появится здесь.</p>
        <button onClick={onNavigateToCreate} className="magic-gradient text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Начать творить</button>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 animate-fade-in pb-40" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 100px)' }}>
      <div className="mb-12">
        <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.4em]">Коллекция</span>
        <h2 className="text-4xl font-black text-indigo-950 tracking-tight">Библиотека</h2>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {tales.map(tale => {
          const isGenerating = tale.status === 'generating';
          
          return (
            <div key={tale.id} className="glass-card rounded-[48px] p-5 relative overflow-visible group border-white/80">
              <div 
                onClick={() => !isGenerating && onRead(tale.id)}
                className="relative aspect-[4/5] rounded-[40px] overflow-hidden shadow-sm"
              >
                {isGenerating ? (
                  <div className="w-full h-full bg-white/40 flex flex-col items-center justify-center p-10 text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                    <div className="font-black text-indigo-900 uppercase text-[10px] tracking-widest">{tale.currentStep || 'Магия в процессе...'}</div>
                  </div>
                ) : (
                  <>
                    <img src={tale.pages[0]?.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={tale.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8">
                       <h3 className="text-2xl font-black text-white leading-tight drop-shadow-md">{tale.title}</h3>
                    </div>
                  </>
                )}
              </div>
              
              {!isGenerating && (
                <div className="flex justify-between items-center mt-6 px-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Герой</span>
                    <span className="font-bold text-indigo-900">{tale.childName}</span>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => onOrder(tale.id)} className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center text-slate-400 hover:text-purple-600 transition-colors shadow-sm">
                      <Icons.Print />
                    </button>
                    <button onClick={() => onRead(tale.id)} className="w-12 h-12 magic-gradient text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                      <Icons.Read />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Library;
