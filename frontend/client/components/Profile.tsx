
import React, { useRef, useState, useEffect } from 'react';
import { User, UserTier } from '../types.ts';
import { ApiService } from '../services/api.ts';

interface ProfileProps {
  user: User;
  onUpdateUser: (updates: Partial<User>) => void;
  isMiniApp: boolean;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onNavigate, onLogout }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user.childName);

  useEffect(() => {
    setTempName(user.childName);
  }, [user.childName]);

  const saveName = () => {
    if (tempName.trim()) {
      onUpdateUser({ childName: tempName.trim() });
      setIsEditingName(false);
      ApiService.haptic('success');
    }
  };

  const isPremium = user.tier === UserTier.PREMIUM;

  return (
    <div className="px-6 py-10 animate-fade-in pb-40" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 100px)' }}>
      <div className="flex justify-between items-center mb-10">
        <div>
          <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.4em]">Настройки магии</span>
          <h2 className="text-3xl font-black text-indigo-950">Личный кабинет</h2>
        </div>
        <button 
          onClick={onLogout} 
          className="text-[9px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors border border-slate-200 px-4 py-2 rounded-xl bg-white/50 hover:bg-white active:scale-95"
        >
          Выйти
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Левая колонка: Основная инфо-карта */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-[48px] p-8 text-center relative overflow-hidden shadow-xl border-white/80 flex flex-col items-center">
            {/* Аватар */}
            <div className="w-32 h-32 rounded-[44px] mb-6 border-4 border-white shadow-2xl overflow-hidden relative group ring-4 ring-purple-100/50">
              <img 
                src={user.childPhotos[0] || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.childName}`} 
                className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                alt="Avatar"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-purple-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[8px] text-white font-black uppercase tracking-widest backdrop-blur-sm"
              >
                Сменить
              </button>
            </div>

            {/* Имя героя */}
            {isEditingName ? (
              <div className="flex flex-col gap-2 w-full max-w-xs mb-2">
                <input 
                  value={tempName} 
                  onChange={e => setTempName(e.target.value)} 
                  className="w-full bg-white/80 border border-purple-200 rounded-2xl px-4 py-3 text-center font-black text-indigo-950 outline-none focus:ring-4 ring-purple-500/10 transition-all shadow-sm" 
                  autoFocus 
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                />
                <button 
                  onClick={saveName} 
                  className="magic-gradient text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform shadow-md"
                >
                  Применить
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 cursor-pointer group mb-1" onClick={() => setIsEditingName(true)}>
                <h3 className="text-2xl font-black text-indigo-950 group-hover:text-purple-600 transition-colors">{user.childName}</h3>
                <span className="text-purple-400 text-sm group-hover:scale-125 transition-transform">✎</span>
              </div>
            )}
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Главный герой сказки</p>

            {/* Искры */}
            <div className="mt-10 w-full bg-white/50 backdrop-blur-md p-6 rounded-[32px] border border-white shadow-inner-lg">
              <div className="text-3xl font-black text-indigo-950">{user.credits} <span className="text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">✨</span></div>
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Искры воображения</div>
              <button 
                onClick={() => onNavigate('pricing')}
                className="mt-6 w-full magic-gradient text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-purple-200 active:scale-95 transition-all hover:brightness-110"
              >
                Пополнить баланс
              </button>
            </div>
          </div>
        </div>

        {/* Правая колонка: ДНК и Подписка */}
        <div className="lg:col-span-8 space-y-8">
          {/* Визуальный ДНК Героя */}
          <div className="glass-card rounded-[48px] p-8 border-white/80 shadow-sm overflow-hidden relative">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Визуальный ДНК</h4>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Нейросеть помнит эти черты лица</p>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-purple-600 text-[9px] font-black uppercase tracking-widest bg-purple-50 hover:bg-purple-100 px-5 py-2.5 rounded-xl border border-purple-100 transition-colors shadow-sm"
              >
                + Добавить фото
              </button>
            </div>
            
            <div className="flex flex-wrap gap-5">
              {user.childPhotos.length > 0 ? (
                user.childPhotos.map((photo, idx) => (
                  <div key={idx} className="relative w-24 h-24 group animate-fade-in">
                    <img src={photo} className="w-full h-full object-cover rounded-[28px] border-4 border-white shadow-md transition-transform group-hover:scale-105" alt="Hero DNA" />
                    <div className="absolute inset-0 bg-indigo-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[28px] backdrop-blur-[2px]">
                       <button 
                        onClick={() => onUpdateUser({ childPhotos: user.childPhotos.filter((_, i) => i !== idx) })}
                        className="bg-white text-red-500 w-8 h-8 rounded-full flex items-center justify-center shadow-lg active:scale-75 transition-transform"
                       >
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                       </button>
                    </div>
                  </div>
                ))
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-14 rounded-[40px] border-4 border-dashed border-purple-100 bg-white/40 flex flex-col items-center justify-center gap-4 text-slate-400 cursor-pointer hover:bg-white/60 hover:border-purple-200 transition-all"
                >
                  <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center text-purple-400">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-950/40">Загрузите 3-5 фото</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Для портретного сходства</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Статус подписки */}
          <div className={`glass-card rounded-[48px] p-10 border-2 transition-all overflow-hidden relative ${isPremium ? 'border-purple-200 bg-white/80' : 'border-slate-100 bg-white/40'}`}>
            <div className="flex justify-between items-center relative z-10">
              <div className="flex flex-col gap-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Статус аккаунта</h4>
                <div className="flex items-center gap-4">
                  <h3 className={`text-3xl font-black ${isPremium ? 'text-indigo-950' : 'text-slate-400'}`}>
                    {isPremium ? 'Сказочник Премиум' : 'Ученик Мага'}
                  </h3>
                  {isPremium ? (
                    <span className="bg-green-100 text-green-600 text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-green-200">Активна</span>
                  ) : (
                    <button 
                      onClick={() => onNavigate('pricing')}
                      className="bg-purple-600 text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest"
                    >
                      Улучшить
                    </button>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Следующее списание</p>
                <p className="font-bold text-indigo-950">{isPremium ? '15.04.2025' : '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        multiple 
        onChange={(e) => {
          const files = e.target.files;
          if (files) {
            ApiService.haptic('medium');
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                onUpdateUser({ childPhotos: [event.target.result as string, ...user.childPhotos].slice(0, 5) });
              }
            };
            reader.readAsDataURL(files[0]);
          }
        }}
      />
    </div>
  );
};

export default Profile;
