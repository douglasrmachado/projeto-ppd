import React, { useState, useEffect } from 'react'
import { servicoProdutos } from '../servicos/api'

function Produtos() {
  const [produtos, setProdutos] = useState([])
  const [estatisticas, setEstatisticas] = useState({})
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState(null)

  const [formulario, setFormulario] = useState({
    nome: '',
    descricao: '',
    valor: '',
    quantidade: '',
    quantidade_minima: ''
  })

  useEffect(() => {
    carregarProdutos()
  }, [])

  const carregarProdutos = async () => {
    try {
      setCarregando(true)
      setErro(null)
      const resposta = await servicoProdutos.listar()
      setProdutos(resposta.data.produtos)
      setEstatisticas(resposta.data.estatisticas)
    } catch (erro) {
      setErro('Erro ao carregar produtos')
      console.error('Erro:', erro)
    } finally {
      setCarregando(false)
    }
  }

  const limparFormulario = () => {
    setFormulario({ nome: '', descricao: '', valor: '', quantidade: '', quantidade_minima: '' })
    setProdutoEditando(null)
    setMostrarFormulario(false)
  }

  const preencherFormulario = (produto) => {
    setFormulario({
      nome: produto.nome,
      descricao: produto.descricao,
      valor: produto.valor.toString(),
      quantidade: produto.quantidade?.toString() || '0',
      quantidade_minima: produto.quantidade_minima?.toString() || '5'
    })
    setProdutoEditando(produto)
    setMostrarFormulario(true)
  }

  const salvarProduto = async (e) => {
    e.preventDefault()
    
    try {
      const dados = {
        nome: formulario.nome,
        descricao: formulario.descricao,
        valor: parseFloat(formulario.valor),
        quantidade: parseInt(formulario.quantidade) || 0,
        quantidade_minima: parseInt(formulario.quantidade_minima) || 5
      }

      if (produtoEditando) {
        await servicoProdutos.atualizar(produtoEditando.id, dados)
      } else {
        await servicoProdutos.criar(dados)
      }

      limparFormulario()
      carregarProdutos()
    } catch (erro) {
      setErro('Erro ao salvar produto')
      console.error('Erro:', erro)
    }
  }

  const deletarProduto = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este produto?')) {
      try {
        await servicoProdutos.deletar(id)
        carregarProdutos()
      } catch (erro) {
        setErro('Erro ao deletar produto')
        console.error('Erro:', erro)
      }
    }
  }

  if (carregando) {
    return (
      <div className="card">
        <div className="loading">Carregando produtos...</div>
      </div>
    )
  }

  return (
    <div>
      {erro && (
        <div className="card">
          <div className="erro">{erro}</div>
          <button className="btn" onClick={carregarProdutos}>
            Tentar Novamente
          </button>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>📦 Produtos</h2>
          <button 
            className="btn" 
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            {mostrarFormulario ? 'Cancelar' : 'Novo Produto'}
          </button>
        </div>

        {mostrarFormulario && (
          <form onSubmit={salvarProduto} style={{ marginBottom: '30px', padding: '20px', background: '#f7fafc', borderRadius: '0px' }}>
            <h3>{produtoEditando ? 'Editar Produto' : 'Novo Produto'}</h3>
            
            <div className="form-group">
              <label>Nome:</label>
              <input
                type="text"
                value={formulario.nome}
                onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Descrição:</label>
              <textarea
                value={formulario.descricao}
                onChange={(e) => setFormulario({ ...formulario, descricao: e.target.value })}
                required
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Valor (R$):</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formulario.valor}
                onChange={(e) => setFormulario({ ...formulario, valor: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Quantidade em Estoque:</label>
              <input
                type="number"
                min="0"
                value={formulario.quantidade}
                onChange={(e) => setFormulario({ ...formulario, quantidade: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Quantidade Mínima:</label>
              <input
                type="number"
                min="0"
                value={formulario.quantidade_minima}
                onChange={(e) => setFormulario({ ...formulario, quantidade_minima: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn">
              {produtoEditando ? 'Atualizar' : 'Salvar'}
            </button>
            <button type="button" className="btn btn-secundario" onClick={limparFormulario}>
              Cancelar
            </button>
          </form>
        )}

        {estatisticas && Object.keys(estatisticas).length > 0 && (
          <div className="estatisticas">
            <div className="estatistica-card">
              <h3>{estatisticas.totalProdutos || 0}</h3>
              <p>Total de Produtos</p>
            </div>
            <div className="estatistica-card">
              <h3>R$ {estatisticas.valorTotal?.toFixed(2) || '0,00'}</h3>
              <p>Valor Total</p>
            </div>
            <div className="estatistica-card">
              <h3>R$ {estatisticas.valorMedio?.toFixed(2) || '0,00'}</h3>
              <p>Valor Médio</p>
            </div>
            <div className="estatistica-card">
              <h3>R$ {estatisticas.valorMaximo?.toFixed(2) || '0,00'}</h3>
              <p>Valor Máximo</p>
            </div>
          </div>
        )}

        <table className="tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Estoque</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto) => {
              const estoqueBaixo = produto.quantidade <= produto.quantidade_minima;
              return (
                <tr key={produto.id} className={estoqueBaixo ? 'estoque-baixo' : ''}>
                  <td>{produto.nome}</td>
                  <td>{produto.descricao}</td>
                  <td>R$ {produto.valor.toFixed(2)}</td>
                  <td>
                    <span className={estoqueBaixo ? 'texto-aviso' : ''}>
                      {produto.quantidade || 0}
                    </span>
                  </td>
                  <td>
                    {estoqueBaixo ? (
                      <span className="status-aviso">⚠️ Estoque Baixo</span>
                    ) : (
                      <span className="status-ok">✅ OK</span>
                    )}
                  </td>
                  <td>
                    <button 
                      className="btn btn-secundario" 
                      onClick={() => preencherFormulario(produto)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn btn-perigo" 
                      onClick={() => deletarProduto(produto.id)}
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {produtos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
            Nenhum produto cadastrado
          </div>
        )}
      </div>
    </div>
  )
}

export default Produtos
