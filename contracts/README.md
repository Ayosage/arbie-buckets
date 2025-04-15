# Arbitrage Smart Contract Deployment Guide

This directory contains the smart contracts for the trading-base platform, focusing on arbitrage opportunities across multiple exchanges on the Base Network.

## Prerequisites

- Node.js (v16+) and npm installed
- A funded wallet with ETH on your target network (Sepolia, Base Sepolia, or Base Mainnet)
- API keys for relevant services (Infura, Etherscan, etc.)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

3. Edit the `.env` file with your:
   - Private key (without 0x prefix)
   - RPC URLs
   - API keys

## Compile Contracts

```bash
npm run compile
```

## Deployment Options

### Deploy to a Local Development Network

Start a local network:
```bash
npm run node
```

In a new terminal, deploy to the local network:
```bash
npm run deploy:local
```

### Deploy to Testnets

**Sepolia:**
```bash
npm run deploy:sepolia
```

**Base Sepolia Testnet:**
```bash
npm run deploy:base-sepolia
```

### Deploy to Mainnet (Production)

**Base Mainnet:**
```bash
npm run deploy:base
```

⚠️ **IMPORTANT:** Make sure you understand the risks before deploying to mainnet, including:
- Transaction costs (gas fees)
- Contract security implications
- Production readiness of the code

## Verify Your Contract

After deployment, verify your contract on the blockchain explorer:

**Sepolia:**
```bash
npm run verify:sepolia
```

**Base Sepolia:**
```bash
npm run verify:base-sepolia
```

**Base Mainnet:**
```bash
npm run verify:base
```

## Contract Details

The `Arbitrage.sol` contract provides:
- Arbitrage trading between different exchanges on Base Network
- Settings management for trading parameters
- Opportunity tracking
- Emergency fund recovery

## Interacting with Deployed Contracts

After deployment, contract addresses are stored in:
```
deployments/<network>/Arbitrage.json
```

Use these addresses to interact with your contracts via your frontend application or directly through blockchain explorers.

## Testing

Run the test suite:
```bash
npm test
```

## Forked Network Development

For testing with mainnet state:
```bash
npm run node:fork
```

## Gas Usage Report

After running tests, check `gas-report.txt` for detailed gas usage analysis.