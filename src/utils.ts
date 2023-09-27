
import { AccountId, PrivateKey, TokenAssociateTransaction, TokenCreateTransaction, AccountCreateTransaction, Client, TokenType, TokenId } from "@hashgraph/sdk";


//Create your Hedera Testnet client
const client = Client.forTestnet();

const myAccountId = AccountId.fromString(process.env.REACT_APP_MY_ACCOUNT_ID!);
const myPrivateKey = PrivateKey.fromString(process.env.REACT_APP_MY_PRIVATE_KEY!);
//Set your account as the client's operator
client.setOperator(myAccountId, myPrivateKey);



/**
 * Function to create an account
 * @param client 
 * @param key 
 * @param initialBalance
 * @returns the account id
 */
export async function createAccount() {
	const createAccountTx = await new AccountCreateTransaction()
		.setKey(myPrivateKey)
		.setInitialBalance('10')
		.execute(client);

	const createAccountRx = await createAccountTx.getReceipt(client);
	return {
		accountId: createAccountRx.accountId,
		privateKey: myPrivateKey,
	};
}


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
		.setDecimals(2)
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

export async function tokenAssociate(accountId: AccountId, accountKey: PrivateKey, tokenIds: TokenId) {
    const tokenAssociateTx = await new TokenAssociateTransaction()
      .setAccountId(accountId)
      .setTokenIds([tokenIds])
      .freezeWith(client);
    const signTx = await tokenAssociateTx.sign(accountKey);
    const txResponse = await signTx.execute(client);
    const receipt = await txResponse.getReceipt(client);
    console.log(`- Token Associated: ${receipt.status} \n`);
}