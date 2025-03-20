const hre = require("hardhat");

async function main() {
  const PropertyToken = await hre.ethers.getContractFactory("PropertyToken");
  
  // Deploy with initial parameters
  const propertyToken = await PropertyToken.deploy(
    "Ocean View Condo", // name
    "OVC",             // symbol
    hre.ethers.parseEther("1000"),  // 1000 tokens
    hre.ethers.parseEther("0.1")    // 0.1 ETH per token
  );

  await propertyToken.waitForDeployment();
  const address = await propertyToken.getAddress();

  console.log("PropertyToken deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
