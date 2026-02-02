-- Agrega la columna 'status' a la tabla 'properties'
-- Valores posibles: 'available', 'sold', 'rented'
-- Por defecto será 'available' (Disponible)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'properties'
        AND column_name = 'status'
) THEN
ALTER TABLE public.properties
ADD COLUMN status text DEFAULT 'available';
END IF;
END $$;