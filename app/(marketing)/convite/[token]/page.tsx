'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function ConvitePage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus]   = useState<'carregando' | 'valido' | 'invalido' | 'expirado'>('carregando');
  const [familia, setFamilia] = useState<{ nome: string; plano: string } | null>(null);
  const [emailConvite, setEmailConvite] = useState('');

  useEffect(() => {
    fetch(`/api/convite?token=${token}`).then(r => r.json()).then(data => {
      if (data.ok) { setFamilia(data.familia); setEmailConvite(data.email ?? ''); setStatus('valido'); }
      else if (data.error?.includes('expirado')) setStatus('expirado');
      else setStatus('invalido');
    });
  }, [token]);

  if (status === 'carregando') return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  if (status !== 'valido') return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-[#EF9F27] mx-auto" />
        <h1 className="text-xl font-black text-foreground">
          {status === 'expirado' ? 'Convite expirado' : 'Convite inválido'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {status === 'expirado' ? 'Peça um novo convite.' : 'Link inválido ou já utilizado.'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[#5330ff] flex items-center justify-center font-black text-white text-3xl mx-auto"
            style={{ boxShadow: '4px 4px 0 #82a1fd60' }}>F</div>
          <h1 className="text-2xl font-black text-foreground">Você foi convidada! 💜</h1>
          <p className="text-muted-foreground text-sm">
            Convite para a família <strong className="text-foreground">{familia?.nome}</strong> no Finexa.
          </p>
        </div>
        <a href={`/cadastro?convite=${token}${emailConvite ? `&email=${emailConvite}` : ''}`}
          className="block w-full py-4 rounded-xl font-black text-base text-white text-center"
          style={{ background: '#5330ff', boxShadow: '4px 4px 0 #82a1fd60' }}>
          Aceitar convite e criar conta →
        </a>
        <p className="text-center text-xs text-muted-foreground">
          Já tem conta?{' '}
          <a href={`/login?convite=${token}`} className="text-[#5330ff] font-bold hover:underline">Entrar e aceitar</a>
        </p>
      </div>
    </div>
  );
}
