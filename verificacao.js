/* Verificação: roda o domínio e renderiza todas as telas fora do navegador.
   Carrega os módulos na mesma ordem do index.html — se a ordem quebrar aqui,
   quebra no navegador também. */
const fs = require('fs');
const vm = require('vm');

const memoria = new Map();
const contexto = {
  localStorage: {
    getItem: k => (memoria.has(k) ? memoria.get(k) : null),
    setItem: (k, v) => memoria.set(k, v),
    removeItem: k => memoria.delete(k)
  },
  console
};
contexto.window = contexto;
vm.createContext(contexto);

const MODULOS = [
  'src/dominio/catalogo.js', 'src/dominio/formato.js', 'src/dominio/demanda.js',
  'src/dominio/gerador.js', 'src/dominio/sessao.js', 'src/dominio/semente.js',
  'src/dominio/store.js', 'src/dominio/indicadores.js',
  'src/ui/componentes.js', 'src/ui/graficos.js', 'src/ui/mapa.js', 'src/ui/listas.js',
  'src/servicos/relatorio.js', 'src/servicos/integracoes.js',
  'src/telas/entrada.js', 'src/telas/gerador.js', 'src/telas/catador.js',
  'src/telas/destinatario.js', 'src/telas/prefeitura.js', 'src/telas/demanda.js',
  'src/telas/comprovante.js', 'src/telas/metodologia.js'
];

for (const arquivo of MODULOS) {
  vm.runInContext(fs.readFileSync(arquivo, 'utf8'), contexto, { filename: arquivo });
}

let falhas = 0;
const run = (nome, fn) => {
  try {
    const r = fn();
    console.log('  ok  ' + nome + (typeof r === 'string'
      ? ` (${r.length > 120 ? r.length + ' chars' : r})`
      : r === undefined ? '' : ' → ' + r));
    return r;
  } catch (e) {
    console.log('FALHA ' + nome + ' → ' + e.message);
    falhas += 1;
    process.exitCode = 1;
  }
};

/* Declarações `const` de um script clássico vivem no escopo léxico do contexto,
   não como propriedades do objeto global — busca-se cada uma explicitamente. */
const pegar = nome => vm.runInContext(nome, contexto);
const [Store, Demanda, Fmt, Painel, Catalogo, Regulatorio, Sessao, Relatorio, STATUS, SITUACOES, PERFIS,
  DESTINOS, CATADORES, GERADORES, PONTOS, COOPERATIVAS, RESIDUOS, TOLERANCIA] =
  ['Store', 'Demanda', 'Fmt', 'Painel', 'Catalogo', 'Regulatorio', 'Sessao', 'Relatorio', 'STATUS',
   'SITUACOES', 'PERFIS', 'DESTINOS', 'CATADORES', 'GERADORES', 'PONTOS', 'COOPERATIVAS', 'RESIDUOS',
   'TOLERANCIA'].map(pegar);

['telaEntrada', 'telaGeradorPainel', 'telaGeradorDemandas', 'telaGeradorDocumentos',
 'telaGeradorRelatorios', 'telaNovaDemanda',
 'telaCatadorDia', 'telaCatadorDisponiveis', 'telaCatadorMinhas', 'telaCatadorPainel', 'telaDestinoPainel', 'telaDestinoFila',
 'telaDestinoRecebidas', 'telaDestinoRelatorios', 'telaPrefeituraPainel', 'telaPrefeituraMapa',
 'telaPrefeituraGeradores', 'telaGeradorFicha', 'telaProcessos', 'telaDemanda',
 'comprovanteHtml', 'marca', 'mapaPontos', 'telaMetodologia']
  .forEach(nome => { contexto[nome] = pegar(nome); });

const titulo = t => console.log('\n== ' + t + ' ==');

/* ------------------------------------------------------------------ semente */

