import "./App.css";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Button, Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import type { Chain } from "wagmi";
import { createFungibleToken } from "./utils";
import mintableTokenAbi from "./mt-interface.json";
import { ethers } from "ethers";
import { useState } from "react";
import { TokenId } from "@hashgraph/sdk";

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

function isValidEthereumAddress(address: string) {
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;

  if (!ethAddressRegex.test(address)) {
    alert('Invalid Ethereum address param');
    return false;
  }

  return true;

}

// Function used to create a fungible token using the SDK
async function createToken(onTokenCreated: (tokenId: TokenId) => void) {
  console.log("creating token...")
  tokenId = await createFungibleToken("Mintable Token", "MT");
  onTokenCreated(tokenId!)
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
    console.log("The associate transaction finish with status: ", txAssociate);

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
    console.log("The Dissociate transaction finish with status: ", txDissociate);

  }
  catch (error) {
    console.log("The Dissociate transaction finish with error: ", error);
    alert("The Dissociate function fail, make sure you have changed the account in metamask and that you have created a token");
  }
}

// Function used to transfer a fungible token using the smart contract
async function transferMintableToken(recipientAddress: string, amount: string) {

  await initProviderAndSigner();

  try {

    const isValidAddress = isValidEthereumAddress(recipientAddress);
    if (!isValidAddress) return;

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
    const transfer = await mintableTokenContract.transfer(recipientAddress, amount, { gasLimit: 1000000 });
    const txTransfer = await transfer.wait();
    const transferStatus = txTransfer.status === 1 ? "SUCCESS" : "FAIL";
    alert("Transfer transaction finish with status: " + transferStatus);
    console.log("The transfer transaction finish with status: ", txTransfer);

    // Check the balance of the account after the transfer
    balance = await mintableTokenContract.balanceOf(signer);
    console.log("The balance of the metamask account after the transfer is: ", balance.toString());
  }
  catch (error) {
    console.log("The transfer transaction finish with error: ", error);
    alert("The transfer function fail, make sure you have created a token and you have enough balance to transfer");
  }
}

async function transferHbarToken(address: string, amount: string) {

  await initProviderAndSigner();

  const isValidAddress = isValidEthereumAddress(address);
  if (!isValidAddress) return;

  try {

    const transactionHash = await signer.sendTransaction({
      to: address,
      value: ethers.parseEther(amount)
    });

    console.log('Hbar transaction: ', transactionHash);
  } catch (error) {
    console.error(error);
  }
}

async function approve(address: string, amount: string) {

  await initProviderAndSigner();

  const isValidAddress = isValidEthereumAddress(address);
  if (!isValidAddress) return;

  try {

    // Get the solidity address from the token id
    const mintableTokenContractAddress = '0x' + tokenId!.toSolidityAddress();

    // Create the contract instance to interact with the smart contract
    const mintableTokenContract = new ethers.Contract(
      mintableTokenContractAddress,
      mintableTokenAbi,
      signer,
    );

    // Approve the new account with the amount of tokens
    const approve = await mintableTokenContract.approve(address, amount, { gasLimit: 1000000 });
    const txApprove = await approve.wait();
    const approveStatus = txApprove.status === 1 ? "SUCCESS" : "FAIL";
    alert("Approve transaction finish with status: " + approveStatus);
    console.log("The approve transaction finish with status: ", txApprove);

  } catch (error) {
    console.log("The approve transaction finish with error: ", error);
    alert("The approve function fail, make sure you have created a token and you have enough balance to approve");
  }

}

async function transferFrom(fromAddress: string, toAddress: string, amount: string) {

  await initProviderAndSigner();

  const isFromAddressValidAddress = isValidEthereumAddress(fromAddress);
  const isToAddressValidAddress = isValidEthereumAddress(fromAddress);
  if (!isFromAddressValidAddress || !isToAddressValidAddress) return;

  try {

    // Get the solidity address from the token id
    const mintableTokenContractAddress = '0x' + tokenId!.toSolidityAddress();

    // Create the contract instance to interact with the smart contract
    const mintableTokenContract = new ethers.Contract(
      mintableTokenContractAddress,
      mintableTokenAbi,
      signer,
    );

    // Check the balance of the account before the transfer
    let balance = await mintableTokenContract.balanceOf(fromAddress);
    console.log("The balance of the fromAddress account before the transfer is: ", balance.toString());

    // Transfer the amount of tokens from the account to the new account
    const transferFrom = await mintableTokenContract.transferFrom(fromAddress, toAddress, amount, { gasLimit: 1000000 });
    const txTransferFrom = await transferFrom.wait();
    const transferFromStatus = txTransferFrom.status === 1 ? "SUCCESS" : "FAIL";
    alert("Transfer From transaction finish with status: " + transferFromStatus);
    console.log("The transfer from transaction finish with status: ", txTransferFrom);

    // Check the balance of the account after the transfer
    balance = await mintableTokenContract.balanceOf(fromAddress);
    console.log("The balance of the fromAddress account after the transfer is: ", balance.toString());

  } catch (error) {
    console.log("The transfer from transaction finish with error: ", error);
    alert("The transfer from function fail, make sure you have created a token and you have enough balance to transfer");
  }


}



