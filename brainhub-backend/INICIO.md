# 🧠 BrainHub Studio - Backend Setup

## 📖 Cómo Empezar (Selecciona una opción)

### Opción 1: 🚀 Despliegue en AWS (Recomendado para Producción)
```
1. Crear instancia EC2 en AWS (Ubuntu 24.04 LTS)
2. SSH a la instancia
3. Ejecutar: sudo ./deploy/setup.sh
4. Ver: README.md - Sección "Despliegue en AWS"
```
**Tiempo:** ~15 minutos

---

### Opción 2: 💻 Desarrollo Local (Python)
```
1. Crear venv: python3.12 -m venv venv
2. Instalar: pip install -r requirements.txt
3. Copiar: cp .env.example .env (editar si es necesario)
4. Ejecutar: uvicorn app.main:app --reload
5. Acceder: http://localhost:8000/docs
```
**Tiempo:** ~5 minutos

---

### Opción 3: 🐳 Docker Local (Recomendado para Desarrollo)
```
1. Instalar Docker y Docker Compose
2. Ejecutar: docker-compose up -d
3. Acceder: http://localhost/api/docs
```
**Tiempo:** ~3 minutos

---

## 📚 Documentación

| Documento | Propósito | Lectura |
|-----------|-----------|---------|
| **QUICKSTART.md** | Inicio rápido, comandos básicos | 5 min |
| **README.md** | Documentación completa, troubleshooting | 20 min |
| **PROYECTO_RESUMEN.md** | Overview del proyecto y arquitectura | 10 min |

---

## 📁 Estructura Principal

```
brainhub-backend/
├── app/                          # 🔴 Código principal
│   ├── main.py                   # Inicio aquí
│   ├── api/                      # Endpoints (auth, pomodoro, etc)
│   ├── models/                   # Modelos de BD
│   ├── schemas/                  # Validación de datos
│   ├── core/                     # Config y seguridad
│   └── db/                       # Conexión PostgreSQL
│
├── nginx/                        # 🔴 Config Nginx (producción)
│   └── brainhub.conf
│
├── deploy/                       # 🔴 Scripts despliegue (producción)
│   ├── setup.sh                  # PRINCIPAL para AWS
│   └── init-aws.sh
│
├── requirements.txt              # 🔴 Dependencias Python
├── .env.example                  # 🔴 Variables de entorno
├── docker-compose.yml            # 🔴 Para desarrollo con Docker
├── Dockerfile                    # 🔴 Imagen Docker
├── README.md                     # 🔴 Documentación COMPLETA
└── QUICKSTART.md                 # 🔴 Inicio rápido
```

**🔴 = Archivos críticos**

---

## 🎯 Checklist por Ambiente

### ✅ Local (Desarrollo)
```
[ ] Python 3.12 instalado
[ ] PostgreSQL corriendo
[ ] pip install -r requirements.txt
[ ] .env configurado (opcional para desarrollo)
[ ] uvicorn app.main:app --reload
[ ] Acceder a http://localhost:8000/docs
```

### ✅ Docker Local
```
[ ] Docker instalado
[ ] Docker Compose instalado
[ ] docker-compose up -d
[ ] Acceder a http://localhost/api/docs
```

### ✅ AWS (Producción) - RECOMENDADO
```
[ ] EC2 creada (Ubuntu 24.04 LTS, t3.small+)
[ ] SSH acceso configurado
[ ] Código descargado en instancia
[ ] chmod +x deploy/setup.sh ejecutado
[ ] sudo ./deploy/setup.sh completado sin errores
[ ] .env actualizado en /opt/brainhub/.env
[ ] Certificado SSL obtenido (certbot)
[ ] curl https://brainhub.example.com/health retorna 200
```

---

## 🔌 Endpoints Principales

```http
# Autenticación
POST /auth/register
POST /auth/login
GET  /auth/me

# Pomodoro  
GET    /pomodoro/config
POST   /pomodoro/sesiones
GET    /pomodoro/estadisticas

# Notas
POST   /notas
GET    /notas
PUT    /notas/{id}
DELETE /notas/{id}

# Comunidad
POST   /comunidad/publicaciones
GET    /comunidad/publicaciones
GET    /comunidad/leaderboard

# IA (Chat con Claude)
POST   /ia/chats
POST   /ia/chats/{id}/mensajes
GET    /ia/chats/{id}

# Sistema
GET    /           (info API)
GET    /health     (health check)
GET    /docs       (Swagger UI)
```

---

## 🔐 Variables de Entorno Críticas

