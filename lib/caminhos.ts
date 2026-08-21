/* Onde o site mora.

   O projeto é publicado em /samauma, e não na raiz do domínio. O Next reescreve
   sozinho os endereços de página, mas não os de arquivo em `public/`: um
   `src="/logo.png"` procuraria a imagem na raiz e não a encontraria — foi o que
   fez a marca oficial sumir e o símbolo de reserva aparecer no lugar.

   O valor vem do próprio `next.config.ts`, então trocar o endereço de
   publicação não exige caçar caminho espalhado pelo código. */

export const CAMINHO_BASE = process.env.NEXT_PUBLIC_CAMINHO_BASE ?? '';

export function arquivoPublico(caminho: string) {
  return CAMINHO_BASE + (caminho.startsWith('/') ? caminho : '/' + caminho);
}
