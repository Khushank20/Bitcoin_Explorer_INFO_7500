# Bitcoin Explorer

This project builds a **Bitcoin Explorer**, a web application that tracks and visualizes data derived from both **on-chain** and **off-chain** metrics, using real-time data ingestion and a responsive user interface.

## Project Overview

- **Objective**: To provide real-time visualization of Bitcoin blockchain data through a user interface. The system ingests data from the Bitcoin network and provides insights based on both on-chain and off-chain metrics.
- **Key Metrics**: 
  - One metric from on-chain data (e.g., **block height**).
  - One metric from off-chain data (e.g., **transaction fees** from a third-party API).
  
## Features

1. **Real-time Data Ingestion**: 
   - A Rust-based ingestion service that continuously collects on-chain data from the Bitcoin client.
   - Off-chain data is retrieved using third-party APIs.
   
2. **Database**: 
   - Stores both on-chain and off-chain data using a SQL or graph database.
   
3. **User Interface**:
   - Built with **TypeScript** for type-safety.
   - Displays real-time updates using a **React** frontend.
   - Dockerized for easy deployment.

4. **Metrics Display**:
   - Visualization of block height (on-chain).
   - Visualization of an off-chain metric (e.g., transaction volume or fees).

## Project Structure

```bash
.
├── backend
│   ├── src
│   ├── .env
│   ├── .gitignore
│   ├── Dockerfile
│   ├── index.ts
│   ├── package-lock.json
│   ├── package.json
│   └── tsconfig.json
├── frontend
│   ├── build
│   ├── node_modules
│   ├── public
│   ├── src
│   ├── .gitignore
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   └── tsconfig.json
└── ingestion_service
    ├── src
    ├── main.rs
    ├── target
    ├── tests
    ├── .env
    ├── .gitignore
    ├── Cargo.lock
    ├── Cargo.toml
    ├── Dockerfile
    ├── package-lock.json
    └── package.json

## Components

### Backend:
- Handles API requests and communication with the database.
- Built with **Node.js** and **TypeScript**.

### Frontend:
- User interface for displaying real-time data visualizations.
- Built with **React.js** and **TypeScript**.

### Ingestion Service:
- Written in **Rust**, continually pulls data from the Bitcoin client and stores it in the database.

## Setup Instructions

### Prerequisites
- **Docker**: Ensure you have Docker installed to build and run the application.
- **Rust**: The ingestion service requires Rust.
- **Node.js**: Required for both backend and frontend development.

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/your-repo/bitcoin-explorer.git
    cd bitcoin-explorer
    ```

2. Install dependencies for the backend and frontend:
    ```bash
    # Backend
    cd backend
    npm install
    
    # Frontend
    cd ../frontend
    npm install
    
    # Ingestion Service
    cd ../ingestion_service
    cargo build
    ```

3. Build the Docker images:
    ```bash
    docker-compose build
    ```

4. Run the application:
    ```bash
    docker-compose up
    ```

5. Access the application at `http://localhost:3000`.

## Usage

### User Interface:
- Displays the current block height and other chosen metrics.
- Auto-updates every few seconds to reflect real-time data.

### Ingestion:
- The Rust-based service runs in the background, continuously fetching and updating the data in the database.

## Development Notes

### Database Schema:
- Initial schema includes a table for **block height**.
- Schema can be extended to store additional on-chain and off-chain metrics.

### Docker Support:
- The application is fully containerized using Docker.
- Supports continuous integration and deployment using **GitHub Actions**.

## Roadmap

1. **Part 1**: Implement a minimal end-to-end flow.
   - Simple display of block height on the user interface.
   
2. **Part 2**: Add real-time visualizations for both on-chain and off-chain metrics.
   - Enhance UI to include unique, interesting metrics beyond block height.
   
3. **Part 3**: Achieve production-grade performance.
   - Ensure smooth, real-time updates and a bug-free experience.
   - Implement CI/CD pipelines for seamless deployment.

## Learning Outcomes

- Working with **on-chain** and **off-chain** data.
- Integrating **Rust** for data ingestion.
- Building end-to-end production-ready applications.
- Deploying applications with **Docker** and **CI/CD** pipelines.

## License

This project is licensed under the MIT License.
