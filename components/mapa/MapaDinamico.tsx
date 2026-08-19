'use client';

/* Carregamento tardio do mapa: Leaflet precisa do DOM, então nunca roda no
   servidor. `next/dynamic` com `ssr:false` só é permitido dentro de um
   Client Component — é por isso que este arquivo existe separado de `Mapa.tsx`. */

import dynamic from 'next/dynamic';

export const MapaDinamico = dynamic(() => import('./Mapa').then(m => m.Mapa), { ssr: false });
