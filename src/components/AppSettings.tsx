import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface Settings {
  username: string;
  avatar: string;
  autoPlay: boolean;
  showParticles: boolean;
  repeatAllowed: boolean;
  gifCount: number;
}

interface AppSettingsProps {
  settings: Settings;
  onSettingsChange: (s: Settings) => void;
  gifsCount: number;
  onClearAll: () => void;
}

const AVATARS = ['🎲', '🦄', '🐸', '🔥', '⭐', '🎮', '👾', '🤖', '🎨', '🚀'];

export default function AppSettings({ settings, onSettingsChange, gifsCount, onClearAll }: AppSettingsProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(settings.username);

  const update = (patch: Partial<Settings>) => onSettingsChange({ ...settings, ...patch });

  return (
    <div className="flex flex-col gap-5 p-4 pb-10 animate-fade-in">
      <div className="text-center pt-4">
        <h2 className="font-bubbles text-3xl neon-pink text-glow-pink mb-1">Настройки</h2>
        <p className="text-muted-foreground text-sm">Персонализируй приложение</p>
      </div>

      {/* Profile */}
      <div className="card-game p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-4">Профиль</p>

        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center text-5xl border-2 border-yellow-400/30 glow-yellow">
              {settings.avatar}
            </div>
            <span className="absolute -bottom-1 -right-1 text-xs bg-yellow-400 text-black rounded-full w-5 h-5 flex items-center justify-center font-bold">✏</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {AVATARS.map(a => (
              <button
                key={a}
                onClick={() => update({ avatar: a })}
                className={`w-10 h-10 rounded-xl text-2xl flex items-center justify-center transition-all duration-200 ${
                  settings.avatar === a
                    ? 'bg-yellow-400/20 border-2 border-yellow-400 scale-110'
                    : 'bg-muted/50 border-2 border-transparent hover:border-white/20'
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          <div className="w-full">
            <label className="text-xs text-muted-foreground font-medium mb-2 block">Имя игрока</label>
            {editingName ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={nameValue}
                  onChange={e => setNameValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { update({ username: nameValue }); setEditingName(false); }
                    if (e.key === 'Escape') setEditingName(false);
                  }}
                  className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm font-semibold text-foreground border border-yellow-400/30 outline-none focus:border-yellow-400"
                  maxLength={20}
                />
                <button
                  onClick={() => { update({ username: nameValue }); setEditingName(false); }}
                  className="px-3 py-2 rounded-xl bg-yellow-400 text-black text-sm font-bold"
                >
                  ОК
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="w-full flex items-center justify-between bg-muted/50 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-muted transition-colors"
              >
                <span>{settings.username}</span>
                <Icon name="Pencil" size={14} className="text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Game Settings */}
      <div className="card-game p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-4">Игра</p>
        <div className="flex flex-col gap-4">
          <ToggleRow
            label="Частицы при броске"
            emoji="✨"
            value={settings.showParticles}
            onChange={v => update({ showParticles: v })}
          />
          <ToggleRow
            label="Разрешить повторы"
            emoji="🔁"
            value={settings.repeatAllowed}
            onChange={v => update({ repeatAllowed: v })}
          />
          <ToggleRow
            label="Автовоспроизведение"
            emoji="▶️"
            value={settings.autoPlay}
            onChange={v => update({ autoPlay: v })}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="card-game p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-4">Коллекция</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎬</span>
            <div>
              <p className="font-bold text-2xl neon-yellow">{gifsCount}</p>
              <p className="text-xs text-muted-foreground">GIF-файлов загружено</p>
            </div>
          </div>
          {gifsCount > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-destructive hover:text-red-400 transition-colors font-medium border border-destructive/30 px-3 py-1.5 rounded-lg hover:border-red-400/50"
            >
              Очистить
            </button>
          )}
        </div>
      </div>

      {/* About */}
      <div className="card-game p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">О приложении</p>
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎲</span>
          <div>
            <p className="font-bold text-foreground">GIF Рулетка</p>
            <p className="text-xs text-muted-foreground">Версия 1.0 · Сделано с ❤️</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, emoji, value, onChange }: { label: string; emoji: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xl">{emoji}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${value ? 'bg-yellow-400' : 'bg-muted'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${value ? 'left-6' : 'left-0.5'}`} />
      </button>
    </div>
  );
}
