import { useState, useRef, useCallback } from 'react';
import Icon from '@/components/ui/icon';

interface GifFile {
  id: string;
  name: string;
  url: string;
  size: number;
}

interface GifUploadProps {
  gifs: GifFile[];
  onGifsChange: (gifs: GifFile[]) => void;
  onSelectGif: (gif: GifFile) => void;
  selectedId?: string;
}

export default function GifUpload({ gifs, onGifsChange, onSelectGif, selectedId }: GifUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList) => {
    const newGifs: GifFile[] = [];
    Array.from(files).forEach(file => {
      if (file.type === 'image/gif') {
        const url = URL.createObjectURL(file);
        newGifs.push({
          id: crypto.randomUUID(),
          name: file.name.replace('.gif', ''),
          url,
          size: file.size,
        });
      }
    });
    if (newGifs.length > 0) {
      onGifsChange([...gifs, ...newGifs]);
    }
  }, [gifs, onGifsChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDelete = (id: string) => {
    const updated = gifs.filter(g => g.id !== id);
    onGifsChange(updated);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
    return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-8 animate-fade-in">
      <div className="text-center pt-4">
        <h2 className="font-bubbles text-3xl neon-yellow text-glow-yellow mb-1">Моя коллекция</h2>
        <p className="text-muted-foreground text-sm">Загрузи GIF-файлы, чтобы начать</p>
      </div>

      <div
        className={`upload-zone flex flex-col items-center justify-center gap-4 p-10 text-center ${isDragging ? 'dragover' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className={`text-5xl transition-transform duration-300 ${isDragging ? 'scale-125' : ''}`}>
          {isDragging ? '🎯' : '🎲'}
        </div>
        <div>
          <p className="font-rubik font-700 text-lg text-foreground mb-1">
            {isDragging ? 'Отпускай!' : 'Перетащи GIF сюда'}
          </p>
          <p className="text-muted-foreground text-sm">или нажми, чтобы выбрать файлы</p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground font-medium">
          только .gif файлы
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".gif,image/gif"
          multiple
          className="hidden"
          onChange={e => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {gifs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Загружено: {gifs.length}
            </span>
            <button
              onClick={() => onGifsChange([])}
              className="text-xs text-destructive hover:text-red-400 transition-colors font-medium"
            >
              Очистить всё
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {gifs.map((gif, i) => (
              <div
                key={gif.id}
                className={`gif-thumb ${selectedId === gif.id ? 'selected' : ''}`}
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => onSelectGif(gif)}
              >
                <img
                  src={gif.url}
                  alt={gif.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                  <p className="text-white text-xs font-semibold truncate">{gif.name}</p>
                  <p className="text-white/60 text-xs">{formatSize(gif.size)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(gif.id); }}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10 hover:bg-red-500"
                >
                  ×
                </button>
              </div>
            ))}
            <div
              className="gif-thumb flex items-center justify-center bg-muted/30 text-muted-foreground hover:border-primary/40 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-1">
                <Icon name="Plus" size={24} />
                <span className="text-xs">Добавить</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {gifs.length === 0 && (
        <div className="text-center py-4">
          <p className="text-muted-foreground text-sm">Тут будут твои GIF-файлы 🎬</p>
        </div>
      )}
    </div>
  );
}
