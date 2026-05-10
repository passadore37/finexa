'use client';

// components/lancar/audio-button.tsx
// Botão de voz — Web Speech API nativa, zero custo, zero dependências
import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2, X } from 'lucide-react';
import { parsearAudio } from '@/lib/audio-parser';

export interface AudioResultado {
  valor: number | null;
  descricao: string;
  categoria: string;
  textoOriginal: string;
}

interface Props {
  onResultado: (dados: AudioResultado) => void;
  cor?: string;
}

// Exemplos rotativos de como falar
const EXEMPLOS = [
  'Ex: "Uber vinte e três reais"',
  'Ex: "iFood quarenta e cinco reais"',
  'Ex: "Mercado cento e vinte reais"',
  'Ex: "Netflix trinta e sete reais"',
  'Ex: "Academia oitenta e cinco reais"',
];

export function AudioButton({ onResultado, cor = '#5330ff' }: Props) {
  const [status,       setStatus]       = useState<'idle' | 'ouvindo' | 'processando' | 'erro'>('idle');
  const [transcricao,  setTranscricao]  = useState('');
  const [erroMsg,      setErroMsg]      = useState('');
  const [exemplo,      setExemplo]      = useState(0);
  const [suportado,    setSuportado]    = useState(true);
  const recognitionRef = useRef<any>(null);

  // Verificar suporte e rotacionar exemplos
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) setSuportado(false);

    const interval = setInterval(() => {
      setExemplo(prev => (prev + 1) % EXEMPLOS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  function iniciarGravacao() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus('erro');
      setErroMsg('Seu navegador não suporta reconhecimento de voz. Use Chrome ou Safari.');
      setTimeout(() => setStatus('idle'), 4000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang           = 'pt-BR';
    recognition.continuous     = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setStatus('ouvindo');
      setTranscricao('');
    };

    recognition.onresult = (event: any) => {
      const resultado = event.results[event.results.length - 1];
      const texto = resultado[0].transcript;
      setTranscricao(texto);

      // Se resultado final, processar
      if (resultado.isFinal) {
        setStatus('processando');
        const dados = parsearAudio(texto);

        if (!dados.valor) {
          setStatus('erro');
          setErroMsg(`Não entendi o valor em "${texto}". Tente falar como: "Uber vinte e três reais".`);
          setTimeout(() => { setStatus('idle'); setTranscricao(''); }, 5000);
          return;
        }

        onResultado(dados);
        setTimeout(() => { setStatus('idle'); setTranscricao(''); }, 500);
      }
    };

    recognition.onerror = (event: any) => {
      const msgs: Record<string, string> = {
        'not-allowed':  'Permissão de microfone negada. Habilite nas configurações do navegador.',
        'no-speech':    'Nenhuma fala detectada. Tente novamente.',
        'network':      'Erro de rede. Verifique sua conexão.',
        'aborted':      '',
      };
      const msg = msgs[event.error] ?? 'Erro ao reconhecer voz. Tente novamente.';
      if (msg) {
        setStatus('erro');
        setErroMsg(msg);
        setTimeout(() => { setStatus('idle'); setTranscricao(''); }, 4000);
      } else {
        setStatus('idle');
        setTranscricao('');
      }
    };

    recognition.onend = () => {
      if (status === 'ouvindo') setStatus('idle');
    };

    recognition.start();
  }

  function pararGravacao() {
    recognitionRef.current?.stop();
    setStatus('idle');
    setTranscricao('');
  }

  // Não suportado
  if (!suportado) return null;

  return (
    <div className="w-full">

      {/* Idle */}
      {status === 'idle' && (
        <button
          type="button"
          onClick={iniciarGravacao}
          className="w-full flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border-2 border-dashed transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{ borderColor: `${cor}50`, background: `${cor}08`, color: cor }}
        >
          <div className="flex items-center gap-2.5">
            <Mic className="h-4 w-4" />
            <span className="text-sm font-black">Falar o lançamento</span>
          </div>
          <span
            className="text-[11px] transition-all duration-500"
            style={{ color: `${cor}80` }}
          >
            {EXEMPLOS[exemplo]}
          </span>
        </button>
      )}

      {/* Ouvindo */}
      {status === 'ouvindo' && (
        <div
          className="w-full flex flex-col items-center gap-3 py-4 px-4 rounded-xl border-2"
          style={{ borderColor: `${cor}50`, background: `${cor}08` }}
        >
          {/* Animação de ondas */}
          <div className="flex items-center gap-1.5">
            {[0,1,2,3,4].map(i => (
              <div
                key={i}
                className="w-1 rounded-full animate-pulse"
                style={{
                  height: `${12 + (i % 3) * 8}px`,
                  background: cor,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.8s',
                }}
              />
            ))}
          </div>

          <p className="text-sm font-bold" style={{ color: cor }}>
            Ouvindo...
          </p>

          {/* Transcrição em tempo real */}
          {transcricao && (
            <p className="text-xs text-muted-foreground text-center italic px-2">
              "{transcricao}"
            </p>
          )}

          <button
            onClick={pararGravacao}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <MicOff className="h-3.5 w-3.5" />
            Cancelar
          </button>
        </div>
      )}

      {/* Processando */}
      {status === 'processando' && (
        <div
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl border-2"
          style={{ borderColor: `${cor}30`, background: `${cor}08` }}
        >
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: cor }} />
          <span className="text-sm font-bold" style={{ color: cor }}>
            Interpretando...
          </span>
        </div>
      )}

      {/* Erro */}
      {status === 'erro' && (
        <div className="w-full flex items-start gap-2.5 p-3.5 rounded-xl border-2 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
          <MicOff className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-red-600 dark:text-red-400">Não entendi</p>
            <p className="text-xs text-red-500 mt-0.5">{erroMsg}</p>
          </div>
          <button
            onClick={() => { setStatus('idle'); setErroMsg(''); }}
            className="text-red-400 hover:text-red-600 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

    </div>
  );
}