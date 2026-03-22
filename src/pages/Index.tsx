import { useState, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import GifViewer from '@/components/GifViewer';
import GifUpload from '@/components/GifUpload';
import AppSettings from '@/components/AppSettings';

interface GifFile {
  id: string;
  name: string;
  url: string;
  size: number;
}

interface Settings {
  username: string;
  avatar: string;
  autoPlay: boolean;
  showParticles: boolean;
  repeatAllowed: boolean;
  gifCount: number;
}

type Tab = 'viewer' | 'upload' | 'settings';

const DEFAULT_SETTINGS: Settings = {
  username: 'Игрок 1',
  avatar: '🎲',
  autoPlay: false,
  showParticles: true,
  repeatAllowed: true,
  gifCount: 0,
};

export default function Index() {
  const [tab, setTab] = useState<Tab>('viewer');
  const [gifs, setGifs] = useState<GifFile[]>([]);
  const [currentGif, setCurrentGif] = useState<GifFile | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [lastUsed, setLastUsed] = useState<Set<string>>(new Set());

  const handleRandomSelect = useCallback(() => {
    if (gifs.length === 0) return;

    let pool = gifs;
    if (!settings.repeatAllowed && lastUsed.size < gifs.length) {
      pool = gifs.filter(g => !lastUsed.has(g.id));
    } else if (!settings.repeatAllowed) {
      setLastUsed(new Set());
      pool = gifs;
    }

    const random = pool[Math.floor(Math.random() * pool.length)];
    setCurrentGif(random);
    setLastUsed(prev => new Set([...prev, random.id]));
    setTab('viewer');
  }, [gifs, settings.repeatAllowed, lastUsed]);

  const handleSelectGif = (gif: GifFile) => {
    setCurrentGif(gif);
    setTab('viewer');
  };

  const handleGifsChange = (newGifs: GifFile[]) => {
    setGifs(newGifs);
    if (currentGif && !newGifs.find(g => g.id === currentGif.id)) {
      setCurrentGif(null);
    }
  };

  const TABS = [
    { id: 'viewer' as Tab, label: 'Игра', icon: 'Dices' },
    { id: 'upload' as Tab, label: 'Файлы', icon: 'FolderOpen' },
    { id: 'settings' as Tab, label: 'Настройки', icon: 'Settings2' },
  ];

  return (
    <div className="min-h-screen bg-background bg-grid font-rubik flex flex-col max-w-md mx-auto relative">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--neon-yellow) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />
        <div
          className="absolute bottom-1/3 right-0 w-48 h-48 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, var(--neon-pink) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />
        <div
          className="absolute top-1/2 left-0 w-40 h-40 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, var(--neon-blue) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide relative z-10 pb-24">
        {tab === 'viewer' && (
          <GifViewer
            gifs={gifs}
            currentGif={currentGif}
            onRandomSelect={handleRandomSelect}
            onSelectGif={handleSelectGif}
          />
        )}
        {tab === 'upload' && (
          <GifUpload
            gifs={gifs}
            onGifsChange={handleGifsChange}
            onSelectGif={handleSelectGif}
            selectedId={currentGif?.id}
          />
        )}
        {tab === 'settings' && (
          <AppSettings
            settings={settings}
            onSettingsChange={setSettings}
            gifsCount={gifs.length}
            onClearAll={() => { setGifs([]); setCurrentGif(null); }}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
        <div className="mx-4 mb-4 rounded-2xl border border-border/50 bg-card/90 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-around p-2">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`nav-btn flex-1 ${tab === t.id ? 'active' : ''}`}
              >
                <div className="relative">
                  <Icon name={t.icon} size={22} />
                  {t.id === 'upload' && gifs.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 text-black text-xs font-black flex items-center justify-center leading-none">
                      {gifs.length > 9 ? '9+' : gifs.length}
                    </span>
                  )}
                </div>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
