
import { AccountId, PrivateKey, TokenCreateTransaction, Client, TokenType } from "@hashgraph/sdk";


//Create your Hedera Testnet client
const client = Client.forTestnet();

const myAccountId = AccountId.fromString(process.env.REACT_APP_MY_ACCOUNT_ID!);
const myPrivateKey = PrivateKey.fromString(process.env.REACT_APP_MY_PRIVATE_KEY!);
//Set your account as the client's operator
client.setOperator(myAccountId, myPrivateKey);


/**
 * Function to create a fungible token
 * @param tokenName 
 * @param tokenSymbol 
 * @param treasuryAccountId 
 * @param supplyPublicKey 
 * @param client 
 * @param privateKey 
 * @returns the token id
 */
export async function createFungibleToken(tokenName: string, tokenSymbol: string) {

	const tokenCreateTx = await new TokenCreateTransaction()
		.setTokenName(tokenName)
		.setTokenSymbol(tokenSymbol)
		.setTokenType(TokenType.FungibleCommon)
		.setDecimals(0)
		.setInitialSupply(1000)
		.setTreasuryAccountId(myAccountId)
		.setSupplyKey(myPrivateKey.publicKey)
		.freezeWith(client);


	const tokenCreateSign = await tokenCreateTx.sign(myPrivateKey);
	const tokenCreateExec = await tokenCreateSign.execute(client);

	// Sign the transaction with the token adminKey and the token treasury account private key
	const tokenCreateRx = await tokenCreateExec.getReceipt(client);
	const tokenId = tokenCreateRx.tokenId

	console.log(`- Created token with ID: ${tokenId} \n`);
	console.log(`- Token Address: ${tokenId!.toSolidityAddress()} \n`);

	return tokenId;
}
