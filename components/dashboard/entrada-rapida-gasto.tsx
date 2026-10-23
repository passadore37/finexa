'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface EntradaRapidaGastoProps {
  onGastoAdicionado?: () => void;
}

// Extrai o primeiro valor monetário do texto (ex: "uber 32,50" -> 32.5)
// e devolve também o texto restante como descrição.
function parseGastoTexto(texto: string): { valor: number | null; descricao: string } {
  const match = texto.match(/(\d+(?:[.,]\d{1,2})?)/);
  if (!match) return { valor: null, descricao: texto.trim() };

  const valorStr = match[1].replace(',', '.');
  const valor = parseFloat(valorStr);

  const descricao = texto
    .replace(match[0], '')
    .replace(/\b(r\$|reais|rs)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return { valor: isNaN(valor) ? null : valor, descricao: descricao || 'Gasto' };
}

type StatusEnvio = 'idle' | 'enviando' | 'sucesso' | 'erro';

export function EntradaRapidaGasto({ onGastoAdicionado }: EntradaRapidaGastoProps) {
  const { perfil } = useAuth();
  const [texto, setTexto] = useState('');
  const [gravando, setGravando] = useState(false);
  const [status, setStatus] = useState<StatusEnvio>('idle');
  const [erroMsg, setErroMsg] = useState('');
  const recognitionRef = useRef<any>(null);

  const iniciarVoz = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErroMsg('Seu navegador não suporta entrada por voz. Use o texto.');
      setStatus('erro');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setGravando(true);
    recognition.onend = () => setGravando(false);
    recognition.onerror = () => { setGravando(false); };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTexto(prev => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const pararVoz = useCallback(() => {
    recognitionRef.current?.stop();
    setGravando(false);
  }, []);

  const enviarGasto = async (alocacao: 'eu' | '50/50') => {
    const { valor, descricao } = parseGastoTexto(texto);

    if (!valor || valor <= 0) {
      setErroMsg('Não consegui identificar um valor no texto. Inclua o número (ex: "uber 32,50").');
      setStatus('erro');
      return;
    }

    const perfilEnvio = alocacao === 'eu' ? (perfil?.role || 'membro0') : 'casal';
    const divisaoEnvio = alocacao === 'eu' ? 'pessoal' : '50/50';

    setStatus('enviando');
    setErroMsg('');

    try {
      const res = await fetch('/api/transacoes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor,
          descricao,
          perfil: perfilEnvio,
          divisao: divisaoEnvio,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Erro ao salvar');

      setStatus('sucesso');
      setTexto('');
      window.dispatchEvent(new Event('planejamento-atualizado'));
      onGastoAdicionado?.();
      setTimeout(() => setStatus('idle'), 2000);
    } catch (e: any) {
      setErroMsg(e.message || 'Erro ao salvar o gasto.');
      setStatus('erro');
    }
  };

  const { valor: valorPreview } = parseGastoTexto(texto);

  return (
    <Card className="border bg-card card-hover">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Adicionar gasto</CardTitle>
        <p className="text-xs text-muted-foreground">
          Fale ou digite o gasto (ex: &quot;uber 32,50&quot;) — sem categoria, só escolha de quem é.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ex: mercado 145,90"
            className="flex-1"
            onKeyDown={(e) => { if (e.key === 'Enter' && valorPreview) enviarGasto('50/50'); }}
          />
          <Button
            type="button"
            variant={gravando ? 'default' : 'outline'}
            size="icon"
            onClick={gravando ? pararVoz : iniciarVoz}
            aria-label={gravando ? 'Parar gravação' : 'Gravar por voz'}
          >
            {gravando ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
          </Button>
        </div>

        {valorPreview !== null && (
          <p className="text-xs text-muted-foreground">
            Valor identificado:{' '}
            <span className="font-semibold text-foreground">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorPreview)}
            </span>
          </p>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            className="flex-1"
            variant="outline"
            disabled={!valorPreview || status === 'enviando'}
            onClick={() => enviarGasto('eu')}
          >
            {status === 'enviando' ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Somente eu
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={!valorPreview || status === 'enviando'}
            onClick={() => enviarGasto('50/50')}
          >
            {status === 'enviando' ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            50/50
          </Button>
        </div>

        {status === 'sucesso' && (
          <p className="text-xs flex items-center gap-1" style={{ color: 'var(--teal)' }}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Gasto adicionado!
          </p>
        )}
        {status === 'erro' && (
          <p className="text-xs" style={{ color: 'var(--magenta)' }}>{erroMsg}</p>
        )}
      </CardContent>
    </Card>
  );
}
