FROM php:8.3-apache

# 1. Install system dependencies (Added libonig-dev and libpng-dev)
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    ca-certificates \
    libonig-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev

# 2. Configure and install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql zip mbstring exif pcntl bcmath gd

# 3. Enable Apache mod_rewrite for Laravel routing
RUN a2enmod rewrite

# 4. Change Apache Document Root to Laravel's /public folder
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 5. Set working directory
WORKDIR /var/www/html

# 6. Copy Composer from official image
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 7. Copy application files
COPY . .

# 8. Install PHP dependencies (Removed the ignore hack because the extensions are now installed properly!)
RUN composer install --optimize-autoloader --no-dev

# 9. Set permissions for Laravel's storage and cache folders
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
