import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { formatEther } from "@ethersproject/units";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Alert, Button, Card, List, Row, Space, Col } from "antd";
import "antd/dist/antd.css";
import { useUserAddress } from "eth-hooks";
import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Web3Modal from "web3modal";
import "./App.css";
// import assets from "./assets.js";
import { Account, Address, AddressInput, Contract, Header } from "./components";
import { INFURA_ID, NETWORK, NETWORKS } from "./constants";
import { Transactor } from "./helpers";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useEventListener,
  useExchangePrice,
  useGasPrice,
} from "./hooks";

const { BufferList } = require("bl");
// https://www.npmjs.com/package/ipfs-http-client
const ipfsAPI = require("ipfs-http-client");
const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });

// console.log("📦 Assets: ", assets);

/// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORKS["optimism"]; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = true;

//helper function to "Get" from IPFS
// you usually go content.toString() after this...
const getFromIPFS = async hashToGet => {
  for await (const file of ipfs.get(hashToGet)) {
    console.log(file.path);
    if (!file.content) continue;
    const content = new BufferList();
    for await (const chunk of file.content) {
      content.append(chunk);
    }
    console.log(content);
    return content;
  }
};

// 🛰 providers
if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
// const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);

// attempt to connect to our own scaffold eth rpc and if that fails fall back to infura...
const scaffoldEthProvider = new JsonRpcProvider("https://rpc.scaffoldeth.io:48544");
const mainnetInfura = new JsonRpcProvider("https://eth-mainnet.alchemyapi.io/v2/6zO-rkFbwGBCrazj7ZTW3o56J0ChdtON");
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_I

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new JsonRpcProvider(localProviderUrlFromEnv);

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;

