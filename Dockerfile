# TeamFlow - Dockerfile
# Multi-stage build for Laravel + React application

# ------------------------------------------------------------------------------
# Stage 1: Base Image (Runtime Dependencies)
# ------------------------------------------------------------------------------
FROM php:8.4-fpm-alpine AS base

# Install system dependencies required for production runtime
RUN apk add --no-cache \
    curl \
    libpng \
    libjpeg-turbo \
    freetype \
    libzip \
    zip \
    unzip \
    icu-libs \
    oniguruma \
    sqlite-libs \
    libpq \
    supervisor \
    nginx \
    bash

# Install PHP extensions
RUN apk add --no-cache --virtual .build-deps \
    linux-headers \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    sqlite-dev \
    postgresql-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_sqlite \
    pdo_pgsql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    intl \
    opcache \
    && apk del .build-deps

# Configure PHP
COPY docker/php/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf

# Configure Nginx
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf

# Configure Supervisor
COPY docker/supervisord.conf /etc/supervisord.conf

# Set working directory
WORKDIR /var/www/html

# ------------------------------------------------------------------------------
# Stage 2: Backend Dependencies (Composer)
# ------------------------------------------------------------------------------
FROM composer:latest AS deps-backend

WORKDIR /var/www/html

COPY composer.json composer.lock ./

# Install production dependencies only
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --ignore-platform-reqs

# ------------------------------------------------------------------------------
# Stage 3: Frontend Build (Node.js)
# ------------------------------------------------------------------------------
FROM base AS build-frontend

# Install Node.js and npm
RUN apk add --no-cache nodejs npm git

# Install pnpm
RUN npm install -g pnpm

# Install Composer (needed for some build scripts that might rely on artisan)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy backend files first (Composer dependencies might be needed for artisan commands)
COPY composer.json composer.lock ./
# Install ALL composer dependencies (dev included) so artisan commands work
RUN composer install --no-scripts --no-autoloader --prefer-dist

# Copy frontend dependency files
COPY package.json pnpm-lock.yaml ./

# Install frontend dependencies
RUN pnpm install --frozen-lockfile

# Copy application files
COPY . .

# Generate autoloader so artisan works
RUN composer dump-autoload --optimize

# Build frontend assets
RUN pnpm run build

# ------------------------------------------------------------------------------
# Stage 4: Production Image
# ------------------------------------------------------------------------------
FROM base AS production

WORKDIR /var/www/html

# Copy Composer dependencies from deps-backend
COPY --from=deps-backend /var/www/html/vendor ./vendor

# Copy application files (excluding those covered by .dockerignore)
COPY . .

# Copy built frontend assets from build-frontend
COPY --from=build-frontend /var/www/html/public/build ./public/build

# Generate optimized autoloader for production
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer dump-autoload --optimize --no-dev --classmap-authoritative \
    && rm /usr/bin/composer

# Create necessary directories and set permissions
RUN mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 775 storage bootstrap/cache

# Copy Entrypoint
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]

# ------------------------------------------------------------------------------
# Stage 5: Development Image
# ------------------------------------------------------------------------------
FROM base AS development

# Install development tools
RUN apk add --no-cache \
    git \
    nodejs \
    npm

# Install pnpm
RUN npm install -g pnpm

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]

