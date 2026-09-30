# DIAGNÓSTICO GENERAL DEL PROYECTO

Fecha del análisis: 16 de septiembre de 2026. Este informe se elaboró revisando el código, configuración y migraciones, sin modificar el sistema salvo por este archivo. Se ejecutaron `python manage.py check`, `python manage.py makemigrations --check --dry-run` y `npm run lint`: los tres finalizaron sin errores. No se ejecutaron pruebas que creen datos ni una compra real contra PostgreSQL, por lo que las conclusiones de funcionamiento en ejecución se basan en el código.

## 1. Estructura y arquitectura

El repositorio se divide en `front-end/` y `Back-end/`:

- `front-end/`: aplicación React organizada por funcionalidades (`features`), componentes reutilizables, rutas, contextos y un cliente HTTP.
- `Back-end/`: proyecto Django `ECommerce`, con las apps `users`, `products`, `orders` y `outbox`.
- No hay un repositorio Git en la raíz analizada (el comando `git status` indica que no es un repositorio), por lo que no se pudo establecer el estado de cambios previos.

La arquitectura es una SPA de React/Vite que consume una API REST bajo `/api/`. Django REST Framework expone `ViewSet` mediante routers; PostgreSQL conserva los datos. La sesión usa JWT: React guarda `access` y `refresh` en `localStorage`, y Axios añade el encabezado `Authorization: Bearer ...` y refresca el token ante un 401.

### Tecnologías y dependencias principales

| Área | Estado encontrado | Evidencia |
|---|---|---|
| Frontend | React 19.2.6, React Router DOM 7.17.0, Vite 8, Tailwind CSS 4, Axios 1.17.0 y Lucide | `front-end/package.json` |
| Backend | Django 5.2.14, DRF 3.17.1, SimpleJWT, drf-spectacular, django-cors-headers y python-decouple | `Back-end/requirements.txt` |
| Base de datos | PostgreSQL; el contenedor de desarrollo usa PostgreSQL 16 | `Back-end/ECommerce/settings.py`, `Back-end/docker-compose.yml` |
| API/documentación | REST con OpenAPI, Swagger y Redoc | `Back-end/ECommerce/urls.py` |

Las credenciales de PostgreSQL se toman de variables `DB_*` mediante `.env`. El frontend tiene `.env` y `.env.example`; el cliente espera `VITE_API_URL` y si falta usa `http://127.0.0.1:8000/api` (`front-end/src/api/client.js`).

## 2. Frontend

### Páginas implementadas

| Área | Ruta | Página | Protección |
|---|---|---|---|
| Inicio | `/` | Hero y categorías | Pública |
| Catálogo | `/tienda/productos` | Lista de productos | Pública |
| Detalle | `/tienda/productos/:id/` | Detalle e imágenes disponibles | Pública |
| Acceso | `/login`, `/register` | Inicio de sesión y registro | Pública |
| Compra | `/carrito` | Carrito y formulario de dirección/creación de pedido | Usuario autenticado |
| Cuenta | `/cuenta`, `/cuenta/ordenes` | Perfil y pedidos propios | Usuario autenticado |
| Administración | `/admin/dashboard`, `/admin/productos`, `/admin/categorias`, `/admin/ordenes`, `/admin/usuarios`, `/admin/roles`, `/admin/outbox` | Gestión y consulta administrativa | Según rol |

La definición está en `front-end/src/routes/AppRouter.jsx`. `PrivateRoute.jsx` redirige al login, conserva la ruta de retorno y espera la restauración de sesión. `RoleRoute.jsx` restringe interfaz a `Admin` o `Employee`; no sustituye las validaciones del backend, que sí existen para los recursos principales.

### Componentes y estado

Los componentes comunes incluyen botones, diálogo de confirmación, modal, estados de carga/error/vacío, tablas, formularios y dos navegaciones: pública y privada (`src/components/`). Productos, categorías, carrito, pedidos, usuarios, roles y outbox tienen cada uno `api`, hooks, componentes y páginas. Es una organización razonable por funcionalidad.

Se emplea `useState` y `useEffect`; no hay Redux, Zustand ni otra tienda global. Los dos estados globales son Context API:

- `AuthProvider.jsx`: usuario, tokens, carga, login/logout y restauración de sesión.
- `CartProvider.jsx`: carrito del usuario, contador, alta, modificación, borrado y recarga.

Los hooks locales encapsulan las peticiones y los mensajes de error. `getApiErrorMessage` centraliza parte de la presentación de errores (`src/api/errors.js`).