**ANTES DE PRODUCCIÓN, CAMBIAR EN `/opt/brainhub/.env`:**

```env
POSTGRES_PASSWORD=CAMBIAR_CONTRASEÑA_FUERTE
SECRET_KEY=GENERAR_ALEATORIA_32+_CARACTERES
ANTHROPIC_API_KEY=sk-ant-tu-api-key-aqui
ENVIRONMENT=production
DEBUG=False
CORS_ORIGINS=["https://brainhub.example.com"]
```

---

## 🚀 Despliegue Rápido (AWS)

```bash
# En tu máquina local
git clone <repo>
cd brainhub-backend

# En instancia AWS EC2
ssh -i clave.pem ubuntu@ec2-xxx.amazonaws.com
git clone <repo>
cd brainhub-backend

# Ejecutar installer (hace TODO automáticamente)
sudo chmod +x deploy/setup.sh
sudo ./deploy/setup.sh

# Cuando termine, configurar
sudo nano /opt/brainhub/.env
sudo systemctl restart brainhub

# Obtener SSL
sudo certbot --nginx -d brainhub.example.com

# Verificar
curl https://brainhub.example.com/health
```

---

## 📊 Tecnologías Utilizadas

```
Backend:      FastAPI (Python 3.12)
Database:     PostgreSQL 16
Web Server:   Nginx (reverse proxy)
Auth:         JWT + bcrypt
IA:           Anthropic Claude API
Container:    Docker (opcional)
OS:           Ubuntu Server 24.04 LTS
Deployment:   systemd + AWS EC2
```

---

## 💾 Base de Datos

**13 Tablas incluidas:**
- usuarios (autenticación)
- config_pomodoro
- sesiones_pomodoro
- estadisticas_diarias
- racha_usuario
- notas
- chats_ia
- mensajes_chat
- publicaciones
- leaderboard
- usuario_logros
- + catálogos

Las tablas se crean automáticamente al iniciar.

---

## 🆘 Ayuda Rápida

| Problema | Solución |
|----------|----------|
| No se conecta a PostgreSQL | `sudo systemctl start postgresql` |
| Puerto 8000 ocupado | `kill -9 $(lsof -t -i:8000)` |
| ModuleNotFoundError | `source venv/bin/activate` |
| Nginx 502 Bad Gateway | `sudo systemctl restart brainhub nginx` |
| SSL no funciona | `sudo certbot renew` |

Ver **README.md** para más troubleshooting.

---

## 📈 Monitoreo (Producción)

```bash
# Ver status
sudo systemctl status brainhub nginx postgresql

# Ver logs en tiempo real
sudo journalctl -u brainhub -f
sudo tail -f /var/log/nginx/brainhub_error.log

# Health check
curl https://brainhub.example.com/health

# Usar API
curl -X GET https://brainhub.example.com/api/docs
```

---

## ✨ Lo Que Se Incluye

✅ Código completo en Python (FastAPI)
✅ Schema PostgreSQL con 13 tablas
✅ Configuración Nginx para producción
✅ Script automático de instalación AWS
✅ Docker Compose para desarrollo
✅ Documentación completa
✅ JWT autenticación
✅ Chat integrado con Claude API
✅ CORS, SSL/TLS, Firewall
✅ Listo para producción

---

## 🎯 Próximos Pasos

1. **Elige ambiente:**
   - Local: Leer QUICKSTART.md
   - AWS: Leer README.md - Despliegue en AWS
   - Docker: Ejecutar docker-compose up -d

2. **Configura variables de entorno**
   - Copiar .env.example a .env
   - Cambiar valores sensibles

3. **Ejecuta y prueba**
   - Local: uvicorn app.main:app --reload
   - AWS: sudo ./deploy/setup.sh

4. **Conecta frontend**
   - Copiar index.html a /var/www/brainhub/
   - Actualizar CORS_ORIGINS

5. **Monitorea**
   - Ver logs en tiempo real
   - Health checks periódicos

---

## 📞 Recursos

- **API Docs:** `/docs` o `/redoc`
- **Status API:** `/health`
- **Full Docs:** Ver archivos README.md, QUICKSTART.md
- **Schema DB:** schema_v3_brainhub.sql
- **Config:** app/core/config.py

---

## ⚡ TL;DR (La versión corta)

```bash
# Opción 1: Local en 5 segundos
python3.12 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload

# Opción 2: Docker en 3 segundos
docker-compose up -d

# Opción 3: AWS (ejecutar en instancia EC2)
sudo ./deploy/setup.sh
```

---

**¡Listo para empezar! 🚀**

Selecciona tu opción arriba y comienza 👆
