'use client';

import { AppShell } from '@/components/layout/AppShell';

export default function LayoutGerador({ children }: { children: React.ReactNode }) {
  return <AppShell perfil="gerador">{children}</AppShell>;
}
