import { DetalheDemanda } from '@/components/demanda/DetalheDemanda';
import { idsDeDemanda } from '@/lib/rotasEstaticas';

/* Exportacao estatica: as paginas de detalhe precisam existir como arquivo. */
export function generateStaticParams() {
  return idsDeDemanda();
}

export default async function PaginaDemandaPrefeitura({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DetalheDemanda perfil="prefeitura" id={id} />;
}
