const hre = require("hardhat");

async function main() {
  console.log("Deploying RealEstateToken contract...");

  const RealEstateToken = await hre.ethers.getContractFactory("RealEstateToken");
  const realEstateToken = await RealEstateToken.deploy();

  await realEstateToken.waitForDeployment();
  const address = await realEstateToken.getAddress();

  console.log("RealEstateToken deployed to:", address);
  console.log("Waiting for block confirmations...");

  // Wait for 5 block confirmations
  await realEstateToken.deploymentTransaction().wait(5);

  console.log("Contract verified on Etherscan!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 