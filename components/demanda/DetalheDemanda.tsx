'use client';

/* SAMAÚMA — detalhe da demanda.
   A mesma tela para os quatro perfis: o ciclo, as medições, os dados e a
   trilha. O que muda é o bloco de ação — cada um só enxerga o que pode fazer.
   Portado de `src/telas/demanda.js`. */

import { useRouter } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';
import { Cartao, Aviso, Vazio, SituacaoDemanda } from '@/components/ui/Basicos';
import { BarraRecuperacao } from '@/components/ui/Graficos';
import { useComprovante } from '@/components/comprovante/ComprovanteProvider';
import { useRecado } from '@/components/layout/RecadoProvider';
import { CanalRegistro } from '@/lib/dominio/canalRegistro';
import { Catalogo, ETAPAS, STATUS, TOLERANCIA } from '@/lib/dominio/catalogo';
import { DemandaRegras as Demanda } from '@/lib/dominio/demanda';
import { Fmt } from '@/lib/dominio/formato';
import { Sessao } from '@/lib/dominio/sessao';
import { Store } from '@/lib/dominio/store';
import type { Demanda as TDemanda, Perfil } from '@/lib/dominio/tipos';
import { useDominio } from '@/state/hooks';

export function DetalheDemanda({ perfil, id }: { perfil: Perfil; id: string }) {
  useDominio();
  const router = useRouter();
  const recado = useRecado();
  const demanda = Store.obter(id);

  if (!demanda) return <Vazio titulo="Demanda não encontrada" texto="Ela pode ter sido removida ao reiniciar a demonstração." />;

  return (
    <>
      <button className="voltar" onClick={() => router.back()}>Voltar</button>

      <div className="cabecalho detalhe" style={{ ['--material' as string]: Catalogo.corResiduo(demanda.residuo) }}>
        <div>
          <span className="codigo">DEMANDA {demanda.id.replace('DEM-', '#')}</span>
          <h2>{Catalogo.nomeResiduo(demanda.residuo)} · {demanda.gerador.nome}</h2>
          <p>{Catalogo.endereco(demanda.ponto)} · prazo {Fmt.prazo(demanda.prazo)} · destino {demanda.destino.nome}</p>
        </div>
        <div className="acoes"><SituacaoDemanda demanda={demanda} /></div>
      </div>

      <Cartao classe="sem-borda" corpo={<Ciclo demanda={demanda} />} />

      <div className="colunas dois-um">
        <div className="pilha">
          <AcoesDoPerfil demanda={demanda} perfil={perfil} recado={recado} />
          <BlocoMedicoes demanda={demanda} />
          <BlocoDados demanda={demanda} />
        </div>
        <div className="pilha">
          <BlocoTrilha demanda={demanda} />
        </div>
      </div>
    </>
  );
}

function Ciclo({ demanda }: { demanda: TDemanda }) {
  const atual = STATUS[demanda.status].etapa;
  const problema = demanda.status === 'PENDENCIA';
  return (
    <ol className="ciclo">
      {ETAPAS.map((nome, i) => {
        const n = i + 1;
        const classe = problema && n === atual ? 'problema' : n < atual ? 'feita' : n === atual ? 'atual' : '';
        return <li key={nome} className={classe}><span className="bolha">{n < atual && !problema ? '✓' : n}</span><b>{nome}</b></li>;
      })}
    </ol>
  );
}

function AcoesDoPerfil({ demanda, perfil, recado }: { demanda: TDemanda; perfil: Perfil; recado: (t: string) => void }) {
  if (perfil === 'gerador') return <AcoesGerador demanda={demanda} recado={recado} />;
  if (perfil === 'catador') return <AcoesCatador demanda={demanda} recado={recado} />;
  if (perfil === 'cooperativa') return <AcoesDestinatario demanda={demanda} recado={recado} />;
  return <AcoesPrefeitura demanda={demanda} recado={recado} />;
}

function Esperando({ demanda }: { demanda: TDemanda }) {
  const proxima = Demanda.proximaAcao(demanda);
  if (!proxima.perfil) return null;
  const dono = ({ gerador: 'o gerador', catador: 'o catador', cooperativa: 'quem recebe a carga', prefeitura: 'a Prefeitura' } as Record<string, string>)[proxima.perfil];
  return <Cartao corpo={<Aviso titulo={`Aguardando ${dono}`} texto={proxima.texto + '.'} />} />;
}

