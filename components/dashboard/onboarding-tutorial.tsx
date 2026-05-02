// components/dashboard/onboarding-tutorial.tsx
'use client';

import { useState } from 'react';
import { X, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OnboardingTutorialProps {
  onClose?: () => void;
}

export function OnboardingTutorial({ onClose }: OnboardingTutorialProps) {
  const [etapa, setEtapa] = useState(0);

  const etapas = [
    {
      titulo: '👋 Bem-vindo ao Finexa!',
      descricao: 'Vamos fazer um tour rápido para você entender como funciona sua plataforma de controle financeiro.',
      icone: '📊',
    },
    {
      titulo: '💰 Registre suas transações',
      descricao: 'Use o botão "Lançar" para registrar todos os seus gastos e receitas. Você pode categorizar cada movimento.',
      icone: '💳',
      destaque: 'lancar',
    },
    {
      titulo: '📈 Visualize suas tendências',
      descricao: 'No dashboard, você vê a evolução dos seus gastos mensais, categorias mais gastas e projeção de quanto falta para o fim do mês.',
      icone: '📊',
      destaque: 'dashboard',
    },
    {
      titulo: '🎯 Acompanhe suas metas',
      descricao: 'Defina metas de poupança, viagens ou qualquer objetivo. O sistema acompanha seu progresso automaticamente.',
      icone: '🎯',
      destaque: 'metas',
    },
    {
      titulo: '💡 Dicas importantes',
      descricao: 'Confira os alertas e sugestões personalizadas. O Finexa aprende com seus hábitos e recomenda otimizações.',
      icone: '💡',
      destaque: 'insights',
    },
    {
      titulo: '✨ Pronto para começar!',
      descricao: 'Você está pronto para controlar suas finanças. Comece registrando suas primeiras transações.',
      icone: '🚀',
    },
  ];

  const etapaAtual = etapas[etapa];

  function proximaEtapa() {
    if (etapa < etapas.length - 1) {
      setEtapa(etapa + 1);
    } else {
      onClose?.();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="nb-card bg-card p-8 max-w-md w-full relative">
        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>

        {/* Progresso */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1">
            {etapas.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${
                  i <= etapa ? 'bg-[#5330ff]' : 'bg-border'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-muted-foreground ml-2">
            {etapa + 1}/{etapas.length}
          </span>
        </div>

        {/* Conteúdo */}
        <div className="text-center space-y-4 mb-8">
          <div className="text-5xl">{etapaAtual.icone}</div>
          <div>
            <h2 className="text-xl font-black text-foreground mb-2">{etapaAtual.titulo}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{etapaAtual.descricao}</p>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          {etapa > 0 && (
            <button
              onClick={() => setEtapa(etapa - 1)}
              className="flex-1 py-3 rounded-xl font-black text-sm border-2 border-border text-foreground hover:bg-secondary transition-colors"
            >
              Voltar
            </button>
          )}
          <button
            onClick={proximaEtapa}
            className="flex-1 py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2"
            style={{ background: '#5330ff', boxShadow: '4px 4px 0 #82a1fd60' }}
          >
            {etapa === etapas.length - 1 ? (
              <>
                <CheckCircle2 size={16} /> Começar
              </>
            ) : (
              <>
                Próximo <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* Pular */}
        <button
          onClick={onClose}
          className="w-full mt-4 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          Pular tutorial
        </button>
      </div>
    </div>
  );
}
