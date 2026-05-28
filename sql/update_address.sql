-- SQL para agregar el campo de dirección a la tabla de propiedades
-- Ejecuta este comando en el SQL Editor de Supabase
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS address TEXT;
