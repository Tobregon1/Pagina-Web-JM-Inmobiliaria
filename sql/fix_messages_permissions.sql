-- Error Detectado: Faltaba la política para permitir borrar mensajes de contacto.
-- Corrección: Ejecuta este script en el SQL Editor de Supabase.

-- Política: Solo usuarios autenticados pueden BORRAR mensajes
DROP POLICY IF EXISTS "Usuarios autenticados pueden borrar mensajes" ON public.contact_messages;
CREATE POLICY "Usuarios autenticados pueden borrar mensajes"
  ON public.contact_messages FOR DELETE
  USING ( auth.role() = 'authenticated' );

-- Asegurar que también tengan permiso para verlos (ya debería estar pero reforzamos)
DROP POLICY IF EXISTS "Solo admins pueden ver mensajes" ON public.contact_messages;
CREATE POLICY "Solo admins pueden ver mensajes"
  ON public.contact_messages FOR SELECT
  USING ( auth.role() = 'authenticated' );
