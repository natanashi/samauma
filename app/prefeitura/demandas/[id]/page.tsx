import { DetalheDemanda } from '@/components/demanda/DetalheDemanda';

export default async function PaginaDemandaPrefeitura({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DetalheDemanda perfil="prefeitura" id={id} />;
}
