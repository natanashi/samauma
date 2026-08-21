/* SAMAÚMA — download de blob genérico, usado pelos exportadores de PGRS
   (PDF e Word) além do CSV/impressão de `relatorio.ts`. */

export function baixarBlob(blob: Blob, arquivo: string) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = arquivo;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

export function carimboArquivo(): string {
  const agora = new Date();
  return `${agora.getFullYear()}${String(agora.getMonth() + 1).padStart(2, '0')}${String(agora.getDate()).padStart(2, '0')}`;
}
