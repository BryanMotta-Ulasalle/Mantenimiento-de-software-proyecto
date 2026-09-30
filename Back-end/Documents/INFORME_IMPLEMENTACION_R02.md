# Informe de implementación R02 — Gráficas estadísticas del Dashboard

Fecha: 18 de septiembre de 2026.

## Objetivo

Mejorar `/admin/dashboard` con métricas y gráficas obtenidas desde datos reales agregados por Django, sin descargar listas completas para calcular estadísticas en React y dejando la respuesta reutilizable para R03.

## Diagnóstico previo del dashboard

El dashboard mostraba seis tarjetas útiles: productos, stock bajo, categorías, órdenes, valor de órdenes y usuarios. Sin embargo, `useDashboardAdmin` descargaba listados completos de productos, categorías, órdenes y usuarios, y calculaba los totales, el stock bajo y el monto de pedidos en el navegador. También mostraba las cinco órdenes recientes.

R01 se verificó como parte de la suite completa: sus filtros de productos permanecen sin cambios. No se detectaron ni se añadieron referencias a Outbox.

## Arquitectura implementada

Se mantiene el patrón indicado por `ARQUITECTURA_FRONTEND_REACT_ESCALABLE.md`:

```text
DashboardSummaryView (Django) → dashboardApi.js → useDashboardAdmin → DashboardPage → componentes de gráficas
```

La nueva app Django `apps.dashboard` contiene exclusivamente el endpoint estadístico, su constante y sus pruebas. En React, la feature `dashboard` contiene API, hook, página y componentes específicos. Ningún componente realiza peticiones Axios directamente.

## Endpoint creado

```text
GET /api/dashboard/summary/
```

Está protegido con `IsAdmin`; un administrador autenticado puede consultarlo, mientras que clientes reciben 403 y usuarios sin autenticación 401.

## Estructura JSON del endpoint

```json
{
  "summary": {
    "products": 75,
    "categories": 8,
    "users": 120,
    "orders": 48,
    "order_amount": "8430.00",
    "low_stock_products": 5,
    "low_stock_threshold": 5
  },
  "orders_by_month": [
    { "month": "2026-06", "label": "Junio", "total": "1500.00" }
  ],
  "products_by_category": [
    { "category": "Tecnología", "count": 25 }
  ],
  "recent_orders": []
}
```

Los importes se exponen como texto decimal para evitar pérdida de precisión en el contrato JSON. El frontend los formatea para visualización.

## Métricas

- Total de productos, categorías, usuarios y pedidos.
- Monto acumulado de pedidos creados. No se denomina venta pagada porque el proyecto no tiene flujo de pagos activo.
- Productos con bajo stock: se cuentan todos los productos con `stock <= 5`. El valor está centralizado como `LOW_STOCK_THRESHOLD` en `Back-end/apps/dashboard/constants.py`, evitando números mágicos.

## Gráfica de pedidos por mes

`OrdersByMonthChart` representa el monto acumulado de pedidos agrupado por mes. Django usa `TruncMonth` y `Sum` para que PostgreSQL/Django realicen la agregación. Muestra título, leyenda, valores, etiquetas de mes y tooltip nativo al pasar sobre cada barra. Sin pedidos presenta `EmptyState` en lugar de romper la pantalla.

## Gráfica de productos por categoría

`ProductsByCategoryChart` representa barras horizontales usando el conteo ORM `Count('products')`. Cuenta todos los productos, activos e inactivos, coherente con el total de productos mostrado por el dashboard administrativo. Incluye categorías sin productos con valor cero, etiquetas, conteo y tooltip nativo. Sin categorías presenta un estado vacío.

## Nueva dependencia, si existe

No se añadió ninguna dependencia. Las gráficas se implementaron con componentes React y CSS/Tailwind, lo cual evita incorporar una librería redundante para dos visualizaciones simples y mantiene compatibilidad con React/Vite existentes.

## Archivos creados

- `Back-end/apps/dashboard/__init__.py`
- `Back-end/apps/dashboard/apps.py`
- `Back-end/apps/dashboard/constants.py`
- `Back-end/apps/dashboard/views.py`
- `Back-end/apps/dashboard/urls.py`
- `Back-end/apps/dashboard/tests.py`
- `front-end/src/features/dashboard/api/dashboardApi.js`
- `front-end/src/features/dashboard/components/OrdersByMonthChart.jsx`
- `front-end/src/features/dashboard/components/ProductsByCategoryChart.jsx`
- `INFORME_IMPLEMENTACION_R02.md`

## Archivos modificados

- `Back-end/ECommerce/settings.py`: registra `apps.dashboard`.
- `Back-end/ECommerce/urls.py`: incluye las rutas de dashboard bajo `/api/`.
- `front-end/src/features/dashboard/hooks/useDashboardAdmin.js`: reemplaza cuatro descargas de listas por el endpoint único y expone `refetch`.
- `front-end/src/features/dashboard/page/DashboardPage.jsx`: consume el nuevo contrato, mantiene tarjetas y órdenes recientes, y añade las dos gráficas.

## Pruebas backend

`apps.dashboard.tests` prueba:

- acceso de Admin;
- rechazo de Customer y usuario anónimo;
- totales correctos;
- agrupación mensual;
- conteos por categoría;
- respuesta sin pedidos ni productos.

No se depende del orden de creación de categorías: la validación de categorías se realiza mediante un mapa por nombre.

## Verificación frontend

El dashboard conserva el layout responsive: tarjetas en grilla y gráficas en una o dos columnas según el ancho. Las gráficas tienen estados vacíos, etiquetas, leyendas útiles y `title` nativo como tooltip. La respuesta de API se mantiene separada de la pantalla, permitiendo que R03 reutilice `summary`, `orders_by_month` y `products_by_category` sin duplicar agregaciones.

## Resultado de check, tests, lint y build

| Comando | Resultado |
|---|---|
| `python manage.py check` | Correcto, sin incidencias. |
| `python manage.py makemigrations --check --dry-run` | Correcto, sin migraciones pendientes. |
| `python manage.py test apps.dashboard.tests` | Correcto: 4 pruebas superadas. |
| `python manage.py test` | Correcto: 28 pruebas superadas, incluida R01. |
| `npm run lint` | Correcto, sin errores. |
| `npm run build` | Correcto. El directorio temporal `front-end/dist/` se eliminó tras la comprobación. |

## Estado final de R02

R02 está implementado. El dashboard administrativo utiliza un endpoint protegido y agregado en backend, muestra indicadores reales, monto de pedidos por mes, productos por categoría y órdenes recientes. La solución no añade Outbox ni PDF; R03 no se implementó.
