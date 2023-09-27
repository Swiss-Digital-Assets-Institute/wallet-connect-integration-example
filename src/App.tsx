import "./App.css";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Button, Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import type { Chain } from "wagmi";
import { createFungibleToken, tokenAssociate, createAccount } from "./utils";
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
const projectId = "bc8a48da849089da783de2987986630f";

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});

const ethereumClient = new EthereumClient(wagmiConfig, chains);

let tokenId;

let provider: ethers.BrowserProvider;
let signer: ethers.Signer;

async function initProvider() {
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
}

async function createToken() {
  console.log("creating token...")
  tokenId = await createFungibleToken("Mintable Token", "MT");
  alert("Token created successfully with id: " + tokenId);
}

async function transferMintableToken() {
  if (!provider) initProvider();
  const [account] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  signer = await provider.getSigner();

  try {
    const mintableTokenContractAddress = '0x' + tokenId!.toSolidityAddress();

    const mintableTokenContract = new ethers.Contract(
      mintableTokenContractAddress,
      mintableTokenAbi,
      signer,
    );

    let balance = await mintableTokenContract.balanceOf(account);
    console.log("Balance of the metamask account: ", balance.toString());

    const { accountId, privateKey } = await createAccount();

    await tokenAssociate(accountId!, privateKey, tokenId!);

    const newAccountAddress = '0x' + accountId!.toSolidityAddress();

    const transfer = await mintableTokenContract.transfer(
      newAccountAddress, "2", { gasLimit: 1000000 });
    const txTransfer = await transfer.wait();
    const transferStatus = txTransfer.status === 1 ? "SUCCESS" : "FAIL";
    alert("Transfer transaction finish with status: " + transferStatus);
    console.log("The transfer transaction finish with status: ", txTransfer.status.toString());
    balance = await mintableTokenContract.balanceOf(account);
    console.log("The balance of the metamask account is: ", balance.toString());
  }
  catch (error) {
    console.log("The transfer transaction finish with error: ", error);
    alert("The transfer function fail, make sure you have created a token and you have enough balance to transfer");
  }
}

function App() {
  return (
    <div className="App">
      <>
        <WagmiConfig config={wagmiConfig}>
          <h1>WalletConnect integration example</h1>
          <Web3Button />
        </WagmiConfig>
        <div>
          <br></br>
          <button onClick={createToken}>
            Create fungible token
          </button>
        </div>
        <div>
          <button onClick={transferMintableToken}>
            Transfer 2 Tokens to a New Second Account
          </button>
        </div>
        <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
      </>
    </div>

  );
}

export default App;
