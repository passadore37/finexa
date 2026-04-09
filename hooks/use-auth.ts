'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export interface PerfilUsuario {
  id: string;
  family_id: string;
  nome: string;
  email: string;
  role: 'leticia' | 'giovanna' | 'membro';
  plano: 'individual' | 'casal' | 'familia';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Memoriza o cliente para evitar recriações constantes
  const supabase = useMemo(() => createClient(), []);

  const carregarPerfil = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      if (data) setPerfil(data as PerfilUsuario);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setPerfil(null);
    }
  }, [supabase]);

  useEffect(() => {
    // Busca sessão inicial
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await carregarPerfil(session.user.id);
      }
      setLoading(false);
    };

    checkSession();

    // Escuta mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await carregarPerfil(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setPerfil(null);
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, carregarPerfil]);

  const signOut = async () => {
    try {
      setLoading(true);
      // O signOut do Supabase já lida com a limpeza de tokens/cookies
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Limpa estados locais
      setUser(null);
      setPerfil(null);

      // Redireciona usando o router do Next.js
      router.push('/');
      router.refresh(); // Garante que componentes de servidor sejam atualizados
    } catch (error) {
      console.error('Erro ao sair:', error);
      // Fallback caso o signOut falhe: forçar reload
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  return { user, perfil, loading, signOut };
}
