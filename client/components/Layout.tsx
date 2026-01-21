
import React, { useState, useEffect, useRef } from 'react';
import { ApiService } from '../services/api.ts';
import { BRAND_NAME } from '../constants.tsx';

interface LayoutProps {
  children: React.ReactNode;
  isMiniApp: boolean;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
  userExists: boolean;
  userAvatar?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, isMiniApp, onNavigate, currentView, userExists, userAvatar, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        setIsScrolled(scrollRef.current.scrollTop > 20);
      }
    };
    const mainEl = scrollRef.current;
    if (mainEl) {
      mainEl.addEventListener('scroll', handleScroll);
    }
    return () => mainEl?.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (view: string) => {
    ApiService.haptic('light');
    onNavigate(view);
  };

  const Icons = {
    Books: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "1.8"} strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-300">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    Plus: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    User: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "1.8"} strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-300">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )
  };

  const isActive = (view: string) => currentView === view;
  const hideDock = currentView === 'create' || currentView === 'onboarding' || (currentView === 'home' && !isMiniApp);
  const showHeader = !isMiniApp || currentView === 'home';

  return (
    <div className="fixed inset-0 flex flex-col font-sans selection:bg-purple-200 overflow-hidden">
      
      {/* Top Header (Web / Home) */}
      {showHeader && (
        <header className="fixed top-0 left-0 right-0 z-[110] px-6 py-4 animate-fade-in transition-all duration-500">
          <div className={`max-w-7xl mx-auto flex items-center justify-between transition-all duration-500 rounded-[28px] px-6 h-16 ${
            isScrolled 
              ? 'bg-white/70 backdrop-blur-2xl border border-white/80 shadow-sm' 
              : 'bg-transparent border border-transparent shadow-none'
          }`}>
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => handleNavClick('home')}
            >
              <div className="text-2xl drop-shadow-[0_0_8px_rgba(139,92,246,0.3)] group-hover:scale-110 transition-transform">🦄</div>
              <span className={`font-black text-lg tracking-tight transition-colors ${isScrolled ? 'text-indigo-950' : 'text-indigo-900'}`}>
                {BRAND_NAME.split(' ')[0]}<span className="text-purple-600">{BRAND_NAME.split(' ')[1] || 'AI'}</span>
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              {userExists && (
                <button 
                  onClick={() => handleNavClick('library')}
                  className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive('library') ? 'text-purple-600' : isScrolled ? 'text-slate-400 hover:text-slate-600' : 'text-indigo-950/60 hover:text-indigo-950'}`}
                >
                  Библиотека
                </button>
              )}
              <button 
                onClick={() => handleNavClick('pricing')}
                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive('pricing') ? 'text-purple-600' : isScrolled ? 'text-slate-400 hover:text-slate-600' : 'text-indigo-950/60 hover:text-indigo-950'}`}
              >
                Тарифы
              </button>
            </nav>

            <div className="flex items-center gap-4">
              {userExists ? (
                <button 
                  onClick={() => handleNavClick('profile')}
                  className={`w-10 h-10 rounded-xl border overflow-hidden shadow-sm active:scale-90 transition-all ${isScrolled ? 'bg-purple-100 border-white' : 'bg-white/40 border-white/20'}`}
                >
                  <img src={userAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=hero`} className="w-full h-full object-cover" alt="User" />
                </button>
              ) : (
                <button 
                  onClick={() => handleNavClick('create')}
                  className="magic-gradient text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                >
                  Войти
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      <main ref={scrollRef} className={`flex-1 overflow-y-auto no-scrollbar scroll-smooth ${showHeader ? 'pt-24' : ''} pb-24`}>
        {children}
      </main>

      {/* Glassmorphism Dock (Mobile / In-App) */}
      {!hideDock && (
        <nav className="fixed bottom-8 left-0 right-0 z-[100] px-8 pointer-events-none flex justify-center animate-fade-in">
          <div className="pointer-events-auto flex items-center bg-white/85 backdrop-blur-3xl border border-white/60 shadow-[0_15px_40px_rgba(0,0,0,0.12),0_5px_15px_rgba(139,92,246,0.08)] rounded-[32px] px-2 py-2 h-16 w-full max-w-[320px] relative">
            
            {/* Library */}
            <button 
              onClick={() => handleNavClick('library')}
              className={`relative flex-1 flex flex-col items-center justify-center h-full transition-all duration-500 ${isActive('library') ? 'text-purple-600' : 'text-slate-400 hover:text-purple-400'}`}
            >
              {isActive('library') && (
                <div className="absolute inset-0 bg-purple-500/10 blur-xl rounded-full animate-glow-pulse"></div>
              )}
              <div className={`z-10 transition-transform ${isActive('library') ? 'scale-115 drop-shadow-md' : 'scale-100'}`}>
                {Icons.Books(isActive('library'))}
              </div>
            </button>

            {/* Create Button */}
            <div className="relative px-3">
              <button 
                onClick={() => handleNavClick('create')}
                className="relative flex items-center justify-center bg-purple-600 w-12 h-12 rounded-2xl shadow-[0_12px_24px_rgba(139,92,246,0.4)] hover:scale-110 active:scale-95 transition-all duration-300 overflow-hidden group border-2 border-white/20"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                {Icons.Plus()}
              </button>
            </div>

            {/* Profile */}
            <button 
              onClick={() => handleNavClick('profile')}
              className={`relative flex-1 flex flex-col items-center justify-center h-full transition-all duration-500 ${isActive('profile') ? 'text-purple-600' : 'text-slate-400 hover:text-purple-400'}`}
            >
              {isActive('profile') && (
                <div className="absolute inset-0 bg-purple-500/10 blur-xl rounded-full animate-glow-pulse"></div>
              )}
              <div className={`z-10 transition-transform ${isActive('profile') ? 'scale-115 drop-shadow-md' : 'scale-100'}`}>
                {Icons.User(isActive('profile'))}
              </div>
            </button>
          </div>
        </nav>
      )}
      
      <style>{`
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        .animate-glow-pulse {
          animation: glow-pulse 3s ease-in-out infinite;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Layout;
