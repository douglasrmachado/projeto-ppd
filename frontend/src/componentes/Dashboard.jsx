import React, { useState, useEffect } from 'react'
import { servicoProdutos, servicoClientes, servicoVendas } from '../servicos/api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

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

  // Função para processar dados do gráfico
  const processarDadosGrafico = () => {
    if (!vendasMesAtual.vendas || vendasMesAtual.vendas.length === 0) {
      return {
        labels: [],
        datasets: []
      }
    }

    // Obter mês atual
    const agora = new Date()
    const anoAtual = agora.getFullYear()
    const mesAtual = agora.getMonth() + 1
    
    // Criar array com todos os dias do mês
    const diasNoMes = new Date(anoAtual, mesAtual, 0).getDate()
    const labels = Array.from({ length: diasNoMes }, (_, i) => `${i + 1}`)
    
    // Contar vendas por dia
    const vendasPorDia = new Array(diasNoMes).fill(0)
    
    vendasMesAtual.vendas.forEach(venda => {
      const dataVenda = new Date(venda.data_venda)
      const dia = dataVenda.getDate()
      if (dia >= 1 && dia <= diasNoMes) {
        vendasPorDia[dia - 1] += 1
      }
    })

    return {
      labels,
      datasets: [
        {
          label: 'Vendas por Dia',
          data: vendasPorDia,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.4,
          fill: true
        }
      ]
    }
  }

  // Configurações do gráfico
  const opcoesGrafico = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          },
          color: '#374151'
        }
      },
      title: {
        display: true,
        text: `Vendas por Dia - ${vendasMesAtual.mes || 'Mês Atual'}`,
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#1f2937'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const vendas = context.parsed.y
            return `Dia ${context.label}: ${vendas} venda${vendas !== 1 ? 's' : ''}`
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Dia do Mês',
          font: {
            size: 14,
            weight: 'bold'
          },
          color: '#374151'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#6b7280'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Número de Vendas',
          font: {
            size: 14,
            weight: 'bold'
          },
          color: '#374151'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#6b7280',
          stepSize: 1,
          beginAtZero: true
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
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

      <div className="card">
        <h2>📈 Gráfico de Vendas por Dia</h2>
        <div style={{ height: '400px', width: '100%', marginTop: '20px' }}>
          <Line data={processarDadosGrafico()} options={opcoesGrafico} />
        </div>
        {(!vendasMesAtual.vendas || vendasMesAtual.vendas.length === 0) && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#6b7280',
            fontStyle: 'italic'
          }}>
            Nenhuma venda registrada neste mês
          </div>
        )}
      </div>

    </div>
  )
}

export default Dashboard
