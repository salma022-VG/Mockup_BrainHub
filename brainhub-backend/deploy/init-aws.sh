#!/bin/bash

#═══════════════════════════════════════════════════════════════
# Script de Despliegue en AWS EC2
# Prepara la instancia para recibir el código
#═══════════════════════════════════════════════════════════════

set -e

echo "🚀 Preparando instancia AWS EC2..."

# Actualizar paquetes
sudo apt-get update
sudo apt-get upgrade -y

# Instalar herramientas básicas
sudo apt-get install -y \
    git \
    curl \
    wget \
    build-essential \
    libssl-dev \
    libffi-dev \
    python3.12-dev

# Crear usuario no-root para la aplicación
if ! id -u ubuntu &>/dev/null; then
    sudo useradd -m -s /bin/bash ubuntu
    echo "✅ Usuario 'ubuntu' creado"
fi

# Crear estructura de directorios
sudo mkdir -p /opt/brainhub
sudo chown ubuntu:ubuntu /opt/brainhub

echo "✅ Instancia preparada. Ahora ejecutar: sudo ./deploy/setup.sh"
