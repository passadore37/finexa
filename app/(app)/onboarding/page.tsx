'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight, Loader2, Users, Wallet, CalendarDays } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const PASSOS = [
  { id: 1, titulo: 'Sobre você',      icon: Users,       desc: 'Como você quer ser chamada?' },
  { id: 2, titulo: 'Seus salários',   icon: Wallet,      desc: 'Para calcular a divisão proporcional' },
  { id: 3, titulo: 'Contas fixas',    icon: CalendarDays, desc: 'Aluguel, condomínio, assinaturas...' },
];

export default function OnboardingPage() {
  const router    = useRouter();
  const { perfil } = useAuth();
  const plano     = perfil?.plano ?? 'individual';

  const [passo, setPasso]         = useState(1);
  const [salvando, setSalvando]   = useState(false);

  // Passo 1
  const [nomeDisplay, setNomeDisplay] = useState(perfil?.nome ?? '');

  // Passo 2
  const [salMeu, setSalMeu]     = useState('');
  const [salParceiro, setSalParceiro] = useState('');

  // Passo 3
  const [fixas, setFixas]   = useState([{ descricao: '', valor: '' }]);

  const isUltimoPasso = passo === (plano === 'individual' ? 2 : 3);

  function adicionarFixa() {
    setFixas(prev => [...prev, { descricao: '', valor: '' }]);
  }

  function atualizarFixa(i: number, campo: 'descricao' | 'valor', val: string) {
    setFixas(prev => prev.map((f, idx) => idx === i ? { ...f, [campo]: val } : f));
  }

  async function finalizar() {
    setSalvando(true);
    try {
      const contasFixas = fixas
        .filter(f => f.descricao && parseFloat(f.valor) > 0)
        .map(f => ({ id: Date.now().toString() + Math.random(), descricao: f.descricao, valor: parseFloat(f.valor), categoria: 'Outros' }));

      await fetch('/api/planejamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salario_leticia:  parseFloat(salMeu) || 0,
          salario_giovanna: parseFloat(salParceiro) || 0,
          percentual_investimento: 10,
          contas_fixas: contasFixas,
        }),
      });

      router.push('/dashboard');
    } catch {
      router.push('/dashboard');
    } finally { setSalvando(false); }
  }

  async function avancar() {
    if (isUltimoPasso) { await finalizar(); return; }
    setPasso(p => p + 1);
  }

  const passosVisiveis = plano === 'individual'
    ? PASSOS.filter(p => p.id !== 3)
    : PASSOS;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#5330ff] flex items-center justify-center font-black text-white text-2xl mx-auto"
            style={{ boxShadow: '4px 4px 0 #82a1fd60' }}>F</div>
          <h1 className="text-2xl font-black text-foreground">Vamos configurar tudo!</h1>
          <p className="text-sm text-muted-foreground">Leva menos de 2 minutos 🚀</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2">
          {passosVisiveis.map((p, i) => {
            const done   = passo > p.id;
            const active = passo === p.id;
            return (
              <div key={p.id} className="flex items-center gap-2 flex-1">
                <div className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all
                    ${done ? 'bg-[#1D9E75] text-white' : active ? 'bg-[#5330ff] text-white' : 'bg-secondary text-muted-foreground'}`}>
                    {done ? <Check className="h-4 w-4" /> : p.id}
                  </div>
                  <span className={`text-[10px] font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {p.titulo}
                  </span>
                </div>
                {i < passosVisiveis.length - 1 && (
                  <div className={`h-0.5 flex-1 mb-4 transition-all ${passo > p.id ? 'bg-[#1D9E75]' : 'bg-border'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Conteúdo do passo */}
        <div className="nb-card bg-card p-6 space-y-4">

          {/* Passo 1 — Nome */}
          {passo === 1 && (
            <>
              <h2 className="text-lg font-black text-foreground">Como quer ser chamada?</h2>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Seu nome</label>
                <input type="text" value={nomeDisplay} onChange={e => setNomeDisplay(e.target.value)}
                  placeholder="Ex: Ana, João, Mari..."
                  className="w-full bg-background border-2 border-border rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:border-[#5330ff] transition-colors" />
              </div>
              {plano !== 'individual' && (
                <div className="p-3 rounded-xl bg-[#5330ff]/8 border border-[#5330ff]/20">
                  <p className="text-xs text-muted-foreground">
                    💜 Depois de configurar, você pode convidar seu parceiro(a) para entrar na mesma conta.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Passo 2 — Salários */}
          {passo === 2 && (
            <>
              <h2 className="text-lg font-black text-foreground">
                {plano === 'individual' ? 'Qual é seu salário?' : 'Salários do casal'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {plano === 'individual'
                  ? 'Usado para calcular seu saldo disponível e metas.'
                  : 'Usado para dividir os gastos proporcionalmente. Pode alterar depois.'}
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">
                    {plano === 'individual' ? 'Seu salário' : 'Seu salário'}
                  </label>
                  <div className="flex items-center gap-2 bg-background border-2 border-border rounded-xl px-4 py-3.5 focus-within:border-[#5330ff] transition-colors">
                    <span className="text-sm text-muted-foreground">R$</span>
                    <input type="number" value={salMeu} onChange={e => setSalMeu(e.target.value)} placeholder="0"
                      className="flex-1 bg-transparent text-foreground focus:outline-none" />
                  </div>
                </div>
                {plano !== 'individual' && (
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Salário do parceiro(a)</label>
                    <div className="flex items-center gap-2 bg-background border-2 border-border rounded-xl px-4 py-3.5 focus-within:border-[#5330ff] transition-colors">
                      <span className="text-sm text-muted-foreground">R$</span>
                      <input type="number" value={salParceiro} onChange={e => setSalParceiro(e.target.value)} placeholder="0"
                        className="flex-1 bg-transparent text-foreground focus:outline-none" />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Passo 3 — Contas fixas */}
          {passo === 3 && (
            <>
              <h2 className="text-lg font-black text-foreground">Contas fixas mensais</h2>
              <p className="text-sm text-muted-foreground">Aluguel, condomínio, assinaturas, internet... Pode pular e adicionar depois.</p>
              <div className="space-y-2">
                {fixas.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" placeholder="Descrição (ex: Aluguel)" value={f.descricao}
                      onChange={e => atualizarFixa(i, 'descricao', e.target.value)}
                      className="flex-1 bg-background border-2 border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-[#5330ff] transition-colors" />
                    <div className="flex items-center gap-1 w-32 bg-background border-2 border-border rounded-xl px-3 py-2.5 focus-within:border-[#5330ff] transition-colors">
                      <span className="text-xs text-muted-foreground">R$</span>
                      <input type="number" placeholder="0" value={f.valor}
                        onChange={e => atualizarFixa(i, 'valor', e.target.value)}
                        className="flex-1 bg-transparent text-sm text-foreground focus:outline-none" />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={adicionarFixa} className="text-xs text-[#5330ff] font-bold hover:underline">
                + Adicionar outra
              </button>
            </>
          )}

        </div>

        {/* Botões */}
        <div className="flex gap-3">
          {passo > 1 && (
            <button onClick={() => setPasso(p => p - 1)}
              className="px-5 py-3 rounded-xl border-2 border-border text-sm font-bold text-muted-foreground hover:bg-secondary transition-colors">
              Voltar
            </button>
          )}
          <button onClick={avancar} disabled={salvando}
            className="flex-1 py-3 rounded-xl font-black text-base text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            style={{ background: '#5330ff', boxShadow: '4px 4px 0 #82a1fd60' }}>
            {salvando ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {salvando ? 'Salvando...' : isUltimoPasso ? 'Ir para o dashboard →' : 'Próximo'}
            {!salvando && !isUltimoPasso && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>

        {!isUltimoPasso && (
          <button onClick={() => router.push('/dashboard')}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors">
            Pular por agora →
          </button>
        )}
      </div>
    </div>
  );
}
