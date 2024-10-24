# Stage 1: Build the Rust Ingestion Service
FROM rust:1.70 as builder

# Set the working directory inside the container
WORKDIR /usr/src/ingestion_service

# Install system dependencies (if any)
# RUN apt-get update && apt-get install -y libssl-dev pkg-config

# Copy the Cargo.toml and Cargo.lock files
COPY Cargo.toml Cargo.lock ./

# Create an empty src directory to cache dependencies
RUN mkdir src
RUN echo "fn main() {}" > src/main.rs

# Build the dependencies to cache them
RUN cargo build --release
RUN rm -rf src

# Copy the actual source code
COPY src ./src

# Build the actual application
RUN cargo build --release

# Stage 2: Create the final minimal image
FROM debian:buster-slim

# Install required system libraries
RUN apt-get update && apt-get install -y libssl1.1 ca-certificates && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /usr/local/bin

# Copy the compiled binary from the builder stage
COPY --from=builder /usr/src/ingestion_service/target/release/ingestion_service .

# Ensure the binary has execute permissions
RUN chmod +x ingestion_service

# Set environment variables
# It's recommended to pass sensitive data like passwords via Docker secrets or environment variables at runtime
ENV DATABASE_URL=postgres://explorer_user:securepassword@db/bitcoin_explorer
ENV BITCOIN_RPC_URL=http://bitcoin:8332
ENV BITCOIN_RPC_USER=your_rpc_username
ENV BITCOIN_RPC_PASSWORD=your_rpc_password

# Optionally, you can use a .env file and Docker secrets for better security
# COPY .env ./

# Expose ports if necessary (e.g., if the ingestion service has a web interface)
# EXPOSE 8080

# Define the default command to run the ingestion service
CMD ["./ingestion_service"]
