/* Marca das páginas que ficam fora do sistema — entrar, cadastrar e o gerador
   de PGRS. Na versão anterior tudo isso acontecia dentro do portão, então a
   marca estava sempre à vista; ao virarem páginas próprias, ficaram órfãs de
   identidade. O logotipo também é o caminho de volta para a entrada. */

import Link from 'next/link';
import { Marca } from '@/components/ui/Basicos';

export function CabecalhoPublico() {
  return (
    <header className="portao-marca marca-publica">
      <Link href="/" aria-label="Voltar para a entrada do SAMAÚMA">
        <Marca tamanho={128} forma="completa" />
      </Link>
    </header>
  );
}
