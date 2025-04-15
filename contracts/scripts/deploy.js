const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Get network name for deployment records
  const networkName = network.name;
  console.log(`Deploying contracts to ${networkName}...`);
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  
  // Log the deployer address and balance
  const balanceBefore = await ethers.provider.getBalance(deployerAddress);
  console.log(`Deploying contracts with the account: ${deployerAddress}`);
  console.log(`Account balance: ${ethers.utils.formatEther(balanceBefore)} ETH`);
  
  // Deploy the Arbitrage contract
  const ArbitrageFactory = await ethers.getContractFactory("Arbitrage");
  console.log("Deploying Arbitrage contract...");
  const arbitrage = await ArbitrageFactory.deploy();
  await arbitrage.deployed();
  
  // Log the deployment address
  console.log(`Arbitrage contract deployed to: ${arbitrage.address}`);
  
  // Get deployer balance after deployment to calculate gas spent
  const balanceAfter = await ethers.provider.getBalance(deployerAddress);
  const gasSpent = balanceBefore.sub(balanceAfter);
  console.log(`Gas spent on deployment: ${ethers.utils.formatEther(gasSpent)} ETH`);
  
  // Save the contract address to a deployment file
  const deploymentDir = path.join(__dirname, '../deployments', networkName);
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  const deploymentData = {
    contract: "Arbitrage",
    address: arbitrage.address,
    deployer: deployerAddress,
    timestamp: new Date().toISOString(),
    transactionHash: arbitrage.deployTransaction.hash,
  };
  
  fs.writeFileSync(
    path.join(deploymentDir, 'Arbitrage.json'),
    JSON.stringify(deploymentData, null, 2)
  );
  
  console.log("Deployment information saved to:", path.join(deploymentDir, 'Arbitrage.json'));
  
  // Wait for confirmations
  const waitBlocks = network.config.blockConfirmations || 1;
  await arbitrage.deployTransaction.wait(waitBlocks);
  console.log(`Confirmed with ${waitBlocks} block confirmations`);
  
  // Output verification command
  console.log("\nTo verify this contract on Etherscan, run:");
  console.log(`npx hardhat verify --network ${networkName} ${arbitrage.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });