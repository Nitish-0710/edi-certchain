# 🎓 CertChain — Blockchain-Based Digital Credential Management System

A decentralized system for issuing, storing, and verifying academic credentials using **Ethereum blockchain**, **IPFS (Pinata)**, and a **React + Node.js** full-stack application.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, shadcn/ui |
| **Backend** | Node.js, Express, Mongoose, JWT, Multer |
| **Database** | MongoDB |
| **Blockchain** | Solidity, Hardhat, ethers.js v6 |
| **File Storage** | IPFS via Pinata |
| **Wallet** | MetaMask |

## Features

- **Three roles**: Student, Issuer, Verifier
- **Issue credentials**: Upload PDF → SHA-256 hash → IPFS + Blockchain + MongoDB
- **Verify credentials**: Upload file or enter hash → instant blockchain verification
- **Revoke credentials**: Only the original issuer can revoke
- **MetaMask integration**: Real wallet connection
- **JWT authentication**: Secure login/register system

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally
- MetaMask browser extension

### 1. Clone & Install

```bash
git clone https://github.com/Nitish-0710/edi-certchain.git
cd edi-certchain

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
# Edit .env and fill in your Pinata JWT, JWT_SECRET, etc.
```

### 3. Start Local Blockchain

```bash
# Terminal 1 — Start Hardhat node
cd backend
npx hardhat node

# Terminal 2 — Deploy contract (once)
cd backend
npx hardhat run scripts/deploy.js --network localhost
# Copy the contract address to your .env file
```

### 4. Start Application

```bash
# Terminal 3 — Backend
cd backend
node server.js

# Terminal 4 — Frontend
cd frontend
npm run dev
```

Open **http://localhost:8080** in your browser.

## Architecture

```
Frontend (React) → Backend API (Express) → Blockchain (Hardhat/Ethereum)
                                        → IPFS (Pinata)
                                        → MongoDB (metadata)
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/auth/me` | Get profile |
| PUT | `/api/auth/wallet` | Link wallet |
| POST | `/api/uploadCredential` | Issue credential |
| GET | `/api/verifyCredential/:hash` | Verify credential |
| GET | `/api/credentials/:address` | Get student credentials |
| POST | `/api/revokeCredential` | Revoke credential |

## License

MIT
