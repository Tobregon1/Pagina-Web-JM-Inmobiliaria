-- INSTRUCCIONES:
-- 1. Copia todo este código.
-- 2. Ve al "SQL Editor" en tu panel de Supabase.
-- 3. Pégalo y haz clic en "Run".

-- --------------------------------------------------------
-- 1. Crear Tabla de Propiedades (Properties)
-- --------------------------------------------------------
create table if not exists public.properties (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  price numeric,
  type text check (type in ('buy', 'rent')), -- Venta o Alquiler
  property_type text, -- Casa, Departamento, etc.
  location text,
  bedrooms int,
  bathrooms int,
  size_m2 int,
  image_url text, -- Imagen principal (compatibilidad)
  images text[] -- Array de todas las imágenes
);

-- Habilitar seguridad (RLS)
alter table public.properties enable row level security;

-- Política: Cualquiera puede VER propiedades
create policy "Propiedades son públicas"
  on public.properties for select
  using ( true );

-- Política: Solo usuarios autenticados pueden CREAR propiedades
create policy "Usuarios autenticados pueden crear propiedades"
  on public.properties for insert
  with check ( auth.role() = 'authenticated' );

-- Política: Solo usuarios autenticados pueden EDITAR propiedades
create policy "Usuarios autenticados pueden editar propiedades"
  on public.properties for update
  using ( auth.role() = 'authenticated' );

-- Política: Solo usuarios autenticados pueden BORRAR propiedades
create policy "Usuarios autenticados pueden borrar propiedades"
  on public.properties for delete
  using ( auth.role() = 'authenticated' );


-- --------------------------------------------------------
-- 2. Crear Tabla de Agentes (Agents)
-- --------------------------------------------------------
create table if not exists public.agents (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  role text,
  phone text,
  email text,
  description text,
  image_url text
);

-- Habilitar seguridad (RLS)
alter table public.agents enable row level security;

-- Política: Cualquiera puede VER agentes
create policy "Agentes son públicos"
  on public.agents for select
  using ( true );

-- Política: Solo auth puede CREAR agentes
create policy "Usuarios autenticados pueden crear agentes"
  on public.agents for insert
  with check ( auth.role() = 'authenticated' );

-- --------------------------------------------------------
-- 3. Configurar Almacenamiento (Storage)
-- --------------------------------------------------------
-- Crear bucket 'images' si no existe
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Política: Cualquiera puede VER imágenes
create policy "Imágenes son públicas"
  on storage.objects for select
  using ( bucket_id = 'images' );

-- Política: Solo auth puede SUBIR imágenes
create policy "Usuarios autenticados pueden subir imágenes"
  on storage.objects for insert
  with check ( bucket_id = 'images' and auth.role() = 'authenticated' );

-- Política: Solo auth puede BORRAR imágenes
create policy "Usuarios autenticados pueden borrar imágenes"
  on storage.objects for delete
  using ( bucket_id = 'images' and auth.role() = 'authenticated' );
