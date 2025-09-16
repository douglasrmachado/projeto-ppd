import React, { useState } from 'react'
import Produtos from './componentes/Produtos'
import Clientes from './componentes/Clientes'
import Vendas from './componentes/Vendas'
import Dashboard from './componentes/Dashboard'

function App() {
  const [abaAtiva, setAbaAtiva] = useState('dashboard')

  const renderizarAba = () => {
    switch (abaAtiva) {
      case 'produtos':
        return <Produtos />
      case 'clientes':
        return <Clientes />
      case 'vendas':
        return <Vendas />
      case 'dashboard':
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>🛒 Controle de Vendas</h1>
        <p>Sistema de Microserviços - Programação Distribuída</p>
      </header>

      <nav className="nav">
        <button 
          className={abaAtiva === 'dashboard' ? 'ativo' : ''}
          onClick={() => setAbaAtiva('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={abaAtiva === 'produtos' ? 'ativo' : ''}
          onClick={() => setAbaAtiva('produtos')}
        >
          📦 Produtos
        </button>
        <button 
          className={abaAtiva === 'clientes' ? 'ativo' : ''}
          onClick={() => setAbaAtiva('clientes')}
        >
          👥 Clientes
        </button>
        <button 
          className={abaAtiva === 'vendas' ? 'ativo' : ''}
          onClick={() => setAbaAtiva('vendas')}
        >
          💰 Vendas
        </button>
      </nav>

      {renderizarAba()}
    </div>
  )
}

export default App
