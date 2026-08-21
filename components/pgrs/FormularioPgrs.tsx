'use client';

/* SAMAÚMA — formulário completo do gerador padrão de PGRS (Plano de
   Gerenciamento de Resíduos de Serviços de Saúde). Segue o roteiro do
   modelo municipal, seção por seção, com tabelas editáveis onde o modelo
   impresso é uma lista de linhas. Controlado: quem usa este componente guarda
   `DadosPgrs` e recebe de volta a versão atualizada a cada mudança. */

import { Campo } from '@/components/cadastro/Campo';
import { Cartao } from '@/components/ui/Basicos';
import {
  GRUPOS_MANEJADOS, GRUPOS_RESIDUO, novoIdPgrs,
  type DadosPgrs, type GrupoManejado, type PgrsAbrigoExterno, type PgrsAbrigoTemporario, type PgrsGrupoResiduo,
  type PgrsIdentificacao
} from '@/lib/dominio/pgrs';

type Atualizar = (proximo: DadosPgrs) => void;

function atualizarLinha<T extends { id: string }>(lista: T[], id: string, chave: keyof T, valor: string): T[] {
  return lista.map(item => (item.id === id ? { ...item, [chave]: valor } : item));
}

function Texto({ id, rotulo, valor, aoMudar, placeholder, largo, ajuda }: {
  id: string; rotulo: string; valor: string; aoMudar: (v: string) => void; placeholder?: string; largo?: boolean; ajuda?: string;
}) {
  return (
    <Campo id={id} rotulo={rotulo} largo={largo} ajuda={ajuda}
      controle={<input type="text" id={id} value={valor} placeholder={placeholder} onChange={ev => aoMudar(ev.target.value)} />} />
  );
}

