# Informe de implementación R01 — Búsqueda y filtrado de productos

Fecha: 18 de septiembre de 2026.

## Objetivo

Implementar búsqueda y filtros combinables de productos con consulta real al backend Django, disponibles en la administración de productos y reutilizados de forma simplificada en el catálogo público.

## Diagnóstico previo

- `Product` ya incluía categoría, `stock` y `status`, por lo que no fue necesario alterar el modelo ni crear migraciones.
- `ProductViewSet` exponía el catálogo completo, pero no procesaba parámetros de consulta.
- `fetchProducts` y `useProducts` listaban sin argumentos. Las páginas pública y administrativa los consumían de manera independiente.
- La arquitectura indicada en `ARQUITECTURA_FRONTEND_REACT_ESCALABLE.md` establece el flujo API → hook → página → componente. Esta implementación lo conserva: ningún componente llama Axios directamente.
- El documento de arquitectura mantiene menciones históricas de Outbox, pero no se utilizó ni se reintrodujo esa funcionalidad.

## Backend modificado

`Back-end/apps/products/views.py` incorpora `ProductViewSet.get_queryset()`. Los filtros se aplican sobre el queryset ya optimizado con `select_related` y `prefetch_related`, por lo que se combinan mediante condiciones AND.

- Búsqueda por `name__icontains`.
- Categoría por la FK real `category_id`.
- Estado por el campo `status`.
- Disponibilidad por el campo `stock`.
- Parámetros inválidos de categoría, estado o stock responden con un error de validación claro.

No se añadieron dependencias: la solución usa el queryset nativo de Django y DRF ya instalados.

`Back-end/apps/products/tests.py` amplía las pruebas de productos con:

- listado público sin parámetros;
- búsqueda sin distinción de mayúsculas/minúsculas;
- categoría;
- activo/inactivo;
- productos con stock y sin stock;
- combinación de los cuatro filtros.

## Frontend modificado

- `productsApi.fetchProducts(params)` recibe parámetros y los entrega a Axios mediante `params`; no se construyen URLs en componentes.
- `useProducts(filters = {})` conserva `data`, `products`, `isLoading`, `error` y `refetch`. Serializa los filtros para actualizar la consulta solo cuando cambia su contenido y evitar ciclos de `useEffect`.
- `ProductFilters` es un componente específico de la feature `products`, recibe datos/callbacks por props y se reutiliza en ambas páginas.
- `/admin/productos` muestra búsqueda, categoría, estado, disponibilidad y limpieza. Crear, editar, eliminar y `refetch` mantienen los filtros actuales.
- `/tienda/productos` muestra búsqueda y categoría. Solicita `is_active=true` de forma interna para que el catálogo no muestre productos inactivos; no expone al cliente filtros administrativos de estado ni stock.
- Los resultados vacíos usan `EmptyState` con el mensaje “No se encontraron productos con los filtros seleccionados.”

## Archivos creados

- `front-end/src/features/products/components/shared/ProductFilters.jsx`
- `INFORME_IMPLEMENTACION_R01.md`

## Archivos modificados

- `Back-end/apps/products/views.py`
- `Back-end/apps/products/tests.py`
- `front-end/src/features/products/api/productsApi.js`
- `front-end/src/features/products/hooks/useProducts.js`
- `front-end/src/features/products/components/customer/ProductGrid.jsx`
- `front-end/src/features/products/components/staff/ProductTable.jsx`
- `front-end/src/features/products/pages/customer/ProductsPage.jsx`
- `front-end/src/features/products/pages/staff/ProductsPage.jsx`

## Funcionamiento de los filtros

El panel administrativo conserva todos los productos por defecto. Al elegir cualquier filtro, la página vuelve a consultar la API; se pueden combinar búsqueda, categoría, estado y disponibilidad. Limpiar devuelve todos los valores al estado inicial.

El catálogo público inicia con activos y permite combinar búsqueda y categoría. Limpiar conserva el filtro interno de activos y elimina los criterios elegidos por el cliente.

## Parámetros disponibles en la API

| Parámetro | Valores | Efecto |
|---|---|---|
| `search` | Texto | Coincidencia case-insensitive en el nombre. |
| `category` | ID numérico | Productos de esa categoría. |
| `is_active` | `true` / `false` | Productos activos o inactivos. |
| `stock` | `available` / `out` | `available` equivale a `stock > 0`; `out`, a `stock = 0`. |

