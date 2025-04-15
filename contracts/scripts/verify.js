const { run, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const networkName = network.name;
  console.log(`Verifying contract on ${networkName}...`);
  
  // Get contract address from deployment file
  const deploymentPath = path.join(__dirname, '../deployments', networkName, 'Arbitrage.json');
  
  if (!fs.existsSync(deploymentPath)) {
    console.error(`No deployment found for network ${networkName}.`);
    console.error(`Please deploy the contract first using: npx hardhat run scripts/deploy.js --network ${networkName}`);
    process.exit(1);
  }
  
  const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const contractAddress = deploymentData.address;
  
  console.log(`Verifying contract at address: ${contractAddress}`);
  
  try {
    // The Arbitrage contract doesn't have constructor arguments
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log("Contract verification successful!");
  } catch (error) {
    if (error.message.includes("already verified")) {
      console.log("Contract is already verified!");
    } else {
      console.error("Error verifying contract:", error);
      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });