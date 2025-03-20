const ethers = require('ethers');
const PropertyTokenArtifact = require('../contracts/artifacts/contracts/PropertyToken.sol/PropertyToken.json');

class BlockchainService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`);
    this.wallet = new ethers.Wallet(process.env.ETH_PRIVATE_KEY, this.provider);
  }

  async deployContract(name, symbol, totalSupply, tokenPrice) {
    const factory = new ethers.ContractFactory(
      PropertyTokenArtifact.abi,
      PropertyTokenArtifact.bytecode,
      this.wallet
    );

    const contract = await factory.deploy(
      name,
      symbol,
      ethers.parseEther(totalSupply.toString()),
      ethers.parseEther(tokenPrice.toString())
    );

    await contract.waitForDeployment();
    return await contract.getAddress();
  }

  async getContract(contractAddress) {
    return new ethers.Contract(
      contractAddress,
      PropertyTokenArtifact.abi,
      this.wallet
    );
  }

  async buyTokens(contractAddress, amount, value) {
    const contract = await this.getContract(contractAddress);
    const tx = await contract.buyTokens(
      amount,
      { value }
    );
    return await tx.wait();
  }

  async getTokenBalance(contractAddress, address) {
    const contract = await this.getContract(contractAddress);
    const balance = await contract.balanceOf(address);
    return ethers.formatEther(balance);
  }

  async sellTokens(contractAddress, amount, userAddress) {
    const contract = await this.getContract(contractAddress);
    const tx = await contract.transfer(userAddress, ethers.parseEther(amount.toString()));
    return await tx.wait();
  }

  async getTokenPrice(contractAddress) {
    const contract = await this.getContract(contractAddress);
    const price = await contract.getTokenPrice();
    return ethers.formatEther(price);
  }

  async getMarketStats(contractAddress) {
    const contract = await this.getContract(contractAddress);
    const [volume, holders] = await Promise.all([
      contract.getVolume(),
      contract.getHolderCount()
    ]);

    return {
      volume: ethers.formatEther(volume),
      holders: holders.toString(),
      liquidity: '100000' // Mock value for testing
    };
  }
}

module.exports = new BlockchainService();
