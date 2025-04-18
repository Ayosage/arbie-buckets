const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Get network name for deployment records
  const networkName = network.name;
  console.log(`Deploying ConnectionTest contract to ${networkName}...`);
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  
  // Log the deployer address and balance
  const balanceBefore = await ethers.provider.getBalance(deployerAddress);
  console.log(`Deploying with account: ${deployerAddress}`);
  console.log(`Account balance: ${balanceBefore} ETH`);
  
  // Deploy the ConnectionTest contract
  const ConnectionTestFactory = await ethers.getContractFactory("ConnectionTest");
  console.log("Deploying ConnectionTest contract...");
  const connectionTest = await ConnectionTestFactory.deploy();
  await connectionTest.waitForDeployment();
  
  // Get contract address - in ethers v6, we need to use getAddress() method
  const contractAddress = await connectionTest.getAddress();
  console.log(`ConnectionTest contract deployed to: ${contractAddress}`);
  
  // Save the contract address to a deployment file
  const deploymentDir = path.join(__dirname, '../deployments', networkName);
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  // Get the deployment transaction hash
  const tx = await connectionTest.deploymentTransaction();
  const txHash = tx ? tx.hash : 'unknown';
  
  const deploymentData = {
    contract: "ConnectionTest",
    address: contractAddress,
    deployer: deployerAddress,
    timestamp: new Date().toISOString(),
    transactionHash: txHash,
  };
  
  fs.writeFileSync(
    path.join(deploymentDir, 'ConnectionTest.json'),
    JSON.stringify(deploymentData, null, 2)
  );
  
  console.log("Deployment information saved to:", path.join(deploymentDir, 'ConnectionTest.json'));
  
  // Output verification command
  console.log("\nTo verify this contract on Etherscan, run:");
  console.log(`npx hardhat verify --network ${networkName} ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
