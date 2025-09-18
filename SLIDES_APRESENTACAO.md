# 🎯 Slides de Apresentação - Sistema de Microserviços

## 📋 **Estrutura da Apresentação (15-20 minutos)**

---

## **SLIDE 1: Título**
```
🛒 Sistema de Controle de Vendas
Arquitetura de Microserviços

Programação Distribuída
[Seu Nome] - [Data]
```

---

## **SLIDE 2: Agenda**
```
📋 O que vamos ver hoje:

1. 🎯 Problema e Solução
2. 🏗️ Arquitetura do Sistema
3. 🔧 Tecnologias Utilizadas
4. 💡 Conceitos Demonstrados
5. 🚀 Demonstração Prática
6. 📊 Resultados e Benefícios
7. ❓ Perguntas
```

---

## **SLIDE 3: O Problema**
```
❌ Sistema Monolítico Tradicional

┌─────────────────────────────────┐
│        APLICAÇÃO ÚNICA          │
│  ┌─────┐ ┌─────┐ ┌─────┐        │
│  │Prod │ │Cli  │ │Vend │        │
│  └─────┘ └─────┘ └─────┘        │
│                                 │
│  ┌─────────────────────────────┐ │
│  │     BANCO DE DADOS          │ │
│  └─────────────────────────────┘ │
└─────────────────────────────────┘

❌ Se quebra, tudo para
❌ Difícil de escalar
❌ Equipe única para tudo
```

---

## **SLIDE 4: Nossa Solução**
```
✅ Arquitetura de Microserviços

┌─────────┐ ┌─────────┐ ┌─────────┐
│Produtos │ │Clientes │ │ Vendas  │
│ (Node)  │ │(Python) │ │  (Go)   │
└─────────┘ └─────────┘ └─────────┘
     │           │           │
     └───────────┼───────────┘
                 │
        ┌─────────▼─────────┐
        │   Frontend React   │
        └─────────┬─────────┘
                  │
        ┌─────────▼─────────┐
        │   MySQL Database   │
        └───────────────────┘
```

---

## **SLIDE 5: Arquitetura Detalhada**
```
🏗️ Componentes do Sistema

┌─────────────────────────────────────────┐
│              FRONTEND                   │
│  React + Vite + React Router           │
│  Porta: 3000                           │
└─────────────────┬───────────────────────┘
                  │ HTTP/REST
┌─────────────────▼───────────────────────┐
│              BACKEND SERVICES           │
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │Produtos │ │Clientes │ │ Vendas  │    │
│  │Node.js  │ │ Python  │ │   Go    │    │
│  │Port:3001│ │Port:3002│ │Port:3003│    │
│  └─────────┘ └─────────┘ └─────────┘    │
└─────────────────┬───────────────────────┘
                  │ MySQL
┌─────────────────▼───────────────────────┐
│              DATABASE                    │
│  MySQL 8.0 - Porta: 3307                │
└─────────────────────────────────────────┘
```

---

## **SLIDE 6: Tecnologias por Serviço**
```
🔧 Stack Tecnológico

┌─────────────┬─────────────┬─────────────┐
│   PRODUTOS  │  CLIENTES   │   VENDAS    │
├─────────────┼─────────────┼─────────────┤
│   Node.js   │   Python    │     Go      │
│   Express   │    Flask    │    Gin      │
│   Worker    │  Threading  │ Goroutines  │
│   Threads   │             │             │
└─────────────┴─────────────┴─────────────┘

┌─────────────┬─────────────┬─────────────┐
│  FRONTEND   │   DATABASE  │ CONTAINERS  │
├─────────────┼─────────────┼─────────────┤
│    React    │    MySQL    │    Docker   │
│   Vite      │     8.0     │ Docker      │
│React Router │             │ Compose     │
└─────────────┴─────────────┴─────────────┘
```

---

## **SLIDE 7: Processamento Paralelo**
```
⚡ Conceitos de Concorrência

┌─────────────┬─────────────┬─────────────┐
│   PYTHON    │   NODE.JS   │     GO      │
├─────────────┼─────────────┼─────────────┤
│ Threading   │Worker Thread│ Goroutines  │
│             │             │             │
│ ThreadPool  │Message      │ Channels    │
│ Executor    │ Passing     │             │
│             │             │             │
│ Futures     │ Event       │ Select      │
│             │ Driven      │             │
└─────────────┴─────────────┴─────────────┘

🎯 Cada linguagem otimizada para seu caso:
• Python: I/O bound operations
• Node.js: CPU intensive calculations  
• Go: Concurrent processing
```

