const { ethers } = require("ethers");
const { writeFileSync } = require("fs");
require("dotenv").config();

async function main() {
  try {
    console.log("Starting deployment process...");

    // Connect to the Polygon Amoy network
    const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_RPC_URL);

    // Create a signer
    const privateKey = process.env.PRIVATE_KEY;
    const signer = new ethers.Wallet(privateKey, provider);

    // Get the contract bytecode and ABI
    const NFTMarketplace = require("./artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json");

    // Create a contract factory
    const factory = new ethers.ContractFactory(NFTMarketplace.abi, NFTMarketplace.bytecode, signer);

    // Deploy the contract
    const nftMarketplace = await factory.deploy();

    await nftMarketplace.waitForDeployment();

    const nftMarketplaceAddress = await nftMarketplace.getAddress();

    // Get latest block
    const block = await provider.getBlock("latest");
    console.log("Deployed in block:", block.number);

    // Get network information
    const network = await provider.getNetwork();

    // Save deployment info to a file
    const deploymentInfo = {
      contractName: "NFTMarketplace",
      contractAddress: nftMarketplaceAddress,
      deployerAddress: await signer.getAddress(),
      network: network.name,
      chainId: network.chainId.toString(), 
      deploymentBlock: block.number,
      timestamp: new Date().toISOString(),
      transactionHash: nftMarketplace.deploymentTransaction().hash,
    };

    writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment info saved to deployment-info.json");

    console.log("Deployment completed successfully!");

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("An unexpected error occurred:", error);
  process.exitCode = 1;
});