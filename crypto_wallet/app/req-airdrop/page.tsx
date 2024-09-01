'use client'
import React, { FC, useEffect, useCallback, useState } from "react";
import useUserSOLBalanceStore from "@/stores/useUserSOLBalanceStore";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, TransactionSignature } from "@solana/web3.js";
import { notify } from "@/utils/notifications";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from '@/components/ui/button';

const Airdrop: FC = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const balance = useUserSOLBalanceStore((s) => s.balance);
  const { getUserSOLBalance } = useUserSOLBalanceStore();
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection, getUserSOLBalance]);

  return (
    <div className="bg-slate-950 min-h-screen flex justify-center items-center p-6">
      <Card className="max-w-md bg-slate-900 text-white shadow-lg rounded-lg p-6">
        <CardHeader className="text-center mb-4">
          <CardTitle className="text-3xl font-bold mb-2">SOL Airdrop</CardTitle>
          <p className="text-lg">Get a free 1 SOL for testing. No strings attached!</p>
        </CardHeader>
        <CardContent className="text-center mb-4">
          <p className="text-lg mb-4">Your current SOL balance: <span className="font-semibold">{balance}</span> SOL</p>
          <Button
            onClick={onClick}
            className={`w-full ${loading ? "bg-indigo-400" : "bg-indigo-600"} hover:bg-indigo-700`}
            disabled={loading}
          >
            {loading ? <LoadingSpinner /> : <span>Claim Airdrop</span>}
          </Button>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-gray-400 text-sm">Ensure you have a connected wallet to receive the airdrop.</p>
          <p className="text-gray-400 text-sm mt-2">For more information on SOL and its usage, visit <a href="https://solana.com" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">Solana official website</a>.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Airdrop;