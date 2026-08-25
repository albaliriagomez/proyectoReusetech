# Build stage
FROM node:20.17.0-alpine AS builder

WORKDIR /app

ENV TZ=America/La_Paz
RUN apk add --no-cache tzdata

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Production stage
FROM node:20.17.0-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV TZ=America/La_Paz
RUN apk add --no-cache tzdata

COPY package*.json ./
RUN npm install --legacy-peer-deps --omit=dev

COPY --from=builder /app ./

RUN mkdir -p /app/uploads && chmod -R 777 /app/uploads

EXPOSE 3001

CMD ["npm", "start"]
