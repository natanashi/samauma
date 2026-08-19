'use client';

/* Ações de exportação (CSV/PDF) compartilhadas por todas as telas com botão
   `Exportar`. Portado de `App.baixarCsv` / `App.imprimirRelatorio`. */

import { useRecado } from '@/components/layout/RecadoProvider';
import { LOGO_URL } from '@/components/ui/Basicos';
import { Relatorio } from '@/lib/servicos/relatorio';

export function useExportar() {
  const recado = useRecado();

  const aoCsv = (escopo: string, opcoes: { id?: string } = {}) => {
    try {
      const r = Relatorio.baixarCsv(escopo, opcoes);
      recado(`${r.arquivo} · ${r.linhas} linha(s) exportada(s).`);
    } catch (erro) {
      recado('Não foi possível gerar o CSV: ' + (erro as Error).message);
    }
  };

  const aoPdf = (escopo: string, opcoes: { id?: string } = {}) => {
    try {
      const r = Relatorio.imprimir(escopo, opcoes, location.origin + LOGO_URL);
      recado(`Relatório com ${r.processos} processo(s) pronto para impressão ou PDF.`);
    } catch (erro) {
      recado('Não foi possível gerar o relatório: ' + (erro as Error).message);
    }
  };

  return { aoCsv, aoPdf };
}
