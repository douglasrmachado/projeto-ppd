import React, { useState, useEffect } from 'react'
import { servicoClientes } from '../servicos/api'

function Clientes() {
  const [clientes, setClientes] = useState([])
  const [estatisticas, setEstatisticas] = useState({})
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [clienteEditando, setClienteEditando] = useState(null)

  const [formulario, setFormulario] = useState({
    nome: '',
    telefone: ''
  })

  useEffect(() => {
    carregarClientes()
  }, [])

  const carregarClientes = async () => {
    try {
      setCarregando(true)
      setErro(null)
      const resposta = await servicoClientes.listar()
      setClientes(resposta.data.clientes)
      setEstatisticas(resposta.data.dados_processados)
    } catch (erro) {
      setErro('Erro ao carregar clientes')
      console.error('Erro:', erro)
    } finally {
      setCarregando(false)
    }
  }

  const limparFormulario = () => {
    setFormulario({ nome: '', telefone: '' })
    setClienteEditando(null)
    setMostrarFormulario(false)
  }

  const preencherFormulario = (cliente) => {
    setFormulario({
      nome: cliente.nome,
      telefone: cliente.telefone
    })
    setClienteEditando(cliente)
    setMostrarFormulario(true)
  }

  const salvarCliente = async (e) => {
    e.preventDefault()
    
    try {
      const dados = {
        nome: formulario.nome,
        telefone: formulario.telefone
      }

      if (clienteEditando) {
        await servicoClientes.atualizar(clienteEditando.id, dados)
      } else {
        await servicoClientes.criar(dados)
      }

      limparFormulario()
      carregarClientes()
    } catch (erro) {
      setErro('Erro ao salvar cliente')
      console.error('Erro:', erro)
    }
  }

  const deletarCliente = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este cliente?')) {
      try {
        await servicoClientes.deletar(id)
        carregarClientes()
      } catch (erro) {
        setErro('Erro ao deletar cliente')
        console.error('Erro:', erro)
      }
    }
  }

  if (carregando) {
    return (
      <div className="card">
        <div className="loading">Carregando clientes...</div>
      </div>
    )
  }

  return (
    <div>
      {erro && (
        <div className="card">
          <div className="erro">{erro}</div>
          <button className="btn" onClick={carregarClientes}>
            Tentar Novamente
          </button>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>👥 Clientes</h2>
          <button 
            className="btn" 
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            {mostrarFormulario ? 'Cancelar' : 'Novo Cliente'}
          </button>
        </div>

        {mostrarFormulario && (
          <form onSubmit={salvarCliente} style={{ marginBottom: '30px', padding: '20px', background: '#f7fafc', borderRadius: '10px' }}>
            <h3>{clienteEditando ? 'Editar Cliente' : 'Novo Cliente'}</h3>
            
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
              <label>Telefone:</label>
              <input
                type="tel"
                value={formulario.telefone}
                onChange={(e) => setFormulario({ ...formulario, telefone: e.target.value })}
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <button type="submit" className="btn">
              {clienteEditando ? 'Atualizar' : 'Salvar'}
            </button>
            <button type="button" className="btn btn-secundario" onClick={limparFormulario}>
              Cancelar
            </button>
          </form>
        )}

        {estatisticas && estatisticas.estatisticas && (
          <div className="estatisticas">
            <div className="estatistica-card">
              <h3>{estatisticas.estatisticas.total_clientes || 0}</h3>
              <p>Total de Clientes</p>
            </div>
            <div className="estatistica-card">
              <h3>{estatisticas.validacao?.telefones_validos || 0}</h3>
              <p>Telefones Válidos</p>
            </div>
            <div className="estatistica-card">
              <h3>✅</h3>
              <p>Processamento Paralelo</p>
            </div>
            <div className="estatistica-card">
              <h3>🔒</h3>
              <p>Thread Safety</p>
            </div>
          </div>
        )}

        <table className="tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Data de Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.nome}</td>
                <td>{cliente.telefone}</td>
                <td>{new Date(cliente.data_criacao).toLocaleDateString('pt-BR')}</td>
                <td>
                  <button 
                    className="btn btn-secundario" 
                    onClick={() => preencherFormulario(cliente)}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn btn-perigo" 
                    onClick={() => deletarCliente(cliente.id)}
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {clientes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
            Nenhum cliente cadastrado
          </div>
        )}
      </div>
    </div>
  )
}

export default Clientes
