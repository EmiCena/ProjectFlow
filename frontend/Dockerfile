FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Railway injects VITE_API_URL at build time
ARG VITE_API_URL=https://projectflow-api-production.up.railway.app/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# SPA fallback - Railway uses $PORT
RUN echo 'server { listen 8080; root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD sh -c "sed -i \"s/8080/\${PORT:-8080}/g\" /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
