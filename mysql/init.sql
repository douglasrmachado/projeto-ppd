-- Script de inicialização do banco de dados
-- Este arquivo é executado automaticamente quando o container MySQL é criado

USE vendas_db;

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    valor DECIMAL(10,2) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS vendas (
    id VARCHAR(36) PRIMARY KEY,
    cliente_id VARCHAR(36) NOT NULL,
    cliente_nome VARCHAR(255) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'concluida',
    INDEX idx_cliente_id (cliente_id),
    INDEX idx_data_venda (data_venda)
);

-- Tabela de itens de venda
CREATE TABLE IF NOT EXISTS itens_venda (
    id VARCHAR(36) PRIMARY KEY,
    venda_id VARCHAR(36) NOT NULL,
    produto_id VARCHAR(36) NOT NULL,
    quantidade INT NOT NULL,
    valor_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    INDEX idx_venda_id (venda_id),
    INDEX idx_produto_id (produto_id)
);

-- Inserir dados de exemplo
INSERT INTO produtos (id, nome, descricao, valor) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Notebook Dell', 'Notebook Dell Inspiron 15 3000', 2500.00),
('550e8400-e29b-41d4-a716-446655440002', 'Mouse Logitech', 'Mouse sem fio Logitech M705', 89.90),
('550e8400-e29b-41d4-a716-446655440003', 'Teclado Mecânico', 'Teclado mecânico RGB', 299.90),
('550e8400-e29b-41d4-a716-446655440004', 'Monitor 24"', 'Monitor LED 24 polegadas', 599.90);

INSERT INTO clientes (id, nome, telefone) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'João Silva', '(11) 99999-9999'),
('650e8400-e29b-41d4-a716-446655440002', 'Maria Santos', '(11) 88888-8888'),
('650e8400-e29b-41d4-a716-446655440003', 'Pedro Oliveira', '(11) 77777-7777'),
('650e8400-e29b-41d4-a716-446655440004', 'Ana Costa', '(11) 66666-6666');

-- Criar usuário específico para a aplicação (se não existir)
CREATE USER IF NOT EXISTS 'vendas_user'@'%' IDENTIFIED BY 'vendas123';
GRANT ALL PRIVILEGES ON vendas_db.* TO 'vendas_user'@'%';
FLUSH PRIVILEGES;

-- Mostrar tabelas criadas
SHOW TABLES;