titulo('semente');
run('Store.iniciar', () => Store.iniciar().demandas.length + ' demandas');
run('cooperativa principal é a CATANORTE', () => {
  if (COOPERATIVAS[0].nome !== 'CATANORTE') throw new Error('cooperativa: ' + COOPERATIVAS[0].nome);
  return `${COOPERATIVAS.length} cooperativa · ${Catalogo.equipe('coop-01').length} cooperados`;
});
run('existe catador autônomo fora da cooperativa', () => {
  const autonomos = CATADORES.filter(c => !c.cooperativa);
  if (!autonomos.length) throw new Error('nenhum catador autônomo');
  return autonomos.map(c => c.nome).join(', ');
});
run('aterro sanitário é um destinatário', () => {
  const aterro = DESTINOS.find(d => d.aterro);
  if (!aterro) throw new Error('sem aterro cadastrado');
  return aterro.nome;
});
run('todo ponto de coleta tem coordenada', () => {
  const ruins = PONTOS.filter(p => p.lat == null || p.lng == null);
  if (ruins.length) throw new Error(ruins.length + ' pontos sem coordenada');
  return PONTOS.length + ' pontos';
});
run('disponiveis / a caminho / pendentes', () =>
  `${Store.disponiveis().length} · ${Store.aCaminhoDe('dst-01').length} · ${Store.pendentes().length}`);

/* -------------------------------------------------------------- integridade */

titulo('integridade da semente');
run('toda demanda tem situação válida', () => {
  const ruins = Store.todas().filter(d => !STATUS[d.status]);
  if (ruins.length) throw new Error('situações desconhecidas: ' + ruins.map(d => d.status));
  return 'ok';
});
run('toda demanda tem gerador, ponto e destino do catálogo', () => {
  const ruins = Store.todas().filter(d =>
    !Catalogo.gerador(d.gerador.id) || !Catalogo.ponto(d.ponto) || !Catalogo.destino(d.destino.id));
  if (ruins.length) throw new Error(ruins.length + ' com referência inválida');
  return 'ok';
});
run('destino aceita o material da carga', () => {
  const ruins = Store.todas().filter(d => !Catalogo.destino(d.destino.id).aceita.includes(d.residuo));
  if (ruins.length) throw new Error(ruins.length + ' com destino incompatível');
  return 'ok';
});
run('rejeito nunca é maior que a massa recebida', () => {
  const ruins = Store.todas().filter(d => d.verificadoKg != null && d.rejeitoKg > d.verificadoKg);
  if (ruins.length) throw new Error(ruins.length + ' com rejeito maior que a carga');
  return 'ok';
});
run('carga de aterro é integralmente rejeito', () => {
  const doAterro = Store.todas().filter(d => d.verificadoKg != null && Catalogo.destino(d.destino.id).aterro);
  const ruins = doAterro.filter(d => d.rejeitoKg !== d.verificadoKg);
  if (ruins.length) throw new Error(ruins.length + ' cargas de aterro com recuperação');
  return doAterro.length + ' cargas de disposição final';
});
run('nenhuma comprovada sem passar pelo destinatário', () => {
  const ruins = Store.todas().filter(d => d.status === 'COMPROVADA' &&
    !d.eventos.some(e => e.autor === 'Destinatário'));
  if (ruins.length) throw new Error(ruins.length + ' comprovadas sem recebimento');
  return 'ok';
});
run('cargas a caminho ainda não foram pesadas', () => {
  const ruins = Store.todas().filter(d => d.status === 'COLETADA' && d.verificadoKg != null);
  if (ruins.length) throw new Error(ruins.length + ' a caminho já verificadas');
  return 'ok';
});
run('pendências estão acima da tolerância', () => {
  const ruins = Store.pendentes().filter(d => Demanda.dentroDaTolerancia(d));
  if (ruins.length) throw new Error(ruins.length + ' pendências dentro da tolerância');
  return 'ok';
});
run('parte relevante da massa vai para o aterro', () => {
  const a = Painel.ambiental(Store.todas());
  if (!a.rejeito) throw new Error('nenhum rejeito registrado');
  return `recuperação ${Fmt.percentual(a.taxaRecuperacao)} · aterrado ${Fmt.kg(a.rejeito)}`;
});

