# Arquitectura Frontend ReactJS Escalable

## 1. Propósito del documento

Este documento define una guía de arquitectura frontend reutilizable para proyectos ReactJS escalables. El proyecto actual ubicado en `ECommerce/front-end` es un Ecommerce básico y se usa como caso de referencia práctico, pero las decisiones documentadas no están pensadas únicamente para tiendas online.

La misma arquitectura puede aplicarse a sistemas administrativos, dashboards, CRMs, ERPs básicos, inventarios, ventas, reservas, sistemas académicos, plataformas internas de empresa y aplicaciones con módulos públicos, privados, administrativos, roles y permisos.

El objetivo es mantener consistencia, orden y escalabilidad al crear nuevos frontends. También puede servir como instrucciones para desarrolladores o agentes de IA que necesiten construir un proyecto ReactJS desde cero siguiendo este estilo.

Cuando se mencionen productos, categorías, carrito u órdenes, deben entenderse como ejemplos de features de negocio. En otros sistemas esos módulos podrían llamarse clientes, empleados, proyectos, reservas, cursos, facturas, reportes, trámites, inventario o cualquier otra entidad del dominio.

## 2. Descripción general de la arquitectura

El frontend usa ReactJS como tecnología principal, Vite como herramienta de desarrollo y empaquetado, React Router para navegación, Axios para comunicación HTTP y Tailwind CSS para estilos.

La arquitectura se organiza alrededor de módulos de negocio dentro de `src/features`. Cada feature agrupa archivos relacionados con una funcionalidad específica: API, hooks, componentes y páginas. Esta separación evita que el proyecto crezca como una colección desordenada de componentes globales.

El proyecto distingue varias capas:

- `src/api`: cliente HTTP compartido, tokens, refresh token y normalización de errores.
- `src/context`: estado global transversal, como autenticación y carrito.
- `src/hooks`: hooks globales, como `useAuth`.
- `src/components`: componentes reutilizables de UI y navegación.
- `src/features`: módulos funcionales del sistema.
- `src/layout`: estructuras visuales compartidas por grupos de rutas.
- `src/routes`: configuración de rutas, guards privados y guards por rol.
- `src/constants`: navegación y contenido reutilizable.

El diseño general separa vistas públicas, privadas y administrativas. En el Ecommerce actual esto se ve en catálogo público, perfil/carrito/órdenes autenticadas y panel administrativo. En otro rubro podría traducirse como portal público, intranet de usuario y backoffice interno.

La integración con backend se realiza mediante Axios, centralizado en `src/api/client.js`. Los componentes no deberían llamar directamente a Axios. La convención escalable es:

1. La feature define funciones API.
2. Los hooks consumen esas funciones API.
3. Las páginas consumen hooks.
4. Los componentes reciben datos y callbacks por props.

## 3. Tecnologías utilizadas

| Tecnología | Uso en el proyecto | Evidencia | Rol en arquitectura escalable | Aplicación en otros sistemas |
| --- | --- | --- | --- | --- |
| React | Construcción de UI con componentes, estado y efectos. | `src/main.jsx`, `src/App.jsx`, componentes `.jsx`. | Permite dividir la interfaz en piezas reutilizables. | Cualquier sistema modular: CRM, inventario, reservas, académico. |
| Vite | Servidor de desarrollo, build y configuración del frontend. | `vite.config.js`, scripts `dev`, `build`, `preview`. | Reduce fricción de desarrollo y facilita builds rápidos. | Base recomendada para nuevos frontends React modernos. |
| React Router DOM | Definición de rutas públicas, privadas y administrativas. | `src/routes/AppRouter.jsx`, `PrivateRoute.jsx`, `RoleRoute.jsx`. | Centraliza navegación, layouts y protección de rutas. | Sistemas con login, paneles, módulos internos y rutas por rol. |
| Axios | Comunicación HTTP con backend. | `src/api/client.js`, archivos API por feature. | Permite cliente centralizado con baseURL, tokens e interceptores. | Integración con APIs REST de cualquier dominio. |
| Tailwind CSS | Estilos utilitarios, tema visual y responsive design. | `src/index.css`, clases `className` en componentes. | Acelera diseño consistente si se acompaña de componentes base. | Dashboards, CRUDs, formularios, tablas, portales internos. |
| Context API | Estado global transversal. | `AuthProvider.jsx`, `CartProvider.jsx`, `AuthContext.jsx`, `CartContext.jsx`. | Evita prop drilling para sesión, usuario y datos globales. | Sesión, permisos, tema, configuración global, selección de empresa/sucursal. |
| lucide-react | Iconos en navegación, botones y acciones. | `constants/navigation.js`, `Modal.jsx`, tablas administrativas. | Mejora affordance visual sin crear SVGs manuales. | Menús administrativos, acciones CRUD, dashboards. |
| ESLint | Reglas estáticas para JavaScript/React. | `eslint.config.js`, script `lint`. | Mantiene calidad y consistencia del código. | Recomendado para equipos y agentes IA. |

También se detecta uso de variables de entorno mediante `import.meta.env.VITE_API_URL`, configurada en `.env.example`. Esto permite cambiar el backend sin modificar código.

## 4. Estructura general de carpetas

Estructura real detectada en `src`:

```txt
src/
  api/
    client.js
    errors.js
  assets/
    login-photo.webp
  components/
    Navbar/
      private/
      public/
    Button.jsx
    ButtonLink.jsx
    ConfirmDialog.jsx
    EmptyState.jsx
    ErrorMessage.jsx
    H2.jsx
    H5.jsx
    LabelInput.jsx
    LoadingState.jsx
    Modal.jsx
    P.jsx
    StatusBadge.jsx
  constants/
    hero.js
    navigation.js
  context/
    AuthContext.jsx
    AuthProvider.jsx
    CartContext.jsx
    CartProvider.jsx
  features/
    Autentication/
    Home/
    dashboard/
    orders/
    outbox/
    products/
    users/
  hooks/
    useAuth.js
  layout/
    PrivateLayout.jsx
    PublicLayout.jsx
  routes/
    AppRouter.jsx
    PrivateRoute.jsx
    RoleRoute.jsx
  App.jsx
  index.css
  main.jsx
```

### `src/api`

Propósito: centralizar infraestructura HTTP compartida.

Contiene:

- `client.js`: instancia Axios, `baseURL`, tokens, refresh token, interceptores y manejo de expiración de sesión.
- `errors.js`: función `getApiErrorMessage` para convertir errores API en mensajes presentables.

Debe contener:

- Clientes HTTP comunes.
- Interceptores.
- Helpers transversales de errores.
- Configuración base de APIs.

No debería contener:

- Funciones específicas de productos, usuarios, órdenes, clientes, reservas o facturas.
- Lógica visual.
- Estado de componentes.

Escalabilidad: evita duplicar configuración de Axios y permite cambiar autenticación, cabeceras o manejo de errores desde un solo lugar.

### `src/assets`

Propósito: almacenar recursos estáticos usados por la aplicación.

Contiene:

- `login-photo.webp`.

Debe contener:

- Imágenes, íconos locales, fuentes locales o recursos visuales importados por componentes.

No debería contener:

- Componentes React.
- Datos de negocio dinámicos.
- Archivos generados por backend.

Escalabilidad: mantiene recursos visuales separados del código funcional.

### `src/components`

Propósito: componentes reutilizables y transversales.

Contiene:

- Componentes base: `Button`, `ButtonLink`, `LabelInput`, `Modal`, `ConfirmDialog`.
- Estados reutilizables: `LoadingState`, `ErrorMessage`, `EmptyState`.
- Textos base: `H2`, `H5`, `P`.
- Indicadores: `StatusBadge`.
- Navegación pública y privada en `Navbar`.

