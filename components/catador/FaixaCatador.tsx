'use client';

import { FaixaPerfil } from '@/components/ui/Basicos';
import { Fmt } from '@/lib/dominio/formato';
import { Painel } from '@/lib/dominio/indicadores';
import { Sessao } from '@/lib/dominio/sessao';

export function FaixaCatador({ acao }: { acao?: React.ReactNode }) {
  const p = Painel.catador(Sessao.catador.id);
  return (
    <FaixaPerfil
      nome={p.pessoa.nome}
      papel={p.cooperativa ? `Cooperado da ${p.cooperativa.nome} · ${p.pessoa.veiculo}` : `Catador autônomo · ${p.pessoa.veiculo}`}
      medidas={[
        [p.atendimentos, 'atendimentos'],
        [Fmt.toneladas(p.massa), 'massa entregue'],
        [Fmt.reais(p.renda), 'valor gerado'],
        [p.emAndamento, 'em campo']
      ]}
      acao={acao} />
  );
}
