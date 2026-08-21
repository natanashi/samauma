'use client';

/* SAMAÚMA — cadastro de novos participantes.
   Três formulários, um por papel. Portado de `src/telas/cadastro.js` e
   `src/telas/acesso.js` (a tela de código recém-criado). */

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { CabecalhoPublico } from '@/components/layout/CabecalhoPublico';
import { Campo } from '@/components/cadastro/Campo';
import { useDominioPronto } from '@/components/layout/Bootstrap';
import { Aviso, Cartao } from '@/components/ui/Basicos';
import { COOPERATIVAS, RESIDUOS } from '@/lib/dominio/catalogo';
import { Cadastro } from '@/lib/dominio/cadastro';
import { Conta } from '@/lib/dominio/conta';
import { Fmt } from '@/lib/dominio/formato';
import { pontosDeCadastro, RAMOS, TIPOS_CADASTRO, TIPOS_UNIDADE, zonasDeCadastro } from '@/lib/dominio/formularios';
import { ICONES_PERFIL, PERFIS } from '@/lib/dominio/perfis';
import { Pgrs, soDigitos } from '@/lib/dominio/pgrs';
import { Sessao } from '@/lib/dominio/sessao';
import type { Catador, Destino, Gerador, TipoCadastro } from '@/lib/dominio/tipos';
import { useCadastroVersao, usePgrsVersao } from '@/state/hooks';

type ValorCampo = string | string[];
type Dados = Record<string, ValorCampo | undefined>;
type Registro = Gerador | Catador | Destino;
type AoMudar = (campo: string, valor: ValorCampo) => void;

function Opcoes({ lista }: { lista: string[] }) {
  return <>{lista.map(v => <option key={v} value={v}>{v}</option>)}</>;
}

function StatusPgrsCompleto({ cnpj }: { cnpj: string }) {
  usePgrsVersao();
  const chave = soDigitos(cnpj);
  const rascunho = chave ? Pgrs.obter(chave) : null;
  if (!rascunho) return null;
  return (
    <div className="largo pgrs-encontrado">
      <Aviso titulo="PGRS completo encontrado para este CNPJ"
        texto={`Vai ser anexado automaticamente ao concluir o cadastro · rascunho de ${Fmt.dataHora(rascunho.atualizadoEm)}.`} />
      <div className="acoes-form">
        <Link href={`/pgrs/gerar?cnpj=${chave}&retorno=cadastro`} className="btn sec sm">Corrigir PGRS antes de concluir</Link>
      </div>
    </div>
  );
}

