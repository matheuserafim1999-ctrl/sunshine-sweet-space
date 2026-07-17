FROM nginx:1.27-alpine

# Nginx config com gzip, cache longo e fallback para /front/
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia apenas os arquivos estáticos do site
COPY public/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1/front/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