Debe contener:

- UI genérica reutilizable en varias features.
- Navegación compartida.
- Componentes sin dependencia fuerte de una entidad específica.

No debería contener:

- Formularios específicos como `ProductForm`, `UserForm` o `RoleForm`.
- Tablas acopladas a un dominio específico.
- Llamadas HTTP.

Escalabilidad: evita duplicar botones, inputs, modales, estados de carga y patrones visuales.

### `src/constants`

Propósito: valores constantes compartidos.

Contiene:

- `navigation.js`: enlaces públicos y privados, roles permitidos e iconos.
- `hero.js`: contenido textual del hero público.

Debe contener:

- Configuraciones estáticas.
- Opciones de navegación.
- Catálogos frontend que no provienen del backend.

No debería contener:

- Estado mutable.
- Respuestas API.
- Lógica compleja de negocio.

Escalabilidad: permite mantener menús, permisos visuales y contenido estático fuera de los componentes.

### `src/context`

Propósito: estado global transversal.

Contiene:

- `AuthContext.jsx` y `AuthProvider.jsx`.
- `CartContext.jsx` y `CartProvider.jsx`.

Debe contener:

- Contextos globales como sesión, usuario autenticado, permisos, tema, configuración global o carrito si aplica.

No debería contener:

- Estado local de formularios.
- Estados de páginas específicas.
- Datos de una feature que no se usan globalmente.

Escalabilidad: reduce prop drilling, pero debe usarse con criterio. No todo dato debe ir a Context API.

### `src/features`

Propósito: organizar el frontend por módulos funcionales.

Contiene:

- `Autentication`: login y registro.
- `Home`: inicio público y categorías visibles.
- `products`: catálogo, detalle, productos staff y categorías.
- `orders`: carrito, checkout, órdenes y detalle de orden.
- `users`: perfil, usuarios y roles.
- `dashboard`: métricas administrativas.
- `outbox`: auditoría de eventos transaccionales.

Debe contener:

- Módulos de negocio completos.
- APIs, hooks, páginas y componentes específicos por dominio.

No debería contener:

- Componentes globales de UI.
- Configuración global de Axios.
- Layouts de toda la aplicación.

Escalabilidad: permite agregar nuevas áreas sin contaminar el resto del código.

### `src/hooks`

Propósito: hooks globales reutilizables.

Contiene:

- `useAuth.js`.

Debe contener:

- Hooks que no pertenecen a una feature concreta o que envuelven contexto global.

No debería contener:

- Hooks específicos como `useProducts`, `useUsersAdmin` o `useReservations`, que deben vivir dentro de su feature.

Escalabilidad: diferencia lógica transversal de lógica específica de negocio.

### `src/layout`

Propósito: estructuras visuales que envuelven rutas.

Contiene:

- `PublicLayout.jsx`.
- `PrivateLayout.jsx`.

Debe contener:

- Layout público.
- Layout privado.
- Layout administrativo o especializado cuando el sistema lo requiera.

No debería contener:

- Páginas concretas.
- Lógica CRUD.
- Llamadas API de negocio.

Escalabilidad: permite que grupos de rutas compartan navegación, sidebar, header y contenedores.

### `src/routes`

Propósito: configuración de navegación y control de acceso.

Contiene:

- `AppRouter.jsx`.
- `PrivateRoute.jsx`.
- `RoleRoute.jsx`.

Debe contener:

- Declaración de rutas.
- Guards de autenticación.
- Guards por rol.
- Redirecciones.

No debería contener:

- Formularios.
- Tablas.
- Lógica HTTP.

Escalabilidad: centraliza la visibilidad y protección de pantallas.

## 5. Arquitectura basada en features

Una feature es un módulo funcional del sistema que agrupa sus propias páginas, componentes, hooks y llamadas API.

En el proyecto actual existen estas features:

| Feature | Responsabilidad actual | Equivalente genérico |
| --- | --- | --- |
| `Autentication` | Login, registro y API de autenticación. | Acceso al sistema, onboarding, sesión. |
| `Home` | Página inicial pública y categorías visibles. | Portal público, landing operativa, contenido de entrada. |
| `products` | Listado, detalle, administración de productos y categorías. | Entidades principales del negocio: inventario, cursos, proyectos, servicios. |
| `orders` | Carrito, checkout, órdenes propias y administración de órdenes. | Transacciones, reservas, solicitudes, ventas, trámites. |
| `users` | Perfil, usuarios administrativos y roles. | Gestión de identidades, empleados, clientes internos, permisos. |
| `dashboard` | Métricas calculadas desde otros endpoints. | Panel ejecutivo, indicadores, reportes resumidos. |
| `outbox` | Auditoría de eventos transaccionales. | Monitoreo técnico, bitácora, integración/eventos. |

Ejemplos de features en otros sistemas:

- `clients`: clientes o contactos.
- `employees`: empleados.
- `suppliers`: proveedores.
- `reservations`: reservas.
- `invoices`: facturas.
- `reports`: reportes.
- `projects`: proyectos.
- `procedures`: trámites.
- `courses`: cursos.
- `inventory`: inventario.
- `payments`: pagos.
- `documents`: documentos.

Esta arquitectura es útil porque:

- Evita carpetas enormes como `pages` o `components` sin criterio.
- Mejora el mantenimiento.
- Permite trabajar por módulos.
- Facilita escalar el sistema.
- Reduce conflictos entre desarrolladores.
- Ayuda a que otro desarrollador o agente IA sepa dónde crear cada archivo.
- Hace más fácil mover, probar o reescribir una feature sin afectar todo el sistema.

## 6. Estructura recomendada de una feature

Estructura genérica recomendada:

```txt
features/
  nombreFeature/
    api/
    components/
    hooks/
    pages/
```

Responsabilidades:

- `api/`: funciones que se comunican con el backend.
- `components/`: componentes específicos de esa feature.
- `hooks/`: lógica reutilizable de esa feature.
- `pages/`: pantallas principales conectadas a rutas.

Ejemplo genérico:

```txt
features/
  clients/
    api/
      clientsApi.js
    components/
      ClientForm.jsx
      ClientTable.jsx
    hooks/
      useClients.js
      useCreateClient.js
      useUpdateClient.js
      useDeleteClient.js
    pages/
      ClientsPage.jsx
```

El Ecommerce actual aplica esta idea con productos, órdenes, usuarios, autenticación, dashboard y outbox. Por ejemplo:

```txt
features/
  products/
    api/
      productsApi.js
    components/
      customer/
      shared/
      staff/
    hooks/
      useProducts.js
      useProductById.js
      useCreateProduct.js
      useUpdateProduct.js
      useDeleteProduct.js
    pages/
      customer/
      staff/
```

Recomendación: mantener el nombre de la carpeta feature en un formato consistente. Actualmente existen `Autentication` y `Home` con mayúscula inicial, mientras que `products`, `orders`, `users`, `dashboard` y `outbox` están en minúscula. Para futuros proyectos se recomienda usar carpetas en minúscula o kebab-case.

## 7. Separación entre componentes globales y componentes de feature

### Componentes globales

Son componentes reutilizables en varias áreas del sistema. En el proyecto actual están en `src/components`.

Ejemplos reales:

- `Button`
- `ButtonLink`
- `LabelInput`
- `LoadingState`
- `ErrorMessage`
- `EmptyState`
- `Modal`
- `ConfirmDialog`
- `StatusBadge`
- `H2`
- `H5`
- `P`
- `HeaderPublic`
- `SidebarPrivate`
- `NavBarPublic`
- `NavBarPrivate`