---

## **SLIDE 8: Comunicação Inter-Serviços**
```
🔄 Como os Serviços se Comunicam

Frontend ──HTTP──► Serviços ──SQL──► Database

Exemplo de Fluxo:
1. Usuário clica em "Produtos"
2. Frontend faz GET /api/produtos
3. Serviço Produtos consulta MySQL
4. Retorna JSON com dados
5. Frontend renderiza interface

┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   CLIENTE   │───►│   SERVIDOR  │───►│   DATABASE  │
│             │    │             │    │             │
│ Requisição  │    │ Processa    │    │ Consulta    │
│ HTTP        │    │ Dados       │    │ SQL         │
│             │    │             │    │             │
│ Resposta    │◄───│ Retorna     │◄───│ Retorna     │
│ JSON        │    │ JSON        │    │ Dados       │
└─────────────┘    └─────────────┘    └─────────────┘
```

---

## **SLIDE 9: Persistência de Dados**
```
🗄️ Estratégia de Banco de Dados

┌─────────────────────────────────────────┐
│              MYSQL DATABASE             │
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │produtos │ │clientes │ │ vendas  │   │
│  │         │ │         │ │         │   │
│  │• id     │ │• id     │ │• id     │   │
│  │• nome   │ │• nome   │ │• cliente│   │
│  │• valor  │ │• telefone│ │• total  │   │
│  └─────────┘ └─────────┘ └─────────┘   │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │         itens_venda                 │ │
│  │• id, venda_id, produto_id           │ │
│  │• quantidade, valor_unitario         │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘

✅ Transações ACID
✅ Relacionamentos bem definidos
✅ Índices otimizados
```

---

## **SLIDE 10: Containerização**
```
🐳 Docker e Docker Compose

┌─────────────────────────────────────────┐
│              DOCKER COMPOSE             │
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │Frontend │ │Backend  │ │Database │   │
│  │React    │ │Services │ │MySQL    │   │
│  │Port:3000│ │3001-3003│ │Port:3307│   │
│  └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────┘

✅ Isolamento completo
✅ Portabilidade total
✅ Escalabilidade fácil
✅ Dependências isoladas

Comando: docker-compose up --build
```

---

## **SLIDE 11: Demonstração Prática**
```
🚀 Vamos Ver o Sistema Funcionando!

1. 📊 Dashboard - Visão geral
2. 📦 Produtos - CRUD completo
3. 👥 Clientes - Gerenciamento
4. 💰 Vendas - Processo completo

🎯 Pontos a Observar:
• URLs mudam com navegação
• Dados persistem no banco
• Processamento paralelo
• Interface responsiva
• Comunicação entre serviços
```

---

## **SLIDE 12: Benefícios Alcançados**
```
✅ Vantagens da Arquitetura

┌─────────────┬─────────────┬─────────────┐
│ ESCALABILIDADE │ MANUTENIBILIDADE │ TESTABILIDADE │
├─────────────┼─────────────┼─────────────┤
│• Serviços   │• Código     │• Testes     │
│  independentes│  modular   │  isolados   │
│• Escala     │• Equipes    │• Debug      │
│  horizontal │  separadas  │  facilitado │
│• Load       │• Deploy     │• CI/CD      │
│  balancing  │  independente│  simples   │
└─────────────┴─────────────┴─────────────┘

🎯 Resultado: Sistema robusto e profissional
```

---

## **SLIDE 13: Conceitos Acadêmicos**
```
🎓 Teoria Aplicada na Prática

┌─────────────────────────────────────────┐
│         PROGRAMAÇÃO DISTRIBUÍDA          │
│                                         │
│ • Comunicação Inter-Processos           │
│ • Sincronização de Dados                │
│ • Tolerância a Falhas                   │
│ • Consistência Eventual                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│        PROCESSAMENTO PARALELO           │
│                                         │
│ • Threading (Python)                   │
│ • Worker Threads (Node.js)              │
│ • Goroutines (Go)                       │
│ • Sincronização via Channels            │
└─────────────────────────────────────────┘
```

---

