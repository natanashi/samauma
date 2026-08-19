/* SAMAÚMA — dados de apoio do cadastro de participantes.
   Portado de `src/telas/cadastro.js` (a parte de dados, sem HTML). */

import { PONTOS } from './catalogo';

export const TIPOS_CADASTRO = {
  gerador: {
    nome: 'Gerador',
    papel: 'QUEM GERA O RESÍDUO',
    cor: '#2a6fa8',
    resumo: 'Estabelecimento que precisa destinar resíduo e comprovar a destinação.',
    itens: ['CNPJ e ramo de atividade', 'Ponto de coleta e acesso', 'PGRS, se já houver']
  },
  catador: {
    nome: 'Catador',
    papel: 'QUEM EXECUTA A COLETA',
    cor: '#b8791f',
    resumo: 'Pessoa que coleta, pesa em campo e leva a carga até a unidade de destino.',
    itens: ['Cooperado ou autônomo', 'Veículo e zona de trabalho', 'Meta semanal combinada']
  },
  destino: {
    nome: 'Unidade receptora',
    papel: 'QUEM RECEBE E FECHA O CICLO',
    cor: '#2a8c7a',
    resumo: 'Galpão de triagem, indústria recicladora, unidade de transformação ou aterro.',
    itens: ['Licença e capacidade diária', 'Materiais aceitos', 'Destinação declarada']
  }
} as const;

export const RAMOS = ['Supermercado', 'Centro comercial', 'Alimentação', 'Hotelaria', 'Serviço de saúde',
  'Ensino', 'Atacado', 'Indústria gráfica', 'Distribuição', 'Comércio'];

export const TIPOS_UNIDADE = ['Central de triagem', 'Indústria recicladora', 'Unidade de transformação', 'Disposição final'];

export function pontosDeCadastro() {
  const estruturas = ['pt-galpao', 'pt-aterro', 'pt-recicl', 'pt-usina'];
  const vistos = new Set<string>();
  return PONTOS.filter(p => {
    if (estruturas.includes(p.id) || vistos.has(p.bairro)) return false;
    vistos.add(p.bairro);
    return true;
  });
}

export function zonasDeCadastro() {
  return [...new Set(PONTOS.map(p => p.zona))];
}
