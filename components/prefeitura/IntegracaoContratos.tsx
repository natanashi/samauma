'use client';

/* SAMAÚMA — contratos municipais de limpeza urbana, consultados ao vivo na
   API pública da Prefeitura. Portado de `blocoIntegracaoContratos` /
   `carregarContratosPMPV` em `src/servicos/integracoes.js`. */

import { useEffect, useState } from 'react';
import { Aviso, Cartao, Kpi, Kpis } from '@/components/ui/Basicos';
import { Fmt } from '@/lib/dominio/formato';
import { buscarContratosPMPV, type ContratosPMPV } from '@/lib/servicos/integracoes';

export function IntegracaoContratos() {
  const [estado, setEstado] = useState<'carregando' | 'pronto' | 'erro'>('carregando');
  const [dados, setDados] = useState<ContratosPMPV | null>(null);
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    let cancelado = false;
    buscarContratosPMPV()
      .then(r => { if (!cancelado) { setDados(r); setEstado('pronto'); } })
      .catch(erro => {
        if (cancelado) return;
        setMotivo(erro.name === 'AbortError' ? 'a consulta passou de oito segundos e foi interrompida' : erro.message);
        setEstado('erro');
      });
    return () => { cancelado = true; };
  }, []);

  return (
    <Cartao titulo="Contratos municipais de limpeza urbana" sub="Consulta ao vivo na API pública de contratos da Prefeitura"
      nota="Fonte oficial, sem chave de acesso e sem servidor intermediário. Os demais números desta tela vêm do cenário demonstrativo; estes vêm da Prefeitura."
      corpo={
        <div className="integracao">
          {estado === 'carregando' && <p className="integracao-espera">Consultando <code>api.portovelho.ro.gov.br</code>…</p>}
          {estado === 'erro' && (
            <Aviso tom="alerta" titulo="Sem resposta da API da Prefeitura agora"
              texto={`A consulta a api.portovelho.ro.gov.br nao completou (${motivo}). O restante do sistema continua funcionando: esta e a unica parte que depende de rede.`} />
          )}
          {estado === 'pronto' && dados && (
            <>
              <Kpis>
                <Kpi rotulo={'Contratos em ' + dados.ano} valor={Fmt.numero(dados.total)} sub="registros na base municipal" tom="marca" />
                <Kpi rotulo="Ligados a resíduo" valor={dados.achados} sub={`entre os ${dados.lidos} lidos nesta consulta`} />
                <Kpi rotulo="Origem" valor="API pública" sub="dado oficial, não demonstrativo" tom="ok" />
              </Kpis>
              {dados.achados ? (
                <div className="lista-def" style={{ marginTop: 'var(--e3)' }}>
                  {dados.ligados.map((c, i) => (
                    <div className="def" key={i}>
                      <b>{c.numero} · {c.valor}</b>
                      <p>{c.objeto}{c.objeto.length >= 170 ? '…' : ''}</p>
                      {c.inicio && <small className="fonte-dado">vigência desde {Fmt.data(c.inicio)}</small>}
                    </div>
                  ))}
                </div>
              ) : (
                <Aviso titulo="Nenhum contrato de limpeza no recorte deste ano"
                  texto="A consulta funcionou e trouxe os contratos do exercício; nenhum deles casa com os termos de resíduo e limpeza urbana." />
              )}
            </>
          )}
        </div>
      } />
  );
}
