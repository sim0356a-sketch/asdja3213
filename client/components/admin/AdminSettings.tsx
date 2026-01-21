
import React, { useState, useEffect } from 'react';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({ proxy: '' });
  const [admins, setAdmins] = useState<{email: string, created_at: string}[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [adminError, setAdminError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/settings').then(r => r.json()),
      fetch('/api/admin/list').then(r => r.json())
    ]).then(([sData, aData]) => {
      setSettings({ proxy: sData.proxy || '' });
      setAdmins(aData);
      setLoading(false);
    });
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (e) { alert('Ошибка сохранения'); }
    setSaving(false);
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    setAdminError('');
    try {
      const res = await fetch('/api/admin/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newAdminEmail.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setAdmins([{ email: newAdminEmail.trim(), created_at: new Date().toISOString() }, ...admins]);
        setNewAdminEmail('');
      } else {
        setAdminError(data.error);
      }
    } catch (e) { setAdminError('Ошибка сети'); }
  };

  const handleDeleteAdmin = async (email: string) => {
    if (!confirm(`Удалить ${email} из списка администраторов?`)) return;
    try {
      const res = await fetch(`/api/admin/list/${email}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setAdmins(admins.filter(a => a.email !== email));
      } else {
        alert(data.error);
      }
    } catch (e) { alert('Ошибка сети'); }
  };

  if (loading) return <div className="text-center py-20 animate-pulse">Загрузка шестеренок...</div>;

  return (
    <div className="space-y-12 pb-20">
      {/* Network Settings */}
      <div className="max-w-3xl glass-card rounded-[48px] p-12 border border-white/5 animate-fade-in">
        <div className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-4">Конфигурация Сети</div>
        <h3 className="text-2xl font-black mb-12 text-white">Соединения</h3>

        <div className="space-y-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">HTTP Proxy URL</label>
            <input 
              type="text"
              placeholder="http://login:pass@ip:port"
              value={settings.proxy}
              onChange={e => setSettings({...settings, proxy: e.target.value})}
              className="w-full bg-[#0a0a0c] border border-white/5 rounded-2xl p-5 text-white focus:border-purple-500 outline-none"
            />
          </div>
        </div>

        <div className="mt-16 flex items-center gap-8">
          <button 
            onClick={handleSaveSettings}
            disabled={saving}
            className="magic-gradient text-white px-12 py-6 rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all"
          >
            {saving ? 'Применяем...' : 'Сохранить изменения'}
          </button>
          {success && <div className="text-green-500 font-bold text-xs animate-bounce">✨ Сохранено!</div>}
        </div>
      </div>

      {/* Admin Access Management */}
      <div className="max-w-3xl glass-card rounded-[48px] p-12 border border-white/5 animate-fade-in">
        <div className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-4">Безопасность</div>
        <h3 className="text-2xl font-black mb-12 text-white">Управление доступом</h3>

        <div className="mb-12">
          <div className="flex gap-4">
            <input 
              type="email"
              placeholder="Email нового администратора"
              value={newAdminEmail}
              onChange={e => setNewAdminEmail(e.target.value)}
              className="flex-1 bg-[#0a0a0c] border border-white/5 rounded-2xl p-5 text-white focus:border-purple-500 outline-none"
            />
            <button 
              onClick={handleAddAdmin}
              className="bg-white/5 hover:bg-white/10 text-white px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-white/5 transition-all"
            >
              Добавить
            </button>
          </div>
          {adminError && <div className="text-red-500 text-[10px] font-bold mt-2 ml-2">{adminError}</div>}
        </div>

        <div className="space-y-4">
          <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2 mb-4">Действующие администраторы</div>
          {admins.map(admin => (
            <div key={admin.email} className="flex items-center justify-between p-6 bg-[#0a0a0c]/40 rounded-3xl border border-white/5 group">
              <div className="flex flex-col">
                <span className="font-bold text-white">{admin.email}</span>
                <span className="text-[9px] text-gray-700 font-black uppercase tracking-widest mt-1">Добавлен: {new Date(admin.created_at).toLocaleDateString()}</span>
              </div>
              <button 
                onClick={() => handleDeleteAdmin(admin.email)}
                className="text-gray-800 hover:text-red-500 transition-colors p-2"
                title="Удалить доступ"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
