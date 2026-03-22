import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { GifFile, GROUPS } from '@/components/GifUpload';

interface GifViewerProps {
  gifs: GifFile[];
  currentGif: GifFile | null;
  onRandomSelect: () => void;
  onSelectGif: (gif: GifFile) => void;
}

const EMOJIS = ['🎲', '✨', '🎉', '⭐', '💥', '🔥', '🌟', '🎊'];

const RARITY = [
  {
    groupId: 0,
    label: 'Обычный',
    style: { color: '#ffffff' },
    className: '',
  },
  {
    groupId: 1,
    label: 'Редкий',
    style: { color: '#60a5fa' },
    className: '',
  },
  {
    groupId: 2,
    label: 'Эпический',
    style: { color: '#c084fc' },
    className: 'rarity-epic',
  },
  {
    groupId: 3,
    label: 'Легендарный',
    style: {},
    className: 'rarity-legendary',
  },
];

export default function GifViewer({ gifs, currentGif, onRandomSelect, onSelectGif }: GifViewerProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const btnRef = useRef<HTMLButtonElement>(null);
  const particleId = useRef(0);

  const rarity = currentGif != null
    ? RARITY.find(r => r.groupId === currentGif.groupId) ?? RARITY[0]
    : null;

  const spawnParticles = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: particleId.current++,
      x: rect.left + rect.width / 2 + (Math.random() - 0.5) * 100,
      y: rect.top + (Math.random() - 0.5) * 40,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  };

  const handleRandom = () => {
    if (gifs.length === 0 || isSpinning) return;
    setIsSpinning(true);
    spawnParticles();
    setTimeout(() => {
      onRandomSelect();
      setIsSpinning(false);
    }, 600);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); handleRandom(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gifs, isSpinning]);

  return (
    <div className="flex flex-col items-center min-h-screen pb-24 animate-fade-in">
      {/* Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="float-particle fixed text-2xl z-50 pointer-events-none"
          style={{ left: p.x, top: p.y }}
        >
          {p.emoji}
        </div>
      ))}

      {/* Header */}
      <div className="w-full text-center pt-6 pb-4 px-4">
        <h1 className="font-bubbles text-4xl neon-yellow text-glow-yellow">GIF Рулетка</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {gifs.length > 0 ? `${gifs.length} гифок в коллекции` : 'Загрузи GIF-файлы, чтобы начать'}
        </p>
      </div>

      {/* GIF Display */}
      <div className="w-full px-4 flex-1 flex flex-col items-center justify-center gap-4">
        {currentGif ? (
          <div className="relative w-full max-w-sm">
            <div className={`rounded-2xl overflow-hidden border-2 border-yellow-400/30 shadow-2xl glow-yellow ${isSpinning ? 'animate-scale-in' : ''}`}>
              <img
                src={currentGif.url}
                alt={currentGif.name}
                className="w-full h-auto block bg-black"
                style={{ maxHeight: '70vh', objectFit: 'contain' }}
              />
            </div>
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
              ✦ Сейчас
            </div>
            <p className="text-center mt-3 font-semibold text-foreground/80 text-sm truncate px-4">
              {currentGif.name}
            </p>
          </div>
        ) : (
          <div className="w-full max-w-sm aspect-video rounded-2xl bg-muted/30 border-2 border-dashed border-muted flex flex-col items-center justify-center gap-3">
            <span className="text-6xl pulse-ring">🎲</span>
            <p className="text-muted-foreground font-medium">Нажми кнопку ниже!</p>
          </div>
        )}

        {/* Rarity label */}
        {rarity && currentGif && (
          <div className="flex items-center justify-center h-8">
            <span
              className={`text-lg font-black tracking-widest uppercase ${rarity.className}`}
              style={rarity.style}
            >
              {rarity.label}
            </span>
          </div>
        )}

        {/* Random Button */}
        <button
          ref={btnRef}
          onClick={handleRandom}
          disabled={gifs.length === 0 || isSpinning}
          className={`btn-random px-10 py-5 text-xl font-black tracking-wide disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none ${isSpinning ? 'spin-animation' : ''}`}
        >
          <span className="flex items-center gap-3">
            <span className={isSpinning ? 'animate-spin' : ''}>🎲</span>
            {isSpinning ? 'Крутим...' : 'Испытать удачу'}
          </span>
        </button>
        <p className="text-muted-foreground text-xs">или нажми <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">Пробел</kbd></p>
      </div>

      {/* Mini Gallery */}
      {gifs.length > 1 && (
        <div className="w-full px-4 mt-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-semibold">Все гифки</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {gifs.map(gif => (
              <button
                key={gif.id}
                onClick={() => onSelectGif(gif)}
                className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  currentGif?.id === gif.id
                    ? 'border-yellow-400 shadow-lg glow-yellow scale-110'
                    : 'border-transparent opacity-60 hover:opacity-100 hover:border-white/20'
                }`}
              >
                <img src={gif.url} alt={gif.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}