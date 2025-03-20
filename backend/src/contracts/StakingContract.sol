// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract StakingContract is Ownable, ReentrancyGuard {
    IERC20 public token;
    uint256 public rewardRate; // Base APY rate (1e18 = 1%)
    uint256 public totalStaked;
    uint256 public maxStakeLimit;
    
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 lastRewardClaim;
    }
    
    struct Proposal {
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 endTime;
        bool executed;
        mapping(address => bool) hasVoted;
    }
    
    mapping(address => Stake) public stakes;
    mapping(address => uint256) public rewardBalance;
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    event ProposalCreated(uint256 indexed proposalId, string description);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support);
    
    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
        rewardRate = 1e18; // 1% base APY
        maxStakeLimit = 1000000 * 1e18; // 1 million tokens
    }
    
    function setRewardRate(uint256 _newRate) external onlyOwner {
        require(_newRate > 0, "Invalid reward rate");
        rewardRate = _newRate;
    }
    
    function stake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(totalStaked + _amount <= maxStakeLimit, "Stake limit reached");
        
        // Transfer tokens to contract
        require(token.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        // Update stake info
        if (stakes[msg.sender].amount > 0) {
            // Claim any pending rewards before updating stake
            _claimRewards();
        }
        
        stakes[msg.sender].amount += _amount;
        stakes[msg.sender].timestamp = block.timestamp;
        stakes[msg.sender].lastRewardClaim = block.timestamp;
        totalStaked += _amount;
        
        emit Staked(msg.sender, _amount);
    }
    
    function unstake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(stakes[msg.sender].amount >= _amount, "Insufficient staked balance");
        
        // Claim rewards before unstaking
        _claimRewards();
        
        // Update stake info
        stakes[msg.sender].amount -= _amount;
        totalStaked -= _amount;
        
        // Transfer tokens back to user
        require(token.transfer(msg.sender, _amount), "Transfer failed");
        
        emit Unstaked(msg.sender, _amount);
    }
    
    function calculateRewards(address _staker) public view returns (uint256) {
        if (stakes[_staker].amount == 0) return 0;
        
        uint256 duration = block.timestamp - stakes[_staker].lastRewardClaim;
        return (stakes[_staker].amount * rewardRate * duration) / (365 days * 100);
    }
    
    function _claimRewards() internal {
        uint256 reward = calculateRewards(msg.sender);
        if (reward > 0) {
            rewardBalance[msg.sender] += reward;
            stakes[msg.sender].lastRewardClaim = block.timestamp;
        }
    }
    
    function claimRewards() external nonReentrant {
        _claimRewards();
        uint256 reward = rewardBalance[msg.sender];
        require(reward > 0, "No rewards to claim");
        
        rewardBalance[msg.sender] = 0;
        require(token.transfer(msg.sender, reward), "Transfer failed");
        
        emit RewardClaimed(msg.sender, reward);
    }
    
    function createProposal(string memory _description, uint256 _duration) external {
        require(stakes[msg.sender].amount > 0, "Must be a staker to create proposal");
        
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        proposal.description = _description;
        proposal.endTime = block.timestamp + _duration;
        
        emit ProposalCreated(proposalId, _description);
    }
    
    function vote(uint256 _proposalId, bool _support) external {
        require(stakes[msg.sender].amount > 0, "Must be a staker to vote");
        Proposal storage proposal = proposals[_proposalId];
        
        require(block.timestamp < proposal.endTime, "Voting period ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        if (_support) {
            proposal.forVotes += stakes[msg.sender].amount;
        } else {
            proposal.againstVotes += stakes[msg.sender].amount;
        }
        
        proposal.hasVoted[msg.sender] = true;
        
        emit Voted(_proposalId, msg.sender, _support);
    }
    
    function getProposalDetails(uint256 _proposalId) external view returns (
        string memory description,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 endTime,
        bool executed
    ) {
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.description,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.endTime,
            proposal.executed
        );
    }
}