function BlocoComprovado({ demanda }: { demanda: TDemanda }) {
  const { abrir } = useComprovante();
  return (
    <Cartao titulo="Ciclo comprovado" sub={`${demanda.comprovante!.codigo} · ${Fmt.dataHora(demanda.comprovante!.emitidoEm)}`} classe="acao-viva bom"
      corpo={
        <>
          <Aviso tom="bom" titulo="Existe prova verificável desta destinação"
            texto={`${Fmt.kg(demanda.verificadoKg)} confirmados por ${demanda.destino.nome}, com ${Fmt.kg(Demanda.reciclado(demanda))} recuperados e ${Fmt.kg(Demanda.rejeito(demanda))} de rejeito. Divergência final de ${Fmt.percentual(demanda.comprovante!.divergencia)}${demanda.conciliada ? ', após conciliação da Prefeitura' : ''}.`} />
          <div className="acoes-form">
            <button className="btn" onClick={() => abrir(demanda.id)}>Ver comprovante</button>
            <span className="ajuda">O mesmo documento para gerador, catador, destinatário e Prefeitura.</span>
          </div>
        </>
      } />
  );
}

function AcoesGerador({ demanda, recado }: { demanda: TDemanda; recado: (t: string) => void }) {
  if (demanda.status === 'CRIADA') {
    const operador = Catalogo.operador(Catalogo.gerador(demanda.gerador.id));
    return (
      <Cartao titulo="Publicar demanda" sub="Ainda é um rascunho: nenhum catador enxerga." classe="acao-viva"
        corpo={
          <>
            <p className="texto">{operador
              ? <>A demanda vai para o operador contratado, <b>{operador.nome}</b>.</>
              : 'Sem operador contratado, a demanda entra na fila aberta de catadores e cooperativas.'}
              {' '}O material segue para <b>{demanda.destino.nome}</b>, que confirma o recebimento no fim do ciclo.</p>
            <button className="btn" onClick={() => {
              try { Store.publicar(demanda.id); recado('Demanda publicada. Já aparece para os catadores.'); }
              catch (erro) { recado((erro as Error).message); }
            }}>Publicar demanda</button>
          </>
        } />
    );
  }
  if (demanda.status === 'COMPROVADA') return <BlocoComprovado demanda={demanda} />;
  return <Esperando demanda={demanda} />;
}

function AcoesCatador({ demanda, recado }: { demanda: TDemanda; recado: (t: string) => void }) {
  if (demanda.status === 'DISPONIVEL') {
    const ponto = Catalogo.ponto(demanda.ponto)!;
    const valor = Demanda.valor({ ...demanda, verificadoKg: demanda.estimadoKg, rejeitoKg: 0 });
    return (
      <Cartao titulo="Aceitar esta demanda" sub={`${demanda.km.toLocaleString('pt-BR')} km · prazo ${Fmt.prazo(demanda.prazo)}`} classe="acao-viva"
        corpo={
          <>
            <div className="campos">
              <div className="campo"><div className="rot">Endereço</div><div className="val">{ponto.bairro}<small>{ponto.acesso}</small></div></div>
              <div className="campo"><div className="rot">Volume estimado</div><div className="val num">{Fmt.kg(demanda.estimadoKg)}<small>estimativa do gerador</small></div></div>
              <div className="campo"><div className="rot">Valor estimado</div><div className="val num">{Fmt.reais(valor)}<small>demonstrativo, pelo peso estimado</small></div></div>
              <div className="campo"><div className="rot">Entrega em</div><div className="val">{demanda.destino.nome}<small>ponto final do ciclo</small></div></div>
            </div>
            <div className="acoes-form">
              <button className="btn" onClick={() => {
                try { Store.aceitar(demanda.id, Sessao.catador); recado('Demanda aceita. Ela está em "Minhas coletas".'); }
                catch (erro) { recado((erro as Error).message); }
              }}>Aceitar demanda</button>
            </div>
          </>
        } />
    );
  }

  const minha = demanda.catador && demanda.catador.id === Sessao.catador.id;
  if (!minha) return <Esperando demanda={demanda} />;
  if (['ACEITA', 'EM_COLETA'].includes(demanda.status)) return <BlocoExecucao demanda={demanda} recado={recado} />;
  if (demanda.status === 'COMPROVADA') return <BlocoComprovado demanda={demanda} />;
  return <Esperando demanda={demanda} />;
}