Un componente debe ser global cuando:

- No depende de una entidad de negocio específica.
- Puede usarse en múltiples features.
- Sus props son genéricas.
- Representa un patrón visual común.

Ejemplos genéricos:

- `Button`
- `Input`
- `Select`
- `DataTable`
- `LoadingState`
- `ErrorMessage`
- `EmptyState`
- `ConfirmDialog`
- `StatusBadge`
- `PageTitle`

### Componentes específicos de feature

Son componentes que conocen reglas, campos o lenguaje propio de un módulo.

Ejemplos reales:

- `ProductForm`
- `CategoryForm`
- `ProductTable`
- `ProductGrid`
- `ProductCard`
- `OneProductCard`
- `CartItemRow`
- `CheckoutForm`
- `OrderDetailModal`
- `UserForm`
- `RoleForm`
- `InformationProfile`
- `OutboxStatusBadge`
- `OutboxEventDetailModal`
- `MetricCard`

Ejemplos genéricos por rubro:

- `ClientForm`
- `EmployeeTable`
- `ReservationCard`
- `InvoiceStatusBadge`
- `ProjectSummaryCard`
- `CourseEnrollmentForm`
- `StockMovementTable`

Un componente debe quedarse dentro de una feature cuando:

- Depende de campos propios de una entidad.
- Usa lenguaje específico del negocio.
- Recibe estructuras de datos propias del módulo.
- Tiene reglas que no se comparten con otros módulos.

Para evitar duplicación:

- Si dos features repiten el mismo patrón visual, extraer una versión genérica a `src/components`.
- Si solo se parecen por casualidad, mantenerlos separados.
- Si un componente global empieza a recibir demasiadas props de negocio, probablemente debe volver a una feature.

Observación del proyecto: `TablePrivate` está dentro de `features/products/components/staff`, pero ya se usa desde `users`, `orders`, `dashboard` y `outbox`. Esto indica que funcionalmente es una tabla reutilizable. Recomendación: si el proyecto crece, moverla a una carpeta global como `src/components/table/DataTable.jsx`.

## 8. Sistema de layouts

El proyecto tiene dos layouts principales:

| Layout | Archivo | Uso actual |
| --- | --- | --- |
| Público | `src/layout/PublicLayout.jsx` | Envuelve rutas públicas con `HeaderPublic` y contenedor principal. |
| Privado/administrativo | `src/layout/PrivateLayout.jsx` | Envuelve rutas administrativas con `SidebarPrivate`. |

### Layout público

`PublicLayout` renderiza:

- `HeaderPublic`.
- Un `main` con fondo `bg-bgLight`.
- Un contenedor centrado.
- `Outlet` para las páginas hijas.

Uso actual:

- Catálogo de productos.
- Detalle de producto.
- Carrito autenticado.
- Perfil autenticado.
- Órdenes del usuario autenticado.

Generalización:

- Landing.
- Login y registro si se decide envolverlos.
- Catálogo público.
- Portal de información.
- Vista pública de cursos, servicios o reservas.

### Layout privado / administrativo

`PrivateLayout` renderiza:

- Contenedor flexible de pantalla completa.
- `SidebarPrivate`.
- `main` con `Outlet`.

Uso actual:

- Panel administrativo de productos.
- Categorías.
- Usuarios.
- Roles.
- Dashboard.
- Órdenes.
- Outbox.

Generalización:

- Panel interno.
- Backoffice.
- Dashboard administrativo.
- Módulos empresariales.
- Gestión de permisos.
- Áreas para empleados, supervisores o administradores.

### Layout administrativo especializado

No existe un archivo separado llamado `AdminLayout.jsx`. Actualmente `PrivateLayout` cumple ese rol. Si el sistema crece, podría agregarse un `AdminLayout` para separar rutas autenticadas de usuario final y rutas internas administrativas.

Cómo decidir qué layout usa cada ruta:

- Ruta pública sin sesión: usar layout público o página independiente.
- Ruta autenticada de usuario: usar layout público autenticado o `PrivateLayout` si requiere navegación interna.
- Ruta administrativa: usar `PrivateLayout` o `AdminLayout`.
- Dashboard complejo: puede usar layout administrativo o un layout especializado.

## 9. Sistema de rutas

Las rutas se definen en `src/routes/AppRouter.jsx` usando `Routes`, `Route` y `Navigate` de React Router.

El sistema actual separa:

- Rutas públicas sin layout: `/`, `/login`, `/register`.
- Rutas públicas agrupadas bajo `PublicLayout`: catálogo, detalle, carrito, cuenta y órdenes propias.
- Rutas privadas administrativas bajo `PrivateLayout`.
- Guards de autenticación con `PrivateRoute`.
- Guards por rol con `RoleRoute`.
- Redirección final `*` hacia `/`.

Roles definidos en rutas:

- `staffRoles = ["Admin", "Employee"]`
- `adminRoles = ["Admin"]`

Tabla de rutas reales detectadas:

| Ruta | Página | Tipo | Protección | Descripción |
| --- | --- | --- | --- | --- |
| `/` | `HomePage` (`Inicio`) | Pública | Sin guard | Página inicial pública. |
| `/tienda/productos` | `features/products/pages/customer/ProductsPage.jsx` | Pública | Sin guard | Listado público de productos, ejemplo de catálogo/listado de entidades. |
| `/tienda/productos/:id/` | `features/products/pages/customer/OneProductPage.jsx` | Pública | Sin guard | Detalle público de una entidad. |
| `/carrito` | `features/orders/pages/CartPage.jsx` | Privada de usuario | `PrivateRoute` | Carrito del usuario autenticado, ejemplo de flujo transaccional. |
| `/cuenta` | `features/users/pages/shared/ProfilePage.jsx` | Privada de usuario | `PrivateRoute` | Perfil del usuario autenticado. |
| `/cuenta/ordenes` | `features/orders/pages/MyOrdersPage.jsx` | Privada de usuario | `PrivateRoute` | Historial del usuario autenticado. |
| `/login` | `features/Autentication/pages/Login.jsx` | Pública | Sin guard | Inicio de sesión. |
| `/register` | `features/Autentication/pages/Register.jsx` | Pública | Sin guard | Registro de cuenta. |
| `/admin/productos` | `features/products/pages/staff/ProductsPage.jsx` | Administrativa | `PrivateRoute` + `RoleRoute` Admin/Employee | Gestión administrativa de productos. |
| `/admin/categorias` | `features/products/pages/staff/CategoriesPage.jsx` | Administrativa | `PrivateRoute` + `RoleRoute` Admin/Employee | Gestión administrativa de categorías. |
| `/admin/usuarios` | `features/users/pages/staff/UsersPage.jsx` | Administrativa | `PrivateRoute` + `RoleRoute` Admin | Gestión de usuarios. |
| `/admin/dashboard` | `features/dashboard/page/DashboardPage.jsx` | Administrativa | `PrivateRoute` + `RoleRoute` Admin | Métricas administrativas. |
| `/admin/roles` | `features/users/pages/staff/RolesPage.jsx` | Administrativa | `PrivateRoute` + `RoleRoute` Admin | Gestión de roles. |
| `/admin/ordenes` | `features/orders/pages/OrdersPage.jsx` | Administrativa | `PrivateRoute` + `RoleRoute` Admin | Consulta administrativa de órdenes. |
| `/admin/outbox` | `features/outbox/pages/OutboxEventsPage.jsx` | Administrativa/técnica | `PrivateRoute` + `RoleRoute` Admin | Auditoría de eventos Outbox. |
| `*` | `Navigate to="/"` | Fallback | Sin guard | Redirección de rutas no encontradas. |

