# hotmart-webhook · compras de Hotmart → Supabase → MailerLite

Función Edge de Supabase (proyecto `ywtkkxpuebwqvmylzwew`). Desplegada el 9-oct-2026, **inactiva**: rechaza todo hasta
que exista el secreto `HOTMART_HOTTOK`, y no toca MailerLite hasta que `BUYER_SYNC_ENABLED` sea `true`.

- **URL del webhook:** `https://ywtkkxpuebwqvmylzwew.supabase.co/functions/v1/hotmart-webhook`
- **Tabla:** `public.hotmart_purchases` (una fila por transacción; RLS sin acceso para anon/authenticated)
- **Función SQL:** `public.hotmart_record_event(jsonb)` (solo service_role) · `public.hotmart_mark_ml_sync(...)`
- **Migración:** `supabase/migrations/20261009120000_hotmart_purchases.sql` (ya aplicada)
- **Pruebas:** `npx jiti supabase/functions/hotmart-webhook/lib.test.ts`

## Qué hace
| Evento de Hotmart | Estado en la tabla | MailerLite (si `BUYER_SYNC_ENABLED=true`) |
|---|---|---|
| PURCHASE_APPROVED, PURCHASE_COMPLETE | `active` (service_ok = true) | entra al grupo **Compradores · <Producto>** |
| PURCHASE_REFUNDED / CHARGEBACK / CANCELED | `refunded` / `chargeback` / `canceled` (service_ok = false) | sale de ese grupo |
| Otros eventos | fila mínima `pending` (si no existía) | nada |
| El mismo evento reenviado | nada (idempotente) | nada |

Una aprobación que llegue después de un reembolso no revive la compra. Se guarda solo: correo, nombre de pila,
producto, precio, moneda, `sck`/`src` (atribución) y estados. `marketing_ok` queda en `false` (Hotmart no envía ese consentimiento).

Productos: 8150917 Perro · 8020788 Turismo · 8605596 Pack · 8335262 Kit · 8374052 Kit Silla (va al grupo Compradores · Kit) · 8681979 México.

## Checklist para activar (después del 16-oct)
1. **Supabase → Edge Functions → Secrets** (o Project Settings → Edge Functions): agregar
   - `HOTMART_HOTTOK` = el hottok que muestra Hotmart en Herramientas → Webhook (el mismo de la cuenta)
   - `MAILERLITE_API_KEY` = token de API de MailerLite (Integraciones → API)
   - `BUYER_SYNC_ENABLED` = `false` (por ahora)
   (`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya vienen incluidos; no hay que agregarlos.)
2. **Hotmart → Herramientas → Webhook (API y notificaciones) → Agregar configuración**
   - Versión: **2.0.0** · URL: la de arriba · Productos: los 6
   - Eventos: **Compra aprobada**, **Compra completa**, **Compra reembolsada**, **Chargeback**, **Compra cancelada**
3. Botón **"Probar"/"Enviar prueba"** de Hotmart → revisar en Supabase que aparezca la fila en `hotmart_purchases`.
   Luego borrar esa fila de prueba.
4. Con la automatización poscompra lista en MailerLite: cambiar `BUYER_SYNC_ENABLED` a `true`.
5. Revisar `ml_error` en la tabla la primera semana (si algo falló con MailerLite, queda anotado ahí).

## Condición para las automatizaciones de venta (no se editaron)
- Venta Perro: excluir **Compradores · Perro** y **Compradores · Pack**
- Venta Turismo: excluir **Compradores · Turismo** y **Compradores · Pack**
- Venta Pack: excluir **Compradores · Pack** (y opcional: quien esté en Perro y Turismo a la vez)
- Venta México: excluir **Compradores · México** · Venta Kit: excluir **Compradores · Kit**
- Poscompra: disparador "se une al grupo Compradores · <Producto>".