function TabelaEditavel<T extends { id: string }>({ colunas, linhas, aoMudarCampo, aoAdicionar, aoRemover, rotuloAdicionar = '+ Adicionar linha' }: {
  colunas: { chave: Exclude<keyof T, 'id'>; rotulo: string; placeholder?: string }[];
  linhas: T[];
  aoMudarCampo: (id: string, chave: Exclude<keyof T, 'id'>, valor: string) => void;
  aoAdicionar: () => void;
  aoRemover: (id: string) => void;
  rotuloAdicionar?: string;
}) {
  return (
    <div className="tabela-editavel">
      <div className="tabela-rolagem">
        <table>
          <thead>
            <tr>{colunas.map(c => <th key={String(c.chave)}>{c.rotulo}</th>)}<th aria-hidden="true"></th></tr>
          </thead>
          <tbody>
            {linhas.map(linha => (
              <tr key={linha.id}>
                {colunas.map(c => (
                  <td key={String(c.chave)}>
                    <input type="text" value={String(linha[c.chave] ?? '')} placeholder={c.placeholder}
                      aria-label={c.rotulo}
                      onChange={ev => aoMudarCampo(linha.id, c.chave, ev.target.value)} />
                  </td>
                ))}
                <td className="acao">
                  <button type="button" className="btn fantasma sm" onClick={() => aoRemover(linha.id)} disabled={linhas.length <= 1}>Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="btn sec sm" onClick={aoAdicionar}>{rotuloAdicionar}</button>
    </div>
  );
}

export function FormularioPgrs({ dados, aoMudar }: { dados: DadosPgrs; aoMudar: Atualizar }) {
  const set = <K extends keyof DadosPgrs>(chave: K, valor: DadosPgrs[K]) => aoMudar({ ...dados, [chave]: valor });

  const setIdent = (campo: keyof PgrsIdentificacao, valor: string) =>
    set('identificacao', { ...dados.identificacao, [campo]: valor } as DadosPgrs['identificacao']);

  const setGrupoResiduo = (id: 'A' | 'B' | 'C' | 'D' | 'E', campo: keyof PgrsGrupoResiduo, valor: string) =>
    set('classificacaoResiduos', { ...dados.classificacaoResiduos, [id]: { ...dados.classificacaoResiduos[id], [campo]: valor } });

  const setColetaInterna = (fase: 'fonteParaTemporario' | 'temporarioParaExterno', grupo: GrupoManejado, valor: string) =>
    set('coletaInterna', { ...dados.coletaInterna, [fase]: { ...dados.coletaInterna[fase], [grupo]: valor } });

  const setArmazenamentoTemporario = (grupo: GrupoManejado, campo: keyof PgrsAbrigoTemporario, valor: string) =>
    set('armazenamentoTemporario', { ...dados.armazenamentoTemporario, [grupo]: { ...dados.armazenamentoTemporario[grupo], [campo]: valor } as PgrsAbrigoTemporario });

  const setArmazenamentoExterno = (grupo: GrupoManejado, campo: keyof PgrsAbrigoExterno, valor: string) =>
    set('armazenamentoExterno', { ...dados.armazenamentoExterno, [grupo]: { ...dados.armazenamentoExterno[grupo], [campo]: valor } });

  return (
    <div className="pgrs-secoes">
      <Cartao titulo="2 — Identificação do estabelecimento" corpo={
        <div className="form">
          <Texto id="pgrsRazao" rotulo="Razão social" valor={dados.identificacao.razaoSocial} aoMudar={v => setIdent('razaoSocial', v)} />
          <Texto id="pgrsFantasia" rotulo="Nome fantasia" valor={dados.identificacao.nomeFantasia} aoMudar={v => setIdent('nomeFantasia', v)} />
          <Texto id="pgrsCnpj" rotulo="CNPJ" valor={dados.identificacao.cnpj} aoMudar={v => setIdent('cnpj', v)} placeholder="00.000.000/0001-00" />
          <Campo id="pgrsPropriedade" rotulo="Quanto à propriedade" controle={
            <select id="pgrsPropriedade" value={dados.identificacao.propriedade} onChange={ev => setIdent('propriedade', ev.target.value)}>
              <option value="">Selecione…</option>
              <option value="Público">Público</option>
              <option value="Privado">Privado</option>
            </select>
          } />
          <Texto id="pgrsEndereco" rotulo="Endereço" valor={dados.identificacao.endereco} aoMudar={v => setIdent('endereco', v)} largo />
          <Texto id="pgrsFone" rotulo="Fone/Fax" valor={dados.identificacao.foneFax} aoMudar={v => setIdent('foneFax', v)} />
          <Texto id="pgrsHorario" rotulo="Horário de funcionamento" valor={dados.identificacao.horarioFuncionamento} aoMudar={v => setIdent('horarioFuncionamento', v)} />
          <Texto id="pgrsTipoEstab" rotulo="Tipo de estabelecimento" valor={dados.identificacao.tipoEstabelecimento} aoMudar={v => setIdent('tipoEstabelecimento', v)} />
          <Texto id="pgrsMunicipio" rotulo="Município/UF" valor={dados.identificacao.municipioUf} aoMudar={v => setIdent('municipioUf', v)} />
          <Texto id="pgrsRespTecnico" rotulo="Responsável técnico pelo estabelecimento" valor={dados.identificacao.responsavelTecnico}
            aoMudar={v => setIdent('responsavelTecnico', v)} largo />
        </div>
      } />

      <Cartao titulo="3 — Caracterização do estabelecimento" corpo={
        <>
          <p className="pgrs-subtitulo">3.1 Recursos pessoais</p>
          <TabelaEditavel
            colunas={[
              { chave: 'funcao', rotulo: 'Função' },
              { chave: 'quantidade', rotulo: 'Nº de funcionários' },
              { chave: 'tipoContrato', rotulo: 'Tipo de contrato', placeholder: 'CLT, terceirizado, estatutário…' }
            ]}
            linhas={dados.recursosPessoais}
            aoMudarCampo={(id, chave, valor) => set('recursosPessoais', atualizarLinha(dados.recursosPessoais, id, chave, valor))}
            aoAdicionar={() => set('recursosPessoais', [...dados.recursosPessoais, { id: novoIdPgrs('rp'), funcao: '', quantidade: '', tipoContrato: '' }])}
            aoRemover={id => set('recursosPessoais', dados.recursosPessoais.filter(r => r.id !== id))}
          />
          <p className="pgrs-subtitulo">3.2 Edificação</p>
          <div className="form">
            <Texto id="pgrsAreaTerreno" rotulo="Área total do terreno (m²)" valor={dados.edificacao.areaTerreno}
              aoMudar={v => set('edificacao', { ...dados.edificacao, areaTerreno: v })} />
            <Texto id="pgrsQtdPredios" rotulo="Quantidade de prédios" valor={dados.edificacao.qtdPredios}
              aoMudar={v => set('edificacao', { ...dados.edificacao, qtdPredios: v })} />
            <Texto id="pgrsQtdSalas" rotulo="Quantidade de salas" valor={dados.edificacao.qtdSalas}
              aoMudar={v => set('edificacao', { ...dados.edificacao, qtdSalas: v })} />
            <Texto id="pgrsAreaConstruida" rotulo="Área total construída (m²)" valor={dados.edificacao.areaConstruida}
              aoMudar={v => set('edificacao', { ...dados.edificacao, areaConstruida: v })} />
          </div>
        </>
      } />

      <Cartao titulo="4 — Caracterização das especialidades e serviços"
        sub="Tipos e quantidade de ambientes geradores de resíduos dentro do estabelecimento."
        corpo={
          <TabelaEditavel
            colunas={[{ chave: 'descricao', rotulo: 'Descrição dos ambientes' }, { chave: 'quantidade', rotulo: 'Quantidade' }]}
            linhas={dados.ambientes}
            aoMudarCampo={(id, chave, valor) => set('ambientes', atualizarLinha(dados.ambientes, id, chave, valor))}
            aoAdicionar={() => set('ambientes', [...dados.ambientes, { id: novoIdPgrs('amb'), descricao: '', quantidade: '' }])}
            aoRemover={id => set('ambientes', dados.ambientes.filter(a => a.id !== id))}
          />
        } />

      <Cartao titulo="5 — Caracterização dos aspectos ambientais" corpo={
        <>
          <TabelaEditavel
            colunas={[
              { chave: 'local', rotulo: 'Local de geração do resíduo' },
              { chave: 'residuo', rotulo: 'Descrição do resíduo' },
              { chave: 'classificacao', rotulo: 'Classificação/Grupo' }
            ]}
            linhas={dados.aspectosAmbientais}
            aoMudarCampo={(id, chave, valor) => set('aspectosAmbientais', atualizarLinha(dados.aspectosAmbientais, id, chave, valor))}
            aoAdicionar={() => set('aspectosAmbientais', [...dados.aspectosAmbientais, { id: novoIdPgrs('asp'), local: '', residuo: '', classificacao: '' }])}
            aoRemover={id => set('aspectosAmbientais', dados.aspectosAmbientais.filter(a => a.id !== id))}
          />
          <p className="pgrs-subtitulo">5.1 Abastecimento de água</p>
          <div className="form">
            <Texto id="pgrsAguaFonte" rotulo="Rede pública ou solução alternativa" valor={dados.abastecimentoAgua.fonte}
              aoMudar={v => set('abastecimentoAgua', { ...dados.abastecimentoAgua, fonte: v })} />
            <Texto id="pgrsAguaObs" rotulo="Observações sobre o tratamento" valor={dados.abastecimentoAgua.observacoes}
              aoMudar={v => set('abastecimentoAgua', { ...dados.abastecimentoAgua, observacoes: v })} />
          </div>
          <p className="pgrs-subtitulo">5.2 Efluentes líquidos</p>
          <div className="form">
            <Texto id="pgrsEfluenteDestino" rotulo="Destino dos efluentes" valor={dados.efluentes.destino}
              aoMudar={v => set('efluentes', { ...dados.efluentes, destino: v })} />
            <Texto id="pgrsEfluenteObs" rotulo="Observações sobre tratamento" valor={dados.efluentes.observacoes}
              aoMudar={v => set('efluentes', { ...dados.efluentes, observacoes: v })} />
          </div>
        </>
      } />

      <Cartao titulo="6 — Classificação dos resíduos" sub="Descreva cada grupo gerado e o peso estimado." corpo={
        <>
          {GRUPOS_RESIDUO.map(g => (
            <div key={g.id}>
              <p className="pgrs-grupo-titulo">{g.nome}</p>
              <div className="form">
                <Texto id={`pgrsGrupo${g.id}Desc`} rotulo="Descrição" valor={dados.classificacaoResiduos[g.id].descricao}
                  aoMudar={v => setGrupoResiduo(g.id, 'descricao', v)} largo />
                <Texto id={`pgrsGrupo${g.id}Peso`} rotulo="Peso estimado" valor={dados.classificacaoResiduos[g.id].pesoEstimado}
                  aoMudar={v => setGrupoResiduo(g.id, 'pesoEstimado', v)} placeholder="kg/mês" />
              </div>
            </div>
          ))}
        </>
      } />

      <Cartao titulo="7 — Segregação, acondicionamento e identificação"
        sub="Ações realizadas no local de geração dos resíduos." corpo={
          <TabelaEditavel
            colunas={[
              { chave: 'local', rotulo: 'Local' },
              { chave: 'residuo', rotulo: 'Resíduo gerado' },
              { chave: 'grupo', rotulo: 'Grupo' },
              { chave: 'estadoFisico', rotulo: 'Estado físico' },
              { chave: 'segregacaoOrigem', rotulo: 'Segregação na origem' },
              { chave: 'coletaTransporte', rotulo: 'Coleta e transporte' }
            ]}
            linhas={dados.segregacao}
            aoMudarCampo={(id, chave, valor) => set('segregacao', atualizarLinha(dados.segregacao, id, chave, valor))}
            aoAdicionar={() => set('segregacao', [...dados.segregacao, {
              id: novoIdPgrs('seg'), local: '', residuo: '', grupo: '', estadoFisico: '', segregacaoOrigem: '', coletaTransporte: ''
            }])}
            aoRemover={id => set('segregacao', dados.segregacao.filter(s => s.id !== id))}
          />
        } />

      <Cartao titulo="8 — Coleta interna" corpo={
        <>
          <p className="pgrs-subtitulo">Da fonte de geração para o armazenamento temporário</p>
          <div className="form">
            {GRUPOS_MANEJADOS.map(g => (
              <Texto key={g} id={`pgrsColetaFonte${g}`} rotulo={`Grupo ${g}`} largo
                valor={dados.coletaInterna.fonteParaTemporario[g]} aoMudar={v => setColetaInterna('fonteParaTemporario', g, v)}
                placeholder="Como é recolhido e encaminhado, conforme rotina do serviço" />
            ))}
          </div>
          <p className="pgrs-subtitulo">Do abrigo temporário para o abrigo externo</p>
          <div className="form">
            {GRUPOS_MANEJADOS.map(g => (
              <Texto key={g} id={`pgrsColetaAbrigo${g}`} rotulo={`Grupo ${g}`} largo
                valor={dados.coletaInterna.temporarioParaExterno[g]} aoMudar={v => setColetaInterna('temporarioParaExterno', g, v)}
                placeholder="Como é manejado, conforme rotina do serviço" />
            ))}
          </div>
        </>
      } />

      <Cartao titulo="9 — Armazenamento temporário" sub="Guarda temporária dos recipientes já acondicionados." corpo={
        <>
          {(['B', 'A', 'E', 'D'] as GrupoManejado[]).map(g => (
            <div key={g}>
              <p className="pgrs-grupo-titulo">Grupo {g}</p>
              <div className="form">
                <Texto id={`pgrsArmTempAbrigo${g}`} rotulo="Abrigo" valor={dados.armazenamentoTemporario[g].abrigo}
                  aoMudar={v => setArmazenamentoTemporario(g, 'abrigo', v)} />
                <Texto id={`pgrsArmTempRevest${g}`} rotulo="Revestimento" valor={dados.armazenamentoTemporario[g].revestimento}
                  aoMudar={v => setArmazenamentoTemporario(g, 'revestimento', v)} placeholder="Aço, ferro, inox, madeira…" />
                <Campo id={`pgrsArmTempExclusivo${g}`} rotulo="Exclusivo para RSS" controle={
                  <select id={`pgrsArmTempExclusivo${g}`} value={dados.armazenamentoTemporario[g].exclusivoRss}
                    onChange={ev => setArmazenamentoTemporario(g, 'exclusivoRss', ev.target.value)}>
                    <option value="">Selecione…</option>
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                  </select>
                } />
              </div>
            </div>
          ))}
        </>
      } />

      <Cartao titulo="10 — Armazenamento externo" sub="Guarda dos recipientes até a coleta externa." corpo={
        <>
          {(['D', 'A', 'B', 'E'] as GrupoManejado[]).map(g => (
            <div key={g}>
              <p className="pgrs-grupo-titulo">Grupo {g}</p>
              <div className="form">
                <Texto id={`pgrsArmExtAbrigo${g}`} rotulo="Abrigo" valor={dados.armazenamentoExterno[g].abrigo}
                  aoMudar={v => setArmazenamentoExterno(g, 'abrigo', v)} largo />
                <Texto id={`pgrsArmExtLocal${g}`} rotulo="Localizado em" valor={dados.armazenamentoExterno[g].localizado}
                  aoMudar={v => setArmazenamentoExterno(g, 'localizado', v)} largo />
              </div>
            </div>
          ))}
        </>
      } />

      <Cartao titulo="11 — Coleta externa" sub="Remoção do abrigo externo até o local de tratamento ou disposição final." corpo={
        <div className="form">
          <Texto id="pgrsColExtGrupos" rotulo="Grupo(s)" valor={dados.coletaExterna.grupos}
            aoMudar={v => set('coletaExterna', { ...dados.coletaExterna, grupos: v })} />
          <Texto id="pgrsColExtTipo" rotulo="Tipo de resíduos" valor={dados.coletaExterna.tipoResiduos}
            aoMudar={v => set('coletaExterna', { ...dados.coletaExterna, tipoResiduos: v })} />
          <Texto id="pgrsColExtVeiculo" rotulo="Veículo/equipamento" valor={dados.coletaExterna.veiculoEquipamento}
            aoMudar={v => set('coletaExterna', { ...dados.coletaExterna, veiculoEquipamento: v })} largo />
          <Texto id="pgrsColExtEpis" rotulo="EPIs" valor={dados.coletaExterna.epis}
            aoMudar={v => set('coletaExterna', { ...dados.coletaExterna, epis: v })} largo />
          <Texto id="pgrsColExtFreqD" rotulo="Frequência — Grupo D" valor={dados.coletaExterna.frequenciaD}
            aoMudar={v => set('coletaExterna', { ...dados.coletaExterna, frequenciaD: v })} />
          <Texto id="pgrsColExtFreqOutros" rotulo="Frequência — demais grupos (A, E, B)" valor={dados.coletaExterna.frequenciaOutros}
            aoMudar={v => set('coletaExterna', { ...dados.coletaExterna, frequenciaOutros: v })} />
          <Texto id="pgrsColExtHoraD" rotulo="Hora — Grupo D" valor={dados.coletaExterna.horaD}
            aoMudar={v => set('coletaExterna', { ...dados.coletaExterna, horaD: v })} />
          <Texto id="pgrsColExtHoraOutros" rotulo="Hora — demais grupos" valor={dados.coletaExterna.horaOutros}
            aoMudar={v => set('coletaExterna', { ...dados.coletaExterna, horaOutros: v })} />
          <Texto id="pgrsColExtDistancia" rotulo="Distância até a disposição final" valor={dados.coletaExterna.distanciaDisposicaoFinal}
            aoMudar={v => set('coletaExterna', { ...dados.coletaExterna, distanciaDisposicaoFinal: v })} placeholder="km" largo />
        </div>
      } />

      <Cartao titulo="12 — Destinação final" corpo={
        <div className="form">
          <Texto id="pgrsDestGrupo" rotulo="Grupo" valor={dados.destinacaoFinal.grupo}
            aoMudar={v => set('destinacaoFinal', { ...dados.destinacaoFinal, grupo: v })} />
          <Texto id="pgrsDestResiduo" rotulo="Resíduo" valor={dados.destinacaoFinal.residuo}
            aoMudar={v => set('destinacaoFinal', { ...dados.destinacaoFinal, residuo: v })} />
          <Texto id="pgrsDestDisposicao" rotulo="Disposição final" valor={dados.destinacaoFinal.disposicaoFinal}
            aoMudar={v => set('destinacaoFinal', { ...dados.destinacaoFinal, disposicaoFinal: v })} largo
            placeholder="Aterro sanitário, aterro controlado, disposição a céu aberto…" />
          <Texto id="pgrsDestMediaKg" rotulo="Média mensal (kg/mês)" valor={dados.destinacaoFinal.mediaMensalKg}
            aoMudar={v => set('destinacaoFinal', { ...dados.destinacaoFinal, mediaMensalKg: v })} />
          <Texto id="pgrsDestMediaL" rotulo="Média mensal (litros/mês)" valor={dados.destinacaoFinal.mediaMensalLitros}
            aoMudar={v => set('destinacaoFinal', { ...dados.destinacaoFinal, mediaMensalLitros: v })} />
          <Texto id="pgrsDestCusto" rotulo="Custo (R$/tonelada)" valor={dados.destinacaoFinal.custoTonelada}
            aoMudar={v => set('destinacaoFinal', { ...dados.destinacaoFinal, custoTonelada: v })} />
          <Texto id="pgrsDestEmpresa" rotulo="Empresa responsável pela disposição final" valor={dados.destinacaoFinal.empresaNome}
            aoMudar={v => set('destinacaoFinal', { ...dados.destinacaoFinal, empresaNome: v })} largo />
          <Texto id="pgrsDestEmpresaCnpj" rotulo="CNPJ da empresa" valor={dados.destinacaoFinal.empresaCnpj}
            aoMudar={v => set('destinacaoFinal', { ...dados.destinacaoFinal, empresaCnpj: v })} />
          <Texto id="pgrsDestEmpresaTel" rotulo="Telefone da empresa" valor={dados.destinacaoFinal.empresaTelefone}
            aoMudar={v => set('destinacaoFinal', { ...dados.destinacaoFinal, empresaTelefone: v })} />
          <Texto id="pgrsDestEmpresaEnd" rotulo="Endereço da empresa" valor={dados.destinacaoFinal.empresaEndereco}
            aoMudar={v => set('destinacaoFinal', { ...dados.destinacaoFinal, empresaEndereco: v })} largo />
          <Texto id="pgrsDestEmpresaResp" rotulo="Responsável técnico da empresa" valor={dados.destinacaoFinal.empresaResponsavel}
            aoMudar={v => set('destinacaoFinal', { ...dados.destinacaoFinal, empresaResponsavel: v })} largo />
        </div>
      } />

      <Cartao titulo="13 — Processos de higienização dos materiais e equipamentos" corpo={
        <TabelaEditavel
          colunas={[
            { chave: 'areaItem', rotulo: 'Área/item' },
            { chave: 'procedimento', rotulo: 'Procedimento (período, produto, quem realiza)' },
            { chave: 'epis', rotulo: 'EPIs' },
            { chave: 'local', rotulo: 'Local do procedimento' }
          ]}
          linhas={dados.higienizacao}
          aoMudarCampo={(id, chave, valor) => set('higienizacao', atualizarLinha(dados.higienizacao, id, chave, valor))}
          aoAdicionar={() => set('higienizacao', [...dados.higienizacao, { id: novoIdPgrs('hig'), areaItem: '', procedimento: '', epis: '', local: '' }])}
          aoRemover={id => set('higienizacao', dados.higienizacao.filter(h => h.id !== id))}
        />
      } />

      <Cartao titulo="Local, data e assinatura" corpo={
        <div className="form">
          <Texto id="pgrsAssinLocal" rotulo="Local" valor={dados.assinatura.local}
            aoMudar={v => set('assinatura', { ...dados.assinatura, local: v })} />
          <Texto id="pgrsAssinData" rotulo="Data" valor={dados.assinatura.data}
            aoMudar={v => set('assinatura', { ...dados.assinatura, data: v })} placeholder="21 de agosto de 2026" />
          <Texto id="pgrsAssinResp" rotulo="Responsável pelo PGRS" valor={dados.assinatura.responsavel}
            aoMudar={v => set('assinatura', { ...dados.assinatura, responsavel: v })} largo />
        </div>
      } />
    </div>
  );
}
