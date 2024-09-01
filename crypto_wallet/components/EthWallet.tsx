import { useState } from "react";
import { mnemonicToSeed } from "bip39";
import { ethers, Wallet, HDNodeWallet } from "ethers";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import axios from 'axios';
import EthWalletSelection from "./ETHSelectWallet";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";

interface EthWalletProps {
  mnemonic: string;
}

type Balances = {
  [key: string]: number;
};

type WalletInfo = {
  wallet: Wallet;
  publicKey: string;
  privateKey: string;
};

type PrivateKeys = {
  [key: string]: boolean;
};

const EthWallet: React.FC<EthWalletProps> = ({ mnemonic }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [balances, setBalances] = useState<Balances>({});
  const [ethWallets, setethWallets] = useState<WalletInfo[]>([]);
  const [privateKeys, setPrivateKeys] = useState<PrivateKeys>({});
  const [ethRecipientAddress, setethRecipientAddress] = useState<string>("");
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [ethAmount, setETHAmount] = useState<string>("");
  const [transactions, setTransactions] = useState<string[]>([]); // State for transaction history

  const addWallet = async () => {
    try {
      const seed = await mnemonicToSeed(mnemonic);
      const derivationPath = `m/44'/60'/${currentIndex}'/0'`;
      const hdNode = HDNodeWallet.fromSeed(seed);
      const child = hdNode.derivePath(derivationPath);
      const privateKey = child.privateKey;
      const wallet = new Wallet(privateKey);

      // await requestAirdrop(wallet.address); // to simulate transactions , requesting funds
      // await requestAirdrop(wallet);
      setCurrentIndex((prev) => prev + 1);
      setethWallets((prev) => [
        ...prev,
        {
          wallet,
          publicKey: wallet.address,
          privateKey: privateKey.toString(),
        },
      ]);
    } catch (err) {
      console.log("Error Adding Wallet:", err);
    }
  };

  const requestAirdrop = async (wallet: ethers.Wallet): Promise<void> => {
    try {
      const faucetAmount = '0.1'; // 0.1 ETH
  
      const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/${process.env.NEXT_PUBLIC_ETH_API_ROUTE}`);
  
      const connectedWallet = wallet.connect(provider);
  
      const tx = {
        to: wallet.address,
        value: ethers.parseEther(faucetAmount),
      };
  
      const transaction = await connectedWallet.sendTransaction(tx);
      await transaction.wait();
      console.log(`Transaction successful! Hash: ${transaction.hash}`);
    } catch (error) {
      console.error('Error sending ETH:', error);
    }
  };

  const sendTransactions = async (): Promise<void> => {
    if (!selectedWallet || !ethRecipientAddress || !ethAmount) {
      console.log("Please select a wallet and enter a recipient address and amount.");
      return;
    }

    try {
      const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/${process.env.NEXT_PUBLIC_ETH_API_ROUTE}`);

      const selectedWalletInfo = ethWallets.find(wallet => wallet.publicKey === selectedWallet);
      if (!selectedWalletInfo) {
        console.log("Selected wallet not found.");
        return;
      }

      const { wallet } = selectedWalletInfo;

      const tx = {
        to: ethRecipientAddress,
        value: ethers.parseEther(ethAmount),
      };

      const transactionResponse = await wallet.connect(provider).sendTransaction(tx);
      setTransactions((prev) => [...prev, `Sent ${ethAmount} ETH to ${ethRecipientAddress}. Tx Hash: ${transactionResponse.hash}`]); // Update transaction history
      console.log(`Transaction sent: ${transactionResponse}`);
    } catch (err) {
      console.log("Error sending transaction:", err);
    }
  };

  const fetchBalance = async (publicKey: string): Promise<string> => {
    try {
      const { data } = await axios.post(
        `https://eth-sepolia.g.alchemy.com/${process.env.NEXT_PUBLIC_ETH_API_ROUTE}`,
        {
          id: 1,
          jsonrpc: "2.0",
          method: 'eth_getBalance',
          params: [publicKey, 'latest'],
        }
      );

      const balanceInWei = data.result;
      const balanceInEth = parseFloat(ethers.formatEther(balanceInWei));
      setBalances((prev) => ({ ...prev, [publicKey]: balanceInEth }));
      return balanceInWei;

    } catch (err) {
      console.error("Error Fetching Balance:", err);
      return "Error";
    }
  };

  const togglePrivateKeys = (publicKey: string) => {
    try {
      setPrivateKeys((prev) => ({
        ...prev,
        [publicKey]: !prev[publicKey],
      }));
    } catch (err) {
      console.log("Error Toggling Private Keys:", err);
    }
  };

  return (
    <>
      <Button
        className="border border-gray-600 bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300 mb-6"
        onClick={addWallet}
      >
        Add ETH Wallet
      </Button>

      <div className="mb-6 w-full max-w-md mx-auto">
        <Label className="text-white">Recipient Address</Label>
        <Input
          type="text"
          value={ethRecipientAddress}
          onChange={(e) => setethRecipientAddress(e.target.value)}
          placeholder="Enter recipient public key"
          className="mt-2 p-2 text-gray-900 bg-white rounded-md w-full"
        />
      </div>

      <div className="mb-6 w-full max-w-md mx-auto">
        <Label className="text-white">Amount</Label>
        <Input
          type="text"
          value={ethAmount}
          onChange={(e) => setETHAmount(e.target.value)}
          placeholder="Enter the amount you want to send."
          className="mt-2 p-2 text-gray-900 bg-white rounded-md w-full"
        />
      </div>

      <EthWalletSelection
        ethWallets={ethWallets}
        selectedWallet={selectedWallet}
        setSelectedWallet={setSelectedWallet}
      />

      <Button
        onClick={sendTransactions}
        className="bg-gray-800 text-white hover:bg-white mb-8 hover:text-gray-800 transition-colors duration-300"
      >
        Send Transaction
      </Button>

      {ethWallets.map((ethWallet, index) => (
        <Card
          key={`${ethWallet.publicKey}-${index}`}
          className="bg-slate-950 shadow-lg w-auto hover:shadow-xl transition-shadow duration-300 rounded-lg mb-6"
        >
          <CardHeader>
            <CardTitle className="text-white">Wallet</CardTitle>
            <CardDescription className="text-white">
              <span className="text-xs text-gray-500">
                Click here to copy your public key.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2 ">
            <div className="flex items-center justify-center ">
              <Badge
                onClick={() =>
                  navigator.clipboard.writeText(ethWallet.publicKey)
                }
                className="font-bold text-gray-400 text-xs md:text-lg hover:text-white cursor-pointer"
              >
                {ethWallet.publicKey}
              </Badge>
            </div>
            {privateKeys[ethWallet.publicKey] && (
              <div>
                <Label className="text-white">Private Key</Label>
                <Textarea
                  value={ethWallet.privateKey}
                  readOnly
                  className="text-white bg-gray-800 p-2 w-full h-24"
                />
              </div>
            )}

            <div className="text-white">
              Balance: {balances[ethWallet.publicKey] || 0} ETH
            </div>
            <Button
              onClick={() => togglePrivateKeys(ethWallet.publicKey)}
              className="bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300"
            >
              {privateKeys[ethWallet.publicKey] ? "Hide Private Key" : "Show Private Key"}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center items-center">
            <Button
              onClick={() => fetchBalance(ethWallet.publicKey)}
              className="bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300 mt-2"
            >
              Fetch Balance
            </Button>
          </CardFooter>
        </Card>
      ))}

      <div className="w-full max-w-md mx-auto mt-8">
        <h3 className="text-white text-lg mb-4">Transaction History</h3>
        <div className="bg-gray-800 p-4 rounded-lg">
          {transactions.length === 0 ? (
            <p className="text-gray-500">No transactions yet.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-2">
              {transactions.map((tx, index) => (
                <li key={index} className="text-white">{tx}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default EthWallet;