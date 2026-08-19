'use client';

import { ComprovanteProvider } from '../comprovante/ComprovanteProvider';
import { Bootstrap } from './Bootstrap';
import { Fundo } from './Fundo';
import { RecadoProvider } from './RecadoProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Bootstrap>
      <RecadoProvider>
        <ComprovanteProvider>
          <Fundo />
          {children}
        </ComprovanteProvider>
      </RecadoProvider>
    </Bootstrap>
  );
}
