'use client';

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateMnemonic } from "bip39";
import { FC, useState } from "react";
import SolanaWallet from '@/components/SolanaWallet';
import EthWallet from '@/components/EthWallet';

const CreateWallet: FC = () => {
  const [mnemonic, setMnemonic] = useState("");

  return (
    <main suppressHydrationWarning className="min-h-screen flex flex-col items-center bg-slate-950 justify-between p-4 md:p-6 lg:p-8 relative">
      {/* Title */}
      <div className="flex flex-col items-center mb-8 mt-16">
        <p className="text-white font-mono text-4xl md:text-3xl lg:text-5xl leading-relaxed tracking-wider font-extralight hover:font-bold transition-all duration-300 mb-4">
          Create Wallets
        </p>
      </div>

      {/* Mnemonic Input and Create Button */}
      <div className="flex flex-col items-center w-full max-w-md gap-6 mb-8">
        <Textarea
          className="w-full max-w-full text-center text-white bg-gray-700 border border-gray-600"
          value={mnemonic}
          readOnly
        />
        <Button
          onClick={async () => {
            const mn = await generateMnemonic();
            setMnemonic(mn);
          }}
          className="border border-gray-600 bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300 px-6 py-2 text-lg"
        >
          Create
        </Button>
      </div>

      {/* Wallet Sections */}
      <div className="flex flex-col md:flex-row md:justify-between w-full max-w-6xl">
        {/* Solana Wallet */}
        <div className="flex flex-col items-center mb-8 md:mb-0 md:w-1/2">
          <h2 className="text-2xl md:text-3xl font-extralight hover:font-bold duration-300 text-white mb-4">
            Solana Wallet
          </h2>
          <SolanaWallet mnemonic={mnemonic} />
        </div>

        {/* ETH Wallet */}
        <div className="flex flex-col items-center md:w-1/2">
          <h2 className="text-2xl md:text-3xl font-extralight hover:font-bold duration-300 text-white mb-4">
            ETH Wallet
          </h2>
          <EthWallet mnemonic={mnemonic} />
        </div>
      </div>
    </main>
  );
};

export default CreateWallet;