Ejemplo genérico de rutas para cualquier sistema:

```txt
/login
/register
/dashboard
/admin/usuarios
/admin/reportes
/cuenta/perfil
/modulo/listado
/modulo/:id
```

Convención recomendada:

- Usar rutas públicas para contenido abierto.
- Usar `PrivateRoute` cuando se requiere sesión.
- Usar `RoleRoute` cuando se requiere rol.
- Mantener roles permitidos cerca de la configuración de rutas o en constantes.
- Evitar lógica compleja de negocio dentro de `AppRouter`.

## 10. Manejo de autenticación y autorización

La autenticación se implementa con:

- `AuthContext.jsx`: crea el contexto.
- `AuthProvider.jsx`: mantiene usuario, tokens, flags de rol y funciones de sesión.
- `useAuth.js`: hook global para consumir el contexto.
- `AuthApi.js`: llamadas a login, registro y usuario actual.
- `PrivateRoute.jsx`: protege rutas que requieren sesión.
- `RoleRoute.jsx`: protege rutas que requieren rol.
- `api/client.js`: guarda, limpia y refresca tokens.

Estado manejado por `AuthProvider`:

- `user`
- `accessToken`
- `refreshToken`
- `isLoading`
- `isAuthenticated`
- `isAdmin`
- `isEmployee`
- `isCustomer`

Funciones expuestas:

- `login`
- `logout`
- `updateUser`
- `setUser`
- `setIsLoading`

Tokens:

- Se leen desde `localStorage` al iniciar.
- Se guardan con `saveTokens`.
- Se limpian con `clearTokens`.
- El access token se envía como `Authorization: Bearer`.
- El refresh token se usa en `/auth/refresh/`.

Recuperación de sesión:

- Al montar `AuthProvider`, se revisa si existen tokens.
- Si existen, se llama a `getCurrentUser`.
- Si falla, se limpian tokens y usuario.

Refresh token:

- Confirmado en `src/api/client.js`.
- Si una petición autenticada responde `401`, el interceptor intenta refrescar access token una vez.
- Si el refresh falla o no existe, se expira la sesión.

Protección por roles:

- `RoleRoute` verifica `user?.role?.name`.
- Si el rol no está permitido, redirige a `/`.
- Los menús privados también se filtran por rol en `NavBarPrivate`.

Roles reales detectados:

- `Admin`
- `Employee`
- `Customer`

Roles genéricos que podrían usarse en otros sistemas:

- `Admin`
- `Employee`
- `Customer`
- `User`
- `Manager`
- `Supervisor`
- `Student`
- `Teacher`
- `Operator`
- `Auditor`

Flujo recomendado:

1. Usuario inicia sesión.
2. Frontend envía credenciales al backend mediante `login`.
3. Backend devuelve tokens.
4. Frontend guarda sesión en `localStorage`.
5. Frontend obtiene usuario actual con `getCurrentUser`.
6. Rutas y menús se adaptan al rol.
7. Si el usuario cierra sesión o expira el token, se limpia la sesión.

Recomendación: para sistemas más grandes, separar permisos finos de roles simples. Por ejemplo, además de `Admin`, manejar permisos como `users.read`, `users.write`, `reports.export`.

## 11. Capa API

La capa API está centralizada y dividida por dominio.

### Cliente Axios principal

Archivo: `src/api/client.js`.

Responsabilidades:

- Leer `VITE_API_URL`.
- Definir `baseURL`.
- Crear `apiClient`.
- Configurar cabecera `Content-Type`.
- Enviar token en peticiones autenticadas.
- Permitir peticiones públicas con `withAuth: false`.
- Refrescar access token cuando hay `401`.
- Notificar expiración o refresh de sesión al `AuthProvider`.
- Limpiar tokens.

`baseURL`:

- Se toma de `import.meta.env.VITE_API_URL`.
- Si no existe, usa `http://127.0.0.1:8000/api`.
- El archivo `.env.example` define `VITE_API_URL=http://127.0.0.1:8000/api`.

### Manejo de errores

Archivo: `src/api/errors.js`.

Responsabilidades:

- Aplanar mensajes de error.
- Detectar `Network Error`.
- Devolver mensajes entendibles con `getApiErrorMessage`.

### Archivos API por feature

Archivos reales:

- `features/Autentication/api/AuthApi.js`
- `features/Home/api/categoryApi.js`
- `features/products/api/productsApi.js`
- `features/orders/api/cartApi.js`
- `features/orders/api/orderApi.js`
- `features/users/api/adminUsersApi.js`
- `features/users/api/rolesApi.js`
- `features/users/api/userApi.js`
- `features/outbox/api/outboxApi.js`

Convención actual:

- Funciones de lectura: `fetchProducts`, `fetchProductById`, `fetchOrders`, `fetchRoles`.
- Funciones de creación: `createProduct`, `createCategory`, `createRole`, `createOrder`.
- Funciones de actualización: `updateProduct`, `updateCategory`, `updateUserAdmin`, `updateRole`.
- Funciones de eliminación: `deleteProduct`, `deleteCategory`, `deleteUserAdmin`, `deleteRole`.

Regla importante:

Los componentes no deberían llamar directamente a Axios. La comunicación HTTP debe vivir en archivos API.

Flujo recomendado:

```txt
Archivo API -> Hook personalizado -> Página -> Componentes por props
```

Ejemplo genérico:

```txt
features/
  clients/
    api/
      clientsApi.js
```

Funciones recomendadas:

```js
export const fetchClients = async () => {}
export const fetchClientById = async (clientId) => {}
export const createClient = async (params) => {}
export const updateClient = async (clientId, params) => {}
export const deleteClient = async (clientId) => {}
```

## 12. Hooks personalizados

Los hooks personalizados encapsulan lógica de datos, carga, errores y mutaciones. En este proyecto siguen un patrón consistente:

- Usan `useState` para `data`, `isLoading`, `error` y a veces `success`.
- Usan `useEffect` para cargas iniciales.
- Usan `getApiErrorMessage` para mensajes presentables.
- Llaman a funciones API, no a Axios directamente.
- Exponen funciones como `refetch` o `reset` cuando corresponde.

Tabla de hooks reales:

