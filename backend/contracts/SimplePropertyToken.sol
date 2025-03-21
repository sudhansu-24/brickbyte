// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimplePropertyToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    uint256 public tokenPrice;
    address public propertyOwner;
    
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event TokensPurchased(address indexed buyer, uint256 amount);
    
    constructor(string memory _name, string memory _symbol, uint256 initialSupply, uint256 _tokenPrice) {
        name = _name;
        symbol = _symbol;
        totalSupply = initialSupply;
        tokenPrice = _tokenPrice;
        propertyOwner = msg.sender;
        _balances[msg.sender] = initialSupply;
        emit Transfer(address(0), msg.sender, initialSupply);
    }
    
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address to, uint256 amount) public returns (bool) {
        address owner = msg.sender;
        _transfer(owner, to, amount);
        return true;
    }
    
    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function approve(address spender, uint256 amount) public returns (bool) {
        address owner = msg.sender;
        _approve(owner, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        address spender = msg.sender;
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }
    
    function buyTokens(uint256 amount) public payable {
        require(amount > 0, "Amount must be greater than 0");
        // Convert amount to tokens with decimals
        uint256 tokenAmount = amount * (10 ** uint256(decimals));
        require(_balances[propertyOwner] >= tokenAmount, "Not enough tokens available");
        require(msg.value >= amount * tokenPrice, "Insufficient payment");
        _transfer(propertyOwner, msg.sender, tokenAmount);
        emit TokensPurchased(msg.sender, tokenAmount);
    }
    
    function getTokenPrice() public view returns (uint256) {
        return tokenPrice;
    }
    
    function getAvailableTokens() public view returns (uint256) {
        return _balances[propertyOwner];
    }
    
    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "Transfer from the zero address");
        require(to != address(0), "Transfer to the zero address");
        
        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "Transfer amount exceeds balance");
        
        _balances[from] = fromBalance - amount;
        _balances[to] += amount;
        
        emit Transfer(from, to, amount);
    }
    
    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "Approve from the zero address");
        require(spender != address(0), "Approve to the zero address");
        
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
    
    function _spendAllowance(address owner, address spender, uint256 amount) internal {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "Insufficient allowance");
            _approve(owner, spender, currentAllowance - amount);
        }
    }
}
