
import React, { useState, useRef } from 'react';
import { User } from '../types.ts';
import { ApiService } from '../services/api.ts';

interface OnboardingProps {
  onComplete: (data: Partial<User>) => void;
  initialData: User;
  onDemo?: () => void;
}

const Icons = {
  MagicWand: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 4L20 9M2 22L7 17M13 18L14 14L18 13L14 12L13 8L12 12L8 13L12 14L13 18Z" stroke="url(#magic_grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="magic_grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  ),
  User: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Camera: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
    </svg>
  )
};

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, initialData }) => {
  const [step, setStep] = useState(1);
  const [childName, setChildName] = useState(initialData.childName || '');
  const [parentName, setParentName] = useState(initialData.name || '');
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    ApiService.haptic('medium');
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result as string].slice(-5));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx: number) => {
    ApiService.haptic('light');
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const finish = () => {
    ApiService.haptic('heavy');
    onComplete({ childName: childName.trim(), name: parentName.trim(), childPhotos: photos });
  };

  return (
    <div className="fixed inset-0 z-[500] bg-white overflow-y-auto selection:bg-purple-100 flex flex-col">
      <div 
        className="relative max-w-xl mx-auto min-h-screen flex flex-col px-8 pb-10 w-full"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 100px)' }}
      >
        {/* Индикатор прогресса */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-12 flex-shrink-0">
          <div 
            className="h-full magic-gradient transition-all duration-700 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        <div className="flex-1 flex flex-col justify-center py-10">
          {step === 1 && (
            <div className="space-y-12 animate-fade-in text-center flex flex-col items-center">
              <div className="relative w-32 h-32 bg-white rounded-[44px] shadow-2xl flex items-center justify-center animate-bounce-slow">
                <Icons.MagicWand />
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-black text-indigo-950 leading-tight">
                  Оживите <br />
                  <span className="text-transparent bg-clip-text magic-gradient">мечты ребенка</span>
                </h1>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">
                  Создавайте персонализированные сказки, где иллюстрации в точности повторяют облик вашего малыша.
                </p>
              </div>
              <button 
                onClick={() => setStep(2)} 
                className="w-full magic-gradient text-white py-6 rounded-[28px] font-black text-xl shadow-xl active:scale-95 transition-all uppercase tracking-widest mt-8"
              >
                Начать магию
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-12 animate-fade-in flex flex-col w-full">
              <div className="text-center space-y-4">
                 <h2 className="text-3xl font-black text-indigo-950">Как вас зовут?</h2>
                 <p className="text-slate-500 font-medium">Это поможет нам сделать сказку личной.</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Имя взрослого</label>
                  <input type="text" value={parentName} onChange={e => setParentName(e.target.value)} placeholder="Мама Анна" className="w-full px-8 py-6 rounded-[32px] bg-slate-50 border border-slate-100 outline-none text-xl font-black text-indigo-950 shadow-sm" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Имя героя</label>
                  <input type="text" value={childName} onChange={e => setChildName(e.target.value)} placeholder="Артем" className="w-full px-8 py-6 rounded-[32px] bg-slate-50 border border-slate-100 outline-none text-xl font-black text-indigo-950 shadow-sm" />
                </div>
              </div>
              <button disabled={!childName.trim() || !parentName.trim()} onClick={() => setStep(3)} className="w-full magic-gradient text-white py-6 rounded-[28px] font-black text-xl shadow-xl disabled:opacity-20 active:scale-95 transition-all uppercase tracking-widest">
                Далее
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-12 animate-fade-in flex flex-col w-full">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-black text-indigo-950">Облик героя</h2>
                <p className="text-slate-500 font-medium">Загрузите 3-5 фотографий {childName}. Нейросеть запомнит черты лица.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {photos.map((p, i) => (
                  <div key={i} className="relative w-24 h-24">
                    <img src={p} className="w-full h-full object-cover rounded-[24px] shadow-lg" alt="ref" />
                    <button onClick={() => removePhoto(i)} className="absolute -top-2 -right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white"><Icons.Trash /></button>
                  </div>
                ))}
                {photos.length < 5 && (
                  <button onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-[24px] border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-1 text-slate-300">
                    <Icons.Camera />
                  </button>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" multiple />
              <button disabled={photos.length < 1} onClick={finish} className="w-full magic-gradient text-white py-6 rounded-[28px] font-black text-xl shadow-xl disabled:opacity-20 active:scale-95 transition-all uppercase tracking-widest">
                Создать профиль
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Onboarding;
