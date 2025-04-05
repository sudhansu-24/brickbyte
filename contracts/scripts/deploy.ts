import { ethers } from "hardhat";

async function main() {
  console.log("Deploying RealEstateToken contract...");

  const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
  const realEstateToken = await RealEstateToken.deploy();

  await realEstateToken.waitForDeployment();
  const address = await realEstateToken.getAddress();

  console.log("RealEstateToken deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 