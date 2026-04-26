# 🧠 Integración de Modelos de IA - BrainHub Backend

## Opciones Disponibles

El backend de BrainHub soporta **dos proveedores de IA**:

| Proveedor | Modelo | Costo | Latencia | Configuración |
|-----------|--------|-------|----------|---|
| **Anthropic** | Claude Opus 4.1 | API pay-as-you-go | Baja (~1s) | Nube (externo) |
| **Falcon 7B** | Falcon 7B Instruct | Gratis (open-source) | Media (~2-3s) | Local o Remoto |

---

## 1️⃣ Opción 1: Claude API (Anthropic) - Recomendado para Producción

### Configuración Mínima

#### 1. Obtener API Key
```bash
# Visitar https://console.anthropic.com
# Crear API key y copiar
```

#### 2. Configurar .env
```env
IA_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-tu-api-key-aqui
```

#### 3. Instalar dependencias
```bash
pip install anthropic
```

#### 4. Iniciar servidor
```bash
uvicorn app.main:app --reload
```

### Ventajas
✅ Modelos de última generación (Claude Opus 4.1)
✅ Respuestas de alta calidad
✅ Manejo de contexto largo (200k tokens)
✅ Soporte multimodal (texto, imágenes)
✅ Sin necesidad de hardware potente

### Desventajas
❌ Costo por API (variable según uso)
❌ Depende de conectividad externa
❌ Rate limiting en plan gratuito

### Coste Estimado
```
- Input: $3/MTok
- Output: $15/MTok
- Ejemplo: 1000 usuarios × 10 queries/día = ~$50-100/mes
```

---

## 2️⃣ Opción 2: Falcon 7B Local - Recomendado para Desarrollo/On-Premise

### Requisitos del Sistema

```
CPU:    4+ núcleos
RAM:    16 GB mínimo (mejor 24-32 GB)
Disco:  30 GB SSD
GPU:    RECOMENDADO (NVIDIA CUDA o similar)
        Sin GPU: ~2-3s por respuesta
        Con GPU: ~0.5-1s por respuesta
```

### Configuración en Desarrollo Local

#### 1. Instalar dependencias necesarias
```bash
# Python 3.10+
python --version

# Torch con CUDA (si tienes GPU)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# O solo CPU (más lento)
pip install torch torchvision torchaudio
```

#### 2. Instalar servidor de Falcon
```bash
# Opción A: TextGeneration WebUI (más fácil)
git clone https://github.com/oobabooga/text-generation-webui.git
cd text-generation-webui
pip install -r requirements.txt

# Descargar modelo Falcon 7B
python download-model.py TheBloke/Falcon-7B-Instruct-GGUF

# Iniciar servidor
python server.py --listen 127.0.0.1 --port 8001 --api
```

**Opción B: vLLM (más rápido)**
```bash
pip install vllm

# Iniciar servidor vLLM
python -m vllm.entrypoints.openai.api_server \
    --model tiiuae/falcon-7b-instruct \
    --port 8001 \
    --tensor-parallel-size 1
```

#### 3. Verificar que Falcon está disponible
```bash
curl http://localhost:8001/v1/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"falcon-7b","prompt":"Hola","max_tokens":20}'
```

#### 4. Configurar .env en backend
```env
IA_PROVIDER=falcon
FALCON_API_URL=http://localhost:8001
```

#### 5. Instalar dependencias Python
```bash
pip install requests
```

#### 6. Iniciar BrainHub Backend
```bash
uvicorn app.main:app --reload --port 8000
```

### Ventajas
✅ Sin costos de API
✅ Modelo open-source
✅ Datos permanecen locales (privacidad)
✅ Control total del modelo
✅ Escalable en infraestructura propia

### Desventajas
❌ Requiere hardware potente
❌ Respuestas más lentasque Claude
❌ Necesita mantenimiento
❌ Menor calidad en tareas complejas

### Rendimiento Estimado

#### Sin GPU (Intel i7, 32GB RAM)
```
Tiempo por respuesta:  2-4 segundos
Usuarios concurrentes: 3-5
Requests/minuto:       ~15-20
```

#### Con GPU (NVIDIA A100, 40GB VRAM)
```
Tiempo por respuesta:  0.3-0.8 segundos
Usuarios concurrentes: 50+
Requests/minuto:       ~100+
```

---

## 3️⃣ Integración en AWS EC2

### Con Claude API (Recomendado)

```bash
# 1. En instancia EC2 estándar (t3.small)
sudo ./deploy/setup.sh

# 2. Editar .env
sudo nano /opt/brainhub/.env
# IA_PROVIDER=anthropic
# ANTHROPIC_API_KEY=sk-ant-...

# 3. Reiniciar
sudo systemctl restart brainhub
```

**Ventajas:**
- ✅ Instancia EC2 pequeña (barato)
- ✅ Escalable automáticamente
- ✅ Sin hardware adicional

