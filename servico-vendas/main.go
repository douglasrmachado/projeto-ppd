package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	_ "github.com/go-sql-driver/mysql"
)

// Estruturas de dados
type Cliente struct {
	ID        string `json:"id"`
	Nome      string `json:"nome"`
	Telefone  string `json:"telefone"`
	DataCriacao string `json:"data_criacao"`
}

type Produto struct {
	ID          string  `json:"id"`
	Nome        string  `json:"nome"`
	Descricao   string  `json:"descricao"`
	Valor       float64 `json:"valor"`
	DataCriacao string  `json:"data_criacao"`
}

type ItemVenda struct {
	ProdutoID string  `json:"produto_id"`
	Quantidade int    `json:"quantidade"`
	ValorUnitario float64 `json:"valor_unitario"`
	Subtotal   float64 `json:"subtotal"`
}

type Venda struct {
	ID          string      `json:"id"`
	ClienteID   string      `json:"cliente_id"`
	ClienteNome string      `json:"cliente_nome"`
	Itens       []ItemVenda `json:"itens"`
	ValorTotal  float64     `json:"valor_total"`
	DataVenda   string      `json:"data_venda"`
	Status      string      `json:"status"`
}

type EstatisticasVendas struct {
	TotalVendas      int     `json:"total_vendas"`
	ValorTotalVendas float64 `json:"valor_total_vendas"`
	ValorMedioVenda  float64 `json:"valor_medio_venda"`
	VendaMaior       float64 `json:"venda_maior"`
	VendaMenor       float64 `json:"venda_menor"`
	Timestamp        string  `json:"timestamp"`
}

// Variáveis globais
var (
	vendas []Venda
	mutex  sync.RWMutex
	porta  = "3003"
	db     *sql.DB
)

// Configuração do banco de dados
const (
	dbHost     = "mysql"
	dbPort     = "3306"
	dbUser     = "vendas_user"
	dbPassword = "vendas123"
	dbName     = "vendas_db"
)

// Inicializar conexão com o banco de dados
func initDB() error {
	var err error
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPassword, dbHost, dbPort, dbName)
	
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		return fmt.Errorf("erro ao conectar com MySQL: %v", err)
	}
	
	// Testar conexão
	if err = db.Ping(); err != nil {
		return fmt.Errorf("erro ao testar conexão MySQL: %v", err)
	}
	
	log.Println("✅ Conectado ao MySQL com sucesso!")
	return nil
}

// Função para simular busca de cliente via API
func buscarCliente(clienteID string) (*Cliente, error) {
	// Simular chamada HTTP para o serviço de clientes
	resp, err := http.Get(fmt.Sprintf("http://servico-clientes:3002/clientes/%s", clienteID))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("cliente não encontrado")
	}

	var cliente Cliente
	if err := json.NewDecoder(resp.Body).Decode(&cliente); err != nil {
		return nil, err
	}

	return &cliente, nil
}

// Função para simular busca de produto via API
func buscarProduto(produtoID string) (*Produto, error) {
	// Simular chamada HTTP para o serviço de produtos
	resp, err := http.Get(fmt.Sprintf("http://servico-produtos:3001/produtos/%s", produtoID))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("produto não encontrado")
	}

	var produto Produto
	if err := json.NewDecoder(resp.Body).Decode(&produto); err != nil {
		return nil, err
	}

	return &produto, nil
}

// Função para buscar vendas do banco de dados
func buscarVendasDoBanco() ([]Venda, error) {
	query := `
		SELECT v.id, v.cliente_id, v.cliente_nome, v.valor_total, v.data_venda, v.status
		FROM vendas v
		ORDER BY v.data_venda DESC
	`
	
	rows, err := db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar vendas: %v", err)
	}
	defer rows.Close()
	
	var vendas []Venda
	for rows.Next() {
		var venda Venda
		var dataVenda time.Time
		
		err := rows.Scan(&venda.ID, &venda.ClienteID, &venda.ClienteNome, 
			&venda.ValorTotal, &dataVenda, &venda.Status)
		if err != nil {
			return nil, fmt.Errorf("erro ao escanear venda: %v", err)
		}
		
		venda.DataVenda = dataVenda.Format(time.RFC3339)
		
		// Buscar itens da venda
		itens, err := buscarItensVenda(venda.ID)
		if err != nil {
			return nil, fmt.Errorf("erro ao buscar itens da venda: %v", err)
		}
		venda.Itens = itens
		
		vendas = append(vendas, venda)
	}
	
	return vendas, nil
}

