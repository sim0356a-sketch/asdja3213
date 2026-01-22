
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ApiService } from '../services/api.ts';

interface CarouselItem {
  id: string;
  label: string;
  description: string;
  image?: string;
}

interface CarouselProps {
  items: CarouselItem[];
  onSelect: (id: string) => void;
  focusedId: string;
  stepType: 'theme' | 'style';
}

const Carousel: React.FC<CarouselProps> = ({ items, onSelect, focusedId }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [padding, setPadding] = useState(0);
  const [localFocusedId, setLocalFocusedId] = useState(focusedId);
  const [itemScales, setItemScales] = useState<Record<string, number>>({});

  const CARD_HEIGHT = 280;
  const GAP = 32;

  useEffect(() => {
    const calcPadding = () => {
      if (!scrollRef.current) return;
      const containerHeight = scrollRef.current.offsetHeight;
      // Оставляем небольшое смещение, чтобы нижняя карточка была видна на 30-40%
      setPadding((containerHeight - CARD_HEIGHT) / 2);
    };
    calcPadding();
    window.addEventListener('resize', calcPadding);
    return () => window.removeEventListener('resize', calcPadding);
  }, [CARD_HEIGHT]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerCenterY = containerRect.top + container.offsetHeight / 2;
    const cards = container.querySelectorAll('.arc-card');
    
    let closestId = localFocusedId;
    let minDistance = Infinity;
    const newScales: Record<string, number> = {};

    cards.forEach((card) => {
      const id = card.getAttribute('data-id')!;
      const cardRect = card.getBoundingClientRect();
      const cardCenterY = cardRect.top + cardRect.height / 2;
      const distance = Math.abs(cardCenterY - containerCenterY);
      
      const scale = Math.max(0.8, 1 - (distance / (container.offsetHeight / 1.5)) * 0.2);
      newScales[id] = scale;

      if (distance < minDistance) {
        minDistance = distance;
        closestId = id;
      }
    });

    setItemScales(newScales);
    if (closestId !== localFocusedId) {
      setLocalFocusedId(closestId);
      onSelect(closestId);
      ApiService.haptic('light');
    }
  }, [localFocusedId, onSelect]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    
    const activeCard = container.querySelector(`[data-id="${focusedId}"]`);
    if (activeCard) {
      activeCard.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' });
    }
    handleScroll();
  }, [items, focusedId]);

  return (
    <div className="flex-shrink-0 flex flex-col relative flex-1 w-full overflow-hidden h-full">
      <div 
        ref={scrollRef}
        onScroll={() => requestAnimationFrame(handleScroll)}
        className="flex flex-col overflow-y-auto h-full items-center snap-y snap-mandatory no-scrollbar"
        style={{ 
          paddingTop: `${padding}px`, 
          paddingBottom: `${padding}px`, 
          gap: `${GAP}px`,
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {items.map((item) => {
          const isAtCenter = localFocusedId === item.id;
          const currentScale = itemScales[item.id] || (isAtCenter ? 1 : 0.8);
          
          return (
            <div 
              key={item.id} 
              data-id={item.id}
              onClick={(e) => { 
                e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }); 
                onSelect(item.id); 
                ApiService.haptic('medium'); 
              }}
              className="arc-card relative flex-shrink-0 rounded-[44px] snap-center transition-all duration-500 ease-out origin-center"
              style={{ 
                width: '88%', 
                maxWidth: '340px',
                height: `${CARD_HEIGHT}px`, 
                transform: `scale(${currentScale})`,
                zIndex: isAtCenter ? 50 : 10,
              }}
            >
              <div className={`w-full h-full rounded-[44px] overflow-hidden relative shadow-2xl transition-all duration-500 ${isAtCenter ? 'ring-4 ring-purple-500/30' : 'ring-1 ring-white/20'}`}>
                <img src={item.image || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853'} className="w-full h-full object-cover" alt={item.label} />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 via-indigo-950/20 to-transparent"></div>
                
                <div className={`absolute bottom-8 left-8 right-8 transition-all duration-500 transform ${isAtCenter ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <h3 className="text-2xl font-black text-white mb-1 leading-tight">{item.label}</h3>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-widest leading-tight">{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-20"></div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-20"></div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Carousel;
