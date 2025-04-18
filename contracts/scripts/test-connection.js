const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const networkName = network.name;
  console.log(`Testing ConnectionTest contract on ${networkName}...`);
  
  // Get contract address from deployment file
  const deploymentPath = path.join(__dirname, '../deployments', networkName, 'ConnectionTest.json');
  
  if (!fs.existsSync(deploymentPath)) {
    console.error(`No deployment found for network ${networkName}.`);
    console.error(`Please deploy the contract first using: npx hardhat run scripts/deploy-connection-test.js --network ${networkName}`);
    process.exit(1);
  }
  
  const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const contractAddress = deploymentData.address;
  
  // Get signer for transactions
  const [signer] = await ethers.getSigners();
  
  // Get contract instance
  const ConnectionTest = await ethers.getContractFactory("ConnectionTest");
  const connectionTest = ConnectionTest.attach(contractAddress).connect(signer);
  
  // Get current message
  console.log("Getting current message...");
  const currentMessage = await connectionTest.message();
  console.log(`Current message: "${currentMessage}"`);
  
  // Set a new message
  const newMessage = "Hello, Base Sepolia!";
  console.log(`Setting new message: "${newMessage}"...`);
  const tx = await connectionTest.setMessage(newMessage);
  await tx.wait();
  console.log("Transaction confirmed! Hash:", tx.hash);
  
  // Verify message was updated
  const updatedMessage = await connectionTest.message();
  console.log(`Updated message: "${updatedMessage}"`);
  
  if (updatedMessage === newMessage) {
    console.log("✅ Message successfully updated!");
  } else {
    console.log("❌ Message update failed!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Testing failed:", error);
    process.exit(1);
  });
