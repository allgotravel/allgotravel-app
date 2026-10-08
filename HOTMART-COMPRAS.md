# Compras de Hotmart → Supabase → MailerLite (guías)

Construido y probado el 9-oct-2026. **Inactivo** hasta que se haga push (después de la semana de medición), se configure
Hotmart y se encienda el interruptor. La membresía del Club funciona igual que antes.

- **Receptor:** `app/api/webhooks/hotmart/route.ts` (el mismo webhook de siempre, protegido con `HOTMART_HOTTOK`).
  Para las guías llama a `lib/hotmartPurchases.ts` antes del flujo del Club.
- **URL del webhook:** `https://www.allgotravel.app/api/webhooks/hotmart` (con **www**: la versión sin www redirige y Hotmart no sigue redirecciones en POST)
- **Tabla:** `public.hotmart_purchases` (una fila por transacción; RLS cerrada para anon y authenticated).
- **Base:** `public.hotmart_record_event(jsonb)` y `public.hotmart_mark_ml_sync(...)`, solo para service_role.
  Migración: `supabase/migrations/20261009120000_hotmart_purchases.sql` (ya aplicada).
- **Pruebas:** `npx jiti lib/hotmartPurchases.test.ts` · RLS: `select security_tests.run_rls_test();`

## Qué hace con cada evento (solo productos de guías)
| Evento | Estado en la tabla | MailerLite (solo si `BUYER_SYNC_ENABLED=true`) |
|---|---|---|
| PURCHASE_APPROVED, PURCHASE_COMPLETE | `active` (service_ok = true) | entra a **Compradores · <Producto>** |
| PURCHASE_REFUNDED / CHARGEBACK / CANCELED | `refunded` / `chargeback` / `canceled` (service_ok = false) | sale de ese grupo |
| Otros eventos | fila mínima `pending` | nada |
| El mismo evento reenviado | nada | nada |

Una aprobación que llegue después de un reembolso no revive la compra. Se guarda solo correo, nombre de pila, producto,
precio, moneda, `sck`/`src` y estados. `marketing_ok` = false (Hotmart no envía ese consentimiento).
Si MailerLite falla, la compra queda guardada y el error en `ml_error`. Si la base falla, la ruta responde 500 y Hotmart reintenta.

| Producto Hotmart | Grupo MailerLite (ID) |
|---|---|
| 8150917 Perro | Compradores · Perro (200797004871239606) |
| 8020788 Turismo | Compradores · Turismo (200797007864924011) |
| 8605596 Pack | Compradores · Pack (200797008925033486) |
| 8335262 Kit · 8374052 Kit Silla | Compradores · Kit (200797009951590302) |
| 8681979 México | Compradores · México (200797006221804568) |

## Checklist para activar (después de la semana de medición)
1. **Push** del código (Yadi, con GitHub Desktop) y esperar el deploy en Vercel.
2. **Vercel → allgotravel-app → Settings → Environment Variables** (Production): agregar
   - `MAILERLITE_API_KEY` = token de MailerLite (Integraciones → API → nuevo token)
   - `BUYER_SYNC_ENABLED` = `false`
   (`HOTMART_HOTTOK` y `SUPABASE_SERVICE_ROLE_KEY` ya existen.) Después: **Redeploy**.
3. **Hotmart → Herramientas → Webhook (API y notificaciones):** en la configuración que apunta a la URL de arriba
   (o una nueva), versión **2.0.0**, marcar los **6 productos** y los eventos **Compra aprobada, Compra completa,
   Compra reembolsada, Chargeback, Compra cancelada**. El hottok es el mismo de la cuenta.
4. **Prueba:** botón "Enviar prueba" de Hotmart → en Supabase, `hotmart_purchases` debe tener la fila. Borrarla después.
5. Con la automatización "AllGo · Poscompra" lista: `BUYER_SYNC_ENABLED` = `true` en Vercel → Redeploy.
6. Primera semana: revisar `ml_error` en la tabla.

## Condición para las automatizaciones de venta (no se editaron)
- Perro (y la "Nurture → Club", que vende Perro): excluir **Compradores · Perro** y **Compradores · Pack**
- Turismo: excluir **Compradores · Turismo** y **Compradores · Pack** · México: **Compradores · México** · Kit: **Compradores · Kit**
- La exclusión del disparador solo revisa al entrar: además, una condición "está en Compradores · …" antes de cada correo.

## Pendiente de limpiar
- La función Edge `hotmart-webhook` de Supabase (primer intento) quedó retirada: responde 410 y no guarda nada.
  Se puede borrar en Supabase → Edge Functions → hotmart-webhook → Delete.
