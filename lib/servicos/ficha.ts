/* SAMAÚMA — ficha de coleta em papel.
   Contingência de aparelho, bateria ou conexão: o original é digitado depois
   no terminal do galpão, com dupla assinatura. Portado de `App.baixarFicha`. */

import { escapar as esc } from '../dominio/formato';
import type { Catador } from '../dominio/tipos';

export function baixarFichaColeta(pessoa: Catador) {
  const numero = 'FC-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + pessoa.id.replace('cat-', '');
  const pagina = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Ficha de coleta ${numero} · SAMAÚMA</title>
<style>body{font:14px Arial,sans-serif;max-width:760px;margin:32px auto;color:#26332c}
h1{font-size:19px;color:#1f6b4a;border-bottom:3px solid #e0a93a;padding-bottom:8px}
.linha{display:grid;grid-template-columns:1fr 1fr;border:1px solid #6c7a72}
.linha div{min-height:52px;padding:8px 10px;border:1px solid #b9c4bd;font-size:12px;color:#5d6b64}
.cheia{grid-column:1/-1}
.nota{margin-top:16px;padding:12px;background:#f1f5f0;font-size:12px;line-height:1.6}
@media print{body{margin:0}}</style></head><body>
<h1>SAMAÚMA · Ficha de coleta em papel</h1>
<p><b>Ficha nº:</b> ${numero} &nbsp;·&nbsp; <b>Responsável pela coleta:</b> ${esc(pessoa.nome)}
&nbsp;·&nbsp; <b>Veículo:</b> ${esc(pessoa.veiculo)}</p>
<div class="linha">
  <div>Estabelecimento gerador:</div><div>Data e hora da coleta:</div>
  <div>Endereço / ponto:</div><div>Material predominante:</div>
  <div>Massa observada (kg):</div><div>Unidade de destino:</div>
  <div class="cheia">Ocorrência ou justificativa:</div>
  <div>Assinatura de quem coletou:</div><div>Assinatura de quem digitou:</div>
</div>
<div class="nota"><b>Como usar.</b> Esta ficha cobre falta de aparelho, de bateria ou de conexão.
O registro é digitado depois no terminal do galpão, preservando data, horário e as duas assinaturas.
A ficha original fica arquivada e vinculada ao evento digital. Documento demonstrativo, sem validade fiscal.</div>
</body></html>`;
  const blob = new Blob([pagina], { type: 'text/html;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `ficha-coleta-${numero.toLowerCase()}.html`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  return numero;
}
