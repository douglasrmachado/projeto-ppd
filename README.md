# Controle de Vendas com Microserviços

Este projeto implementa uma aplicação distribuída para controle de vendas de produtos, composta por 4 microserviços desenvolvidos com diferentes tecnologias.

## Arquitetura

- **Serviço de Produtos**: Node.js + Express (Porta 3001)
- **Serviço de Clientes**: Python + Flask (Porta 3002)  
- **Serviço de Vendas**: Go + Gin (Porta 3003)
- **Frontend**: React + Vite (Porta 3000)

## Tecnologias Utilizadas

- Docker e Docker Compose para orquestração
- Comunicação entre serviços via APIs REST HTTP
- Programação paralela com worker threads (Node.js)
- Multithreading (Python)
- Goroutines (Go)

## Como Executar

1. Clone o repositório
2. Execute o comando: `docker-compose up --build`
3. Acesse o frontend em: http://localhost:3000

## Funcionalidades

### Produtos
- Cadastro de produtos (nome, descrição, valor)
- Listagem de produtos
- Cálculos estatísticos com worker threads

### Clientes  
- Cadastro de clientes (nome, telefone)
- Listagem de clientes

### Vendas
- Realização de vendas para clientes
- Listagem de vendas

### Frontend
- Interface web para interagir com todos os serviços

## Conceitos de Programação Distribuída

- **Worker Threads**: Processamento paralelo de cálculos estatísticos
- **Multithreading**: Processamento concorrente em Python
- **Goroutines**: Programação concorrente em Go
- **APIs REST**: Comunicação entre microserviços
- **Docker**: Containerização e orquestração
