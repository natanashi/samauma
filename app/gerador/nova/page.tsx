'use client';

/* Portado de `telaNovaDemanda` em `src/telas/gerador.js` + `App.criarDemanda`. */

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Cabecalho, Cartao } from '@/components/ui/Basicos';
import { useRecado } from '@/components/layout/RecadoProvider';
import { Catalogo, PONTOS, RESIDUOS } from '@/lib/dominio/catalogo';
import { daquiADias } from '@/lib/dominio/formato';
import { Sessao } from '@/lib/dominio/sessao';
import { Store } from '@/lib/dominio/store';
import { useDominio } from '@/state/hooks';

export default function PaginaNovaDemanda() {
  useDominio();
  const router = useRouter();
  const recado = useRecado();
  const cadastro = Sessao.cadastroGerador!;

  const [residuo, setResiduo] = useState(RESIDUOS[0].id);
  const [quantidade, setQuantidade] = useState('800');
  const [ponto, setPonto] = useState(cadastro.ponto);
  const [prazo, setPrazo] = useState(() => daquiADias(2).toISOString().slice(0, 10));
  const [observacao, setObservacao] = useState('');

  const pontosDisponiveis = PONTOS.filter(p => !p.id.startsWith('pt-a') && !['pt-galpao', 'pt-recicl', 'pt-usina'].includes(p.id));
  const operador = Catalogo.operador(cadastro);

  function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    const kg = Number(quantidade);
    if (!kg || kg <= 0) { recado('Informe uma quantidade estimada válida.'); return; }

    const demanda = Store.criar({
      geradorId: Sessao.gerador,
      residuo,
      estimadoKg: kg,
      ponto,
      prazo: new Date(prazo + 'T17:00:00').toISOString(),
      observacao: observacao.trim()
    });
    Store.publicar(demanda.id);
    recado(`Demanda ${demanda.id.replace('DEM-', '#')} publicada. Destino previsto: ${demanda.destino.nome}.`);
    router.push(`/gerador/demandas/${demanda.id}`);
  }

  return (
    <>
      <button className="voltar" onClick={() => router.push('/gerador/demandas')}>Voltar para minhas demandas</button>
      <Cabecalho titulo="Nova demanda de destinação" texto="Quatro informações bastam para o ciclo começar." />

      <Cartao corpo={
        <form className="form" onSubmit={enviar}>
          <div>
            <label className="rot" htmlFor="campoResiduo">Tipo de resíduo</label>
            <select id="campoResiduo" value={residuo} onChange={e => setResiduo(e.target.value)}>
              {RESIDUOS.map(r => <option key={r.id} value={r.id}>{r.nome}{r.recuperavel ? '' : ' — vai para o aterro'}</option>)}
            </select>
            <div className="ajuda">O material define a unidade que vai receber a carga.</div>
          </div>
          <div>
            <label className="rot" htmlFor="campoQuantidade">Quantidade estimada (kg)</label>
            <input type="number" id="campoQuantidade" min={1} step={10} value={quantidade} onChange={e => setQuantidade(e.target.value)} required />
            <div className="ajuda">Estimativa sua. O peso real é registrado na coleta e na balança do destino.</div>
          </div>
          <div>
            <label className="rot" htmlFor="campoPonto">Ponto de coleta</label>
            <select id="campoPonto" value={ponto} onChange={e => setPonto(e.target.value)}>
              {pontosDisponiveis.map(p => <option key={p.id} value={p.id}>{p.bairro} · {p.zona}</option>)}
            </select>
            <div className="ajuda">{Catalogo.ponto(ponto)?.acesso}</div>
          </div>
          <div>
            <label className="rot" htmlFor="campoPrazo">Prazo</label>
            <input type="date" id="campoPrazo" value={prazo} onChange={e => setPrazo(e.target.value)} required />
          </div>
          <div className="largo">
            <label className="rot" htmlFor="campoObservacao">Observação para o catador (opcional)</label>
            <textarea id="campoObservacao" placeholder="Ponto de retirada, horário de acesso, condição do material..." value={observacao} onChange={e => setObservacao(e.target.value)} />
          </div>
          <div className="largo acoes-form">
            <button className="btn" type="submit">Criar e publicar demanda</button>
            <button className="btn sec" type="button" onClick={() => router.push('/gerador/demandas')}>Cancelar</button>
            <span className="ajuda">{operador
              ? 'A demanda vai direto para o operador contratado: ' + operador.nome + '.'
              : 'Sem operador contratado, a demanda entra na fila aberta de catadores.'}</span>
          </div>
        </form>
      } />
    </>
  );
}
