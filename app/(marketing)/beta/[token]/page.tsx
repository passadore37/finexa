'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, AlertTriangle, Eye, EyeOff, ArrowLeft, ArrowRight, Check, User, Users } from 'lucide-react';

const PLANOS = [
  { id: 'individual', nome: 'Individual', Icon: User, cor: '#01b695', desc: '1 usuário · Controle pessoal completo' },
  { id: 'casal', nome: 'Casal', Icon: Users, cor: '#5330ff', desc: '2 usuários · Divisão proporcional ao salário', destaque: true },
];

export default function BetaPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'carregando' | 'valido' | 'invalido'>('carregando');
  
  // Fluxo: seleção de plano → dados pessoais → onboarding
  const [etapa, setEtapa] = useState<'plano' | 'cadastro' | 'onboarding'>('plano');
  
  // Plano selecionado
  const [plano, setPlano] = useState('casal');
  
  // Dados de cadastro
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrar, setMostrar] = useState(false);
  
  // Onboarding (7 passos)
  const [passoOnboarding, setPassoOnboarding] = useState(0);
  const [salario, setSalario] = useState('');
  const [salarioParceiro, setSalarioParceiro] = useState('');
  const [fixas, setFixas] = useState([{ descricao: '', valor: '' }]);
  const [limiteMensal, setLimiteMensal] = useState('');
  const [reservaEmergencia, setReservaEmergencia] = useState('');
  const [criarMeta, setCriarMeta] = useState(false);
  const [metaNome, setMetaNome] = useState('');
  const [metaValor, setMetaValor] = useState('');
  
  // Estados gerais
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [family_id, setFamilyId] = useState('');

  const planoSel = PLANOS.find(p => p.id === plano) || PLANOS[1];
  
  // Passos do onboarding
  const passos = [
    { id: 'perfil', label: 'Seu Perfil', desc: 'Começamos com você' },
    { id: 'salario', label: 'Salário', desc: 'Renda mensal' },
    { id: 'fixas', label: 'Contas Fixas', desc: 'Despesas recorrentes' },
    { id: 'limite', label: 'Limite de Gasto', desc: 'Seu teto mensal' },
    { id: 'reserva', label: 'Reserva de Emergência', desc: 'Fundo de segurança' },
    { id: 'meta', label: 'Meta Inicial', desc: 'Primeira meta (opcional)' },
    { id: 'pronto', label: 'Pronto!', desc: 'Bem-vindo' },
  ];

  useEffect(() => {
    fetch(`/api/beta?token=${token}`).then(r => r.json()).then(data => {
      if (data.ok) {
        setStatus('valido');
      } else {
        setStatus('invalido');
      }
    });
  }, [token]);

  if (status === 'carregando') return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  if (status === 'invalido') return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-[#EF9F27] mx-auto" />
        <h1 className="text-xl font-black text-foreground">Link inválido</h1>
        <p className="text-sm text-muted-foreground">Este link de beta não é válido ou já foi utilizado.</p>
      </div>
    </div>
  );

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 8) { setErro('Senha deve ter pelo menos 8 caracteres.'); return; }
    setLoading(true); setErro('');
    
    try {
      const res = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha, nome, plano, is_invitee: false }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.error || 'Erro ao criar conta.'); return; }

      // Salvar family_id e user_id
      if (data.user_id && data.family_id) {
        setFamilyId(data.family_id);
        
        // Marcar token beta como usado
        await fetch('/api/beta', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, family_id: data.family_id }),
        });
      }

      // Avançar para onboarding
      setEtapa('onboarding');
    } catch { setErro('Erro de conexão.'); }
    finally { setLoading(false); }
  }

  async function avancarOnboarding() {
    const etapaAtual = passos[passoOnboarding];
    
    // Validar campo atual
    if (etapaAtual.id === 'perfil' && !nome) { setErro('Digite seu nome.'); return; }
    if (etapaAtual.id === 'salario' && (!salario || parseFloat(salario) <= 0)) { setErro('Digite um salário válido.'); return; }
    if (etapaAtual.id === 'limite' && (!limiteMensal || parseFloat(limiteMensal) <= 0)) { setErro('Digite um limite válido.'); return; }
    if (etapaAtual.id === 'reserva' && (reservaEmergencia === '' || parseFloat(reservaEmergencia) < 0)) { setErro('Digite um valor válido para reserva.'); return; }
    if (etapaAtual.id === 'meta' && criarMeta && (!metaNome || !metaValor || parseFloat(metaValor) <= 0)) { setErro('Complete os dados da meta.'); return; }

    // Salvar dados no onboarding
    if (etapaAtual.id !== 'pronto') {
      setLoading(true);
      try {
        const contasFixas = fixas
          .filter(f => f.descricao && parseFloat(f.valor) > 0)
          .map(f => ({ id: Date.now().toString() + Math.random(), descricao: f.descricao, valor: parseFloat(f.valor), categoria: 'Outros' }));

        const payload: any = {
          nome,
          salario: parseFloat(salario) || 0,
          limite_gasto_mensal: parseFloat(limiteMensal) || 9000,
          reserva_emergencia: parseFloat(reservaEmergencia) || 0,
          is_master: true,
        };

        if (plano === 'casal' && salarioParceiro) {
          payload.salario_parceiro = parseFloat(salarioParceiro);
        }

        if (fixas.some(f => f.descricao)) {
          payload.contas_fixas = contasFixas;
        }

        // Salvar no banco
        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json();
          setErro(data.error || 'Erro ao salvar dados.');
          setLoading(false);
          return;
        }

        // Se chegou no passo de meta
        if (etapaAtual.id === 'meta' && criarMeta && metaNome) {
          await fetch('/api/metas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nome: metaNome,
              valor_meta: parseFloat(metaValor) || 0,
              valor_atual: 0,
              descricao: '',
            }),
          });
        }
      } catch (err) {
        setErro('Erro ao salvar.');
      } finally {
        setLoading(false);
      }
    }

    // Avançar para próximo passo
    if (passoOnboarding < passos.length - 1) {
      setPassoOnboarding(passoOnboarding + 1);
      setErro('');
    }
  }

  function voltarOnboarding() {
    if (passoOnboarding > 0) {
      setPassoOnboarding(passoOnboarding - 1);
      setErro('');
    } else {
      setEtapa('cadastro');
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#5330ff]/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#01b695]/10 rounded-full blur-[100px] -z-10" />
      <div className="w-full max-w-lg">
        {/* Etapa: Seleção de Plano */}
        {etapa === 'plano' && (
          <>
            <button onClick={() => window.location.href = '/'} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8">
              <ArrowLeft size={16} /> Voltar
            </button>
            <div className="nb-card bg-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-lg" style={{ background: '#5330ff', border: '2px solid #82a1fd', boxShadow: '2px 2px 0 #82a1fd' }}>F</div>
                <div>
                  <h1 className="text-2xl font-black text-foreground">Bem-vindo ao Finexa Beta 🚀</h1>
                  <p className="text-sm text-muted-foreground">Escolha seu plano para começar</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 mb-6">
                {PLANOS.map(p => {
                  const sel = plano === p.id;
                  return (
                    <button key={p.id} onClick={() => setPlano(p.id)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all"
                      style={{ borderColor: sel ? p.cor : 'var(--border)', background: sel ? `${p.cor}12` : 'transparent',
                               boxShadow: sel ? `3px 3px 0 ${p.cor}50` : 'none', transform: sel ? 'translate(-1px,-1px)' : 'none' }}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${p.cor}20`, border: `2px solid ${p.cor}60` }}>
                        <p.Icon size={22} style={{ color: p.cor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-lg text-foreground">{p.nome}</span>
                          {(p as any).destaque && <span className="text-[10px] font-black bg-[#ff64ca] text-white px-2 py-0.5 rounded-full">POPULAR</span>}
                        </div>
                        <span className="text-sm text-muted-foreground">{p.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setEtapa('cadastro')}
                className="nb-btn bg-[#5330ff] text-white py-4 font-black text-base w-full flex items-center justify-center gap-2" style={{ borderColor: '#5330ff', boxShadow: '4px 4px 0 #82a1fd60' }}>
                Continuar com {planoSel.nome} <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}

        {/* Etapa: Cadastro */}
        {etapa === 'cadastro' && (
          <>
            <button onClick={() => setEtapa('plano')} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8">
              <ArrowLeft size={16} /> Voltar
            </button>
            <div className="nb-card bg-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-lg" style={{ background: '#5330ff', border: '2px solid #82a1fd', boxShadow: '2px 2px 0 #82a1fd' }}>F</div>
                <div>
                  <h1 className="text-2xl font-black text-foreground">Crie sua conta</h1>
                  <p className="text-sm text-muted-foreground">Plano {planoSel.nome}</p>
                </div>
              </div>
              <form onSubmit={handleCadastro} className="flex flex-col gap-4">
                {[
                  { label: 'Seu nome', value: nome, set: setNome, type: 'text', placeholder: 'Como quer ser chamado' },
                  { label: 'E-mail', value: email, set: setEmail, type: 'email', placeholder: 'seu@email.com' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">{f.label}</label>
                    <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} required placeholder={f.placeholder}
                      className="w-full bg-background border-2 border-border rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:border-[#5330ff] transition-colors" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Senha</label>
                  <div className="relative">
                    <input type={mostrar ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)} required
                      placeholder="Mínimo 8 caracteres"
                      className="w-full bg-background border-2 border-border rounded-xl px-4 py-3.5 pr-12 text-foreground focus:outline-none focus:border-[#5330ff] transition-colors" />
                    <button type="button" onClick={() => setMostrar(!mostrar)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {mostrar ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>
                {erro && <div className="border-2 border-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400">{erro}</div>}
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl font-black text-base text-white flex items-center justify-center gap-2" 
                  style={{ background: '#5330ff', boxShadow: '4px 4px 0 #82a1fd60' }}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {loading ? 'Criando conta...' : 'Criar conta →'}
                </button>
              </form>
            </div>
          </>
        )}

        {/* Etapa: Onboarding */}
        {etapa === 'onboarding' && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 flex-1 overflow-x-auto pb-2">
                {passos.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all ${i < passoOnboarding ? 'bg-[#5330ff] border-[#5330ff] text-white' : i === passoOnboarding ? 'bg-[#5330ff] border-[#5330ff] text-white' : 'border-border text-muted-foreground'}`}
                      style={i < passoOnboarding ? { boxShadow: '2px 2px 0 #82a1fd' } : {}}>
                      {i < passoOnboarding ? <Check size={12} /> : i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="nb-card bg-card p-8">
              {passoOnboarding === 6 ? (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#1D9E75]/15 flex items-center justify-center mx-auto">
                    <Check className="h-8 w-8 text-[#1D9E75]" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-foreground mb-2">Sua conta está pronta! 🎉</h1>
                    <p className="text-sm text-muted-foreground">Todos os dados foram salvos. Vamos ao dashboard!</p>
                  </div>
                  <a href="/dashboard" className="block py-3 rounded-xl font-black text-base text-white" style={{ background: '#5330ff', boxShadow: '4px 4px 0 #82a1fd60' }}>
                    Ir para o Dashboard →
                  </a>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-black text-foreground">{passos[passoOnboarding].label}</h2>
                    <p className="text-sm text-muted-foreground">{passos[passoOnboarding].desc}</p>
                  </div>

                  <form onSubmit={e => { e.preventDefault(); avancarOnboarding(); }} className="space-y-4">
                    {passoOnboarding === 0 && (
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Seu nome completo</label>
                        <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Maria Silva"
                          className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[#5330ff]" />
                      </div>
                    )}

                    {passoOnboarding === 1 && (
                      <>
                        <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Seu salário mensal</label>
                          <input type="number" value={salario} onChange={e => setSalario(e.target.value)} placeholder="0,00" step="0.01"
                            className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[#5330ff]" />
                        </div>
                        {plano === 'casal' && (
                          <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Salário do seu parceiro</label>
                            <input type="number" value={salarioParceiro} onChange={e => setSalarioParceiro(e.target.value)} placeholder="0,00" step="0.01"
                              className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[#5330ff]" />
                          </div>
                        )}
                      </>
                    )}

                    {passoOnboarding === 2 && (
                      <div className="space-y-3">
                        {fixas.map((f, i) => (
                          <div key={i} className="space-y-2">
                            <input type="text" value={f.descricao} onChange={e => {
                              const nova = [...fixas];
                              nova[i].descricao = e.target.value;
                              setFixas(nova);
                            }} placeholder="Ex: Aluguel"
                              className="w-full bg-background border-2 border-border rounded-xl px-4 py-2 text-foreground focus:outline-none focus:border-[#5330ff] text-sm" />
                            <input type="number" value={f.valor} onChange={e => {
                              const nova = [...fixas];
                              nova[i].valor = e.target.value;
                              setFixas(nova);
                            }} placeholder="0,00" step="0.01"
                              className="w-full bg-background border-2 border-border rounded-xl px-4 py-2 text-foreground focus:outline-none focus:border-[#5330ff] text-sm" />
                          </div>
                        ))}
                        <button type="button" onClick={() => setFixas([...fixas, { descricao: '', valor: '' }])}
                          className="text-sm text-[#5330ff] font-bold">+ Adicionar conta fixa</button>
                      </div>
                    )}

                    {passoOnboarding === 3 && (
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Limite mensal de gastos</label>
                        <input type="number" value={limiteMensal} onChange={e => setLimiteMensal(e.target.value)} placeholder="0,00" step="0.01"
                          className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[#5330ff]" />
                        <p className="text-xs text-muted-foreground mt-2">Quanto você pode gastar este mês (para refletir na projeção).</p>
                      </div>
                    )}

                    {passoOnboarding === 4 && (
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Reserva de emergência</label>
                        <input type="number" value={reservaEmergencia} onChange={e => setReservaEmergencia(e.target.value)} placeholder="0,00" step="0.01"
                          className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[#5330ff]" />
                        <p className="text-xs text-muted-foreground mt-2">Seu fundo de segurança (ex: 3 meses de gastos).</p>
                      </div>
                    )}

                    {passoOnboarding === 5 && (
                      <>
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-border">
                          <input type="checkbox" checked={criarMeta} onChange={e => setCriarMeta(e.target.checked)} className="w-4 h-4"
                            id="criar-meta" />
                          <label htmlFor="criar-meta" className="flex-1 text-sm font-bold text-foreground cursor-pointer">
                            Quero criar uma meta agora
                          </label>
                        </div>
                        {criarMeta && (
                          <div className="space-y-3">
                            <input type="text" value={metaNome} onChange={e => setMetaNome(e.target.value)} placeholder="Ex: Viagem para praia" 
                              className="w-full bg-background border-2 border-border rounded-xl px-4 py-2 text-foreground focus:outline-none focus:border-[#5330ff] text-sm" />
                            <input type="number" value={metaValor} onChange={e => setMetaValor(e.target.value)} placeholder="0,00" step="0.01"
                              className="w-full bg-background border-2 border-border rounded-xl px-4 py-2 text-foreground focus:outline-none focus:border-[#5330ff] text-sm" />
                          </div>
                        )}
                      </>
                    )}

                    {erro && <div className="border-2 border-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400">{erro}</div>}

                    <div className="flex gap-3 pt-4">
                      {passoOnboarding > 0 && (
                        <button type="button" onClick={voltarOnboarding}
                          className="flex-1 py-3 rounded-xl font-black text-sm border-2 border-border text-foreground hover:bg-secondary">
                          Voltar
                        </button>
                      )}
                      <button type="submit" disabled={loading}
                        className="flex-1 py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2"
                        style={{ background: '#5330ff', boxShadow: '4px 4px 0 #82a1fd60' }}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {passoOnboarding === 5 ? 'Finalizar' : 'Próximo'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
