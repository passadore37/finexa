'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase';

function NovaSenhaForm() {
  const params = useSearchParams();
  const [senha, setSenha]     = useState('');
  const [confirma, setConfirma] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro]       = useState('');
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    // O Supabase injeta a sessão via hash na URL ao clicar no link de reset
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      // evento PASSWORD_RECOVERY indica que o usuário veio do link de reset
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 8) { setErro('Senha deve ter pelo menos 8 caracteres.'); return; }
    if (senha !== confirma) { setErro('As senhas não coincidem.'); return; }
    setLoading(true); setErro('');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw error;
      setSucesso(true);
      setTimeout(() => window.location.href = '/dashboard', 2000);
    } catch (err: any) {
      setErro(err.message || 'Erro ao atualizar senha.');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="nb-card bg-card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-lg"
              style={{ background: '#5330ff', border: '2px solid #82a1fd', boxShadow: '2px 2px 0 #82a1fd' }}>F</div>
            <div>
              <h1 className="text-2xl font-black text-foreground">Nova senha</h1>
              <p className="text-sm text-muted-foreground">Digite sua nova senha</p>
            </div>
          </div>

          {sucesso ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-12 h-12 rounded-full bg-[#1D9E75]/20 flex items-center justify-center">
                <Check className="h-6 w-6 text-[#1D9E75]" />
              </div>
              <p className="text-sm font-bold text-foreground">Senha atualizada!</p>
              <p className="text-xs text-muted-foreground">Redirecionando...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Nova senha</label>
                <div className="relative">
                  <input type={mostrar ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)}
                    required placeholder="Mínimo 8 caracteres"
                    className="w-full bg-background border-2 border-border rounded-xl px-4 py-3.5 pr-12 text-foreground focus:outline-none focus:border-[#5330ff] transition-colors" />
                  <button type="button" onClick={() => setMostrar(!mostrar)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {mostrar ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Confirmar senha</label>
                <input type="password" value={confirma} onChange={e => setConfirma(e.target.value)}
                  required placeholder="Repita a senha"
                  className="w-full bg-background border-2 border-border rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:border-[#5330ff] transition-colors" />
              </div>
              {erro && <div className="border-2 border-red-400 bg-red-900/20 rounded-xl px-4 py-3 text-sm font-bold text-red-400">{erro}</div>}
              <button type="submit" disabled={loading}
                className="nb-btn bg-[#5330ff] text-white py-4 font-black text-base w-full flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ borderColor: '#5330ff', boxShadow: '4px 4px 0 #82a1fd60' }}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Salvando...' : 'Salvar nova senha'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NovaSenhaPage() {
  return <Suspense fallback={<div className="min-h-screen bg-background" />}><NovaSenhaForm /></Suspense>;
}
