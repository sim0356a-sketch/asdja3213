
import React, { useState } from 'react';

const AdminBroadcast: React.FC = () => {
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSend = async () => {
    if (!msg.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();
      if (res.ok) setResult(`Успешно! Отправлено ${data.delivered} магам.`);
      else setResult('Ошибка при отправке');
    } catch (e) { setResult('Ошибка сети'); }
    setSending(false);
  };

  return (
    <div className="max-w-3xl glass-card rounded-[48px] p-12 border border-white/5 animate-fade-in">
      <div className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-4">Массовое вещание</div>
      <h3 className="text-2xl font-black mb-10 text-white">Отправить сообщение в чаты</h3>
      
      <textarea 
        value={msg}
        onChange={e => setMsg(e.target.value)}
        placeholder="Текст сообщения для всех пользователей телеграм-бота..."
        className="w-full h-64 bg-[#0a0a0c] border border-white/5 rounded-[32px] p-8 text-white focus:border-purple-500 outline-none resize-none mb-8 font-medium leading-relaxed"
      />

      {result && (
        <div className={`p-6 rounded-2xl mb-8 font-bold text-sm ${result.includes('Успешно') ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
          {result}
        </div>
      )}

      <button 
        onClick={handleSend}
        disabled={sending || !msg.trim()}
        className="magic-gradient text-white px-12 py-6 rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl disabled:opacity-20 active:scale-95 transition-all"
      >
        {sending ? 'Идет рассылка...' : 'Запустить Волну 🚀'}
      </button>
    </div>
  );
};

export default AdminBroadcast;
