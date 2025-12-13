FROM node:lts-slim AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

FROM base AS test
RUN npm run test

FROM base AS build
RUN npm run build

FROM nginx:stable-alpine AS production
WORKDIR /usr/share/nginx/html

RUN apk add --no-cache curl
COPY --from=build /app/dist ./
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
