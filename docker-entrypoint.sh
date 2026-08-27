#!/bin/sh
set -e

# Ensure storage directories exist and are owned by www-data
mkdir -p /var/www/html/storage/epayco
mkdir -p /var/www/html/storage/logs

# Fix permissions on persistent volume
chown -R www-data:www-data /var/www/html/storage
chmod -R 755 /var/www/html/storage

# Execute main CMD
exec "$@"
