# Real Estate NFT Marketplace

Welcome to the Real Estate NFT Marketplace, a decentralized platform for buying, selling, and trading tokenized real estate properties as NFTs. This project combines the power of blockchain technology with the real estate market, offering a new way to invest in and manage property ownership.

## Deployment

The Real Estate NFT Marketplace is live and accessible at:

[https://real-estate-nft-market-place.vercel.app/](https://real-estate-nft-market-place.vercel.app/)

Feel free to visit the deployed application to explore its features and functionality.

## Features

- Mint and list real estate properties as NFTs
- Buy and sell property NFTs using cryptocurrency (MATIC)
- View detailed property information including location, type, and price
- User-friendly interface for easy navigation and transactions
- Secure, transparent, and decentralized operations
- Wallet connection and management

## Technology Stack

- Smart Contracts: Solidity
- Frontend: Next.js 14+ (React)
- Blockchain Interaction: ethers.js 6+
- Development Environment: Hardhat
- Styling: Tailwind CSS
- State Management: React Hooks
- Icons: Lucide React
- Database: Redis (for wallet data storage)

## Key Components

- Homepage with featured properties and market statistics
- Marketplace page for browsing all available properties
- Individual property listing pages
- Wallet connection functionality
- Search and filter capabilities for properties

## Project Structure

The project follows this structure:

```
/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── wallet/
│   │   │       └── route.ts
│   │   ├── create_listing/
│   │   │   └── page.tsx
│   │   ├── marketplace/
│   │   │   └── page.tsx
│   │   ├── search/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── navbar.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── hooks/
│   │   └── useWalletConnection.ts
│   ├── lib/
│   │   └── redis.ts
│   ├── styles/
│   └── utils/
├── web3/
│   └── contracts/
│       └── NFTMarketplace.sol
├── .env
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MetaMask browser extension
- Hardhat

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

3. Deploy the smart contract:
   - Navigate to the `web3` directory:
     ```
     cd web3
     ```
   - Compile the contract:
     ```
     npx hardhat compile
     ```
   - Deploy the contract to your chosen network (e.g., Mumbai testnet):
     ```
     npx hardhat run scripts/deploy.js --network mumbai
     ```
   - Note down the deployed contract address

4. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
     REDIS_URL=your_redis_url
     ```
   - Replace `your_deployed_contract_address` with the address you noted in step 3

5. Start the development server:
   ```
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Connect your MetaMask wallet to the application
2. Browse featured properties on the homepage
3. Explore all properties in the marketplace
4. Use the search functionality to find specific properties
5. View detailed information about each property
6. Make offers on properties or buy them directly
7. List your own property by creating a new listing

## Smart Contract

The project uses a smart contract (`NFTMarketplace.sol`) located in the `web3/contracts/` directory. This contract handles the creation, listing, and trading of property NFTs. Key functions include:

- `createToken`: Mint a new NFT
- `listProperty`: List a property for sale
- `buyProperty`: Purchase a listed property
- `fetchAvailableProperties`: Get all available properties for sale

To interact with the contract, ensure you have deployed it and updated the `.env` file with the correct contract address.

## Data Storage

- Property data is stored on the blockchain
- Wallet connection data is stored in Redis for persistence across sessions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.