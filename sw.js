/* Cache do protótipo. Sem dependências externas: o app inteiro cabe nestes arquivos. */
const CACHE = 'samauma-2026-v50';
const VERSAO = '?v=20260817d';

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/logo.png',
  './styles.css' + VERSAO,

  './src/dominio/catalogo.js' + VERSAO,
  './src/dominio/conta.js' + VERSAO,
  './src/dominio/cadastro.js' + VERSAO,
  './src/dominio/formato.js' + VERSAO,
  './src/dominio/demanda.js' + VERSAO,
  './src/dominio/gerador.js' + VERSAO,
  './src/dominio/sessao.js' + VERSAO,
  './src/dominio/semente.js' + VERSAO,
  './src/dominio/store.js' + VERSAO,
  './src/dominio/indicadores.js' + VERSAO,

  './src/ui/componentes.js' + VERSAO,
  './src/ui/graficos.js' + VERSAO,
  './src/ui/mapa.js' + VERSAO,
  './src/ui/listas.js' + VERSAO,

  './src/servicos/relatorio.js' + VERSAO,
  './src/servicos/integracoes.js' + VERSAO,

  './src/telas/entrada.js' + VERSAO,
  './src/telas/cadastro.js' + VERSAO,
  './src/telas/acesso.js' + VERSAO,
  './src/telas/gerador.js' + VERSAO,
  './src/telas/catador.js' + VERSAO,
  './src/telas/destinatario.js' + VERSAO,
  './src/telas/prefeitura.js' + VERSAO,
  './src/telas/demanda.js' + VERSAO,
  './src/telas/comprovante.js' + VERSAO,
  './src/telas/metodologia.js' + VERSAO,

  './src/app.js' + VERSAO
];

/* A logo pode ainda não existir na pasta: um arquivo faltando não pode derrubar
   a instalação inteira do cache. */
self.addEventListener('install', event =>
  event.waitUntil(caches.open(CACHE)
    .then(cache => Promise.all(SHELL.map(url => cache.add(url).catch(() => null))))
    .then(() => self.skipWaiting())));

self.addEventListener('activate', event =>
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim())));

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request)
      .then(response => {
        const copia = response.clone();
        caches.open(CACHE).then(cache => cache.put('./index.html', copia));
        return response;
      })
      .catch(() => caches.match('./index.html')));
    return;
  }

  event.respondWith(caches.match(event.request).then(guardado => guardado || fetch(event.request)
    .then(response => {
      if (response.ok) {
        const copia = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copia));
      }
      return response;
    })
    .catch(() => caches.match('./index.html'))));
});
