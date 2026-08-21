/* Quais páginas de detalhe são geradas na exportação estática.

   O GitHub Pages serve arquivo pronto: cada rota `[id]` precisa existir como
   arquivo no momento do build. Como as demandas nascem durante o uso, e não no
   build, geramos uma faixa folgada de identificadores — a semente vai até
   DEM-0061 e a demonstração cria poucas dezenas por sessão.

   O que passar da faixa cai no `not-found`, que reconhece o endereço e mostra a
   tela certa mesmo assim. */

const LIMITE_DEMANDAS = 120;

export function idsDeDemanda() {
  return Array.from({ length: LIMITE_DEMANDAS }, (_, i) => ({
    id: 'DEM-' + String(i + 1).padStart(4, '0')
  }));
}

/* Geradores da semente mais os que podem ser criados pelo cadastro. */
export function idsDeGerador() {
  const daSemente = Array.from({ length: 20 }, (_, i) => ({ id: 'ger-' + String(i + 1).padStart(2, '0') }));
  const cadastrados = Array.from({ length: 20 }, (_, i) => ({ id: 'ger-c-' + String(i + 1).padStart(2, '0') }));
  return [...daSemente, ...cadastrados];
}
