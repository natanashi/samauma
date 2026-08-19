'use client';

import { AppShell } from '@/components/layout/AppShell';

export default function LayoutPrefeitura({ children }: { children: React.ReactNode }) {
  return <AppShell perfil="prefeitura">{children}</AppShell>;
}
