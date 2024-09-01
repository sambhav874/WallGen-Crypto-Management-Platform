import { useEffect, useState } from "react";
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import nacl from "tweetnacl";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import SolWalletSelection from "./SOLSelectWallet";
import { Textarea } from "./ui/textarea";
import { useRouter } from "next/navigation";
import { Badge } from "./ui/badge";
import { useNetworkConfiguration } from "@/contexts/NetworkConfigurationProvider";

type WalletInfo = {
  publicKey: string;
  privateKey: string;
  keypair: Keypair;
};

type Balances = {
  [key: string]: number;
};

type PrivateKeys = {
  [key: string]: boolean;
};

interface SolanaWalletProps {
  mnemonic: string;
}

// Convert lamports to SOL
const lamportsToSOL = (lamports: number): number => lamports / 1e9;

// Convert SOL to lamports
const solToLamports = (sol: number): number => sol * 1e9;

const SolanaWallet: React.FC<SolanaWalletProps> = ({ mnemonic }) => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [solWallets, setSolWallets] = useState<WalletInfo[]>([]);
  const [balances, setBalances] = useState<Balances>({});
  const [privateKeys, setPrivateKeys] = useState<PrivateKeys>({});
  const [solRecipientAddress, setSolRecipientAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [transactions, setTransactions] = useState<string[]>([]);
  const [isAirdropInProgress, setIsAirdropInProgress] = useState<boolean>(false);
  const { networkConfiguration } = useNetworkConfiguration();

  const key = process.env.NEXT_PUBLIC_SOL_API_ROUTE;

  const connection = new Connection(
    `https://solana-${networkConfiguration}.g.alchemy.com/${key}`
  );

  const airdropSol = async (publicKey: PublicKey) => {
    if (networkConfiguration !== "devnet") {
      console.log("Airdrop is only available on devnet.");
      return;
    }

    try {
      const latestBlockhash = await connection.getLatestBlockhash();
  
      const airdropSignature = await connection.requestAirdrop(
        publicKey,
        solToLamports(2) 
      );
  
      await connection.confirmTransaction({
        signature: airdropSignature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      }, 'processed');
      
      console.log("Airdrop successful!");
    } catch (err) {
      console.log("Error during airdrop:", err);
    }
  };

  const fetchBalance = async (publicKey: string) => {
    try {
      const balance = await connection.getBalance(new PublicKey(publicKey));
      const balanceInSol = lamportsToSOL(balance); // Convert lamports to SOL

      setBalances((prev) => ({
        ...prev,
        [publicKey]: balanceInSol,
      }));
    } catch (err) {
      console.log("Error Fetching Balance:", err);
    }
  };

  const addWallet = async () => {
    if (isAirdropInProgress) {
      console.log("Please wait for the current airdrop to complete.");
      return;
    }
  
    try {
      setIsAirdropInProgress(true); 
  
      const seed = await mnemonicToSeed(mnemonic);
      const path = `m/44'/501'/${currentIndex}'/0'`;
      const { key } = derivePath(path, seed.toString("hex"));
      const secret = nacl.sign.keyPair.fromSeed(key).secretKey;
  
      const keypair = Keypair.fromSecretKey(secret);
      const publicKey = keypair.publicKey.toBase58();
  
      // if the wallet already exists
      const existingWallet = solWallets.find(
        (w) => w.publicKey === publicKey
      );
      if (existingWallet) {
        console.log("Wallet already exists.");
        setIsAirdropInProgress(false); 
        return;
      }
  
      setSolWallets((prev) => [
        ...prev,
        {
          publicKey,
          privateKey: Buffer.from(secret).toString("hex"),
          keypair,
        },
      ]);
  
      await airdropSol(keypair.publicKey);
  
      setCurrentIndex((prev) => prev + 1);
    } catch (err) {
      console.log("Error Adding Wallet:", err);
    } finally {
      setIsAirdropInProgress(false); 
    }
  };
  
  const togglePrivateKeys = (publicKey: string) => {
    try {
      setPrivateKeys((prev) => ({
        ...prev,
        [publicKey]: !prev[publicKey],
      }));
    } catch (error) {
      console.log("Error Toggling Private Keys:", error);
    }
  };

  const sendTransactions = async (): Promise<void> => {
    if (!selectedWallet || !solRecipientAddress) {
      console.log("Please select a wallet and enter a recipient address.");
      return;
    }
  
    try {
      const wallet = solWallets.find((w) => w.publicKey === selectedWallet);
  
      if (!wallet) {
        console.log("Selected wallet not found.");
        return;
      }
  
      const block = await connection.getLatestBlockhash();
      const amountInLamports = solToLamports(parseFloat(amount));
  
      const transaction = new Transaction({
        recentBlockhash: block.blockhash,
        feePayer: wallet.keypair.publicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: wallet.keypair.publicKey,
          toPubkey: new PublicKey(solRecipientAddress),
          lamports: amountInLamports,
        })
      );
  
      transaction.sign(wallet.keypair);
  
      // Log transaction details
      console.log("Transaction Details:", {
        blockhash: block.blockhash,
        lastValidBlockHeight: block.lastValidBlockHeight,
      });
  
      const txId = await connection.sendTransaction(transaction, [wallet.keypair], {
        skipPreflight: false,
        preflightCommitment: "confirmed",
        maxRetries: 3 
      });

      setTransactions((prev) => {
        const updatedTransactions = [...prev, txId];
        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
        return updatedTransactions;
      });
  
      await connection.confirmTransaction({
        blockhash: block.blockhash,
        lastValidBlockHeight: block.lastValidBlockHeight,
        signature: txId
      });
  
      console.log(`Transaction sent: ${txId}`);
  
      setTransactions((prev) => [...prev, txId]);

      router.push("/transactions");
    } catch (error) {
      console.log("Error sending a transaction:", error);
    }
  };
  
  return (
    <>
      <Button
        onClick={addWallet}
        className={`mb-6 bg-gray-800 text-white ${isAirdropInProgress ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white hover:text-gray-800'} transition-colors duration-300`}
        disabled={isAirdropInProgress}
      >
        {isAirdropInProgress ? 'Airdrop In Progress...' : 'Add Wallet'}
      </Button>

      {/* Recipient Address Input */}
      <div className="mb-6 w-full max-w-md mx-auto">
        <Label className="text-white">Recipient Address</Label>
        <Input
          type="text"
          value={solRecipientAddress}
          onChange={(e) => setSolRecipientAddress(e.target.value)}
          placeholder="Enter recipient public key"
          className="mt-2 p-2 text-gray-900 bg-white rounded-md w-full"
        />
      </div>

      <div className="mb-6 w-full max-w-md mx-auto">
        <Label className="text-white">Amount</Label>
        <Input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter the amount you want to send."
          className="mt-2 p-2 text-gray-900 bg-white rounded-md w-full"
        />
      </div>

      {/* Wallet Selection */}
      <SolWalletSelection
        solWallets={solWallets}
        selectedWallet={selectedWallet}
        setSelectedWallet={setSelectedWallet}
      />

      <Button
        onClick={sendTransactions}
        className="mb-6 bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300"
      >
        Send SOL
      </Button>

      {solWallets.length > 0 && (
        <div className="flex flex-col space-y-4">
          {solWallets.map((wallet) => (
            <Card key={wallet.publicKey} className="bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Wallet {wallet.publicKey}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white">
                  Balance: {balances[wallet.publicKey] ? `${balances[wallet.publicKey]} SOL` : "Loading..."}
                </CardDescription>
                <CardDescription className="text-white">
                  Private Key: {privateKeys[wallet.publicKey] ? wallet.privateKey : "Hidden"}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => togglePrivateKeys(wallet.publicKey)}
                  className="bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300"
                >
                  {privateKeys[wallet.publicKey] ? "Hide Private Key" : "Show Private Key"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

<div className="w-full max-w-md mx-auto mt-10">
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

export default SolanaWallet;