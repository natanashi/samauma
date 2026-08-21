'use client';

/* SAMAÚMA — gerador padrão de PGRS.
   Fica disponível antes do cadastro: quem preenche aqui salva um rascunho
   identificado pelo CNPJ, baixa o plano em PDF e Word, e — se depois criar o
   cadastro de gerador com o mesmo CNPJ — encontra o PGRS já anexado, com
   possibilidade de correção. Portado como ferramenta nova, sem equivalente no
   protótipo original. */

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { CabecalhoPublico } from '@/components/layout/CabecalhoPublico';
import { FormularioPgrs } from '@/components/pgrs/FormularioPgrs';
import { useDominioPronto } from '@/components/layout/Bootstrap';
import { useRecado } from '@/components/layout/RecadoProvider';
import { Aviso, Cartao } from '@/components/ui/Basicos';
import { Fmt } from '@/lib/dominio/formato';
import { Pgrs, pgrsMinimamentePreenchido, pgrsVazio, soDigitos, type DadosPgrs } from '@/lib/dominio/pgrs';
import { baixarDocxPgrs } from '@/lib/servicos/pgrsDocx';
import { baixarPdfPgrs } from '@/lib/servicos/pgrsPdf';
import { usePgrsVersao } from '@/state/hooks';

function PaginaPgrsConteudo() {
  const pronto = useDominioPronto();
  usePgrsVersao();
  const recado = useRecado();
  const router = useRouter();
  const busca = useSearchParams();
  const cnpjInicial = busca.get('cnpj') || '';
  const retorno = busca.get('retorno') as 'cadastro' | 'documentos' | null;

  const [dados, setDados] = useState<DadosPgrs>(() => {
    if (!cnpjInicial) return pgrsVazio();
    const existente = Pgrs.obter(cnpjInicial);
    if (existente) return existente;
    const vazio = pgrsVazio();
    return { ...vazio, identificacao: { ...vazio.identificacao, cnpj: cnpjInicial } };
  });

  if (!pronto) return null;

  const chave = soDigitos(dados.identificacao.cnpj);
  const rascunhoExistente = chave ? Pgrs.obter(chave) : null;
  const completo = pgrsMinimamentePreenchido(dados);

  function salvarRascunho(): boolean {
    if (!chave) {
      recado('Informe o CNPJ na seção 2 antes de salvar o rascunho.');
      return false;
    }
    Pgrs.salvar(chave, dados);
    recado('Rascunho do PGRS salvo neste navegador, associado ao CNPJ informado.');
    return true;
  }

  function aoBaixarPdf() {
    salvarRascunho();
    baixarPdfPgrs(dados);
    recado('PDF do PGRS gerado para download.');
  }

  async function aoBaixarDocx() {
    salvarRascunho();
    await baixarDocxPgrs(dados);
    recado('Arquivo Word (.docx) do PGRS gerado para download.');
  }

  function aoLimpar() {
    if (!confirm('Limpar todos os campos preenchidos neste formulário?')) return;
    setDados(pgrsVazio());
  }

  const destinoVolta = retorno === 'cadastro' ? `/cadastro?tipo=gerador${chave ? '&cnpj=' + chave : ''}`
    : retorno === 'documentos' ? '/gerador/documentos' : '/';
  const rotuloVolta = retorno === 'cadastro' ? 'Voltar ao cadastro'
    : retorno === 'documentos' ? 'Voltar aos documentos' : 'Voltar para a entrada';

  return (
    <section className="portao" role="dialog" aria-modal="true">
      <div className="portao-caixa">
        <CabecalhoPublico />
        <div className="portao-grade modo-cadastro">
          <div className="cadastro-topo">
            <Link href={destinoVolta} className="voltar">{rotuloVolta}</Link>
            <span className="cadastro-papel">GERADOR PADRÃO DE PGRS</span>
            <h2>Plano de Gerenciamento de Resíduos de Serviços de Saúde</h2>
            <p>Preencha o plano completo do estabelecimento e baixe em PDF ou Word. Salvo o rascunho, o mesmo
              CNPJ encontra este PGRS já anexado (e corrigível) na hora do cadastro de gerador.</p>
          </div>

          {!completo && (
            <Aviso tom="problema" titulo="Faltam dados essenciais"
              texto="Razão social, CNPJ, endereço e responsável técnico (seção 2) são necessários para o plano valer como rascunho anexável." />
          )}
          {rascunhoExistente && (
            <Aviso titulo="Rascunho encontrado para este CNPJ"
              texto={`Última atualização em ${Fmt.dataHora(rascunhoExistente.atualizadoEm)}. Qualquer alteração aqui substitui esse rascunho ao salvar.`} />
          )}

          <Cartao classe="cartao-cadastro" corpo={<FormularioPgrs dados={dados} aoMudar={setDados} />} />

          <div className="acoes-form">
            <button className="btn" type="button" onClick={aoBaixarPdf}>Baixar PDF</button>
            <button className="btn sec" type="button" onClick={aoBaixarDocx}>Baixar Word (.docx)</button>
            <button className="btn sec" type="button" onClick={salvarRascunho}>Salvar rascunho</button>
            <button className="btn fantasma" type="button" onClick={aoLimpar}>Limpar formulário</button>
            {retorno && (
              <button className="btn sec" type="button"
                onClick={() => { if (salvarRascunho()) router.push(destinoVolta); }}>
                Salvar e {rotuloVolta.toLowerCase()}
              </button>
            )}
            <span className="ajuda">Os arquivos baixam para o seu dispositivo; anexe-os ao cadastro se o sistema não localizar o rascunho automaticamente.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PaginaPgrs() {
  return (
    <Suspense fallback={null}>
      <PaginaPgrsConteudo />
    </Suspense>
  );
}
