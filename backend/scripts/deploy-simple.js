// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Deploy SimplePropertyToken
  const SimplePropertyToken = await hre.ethers.getContractFactory("SimplePropertyToken");
  console.log("Deploying SimplePropertyToken...");
  
  const simplePropertyToken = await SimplePropertyToken.deploy(
    "Ocean View Condo",           // name
    "OVC",                        // symbol
    hre.ethers.parseEther("1000"), // 1000 tokens
    hre.ethers.parseEther("0.1")   // 0.1 ETH per token
  );

  await simplePropertyToken.waitForDeployment();
  const contractAddress = await simplePropertyToken.getAddress();
  
  console.log("SimplePropertyToken deployed to:", contractAddress);
  
  // Update the mock data in server.js with the actual contract address
  const serverJsPath = path.join(__dirname, "../server.js");
  let serverJs = fs.readFileSync(serverJsPath, "utf8");
  
  // Replace the mock contract address with the actual one
  serverJs = serverJs.replace(
    /contractAddress: '0x[0-9a-fA-F]{40}'/g,
    `contractAddress: '${contractAddress}'`
  );
  
  fs.writeFileSync(serverJsPath, serverJs);
  console.log("Updated server.js with the actual contract address");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