| Hook | Feature | Responsabilidad | Estado manejado | Observaciones |
| --- | --- | --- | --- | --- |
| `useAuth` | Global | Consumir `AuthContext`. | Contexto global. | Lanza error si se usa fuera de `AuthProvider`. |
| `useLogin` | `Autentication` | Iniciar sesión mediante `AuthProvider`. | `data`, `isLoading`, `error`. | Navegación queda en la página `Login`. |
| `useRegister` | `Autentication` | Registrar usuario. | `data`, `isLoading`, `error`. | Retorna `null` si falla. |
| `useCategory` | `Home` | Cargar categorías públicas. | `categories`, `isLoading`, `error`. | Se usa también en `ProductForm`. |
| `useProducts` | `products` | Listar productos. | `products`, `data`, `isLoading`, `error`, `refetch`. | Soporta recarga con `reloadKey`. |
| `useProductById` | `products` | Cargar detalle por ID. | `product`, `isLoading`, `error`. | Para páginas de detalle. |
| `useCategoriesAdmin` | `products` | Listar categorías para administración. | `categories`, `isLoading`, `error`, `refetch`. | Usa API de categorías. |
| `useCreateProduct` | `products` | Crear producto. | `data`, `isLoading`, `error`, `success`. | Expone `reset`. |
| `useUpdateProduct` | `products` | Actualizar producto. | `data`, `isLoading`, `error`, `success`. | Expone `reset`. |
| `useDeleteProduct` | `products` | Eliminar producto. | `data`, `isLoading`, `error`, `success`. | Expone `reset`. |
| `useCreateCategory` | `products` | Crear categoría. | `data`, `isLoading`, `error`, `success`. | Expone `reset`. |
| `useUpdateCategory` | `products` | Actualizar categoría. | `data`, `isLoading`, `error`, `success`. | Expone `reset`. |
| `useDeleteCategory` | `products` | Eliminar categoría. | `data`, `isLoading`, `error`, `success`. | Expone `reset`. |
| `useCart` | `orders` | Consumir `CartContext`. | Contexto global de carrito. | Hook de acceso al contexto. |
| `useAddToCart` | `orders` | Agregar producto al carrito. | `data`, `isLoading`, `error`. | Usa acciones del `CartProvider`. |
| `useUpdateCartItem` | `orders` | Cambiar cantidad de item. | `data`, `isLoading`, `error`. | Refresca carrito vía contexto. |
| `useDeleteCartItem` | `orders` | Eliminar item del carrito. | `data`, `isLoading`, `error`. | Refresca carrito vía contexto. |
| `useCreateOrder` | `orders` | Crear orden desde checkout. | `data`, `isLoading`, `error`. | Limpia o refresca carrito según implementación del hook. |
| `useOrders` | `orders` | Listar órdenes. | `orders`, `data`, `isLoading`, `error`. | Se usa en vista propia y admin. |
| `useOrderDetail` | `orders` | Cargar detalle de orden. | `order`, `isLoading`, `error`. | Se usa en modal. |
| `useUsersAdmin` | `users` | Listar usuarios administrativos. | `users`, `isLoading`, `error`, `refetch`. | Para tablas admin. |
| `useUpdateUser` | `users` | Actualizar usuario admin. | `data`, `isLoading`, `error`, `success`. | Actualiza usuario actual si corresponde desde la página. |
| `useDeleteUser` | `users` | Eliminar usuario admin. | `data`, `isLoading`, `error`, `success`. | Usado con `ConfirmDialog`. |
| `useRoles` | `users` | Listar roles. | `roles`, `isLoading`, `error`, `refetch`. | Para tablas y formularios. |
| `useCreateRole` | `users` | Crear rol. | `data`, `isLoading`, `error`, `success`. | Expone `reset`. |
| `useUpdateRole` | `users` | Actualizar rol. | `data`, `isLoading`, `error`, `success`. | Expone `reset`. |
| `useDeleteRole` | `users` | Eliminar rol. | `data`, `isLoading`, `error`, `success`. | Expone `reset`. |
| `useUpdateProfile` | `users` | Actualizar perfil propio. | `data`, `isLoading`, `error`. | Actualiza `AuthContext`. |
| `useDashboardAdmin` | `dashboard` | Cargar resumen administrativo. | `data`, `isLoading`, `error`. | Usa `Promise.all` sobre varias APIs. |
| `useOutboxEvents` | `outbox` | Listar eventos Outbox con filtro. | `events`, `isLoading`, `error`. | Acepta `status`. |
| `useOutboxEventDetail` | `outbox` | Cargar detalle de evento Outbox. | `event`, `isLoading`, `error`. | Se usa en modal. |

Convención general:

```txt
useItems
useItemById
useCreateItem
useUpdateItem
useDeleteItem
```

Ejemplos por rubro:

- `useProducts`
- `useClients`
- `useReservations`
- `useInvoices`
- `useProjects`
- `useUsers`
- `useCourses`
- `useStockMovements`

Cuándo crear un hook:

- Cuando una página necesita cargar datos.
- Cuando una mutación se reutiliza o tiene estados de carga/error.
- Cuando se quiere separar lógica de UI.
- Cuando varias pantallas comparten la misma operación.

Cuándo no crear un hook:

- Para un cálculo local trivial.
- Para un estado que solo vive en un formulario simple y no toca API.
- Para envolver una sola línea sin aportar claridad.

## 13. Manejo de estado

El proyecto combina distintos niveles de estado:

### Estado local con `useState`

Uso real:

- Campos de login y registro.
- Datos de formularios como `ProductForm`, `CategoryForm`, `UserForm`, `CheckoutForm`.
- Modales abiertos/cerrados.
- Entidad seleccionada para editar o eliminar.
- Filtros como `statusFilter` en `OutboxEventsPage`.

Debe usarse para:

- Formularios.
- Toggles de UI.
- Selección de fila.
- Filtros locales.
- Modales y diálogos.

### Efectos con `useEffect`

Uso real:

- Carga inicial de productos, órdenes, usuarios, roles y eventos.
- Restauración de sesión.
- Carga de carrito al autenticarse.

Debe usarse para:

- Cargas iniciales.
- Sincronización con cambios de parámetros.
- Suscripciones o limpieza de efectos.

### Estado global con Context API

Uso real:

- Autenticación en `AuthProvider`.
- Carrito en `CartProvider`.

Debe reservarse para:

- Sesión.
- Usuario autenticado.
- Permisos.
- Tema visual.
- Configuración global.
- Carrito si aplica.
- Organización/sucursal seleccionada si aplica.

No todo debe ir en estado global. Datos como listados de productos, usuarios, roles, órdenes o reportes viven mejor en hooks de feature porque pertenecen a pantallas o módulos concretos.

### `localStorage` y `sessionStorage`

Uso real:

- `localStorage` guarda `access` y `refresh`.

Recomendación:

- Usar almacenamiento del navegador solo para datos que deban sobrevivir recargas.
- No guardar listas completas de negocio si no es necesario.
- Evaluar seguridad de tokens según el contexto real del sistema.

## 14. Componentes reutilizables de UI

Componentes globales reales:

| Componente | Propósito | Props principales detectadas | Dónde se usa | Reutilización genérica |
| --- | --- | --- | --- | --- |
| `Button` | Botón base. | `children`, `color`, `size`, `variant`, `type`, `className`, `disabled`, `onClick`. | Formularios, modales, acciones. | Acciones CRUD, guardar, cancelar, confirmar. |
| `ButtonLink` | Link con apariencia de botón/enlace. | `children`, `to`, `size`, `color`, `className`. | Login, register, navegación. | Ir a módulos, volver, abrir detalle. |
| `LabelInput` | Input con label, error y accesibilidad básica. | `id`, `name`, `label`, `type`, `value`, `onChange`, `placeholder`, `error`. | Formularios de auth, productos, usuarios, checkout. | Formularios de clientes, empleados, reservas, facturas. |
| `LoadingState` | Estado de carga visual. | `message`. | Rutas privadas, páginas y modales. | Toda carga de datos. |
| `ErrorMessage` | Mensaje de error visual. | `message`, `className`. | Formularios y páginas. | Errores de API, validación, permisos. |
| `EmptyState` | Estado vacío. | `title`, `description`, `className`. | Tablas/listas vacías. | Listas de clientes, proyectos, cursos, reservas. |
| `Modal` | Modal genérico. | `title`, `children`, `onClose`. | Formularios y detalles. | Editar entidad, ver detalle, configurar opciones. |
| `ConfirmDialog` | Confirmación de acción destructiva. | `title`, `message`, `confirmLabel`, `onConfirm`, `onCancel`, `isLoading`, `error`. | Eliminación de productos, categorías, usuarios y roles. | Confirmar baja, anulación, eliminación, cierre de trámite. |
| `StatusBadge` | Badge booleano activo/inactivo. | `active`, `activeLabel`, `inactiveLabel`. | Productos y usuarios. | Estado de cliente, empleado, curso, proyecto, trámite. |
| `H2`, `H5`, `P` | Tipografía base. | `children`, algunos con `color`. | Páginas y formularios. | Títulos y textos consistentes. |

