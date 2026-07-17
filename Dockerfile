FROM nginx:alpine

# Nginx config com gzip, cache longo e fallback para /front/
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia apenas os arquivos estáticos do site
COPY public/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ >/dev/null || exit 1
