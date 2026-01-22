
import React, { useState } from 'react';
import { PRICING } from '../constants.tsx';
import { Tale } from '../types.ts';

interface OrderBookProps {
  tale: Tale;
  onClose: () => void;
  isMiniApp: boolean;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

const OrderBook: React.FC<OrderBookProps> = ({ tale, onClose, isMiniApp, onNotify }) => {
  const [address, setAddress] = useState('');
  const [isOrdered, setIsOrdered] = useState(false);

  const handleOrder = () => {
    setIsOrdered(true);
    onNotify?.('Заказ успешно оформлен! 📬', 'success');
  };

  if (isOrdered) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#0a0a0c] flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <h2 className="text-4xl font-black mb-4 text-white">Книга в печати!</h2>
        <button onClick={onClose} className="magic-gradient text-white px-12 py-5 rounded-[24px] font-black uppercase tracking-widest text-xs">Вернуться</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
      <div className="bg-[#16161e] w-full max-w-xl rounded-[48px] p-10 border border-white/10 shadow-2xl relative">
        <h2 className="text-2xl font-black text-white mb-10">Бумажная версия</h2>
        <textarea 
          value={address} 
          onChange={(e) => setAddress(e.target.value)} 
          placeholder="Адрес доставки..." 
          className="w-full p-6 rounded-[28px] border border-white/5 bg-[#0a0a0c] text-white mb-10" 
        />
        <button 
          onClick={handleOrder} 
          disabled={address.length < 10} 
          className="w-full magic-gradient text-white py-7 rounded-[32px] font-black shadow-2xl disabled:opacity-50"
        >
          Заказать за {PRICING.PRINT_BOOK} ₽
        </button>
        <button onClick={onClose} className="w-full text-gray-500 mt-4 text-xs font-black uppercase">Закрыть</button>
      </div>
    </div>
  );
};

export default OrderBook;
