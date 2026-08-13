# SAMAÚMA

Protótipo demonstrativo de uma central municipal de oportunidades recicláveis para Porto Velho, Rondônia.

O SAMAÚMA possui dois núcleos conectados. O **SAMAÚMA Regula** identifica e acompanha grandes geradores do cadastro à decisão municipal. O **SAMAÚMA Circular** transforma recicláveis compatíveis e autorizados em oportunidades para cooperativas, com coleta, pesagem, renda e destinação rastreáveis.

O produto é exclusivamente web: o mesmo endereço abre no navegador do computador, tablet ou celular. Não existe dependência de aplicativo nativo, loja de aplicativos ou celular pessoal.

Na entrada, a pessoa escolhe um perfil demonstrativo — catador, cooperativa, grande gerador, operador, gestão municipal ou auditoria. A navegação passa a exibir apenas as tarefas daquele papel. O modo banca é a única experiência que libera deliberadamente a visão completa do protótipo.

As responsabilidades também são separadas dentro dos módulos: o grande gerador declara demandas e consulta situação, comprovantes e selo já emitido; somente o perfil de gestão municipal pode analisar requisitos, registrar pendência, emitir ou suspender o instrumento demonstrativo.

## Experiência principal

- **Início:** proposta, cadeia operacional, resultados e escopo do piloto.
- **Regularização:** autodeclaração, contrato/PGRS demonstrativos, pendência, complementação, decisão municipal e conexão circular.
- **Consulta pública:** verificação demonstrativa do selo, validade, operador e última comprovação sem divulgar pendências internas.
- **Oportunidades:** mapa de Porto Velho, compatibilidade, capacidade, rota e receita projetada.
- **Operação completa:** fluxo interativo da demanda ao rateio e ao dossiê final.
- **Operação em campo:** workspace web responsivo — sem moldura ou aplicativo separado — com chegada, QR, foto, massa, ocorrência, revisão, fila offline, sincronização e comprovante.
- **Impacto:** metas e indicadores para decidir se o piloto deve escalar.
- **Modo banca:** roteiro guiado e reiniciável para apresentação em aproximadamente três minutos.

A navegação é organizada em quatro áreas legíveis: **Visão integrada**, **Catadores e cooperativas**, **Gestão de grandes geradores** e **Governança e referência**. Assim, cada público encontra seu trabalho sem perder a jornada compartilhada.

## Inclusão digital

O canal de campo não pressupõe que cada catador tenha smartphone, pacote de dados ou facilidade digital. A operação pode usar aparelho compartilhado da cooperativa, celular pessoal de forma opcional, terminal web no galpão ou registro assistido. Uma ficha numerada cobre contingências de aparelho e bateria e é digitada posteriormente com dupla identificação.

## Aviso importante

As organizações, pessoas, documentos, pontos, rotas e valores operacionais são fictícios ou demonstrativos. O mapa utiliza a geografia real de Porto Velho exclusivamente para demonstrar a experiência do produto.

O protótipo não acessa sistemas oficiais, não movimenta dinheiro e não representa integração, contratação, decisão administrativa ou procedimento homologado pela Prefeitura de Porto Velho.

## Executar localmente

Sirva esta pasta por HTTP para habilitar o cache offline:

```bash
python -m http.server 4173
```

Depois abra `http://localhost:4173`.

## Publicação

O projeto é publicado pelo GitHub Pages em: <https://natanashi.github.io/samauma/>