### Comunicación con Django

Axios centralizado (`src/api/client.js`) usa base configurable, `Content-Type: application/json`, token Bearer y reintento único tras refrescar `/auth/refresh/`. Los módulos API consumen las rutas correctas de usuarios, productos, categorías, carrito, pedidos y outbox. Hay manejo visual de cargas y errores en la mayoría de páginas.

## 3. Backend

### Aplicaciones

| App | Responsabilidad |
|---|---|
| `users` | Usuario personalizado, roles, registro, perfil y administración de cuentas/roles. |
| `products` | Categorías, productos e imágenes de producto. |
| `orders` | Carrito, ítems, creación y consulta de pedidos; modelo de pago aún sin uso operativo. |
| `outbox` | Registro transaccional de eventos creados al confirmar una orden y comando de proceso simulado. |

### Modelos y relaciones

| Modelo | Propósito y campos principales | Relaciones |
|---|---|---|
| `Role` | Nombre único del rol | Un rol tiene muchos `User`. |
| `User` | Nombre, email único, contraseña hash, activo/staff y fechas | FK obligatoria a `Role` (`PROTECT`). |
| `Category` | Nombre y descripción | Una categoría tiene muchos `Product`. |
| `Product` | Categoría, nombre, descripción, precio, stock, estado y fechas | FK a categoría; tiene imágenes, ítems de carro y de pedido. |
| `ProductImage` | URL de imagen y marca principal | FK a producto. |
| `Cart` | Carrito y fecha | OneToOne con usuario; contiene muchos `CartItem`. |
| `CartItem` | Producto y cantidad | FK a carro y producto. |
| `Order` | Usuario, estado, total calculado y dirección | FK a usuario; tiene ítems y un pago. |
| `OrderItem` | Producto, cantidad y precio unitario histórico | FK a pedido y producto. |
| `Payment` | Método, estado, transacción y monto | OneToOne con pedido. |
| `OutboxEvent` | Evento, agregado, JSON, estado, intentos y fechas | Sin FK: identifica el agregado por tipo/id. |

Evidencia: `apps/*/models.py`. Hay migraciones para las cuatro apps y la comprobación de migraciones no detectó modelos pendientes. Al borrar un usuario, `Order.user` tiene `CASCADE`: se borrarían también sus pedidos; es una decisión de diseño delicada para historial comercial.

### Serializers, vistas y endpoints

DRF usa `ModelViewSet` para roles, categorías, productos, carros e ítems; usuarios permite listar, obtener, actualizar y borrar; pedidos permite listar, obtener y crear; outbox es solo lectura. `RegisterView` es un `APIView`. La tabla resume las rutas producidas por los routers (`apps/*/urls.py`):

| Método | Endpoint | Función | Autenticación |
|---|---|---|---|
| POST | `/api/auth/register/` | Registro como Customer | No |
| POST | `/api/auth/login/` | Emite access/refresh JWT | No |
| POST | `/api/auth/refresh/` | Renueva access JWT | No, usa refresh |
| GET/PATCH/PUT | `/api/users/me/` | Consulta/edita el perfil propio | Sí |
| GET, PATCH, PUT, DELETE | `/api/users/{id}/` | Administración de usuarios | Admin |
| GET | `/api/users/` | Lista usuarios | Admin |
| GET/POST y GET/PATCH/PUT/DELETE | `/api/roles/`, `/api/roles/{id}/` | CRUD de roles | Admin |
| GET | `/api/categories/`, `/api/categories/{id}/` | Catálogo de categorías | No |
| POST/PATCH/PUT/DELETE | Rutas de categorías | Gestión de categorías | Admin o Employee |
| GET | `/api/products/`, `/api/products/{id}/` | Catálogo/detalle | No |
| POST/PATCH/PUT/DELETE | Rutas de productos | Gestión de productos | Admin o Employee |
| GET/POST y GET detalle/PUT/PATCH/DELETE | `/api/carts/`, `/api/carts/{id}/` | Carros del usuario; Admin ve todos | Sí |
| GET/POST y GET detalle/PUT/PATCH/DELETE | `/api/cart-items/`, `/api/cart-items/{id}/` | Ítems del carro | Sí |
| GET/POST, GET detalle | `/api/orders/`, `/api/orders/{id}/` | Crear/listar/ver pedidos | Sí; Admin ve todos |
| GET, GET detalle | `/api/order-items/`, `/api/order-items/{id}/` | Consulta de ítems de pedido | Sí; Admin ve todos |
| GET, GET detalle | `/api/outbox-events/`, `/api/outbox-events/{id}/` | Auditoría de eventos; filtro `?status=` | Admin |
| GET | `/api/schema/`, `/api/docs/`, `/api/redoc/` | Esquema y documentación API | No se configuró restricción |

