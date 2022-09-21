const { expect } = require("chai");

describe("CoinmapDex", function () {
  let owner, swapRouter, feeTo, maker;
  let feeRate = 100;
  let cdex;
  let domain, types;

  beforeEach(async function () {
    [owner, swapRouter, feeTo, maker] = await ethers.getSigners();

    const CoinmapDex = await ethers.getContractFactory("CoinmapDex");
    cdex = await CoinmapDex.deploy(swapRouter.address, feeTo.address, feeRate);
    await cdex.deployed();

    domain = {
      name: "CoinmapDex",
      version: "1",
      chainId: await hre.getChainId(),
      verifyingContract: cdex.address
    };
    types = {
      Order: [
        { name: "maker", type: "address" },
        { name: "payToken", type: "address" },
        { name: "buyToken", type: "address" },
        { name: "payAmount", type: "uint256" },
        { name: "buyAmount", type: "uint256" },
        { name: "deadline", type: "uint256" },
        { name: "salt", type: "bytes32" },
      ]
    };
  });

  it("contract should have correct data", async function () {
    expect(await cdex.owner()).to.equal(owner.address);
    expect(await cdex.swapRouter()).to.equal(swapRouter.address);
    expect(await cdex.feeTo()).to.equal(feeTo.address);
    expect(await cdex.feeRate()).to.equal(feeRate);
  });

  it("contract should verify signature", async function () {
    const value = {
      maker: maker.address,
      payToken: "0x55d398326f99059ff775485246999027b3197955",
      buyToken: "0x12BB890508c125661E03b09EC06E404bc9289040",
      payAmount: "2000000000000000000",
      buyAmount: "6896551724137931000000",
      deadline: 1664190421,
      salt: "0xd916202ac0f3669b41b35b0aff880e62fd9745eed6d05c152b0ad217c458558f"
    };
    const signature = await maker._signTypedData(domain, types, value);
    expect(await cdex.verify(maker.address, value, signature)).to.equal(true);
    expect(await cdex.verify(owner.address, value, signature)).to.equal(false);
    expect(await cdex.verify(maker.address, { ...value, deadline: value.deadline + 1 }, signature)).to.equal(false);
  });

  it("cancelOrder should emit event and mark salt as used", async function () {
    const salt = "0xd916202ac0f3669b41b35b0aff880e62fd9745eed6d05c152b0ad217c458558f"
    await expect(cdex.connect(maker).cancelOrder(maker.address, salt))
      .to.emit(cdex, 'UpdateStatus')
      .withArgs(maker.address, salt, 2);
    expect(await cdex.makerSaltUsed(maker.address, salt)).to.equal(true);
  });

  it("only order maker can call cancelOrder", async function () {
    const salt = "0xd916202ac0f3669b41b35b0aff880e62fd9745eed6d05c152b0ad217c458558f"
    await expect(cdex.cancelOrder(maker.address, salt))
      .to.be.revertedWith("CMD002");
    expect(await cdex.makerSaltUsed(maker.address, salt)).to.equal(false);
  });

  it("setFeeTo should emit event and update correct data", async function () {
    await expect(cdex.setFeeTo(maker.address))
      .to.emit(cdex, 'UpdateFeeTo')
      .withArgs(maker.address);
    expect(await cdex.feeTo()).to.equal(maker.address);
  });

  it("setFeeRate should emit event and update correct data", async function () {
    const newFeeRate = 200;
    await expect(cdex.setFeeRate(newFeeRate))
      .to.emit(cdex, 'UpdateFeeRate')
      .withArgs(newFeeRate);
    expect(await cdex.feeRate()).to.equal(newFeeRate);
  });

  it("setFeeRate should not allow value greater than MAX_FEE", async function () {
    const MAX_FEE = await cdex.MAX_FEE();
    await expect(cdex.setFeeRate(MAX_FEE))
      .to.be.revertedWith("CMD001");
    expect(await cdex.feeRate()).to.equal(feeRate);
  });

  it("only owner can call setFeeTo, setFeeRate and onCriticalBug", async function () {
    await expect(cdex.connect(maker).setFeeTo(maker.address))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(cdex.connect(maker).setFeeRate(200))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(cdex.connect(maker).onCriticalBug(feeTo.address))
      .to.be.revertedWith("Ownable: caller is not the owner");
  });
});
