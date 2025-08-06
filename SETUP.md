# 🚀 Guia de Instalação e Execução

Este guia contém todas as instruções necessárias para executar o **Simulador de Encomendas em Drone** em seu ambiente local.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter as seguintes ferramentas instaladas:

- **Java 21+** - [Download Oracle JDK](https://www.oracle.com/java/technologies/downloads/) ou [OpenJDK](https://openjdk.org/)
- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **Maven 3.8+** - [Download Maven](https://maven.apache.org/download.cgi) (ou usar o wrapper incluído)
- **npm** ou **yarn** - Incluído com Node.js
- **Git** - [Download Git](https://git-scm.com/)

### ✅ Verificar Instalações

```bash
# Verificar Java
java -version

# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar Maven (opcional - usaremos o wrapper)
mvn --version
```

## 📦 Clonando o Projeto

```bash
# Clonar o repositório
git clone https://github.com/CarlosJFigueiredo/drone-delivery-app.git

# Navegar para o diretório
cd drone-delivery-app
```

## 🔙 Configuração e Execução do Backend

### 1. Navegar para o diretório do servidor
```bash
cd src/server
```

### 2. Executar o servidor Spring Boot

**No Linux/macOS:**
```bash
./mvnw spring-boot:run
```

**No Windows:**
```bash
mvnw.cmd spring-boot:run
```

### 3. Verificar se está funcionando
- O servidor estará disponível em: `http://localhost:8080`
- Teste uma API: `http://localhost:8080/api/drones`

## 🔝 Configuração e Execução do Frontend

### 1. Abrir um novo terminal e navegar para o cliente
```bash
cd src/client
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Executar o frontend
```bash
npm start
```

### 4. Acessar a aplicação
- A aplicação estará disponível em: `http://localhost:3000`
- O navegador deve abrir automaticamente

## 🧪 Executando Testes

### Backend (Testes Unitários e Integração)
```bash
cd src/server

# Executar todos os testes
./mvnw test

# Executar testes específicos
./mvnw test -Dtest=DroneServiceTest

# Executar com relatório detalhado
./mvnw test -Dmaven.surefire.debug=true
```

### Frontend (Se implementados)
```bash
cd src/client

# Executar testes do React
npm test

# Executar testes com cobertura
npm test -- --coverage
```

## 🎮 Primeiro Uso da Aplicação

Após executar ambos os serviços, siga estes passos para testar:

### 1. **Cadastrar Drones**
- Acesse: "Gestão de Pedidos" → aba "Drones"
- Clique em "Novo Drone"
- Preencha: ID (ex: "DRONE-001"), Capacidade (ex: 10.0), Autonomia (ex: 100.0)

### 2. **Criar Pedidos**
- Vá para: "Gestão de Pedidos" → aba "Pedidos"
- Clique em "Novo Pedido"
- Preencha: Cliente, Coordenadas (X, Y), Peso, Prioridade

### 3. **Configurar Zonas de Exclusão** (Opcional)
- Acesse: "Zonas de Exclusão"
- Clique em "Nova Zona"
- Defina área restrita com coordenadas

### 4. **Executar Simulação**
- No "Dashboard" ou "Gestão de Pedidos"
- Clique em "Simular Entregas"
- Monitore o progresso no "Mapa das Entregas"

## 🔧 Configurações Avançadas

### Portas Personalizadas

**Backend:**
```bash
# Executar em porta diferente
./mvnw spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
```

**Frontend:**
```bash
# Definir porta antes de executar
set PORT=3001 && npm start  # Windows
export PORT=3001 && npm start  # Linux/macOS
```

### Configuração de CORS

O sistema está configurado para aceitar requisições de:
- `http://localhost:3000` (frontend padrão)
- `http://localhost:3001` (frontend alternativo)

Para adicionar outras origens, edite: `src/server/src/main/java/com/dtidigital/drone_delivery/config/CorsConfig.java`

### Logs e Debug

**Ativar logs detalhados:**
```bash
# Backend com logs DEBUG
./mvnw spring-boot:run -Dspring-boot.run.arguments=--logging.level.com.dtidigital=DEBUG

# Frontend com logs detalhados
npm start -- --verbose
```

## 🚨 Solução de Problemas

### Problemas Comuns

**1. Erro de porta em uso:**
```bash
# Verificar processos usando a porta
netstat -ano | findstr :8080  # Windows
lsof -i :8080  # Linux/macOS

# Parar processo se necessário
taskkill /PID <PID> /F  # Windows
kill -9 <PID>  # Linux/macOS
```

**2. Erro de permissão no mvnw:**
```bash
# Dar permissão de execução (Linux/macOS)
chmod +x mvnw
```

**3. Erro de CORS:**
- Verifique se ambos os serviços estão rodando
- Confirme as portas corretas (8080 e 3000)
- Verifique a configuração em `CorsConfig.java`

**4. Falha na instalação npm:**
```bash
# Limpar cache e reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Verificação de Saúde

**Verificar Backend:**
```bash
curl http://localhost:8080/api/drones
```

**Verificar Frontend:**
- Acesse `http://localhost:3000`
- Verifique se não há erros no console do navegador

## 📊 Monitoramento

### Logs em Tempo Real

**Backend:**
- Os logs aparecem no terminal onde o servidor foi executado
- Procure por `Started DroneDeliveryApplication` para confirmar inicialização

**Frontend:**
- Logs aparecem no terminal do React
- Console do navegador (F12) mostra erros e debug

### Métricas

Acesse estas seções na aplicação para monitorar:
- **Dashboard**: Visão geral do sistema
- **Mapa das Entregas**: Status em tempo real
- **Gestão de Pedidos**: Fila e entregas

## 🔄 Reinicialização

Para reiniciar completamente o sistema:

1. **Parar serviços** (Ctrl+C em ambos os terminais)
2. **Limpar caches** (opcional):
   ```bash
   # Backend
   cd src/server && ./mvnw clean
   
   # Frontend
   cd src/client && npm cache clean --force
   ```
3. **Reiniciar ambos os serviços**

## 🆘 Suporte

Se encontrar problemas:

1. **Verifique os pré-requisitos** estão instalados corretamente
2. **Confirme as portas** estão livres (8080 e 3000)
3. **Verifique os logs** para mensagens de erro específicas
4. **Teste as APIs** diretamente via browser ou Postman

---

**Documentação criada para o Desafio Técnico DTI Digital** 🚀