Ejemplo combinable:

```text
/api/products/?search=mouse&category=2&is_active=true&stock=available
```

## Pruebas realizadas

- Búsqueda por nombre: cubierta por prueba de `mouse` frente a nombres con distintas mayúsculas.
- Filtros individuales de categoría, estado y stock: cubiertos por pruebas de API.
- Combinación de todos los filtros: cubierta por prueba de API.
- Sin parámetros/listado público y filtros sin coincidencias: cubiertos por pruebas de API.
- Limpieza de filtros, sin resultados y recarga tras CRUD: implementados en el flujo de estado de las páginas; el componente conserva los callbacks de creación, edición, borrado y `refetch` existentes.
- No quedaron referencias activas a Outbox en backend ni en `front-end/src`.

## Resultados de check, tests, lint y build

| Comando | Resultado |
|---|---|
| `python manage.py check` | Correcto, sin incidencias. |
| `python manage.py makemigrations --check --dry-run` | Correcto, sin migraciones pendientes. |
| `python manage.py test apps.products.tests` | Correcto: 12 pruebas superadas. |
| `python manage.py test` | Correcto: 24 pruebas superadas. |
| `npm run lint` | Correcto, sin errores. |
| `npm run build` | Correcto, bundle generado por Vite. El directorio temporal `front-end/dist/` se eliminó después de comprobarlo. |

## Problemas encontrados y cómo fueron solucionados

El principal riesgo era que la nueva referencia `filters` pudiera provocar consultas infinitas si se usaba directamente como dependencia de `useEffect`. Se resuelve comparando una representación serializada de sus valores, manteniendo una consulta estable entre renders sin perder `refetch`.

El componente de filtros necesita categorías reales, por lo que ambas páginas reutilizan el hook existente `useCategory` en lugar de realizar llamadas HTTP adicionales o duplicar datos estáticos.

## Estado final de R01

R01 está implementado y verificado. Los productos se filtran en Django, los criterios se pueden combinar, la UI administrativa y el catálogo público reutilizan el mismo componente de feature y las funcionalidades existentes de productos permanecen operativas. No se implementaron R02 ni R03.

## Mejora de experiencia de filtrado

### Problema detectado

`useProducts` activa `isLoading` para cada consulta. Tanto la página administrativa como el catálogo usaban ese valor para sustituir toda la página por `LoadingState`; por eso, al cambiar un filtro o escribir en la búsqueda, desaparecían temporalmente título, botones y filtros.

### Carga inicial y actualización

El hook ahora conserva `isLoading` por compatibilidad y expone dos estados adicionales:

- `isInitialLoading`: se usa solo antes de completar la primera consulta, por lo que puede mostrar la pantalla completa de carga.
- `isRefreshing`: se activa al cambiar filtros o ejecutar `refetch` después de la primera carga.

Las páginas de productos mantienen visibles su estructura, encabezado, botón de creación y filtros durante `isRefreshing`. Solamente el área de `ProductTable` o `ProductGrid` reduce ligeramente su opacidad y muestra la etiqueta **Actualizando...** hasta recibir los resultados nuevos.

### Debounce utilizado

`ProductFilters` mantiene el texto del buscador localmente y propaga el filtro `search` después de 300 ms sin nuevas pulsaciones. Un `useRef` cancela el temporizador anterior, de modo que una escritura rápida produce una única consulta al detenerse. Categoría, estado y disponibilidad siguen actualizando inmediatamente; no tienen debounce.

Al limpiar filtros se cancela cualquier temporizador pendiente y se limpia tanto el input como los criterios activos.

### Archivos modificados

- `front-end/src/features/products/hooks/useProducts.js`
- `front-end/src/features/products/components/shared/ProductFilters.jsx`
- `front-end/src/features/products/pages/staff/ProductsPage.jsx`
- `front-end/src/features/products/pages/customer/ProductsPage.jsx`

### Verificaciones realizadas

- Revisión estática del flujo de búsqueda rápida, búsqueda lenta, borrado, selects inmediatos, combinación y limpieza de filtros.
- Confirmación de que no se modificó Django ni la API de filtros.
- `python manage.py test`: 28 pruebas superadas.
- `npm run lint`: correcto, sin errores.
- `npm run build`: correcto.
