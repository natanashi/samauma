/* SAMAÚMA — quem está usando o sistema agora.
   O perfil escolhido na entrada e, dentro dele, qual gerador, qual catador ou
   qual unidade receptora. Nada além disso: a sessão não guarda tela nem estado
   de navegação. */

import { CATADORES, Catalogo, DESTINOS, GERADOR_SESSAO } from './catalogo';
import type { Catador, Cooperativa, Destino, Gerador, Perfil } from './tipos';

type Ouvinte = () => void;

class EstadoSessao {
  perfil: Perfil | null = null;
  gerador: string = GERADOR_SESSAO;
  catador: Catador = CATADORES[0];
  destino: Destino = DESTINOS[0];
  private ouvintes = new Set<Ouvinte>();
  private instantaneo = {};

  subscribe = (ouvinte: Ouvinte): (() => void) => {
    this.ouvintes.add(ouvinte);
    return () => this.ouvintes.delete(ouvinte);
  };

  getSnapshot = () => this.instantaneo;

  private notificar() {
    this.instantaneo = {};
    this.ouvintes.forEach(o => o());
  }

  definirPerfil(perfil: Perfil | null) {
    this.perfil = perfil;
    this.notificar();
  }

  entrarComoGerador(id: string): string {
    const gerador = Catalogo.gerador(id);
    if (gerador) this.gerador = gerador.id;
    this.notificar();
    return this.gerador;
  }

  entrarComoCatador(id: string): Catador {
    this.catador = Catalogo.catador(id) || CATADORES[0];
    this.notificar();
    return this.catador;
  }

  entrarComoDestino(id: string): Destino {
    this.destino = Catalogo.destino(id) || DESTINOS[0];
    this.notificar();
    return this.destino;
  }

  get cadastroGerador(): Gerador | null { return Catalogo.gerador(this.gerador); }
  get cooperativa(): Cooperativa | null { return Catalogo.cooperativa(this.catador.cooperativa); }
  get autonomo(): boolean { return !this.catador.cooperativa; }
}

export const Sessao = new EstadoSessao();
