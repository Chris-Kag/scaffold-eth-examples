pragma solidity >=0.6.0 <0.7.0;
//SPDX-License-Identifier: MIT

//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
//learn more: https://docs.openzeppelin.com/contracts/3.x/erc721

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two

contract Crystals is ERC721 {

  address payable public constant chris_kag = 0x43dc68536B268Af5C3F454CF75011CE7870f8D1F;
  address payable public constant jaxcoder = 0x358Aa5Cb060E4bC81C4B9a63CA034c232c054178;

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  string [] private uris;

  constructor() public ERC721("AI Crystals Collection", "CRYSTL") {
    _setBaseURI("https://gateway.pinata.cloud/ipfs/QmXEf1RXCUuq5tvbUBo1SB6QLHmuxFnpMGgpsGorsHTBKz");
    uris =  ['_1.json', '_2.json', '_3.json', '_4.json', '_5.json'];
  }

  uint256 public constant limit = 420;
  uint256 public price = 0.07 ether;

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
    (bool success,) = chris_kag.call{ value: price - (price / 100) * 20 }("");
    (bool success1, ) = jaxcoder.call{ value: price - (price / 100) * 80 }("");
    require(success, "could not send to kag");
    require( success1, "could not send to jaxcoder");
    mintItem(to, uris[_tokenIds.current()]);
  }
}
