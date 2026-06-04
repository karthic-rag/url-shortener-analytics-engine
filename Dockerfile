# Stage 1: Build the Vite React Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

# Copy frontend dependency files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source code
COPY frontend/ ./

# Build the frontend
RUN npm run build

# Stage 2: Build the Spring Boot Backend
FROM maven:3.9.6-eclipse-temurin-21-alpine AS backend-build
WORKDIR /app/backend

# Copy the pom.xml and download dependencies (for caching)
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

# Copy backend source code
COPY backend/src ./src

# Copy the built frontend artifacts into the backend's static resources directory
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static

# Build the Spring Boot application, skipping tests to speed up deployment
RUN mvn clean package -DskipTests

# Stage 3: Create the final production image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the compiled jar from the build stage
COPY --from=backend-build /app/backend/target/app.jar app.jar

# Render sets the PORT environment variable; Spring Boot will pick it up via application.properties
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
