#!/bin/bash
# Script para detener EventSphere en el servidor Linux

echo "🛑 Deteniendo EventSphere..."

# Buscar y matar el proceso
PID=$(ps aux | grep "spring-boot:run" | grep -v grep | awk '{print $2}')

if [ ! -z "$PID" ]; then
    kill -9 $PID
    echo "✅ Aplicación detenida (PID: $PID)"
else
    echo "ℹ️  No hay procesos corriendo"
fi