## **SLIDE 14: Métricas de Performance**
```
📊 Resultados Obtidos

┌─────────────┬─────────────┬─────────────┐
│ RESPONSE    │ THROUGHPUT  │ RESOURCE    │
│ TIME        │             │ USAGE       │
├─────────────┼─────────────┼─────────────┤
│• < 200ms    │• Múltiplas  │• Otimizado  │
│  operações  │  requisições│  com        │
│  simples    │  simultâneas│  containers │
│             │             │             │
│• < 500ms    │• Suporta    │• Isolamento │
│  operações  │  carga      │  completo   │
│  complexas  │  alta       │             │
└─────────────┴─────────────┴─────────────┘

🎯 Sistema pronto para produção!
```

---

## **SLIDE 15: Próximos Passos**
```
🚀 Melhorias Futuras

┌─────────────┬─────────────┬─────────────┐
│ MONITORING  │ SECURITY    │ SCALING     │
├─────────────┼─────────────┼─────────────┤
│• Prometheus │• JWT Auth   │• Load       │
│• Grafana    │• Rate       │  Balancer  │
│• Logs       │  Limiting   │• Auto       │
│• Metrics    │• CORS       │  Scaling    │
└─────────────┴─────────────┴─────────────┘

┌─────────────┬─────────────┬─────────────┐
│ TESTING     │ CI/CD       │ DEPLOYMENT  │
├─────────────┼─────────────┼─────────────┤
│• Unit Tests │• GitHub     │• Kubernetes │
│• Integration│  Actions    │• Docker     │
│• E2E Tests  │• Jenkins    │  Swarm      │
│• Load Tests │• Automated  │• Cloud      │
└─────────────┴─────────────┴─────────────┘
```

---

## **SLIDE 16: Conclusão**
```
🎯 Resumo do Projeto

✅ Sistema de microserviços funcional
✅ Múltiplas tecnologias integradas
✅ Processamento paralelo implementado
✅ Arquitetura escalável e robusta
✅ Interface moderna e responsiva
✅ Persistência de dados garantida

🎓 Conceitos Demonstrados:
• Programação Distribuída
• Arquitetura de Software
• Processamento Paralelo
• Containerização
• APIs REST
• Engenharia de Software

🚀 Base sólida para projetos profissionais!
```

---

## **SLIDE 17: Perguntas**
```
❓ Dúvidas e Discussão

┌─────────────────────────────────────────┐
│                                         │
│  🤔 Alguma pergunta sobre:              │
│                                         │
│  • Arquitetura do sistema?              │
│  • Tecnologias utilizadas?             │
│  • Processamento paralelo?              │
│  • Implementação prática?               │
│  • Próximos passos?                     │
│                                         │
│  📧 Contato: [seu-email]                │
│  🔗 Repositório: [link-github]          │
│                                         │
└─────────────────────────────────────────┘
```

---

## **SLIDE 18: Obrigado!**
```
🙏 Obrigado pela Atenção!

┌─────────────────────────────────────────┐
│                                         │
│  🎯 Sistema de Microserviços            │
│     Programação Distribuída             │
│                                         │
│  [Seu Nome]                             │
│  [Data]                                 │
│                                         │
│  📚 Material disponível em:            │
│  README_TECNICO.md                      │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📝 **Dicas para a Apresentação:**

### **🎯 Timing Sugerido:**
- **Slides 1-4**: 3 minutos (Introdução)
- **Slides 5-10**: 8 minutos (Arquitetura)
- **Slides 11**: 5 minutos (Demonstração)
- **Slides 12-16**: 3 minutos (Conclusão)
- **Slides 17-18**: 1 minuto (Perguntas)

### **💡 Pontos Importantes:**
1. **Demonstre o sistema** ao vivo (slide 11)
2. **Mostre o código** dos conceitos de paralelismo
3. **Explique as decisões** arquiteturais
4. **Destaque os benefícios** práticos
5. **Conecte teoria** com prática

### **🎨 Sugestões Visuais:**
- Use **ícones** para tornar mais visual
- **Cores consistentes** para cada serviço
- **Diagramas** para mostrar comunicação
- **Screenshots** do sistema funcionando

### **📊 Para Demonstração:**
1. Abra o sistema no navegador
2. Mostre cada funcionalidade
3. Demonstre a persistência de dados
4. Mostre as URLs mudando
5. Explique o que está acontecendo "por trás"

---

**🚀 Boa sorte com sua apresentação!**
