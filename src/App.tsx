import "./App.css";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Button, Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import type { Chain } from "wagmi";
import { createFungibleToken} from "./utils";
import mintableTokenAbi from "./mt-interface.json";
import { ethers } from "ethers";
import { useState } from "react";

declare global {
  interface Window {
    ethereum: import("ethers").Eip1193Provider;
  }
}

// The testnet api url used to connect to the Hedera testnet
const testnetApiUrl = "https://testnet.hashio.io/api";

// The Hedera testnet chain configuration
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

// The chains used in the application
const chains = [hederaTestnet];

// The projectId for the WalletConnect integration
const projectId = "bc8a48da849089da783de2987986630f";

// The public client used in the application
const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);

// The wagmi configuration used in the application
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});

// The ethereum client used in the application
const ethereumClient = new EthereumClient(wagmiConfig, chains);

// Variable used to store the token id
let tokenId;

// Variables used to store the provider and signer
let provider: ethers.BrowserProvider;
let signer: ethers.Signer;

// Function used to initialize the provider and signer variables
async function initProviderAndSigner() {
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
}

// Function used to create a fungible token using the SDK
async function createToken() {
  console.log("creating token...")
  tokenId = await createFungibleToken("Mintable Token", "MT");
  alert("Token created successfully with id: " + tokenId);
}

// Function used to associate a new account with the token using the smart contract
async function associateAccountWithToken() {

  await initProviderAndSigner();

  try {
    // Get the solidity address from the token id
    const mintableTokenContractAddress = '0x' + tokenId!.toSolidityAddress();

    // Create the contract instance to interact with the token
    const mintableTokenContract = new ethers.Contract(
      mintableTokenContractAddress,
      mintableTokenAbi,
      signer,
    );

    // Associate the new token with the current Metamask account using the contract instance
    const transactionResult = await mintableTokenContract.associate();
    const txAssociate = await transactionResult.wait();
    const associateStatus = txAssociate.status === 1 ? "SUCCESS" : "FAIL";
    alert("Associate transaction finish with status: " + associateStatus);
    console.log("The associate transaction finish with status: ", txAssociate.status.toString());

  }
  catch (error) {
    console.log("The associate transaction finish with error: ", error);
    alert("The associate function fail, make sure you have changed the account in metamask and that you have created a token");
  }
}

// Function used to associate a new account with the token using the smart contract
async function dissociateAccountWithToken() {

  await initProviderAndSigner();

  try {
    // Get the solidity address from the token id
    const mintableTokenContractAddress = '0x' + tokenId!.toSolidityAddress();

    // Create the contract instance to interact with the token
    const mintableTokenContract = new ethers.Contract(
      mintableTokenContractAddress,
      mintableTokenAbi,
      signer,
    );

    // Associate the new token with the current Metamask account using the contract instance
    const transactionResult = await mintableTokenContract.dissociate();
    const txDissociate = await transactionResult.wait();
    const dissociateStatus = txDissociate.status === 1 ? "SUCCESS" : "FAIL";
    alert("Dissociate transaction finish with status: " + dissociateStatus);
    console.log("The Dissociate transaction finish with status: ", txDissociate.status.toString());

  }
  catch (error) {
    console.log("The Dissociate transaction finish with error: ", error);
    alert("The Dissociate function fail, make sure you have changed the account in metamask and that you have created a token");
  }
}

// Function used to transfer a fungible token using the smart contract
async function transferMintableToken(recipientAddress: string) {

  await initProviderAndSigner();

  try {

    // Get the solidity address from the token id
    const mintableTokenContractAddress = '0x' + tokenId!.toSolidityAddress();

    // Create the contract instance to interact with the smart contract
    const mintableTokenContract = new ethers.Contract(
      mintableTokenContractAddress,
      mintableTokenAbi,
      signer,
    );

    let balance = await mintableTokenContract.balanceOf(signer);
    console.log("The balance of the metamask account before the transfer is: ", balance.toString());

    // Transfer 2 tokens to the new account
    const transfer = await mintableTokenContract.transfer(recipientAddress, "2", { gasLimit: 1000000 });
    const txTransfer = await transfer.wait();
    const transferStatus = txTransfer.status === 1 ? "SUCCESS" : "FAIL";
    alert("Transfer transaction finish with status: " + transferStatus);
    console.log("The transfer transaction finish with status: ", txTransfer.status.toString());

    // Check the balance of the account after the transfer
    balance = await mintableTokenContract.balanceOf(signer);
    console.log("The balance of the metamask account after the transfer is: ", balance.toString());
  }
  catch (error) {
    console.log("The transfer transaction finish with error: ", error);
    alert("The transfer function fail, make sure you have created a token and you have enough balance to transfer");
  }
}

function App() {
  const [recipientAddress, setrecipientAddress] = useState("");

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
          <button onClick={associateAccountWithToken}>
            Associate new token with recipient account
          </button>
        </div>
        <div>
          <input
            type="text"
            placeholder="Enter Recipient EVM Address"
            value={recipientAddress}
            onChange={(e) => setrecipientAddress(e.target.value)}
            className="text-input" // Aplicar la clase CSS al elemento
          />
          &nbsp;&nbsp;
          <button onClick={() => transferMintableToken(recipientAddress)}>
            Transfer 2 Tokens to Recipient Account
          </button>
        </div>
        <div>
          <button onClick={dissociateAccountWithToken}>
            Dissociate new token with recipient account
          </button>
        </div>
        <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
      </>
    </div>

  );
}

export default App;
