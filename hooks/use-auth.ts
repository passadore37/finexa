'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface PerfilUsuario {
  id: string;
  family_id: string;
  nome: string;
  email: string;
  role: string;
  plano: 'individual' | 'casal' | 'familia';
  is_master?: boolean;
  onboarding_done?: boolean;
}

export function useAuth() {
  const [user, setUser]       = useState<User | null>(null);
  const [perfil, setPerfil]   = useState<PerfilUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const carregarPerfil = useCallback(async (u: User) => {
    const { data } = await supabase.from('perfis').select('*').eq('id', u.id).single();
    if (data) {
      // Usar nome do user_metadata se o perfil ainda tiver nome antigo
      const nomeAtual = data.nome;
      const nomeMeta  = u.user_metadata?.nome;
      setPerfil({
        ...data as PerfilUsuario,
        nome: nomeAtual && nomeAtual !== u.email ? nomeAtual : (nomeMeta ?? nomeAtual),
      });
    }
    return data;
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) carregarPerfil(session.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (event === 'SIGNED_IN' && session?.user) {
          await carregarPerfil(session.user);
        } else if (event === 'SIGNED_OUT') {
          setPerfil(null); setUser(null);
        }
        setLoading(false);
      }
    );
    return () => subscription.unsubscribe();
  }, [supabase, carregarPerfil]);

  const reloadPerfil = useCallback(async () => {
    if (user) {
      // Buscar sessão atualizada para pegar user_metadata novo
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) await carregarPerfil(session.user);
    }
  }, [user, supabase, carregarPerfil]);

  const signOut = async () => {
    try { await supabase.auth.signOut(); } catch {}
    window.location.replace('/');
  };

  return { user, perfil, loading, signOut, reloadPerfil };
}
