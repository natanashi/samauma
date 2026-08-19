import { DetalheDemanda } from '@/components/demanda/DetalheDemanda';

export default async function PaginaDemandaCooperativa({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DetalheDemanda perfil="cooperativa" id={id} />;
}
