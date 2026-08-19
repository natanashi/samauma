import { DetalheDemanda } from '@/components/demanda/DetalheDemanda';

export default async function PaginaDemandaCatador({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DetalheDemanda perfil="catador" id={id} />;
}
