const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("NFT", () => {
    it("should mint a new NFT", async () => {
        const NFT = await ethers.getContractFactory("NFT");
        const nft = await NFT.deploy(
            "AI Generated NFT",
            "AIGNFT",
            ethers.utils.parseEther("0.5")
        );
        await nft.deployed();

        const imageURI = "https://ipfs.io/ipfs/bafybeifjioow6afijrp4qvod5m6widq2uorysalo7hu3ulk2cbaowgy3uq/image.jpeg";

        const [_, addr1] = await ethers.getSigners();
        await nft.connect(addr1).mint(imageURI, {
            value: ethers.utils.parseEther("0.5"),
        });
        expect(Number(await nft.balanceOf(addr1.address))).to.be.equal(1);
    });
});
