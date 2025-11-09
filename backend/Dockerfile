# ==========================
# 🐹 Dockerfile cho Go WebSocket Chat Server
# ==========================

# Sử dụng Go image chính thức
FROM golang:1.22-alpine AS builder

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy file go.mod và go.sum trước để cài dependency
COPY go.mod go.sum ./
RUN go mod download

# Copy toàn bộ mã nguồn vào container
COPY . .

# Build binary (tên file: main)
RUN go build -o main .

# ==========================
# Stage 2: Chạy server
# ==========================
FROM alpine:latest

# Tạo thư mục /app và copy binary từ stage trước
WORKDIR /app
COPY --from=builder /app/main .

# Cổng server Go chạy (8080)
EXPOSE 8080

# Chạy server
CMD ["./main"]
