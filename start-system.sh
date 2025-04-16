#!/bin/bash

set -e

echo "🚀 Subindo containers com Docker Compose..."

# Caminho para o diretório do projeto (ajuste se necessário)
PROJECT_DIR="/var/www/html/projetos-iot"

cd "$PROJECT_DIR"

# Subir o ambiente
docker-compose up --build

echo "🚀 Ambiente subido com sucesso!"