function BlocoExecucao({ demanda, recado }: { demanda: TDemanda; recado: (t: string) => void }) {
  const [pesoDigitado, setPesoDigitado] = useState<string>(String(demanda.coletadoKg ?? demanda.estimadoKg));
  useSyncExternalStore(CanalRegistro.subscribe, CanalRegistro.getSnapshot, CanalRegistro.getSnapshot);
  const iniciada = demanda.status === 'EM_COLETA';
  const pesada = demanda.coletadoKg != null;
  const fotografada = !!demanda.foto;
  const ponto = Catalogo.ponto(demanda.ponto)!;

  function aoEscolherFoto(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files && evento.target.files[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => {
      const imagem = new Image();
      imagem.onload = () => {
        const escala = Math.min(1, 320 / Math.max(imagem.width, imagem.height));
        const tela = document.createElement('canvas');
        tela.width = Math.round(imagem.width * escala);
        tela.height = Math.round(imagem.height * escala);
        tela.getContext('2d')!.drawImage(imagem, 0, 0, tela.width, tela.height);
        Store.anexarFoto(demanda.id, tela.toDataURL('image/jpeg', 0.6));
        recado('Registro fotográfico anexado à demanda.');
      };
      imagem.onerror = () => { Store.anexarFoto(demanda.id, 'demonstrativa'); };
      imagem.src = leitor.result as string;
    };
    leitor.onerror = () => recado('Não foi possível ler a foto. Tente outro arquivo.');
    leitor.readAsDataURL(arquivo);
  }

  const passo = (n: number, titulo: string, texto: string, estadoPasso: string, controle: React.ReactNode) => (
    <li className={`passo ${estadoPasso}`}>
      <span className="n">{estadoPasso === 'feito' ? '✓' : n}</span>
      <span className="texto"><b>{titulo}</b><span>{texto}</span></span>
      <span className="controle">{controle}</span>
    </li>
  );

  return (
    <Cartao titulo="Registrar a coleta" sub={`${demanda.gerador.nome} · ${ponto.bairro} · ${ponto.acesso}`} classe="acao-viva"
      nota="O peso informado em campo nunca é sobrescrito. Se a balança do destino registrar outro valor, os dois ficam na trilha."
      corpo={
        <ol className="execucao">
          {passo(1, 'Iniciar coleta', iniciada ? 'Coleta em andamento.' : 'Confirme quando estiver a caminho do estabelecimento.',
            iniciada ? 'feito' : 'ativo',
            iniciada ? null : <button className="btn" onClick={() => {
              try { Store.iniciarColeta(demanda.id); recado('Coleta iniciada.'); } catch (erro) { recado((erro as Error).message); }
            }}>Iniciar</button>)}

          {passo(2, 'Registrar peso', pesada
            ? `${Fmt.kg(demanda.coletadoKg)} registrados. Estimativa do gerador: ${Fmt.kg(demanda.estimadoKg)}.`
            : `Informe a massa observada. O gerador estimou ${Fmt.kg(demanda.estimadoKg)}.`,
            !iniciada ? '' : pesada ? 'feito' : 'ativo',
            iniciada ? (
              <>
                <input type="number" min={1} value={pesoDigitado} onChange={e => setPesoDigitado(e.target.value)} />
                <button className="btn sec" onClick={() => {
                  const kg = Number(pesoDigitado);
                  if (!kg || kg <= 0) { recado('Informe um peso válido.'); return; }
                  try { Store.registrarPeso(demanda.id, kg, CanalRegistro.atual); recado(`${Fmt.kg(kg)} registrados.`); }
                  catch (erro) { recado((erro as Error).message); }
                }}>{pesada ? 'Corrigir' : 'Salvar'}</button>
              </>
            ) : null)}

          {passo(3, 'Adicionar foto', fotografada ? 'Evidência anexada à demanda.' : 'Registro fotográfico da carga (opcional, fortalece a prova).',
            !iniciada ? '' : fotografada ? 'feito' : 'ativo',
            iniciada ? (
              <>
                {fotografada
                  ? (demanda.foto!.startsWith('data:')
                    ? // eslint-disable-next-line @next/next/no-img-element
                    <img className="foto" src={demanda.foto!} alt="Registro fotográfico da carga" />
                    : <span className="foto-vazia">foto demonstrativa</span>)
                  : <span className="foto-vazia">sem foto</span>}
                <input type="file" accept="image/*" hidden id={`campoFoto-${demanda.id}`} onChange={aoEscolherFoto} />
                <button className="btn sec" onClick={() => document.getElementById(`campoFoto-${demanda.id}`)?.click()}>{fotografada ? 'Trocar' : 'Anexar'}</button>
              </>
            ) : null)}

          {passo(4, 'Fechar a carga', `Ao finalizar, a carga segue para ${demanda.destino.nome}, que pesa e confirma.`,
            pesada && iniciada ? 'ativo' : '',
            <button className="btn" disabled={!(pesada && iniciada)} onClick={() => {
              try { const d = Store.finalizarColeta(demanda.id); recado(`Carga a caminho de ${d.destino.nome}. Agora quem confirma é quem recebe.`); }
              catch (erro) { recado((erro as Error).message); }
            }}>Enviar ao destino</button>)}
        </ol>
      } />
  );
}

/* Leitura plausível da balança, estável por demanda: a demonstração não muda
   de valor a cada redesenho, e algumas cargas caem fora da tolerância de
   propósito. */
function leituraSugerida(demanda: TDemanda): number {
  const semente = [...demanda.id].reduce((soma, letra) => soma + letra.charCodeAt(0), 0);
  const desvio = ((semente % 17) - 6) / 100;
  return Math.max(1, Math.round((demanda.coletadoKg || 0) * (1 + desvio)));
}

function AcoesDestinatario({ demanda, recado }: { demanda: TDemanda; recado: (t: string) => void }) {
  const minha = demanda.destino && demanda.destino.id === Sessao.destino.id;
  const [recebido, setRecebido] = useState(() => String(leituraSugerida(demanda)));
  const [rejeito, setRejeito] = useState('');
  const [destinoFinal, setDestinoFinal] = useState('');
  const [lote, setLote] = useState('');
  const [nota, setNota] = useState('');

  if (demanda.status === 'COLETADA' && minha) {
    const unidade = Catalogo.destino(demanda.destino.id)!;
    const leitura = Number(recebido) || leituraSugerida(demanda);
    const residuo = Catalogo.residuo(demanda.residuo)!;
    const rejeitoSugerido = rejeito !== '' ? Number(rejeito) : (unidade.aterro ? leitura : Math.round(leitura * residuo.perdaTriagem));

    return (
      <Cartao titulo="Confirmar recebimento" sub={`${demanda.catador ? demanda.catador.nome : 'Catador'} declarou ${Fmt.kg(demanda.coletadoKg)} em campo`} classe="acao-viva"
        corpo={
          <>
            <Aviso titulo="Você é o ponto final deste ciclo" texto="O comprovante só existe depois que esta unidade confirmar o que entrou na balança e o que foi feito do material." />
            <div className="form">
              <div>
                <label className="rot" htmlFor="campoRecebido">Massa na balança (kg)</label>
                <input type="number" id="campoRecebido" min={1} value={recebido} onChange={e => setRecebido(e.target.value)} />
                <div className="ajuda">Declarado pelo catador: {Fmt.kg(demanda.coletadoKg)}. Diferença acima de {Fmt.percentual(TOLERANCIA * 100, 0)} abre pendência.</div>
              </div>
              <div>
                <label className="rot" htmlFor="campoRejeito">Rejeito para o aterro (kg)</label>
                <input type="number" id="campoRejeito" min={0} value={rejeitoSugerido} readOnly={unidade.aterro} onChange={e => setRejeito(e.target.value)} />
                <div className="ajuda">{unidade.aterro
                  ? 'Esta unidade é disposição final: toda a carga é contabilizada como aterrada.'
                  : `O que a triagem não aproveita segue para o aterro. Perda típica deste material: ${Fmt.percentual(residuo.perdaTriagem * 100, 0)}.`}</div>
              </div>
              <div>
                <label className="rot" htmlFor="campoDestinoFinal">Destino dado ao material</label>
                <input type="text" id="campoDestinoFinal" value={destinoFinal || unidade.destinoFinal} onChange={e => setDestinoFinal(e.target.value)} />
              </div>
              <div>
                <label className="rot" htmlFor="campoLote">Lote interno (opcional)</label>
                <input type="text" id="campoLote" placeholder="gerado automaticamente" value={lote} onChange={e => setLote(e.target.value)} />
              </div>
              <div className="largo">
                <label className="rot" htmlFor="campoNotaDestino">Observação da portaria (opcional)</label>
                <input type="text" id="campoNotaDestino" placeholder="Carga íntegra, material segregado, tíquete 4471..." value={nota} onChange={e => setNota(e.target.value)} />
              </div>
            </div>
            <div className="acoes-form">
              <button className="btn" onClick={() => {
                const kg = leitura;
                if (!kg || kg <= 0) { recado('Informe a massa pesada na balança.'); return; }
                try {
                  const d = Store.receber(demanda.id, { kg, rejeitoKg: rejeitoSugerido, destinoFinal: destinoFinal || unidade.destinoFinal, lote, nota });
                  recado(d.status === 'PENDENCIA'
                    ? 'Divergência acima da tolerância: pendência aberta para a Prefeitura.'
                    : `Recebimento confirmado. ${Fmt.kg(Demanda.reciclado(d))} recuperados e comprovante emitido.`);
                } catch (erro) { recado((erro as Error).message); }
              }}>Confirmar recebimento</button>
              <span className="ajuda">O peso do catador nunca é apagado: os dois registros ficam na trilha.</span>
            </div>
          </>
        } />
    );
  }

  if (demanda.status === 'COMPROVADA') return <BlocoComprovado demanda={demanda} />;
  if (!minha) return <Cartao corpo={<Aviso titulo="Outra unidade recebe esta carga" texto={`Destino desta demanda: ${demanda.destino ? demanda.destino.nome : '—'}.`} />} />;
  return <Esperando demanda={demanda} />;
}

function AcoesPrefeitura({ demanda, recado }: { demanda: TDemanda; recado: (t: string) => void }) {
  const [conciliado, setConciliado] = useState(() => String(demanda.verificadoKg ?? ''));
  const [nota, setNota] = useState('Tíquete de balança conferido pela fiscalização.');

  if (demanda.status === 'PENDENCIA') {
    return (
      <Cartao titulo="Conciliar divergência" sub={`Diferença de ${Fmt.percentual(Demanda.divergencia(demanda))} entre campo e balança do destino`} classe="acao-viva"
        corpo={
          <>
            <Aviso tom="problema" titulo="Os dois registros continuam válidos"
              texto={`O catador informou ${Fmt.kg(demanda.coletadoKg)} e ${demanda.destino.nome} pesou ${Fmt.kg(demanda.verificadoKg)}. Conciliar é decidir qual massa vale para o comprovante — nada é apagado.`} />
            <div className="form">
              <div>
                <label className="rot" htmlFor="campoConciliado">Massa aceita (kg)</label>
                <input type="number" id="campoConciliado" min={1} value={conciliado} onChange={e => setConciliado(e.target.value)} />
              </div>
              <div>
                <label className="rot" htmlFor="campoNota">Justificativa</label>
                <input type="text" id="campoNota" value={nota} onChange={e => setNota(e.target.value)} />
              </div>
            </div>
            <div className="acoes-form">
              <button className="btn" onClick={() => {
                const kg = Number(conciliado);
                if (!kg || kg <= 0) { recado('Informe a massa aceita.'); return; }
                try { Store.conciliar(demanda.id, { kgAceito: kg, nota }); recado('Divergência conciliada e comprovante emitido.'); }
                catch (erro) { recado((erro as Error).message); }
              }}>Conciliar e emitir comprovante</button>
              <span className="ajuda">A decisão entra na trilha com autoria e horário.</span>
            </div>
          </>
        } />
    );
  }
  if (demanda.status === 'COMPROVADA') return <BlocoComprovado demanda={demanda} />;
  return <Esperando demanda={demanda} />;
}

function BlocoMedicoes({ demanda }: { demanda: TDemanda }) {
  if (demanda.coletadoKg == null) return null;
  const divergencia = Demanda.divergencia(demanda);
  const dentro = Demanda.dentroDaTolerancia(demanda);
  const recebida = demanda.verificadoKg != null;

  return (
    <Cartao titulo="Registros da mesma carga" sub="O sistema não cria uma nova verdade: conecta as provas que existem."
      corpo={
        <>
          <div className="medicoes">
            <div className="medicao"><span className="quem">Gerador</span><b className="num">{Fmt.kg(demanda.estimadoKg)}</b><span className="origem">estimado</span></div>
            <div className="medicao"><span className="quem">Catador</span><b className="num">{Fmt.kg(demanda.coletadoKg)}</b><span className="origem">coletado em campo</span></div>
            <div className="medicao final"><span className="quem">Destinatário</span><b className="num">{Fmt.kg(demanda.verificadoKg)}</b>
              <span className="origem">{!recebida ? 'aguardando balança' : demanda.conciliada ? 'conciliado' : 'pesado na balança'}</span></div>
          </div>
          {recebida && (
            <>
              <div className={`divergencia ${dentro ? '' : 'acima'}`}>
                <b>Divergência de {Fmt.percentual(divergencia)}</b>
                <span>{dentro
                  ? `Dentro da tolerância de ${Fmt.percentual(TOLERANCIA * 100, 0)}. Comprovante emitido automaticamente.`
                  : `Acima da tolerância de ${Fmt.percentual(TOLERANCIA * 100, 0)}. A Prefeitura precisa conciliar antes do comprovante.`}</span>
              </div>
              <div className="destino-material">
                <span className="etiqueta">Destino dado ao material</span>
                <BarraRecuperacao ambiental={{ reciclado: Demanda.reciclado(demanda) || 0, rejeito: Demanda.rejeito(demanda) || 0, taxaRecuperacao: Demanda.taxaRecuperacao(demanda) }} />
                <p>{Demanda.destinoFinal(demanda)}</p>
              </div>
            </>
          )}
        </>
      } />
  );
}

function BlocoDados({ demanda }: { demanda: TDemanda }) {
  const ponto = Catalogo.ponto(demanda.ponto)!;
  const coop = demanda.catador ? Catalogo.cooperativa(demanda.catador.cooperativa) : null;

  return (
    <Cartao titulo="Dados da demanda" corpo={
      <>
        <div className="campos">
          <div className="campo"><div className="rot">Gerador</div><div className="val">{demanda.gerador.nome}
            <small>{Catalogo.gerador(demanda.gerador.id)?.cnpj || ''}</small></div></div>
          <div className="campo"><div className="rot">Resíduo</div><div className="val">{Catalogo.nomeResiduo(demanda.residuo)}</div></div>
          <div className="campo"><div className="rot">Quantidade estimada</div><div className="val num">{Fmt.kg(demanda.estimadoKg)}</div></div>
          <div className="campo"><div className="rot">Ponto de coleta</div><div className="val">{ponto.bairro}
            <small>{ponto.zona} · {ponto.acesso}</small></div></div>
          <div className="campo"><div className="rot">Prazo</div><div className="val">{Fmt.data(demanda.prazo)}<small>{Fmt.prazo(demanda.prazo)}</small></div></div>
          <div className="campo"><div className="rot">Catador responsável</div><div className="val">{demanda.catador ? demanda.catador.nome : '—'}
            <small>{demanda.catador ? (coop ? 'cooperado da ' + coop.nome : 'catador autônomo') : 'ainda sem atribuição'}</small></div></div>
          <div className="campo"><div className="rot">Destinatário</div><div className="val">{demanda.destino.nome}
            <small>{demanda.recebidaEm ? 'recebido em ' + Fmt.dataHora(demanda.recebidaEm) : 'ponto final do ciclo'}</small></div></div>
          <div className="campo"><div className="rot">Lote no destino</div><div className="val mono">{demanda.lote ? demanda.lote : '—'}
            <small>{demanda.lote ? 'registro interno da unidade' : 'gerado no recebimento'}</small></div></div>
        </div>
        {demanda.observacao && <Aviso titulo="Observação do gerador" texto={demanda.observacao} />}
      </>
    } />
  );
}

function BlocoTrilha({ demanda }: { demanda: TDemanda }) {
  return (
    <Cartao titulo="Trilha do ciclo" sub={`${demanda.eventos.length} registro(s), com autoria e horário`} classe="grudenta"
      corpo={
        <ol className="trilha">
          {demanda.eventos.slice().reverse().map((e, i) => (
            <li key={i} data-autor={e.autor}>
              <span className="quando">{Fmt.dataHora(e.quando)} · <span className="autor">{e.autor}</span></span>
              <b>{e.titulo}</b>
              <p>{e.detalhe}</p>
            </li>
          ))}
        </ol>
      } />
  );
}
