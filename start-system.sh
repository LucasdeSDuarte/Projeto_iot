#!/bin/bash

# Ativa modo estrito para segurança
set -e

# Caminhos
BACKEND_DIR="/var/www/html/projetos-iot/backend"
FRONTEND_DIR="/var/www/html/projetos-iot/frontend"

# Porta do backend
BACKEND_PORT=8055
# Porta do frontend
FRONTEND_PORT=5555

echo "🚀 Iniciando Backend na porta $BACKEND_PORT..."

# Rodar Laravel com artisan (porta 8055)
cd "$BACKEND_DIR"
php artisan serve --host=0.0.0.0 --port=$BACKEND_PORT &

sleep 2

echo "🚀 Iniciando Frontend (npm run dev) na porta $FRONTEND_PORT..."

cd "$FRONTEND_DIR"
npm run dev -- --port $FRONTEND_PORT

