/* SAMAÚMA — geração dos arquivos do PGRS não deve quebrar mesmo com o
   formulário vazio ou parcialmente preenchido; é o caminho que o cadastro de
   gerador depende para anexar o plano automaticamente. */

import { describe, expect, it } from 'vitest';
import { pgrsVazio } from '../../dominio/pgrs';
import { gerarDocxPgrs } from '../pgrsDocx';
import { gerarPdfPgrs } from '../pgrsPdf';

describe('geração de PGRS', () => {
  it('gera um PDF não vazio a partir do formulário em branco', () => {
    const blob = gerarPdfPgrs(pgrsVazio());
    expect(blob.size).toBeGreaterThan(0);
    expect(blob.type).toBe('application/pdf');
  });

  it('gera um PDF não vazio com o formulário preenchido', () => {
    const dados = pgrsVazio();
    dados.identificacao.razaoSocial = 'Clínica Modelo LTDA';
    dados.identificacao.cnpj = '11.222.333/0001-81';
    dados.identificacao.endereco = 'Av. Sete de Setembro, 1000';
    dados.identificacao.responsavelTecnico = 'Fulano de Tal — CREA 0000';
    const blob = gerarPdfPgrs(dados);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('gera um .docx não vazio a partir do formulário em branco', async () => {
    const blob = await gerarDocxPgrs(pgrsVazio());
    expect(blob.size).toBeGreaterThan(0);
  });
});
