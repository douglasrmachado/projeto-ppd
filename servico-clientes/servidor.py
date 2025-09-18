from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
import json
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)
CORS(app)

# Configuração
PORTA = 3002

# Configuração do banco de dados
DB_CONFIG = {
    'host': 'mysql',
    'port': 3306,
    'user': 'vendas_user',
    'password': 'vendas123',
    'database': 'vendas_db',
    'charset': 'utf8mb4'
}

def get_db_connection():
    """Criar conexão com o banco de dados"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Erro ao conectar com MySQL: {e}")
        return None

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
def processar_dados_clientes_paralelo(clientes_list):
    """
    Simula processamento pesado usando multithreading
    """
    def calcular_estatisticas():
        """Calcula estatísticas básicas dos clientes"""
        time.sleep(0.1)  # Simula processamento
        return {
            'total_clientes': len(clientes_list),
            'timestamp': datetime.now().isoformat()
        }
    
    def validar_telefones():
        """Valida formato dos telefones"""
        time.sleep(0.1)  # Simula processamento
        telefones_validos = 0
        for cliente in clientes_list:
            if len(cliente['telefone']) >= 10:
                telefones_validos += 1
        return {'telefones_validos': telefones_validos}
    
    def gerar_relatorio():
        """Gera relatório de clientes"""
        time.sleep(0.1)  # Simula processamento
        return {
            'relatorio': f'Relatório gerado com {len(clientes_list)} clientes',
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
        # Buscar clientes do banco de dados
        connection = get_db_connection()
        if not connection:
            return jsonify({'erro': 'Erro ao conectar com o banco de dados'}), 500
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM clientes ORDER BY data_criacao DESC")
        clientes_db = cursor.fetchall()
        
        # Converter valores para o formato esperado
        clientes_formatados = []
        for cliente in clientes_db:
            clientes_formatados.append({
                'id': cliente['id'],
                'nome': cliente['nome'],
                'telefone': cliente['telefone'],
                'data_criacao': cliente['data_criacao'].isoformat() if cliente['data_criacao'] else None
            })
        
        cursor.close()
        connection.close()
        
        # Usar multithreading para processar dados
        dados_processados = processar_dados_clientes_paralelo(clientes_formatados)
        
        return jsonify({
            'clientes': clientes_formatados,
            'dados_processados': dados_processados,
            'total': len(clientes_formatados)
        })
    except Exception as e:
        return jsonify({'erro': f'Erro interno do servidor: {str(e)}'}), 500

@app.route('/clientes/<cliente_id>', methods=['GET'])
def buscar_cliente(cliente_id):
    """Buscar cliente por ID"""
    try:
        # Buscar cliente no banco de dados
        connection = get_db_connection()
        if not connection:
            return jsonify({'erro': 'Erro ao conectar com o banco de dados'}), 500
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM clientes WHERE id = %s", (cliente_id,))
        cliente_db = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        if not cliente_db:
            return jsonify({'erro': 'Cliente não encontrado'}), 404
        
        # Converter para o formato esperado
        cliente = {
            'id': cliente_db['id'],
            'nome': cliente_db['nome'],
            'telefone': cliente_db['telefone'],
            'data_criacao': cliente_db['data_criacao'].isoformat() if cliente_db['data_criacao'] else None
        }
        
        return jsonify(cliente)
        
    except Exception as e:
        return jsonify({'erro': f'Erro interno do servidor: {str(e)}'}), 500

def validar_telefone(telefone):
    """Validar formato do telefone brasileiro"""
    import re
    
    # Remove todos os caracteres não numéricos
    telefone_limpo = re.sub(r'[^\d]', '', telefone)
    
    # Verifica se tem 10 ou 11 dígitos (com ou sem DDD)
    if len(telefone_limpo) not in [10, 11]:
        return False, "Telefone deve ter 10 ou 11 dígitos"
    
    # Verifica se começa com DDD válido (11-99)
    if len(telefone_limpo) == 11:
        ddd = telefone_limpo[:2]
        if not (11 <= int(ddd) <= 99):
            return False, "DDD inválido"
    
    # Verifica se o número não é sequencial ou repetitivo
    if len(set(telefone_limpo)) <= 2:
        return False, "Número de telefone inválido"
    
    return True, telefone_limpo

def formatar_telefone(telefone):
    """Formatar telefone para (ddd) 0000-0000"""
    import re
    
    # Remove todos os caracteres não numéricos
    telefone_limpo = re.sub(r'[^\d]', '', telefone)
    
    if len(telefone_limpo) == 11:
        # Formato: (XX) 00000-0000
        return f"({telefone_limpo[:2]}) {telefone_limpo[2:7]}-{telefone_limpo[7:]}"
    elif len(telefone_limpo) == 10:
        # Formato: (XX) 0000-0000
        return f"({telefone_limpo[:2]}) {telefone_limpo[2:6]}-{telefone_limpo[6:]}"
    else:
        return telefone  # Retorna original se não conseguir formatar

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
    
    # Validar telefone
    telefone_valido, resultado_validacao = validar_telefone(telefone)
    if not telefone_valido:
        return jsonify({'erro': resultado_validacao}), 400
    
    # Formatar telefone automaticamente
    telefone_formatado = formatar_telefone(telefone)
    
    try:
        # Conectar com o banco de dados
        connection = get_db_connection()
        if not connection:
            return jsonify({'erro': 'Erro ao conectar com o banco de dados'}), 500
        
        cursor = connection.cursor()
        cliente_id = str(uuid.uuid4())
        
        # Inserir cliente no banco com telefone formatado
        cursor.execute(
            "INSERT INTO clientes (id, nome, telefone) VALUES (%s, %s, %s)",
            (cliente_id, nome, telefone_formatado)
        )
        
        connection.commit()
        cursor.close()
        connection.close()
        
        # Retornar cliente criado com telefone formatado
        novo_cliente = {
            'id': cliente_id,
            'nome': nome,
            'telefone': telefone_formatado,
            'data_criacao': datetime.now().isoformat()
        }
        
        return jsonify(novo_cliente), 201
        
    except Exception as e:
        return jsonify({'erro': f'Erro ao salvar cliente: {str(e)}'}), 500

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
    
    # Validar telefone
    telefone_valido, resultado_validacao = validar_telefone(telefone)
    if not telefone_valido:
        return jsonify({'erro': resultado_validacao}), 400
    
    # Formatar telefone automaticamente
    telefone_formatado = formatar_telefone(telefone)
    
    try:
        # Conectar com o banco de dados
        connection = get_db_connection()
        if not connection:
            return jsonify({'erro': 'Erro ao conectar com o banco de dados'}), 500
        
        cursor = connection.cursor()
        
        # Verificar se o cliente existe
        cursor.execute("SELECT * FROM clientes WHERE id = %s", (cliente_id,))
        cliente_existente = cursor.fetchone()
        
        if not cliente_existente:
            cursor.close()
            connection.close()
            return jsonify({'erro': 'Cliente não encontrado'}), 404
        
        # Atualizar cliente no banco com telefone formatado
        cursor.execute(
            "UPDATE clientes SET nome = %s, telefone = %s WHERE id = %s",
            (nome, telefone_formatado, cliente_id)
        )
        
        # Atualizar nome do cliente em todas as vendas relacionadas
        cursor.execute(
            "UPDATE vendas SET cliente_nome = %s WHERE cliente_id = %s",
            (nome, cliente_id)
        )
        
        connection.commit()
        cursor.close()
        connection.close()
        
        # Retornar cliente atualizado com telefone formatado
        cliente_atualizado = {
            'id': cliente_id,
            'nome': nome,
            'telefone': telefone_formatado,
            'data_criacao': cliente_existente[3].isoformat() if cliente_existente[3] else None,
            'data_atualizacao': datetime.now().isoformat()
        }
        
        return jsonify(cliente_atualizado)
        
    except Exception as e:
        return jsonify({'erro': f'Erro ao atualizar cliente: {str(e)}'}), 500

@app.route('/clientes/<cliente_id>', methods=['DELETE'])
def deletar_cliente(cliente_id):
    """Deletar cliente"""
    try:
        # Conectar com o banco de dados
        connection = get_db_connection()
        if not connection:
            return jsonify({'erro': 'Erro ao conectar com o banco de dados'}), 500
        
        cursor = connection.cursor()
        
        # Verificar se o cliente existe
        cursor.execute("SELECT * FROM clientes WHERE id = %s", (cliente_id,))
        cliente_existente = cursor.fetchone()
        
        if not cliente_existente:
            cursor.close()
            connection.close()
            return jsonify({'erro': 'Cliente não encontrado'}), 404
        
        # Deletar cliente do banco
        cursor.execute("DELETE FROM clientes WHERE id = %s", (cliente_id,))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({'mensagem': 'Cliente removido com sucesso'})
        
    except Exception as e:
        return jsonify({'erro': f'Erro ao deletar cliente: {str(e)}'}), 500

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
