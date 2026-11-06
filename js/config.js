/* =========================================================
   Configuração pública do site
   ---------------------------------------------------------
   Preencha com os dados do seu projeto Supabase:
   Supabase → Project Settings → API
     • supabaseUrl      → "Project URL"
     • supabaseAnonKey  → chave "anon" / "publishable"

   A chave anon É PÚBLICA por natureza (vai para o navegador).
   Quem protege os dados são as políticas RLS criadas em
   supabase/migrations: o site só consegue INSERIR, nunca ler.
   NUNCA coloque aqui a chave "service_role" / "secret".

   Com os campos vazios, os formulários apenas simulam o envio.
   ========================================================= */
window.SITE_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: ''
};
