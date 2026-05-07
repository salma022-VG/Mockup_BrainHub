# Arquitectura BrainHub

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                     AWS EC2 Instance                            │
│                  (Ubuntu Server 24.04)                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      Nginx (Reverse Proxy)               │  │
│  │  • Puerto 80 (HTTP) → 443 (HTTPS)                        │  │
│  │  • SSL/TLS con Let's Encrypt                             │  │
│  │  • Servir frontend estático                              │  │
│  │  • Proxying a API backend                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│              ↓                                    ↓              │
│  ┌──────────────────────────┐      ┌──────────────────────────┐ │
│  │   Frontend React (Vite)  │      │   Backend FastAPI        │ │
│  │                          │      │                          │ │
│  │ • /var/www/brainhub/     │      │ • Uvicorn (8000)         │ │
│  │   frontend               │      │ • Systemd service        │ │
│  │ • React 18.3.1           │      │ • Python 3.12            │ │
│  │ • TypeScript/JavaScript  │      │ • SQLAlchemy ORM         │ │
│  │ • Vite bundler           │      │ • Pydantic validation    │ │
│  │                          │      │                          │ │
│  │ Rutas:                   │      │ Endpoints:               │ │
│  │ • /                      │      │ • /api/auth              │ │
│  │ • /pomodoro              │      │ • /api/pomodoro          │ │
│  │ • /notas                 │      │ • /api/notas             │ │
│  │ • /comunidad             │      │ • /api/comunidad         │ │
│  │ • /leaderboard           │      │ • /docs (Swagger)        │ │
│  │ • /stats                 │      │                          │ │
│  └──────────────────────────┘      └──────────────────────────┘ │
│                                            ↓                     │
│                                    ┌──────────────────────────┐  │
│                                    │  PostgreSQL Database     │  │
│                                    │                          │  │
│                                    │ • brainhub_db            │  │
│                                    │ • brainhub_user          │  │
│                                    │ • Pool: 10-20 conexiones │  │
│                                    │ • Backup automático      │  │
│                                    │                          │  │
│                                    │ Tablas:                  │  │
│                                    │ • usuarios               │  │
│                                    │ • sesiones_pomodoro      │  │
│                                    │ • notas                  │  │
│                                    │ • conversaciones_ia      │  │
│                                    │ • publicaciones_comunidad│  │
│                                    │ • usuario_logros         │  │
│                                    │ • catálogos              │  │
│                                    └──────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Servicios de Soporte                          │  │
│  │  • Backup automático (cron diario a las 2 AM)            │  │
│  │  • Logs centralizados (/var/log/brainhub)                │  │
│  │  • Firewall UFW (SSH, HTTP, HTTPS)                       │  │
│  │  • Monitoreo de servicios (systemd)                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         ↑                                         ↑
   Usuarios                                 Backup remoto
    (HTTPS)                                 (opcional)
```

## Stack Tecnológico

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.0
- **Lenguaje**: JavaScript/JSX
- **Styling**: CSS3
- **HTTP Client**: Fetch API

### Backend
- **Framework**: FastAPI 0.104.1
- **Servidor**: Uvicorn 0.24.0
- **ORM**: SQLAlchemy 2.0.23
- **Validación**: Pydantic 2.5.0
- **Autenticación**: JWT + Passlib + bcrypt
- **CORS**: Enabled

### Base de Datos
- **DBMS**: PostgreSQL 14+
- **Driver**: psycopg2 3.9.9
- **Pool**: 10-20 conexiones

### Infraestructura
- **Servidor Web**: Nginx
- **Certificados**: Let's Encrypt + Certbot
- **Init System**: Systemd
- **Firewall**: UFW
- **OS**: Ubuntu Server 24.04 LTS

## Flujo de Datos

### Autenticación
```
1. Usuario ingresa credenciales
2. Frontend envía a /api/auth/login
3. Backend valida contra BD
4. Backend retorna JWT token
5. Frontend almacena en localStorage
6. Frontend incluye token en headers Authorization
7. Backend valida token en cada solicitud
```

### Crear Sesión Pomodoro
```
1. Usuario inicia sesión desde componente Pomodoro
2. Frontend: POST /api/pomodoro/sesiones
3. Backend: crea SesionPomodoro en BD
4. Backend: retorna sesión con ID
5. Frontend: inicia timer y actualiza estado
6. Frontend: PUT /api/pomodoro/sesiones/{id} cada segundo
7. Al completar: PUT con estado='completada'
8. Backend: registra logros desbloqueados
```

### Crear Nota
```
1. Usuario ingresa título y contenido
2. Frontend: POST /api/notas
3. Backend: crea Nota en BD
4. Backend: retorna nota creada
5. Frontend: actualiza lista de notas
6. Al editar: PUT /api/notas/{id}
7. Al eliminar: DELETE /api/notas/{id}
```

### Publicar en Comunidad
```
1. Usuario crea publicación
2. Frontend: POST /api/comunidad/publicaciones
3. Backend: crea PublicacionComunidad
4. Backend: notifica a otros usuarios (futuro)
5. Frontend: GET /api/comunidad/publicaciones (sin autenticar)
6. Usuarios pueden dar like: POST /api/comunidad/publicaciones/{id}/like
7. Autor puede eliminar: DELETE /api/comunidad/publicaciones/{id}
```

## Seguridad

### Medidas Implementadas
- **CORS**: Configurado para dominios específicos
- **HTTPS**: Obligatorio en producción (SSL/TLS)
- **JWT**: Token de acceso con expiración (30 min default)
- **Passwords**: Hasheados con bcrypt
- **SQL Injection**: Prevenido con ORM (SQLAlchemy)
- **CSRF**: Headers de seguridad en Nginx
- **Rate Limiting**: A implementar (middleware opcional)
- **Input Validation**: Pydantic schemas
- **Database Pool**: Secure pool connections

### Mejoras Futuras
- Refresh tokens
- Rate limiting por IP
- 2FA (autenticación de dos factores)
- Email verification
- Password reset flow
- API key management
- Audit logs

## Escalabilidad

### Vertical (aumentar recursos)
- Aumentar CPU/RAM de instancia EC2
- Aumentar workers de Uvicorn
- Aumentar pool de conexiones PostgreSQL
- Aumentar memoria caché

### Horizontal (múltiples instancias)
- Load balancer (AWS ALB/NLB)
- Múltiples instancias EC2 con backend
- RDS (PostgreSQL administrado)
- Redis (sesiones/cache)
- CloudFront (CDN para frontend)

## Monitoreo Recomendado

- **CloudWatch**: Métricas de EC2
- **New Relic/DataDog**: APM
- **UptimeRobot**: Health checks externos
- **Grafana**: Dashboards personalizados
- **Prometheus**: Métricas de aplicación
- **ELK Stack**: Log aggregation

## Backups

- **Automático**: Diariamente a las 2 AM
- **Localización**: /backups/brainhub
- **Retención**: Últimos 7 días
- **Contenido**: BD + código + datos
- **Compresión**: .sql.gz + .tar.gz

## Costos Estimados en AWS

| Servicio | Tamaño | Costo Mensual |
|----------|--------|---------------|
| EC2 | t3.medium | $30 |
| RDS PostgreSQL | db.t3.micro | $25 |
| Elastic IP | 1 | $0 (sin uso) |
| S3 (backups) | 10GB | $0.25 |
| Data Transfer | 100GB | $5-10 |
| **Total** | | **~$60-70** |

*Nota: Estos son costos estimados. Varían según región y uso.*
