import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { usePioneer } from "lib/context/Pioneer";

import NFT_ABI from "./components/MyNFT.json";

const ALL_CHAINS = [
  { name: "ethereum", chain_id: 1, symbol: "ETH" },
  { name: "polygon", chain_id: 137, symbol: "MATIC" },
  { name: "pulsechain", chain_id: 369, symbol: "PLS" },
  { name: "optimism", chain_id: 10, symbol: "ETH" },
  { name: "gnosis", chain_id: 100, symbol: "xDAI" },
  { name: "binance-smart-chain", chain_id: 56, symbol: "BNB" },
  { name: "smart-bitcoin-cash", chain_id: 10000, symbol: "BCH" },
  // { name: "arbitrum", chain_id: 42161, symbol: "ARB" }, //TODO push node
  { name: "fuse", chain_id: 122, symbol: "FUSE" },
  // { name: "bittorrent", chain_id: 199, symbol: "BTT" },//TODO push node
  { name: "celo", chain_id: 42220, symbol: "CELO" },
  { name: "avalanche-c-chain", chain_id: 43114, symbol: "AVAX" },
  // { name: "görli", chain_id: 5, symbol: "GOR" },
  { name: "eos", chain_id: 59, symbol: "EOS" },
  // { name: "ethereum-classic", chain_id: 61, symbol: "ETC" }, //TODO push node
  { name: "evmos", chain_id: 9001, symbol: "EVMOS" },
  // { name: "poa-core", chain_id: 99, symbol: "POA" }, //TODO push node
];

// Get after deploying
const NFT_CONTRACT = "0x1f7b983b53e337977a107bd6a7c1d78cbac35b03";
const picutreNFT =
  "https://red-considerable-silkworm-460.mypinata.cloud/ipfs/QmXCHWteSXHEVUdgkfJKdQjaVArDduqeXjHwZi4NcXBtQe";

const TOKEN_URI = "ipfs://QmXCHWteSXHEVUdgkfJKdQjaVArDduqeXjHwZi4NcXBtQe";

const META_DATA = {
  attributes: [
    {
      trait_type: "MOG",
      value: "Burn",
    },
    {
      trait_type: "rarity",
      value: "Rare",
    },
  ],
  description: "Burning all your cash to BUY MOG.",
  image: TOKEN_URI,
  name: "mogofire",
};

const Home = () => {
  const { state } = usePioneer();
  const { api, wallet, app } = state;
  const [web3, setWeb3] = useState("");
  const [chainId, setChainId] = useState(1);
  const [blockchain, setBlockchain] = useState("");
  const [icon, setIcon] = useState("https://pioneers.dev/coins/ethereum.png");
  const [isMinting, setIsMinting] = useState(false);
  const [address, setAddress] = useState("");
  const [txid, setTxid] = useState(null);

  const onStart = async function () {
    try {
      //
      if (api) {
        const info = await api.SearchByNetworkId({ chainId: 1 });
        console.log("onStart: info: ", info.data[0]);
        if (!info.data[0]) {
          console.error("No network found!");
        }
        setIcon(info.data[0].image);
        setChainId(info.data[0].chainId);
        setBlockchain(info.data[0].name);
        // @ts-ignore
        const web3 = new Web3(
          // @ts-ignore
          new Web3.providers.HttpProvider(info.data[0].service)
        );
        // @ts-ignore
        setWeb3(web3);
      }

      const addressInfo = {
        addressNList: [2147483692, 2147483708, 2147483648, 0, 0],
        coin: "Ethereum",
        scriptType: "ethereum",
        showDisplay: false,
      };
      console.log(wallet);
      const address = await wallet.ethGetAddress(addressInfo);
      console.log("address: ", address);
      setAddress(address);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMint = async () => {
    try {
      setIsMinting(true);

      // @ts-ignore
      const nonce = await web3.eth.getTransactionCount(address, "latest"); // get latest nonce
      // @ts-ignore
      const nftContract = new web3.eth.Contract(NFT_ABI.abi, NFT_CONTRACT);

      const data = await nftContract.methods
        .mintNFT(address, TOKEN_URI)
        .encodeABI();

      // the transaction
      const tx: any = {
        from: address,
        to: NFT_CONTRACT,
        // @ts-ignore
        nonce: web3.utils.toHex(nonce),
        gas: 500000,
        data,
      };
      console.log("tx: ", tx);

      //sign
      console.log(wallet);
      console.log(wallet.type);
      const isMetaMask = await wallet?._isMetaMask;
      if (isMetaMask) {
        console.log("MetaMask");
        const signed = await wallet.ethSendTx(tx);
        console.log("signed: ", signed);
        setTxid(signed.hash);
      } else {
        console.log("MetaMask");
        const signed = await wallet.ethSignTx(tx);
        console.log("signed: ", signed);
        // @ts-ignore
        const txHash = await web3.eth.sendSignedTransaction(signed);
        console.log("txHash: ", txHash);
        setTxid(txHash.transactionHash);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsMinting(false);
    }
  };

  useEffect(() => {
    onStart();
  }, [api]);

  return (
    <div>
      <div>
        address:{address}
        <br />
        {/* Single image with Mint button */}
        <img src={picutreNFT} alt="NFT" style={{ width: "300px" }} />
        <button onClick={handleMint} disabled={isMinting}>
          {isMinting ? "Minting..." : "Mint"}
        </button>
      </div>
    </div>
  );
};

export default Home;
