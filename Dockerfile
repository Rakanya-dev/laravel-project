FROM php:8.3-apache

# 1. Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    ca-certificates \
    && docker-php-ext-install pdo_mysql zip

RUN docker-php-ext-install pdo_mysql zip mbstring exif pcntl bcmath gd

# 2. Enable Apache mod_rewrite for Laravel routing
RUN a2enmod rewrite

# 3. Change Apache Document Root to Laravel's /public folder
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 4. Set working directory
WORKDIR /var/www/html

# 5. Copy Composer from official image
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 6. Copy application files
COPY . .

# 7. Install PHP dependencies
RUN composer install --optimize-autoloader --no-dev --ignore-platform-reqs

# 8. Set permissions for Laravel's storage and cache folders
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
