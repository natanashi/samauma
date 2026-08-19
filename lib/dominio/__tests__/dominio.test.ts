/* SAMAÚMA — cenários centrais do domínio, portados de `legacy/verificacao.js`.
   Não é 1:1 (o mecanismo mudou de um sandbox `vm` para módulos TS importáveis),
   mas cobre as mesmas garantias: semente íntegra, situação regulatória, o
   ciclo completo de uma demanda e o ramo de pendência/conciliação. */

import { beforeEach, describe, expect, it } from 'vitest';
import { CATADORES, Catalogo, COOPERATIVAS, DESTINOS, GERADORES, PONTOS, SITUACOES, STATUS } from '../catalogo';
import type { SituacaoId } from '../tipos';
import { DemandaRegras as Demanda } from '../demanda';
import { Fmt } from '../formato';
import { Painel } from '../indicadores';
import { Regulatorio } from '../regulatorio';
import { Store } from '../store';

beforeEach(() => {
  Store.reiniciar();
});

describe('semente', () => {
  it('gera demandas', () => {
    expect(Store.demandas.length).toBeGreaterThan(0);
  });

  it('cooperativa principal é a CATANORTE', () => {
    expect(COOPERATIVAS[0].nome).toBe('CATANORTE');
    expect(Catalogo.equipe('coop-01').length).toBeGreaterThan(0);
  });

  it('existe catador autônomo fora da cooperativa', () => {
    expect(CATADORES.some(c => !c.cooperativa)).toBe(true);
  });

  it('aterro sanitário é um destinatário', () => {
    expect(DESTINOS.some(d => d.aterro)).toBe(true);
  });

  it('todo ponto de coleta tem coordenada', () => {
    expect(PONTOS.every(p => p.lat != null && p.lng != null)).toBe(true);
  });
});

describe('integridade da semente', () => {
  it('toda demanda tem situação válida', () => {
    expect(Store.todas().every(d => !!STATUS[d.status])).toBe(true);
  });

  it('toda demanda referencia gerador, ponto e destino do catálogo', () => {
    expect(Store.todas().every(d => Catalogo.gerador(d.gerador.id) && Catalogo.ponto(d.ponto) && Catalogo.destino(d.destino.id))).toBe(true);
  });

  it('destino aceita o material da carga', () => {
    expect(Store.todas().every(d => Catalogo.destino(d.destino.id)!.aceita.includes(d.residuo))).toBe(true);
  });

  it('rejeito nunca é maior que a massa recebida', () => {
    expect(Store.todas().every(d => d.verificadoKg == null || (d.rejeitoKg || 0) <= d.verificadoKg)).toBe(true);
  });

  it('carga de aterro é integralmente rejeito', () => {
    const doAterro = Store.todas().filter(d => d.verificadoKg != null && Catalogo.destino(d.destino.id)!.aterro);
    expect(doAterro.length).toBeGreaterThan(0);
    expect(doAterro.every(d => d.rejeitoKg === d.verificadoKg)).toBe(true);
  });

  it('nenhuma comprovada sem passar pelo destinatário', () => {
    expect(Store.todas().filter(d => d.status === 'COMPROVADA')
      .every(d => d.eventos.some(e => e.autor === 'Destinatário'))).toBe(true);
  });

  it('pendências estão acima da tolerância', () => {
    expect(Store.pendentes().every(d => !Demanda.dentroDaTolerancia(d))).toBe(true);
  });

  it('parte relevante da massa vai para o aterro', () => {
    const a = Painel.ambiental(Store.todas());
    expect(a.rejeito).toBeGreaterThan(0);
  });
});

describe('situação regulatória', () => {
  it('as três situações aparecem na base', () => {
    const encontradas = new Set(Painel.geradores().map(g => g.situacao.id));
    Object.keys(SITUACOES).forEach(s => expect(encontradas.has(s as SituacaoId)).toBe(true));
  });

  it('PGRS vencido derruba para irregular', () => {
    const vencido = GERADORES.find(g => g.pgrs && g.pgrs.validade < 0)!;
    const s = Regulatorio.situacao(vencido, Store.doGerador(vencido.id));
    expect(s.id).toBe('IRREGULAR');
  });

  it('toda situação vem com motivo em texto', () => {
    expect(Painel.geradores().every(g => g.situacao.motivos.length > 0)).toBe(true);
  });
});

