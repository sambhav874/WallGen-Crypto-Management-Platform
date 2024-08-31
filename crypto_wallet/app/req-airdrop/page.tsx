'use client'
import React, { FC, useEffect, useCallback } from "react";
import useUserSOLBalanceStore from "@/stores/useUserSOLBalanceStore";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, TransactionSignature } from "@solana/web3.js";
import { notify } from "@/utils/notifications";
import {  Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import LoadingSpinner  from "@/components/ui/loading-spinner";
import {Button} from '@/components/ui/button' // Assuming you have a loading spinner component

const Airdrop: FC = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const balance = useUserSOLBalanceStore((s) => s.balance);
  const { getUserSOLBalance } = useUserSOLBalanceStore();

  useEffect(() => {
    if (publicKey) {
      getUserSOLBalance(publicKey, connection);
    }
  }, [publicKey, connection, getUserSOLBalance]);

  const onClick = useCallback(async () => {
    if (!publicKey) {
      notify({ type: "error", message: "Please connect your wallet first", description: "Wallet not connected" });
      return;
    }

    let signature: TransactionSignature = "";
    try {
      signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
      notify({
        type: "success",
        message: "You have successfully claimed 1 SOL Airdrop.",
        description: `Transaction Successful`,
        txid: signature
      });

      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature
      });

      getUserSOLBalance(publicKey, connection);
    } catch (err) {
      notify({
        type: "error",
        message: "Airdrop failed",
        description: `Transaction Failed ${err}`,
        txid: signature
      });
    }
  }, [publicKey, connection, getUserSOLBalance]);

  return (
    <div className="bg-slate-950 min-h-screen flex justify-center items-center p-6">
      <Card className="max-w-md bg-slate-900 text-white shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl">SOL Airdrop</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg mb-4">Claim 1 SOL for testing purposes. Your current balance: {balance} SOL</p>
          <Button
            onClick={onClick}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {publicKey ? <span>Claim Airdrop</span> : <LoadingSpinner />}
          </Button>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-gray-400 text-sm">Ensure you have a connected wallet to receive the airdrop.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Airdrop;