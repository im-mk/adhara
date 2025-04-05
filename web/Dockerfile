# build
FROM node:22-alpine AS build
WORKDIR /app
COPY ./web/package*.json ./
RUN npm install

COPY ./web .
RUN npm run build

# production
FROM nginx:stable-alpine AS production
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]