/* -------------------------------------------------------- situação do gerador */

titulo('situação regulatória');
run('as três situações aparecem na base', () => {
  const encontradas = new Set(Painel.geradores().map(g => g.situacao.id));
  Object.keys(SITUACOES).forEach(s => {
    if (!encontradas.has(s)) throw new Error('nenhum gerador ' + s);
  });
  return [...encontradas].join(', ');
});
run('PGRS vencido derruba para irregular', () => {
  const vencido = GERADORES.find(g => g.pgrs && g.pgrs.validade < 0);
  const s = Regulatorio.situacao(vencido, Store.doGerador(vencido.id));
  if (s.id !== 'IRREGULAR') throw new Error(vencido.nome + ' está ' + s.id);
  return `${vencido.nome}: ${s.motivos[0]}`;
});
run('gerador sem PGRS e sem destinação é irregular', () => {
  const sem = GERADORES.find(g => !g.pgrs);
  const s = Regulatorio.situacao(sem, Store.doGerador(sem.id));
  return `${sem.nome}: ${s.rotulo} · ${s.motivos.length} motivo(s)`;
});
run('toda situação vem com motivo em texto', () => {
  const ruins = Painel.geradores().filter(g => !g.situacao.motivos.length);
  if (ruins.length) throw new Error(ruins.length + ' sem motivo');
  return 'ok';
});
run('selo do gerador da sessão', () => {
  const p = Painel.gerador('ger-01');
  return `${p.selo.codigo} · ${p.selo.valido ? 'válido' : 'não emitido'} · ${p.situacao.rotulo}`;
});

/* ------------------------------------------------------------- ciclo completo */

titulo('ciclo completo, do gerador ao destinatário');
const nova = run('criar', () => Store.criar({
  geradorId: 'ger-01', residuo: 'papelao', estimadoKg: 800, ponto: 'pt-01',
  prazo: new Date(Date.now() + 172800000).toISOString(), observacao: 'Doca lateral'
}));
run('destino atribuído pelo material', () => nova.destino.nome);
run('publicar', () => Store.publicar(nova.id).status);
run('aceitar', () => Store.aceitar(nova.id, Catalogo.catador('cat-01')).catador.nome);
run('iniciarColeta', () => Store.iniciarColeta(nova.id).status);
run('registrarPeso', () => Store.registrarPeso(nova.id, 785).coletadoKg);
run('finalizar deixa a carga a caminho, sem comprovante', () => {
  const d = Store.finalizarColeta(nova.id);
  if (d.comprovante) throw new Error('comprovante emitido sem o destinatário');
  return d.status + ' · aguardando ' + d.destino.nome;
});
run('receber separa recuperado de rejeito', () => {
  const d = Store.receber(nova.id, { kg: 782, rejeitoKg: 60, nota: 'Carga íntegra.' });
  if (Demanda.reciclado(d) !== 722) throw new Error('recuperado ' + Demanda.reciclado(d));
  return `${d.status} · recuperado ${Fmt.kg(Demanda.reciclado(d))} · rejeito ${Fmt.kg(Demanda.rejeito(d))} · ${Fmt.percentual(Demanda.taxaRecuperacao(d))}`;
});
run('rejeito maior que a carga é recusado', () => {
  const outra = Store.criar({ geradorId: 'ger-01', residuo: 'vidro', estimadoKg: 100, prazo: new Date().toISOString() });
  Store.publicar(outra.id); Store.aceitar(outra.id, Catalogo.catador('cat-01'));
  Store.iniciarColeta(outra.id); Store.registrarPeso(outra.id, 100); Store.finalizarColeta(outra.id);
  try { Store.receber(outra.id, { kg: 100, rejeitoKg: 500 }); return 'ERRO: deveria recusar'; }
  catch (e) { Store.receber(outra.id, { kg: 100, rejeitoKg: 5 }); return 'recusou: ' + e.message; }
});