Cuándo crear un componente nuevo:

- Cuando una estructura visual se repite en varias pantallas.
- Cuando se quiere estandarizar interacción, accesibilidad o estilos.
- Cuando un bloque de JSX crece y dificulta leer la página.

Cuándo no crearlo:

- Si solo se usa una vez y no mejora claridad.
- Si requiere demasiadas props específicas de negocio.
- Si oculta reglas importantes de una feature.

## 15. Formularios

Formularios reales detectados:

- `FormLogin`
- `FormRegister`
- `ProductForm`
- `CategoryForm`
- `CheckoutForm`
- `UserForm`
- `RoleForm`
- `InformationProfile`

Patrones aplicados:

- Campos controlados con `useState`.
- Envío mediante `onSubmit`.
- Validaciones locales en formularios como `ProductForm`, `CategoryForm` y `UserForm`.
- Errores de API mostrados con `ErrorMessage`.
- Inputs reutilizables con `LabelInput`.
- Botones deshabilitados durante `isLoading`.
- Separación entre UI del formulario y operación HTTP.

Ejemplo real de separación:

- `ProductsPage` decide si crea o edita.
- `ProductForm` renderiza campos y valida.
- `useCreateProduct` y `useUpdateProduct` ejecutan mutaciones.
- `productsApi.js` llama al backend.

Generalización:

- `ClientForm`: nombre, documento, correo, teléfono.
- `EmployeeForm`: datos personales, cargo, área, estado.
- `ReservationForm`: cliente, fecha, horario, recurso.
- `ProjectForm`: nombre, responsable, fechas, estado.
- `InvoiceForm`: cliente, items, impuestos, total.
- `ProcedureForm`: solicitante, tipo de trámite, documentos.

Convenciones recomendadas:

- Separar UI del formulario de la llamada HTTP.
- Usar hooks para mutaciones.
- No llamar Axios directamente desde formularios.
- Mostrar errores claros.
- Deshabilitar botón mientras se guarda.
- Validar antes de enviar.
- Limpiar o cerrar formulario después de guardar con éxito.
- Mantener nombres de campos alineados al contrato del backend o mapearlos explícitamente.

## 16. Tablas y vistas administrativas

El proyecto usa un patrón común para vistas administrativas:

1. La página carga datos con un hook.
2. Define columnas localmente.
3. Renderiza `LoadingState` si está cargando.
4. Renderiza `ErrorMessage` si hay error.
5. Renderiza `EmptyState` si no hay datos.
6. Renderiza `TablePrivate` si hay datos.
7. Usa acciones por fila con iconos.
8. Abre `Modal` para crear/editar o ver detalle.
9. Usa `ConfirmDialog` antes de eliminar.
10. Ejecuta `refetch` después de mutaciones.

Vistas administrativas reales:

- `features/products/pages/staff/ProductsPage.jsx`
- `features/products/pages/staff/CategoriesPage.jsx`
- `features/users/pages/staff/UsersPage.jsx`
- `features/users/pages/staff/RolesPage.jsx`
- `features/orders/pages/OrdersPage.jsx`
- `features/outbox/pages/OutboxEventsPage.jsx`
- `features/dashboard/page/DashboardPage.jsx`

`TablePrivate` recibe:

- `columns`
- `data`

Cada columna puede tener:

- `key`
- `label`
- `render`

Además soporta acceso a propiedades anidadas con claves como `category.name` o `role.name`.

Generalización:

- Tabla de usuarios.
- Tabla de clientes.
- Tabla de empleados.
- Tabla de productos.
- Tabla de proyectos.
- Tabla de reservas.
- Tabla de facturas.
- Tabla de reportes.
- Tabla de trámites.

Recomendación: extraer `TablePrivate` a `src/components/table` si se espera que más features la usen. En ese caso podría llamarse `DataTable`.

## 17. Estilos y diseño visual con Tailwind

Tailwind CSS se usa directamente en `className`. La configuración de tema está en `src/index.css` usando `@theme inline`.

Tokens detectados:

- Fuentes: `--font-playfair`, `--font-sans`, `--font-display`, `--font-mono`.
- Colores: `textGray`, `golden`, `goldenHover`, `darkGray`, `bgLight`, `pGray`.

Patrones visuales reales:

- Fondos claros con `bg-bgLight`.
- Botones oscuros, dorados y estados hover.
- Cards y modales con `bg-white`, bordes y sombras.
- Tablas con `overflow-x-auto`, `min-w-*` y bordes.
- Formularios con inputs redondeados, foco dorado y errores rojos.
- Sidebar administrativo oscuro.
- Navegación pública fija.
- Grids responsive en dashboards y formularios.
- Estados disabled con opacidad y cursor no permitido.

Recomendaciones generales:

- Mantener consistencia visual mediante componentes base.
- Evitar repetir clases excesivamente largas en muchos lugares.
- Usar variantes controladas de botones.
- Mantener diseño responsive.
- Definir patrones para tablas, formularios, cards y modales.
- Usar estados visuales claros para hover, disabled, error, success y loading.
- Si el proyecto crece, evaluar carpetas como `components/ui`, `components/forms`, `components/table`, `components/feedback`.

## 18. Manejo de errores, carga y estados vacíos

El proyecto maneja estados de forma explícita:

### Loading

Componente:

- `LoadingState`

Uso:

- Rutas protegidas mientras se restaura sesión.
- Listados administrativos.
- Dashboard.
- Modales de detalle.
- Formularios que dependen de datos, como categorías o roles.

### Error

Componente:

- `ErrorMessage`

Uso:

- Errores de API.
- Errores de formularios.
- Errores de mutaciones.
- Errores dentro de modales.

Helper:

- `getApiErrorMessage`

### Empty

Componente:

- `EmptyState`

Uso:

- Listas sin datos.
- Carrito vacío.
- Órdenes vacías.
- Productos/categorías/usuarios/roles sin registros.
- Eventos Outbox sin resultados.

### Acceso no autorizado

Manejo actual:

- `PrivateRoute` redirige a `/login`.
- `RoleRoute` redirige a `/`.

No confirmado:

- No se detectó una página dedicada de `403 Acceso denegado`.
- No se detectó una página dedicada de `404 No encontrado`; el fallback redirige a `/`.

Convención recomendada:

- Toda página que carga datos debe tener loading.
- Todo error debe mostrarse de forma entendible.
- Toda lista vacía debe tener mensaje amigable.
- Toda acción debe deshabilitar botones mientras se procesa.
- Toda ruta protegida debe manejar acceso denegado.
- En sistemas grandes, crear páginas `ForbiddenPage` y `NotFoundPage`.

## 19. Convenciones de nombres

Convenciones detectadas:

- Componentes en PascalCase: `Button`, `ProductForm`, `UsersPage`.
- Hooks iniciando con `use`: `useProducts`, `useOrders`, `useAuth`.
- APIs por dominio: `productsApi.js`, `orderApi.js`, `rolesApi.js`.
- Páginas con sufijo `Page`: `ProductsPage`, `DashboardPage`, `ProfilePage`.
- Formularios con sufijo `Form`: `ProductForm`, `UserForm`, `RoleForm`.
- Badges con sufijo `Badge`: `StatusBadge`, `OutboxStatusBadge`.
- Contextos con sufijo `Context` y providers con sufijo `Provider`.
- Guards con nombres descriptivos: `PrivateRoute`, `RoleRoute`.

Aspectos a normalizar:

