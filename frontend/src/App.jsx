import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Produtos from './componentes/Produtos'
import Clientes from './componentes/Clientes'
import Vendas from './componentes/Vendas'
import Dashboard from './componentes/Dashboard'

function Navigation() {
  const location = useLocation()
  
  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="nav">
      <Link 
        to="/"
        className={isActive('/') ? 'ativo' : ''}
      >
        📊 Dashboard
      </Link>
      <Link 
        to="/produtos"
        className={isActive('/produtos') ? 'ativo' : ''}
      >
        📦 Produtos
      </Link>
      <Link 
        to="/clientes"
        className={isActive('/clientes') ? 'ativo' : ''}
      >
        👥 Clientes
      </Link>
      <Link 
        to="/vendas"
        className={isActive('/vendas') ? 'ativo' : ''}
      >
        💰 Vendas
      </Link>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <div className="container">
        <header className="header">
          <h1>🛒 Controle de Vendas</h1>
          <p>Sistema de Microserviços - Programação Distribuída</p>
        </header>

        <Navigation />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/vendas" element={<Vendas />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
