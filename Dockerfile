FROM php:8.2-apache

# Extensões necessárias para o cloaker (curl, mbstring, openssl, json, filter já vêm no core do PHP 8.2)
# curl e mbstring precisam ser instaladas
RUN apt-get update && apt-get install -y --no-install-recommends \
        libcurl4-openssl-dev \
        libonig-dev \
        libzip-dev \
    && docker-php-ext-install -j$(nproc) curl mbstring \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Habilita mod_rewrite, mod_headers, mod_deflate, mod_expires
RUN a2enmod rewrite headers deflate expires

# allow_url_fopen já vem habilitado por padrão, mas garantimos:
RUN echo "allow_url_fopen=On" > /usr/local/etc/php/conf.d/cloaker.ini \
    && echo "expose_php=Off" >> /usr/local/etc/php/conf.d/cloaker.ini

# Evita warning de ServerName e deixa Apache priorizando PHP sem fallback antigo
RUN echo 'ServerName localhost' > /etc/apache2/conf-available/servername.conf \
    && a2enconf servername

# DirectoryIndex: prioriza index.php (cloaker)
RUN echo '<Directory /var/www/html>\n\
    Options -Indexes -MultiViews +FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
    AcceptPathInfo Off\n\
    DirectoryIndex index.php index.html\n\
</Directory>' > /etc/apache2/conf-available/app.conf \
    && a2enconf app

# Copia os arquivos estáticos + cloaker
COPY public/ /var/www/html/

# Permissões
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1/healthz.txt >/dev/null || exit 1

CMD ["apache2-foreground"]
