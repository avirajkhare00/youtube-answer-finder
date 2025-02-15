# Build frontend
FROM node:18-alpine as frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Build backend
FROM node:18-alpine
WORKDIR /app

# Copy backend files
COPY backend/package*.json ./
RUN npm install
COPY backend/ .

# Copy frontend build
COPY --from=frontend-builder /frontend/build ./public

EXPOSE 3001

CMD ["npm", "start"]
