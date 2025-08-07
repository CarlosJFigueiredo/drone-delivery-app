# Simulador de Encomendas em Drone

**Desafio Técnico DTI Digital** - Sistema completo de simulação de entregas por drone com otimização inteligente e gerenciamento avançado de recursos.

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.4-green)
![React](https://img.shields.io/badge/React-19.1.1-blue)
![Node.js](https://img.shields.io/badge/Node.js-LTS-green)
![Status](https://img.shields.io/badge/Status-Conclu%C3%ADdo-success)

## 🌐 Demonstração Online

**🚀 [ACESSE A APLICAÇÃO](https://drone-delivery-cq7u.onrender.com/)**

> 📱 A aplicação está hospedada na plataforma Render e pode ser acessada diretamente pelo link acima. Todos os recursos estão funcionais, incluindo simulação de entregas, mapa interativo e dashboard em tempo real.

## 📋 Sobre o Projeto

Este é um **simulador avançado de entregas por drone** desenvolvido como parte do processo seletivo da DTI Digital. O sistema simula operações reais de entrega, incluindo gerenciamento de bateria, otimização de rotas, zonas de exclusão aérea e muito mais.

### 🎯 Objetivo Principal
Criar um sistema completo que simule operações de entrega por drone, com foco em:
- **Realismo operacional** através de simulação de bateria e estados dos drones
- **Otimização inteligente** de rotas e alocação de recursos
- **Interface moderna** para gestão e monitoramento
- **Escalabilidade** e boas práticas de desenvolvimento

## ✨ Funcionalidades Implementadas

### 🔋 Simulação Realística
- **Simulação de Bateria**: Consumo baseado em distância, peso da carga e condições adversas
- **Estados dos Drones**: `IDLE → CARREGANDO → EM_VOO → ENTREGANDO → RETORNANDO → IDLE`
- **Recarga Automática**: Drones retornam à base quando bateria fica baixa
- **Condições Adversas**: Simulação de 30% de chance de condições que aumentam consumo

### 🎯 Otimização Inteligente
- **Fila por Prioridade**: Ordenação automática por prioridade e distância
- **Combinação de Pacotes**: Maximização do uso da capacidade do drone por viagem
- **Rota Otimizada**: Algoritmo que calcula a melhor sequência de entregas
- **Alocação Inteligente**: Distribuição eficiente de pedidos entre múltiplos drones

### 🚫 Zonas de Exclusão Aérea
- **Criação de Zonas**: Interface para definir áreas restritas
- **Validação de Rotas**: Sistema impede voos através de zonas proibidas
- **Visualização no Mapa**: Representação gráfica das áreas restritas
- **Gestão Completa**: CRUD completo para gerenciamento de zonas

### 📊 Dashboard e Monitoramento
- **Dashboard Avançado**: Estatísticas em tempo real do sistema
- **Mapa de Entregas**: Visualização gráfica de drones, pedidos e zonas
- **Métricas de Performance**: Tempo médio, drone mais eficiente, total de entregas
- **Interface Responsiva**: Design moderno e adaptável

### 🔧 Gestão Operacional
- **Gestão de Pedidos**: CRUD completo com priorização (ALTA, MEDIA, BAIXA)
- **Gestão de Drones**: Configuração de capacidade e autonomia
- **Simulação de Entregas**: Processo automatizado de alocação e execução
- **Status em Tempo Real**: Acompanhamento do estado de todos os recursos

## 🏗️ Arquitetura Técnica

### 🔙 Backend (Spring Boot)
```
src/server/
├── controller/          # APIs RESTful
│   ├── DroneController     # Gestão de drones e zonas
│   ├── PedidoController    # Gestão de pedidos
│   └── TempoRealController # APIs de tempo real
├── service/             # Lógica de negócio
│   ├── DroneService        # Simulação e controle de drones
│   ├── OtimizadorEntregas  # Algoritmos de otimização
│   ├── SimuladorBateria    # Simulação realística de bateria
│   └── SimuladorTempoReal  # Eventos em tempo real
├── model/               # Entidades do domínio
├── dto/                 # Objetos de transferência
└── config/              # Configurações (CORS, etc.)
```

### 🔝 Frontend (React)
```
src/client/
├── components/          # Componentes React
│   ├── DashboardAvancado   # Dashboard principal
│   ├── PedidoManager       # Gestão de pedidos e drones
│   ├── ZonasExclusao       # Gestão de zonas restritas
│   ├── MapaEntregasNew     # Visualização de mapa
│   └── Navigation          # Navegação principal
├── services/            # Integração com APIs
└── styles/              # Estilos e temas
```

## 🚀 APIs RESTful Implementadas

### 📦 Gestão de Pedidos
- `POST /api/pedidos` - Criar novo pedido
- `GET /api/pedidos/fila` - Listar pedidos na fila
- `GET /api/pedidos/pendentes` - Listar pedidos pendentes  
- `GET /api/pedidos/entregas` - Histórico de entregas
- `GET /api/pedidos/estatisticas` - Métricas do sistema
- `GET /api/pedidos/status/{id}` - Status de um pedido específico

### 🚁 Gestão de Drones
- `POST /api/drones` - Cadastrar drone
- `GET /api/drones` - Listar drones e status
- `POST /api/drones/simular` - Executar simulação de entregas
- `POST /api/drones/recarregar/{id}` - Recarregar drone específico
- `POST /api/drones/recarregar-todos` - Recarregar todos os drones
- `GET /api/drones/status-bateria` - Status detalhado de bateria
- `POST /api/drones/forcar-retorno/{id}` - Forçar retorno de drone

### 🚫 Zonas de Exclusão
- `GET /api/drones/zonas-exclusao` - Listar zonas
- `POST /api/drones/zonas-exclusao` - Criar zona restrita

### ⏱️ Tempo Real
- `GET /api/tempo-real/status` - Status atual do sistema
- `POST /api/tempo-real/iniciar` - Iniciar simulação automática
- `POST /api/tempo-real/parar` - Parar simulação automática
- `POST /api/tempo-real/eventos` - Simular eventos aleatórios

## 🧪 Testes Automatizados

### ✅ Cobertura Implementada
- **Testes Unitários**: 43 testes cobrindo regras principais
- **Testes de Integração**: Validação completa das APIs
- **Testes de Modelo**: Validação de entidades e lógica de negócio
- **Testes de Serviço**: Algoritmos de otimização e simulação

### 📊 Cenários Testados
- Simulação de entregas com múltiplos drones
- Otimização de rotas e alocação de recursos
- Gerenciamento de bateria e recarga automática
- Validação de zonas de exclusão
- Priorização de pedidos por critérios múltiplos

## 📚 Documentação

Para instruções detalhadas de instalação e execução local, consulte o [**Guia de Setup**](SETUP.md).

## 🎮 Como Usar a Demonstração Online

### 1. **Acesso Direto**
- Clique no link: https://drone-delivery-cq7u.onrender.com/
- Aguarde alguns segundos para o carregamento inicial (cold start)
- A aplicação está pronta para uso imediato

### 2. **Primeiros Passos na Demo**
1. **Dashboard**: Visualize métricas gerais do sistema
2. **Gestão de Pedidos**: Crie novos pedidos e configure drones
3. **Mapa das Entregas**: Acompanhe entregas em tempo real
4. **Zonas de Exclusão**: Configure áreas restritas (opcional)

### 3. **Exemplo de Uso Rápido**
- Acesse "Gestão de Pedidos" → aba "Drones" → "Novo Drone"
- Crie um drone: ID: "DRONE-001", Capacidade: 10kg, Autonomia: 100km
- Vá para aba "Pedidos" → "Novo Pedido"
- Crie um pedido: Cliente: "Cliente Teste", X: 10, Y: 15, Peso: 5kg
- Clique em "Simular Entregas" e acompanhe no mapa

> ⚡ **Nota**: Como a aplicação usa hospedagem gratuita, pode haver um pequeno delay no primeiro acesso devido ao "cold start" do servidor.

## 🎯 Funcionalidades Avançadas Implementadas

### ✅ Do Desafio Original
- ✅ **Simulação de bateria** com consumo realístico
- ✅ **Zonas de exclusão aérea** com validação de rotas
- ✅ **Cálculo de tempo** total de entrega
- ✅ **Fila por prioridade** e distância
- ✅ **Otimização inteligente** de recursos
- ✅ **Estados dos drones** com simulação orientada a eventos
- ✅ **APIs RESTful** bem definidas
- ✅ **Testes automatizados** com boa cobertura
- ✅ **Dashboard com métricas** e visualizações
- ✅ **Recarga automática** dos drones

### 🚀 Funcionalidades Extras
- ✅ **Mapa visual** com representação gráfica
- ✅ **Interface moderna** e responsiva
- ✅ **Múltiplos drones** operando simultaneamente
- ✅ **Condições adversas** na simulação
- ✅ **Validações robustas** em todas as operações
- ✅ **CORS configurado** para integração
- ✅ **Logs detalhados** para debugging

## 🔧 Tecnologias Utilizadas

### Backend
- **Java 21** - Linguagem principal
- **Spring Boot 3.5.4** - Framework web
- **Maven** - Gerenciamento de dependências
- **JUnit 5** - Testes automatizados

### Frontend
- **React 19.1.1** - Framework frontend
- **React Icons** - Iconografia
- **Axios** - Comunicação HTTP
- **CSS3** - Estilização moderna

### Ferramentas
- **Git** - Controle de versão
- **VS Code** - Ambiente de desenvolvimento
- **PowerShell** - Automação de tarefas

## 📈 Métricas e Performance

O sistema foi projetado para suportar:
- **Múltiplos drones** operando simultaneamente
- **Centenas de pedidos** na fila
- **Otimização em tempo real** de rotas
- **Simulação realística** de operações

## 🌐 Deployment e Hospedagem

### 🚀 Aplicação Online
- **URL**: https://drone-delivery-cq7u.onrender.com/
- **Plataforma**: Render (hospedagem gratuita)
- **Backend**: Spring Boot com build automático
- **Frontend**: React com build estático
- **Configuração**: Docker para containerização

### 📋 Recursos da Demonstração
- ✅ **Totalmente funcional** - Todos os recursos implementados
- ✅ **Dados persistentes** - Sistema mantém estado durante a sessão
- ✅ **Performance otimizada** - Build de produção
- ✅ **Responsivo** - Funciona em desktop e mobile
- ⚠️ **Cold start** - Primeiro acesso pode demorar ~30 segundos

## 🤝 Contribuições

Este projeto foi desenvolvido como parte do processo seletivo da DTI Digital, demonstrando:
- **Capacidade técnica** em desenvolvimento full-stack
- **Pensamento sistêmico** na modelagem de problemas complexos
- **Boas práticas** de desenvolvimento e testing
- **Criatividade** na implementação de funcionalidades extras
- **Deploy e DevOps** com containerização e hospedagem em nuvem

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais e de processo seletivo.

---

**Desenvolvido por Carlos Figueiredo** para o Desafio Técnico DTI Digital 🚀
