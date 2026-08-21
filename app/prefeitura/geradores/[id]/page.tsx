import { FichaGerador } from './FichaGerador';
import { idsDeGerador } from '@/lib/rotasEstaticas';

/* Exportacao estatica: a casca e servidor so para declarar quais fichas viram
   arquivo; todo o conteudo continua no componente cliente. */
export function generateStaticParams() {
  return idsDeGerador();
}

export default async function PaginaFichaGerador({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FichaGerador id={id} />;
}