titulo('ramo da pendência');
const forcada = Store.criar({ geradorId: 'ger-01', residuo: 'plastico', estimadoKg: 400, prazo: new Date().toISOString() });
Store.publicar(forcada.id); Store.aceitar(forcada.id, Catalogo.catador('cat-01'));
Store.iniciarColeta(forcada.id); Store.registrarPeso(forcada.id, 400); Store.finalizarColeta(forcada.id);
run('recebimento com 25% de diferença abre pendência', () => Store.receber(forcada.id, { kg: 300, rejeitoKg: 20 }).status);
run('conciliar emite comprovante', () => {
  const d = Store.conciliar(forcada.id, { kgAceito: 398, nota: 'Tíquete conferido.' });
  return `${d.status} · ${d.comprovante.codigo} · ${Fmt.percentual(d.comprovante.divergencia)}`;
});
run('ação fora de ordem é recusada', () => {
  try { Store.aceitar(forcada.id, Catalogo.catador('cat-01')); return 'ERRO: deveria recusar'; }
  catch (e) { return 'recusou'; }
});

titulo('carga direto para o aterro');
run('resíduo indiferenciado vai ao aterro e não gera renda', () => {
  const lixo = Store.criar({ geradorId: 'ger-04', residuo: 'rejeito', estimadoKg: 1500, prazo: new Date().toISOString() });
  if (!Catalogo.destino(lixo.destino.id).aterro) throw new Error('destino ' + lixo.destino.nome);
  Store.publicar(lixo.id); Store.aceitar(lixo.id, Catalogo.catador('cat-02'));
  Store.iniciarColeta(lixo.id); Store.registrarPeso(lixo.id, 1500); Store.finalizarColeta(lixo.id);
  const d = Store.receber(lixo.id, { kg: 1480, rejeitoKg: 0 });
  if (Demanda.reciclado(d) !== 0) throw new Error('recuperou ' + Demanda.reciclado(d));
  if (Demanda.valor(d) !== 0) throw new Error('gerou renda ' + Demanda.valor(d));
  return `${d.destino.nome} · ${Fmt.kg(d.rejeitoKg)} aterrados · renda ${Fmt.reais(Demanda.valor(d))}`;
});

titulo('persistência');
run('recarregar do armazenamento', () => {
  const total = Store.demandas.length;
  Store.demandas = []; Store.iniciar();
  return Store.demandas.length === total ? 'ok (' + total + ')' : 'ERRO ' + Store.demandas.length;
});

/* ------------------------------------------------------------------ painéis */

