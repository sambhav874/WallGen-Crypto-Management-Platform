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
import { Button } from "./button";
import { Input } from "./input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Label } from "./label";
import SolWalletSelection from "./SOLSelectWallet";
import { Textarea } from "./textarea";
import { useRouter } from "next/navigation";
import { Badge } from "./badge";

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
  const [isAirdropInProgress , setIsAirdropInProgress] = useState<boolean>(false);

  const key = (process.env.NEXT_PUBLIC_SOL_API_ROUTE);

  const connection = new Connection(
    `https://solana-devnet.g.alchemy.com/${key}`
  );

  const airdropSol = async (publicKey: PublicKey) => {
    try {
      const latestBlockhash = await connection.getLatestBlockhash();
  
      const airdropSignature = await connection.requestAirdrop(
        publicKey,
        solToLamports(2) // Request 2 SOL
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
        className="bg-gray-800 text-white hover:bg-white mb-8 hover:text-gray-800 transition-colors duration-300"
      >
        Send Transaction
      </Button>

      <div className="bg-slate-950 text-white w-full">
        <div className="w-full  flex justify-center items-center flex-col">
          {solWallets.map((wallet, index) => (
            <Card
              key={`${wallet.publicKey}-${index}`}
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
              <CardContent className="flex flex-col space-y-2">
                <div className="flex items-center justify-center">
                  <Badge
                    onClick={() =>
                      navigator.clipboard.writeText(wallet.publicKey)
                    }
                    className="font-bold text-gray-400 text-xs md:text-lg hover:text-white cursor-pointer"
                  >
                    {wallet.publicKey}
                  </Badge>
                  
                </div>
                {privateKeys[wallet.publicKey] && (
                  <div>
                    <Label className="text-white">Private Key</Label>
                    <Textarea
                      value={wallet.privateKey}
                      readOnly
                      className="text-white bg-gray-800 p-2 w-full h-24"
                    />
                  </div>
                )}
                
                <div className="text-white">
                  Balance: {balances[wallet.publicKey] || 0} SOL
                </div>
                <Button
                    onClick={() => togglePrivateKeys(wallet.publicKey)}
                    className="bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300"
                  >
                    {privateKeys[wallet.publicKey] ? "Hide Private Key" : "Show Private Key"}
                  </Button>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
              
                <Button
                  onClick={() => airdropSol(new PublicKey(wallet.publicKey))}
                  className="bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300"
                >
                  Request 2 SOL
                </Button>

                <Button
                  onClick={() => fetchBalance(wallet.publicKey)}
                  className="bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300 "
                >
                  Fetch Balance
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default SolanaWallet;
