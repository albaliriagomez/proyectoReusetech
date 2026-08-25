# Build stage
FROM node:20.17.0-alpine AS build

WORKDIR /app

ENV TZ=America/La_Paz
RUN apk add --no-cache tzdata

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine AS production

ENV TZ=America/La_Paz
RUN apk add --no-cache tzdata

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
