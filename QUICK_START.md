# 🚀 Quick Start - BrainHub

¡Bienvenido a BrainHub! Este es un sistema completo de productividad con Pomodoro, Notas, Chat IA, Comunidad y Leaderboard.

## 📋 Requisitos Previos

- **Python 3.12+**
- **PostgreSQL 14+**
- **Node.js 18+** (para frontend)
- **Git**

## ⚡ Inicio Rápido (5 minutos)

### 1. Backend (Python + FastAPI)

```bash
# Navegar a la carpeta backend
cd backend

# Crear entorno virtual
python3.12 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar BD (si no existe)
# En PostgreSQL:
# CREATE USER brainhub_user WITH PASSWORD 'brainhub_password';
# CREATE DATABASE brainhub_db OWNER brainhub_user;
# psql -U brainhub_user -d brainhub_db < ../schema_v3_brainhub.sql

# Copiar archivo de configuración
cp .env.example .env

# Iniciar servidor
python main.py
```

✅ **Backend en**: http://localhost:8000
📚 **Documentación API**: http://localhost:8000/docs

### 2. Frontend (React + Vite)

```bash
# En otra terminal, en la raíz del proyecto
npm install

# Crear archivo .env para frontend
echo "VITE_API_URL=http://localhost:8000" > .env

# Iniciar servidor de desarrollo
npm run dev
```

✅ **Frontend en**: http://localhost:5173

### 3. Verificar Conexión

```bash
# En otra terminal, probar la API
curl http://localhost:8000/health
# Debería retornar: {"status":"ok"}

# Probar registro
curl -X POST http://localhost:8000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombre":"Test",
    "apellido":"User",
    "email":"test@example.com",
    "password":"password123"
  }'
```

## 📁 Estructura del Proyecto

```
BrainHub/
├── backend/                    # 🐍 Backend Python + FastAPI
│   ├── main.py                 # Entrada principal
│   ├── config.py               # Configuración
│   ├── models.py               # Modelos BD
│   ├── schemas.py              # Validación
│   ├── routes/                 # Endpoints API
│   └── requirements.txt         # Dependencias
│
├── src/                        # ⚛️ Frontend React
│   ├── components/             # Componentes React
│   ├── pages/                  # Páginas
│   └── App.jsx                 # App principal
│
├── deploy/                     # 🚀 Configuración deploy
│   ├── nginx.conf              # Configuración Nginx
│   ├── brainhub.service        # Servicio systemd
│   ├── setup-server.sh         # Script instalación
│   └── DEPLOYMENT_GUIDE.md     # Guía detallada
│
├── API_DOCUMENTATION.md        # 📚 Documentación API
├── ARCHITECTURE.md             # 🏗️ Arquitectura del sistema
├── README_BACKEND.md           # 📖 Guía backend
└── schema_v3_brainhub.sql     # 🗄️ Schema BD

```

## 🔑 Características Principales

### Backend API
- ✅ Autenticación con JWT
- ✅ Sesiones Pomodoro (work/short/long)
- ✅ Gestión de Notas
- ✅ Chat con IA (integración con Claude)
- ✅ Comunidad (publicaciones, likes)
- ✅ Logros y estadísticas
- ✅ Documentación interactiva (Swagger)

### Frontend React
- ✅ Diseño responsive
- ✅ Timer Pomodoro interactivo
- ✅ Editor de notas
- ✅ Panel de comunidad
- ✅ Leaderboard
- ✅ Estadísticas personales

## 🌍 Despliegue en Producción

Para desplegar en AWS Ubuntu Server 24.04:

```bash
# Copiar script de instalación a servidor
scp deploy/setup-server.sh ubuntu@tu-ip:/home/ubuntu/

# Conectar vía SSH
ssh ubuntu@tu-ip

# Ejecutar script
chmod +x setup-server.sh
sudo ./setup-server.sh

# Seguir las instrucciones en pantalla
```

Ver: [`deploy/DEPLOYMENT_GUIDE.md`](deploy/DEPLOYMENT_GUIDE.md) para detalles completos.

## 📚 Documentación Detallada

- **Backend**: Ver [`README_BACKEND.md`](README_BACKEND.md)
- **API**: Ver [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md)
- **Arquitectura**: Ver [`ARCHITECTURE.md`](ARCHITECTURE.md)
- **Despliegue**: Ver [`deploy/DEPLOYMENT_GUIDE.md`](deploy/DEPLOYMENT_GUIDE.md)

## 🧪 Testing

### Backend
```bash
cd backend

# Instalar herramientas de test
pip install pytest pytest-asyncio httpx

# Ejecutar tests
pytest

# Con coverage
pytest --cov=.
```

### Frontend
```bash
# Tests unitarios
npm run test

# E2E tests
npm run test:e2e
```

## 🐛 Troubleshooting

### "Cannot connect to database"
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Verificar credenciales en backend/.env
nano backend/.env

# Verificar conexión
psql -U brainhub_user -d brainhub_db -c "\dt"
```

### "Port 8000/5173 already in use"
```bash
# Linux/Mac: Matar proceso en puerto
lsof -i :8000
kill -9 <PID>

# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process
```

### Frontend no conecta a API
- Verificar que backend está corriendo: `curl http://localhost:8000/health`
- Verificar variable `VITE_API_URL` en `.env`
- Revisar CORS en `backend/config.py`
- Abrir consola (F12) para ver errores de red

## 📞 Contacto y Soporte

- 📧 Email: valentona143@gmail.com
- 🐛 Issues: Reportar en GitHub
- 📖 Documentación: Ver archivos .md en el proyecto

## 📄 Licencia

Este proyecto es parte del Portfolio de SALMA GONZALEZ.

## 🎯 Hoja de Ruta

### v1.0 ✅
- [x] Backend FastAPI completo
- [x] Autenticación JWT
- [x] CRUD para Pomodoro, Notas, Comunidad
- [x] Frontend React funcional
- [x] Integración BD PostgreSQL
- [x] Documentación completa

### v1.1 🔄 (Próximo)
- [ ] Chat IA mejorado (streaming)
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Modo oscuro completo
- [ ] Exportar datos (PDF, CSV)
- [ ] Social sharing
- [ ] Mobile app (React Native)

### v2.0 🚀 (Futuro)
- [ ] Integración con calendarios (Google, Outlook)
- [ ] Análisis predictivo
- [ ] Gamification avanzada
- [ ] Teams/Grupos privados
- [ ] API pública con Rate Limiting
- [ ] Analytics dashboard

---

**¡Listo para empezar!** 🎉

Inicia el backend, frontend y comienza a ser productivo con BrainHub.
