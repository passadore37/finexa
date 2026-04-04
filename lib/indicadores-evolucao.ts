// Busca histórico completo de evolução mensal (todos os meses com dados)
export async function fetchEvolucaoCompleta(family_id: string): Promise<Array<{
  mes: number; ano: number; label: string;
  receitas: number; despesas: number; saldo: number;
}>> {
  // Esta função é chamada separadamente para o gráfico de evolução
  // Busca dados agregados por mês diretamente do Supabase
  // sem limite de meses
  const response = await fetch('/api/evolucao');
  if (!response.ok) return [];
  const data = await response.json();
  return data.evolucao || [];
}
