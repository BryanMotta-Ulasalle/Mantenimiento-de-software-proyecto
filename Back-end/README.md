# Backend ECommerce

Backend desarrollado con Django, Django REST Framework, JWT y PostgreSQL.

Este documento explica la forma recomendada de configurar y ejecutar el backend localmente sin problemas.

## Requisitos

- Python 3.10 o superior
- PostgreSQL
- Docker y Docker Compose opcionalmente, si quieres levantar la base de datos en contenedor

## Estructura importante

- `manage.py`: punto de entrada de Django
- `ECommerce/settings.py`: configuracion principal
- `.env`: variables de entorno para la conexion a base de datos
- `docker-compose.yml`: contenedor PostgreSQL para desarrollo
- `apps/users`: autenticacion, usuarios y roles
- `apps/products`: productos y categorias
- `apps/orders`: pedidos y carrito

## Variables de entorno

El backend espera estas variables:

```ini
DB_NAME=ecommerce
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

Puedes guardarlas en el archivo `.env` dentro de `Ecommerce/Back-end`.

## Opcion recomendada: PostgreSQL con Docker + Django local

### 1. Levantar la base de datos

Desde la carpeta `Ecommerce/Back-end`:

```bash
docker compose up -d
```

Esto levanta PostgreSQL con los valores definidos en `docker-compose.yml`.

## 2. Crear y activar entorno virtual

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

macOS / Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

## 3. Instalar dependencias

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

## 4. Aplicar migraciones

```bash
python manage.py migrate
```

Con este paso se crean las tablas del sistema.

## 5. Roles creados automaticamente

Después de ejecutar las migraciones, el sistema asegura automáticamente los
roles base del proyecto mediante la señal `post_migrate`:

- `Admin` con `id = 1`
- `Employee` con `id = 2`
- `Customer` con `id = 3`

Esto permite probar autenticacion y registro con una base de datos vacia.

Nota importante:
- en una base completamente nueva, estos roles se crean al ejecutar `migrate`
- si ya existian roles con otros IDs, puede requerirse limpieza manual para forzar exactamente `1`, `2` y `3`

## 6. Ejecutar el servidor

```bash
python manage.py runserver 0.0.0.0:8000
```

La API quedara disponible en:

```text
http://localhost:8000/
```

## Flujo minimo recomendado para probar auth

Con una base vacia, el orden recomendado es:

1. Levantar PostgreSQL
2. Ejecutar `python manage.py migrate`
3. Ejecutar `python manage.py runserver`
4. Probar registro
5. Probar login
6. Probar `/api/users/me/`

## Endpoints principales de autenticacion

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET /api/users/me/`

## Ejemplo de registro

```json
{
  "name": "Usuario Demo",
  "email": "demo@example.com",
  "password": "12345678"
}
```

El registro público no acepta `role_id`: todos los usuarios registrados por
este endpoint se crean con el rol `Customer`.

## Ejemplo de login

```json
{
  "email": "demo@example.com",
  "password": "12345678"
}
```

La respuesta debe incluir:

- `access`
- `refresh`

## Probar `/users/me/`

Despues del login, envia el token en el header:

```text
Authorization: Bearer <access_token>
```

Y consulta:

```text
GET /api/users/me/
```

## Verificacion rapida de roles

Si quieres comprobar que los roles fueron creados correctamente:

```bash
python manage.py shell
```

Luego:

```python
from apps.users.models import Role
list(Role.objects.all().values("id", "name"))
```

Deberias obtener algo equivalente a:

```python
[
    {"id": 1, "name": "Admin"},
    {"id": 2, "name": "Employee"},
    {"id": 3, "name": "Customer"},
]
```

## Comandos utiles

```bash
python manage.py check
python manage.py showmigrations
python manage.py shell
```

## Observaciones importantes

- El backend usa JWT con `rest_framework_simplejwt`.
- El endpoint `/api/auth/register/` puede funcionar con base vacia porque ahora los roles base se crean automaticamente.
- El login depende de que el usuario ya exista y tenga contraseña valida.
- Si vas a probar desde el frontend, asegúrate de que el puerto y `CORS_ALLOWED_ORIGINS` coincidan con tu entorno local.

## Posible punto a revisar despues

La autenticacion basica ya se puede probar con base vacia, pero la creacion de superusuario puede requerir un ajuste adicional si quieres asignarle rol automaticamente durante `createsuperuser`.
