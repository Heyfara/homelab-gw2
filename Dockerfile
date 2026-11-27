# syntax=docker/dockerfile:1

# --- Base PHP-FPM commune au dev et à la prod -------------------------------
# pdo_sqlite et sodium sont compilés dans l'image officielle.
FROM php:8.5.11-fpm-alpine AS php-base

RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && pecl install apcu \
    && docker-php-ext-enable apcu \
    && apk del .build-deps

COPY --from=composer:2.10.3 /usr/bin/composer /usr/bin/composer
COPY docker/php/app.ini $PHP_INI_DIR/conf.d/zz-app.ini

WORKDIR /app

# --- Dev : le code est monté depuis l'hôte (compose.yaml) --------------------
FROM php-base AS dev
RUN mv "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini"

# --- Front : compilé par Vite dans public/build -------------------------------
FROM node:24.16.0-alpine AS front
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund
COPY tsconfig.json vite.config.ts ./
COPY assets assets
RUN npm run build

# --- Prod : image publiée sur GHCR -------------------------------------------
# Ne contient que du code et les données publiques (data/) : profils, secrets
# et base SQLite viennent de l'environnement et d'un volume monté.
FROM php-base AS prod
ENV APP_ENV=prod APP_DEBUG=0
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
COPY docker/php/prod.ini $PHP_INI_DIR/conf.d/zz-prod.ini

COPY composer.json composer.lock symfony.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-progress

COPY .env ./
COPY bin bin
COPY config config
COPY data data
COPY public/index.php public/index.php
COPY src src
RUN composer dump-autoload --no-dev --classmap-authoritative \
    && composer dump-env prod \
    && bin/console cache:warmup \
    && chown -R www-data:www-data var

COPY --from=front /app/public/build public/build
COPY docker/php/entrypoint.sh /usr/local/bin/gw2-entrypoint

ENTRYPOINT ["gw2-entrypoint"]
CMD ["php-fpm"]
