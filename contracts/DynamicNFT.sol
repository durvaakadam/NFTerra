// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract DynamicNFT is ERC721URIStorage {

    uint256 public tokenCounter;

    mapping(uint256 => uint256) public levels;

    constructor() ERC721("DynamicNFT", "DNFT") {
        tokenCounter = 0;
    }

    function mintNFT(string memory tokenURI) public {

        uint256 tokenId = tokenCounter;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        levels[tokenId] = 1;

        tokenCounter++;
    }

    function levelUp(uint256 tokenId) public {

        require(ownerOf(tokenId) == msg.sender);

        levels[tokenId] += 1;
    }
}