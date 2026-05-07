# Documentación de API BrainHub

## Base URL
- **Desarrollo**: `http://localhost:8000`
- **Producción**: `https://brainhub.example.com`

## Autenticación

Todos los endpoints excepto `/api/auth/registro` y `/api/auth/login` requieren token JWT.

**Header requerido**:
```
Authorization: Bearer <access_token>
```

## Endpoints

### Auth

#### Registro
```
POST /api/auth/registro
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@example.com",
  "password": "password123"
}

Response:
{
  "id": "uuid",
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@example.com",
  "email_verificado": false,
  "plan_id": 1,
  "created_at": "2024-05-06T10:30:00Z"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

#### Obtener usuario actual
```
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "nombre": "Juan",
  "apellido": "Pérez",
  "apodo": "juanperez",
  "email": "juan@example.com",
  "email_verificado": false,
  "plan_id": 1,
  "ultimo_login": "2024-05-06T10:30:00Z",
  "created_at": "2024-05-06T10:30:00Z"
}
```

### Pomodoro

#### Crear sesión
```
POST /api/pomodoro/sesiones
Authorization: Bearer <token>
Content-Type: application/json

{
  "modo": "work",  // "work", "short", "long"
  "duracion_minutos": 25
}

Response:
{
  "id": "uuid",
  "usuario_id": "uuid",
  "modo": "work",
  "duracion_minutos": 25,
  "estado": "activa",
  "tiempo_transcurrido": 0,
  "created_at": "2024-05-06T10:30:00Z",
  "finalizado_at": null
}
```

#### Listar sesiones
```
GET /api/pomodoro/sesiones?limite=10
Authorization: Bearer <token>

Response:
[
  {
    "id": "uuid",
    "usuario_id": "uuid",
    "modo": "work",
    "duracion_minutos": 25,
    "estado": "activa",
    "tiempo_transcurrido": 120,
    "created_at": "2024-05-06T10:30:00Z",
    "finalizado_at": null
  }
]
```

#### Obtener sesión específica
```
GET /api/pomodoro/sesiones/{sesion_id}
Authorization: Bearer <token>
```

#### Actualizar sesión
```
PUT /api/pomodoro/sesiones/{sesion_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado": "completada",  // "activa", "completada", "cancelada"
  "tiempo_transcurrido": 1500
}
```

#### Eliminar sesión
```
DELETE /api/pomodoro/sesiones/{sesion_id}
Authorization: Bearer <token>

Response: 204 No Content
```

### Notas

#### Crear nota
```
POST /api/notas
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Tareas del día",
  "contenido": "- Tarea 1\n- Tarea 2",
  "etiqueta_id": 1,
  "color": "#FFE5B4"
}

Response:
{
  "id": "uuid",
  "usuario_id": "uuid",
  "titulo": "Tareas del día",
  "contenido": "- Tarea 1\n- Tarea 2",
  "etiqueta_id": 1,
  "color": "#FFE5B4",
  "created_at": "2024-05-06T10:30:00Z",
  "updated_at": "2024-05-06T10:30:00Z"
}
```

#### Listar notas
```
GET /api/notas?limite=50
Authorization: Bearer <token>

Response: [...]
```

#### Obtener nota
```
GET /api/notas/{nota_id}
Authorization: Bearer <token>
```

#### Actualizar nota
```
PUT /api/notas/{nota_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Nuevo título",
  "contenido": "Nuevo contenido",
  "etiqueta_id": 2,
  "color": "#FFFFFF"
}
```

#### Eliminar nota
```
DELETE /api/notas/{nota_id}
Authorization: Bearer <token>

Response: 204 No Content
```

### Comunidad

#### Crear publicación
```
POST /api/comunidad/publicaciones
Authorization: Bearer <token>
Content-Type: application/json

{
  "categoria_id": 1,
  "titulo": "Mi logro hoy",
  "contenido": "Completé 5 pomodoros consecutivos!"
}

Response:
{
  "id": "uuid",
  "usuario_id": "uuid",
  "categoria_id": 1,
  "titulo": "Mi logro hoy",
  "contenido": "Completé 5 pomodoros consecutivos!",
  "estado": "activa",
  "likes": 0,
  "created_at": "2024-05-06T10:30:00Z"
}
```

#### Listar publicaciones
```
GET /api/comunidad/publicaciones?limite=20&offset=0
Authorization: Bearer <token> (opcional)

Response: [...]
```

#### Obtener publicación
```
GET /api/comunidad/publicaciones/{pub_id}
Authorization: Bearer <token> (opcional)
```

#### Dar like
```
POST /api/comunidad/publicaciones/{pub_id}/like
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "usuario_id": "uuid",
  "categoria_id": 1,
  "titulo": "Mi logro hoy",
  "contenido": "Completé 5 pomodoros consecutivos!",
  "estado": "activa",
  "likes": 1,
  "created_at": "2024-05-06T10:30:00Z"
}
```

#### Eliminar publicación
```
DELETE /api/comunidad/publicaciones/{pub_id}
Authorization: Bearer <token>

Response: 204 No Content
```

## Códigos de respuesta

- **200 OK**: Solicitud exitosa
- **201 Created**: Recurso creado exitosamente
- **204 No Content**: Solicitud exitosa sin contenido de respuesta
- **400 Bad Request**: Datos inválidos
- **401 Unauthorized**: Token inválido o expirado
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error en el servidor

## Ejemplo de solicitud con cURL

```bash
# Registro
curl -X POST http://localhost:8000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'

# Crear sesión pomodoro
curl -X POST http://localhost:8000/api/pomodoro/sesiones \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "modo": "work",
    "duracion_minutos": 25
  }'

# Listar notas
curl -X GET http://localhost:8000/api/notas \
  -H "Authorization: Bearer eyJhbGc..."
```

## Pruebas

Una vez que la API esté en ejecución, puedes acceder a la documentación interactiva:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

Ahí puedes probar todos los endpoints directamente.