También existe Django Admin en `/admin/`. Registra usuarios, roles, categorías, productos y outbox, pero **no** registra pedidos, ítems, carros ni pagos (`apps/orders/admin.py` está vacío).

## 4. Autenticación y usuarios

| Función | Estado | Evidencia y observación |
|---|---|---|
| Registro | ✅ Funcional | `RegisterView` y `RegisterSerializer`; fuerza el rol `Customer`. |
| Login | ✅ Funcional | SimpleJWT, formulario React y almacenamiento de tokens. |
| Cierre de sesión | ✅ Funcional en cliente | Borra tokens/local state; no existe invalidación/blacklist de refresh en servidor. |
| Renovación JWT | ✅ Funcional | Interceptor Axios + `TokenRefreshView`. |
| Perfil | ✅ Funcional | `/users/me/` permite nombre y email, no contraseña. |
| Roles/permisos | ⚠️ Parcial | Roles Admin/Employee/Customer y restricciones de API existen, pero el backend permite al Admin renombrar/borrar los roles base. |
| Administración de usuarios | ⚠️ Parcial | CRUD para Admin, pero el backend permite borrar su propia cuenta y elimina pedidos por cascada. |
| Cambio de contraseña | ⚠️ Parcial | Un Admin puede enviar `password` al editar usuarios; el perfil propio no ofrece cambio seguro de contraseña. |
| Recuperación de contraseña | ❌ No implementada | No hay endpoint, correo ni pantalla. |
| Superusuario inicial | 🐛 Posible error | `UserManager.create_superuser` no asigna el FK obligatorio `role`; el README también lo advierte. |

Los roles base se crean tras migrar con señal `post_migrate` (`apps/users/signals.py`, `bootstrap.py`), lo que permite registrar clientes en una base nueva.

## 5. Funcionalidades de e-commerce y estado

| Funcionalidad | Estado | Frontend | Backend | Observaciones |
|---|---|---|---|---|
| Registro/login/perfil | ✅ Funcional | Sí | Sí | JWT y perfil conectados. |
| Listar/ver detalle de productos | ✅ Funcional | Sí | Sí | Público; muestra imágenes ya existentes. |
| CRUD de productos | ✅ Funcional | Sí | Sí | Solo Admin/Employee; sin búsqueda ni filtros. |
| Categorías | ✅ Funcional | Sí | Sí | Públicas al leer; CRUD para staff. |
| Imágenes de producto | ⚠️ Parcial | Solo visualización | Modelo/serializer de solo lectura | No hay endpoint ni formulario para crear/editar `ProductImage`. |
| Carrito persistente por usuario | ✅ Funcional | Sí | Sí | OneToOne y alta automática al añadir ítem. |
| Modificar/eliminar ítems | ✅ Funcional | Sí | Sí | Cliente limita visualmente según stock; servidor no impone ese límite al modificar. |
| Crear pedido desde carrito | ✅ Funcional | Sí | Sí | Transacción bloquea productos, valida stock, descuenta y vacía carro. |
| Historial/detalle de pedido | ⚠️ Parcial | Sí | Sí | Funciona, pero la API omite `created_at`, por lo que la fecha se muestra como no disponible. |
| Gestión de estado de pedido | ❌ No implementada | Solo consulta | No hay update en `OrderViewSet` | Siempre nace `pending`. |
| Checkout | ⚠️ Parcial | Sí | Sí | Solo dirección y resumen; no hay datos de envío estructurados, confirmación independiente ni pago. |
| Pagos | ❌ No implementada | No | Modelo inactivo | `PaymentViewSet` está comentado y no hay integración. |
| Dashboard administrativo | ✅ Funcional con datos disponibles | Sí | Sí | Calcula métricas en cliente a partir de listas API. |
| Outbox/eventos | ⚠️ Parcial | Sí | Sí | Crea evento al pedir y lo lista; el comando solo simula imprimir un email, no lo envía. |

## 6. Flujo actual del sistema

**Cliente:** visita inicio/categorías → abre catálogo o detalle → al añadir sin sesión es dirigido a login → se registra (Customer) o inicia sesión → el token se guarda → añade/ajusta/elimina productos del carrito → ingresa una dirección y crea una orden → el servidor valida stock, descuenta inventario, vacía el carro y registra un evento outbox → consulta sus pedidos. No hay cobro ni avance de estado.

