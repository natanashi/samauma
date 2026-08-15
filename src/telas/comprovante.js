/* SAMAÚMA — o comprovante de destinação.
   Tela compartilhada: gerador, catador, destinatário e Prefeitura leem
   exatamente o mesmo documento. O arquivo baixado precisa abrir sozinho, fora
   da pasta do protótipo, então os estilos vão embutidos. */

function comprovanteHtml(demanda) {
  const linha = (rotulo, valor) => `<div class="linha"><dt>${esc(rotulo)}</dt><dd>${valor}</dd></div>`;
  const coop = demanda.catador ? Catalogo.cooperativa(demanda.catador.cooperativa) : null;
  const cadastro = Catalogo.gerador(demanda.gerador.id);

  return `<div class="comprovante" id="comprovante">
    <div class="cabeca">
      <img src="assets/logo.png" alt="SAMAÚMA" class="marca-arquivo" onerror="this.style.display='none'">
      <div class="org">PREFEITURA DE PORTO VELHO · SAMAÚMA</div>
      <h2>Comprovante de destinação</h2>
      <div class="cod mono">${esc(demanda.comprovante.codigo)}</div>
      <div class="tri"><i></i><i></i><i></i></div>
    </div>
    <dl>
      ${linha('Gerador', esc(demanda.gerador.nome) + (cadastro ? ' · ' + esc(cadastro.cnpj) : ''))}
      ${linha('Ponto de coleta', esc(Catalogo.endereco(demanda.ponto)))}
      ${linha('Resíduo', esc(Catalogo.nomeResiduo(demanda.residuo)))}
      ${linha('Catador', esc(demanda.catador.nome) + (coop ? ' · ' + esc(coop.nome) : ' · autônomo'))}
      ${linha('Destinatário', esc(demanda.destino.nome))}
      ${linha('Lote no destino', esc(demanda.lote || '—'))}
      ${linha('Estimado pelo gerador', Fmt.kg(demanda.estimadoKg))}
      ${linha('Coletado em campo', Fmt.kg(demanda.coletadoKg))}
      ${linha('Verificado no destino', Fmt.kg(demanda.verificadoKg))}
      ${linha('Recuperado', Fmt.kg(Demanda.reciclado(demanda)))}
      ${linha('Rejeito para aterro', Fmt.kg(Demanda.rejeito(demanda)))}
      ${linha('Taxa de recuperação', Fmt.percentual(Demanda.taxaRecuperacao(demanda)))}
      ${linha('Destino do material', esc(Demanda.destinoFinal(demanda)))}
      ${linha('Divergência', Fmt.percentual(demanda.comprovante.divergencia))}
      ${linha('Registro fotográfico', demanda.foto ? 'anexado' : 'não anexado')}
      ${linha('Recebido em', esc(Fmt.dataHora(demanda.recebidaEm)))}
      ${linha('Emitido em', esc(Fmt.dataHora(demanda.comprovante.emitidoEm)))}
      ${demanda.conciliada ? linha('Conciliação', 'realizada pela Prefeitura') : ''}
    </dl>
    <div class="veredito"><b>Destinação comprovada</b>Gerador, catador e destinatário registraram a mesma carga.</div>
    <div class="aviso">Protótipo demonstrativo. Organizações, pessoas, documentos e valores são fictícios. O documento não representa ato administrativo, contratação ou decisão da Prefeitura de Porto Velho.</div>
  </div>`;
}

/* Estilo mínimo para o comprovante baixado. */
const ESTILO_COMPROVANTE = `
body{background:#f3f6f2;color:#2c332f;margin:0;padding:24px;line-height:1.55;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif}
.comprovante{max-width:580px;margin:0 auto;background:#fff;border:1px solid #e2e8e0;
  border-radius:18px;padding:28px 32px}
.comprovante .cabeca{text-align:center;padding-bottom:16px}
.comprovante .cabeca .marca-arquivo{width:88px;height:auto;margin-bottom:6px}
.comprovante .cabeca .org{font-size:10.5px;font-weight:700;letter-spacing:2px;color:#1f6b4a}
.comprovante .cabeca h2{font-size:19px;margin:10px 0 0;font-weight:600;letter-spacing:-.2px}
.comprovante .cabeca .cod{font-size:12.5px;color:#8a9690;margin-top:6px;letter-spacing:1.5px;
  font-family:ui-monospace,Consolas,monospace}
.comprovante .tri{display:flex;gap:5px;justify-content:center;margin:14px 0 0}
.comprovante .tri i{width:34px;height:3px;border-radius:3px}
.comprovante .tri i:nth-child(1){background:#8fbb3f}
.comprovante .tri i:nth-child(2){background:#2a6fa8}
.comprovante .tri i:nth-child(3){background:#e0a93a}
.comprovante dl{margin:20px 0 0}
.comprovante .linha{display:flex;justify-content:space-between;gap:16px;padding:10px 0;
  border-bottom:1px solid #eff3ee;font-size:13.5px}
.comprovante .linha dt{color:#8a9690;margin:0}
.comprovante .linha dd{font-weight:600;text-align:right;margin:0;font-variant-numeric:tabular-nums}
.comprovante .veredito{margin-top:20px;padding:16px;border-radius:14px;text-align:center;
  background:#eaf5ec;border:1px solid #c8e2ce;color:#1f6b4a}
.comprovante .veredito b{display:block;font-size:16px;margin-bottom:2px}
.comprovante .aviso{margin-top:18px;font-size:11.5px;color:#8a9690;line-height:1.6;
  border-top:1px solid #eff3ee;padding-top:14px}
@media print{body{background:#fff;padding:0}.comprovante{border:0}}`;
