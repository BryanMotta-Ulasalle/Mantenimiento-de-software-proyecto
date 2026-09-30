# Ecommerce

Aplicación de comercio electrónico con catálogo público, autenticación JWT,
carrito, órdenes y panel administrativo por roles.

## Tecnologías

### Backend

- Python 3.10+
- Django 5.2
- Django REST Framework
- SimpleJWT
- PostgreSQL 16
- drf-spectacular

### Frontend

- React 19
- Vite 8
- React Router 7
- Axios
- Tailwind CSS 4
- Context API

## Estructura

```text
ECommerce/
|-- Back-end/     API, modelos, permisos y pruebas Django
|-- front-end/    Aplicación React organizada por features
|-- FASE_*.md     Informes de cada fase
`-- REPORTE_FINAL_ECOMMERCE.md
```

## Instalación del backend

```powershell
cd ECommerce/Back-end
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Crear `Back-end/.env` a partir de `.env.example`:

```ini
DB_NAME=ecommerce
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Levantar PostgreSQL y Django:

```powershell
docker compose up -d
python manage.py migrate
python manage.py runserver
```

Las migraciones aseguran los roles base mediante `post_migrate`:

- `Admin` (`id=1`)
- `Employee` (`id=2`)
- `Customer` (`id=3`)

## Instalación del frontend

```powershell
cd ECommerce/front-end
npm install
```

Crear `front-end/.env`:

```ini
VITE_API_URL=http://127.0.0.1:8000/api
```

Ejecutar:

```powershell
npm run dev
```

Scripts disponibles:

```text
npm run dev      Servidor de desarrollo
npm run build    Bundle de producción
npm run lint     ESLint
npm run preview  Vista previa del bundle
```

## Funcionalidades

- Registro público siempre como `Customer`.
- Login, refresh automático de JWT, persistencia y logout.
- Catálogo, detalle, imágenes y control visual de stock.
- Carrito con contador, cantidades y eliminación de items.
- Creación de orden con dirección de envío.
- Historial de órdenes del usuario.
- Perfil autenticado.
- Administración de productos y categorías para `Admin` y `Employee`.
- Dashboard, usuarios, roles y órdenes administrativas para `Admin`.

No existe flujo de pagos activo.

## Endpoints principales

| Área | Endpoints |
|---|---|
| Autenticación | `POST /api/auth/register/`, `POST /api/auth/login/`, `POST /api/auth/refresh/` |
| Perfil | `GET/PATCH /api/users/me/` |
| Productos | `/api/products/` |
| Categorías | `/api/categories/` |
| Carrito | `/api/carts/`, `/api/cart-items/` |
| Órdenes | `/api/orders/`, `/api/order-items/` |
| Administración | `/api/users/`, `/api/roles/` |
| Documentación | `/api/docs/`, `/api/redoc/`, `/api/schema/` |

## Permisos

| Recurso | Lectura | Mutación |
|---|---|---|
| Productos | Público | `Admin`, `Employee` |
| Categorías | Público | `Admin`, `Employee` |
| Carrito | Propietario autenticado | Propietario autenticado |
| Órdenes | Propietario; todas para `Admin` | Creación autenticada |
| Usuarios | `Admin`; perfil propio en `/me/` | `Admin`; perfil propio limitado en `/me/` |
| Roles | `Admin` | `Admin` |
| Order items | Propietario; todos para `Admin` | Solo creación interna al confirmar orden |

## Verificación

```powershell
# Frontend
npm run lint
npm run build

# Backend
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test
```


