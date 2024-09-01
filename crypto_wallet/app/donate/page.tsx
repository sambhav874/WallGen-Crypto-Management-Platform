'use client';
import React, { FC, useEffect, useCallback, useState } from "react";
import useUserSOLBalanceStore from "@/stores/useUserSOLBalanceStore";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, TransactionSignature, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import { notify } from "@/utils/notifications";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import Link from "next/link";

const Donate: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [amount, setAmount] = useState("0.0");
  const [isLoading, setIsLoading] = useState(false);

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

    const creatorAddress = new PublicKey("GXwZUsyXvjxT5XQJiAHodWGtghTbWRYmfYcoTD6bast3");
    let signature: TransactionSignature = "";

    setIsLoading(true);

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: creatorAddress,
          lamports: LAMPORTS_PER_SOL * Number(amount),
        })
      );

      signature = await sendTransaction(transaction, connection);

      notify({
        type: "success",
        message: `You have successfully transferred ${amount} SOL.`,
        description: `Transaction Successful`,
        txid: signature,
      });
    } catch (err: any) {
      notify({
        type: "error",
        message: "Transaction failed",
        description: `Transaction Failed ${err.message}`,
        txid: signature,
      });
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connection, amount, sendTransaction]);

  return (
    <div className="bg-slate-950 min-h-screen flex flex-col justify-center items-center p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Support My Work</h1>
        <p className="text-gray-400 max-w-lg mx-auto mb-6">
          Your donation directly supports my work in building and enhancing this platform. Whether large or small, your contribution helps me continue developing innovative features and maintaining this service. Thank you for your support!
        </p>
        <p className="text-red-500 font-semibold">
          Please make sure you are connected to the <strong>Mainnet</strong> network on the homepage before proceeding with the donation.
        </p>
      </div>

      <Card className="w-full max-w-md bg-slate-900 text-white p-8 rounded-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Donate SOL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              type="number"
              placeholder="Enter amount in SOL"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-slate-700 text-white border-slate-600 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <Button
            onClick={onClick}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner /> : "Donate"}
          </Button>
        </CardContent>
        <CardFooter>
          <p className="text-gray-400 text-center">Your balance: {balance} SOL</p>
        </CardFooter>
      </Card>

      <div className="text-center text-gray-400 mt-8">
        <p className="mb-4">Thank you for your generous support!</p>
        <p className="text-sm">For any inquiries or just to say hi, feel free to reach out at <a href="mailto:sambhavjain874@gmail.com" className="text-indigo-500 hover:underline">sambhavjain874@gmail.com</a></p>
      </div>
    </div>
  );
};

export default Donate;