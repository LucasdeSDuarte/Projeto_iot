# docker/backend.dockerfile

FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev zip curl \
    && docker-php-ext-install zip pdo pdo_mysql

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY backend /var/www/html

RUN composer install --no-interaction --prefer-dist --optimize-autoloader
RUN php artisan key:generate

EXPOSE 8055

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8055"]
