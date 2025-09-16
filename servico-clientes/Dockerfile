# Usar Python oficial como base
FROM python:3.11-slim

# Definir diretório de trabalho
WORKDIR /app

# Copiar requirements.txt
COPY requirements.txt .

# Instalar dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código fonte
COPY . .

# Criar usuário não-root para segurança
RUN adduser --disabled-password --gecos '' --shell /bin/bash usuario
RUN chown -R usuario:usuario /app
USER usuario

# Expor porta
EXPOSE 3002

# Comando para iniciar a aplicação
CMD ["python", "servidor.py"]
