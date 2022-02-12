pragma solidity >=0.6.0 <0.7.0;
//SPDX-License-Identifier: MIT

//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
//learn more: https://docs.openzeppelin.com/contracts/3.x/erc721

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two

contract Crystals is ERC721 {

  address payable public constant kag = 0x43dc68536B268Af5C3F454CF75011CE7870f8D1F;
  address payable public constant jaxcoder = 0x358Aa5Cb060E4bC81C4B9a63CA034c232c054178;

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  string [] private uris;

  constructor() public ERC721("AI Crystals Collection", "CRYSTL") {
    _setBaseURI("https://gateway.pinata.cloud/ipfs/QmQwbqMKRPcicCcMmLqqLx8qnhHKRPZ4fG14sVmJfypJAG");
    uris =  ['_1.json', '_2.json', '_3.json', '_4.json', '_5.json', '_6.json', '_7.json', '_8.json', '_9.json', '_10.json', '_11.json', '_12.json', '_13.json', '_14.json', '_15.json', '_16.json', '_17.json', '_18.json', '_19.json', '_20.json', '_21.json', '_22.json', '_23.json', '_24.json', '_25.json', '_26.json', '_27.json', '_28.json', '_29.json', '_30.json', '_31.json', '_32.json', '_33.json', '_34.json', '_35.json', '_36.json', '_37.json', '_38.json', '_39.json', '_40.json', '_41.json', '_42.json', '_43.json', '_44.json', '_45.json', '_46.json', '_47.json', '_48.json', '_49.json', '_50.json', '_51.json', '_52.json', '_53.json', '_54.json', '_55.json', '_56.json', '_57.json', '_58.json', '_59.json', '_60.json', '_61.json', '_62.json', '_63.json', '_64.json', '_65.json', '_66.json', '_67.json', '_68.json', '_69.json', '_70.json', '_71.json', '_72.json', '_73.json', '_74.json', '_75.json', '_76.json', '_77.json', '_78.json', '_79.json', '_80.json', '_81.json', '_82.json', '_83.json', '_84.json', '_85.json', '_86.json', '_87.json', '_88.json', '_89.json', '_90.json', '_91.json', '_92.json', '_93.json', '_94.json', '_95.json', '_96.json', '_97.json', '_98.json', '_99.json', '_100.json', '_101.json', '_102.json', '_103.json', '_104.json', '_105.json', '_106.json', '_107.json', '_108.json', '_109.json', '_110.json', '_111.json', '_112.json', '_113.json', '_114.json', '_115.json', '_116.json', '_117.json', '_118.json', '_119.json', '_120.json', '_121.json', '_122.json', '_123.json', '_124.json', '_125.json', '_126.json', '_127.json', '_128.json', '_129.json', '_130.json', '_131.json', '_132.json', '_133.json', '_134.json', '_135.json', '_136.json', '_137.json', '_138.json', '_139.json', '_140.json', '_141.json', '_142.json', '_143.json', '_144.json', '_145.json', '_146.json', '_147.json', '_148.json', '_149.json', '_150.json', '_151.json', '_152.json', '_153.json', '_154.json', '_155.json', '_156.json', '_157.json', '_158.json', '_159.json', '_160.json', '_161.json', '_162.json', '_163.json', '_164.json', '_165.json', '_166.json', '_167.json', '_168.json', '_169.json', '_170.json', '_171.json', '_172.json', '_173.json', '_174.json', '_175.json', '_176.json', '_177.json', '_178.json', '_179.json', '_180.json', '_181.json', '_182.json', '_183.json', '_184.json', '_185.json', '_186.json', '_187.json', '_188.json', '_189.json', '_190.json', '_191.json', '_192.json', '_193.json', '_194.json', '_195.json', '_196.json', '_197.json', '_198.json', '_199.json', '_200.json', '_201.json', '_202.json', '_203.json', '_204.json', '_205.json', '_206.json', '_207.json', '_208.json', '_209.json', '_210.json', '_211.json', '_212.json', '_213.json', '_214.json', '_215.json', '_216.json', '_217.json', '_218.json', '_219.json', '_220.json', '_221.json', '_222.json', '_223.json', '_224.json', '_225.json', '_226.json', '_227.json', '_228.json', '_229.json', '_230.json', '_231.json', '_232.json', '_233.json', '_234.json', '_235.json', '_236.json', '_237.json', '_238.json', '_239.json', '_240.json', '_241.json', '_242.json', '_243.json', '_244.json', '_245.json', '_246.json', '_247.json', '_248.json', '_249.json', '_250.json', '_251.json', '_252.json', '_253.json', '_254.json', '_255.json', '_256.json', '_257.json', '_258.json', '_259.json', '_260.json', '_261.json', '_262.json', '_263.json', '_264.json', '_265.json', '_266.json', '_267.json', '_268.json', '_269.json', '_270.json', '_271.json', '_272.json', '_273.json', '_274.json', '_275.json', '_276.json', '_277.json', '_278.json', '_279.json', '_280.json', '_281.json', '_282.json', '_283.json', '_284.json', '_285.json', '_286.json', '_287.json', '_288.json', '_289.json', '_290.json', '_291.json', '_292.json', '_293.json', '_294.json', '_295.json', '_296.json', '_297.json', '_298.json', '_299.json', '_300.json', '_301.json', '_302.json', '_303.json', '_304.json', '_305.json', '_306.json', '_307.json', '_308.json', '_309.json', '_310.json', '_311.json', '_312.json', '_313.json', '_314.json', '_315.json', '_316.json', '_317.json', '_318.json', '_319.json', '_320.json', '_321.json', '_322.json', '_323.json', '_324.json', '_325.json', '_326.json', '_327.json', '_328.json', '_329.json', '_330.json', '_331.json', '_332.json', '_333.json', '_334.json', '_335.json', '_336.json', '_337.json', '_338.json', '_339.json', '_340.json', '_341.json', '_342.json', '_343.json', '_344.json', '_345.json', '_346.json', '_347.json', '_348.json', '_349.json', '_350.json', '_351.json', '_352.json', '_353.json', '_354.json', '_355.json', '_356.json', '_357.json', '_358.json', '_359.json', '_360.json', '_361.json', '_362.json', '_363.json', '_364.json', '_365.json', '_366.json', '_367.json', '_368.json', '_369.json', '_370.json', '_371.json', '_372.json', '_373.json', '_374.json', '_375.json', '_376.json', '_377.json', '_378.json', '_379.json', '_380.json', '_381.json', '_382.json', '_383.json', '_384.json', '_385.json', '_386.json', '_387.json', '_388.json', '_389.json', '_390.json', '_391.json', '_392.json', '_393.json', '_394.json', '_395.json', '_396.json', '_397.json', '_398.json', '_399.json', '_400.json', '_401.json', '_402.json', '_403.json', '_404.json', '_405.json', '_406.json', '_407.json', '_408.json', '_409.json', '_410.json', '_411.json', '_412.json', '_413.json', '_414.json', '_415.json', '_416.json', '_417.json', '_418.json', '_419.json', '_420.json'];
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
    (bool success,) = kag.call{ value: price - (price / 100) * 20 }("");
    (bool success1, ) = jaxcoder.call{ value: price - (price / 100) * 80 }("");
    require(success, "could not send to kag");
    require( success1, "could not send to jaxcoder");
    mintItem(to, uris[_tokenIds.current()]);
  }
}
