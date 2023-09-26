import "./App.css";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Button, Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import type { Chain } from "wagmi";
import React from "react";

import mintableTokenAbi from "./mt-interface.json";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum: import("ethers").Eip1193Provider;
  }
}

const testnetApiUrl = "https://testnet.hashio.io/api";

const hederaTestnet = {
  id: 296,
  name: "Hedera Testnet",
  network: "testnet",
  nativeCurrency: {
    decimals: 18,
    name: "HBAR",
    symbol: "ℏ",
  },
  rpcUrls: {
    public: { http: [testnetApiUrl] },
    default: { http: [testnetApiUrl] },
  },
  blockExplorers: {
    default: { name: "HashScan", url: "https://hashscan.io/testnet/dashboard" },
  },
} as const satisfies Chain;

const chains = [hederaTestnet];
const projectId = "58bc91d22471456becc991ee47b66d22";

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});

const ethereumClient = new EthereumClient(wagmiConfig, chains);

const mintableTokenContractAddress =
  "0x0000000000000000000000000000000000edaabf";

let provider: ethers.BrowserProvider;
let signer: ethers.Signer;

async function initProvider() {
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
}

async function transferHbar() {
  if (!provider) initProvider();

  const response = await provider.send("eth_chainId", []);
}

async function transferMintableToken() {
  if (!provider) initProvider();
  const [account] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  console.log(account);

  const signer = await provider.getSigner();

  const mintableTokenContract = new ethers.Contract(
    mintableTokenContractAddress,
    mintableTokenAbi,
    signer,
  );

  const balance = await mintableTokenContract.balanceOf(account);
  console.log("balance", balance);
  await mintableTokenContract.transfer(
    "0x462f65AD30e0BB3B4104c91D2FFc3b85872bbfBf",
    "2000000000000000000",
  );
}

function App() {
  return (
    <div className="App">
      <>
        <WagmiConfig config={wagmiConfig}>
          <h1>WalletConnect integration example</h1>
          <Web3Button />
        </WagmiConfig>
        <button onClick={transferHbar}>Transfer 2 HBAR to Mirror Node</button>
        <button onClick={transferMintableToken}>
          Transfer 2 MT to My Second Account
        </button>

        <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
      </>
    </div>
  );
}

export default App;
