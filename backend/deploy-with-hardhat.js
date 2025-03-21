const hre = require("hardhat");

async function main() {
  try {
    console.log("Deploying PropertyToken contract...");
    
    // Get the contract factory
    const PropertyToken = await hre.ethers.getContractFactory("PropertyToken");
    
    // Deploy the contract
    const propertyToken = await PropertyToken.deploy(
      "Ocean View Condo", // name
      "OVC",              // symbol
      hre.ethers.parseEther("1000"),  // 1000 tokens
      hre.ethers.parseEther("0.1")    // 0.1 ETH per token
    );
    
    // Wait for deployment to complete
    await propertyToken.waitForDeployment();
    const contractAddress = await propertyToken.getAddress();
    
    console.log("PropertyToken deployed to:", contractAddress);
    
    // Update the mock data in server.js with the actual contract address
    const fs = require("fs");
    const path = require("path");
    const serverJsPath = path.join(__dirname, "server.js");
    let serverJs = fs.readFileSync(serverJsPath, "utf8");
    
    // Replace the mock contract address with the actual one
    serverJs = serverJs.replace(
      /contractAddress: '0x[0-9a-fA-F]{40}'/g,
      `contractAddress: '${contractAddress}'`
    );
    
    fs.writeFileSync(serverJsPath, serverJs);
    console.log("Updated server.js with the actual contract address");
    
    return contractAddress;
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