**Employee:** inicia sesión → puede crear, editar o eliminar productos y categorías. No accede a usuarios, roles, pedidos, dashboard ni outbox desde las rutas React.

**Admin:** además de catálogo, administra usuarios y roles, consulta todas las órdenes, dashboard y eventos outbox. Puede ver detalles, pero no cambiar el estado de un pedido.

## Estado de integración Frontend - Backend

Las llamadas declaradas en `features/*/api/*.js` coinciden en ruta, método y estructura con la API Django: por ejemplo, `product_id` y `category_id` se ajustan a los `PrimaryKeyRelatedField`, y `shipping_address` llega al serializer de órdenes. También coinciden las rutas de JWT y `/users/me/`.

Problemas concretos de integración:

1. **Fecha de pedidos perdida (importante).** `Order` posee `created_at` (`apps/orders/models.py`) pero `OrderSerializer` no lo incluye (`apps/orders/serializers.py`). `MyOrdersPage.jsx` intenta formatearlo y mostrará “Fecha no disponible”; `OrdersPage.jsx` ya deja explícitamente “No disponible”.
2. **El cliente oculta, pero el servidor no protege, roles base (crítico de seguridad/autorización).** `RolesPage.jsx` deshabilita botones para Admin/Employee/Customer, pero `RoleViewSet` permite a cualquier Admin modificar/borrar cualquier rol. Renombrar `Admin` rompe comprobaciones que dependen literalmente del nombre en `permissions.py`.
3. **Stock solo se valida definitivamente al crear pedido (importante).** `CartItemViewSet` acepta actualizaciones de cantidad sin verificar stock, producto activo ni cantidad positiva. El checkout sí impide pedido con stock insuficiente, pero el carro puede quedar inválido.
4. **Configuración de URL.** Existe fallback local en Axios, útil para desarrollo, pero una compilación desplegada sin `VITE_API_URL` apuntaría a localhost. CORS tiene valores locales por defecto; para otro origen requiere variables de entorno (`settings.py`).
5. **Riesgo de refresco.** Los tokens en `localStorage` simplifican el flujo, pero son expuestos ante XSS; no hay invalidación de refresh al logout.

## 7. Código incompleto, pendiente o abandonado

- `apps/orders/views.py`: `PaymentViewSet` entero está comentado; aunque existen `Payment` y `PaymentSerializer`, no hay URL ni uso real.
- `apps/orders/admin.py`: archivo inicial vacío; no existe gestión de pedidos, carros, ítems o pagos en Django Admin.
- `apps/products/models.py` y serializers: `ProductImage` no tiene ViewSet/router, y `product_images` es de solo lectura; el formulario `ProductForm.jsx` tampoco gestiona imágenes.
- Búsqueda, filtros, paginación y ordenación de productos no están implementados en la API ni interfaz.
- Gestión de estados, cancelación y actualización de pedidos no existen.
- Recuperación/cambio de contraseña seguro y verificación por correo no existen.
- No se encontraron marcadores `TODO`/`FIXME` activos en el código propio. Los comentarios encontrados mayoritariamente describen manejo intencional de errores; el bloque de pagos comentado es la excepción relevante.

## 8. Posibles errores, por prioridad

### Críticos

- **Integridad de permisos basada en nombres editables.** `Back-end/apps/users/views.py` (`RoleViewSet`) permite CRUD de roles a Admin; `permissions.py` compara `role.name` con cadenas fijas. Un cambio/borrado de los roles base puede bloquear administración, registro y acceso de forma inconsistente. La protección de `RolesPage.jsx` es solo cosmética.
- **Borrado de usuarios destruye historial comercial.** `UserViewSet` permite DELETE y `Order.user` usa `on_delete=models.CASCADE`. Un Admin puede borrar clientes con pedidos, y el backend no impide que borre su propia cuenta (solo el botón React lo evita).

### Importantes

- **Fechas de pedidos ausentes en la respuesta.** `apps/orders/serializers.py`: falta `created_at`; afecta `MyOrdersPage.jsx` y `OrdersPage.jsx`.
- **Carrito puede exceder stock o aceptar cero.** `apps/orders/views.py`, `CartItemViewSet`: no valida stock/estado en POST/PATCH. El modelo `PositiveIntegerField` no garantiza estrictamente 1 o más en esta capa. Afecta la coherencia del carro hasta checkout.
- **Pago no funcional.** Modelo existente sin endpoint ni proveedor; el checkout crea la orden sin cobrar (`apps/orders/models.py`, `views.py`).
- **Crear superusuario puede fallar.** `apps/users/manager.py` no suministra el `role` requerido; el README reconoce el punto pendiente.
- **Borrado de productos/categorías puede perder historial.** Las FK de `OrderItem.product` y `Product.category` usan `CASCADE`; eliminar desde el CRUD puede borrar ítems de pedidos o productos, no solo ocultarlos.

