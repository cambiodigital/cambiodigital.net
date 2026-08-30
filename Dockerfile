# ==============================================================================
# STAGE 1: Build Frontend Assets (Tailwind CSS)
# ==============================================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:css

# ==============================================================================
# STAGE 2: Production PHP + Apache Web Server
# ==============================================================================
FROM php:8.2-apache AS runner

# Install system dependencies & SQLite extension
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsqlite3-dev \
    sqlite3 \
    curl \
    && docker-php-ext-install pdo_sqlite \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Configure Apache virtual host with AllowOverride All
RUN { \
    echo '<VirtualHost *:80>'; \
    echo '    ServerAdmin webmaster@cambiodigital.net'; \
    echo '    DocumentRoot /var/www/html'; \
    echo '    <Directory /var/www/html>'; \
    echo '        Options -Indexes +FollowSymLinks'; \
    echo '        AllowOverride All'; \
    echo '        Require all granted'; \
    echo '    </Directory>'; \
    echo '    ErrorLog ${APACHE_LOG_DIR}/error.log'; \
    echo '    CustomLog ${APACHE_LOG_DIR}/access.log combined'; \
    echo '</VirtualHost>'; \
} > /etc/apache2/sites-available/000-default.conf

# Set working directory
WORKDIR /var/www/html

# Copy application source code
COPY --from=frontend-builder /app /var/www/html

# Remove build-time Node dependencies (not needed at runtime)
RUN rm -rf /var/www/html/node_modules

# Copy and setup entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create storage directories and set ownership to www-data (UID 33)
RUN mkdir -p /var/www/html/storage/epayco /var/www/html/storage/logs \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage

# Expose HTTP port
EXPOSE 80

# Set entrypoint and default command
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["apache2-foreground"]
