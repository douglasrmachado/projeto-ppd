const { parentPort, workerData } = require('worker_threads');

// Simular processamento pesado de cálculos estatísticos
function calcularEstatisticas(produtos) {
  const valores = produtos.map(p => p.valor);
  
  // Cálculos estatísticos
  const soma = valores.reduce((acc, val) => acc + val, 0);
  const media = soma / valores.length;
  const maximo = Math.max(...valores);
  const minimo = Math.min(...valores);
  
  // Simular processamento adicional (como seria em um cenário real)
  const valoresOrdenados = valores.sort((a, b) => a - b);
  const mediana = valoresOrdenados.length % 2 === 0
    ? (valoresOrdenados[valoresOrdenados.length / 2 - 1] + valoresOrdenados[valoresOrdenados.length / 2]) / 2
    : valoresOrdenados[Math.floor(valoresOrdenados.length / 2)];
  
  // Calcular desvio padrão
  const variancia = valores.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / valores.length;
  const desvioPadrao = Math.sqrt(variancia);
  
  return {
    totalProdutos: produtos.length,
    valorTotal: soma,
    valorMedio: parseFloat(media.toFixed(2)),
    valorMaximo: maximo,
    valorMinimo: minimo,
    mediana: parseFloat(mediana.toFixed(2)),
    desvioPadrao: parseFloat(desvioPadrao.toFixed(2)),
    timestamp: new Date().toISOString()
  };
}

// Processar dados recebidos do thread principal
try {
  const estatisticas = calcularEstatisticas(workerData.produtos);
  
  // Enviar resultado de volta para o thread principal
  parentPort.postMessage(estatisticas);
} catch (erro) {
  parentPort.postMessage({ erro: erro.message });
}