function App(props) {
  const mainnetProvider = scaffoldEthProvider && scaffoldEthProvider._network ? scaffoldEthProvider : mainnetInfura;
  if (DEBUG) console.log("🌎 mainnetProvider", mainnetProvider);

  const [injectedProvider, setInjectedProvider] = useState();
  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = injectedProvider;
  const address = useUserAddress(userProvider);
  if (DEBUG) console.log("👩‍💼 selected address:", address);

  // You can warn the user if you would like them to be on a specific network
  let localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  if (DEBUG) console.log("🏠 localChainId", localChainId);

  let selectedChainId = userProvider && userProvider._network && userProvider._network.chainId;
  if (DEBUG) console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userProvider, gasPrice);

  // Faucet Tx can be used to send funds from the faucet
  const faucetTx = Transactor(localProvider, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);
  if (DEBUG) console.log("💵 yourLocalBalance", yourLocalBalance ? formatEther(yourLocalBalance) : "...");

  // Just plug in different 🛰 providers to get your balance on different chains:
  // const yourMainnetBalance = useBalance(mainnetProvider, address);
  // if (DEBUG) console.log("💵 yourMainnetBalance", yourMainnetBalance ? formatEther(yourMainnetBalance) : "...");

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider);
  if (DEBUG) console.log("📝 readContracts", readContracts);

  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  const writeContracts = useContractLoader(userProvider);
  if (DEBUG) console.log("🔐 writeContracts", writeContracts);

  // keep track of a variable from the contract in the local React state:
  const balance = useContractReader(readContracts, "Crystals", "balanceOf", [address]);
  console.log("🤗 balance:", balance);

  // const priceToMint = useContractReader(readContracts, "Crystals", "price");
  // console.log("🤗 priceToMint:", priceToMint);

  const amountMintedAlready = useContractReader(readContracts, "Crystals", "totalSupply");
  console.log("🤗 amountMintedAlready:", amountMintedAlready);

  //📟 Listen for broadcast events
  const transferEvents = useEventListener(readContracts, "Crystals", "Transfer", localProvider, 1);
  console.log("📟 Transfer events:", transferEvents);

  // track the lastest bots minted
  const [latestMintedCrystals, setLatestMintedCrystals] = useState();
  console.log("📟 latestBotsMinted:", latestMintedCrystals);

  //
  // 🧠 This effect will update yourCollectibles by polling when your balance changes
  //
  const yourBalance = balance && balance.toNumber && balance.toNumber();
  const [yourCollectibles, setYourCollectibles] = useState();

  useEffect(() => {
    const updateYourCollectibles = async () => {
      let collectibleUpdate = [];
      for (let tokenIndex = 0; tokenIndex < balance; tokenIndex++) {
        try {
          console.log("Getting token index", tokenIndex);
          const tokenId = await readContracts.Crystals.tokenOfOwnerByIndex(address, tokenIndex);
          console.log("tokenId", tokenId);
          const tokenURI = await readContracts.Crystals.tokenURI(tokenId);
          console.log("tokenURI", tokenURI);

          const ipfsHash = tokenURI.replace("https://aicrystals.mypinata.cloud/ipfs/", "");
          console.log("ipfsHash", ipfsHash);

          const jsonManifestBuffer = await getFromIPFS(ipfsHash);

          try {
            const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
            console.log("jsonManifest", jsonManifest);
            collectibleUpdate.push({ id: tokenId, uri: tokenURI, owner: address, ...jsonManifest });
          } catch (e) {
            console.log(e);
          }
        } catch (e) {
          console.log(e);
        }
      }
      setYourCollectibles(collectibleUpdate);
    };
    updateYourCollectibles();
  }, [address, yourBalance]);

  //
  // 🧠 This effect will update latestMintedBots by polling when your balance or address changes.
  //
  useEffect(() => {
    const getLatestMintedBots = async () => {
      let latestMintedCrystalsUpdate = [];
      if (transferEvents.length > 0) {
        for (let botIndex = 0; botIndex < transferEvents.length - 1; botIndex++) {
          if (
            transferEvents[botIndex].from == "0x0000000000000000000000000000000000000000" &&
            latestMintedCrystalsUpdate.length < 3
          ) {
            try {
              let tokenId = transferEvents[botIndex].tokenId.toNumber();
              const tokenURI = await readContracts.Crystals.tokenURI(tokenId);
              const ipfsHash = tokenURI.replace("https://aicrystals.mypinata.cloud/ipfs/", "");
              const jsonManifestBuffer = await getFromIPFS(ipfsHash);

              try {
                const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
                latestMintedCrystalsUpdate.push({ id: tokenId, uri: tokenURI, owner: address, ...jsonManifest });
              } catch (e) {
                console.log(e);
              }
            } catch (e) {
              console.log(e);
            }
          }
        }
      }
      setLatestMintedCrystals(latestMintedCrystalsUpdate);
    };
    getLatestMintedBots();
  }, [amountMintedAlready]);

  let networkDisplay = "";
  if (localChainId && selectedChainId && localChainId != selectedChainId) {
    networkDisplay = (
      <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
        <Alert
          message={"⚠️ Wrong Network"}
          description={
            <div>
              You have <b>{NETWORK(selectedChainId).name}</b> selected and you need to be on{" "}
              <b>{NETWORK(localChainId).name}</b>.
            </div>
          }
          type="error"
          closable={false}
        />
      </div>
    );
  } else {
    networkDisplay = (
      <div style={{ zIndex: -1, position: "absolute", right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
        {targetNetwork.name}
      </div>
    );
  }

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  const [transferToAddresses, setTransferToAddresses] = useState({});
  let priceRightNow;

  return (
    <div className="bg-gray-400">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />
      {networkDisplay}

      <BrowserRouter>
        <Switch>
          <Route exact path="/">
            <div class="">
              <br />
              <h1>AI Uniquely Generated Crystals</h1>

              <h2>An ⭐️Ultra-Rare⭐️ AI Uniquely Generated Art (420 max supply)</h2>
              <h2>With 1 Special Easter Egg.</h2>
              <h2>
                Created by ya bois <a href="https://twitter.com/le_kag7">@chris-kag</a> &{" "}
                <a href="https://twitter.com/codenamejason">@codenamejason</a>
              </h2>
              <h2>❤️🛠 Seeded on 13/02 @ 10am EST</h2>
              <div style={{ padding: 32 }}>
                {address ? (
                  <Button
                    type={"primary"}
                    onClick={async () => {
                      priceRightNow = await readContracts.Crystals.price();
                      tx(writeContracts.Crystals.requestMint(address, { value: priceRightNow }));
                    }}
                  >
                    MINT for 0.07Ξ
                  </Button>
                ) : (
                  <Button key="loginbutton" type="primary" onClick={loadWeb3Modal}>
                    connect to mint
                  </Button>
                )}

                {latestMintedCrystals && latestMintedCrystals.length > 0 ? (
                  <div class="latestBots">
                    <h2>Latest Minted Crystals</h2>

                    <List
                      dataSource={latestMintedCrystals}
                      renderItem={item => {
                        const id = item.id;
                        return (
                          <a
                            href={`https://quixotic.io/asset/opt/0x7F313258c747c19f388e4D1d219Eff26a876A743/${item.id}`}
                          >
                            <List.Item style={{ display: "inline-block", border: "none", margin: 10 }}>
                              <Card
                                style={{ borderBottom: "none", border: "none", background: "none" }}
                                title={
                                  <div style={{ fontSize: 16, marginRight: 8, color: "white" }}>
                                    <span></span> {item.name}
                                  </div>
                                }
                              >
                                <div>
                                  <img src={item.image} style={{ maxWidth: 150 }} />
                                </div>
                              </Card>
                            </List.Item>
                          </a>
                        );
                      }}
                    />
                  </div>
                ) : (
                  <div></div>
                )}
                <br />
                <br />
              </div>

              {yourCollectibles && yourCollectibles.length > 0 ? (
                <div></div>
              ) : (
                <div class="colorme2">
                  <h4 style={{ padding: 1 }}>Why We Think Crystals Rock:</h4>
                  <br />
                  <br />
                  <ul class="rocks">
                    <li>
                      💎 A collection of 420 AI uniquely generated Crystals + 1 Easter Egg in total, revealing beautiful
                      generative art now available on Optimism.
                    </li>
                    <li>🖼️ High Resolution NFT art.</li>
                    <li>👑 Ultra Super Mega Giga-Chad Rare</li>
                  </ul>
                </div>
              )}
            </div>

            {yourCollectibles && yourCollectibles.length > 0 ? (
              <div style={{ width: 640, margin: "auto", marginTop: 32, padding: 32 }}>
                <h4 style={{ padding: 5 }}>Your Crystals</h4>
                <br />
                <br />

                <List
                  bordered
                  dataSource={yourCollectibles}
                  renderItem={item => {
                    const id = item.id.toNumber();
                    return (
                      <List.Item
                        style={{ display: "block", backgroundColor: "rgb(127, 81, 214)", border: "1px solid #DA5892" }}
                      >
                        <Card
                          title={
                            <div>
                              <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.name}
                            </div>
                          }
                        >
                          <div>
                            <img src={item.image} style={{ maxWidth: 150 }} />
                          </div>
                          <div>{item.description}</div>
                        </Card>

                        <Space direction="vertical" style={{ marginTop: 8, width: "100%" }}>
                          <div>
                            owner:{" "}
                            <Address
                              address={item.owner}
                              ensProvider={mainnetProvider}
                              blockExplorer={blockExplorer}
                              fontSize={16}
                            />
                          </div>
                          <AddressInput
                            ensProvider={mainnetProvider}
                            placeholder="transfer to address"
                            value={transferToAddresses[id]}
                            onChange={newValue => {
                              let update = {};
                              update[id] = newValue;
                              setTransferToAddresses({ ...transferToAddresses, ...update });
                            }}
                          />
                          <Button
                            style={{ border: "1px solid rgb(218, 88, 146)" }}
                            onClick={() => {
                              console.log("writeContracts", writeContracts);
                              tx(writeContracts.Crystals.transferFrom(address, transferToAddresses[id], id));
                            }}
                          >
                            Transfer
                          </Button>
                        </Space>
                      </List.Item>
                    );
                  }}
                />
              </div>
            ) : (
              ""
            )}
          </Route>

          <Route path="/transfers">
            <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
              <List
                bordered
                dataSource={transferEvents}
                renderItem={item => {
                  return (
                    <List.Item key={item[0] + "_" + item[1] + "_" + item.blockNumber + "_" + item[2].toNumber()}>
                      <span style={{ fontSize: 16, marginRight: 8 }}>#{item[2].toNumber()}</span>
                      <Address address={item[0]} ensProvider={mainnetProvider} fontSize={16} /> =>
                      <Address address={item[1]} ensProvider={mainnetProvider} fontSize={16} />
                    </List.Item>
                  );
                }}
              />
            </div>
          </Route>

          <Route path="/debugcontracts">
            <Contract
              name="MoonshotBot"
              signer={userProvider && userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
          </Route>
        </Switch>
      </BrowserRouter>

      {/*}<ThemeSwitch />*/}

      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <Account
          address={address}
          localProvider={localProvider}
          userProvider={userProvider}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
      </div>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
      <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
        <Row align="middle" gutter={[4, 4]}><Col span={8} style={{ textAlign: "center", opacity: 1 }}>
             <Button
               onClick={() => {
                 window.open("https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA");
               }}
               size="large"
               shape="round"
             >
               <span style={{ marginRight: 8 }} role="img" aria-label="support">
                 💬
               </span>
               Support
             </Button>
           </Col>
        </Row>

      </div>
    </div>
  );
}

/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

window.ethereum &&
  window.ethereum.on("chainChanged", chainId => {
    setTimeout(() => {
      window.location.reload();
    }, 1);
  });

export default App;
