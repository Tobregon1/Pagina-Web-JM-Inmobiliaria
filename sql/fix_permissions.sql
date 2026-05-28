-- Error Detectado: Faltaba la política para permitir borrar agentes.
-- Corrección: Ejecuta este script en el SQL Editor de Supabase.

-- Política: Solo usuarios autenticados pueden BORRAR agentes
create policy "Usuarios autenticados pueden borrar agentes"
  on public.agents for delete
  using ( auth.role() = 'authenticated' );

-- Política: Solo usuarios autenticados pueden EDITAR agentes (por si acaso)
create policy "Usuarios autenticados pueden editar agentes"
  on public.agents for update
  using ( auth.role() = 'authenticated' );
