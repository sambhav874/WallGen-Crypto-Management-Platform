'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateMnemonic } from "bip39";
import { useState } from "react";
import SolanaWallet from '../components/ui/SolanaWallet';
import EthWallet from '../components/ui/EthWallet';

export default function Home() {
  const [mnemonic, setMnemonic] = useState("");

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-950 justify-between p-24">
      <div className="z-10 w-full  dark:bg-zinc-800/30 font-mono text-sm lg:flex flex-col items-center">
        {/* Mnemonic Input and Create Button */}
        <div className="flex justify-center w-full items-center gap-8 mb-8">
          <Input
            type="text"
            className="w-[75%] text-white"
            value={mnemonic}
            readOnly
          />
          <Button
            onClick={async () => {
              const mn = await generateMnemonic();
              setMnemonic(mn);
            }} className="border border-gray-600  bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300"
          >
            Create
          </Button>
        </div>

        {/* Title */}
        <div className="flex justify-center items-center mb-8">
          <p className="text-white font-sans text-4xl italic font-extralight">
            Create Wallets
          </p>
        </div>

        {/* Wallet Sections */}
        <div className="flex justify-between w-full">
          {/* Solana Wallet on the Left */}
          <div className="w-1/2 flex flex-col items-center">
            <h2 className="text-2xl text-white mb-4">Solana Wallet</h2>
            <SolanaWallet mnemonic={mnemonic} />
          </div>

          {/* ETH Wallet on the Right */}
          <div className="w-1/2 flex flex-col items-center">
            <h2 className="text-2xl text-white mb-4">ETH Wallet</h2>
            <EthWallet mnemonic={mnemonic} />
          </div>
        </div>
      </div>
    </main>
  );
}
