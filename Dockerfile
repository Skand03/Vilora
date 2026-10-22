# ==============================================================================
# Stage 1: Build the executable Spring Boot JAR with Maven & Java 21
# ==============================================================================
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Copy project descriptor first for efficient caching
COPY pom.xml .

# Copy source code
COPY src ./src

# Package application with explicit finalName 'app' configured in pom.xml
RUN mvn clean package -DskipTests --no-transfer-progress

# ==============================================================================
# Stage 2: Minimal, secure Java 21 runtime image for Render deployment
# ==============================================================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create a non-privileged user and writable directory for uploads fallback
RUN addgroup -S spring && adduser -S spring -G spring \
    && mkdir -p /app/uploads/products \
    && chown -R spring:spring /app

# Copy the exact executable Spring Boot JAR produced by the build stage
COPY --from=builder --chown=spring:spring /build/target/app.jar /app/app.jar

# Run as non-root user
USER spring:spring

# Default Render port is 10000; Render overrides $PORT dynamically at runtime
ENV PORT=10000
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

EXPOSE 10000

# Use exec to ensure signals (SIGTERM) are handled gracefully by the JVM
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -Dserver.port=${PORT:-10000} -jar /app/app.jar"]