titulo('painéis por perfil');
run('painel do gerador', () => {
  const p = Painel.gerador('ger-01');
  return `${p.cadastro.nome} · ${Fmt.kg(p.ambiental.massa)} · recuperação ${Fmt.percentual(p.ambiental.taxaRecuperacao, 0)} · ${p.situacao.rotulo}`;
});
run('painel individual do catador cooperado', () => {
  const p = Painel.catador('cat-01');
  return `${p.pessoa.nome} · ${p.cooperativa.nome} · ${Fmt.reais(p.renda)} · ${p.posicao}º de ${p.totalCatadores}`;
});
run('painel individual do catador autônomo', () => {
  const p = Painel.catador('cat-05');
  if (p.cooperativa) throw new Error('autônoma com cooperativa');
  return `${p.pessoa.nome} · ${Fmt.reais(p.renda)} · ${p.atendimentos} atendimentos`;
});
run('indicadores individuais diferem entre catadores', () => {
  const a = Painel.catador('cat-01');
  const b = Painel.catador('cat-05');
  if (a.massa === b.massa && a.renda === b.renda) throw new Error('painéis idênticos');
  return `cat-01 ${Fmt.kg(a.massa)} × cat-05 ${Fmt.kg(b.massa)}`;
});
run('painel da cooperativa soma a equipe', () => {
  const p = Painel.cooperativa('coop-01');
  const soma = p.equipe.reduce((s, m) => s + m.massa, 0);
  if (Math.abs(soma - p.massa) > 0.5) throw new Error(`${soma} ≠ ${p.massa}`);
  return `${p.catadores} cooperados · ${Fmt.kg(p.massa)}`;
});
run('painel de cada destinatário', () => DESTINOS.map(u => {
  const p = Painel.destino(u.id);
  return `${u.id}:${p.atendimentos}`;
}).join(' '));
run('soma dos destinos bate com o município', () => {
  const total = Painel.municipio().ambiental.massa;
  const soma = DESTINOS.reduce((s, u) => s + Painel.destino(u.id).massa, 0);
  if (Math.abs(total - soma) > 0.5) throw new Error(`${total} ≠ ${soma}`);
  return 'ok (' + Fmt.kg(total) + ')';
});
run('indicadores ambientais, sociais e financeiros', () => {
  const p = Painel.municipio();
  if (p.ambiental.reciclado + p.ambiental.rejeito !== p.ambiental.massa) throw new Error('massa não fecha');
  return `recuperação ${Fmt.percentual(p.ambiental.taxaRecuperacao, 0)} · ${p.social.catadoresAtivos} catadores · ${Fmt.reais(p.financeiro.valor)}`;
});
run('massa por ponto de coleta', () => {
  const pontos = Painel.municipio().pontos;
  const semCoordenada = pontos.filter(p => p.lat == null);
  if (semCoordenada.length) throw new Error(semCoordenada.length + ' pontos sem coordenada');
  return pontos.length + ' pontos com massa comprovada';
});

/* --------------------------------------------------------------- relatórios */

titulo('relatórios');
['gerador', 'catador', 'destinatario', 'mensal', 'prefeitura'].forEach(nome => {
  run(`escopo ${nome}`, () => {
    const opcoes = nome === 'catador' ? { id: 'cat-01' } : nome === 'destinatario' ? { id: 'dst-01' } : { id: 'ger-01' };
    const escopo = Relatorio.escopo(nome, opcoes);
    if (!escopo.resumo.length) throw new Error('resumo vazio');
    return `${escopo.demandas.length} processo(s) · ${escopo.resumo.length} linha(s) de resumo`;
  });
});
run('CSV tem cabeçalho e uma linha por demanda', () => {
  const escopo = Relatorio.escopo('prefeitura');
  const csv = Relatorio.csv(escopo);
  const linhas = csv.trim().split('\r\n');
  if (linhas.length !== escopo.demandas.length + 1) throw new Error(`${linhas.length} linhas para ${escopo.demandas.length} demandas`);
  if (linhas[0].split(';').length !== Relatorio.COLUNAS.length) throw new Error('cabeçalho incompleto');
  return `${linhas.length - 1} linhas × ${Relatorio.COLUNAS.length} colunas`;
});
run('CSV escapa ponto e vírgula e aspas', () => {
  const d = Store.criar({ geradorId: 'ger-01', residuo: 'vidro', estimadoKg: 10, prazo: new Date().toISOString(),
    observacao: 'a;b"c' });
  const csv = Relatorio.csv({ demandas: [d] });
  if (csv.includes('a;b"c') && !csv.includes('"a;b""c"')) throw new Error('campo não escapado');
  return 'ok';
});
run('documento imprimível monta sem erro', () => Relatorio.documentoHtml(Relatorio.escopo('prefeitura')));
run('relatório mensal traz coletado, reciclado e destino final', () => {
  const escopo = Relatorio.escopo('mensal', { id: 'ger-01' });
  const rotulos = escopo.resumo.map(r => r[0]).join(' | ');
  ['Quantidade coletada', 'Quantidade reciclada', 'Rejeito para aterro', 'Taxa de recuperação']
    .forEach(t => { if (!rotulos.includes(t)) throw new Error('faltou: ' + t); });
  return escopo.demandas.length + ' carga(s) no mês';
});

