
import React, { useState, useEffect, useCallback } from 'react';
import { User, Tale, UserTier } from './types.ts';
import { ApiService } from './services/api.ts';
import Layout from './components/Layout.tsx';
import Library from './components/Library.tsx';
import CreationFunnel from './components/CreationFunnel.tsx';
import Profile from './components/Profile.tsx';
import TaleReader from './components/TaleReader.tsx';
import LandingPage from './components/LandingPage.tsx';
import PricingPage from './components/PricingPage.tsx';
import Onboarding from './components/Onboarding.tsx';
import OrderBook from './components/OrderBook.tsx';
import WhyItWorks from './components/WhyItWorks.tsx';
import { FAQ } from './components/Marketing.tsx';
import { SAMPLE_TALES } from './data/samples.ts';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tales, setTales] = useState<Tale[]>([]);
  const [currentView, setCurrentView] = useState('home');
  const [activeTaleId, setActiveTaleId] = useState<string | null>(null);
  const [activeSampleTale, setActiveSampleTale] = useState<Tale | null>(null);
  const [orderTaleId, setOrderTaleId] = useState<string | null>(null);
  const [isTG, setIsTG] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    ApiService.haptic(type === 'success' ? 'success' : 'error');
    setTimeout(() => setToast(null), 3500);
  };

  const isProfileComplete = (u: User | null): boolean => {
    return !!(u && u.childName && u.childPhotos && u.childPhotos.length > 0);
  };

  const initApp = useCallback(async () => {
    try {
      const tgData = ApiService.getTelegramData();
      const isTelegram = !!tgData;
      setIsTG(isTelegram);

      const userId = tgData?.user?.id ? String(tgData.user.id) : localStorage.getItem('skazka_user_id');

      if (isTelegram) {
        const tg = (window as any).Telegram?.WebApp;
        if (tg) {
          tg.ready();
          tg.expand();
        }
      }

      if (userId) {
        const loadedUser = await ApiService.getUser(userId);
        if (loadedUser) {
          setUser(loadedUser);
          const loadedTales = await ApiService.getTales(userId);
          setTales(loadedTales);
          
          if (isTelegram) {
            setCurrentView(isProfileComplete(loadedUser) ? 'library' : 'onboarding');
          } else {
            setCurrentView('library');
          }
        } else {
          setCurrentView(isTelegram ? 'onboarding' : 'home');
        }
      } else {
        setCurrentView(isTelegram ? 'onboarding' : 'home');
      }
    } catch (e) {
      console.error('Initialization error:', e);
      setCurrentView('home');
    } finally {
      setTimeout(() => setIsLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    initApp();
  }, [initApp]);

  const handleStartGeneration = async (params: any) => {
    if (!user) return;
    
    if (user.credits <= 0 && user.tier !== UserTier.PREMIUM) {
      showToast("Недостаточно искр ✨", "error");
      setCurrentView('pricing');
      return;
    }

    const tempId = `tale_${Date.now()}`;
    const tempTale: Tale = {
      id: tempId, 
      title: 'Новое приключение...', 
      pages: [], 
      status: 'generating', 
      progress: 5, 
      createdAt: Date.now(), 
      childName: user.childName, 
      heroPhoto: user.childPhotos[0]
    };
    
    setTales(prev => [tempTale, ...prev]);
    setCurrentView('library');
    showToast("Магия началась! 🦄");

    // Запуск генерации через API
    try {
      const result = await ApiService.generateTale({
        childName: user.childName,
        theme: params.theme,
        hook: params.hook || '',
        style: params.style,
        extraCharacters: params.selectedCharIds || [],
        heroPhoto: user.childPhotos[0]
      }, user.id);

      if (!result?.tale) {
        throw new Error('No tale generated');
      }

      const finalTale: Tale = {
        ...tempTale,
        ...result.tale,
        status: 'ready',
        progress: 100
      };

      setTales(prev => prev.map(tale => (tale.id === tempId ? finalTale : tale)));
      if (result.credits !== undefined) {
        setUser(prev => (prev ? { ...prev, credits: result.credits } : prev));
      }
    } catch (e) {
      console.error('Story generation failed:', e);
      setTales(prev => prev.map(tale => (
        tale.id === tempId ? { ...tale, status: 'error' } : tale
      )));
      showToast("Не удалось создать сказку. Попробуйте еще раз.", "error");
    }
  };

  const handleNavigate = (view: string) => {
    ApiService.haptic('light');
    if (!user && (view === 'library' || view === 'create' || view === 'profile')) {
      setCurrentView('onboarding');
      return;
    }
    setCurrentView(view);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
        <div className="text-8xl animate-bounce">🦄</div>
        <div className="mt-8 text-purple-600 font-black uppercase tracking-[0.3em] text-xs">Пробуждаем магию...</div>
      </div>
    );
  }

  return (
    <Layout 
      isMiniApp={isTG} 
      currentView={currentView} 
      onNavigate={handleNavigate}
      userExists={!!user}
      userAvatar={user?.childPhotos?.[0]}
      onLogout={() => { 
        localStorage.clear();
        setUser(null); 
        setTales([]);
        setCurrentView('home'); 
      }}
    >
      {currentView === 'home' && (
        <LandingPage 
          onStart={() => handleNavigate('create')} 
          onPricing={() => handleNavigate('pricing')} 
          onReadSample={setActiveSampleTale}
          authenticated={!!user}
          isMiniApp={isTG}
        />
      )}
      
      {currentView === 'library' && (
        <Library 
          tales={tales} 
          isMiniApp={isTG} 
          onRead={setActiveTaleId} 
          onOrder={setOrderTaleId} 
          onNavigateToCreate={() => handleNavigate('create')} 
        />
      )}
      
      {currentView === 'create' && user && (
        <CreationFunnel 
          user={user} 
          isMiniApp={isTG} 
          onStartGeneration={handleStartGeneration} 
          onCancel={() => handleNavigate('library')} 
        />
      )}
      
      {currentView === 'profile' && user && (
        <Profile 
          user={user} 
          onUpdateUser={(u) => {
            const updated = { ...user, ...u };
            setUser(updated);
            ApiService.updateUser(updated);
          }} 
          isMiniApp={isTG} 
          onNavigate={handleNavigate} 
          onLogout={() => { 
            localStorage.clear();
            setUser(null); 
            setTales([]);
            setCurrentView('home'); 
          }} 
        />
      )}
      
      {currentView === 'onboarding' && (
        <Onboarding 
          onComplete={(data) => {
            const newUser: User = {
              id: isTG ? ApiService.getTelegramData()?.user?.id.toString() : (localStorage.getItem('skazka_user_id') || `user_${Date.now()}`),
              credits: 1,
              tier: UserTier.FREE,
              createdAt: Date.now(),
              extraCharacters: [],
              childPhotos: [],
              childName: '',
              name: '',
              ...data
            } as User;
            setUser(newUser);
            ApiService.createUser(newUser);
            setCurrentView('library');
            showToast("Приятно познакомиться! ✨");
          }} 
          initialData={user || { childName: '', name: '', childPhotos: [] } as any} 
        />
      )}
      
      {currentView === 'pricing' && (
        <PricingPage onStart={() => handleNavigate('onboarding')} isMiniApp={isTG} />
      )}

      {currentView === 'faq' && <FAQ />}

      {activeTaleId && (
        <TaleReader 
          tale={tales.find(t => t.id === activeTaleId)!} 
          isMiniApp={isTG} 
          onClose={() => setActiveTaleId(null)} 
          onOrder={setOrderTaleId} 
          userId={user?.id}
          onNotify={showToast}
        />
      )}

      {activeSampleTale && (
        <TaleReader 
          tale={activeSampleTale} 
          isMiniApp={isTG} 
          onClose={() => setActiveSampleTale(null)} 
          onOrder={() => {}} 
          onStartCreation={() => {
            setActiveSampleTale(null);
            handleNavigate('create');
          }}
          isSample={true}
        />
      )}

      {orderTaleId && tales.find(t => t.id === orderTaleId) && (
        <OrderBook 
          tale={tales.find(t => t.id === orderTaleId)!} 
          isMiniApp={isTG} 
          onClose={() => setOrderTaleId(null)} 
          onNotify={showToast} 
        />
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[1000] bg-white border border-purple-100 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in">
          <span className={toast.type === 'error' ? 'text-red-500' : 'text-purple-500'}>
            {toast.type === 'error' ? '⚠️' : '✨'}
          </span>
          <span className="text-xs font-black uppercase tracking-widest text-indigo-950">{toast.msg}</span>
        </div>
      )}
    </Layout>
  );
};

export default App;
