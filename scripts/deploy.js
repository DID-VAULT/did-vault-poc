// This script deploys the VCRegistry contract.
async function main() {
  // 1. Get the deployer's account
  // hre.ethers.getSigners() returns a list of accounts from the wallet connected to Hardhat.
  // By default, it's the first account (index 0) that pays for the deployment.
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with the account:", deployer.address);

  // 2. Get the contract factory for VCRegistry, connected to our deployer
  // This is the corrected line: We pass the 'deployer' object here.
  // This tells Hardhat to use this account to sign and pay for the deployment transaction.
  const VCRegistry = await hre.ethers.getContractFactory("VCRegistry", deployer);
  
  console.log("Deploying VCRegistry contract...");

  // 3. Deploy the contract
  // Now, when we call deploy(), it uses the deployer's account.
  const vcRegistry = await VCRegistry.deploy();

  // 4. Wait for the deployment to be confirmed on the network
  await vcRegistry.waitForDeployment();

  // 5. Log the final contract address
  console.log(`VCRegistry contract deployed to: ${vcRegistry.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
