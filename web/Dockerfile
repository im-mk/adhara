# build
FROM node:lts-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Test stage
FROM build AS test
WORKDIR /app
RUN npm run test

# production
FROM nginx:stable-alpine AS production
WORKDIR /usr/share/nginx/html

RUN apk add --no-cache curl
COPY --from=build /app/dist ./
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
