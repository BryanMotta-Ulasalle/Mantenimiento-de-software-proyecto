# Frontend Ecommerce

Aplicación React del Ecommerce. Incluye catálogo, autenticación JWT, carrito,
órdenes, perfil y panel administrativo.

## Requisitos

- Node.js compatible con Vite 8
- Backend disponible en `http://127.0.0.1:8000`

## Configuración

Crear `.env` desde `.env.example`:

```ini
VITE_API_URL=http://127.0.0.1:8000/api
```

## Instalación y scripts

```powershell
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

## Arquitectura

- `src/api`: cliente Axios, refresh JWT y errores.
- `src/context`: sesión y carrito global.
- `src/routes`: rutas privadas y guards por rol.
- `src/layout`: layouts público y administrativo.
- `src/components`: componentes base y estados reutilizables.
- `src/features`: autenticación, home, productos, órdenes, usuarios y dashboard.

## Autenticación

`AuthProvider` mantiene usuario, access token, refresh token y carga inicial.
Axios reintenta una vez las peticiones privadas con `/auth/refresh/`. Si el
refresh no existe o vence, limpia tokens y sesión.

## Roles

- `Customer`: catálogo, carrito, perfil y órdenes propias.
- `Employee`: además administra productos y categorías.
- `Admin`: acceso completo al panel administrativo.

## Notas

- No existe script de tests frontend.
- No se implementan pagos.
- Las imágenes se muestran desde `product_images`; su gestión administrativa
  queda pendiente de un endpoint backend.
