// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract DynamicNFT is ERC721URIStorage {

    uint256 public tokenCounter;
    uint256 public mintPrice = 0.05 ether;
    uint256 public levelUpPrice = 0.02 ether;

    mapping(uint256 => uint256) public levels;

    constructor() ERC721("DynamicNFT", "DNFT") {
        tokenCounter = 0;
    }

    function mintNFT(string memory tokenURI) public payable {        require(msg.value >= mintPrice, "Insufficient payment for minting");
        uint256 tokenId = tokenCounter;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        levels[tokenId] = 1;

        tokenCounter++;
    }

    function levelUp(uint256 tokenId) public payable {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(msg.value >= levelUpPrice, "Insufficient payment for leveling up");

        levels[tokenId] += 1;
    }

    // Allow contract to receive ETH (for marketplace transactions)
    receive() external payable {}
}