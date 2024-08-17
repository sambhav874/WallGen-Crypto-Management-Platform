import { useEffect, useState } from "react";
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
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
  } from "./card"
  
  import { Label } from "./label"
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "./select"
  

const SolanaWallet = ({ mnemonic }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [wallets, setWallets] = useState([]);
    const [balances, setBalances] = useState({});
    const [privateKeys, setPrivateKeys] = useState([]);

    const fetchBalance = async (publicKey) => {
        try {
            const connection = new Connection(
                "https://solana-mainnet.g.alchemy.com/v2/Cf_pytUV3i8t8e2ZdsMOm5ILjHMS2JAi"
            );
            console.log(wallets[0].privateKey);
            // Fetch balance in lamports and convert to SOL
            const balance = await connection.getBalance(new PublicKey(publicKey));
            const balanceInSol = balance / 1e9; // Convert lamports to SOL

            // Set balance in state
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
            // Generate seed from mnemonic
            const seed = await mnemonicToSeed(mnemonic);
            const path = `m/44'/501'/${currentIndex}'/0'`;
            const derivedSeed = derivePath(path, seed.toString("hex")).key;
            const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
            const keypair = Keypair.fromSecretKey(secret);

            setWallets((prev) => [...prev, {
                publicKey: keypair.publicKey.toBase58(),
                privateKey: Buffer.from(secret).toString("hex")
            }]
            )

            setCurrentIndex((prev) => prev + 1);

        } catch (err) {
            console.log("Error Adding Wallet:", err);
        }
    };

    const togglePrivateKeys = (publicKey) => {
        try{
             setPrivateKeys((prev) => ({
            ...prev,
            [publicKey]: !prev[publicKey]
        }))
        }
       catch(error){
        console.log("Error Toggling Private Keys : " + error)
       }
    }


    return (
        <div>
            <Button onClick={addWallet}>Add Wallet</Button>



    
  

            {wallets.map((wallet) => (
                <div key={wallet.publicKey} className="text-white mb-4">
                    <div>{wallet.publicKey}</div>
                    <Button onClick={() => fetchBalance(wallet.publicKey)}>Check Balance</Button>
                    <div>
                        Balance: {balances[wallet.publicKey] !== undefined ? `${balances[wallet.publicKey]} SOL` : "Loading..."}
                    </div>
                    <div >
                        <Button onClick={() => togglePrivateKeys(wallet.publicKey)} >
                            {privateKeys[wallet.publicKey] ? "Hide Private Key" : "Show Private Key"}
                        </Button>
                        {privateKeys[wallet.publicKey] && (
                            <Input size={50}

                            
                            type="text" readOnly value={wallet.privateKey} className="mt-2 p-2 text-black rounded-full w-full max-w-full" />
                        )}

                    </div>
                </div>
            ))}
        </div>
    );
};

export default SolanaWallet;
