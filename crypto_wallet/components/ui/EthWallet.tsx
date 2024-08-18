import { useState } from "react";
import { mnemonicToSeed } from "bip39";
import  {ethers, Wallet,  HDNodeWallet }   from "ethers";

import { Button } from "./button";
import { Label } from "./label";
import { Input } from "./input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card";
import axios from 'axios';





interface EthWalletProps {
  mnemonic: string;
}

type Balances = {
  [key: string]: number;
};

type WalletInfo = {
  publicKey: string;
  privateKey: string;
};

type PrivateKeys = {
  [key: string]: boolean;
};

const EthWallet: React.FC<EthWalletProps> = ({ mnemonic }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [balances, setBalances] = useState<Balances>({});
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [privateKeys, setPrivateKeys] = useState<PrivateKeys>({});

  const addWallet = async () => {
    try {
      const seed = await mnemonicToSeed(mnemonic);
      const derivationPath = `m/44'/60'/${currentIndex}'/0'`;
      const hdNode = HDNodeWallet.fromSeed(seed);
      const child = hdNode.derivePath(derivationPath);
      const privateKey = child.privateKey;
      const wallet = new Wallet(privateKey);

      setCurrentIndex((prev) => prev + 1);
      setWallets((prev) => [
        ...prev,
        {
          publicKey: wallet.address,
          privateKey: privateKey.toString(),
        },
      ]);
    } catch (err) {
      console.log("Error Adding Wallet:", err);
    }
  };


 

  const fetchBalance = async (publicKey: string): Promise<string> => {
    try {
      const { data } = await axios.post(
        "https://eth-mainnet.g.alchemy.com/v2/Cf_pytUV3i8t8e2ZdsMOm5ILjHMS2JAi",
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
      return balanceInWei.toFixed(4);

  
    } catch (err) {
      console.error("Error Fetching Balance:", err);
      return "Error";
    }
  }
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
                ? `${balances[wallet.publicKey]} ETH`
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
          <CardFooter className="flex justify-between items-center">
          <Button
                  variant="outline"
                  onClick={() => fetchBalance(wallet.publicKey)}
                  className="border border-gray-600  bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300"
                >
                  Check Balance
                </Button>
            <Button
              variant="outline"
              onClick={() => togglePrivateKeys(wallet.publicKey)}
              className="border border-gray-600 bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300"
            >
              {privateKeys[wallet.publicKey]
                ? "Hide Private Key"
                : "Show Private Key"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </>
  );
};

export default EthWallet;
