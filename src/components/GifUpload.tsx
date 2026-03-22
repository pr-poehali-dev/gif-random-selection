import { useState, useRef, useCallback } from 'react';
import Icon from '@/components/ui/icon';

export interface GifFile {
  id: string;
  name: string;
  url: string;
  size: number;
  groupId: number;
}

interface GifUploadProps {
  gifs: GifFile[];
  onGifsChange: (gifs: GifFile[]) => void;
  onSelectGif: (gif: GifFile) => void;
  selectedId?: string;
}

export const GROUPS = [
  { id: 0, label: '40%', chance: 40, color: '#facc15', glow: 'rgba(250,204,21,0.3)', border: 'rgba(250,204,21,0.4)', bg: 'rgba(250,204,21,0.06)' },
  { id: 1, label: '30%', chance: 30, color: '#34d399', glow: 'rgba(52,211,153,0.3)', border: 'rgba(52,211,153,0.4)', bg: 'rgba(52,211,153,0.06)' },
  { id: 2, label: '20%', chance: 20, color: '#60a5fa', glow: 'rgba(96,165,250,0.3)', border: 'rgba(96,165,250,0.4)', bg: 'rgba(96,165,250,0.06)' },
  { id: 3, label: '10%', chance: 10, color: '#f472b6', glow: 'rgba(244,114,182,0.3)', border: 'rgba(244,114,182,0.4)', bg: 'rgba(244,114,182,0.06)' },
];

export default function GifUpload({ gifs, onGifsChange, onSelectGif, selectedId }: GifUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverGroup, setDragOverGroup] = useState<number | null>(null);
  const [draggingGifId, setDraggingGifId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addToGroup, setAddToGroup] = useState(0);

  const ALLOWED_TYPES = ['image/gif', 'image/png', 'image/jpeg', 'image/webp'];

  const handleFiles = useCallback((files: FileList, targetGroup = addToGroup) => {
    const newGifs: GifFile[] = [];
    Array.from(files).forEach(file => {
      if (ALLOWED_TYPES.includes(file.type)) {
        const url = URL.createObjectURL(file);
        newGifs.push({
          id: crypto.randomUUID(),
          name: file.name.replace(/\.(gif|png|jpe?g|webp)$/i, ''),
          url,
          size: file.size,
          groupId: targetGroup,
        });
      }
    });
    if (newGifs.length > 0) {
      onGifsChange([...gifs, ...newGifs]);
    }
  }, [gifs, onGifsChange, addToGroup]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleGroupDrop = useCallback((e: React.DragEvent, groupId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverGroup(null);

    if (draggingGifId) {
      const updated = gifs.map(g => g.id === draggingGifId ? { ...g, groupId } : g);
      onGifsChange(updated);
      setDraggingGifId(null);
    } else if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files, groupId);
    }
  }, [draggingGifId, gifs, onGifsChange, handleFiles]);

  const handleDelete = (id: string) => {
    onGifsChange(gifs.filter(g => g.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
    return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
  };

  const totalGifs = gifs.length;

  return (
    <div className="flex flex-col gap-4 p-4 pb-8 animate-fade-in">
      <div className="text-center pt-4">
        <h2 className="font-bubbles text-3xl neon-yellow text-glow-yellow mb-1">Группы шансов</h2>
        <p className="text-muted-foreground text-sm">Перетащи GIF в нужную группу или добавь прямо в неё</p>
      </div>

      {/* General upload zone */}
      <div
        className={`upload-zone flex flex-col items-center justify-center gap-3 p-6 text-center ${isDragging ? 'dragover' : ''}`}
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className={`text-4xl transition-transform duration-300 ${isDragging ? 'scale-125' : ''}`}>
          {isDragging ? '🎯' : '🎲'}
        </div>
        <div>
          <p className="font-rubik font-700 text-base text-foreground mb-0.5">
            {isDragging ? 'Отпускай!' : 'Добавить GIF'}
          </p>
          <p className="text-muted-foreground text-xs">GIF, PNG, JPG, WEBP · попадёт в группу 40%</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".gif,.png,.jpg,.jpeg,.webp,image/gif,image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={e => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* 4 chance groups */}
      <div className="flex flex-col gap-3">
        {GROUPS.map(group => {
          const groupGifs = gifs.filter(g => g.groupId === group.id);
          const isOver = dragOverGroup === group.id;

          return (
            <div
              key={group.id}
              onDragOver={e => { e.preventDefault(); setDragOverGroup(group.id); }}
              onDragLeave={() => setDragOverGroup(null)}
              onDrop={e => handleGroupDrop(e, group.id)}
              style={{
                border: `1.5px solid ${isOver ? group.color : group.border}`,
                background: isOver ? group.glow : group.bg,
                boxShadow: isOver ? `0 0 20px ${group.glow}` : 'none',
                borderRadius: '16px',
                transition: 'all 0.2s ease',
              }}
              className="p-3"
            >
              {/* Group header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm"
                    style={{ background: group.color, color: '#000' }}
                  >
                    {group.label}
                  </div>
                  <div>
                    <div className="font-bold text-sm" style={{ color: group.color }}>
                      Шанс {group.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {groupGifs.length > 0 ? `${groupGifs.length} GIF` : 'пусто'}
                    </div>
                  </div>
                </div>

                {/* Chance bar */}
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${group.chance}%`,
                        background: group.color,
                        boxShadow: `0 0 6px ${group.color}`,
                      }}
                    />
                  </div>
                  <button
                    onClick={() => { setAddToGroup(group.id); fileInputRef.current?.click(); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: `${group.color}20`, color: group.color }}
                    title="Добавить GIF в группу"
                  >
                    <Icon name="Plus" size={14} />
                  </button>
                </div>
              </div>

              {/* GIFs in this group */}
              {groupGifs.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {groupGifs.map(gif => (
                    <div
                      key={gif.id}
                      className={`gif-thumb ${selectedId === gif.id ? 'selected' : ''}`}
                      style={{ height: '72px' }}
                      draggable
                      onDragStart={() => setDraggingGifId(gif.id)}
                      onDragEnd={() => setDraggingGifId(null)}
                      onClick={() => onSelectGif(gif)}
                    >
                      <img
                        src={gif.url}
                        alt={gif.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-1">
                        <p className="text-white text-[9px] font-semibold truncate">{gif.name}</p>
                        <p className="text-white/60 text-[9px]">{formatSize(gif.size)}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(gif.id); }}
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 text-white text-xs flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10 hover:bg-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="flex items-center justify-center h-12 rounded-xl border border-dashed text-xs text-muted-foreground/50"
                  style={{ borderColor: `${group.color}30` }}
                >
                  перетащи GIF сюда
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalGifs > 0 && (
        <div className="flex items-center justify-between px-1 mt-1">
          <span className="text-xs text-muted-foreground">Всего GIF: {totalGifs}</span>
          <button
            onClick={() => onGifsChange([])}
            className="text-xs text-destructive hover:text-red-400 transition-colors font-medium"
          >
            Очистить всё
          </button>
        </div>
      )}
    </div>
  );
}