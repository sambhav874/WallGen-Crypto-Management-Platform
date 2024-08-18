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
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [balances, setBalances] = useState<Balances>({});
  const [privateKeys, setPrivateKeys] = useState<PrivateKeys>({});
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [selectedWallet, setSelectedWallet] = useState<string>("");

  const airdropSol = async (publicKey: PublicKey) => {
    try {
      const connection = new Connection(
        "https://solana-devnet.g.alchemy.com/v2/Cf_pytUV3i8t8e2ZdsMOm5ILjHMS2JAi"
      );
      const airdropSignature = await connection.requestAirdrop(publicKey, solToLamports(2)); // Request 2 SOL
      await connection.confirmTransaction(airdropSignature);
      console.log("Airdrop successful!");
    } catch (err) {
      console.log("Error during airdrop:", err);
    }
  };

  const fetchBalance = async (publicKey: string) => {
    try {
      const connection = new Connection(
        "https://solana-devnet.g.alchemy.com/v2/Cf_pytUV3i8t8e2ZdsMOm5ILjHMS2JAi"
      );
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
    try {
      const seed = await mnemonicToSeed(mnemonic);
      const path = `m/44'/501'/${currentIndex}'/0'`;
      const derivedSeed = derivePath(path, seed.toString("hex")).key;
      const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
      const keypair = Keypair.fromSecretKey(secret);

      setWallets((prev) => [
        ...prev,
        {
          publicKey: keypair.publicKey.toBase58(),
          privateKey: Buffer.from(secret).toString("hex"),
          keypair,
        },
      ]);

      await airdropSol(keypair.publicKey); // Airdrop SOL after wallet creation

      setCurrentIndex((prev) => prev + 1);
    } catch (err) {
      console.log("Error Adding Wallet:", err);
    }
  };

  const togglePrivateKeys = (publicKey: string) => {
    try {
      setPrivateKeys((prev) => ({
        ...prev,
        [publicKey]: !prev[publicKey],
      }));
    } catch (error) {
      console.log("Error Toggling Private Keys: " + error);
    }
  };

  const sendTransactions = async (): Promise<void> => {
    if (!selectedWallet || !recipientAddress) {
      console.log("Please select a wallet and enter a recipient address.");
      return;
    }

    try {
      const connection = new Connection(
        "https://solana-devnet.g.alchemy.com/v2/Cf_pytUV3i8t8e2ZdsMOm5ILjHMS2JAi"
      );
      const wallet = wallets.find(
        (w) => w.publicKey === selectedWallet
      );

      if (!wallet) {
        console.log("Selected wallet not found.");
        return;
      }

      const { blockhash } = await connection.getLatestBlockhash();

      const amountInSOL = 1; // Set the amount you want to send in SOL
      const amountInLamports = solToLamports(amountInSOL); // Convert SOL to lamports

      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: wallet.keypair.publicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: wallet.keypair.publicKey, // sender's id
          toPubkey: new PublicKey(recipientAddress), // recipient's id from input
          lamports: amountInLamports, // Amount to send (in lamports)
        })
      );
      transaction.sign(wallet.keypair);

      const signature = await connection.sendTransaction(transaction, [
        wallet.keypair,
      ]);

      await connection.confirmTransaction(signature, "processed");

      console.log(`Transaction sent: ${signature}`);
    } catch (error) {
      console.log("Error sending a transaction:", error);
    }
  };

  return (
    <>
      <Button
        onClick={addWallet}
        className="mb-6 bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300"
      >
        Add Wallet
      </Button>

      {/* Recipient Address Input */}
      <div className="mb-6 w-full max-w-md mx-auto">
        <Label className="text-white">Recipient Address</Label>
        <Input
          type="text"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder="Enter recipient public key"
          className="mt-2 p-2 text-gray-900 bg-white rounded-md w-full"
        />
      </div>

      {/* Wallet Selection */}
      <div className="mb-6 w-full max-w-md mx-auto">
        <Label className="text-white">Select Wallet</Label>
        <select
          value={selectedWallet}
          onChange={(e) => setSelectedWallet(e.target.value)}
          className="mt-2 p-2 text-gray-900 bg-white rounded-md w-full"
        >
          <option value="">Select a wallet</option>
          {wallets.map((wallet) => (
            <option key={wallet.publicKey} value={wallet.publicKey}>
              {wallet.publicKey}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-slate-950 text-white w-full">
        <div className="w-full flex justify-center items-center flex-col">
          {wallets.map((wallet) => (
            <Card
              key={wallet.publicKey}
              className="bg-slate-950 shadow-lg w-[75%] hover:shadow-xl transition-shadow duration-300 rounded-lg mb-6"
            >
              <CardHeader>
                <CardTitle className="text-white">Wallet</CardTitle>
                <CardDescription className="text-white mt-2 font-sans text-lg">
                  Your own crypto wallet!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label className="text-white">Public Key</Label>
                  <Input
                    type="text"
                    readOnly
                    value={wallet.publicKey}
                    className="mt-2 p-2 text-gray-900 bg-white rounded-md w-full"
                  />
                </div>
                <div className="text-white mb-4">
                  Balance:{" "}
                  {balances[wallet.publicKey] !== undefined
                    ? balances[wallet.publicKey].toFixed(4)
                    : "Fetching..."}{" "}
                  SOL
                </div>
                <Button
                  onClick={() => fetchBalance(wallet.publicKey)}
                  className="bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300"
                >
                  Fetch Balance
                </Button>
                <Button
                  onClick={() => togglePrivateKeys(wallet.publicKey)}
                  className="bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300 mt-4"
                >
                  {privateKeys[wallet.publicKey] ? "Hide" : "Show"} Private Key
                </Button>
                {privateKeys[wallet.publicKey] && (
                  <Input
                    type="text"
                    readOnly
                    value={wallet.privateKey}
                    className="mt-2 p-2 text-gray-900 bg-white rounded-md w-full"
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Button
        onClick={sendTransactions}
        className="bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300"
      >
        Send Transaction
      </Button>
    </>
  );
};

export default SolanaWallet;
