'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateMnemonic } from "bip39";
import Image from "next/image";
import { useState } from "react";
import SolanaWallet from '../components/ui/SolanaWallet'
import EthWallet from '../components/ui/EthWallet'

export default function Home() {
  
  const [mnemonic , setMnemonic] = useState("");

  return (


    <main className="flex min-h-screen flex-col items-center bg-slate-800 justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center dark:bg-zinc-800/30justify-between font-mono text-sm lg:flex">
       
<div className="flex  justify-center w-full items-center gap-8">
<Input type="text" className="w-[95%]  text-white" value={mnemonic}></Input>
          <Button onClick={async function(){
            const mn = await generateMnemonic();
            setMnemonic(mn);
          }} >
          Create </Button>

</div>
<div className="flex m-8 justify-center text-center items-center">
  
  
  
  <p className="text-white font-sans text-4xl italic font-extralight"> Create Wallets </p></div>




<div className="flex text-white m-8 p-4 justify-between">





<div className="left-0 relative flex justify-center items-center flex-col">Solana Wallet
  <div className="flex justify-center items-center ">
    <div className="my-4">
    <SolanaWallet mnemonic={mnemonic}  />
    </div>
  </div>




</div>
<div className="right-0 relative flex justify-center items-center flex-col">ETH Wallet
  <div className="flex justify-center items-center ">
    <div className="my-4">
    <EthWallet mnemonic={mnemonic}  />
    </div>
  </div>

</div>
</div>
        
  
      </div>
    </main>
  );
}