### Con Falcon 7B Local

**Opción A: EC2 con GPU (g4dn.xlarge o mayor)**

```bash
# 1. Usar AMI con CUDA preinstalado
# https://aws.amazon.com/marketplace/pp/prodview-vz6b7yadxmzpg

# 2. Instalar Falcon en otra instancia o contenedor
# https://github.com/oobabooga/text-generation-webui

# 3. Configurar .env apuntando a servidor Falcon
IA_PROVIDER=falcon
FALCON_API_URL=http://falcon-server:8001
```

**Opción B: ECS + Contenedores (Recomendado para producción)

```yaml
# docker-compose.yml ajustado
version: '3.8'
services:
  # Backend FastAPI
  backend:
    image: brainhub-backend:latest
    environment:
      IA_PROVIDER: falcon
      FALCON_API_URL: http://falcon:8001
    depends_on:
      - falcon
      - postgres

  # Servidor Falcon en otro contenedor
  falcon:
    image: brainhub-falcon:latest
    ports:
      - "8001:8001"
    environment:
      MODEL: tiiuae/falcon-7b-instruct
      GPU_LAYERS: 40  # Ajustar según GPU disponible
```

---

## 📊 Comparativa de Costos (Anual)

### Opción 1: Claude API
```
Supuestos:
- 500 usuarios activos
- 5 queries/usuario/día
- 2,500 queries/día
- 200 tokens input/query, 300 tokens output

Cálculo:
- Input:  2,500 × 200 × $0.000003 = $1.50/día
- Output: 2,500 × 300 × $0.000015 = $11.25/día
- Total:  $12.75/día ≈ $4,650/año

+ Infraestructura AWS (t3.small): ~$20/mes = $240/año
TOTAL ANUAL: ~$4,890
```

### Opción 2: Falcon 7B Local
```
Hardware necesario:
- EC2 g4dn.xlarge: ~$1.46/hora = ~$1,300/mes = $15,600/año
- O GPU local: amortizar costo inicial (e.g., RTX 4080 = $1,200)

Ventaja: Sin costos recurrentes por tokens
TOTAL ANUAL: ~$1,200 (amortizado) + $2,000 infraestructura = ~$3,200
```

**Recomendación:**
- **Startups/Producción:** Claude API (menos complejidad)
- **Escala media:** Falcon local + self-hosted
- **Máxima privacidad/control:** Falcon local on-premise

---

## 🔧 Troubleshooting

### Error: "Connection refused" con Falcon
```bash
# Verificar que Falcon está corriendo
curl http://localhost:8001/health

# Si no responde, iniciar:
python -m vllm.entrypoints.openai.api_server \
    --model tiiuae/falcon-7b-instruct \
    --port 8001
```

### Error: "ANTHROPIC_API_KEY not found"
```bash
# Verificar .env
cat /opt/brainhub/.env | grep ANTHROPIC

# Si falta, agregar:
echo "ANTHROPIC_API_KEY=sk-ant-..." >> /opt/brainhub/.env
systemctl restart brainhub
```

### Falcon muy lento (>5 segundos)
```bash
# 1. Sin GPU = normal (2-4s)
# 2. Con GPU pero lento = revisar VRAM
nvidia-smi

# 3. Reducir tensor-parallel si falta memoria
python -m vllm.entrypoints.openai.api_server \
    --model tiiuae/falcon-7b-instruct \
    --tensor-parallel-size 1  # Reducir si no cabe en VRAM
```

---

## 📝 API Endpoint Unificado

Ambos proveedores usan el mismo endpoint:

```bash
# Crear chat
POST /ia/chats
{
  "titulo": "Mi sesión"
}

# Enviar mensaje (respuesta de IA automática)
POST /ia/chats/{chat_id}/mensajes
{
  "contenido": "¿Cómo puedo mejorar mi concentración?"
}

# Respuesta (igual para ambos proveedores):
{
  "user_message": {...},
  "ai_response": {...},
  "provider": "anthropic"  // o "falcon"
}
```

---

## 🚀 Recomendación Final

**Para este proyecto BrainHub:**

1. **Fase 1 (MVP):** Claude API
   - Más fácil de implementar
   - Mejor calidad
   - Presupuesto controlado
   - Escalabilidad automática

2. **Fase 2 (Crecimiento):** Migrar a Falcon 7B local
   - Costos menores en escala
   - Control total
   - Cumplimiento de privacidad

3. **Fase 3 (Enterprise):** Híbrido
   - Claude para tareas complejas
   - Falcon local para caché/contexto
   - Mejor rendimiento y costos

---

**¿Qué opción prefieres para tu proyecto?**

- 📱 Claude API (nube, simple, caro)
- 🖥️ Falcon 7B (local, gratis, complejo)
- ⚖️ Híbrido (lo mejor de ambos)
