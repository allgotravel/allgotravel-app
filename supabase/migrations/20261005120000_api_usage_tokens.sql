-- Consumo de Alli por llamada: modelo, tokens y estado — 5-oct-2026. NO se aplica sola.
-- Columnas opcionales (nullable): las filas viejas y las del planificador quedan en null.
-- Hasta que se aplique, /api/chat sigue funcionando y solo registra user_id, endpoint y fecha.

alter table public.api_usage
  add column if not exists model             text,
  add column if not exists input_tokens      integer,
  add column if not exists output_tokens     integer,
  add column if not exists cache_read_tokens integer,
  add column if not exists status            text;

-- RLS sigue activo y sin políticas para usuarios: solo el servidor (service role) lee y escribe.