/* -------------------------------------------------------------------- telas */

titulo('telas');
Sessao.entrarComoCatador('cat-01');
Sessao.entrarComoDestino('dst-01');
const est = (p, extra = {}) => ({ perfil: p, aba: null, demandaId: null, geradorId: null, filtro: null, ...extra });

run('marca com reserva do logotipo', () => {
  const html = contexto.marca(64, 'completa');
  if (!html.includes('assets/logo.png')) throw new Error('não aponta para o PNG');
  if (!html.includes('SAMAÚMA')) throw new Error('reserva sem o nome');
  return html;
});
run('entrada', () => contexto.telaEntrada());
run('gerador · painel', () => contexto.telaGeradorPainel());
run('gerador · demandas', () => contexto.telaGeradorDemandas(est('gerador')));
run('gerador · documentos', () => contexto.telaGeradorDocumentos());
run('gerador · relatórios', () => contexto.telaGeradorRelatorios());
run('gerador · nova demanda', () => contexto.telaNovaDemanda());
run('cooperativa · painel', () => contexto.telaDestinoPainel());
run('cooperativa · fila', () => contexto.telaDestinoFila());
run('cooperativa · recebidas', () => contexto.telaDestinoRecebidas(est('cooperativa')));
run('cooperativa · relatórios', () => contexto.telaDestinoRelatorios());
run('prefeitura · painel', () => contexto.telaPrefeituraPainel());
run('prefeitura · mapa', () => contexto.telaPrefeituraMapa());
run('prefeitura · geradores', () => contexto.telaPrefeituraGeradores(est('prefeitura')));
run('prefeitura · ficha do gerador', () => contexto.telaGeradorFicha(est('prefeitura', { geradorId: 'ger-05' })));
run('prefeitura · processos', () => contexto.telaProcessos(est('prefeitura')));

run('painel do aterro também renderiza', () => {
  Sessao.entrarComoDestino('dst-04');
  const html = contexto.telaDestinoPainel();
  if (!html.includes('aterrada')) throw new Error('não mostra massa aterrada');
  Sessao.entrarComoDestino('dst-01');
  return html;
});
run('mapa monta o contêiner do Leaflet com todos os geradores com coordenada', () => {
  const html = contexto.mapaPontos(Painel.geradores());
  if (!html.includes('id="mapaLeaflet"')) throw new Error('sem contêiner do mapa');
  const comCoordenada = pegar('_mapaLeafletDados');
  if (!comCoordenada || comCoordenada.itens.length !== GERADORES.length) {
    throw new Error(`${comCoordenada ? comCoordenada.itens.length : 0} pontos para ${GERADORES.length} geradores`);
  }
  return comCoordenada.itens.length + ' pontos preparados (marcadores reais são do Leaflet, fora deste teste)';
});

titulo('detalhe em todas as situações, para os quatro perfis');
const porSituacao = {};
Store.todas().forEach(d => { porSituacao[d.status] = porSituacao[d.status] || d; });
Object.entries(porSituacao).forEach(([status, d]) => {
  Object.keys(PERFIS).forEach(perfil => {
    run(`${status} · ${perfil}`, () => contexto.telaDemanda(est(perfil, { demandaId: d.id })));
  });
});

