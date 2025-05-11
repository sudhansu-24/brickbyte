import { expect } from "chai";
import { ethers } from "hardhat";
import { RealEstateToken } from "../typechain-types";  //Just for testing 

describe("RealEstateToken", function () {
  let realEstateToken: RealEstateToken;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
    realEstateToken = await RealEstateToken.deploy();
    await realEstateToken.waitForDeployment();
  });

  describe("Property Listing", function () {
    it("Should allow property owner to list a property", async function () {
      await realEstateToken.connect(owner).listProperty(
        "Test Property",
        "Test Location",
        "Test Description",
        "https://test.com/image.jpg",
        1000,
        ethers.parseEther("0.1"),
        5
      );

      const property = await realEstateToken.getProperty(0);
      expect(property.name).to.equal("Test Property");
      expect(property.location).to.equal("Test Location");
      expect(property.totalShares).to.equal(1000);
      expect(property.pricePerShare).to.equal(ethers.parseEther("0.1"));
      expect(property.rentalYield).to.equal(5);
      expect(property.propertyOwner).to.equal(owner.address);
      expect(property.isActive).to.equal(true);
    });

    it("Should not allow listing with invalid parameters", async function () {
      await expect(
        realEstateToken.connect(owner).listProperty(
          "Test Property",
          "Test Location",
          "Test Description",
          "https://test.com/image.jpg",
          0,
          ethers.parseEther("0.1"),
          5
        )
      ).to.be.revertedWith("Total shares must be greater than 0");

      await expect(
        realEstateToken.connect(owner).listProperty(
          "Test Property",
          "Test Location",
          "Test Description",
          "https://test.com/image.jpg",
          1000,
          0,
          5
        )
      ).to.be.revertedWith("Price per share must be greater than 0");

      await expect(
        realEstateToken.connect(owner).listProperty(
          "Test Property",
          "Test Location",
          "Test Description",
          "https://test.com/image.jpg",
          1000,
          ethers.parseEther("0.1"),
          101
        )
      ).to.be.revertedWith("Rental yield cannot exceed 100%");
    });
  });

  describe("Share Purchase", function () {
    beforeEach(async function () {
      await realEstateToken.connect(owner).listProperty(
        "Test Property",
        "Test Location",
        "Test Description",
        "https://test.com/image.jpg",
        1000,
        ethers.parseEther("0.1"),
        5
      );
    });

    it("Should allow users to purchase shares", async function () {
      const amount = 100;
      const price = ethers.parseEther("0.1") * BigInt(amount);

      await realEstateToken.connect(addr1).purchaseShares(0, amount, {
        value: price,
      });

      const balance = await realEstateToken.balanceOf(addr1.address, 0);
      expect(balance).to.equal(amount);
    });

    it("Should not allow purchase with insufficient payment", async function () {
      const amount = 100;
      const price = ethers.parseEther("0.1") * BigInt(amount);

      await expect(
        realEstateToken.connect(addr1).purchaseShares(0, amount, {
          value: price - BigInt(1),
        })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should not allow purchase of non-existent property", async function () {
      const amount = 100;
      const price = ethers.parseEther("0.1") * BigInt(amount);

      await expect(
        realEstateToken.connect(addr1).purchaseShares(1, amount, {
          value: price,
        })
      ).to.be.reverted;
    });
  });

  describe("Share Sale", function () {
    beforeEach(async function () {
      await realEstateToken.connect(owner).listProperty(
        "Test Property",
        "Test Location",
        "Test Description",
        "https://test.com/image.jpg",
        1000,
        ethers.parseEther("0.1"),
        5
      );

      const amount = 100;
      const price = ethers.parseEther("0.1") * BigInt(amount);

      await realEstateToken.connect(addr1).purchaseShares(0, amount, {
        value: price,
      });
    });

    it("Should allow users to sell their shares", async function () {
      const amount = 50;
      const initialBalance = await realEstateToken.balanceOf(addr1.address, 0);

      await realEstateToken.connect(addr1).sellShares(0, amount);

      const finalBalance = await realEstateToken.balanceOf(addr1.address, 0);
      expect(finalBalance).to.equal(initialBalance - BigInt(amount));
    });

    it("Should not allow selling more shares than owned", async function () {
      const amount = 150;

      await expect(
        realEstateToken.connect(addr1).sellShares(0, amount)
      ).to.be.revertedWith("Insufficient shares");
    });
  });
}); 