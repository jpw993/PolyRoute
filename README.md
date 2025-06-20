# RouteAI

RouteAI is a Next.js application designed to find the optimal swap route for token conversions on the Polygon Blockchain. It leverages AI to analyze different DEXes and provide users with the most efficient trading paths.

## Core Features

- **Wallet Connection**: Connect your Ethereum wallet (e.g., MetaMask).
- **DEX Integration**: Interacts with top DEXes on the Polygon chain.
- **Route Optimization**: AI-powered optimal route finding for token swaps.
- **Visual Route Diagram**: Displays the optimal swap route clearly.
- **Transaction Simulation**: Preview transaction results before confirming.

## Tech Stack

- **Framework**: Next.js (App Router)
- **UI**: React, ShadCN UI, Tailwind CSS
- **AI**: Genkit
- **Blockchain Interaction**: Ethereum (Polygon Mainnet)

## Getting Started

To get this project up and running locally:

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Run the development server**:
    ```bash
    npm run dev
    ```
    This will start the Next.js application, typically on `http://localhost:9002`.

3.  **Run the Genkit development server (for AI flows)**:
    In a separate terminal, run:
    ```bash
    npm run genkit:dev
    ```
    Or, for automatic reloading on file changes:
    ```bash
    npm run genkit:watch
    ```
    Genkit tools usually start on `http://localhost:4000`.

## Project Structure

- `src/app/`: Contains the Next.js pages and layouts.
- `src/components/`: Reusable React components, including ShadCN UI components.
- `src/ai/`: Genkit AI flows and related logic.
  - `src/ai/flows/`: Specific AI flow implementations.
- `src/lib/`: Utility functions.
- `src/hooks/`: Custom React hooks.
- `public/`: Static assets.

This project was prototyped using Firebase Studio.
