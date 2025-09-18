const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { Worker } = require('worker_threads');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORTA = process.env.PORTA || 3001;

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'vendas_user',
  password: process.env.DB_PASSWORD || 'vendas123',
  database: process.env.DB_NAME || 'vendas_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de conexões MySQL
const pool = mysql.createPool(dbConfig);

// Middleware
app.use(cors());
app.use(express.json());

// Worker thread para processamento paralelo de cálculos
function calcularEstatisticasProdutos(produtos) {
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
    // Buscar produtos do banco
    const [produtos] = await pool.execute(
      'SELECT * FROM produtos ORDER BY data_criacao DESC'
    );
    
    // Converter valores para números
    const produtosFormatados = produtos.map(produto => ({
      ...produto,
      valor: parseFloat(produto.valor)
    }));
    
    // Usar worker thread para calcular estatísticas em paralelo
    const estatisticas = await calcularEstatisticasProdutos(produtosFormatados);
    
    res.json({
      produtos: produtosFormatados,
      estatisticas,
      total: produtosFormatados.length
    });
  } catch (erro) {
    console.error('Erro ao listar produtos:', erro);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// GET /produtos/:id - Buscar produto por ID
app.get('/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [produtos] = await pool.execute(
      'SELECT * FROM produtos WHERE id = ?',
      [id]
    );
    
    if (produtos.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    
    // Converter valor para número
    const produto = {
      ...produtos[0],
      valor: parseFloat(produtos[0].valor)
    };
    
    res.json(produto);
  } catch (erro) {
    console.error('Erro ao buscar produto:', erro);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// POST /produtos - Cadastrar novo produto
app.post('/produtos', async (req, res) => {
  try {
    const { nome, descricao, valor, quantidade = 0, quantidade_minima = 5 } = req.body;
    
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
    
    if (quantidade < 0) {
      return res.status(400).json({ 
        erro: 'Quantidade não pode ser negativa' 
      });
    }
    
    if (quantidade_minima < 0) {
      return res.status(400).json({ 
        erro: 'Quantidade mínima não pode ser negativa' 
      });
    }
    
    const id = uuidv4();
    const [result] = await pool.execute(
      'INSERT INTO produtos (id, nome, descricao, valor, quantidade, quantidade_minima) VALUES (?, ?, ?, ?, ?, ?)',
      [id, nome.trim(), descricao.trim(), parseFloat(valor), parseInt(quantidade), parseInt(quantidade_minima)]
    );
    
    // Buscar o produto criado
    const [produtos] = await pool.execute(
      'SELECT * FROM produtos WHERE id = ?',
      [id]
    );
    
    res.status(201).json(produtos[0]);
  } catch (erro) {
    console.error('Erro ao criar produto:', erro);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// PUT /produtos/:id - Atualizar produto
app.put('/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, valor, quantidade, quantidade_minima } = req.body;
    
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
    
    if (quantidade !== undefined && quantidade < 0) {
      return res.status(400).json({ 
        erro: 'Quantidade não pode ser negativa' 
      });
    }
    
    if (quantidade_minima !== undefined && quantidade_minima < 0) {
      return res.status(400).json({ 
        erro: 'Quantidade mínima não pode ser negativa' 
      });
    }
    
    const [result] = await pool.execute(
      'UPDATE produtos SET nome = ?, descricao = ?, valor = ?, quantidade = ?, quantidade_minima = ? WHERE id = ?',
      [nome.trim(), descricao.trim(), parseFloat(valor), parseInt(quantidade || 0), parseInt(quantidade_minima || 5), id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    
    // Buscar o produto atualizado
    const [produtos] = await pool.execute(
      'SELECT * FROM produtos WHERE id = ?',
      [id]
    );
    
    res.json(produtos[0]);
  } catch (erro) {
    console.error('Erro ao atualizar produto:', erro);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// PUT /produtos/:id/estoque - Atualizar apenas o estoque
app.put('/produtos/:id/estoque', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantidade, quantidade_minima } = req.body;
    
    if (quantidade === undefined && quantidade_minima === undefined) {
      return res.status(400).json({ 
        erro: 'Pelo menos um campo de estoque deve ser fornecido' 
      });
    }
    
    if (quantidade !== undefined && quantidade < 0) {
      return res.status(400).json({ 
        erro: 'Quantidade não pode ser negativa' 
      });
    }
    
    if (quantidade_minima !== undefined && quantidade_minima < 0) {
      return res.status(400).json({ 
        erro: 'Quantidade mínima não pode ser negativa' 
      });
    }
    
    let query = 'UPDATE produtos SET ';
    let params = [];
    
    if (quantidade !== undefined) {
      query += 'quantidade = ?';
      params.push(parseInt(quantidade));
    }
    
    if (quantidade_minima !== undefined) {
      if (quantidade !== undefined) {
        query += ', ';
      }
      query += 'quantidade_minima = ?';
      params.push(parseInt(quantidade_minima));
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    const [result] = await pool.execute(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    
    // Buscar o produto atualizado
    const [produtos] = await pool.execute(
      'SELECT * FROM produtos WHERE id = ?',
      [id]
    );
    
    res.json(produtos[0]);
  } catch (erro) {
    console.error('Erro ao atualizar estoque:', erro);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// GET /produtos/estoque-baixo - Listar produtos com estoque baixo
app.get('/produtos/estoque-baixo', async (req, res) => {
  try {
    const [produtos] = await pool.execute(
      'SELECT * FROM produtos WHERE quantidade <= quantidade_minima ORDER BY quantidade ASC'
    );
    
    // Converter valores para números
    const produtosFormatados = produtos.map(produto => ({
      ...produto,
      valor: parseFloat(produto.valor),
      quantidade: parseInt(produto.quantidade),
      quantidade_minima: parseInt(produto.quantidade_minima)
    }));
    
    res.json({
      produtos: produtosFormatados,
      total: produtosFormatados.length
    });
  } catch (erro) {
    console.error('Erro ao listar produtos com estoque baixo:', erro);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// DELETE /produtos/:id - Deletar produto
app.delete('/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute(
      'DELETE FROM produtos WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    
    res.status(204).send();
  } catch (erro) {
    console.error('Erro ao deletar produto:', erro);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
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
