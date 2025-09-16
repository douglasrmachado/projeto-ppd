from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

# Configuração
PORTA = 3002

# Armazenamento em memória (simulando banco de dados)
clientes = [
    {
        'id': str(uuid.uuid4()),
        'nome': 'João Silva',
        'telefone': '(11) 99999-9999',
        'data_criacao': datetime.now().isoformat()
    },
    {
        'id': str(uuid.uuid4()),
        'nome': 'Maria Santos',
        'telefone': '(11) 88888-8888',
        'data_criacao': datetime.now().isoformat()
    }
]

# Lock para thread safety
clientes_lock = threading.Lock()

# Função para simular processamento pesado com multithreading
def processar_dados_clientes_paralelo():
    """
    Simula processamento pesado usando multithreading
    """
    def calcular_estatisticas():
        """Calcula estatísticas básicas dos clientes"""
        time.sleep(0.1)  # Simula processamento
        return {
            'total_clientes': len(clientes),
            'timestamp': datetime.now().isoformat()
        }
    
    def validar_telefones():
        """Valida formato dos telefones"""
        time.sleep(0.1)  # Simula processamento
        telefones_validos = 0
        for cliente in clientes:
            if len(cliente['telefone']) >= 10:
                telefones_validos += 1
        return {'telefones_validos': telefones_validos}
    
    def gerar_relatorio():
        """Gera relatório de clientes"""
        time.sleep(0.1)  # Simula processamento
        return {
            'relatorio': f'Relatório gerado com {len(clientes)} clientes',
            'data_geracao': datetime.now().isoformat()
        }
    
    # Executar tarefas em paralelo usando ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=3) as executor:
        # Submeter tarefas para execução paralela
        futuro_estatisticas = executor.submit(calcular_estatisticas)
        futuro_validacao = executor.submit(validar_telefones)
        futuro_relatorio = executor.submit(gerar_relatorio)
        
        # Aguardar resultados
        estatisticas = futuro_estatisticas.result()
        validacao = futuro_validacao.result()
        relatorio = futuro_relatorio.result()
    
    return {
        'estatisticas': estatisticas,
        'validacao': validacao,
        'relatorio': relatorio
    }

# Rotas

@app.route('/clientes', methods=['GET'])
def listar_clientes():
    """Listar todos os clientes com processamento paralelo"""
    try:
        # Usar multithreading para processar dados
        dados_processados = processar_dados_clientes_paralelo()
        
        return jsonify({
            'clientes': clientes,
            'dados_processados': dados_processados,
            'total': len(clientes)
        })
    except Exception as e:
        return jsonify({'erro': f'Erro interno do servidor: {str(e)}'}), 500

@app.route('/clientes/<cliente_id>', methods=['GET'])
def buscar_cliente(cliente_id):
    """Buscar cliente por ID"""
    cliente = next((c for c in clientes if c['id'] == cliente_id), None)
    
    if not cliente:
        return jsonify({'erro': 'Cliente não encontrado'}), 404
    
    return jsonify(cliente)

@app.route('/clientes', methods=['POST'])
def cadastrar_cliente():
    """Cadastrar novo cliente"""
    dados = request.get_json()
    
    # Validação básica
    if not dados or 'nome' not in dados or 'telefone' not in dados:
        return jsonify({'erro': 'Nome e telefone são obrigatórios'}), 400
    
    nome = dados['nome'].strip()
    telefone = dados['telefone'].strip()
    
    if not nome or not telefone:
        return jsonify({'erro': 'Nome e telefone não podem estar vazios'}), 400
    
    # Usar lock para thread safety
    with clientes_lock:
        novo_cliente = {
            'id': str(uuid.uuid4()),
            'nome': nome,
            'telefone': telefone,
            'data_criacao': datetime.now().isoformat()
        }
        
        clientes.append(novo_cliente)
    
    return jsonify(novo_cliente), 201

@app.route('/clientes/<cliente_id>', methods=['PUT'])
def atualizar_cliente(cliente_id):
    """Atualizar cliente existente"""
    dados = request.get_json()
    
    if not dados or 'nome' not in dados or 'telefone' not in dados:
        return jsonify({'erro': 'Nome e telefone são obrigatórios'}), 400
    
    nome = dados['nome'].strip()
    telefone = dados['telefone'].strip()
    
    if not nome or not telefone:
        return jsonify({'erro': 'Nome e telefone não podem estar vazios'}), 400
    
    # Usar lock para thread safety
    with clientes_lock:
        cliente_index = next((i for i, c in enumerate(clientes) if c['id'] == cliente_id), None)
        
        if cliente_index is None:
            return jsonify({'erro': 'Cliente não encontrado'}), 404
        
        clientes[cliente_index].update({
            'nome': nome,
            'telefone': telefone,
            'data_atualizacao': datetime.now().isoformat()
        })
    
    return jsonify(clientes[cliente_index])

@app.route('/clientes/<cliente_id>', methods=['DELETE'])
def deletar_cliente(cliente_id):
    """Deletar cliente"""
    # Usar lock para thread safety
    with clientes_lock:
        cliente_index = next((i for i, c in enumerate(clientes) if c['id'] == cliente_id), None)
        
        if cliente_index is None:
            return jsonify({'erro': 'Cliente não encontrado'}), 404
        
        cliente_removido = clientes.pop(cliente_index)
    
    return jsonify({'mensagem': 'Cliente removido com sucesso', 'cliente': cliente_removido})

@app.route('/saude', methods=['GET'])
def health_check():
    """Health check do serviço"""
    return jsonify({
        'status': 'OK',
        'servico': 'servico-clientes',
        'timestamp': datetime.now().isoformat(),
        'threads_ativas': threading.active_count()
    })

@app.route('/estatisticas', methods=['GET'])
def estatisticas_clientes():
    """Endpoint específico para estatísticas usando multithreading"""
    try:
        dados_processados = processar_dados_clientes_paralelo()
        return jsonify(dados_processados)
    except Exception as e:
        return jsonify({'erro': f'Erro ao processar estatísticas: {str(e)}'}), 500

if __name__ == '__main__':
    print(f"🚀 Serviço de Clientes rodando na porta {PORTA}")
    print(f"📊 Health check: http://localhost:{PORTA}/saude")
    print(f"👥 API Clientes: http://localhost:{PORTA}/clientes")
    print(f"📈 Estatísticas: http://localhost:{PORTA}/estatisticas")
    
    app.run(host='0.0.0.0', port=PORTA, debug=True, threaded=True)
