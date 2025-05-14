const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GameContract", function () {
  before(async () => {
    const GameContract = await ethers.getContractFactory("GameContract");
    this.contract = await GameContract.deploy();
  });

  it("Should deploy successfully", async () => {
    expect(await this.contract.address).to.be.properAddress;
  });

});