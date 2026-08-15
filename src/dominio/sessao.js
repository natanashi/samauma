/* SAMAÚMA — quem está usando o sistema agora.
   O perfil escolhido na entrada e, dentro dele, qual gerador, qual catador ou
   qual unidade receptora. Nada além disso: a sessão não guarda tela nem estado
   de navegação. */

const Sessao = {
  perfil: null,
  gerador: GERADOR_SESSAO,
  catador: CATADORES[0],
  destino: DESTINOS[0],

  entrarComoGerador(id) {
    const gerador = Catalogo.gerador(id);
    if (gerador) this.gerador = gerador.id;
    return this.gerador;
  },

  /* O catador entra de dois jeitos, e é isso que muda a área dele: cooperado,
     ele enxerga a equipe; autônomo, os mesmos indicadores vivem só no perfil. */
  entrarComoCatador(id) {
    this.catador = Catalogo.catador(id) || CATADORES[0];
    return this.catador;
  },

  entrarComoDestino(id) {
    this.destino = Catalogo.destino(id) || DESTINOS[0];
    return this.destino;
  },

  get cadastroGerador() { return Catalogo.gerador(this.gerador); },
  get cooperativa() { return Catalogo.cooperativa(this.catador.cooperativa); },
  get autonomo() { return !this.catador.cooperativa; }
};
