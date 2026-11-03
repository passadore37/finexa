'use client';

import useSWR from 'swr';

export interface Cartao {
  id: string;
  nome: string;
  dia_fechamento: number; // 0 = último dia do mês
  dia_vencimento: number;
  perfil_dono: 'membro0' | 'membro1' | null; // null = compartilhado
}

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(r => r.json());

export function useCartoes() {
  const { data } = useSWR<{ success: boolean; data: Cartao[] }>('/api/cartoes', fetcher, {
    revalidateOnFocus: false,
  });
  return { cartoes: data?.success ? data.data : [] };
}
