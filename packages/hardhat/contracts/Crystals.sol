pragma solidity >=0.6.0 <0.7.0;
//SPDX-License-Identifier: MIT

// 🤖 🚀 🌔  MoonshotBots for public goods funding!
/*
______  ___                         ______       _____            ________                               ______ __________                              _________
___   |/  /____________________________  /_________  /________    ___  __/_____________   ____________  ____  /____  /__(_)______   _______ __________________  /
__  /|_/ /_  __ \  __ \_  __ \_  ___/_  __ \  __ \  __/_  ___/    __  /_ _  __ \_  ___/   ___  __ \  / / /_  __ \_  /__  /_  ___/   __  __ `/  __ \  __ \  __  /
_  /  / / / /_/ / /_/ /  / / /(__  )_  / / / /_/ / /_ _(__  )     _  __/ / /_/ /  /       __  /_/ / /_/ /_  /_/ /  / _  / / /__     _  /_/ // /_/ / /_/ / /_/ /
/_/  /_/  \____/\____//_/ /_//____/ /_/ /_/\____/\__/ /____/      /_/    \____//_/        _  .___/\__,_/ /_.___//_/  /_/  \___/     _\__, / \____/\____/\__,_/   
                                                                                          /_/                                       /____/
🦧✊ Demand more from PFPs! 👇
🌱🌱 100% of MoonshotBot Minting Fees go to fund Ethereum Public Goods on kag Grants 🌱🌱
🦧✊🌱100%🌱✊🦧

*/
// https://github.com/austintgriffith/scaffold-eth/tree/moonshot-bots-with-curve


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
    uris =  [];
  }

  uint256 public constant limit = 303;
  uint256 public price = 0.0033 ether;

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
    price = (price * 1047) / 1000;
    (bool success,) = kag.call{value:msg.value}("");
    require( success, "could not send");
    mintItem(to, uris[_tokenIds.current()]);
  }
}
