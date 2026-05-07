'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronDown, ChevronUp, Loader2, Users, User, Plus } from 'lucide-react';
import { useUsuarioContext } from '@/hooks/use-usuario-context';
import { useAuth } from '@/hooks/use-auth';
import { PERFIL_CONFIG } from '@/lib/perfil-config';
import { usePlano } from '@/hooks/use-plano';
import { useMembros } from '@/hooks/use-membros';
import { useCategorias } from '@/hooks/use-categorias';
import { ModalNovaCategoria } from './modal-nova-categoria';
import { getTextSobreCor } from '@/lib/types';

type Status = 'idle' | 'saving' | 'success' | 'error';
type ModoDivisao = 'pessoal' | '5050' | 'proporcional' | 'membros';

export function LancarView() {
  const { usuariaAtiva } = useUsuarioContext();
  const { perfil: perfilAuth } = useAuth();
  const { plano, temDivisao } = usePlano();
  const { membros } = useMembros();

  // Membros dinâmicos para o seletor de divisão
  const MEMBROS_CASAL = membros.length >= 2
    ? membros.map(m => ({ id: m.role, nome: m.nome, cor: m.cor }))
    : [
        { id: 'membro0',  nome: 'Membro 1', cor: '#82a1fd' },
        { id: 'membro1', nome: 'Membro 2', cor: '#ff64ca' },
      ];

  const role0 = membros[0]?.role ?? 'membro0';
  const role1 = membros[1]?.role ?? 'membro1';

  // perfilConfig com cor real do membro ativo
  const membroAtivo = membros.find(m => m.role === usuariaAtiva);
  const perfilConfig = membroAtivo
    ? { cor: membroAtivo.cor, corSecundaria: membroAtivo.corSecundaria, corBg: membroAtivo.corBg, nome: membroAtivo.nome, emoji: '' }
    : (PERFIL_CONFIG[usuariaAtiva] ?? PERFIL_CONFIG['casal']);
  const [modalCategoria, setModalCategoria] = useState(false);
  const { categoriasPadrao, categoriasCustom, getCor, criarCategoria } = useCategorias(usuariaAtiva);
  const todasCategorias = [...categoriasPadrao, ...categoriasCustom];
  const ehIndividual = plano === 'individual';

  const [valor,       setValor]       = useState('');
  const [categoria,   setCategoria]   = useState('');
  const [descricao,   setDescricao]   = useState('');
  const [parcelado,   setParcelado]   = useState(false);
  const [recorrente,  setRecorrente]  = useState(false);
  const [totalParcelas, setTotalParcelas] = useState('2');
  const [parcelaAtual,  setParcelaAtual]  = useState('1');
  const [status,      setStatus]      = useState<Status>('idle');
  const [mostrarAvancado, setMostrarAvancado] = useState(false);
  const [modoDivisao, setModoDivisao] = useState<ModoDivisao>(ehIndividual ? 'pessoal' : '5050');
  const [membrosSelecionados, setMembrosSelecionados] = useState<string[]>(MEMBROS_CASAL.map(m => m.id));
  const [responsavel, setResponsavel] = useState<string>(usuariaAtiva === 'casal' ? 'membro0' : usuariaAtiva);

  useEffect(() => {
    setModoDivisao(ehIndividual ? 'pessoal' : '5050');
  }, [usuariaAtiva, ehIndividual]);

  function normalizarRole(role: string): string {
    if (role === 'casal' || role === 'geral') return 'casal';
    if (role === role0) return 'membro0';
    if (role === role1) return 'membro1';
    return role;
  }

  function calcularCampos(): { perfil: string; divisao: string } {
    if (ehIndividual) return { perfil: normalizarRole(usuariaAtiva), divisao: 'pessoal' };
    if (modoDivisao === 'pessoal') {
      const resp = usuariaAtiva === 'casal' ? responsavel : usuariaAtiva;
      return { perfil: normalizarRole(resp), divisao: 'pessoal' };
    }
    if (modoDivisao === '5050') return { perfil: 'casal', divisao: '50/50' };
    if (modoDivisao === 'proporcional') return { perfil: 'casal', divisao: 'proporcional' };
    if (modoDivisao === 'membros') {
      if (membrosSelecionados.length === 0) return { perfil: responsavel, divisao: 'pessoal' };
      if (membrosSelecionados.length === 1) return { perfil: membrosSelecionados[0], divisao: 'pessoal' };
      return { perfil: 'casal', divisao: '50/50' };
    }
    return { perfil: 'casal', divisao: '50/50' };
  }

  async function handleSubmit() {
    if (!valor || !categoria) return;
    setStatus('saving');
    const { perfil, divisao } = calcularCampos();
    try {
      const res = await fetch('/api/transacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor: parseFloat(valor.replace(',', '.')),
          categoria, descricao: descricao || categoria,
          perfil, divisao,
          parcela_atual:  (parcelado && !recorrente) ? parseInt(parcelaAtual)  : 1,
          total_parcelas: (parcelado && !recorrente) ? parseInt(totalParcelas) : 1,
          recorrente: recorrente,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        window.dispatchEvent(new CustomEvent('planejamento-atualizado'));
        setTimeout(() => {
          setStatus('idle'); setValor(''); setCategoria(''); setDescricao('');
          setParcelado(false); setRecorrente(false); setTotalParcelas('2'); setParcelaAtual('1');
          if (!ehIndividual) setModoDivisao('5050');
          setMembrosSelecionados(MEMBROS_CASAL.map(m => m.id));
        }, 1500);
      } else { setStatus('error'); setTimeout(() => setStatus('idle'), 3000); }
    } catch { setStatus('error'); setTimeout(() => setStatus('idle'), 3000); }
  }

  function toggleMembro(id: string) {
    setMembrosSelecionados(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  }

  const membroNome = (id: string) => MEMBROS_CASAL.find(m => m.id === id)?.nome ?? id;
  const respNome = usuariaAtiva === 'casal' ? membroNome(responsavel) : perfilConfig.nome;

  if (status === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: `${perfilConfig.cor}22` }}>
          <Check className="h-8 w-8" style={{ color: perfilConfig.cor }} />
        </div>
        <p className="text-xl font-medium text-foreground">Lançado!</p>
        <p className="text-sm text-muted-foreground mt-1">R$ {valor} em {categoria}</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Novo lançamento</p>
        <h2 className="text-xl font-medium text-foreground">
          {usuariaAtiva === 'casal' ? 'Lançar gasto' : `${perfilConfig.nome}, qual foi o gasto?`}
        </h2>
      </div>

      {/* Valor */}
      <div>
        <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Valor</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
          <input type="text" inputMode="decimal" placeholder="0,00" value={valor}
            onChange={e => setValor(e.target.value)} autoFocus
            className="w-full bg-secondary border border-border rounded-xl pl-12 pr-4 py-4 text-2xl font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': perfilConfig.cor } as any}
          />
        </div>
      </div>

      {/* Categoria */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Categoria</label>
          <button onClick={() => setModalCategoria(true)}
            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border-2 border-dashed border-border hover:border-primary hover:text-primary transition-all text-muted-foreground">
            <Plus className="h-3 w-3" /> Nova
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {todasCategorias.map(cat => {
            const EMOJIS: Record<string,string> = {
              'Alimentação':'🍽️','Casa':'🏠','Transporte':'🚗','Lazer':'🎉','Saúde':'💊',
              'Moradia':'🏘️','Compras':'🛍️','Educação':'📚','Energia':'⚡','Gás':'🔥',
              'Gatos':'🐱','Pets':'🐾','Assinaturas':'📱','Vestuário':'👗','Beleza':'💄',
              'Higiene':'🧴','Viagem':'✈️','Presentes':'🎁','Eletrônicos':'💻','Serviços':'🔧',
              'Impostos':'📋','Dívidas':'💳','Investimentos':'📈','Seguro':'🛡️','Cuidados':'🌿',
              'Academia':'🏋️','Trabalho':'💼','Carro':'🚘','Farmácia':'💉','Outros':'📦',
              'Mercado':'🛒',
            };
            const selected = categoria === cat.nome;
            return (
              <button key={cat.nome} type="button" onClick={() => setCategoria(cat.nome)}
                className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-2xl border-2 transition-all duration-150 text-center"
                style={selected
                  ? { background: cat.cor, borderColor: cat.cor, boxShadow: `0 4px 12px ${cat.cor}50`, transform: 'scale(1.04)' }
                  : { background: `${cat.cor}12`, borderColor: `${cat.cor}30` }
                }>
                <span className="text-xl leading-none">{EMOJIS[cat.nome] ?? '⭐'}</span>
                <span className="text-[10px] font-black leading-tight truncate w-full px-0.5"
                  style={{ color: selected ? getTextSobreCor(cat.cor) : cat.cor }}>
                  {cat.nome}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal nova categoria */}
      {modalCategoria && (
        <ModalNovaCategoria
          perfilAtivo={usuariaAtiva}
          membros={MEMBROS_CASAL}
          onCriar={criarCategoria}
          onFechar={() => setModalCategoria(false)}
        />
      )}

      {/* Divisão — oculto para individual */}
      {temDivisao && (
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-3">Como dividir?</label>

          {/* CASAL: 3 opções */}
          {temDivisao && (
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'pessoal',      label: 'Só meu',       sub: '100% de um',       icon: User },
                { id: '5050',         label: '50 / 50',       sub: 'Metade cada',       icon: Users },
                { id: 'proporcional', label: 'Proporcional',  sub: 'Pelo salário',      icon: Users },
              ] as const).map(op => {
                const Icon = op.icon;
                const active = modoDivisao === op.id;
                return (
                  <button key={op.id} onClick={() => setModoDivisao(op.id)}
                    className="py-3 px-2 rounded-xl text-xs font-medium transition-all border flex flex-col items-center gap-1.5"
                    style={active
                      ? { background: perfilConfig.cor, color: 'white', borderColor: perfilConfig.cor, boxShadow: `0 4px 12px ${perfilConfig.cor}40` }
                      : { background: 'var(--secondary)', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-bold">{op.label}</span>
                    <span className="text-[9px] opacity-70">{op.sub}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* FAMÍLIA: 2 opções */}
          {false && (
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: 'pessoal', label: 'Só meu',          sub: 'Gasto individual', icon: User },
                { id: 'membros', label: 'Selecionar quem', sub: 'Escolher membros', icon: Users },
              ] as const).map(op => {
                const Icon = op.icon;
                const active = modoDivisao === op.id;
                return (
                  <button key={op.id} onClick={() => setModoDivisao(op.id)}
                    className="py-3 px-2 rounded-xl text-sm font-medium transition-all border flex flex-col items-center gap-1.5"
                    style={active
                      ? { background: perfilConfig.cor, color: 'white', borderColor: perfilConfig.cor, boxShadow: `0 4px 12px ${perfilConfig.cor}40` }
                      : { background: 'var(--secondary)', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-bold">{op.label}</span>
                    <span className="text-[9px] opacity-70">{op.sub}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Sub-seletor: responsável quando 'Só meu' no contexto casal */}
          {modoDivisao === 'pessoal' && usuariaAtiva === 'casal' && (
            <div className="mt-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">De quem é o gasto?</p>
              <div className="flex gap-2">
                {MEMBROS_CASAL.map(m => (
                  <button key={m.id} onClick={() => setResponsavel(m.id)}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all border"
                    style={responsavel === m.id
                      ? { background: m.cor, color: 'white', borderColor: m.cor }
                      : { background: `${m.cor}15`, color: m.cor, borderColor: `${m.cor}40` }
                    }
                  >{m.nome}</button>
                ))}
              </div>
            </div>
          )}

          {/* Sub-seletor: membros para plano família */}
          {modoDivisao === 'membros' && (
            <div className="mt-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Quem participa?</p>
              <div className="flex gap-2 flex-wrap">
                {MEMBROS_CASAL.map(m => {
                  const sel = membrosSelecionados.includes(m.id);
                  return (
                    <button key={m.id} onClick={() => toggleMembro(m.id)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border"
                      style={sel
                        ? { background: m.cor, color: 'white', borderColor: m.cor }
                        : { background: `${m.cor}15`, color: m.cor, borderColor: `${m.cor}40` }
                      }
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${sel ? 'bg-white/30 border-white' : 'border-current'}`}>
                        {sel && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      {m.nome}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="mt-3 px-3 py-2.5 rounded-lg bg-secondary/60 border border-border/40">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {modoDivisao === 'pessoal' && `💳 Gasto pessoal — ${respNome} arca com 100%`}
              {modoDivisao === '5050' && '⚖️ Dividido igualmente — 50% cada'}
              {modoDivisao === 'proporcional' && '📊 Dividido proporcional ao salário de cada uma'}
              {modoDivisao === 'membros' && membrosSelecionados.length === 0 && '⚠️ Selecione ao menos um membro'}
              {modoDivisao === 'membros' && membrosSelecionados.length === 1 && `💳 Só ${membroNome(membrosSelecionados[0])} paga 100%`}
              {modoDivisao === 'membros' && membrosSelecionados.length > 1 && `👥 ${membrosSelecionados.map(membroNome).join(' + ')} — dividido igualmente`}
            </p>
          </div>
        </div>
      )}

      {/* Opções avançadas */}
      <div>
        <button onClick={() => setMostrarAvancado(!mostrarAvancado)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {mostrarAvancado ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          Opções avançadas
        </button>

        {mostrarAvancado && (
          <div className="mt-3 space-y-4">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Descrição (opcional)</label>
              <input type="text" placeholder="Ex: Supermercado Extra"
                value={descricao} onChange={e => setDescricao(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Despesa fixa mensais (recorrente)?</label>
              <div className="flex items-center gap-3 mb-4">
                <button onClick={() => { setRecorrente(!recorrente); if (!recorrente) setParcelado(false); }}
                  className={`w-10 h-5 rounded-full transition-colors relative ${recorrente ? 'bg-primary' : 'bg-secondary border border-border'}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${recorrente ? 'left-5' : 'left-0.5'}`} />
                </button>
                <span className="text-sm text-muted-foreground">{recorrente ? 'Sim (todo mês)' : 'Não'}</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Parcelado?</label>
              <div className="flex items-center gap-3">
                <button onClick={() => { setParcelado(!parcelado); if (!parcelado) setRecorrente(false); }}
                  className={`w-10 h-5 rounded-full transition-colors relative ${parcelado ? 'bg-primary' : 'bg-secondary border border-border'}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${parcelado ? 'left-5' : 'left-0.5'}`} />
                </button>
                <span className="text-sm text-muted-foreground">{parcelado ? 'Sim' : 'Não'}</span>
              </div>
            </div>

            {parcelado && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Parcela atual</label>
                  <input type="number" min="1" value={parcelaAtual} onChange={e => setParcelaAtual(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Total de parcelas</label>
                  <input type="number" min="2" value={totalParcelas} onChange={e => setTotalParcelas(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmar */}
      <button
        onClick={handleSubmit}
        disabled={!valor || !categoria || status === 'saving' || (modoDivisao === 'membros' && membrosSelecionados.length === 0)}
        className="w-full py-4 rounded-xl text-white font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ background: (!valor || !categoria) ? 'var(--secondary)' : perfilConfig.cor }}
      >
        {status === 'saving' ? (
          <><Loader2 className="h-5 w-5 animate-spin" />Salvando...</>
        ) : status === 'error' ? 'Erro — tente novamente'
        : `Confirmar R$ ${valor || '0'} em ${categoria || '...'}`}
      </button>

    </div>
  );
}