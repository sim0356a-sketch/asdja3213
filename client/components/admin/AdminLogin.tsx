
import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: (token: string, email: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) setStep(2);
      else setError(data.error || 'Ошибка');
    } catch (e) { setError('Ошибка сети'); }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (res.ok) onLogin(data.token, email);
      else setError(data.error || 'Неверный код');
    } catch (e) { setError('Ошибка сети'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] p-6">
      <div className="glass-card w-full max-w-md p-10 rounded-[48px] border border-purple-500/20 shadow-2xl animate-fade-in">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-3xl font-black text-white">Админ-доступ</h1>
          <p className="text-gray-500 text-sm mt-2">Только для авторизованных магов</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-xs font-bold mb-6">{error}</div>}

        {step === 1 ? (
          <div className="space-y-6">
            <input 
              type="email" 
              placeholder="Email администратора" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#16161e] border border-white/5 rounded-2xl p-5 text-white focus:border-purple-500 outline-none transition-all"
            />
            <button 
              onClick={handleRequestOtp}
              disabled={loading || !email}
              className="w-full magic-gradient text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-50"
            >
              {loading ? 'Отправка...' : 'Получить код'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <input 
              type="text" 
              maxLength={6}
              placeholder="6-значный код" 
              value={otp}
              onChange={e => setOtp(e.target.value)}
              className="w-full bg-[#16161e] border border-white/5 rounded-2xl p-5 text-white text-center text-3xl font-black tracking-[0.5em] focus:border-purple-500 outline-none"
            />
            <button 
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 6}
              className="w-full magic-gradient text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-50"
            >
              {loading ? 'Проверка...' : 'Войти в замок'}
            </button>
            <button onClick={() => setStep(1)} className="w-full text-gray-600 text-[10px] font-bold uppercase">Назад</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
