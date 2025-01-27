# FIRST STAGE: Building stage
FROM alpine/java:22-jdk as builder
WORKDIR /app/server-backend-hotel

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
FROM openjdk:23-ea-21-jdk

WORKDIR /app

# Copy and rename the JAR
COPY --from=builder /app/server-backend-hotel/target/hotel-0.0.1-SNAPSHOT.jar /app/app-server-hotel.jar

# Expose port (adjust if necessary)
EXPOSE 8111

# Entry point
ENTRYPOINT ["java", "-jar", "app-server-hotel.jar"]



# docker build --no-cache -t hoz:v1 . -f ./server-administrator/Dockerfile
# docker run -p 8003:80 -d --rm --name msvc-cursos --network spring cursos:v1
#./mvnw.cmd clean install  package -DskipTests


