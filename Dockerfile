# 1. aşama: testleri çalıştır. Testlerden biri bile kırılırsa imaj oluşmaz.
FROM node:22-alpine AS test
WORKDIR /app
COPY package.json menu.json ./
COPY js ./js
COPY tests ./tests
RUN npm test

# 2. aşama: uygulamayı nginx ile sun. Node ve test dosyaları son imaja girmez.
FROM nginx:1.27-alpine
COPY index.html style.css menu.json /usr/share/nginx/html/
COPY --from=test /app/js /usr/share/nginx/html/js
EXPOSE 80
