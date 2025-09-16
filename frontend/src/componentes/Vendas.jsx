import React, { useState, useEffect } from 'react'
import { servicoVendas, servicoClientes, servicoProdutos } from '../servicos/api'

function Vendas() {
  const [vendas, setVendas] = useState([])
  const [estatisticas, setEstatisticas] = useState({})
  const [clientes, setClientes] = useState([])
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const [formulario, setFormulario] = useState({
    cliente_id: '',
    itens: [{ produto_id: '', quantidade: 1 }]
  })

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setCarregando(true)
      setErro(null)
      
      // Carregar dados em paralelo usando Promise.allSettled
      const [dadosVendas, dadosClientes, dadosProdutos] = await Promise.allSettled([
        servicoVendas.listar(),
        servicoClientes.listar(),
        servicoProdutos.listar()
      ])

      if (dadosVendas.status === 'fulfilled') {
        setVendas(dadosVendas.value.data.vendas)
        setEstatisticas(dadosVendas.value.data.estatisticas)
      }

      if (dadosClientes.status === 'fulfilled') {
        setClientes(dadosClientes.value.data.clientes)
      }

      if (dadosProdutos.status === 'fulfilled') {
        setProdutos(dadosProdutos.value.data.produtos)
      }

    } catch (erro) {
      setErro('Erro ao carregar dados')
      console.error('Erro:', erro)
    } finally {
      setCarregando(false)
    }
  }

  const adicionarItem = () => {
    setFormulario({
      ...formulario,
      itens: [...formulario.itens, { produto_id: '', quantidade: 1 }]
    })
  }

  const removerItem = (index) => {
    if (formulario.itens.length > 1) {
      const novosItens = formulario.itens.filter((_, i) => i !== index)
      setFormulario({ ...formulario, itens: novosItens })
    }
  }

  const atualizarItem = (index, campo, valor) => {
    const novosItens = [...formulario.itens]
    novosItens[index][campo] = valor
    setFormulario({ ...formulario, itens: novosItens })
  }

  const calcularTotal = () => {
    return formulario.itens.reduce((total, item) => {
      const produto = produtos.find(p => p.id === item.produto_id)
      return total + (produto ? produto.valor * item.quantidade : 0)
    }, 0)
  }

  const criarVenda = async (e) => {
    e.preventDefault()
    
    try {
      const dados = {
        cliente_id: formulario.cliente_id,
        itens: formulario.itens.map(item => ({
          produto_id: item.produto_id,
          quantidade: parseInt(item.quantidade)
        }))
      }

      await servicoVendas.criar(dados)
      
      // Limpar formulário
      setFormulario({
        cliente_id: '',
        itens: [{ produto_id: '', quantidade: 1 }]
      })
      setMostrarFormulario(false)
      
      carregarDados()
    } catch (erro) {
      setErro('Erro ao criar venda')
      console.error('Erro:', erro)
    }
  }

  if (carregando) {
    return (
      <div className="card">
        <div className="loading">Carregando vendas...</div>
      </div>
    )
  }

  return (
    <div>
      {erro && (
        <div className="card">
          <div className="erro">{erro}</div>
          <button className="btn" onClick={carregarDados}>
            Tentar Novamente
          </button>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>💰 Vendas</h2>
          <button 
            className="btn" 
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            {mostrarFormulario ? 'Cancelar' : 'Nova Venda'}
          </button>
        </div>

        {mostrarFormulario && (
          <form onSubmit={criarVenda} style={{ marginBottom: '30px', padding: '20px', background: '#f7fafc', borderRadius: '10px' }}>
            <h3>Nova Venda</h3>
            
            <div className="form-group">
              <label>Cliente:</label>
              <select
                value={formulario.cliente_id}
                onChange={(e) => setFormulario({ ...formulario, cliente_id: e.target.value })}
                required
              >
                <option value="">Selecione um cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome} - {cliente.telefone}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Itens da Venda:</label>
              {formulario.itens.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                  <select
                    value={item.produto_id}
                    onChange={(e) => atualizarItem(index, 'produto_id', e.target.value)}
                    required
                    style={{ flex: 1 }}
                  >
                    <option value="">Selecione um produto</option>
                    {produtos.map(produto => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome} - R$ {produto.valor.toFixed(2)}
                      </option>
                    ))}
                  </select>
                  
                  <input
                    type="number"
                    min="1"
                    value={item.quantidade}
                    onChange={(e) => atualizarItem(index, 'quantidade', e.target.value)}
                    style={{ width: '80px' }}
                    required
                  />
                  
                  <button 
                    type="button" 
                    className="btn btn-perigo" 
                    onClick={() => removerItem(index)}
                    disabled={formulario.itens.length === 1}
                  >
                    Remover
                  </button>
                </div>
              ))}
              
              <button type="button" className="btn btn-secundario" onClick={adicionarItem}>
                Adicionar Item
              </button>
            </div>

            <div style={{ padding: '15px', background: '#e6fffa', borderRadius: '8px', marginBottom: '20px' }}>
              <strong>Total: R$ {calcularTotal().toFixed(2)}</strong>
            </div>

            <button type="submit" className="btn" disabled={!formulario.cliente_id || formulario.itens.some(item => !item.produto_id)}>
              Criar Venda
            </button>
            <button type="button" className="btn btn-secundario" onClick={() => setMostrarFormulario(false)}>
              Cancelar
            </button>
          </form>
        )}

        {estatisticas && Object.keys(estatisticas).length > 0 && (
          <div className="estatisticas">
            <div className="estatistica-card">
              <h3>{estatisticas.totalVendas || 0}</h3>
              <p>Total de Vendas</p>
            </div>
            <div className="estatistica-card">
              <h3>R$ {estatisticas.valorTotalVendas?.toFixed(2) || '0,00'}</h3>
              <p>Faturamento Total</p>
            </div>
            <div className="estatistica-card">
              <h3>R$ {estatisticas.valorMedioVenda?.toFixed(2) || '0,00'}</h3>
              <p>Ticket Médio</p>
            </div>
            <div className="estatistica-card">
              <h3>🚀</h3>
              <p>Goroutines</p>
            </div>
          </div>
        )}

        <table className="tabela">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Itens</th>
              <th>Valor Total</th>
              <th>Data</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {vendas.map((venda) => (
              <tr key={venda.id}>
                <td>{venda.cliente_nome}</td>
                <td>
                  {venda.itens.map((item, index) => (
                    <div key={index} style={{ fontSize: '0.9em' }}>
                      {item.quantidade}x - R$ {item.valor_unitario.toFixed(2)}
                    </div>
                  ))}
                </td>
                <td>R$ {venda.valor_total.toFixed(2)}</td>
                <td>{new Date(venda.data_venda).toLocaleDateString('pt-BR')}</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    background: venda.status === 'concluida' ? '#c6f6d5' : '#fed7d7',
                    color: venda.status === 'concluida' ? '#2f855a' : '#c53030',
                    fontSize: '0.8em'
                  }}>
                    {venda.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {vendas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
            Nenhuma venda realizada
          </div>
        )}
      </div>
    </div>
  )
}

export default Vendas
