# Usar Go oficial como base
FROM golang:1.21-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar go.mod e go.sum
COPY go.mod go.sum ./

# Baixar dependências
RUN go mod download

# Copiar código fonte
COPY . .

# Compilar aplicação
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Estágio final - imagem mínima
FROM alpine:latest

# Instalar ca-certificates para HTTPS
RUN apk --no-cache add ca-certificates

# Criar usuário não-root
RUN adduser -D -s /bin/sh usuario

# Definir diretório de trabalho
WORKDIR /app

# Copiar binário compilado
COPY --from=builder /app/main .

# Mudar propriedade para o usuário
RUN chown usuario:usuario /app/main

# Mudar para usuário não-root
USER usuario

# Expor porta
EXPOSE 3003

# Comando para iniciar a aplicação
CMD ["./main"]
