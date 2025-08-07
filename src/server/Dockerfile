# Etapa 1: Build com Maven
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos do projeto
COPY pom.xml .
COPY .mvn .mvn
COPY src ./src

# Baixar dependências e compilar a aplicação (sem testes)
RUN mvn clean package -DskipTests

# Etapa 2: Imagem final de runtime
FROM eclipse-temurin:21-jre-alpine

# Instalar curl para health checks (opcional)
RUN apk add --no-cache curl

# Criar usuário não-root
RUN addgroup -g 1001 -S spring && \
    adduser -S spring -u 1001 -G spring

# Definir diretório de trabalho
WORKDIR /app

# Copiar o JAR da etapa anterior
COPY --from=builder /app/target/drone-delivery-*.jar app.jar

# Alterar permissões
RUN chown spring:spring app.jar

# Alternar para o usuário não-root
USER spring

# Expor a porta configurada no application.properties
EXPOSE 8080

# Variáveis da JVM
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Comando para rodar a aplicação
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
