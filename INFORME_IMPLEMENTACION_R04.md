# Informe de implementación R04

## Objetivo

Incorporar ordenamiento seguro de productos en el backend mediante el parámetro `ordering`, manteniendo el comportamiento y los filtros de R01.

## Estado previo

`Product` ya contenía `name`, `price`, `stock` y `created_at`. `ProductViewSet` utilizaba un queryset base con `select_related('category')`, `prefetch_related('product_images')` y `order_by('id')`.

R01 ya filtraba dentro de `get_queryset()` mediante `search`, `category`, `is_active` y `stock`. Sin `ordering`, esos filtros preservaban el orden ascendente por identificador.

## Backend modificado

Se añadió la constante local `ALLOWED_ORDERING` en `apps/products/views.py` y se integró la lectura de `ordering` al final de `ProductViewSet.get_queryset()`.

- Solo se ejecuta `queryset.order_by(ordering)` después de validar el valor contra la lista blanca.
- Un criterio no permitido responde HTTP 400 con `ordering: "Criterio de ordenamiento no válido."`, siguiendo el estilo de validaciones de R01.
- Si no se envía `ordering`, no se sobrescribe el queryset base y se conserva `order_by('id')`.
- No se modificaron modelos, serializers, rutas, dependencias ni frontend.

## Valores permitidos

| `ordering` | Resultado |
|---|---|
| `name` | Nombre A-Z |
| `-name` | Nombre Z-A |
| `price` | Precio menor-mayor |
| `-price` | Precio mayor-menor |
| `stock` | Stock menor-mayor |
| `-stock` | Stock mayor-menor |
| `created_at` | Más antiguos |
| `-created_at` | Más recientes |

## Compatibilidad con R01

El ordenamiento se aplica sobre el queryset ya filtrado. Las pruebas cubren las combinaciones:

- `search` + `ordering`;
- `category` + `ordering`;
- `search` + `category` + `is_active` + `stock` + `ordering`.

Los filtros R01 existentes no cambiaron. La ausencia de `ordering` continúa devolviendo los productos por `id` ascendente.

## Archivos modificados

- `Back-end/apps/products/views.py`
- `Back-end/apps/products/tests.py`
- `INFORME_IMPLEMENTACION_R04.md`

## Pruebas realizadas

Se añadieron 13 pruebas de ordenamiento para verificar:

- nombre, precio, stock y fecha, en sentido ascendente y descendente;
- combinaciones con los filtros R01;
- criterio inválido con respuesta 400;
- conservación del orden predeterminado por `id`.

Los datos de prueba usan valores distintos de nombre, precio, stock y fecha para asegurar que cada aserción valida el criterio correspondiente y no un orden incidental.

## Resultado de comandos

| Comprobación | Resultado |
|---|---|
| Django check | Correcto: sin incidencias. |
| Migraciones | Correcto: `No changes detected`. |
| Tests products | Correcto: 25 pruebas superadas. |
| Tests backend | Correcto: 45 pruebas superadas. |
| ESLint | Correcto: sin errores. |
| Vite build | Correcto. Se eliminó `front-end/dist` tras la comprobación para no dejar artefactos. |

## Estado final R04

R04 quedó implementado. La API acepta exclusivamente los ocho valores documentados para `ordering`, combina el orden con R01 de manera segura y conserva el orden por `id` cuando el parámetro no se envía. R05 y el resto de requisitos no fueron implementados.
