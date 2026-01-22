
import React, { useState } from 'react';
import { BRAND_NAME, PRICING, TELEGRAM_BOT_URL } from '../constants.tsx';

interface PricingPageProps {
  onStart: () => void;
  isMiniApp: boolean;
}

const PricingPage: React.FC<PricingPageProps> = ({ onStart, isMiniApp }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const handleCta = () => {
    if (!isMiniApp) {
      window.open(TELEGRAM_BOT_URL, '_blank');
    } else {
      onStart();
    }
  };

  return (
    <div className="animate-fade-in flex flex-col items-center py-12 md:py-24 px-4 md:px-6 bg-white text-slate-900 min-h-screen relative overflow-hidden">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      <div className="max-w-[900px] flex flex-col items-center text-center mb-16 md:mb-24 relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-5 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8 shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 1.912 5.885h6.188l-5.005 3.637 1.912 5.885-5.007-3.637-5.007 3.637 1.912-5.885-5.005-3.637h6.188L12 3z"/></svg>
          <span>Доступ к магии</span>
        </div>
        <h1 className="text-slate-900 tracking-tight text-4xl md:text-7xl font-black leading-tight mb-8">
          Выберите свой путь <br />
          <span className="text-transparent bg-clip-text magic-gradient">в мире сказок</span>
        </h1>
        <p className="text-slate-500 text-lg md:text-2xl font-medium leading-relaxed max-w-2xl">
          От первой пробной главы до безлимитной библиотеки. Начните создавать воспоминания, которые останутся навсегда.
        </p>
      </div>

      <div className="flex flex-col items-center mb-16 md:mb-24 relative z-10">
        <div className="flex p-1.5 rounded-[24px] bg-slate-100 border border-slate-200 shadow-inner group">
          <button 
            onClick={() => setBillingCycle('monthly')}
            className={`relative flex items-center justify-center px-10 py-4 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all duration-300 ${billingCycle === 'monthly' ? 'bg-white shadow-xl text-primary' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Месяц
          </button>
          <button 
            onClick={() => setBillingCycle('yearly')}
            className={`relative flex items-center justify-center px-10 py-4 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all duration-300 ${billingCycle === 'yearly' ? 'bg-white shadow-xl text-primary' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Год <span className="ml-3 text-[10px] text-green-600 bg-green-100 px-2.5 py-1 rounded-full">-20%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-[1300px] w-full items-stretch relative z-10">
        
        <div className="flex flex-col rounded-[56px] border border-slate-100 bg-white p-10 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all h-full group">
          <div className="mb-10">
            <h3 className="text-3xl font-black text-slate-900 mb-3">Первая искра</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">Попробуйте магию в деле. Совершенно бесплатно.</p>
          </div>
          <div className="mb-10">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black tracking-tight text-slate-900">0 ₽</span>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Однажды и навсегда</div>
          </div>
          <button 
            onClick={handleCta}
            className="w-full h-16 rounded-[24px] bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center mb-10"
          >
            Начать бесплатно
          </button>
          <div className="flex flex-col gap-5">
            {[
              { text: "1 персональная сказка", ok: true },
              { text: "Все темы и стили", ok: true },
              { text: "PDF-версия в Telegram", ok: true },
              { text: "Безлимитный доступ", ok: false },
            ].map((item, i) => (
              <div key={i} className={`flex gap-4 text-sm font-bold ${item.ok ? 'text-slate-700' : 'text-slate-300'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${item.ok ? 'text-primary' : ''}`}><path d={item.ok ? "M22 11.08V12a10 10 0 1 1-5.93-9.14" : "M18 6L6 18M6 6l12 12"}></path>{item.ok && <polyline points="22 4 12 14.01 9 11.01"></polyline>}</svg>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex flex-col rounded-[56px] border-4 border-primary bg-white p-10 md:p-14 shadow-[0_80px_140px_-30px_rgba(37,140,244,0.4)] transform lg:-translate-y-10 z-20 h-full group transition-all duration-500 hover:scale-[1.03]">
          
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-30 magic-gradient text-white text-[13px] md:text-[15px] font-black px-12 py-5 rounded-full shadow-[0_20px_60px_rgba(37,140,244,0.7)] ring-8 ring-white tracking-[0.25em] uppercase animate-ultimate-float flex items-center gap-4">
            👑 Самый популярный 👑
          </div>
          
          <div className="mb-10">
            <h3 className="text-4xl font-black text-slate-900 mb-3 leading-tight">Безлимит</h3>
            <p className="text-slate-500 text-base font-medium leading-relaxed">Для семей, где сказки — это ежедневный ритуал.</p>
          </div>

          <div className="mb-10 flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-black tracking-tight text-slate-900">
                {billingCycle === 'monthly' ? '990 ₽' : '790 ₽'}
              </span>
              <span className="text-slate-400 font-black uppercase text-[11px] tracking-widest ml-3">/ мес</span>
            </div>
            <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mt-3 bg-primary/5 w-fit px-3 py-1 rounded-lg">
              {billingCycle === 'yearly' ? 'Экономия 2 400 ₽ в год' : 'Выгоднее при оплате за год'}
            </p>
          </div>

          <button 
            onClick={handleCta}
            className="w-full magic-gradient text-white py-8 rounded-[28px] font-black uppercase tracking-[0.3em] text-sm shadow-[0_25px_50px_-10px_rgba(37,140,244,0.5)] active:scale-95 transition-all mb-12 flex items-center justify-center gap-3"
          >
            <span>Завладеть магией</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>

          <div className="flex flex-col gap-6">
            {[
              "Неограниченное число сказок",
              "Скидка 20% на печать книг",
              "Персональный архив PDF",
              "Ранний доступ к новым мирам"
            ].map((text, i) => (
              <div key={i} className="flex gap-4 text-sm font-black text-slate-900">
                <div className="size-6 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-md">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col rounded-[56px] border border-slate-100 bg-white p-10 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all h-full group">
          <div className="mb-10">
            <h3 className="text-3xl font-black text-slate-900 mb-3">Исследователь</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">Для регулярных открытий каждую неделю.</p>
          </div>
          <div className="mb-10">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black tracking-tight text-slate-900">
                 {billingCycle === 'monthly' ? '499 ₽' : '399 ₽'}
              </span>
              <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest ml-2">/ мес</span>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">10 сказок в месяц</div>
          </div>
          <button 
            onClick={handleCta}
            className="w-full h-16 rounded-[24px] bg-slate-900 text-white hover:bg-slate-800 transition-all font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center mb-10 shadow-xl"
          >
            Выбрать Исследователя
          </button>
          <div className="flex flex-col gap-5">
            {[
              { text: "10 сказок в месяц", ok: true },
              { text: "Все темы и стили", ok: true },
              { text: "Высокое качество", ok: true },
              { text: "Скидка на печать", ok: false },
            ].map((item, i) => (
              <div key={i} className={`flex gap-4 text-sm font-bold ${item.ok ? 'text-slate-700' : 'text-slate-300'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${item.ok ? 'text-primary' : ''}`}><path d={item.ok ? "M22 11.08V12a10 10 0 1 1-5.93-9.14" : "M18 6L6 18M6 6l12 12"}></path>{item.ok && <polyline points="22 4 12 14.01 9 11.01"></polyline>}</svg>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="mt-24 md:mt-32 flex flex-wrap justify-center gap-10 md:gap-20 opacity-60 relative z-10">
        {[
          { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>, label: 'Безопасная оплата' },
          { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>, label: 'Отмена в любой момент' },
          { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>, label: 'Поддержка 24/7' }
        ].map((badge, i) => (
          <div key={i} className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
            {badge.icon}
            <span>{badge.label}</span>
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes ultimate-float {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -20px); }
        }
        .animate-ultimate-float {
          animation: ultimate-float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PricingPage;
