/* Exportacao estatica: o manifesto vira arquivo no build. */
export const dynamic = 'force-static';

import type { MetadataRoute } from 'next';
import { arquivoPublico, CAMINHO_BASE } from '@/lib/caminhos';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SAMAÚMA — Sistema de Grandes Geradores e Inclusão Produtiva',
    short_name: 'SAMAÚMA',
    start_url: CAMINHO_BASE + '/',
    display: 'standalone',
    background_color: '#fafcf9',
    theme_color: '#1f6b4a',
    lang: 'pt-BR',
    description: 'Protótipo demonstrativo: o gerador cria a demanda, o catador coleta, o destinatário recebe e confirma, e a Prefeitura acompanha o ciclo até o comprovante.',
    icons: [{ src: arquivoPublico('/logo.png'), sizes: 'any', type: 'image/png' }]
  };
}
