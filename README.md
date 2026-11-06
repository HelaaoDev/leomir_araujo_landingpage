# Leomir Araujo — site

Site estático em HTML5, CSS3, JavaScript puro e Bootstrap 5.3 (via CDN), na identidade visual do Leomir: azuis navy com acento coral, Montserrat nos títulos e Lato no texto. Não tem build nem dependências para instalar.

Os formulários gravam direto no **Supabase** (banco Postgres), sem servidor próprio.

## Páginas

| Arquivo | Conteúdo |
| --- | --- |
| `index.html` | Home: hero em carrossel, O desafio, Serviços, Como funciona, Palestras, Depoimentos, Dúvidas e Contato |
| `checklist.html` | Captação do Checklist VAAR (formulário → tabela `leads_checklist`) |
| `curriculo.html` | Página "Sobre": perfil, trajetória, formação e publicações |

## Estrutura

```
leomir-landing/
├── index.html
├── checklist.html
├── curriculo.html
├── css/style.css            # tokens da marca e todos os estilos
├── js/config.js             # URL e chave pública do Supabase
├── js/main.js               # interações e envio dos formulários
├── assets/img/web/          # imagens otimizadas usadas pelo site
├── supabase/migrations/     # SQL que cria as tabelas e as permissões
└── README.md
```

As fotos originais em alta resolução ficam em `assets/img/` e **não vão para o Git** (ver `.gitignore`). Para trocar uma imagem, gere uma versão otimizada (até ~2400 px de largura, JPG ~75–80%) em `assets/img/web/`.

## Rodar localmente

```bash
python -m http.server 8000
# ou
npx serve .
```

Acesse http://localhost:8000.

---

## 1. Subir para o GitHub

```bash
git init
git add .
git commit -m "Site Leomir Araujo"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/leomir-landing.git
git push -u origin main
```

Antes do primeiro commit, confira com `git status` que as fotos originais grandes **não** aparecem na lista.

## 2. Configurar o Supabase (formulários)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Abra **SQL Editor → New query**, cole o conteúdo de `supabase/migrations/20261105000000_formularios.sql` e clique em **Run**.
   Isso cria as tabelas `leads_checklist` e `contatos` com RLS: o site só consegue **inserir**; ninguém lê os dados pelo navegador.
   *(Com a Supabase CLI: `supabase link --project-ref SEU_REF` e `supabase db push`.)*
3. Em **Project Settings → API**, copie a **Project URL** e a chave **anon / publishable** para `js/config.js`:

   ```js
   window.SITE_CONFIG = {
     supabaseUrl: 'https://SEU_REF.supabase.co',
     supabaseAnonKey: 'eyJ...'
   };
   ```

   A chave anon é pública por natureza; a proteção vem das políticas RLS. **Nunca** use a chave `service_role` / `secret` no site.
4. Teste os dois formulários e veja os registros em **Table Editor**.

Sem `js/config.js` preenchido, os formulários apenas simulam o envio (bom para revisar o layout).

### Como o envio funciona

Cada `<form class="js-form">` tem `data-table="nome_da_tabela"`. O `js/main.js` transforma os campos em JSON (o `name` de cada campo = nome da coluna) e faz um `POST` em `/rest/v1/<tabela>`. Para criar um novo formulário: crie a tabela com política de insert, use os mesmos nomes de coluna nos `name` dos campos e aponte o `data-table`.

Há um campo invisível `website` em cada formulário: se um robô preenchê-lo, o envio é descartado.

### Avisos importantes

- **E-mail do checklist:** gravar o lead **não envia e-mail sozinho**. Para mandar o PDF automaticamente, use um *Database Webhook* ou *Edge Function* do Supabase ligado a um serviço de e-mail (Resend, Brevo etc.), ou exiba o link de download após o envio. Até lá, ajuste a mensagem `data-success` do formulário em `checklist.html`.
- **LGPD:** preencha o link de **Política de privacidade** no formulário do checklist e defina por quanto tempo os dados serão guardados.

## 3. Publicar o site

O Supabase guarda os dados, mas não é o lugar indicado para hospedar o site. Conecte o repositório do GitHub a um destes (todos gratuitos para sites estáticos):

- **Vercel** ou **Netlify**: "Import project" → escolha o repositório → sem comando de build, pasta raiz `/`.
- **GitHub Pages**: Settings → Pages → Branch `main` / root.

Depois, aponte o domínio próprio nas configurações da hospedagem.

---

## O que ainda preencher

Procure por `[` nos arquivos HTML. Os principais:

| Item | Onde |
| --- | --- |
| E-mail, WhatsApp e Instagram | Barra do topo, Contato e Rodapé (troque também os `href`) |
| Data do próximo prazo VAAR | Cartão "Próximo prazo" no hero |
| Depoimentos | Seção "Quem já participou" — só relatos reais e autorizados (cada faixa tem 3 cópias idênticas: edite as 3) |
| Trajetória, formação e publicações | `curriculo.html` |
| Vídeo do showreel | `data-video-src` no modal (ex.: `https://www.youtube.com/embed/ID`) |
| Política de privacidade e CNPJ | Formulário do checklist e rodapé |
| Imagem de compartilhamento | Descomente `og:image` no `<head>` |

## Personalizar

- **Cores, raios e sombras:** variáveis em `:root` no início do `css/style.css`.
- **Animações de entrada:** classe `.reveal`. O site respeita a opção "reduzir movimento" do sistema.
- **Carrossel do hero:** instruções no comentário acima da seção em `index.html` (imagem, enquadramento e texto por slide).
- **Ícones:** [Bootstrap Icons](https://icons.getbootstrap.com/), com `<i class="bi bi-NOME">`.

## Acessibilidade

- Contraste AA nos pares de cor da marca; coral sobre fundo claro só em títulos grandes.
- Link "pular para o conteúdo", foco visível em coral e áreas de toque de 44 px ou mais.
- Formulários com rótulos e mensagens de erro; imagens com texto alternativo.
