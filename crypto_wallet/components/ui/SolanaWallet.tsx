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

// Define types for wallet information and balances
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

// Define the type for the props
interface SolanaWalletProps {
  mnemonic: string;
}

const SolanaWallet: React.FC<SolanaWalletProps> = ({ mnemonic }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [balances, setBalances] = useState<Balances>({});
  const [privateKeys, setPrivateKeys] = useState<PrivateKeys>({});

  const fetchBalance = async (publicKey: string) => {
    try {
      const connection = new Connection(
        "https://solana-mainnet.g.alchemy.com/v2/Cf_pytUV3i8t8e2ZdsMOm5ILjHMS2JAi"
      );
      const balance = await connection.getBalance(new PublicKey(publicKey));
      const balanceInSol = balance / 1e9; // Convert lamports to SOL

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
          keypair, // Store the full Keypair object for easy access later( in sendTransactions or for other realted operations.)
        },
      ]);

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
    try {
      const connection = new Connection(
        "https://solana-mainnet.g.alchemy.com/v2/Cf_pytUV3i8t8e2ZdsMOm5ILjHMS2JAi"
      );
      for (const wallet of wallets) {
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: new PublicKey(wallet.publicKey), // sender's id
            toPubkey: new PublicKey(wallet.publicKey), // recipient's id
            lamports: 1000000, // Amount to send (in lamports)
          })
        );
        transaction.sign(wallet.keypair);

        const signature = await connection.sendTransaction(transaction, [
          wallet.keypair,
        ]);

        await connection.confirmTransaction(signature, "processed");

        console.log(`Transaction sent : ${signature}`);
      }
    } catch (error) {
      console.log("Error sending a transaction : ", error);
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
                    ? `${balances[wallet.publicKey]} SOL`
                    : "Loading..."}
                </div>
                <div>
                  {privateKeys[wallet.publicKey] && (
                    <textarea
                      readOnly
                      value={wallet.privateKey}
                      className="mt-2 p-2 text-gray-900 bg-white rounded-md w-full h-24 overflow-auto resize-none"
                    />
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-x-4">
                <Button
                  variant="outline"
                  onClick={() => fetchBalance(wallet.publicKey)}
                  className="border border-gray-600  bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300"
                >
                  Check Balance
                </Button>

                <Button
                  onClick={sendTransactions}
                  className="mb-6 bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300"
                >
                  Send Transactions
                </Button>

                <Button
                  variant="outline"
                  onClick={() => togglePrivateKeys(wallet.publicKey)}
                  className="border border-gray-600  bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300"
                >
                  {privateKeys[wallet.publicKey]
                    ? "Hide Private Key"
                    : "Show Private Key"}
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
