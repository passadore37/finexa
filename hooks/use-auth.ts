'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface PerfilUsuario {
  id: string;
  family_id: string;
  nome: string;
  email: string;
  role: 'leticia' | 'giovanna' | 'membro';
  plano: 'individual' | 'casal' | 'familia';
  is_master?: boolean;
  onboarding_done?: boolean;
}

export function useAuth() {
  const [user, setUser]       = useState<User | null>(null);
  const [perfil, setPerfil]   = useState<PerfilUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const carregarPerfil = useCallback(async (userId: string) => {
    const { data } = await supabase.from('perfis').select('*').eq('id', userId).single();
    if (data) setPerfil(data as PerfilUsuario);
    return data;
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) carregarPerfil(session.user.id);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (event === 'SIGNED_IN' && session?.user) await carregarPerfil(session.user.id);
        else if (event === 'SIGNED_OUT') { setPerfil(null); setUser(null); }
        setLoading(false);
      }
    );
    return () => subscription.unsubscribe();
  }, [supabase, carregarPerfil]);

  // Recarrega perfil após onboarding salvar o nome
  const reloadPerfil = useCallback(async () => {
    if (user?.id) await carregarPerfil(user.id);
  }, [user, carregarPerfil]);

  const signOut = async () => {
    try { await supabase.auth.signOut(); } catch {}
    window.location.replace('/');
  };

  return { user, perfil, loading, signOut, reloadPerfil };
}
