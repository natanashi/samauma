import { DetalheDemanda } from '@/components/demanda/DetalheDemanda';

export default async function PaginaDemandaGerador({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DetalheDemanda perfil="gerador" id={id} />;
}