- `Autentication` parece un error ortográfico; en inglés sería `Authentication`. No modificar código en este documento.
- Algunas carpetas están en mayúscula inicial (`Home`, `Autentication`) y otras en minúscula (`products`, `orders`, `users`).
- `dashboard/page` usa singular, mientras otras features usan `pages`.
- `AuthApi.js` usa mayúscula, mientras otros archivos API usan minúscula/camelCase.

Convención recomendada para futuros proyectos:

- Carpetas de features en minúscula: `authentication`, `products`, `users`.
- Subcarpeta siempre `pages`, no mezclar `page` y `pages`.
- Componentes en PascalCase.
- Hooks con prefijo `use`.
- Archivos API por dominio en camelCase o minúscula consistente: `clientsApi.js`, `productsApi.js`.
- Páginas con sufijo `Page`.
- Formularios con sufijo `Form`.
- Tablas con sufijo `Table`.
- Cards con sufijo `Card`.
- Badges con sufijo `Badge`.
- Constantes en `UPPER_SNAKE_CASE` cuando son listas/configuración exportada: `PUBLIC_NAV_LINKS`.
- Funciones API con verbos claros: `fetch`, `create`, `update`, `delete`.

## 20. Flujo recomendado para crear una nueva feature

Ejemplo para una feature genérica llamada `clients`:

1. Crear carpeta `src/features/clients`.
2. Crear `src/features/clients/api/clientsApi.js`.
3. Definir funciones API: `fetchClients`, `fetchClientById`, `createClient`, `updateClient`, `deleteClient`.
4. Crear hooks en `src/features/clients/hooks`.
5. Crear componentes específicos en `src/features/clients/components`.
6. Crear páginas en `src/features/clients/pages`.
7. Registrar rutas en `src/routes/AppRouter.jsx`.
8. Agregar navegación en `src/constants/navigation.js` si corresponde.
9. Agregar `PrivateRoute` si requiere autenticación.
10. Agregar `RoleRoute` si requiere rol.
11. Usar componentes reutilizables de `src/components`.
12. Manejar `loading`, `error` y `empty`.
13. Deshabilitar acciones durante mutaciones.
14. Ejecutar `npm run lint` y `npm run build`.
15. Documentar comportamiento o decisiones importantes si aplica.

Estructura sugerida:

```txt
features/
  clients/
    api/
      clientsApi.js
    components/
      ClientForm.jsx
      ClientTable.jsx
    hooks/
      useClients.js
      useClientById.js
      useCreateClient.js
      useUpdateClient.js
      useDeleteClient.js
    pages/
      ClientsPage.jsx
      ClientDetailPage.jsx
```

Este mismo proceso sirve para:

- `products`
- `users`
- `projects`
- `reservations`
- `invoices`
- `courses`
- `reports`
- `tasks`
- `inventory`
- `employees`
- `suppliers`

## 21. Plantilla base sugerida para futuros proyectos

Estructura recomendada:

```txt
src/
  api/
    client.js
    errors.js
  assets/
  components/
    ui/
    layout/
    feedback/
    table/
    forms/
  constants/
  context/
    AuthContext.jsx
    AuthProvider.jsx
  features/
    featureName/
      api/
      components/
      hooks/
      pages/
      utils/
  layout/
    PublicLayout.jsx
    PrivateLayout.jsx
    AdminLayout.jsx
  routes/
    AppRouter.jsx
    ProtectedRoute.jsx
    RoleRoute.jsx
  hooks/
  utils/
  App.jsx
  main.jsx
  index.css
```

Explicación:

- `api/client.js`: instancia Axios, baseURL, interceptores y token.
- `api/errors.js`: normalización de errores.
- `assets`: recursos estáticos.
- `components/ui`: botones, inputs, badges, modal base.
- `components/layout`: componentes compartidos de estructura visual.
- `components/feedback`: loading, error, empty, alerts.
- `components/table`: tablas genéricas.
- `components/forms`: campos reutilizables.
- `constants`: navegación, roles, opciones estáticas.
- `context`: sesión, usuario, permisos, tema, configuración global.
- `features`: módulos de negocio.
- `layout`: layouts usados por rutas.
- `routes`: rutas y guards.
- `hooks`: hooks transversales.
- `utils`: helpers globales sin dependencia de una feature.

Cuándo usar cada carpeta:

- Si el archivo depende de una entidad de negocio, colócalo en `features`.
- Si el archivo se usa en todo el sistema, colócalo en `components`, `hooks`, `context`, `api` o `utils`.
- Si define una pantalla enrutable, colócalo en `pages`.
- Si llama al backend, colócalo en `api`.
- Si encapsula estado de carga/error de una operación, colócalo en `hooks`.

## 22. Ejemplo de aplicación en distintos rubros

### Sistema de inventario

Features posibles:

- `products`
- `categories`
- `suppliers`
- `stockMovements`
- `warehouses`
- `reports`

Aplicación:

- `products` tendría CRUD de productos.
- `stockMovements` tendría entradas/salidas.
- `reports` tendría dashboards de stock bajo.
- `RoleRoute` separaría administradores, almaceneros y supervisores.

### Sistema académico

Features posibles:

- `students`
- `teachers`
- `courses`
- `enrollments`
- `grades`
- `reports`

Aplicación:

- `students` y `teachers` tendrían formularios y tablas.
- `courses` tendría catálogo académico.
- `enrollments` representaría transacciones de matrícula.
- Roles posibles: `Admin`, `Teacher`, `Student`.

### Sistema de reservas

Features posibles:

- `reservations`
- `clients`
- `schedules`
- `payments`
- `resources`
- `reports`

Aplicación:

- `reservations` tendría calendario/listado y detalle.
- `clients` tendría ficha del cliente.
- `payments` podría integrarse con backend.
- `PrivateRoute` protegería reservas del usuario.
- `RoleRoute` protegería administración.

### CRM

Features posibles:

- `clients`
- `leads`
- `opportunities`
- `tasks`
- `users`
- `reports`

Aplicación:

- `leads` y `opportunities` se modelan como features con sus propios hooks.
- `tasks` puede funcionar como módulo transversal de seguimiento.
- Dashboard resume oportunidades, conversiones y actividades.

### Sistema administrativo interno

Features posibles:

- `employees`
- `departments`
- `documents`
- `approvals`
- `dashboard`
- `users`

Aplicación:

- `employees` usa formularios y tablas administrativas.
- `documents` usa carga/listado/detalle.
- `approvals` representa flujos transaccionales.
- Roles: `Admin`, `Manager`, `Employee`, `Auditor`.

La arquitectura no depende del Ecommerce. Depende de separar módulos de negocio, infraestructura compartida, UI reutilizable, rutas, layouts, autenticación y estado.

## 23. Prompt base para otros agentes de IA

Prompt reutilizable:

