'use client';

/* SAMAÚMA — mapa dos pontos de coleta.
   Mapa real, com ruas e rio de verdade: Leaflet + OpenStreetMap. É a única
   dependência externa do site — só ela precisa de internet para carregar os
   tiles. Portado de `src/ui/mapa.js`; antes carregado via CDN, agora pacote npm.

   ATENÇÃO: as coordenadas dos pontos são aproximadas e demonstrativas. */

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { Fmt } from '@/lib/dominio/formato';
import { buscarMalhaMunicipal } from '@/lib/servicos/integracoes';
import { Vazio } from '../ui/Basicos';

const CENTRO_PORTO_VELHO: [number, number] = [-8.7619, -63.9039];
const CORES_SITUACAO: Record<string, string> = { ok: '#2f8f5b', alerta: '#b6801c', erro: '#b5453b', marca: '#1f6b4a' };

export interface ItemMapa {
  id?: string;
  nome: string;
  bairro: string;
  lat: number | null;
  lng: number | null;
  massa?: number;
  situacao?: { tom: string; rotulo: string };
}

export function Mapa({ itens, titulo = 'Grandes geradores', legenda = 'situacao', aoClicar }: {
  itens: ItemMapa[]; titulo?: string; legenda?: 'situacao' | 'marca'; aoClicar?: (id: string) => void;
}) {
  const alvoRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const comCoordenada = itens.filter((i): i is ItemMapa & { lat: number; lng: number } => i.lat != null && i.lng != null);

  useEffect(() => {
    if (!alvoRef.current || !comCoordenada.length) return;

    const mapa = L.map(alvoRef.current, { scrollWheelZoom: false }).setView(CENTRO_PORTO_VELHO, 12);
    mapaRef.current = mapa;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      maxZoom: 18
    }).addTo(mapa);

    buscarMalhaMunicipal().then(geo => {
      L.geoJSON(geo as GeoJSON.GeoJsonObject, {
        style: { color: '#1f6b4a', weight: 1.6, opacity: .75, fill: false, dashArray: '5 4' },
        interactive: false
      }).addTo(mapa).bindTooltip('Limite municipal de Porto Velho · malha oficial do IBGE', { sticky: true });
    }).catch(() => { /* sem contorno, o mapa segue funcionando */ });

    const maiorMassa = Math.max(...comCoordenada.map(i => i.massa || 0), 1);
    const grupo: L.CircleMarker[] = [];
    comCoordenada.forEach(item => {
      const tom = legenda === 'situacao' && item.situacao ? item.situacao.tom : 'marca';
      const raio = 7 + Math.sqrt((item.massa || 0) / maiorMassa) * 13;
      const marcador = L.circleMarker([item.lat, item.lng], {
        radius: raio, color: '#fff', weight: 2,
        fillColor: CORES_SITUACAO[tom] || CORES_SITUACAO.marca, fillOpacity: .85
      }).bindPopup(`<b>${item.nome}</b><br>${item.bairro} · ${Fmt.kg(item.massa)}` +
        (item.situacao ? `<br>${item.situacao.rotulo}` : ''));
      if (item.id && aoClicar) marcador.on('click', () => aoClicar(item.id!));
      marcador.addTo(mapa);
      grupo.push(marcador);
    });

    if (grupo.length > 1) mapa.fitBounds(L.featureGroup(grupo).getBounds().pad(0.25));

    return () => {
      mapa.remove();
      mapaRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(comCoordenada.map(i => [i.id, i.lat, i.lng, i.massa, i.situacao?.tom]))]);

  if (!comCoordenada.length) return <Vazio titulo="Sem pontos para mostrar" texto="Cadastre o ponto de coleta do gerador." />;

  return (
    <div className="mapa">
      <div ref={alvoRef} className="mapa-leaflet" role="img" aria-label={`${titulo} no território`}></div>
      <div className="mapa-legenda">
        <span><i className="amostra ok"></i>regular</span>
        <span><i className="amostra alerta"></i>em regularização</span>
        <span><i className="amostra erro"></i>irregular</span>
        <span className="mapa-nota">tamanho do círculo = massa destinada · ruas e rio do OpenStreetMap · limite municipal pela malha oficial do IBGE · coordenadas dos pontos ainda são aproximadas</span>
      </div>
    </div>
  );
}
