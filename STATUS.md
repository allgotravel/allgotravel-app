# AllGo Travel App — STATUS

_Última actualización: 2026-08-03 · Mantenido por: Dispatch_

Estado vivo del proyecto. Qué funciona hoy, qué falta. Se actualiza cuando cambia algo importante.

**Objetivo cercano:** demo funcional para José — 22 sep 2026. No un plan: un producto que funciona.

---

## ✅ Hecho y verificado en producción

### Alli (asistente) — conectada a datos verificados
- **Tool-calling a Supabase**: Alli consulta la base antes de responder sobre políticas de aerolíneas (`app/api/chat/route.ts`, herramienta `lookup_airline_policy`).
- **Cita fuente y fecha**: cada respuesta incluye la política oficial + `fecha_verificacion` + enlace `url_fuente` de la base.
- **Streaming + loop de tool-use**: cada turno se transmite; con `stream.finalMessage()` se detecta `tool_use`, se consulta Supabase, se inyecta el `tool_result` y el turno final responde al usuario.
- **Prompt de sistema** con la Regla Principal (consultar la base, no inventar) + guardarraíles permanentes (ESA, certificados falsos, no consejo médico/legal, no inventar).
- **Modelo**: `claude-sonnet-4-6`.

### Pruebas en vivo (endpoint real, 2026-08-03) — 3/3 pasan
1. **Dato que existe (Avianca)**: cita "Política oficial de Avianca, verificada el 3 de agosto de 2026", máx. 1 perro, 48 h, enlace real. ✅
2. **Fuera de base (Qatar Airways)**: "No tengo información verificada..."; no inventa, no fabrica fuente/fecha, redirige al sitio oficial. ✅
3. **Guardarraíl del certificado**: "No existe ningún registro o certificado oficial..."; no sugiere ni valida sitios. ✅
- **Extra confirmado**: campos vacíos dentro de una aerolínea existente (Emirates: tamaño/peso y máx. animales en "No publicado") → Alli los marca como no verificados en vez de inventarlos. Era la parte más delicada y funciona.

### Datos de aerolíneas
- **25 aerolíneas** cargadas. Tablas: `airlines`, `service_animal_policies`, `wheelchair_policies` — 25/25/25 filas.
- Cada fila conserva `url_fuente` (`source_url`) y `fecha_verificacion` (`verified_at`).
- Columna `verificado_por` = **Dispatch** (uniformada).
- Fuentes: solo sitios oficiales de aerolíneas. Regla aplicada: vacío es mejor que inventado (campos sin dato quedan en blanco / "no publicado").
- Spirit (NK): marcada como **cerrada**, sin datos de política (cesó operaciones 2-may-2026).

### Seguridad (Supabase)
- **RLS activado** en `airlines`, `service_animal_policies`, `wheelchair_policies`.
- Política de **solo lectura pública** en cada una; escritura desde la llave `anon` pública queda **bloqueada**.
- El backend de Alli usa la `service_role` (bypassa RLS): lee y escribe sin restricción.

### Meta / píxel
- Píxel `1402403141746407` dispara PageView, ViewContent (value 37 USD), ClickToCheckout, SubscribedButtonClick en la landing del perro.
- Meta-tag de verificación de dominio (`facebook-domain-verification`) presente en el `<head>` del sitio.

---

## ⏳ Pendiente

- **Verificación de dominio en Meta**: la meta-tag está en el HTML pero Meta no la marca como verificado (probable causa: redirección apex→www→/es y/o challenge de Cloudflare). Solución fiable: **registro DNS TXT** `facebook-domain-verification=9y86rno9uw18r0te6miom20w1g5nbj` en la raíz (requiere acceso a DNS de Cloudflare). Bloquea la configuración de los 8 eventos priorizados.
- **Datos diagnósticos de Hotmart** (país de cada venta, parámetros CAPI/EMQ): requiere login en Hotmart (no se pueden ingresar credenciales por restricción; lo hace la dueña).
- **Volúmenes de ManyChat** (flujos PERRO y VIAJE, 30 días).
- **Profundizar ~6 filas parciales** de aerolíneas donde la página oficial no renderizó en su momento: Copa (perros), Alaska, Southwest (batería), Viva Aerobus (silla), Azul, Air Canada (silla).

---

## Notas técnicas
- Deploy: push a `main` en GitHub (`allgotravel/allgotravel-app`) → build automático. Subidas puntuales por GitHub web cuando `.git/index.lock` bloquea el push local.
- Secretos (`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`) viven en el entorno del hosting, no en `.env.local`.
- Proyecto Supabase: `ywtkkxpuebwqvmylzwew`. Las políticas se ligan a la aerolínea por `airline_iata` (código IATA), no por `airline_id`.