### Menores

- `DEBUG=True` y una `SECRET_KEY` incrustada en `ECommerce/settings.py`: aceptable solo para desarrollo, inseguro si se despliega así.
- `LANGUAGE_CODE='en-us'` y `TIME_ZONE='UTC'` no corresponden a una interfaz peruana/española; las páginas formatean `es-PE` en cliente.
- No hay paginación: dashboard y tablas descargan colecciones completas, con impacto al crecer los datos.
- El inicio monta `HeaderPublic` directamente y las demás páginas públicas mediante `PublicLayout`; la navegación funciona, pero la composición es inconsistente (`HomePage.jsx`, `PublicLayout.jsx`).
- Las fechas del admin son deliberadamente no disponibles, síntoma del contrato API incompleto.

## 9. Calidad y organización

La separación frontend por funcionalidades y el cliente Axios único son buenas bases. En backend los módulos son claros y la creación de pedidos usa `transaction.atomic()` y bloqueos de filas, una medida correcta contra sobreventa simultánea. El outbox conserva el evento dentro de la misma transacción de la orden, también positivo.

Los problemas reales de calidad se concentran en reglas de negocio no centralizadas: el frontend protege roles y stock visualmente, pero el backend no protege igual los roles base y solo valida stock en checkout. Faltan pruebas frontend y no se ven pruebas de usuarios/roles/outbox más allá de archivos de tests backend existentes. La API no pagina ni filtra. Las credenciales de base se externalizan, pero secreto/DEBUG no. Las validaciones de formularios de producto y checkout son básicas y útiles; no sustituyen validación en servidor.

## 10. Resumen final

### Estado actual

Es un e-commerce funcional de nivel intermedio para catálogo, autenticación, carrito y creación de pedidos, con una administración interna bastante desarrollada. Su compra aún es una confirmación de pedido: no un proceso comercial completo, pues faltan pago, ciclo de estados y preservación robusta de historial.

### Funcionalidades completas

- Registro, login, restauración/refresco de sesión JWT y perfil.
- Catálogo público, detalle, categorías y visualización de imágenes existentes.
- CRUD de productos/categorías para staff.
- Carrito persistente y creación transaccional de pedido con descuento de stock.
- Consulta de pedidos por cliente y por Admin.
- Dashboard y consulta de eventos outbox.

### Funcionalidades parciales

- Checkout solo con dirección, sin pago ni confirmación independiente.
- Historial de pedidos sin fecha en contrato API y sin gestión de estado.
- Gestión de roles y usuarios con riesgos de integridad.
- Outbox que registra/procesa de forma simulada, sin envío real.
- Imágenes modeladas y mostradas, pero no administrables.

### Funcionalidades faltantes

- Pasarela o simulación completa de pago y comprobación de pago.
- Cambio/cancelación/trazabilidad de estados de pedido.
- Recuperación/cambio seguro de contraseña.
- Búsqueda, filtros y paginación del catálogo.
- Gestión de imágenes de producto.
- Protección de historial ante borrados y administración completa de pedidos en Django Admin.

### Problemas detectados

Los más urgentes son permitir alterar roles fundamentales desde la API, el borrado en cascada de historial de pedidos, la falta de validación de carro al modificar ítems y el contrato incompleto de fechas de pedido. No se detectaron errores en las comprobaciones estáticas: `manage.py check`, migraciones y ESLint pasaron correctamente.

### Siguientes pasos posibles

1. **Prioridad alta:** blindar roles base y borrado de usuarios/productos/categorías; corregir el contrato de pedidos (`created_at`) y validar en backend cantidades, stock y producto activo al operar el carro.
2. **Prioridad media:** implementar flujo de estados de pedido, pagos (aunque inicialmente simulados), imágenes administrables, recuperación/cambio de contraseña y pruebas de integración de autorización/checkout.
3. **Prioridad baja:** añadir búsqueda, filtros, paginación, ajustes de idioma/zona horaria, métricas agregadas en backend y preparación segura de producción (`DEBUG`, secreto, CORS y URL API obligatoria).
