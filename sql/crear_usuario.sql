-- INSTRUCCIONES:
-- 1. Copia todo este código.
-- 2. Ve al "SQL Editor" en tu panel de Supabase (https://supabase.com/dashboard/project/_/sql/new).
-- 3. Edita las variables 'mi_usuario' y 'mi_contraseña' abajo (líneas 13 y 14).
-- 4. Haz clic en "RUN".

-- IMPORTANTE: Asegúrate de tener la extensión pgcrypto habilitada.
create extension if not exists pgcrypto;

DO $$
DECLARE
  -- ----------------------------------------------------------------------
  -- CONFIGURACIÓN: CAMBIA ESTOS VALORES
  -- ----------------------------------------------------------------------
  raw_username text := 'nuevo_usuario'; -- Pon aquí el usuario que quieras (ej: admin)
  raw_password text := 'contraseña123'; -- Pon aquí la contraseña que quieras
  -- ----------------------------------------------------------------------
  
  -- Variables internas
  user_email text;
  user_id uuid := gen_random_uuid();
  encrypted_pw text;
BEGIN
  -- Construir el email interno
  user_email := raw_username || '@jmnegociosinmobiliarios.com';
  
  -- Encriptar la contraseña
  encrypted_pw := crypt(raw_password, gen_salt('bf'));

  -- 1. Insertar en auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', -- instance_id por defecto
    user_id,
    'authenticated',
    'authenticated',
    user_email,
    encrypted_pw,
    now(), -- Confirmado automáticamente
    null,
    null,
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- 2. Insertar en auth.identities (Necesario para que Supabase reconozca la identidad)
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    user_id,
    format('{"sub":"%s","email":"%s"}', user_id::text, user_email)::jsonb,
    'email',
    user_id::text, 
    null,
    now(),
    now()
  );

  RAISE NOTICE 'Usuario creado exitosamente: % (Email: %)', raw_username, user_email;
END $$;
