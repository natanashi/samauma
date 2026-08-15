# assets

## logo.png

Salve aqui o logotipo oficial do SAMAÚMA, **com este nome exato**: `assets/logo.png`.

É o logotipo completo — símbolo, palavra SAMAÚMA, assinatura e os três traços. A interface usa o mesmo
arquivo de duas formas:

| Onde | Forma | Como |
| --- | --- | --- |
| Entrada, rodapé, comprovante, relatórios | logotipo inteiro | `marca(tamanho, 'completa')` |
| Barra do topo, faixas de perfil, selo, vazios | só o símbolo | `marca(tamanho)` — recorte por CSS |

O recorte do símbolo é feito com três variáveis em `styles.css`, na seção 1:

```css
--recorte-x: .18;   /* borda esquerda do círculo, em fração da largura */
--recorte-y: .01;   /* borda superior do círculo */
--recorte-l: .64;   /* largura do círculo em fração da largura da imagem */
```

Se o arquivo tiver enquadramento diferente do previsto, ajuste esses três valores — nenhum outro ponto
do código conhece a geometria da imagem.

**Enquanto o arquivo não existir**, a interface não fica quebrada: cai automaticamente no símbolo
desenhado em SVG dentro de `src/ui/componentes.js` (função `simbolo()`), que traz o nome junto quando a
forma pedida é a completa.
