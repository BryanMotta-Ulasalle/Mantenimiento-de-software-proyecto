# Informe de eliminación de Outbox

Fecha: 18 de septiembre de 2026.

Se retiró completamente la funcionalidad Outbox del backend y del frontend. No se modificaron las funciones de catálogo, autenticación, usuarios, roles, carrito ni la lógica de pedidos, salvo para eliminar la generación del evento al finalizar una compra.

## Archivos eliminados

### Backend

Se eliminó por completo el directorio `Back-end/apps/outbox/`, incluido:

- `__init__.py`, `apps.py`, `models.py`, `serializers.py`, `views.py`, `urls.py`, `admin.py` y `tests.py`.
- El comando `management/commands/process_outbox.py` y sus paquetes contenedores.
- Las migraciones históricas `0001_initial.py` y `0002_delete_outboxevent.py` junto con los archivos compilados temporales.

La app ya no está instalada ni forma parte del código fuente. El historial de migraciones aplicado en PostgreSQL conserva el registro de `outbox.0002_delete_outboxevent`, que fue el que eliminó físicamente la tabla antes de retirar la app.

### Frontend

Se eliminó por completo `front-end/src/features/outbox/`, con estos archivos:

- `api/outboxApi.js`
- `hooks/useOutboxEvents.js` y `hooks/useOutboxEventDetail.js`
- `components/OutboxEventDetailModal.jsx` y `components/OutboxStatusBadge.jsx`
- `pages/OutboxEventsPage.jsx`

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `Back-end/apps/orders/views.py` | Se retiraron el import de `OutboxEvent`, la construcción de payload y la creación del evento. Se preservan `transaction.atomic()`, bloqueos, validación de stock, creación de orden/ítems, actualización de stock y vaciado del carrito. |
| `Back-end/apps/orders/tests.py` | Se eliminaron comprobaciones y simulaciones exclusivas de Outbox. Permanecen las pruebas de stock, creación de pedido, ítems, inventario y limpieza de carrito. |
| `Back-end/ECommerce/settings.py` | Se quitó `apps.outbox` de `INSTALLED_APPS`. |
| `Back-end/ECommerce/urls.py` | Se retiró el include de las rutas de Outbox; `/api/outbox-events/` deja de existir. |
| `front-end/src/routes/AppRouter.jsx` | Se quitaron import y ruta `/admin/outbox`. |
| `front-end/src/constants/navigation.js` | Se quitó el enlace administrativo “Eventos Outbox” y su icono. |
| `README.md` | Se eliminaron los comandos de uso y prueba de Outbox. |

## Backend

Antes de eliminar la app se creó y aplicó la migración `outbox.0002_delete_outboxevent`. Esta ejecutó `DeleteModel(OutboxEvent)` y eliminó la tabla `outbox_events` de PostgreSQL. Solo después se retiró la app, su API, serializers, vistas, rutas, Django Admin y comando de management.

La creación de pedidos ya no crea `OutboxEvent`. Su flujo queda así:

```text
Carrito → validar/bloquear stock → crear Order → crear OrderItems
→ descontar inventario → vaciar carrito → confirmar transacción
```

La operación continúa dentro de `transaction.atomic()`.

## Frontend

Se eliminaron página, modal, badge de estado, hooks y cliente API de Outbox. La ruta administrativa y su entrada de navegación también fueron retiradas. El dashboard no consumía datos de Outbox, por lo que no requirió cambios.

## Verificaciones

| Comprobación | Resultado |
|---|---|
| `python manage.py check` | Correcta: sin incidencias. |
| `python manage.py makemigrations --check --dry-run` | Correcta: sin cambios pendientes. |
| `python manage.py test apps.orders.tests` | Correcta: 5 pruebas superadas; valida el flujo de pedido sin Outbox. |
| `npm run lint` | Correcta: sin errores. |
| `npm run build` | Correcta: Vite generó el bundle de producción correctamente. El directorio temporal `front-end/dist/` se eliminó después de verificarlo. |

## Resultado final

No quedan referencias activas a Outbox en código, configuración, rutas, navegación, API o pruebas. Las únicas menciones restantes son documentación histórica del diagnóstico anterior y este informe de eliminación; no participan en la ejecución del sistema.
