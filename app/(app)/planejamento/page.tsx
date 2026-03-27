import { PlanejamentoView } from '@/components/planejamento/planejamento-view';

export default function PlanejamentoPage() {
  const salarioLeticia = parseFloat(process.env.SALARIO_LETICIA || '0');
  const salarioGiovanna = parseFloat(process.env.SALARIO_GIOVANNA || '0');

  return (
    <PlanejamentoView
      salarioLeticia={salarioLeticia}
      salarioGiovanna={salarioGiovanna}
    />
  );
}
