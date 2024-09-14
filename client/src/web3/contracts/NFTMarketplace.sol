// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NFTMarketplace is ERC721URIStorage, ReentrancyGuard {
    address payable owner;
    uint256 listingFee = 0.025 ether;
    uint256 private _tokenIds;
    uint256 private _propertyIds;
    uint256 private _propertiesSold;

    constructor() ERC721("Real Estate NFT", "RENFT") {
        owner = payable(msg.sender);
    }

    struct Property {
        uint256 propertyId;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        string propertyType;
        string propertyImage;
        uint256 squareFootage;
        string location;
    }

    mapping(uint256 => Property) private idToProperty;

    event PropertyListed(
        uint256 indexed propertyId,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold,
        string propertyType,
        string propertyImage,
        uint256 squareFootage,
        string location
    );

    function getListingFee() public view returns (uint256) {
        return listingFee;
    }

    function createToken(string memory tokenURI) public returns (uint256) {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        return newTokenId;
    }

    function listProperty(
        uint256 tokenId,
        uint256 price,
        string memory propertyType,
        string memory propertyImage,
        uint256 squareFootage,
        string memory location
    ) public payable nonReentrant {
        require(price > 0, "Price must be at least 1 wei");
        require(msg.value == listingFee, "Must pay the listing fee");
        require(ownerOf(tokenId) == msg.sender, "You can only list tokens you own");

        _propertyIds++;
        uint256 propertyId = _propertyIds;
  
        idToProperty[propertyId] = Property(
            propertyId,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false,
            propertyType,
            propertyImage,
            squareFootage,
            location
        );

        _transfer(msg.sender, address(this), tokenId);

        emit PropertyListed(
            propertyId,
            tokenId,
            msg.sender,
            address(0),
            price,
            false,
            propertyType,
            propertyImage,
            squareFootage,
            location
        );
    }

    function buyProperty(uint256 propertyId) public payable nonReentrant {
        uint256 price = idToProperty[propertyId].price;
        uint256 tokenId = idToProperty[propertyId].tokenId;
        require(msg.value == price, "Please submit the asking price to complete the purchase");

        idToProperty[propertyId].seller.transfer(msg.value);
        _transfer(address(this), msg.sender, tokenId);
        idToProperty[propertyId].owner = payable(msg.sender);
        idToProperty[propertyId].sold = true;
        _propertiesSold++;
        payable(owner).transfer(listingFee);
    }

    function fetchAvailableProperties() public view returns (Property[] memory) {
        uint256 unsoldItemCount = _propertyIds - _propertiesSold;
        uint256 currentIndex = 0;

        Property[] memory properties = new Property[](unsoldItemCount);
        for (uint256 i = 1; i <= _propertyIds; i++) {
            if (idToProperty[i].owner == address(0)) {
                properties[currentIndex] = idToProperty[i];
                currentIndex++;
            }
        }
        return properties;
    }

    function fetchMyProperties() public view returns (Property[] memory) {
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= _propertyIds; i++) {
            if (idToProperty[i].owner == msg.sender) {
                itemCount++;
            }
        }

        Property[] memory properties = new Property[](itemCount);
        for (uint256 i = 1; i <= _propertyIds; i++) {
            if (idToProperty[i].owner == msg.sender) {
                properties[currentIndex] = idToProperty[i];
                currentIndex++;
            }
        }
        return properties;
    }
}