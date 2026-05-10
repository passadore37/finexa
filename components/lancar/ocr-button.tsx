'use client';

// components/lancar/ocr-button.tsx
// Botão de câmera/galeria — OCR via GPT-4o Vision
import { useRef, useState } from 'react';
import { Camera, Loader2, Sparkles, X, AlertCircle } from 'lucide-react';

export interface OcrResultado {
  valor: number | null;
  descricao: string;
  categoria: string;
  confianca: 'alta' | 'media' | 'baixa';
}

interface Props {
  onResultado: (dados: OcrResultado) => void;
  cor?: string;
}

export function OcrButton({ onResultado, cor = '#5330ff' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status,  setStatus]  = useState<'idle' | 'processando' | 'erro'>('idle');
  const [erroMsg, setErroMsg] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  async function handleImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview imediato
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setStatus('processando');
    setErroMsg('');

    try {
      const formData = new FormData();
      formData.append('imagem', file);

      const res = await fetch('/api/transacoes/ocr', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Erro ao processar imagem');
      }

      if (!data.valor) {
        throw new Error('Não encontrei um valor nessa imagem. Tente outra foto ou preencha manualmente.');
      }

      onResultado({
        valor:     data.valor,
        descricao: data.descricao,
        categoria: data.categoria,
        confianca: data.confianca,
      });

      setStatus('idle');
      setPreview(null);

    } catch (err: any) {
      setStatus('erro');
      setErroMsg(err.message ?? 'Erro ao processar imagem');
      setTimeout(() => {
        setStatus('idle');
        setErroMsg('');
        setPreview(null);
      }, 5000);
    }

    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="w-full">
      {/* Input oculto — sem capture para permitir câmera e galeria */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleImagem}
      />

      {/* Botão idle */}
      {status === 'idle' && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl border-2 border-dashed transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{ borderColor: `${cor}50`, background: `${cor}08`, color: cor }}
        >
          <Camera className="h-4 w-4" />
          <span className="text-sm font-black">Foto ou print do comprovante</span>
          <Sparkles className="h-3.5 w-3.5 opacity-70" />
        </button>
      )}

      {/* Processando */}
      {status === 'processando' && (
        <div
          className="w-full flex flex-col items-center gap-3 py-4 px-4 rounded-xl border-2"
          style={{ borderColor: `${cor}30`, background: `${cor}08` }}
        >
          {preview && (
            <div className="w-full max-h-28 overflow-hidden rounded-lg">
              <img src={preview} alt="preview" className="w-full object-cover opacity-50" />
            </div>
          )}
          <div className="flex items-center gap-2" style={{ color: cor }}>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-bold">Lendo comprovante...</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Isso leva alguns segundos</p>
        </div>
      )}

      {/* Erro */}
      {status === 'erro' && (
        <div className="w-full flex items-start gap-2.5 p-3.5 rounded-xl border-2 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-red-600 dark:text-red-400">Não consegui ler</p>
            <p className="text-xs text-red-500 mt-0.5">{erroMsg}</p>
          </div>
          <button
            onClick={() => { setStatus('idle'); setErroMsg(''); setPreview(null); }}
            className="text-red-400 hover:text-red-600 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}