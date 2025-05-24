import { ethers } from "hardhat";

async function main() {
  console.log("Deploying RealEstateToken contract on BNBtestnet...");

  const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
  const realEstateToken = await RealEstateToken.deploy();

  await realEstateToken.waitForDeployment();
  const address = await realEstateToken.getAddress();

  console.log("RealEstateToken deployed to:", address);

  // Wait for a few block confirmations before verifying
  console.log("Waiting for block confirmations...");
  await realEstateToken.deploymentTransaction()?.wait(5);

  // Verify the contract
  console.log("Verifying contract...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 