describe('ciclo completo, do gerador ao destinatário', () => {
  it('percorre criação, publicação, coleta e recebimento dentro da tolerância', () => {
    const nova = Store.criar({
      geradorId: 'ger-01', residuo: 'papelao', estimadoKg: 800, ponto: 'pt-01',
      prazo: new Date(Date.now() + 172800000).toISOString(), observacao: 'Doca lateral'
    });
    expect(Store.publicar(nova.id).status).toBe('DISPONIVEL');
    expect(Store.aceitar(nova.id, Catalogo.catador('cat-01')!).catador!.nome).toBe('João Silva');
    expect(Store.iniciarColeta(nova.id).status).toBe('EM_COLETA');
    expect(Store.registrarPeso(nova.id, 785).coletadoKg).toBe(785);

    const finalizada = Store.finalizarColeta(nova.id);
    expect(finalizada.status).toBe('COLETADA');
    expect(finalizada.comprovante).toBeNull();

    const recebida = Store.receber(nova.id, { kg: 782, rejeitoKg: 60, nota: 'Carga íntegra.' });
    expect(Demanda.reciclado(recebida)).toBe(722);
    expect(recebida.status).toBe('COMPROVADA');
  });

  it('recusa rejeito maior que a massa recebida', () => {
    const outra = Store.criar({ geradorId: 'ger-01', residuo: 'vidro', estimadoKg: 100, prazo: new Date().toISOString() });
    Store.publicar(outra.id); Store.aceitar(outra.id, Catalogo.catador('cat-01')!);
    Store.iniciarColeta(outra.id); Store.registrarPeso(outra.id, 100); Store.finalizarColeta(outra.id);
    expect(() => Store.receber(outra.id, { kg: 100, rejeitoKg: 500 })).toThrow();
    expect(() => Store.receber(outra.id, { kg: 100, rejeitoKg: 5 })).not.toThrow();
  });
});

describe('ramo da pendência', () => {
  it('divergência acima da tolerância abre pendência; conciliar emite comprovante', () => {
    const forcada = Store.criar({ geradorId: 'ger-01', residuo: 'plastico', estimadoKg: 400, prazo: new Date().toISOString() });
    Store.publicar(forcada.id); Store.aceitar(forcada.id, Catalogo.catador('cat-01')!);
    Store.iniciarColeta(forcada.id); Store.registrarPeso(forcada.id, 400); Store.finalizarColeta(forcada.id);

    expect(Store.receber(forcada.id, { kg: 300, rejeitoKg: 20 }).status).toBe('PENDENCIA');

    const conciliada = Store.conciliar(forcada.id, { kgAceito: 398, nota: 'Tíquete conferido.' });
    expect(conciliada.status).toBe('COMPROVADA');
    expect(conciliada.comprovante).not.toBeNull();

    expect(() => Store.aceitar(forcada.id, Catalogo.catador('cat-01')!)).toThrow();
  });
});

describe('carga direto para o aterro', () => {
  it('resíduo indiferenciado vai ao aterro e não gera renda', () => {
    const lixo = Store.criar({ geradorId: 'ger-04', residuo: 'rejeito', estimadoKg: 1500, prazo: new Date().toISOString() });
    expect(Catalogo.destino(lixo.destino.id)!.aterro).toBe(true);
    Store.publicar(lixo.id); Store.aceitar(lixo.id, Catalogo.catador('cat-02')!);
    Store.iniciarColeta(lixo.id); Store.registrarPeso(lixo.id, 1500); Store.finalizarColeta(lixo.id);
    const d = Store.receber(lixo.id, { kg: 1480, rejeitoKg: 0 });
    expect(Demanda.reciclado(d)).toBe(0);
    expect(Demanda.valor(d)).toBe(0);
  });
});

describe('formatação', () => {
  it('kg e percentual formatam em pt-BR', () => {
    expect(Fmt.kg(1234)).toContain('kg');
    expect(Fmt.percentual(5.5, 1)).toContain('%');
  });
});