```txt
Necesito que construyas un frontend ReactJS escalable usando Vite.

El sistema debe organizarse por features o módulos de negocio, no por carpetas gigantes de componentes y páginas. Usa esta estructura base:

src/
  api/
    client.js
    errors.js
  components/
    ui/
    feedback/
    table/
    forms/
  constants/
  context/
    AuthContext.jsx
    AuthProvider.jsx
  features/
    nombreFeature/
      api/
      components/
      hooks/
      pages/
      utils/
  layout/
    PublicLayout.jsx
    PrivateLayout.jsx
    AdminLayout.jsx
  routes/
    AppRouter.jsx
    ProtectedRoute.jsx
    RoleRoute.jsx
  hooks/
  utils/

Instrucciones obligatorias:

1. Usa ReactJS con Vite.
2. Usa React Router para rutas públicas, privadas y administrativas.
3. Usa Axios con un cliente centralizado en src/api/client.js.
4. No llames Axios directamente desde componentes ni páginas.
5. Cada feature debe tener su propia capa api cuando se comunique con backend.
6. Los hooks personalizados deben consumir funciones API y exponer data, isLoading, error y funciones de mutación cuando corresponda.
7. Las páginas deben consumir hooks y orquestar componentes.
8. Los componentes deben recibir datos y callbacks por props.
9. Implementa AuthContext/AuthProvider para sesión, usuario autenticado, tokens y logout.
10. Implementa rutas protegidas con ProtectedRoute o PrivateRoute.
11. Implementa RoleRoute para permisos por rol cuando aplique.
12. Separa layouts públicos, privados y administrativos.
13. Crea componentes reutilizables para Button, Input, Modal, ConfirmDialog, LoadingState, ErrorMessage, EmptyState, StatusBadge y DataTable si se necesitan.
14. Toda página que cargue datos debe manejar loading, error y empty state.
15. Todo formulario debe deshabilitar botones mientras guarda y mostrar errores claros.
16. Usa Tailwind CSS para estilos y mantén consistencia visual.
17. Usa nombres consistentes: componentes en PascalCase, hooks con prefijo use, páginas con sufijo Page, formularios con sufijo Form, tablas con sufijo Table y APIs por dominio como clientsApi.js.
18. Mantén la lógica de negocio dentro de la feature correspondiente.
19. Mantén la infraestructura compartida fuera de features.
20. Genera documentación breve explicando estructura, rutas, features, autenticación y convenciones.

El resultado debe ser un frontend mantenible, modular y preparado para crecer en distintos rubros como CRM, inventario, reservas, académico, ventas, administración interna o dashboard empresarial.
```

## 24. Buenas prácticas aplicadas

| Buena práctica | Evidencia | Por qué ayuda |
| --- | --- | --- |
| Arquitectura por features | `src/features/products`, `orders`, `users`, `dashboard`, `outbox`. | Permite escalar por módulos de negocio. |
| Separación de responsabilidades | API, hooks, páginas y componentes separados. | Reduce acoplamiento y mejora mantenimiento. |
| Capa API centralizada | `src/api/client.js`. | Centraliza baseURL, tokens e interceptores. |
| API por dominio | `productsApi.js`, `orderApi.js`, `rolesApi.js`. | Evita mezclar endpoints de distintas entidades. |
| Hooks personalizados | `useProducts`, `useOrders`, `useUsersAdmin`. | Encapsulan carga, error y mutaciones. |
| Contexto para autenticación | `AuthProvider`, `AuthContext`, `useAuth`. | Hace disponible la sesión en toda la app. |
| Refresh token | Interceptor en `client.js`. | Mejora continuidad de sesión. |
| Rutas protegidas | `PrivateRoute`. | Evita acceso sin autenticación. |
| Guards por rol | `RoleRoute`. | Controla áreas administrativas. |
| Menú filtrado por rol | `NavBarPrivate` + `PRIVATE_NAV_LINKS`. | Oculta opciones no disponibles para el usuario. |
| Layouts separados | `PublicLayout`, `PrivateLayout`. | Ordena vistas públicas y administrativas. |
| Componentes reutilizables | `Button`, `Modal`, `LoadingState`, `EmptyState`. | Reduce duplicación y mejora consistencia. |
| Estados loading/error/empty | En páginas administrativas y de usuario. | Mejora UX y robustez. |
| Confirmación antes de eliminar | `ConfirmDialog`. | Reduce acciones destructivas accidentales. |
| Variables de entorno | `.env.example`, `VITE_API_URL`. | Permite configurar backend por ambiente. |
| Iconos consistentes | `lucide-react`. | Mejora navegación y acciones sin SVG manual. |

## 25. Aspectos a mejorar

| Prioridad | Mejora | Descripción |
| --- | --- | --- |
| Alta | Normalizar nombres de carpetas | Unificar `Autentication`/`Home` con el estilo de `products`, `orders`, `users`. Recomendado para futuros proyectos; no se modifica aquí. |
| Alta | Corregir `Autentication` a `Authentication` en futuros proyectos | El nombre actual parece tener error ortográfico. No modificar ahora para evitar romper imports. |
| Alta | Mover tabla genérica a componentes globales | `TablePrivate` está en `products`, pero se usa en usuarios, órdenes, dashboard y outbox. |
| Alta | Agregar tests frontend | No se detectó script de tests. Sería importante para flujos críticos: auth, rutas, formularios y CRUD. |
| Alta | Crear páginas `403` y `404` | Actualmente roles no permitidos redirigen a `/` y rutas desconocidas también. Una pantalla explícita sería más clara. |
| Media | Mejorar consistencia entre `page` y `pages` | `dashboard/page` usa singular y otras features usan plural. |
| Media | Documentar variables de entorno | `.env.example` existe, pero conviene documentar cada variable y ambiente. |
| Media | Normalizar respuestas API | Los hooks asumen estructuras directas. En proyectos grandes conviene adaptar respuestas en la capa API. |
| Media | Manejo global de errores | `getApiErrorMessage` ayuda, pero podría complementarse con alertas globales o logging. |
| Media | Validaciones más consistentes | Hay validaciones locales útiles, pero podrían estandarizarse por formulario o helper. |
| Media | Accesibilidad | Existen avances como `aria-invalid`, `aria-describedby`, `role="alert"` y labels; se puede reforzar foco, navegación por teclado y mensajes. |
| Media | Separar componentes UI por subcarpetas | Si crece el proyecto, usar `components/ui`, `feedback`, `table`, `forms`, `layout`. |
| Media | Revisar encoding de textos | Algunos textos leídos aparecen con caracteres corruptos, por ejemplo acentos en README o constantes. |
| Baja | Estandarizar nombres API | `AuthApi.js` usa mayúscula y otros archivos usan camelCase/minúscula. |
| Baja | Extraer formateadores globales | `formatProductPrice` está en productos, pero se usa en órdenes y dashboard. Si representa moneda general, podría vivir en `utils/formatters.js`. |
| Baja | Mejorar documentación interna | Agregar README por feature cuando los módulos crezcan. |

## 26. Conclusión

La arquitectura actual del frontend es una buena base para proyectos ReactJS escalables. Aunque el caso práctico es un Ecommerce, el diseño principal no depende de vender productos: depende de separar módulos de negocio, centralizar infraestructura, usar hooks para lógica, layouts para estructura visual, rutas protegidas para seguridad y componentes reutilizables para consistencia.

Las partes más reutilizables son:

- Organización por features.
- Cliente API centralizado.
- Hooks personalizados por operación.
- Contexto de autenticación.
- Guards privados y por rol.
- Layout público y privado.
- Componentes base para botones, inputs, modales y estados.
- Patrón de páginas administrativas con tabla, modal, confirmación y refetch.

Las partes que conviene mejorar antes de usar esta arquitectura como plantilla definitiva son la normalización de nombres, la ubicación de componentes ya reutilizados como `TablePrivate`, la incorporación de tests, páginas dedicadas de error/acceso denegado y una estructura más granular de componentes UI si el sistema crece.

Como guía para otros desarrolladores o agentes de IA, este proyecto muestra una forma clara de crear frontends ordenados: cada nueva funcionalidad debe convertirse en una feature con su API, hooks, componentes y páginas; las rutas deben declarar acceso y layout; los componentes no deben conocer Axios; y cada pantalla debe manejar carga, error y vacío.

Esta estructura puede servir para Ecommerce, CRM, inventario, reservas, académico, ventas, administración interna, dashboards o sistemas empresariales con roles y permisos. El valor principal está en que cada módulo tiene un lugar natural dentro del código y cada responsabilidad queda en una capa reconocible.
