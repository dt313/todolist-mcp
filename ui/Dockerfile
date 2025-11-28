# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package.json & package-lock.json
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

# Build Next.js
RUN npm run build

# Stage 2: Production image
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3333

# Copy từ builder
COPY --from=builder /app ./

EXPOSE 3333

# Start server
CMD ["npm", "start"]
