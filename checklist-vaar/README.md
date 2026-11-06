# Checklist VAAR — Leomir Araujo (MVP)

Checklist e calculadora indicativa das cinco condicionalidades do VAAR/Fundeb, em HTML, CSS, JavaScript puro e Bootstrap 5.3 (via CDN). Usa a mesma identidade visual do site do Leomir: menu em pílula de vidro, hero escuro com as luzes da marca, cards de vidro, botões em gradiente coral e o rodapé do site. Tema escuro por padrão e tema claro opcional.

> **Depende do site.** Esta pasta usa `../css/style.css` (tokens, botões, menu, rodapé) e `../assets/img/favicon.svg`. Ela precisa ficar dentro do repositório do site, em `/checklist-vaar/`.

## Como abrir

Abra a **pasta do site** (`leomir-landing`) no VS Code, inicie o **Live Server** e acesse `/checklist-vaar/`. No GitHub Pages, o endereço é `…/leomir_araujo_landingpage/checklist-vaar/`.

## Estrutura

```
checklist-vaar/
├── index.html        # estrutura da página e textos
├── css/style.css     # estilos da calculadora (a base vem de ../css/style.css)
├── js/regras.js      # regras do VAAR e município de exemplo  ← atualize a cada ciclo
├── js/main.js        # lógica da calculadora
└── assets/img/       # favicon e imagens
```

## Atualizar as regras de um novo ciclo

Tudo o que muda de um ano para o outro está em `js/regras.js`:

| Item | Chave |
| --- | --- |
| Percentual mínimo de diretores por mérito | `minimoGestores` |
| Texto de cada ciclo | `textoCiclo` |
| Participação mínima no Saeb | `saebMinimo` e `saebAtencao` |
| Data mínima do ato de Computação | `dataComputacao` |
| Prazo de resposta da diligência | `diasDiligencia` |
| Município de exemplo | `exemplo` |

Para um ciclo novo, acrescente a opção no `<select id="cycle">` do `index.html` e a chave correspondente em `minimoGestores` e `textoCiclo`.

## Como a calculadora decide

| Condicionalidade | Não atende quando |
| --- | --- |
| I · Gestão escolar | Não há lei; a forma de provimento é "outra forma"; não há edital; ou o percentual por mérito não passa do mínimo do ciclo |
| II · Saeb | Algum ano avaliado fica abaixo de 80% (entre 80% e 85% gera alerta) |
| III · Desigualdades | O Inep indicou que não atende. A simulação de tendência só gera alerta, porque a margem oficial varia com o tamanho da rede |
| IV · ICMS Educacional | O estado não foi habilitado |
| V · BNCC e Computação | Referencial não aprovado, sem Computação, ou ato anterior a 04/10/2022 |
| Prazo | Não registrou no Simec, ou perdeu o prazo da diligência |

O resultado é **indicativo**. A habilitação oficial é do MEC (SEB) e do Inep.

## Recursos

- Respostas salvas no navegador de quem usa (localStorage).
- Botão para copiar o resumo e enviar à equipe.
- Botão de impressão, que abre todos os checklists antes de imprimir.
- Alternância de tema claro e escuro, com a escolha salva.

## Próximos passos sugeridos

- Pedir nome, e-mail e município antes de mostrar o resultado completo, para captar leads; o formulário do site já tem esse padrão.
- Gerar um PDF do diagnóstico com a marca do Leomir.
- Publicar no mesmo GitHub Pages do site, por exemplo em `/checklist-vaar/`, e ligar o botão "Baixar o Checklist VAAR" da landing page.

## Fontes

- [Resolução CIF nº 24/2026](https://www.gov.br/fnde/pt-br/acesso-a-informacao/acoes-e-programas/financiamento/fundeb/legislacao/2026/resolucao-cif-no-24-de-15-de-junho-de-2026)
- [MPCE — condicionalidades I e III](https://mpce.mp.br/institucional/centros-de-apoio-operacional/caoeduc/kits-de-atuacao/kit-fundeb-complementacao-vaar/fundeb-vaar-condicionalidades-inabilitacao/)
- [Todos Pela Educação — Panorama VAAR 2025](https://todospelaeducacao.org.br/wordpress/wp-content/uploads/2025/08/panorama-vaar-2025.pdf)