function App() {

  const [approveAddress, setApproveAddress] = useState("");
  const [approveAmount, setApproveAmount] = useState("");
  const [transferFromAddress, setTransferFromAddress] = useState("");
  const [transferToAddress, setTransferToAddress] = useState("");
  const [transferFromAmount, setTransferFromAmount] = useState("");
  const [regularTransferAddress, setRegularTransferAddress] = useState("");
  const [regularTransferAmount, setRegularTransferAmount] = useState("");
  const [hbarTransferAddress, setHbarTransferAddress] = useState("");
  const [hbarTransferAmount, setHbarTransferAmount] = useState("");
  const [tokenCreated, setTokenCreated] = useState(false);
  const [createdTokenId, setCreatedTokenId] = useState("");


  const handleTokenCreated = (tokenId: TokenId) => {
    setTokenCreated(true);
    setCreatedTokenId(tokenId.toString());
    alert("Token created successfully with id: " + tokenId);
  };

  return (
    <div className="app">
      <WagmiConfig config={wagmiConfig}>
        <div className="left-column">
          {/* RegularTransfer Component */}
          <div className="regular-transfer">
            <h2>Regular Transfer</h2>
            <input
              type="text"
              placeholder="Address"
              value={regularTransferAddress}
              onChange={(e) => setRegularTransferAddress(e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount"
              value={regularTransferAmount}
              onChange={(e) => setRegularTransferAmount(e.target.value)}
            />
            <button onClick={() => transferMintableToken(regularTransferAddress, regularTransferAmount)}>
              Transfer
            </button>
          </div>
          {/* HbarTransfer Component */}
          <div className="hbar-transfer">
            <h2>Hbar Transfer</h2>
            <input type="text"
              placeholder="Address"
              value={hbarTransferAddress}
              onChange={(e) => setHbarTransferAddress(e.target.value)}
            />
            <input type="number"
              placeholder="Amount"
              value={hbarTransferAmount}
              onChange={(e) => setHbarTransferAmount(e.target.value)}
            />
            <button onClick={() => transferHbarToken(hbarTransferAddress, hbarTransferAmount)}>
              Transfer</button>
          </div>
        </div>
        <div className="middle-column">
          {/* TransferFrom Component */}
          <div className="transfer-from">
            <h2>Transfer From</h2>
            <div>
              <input
                type="text"
                placeholder="Address"
                value={approveAddress}
                onChange={(e) => setApproveAddress(e.target.value)}
              />
              <input
                type="number"
                placeholder="Amount"
                value={approveAmount}
                onChange={(e) => setApproveAmount(e.target.value)}
              />
              <button onClick={() => approve(approveAddress, approveAmount)}>
                Approve</button>
            </div>
            <div>
              <input
                type="text"
                placeholder="From Address"
                value={transferFromAddress}
                onChange={(e) => setTransferFromAddress(e.target.value)}
              />
              <input
                type="text"
                placeholder="To Address"
                value={transferToAddress}
                onChange={(e) => setTransferToAddress(e.target.value)}
              />
              <input
                type="number"
                placeholder="Amount"
                value={transferFromAmount}
                onChange={(e) => setTransferFromAmount(e.target.value)}
              />
              <button onClick={() => transferFrom(transferFromAddress, transferToAddress, transferFromAmount)}>
                Transfer From</button>
            </div>
          </div>
        </div>
        <div className="right-column">
          {/* WalletConnect Component*/}
          <div className="wallet-connect">
            <h2>Wallet Connect</h2>
            <Web3Button />
          </div>
          {/* TokenOperations Component */}
          <div className="token-operations">
            <h2>Token Operations</h2>
            <button onClick={() => createToken(handleTokenCreated)} style={{ backgroundColor: tokenCreated ? '#399858' : '#007bff' }}
            >
              {tokenCreated ? `Token ID: ${createdTokenId}` : 'Create fungible token'}
            </button>
            <button onClick={associateAccountWithToken}>Associate</button>
            <button onClick={dissociateAccountWithToken}>Dissociate</button>
          </div>
        </div>
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </div>
  );
}

export default App;
