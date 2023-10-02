<a name="readme-top"></a>


<!-- PROJECT LOGO -->
<br />
<div align="center">


<h3 align="center">WalletConnect Integration Example</h3>

  <p align="center">
    Example project that shows WalletConnect integration with React app and Hedera wallet.
    <br />
    <a href="https://docs.hedera.com/hedera/"><strong>Explore Hedera docs »</strong></a>
    <br />
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#project-configuration">Project Configuration</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

In this tutorial you’ll learn how to integrate WalletConnect with your React app and Hedera wallet. With this example, you can easily connect your Hedera wallet using WalletConnect, use all the native Hedera token functionalities, and seamlessly integrate it as an ERC-20 token.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![Hedera-sdk][Hedera.io]][Hedera-url]
* [![WalletConnect][WalletConnect.io]][WalletConnect-url]
* [![Typescript][Typescript.io]][Typescript-url]
* [![React][React.io]][React-url]




<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

- Install the [MetaMask Chrome extension](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en).
- Basic understanding of [TypeScript](https://www.typescriptlang.org/) and [React](https://react.dev/).
- Get a [Hedera testnet account](https://portal.hedera.com/register).


### Project Setup

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

To get started, follow these steps:

1. Open a terminal window and navigate to your preferred directory where your project will live. Run the following command to clone the repo and install dependencies to your local machine:
    
    ```bash
    git clone https://github.com/Swiss-Digital-Assets-Institute/wallet-connect-integration-example
    cd wallet-connect-integration-example
    npm install
    ```
    
    
    >❗ Note: When installing packages, you may need to manually resolve version conflicts or use the **`-legacy-peer-deps`** flag. ***Please avoid using this flag in production environments.***
    
   
    
2. Create an account on **[https://cloud.walletconnect.com](https://cloud.walletconnect.com/)**, and create a new project to obtain a unique projectID.
    
    After obtaining your Project ID, open the **`src/App.tsx`** file and replace the **`projectId`** variable's value with your unique projectID
    
    ```tsx
    const projectId = "YOUR_PROJECT_ID_HERE"; // Replace with your projectID
    ```
    
3. To make WalletConnect work seamlessly with Hedera, you'll need to add custom chains. Currently, Hedera networks are not included in the default chains list. Follow the instructions provided [here](https://wagmi.sh/react/chains) to configure the chain object. All the required information for constructing the chain object is publicly available. Your configured chain object should resemble the following:
    
    ```jsx
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
    ```
    

1. Once you have configured the chain and WalletConnect correctly, you can utilize the **`window.ethereum`** object to establish an ethers.js connection for the interaction with the blockchain.
    
    Here's how you can set up ethers.js with WalletConnect:
    
    1. **Create an ethers.js Provider**: Start by creating an ethers.js provider using the **`window.ethereum`** object. This provider will enable you to connect to the blockchain.
        
        ```tsx
        const provider = new ethers.BrowserProvider(window.ethereum);
        ```
        
    2. **Accessing a Signer for Transactions**: To perform transactions and interact with the blockchain, you need a signer. You can obtain a signer injected by WalletConnect with the following code:
        
        ```tsx
        const signer = await provider.getSigner();
        ```


### Project Configuration

In this step, you will update and configure your configuration file, so first rename the `.env.example` file to `.env`. and update the `.env` files with the following code.

**Environment Variables**

The `.env` file defines environment variables used in the project. The `REACT_APP_MY_ACCOUNT_ID` and `REACT_APP_MY_PRIVATE_KEY` variables contains the *ECDSA* ***Account ID*** and ***DER Encoded Private Key,*** respectively for the Hedera Testnet account.

```bash
# .env Template for Hedera Network Interaction
# These variables store the accountId and privateKey of the account used to interact with the Hedera network.

# Replace with your Hedera Account ID
REACT_APP_MY_ACCOUNT_ID =

# Replace with your Hedera Private Key
REACT_APP_MY_PRIVATE_KEY =
```


>❗ Please note that all environment variables in this project should begin with **`REACT_APP`**. React automatically recognizes variables starting with **`REACT_APP_`** and loads them into your application. This naming convention ensures that your environment variables are accessible and properly configured for use within your React application.



## Usage

## Running the project


>❗ Before proceeding, it's crucial to ensure that the account you use to connect with WalletConnect matches the one you've defined in your **.env** file. Failing to do so may lead to issues, and the example might not work as expected.



Now that you've successfully set up and configured your project, it's time to run it and see it in action.

Follow these steps to run your project:

1. Open your terminal.
2. Navigate to your project directory if you're not already there.
3. Run the following command:
    
    ```bash
    # This command starts the application in development mode.
    npm run start

	# If you want to build the application for production, run the following command:
	npm run build

	# If you want to eject the application, run the following command:
	npm run eject
    ```


    
4. Open your web browser and go to **[http://localhost:3000](http://localhost:3000/)**. You will be able to view and interact with your project.
    
    You will se something like this:
    
    
5. Additionally, you can open the browser's console (right-clicking and selecting "Inspect" and then navigating to the "Console" tab) to access more detailed information and potential error messages.

**Video Demo**: If you'd like to see a demonstration of how to use this DApp, we've prepared a video tutorial for you. This video will guide you through the usage of the DApp, including creating tokens, transferring them, and more.



> **Important Note**: Before making transfers within the DApp, it's crucial to remember that the token second user must associate themselves with the token that has been created. This association is necessary to enable seamless token transfers between users.
>


<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



[Typescript-url]: https://www.typescriptlang.org/
[Typescript.io]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white

[Solidity-url]: https://soliditylang.org/
[Solidity.io]: https://img.shields.io/badge/Solidity-grey?style=for-the-badge&logo=solidity&logoColor=white

[Hedera-url]: https://docs.hedera.com/hedera/
[Hedera.io]: https://img.shields.io/badge/Hedera%20SDK-8259EF?style=for-the-badge&logo=hedera&logoColor=white

[React-url]: https://reactjs.org/
[React.io]: https://shields.io/badge/react-black?logo=react&style=for-the-badge

[WalletConnect-url]: https://docs.walletconnect.org/
[WalletConnect.io]: https://img.shields.io/static/v1?style=for-the-badge&message=WalletConnect&color=3B99FC&logo=WalletConnect&logoColor=FFFFFF&label=
