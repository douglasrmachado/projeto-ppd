import axios from 'axios'

// URLs dos microserviços
const URL_PRODUTOS = import.meta.env.VITE_URL_API_PRODUTOS || 'http://localhost:3001'
const URL_CLIENTES = import.meta.env.VITE_URL_API_CLIENTES || 'http://localhost:3002'
const URL_VENDAS = import.meta.env.VITE_URL_API_VENDAS || 'http://localhost:3003'

// Configuração do axios
const configurarAxios = (baseURL) => {
  return axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

// Instâncias do axios para cada serviço
const apiProdutos = configurarAxios(URL_PRODUTOS)
const apiClientes = configurarAxios(URL_CLIENTES)
const apiVendas = configurarAxios(URL_VENDAS)

// Serviço de Produtos
export const servicoProdutos = {
  listar: () => apiProdutos.get('/produtos'),
  buscar: (id) => apiProdutos.get(`/produtos/${id}`),
  criar: (dados) => apiProdutos.post('/produtos', dados),
  atualizar: (id, dados) => apiProdutos.put(`/produtos/${id}`, dados),
  deletar: (id) => apiProdutos.delete(`/produtos/${id}`),
  saude: () => apiProdutos.get('/saude')
}

// Serviço de Clientes
export const servicoClientes = {
  listar: () => apiClientes.get('/clientes'),
  buscar: (id) => apiClientes.get(`/clientes/${id}`),
  criar: (dados) => apiClientes.post('/clientes', dados),
  atualizar: (id, dados) => apiClientes.put(`/clientes/${id}`, dados),
  deletar: (id) => apiClientes.delete(`/clientes/${id}`),
  estatisticas: () => apiClientes.get('/estatisticas'),
  saude: () => apiClientes.get('/saude')
}

// Serviço de Vendas
export const servicoVendas = {
  listar: () => apiVendas.get('/vendas'),
  buscar: (id) => apiVendas.get(`/vendas/${id}`),
  criar: (dados) => apiVendas.post('/vendas', dados),
  estatisticas: () => apiVendas.get('/estatisticas'),
  saude: () => apiVendas.get('/saude')
}

// Função para verificar saúde de todos os serviços
export const verificarSaudeServicos = async () => {
  try {
    const [produtos, clientes, vendas] = await Promise.allSettled([
      servicoProdutos.saude(),
      servicoClientes.saude(),
      servicoVendas.saude()
    ])

    return {
      produtos: produtos.status === 'fulfilled' ? produtos.value.data : null,
      clientes: clientes.status === 'fulfilled' ? clientes.value.data : null,
      vendas: vendas.status === 'fulfilled' ? vendas.value.data : null
    }
  } catch (erro) {
    console.error('Erro ao verificar saúde dos serviços:', erro)
    return {
      produtos: null,
      clientes: null,
      vendas: null
    }
  }
}
