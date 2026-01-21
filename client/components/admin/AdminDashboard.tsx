
import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin.tsx';
import AdminBroadcast from './AdminBroadcast.tsx';
import AdminSettings from './AdminSettings.tsx';

interface AdminDashboardProps {
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [email, setEmail] = useState<string | null>(localStorage.getItem('admin_email'));
  const [stats, setStats] = useState({ users: 0, tales: 0, revenue: 0, activeGens: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [view, setView] = useState<'stats' | 'users' | 'broadcast' | 'settings'>('stats');

  useEffect(() => {
    if (token) {
      fetchStats();
      if (view === 'users') fetchUsers();
    }
  }, [token, view]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data);
    } catch (e) { console.error(e); }
  };

  const handleLogin = (newToken: string, newEmail: string) => {
    localStorage.setItem('admin_token', newToken);
    localStorage.setItem('admin_email', newEmail);
    setToken(newToken);
    setEmail(newEmail);
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    onClose();
  };

  if (!token) return <AdminLogin onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 p-8 flex flex-col">
        <div className="flex items-center gap-3 mb-12">
          <div className="text-3xl">🦄</div>
          <div>
            <div className="font-black text-lg leading-none">Admin<span className="text-purple-600">Panel</span></div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">SkazkaAI Engine</div>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: 'stats', label: 'Обзор', icon: '📊' },
            { id: 'users', label: 'Маги', icon: '👥' },
            { id: 'broadcast', label: 'Рассылка', icon: '📢' },
            { id: 'settings', label: 'Настройки', icon: '⚙️' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all font-black text-[11px] uppercase tracking-widest ${view === item.id ? 'bg-purple-50 text-purple-600 shadow-sm border border-purple-100' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-slate-100">
          <div className="text-[8px] text-slate-400 font-black uppercase mb-2 tracking-widest">Вы вошли как:</div>
          <div className="text-[10px] font-black truncate mb-6 text-slate-900">{email}</div>
          <button onClick={handleLogout} className="text-red-500 text-[9px] font-black uppercase hover:underline tracking-widest">Выйти</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-black tracking-tight">
            {view === 'stats' && 'Обзор системы'}
            {view === 'users' && 'База магов'}
            {view === 'broadcast' && 'Центр уведомлений'}
            {view === 'settings' && 'Конфигурация'}
          </h2>
          <button onClick={onClose} className="bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">Закрыть</button>
        </header>

        {view === 'stats' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Пользователей', val: stats.users, icon: '👤' },
                { label: 'Сказкок', val: stats.tales, icon: '📖' },
                { label: 'Оборот (₽)', val: stats.revenue.toLocaleString(), icon: '💰' },
                { label: 'В процессе', val: stats.activeGens, icon: '⚡' }
              ].map((s, i) => (
                <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-200 relative overflow-hidden group shadow-sm">
                   <div className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-2">{s.label}</div>
                   <div className="text-3xl font-black">{s.val}</div>
                   <div className="absolute top-0 right-0 p-4 text-4xl opacity-5 group-hover:scale-110 transition-transform">{s.icon}</div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-[40px] border border-slate-200 h-64 flex items-center justify-center text-slate-300 italic text-sm font-medium">График активности (в разработке)</div>
          </div>
        )}

        {view === 'users' && (
          <div className="bg-white rounded-[32px] overflow-hidden border border-slate-200 shadow-sm animate-fade-in">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[8px] font-black uppercase tracking-[0.25em] text-slate-400">
                  <tr>
                    <th className="p-6">Пользователь</th>
                    <th className="p-6">Ребенок</th>
                    <th className="p-6">Искры</th>
                    <th className="p-6 text-right">Детали</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-6">
                        <div className="font-bold text-sm">{u.name || 'Аноним'}</div>
                        <div className="text-[9px] text-slate-400 font-mono">{u.id}</div>
                      </td>
                      <td className="p-6 font-bold text-purple-600 text-sm">{u.child_name || '-'}</td>
                      <td className="p-6 font-black text-sm">{u.credits} ✨</td>
                      <td className="p-6 text-right">
                        <button onClick={() => setSelectedUser(u)} className="text-purple-600 text-[8px] font-black uppercase tracking-widest bg-purple-50 px-4 py-2 rounded-xl border border-purple-100">Открыть</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        )}

        {view === 'broadcast' && <AdminBroadcast />}
        {view === 'settings' && <AdminSettings />}

        {selectedUser && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedUser(null)}></div>
            <div className="relative bg-white w-full max-w-2xl rounded-[40px] border border-slate-200 p-8 overflow-y-auto max-h-[90vh] shadow-2xl">
              <div className="flex justify-between items-start mb-8">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-3xl">👤</div>
                  <div>
                    <h3 className="text-xl font-black">{selectedUser.name || 'Маг'}</h3>
                    <div className="text-slate-400 text-[10px] font-mono">{selectedUser.id}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-slate-300 hover:text-slate-900 transition-colors">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Ребенок</div>
                  <div className="font-bold text-purple-600">{selectedUser.child_name || '-'}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Баланс</div>
                  <div className="font-bold">{selectedUser.credits} искр</div>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-100 flex gap-4">
                 <button className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all">Действие 1</button>
                 <button className="flex-1 bg-purple-600 text-white py-4 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-md">Действие 2</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
