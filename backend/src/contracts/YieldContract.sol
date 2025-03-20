// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract YieldContract is Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    IERC20 public token;
    uint256 public totalYieldPool;
    uint256 public lastDistributionTime;
    uint256 public distributionInterval;
    uint256 public minDistributionAmount;

    struct YieldInfo {
        uint256 pendingYield;
        uint256 lastClaimTime;
        uint256 totalClaimed;
    }

    mapping(address => YieldInfo) public yields;
    mapping(uint256 => uint256) public monthlyRentalIncome;

    event YieldDistributed(uint256 amount, uint256 timestamp);
    event YieldWithdrawn(address indexed user, uint256 amount);
    event RentalIncomeUpdated(uint256 month, uint256 amount);

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
        distributionInterval = 30 days;
        minDistributionAmount = 0.01 ether;
        lastDistributionTime = block.timestamp;
    }

    function updateRentalIncome(uint256 _month, uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be greater than 0");
        monthlyRentalIncome[_month] = _amount;
        emit RentalIncomeUpdated(_month, _amount);
    }

    function distributeYield() external nonReentrant {
        require(block.timestamp >= lastDistributionTime.add(distributionInterval), "Too early");
        require(totalYieldPool >= minDistributionAmount, "Insufficient yield pool");

        uint256 totalSupply = token.totalSupply();
        require(totalSupply > 0, "No tokens in circulation");

        uint256 currentMonth = block.timestamp.div(30 days);
        uint256 monthlyYield = monthlyRentalIncome[currentMonth];
        require(monthlyYield > 0, "No rental income for current month");

        totalYieldPool = totalYieldPool.add(monthlyYield);

        // Calculate yield per token
        uint256 yieldPerToken = totalYieldPool.div(totalSupply);

        // Update yield balances for all token holders
        address[] memory holders = getTokenHolders(); // This would be implemented in the token contract
        for (uint256 i = 0; i < holders.length; i++) {
            address holder = holders[i];
            uint256 balance = token.balanceOf(holder);
            if (balance > 0) {
                uint256 holderYield = balance.mul(yieldPerToken);
                yields[holder].pendingYield = yields[holder].pendingYield.add(holderYield);
            }
        }

        lastDistributionTime = block.timestamp;
        totalYieldPool = 0;

        emit YieldDistributed(monthlyYield, block.timestamp);
    }

    function withdrawYield() external nonReentrant {
        YieldInfo storage userYield = yields[msg.sender];
        uint256 amount = userYield.pendingYield;
        require(amount > 0, "No yield available");

        userYield.pendingYield = 0;
        userYield.lastClaimTime = block.timestamp;
        userYield.totalClaimed = userYield.totalClaimed.add(amount);

        require(token.transfer(msg.sender, amount), "Transfer failed");
        emit YieldWithdrawn(msg.sender, amount);
    }

    function calculatePendingYield(address _user) external view returns (uint256) {
        return yields[_user].pendingYield;
    }

    function getYieldInfo(address _user) external view returns (
        uint256 pendingYield,
        uint256 lastClaimTime,
        uint256 totalClaimed
    ) {
        YieldInfo memory info = yields[_user];
        return (info.pendingYield, info.lastClaimTime, info.totalClaimed);
    }

    function setDistributionInterval(uint256 _interval) external onlyOwner {
        require(_interval > 0, "Invalid interval");
        distributionInterval = _interval;
    }

    function setMinDistributionAmount(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Invalid amount");
        minDistributionAmount = _amount;
    }

    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(token.transfer(owner(), balance), "Transfer failed");
    }

    function getTokenHolders() internal pure returns (address[] memory) {
        // This is a placeholder. In reality, you would implement this in your token contract
        // or maintain a separate mapping of token holders
        address[] memory holders = new address[](0);
        return holders;
    }
}
