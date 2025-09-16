const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { Worker } = require('worker_threads');
const path = require('path');

const app = express();
const PORTA = process.env.PORTA || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Armazenamento em memória (simulando banco de dados)
let produtos = [
  {
    id: uuidv4(),
    nome: 'Notebook Dell',
    descricao: 'Notebook Dell Inspiron 15 3000',
    valor: 2500.00,
    dataCriacao: new Date().toISOString()
  },
  {
    id: uuidv4(),
    nome: 'Mouse Logitech',
    descricao: 'Mouse sem fio Logitech M705',
    valor: 89.90,
    dataCriacao: new Date().toISOString()
  }
];

// Worker thread para processamento paralelo de cálculos
function calcularEstatisticasProdutos() {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'trabalhadores', 'calculos.js'), {
      workerData: { produtos }
    });

    worker.on('message', (resultado) => {
      resolve(resultado);
    });

    worker.on('error', (erro) => {
      reject(erro);
    });

    worker.on('exit', (codigo) => {
      if (codigo !== 0) {
        reject(new Error(`Worker parou com código ${codigo}`));
      }
    });
  });
}

// Rotas

// GET /produtos - Listar todos os produtos
app.get('/produtos', async (req, res) => {
  try {
    // Usar worker thread para calcular estatísticas em paralelo
    const estatisticas = await calcularEstatisticasProdutos();
    
    res.json({
      produtos,
      estatisticas,
      total: produtos.length
    });
  } catch (erro) {
    console.error('Erro ao listar produtos:', erro);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// GET /produtos/:id - Buscar produto por ID
app.get('/produtos/:id', (req, res) => {
  const { id } = req.params;
  const produto = produtos.find(p => p.id === id);
  
  if (!produto) {
    return res.status(404).json({ erro: 'Produto não encontrado' });
  }
  
  res.json(produto);
});

// POST /produtos - Cadastrar novo produto
app.post('/produtos', (req, res) => {
  const { nome, descricao, valor } = req.body;
  
  // Validação básica
  if (!nome || !descricao || !valor) {
    return res.status(400).json({ 
      erro: 'Nome, descrição e valor são obrigatórios' 
    });
  }
  
  if (valor <= 0) {
    return res.status(400).json({ 
      erro: 'Valor deve ser maior que zero' 
    });
  }
  
  const novoProduto = {
    id: uuidv4(),
    nome: nome.trim(),
    descricao: descricao.trim(),
    valor: parseFloat(valor),
    dataCriacao: new Date().toISOString()
  };
  
  produtos.push(novoProduto);
  
  res.status(201).json(novoProduto);
});

// PUT /produtos/:id - Atualizar produto
app.put('/produtos/:id', (req, res) => {
  const { id } = req.params;
  const { nome, descricao, valor } = req.body;
  
  const indiceProduto = produtos.findIndex(p => p.id === id);
  
  if (indiceProduto === -1) {
    return res.status(404).json({ erro: 'Produto não encontrado' });
  }
  
  // Validação básica
  if (!nome || !descricao || !valor) {
    return res.status(400).json({ 
      erro: 'Nome, descrição e valor são obrigatórios' 
    });
  }
  
  if (valor <= 0) {
    return res.status(400).json({ 
      erro: 'Valor deve ser maior que zero' 
    });
  }
  
  produtos[indiceProduto] = {
    ...produtos[indiceProduto],
    nome: nome.trim(),
    descricao: descricao.trim(),
    valor: parseFloat(valor),
    dataAtualizacao: new Date().toISOString()
  };
  
  res.json(produtos[indiceProduto]);
});

// DELETE /produtos/:id - Deletar produto
app.delete('/produtos/:id', (req, res) => {
  const { id } = req.params;
  const indiceProduto = produtos.findIndex(p => p.id === id);
  
  if (indiceProduto === -1) {
    return res.status(404).json({ erro: 'Produto não encontrado' });
  }
  
  produtos.splice(indiceProduto, 1);
  
  res.status(204).send();
});

// Health check
app.get('/saude', (req, res) => {
  res.json({ 
    status: 'OK', 
    servico: 'servico-produtos',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORTA, () => {
  console.log(`🚀 Serviço de Produtos rodando na porta ${PORTA}`);
  console.log(`📊 Health check: http://localhost:${PORTA}/saude`);
  console.log(`📦 API Produtos: http://localhost:${PORTA}/produtos`);
});

module.exports = app;
