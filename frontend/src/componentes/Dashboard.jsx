import React, { useState, useEffect } from 'react'
import { servicoProdutos, servicoClientes, servicoVendas } from '../servicos/api'

function Dashboard() {
  const [estatisticas, setEstatisticas] = useState({})
  const [vendasMesAtual, setVendasMesAtual] = useState({})
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setCarregando(true)
      setErro(null)

      // Obter mês atual
      const agora = new Date()
      const anoAtual = agora.getFullYear()
      const mesAtual = String(agora.getMonth() + 1).padStart(2, '0')

      // Carregar estatísticas em paralelo
      const [dadosProdutos, dadosClientes, dadosVendas, dadosVendasMes] = await Promise.allSettled([
        servicoProdutos.listar(),
        servicoClientes.listar(),
        servicoVendas.estatisticas(),
        servicoVendas.vendasDoMes(anoAtual, mesAtual)
      ])

      // Processar estatísticas
      const produtos = dadosProdutos.status === 'fulfilled' ? dadosProdutos.value.data : { produtos: [], estatisticas: {} }
      const clientes = dadosClientes.status === 'fulfilled' ? dadosClientes.value.data : { clientes: [], dados_processados: {} }
      const vendas = dadosVendas.status === 'fulfilled' ? dadosVendas.value.data : { total_vendas: 0, valor_total_vendas: 0, valor_medio_venda: 0, venda_maior: 0, venda_menor: 0 }
      const vendasMes = dadosVendasMes.status === 'fulfilled' ? dadosVendasMes.value.data : { vendas: [], estatisticas: {}, total: 0, mes: `${mesAtual}/${anoAtual}` }

      setEstatisticas({
        produtos: produtos.estatisticas || {},
        clientes: clientes.dados_processados || {},
        vendas: vendas || {}
      })

      setVendasMesAtual(vendasMes || {})

    } catch (erro) {
      setErro('Erro ao carregar dados do dashboard')
      console.error('Erro:', erro)
    } finally {
      setCarregando(false)
    }
  }


  if (carregando) {
    return (
      <div className="card">
        <div className="loading">Carregando dashboard...</div>
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
            <h3>{estatisticas.vendas?.total_vendas || 0}</h3>
            <p>Total de Vendas</p>
          </div>
          <div className="estatistica-card">
            <h3>R$ {estatisticas.vendas?.valor_total_vendas?.toFixed(2) || '0,00'}</h3>
            <p>Faturamento Total</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>📅 Vendas do Mês Atual ({vendasMesAtual.mes || 'Carregando...'})</h2>
        <div className="estatisticas">
          <div className="estatistica-card">
            <h3>{vendasMesAtual.total || 0}</h3>
            <p>Vendas do Mês</p>
          </div>
          <div className="estatistica-card">
            <h3>R$ {vendasMesAtual.estatisticas?.valor_total_vendas?.toFixed(2) || '0,00'}</h3>
            <p>Faturamento do Mês</p>
          </div>
          <div className="estatistica-card">
            <h3>R$ {vendasMesAtual.estatisticas?.valor_medio_venda?.toFixed(2) || '0,00'}</h3>
            <p>Ticket Médio</p>
          </div>
          <div className="estatistica-card">
            <h3>R$ {vendasMesAtual.estatisticas?.venda_maior?.toFixed(2) || '0,00'}</h3>
            <p>Maior Venda</p>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Dashboard
