# Bitcoin Explorer

A project focused on building a Bitcoin Explorer that analyzes both on-chain and off-chain data metrics. This project can be completed individually or in groups of 1-3.

## Project Overview

- **On-chain Metric:** Choose a unique, insightful metric derived from blockchain data.
- **Off-chain Metric:** Choose another metric from an external data source.
- **User Interface:** Displays real-time data fetched from a database.
- **Database:** Ingests live data continuously from the Rust Bitcoin client.
- **Containerization:** Package the entire application using Docker.

## Project Parts & Deadlines

### Part 1: Minimal End-to-End Flow
- **Deliverable:** Simple end-to-end system with a UI, database, and data ingestion.
    - **Example Flow:**
        - **Database:** Single table storing block height.
        - **Ingestion:** Program calls the Bitcoin client to retrieve data and update the database.
        - **UI:** Displays block height in real-time.

### Part 2: Real-Time Visualizations
- **Deliverable:** Visualize real-time data for both on-chain and off-chain metrics. Take inspiration from existing blockchain explorers.

### Part 3: Production Grade
- **Deliverable:** Bug-free, high-performance app with real-time updates and CI/CD pipelines.
    - **CI/CD:** Set up Github actions to automate builds, testing, and deployment.

## Grading Criteria

- **60% Engineering Quality:** Bug-free, smooth performance.
- **40% Uniqueness:** Create something distinct from other explorers.

## Tools & Requirements

- **UI:** Type-safe languages (e.g., TypeScript).
- **Database:** SQL or graph-based database.
- **Ingestion:** Must use Rust for data extraction and loading.
- **Deployment:** Use Docker for containerization and GitHub workflows for CI/CD.

## Learning Outcomes

- Understand on-chain vs. off-chain data.
- Experience using Bitcoin clients and Rust.
- Build a production-grade app with real-time data and CI/CD deployment.

## FAQs

- Use APIs or run a "light" Bitcoin client mode if needed.
- Ensure a clean design, abstracting the data source (client or API) from the UI.
