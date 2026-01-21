
import React, { useState } from 'react';
import { THEMES, STYLES, STORY_IDEAS, CHARACTER_TEMPLATES } from '../constants.tsx';
import { ApiService } from '../services/api.ts';
import { User, ExtraCharacter } from '../types.ts';
import Carousel from './Carousel.tsx';

interface CreationFunnelProps {
  user: User;
  isMiniApp: boolean;
  onStartGeneration: (params: any) => void;
  onCancel: () => void;
}

const Icons = {
  Back: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
  Close: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Magic: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4L20 9M2 22L7 17M13 18L14 14L18 13L14 12L13 8L12 12L8 13L12 14L13 18Z"/></svg>
};

const CreationFunnel: React.FC<CreationFunnelProps> = ({ user, onStartGeneration, onCancel }) => {
  const [step, setStep] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0].id);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0].id);
  const [hook, setHook] = useState('');
  const [selectedCharIds, setSelectedCharIds] = useState<string[]>([]);
  const [showIdeas, setShowIdeas] = useState(false);

  const handleNext = () => { ApiService.haptic('medium'); setStep(prev => prev + 1); };
  const handleBack = () => { ApiService.haptic('light'); setStep(prev => Math.max(1, prev - 1)); };

  return (
    <div 
      className="fixed inset-0 z-[1000] bg-white flex flex-col animate-fade-in overflow-hidden"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 100px)' }}
    >
      <div className="fixed inset-0 pointer-events-none -z-10 bg-gradient-to-br from-purple-50 via-white to-blue-50"></div>

      {/* Header */}
      <div className="px-6 h-16 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-4">
          {step > 1 && (
            <button onClick={handleBack} className="w-10 h-10 rounded-2xl bg-white/60 backdrop-blur-md text-purple-600 flex items-center justify-center border border-white/50 shadow-sm active:scale-90 transition-transform">
              <Icons.Back />
            </button>
          )}
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest leading-none mb-1">Шаг {step} из 4</span>
            <h2 className="text-xl font-black text-indigo-950 tracking-tight leading-none">
              {step === 1 ? 'Мир сказки' : step === 2 ? 'Стиль рисунка' : step === 3 ? 'Герои' : 'Сюжет'}
            </h2>
          </div>
        </div>
        <button onClick={onCancel} className="w-10 h-10 rounded-2xl bg-white/60 backdrop-blur-md text-slate-400 flex items-center justify-center border border-white/50 shadow-sm active:scale-90 transition-transform">
          <Icons.Close />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center overflow-hidden min-h-0">
        {step === 1 && <Carousel items={THEMES} onSelect={setSelectedTheme} focusedId={selectedTheme} stepType="theme" />}
        {step === 2 && <Carousel items={STYLES} onSelect={setSelectedStyle} focusedId={selectedStyle} stepType="style" />}
        
        {step === 3 && (
          <div className="px-6 flex flex-col gap-8 animate-fade-in max-w-2xl mx-auto w-full h-full justify-start overflow-y-auto no-scrollbar pt-8 pb-32">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest ml-2">Выберите участников:</p>
              <div className="grid grid-cols-1 gap-3">
                {CHARACTER_TEMPLATES.map(char => (
                  <button key={char.id} onClick={() => { ApiService.haptic('light'); setSelectedCharIds(prev => prev.includes(char.id) ? prev.filter(id => id !== char.id) : [...prev, char.id]); }} className={`p-6 rounded-[32px] border-2 transition-all flex items-center justify-between text-left ${selectedCharIds.includes(char.id) ? 'bg-purple-600 text-white border-purple-400 shadow-xl' : 'bg-white/40 border-white text-indigo-950 shadow-sm'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg">{char.icon}</div>
                      <div>
                        <div className="font-black text-sm">{char.label}</div>
                        <div className={`text-[8px] font-bold uppercase tracking-widest ${selectedCharIds.includes(char.id) ? 'text-white/70' : 'text-purple-600'}`}>{char.role}</div>
                      </div>
                    </div>
                    {selectedCharIds.includes(char.id) && <span className="text-white font-black">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="px-6 flex flex-col gap-6 animate-fade-in max-w-2xl mx-auto w-full justify-start pt-8">
            <div className="flex justify-between items-center px-2">
              <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">О чем будет сказка?</p>
              <button 
                onClick={() => setShowIdeas(true)}
                className="flex items-center gap-2 text-[10px] font-black text-purple-500 uppercase tracking-widest bg-purple-50 px-4 py-2 rounded-xl"
              >
                <Icons.Magic /> Нужна идея?
              </button>
            </div>
            <textarea value={hook} onChange={(e) => setHook(e.target.value)} placeholder="Например: Как Артем спас маленького дракона..." className="w-full h-48 p-8 rounded-[40px] bg-white/40 border-2 border-white/80 focus:border-purple-200 outline-none shadow-sm transition-all font-medium text-indigo-950 text-lg placeholder:text-slate-300 resize-none" />
          </div>
        )}
      </div>

      {/* Footer Button */}
      <div className="h-32 flex items-center justify-center px-8 flex-shrink-0 pb-10">
        <button 
          onClick={step === 4 ? () => onStartGeneration({ theme: selectedTheme, style: selectedStyle, hook, selectedCharIds }) : handleNext} 
          className="w-full max-w-sm magic-gradient text-white h-16 rounded-[28px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all text-xs"
        >
          {step === 4 ? 'Начать магию ✨' : `Продолжить`}
        </button>
      </div>

      {/* Ideas Modal */}
      {showIdeas && (
        <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-indigo-950/60 backdrop-blur-sm" onClick={() => setShowIdeas(false)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[48px] p-8 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-indigo-950">Идеи сюжетов</h3>
              <button onClick={() => setShowIdeas(false)} className="text-slate-400">✕</button>
            </div>
            <div className="overflow-y-auto no-scrollbar space-y-3 pb-4">
              {STORY_IDEAS.map((idea, i) => (
                <button 
                  key={i} 
                  onClick={() => { setHook(idea.text); setShowIdeas(false); ApiService.haptic('medium'); }}
                  className="w-full text-left p-6 rounded-[32px] bg-slate-50 border border-slate-100 hover:border-purple-200 transition-all group"
                >
                  <div className="font-black text-indigo-950 mb-1 group-hover:text-purple-600">{idea.title}</div>
                  <div className="text-xs text-slate-500 line-clamp-2">{idea.text}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default CreationFunnel;
