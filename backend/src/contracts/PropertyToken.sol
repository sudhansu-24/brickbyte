// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PropertyToken is ERC20 {
    uint256 public tokenPrice;
    address public propertyOwner;

    event TokensPurchased(address indexed buyer, uint256 amount);

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 _tokenPrice
    ) ERC20(name, symbol) {
        propertyOwner = msg.sender;
        tokenPrice = _tokenPrice;
        _mint(msg.sender, initialSupply);
    }

    function buyTokens(uint256 amount) public payable {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(propertyOwner) >= amount, "Not enough tokens available");
        require(msg.value >= amount * tokenPrice, "Insufficient payment");

        _transfer(propertyOwner, msg.sender, amount);
        emit TokensPurchased(msg.sender, amount);

        if (msg.value > amount * tokenPrice) {
            payable(msg.sender).transfer(msg.value - (amount * tokenPrice));
        }
    }

    function getTokenPrice() public view returns (uint256) {
        return tokenPrice;
    }

    function getAvailableTokens() public view returns (uint256) {
        return balanceOf(propertyOwner);
    }
}
