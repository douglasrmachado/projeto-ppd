# 🏗️ Sistema de Vendas com Microserviços

## 📋 Visão Geral

Este projeto implementa uma aplicação distribuída para controle de vendas utilizando **microserviços** desenvolvidos com diferentes tecnologias, demonstrando conceitos de **programação distribuída** e **arquitetura de sistemas**.

## 🏛️ Arquitetura do Sistema

### 🐳 **Docker como Orquestrador**

O **Docker Compose** atua como o "maestro" que:
- **Cria e gerencia** todos os containers automaticamente
- **Configura a rede** entre os serviços
- **Mapeia portas** para acesso externo
- **Gerencia volumes** para persistência de dados
- **Controla dependências** entre serviços

### 🔧 **Como o Docker Resolve Tudo**

**Sem Docker (tradicional):**
```
❌ Instalar MySQL no Windows
❌ Instalar Node.js + dependências
❌ Instalar Python + dependências  
❌ Instalar Go + dependências
❌ Configurar cada serviço manualmente
❌ Gerenciar portas e conexões
```

**Com Docker:**
```
✅ docker-compose up --build
✅ Tudo funciona automaticamente!
```

## 🏗️ Estrutura dos Microserviços

### 📦 **1. Serviço de Produtos (Node.js + Express)**
- **Porta:** 3001
- **Tecnologia:** Node.js + Express + MySQL
- **Funcionalidades:** CRUD de produtos, estatísticas com Worker Threads
- **Banco:** Tabela `produtos` no MySQL
- **Programação Paralela:** Worker Threads para cálculos estatísticos

### 👥 **2. Serviço de Clientes (Python + Flask)**
- **Porta:** 3002
- **Tecnologia:** Python + Flask + MySQL
- **Funcionalidades:** CRUD de clientes, processamento paralelo
- **Banco:** Tabela `clientes` no MySQL
- **Programação Paralela:** Multithreading com ThreadPoolExecutor

### 💰 **3. Serviço de Vendas (Go + Gin)**
- **Porta:** 3003
- **Tecnologia:** Go + Gin Framework
- **Funcionalidades:** CRUD de vendas, comunicação entre serviços
- **Armazenamento:** Memória (não persistente)
- **Programação Paralela:** Goroutines para processamento concorrente

### 🌐 **4. Frontend (React + Vite)**
- **Porta:** 3000
- **Tecnologia:** React + Vite + Nginx
- **Funcionalidades:** Interface web para todos os serviços
- **Servidor:** Nginx servindo arquivos estáticos

### 🗄️ **5. Banco de Dados (MySQL)**
- **Porta:** 3307 (mapeada de 3306)
- **Tecnologia:** MySQL 8.0
- **Persistência:** Volume Docker (`mysql_data`)
- **Inicialização:** Script `mysql/init.sql`

## 🔄 Comunicação Entre Serviços

### 🌐 **Rede Docker**
```
┌─────────────────────────────────────────┐
│           Rede: rede-vendas             │
│                                         │
│  ┌─────────────┐  ┌─────────────────┐  │
│  │   Frontend  │  │   MySQL:3306    │  │
│  │   :3000     │  │                 │  │
│  └─────────────┘  └─────────────────┘  │
│           │              │             │
│  ┌─────────────┐  ┌─────────────────┐  │
│  │ Produtos    │  │   Clientes      │  │
│  │ :3001       │  │   :3002         │  │
│  └─────────────┘  └─────────────────┘  │
│           │              │             │
│  ┌─────────────────────────────────────┐ │
│  │         Vendas :3003                │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 🔗 **Comunicação HTTP**
- **Frontend → Backend:** HTTP REST APIs
- **Vendas → Clientes:** `http://servico-clientes:3002/clientes/{id}`
- **Vendas → Produtos:** `http://servico-produtos:3001/produtos/{id}`
- **Todos → MySQL:** `mysql:3306`

## 🗄️ Estrutura do Banco de Dados

### 📊 **Schema: `vendas_db`**

```sql
-- Tabela de produtos
CREATE TABLE produtos (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    valor DECIMAL(10,2) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de clientes  
CREATE TABLE clientes (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de vendas
CREATE TABLE vendas (
    id VARCHAR(36) PRIMARY KEY,
    cliente_id VARCHAR(36) NOT NULL,
    cliente_nome VARCHAR(255) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'concluida'
);

-- Tabela de itens de venda
CREATE TABLE itens_venda (
    id VARCHAR(36) PRIMARY KEY,
    venda_id VARCHAR(36) NOT NULL,
    produto_id VARCHAR(36) NOT NULL,
    quantidade INT NOT NULL,
    valor_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);
```

### 🔐 **Credenciais de Acesso**
- **Host:** `localhost:3307`
- **Usuário:** `vendas_user`
- **Senha:** `vendas123`
- **Banco:** `vendas_db`

## ⚡ Programação Paralela e Concorrente

### 🧵 **Worker Threads (Node.js)**
```javascript
// Processamento paralelo de cálculos estatísticos
const worker = new Worker(path.join(__dirname, 'trabalhadores', 'calculos.js'), {
  workerData: { produtos }
});
```

