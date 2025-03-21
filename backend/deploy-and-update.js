const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Path to the SimplePropertyToken contract
const contractPath = path.join(__dirname, 'contracts', 'SimplePropertyToken.sol');

// Path to the server.js file
const serverPath = path.join(__dirname, 'server.js');

async function main() {
  try {
    console.log('Starting deployment process...');
    
    // Connect to local Hardhat node
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");
    
    // Get the deployer account
    const accounts = await provider.listAccounts();
    const deployer = accounts[0];
    console.log('Deployer account:', deployer.address);
    
    // Check if the contract file exists
    if (!fs.existsSync(contractPath)) {
      console.error(`Contract file not found at ${contractPath}`);
      console.log('Creating a simple ERC20 token contract...');
      
      // Create a simple ERC20 token contract
      const contractCode = `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract SimplePropertyToken {\n    string public name;\n    string public symbol;\n    uint8 public decimals = 18;\n    uint256 public totalSupply;\n    uint256 public tokenPrice;\n    address public propertyOwner;\n\n    mapping(address => uint256) private _balances;\n\n    event Transfer(address indexed from, address indexed to, uint256 value);\n    event TokensPurchased(address indexed buyer, uint256 amount);\n\n    constructor(string memory _name, string memory _symbol, uint256 _totalSupply, uint256 _tokenPrice) {\n        name = _name;\n        symbol = _symbol;\n        totalSupply = _totalSupply;\n        tokenPrice = _tokenPrice;\n        propertyOwner = msg.sender;\n        _balances[propertyOwner] = totalSupply;\n    }\n\n    function balanceOf(address account) public view returns (uint256) {\n        return _balances[account];\n    }\n\n    function transfer(address to, uint256 amount) public returns (bool) {\n        address owner = msg.sender;\n        _transfer(owner, to, amount);\n        return true;\n    }\n\n    function _transfer(address from, address to, uint256 amount) internal {\n        require(from != address(0), "Transfer from zero address");\n        require(to != address(0), "Transfer to zero address");\n        require(_balances[from] >= amount, "Transfer amount exceeds balance");\n\n        _balances[from] -= amount;\n        _balances[to] += amount;\n        emit Transfer(from, to, amount);\n    }\n\n    function getTokenPrice() public view returns (uint256) {\n        return tokenPrice;\n    }\n\n    function getAvailableTokens() public view returns (uint256) {\n        return _balances[propertyOwner];\n    }\n\n    function buyTokens(uint256 amount) public payable {\n        require(amount > 0, "Amount must be greater than 0");\n        require(_balances[propertyOwner] >= amount, "Not enough tokens available");\n        require(msg.value >= amount * tokenPrice, "Insufficient payment");\n        _transfer(propertyOwner, msg.sender, amount);\n        emit TokensPurchased(msg.sender, amount);\n    }\n}\n`;
      
      // Create the contracts directory if it doesn't exist
      const contractsDir = path.dirname(contractPath);
      if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
      }
      
      // Write the contract to the file
      fs.writeFileSync(contractPath, contractCode);
      console.log(`Contract file created at ${contractPath}`);
    }
    
    // Compile the contract
    console.log('Compiling the contract...');
    const solc = require('solc');
    
    const contractSource = fs.readFileSync(contractPath, 'utf8');
    
    const input = {
      language: 'Solidity',
      sources: {
        'SimplePropertyToken.sol': {
          content: contractSource
        }
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['*']
          }
        }
      }
    };
    
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    const contractOutput = output.contracts['SimplePropertyToken.sol']['SimplePropertyToken'];
    
    // Deploy the contract
    console.log('Deploying the contract...');
    const abi = contractOutput.abi;
    const bytecode = contractOutput.evm.bytecode.object;
    
    const factory = new ethers.ContractFactory(abi, bytecode, deployer);
    
    const contract = await factory.deploy(
      "Ocean View Condo", // name
      "OVC",             // symbol
      ethers.parseEther("1000"),  // 1000 tokens
      ethers.parseEther("0.1")    // 0.1 ETH per token
    );
    
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log(`Contract deployed to: ${contractAddress}`);
    
    // Update the server.js file with the new contract address
    console.log('Updating server.js with the new contract address...');
    
    // Read the server.js file
    let serverContent = fs.readFileSync(serverPath, 'utf8');
    
    // Replace the mock contract address
    const mockAddressRegex = /(contractAddress:\s*['"])([^'"]*)['"]\s*,/g;
    serverContent = serverContent.replace(mockAddressRegex, `$1${contractAddress}$3,`);
    
    // Write the updated content back to the file
    fs.writeFileSync(serverPath, serverContent);
    
    console.log('Server.js updated with the new contract address');
    console.log('Deployment process completed successfully!');
    
    return {
      contractAddress,
      abi
    };
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