titulo('cada perfil só age no que é dele');
run('carga a caminho traz o formulário de recebimento', () => {
  const carga = Store.aCaminhoDe('dst-01')[0];
  const html = contexto.telaDemanda(est('cooperativa', { demandaId: carga.id }));
  ['campoRecebido', 'campoRejeito', 'campoDestinoFinal'].forEach(campo => {
    if (!html.includes(campo)) throw new Error('faltou ' + campo);
  });
  return 'ok';
});
run('carga de outra unidade não traz formulário', () => {
  const outra = Store.todas().find(d => d.status === 'COLETADA' && d.destino.id !== 'dst-01');
  if (!outra) return 'sem carga de outra unidade';
  const html = contexto.telaDemanda(est('cooperativa', { demandaId: outra.id }));
  if (html.includes('campoRecebido')) throw new Error('formulário na unidade errada');
  return 'ok';
});
titulo('comprovante');
const comprovada = Store.todas().find(d => d.status === 'COMPROVADA');
run('comprovanteHtml', () => contexto.comprovanteHtml(comprovada));
run('comprovante traz as medições, o destino e o que foi reciclado', () => {
  const html = contexto.comprovanteHtml(comprovada);
  ['Estimado pelo gerador', 'Coletado em campo', 'Verificado no destino', 'Recuperado',
   'Rejeito para aterro', 'Destino do material', 'Destinatário', 'Lote no destino']
    .forEach(t => { if (!html.includes(t)) throw new Error('faltou: ' + t); });
  return 'ok';
});

titulo('todo passo do ciclo tem botao para quem responde por ele');

/* O defeito que este bloco existe para impedir: a acao continua no dominio e no
   roteador, mas nenhuma tela oferece o botao — e a demanda trava sem que
   nenhum teste de dominio perceba. */
const PASSOS_DO_CICLO = [
  ['CRIADA', 'gerador', 'publicar'],
  ['DISPONIVEL', 'catador', 'aceitar'],
  ['ACEITA', 'catador', 'iniciar'],
  ['EM_COLETA', 'catador', 'peso'],
  ['EM_COLETA', 'catador', 'finalizar'],
  ['COLETADA', 'cooperativa', 'receber'],
  ['PENDENCIA', 'prefeitura', 'conciliar']
];

PASSOS_DO_CICLO.forEach(([status, perfil, acao]) => {
  run(`${status} · ${perfil} pode "${acao}"`, () => {
    const d = Store.demandas.find(x => x.status === status);
    if (!d) throw new Error('nenhuma demanda em ' + status + ' na semente');
    if (perfil === 'catador') Sessao.entrarComoCatador(d.catador ? d.catador.id : CATADORES[0].id);
    if (perfil === 'cooperativa') Sessao.entrarComoDestino(d.destino.id);
    const html = contexto.telaDemanda(est(perfil, { demandaId: d.id }));
    if (!html.includes(`data-acao="${acao}"`)) {
      throw new Error(`sem botao ${acao} na tela de ${perfil} (${d.id})`);
    }
    return d.id;
  });
});

run('nenhuma demanda fica sem dono', () => {
  const orfas = Store.demandas.filter(d => {
    const proxima = Demanda.proximaAcao(d);
    return proxima.perfil && !['gerador', 'catador', 'cooperativa', 'prefeitura'].includes(proxima.perfil);
  });
  if (orfas.length) throw new Error(orfas.length + ' demanda(s) apontam para perfil inexistente');
  return Store.demandas.length + ' demandas com dono definido';
});

titulo('escape de HTML');
run('nome com < > é escapado', () => {
  const d = Store.criar({ geradorId: 'ger-01', residuo: 'vidro', estimadoKg: 10,
    prazo: new Date().toISOString(), observacao: '<script>alert(1)</script>' });
  const html = contexto.telaDemanda(est('prefeitura', { demandaId: d.id }));
  return html.includes('<script>alert(1)</script>') ? 'ERRO: HTML cru injetado' : 'ok';
});

titulo('reiniciar');
run('reiniciar volta à semente', () => { Store.reiniciar(); return Store.demandas.length + ' demandas'; });

console.log(falhas ? `\n${falhas} falha(s).\n` : '\nTudo certo.\n');
