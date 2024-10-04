# Real Estate NFT Marketplace

Welcome to the Real Estate NFT Marketplace, a decentralized platform for buying, selling, and trading tokenized real estate properties as NFTs. This project combines the power of blockchain technology with the real estate market, offering a new way to invest in and manage property ownership.

## Deployment

The Real Estate NFT Marketplace is deployed at:
**[https://real-estate-nft-market-place.vercel.app/](https://real-estate-nft-market-place.vercel.app/)**

## Features

- Mint and list real estate properties as NFTs
- Buy and sell property NFTs using cryptocurrency
- View detailed property information and history
- User-friendly interface for easy navigation and transactions
- Secure, transparent, and decentralized operations
- Persistent wallet connection using Redis
## Technology Stack

- Smart Contracts: Solidity
- Frontend: Next.js (React)
- Blockchain Interaction: ethers.js
- Development Environment: Hardhat
- Styling: Tailwind CSS
- Database: Redis (Upstash)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MetaMask browser extension

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
     NEXT_PUBLIC_RPC_URL=your_rpc_url
     UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
     UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
     ```

4. Compile and deploy smart contracts:
   ```
   cd web3
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network mumbai
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

### Docker Setup (Optional)
Prerequisites

- Docker installed on your machine
- Docker Hub account (for publishing)

### Building the Docker Image

- Ensure you're in the root directory of the project.
- Build the Docker image:
docker build -t <image-name>.

- Once the build is complete, you can run the container locally:
docker run -p 3000:3000 -p 6379:6379 <image-name>

Access the application at http://localhost:3000

## Metamask Configuration for Polygon Mumbai

To interact with the marketplace on the Polygon Mumbai testnet, you need to configure your Metamask wallet:

1. Open Metamask and click on the network dropdown at the top.
2. Select "Add Network" and then "Add a network manually".
3. Fill in the following details:
   - Network Name: Polygon Mumbai
   - New RPC URL: https://rpc-mumbai.maticvigil.com/
   - Chain ID: 80001
   - Currency Symbol: MATIC
   - Block Explorer URL: https://mumbai.polygonscan.com/

## Getting MATIC from Faucets

To interact with the marketplace, you'll need test MATIC tokens. Here are some faucets where you can get free test MATIC:

1. [Polygon Faucet](https://faucet.polygon.technology/)
2. [Alchemy Mumbai Faucet](https://mumbaifaucet.com/)

Steps to get test MATIC:
1. Copy your Metamask wallet address
2. Visit one of the faucet websites
3. Paste your wallet address and request the tokens
4. Wait for the transaction to complete (usually takes a few seconds)
5. The test MATIC will appear in your Metamask wallet on the Mumbai network

Remember, these are test tokens and have no real value.

## Usage

1. Connect your MetaMask wallet to the application
2. Ensure you're on the Polygon Mumbai network and have test MATIC
3. Browse listed properties on the marketplace
4. List your own property by minting a new NFT
5. Make offers on properties or buy them directly
6. Manage your owned properties in your profile