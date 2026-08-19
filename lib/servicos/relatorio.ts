/* SAMAÚMA — relatórios.
   Dois formatos, a partir do mesmo recorte: CSV para quem vai continuar a
   análise em planilha, e um documento imprimível para quem precisa salvar em
   PDF ou anexar a um processo. */

import { Catalogo, DESTINO_SESSAO, GERADOR_SESSAO, STATUS } from '../dominio/catalogo';
import { DemandaRegras as Demanda } from '../dominio/demanda';
import { escapar, Fmt } from '../dominio/formato';
import { Painel } from '../dominio/indicadores';
import { Store } from '../dominio/store';
import type { Demanda as TDemanda } from '../dominio/tipos';

export interface EscopoRelatorio {
  titulo: string;
  quem: string;
  detalhe: string;
  demandas: TDemanda[];
  resumo: [string, string][];
  composicao?: ReturnType<typeof Painel.porResiduo>;
  destinos?: ReturnType<typeof Painel.porDestino>;
}

export const Relatorio = {
  escopo(nome: string, opcoes: { id?: string } = {}): EscopoRelatorio {
    switch (nome) {
      case 'gerador': {
        const p = Painel.gerador(opcoes.id || GERADOR_SESSAO);
        return {
          titulo: 'Relatório de destinação',
          quem: p.cadastro.nome,
          detalhe: `CNPJ ${p.cadastro.cnpj} · ${p.cadastro.ramo} · ${Catalogo.endereco(p.cadastro.ponto)}`,
          demandas: p.demandas,
          resumo: [
            ['Situação regulatória', p.situacao.rotulo],
            ['PGRS', p.situacao.pgrs ? `${p.situacao.pgrs.numero} · válido até ${Fmt.data(p.situacao.pgrs.validade)}` : 'não cadastrado'],
            ['Operador contratado', p.operador ? p.operador.nome : 'sem operador contratado'],
            ['Demandas registradas', Fmt.numero(p.total)],
            ['Destinações comprovadas', Fmt.numero(p.comprovadas)],
            ['Massa destinada', Fmt.kg(p.ambiental.massa)],
            ['Massa recuperada', Fmt.kg(p.ambiental.reciclado)],
            ['Rejeito para aterro', Fmt.kg(p.ambiental.rejeito)],
            ['Taxa de recuperação', Fmt.percentual(p.ambiental.taxaRecuperacao)],
            ['CO₂e evitado', Fmt.kg(Math.round(p.ambiental.co2Evitado))],
            ['Selo de destinação', p.selo.valido ? p.selo.codigo : 'não emitido']
          ]
        };
      }

      case 'catador': {
        const p = Painel.catador(opcoes.id!);
        return {
          titulo: 'Relatório de coletas',
          quem: p.pessoa.nome,
          detalhe: `${p.cooperativa ? 'Cooperado da ' + p.cooperativa.nome : 'Catador autônomo'} · desde ${Fmt.data(p.pessoa.desde)}`,
          demandas: p.demandas,
          resumo: [
            ['Atendimentos comprovados', Fmt.numero(p.atendimentos)],
            ['Massa entregue', Fmt.kg(p.massa)],
            ['Valor gerado', Fmt.reais(p.renda)],
            ['Valor médio por coleta', Fmt.reais(p.rendaMedia)],
            ['Massa na semana', Fmt.kg(p.massaSemana)],
            ['Meta semanal', `${Fmt.kg(p.meta)} · ${Fmt.percentual(p.metaAtingida, 0)} atingida`],
            ['Precisão da pesagem', Fmt.percentual(p.precisao)],
            ['Coletas em andamento', Fmt.numero(p.emAndamento)],
            ['CO₂e evitado', Fmt.kg(Math.round(p.co2))]
          ]
        };
      }

      case 'destinatario': {
        const p = Painel.destino(opcoes.id || DESTINO_SESSAO);
        return {
          titulo: 'Relatório de recebimentos',
          quem: p.unidade.nome,
          detalhe: `${p.unidade.tipo} · licença ${p.unidade.licenca} · ${Catalogo.endereco(p.unidade.ponto)}`,
          demandas: p.demandas,
          resumo: [
            ['Cargas recebidas', Fmt.numero(p.atendimentos)],
            ['Massa confirmada na balança', Fmt.kg(p.massa)],
            ['Massa recuperada', Fmt.kg(p.ambiental.reciclado)],
            ['Rejeito encaminhado ao aterro', Fmt.kg(p.ambiental.rejeito)],
            ['Taxa de recuperação', Fmt.percentual(p.ambiental.taxaRecuperacao)],
            ['Cargas a caminho', Fmt.numero(p.aCaminho.length)],
            ['Divergência média', Fmt.percentual(p.divergenciaMedia)],
            ['Destino declarado', p.unidade.destinoFinal]
          ]
        };
      }

      case 'mensal': {
        const p = Painel.gerador(opcoes.id || GERADOR_SESSAO);
        const corte = Date.now() - 30 * 86400000;
        const doMes = p.demandas.filter(d => d.status === 'COMPROVADA' && new Date(d.comprovante!.emitidoEm).getTime() >= corte);
        const ambiental = Painel.ambiental(doMes);
        return {
          titulo: 'Relatório mensal de destinação',
          quem: p.cadastro.nome,
          detalhe: `Competência ${Fmt.mes(new Date().toISOString())} · CNPJ ${p.cadastro.cnpj}`,
          demandas: doMes,
          resumo: [
            ['Quantidade coletada', Fmt.kg(ambiental.massa)],
            ['Quantidade reciclada', Fmt.kg(ambiental.reciclado)],
            ['Rejeito para aterro', Fmt.kg(ambiental.rejeito)],
            ['Taxa de recuperação', Fmt.percentual(ambiental.taxaRecuperacao)],
            ['Comprovantes emitidos', Fmt.numero(doMes.length)],
            ['Volume declarado no mês', Fmt.kg(p.cadastro.volumeMes)],
            ['Aderência ao declarado', Fmt.percentual(p.aderencia ? p.aderencia.parte : null)],
            ['CO₂e evitado', Fmt.kg(Math.round(ambiental.co2Evitado))]
          ],
          composicao: Painel.porResiduo(doMes),
          destinos: Painel.porDestino(doMes)
        };
      }

      default: {
        const p = Painel.municipio();
        return {
          titulo: 'Relatório municipal de destinação',
          quem: 'Prefeitura de Porto Velho',
          detalhe: 'Secretaria Municipal de Meio Ambiente · todos os processos registrados',
          demandas: Store.todas(),
          resumo: [
            ['Demandas registradas', Fmt.numero(p.total)],
            ['Destinações comprovadas', Fmt.numero(p.comprovadas)],
            ['Massa destinada', Fmt.kg(p.ambiental.massa)],
            ['Massa recuperada', Fmt.kg(p.ambiental.reciclado)],
            ['Massa aterrada', Fmt.kg(p.ambiental.rejeito)],
            ['Taxa de recuperação', Fmt.percentual(p.ambiental.taxaRecuperacao)],
            ['CO₂e evitado', Fmt.kg(Math.round(p.ambiental.co2Evitado))],
            ['Catadores com renda registrada', Fmt.numero(p.social.catadoresAtivos)],
            ['Renda gerada', Fmt.reais(p.social.renda)],
            ['Custo de aterro evitado', Fmt.reais(p.financeiro.custoAterroEvitado)],
            ['Geradores fora do regular', Fmt.numero(p.atencao.length)],
            ['Pendências abertas', Fmt.numero(p.pendentes)]
          ],
          composicao: p.materiais,
          destinos: p.destinos
        };
      }
    }
  },

  COLUNAS: [
    ['Demanda', (d: TDemanda) => d.id],
    ['Situação', (d: TDemanda) => STATUS[d.status].rotulo],
    ['Gerador', (d: TDemanda) => d.gerador.nome],
    ['CNPJ', (d: TDemanda) => { const g = Catalogo.gerador(d.gerador.id); return g ? g.cnpj : ''; }],
    ['Resíduo', (d: TDemanda) => Catalogo.nomeResiduo(d.residuo)],
    ['Ponto de coleta', (d: TDemanda) => d.ponto],
    ['Bairro', (d: TDemanda) => d.bairro],
    ['Zona', (d: TDemanda) => d.zona],
    ['Estimado (kg)', (d: TDemanda) => d.estimadoKg],
    ['Coletado (kg)', (d: TDemanda) => d.coletadoKg],
    ['Recebido (kg)', (d: TDemanda) => d.verificadoKg],
    ['Reciclado (kg)', (d: TDemanda) => Demanda.reciclado(d)],
    ['Rejeito (kg)', (d: TDemanda) => Demanda.rejeito(d)],
    ['Recuperação (%)', (d: TDemanda) => Demanda.taxaRecuperacao(d)],
    ['Divergência (%)', (d: TDemanda) => Demanda.divergencia(d)],
    ['Catador', (d: TDemanda) => d.catador ? d.catador.nome : ''],
    ['Vínculo', (d: TDemanda) => {
      if (!d.catador) return '';
      const coop = Catalogo.cooperativa(d.catador.cooperativa);
      return coop ? coop.nome : 'autônomo';
    }],
    ['Destinatário', (d: TDemanda) => d.destino ? d.destino.nome : ''],
    ['Destino do material', (d: TDemanda) => d.status === 'COMPROVADA' ? Demanda.destinoFinal(d) : ''],
    ['Lote', (d: TDemanda) => d.lote || ''],
    ['Valor (R$)', (d: TDemanda) => Demanda.valor(d)],
    ['CO2e evitado (kg)', (d: TDemanda) => Demanda.co2(d)],
    ['Criada em', (d: TDemanda) => Fmt.dataHora(d.criadaEm)],
    ['Prazo', (d: TDemanda) => Fmt.data(d.prazo)],
    ['Recebida em', (d: TDemanda) => d.recebidaEm ? Fmt.dataHora(d.recebidaEm) : ''],
    ['Comprovante', (d: TDemanda) => d.comprovante ? d.comprovante.codigo : ''],
    ['Emitido em', (d: TDemanda) => d.comprovante ? Fmt.dataHora(d.comprovante.emitidoEm) : '']
  ] as [string, (d: TDemanda) => unknown][],

  csv(escopo: EscopoRelatorio): string {
    const celula = (valor: unknown): string => {
      if (valor == null) return '';
      const texto = typeof valor === 'number'
        ? valor.toLocaleString('pt-BR', { maximumFractionDigits: 2, useGrouping: false })
        : String(valor);
      return /[";\n]/.test(texto) ? '"' + texto.replace(/"/g, '""') + '"' : texto;
    };

    const cabecalho = Relatorio.COLUNAS.map(c => celula(c[0])).join(';');
    const linhas = escopo.demandas.map(d => Relatorio.COLUNAS.map(c => celula(c[1](d))).join(';'));
    return '﻿' + [cabecalho, ...linhas].join('\r\n') + '\r\n';
  },

  baixarCsv(nomeEscopo: string, opcoes: { id?: string }): { arquivo: string; linhas: number } {
    const escopo = Relatorio.escopo(nomeEscopo, opcoes);
    const arquivo = Relatorio._arquivo(nomeEscopo, 'csv');
    Relatorio._baixar(Relatorio.csv(escopo), 'text/csv;charset=utf-8', arquivo);
    return { arquivo, linhas: escopo.demandas.length };
  },

  documentoHtml(escopo: EscopoRelatorio, logoUrl: string): string {
    const linha = (rotulo: string, valor: string) => `<tr><th>${escapar(rotulo)}</th><td>${escapar(valor)}</td></tr>`;

    const composicao = escopo.composicao && escopo.composicao.length
      ? `<h3>Composição por material</h3>
         <table class="grade">
           <thead><tr><th>Material</th><th>Cargas</th><th>Recebido</th><th>Reciclado</th><th>Participação</th></tr></thead>
           <tbody>${escopo.composicao.map(m => `<tr>
             <td><span class="cor" style="background:${m.cor}"></span>${escapar(m.nome)}</td>
             <td>${m.n}</td><td>${escapar(Fmt.kg(m.kg))}</td>
             <td>${escapar(Fmt.kg(m.reciclado))}</td><td>${escapar(Fmt.percentual(m.parte, 0))}</td>
           </tr>`).join('')}</tbody>
         </table>` : '';

    const destinos = escopo.destinos && escopo.destinos.length
      ? `<h3>Destino final do material</h3>
         <table class="grade">
           <thead><tr><th>Unidade</th><th>Tipo</th><th>Cargas</th><th>Massa</th><th>Participação</th></tr></thead>
           <tbody>${escopo.destinos.map(d => `<tr>
             <td>${escapar(d.nome)}</td><td>${escapar(d.tipo)}</td><td>${d.n}</td>
             <td>${escapar(Fmt.kg(d.massa))}</td><td>${escapar(Fmt.percentual(d.parte, 0))}</td>
           </tr>`).join('')}</tbody>
         </table>` : '';

    const processos = escopo.demandas.length
      ? `<h3>Processos (${escopo.demandas.length})</h3>
         <table class="grade compacta">
           <thead><tr>
             <th>Demanda</th><th>Situação</th><th>Gerador</th><th>Material</th>
             <th>Coletado</th><th>Recebido</th><th>Reciclado</th><th>Destino</th><th>Comprovante</th>
           </tr></thead>
           <tbody>${escopo.demandas.map(d => `<tr>
             <td>${escapar(d.id)}</td>
             <td>${escapar(STATUS[d.status].rotulo)}</td>
             <td>${escapar(d.gerador.nome)}</td>
             <td>${escapar(Catalogo.nomeResiduo(d.residuo))}</td>
             <td>${escapar(Fmt.kg(d.coletadoKg))}</td>
             <td>${escapar(Fmt.kg(d.verificadoKg))}</td>
             <td>${escapar(Fmt.kg(Demanda.reciclado(d)))}</td>
             <td>${escapar(d.destino ? d.destino.nome : '—')}</td>
             <td>${escapar(d.comprovante ? d.comprovante.codigo : '—')}</td>
           </tr>`).join('')}</tbody>
         </table>` : '<p class="vazio">Nenhum processo neste recorte.</p>';

    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>${escapar(escopo.titulo)} · ${escapar(escopo.quem)}</title>
<style>${ESTILO_RELATORIO}</style></head><body>
<header class="folha-cabeca">
  <img src="${logoUrl}" alt="SAMAÚMA" class="marca-arquivo" onerror="this.style.display='none'">
  <div>
    <div class="org">PREFEITURA DE PORTO VELHO · SAMAÚMA</div>
    <h1>${escapar(escopo.titulo)}</h1>
    <p>${escapar(escopo.quem)}<br><small>${escapar(escopo.detalhe)}</small></p>
  </div>
  <div class="emissao">
    <small>Emitido em</small>
    <b>${escapar(Fmt.dataHora(new Date().toISOString()))}</b>
  </div>
</header>
<div class="tri"><i></i><i></i><i></i></div>

<h3>Resumo</h3>
<table class="pares">${escopo.resumo.map(par => linha(par[0], par[1])).join('')}</table>
${composicao}
${destinos}
${processos}

<footer class="folha-pe">
  Protótipo demonstrativo. Organizações, pessoas, documentos, coordenadas e valores são fictícios ou
  demonstrativos. Este documento não representa ato administrativo, contratação ou decisão da
  Prefeitura de Porto Velho. Fatores de preço, de CO₂e e de tarifa de aterro são demonstrativos.
</footer>
</body></html>`;
  },

  imprimir(nomeEscopo: string, opcoes: { id?: string }, logoUrl: string): { processos: number } {
    const escopo = Relatorio.escopo(nomeEscopo, opcoes);
    const anterior = document.getElementById('folhaImpressao');
    if (anterior) anterior.remove();

    const quadro = document.createElement('iframe');
    quadro.id = 'folhaImpressao';
    quadro.setAttribute('aria-hidden', 'true');
    quadro.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
    document.body.appendChild(quadro);

    const doc = quadro.contentWindow!.document;
    doc.open();
    doc.write(Relatorio.documentoHtml(escopo, logoUrl));
    doc.close();

    const mandarImprimir = () => {
      try {
        quadro.contentWindow!.focus();
        quadro.contentWindow!.print();
      } catch {
        /* impressão indisponível neste navegador */
      }
    };
    if (doc.readyState === 'complete') setTimeout(mandarImprimir, 60);
    else quadro.onload = () => setTimeout(mandarImprimir, 60);

    return { processos: escopo.demandas.length };
  },

  _arquivo(nome: string, extensao: string): string {
    const agora = new Date();
    const carimbo = `${agora.getFullYear()}${String(agora.getMonth() + 1).padStart(2, '0')}${String(agora.getDate()).padStart(2, '0')}`;
    return `samauma-${nome}-${carimbo}.${extensao}`;
  },

  _baixar(conteudo: string, tipo: string, arquivo: string) {
    const blob = new Blob([conteudo], { type: tipo });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = arquivo;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }
};

const ESTILO_RELATORIO = `
@page { size: A4; margin: 14mm 12mm; }
* { box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  color: #2c332f; margin: 0; font-size: 11px; line-height: 1.5; }
.folha-cabeca { display: flex; align-items: flex-start; gap: 14px; }
.folha-cabeca .marca-arquivo { width: 68px; height: auto; }
.folha-cabeca .org { font-size: 8.5px; font-weight: 700; letter-spacing: 1.6px; color: #1f6b4a; }
.folha-cabeca h1 { font-size: 17px; margin: 4px 0 2px; font-weight: 600; }
.folha-cabeca p { margin: 0; font-size: 11.5px; font-weight: 600; }
.folha-cabeca small { font-weight: 400; color: #5d6b64; }
.folha-cabeca .emissao { margin-left: auto; text-align: right; }
.folha-cabeca .emissao small { display: block; font-size: 8.5px; letter-spacing: 1.2px;
  text-transform: uppercase; color: #8a9690; font-weight: 700; }
.tri { display: flex; gap: 4px; margin: 10px 0 16px; }
.tri i { height: 3px; width: 42px; border-radius: 3px; }
.tri i:nth-child(1) { background: #8fbb3f; }
.tri i:nth-child(2) { background: #2a6fa8; }
.tri i:nth-child(3) { background: #e0a93a; }
h3 { font-size: 12px; margin: 16px 0 7px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 1.2px; color: #1f6b4a; }
table { width: 100%; border-collapse: collapse; }
table.pares th { text-align: left; font-weight: 400; color: #5d6b64; width: 46%;
  padding: 5px 0; border-bottom: 1px solid #eff3ee; }
table.pares td { text-align: right; font-weight: 600; padding: 5px 0;
  border-bottom: 1px solid #eff3ee; font-variant-numeric: tabular-nums; }
table.grade th { text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: .8px;
  color: #8a9690; border-bottom: 1.5px solid #dfe6dd; padding: 6px 6px 6px 0; }
table.grade td { padding: 5px 6px 5px 0; border-bottom: 1px solid #f2f5f1;
  font-variant-numeric: tabular-nums; }
table.grade.compacta { font-size: 9.5px; }
table.grade tr { break-inside: avoid; }
.cor { display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 6px; }
.vazio { color: #8a9690; font-style: italic; }
.folha-pe { margin-top: 20px; padding-top: 10px; border-top: 1px solid #eff3ee;
  font-size: 8.5px; color: #8a9690; line-height: 1.6; }`;
