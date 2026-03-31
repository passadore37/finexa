// hooks/use-auth.ts — hook de autenticação e perfil
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface PerfilUsuario {
  id: string;
  family_id: string;
  nome: string;
  email: string;
  role: 'leticia' | 'giovanna' | 'membro';
  plano: 'individual' | 'casal' | 'familia';
}

export function useAuth() {
  const [user, setUser]       = useState<User | null>(null);
  const [perfil, setPerfil]   = useState<PerfilUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const carregarPerfil = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setPerfil(data as PerfilUsuario);
  }, [supabase]);

  useEffect(() => {
    // Sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) carregarPerfil(session.user.id);
      setLoading(false);
    });

    // Listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await carregarPerfil(session.user.id);
        } else {
          setPerfil(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [carregarPerfil, supabase.auth]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return { user, perfil, loading, signOut };
}