// Função para buscar itens de uma venda
func buscarItensVenda(vendaID string) ([]ItemVenda, error) {
	query := `
		SELECT produto_id, quantidade, valor_unitario, subtotal
		FROM itens_venda
		WHERE venda_id = ?
	`
	
	rows, err := db.Query(query, vendaID)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar itens: %v", err)
	}
	defer rows.Close()
	
	var itens []ItemVenda
	for rows.Next() {
		var item ItemVenda
		err := rows.Scan(&item.ProdutoID, &item.Quantidade, 
			&item.ValorUnitario, &item.Subtotal)
		if err != nil {
			return nil, fmt.Errorf("erro ao escanear item: %v", err)
		}
		itens = append(itens, item)
	}
	
	return itens, nil
}

// Função para salvar venda no banco de dados
func salvarVendaNoBanco(venda Venda) error {
	// Iniciar transação
	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("erro ao iniciar transação: %v", err)
	}
	defer tx.Rollback()

	// Inserir venda
	queryVenda := `
		INSERT INTO vendas (id, cliente_id, cliente_nome, valor_total, data_venda, status)
		VALUES (?, ?, ?, ?, ?, ?)
	`
	
	_, err = tx.Exec(queryVenda, venda.ID, venda.ClienteID, venda.ClienteNome, 
		venda.ValorTotal, time.Now(), venda.Status)
	if err != nil {
		return fmt.Errorf("erro ao inserir venda: %v", err)
	}

	// Inserir itens da venda
	for _, item := range venda.Itens {
		queryItem := `
			INSERT INTO itens_venda (id, venda_id, produto_id, quantidade, valor_unitario, subtotal)
			VALUES (?, ?, ?, ?, ?, ?)
		`
		
		itemID := uuid.New().String()
		_, err = tx.Exec(queryItem, itemID, venda.ID, item.ProdutoID, 
			item.Quantidade, item.ValorUnitario, item.Subtotal)
		if err != nil {
			return fmt.Errorf("erro ao inserir item: %v", err)
		}
	}

	// Confirmar transação
	if err = tx.Commit(); err != nil {
		return fmt.Errorf("erro ao confirmar transação: %v", err)
	}

	return nil
}

// Função para calcular estatísticas usando Goroutines (versão banco)
func calcularEstatisticasVendasDB(vendas []Venda) EstatisticasVendas {
	if len(vendas) == 0 {
		return EstatisticasVendas{
			TotalVendas:      0,
			ValorTotalVendas: 0,
			ValorMedioVenda:  0,
			VendaMaior:       0,
			VendaMenor:       0,
			Timestamp:        time.Now().Format(time.RFC3339),
		}
	}

	// Canais para receber resultados das goroutines
	totalChan := make(chan float64, 1)
	maiorChan := make(chan float64, 1)
	menorChan := make(chan float64, 1)
	
	// Goroutine para calcular valor total
	go func() {
		total := 0.0
		for _, venda := range vendas {
			total += venda.ValorTotal
		}
		totalChan <- total
	}()

	// Goroutine para encontrar maior venda
	go func() {
		maior := 0.0
		for _, venda := range vendas {
			if venda.ValorTotal > maior {
				maior = venda.ValorTotal
			}
		}
		maiorChan <- maior
	}()

	// Goroutine para encontrar menor venda
	go func() {
		menor := vendas[0].ValorTotal
		for _, venda := range vendas {
			if venda.ValorTotal < menor {
				menor = venda.ValorTotal
			}
		}
		menorChan <- menor
	}()

	// Aguardar resultados
	valorTotal := <-totalChan
	vendaMaior := <-maiorChan
	vendaMenor := <-menorChan

	valorMedio := valorTotal / float64(len(vendas))

	return EstatisticasVendas{
		TotalVendas:      len(vendas),
		ValorTotalVendas: valorTotal,
		ValorMedioVenda:  valorMedio,
		VendaMaior:       vendaMaior,
		VendaMenor:       vendaMenor,
		Timestamp:        time.Now().Format(time.RFC3339),
	}
}

