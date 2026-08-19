'use client';

import { AppShell } from '@/components/layout/AppShell';

export default function LayoutCooperativa({ children }: { children: React.ReactNode }) {
  return <AppShell perfil="cooperativa">{children}</AppShell>;
}
