#!/bin/bash

set -e

# Caminhos do backend e frontend
BACKEND_DIR="/var/www/html/projetos-iot/backend"
FRONTEND_DIR="/var/www/html/projetos-iot/frontend"

# Backend: Laravel na porta 8055
BACKEND_PORT=8055
# Frontend: Vite na porta 5174
FRONTEND_PORT=5557

# Log files
LOG_DIR="/var/www/html/projetos-iot/logs"
mkdir -p "$LOG_DIR"

echo "🔧 Iniciando BACKEND em http://localhost:$BACKEND_PORT ..."
cd "$BACKEND_DIR"
nohup php artisan serve --host=0.0.0.0 --port=$BACKEND_PORT > "$LOG_DIR/backend.log" 2>&1 &

sleep 2

echo "🔧 Iniciando FRONTEND em http://10.0.0.183:$FRONTEND_PORT ..."
cd "$FRONTEND_DIR"
nohup npm run dev -- --host 10.0.0.183 --port $FRONTEND_PORT > "$LOG_DIR/frontend.log" 2>&1 &
