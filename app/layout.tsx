import type { Metadata, Viewport } from 'next';
import { AppProviders } from '@/components/layout/AppProviders';
import './globals.css';

export const metadata: Metadata = {
  title: 'SAMAÚMA — Sistema de Grandes Geradores e Inclusão Produtiva | Porto Velho/RO',
  description: 'Protótipo demonstrativo: o gerador declara, o catador coleta, o destinatário recebe e confirma, a Prefeitura acompanha. O ciclo fecha em comprovante.',
  icons: { icon: '/logo.png' }
};

export const viewport: Viewport = {
  themeColor: '#1f6b4a'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <a href="#conteudo" className="pular">Ir para o conteúdo principal</a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
