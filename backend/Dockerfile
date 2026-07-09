# FIRST STAGE: Building stage
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app/furniture-store-backend

# Copy main pom and other necessary files
COPY ./.mvn ./.mvn
COPY ./mvnw .

# Copy the project-specific pom.xml
COPY ./pom.xml .

# Download dependencies only
RUN ./mvnw clean package -Dmaven.test.skip -Dmaven.main.skip -Dspring-boot.repackage.skip && rm -r ./target/

# Copy source code
COPY ./src ./src

# Build JAR, skipping tests
RUN ./mvnw clean package -DskipTests



# SECOND STAGE: Final image creation
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy and rename the JAR
COPY --from=builder /app/furniture-store-backend/target/furniture-store-backend-0.0.1-SNAPSHOT.jar /app/app-furniture-store-backend.jar

# Expose port (adjust if necessary)
EXPOSE 8080

# Entry point
ENTRYPOINT ["java", "-jar", "app-furniture-store-backend.jar"]

# docker build --no-cache -t furniture-store-backend:v1 -f ./Dockerfile . (run from backend/)
