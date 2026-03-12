# ===== BUILD STAGE =====
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Descargar dependencias primero (aprovecha cache de Docker)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar código y compilar
COPY src ./src
RUN mvn clean package -DskipTests

# ===== RUN STAGE =====
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Crear carpetas para uploads de imágenes
RUN mkdir -p /app/uploads/eventos/fotos

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
