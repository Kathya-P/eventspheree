#!/bin/bash
# Script para iniciar EventSphere en el servidor Linux

echo "🚀 Iniciando EventSphere en modo servidor..."

# Ir al directorio del proyecto
cd ~/eventspheree

# Actualizar código desde GitHub
echo "📥 Actualizando código desde GitHub..."
git pull

# Compilar el proyecto
echo "🔨 Compilando el proyecto..."
mvn clean package -DskipTests

# Matar proceso anterior si existe
echo "🔍 Verificando procesos anteriores..."
pkill -f "spring-boot:run"

# Esperar un momento
sleep 2

# Iniciar la aplicación en background
echo "▶️  Iniciando aplicación..."
nohup mvn spring-boot:run -Dspring.profiles.active=servidor > ~/eventspheree/app.log 2>&1 &

# Obtener el PID
sleep 3
PID=$(ps aux | grep "spring-boot:run" | grep -v grep | awk '{print $2}')

if [ ! -z "$PID" ]; then
    echo "✅ Aplicación iniciada correctamente!"
    echo "   PID: $PID"
    echo "   URL: http://10.191.177.241:8080"
    echo "   Logs: tail -f ~/eventspheree/app.log"
else
    echo "❌ Error al iniciar la aplicación"
    echo "   Ver logs: cat ~/eventspheree/app.log"
fi
