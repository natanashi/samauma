'use client';

import { AppShell } from '@/components/layout/AppShell';

export default function LayoutCatador({ children }: { children: React.ReactNode }) {
  return <AppShell perfil="catador">{children}</AppShell>;
}