function FormularioGerador({ d, e, aoMudar }: { d: Dados; e: Record<string, string>; aoMudar: AoMudar }) {
  return (
    <>
      <Campo id="cadNome" rotulo="Nome do estabelecimento" erro={e.nome} ajuda="Como o estabelecimento é conhecido."
        controle={<input type="text" id="cadNome" value={d.nome || ''} onChange={ev => aoMudar('nome', ev.target.value)} placeholder="Mercado Central de Porto Velho" />} />
      <Campo id="cadCnpj" rotulo="CNPJ" erro={e.cnpj} ajuda="Conferido com os dois dígitos verificadores."
        controle={<input type="text" id="cadCnpj" inputMode="numeric" value={d.cnpj || ''} onChange={ev => aoMudar('cnpj', ev.target.value)} placeholder="00.000.000/0001-00" />} />
      <Campo id="cadRamo" rotulo="Ramo de atividade" erro={e.ramo} ajuda="Define o perfil de resíduo esperado."
        controle={<select id="cadRamo" value={d.ramo || ''} onChange={ev => aoMudar('ramo', ev.target.value)}><option value="">Selecione…</option><Opcoes lista={RAMOS} /></select>} />
      <Campo id="cadVolume" rotulo="Volume estimado por mês (kg)" erro={e.volumeMes} ajuda="Serve para comparar o declarado com o efetivamente destinado."
        controle={<input type="number" id="cadVolume" min={1} step={50} value={d.volumeMes || ''} onChange={ev => aoMudar('volumeMes', ev.target.value)} placeholder="4000" />} />
      <Campo id="cadPonto" rotulo="Bairro do ponto de coleta" erro={e.ponto} ajuda="Bairros reais de Porto Velho; a coordenada é aproximada."
        controle={
          <select id="cadPonto" value={d.ponto || ''} onChange={ev => aoMudar('ponto', ev.target.value)}>
            <option value="">Selecione…</option>
            {pontosDeCadastro().map(p => <option key={p.id} value={p.id}>{p.bairro} · {p.zona}</option>)}
          </select>
        } />
      <Campo id="cadAcesso" rotulo="Como o catador acessa a carga" erro={e.acesso} ajuda="Aparece na tela do catador antes de ele sair."
        controle={<input type="text" id="cadAcesso" value={d.acesso || ''} onChange={ev => aoMudar('acesso', ev.target.value)} placeholder="Doca lateral · 7h às 12h" />} />
      <Campo id="cadOperador" rotulo="Operador contratado (opcional)" erro={e.operador} ajuda="Sem operador, a demanda fica disponível para qualquer catador."
        controle={
          <select id="cadOperador" value={d.operador || ''} onChange={ev => aoMudar('operador', ev.target.value)}>
            <option value="">Sem operador — vai para a fila aberta</option>
            {COOPERATIVAS.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        } />
      <Campo id="cadPgrs" rotulo="Número do PGRS (opcional)" erro={e.pgrsNumero} ajuda="Sem PGRS cadastrado, a situação começa como irregular — e o sistema explica o motivo."
        controle={<input type="text" id="cadPgrs" value={d.pgrsNumero || ''} onChange={ev => aoMudar('pgrsNumero', ev.target.value)} placeholder="PGRS 2026/0001" />} />
      <Campo id="cadPgrsValidade" rotulo="Dias até o vencimento do PGRS" erro={e.pgrsValidade} ajuda="Menos de 90 dias já aparece como alerta de regularização."
        controle={<input type="number" id="cadPgrsValidade" step={30} value={d.pgrsValidade ?? 365} onChange={ev => aoMudar('pgrsValidade', ev.target.value)} />} />
      <StatusPgrsCompleto cnpj={typeof d.cnpj === 'string' ? d.cnpj : ''} />
    </>
  );
}

function FormularioCatador({ d, e, aoMudar }: { d: Dados; e: Record<string, string>; aoMudar: AoMudar }) {
  return (
    <>
      <Campo id="cadNome" rotulo="Seu nome" erro={e.nome} ajuda="É o nome que aparece no comprovante da coleta."
        controle={<input type="text" id="cadNome" value={d.nome || ''} onChange={ev => aoMudar('nome', ev.target.value)} placeholder="Maria da Silva" />} />
      <Campo id="cadCooperativa" rotulo="Vínculo" erro={e.cooperativa} ajuda="O vínculo muda o que você enxerga da equipe, nunca o que você pode fazer."
        controle={
          <select id="cadCooperativa" value={d.cooperativa || ''} onChange={ev => aoMudar('cooperativa', ev.target.value)}>
            <option value="">Autônomo — sem vínculo com cooperativa</option>
            {COOPERATIVAS.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        } />
      <Campo id="cadVeiculo" rotulo="Veículo ou equipamento" erro={e.veiculo} ajuda="Ajuda a cooperativa a dimensionar a rota."
        controle={<input type="text" id="cadVeiculo" value={d.veiculo || ''} onChange={ev => aoMudar('veiculo', ev.target.value)} placeholder="Triciclo elétrico" />} />
      <Campo id="cadZona" rotulo="Zona onde você trabalha" erro={e.zona} ajuda="Usada para priorizar as demandas mais próximas."
        controle={<select id="cadZona" value={d.zona || ''} onChange={ev => aoMudar('zona', ev.target.value)}><option value="">Selecione…</option><Opcoes lista={zonasDeCadastro()} /></select>} />
      <Campo id="cadMeta" rotulo="Meta semanal (kg)" erro={e.metaSemanal} ajuda="Combinada com a organização; aparece no seu painel."
        controle={<input type="number" id="cadMeta" min={1} step={100} value={d.metaSemanal ?? 1200} onChange={ev => aoMudar('metaSemanal', ev.target.value)} />} />
    </>
  );
}

function FormularioDestino({ d, e, aoMudar }: { d: Dados; e: Record<string, string>; aoMudar: AoMudar }) {
  const aceita: string[] = (Array.isArray(d.aceita) ? d.aceita : []);
  const alternarAceita = (id: string) => {
    aoMudar('aceita', aceita.includes(id) ? aceita.filter(a => a !== id) : [...aceita, id]);
  };
  return (
    <>
      <Campo id="cadNome" rotulo="Nome da unidade" erro={e.nome} ajuda="Aparece no comprovante como quem recebeu a carga."
        controle={<input type="text" id="cadNome" value={d.nome || ''} onChange={ev => aoMudar('nome', ev.target.value)} placeholder="Galpão de Triagem Vila Nova" />} />
      <Campo id="cadTipoUnidade" rotulo="Tipo de unidade" erro={e.tipoUnidade} ajuda="Disposição final marca a unidade como aterro: tudo que entra é rejeito."
        controle={<select id="cadTipoUnidade" value={d.tipoUnidade || ''} onChange={ev => aoMudar('tipoUnidade', ev.target.value)}><option value="">Selecione…</option><Opcoes lista={TIPOS_UNIDADE} /></select>} />
      <Campo id="cadCooperativa" rotulo="Cooperativa responsável (opcional)" erro={e.cooperativa} ajuda="Só para unidades operadas por organização de catadores."
        controle={
          <select id="cadCooperativa" value={d.cooperativa || ''} onChange={ev => aoMudar('cooperativa', ev.target.value)}>
            <option value="">Sem vínculo com cooperativa</option>
            {COOPERATIVAS.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        } />
      <Campo id="cadLicenca" rotulo="Licença de operação" erro={e.licenca} ajuda="Consta no relatório e no comprovante de destinação."
        controle={<input type="text" id="cadLicenca" value={d.licenca || ''} onChange={ev => aoMudar('licenca', ev.target.value)} placeholder="LO 0000/2026" />} />
      <Campo id="cadCapacidade" rotulo="Capacidade diária (kg)" erro={e.capacidadeDiaria} ajuda="É o que limita quanto trabalho o sistema pode prometer à sua unidade."
        controle={<input type="number" id="cadCapacidade" min={1} step={500} value={d.capacidadeDiaria ?? 5000} onChange={ev => aoMudar('capacidadeDiaria', ev.target.value)} />} />
      <Campo id="cadPonto" rotulo="Bairro da unidade" erro={e.ponto}
        controle={
          <select id="cadPonto" value={d.ponto || ''} onChange={ev => aoMudar('ponto', ev.target.value)}>
            <option value="">Selecione…</option>
            {pontosDeCadastro().map(p => <option key={p.id} value={p.id}>{p.bairro} · {p.zona}</option>)}
          </select>
        } />
      <Campo id="cadDestinoFinal" rotulo="Destinação declarada" erro={e.destinoFinal} ajuda="É o que a unidade declara fazer com o material recebido."
        controle={<input type="text" id="cadDestinoFinal" value={d.destinoFinal || ''} onChange={ev => aoMudar('destinoFinal', ev.target.value)} placeholder="Reciclagem, com rejeito encaminhado ao aterro" />} />
      <div className={`largo ${e.aceita ? 'com-erro' : ''}`}>
        <span className="rot">Materiais aceitos</span>
        <div className="materiais">
          {RESIDUOS.map(r => (
            <label className="marca-material" key={r.id}>
              <input type="checkbox" checked={aceita.includes(r.id)} onChange={() => alternarAceita(r.id)} />
              <span><i className="ponto-cor" style={{ ['--cor' as string]: r.cor }}></i>{r.nome}</span>
            </label>
          ))}
        </div>
        {e.aceita ? <div className="erro-campo" role="alert">{e.aceita}</div>
          : <div className="ajuda">O material define quais demandas serão encaminhadas para esta unidade.</div>}
      </div>
    </>
  );
}

function PaginaCadastroConteudo() {
  const pronto = useDominioPronto();
  useCadastroVersao();
  usePgrsVersao();
  const router = useRouter();
  const busca = useSearchParams();
  const tipo = busca.get('tipo') as TipoCadastro | null;
  const cnpjQuery = busca.get('cnpj');

  const [dados, setDados] = useState<Dados>(() => (tipo === 'gerador' && cnpjQuery) ? { cnpj: Cadastro.formatarCnpj(cnpjQuery) } : {});
  const [erros, setErros] = useState<Record<string, string>>({});
  const [concluido, setConcluido] = useState<{ registro: Registro; papel: string; tipoConta: TipoCadastro } | null>(null);
  const [pulouPgrs, setPulouPgrs] = useState(false);

  if (!pronto) return null;

  if (concluido) {
    const { registro, papel } = concluido;
    return (
      <section className="portao" role="dialog" aria-modal="true">
        <div className="portao-caixa">
        <CabecalhoPublico />
          <div className="portao-grade modo-cadastro">
            <div className="cadastro-topo">
              <span className="cadastro-papel">CADASTRO CONCLUÍDO</span>
              <h2>{registro.nome}</h2>
              <p>Guarde o código abaixo: é com ele que você volta ao sistema neste navegador.</p>
            </div>
            <Cartao classe="cartao-codigo" corpo={
              <>
                <div className="codigo-destaque">
                  <span>Seu código de acesso</span>
                  <b className="codigo-acesso">{registro.codigo}</b>
                  <small>{papel}{'cnpj' in registro ? ' · ou entre com o CNPJ ' + registro.cnpj : ''}</small>
                </div>
                <div className="acoes-form">
                  <button className="btn" onClick={() => entrarNaConta(concluido)}>Entrar no sistema</button>
                  <button className="btn sec" onClick={() => {
                    if (navigator.clipboard) navigator.clipboard.writeText(registro.codigo!).catch(() => {});
                  }}>Copiar código</button>
                </div>
              </>
            } />
            <Aviso titulo="Anote antes de continuar"
              texto="O código fica guardado neste navegador e pode ser recuperado em “Esqueci meu código”. Se você limpar os dados do navegador ou usar outro aparelho, o cadastro se perde — é a limitação de um protótipo sem servidor." />
          </div>
        </div>
      </section>
    );
  }

  function entrarNaConta(c: { registro: Registro; tipoConta: TipoCadastro }) {
    const perfilConta = c.tipoConta === 'destino' ? 'cooperativa' : c.tipoConta;
    Conta.entrarComConta({ tipo: c.tipoConta, perfil: perfilConta, registro: c.registro });
    if (c.tipoConta === 'gerador') Sessao.entrarComoGerador(c.registro.id);
    if (c.tipoConta === 'catador') Sessao.entrarComoCatador(c.registro.id);
    if (c.tipoConta === 'destino') Sessao.entrarComoDestino(c.registro.id);
    router.push(`/${perfilConta}/${PERFIS[perfilConta].abas[0].id}`);
  }

  if (!tipo) {
    return (
      <section className="portao" role="dialog" aria-modal="true">
        <div className="portao-caixa">
          <div className="portao-grade modo-cadastro">
            <div className="cadastro-topo">
              <Link href="/" className="voltar">Voltar para a entrada</Link>
              <h2>Criar cadastro</h2>
              <p>Quem se cadastra passa a existir para todo o sistema: publica demanda, aceita coleta ou recebe carga já no mesmo acesso.</p>
            </div>
            <div className="cadastro-portas">
              {(Object.keys(TIPOS_CADASTRO) as TipoCadastro[]).map(id => {
                const t = TIPOS_CADASTRO[id];
                return (
                  <article className="porta" style={{ ['--cor-perfil' as string]: t.cor }} key={id}>
                    <span className="porta-icone" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"
                        dangerouslySetInnerHTML={{ __html: ICONES_PERFIL[id === 'destino' ? 'cooperativa' : id] }} />
                    </span>
                    <h2>{t.nome}</h2>
                    <p>{t.resumo}</p>
                    <ul className="porta-itens">{t.itens.map((i, k) => <li key={k}>{i}</li>)}</ul>
                    <div className="porta-acoes">
                      <button className="btn" onClick={() => router.push(`/cadastro?tipo=${id}`)}>
                        Cadastrar {t.nome.toLowerCase()} <span className="seta">→</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
            <Aviso titulo="Cadastro demonstrativo, sem senha"
              texto="Nada aqui sai deste navegador e nenhum dado é verificado em base oficial. Em produção, a identificação viria do login único do Município ou do Gov.br, e este formulário seria a segunda etapa, depois de identificada a pessoa." />
          </div>
        </div>
      </section>
    );
  }

  const t = TIPOS_CADASTRO[tipo];
  const quantos = Object.keys(erros).length;

  const aoMudar: AoMudar = (campo, valor) => {
    setDados(d => ({ ...d, [campo]: valor }));
  };

  function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    const { registro, erros: novosErros } = Cadastro.criar(tipo!, dados as Record<string, ValorCampo>);
    if (!registro) { setErros(novosErros); return; }
    const papel = ({ gerador: 'Gerador', catador: 'Catador', destino: 'Unidade receptora' } as Record<TipoCadastro, string>)[tipo!];
    setConcluido({ registro, papel, tipoConta: tipo! });
  }

  if (tipo === 'gerador' && !dados.cnpj && !pulouPgrs) {
    return (
      <section className="portao" role="dialog" aria-modal="true">
        <div className="portao-caixa">
          <div className="portao-grade modo-cadastro">
            <div className="cadastro-topo" style={{ ['--cor-perfil' as string]: t.cor }}>
              <button className="voltar" onClick={() => router.push('/cadastro')}>Escolher outro papel</button>
              <span className="cadastro-papel">{t.papel}</span>
              <h2>Cadastro de gerador</h2>
              <p>Se o estabelecimento é um grande gerador de resíduo de serviço de saúde, monte o PGRS completo
                agora — ou pule esta etapa e cadastre o essencial primeiro.</p>
            </div>
            <div className="colunas duas">
              <Cartao classe="acao-viva" titulo="Fazer o PGRS agora" sub="Recomendado para clínicas, hospitais e laboratórios"
                corpo={
                  <>
                    <p className="texto">Preenche identificação, classificação e manejo dos resíduos num formulário completo.
                      Ao voltar aqui, o plano já vem anexado ao CNPJ informado — pronto em PDF e Word.</p>
                    <button className="btn" type="button" onClick={() => router.push('/pgrs/gerar?retorno=cadastro')}>
                      Preencher PGRS completo
                    </button>
                  </>
                } />
              <Cartao titulo="Pular esta etapa" sub="Dá para enviar depois, em Documentos"
                corpo={
                  <>
                    <p className="texto">Segue direto para os dados do estabelecimento. Sem PGRS, a situação regulatória
                      começa como irregular — o sistema explica o motivo.</p>
                    <button className="btn sec" type="button" onClick={() => setPulouPgrs(true)}>Pular e continuar cadastro</button>
                  </>
                } />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="portao" role="dialog" aria-modal="true">
      <div className="portao-caixa">
        <div className="portao-grade modo-cadastro">
          <div className="cadastro-topo" style={{ ['--cor-perfil' as string]: t.cor }}>
            <button className="voltar" onClick={() => router.push('/cadastro')}>Escolher outro papel</button>
            <span className="cadastro-papel">{t.papel}</span>
            <h2>Cadastro de {t.nome.toLowerCase()}</h2>
            <p>{t.resumo}</p>
          </div>

          {quantos > 0 && <Aviso titulo="Confira antes de continuar" tom="problema"
            texto={`${quantos} campo(s) precisam de correção. O que falta está marcado abaixo.`} />}

          <Cartao classe="cartao-cadastro" corpo={
            <form className="form" onSubmit={enviar} noValidate>
              {tipo === 'gerador' && <FormularioGerador d={dados} e={erros} aoMudar={aoMudar} />}
              {tipo === 'catador' && <FormularioCatador d={dados} e={erros} aoMudar={aoMudar} />}
              {tipo === 'destino' && <FormularioDestino d={dados} e={erros} aoMudar={aoMudar} />}
              <div className="largo acoes-form">
                <button className="btn" type="submit">Concluir cadastro e entrar</button>
                <Link href="/" className="btn sec">Cancelar</Link>
                <span className="ajuda">Ao concluir, você entra no sistema já como {t.nome.toLowerCase()}.</span>
              </div>
            </form>
          } />
        </div>
      </div>
    </section>
  );
}

export default function PaginaCadastro() {
  return (
    <Suspense fallback={null}>
      <PaginaCadastroConteudo />
    </Suspense>
  );
}