### 🐍 **Multithreading (Python)**
```python
# Processamento paralelo com ThreadPoolExecutor
with ThreadPoolExecutor(max_workers=3) as executor:
    futuro_estatisticas = executor.submit(calcular_estatisticas)
    futuro_validacao = executor.submit(validar_telefones)
    futuro_relatorio = executor.submit(gerar_relatorio)
```

### 🚀 **Goroutines (Go)**
```go
// Processamento concorrente com Goroutines
go func() {
    cliente, err := buscarCliente(dadosVenda.ClienteID)
    clienteChan <- cliente
}()
```

## 🚀 Como Executar

### 📋 **Pré-requisitos**
- Docker Desktop instalado
- Docker Compose disponível

### ⚡ **Execução Rápida**
```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd projeto-ppd

# Executar tudo
docker-compose up --build

# Acessar a aplicação
# Frontend: http://localhost:3000
# API Produtos: http://localhost:3001
# API Clientes: http://localhost:3002
# API Vendas: http://localhost:3003
# MySQL: localhost:3307
```

### 🔧 **Comandos Úteis**
```bash
# Ver status dos containers
docker-compose ps

# Ver logs de um serviço
docker-compose logs frontend

# Parar todos os serviços
docker-compose down

# Reconstruir um serviço específico
docker-compose build --no-cache frontend

# Executar comandos no MySQL
docker exec mysql-vendas mysql -u vendas_user -pvendas123 vendas_db -e "SELECT * FROM produtos;"
```

## 🧪 Testando a Aplicação

### 🌐 **Via Interface Web**
1. Acesse http://localhost:3000
2. Navegue pelas abas: Dashboard, Produtos, Clientes, Vendas
3. Crie novos registros e veja a persistência

### 🔧 **Via APIs**
```bash
# Testar produtos
curl http://localhost:3001/produtos

# Criar produto
curl -X POST http://localhost:3001/produtos \
  -H "Content-Type: application/json" \
  -d '{"nome": "Produto Teste", "descricao": "Descrição", "valor": 99.99}'

# Testar clientes
curl http://localhost:3002/clientes

# Testar vendas
curl http://localhost:3003/vendas
```

### 🗄️ **Via MySQL Workbench**
- **Host:** localhost
- **Port:** 3307
- **User:** vendas_user
- **Password:** vendas123
- **Database:** vendas_db

## 📊 Monitoramento e Logs

### 📝 **Ver Logs em Tempo Real**
```bash
# Todos os serviços
docker-compose logs -f

# Serviço específico
docker-compose logs -f servico-produtos
```

### 🔍 **Verificar Saúde dos Serviços**
```bash
curl http://localhost:3001/saude  # Produtos
curl http://localhost:3002/saude  # Clientes  
curl http://localhost:3003/saude   # Vendas
```

## 🏗️ Conceitos Demonstrados

### 🔄 **Microserviços**
- **Separação de responsabilidades** por domínio
- **Comunicação via APIs REST**
- **Deploy independente** de cada serviço
- **Tolerância a falhas** isolada

### ⚡ **Programação Distribuída**
- **Worker Threads** para CPU intensivo
- **Multithreading** para I/O paralelo
- **Goroutines** para concorrência
- **Processamento assíncrono**

### 🐳 **Containerização**
- **Isolamento** de dependências
- **Portabilidade** entre ambientes
- **Escalabilidade** horizontal
- **Orquestração** automatizada

### 🗄️ **Persistência de Dados**
- **Banco relacional** para dados estruturados
- **Volumes Docker** para persistência
- **Transações** e integridade referencial
- **Backup** e recuperação

## 🎯 Benefícios da Arquitetura

### ✅ **Vantagens**
- **Escalabilidade:** Cada serviço pode escalar independentemente
- **Manutenibilidade:** Código organizado por domínio
- **Tecnologia:** Cada serviço usa a melhor tecnologia para seu caso
- **Resiliência:** Falha em um serviço não afeta os outros
- **Desenvolvimento:** Equipes podem trabalhar independentemente

### ⚠️ **Desafios**
- **Complexidade:** Mais serviços = mais complexidade operacional
- **Rede:** Comunicação entre serviços pode falhar
- **Consistência:** Dados distribuídos são mais complexos
- **Debugging:** Mais difícil rastrear problemas entre serviços

## 🔮 Próximos Passos

### 🚀 **Melhorias Possíveis**
- **API Gateway** para roteamento centralizado
- **Service Discovery** para localização automática
- **Message Queue** para comunicação assíncrona
- **Monitoring** com Prometheus/Grafana
- **Logs centralizados** com ELK Stack
- **CI/CD** com GitHub Actions
- **Kubernetes** para orquestração avançada

---

## 📚 Tecnologias Utilizadas

| Serviço | Tecnologia | Versão | Finalidade |
|---------|------------|--------|------------|
| Frontend | React + Vite | 18.2.0 | Interface web |
| Produtos | Node.js + Express | 18 | API REST + Worker Threads |
| Clientes | Python + Flask | 3.11 | API REST + Multithreading |
| Vendas | Go + Gin | 1.21 | API REST + Goroutines |
| Banco | MySQL | 8.0 | Persistência de dados |
| Proxy | Nginx | Alpine | Servidor web |
| Orquestração | Docker Compose | Latest | Containerização |

---

**🎉 Este projeto demonstra uma arquitetura moderna de microserviços com diferentes tecnologias trabalhando em harmonia!**