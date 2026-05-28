-- INSTRUCCIONES:
-- 1. Copia todo este código.
-- 2. Ve al "SQL Editor" en tu panel de Supabase.
-- 3. Pégalo y haz clic en "Run".

-- --------------------------------------------------------
-- Crear Tabla de Mensajes de Contacto
-- --------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text,
  property_id text -- Opcional: ID de la propiedad si viene del modal
);

-- Habilitar seguridad (RLS)
alter table public.contact_messages enable row level security;

-- Política: Cualquiera (anon) puede INSERTAR mensajes (Enviarlos)
create policy "Cualquiera puede enviar mensajes"
  on public.contact_messages for insert
  with check ( true );

-- Política: Solo ADMINS (autenticados) pueden VER los mensajes
create policy "Solo admins pueden ver mensajes"
  on public.contact_messages for select
  using ( auth.role() = 'authenticated' );