// Função para calcular estatísticas usando Goroutines (versão memória - mantida para compatibilidade)
func calcularEstatisticasVendas() EstatisticasVendas {
	mutex.RLock()
	vendasCopy := make([]Venda, len(vendas))
	copy(vendasCopy, vendas)
	mutex.RUnlock()

	if len(vendasCopy) == 0 {
		return EstatisticasVendas{
			TotalVendas:      0,
			ValorTotalVendas: 0,
			ValorMedioVenda:  0,
			VendaMaior:       0,
			VendaMenor:       0,
			Timestamp:        time.Now().Format(time.RFC3339),
		}
	}

	// Canal para receber resultados das goroutines
	resultados := make(chan float64, len(vendasCopy))
	
	// Goroutine para calcular valor total
	go func() {
		total := 0.0
		for _, venda := range vendasCopy {
			total += venda.ValorTotal
		}
		resultados <- total
	}()

	// Goroutine para encontrar maior venda
	go func() {
		maior := 0.0
		for _, venda := range vendasCopy {
			if venda.ValorTotal > maior {
				maior = venda.ValorTotal
			}
		}
		resultados <- maior
	}()

	// Goroutine para encontrar menor venda
	go func() {
		menor := vendasCopy[0].ValorTotal
		for _, venda := range vendasCopy {
			if venda.ValorTotal < menor {
				menor = venda.ValorTotal
			}
		}
		resultados <- menor
	}()

	// Aguardar resultados
	valorTotal := <-resultados
	vendaMaior := <-resultados
	vendaMenor := <-resultados

	valorMedio := valorTotal / float64(len(vendasCopy))

	return EstatisticasVendas{
		TotalVendas:      len(vendasCopy),
		ValorTotalVendas: valorTotal,
		ValorMedioVenda:  valorMedio,
		VendaMaior:       vendaMaior,
		VendaMenor:       vendaMenor,
		Timestamp:        time.Now().Format(time.RFC3339),
	}
}

// Função para processar venda em background usando Goroutine
func processarVendaBackground(venda Venda) {
	// Simular processamento assíncrono
	time.Sleep(100 * time.Millisecond)
	
	// Aqui poderiam ser feitas validações adicionais,
	// envio de emails, atualização de estoque, etc.
	log.Printf("Venda %s processada com sucesso", venda.ID)
}

