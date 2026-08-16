/* SAMAÚMA — aplicação.
   Um estado pequeno (perfil, aba, demanda ou gerador aberto, filtro) e um único
   ponto de renderização. Toda a inteligência está no domínio; aqui só há
   navegação, eventos e o encaixe das telas. */

/* Cada perfil tem suas abas e cada aba tem sua tela. Nada de rota escondida. */
const TELAS = {
  gerador: {
    painel: () => telaGeradorPainel(),
    demandas: estado => telaGeradorDemandas(estado),
    documentos: () => telaGeradorDocumentos(),
    relatorios: () => telaGeradorRelatorios(),
    nova: () => telaNovaDemanda()
  },
  /* A cooperativa é quem recebe — as mesmas telas de sempre do destinatário,
     só que com o nome que a organização usa no dia a dia. */
  cooperativa: {
    painel: () => telaDestinoPainel(),
    fila: () => telaDestinoFila(),
    recebidas: estado => telaDestinoRecebidas(estado),
    relatorios: () => telaDestinoRelatorios()
  },
  prefeitura: {
    painel: () => telaPrefeituraPainel(),
    mapa: () => telaPrefeituraMapa(),
    geradores: estado => telaPrefeituraGeradores(estado),
    processos: estado => telaProcessos(estado)
  }
};

