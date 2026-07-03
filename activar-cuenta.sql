-- Ejecuta esto en Supabase SQL Editor para activar tu cuenta de prueba
-- 1. Agrega la columna subscription_status si no existe
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'free';

-- 2. Activa TODAS las cuentas (para probar sin importar qué email usaste)
UPDATE public.profiles
SET subscription_status = 'active';

-- Verificar que funcionó (deben aparecer todas con 'active'):
SELECT id, email, full_name, subscription_status FROM public.profiles;
