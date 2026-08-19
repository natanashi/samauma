/* SAMAÚMA — canal de registro do catador.
   Como esta rota vai ser registrada. Celular pessoal nunca é requisito para
   trabalhar: a sessão pertence à rota, não ao aparelho nem à pessoa. Portado
   da variável módulo `CANAL_REGISTRO` de `src/telas/catador.js`, com
   subscribe/notify para o React perceber a troca feita em outra tela. */

type Ouvinte = () => void;

class CanalDeRegistro {
  atual = 'compartilhado';
  private ouvintes = new Set<Ouvinte>();
  private instantaneo = { atual: this.atual };

  subscribe = (ouvinte: Ouvinte): (() => void) => {
    this.ouvintes.add(ouvinte);
    return () => this.ouvintes.delete(ouvinte);
  };

  getSnapshot = () => this.instantaneo;

  escolher(id: string) {
    this.atual = id;
    this.instantaneo = { atual: id };
    this.ouvintes.forEach(o => o());
  }
}

export const CanalRegistro = new CanalDeRegistro();
