FROM php:7.2-fpm

RUN apt-get update && apt-get install -y \
libpq-dev \
libzip-dev \
libxml2-dev \
libpng-dev
RUN docker-php-ext-install pdo \
pdo_pgsql \
zip \
xml \
gd
