pragma solidity >=0.6.0 <0.7.0;
//SPDX-License-Identifier: MIT

//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
//learn more: https://docs.openzeppelin.com/contracts/3.x/erc721

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two

contract Crystals is ERC721 {

  address payable public constant kag = 0xde21F729137C5Af1b01d73aF1dC21eFfa2B8a0d6;

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  string [] private uris;

  constructor() public ERC721("Crystals", "CRYSTL") {
    _setBaseURI("https://gateway.pinata.cloud/ipfs/QmdRmZ1UPSALNVuXY2mYPb3T5exn9in1AL3tsema4rY2QF/json/");
    uris =  [''];
  }

  uint256 public constant limit = 420;
  uint256 public price = 0.05 ether;

  function mintItem(address to, string memory tokenURI)
      private
      returns (uint256)
  {
      require( _tokenIds.current() < limit , "DONE MINTING");
      _tokenIds.increment();

      uint256 id = _tokenIds.current();
      _mint(to, id);
      _setTokenURI(id, tokenURI);

      return id;
  }

  function requestMint(address to)
      public
      payable
  {
    require( msg.value >= price, "NOT ENOUGH");
    (bool success,) = kag.call{value:msg.value}("");
    require( success, "could not send");
    mintItem(to, uris[_tokenIds.current()]);
  }
}
