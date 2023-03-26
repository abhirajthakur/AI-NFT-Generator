// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    uint256 public cost;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _cost
    ) ERC721(_name, _symbol) {
        cost = _cost;
    }

    function mint(string memory tokenURI) public payable {
        require(msg.value >= cost, "Not enough ETH");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success);
    }
}