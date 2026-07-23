# FIRST STAGE: Building stage
FROM eclipse-temurin:25-jdk AS builder
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
FROM eclipse-temurin:25-jre

WORKDIR /app

# eclipse-temurin runs as root by default (unlike Confluent/Paketo images) -
# was never given a non-root user.
RUN groupadd --system spring && useradd --system --gid spring spring

# Copy and rename the JAR
COPY --from=builder /app/furniture-store-backend/target/furniture-store-backend-0.0.1-SNAPSHOT.jar /app/app-furniture-store-backend.jar
RUN chown spring:spring /app/app-furniture-store-backend.jar

USER spring

# Expose port (adjust if necessary)
EXPOSE 8080

# Entry point
ENTRYPOINT ["java", "-jar", "app-furniture-store-backend.jar"]

# docker build --no-cache -t furniture-store-backend:v1 -f ./Dockerfile . (run from backend/)
#
# Doc 3 note: both stages' base images (eclipse-temurin:21-jdk / 21-jre) are
# pinned to major-version-only tags, which drift as new patch builds land -
# same reproducibility gap as food-ordering-system's Buildpacks builder.
# Not pinning to an exact patch/digest here since I can't verify a current
# valid tag exists without network access in this pass; verify on
# hub.docker.com/_/eclipse-temurin yourself before pinning.
