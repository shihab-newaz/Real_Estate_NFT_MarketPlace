# Real Estate NFT Marketplace

![Marketplace Overview](https://github.com/yourusername/your-repo-name/raw/main/images/marketplace-overview.png)

Welcome to the Real Estate NFT Marketplace, a decentralized platform for buying, selling, and trading tokenized real estate properties as NFTs. This project combines the power of blockchain technology with the real estate market, offering a new way to invest in and manage property ownership.

## Features

- Mint and list real estate properties as NFTs
- Buy and sell property NFTs using cryptocurrency
- View detailed property information and history
- User-friendly interface for easy navigation and transactions
- Secure, transparent, and decentralized operations

## Technology Stack

- Smart Contracts: Solidity
- Frontend: Next.js (React)
- Blockchain Interaction: ethers.js
- Development Environment: Hardhat
- Styling: Tailwind CSS

## Screenshots

### Property Listing Page
![Property Listing](https://github.com/yourusername/your-repo-name/raw/main/images/property-listing.png)

### Buy Property Page
![Buy Property](https://github.com/yourusername/your-repo-name/raw/main/images/buy-property.png)

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
     ```

4. Compile and deploy smart contracts:
   ```
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network your_network
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Connect your MetaMask wallet to the application
2. Browse listed properties on the marketplace
3. List your own property by minting a new NFT
4. Make offers on properties or buy them directly
5. Manage your owned properties in your profile






## Contact

Your Name - [@your_twitter](https://twitter.com/your_twitter) - email@example.com

Project Link: [https://github.com/yourusername/your-repo-name](https://github.com/yourusername/your-repo-name)