func main() {
	// Configurar porta
	if envPorta := os.Getenv("PORTA"); envPorta != "" {
		porta = envPorta
	}

	// Inicializar conexão com o banco de dados
	if err := initDB(); err != nil {
		log.Fatalf("❌ Erro ao inicializar banco de dados: %v", err)
	}
	defer db.Close()

	// Configurar Gin
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	// Middleware CORS
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		
		c.Next()
	})

	// Rotas

	// GET /vendas - Listar todas as vendas
	r.GET("/vendas", func(c *gin.Context) {
		// Buscar vendas do banco de dados
		vendasDB, err := buscarVendasDoBanco()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"erro": "Erro ao buscar vendas"})
			return
		}

		// Calcular estatísticas usando Goroutines
		estatisticas := calcularEstatisticasVendasDB(vendasDB)

		c.JSON(http.StatusOK, gin.H{
			"vendas":       vendasDB,
			"estatisticas": estatisticas,
			"total":        len(vendasDB),
		})
	})

	// GET /vendas/:id - Buscar venda por ID
	r.GET("/vendas/:id", func(c *gin.Context) {
		id := c.Param("id")
		
		mutex.RLock()
		var venda *Venda
		for _, v := range vendas {
			if v.ID == id {
				venda = &v
				break
			}
		}
		mutex.RUnlock()

		if venda == nil {
			c.JSON(http.StatusNotFound, gin.H{"erro": "Venda não encontrada"})
			return
		}

		c.JSON(http.StatusOK, venda)
	})

	// POST /vendas - Criar nova venda
	r.POST("/vendas", func(c *gin.Context) {
		var dadosVenda struct {
			ClienteID string      `json:"cliente_id" binding:"required"`
			Itens     []ItemVenda `json:"itens" binding:"required"`
		}

		if err := c.ShouldBindJSON(&dadosVenda); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"erro": "Dados inválidos"})
			return
		}

		// Buscar cliente usando Goroutine
		clienteChan := make(chan *Cliente, 1)
		erroClienteChan := make(chan error, 1)
		
		go func() {
			cliente, err := buscarCliente(dadosVenda.ClienteID)
			if err != nil {
				erroClienteChan <- err
				return
			}
			clienteChan <- cliente
		}()

		// Validar produtos usando Goroutines
		produtosChan := make(chan map[string]*Produto, 1)
		erroProdutoChan := make(chan error, 1)
		
		go func() {
			produtos := make(map[string]*Produto)
			for _, item := range dadosVenda.Itens {
				produto, err := buscarProduto(item.ProdutoID)
				if err != nil {
					erroProdutoChan <- err
					return
				}
				produtos[item.ProdutoID] = produto
			}
			produtosChan <- produtos
		}()

		// Aguardar resultados
		select {
		case cliente := <-clienteChan:
			produtos := <-produtosChan
			
			// Calcular totais
			var valorTotal float64
			for i, item := range dadosVenda.Itens {
				produto := produtos[item.ProdutoID]
				dadosVenda.Itens[i].ValorUnitario = produto.Valor
				dadosVenda.Itens[i].Subtotal = produto.Valor * float64(item.Quantidade)
				valorTotal += dadosVenda.Itens[i].Subtotal
			}

			// Criar venda
			novaVenda := Venda{
				ID:          uuid.New().String(),
				ClienteID:   dadosVenda.ClienteID,
				ClienteNome: cliente.Nome,
				Itens:       dadosVenda.Itens,
				ValorTotal:  valorTotal,
				DataVenda:   time.Now().Format(time.RFC3339),
				Status:      "concluida",
			}

			// Salvar venda no banco de dados
			err := salvarVendaNoBanco(novaVenda)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"erro": "Erro ao salvar venda"})
				return
			}

			// Processar venda em background
			go processarVendaBackground(novaVenda)

			c.JSON(http.StatusCreated, novaVenda)

		case <-erroClienteChan:
			c.JSON(http.StatusBadRequest, gin.H{"erro": "Cliente não encontrado"})
		case <-erroProdutoChan:
			c.JSON(http.StatusBadRequest, gin.H{"erro": "Produto não encontrado"})
		case <-time.After(5 * time.Second):
			c.JSON(http.StatusRequestTimeout, gin.H{"erro": "Timeout na consulta aos serviços"})
		}
	})

	// GET /estatisticas - Estatísticas das vendas
	r.GET("/estatisticas", func(c *gin.Context) {
		// Buscar vendas do banco de dados
		vendasDB, err := buscarVendasDoBanco()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"erro": "Erro ao buscar vendas"})
			return
		}

		// Calcular estatísticas usando Goroutines
		estatisticas := calcularEstatisticasVendasDB(vendasDB)
		c.JSON(http.StatusOK, estatisticas)
	})

	// Health check
	r.GET("/saude", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":   "OK",
			"servico":  "servico-vendas",
			"timestamp": time.Now().Format(time.RFC3339),
		})
	})

	// Iniciar servidor
	fmt.Printf("🚀 Serviço de Vendas rodando na porta %s\n", porta)
	fmt.Printf("📊 Health check: http://localhost:%s/saude\n", porta)
	fmt.Printf("💰 API Vendas: http://localhost:%s/vendas\n", porta)
	fmt.Printf("📈 Estatísticas: http://localhost:%s/estatisticas\n", porta)

	log.Fatal(r.Run(":" + porta))
}
