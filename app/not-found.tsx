'use client';

/* Rede de segurança da exportação estática.

   As páginas de detalhe são geradas até um limite; uma demanda criada além dele
   cairia num 404 seco. Como o sistema inteiro roda no navegador, esta página
   reconhece o endereço, monta a tela certa e o usuário nem percebe o desvio.
   O que não for endereço conhecido vira um 404 de verdade, com caminho de volta. */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DetalheDemanda } from '@/components/demanda/DetalheDemanda';
import { FichaGerador } from './prefeitura/geradores/[id]/FichaGerador';
import type { Perfil } from '@/lib/dominio/tipos';

const PERFIS_VALIDOS = ['gerador', 'catador', 'cooperativa', 'prefeitura'];

type Destino =
  | { tipo: 'demanda'; perfil: Perfil; id: string }
  | { tipo: 'gerador'; id: string }
  | { tipo: 'nada' };

function lerEndereco(): Destino {
  if (typeof window === 'undefined') return { tipo: 'nada' };
  const partes = window.location.pathname
    .replace(/^\/samauma/, '')
    .split('/')
    .filter(Boolean);

  if (partes.length === 3 && PERFIS_VALIDOS.includes(partes[0]) && partes[1] === 'demandas') {
    return { tipo: 'demanda', perfil: partes[0] as Perfil, id: partes[2].toUpperCase() };
  }
  if (partes.length === 3 && partes[0] === 'prefeitura' && partes[1] === 'geradores') {
    return { tipo: 'gerador', id: partes[2] };
  }
  return { tipo: 'nada' };
}

export default function NaoEncontrado() {
  const [destino, setDestino] = useState<Destino>({ tipo: 'nada' });
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    setDestino(lerEndereco());
    setPronto(true);
  }, []);

  if (!pronto) return null;
  if (destino.tipo === 'demanda') return <DetalheDemanda perfil={destino.perfil} id={destino.id} />;
  if (destino.tipo === 'gerador') return <FichaGerador id={destino.id} />;

  return (
    <main className="nao-encontrado">
      <h1>Página não encontrada</h1>
      <p>O endereço que você abriu não existe no sistema.</p>
      <Link className="btn" href="/">Voltar para a entrada</Link>
    </main>
  );
}
