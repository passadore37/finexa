'use client';

import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { CATEGORIAS_DISPONIVEIS } from '@/lib/types';
import { useUsuarioContext } from '@/hooks/use-usuario-context';
import { PERFIL_CONFIG } from '@/lib/perfil-config';

type Status = 'idle' | 'saving' | 'success' | 'error';

const DIVISAO_OPCOES = [
  { id: 'pessoal', label: 'Só meu', valor: 'pessoal' },
  { id: '50/50', label: '50 / 50', valor: '50/50' },
];

const CORES_CAT: Record<string, string> = {
  'Alimentação': '#D4537E', 'Transporte': '#378ADD', 'Lazer': '#EF9F27',
  'Casa': '#1D9E75', 'Assinaturas': '#7F77DD', 'Saúde': '#E24B4A',
  'Gatos': '#C4843E', 'Moradia': '#4A90A4', 'Compras': '#A85D32',
  'Educação': '#2D6B9A', 'Energia': '#854F0B', 'Gás': '#5A7A52', 'Outros': '#666666',
};

export function LancarView() {
  const { usuariaAtiva } = useUsuarioContext();
  const perfilConfig = PERFIL_CONFIG[usuariaAtiva];

  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descricao, setDescricao] = useState('');
  const [divisao, setDivisao] = useState('50/50');
  const [responsavel, setResponsavel] = useState<'leticia' | 'giovanna'>('leticia');
  const [parcelado, setParcelado] = useState(false);
  const [totalParcelas, setTotalParcelas] = useState('2');
  const [parcelaAtual, setParcelaAtual] = useState('1');
  const [status, setStatus] = useState<Status>('idle');
  const [mostrarAvancado, setMostrarAvancado] = useState(false);

  const perfil = divisao === 'pessoal'
    ? (usuariaAtiva === 'casal' ? responsavel : usuariaAtiva)
    : (usuariaAtiva === 'casal' ? 'casal' : usuariaAtiva);

  async function handleSubmit() {
    if (!valor || !categoria) return;
    setStatus('saving');

    try {
      const res = await fetch('/api/transacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor: parseFloat(valor.replace(',', '.')),
          categoria,
          descricao: descricao || categoria,
          perfil,
          divisao,
          parcela_atual: parcelado ? parseInt(parcelaAtual) : 1,
          total_parcelas: parcelado ? parseInt(totalParcelas) : 1,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus('success');
        window.dispatchEvent(new CustomEvent('planejamento-atualizado'));
        setTimeout(() => {
          setStatus('idle');
          setValor('');
          setCategoria('');
          setDescricao('');
          setDivisao('50/50');
          setResponsavel('leticia');
          setParcelado(false);
          setTotalParcelas('2');
          setParcelaAtual('1');
        }, 1500);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

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
    <div className="max-w-xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="glass-card p-8 space-y-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/40 mb-2 leading-none">Novo lançamento</p>
          <h2 className="text-3xl font-black text-[#08080f] tracking-tighter">
            {perfilConfig.emoji} {usuariaAtiva === 'casal' ? 'Lançar gasto' : `${perfilConfig.nome}, qual foi o gasto?`}
          </h2>
        </div>

        {/* Valor */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 block mb-3">Valor do gasto</label>
          <div className="relative group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-[#08080f]/20 group-focus-within:text-[#5330ff] transition-colors tabular-nums">R$</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={valor}
              onChange={e => setValor(e.target.value)}
              autoFocus
              className="w-full bg-black/[0.03] border border-black/5 rounded-[1.5rem] pl-16 pr-6 py-6 text-4xl font-black text-[#08080f] placeholder:text-[#08080f]/10 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#5330ff]/10 focus:border-[#5330ff]/20 transition-all tabular-nums"
            />
          </div>
        </div>

        {/* Categoria */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 block mb-3">Categoria</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS_DISPONIVEIS.map(cat => {
              const cor = CORES_CAT[cat] || '#666';
              const selected = categoria === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoria(cat)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border ${
                    selected 
                      ? 'shadow-lg scale-105 -translate-y-0.5' 
                      : 'hover:bg-white/50 hover:shadow-md'
                  }`}
                  style={selected
                    ? { background: cor, color: 'white', borderColor: cor }
                    : { background: `${cor}08`, color: cor, borderColor: `${cor}20` }
                  }
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divisão */}
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 block mb-3">Divisão</label>
            <div className="flex p-1 bg-black/[0.03] rounded-[1.25rem] border border-black/5">
              {DIVISAO_OPCOES.map(op => (
                <button
                  key={op.id}
                  onClick={() => setDivisao(op.valor)}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                    divisao === op.valor
                      ? 'bg-white text-[#08080f] shadow-sm ring-1 ring-black/5'
                      : 'text-[#08080f]/40 hover:text-[#08080f]/60'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {divisao === 'pessoal' && usuariaAtiva === 'casal' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 block mb-3">Responsável</label>
              <div className="flex p-1 bg-black/[0.03] rounded-[1.25rem] border border-black/5">
                {(['leticia', 'giovanna'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setResponsavel(p)}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                      responsavel === p
                        ? 'bg-white text-[#08080f] shadow-sm ring-1 ring-black/5'
                        : 'text-[#08080f]/40 hover:text-[#08080f]/60'
                    }`}
                  >
                    {p === 'leticia' ? 'Letícia' : 'Giovanna'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avançado (Descrição + Parcelamento) */}
        <div>
          <button
            onClick={() => setMostrarAvancado(!mostrarAvancado)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 hover:text-[#5330ff] transition-colors"
          >
            {mostrarAvancado ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Opções avançadas
          </button>

          {mostrarAvancado && (
            <div className="mt-6 space-y-6 lg:p-6 p-0 lg:bg-black/[0.02] rounded-3xl lg:border border-black/5 animate-in fade-in slide-in-from-top-4 duration-500">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 block mb-3">Descrição (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Supermercado Extra"
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  className="w-full bg-black/[0.03] border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold text-[#08080f] placeholder:text-[#08080f]/10 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#5330ff]/10 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 block mb-3">Gasto Parcelado?</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setParcelado(!parcelado)}
                    className={`w-14 h-7 rounded-full transition-all relative ${parcelado ? 'bg-[#5330ff]' : 'bg-black/10'}`}
                  >
                    <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all ${parcelado ? 'left-8' : 'left-1'}`} />
                  </button>
                  <span className="text-sm font-bold text-[#08080f]/60">{parcelado ? 'Sim, parcelado' : 'Não, à vista'}</span>
                </div>
              </div>

              {parcelado && (
                <div className="grid grid-cols-2 gap-4 animate-in zoom-in-95 duration-300">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 block mb-3">Parcela atual</label>
                    <input
                      type="number"
                      min="1"
                      value={parcelaAtual}
                      onChange={e => setParcelaAtual(e.target.value)}
                      className="w-full bg-black/[0.03] border border-black/5 rounded-2xl px-5 py-3 text-sm font-bold text-[#08080f] focus:outline-none focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 block mb-3">Total de parcelas</label>
                    <input
                      type="number"
                      min="2"
                      value={totalParcelas}
                      onChange={e => setTotalParcelas(e.target.value)}
                      className="w-full bg-black/[0.03] border border-black/5 rounded-2xl px-5 py-3 text-sm font-bold text-[#08080f] focus:outline-none focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botão confirmar */}
        <button
          onClick={handleSubmit}
          disabled={!valor || !categoria || status === 'saving'}
          className="w-full py-5 rounded-[1.5rem] text-white font-black text-lg transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95"
          style={{ background: (!valor || !categoria) ? '#6b6b8a' : perfilConfig.cor }}
        >
          {status === 'saving' ? (
            <><Loader2 className="h-6 w-6 animate-spin" />SALVANDO...</>
          ) : status === 'error' ? (
            'ERRO — TENTE NOVAMENTE'
          ) : (
            `CONFIRMAR R$ ${valor || '0'}`
          )}
        </button>
      </div>
    </div>
  );
}
