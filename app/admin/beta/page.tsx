'use client';

import { useState, useEffect } from 'react';
import { Copy, Trash2, Plus, Loader2, Check, AlertCircle } from 'lucide-react';

interface BetaToken {
  token: string;
  email: string | null;
  nome: string | null;
  criado_em: string;
  usado: boolean;
  usado_em: string | null;
  usado_por: string | null;
  link: string;
}

export default function BetaAdminPage() {
  const [tokens, setTokens] = useState<BetaToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [novoEmail, setNovoEmail] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [criando, setCriando] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const adminTokenFromEnv = process.env.NEXT_PUBLIC_ADMIN_SECRET || '';

  useEffect(() => {
    // Solicitar token de admin
    const token = localStorage.getItem('admin_token');
    if (token) {
      setAdminToken(token);
      carregarTokens(token);
    }
  }, []);

  async function carregarTokens(token: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/beta', {
        headers: { 'x-admin-token': token },
      });
      const data = await res.json();
      if (data.success) {
        setTokens(data.tokens || []);
      }
    } catch (err) {
      setErro('Erro ao carregar tokens');
    } finally {
      setLoading(false);
    }
  }

  async function criarNovoToken() {
    if (!novoEmail && !novoNome) {
      setErro('Forneça pelo menos email ou nome');
      return;
    }

    setCriando(true);
    try {
      const res = await fetch('/api/admin/beta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({ email: novoEmail, nome: novoNome }),
      });
      const data = await res.json();
      if (data.success) {
        setTokens([data.data, ...tokens]);
        setNovoEmail('');
        setNovoNome('');
        setSucesso('Link beta criado com sucesso!');
        setTimeout(() => setSucesso(''), 3000);
      } else {
        setErro(data.error || 'Erro ao criar link');
      }
    } catch (err) {
      setErro('Erro de conexão');
    } finally {
      setCriando(false);
    }
  }

  async function deletarToken(token: string) {
    if (!confirm('Tem certeza que deseja deletar este link?')) return;

    try {
      const res = await fetch(`/api/admin/beta?token=${token}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken },
      });
      const data = await res.json();
      if (data.success) {
        setTokens(tokens.filter(t => t.token !== token));
        setSucesso('Link deletado');
        setTimeout(() => setSucesso(''), 3000);
      }
    } catch (err) {
      setErro('Erro ao deletar link');
    }
  }

  function copiarLink(link: string, token: string) {
    navigator.clipboard.writeText(link);
    setCopiado(token);
    setTimeout(() => setCopiado(null), 2000);
  }

  if (!adminToken) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-md mx-auto mt-20">
          <div className="nb-card bg-card p-8 text-center">
            <h1 className="text-xl font-black text-foreground mb-4">Acesso Admin</h1>
            <input
              type="password"
              placeholder="Digite seu token de admin"
              value={adminToken}
              onChange={e => {
                setAdminToken(e.target.value);
                localStorage.setItem('admin_token', e.target.value);
              }}
              className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[#5330ff]"
            />
            <p className="text-xs text-muted-foreground mt-2">Token será salvo no localStorage</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-foreground">Gerenciar Links Beta</h1>
          <button
            onClick={() => {
              localStorage.removeItem('admin_token');
              setAdminToken('');
            }}
            className="text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            Sair
          </button>
        </div>

        {/* Criar novo link */}
        <div className="nb-card bg-card p-6 mb-6">
          <h2 className="font-black text-lg mb-4 text-foreground">Criar novo link beta</h2>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Email (opcional)"
              value={novoEmail}
              onChange={e => setNovoEmail(e.target.value)}
              className="flex-1 bg-background border-2 border-border rounded-xl px-4 py-2 text-foreground focus:outline-none focus:border-[#5330ff]"
            />
            <input
              type="text"
              placeholder="Nome (opcional)"
              value={novoNome}
              onChange={e => setNovoNome(e.target.value)}
              className="flex-1 bg-background border-2 border-border rounded-xl px-4 py-2 text-foreground focus:outline-none focus:border-[#5330ff]"
            />
            <button
              onClick={criarNovoToken}
              disabled={criando}
              className="px-4 py-2 rounded-xl font-black bg-[#5330ff] text-white flex items-center gap-2 hover:opacity-90"
            >
              {criando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={16} />}
              Criar
            </button>
          </div>
        </div>

        {/* Mensagens */}
        {erro && (
          <div className="mb-4 p-4 rounded-xl border border-red-400 bg-red-50 dark:bg-red-900/20">
            <p className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle size={16} /> {erro}
            </p>
          </div>
        )}
        {sucesso && (
          <div className="mb-4 p-4 rounded-xl border border-green-400 bg-green-50 dark:bg-green-900/20">
            <p className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
              <Check size={16} /> {sucesso}
            </p>
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="nb-card bg-card p-4">
            <p className="text-xs font-bold text-muted-foreground uppercase">Total de links</p>
            <p className="text-2xl font-black text-foreground">{tokens.length}</p>
          </div>
          <div className="nb-card bg-card p-4">
            <p className="text-xs font-bold text-muted-foreground uppercase">Utilizados</p>
            <p className="text-2xl font-black text-foreground">{tokens.filter(t => t.usado).length}</p>
          </div>
          <div className="nb-card bg-card p-4">
            <p className="text-xs font-bold text-muted-foreground uppercase">Disponíveis</p>
            <p className="text-2xl font-black text-foreground">{tokens.filter(t => !t.usado).length}</p>
          </div>
        </div>

        {/* Lista de tokens */}
        <div className="nb-card bg-card p-6">
          <h2 className="font-black text-lg mb-4 text-foreground">Links Beta</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : tokens.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum link criado ainda</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-black text-muted-foreground py-2 px-2">Email</th>
                    <th className="text-left font-black text-muted-foreground py-2 px-2">Nome</th>
                    <th className="text-left font-black text-muted-foreground py-2 px-2">Status</th>
                    <th className="text-left font-black text-muted-foreground py-2 px-2">Criado em</th>
                    <th className="text-left font-black text-muted-foreground py-2 px-2">Link</th>
                    <th className="text-left font-black text-muted-foreground py-2 px-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map(token => (
                    <tr key={token.token} className="border-b border-border hover:bg-secondary/50">
                      <td className="py-3 px-2 text-foreground">{token.email || '—'}</td>
                      <td className="py-3 px-2 text-foreground">{token.nome || '—'}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${
                            token.usado
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          }`}
                        >
                          {token.usado ? 'Utilizado' : 'Disponível'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {new Date(token.criado_em).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-background px-2 py-1 rounded border border-border text-foreground">
                            {token.token.slice(0, 8)}...
                          </code>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => copiarLink(token.link, token.token)}
                            className="p-2 rounded-lg hover:bg-secondary transition-colors"
                            title="Copiar link"
                          >
                            {copiado === token.token ? (
                              <Check size={16} className="text-green-600" />
                            ) : (
                              <Copy size={16} className="text-muted-foreground hover:text-foreground" />
                            )}
                          </button>
                          <button
                            onClick={() => deletarToken(token.token)}
                            className="p-2 rounded-lg hover:bg-red-900/20 transition-colors"
                            title="Deletar link"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
