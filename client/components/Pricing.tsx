
import React, { useState } from 'react';
import { PRICING, BRAND_NAME } from '../constants.tsx';
import { User, UserTier } from '../types.ts';
import { ApiService } from '../services/api.ts';

interface PricingProps {
  user: User | null;
  onUpgrade: (tier: UserTier) => void;
  onAddCredits: (amount: number) => void;
  onStart?: () => void;
  isMiniApp: boolean;
}

const Pricing: React.FC<PricingProps> = ({ user, onUpgrade, onAddCredits, onStart, isMiniApp }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const handlePay = async (type: string, amount: number) => {
    if (!user) {
      onStart?.();
      return;
    }
    
    setLoading(type);
    ApiService.haptic('medium');
    
    const paymentUrl = await ApiService.createPayment(user.id, amount, type as any);
    
    if (paymentUrl) {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.openLink(paymentUrl);
      } else {
        window.location.href = paymentUrl;
      }
    } else {
      alert('Ошибка при создании счета. Попробуйте еще раз.');
    }
    setLoading(null);
  };

  return (
    <div className={`animate-fade-in ${isMiniApp ? 'p-4 pb-32' : 'max-w-7xl mx-auto py-24 px-6'}`}>
      <div className="text-center mb-16">
        <div className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mb-4">Выберите свою магию</div>
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">Тарифы {BRAND_NAME}</h2>
        
        {/* Billing Cycle Toggle */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>Месяц</span>
          <button 
            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
            className="w-14 h-8 bg-slate-100 rounded-full relative p-1 transition-colors border border-slate-200"
          >
            <div className={`absolute top-1 left-1 w-6 h-6 bg-primary rounded-full transition-all ${billingCycle === 'yearly' ? 'translate-x-6' : ''}`}></div>
          </button>
          <span className={`text-sm font-bold flex items-center gap-2 ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>
            Год <span className="bg-green-100 text-green-600 text-[10px] px-2 py-0.5 rounded-full">-20%</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        
        {/* Free Plan */}
        <div className="flex flex-col p-10 rounded-[48px] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all h-full group">
          <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-8">
            <span className="material-symbols-outlined text-2xl">auto_awesome</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">Первая искра</h3>
          <p className="text-slate-500 text-sm mt-2 font-medium">Бесплатный тест для знакомства.</p>
          
          <div className="text-4xl font-black text-slate-900 my-8">
            0 ₽
          </div>

          <ul className="space-y-4 mb-10 flex-1">
            {[
              "1 сказка для теста",
              "Все темы и стили",
              "PDF-версия в Telegram",
              "Портретное сходство"
            ].map((text, idx) => (
              <li key={idx} className="flex items-center gap-3 text-sm font-bold text-slate-500">
                <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                {text}
              </li>
            ))}
          </ul>

          <button 
            onClick={user ? () => {} : onStart} 
            disabled={user?.credits !== undefined && user.credits > 0}
            className="w-full bg-slate-50 text-slate-400 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest disabled:opacity-50"
          >
            {user ? 'Уже использовано' : 'Начать бесплатно'}
          </button>
        </div>

        {/* Explorer Plan */}
        <div className="flex flex-col p-10 rounded-[48px] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all h-full relative group">
          <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
            <span className="material-symbols-outlined text-2xl">explore</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">Исследователь</h3>
          <p className="text-slate-500 text-sm mt-2 font-medium">Для регулярных историй.</p>

          <div className="my-8">
            <span className="text-4xl font-black text-slate-900">
              {billingCycle === 'monthly' ? PRICING.EXPLORER.MONTHLY : PRICING.EXPLORER.YEARLY} ₽
            </span>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest ml-2">/ месяц</span>
          </div>

          <ul className="space-y-4 mb-10 flex-1">
            {[
              "10 сказок каждый месяц",
              "Доступ к лучшим моделям ИИ",
              "Архив PDF без ограничений",
              "Приоритетная генерация"
            ].map((text, idx) => (
              <li key={idx} className="flex items-center gap-3 text-sm font-bold text-slate-900">
                <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                {text}
              </li>
            ))}
          </ul>

          <button 
            onClick={() => handlePay('EXPLORER', billingCycle === 'monthly' ? PRICING.EXPLORER.MONTHLY : PRICING.EXPLORER.YEARLY * 12)}
            className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-lg active:scale-95"
          >
            {loading === 'EXPLORER' ? 'Ожидание...' : 'Выбрать тариф'}
          </button>
        </div>

        {/* Storyteller Plan */}
        <div className="flex flex-col p-12 rounded-[56px] bg-white border-2 border-primary shadow-[0_40px_80px_-15px_rgba(37,140,244,0.15)] h-full relative z-10 scale-105">
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest">
            Безлимит
          </div>
          <div className="size-16 rounded-[24px] bg-primary flex items-center justify-center text-white mb-8 shadow-xl shadow-primary/30">
            <span className="material-symbols-outlined text-3xl">rocket_launch</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">Сказочник</h3>
          <p className="text-slate-500 text-sm mt-2 font-medium">Для тех, кто живет историями.</p>

          <div className="my-8">
            <span className="text-4xl font-black text-slate-900">
              {billingCycle === 'monthly' ? PRICING.STORYTELLER.MONTHLY : PRICING.STORYTELLER.YEARLY} ₽
            </span>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest ml-2">/ месяц</span>
          </div>

          <ul className="space-y-5 mb-12 flex-1">
            {[
              "Безлимитные сказки",
              "Лучшее качество иллюстраций",
              "Скидка 20% на печать книг",
              "Ранний доступ к новым мирам",
              "Личный ИИ-ассистент"
            ].map((text, idx) => (
              <li key={idx} className="flex items-center gap-4 text-sm font-black text-slate-900">
                <span className="material-symbols-outlined text-primary text-2xl">check_circle</span>
                {text}
              </li>
            ))}
          </ul>

          <button 
            onClick={() => handlePay('STORYTELLER', billingCycle === 'monthly' ? PRICING.STORYTELLER.MONTHLY : PRICING.STORYTELLER.YEARLY * 12)}
            className="w-full magic-gradient text-white py-6 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
          >
            {loading === 'STORYTELLER' ? 'Ожидание...' : 'Завладеть магией'}
          </button>
        </div>

      </div>

      <div className="glass-card p-12 rounded-[64px] border border-slate-100 text-center max-w-4xl mx-auto">
         <h4 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Бумажная версия</h4>
         <p className="text-base text-slate-500 leading-relaxed mb-8 font-medium">Превратите любую сказку в настоящую книгу. Плотная бумага, твердый переплет и доставка до двери.</p>
         <div className="inline-block px-10 py-5 rounded-[28px] bg-primary/5 border border-primary/10">
            <span className="text-3xl font-black text-primary">{PRICING.PRINT_BOOK} ₽</span>
         </div>
      </div>
    </div>
  );
};

export default Pricing;