const App = {
  estado: { perfil: null, aba: null, demandaId: null, geradorId: null, filtro: null },

  iniciar() {
    Store.iniciar();
    document.getElementById('portaoGrade').innerHTML = telaEntrada();
    document.querySelectorAll('[data-marca]').forEach(alvo => {
      alvo.innerHTML = marca(Number(alvo.dataset.marca), alvo.dataset.forma || 'simbolo');
    });
    this.ligarEventos();
    this.registrarServiceWorker();

    /* Atalho para a apresentação: ?perfil=destinatario abre direto na área dele. */
    const busca = new URLSearchParams(location.search);
    const atalho = busca.get('perfil');
    if (PERFIS[atalho]) this.entrar(atalho, busca.get('catador'), busca.get('destino'));
  },

  /* ------------------------------------------------------------- navegação */

  entrar(perfil, catadorId, destinoId) {
    /* A cooperativa entra com os dois ao mesmo tempo — coleta e recebe. */
    if (catadorId) Sessao.entrarComoCatador(catadorId);
    if (destinoId) Sessao.entrarComoDestino(destinoId);
    Sessao.perfil = perfil;

    this.estado = { perfil, aba: PERFIS[perfil].abas[0].id, demandaId: null, geradorId: null, filtro: null };
    document.getElementById('portao').hidden = true;
    document.getElementById('app').hidden = false;
    document.body.dataset.perfil = perfil;
    this.renderizar();
  },

  sair() {
    Sessao.perfil = null;
    this.estado = { perfil: null, aba: null, demandaId: null, geradorId: null, filtro: null };
    document.getElementById('app').hidden = true;
    document.getElementById('portao').hidden = false;
    delete document.body.dataset.perfil;
  },

  irPara(aba) {
    this.estado.aba = aba;
    this.estado.demandaId = null;
    this.estado.geradorId = null;
    this.estado.filtro = null;
    this.renderizar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  abrir(id) {
    this.estado.demandaId = id;
    this.estado.geradorId = null;
    this.renderizar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  abrirGerador(id) {
    this.estado.geradorId = id;
    this.estado.demandaId = null;
    this.renderizar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  voltar() {
    if (this.estado.demandaId) this.estado.demandaId = null;
    else if (this.estado.geradorId) this.estado.geradorId = null;
    else if (this.estado.aba === 'nova') this.estado.aba = 'demandas';
    this.renderizar();
  },

  /* ----------------------------------------------------------- renderização */

  renderizar() {
    const { perfil, aba, demandaId, geradorId } = this.estado;
    if (!perfil) return;

    const perfilAtual = PERFIS[perfil];
    document.getElementById('quemNome').textContent = perfilAtual.nome;
    document.getElementById('quemOnde').textContent = this.contexto();
    document.documentElement.style.setProperty('--perfil', perfilAtual.cor);
    this.renderizarAbas(perfilAtual);

    const telas = TELAS[perfil];
    const tela = demandaId ? telaDemanda(this.estado)
      : geradorId ? telaGeradorFicha(this.estado)
        : (telas[aba] || telas[perfilAtual.abas[0].id])(this.estado);
    document.getElementById('tela').innerHTML = tela;
    inicializarMapaLeaflet(id => this.abrirGerador(id));

    const form = document.getElementById('formDemanda');
    if (form) form.addEventListener('submit', evento => this.criarDemanda(evento));
    const foto = document.getElementById('campoFoto');
    if (foto) foto.addEventListener('change', evento => this.receberFoto(evento));
  },

  /* Quem sou eu dentro deste perfil. */
  contexto() {
    switch (this.estado.perfil) {
      case 'gerador': return Sessao.cadastroGerador.nome;
      case 'cooperativa': return Sessao.destino.nome;
      default: return 'Secretaria de Meio Ambiente';
    }
  },

  /* Contadores nas abas: o número que importa para aquele perfil, ali mesmo. */
  contadores() {
    const perfil = this.estado.perfil;
    if (perfil === 'gerador') {
      const minhas = Store.doGerador(Sessao.gerador);
      return { demandas: minhas.filter(d => EM_CURSO.includes(d.status) || d.status === 'CRIADA').length };
    }
    if (perfil === 'cooperativa') {
      return { fila: Store.aCaminhoDe(Sessao.destino.id).length };
    }
    return {
      painel: Store.pendentes().length,
      geradores: Painel.geradores().filter(g => g.situacao.id !== 'REGULAR').length
    };
  },

  renderizarAbas(perfilAtual) {
    const contadores = this.contadores();
    const botoes = perfilAtual.abas.map(a => {
      const n = contadores[a.id];
      const ativa = this.estado.aba === a.id || (this.estado.aba === 'nova' && a.id === 'demandas');
      return `<button class="${ativa ? 'on' : ''}" data-acao="aba" data-aba="${a.id}" ${ativa ? 'aria-current="page"' : ''}>
        <span>${a.rotulo}</span>${n ? `<span class="n num">${n}</span>` : ''}</button>`;
    }).join('');
    document.getElementById('abas').innerHTML = botoes;
    document.getElementById('abasMobile').innerHTML = botoes;
  },

  /* ------------------------------------------------------------------ ações */

  criarDemanda(evento) {
    evento.preventDefault();
    const kg = Number(document.getElementById('campoQuantidade').value);
    if (!kg || kg <= 0) return this.recado('Informe uma quantidade estimada válida.');

    const demanda = Store.criar({
      geradorId: Sessao.gerador,
      residuo: document.getElementById('campoResiduo').value,
      estimadoKg: kg,
      ponto: document.getElementById('campoPonto').value,
      prazo: new Date(document.getElementById('campoPrazo').value + 'T17:00:00').toISOString(),
      observacao: document.getElementById('campoObservacao').value.trim()
    });
    Store.publicar(demanda.id);
    this.estado.aba = 'demandas';
    this.abrir(demanda.id);
    this.recado(`Demanda ${demanda.id.replace('DEM-', '#')} publicada. Destino previsto: ${demanda.destino.nome}.`);
  },

  executar(acao, id) {
    try {
      switch (acao) {
        case 'publicar':
          Store.publicar(id);
          this.recado('Demanda publicada. Já aparece para os catadores.');
          break;
        case 'aceitar':
          Store.aceitar(id, Sessao.catador);
          this.recado('Demanda aceita. Ela está em "Minhas coletas".');
          break;
        case 'iniciar':
          Store.iniciarColeta(id);
          this.recado('Coleta iniciada.');
          break;
        case 'peso': {
          const kg = Number(document.getElementById('campoPeso').value);
          if (!kg || kg <= 0) return this.recado('Informe um peso válido.');
          Store.registrarPeso(id, kg);
          this.recado(`${Fmt.kg(kg)} registrados.`);
          break;
        }
        case 'finalizar': {
          const demanda = Store.finalizarColeta(id);
          this.recado(`Carga a caminho de ${demanda.destino.nome}. Agora quem confirma é quem recebe.`);
          break;
        }
        case 'receber': {
          const kg = Number(document.getElementById('campoRecebido').value);
          if (!kg || kg <= 0) return this.recado('Informe a massa pesada na balança.');
          const demanda = Store.receber(id, {
            kg,
            rejeitoKg: Number(document.getElementById('campoRejeito').value) || 0,
            destinoFinal: document.getElementById('campoDestinoFinal').value.trim(),
            lote: document.getElementById('campoLote').value.trim(),
            nota: document.getElementById('campoNotaDestino').value.trim()
          });
          this.recado(demanda.status === 'PENDENCIA'
            ? 'Divergência acima da tolerância: pendência aberta para a Prefeitura.'
            : `Recebimento confirmado. ${Fmt.kg(Demanda.reciclado(demanda))} recuperados e comprovante emitido.`);
          break;
        }
        case 'conciliar': {
          const kg = Number(document.getElementById('campoConciliado').value);
          if (!kg || kg <= 0) return this.recado('Informe a massa aceita.');
          Store.conciliar(id, { kgAceito: kg, nota: document.getElementById('campoNota').value.trim() });
          this.recado('Divergência conciliada e comprovante emitido.');
          break;
        }
      }
      this.renderizar();
    } catch (erro) {
      this.recado(erro.message);
    }
  },

  /* ------------------------------------------------------------- relatórios */

  /* O escopo vem do botão: cada área exporta o próprio recorte, não a demanda
     aberta. O identificador da sessão entra aqui, não no serviço. */
  opcoesDoEscopo(escopo) {
    if (escopo === 'catador') return { id: Sessao.catador.id };
    if (escopo === 'destinatario') return { id: Sessao.destino.id };
    if (escopo === 'gerador' || escopo === 'mensal') return { id: Sessao.gerador };
    return {};
  },

  baixarCsv(escopo) {
    try {
      const r = Relatorio.baixarCsv(escopo, this.opcoesDoEscopo(escopo));
      this.recado(`${r.arquivo} · ${r.linhas} linha(s) exportada(s).`);
    } catch (erro) {
      this.recado('Não foi possível gerar o CSV: ' + erro.message);
    }
  },

  imprimirRelatorio(escopo) {
    try {
      const r = Relatorio.imprimir(escopo, this.opcoesDoEscopo(escopo));
      this.recado(`Relatório com ${r.processos} processo(s) pronto para impressão ou PDF.`);
    } catch (erro) {
      this.recado('Não foi possível gerar o relatório: ' + erro.message);
    }
  },

  /* ------------------------------------------------------------------ foto */

  abrirSeletorDeFoto() {
    const campo = document.getElementById('campoFoto');
    if (campo) campo.click();
  },

  receberFoto(evento) {
    const arquivo = evento.target.files && evento.target.files[0];
    const id = evento.target.dataset.id;
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = () => {
      const imagem = new Image();
      imagem.onload = () => {
        Store.anexarFoto(id, this.reduzirImagem(imagem));
        this.renderizar();
        this.recado('Registro fotográfico anexado à demanda.');
      };
      imagem.onerror = () => {
        Store.anexarFoto(id, 'demonstrativa');
        this.renderizar();
      };
      imagem.src = leitor.result;
    };
    leitor.onerror = () => this.recado('Não foi possível ler a foto. Tente outro arquivo.');
    leitor.readAsDataURL(arquivo);
  },

  /* Miniatura pequena: o protótipo guarda a evidência no navegador, sem servidor. */
  reduzirImagem(imagem, lado = 320) {
    const escala = Math.min(1, lado / Math.max(imagem.width, imagem.height));
    const tela = document.createElement('canvas');
    tela.width = Math.round(imagem.width * escala);
    tela.height = Math.round(imagem.height * escala);
    tela.getContext('2d').drawImage(imagem, 0, 0, tela.width, tela.height);
    return tela.toDataURL('image/jpeg', 0.6);
  },

  /* ------------------------------------------------------------ comprovante */

  verComprovante(id) {
    const demanda = Store.obter(id);
    if (!demanda || !demanda.comprovante) return;
    const folha = document.getElementById('folhaConteudo');
    folha.innerHTML = comprovanteHtml(demanda);
    folha.dataset.id = id;
    document.getElementById('sobreposicao').hidden = false;
  },

  fecharComprovante() {
    document.getElementById('sobreposicao').hidden = true;
  },

  imprimirComprovante() {
    document.body.classList.add('somente-comprovante');
    window.print();
    document.body.classList.remove('somente-comprovante');
  },

  baixarComprovante() {
    const id = document.getElementById('folhaConteudo').dataset.id;
    const demanda = Store.obter(id);
    if (!demanda) return;
    const pagina = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Comprovante ${demanda.comprovante.codigo} · SAMAÚMA</title>
<style>${ESTILO_COMPROVANTE}</style></head><body>
${comprovanteHtml(demanda)}</body></html>`;
    const blob = new Blob([pagina], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `comprovante-${demanda.comprovante.codigo.toLowerCase()}.html`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    this.recado('Comprovante baixado.');
  },

  /* ------------------------------------------------------------------ apoio */

  reiniciar() {
    Store.reiniciar();
    this.estado.demandaId = null;
    this.estado.geradorId = null;
    this.estado.filtro = null;
    if (this.estado.perfil) this.estado.aba = PERFIS[this.estado.perfil].abas[0].id;
    this.renderizar();
    this.recado('Demonstração reiniciada com os dados iniciais.');
  },

  recado(texto) {
    const caixa = document.getElementById('recado');
    caixa.textContent = texto;
    caixa.classList.add('on');
    clearTimeout(this._recadoTimer);
    this._recadoTimer = setTimeout(() => caixa.classList.remove('on'), 4200);
  },

  ligarEventos() {
    document.addEventListener('click', evento => {
      const alvo = evento.target.closest('[data-acao]');
      if (!alvo) return;
      const { acao, id, perfil, catador, destino, aba, filtro, escopo } = alvo.dataset;

      switch (acao) {
        case 'perfil': this.entrar(perfil, catador, destino); break;
        case 'trocar': this.sair(); break;
        case 'aba': this.irPara(aba); break;
        case 'nova': this.irPara('nova'); break;
        case 'voltar': this.voltar(); break;
        case 'abrir': this.abrir(id); break;
        case 'gerador': this.abrirGerador(id); break;
        case 'filtro':
          this.estado.filtro = filtro;
          this.renderizar();
          break;
        case 'foto': this.abrirSeletorDeFoto(); break;
        case 'comprovante': this.verComprovante(id); break;
        case 'fechar': this.fecharComprovante(); break;
        case 'imprimir': this.imprimirComprovante(); break;
        case 'baixar': this.baixarComprovante(); break;
        case 'csv': this.baixarCsv(escopo); break;
        case 'pdf': this.imprimirRelatorio(escopo); break;
        case 'reiniciar': this.reiniciar(); break;
        default: this.executar(acao, id);
      }
    });

    /* Linha de tabela e marca no mapa também abrem com o teclado. */
    document.addEventListener('keydown', evento => {
      if (evento.key === 'Escape' && !document.getElementById('sobreposicao').hidden) {
        this.fecharComprovante();
        return;
      }
      if (evento.key !== 'Enter' && evento.key !== ' ') return;
      const alvo = evento.target.closest('[data-acao="abrir"], [data-acao="gerador"]');
      if (!alvo || alvo.tagName === 'BUTTON') return;
      evento.preventDefault();
      if (alvo.dataset.acao === 'gerador') this.abrirGerador(alvo.dataset.id);
      else this.abrir(alvo.dataset.id);
    });

    document.getElementById('sobreposicao').addEventListener('click', evento => {
      if (evento.target.id === 'sobreposicao') this.fecharComprovante();
    });
  },

  registrarServiceWorker() {
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        /* offline é um extra, não um requisito */
      });
    }
  }
};

window.addEventListener('DOMContentLoaded', () => App.iniciar());
