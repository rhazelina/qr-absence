FROM dunglas/frankenphp:latest-php8.4

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    supervisor \
    sqlite3 \
    libcap2-bin \
    python3 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN install-php-extensions \
    pcntl \
    pdo_mysql \
    pdo_sqlite \
    bcmath \
    gd \
    intl \
    zip \
    opcache \
    redis

# Install Bun
ENV BUN_INSTALL=/usr/local
RUN curl -fsSL https://bun.sh/install | bash

RUN groupadd -g 1000 sail \
    && useradd -m -u 1000 -g sail sail

COPY --chown=sail:sail . /app
WORKDIR /app

# Install dependencies
# RUN composer install --no-dev --optimize-autoloader
# RUN bun install && bun run build

ENTRYPOINT ["php", "artisan", "octane:frankenphp", "--host=0.0.0.0", "--port=8000"]