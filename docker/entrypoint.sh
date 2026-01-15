#!/bin/sh
set -e

# TeamFlow - Docker Entrypoint Script
# This script runs when the container starts

echo "🚀 Starting TeamFlow container..."

# Create required directories
mkdir -p /var/log/php /var/log/xdebug /var/log/supervisor

# Ensure proper permissions for Laravel
echo "📁 Setting up permissions..."
chown -R www-data:www-data /var/www/html/storage
chown -R www-data:www-data /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache

# Wait for MySQL to be ready (if DB_CONNECTION is mysql)
if [ "$DB_CONNECTION" = "mysql" ]; then
    echo "⏳ Waiting for MySQL..."
    while ! nc -z ${DB_HOST:-mysql} ${DB_PORT:-3306}; do
        sleep 1
    done
    echo "✅ MySQL is ready!"
fi

# Wait for Redis to be ready (if REDIS_HOST is set)
if [ -n "$REDIS_HOST" ]; then
    echo "⏳ Waiting for Redis..."
    while ! nc -z ${REDIS_HOST:-redis} ${REDIS_PORT:-6379}; do
        sleep 1
    done
    echo "✅ Redis is ready!"
fi

# Run Laravel setup commands on first boot
if [ ! -f "/var/www/html/storage/docker-initialized" ]; then
    echo "🔧 Running first-time setup..."
    
    # Generate app key if not set
    if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:" ]; then
        echo "🔑 Generating application key..."
        php artisan key:generate --force
    fi
    
    # Run migrations
    echo "📊 Running database migrations..."
    php artisan migrate --force
    
    # Clear and cache config
    echo "🗂️ Optimizing application..."
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear
    
    # Create marker file
    touch /var/www/html/storage/docker-initialized
    
    echo "✅ First-time setup complete!"
fi

# Execute the main command
echo "🎯 Starting supervisord..."
exec "$@"
