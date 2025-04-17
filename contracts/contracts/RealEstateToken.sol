// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract RealEstateToken is ERC1155, Ownable, Pausable {
    // Struct to store property information
    struct Property {
        string name;
        string location;
        string description;
        string imageUri;
        uint256 totalShares;
        uint256 pricePerShare;
        uint256 rentalYield;
        address propertyOwner;
        bool isActive;
    }

    // Mapping from property ID to Property struct
    mapping(uint256 => Property) public properties;
    uint256 public propertyCount;

    // Events
    event PropertyListed(
        uint256 indexed propertyId,
        string name,
        string location,
        uint256 totalShares,
        uint256 pricePerShare
    );
    event PropertyPurchased(
        uint256 indexed propertyId,
        address indexed buyer,
        uint256 amount,
        uint256 totalPrice
    );
    event PropertySold(
        uint256 indexed propertyId,
        address indexed seller,
        uint256 amount,
        uint256 totalPrice
    );

    constructor() ERC1155("") Ownable() {
        _transferOwnership(msg.sender);
    }

    function listProperty(
        string memory name,
        string memory location,
        string memory description,
        string memory imageUri,
        uint256 totalShares,
        uint256 pricePerShare,
        uint256 rentalYield
    ) external whenNotPaused {
        require(totalShares > 0, "Total shares must be greater than 0");
        require(pricePerShare > 0, "Price per share must be greater than 0");
        require(rentalYield <= 100, "Rental yield cannot exceed 100%");

        uint256 propertyId = propertyCount++;
        properties[propertyId] = Property({
            name: name,
            location: location,
            description: description,
            imageUri: imageUri,
            totalShares: totalShares,
            pricePerShare: pricePerShare,
            rentalYield: rentalYield,
            propertyOwner: msg.sender,
            isActive: true
        });

        emit PropertyListed(propertyId, name, location, totalShares, pricePerShare);
    }

    function purchaseShares(
        uint256 propertyId,
        uint256 amount
    ) external payable whenNotPaused {
        Property storage property = properties[propertyId];
        require(property.isActive, "Property is not active");
        require(amount > 0, "Amount must be greater than 0");
        require(
            balanceOf(address(this), propertyId) + amount <= property.totalShares,
            "Not enough shares available"
        );

        uint256 totalPrice = amount * property.pricePerShare;
        require(msg.value >= totalPrice, "Insufficient payment");

        _mint(msg.sender, propertyId, amount, "");
        emit PropertyPurchased(propertyId, msg.sender, amount, totalPrice);
    }

    function sellShares(
        uint256 propertyId,
        uint256 amount
    ) external whenNotPaused {
        Property storage property = properties[propertyId];
        require(property.isActive, "Property is not active");
        require(amount > 0, "Amount must be greater than 0");
        require(
            balanceOf(msg.sender, propertyId) >= amount,
            "Insufficient shares"
        );

        uint256 totalPrice = amount * property.pricePerShare;
        _burn(msg.sender, propertyId, amount);
        payable(msg.sender).transfer(totalPrice);

        emit PropertySold(propertyId, msg.sender, amount, totalPrice);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function getProperty(uint256 propertyId) external view returns (Property memory) {
        return properties[propertyId];
    }

    function getPropertyCount() external view returns (uint256) {
        return propertyCount;
    }
} 