import React, { useState, useEffect } from 'react'
import { verificarSaudeServicos, servicoProdutos, servicoClientes, servicoVendas } from '../servicos/api'

function Dashboard() {
  const [saudeServicos, setSaudeServicos] = useState({})
  const [estatisticas, setEstatisticas] = useState({})
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setCarregando(true)
      setErro(null)

      // Verificar saúde dos serviços e carregar estatísticas em paralelo
      const [saude, dadosProdutos, dadosClientes, dadosVendas] = await Promise.allSettled([
        verificarSaudeServicos(),
        servicoProdutos.listar(),
        servicoClientes.listar(),
        servicoVendas.listar()
      ])

      setSaudeServicos(saude.value || {})

      // Processar estatísticas
      const produtos = dadosProdutos.status === 'fulfilled' ? dadosProdutos.value.data : { produtos: [], estatisticas: {} }
      const clientes = dadosClientes.status === 'fulfilled' ? dadosClientes.value.data : { clientes: [], dados_processados: {} }
      const vendas = dadosVendas.status === 'fulfilled' ? dadosVendas.value.data : { vendas: [], estatisticas: {} }

      setEstatisticas({
        produtos: produtos.estatisticas || {},
        clientes: clientes.dados_processados || {},
        vendas: vendas.estatisticas || {}
      })

    } catch (erro) {
      setErro('Erro ao carregar dados do dashboard')
      console.error('Erro:', erro)
    } finally {
      setCarregando(false)
    }
  }

  const StatusServico = ({ nome, dados }) => (
    <div className="estatistica-card">
      <h3>{dados ? '✅' : '❌'}</h3>
      <p>{nome}</p>
      <small>{dados ? 'Online' : 'Offline'}</small>
    </div>
  )

  if (carregando) {
    return (
      <div className="card">
        <div className="loading">Carregando dashboard...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="card">
        <h2>📊 Status dos Serviços</h2>
        <div className="estatisticas">
          <StatusServico nome="Produtos" dados={saudeServicos.produtos} />
          <StatusServico nome="Clientes" dados={saudeServicos.clientes} />
          <StatusServico nome="Vendas" dados={saudeServicos.vendas} />
        </div>
      </div>

      {erro && (
        <div className="card">
          <div className="erro">{erro}</div>
          <button className="btn" onClick={carregarDados}>
            Tentar Novamente
          </button>
        </div>
      )}

      <div className="card">
        <h2>📈 Estatísticas Gerais</h2>
        <div className="estatisticas">
          <div className="estatistica-card">
            <h3>{estatisticas.produtos?.totalProdutos || 0}</h3>
            <p>Total de Produtos</p>
          </div>
          <div className="estatistica-card">
            <h3>{estatisticas.clientes?.estatisticas?.total_clientes || 0}</h3>
            <p>Total de Clientes</p>
          </div>
          <div className="estatistica-card">
            <h3>{estatisticas.vendas?.totalVendas || 0}</h3>
            <p>Total de Vendas</p>
          </div>
          <div className="estatistica-card">
            <h3>R$ {estatisticas.vendas?.valorTotalVendas?.toFixed(2) || '0,00'}</h3>
            <p>Faturamento Total</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>🔧 Conceitos de Programação Distribuída</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <h3>📦 Serviço de Produtos</h3>
            <ul>
              <li>✅ Worker Threads (Node.js)</li>
              <li>✅ Processamento paralelo de cálculos</li>
              <li>✅ APIs REST</li>
            </ul>
          </div>
          <div>
            <h3>👥 Serviço de Clientes</h3>
            <ul>
              <li>✅ ThreadPoolExecutor (Python)</li>
              <li>✅ Multithreading</li>
              <li>✅ Thread Safety com Locks</li>
            </ul>
          </div>
          <div>
            <h3>💰 Serviço de Vendas</h3>
            <ul>
              <li>✅ Goroutines (Go)</li>
              <li>✅ Channels para comunicação</li>
              <li>✅ Select statements</li>
            </ul>
          </div>
          <div>
            <h3>🌐 Frontend</h3>
            <ul>
              <li>✅ React com Hooks</li>
              <li>✅ Comunicação assíncrona</li>
              <li>✅ Promise.allSettled</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
