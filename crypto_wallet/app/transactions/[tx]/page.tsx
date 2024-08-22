'use client'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, Drawer, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Connection } from "@solana/web3.js";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const lamportsToSOL = (lamports: number): number => lamports / 1e9;

const TransactionDetailsPage = () => {
  const [signature, setSignature] = useState<string>('');
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { tx } = useParams();

  useEffect(() => {
    if (typeof tx === "string") {
      setSignature(tx);
    }
  }, [tx]);

  useEffect(() => {
    const getTransactionDetails = async () => {
      if (!signature) {
        console.log("No signature found");
        return;
      }

      try {
        const connection = new Connection(
          "https://solana-devnet.g.alchemy.com/v2/Cf_pytUV3i8t8e2ZdsMOm5ILjHMS2JAi"
        );
        const data = await connection.getTransaction(signature);

        if (data) {
          setDetails(data);
        } else {
          console.log("Transaction not found or invalid signature.");
          setDetails(null);
        }
      } catch (err) {
        console.log(`Error fetching transaction details: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    getTransactionDetails();
  }, [signature]);

  if (loading) {
    return (
      <div className="flex justify-center items-center text-3xl">
        <p>Loading transaction details...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen flex justify-center items-center">
        <Link href={'/transactions'} className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow-sm h-9 border border-gray-600 absolute top-56 p-6 text-xl bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300">
            View all the transactions .
          </Link>
      <Drawer>
        <DrawerTrigger asChild>
            
          <Button variant="outline" className="border border-gray-600 absolute top-28 p-6 text-xl bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300">
            View Transaction Details
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-full bg-slate-950">
          <div className="mx-auto w-full p-4">
            <DrawerHeader className="text-center">
              <DrawerTitle className="text-white text-3xl   font-sans font-extralight leading-relaxed tracking-widest">Transaction Details</DrawerTitle>
              <DrawerDescription className="text-white text-3xl mt-2">Signature: <Badge className="bg-slate-800 text-white text-2xl">{signature}</Badge></DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              {details ? (
                <div className="p-4 rounded-lg flex flex-col shadow-md w-full space-y-4 bg-slate-900">
                  {[
                    { label: "Block Time:", value: details.blockTime },
                    { label: "Compute Units Consumed:", value: details.meta.computeUnitsConsumed },
                    { label: "Fees:", value: `${lamportsToSOL(details.meta.fee)} SOL` },
                    { label: "Sender's Address:", value: details.transaction.message.accountKeys[0]?.toString() },
                    { label: "Receiver's Address:", value: details.transaction.message.accountKeys[1]?.toString() },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between tracking-wider leading-6 items-center hover:border-b-2 hover:border-gray-400 pb-2 transition-all duration-300 ease-in-out"
                    >
                      <p className="text-2xl  tracking-wider leading-6 font-extralight hover:font-bold text-white font-mono duration-300">
                        {item.label}
                      </p>
                      <Badge className="bg-gray-700 text-xl p-2 text-white">{item.value}</Badge>
                    </div>
                  ))}

                  <div className="space-y-2">
                    <p className="text-2xl font-extralight tracking-wider leading-6 hover:font-bold text-white font-mono duration-300">Pre Balance:</p>
                    <div className="ml-4 flex justify-end gap-4  hover:border-b-2 tracking-wider leading-6 hover:border-gray-400 pb-2 transition-all duration-300 ease-in-out">
                      <Badge className="bg-gray-700 text-xl tracking-wider leading-6 p-2 text-white">Sender: {lamportsToSOL(details.meta.preBalances[0])} SOL</Badge>
                      <Badge className="bg-gray-700 text-xl tracking-wider leading-6 p-2 text-white">Receiver: {lamportsToSOL(details.meta.preBalances[1])} SOL</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-2xl font-extralight hover:font-bold tracking-wider leading-6 text-white font-mono duration-300">Post Balance:</p>
                    <div className="ml-4 flex justify-end gap-4 hover:border-b-2 tracking-wider leading-6 hover:border-gray-400 pb-2 transition-all duration-300 ease-in-out">
                      <Badge className="bg-gray-700 text-xl p-2 tracking-wider leading-6 text-white">Sender: {lamportsToSOL(details.meta.postBalances[0])} SOL</Badge>
                      <Badge className="bg-gray-700 text-xl p-2 tracking-wider leading-6 text-white">Receiver: {lamportsToSOL(details.meta.postBalances[1])} SOL</Badge>
                    </div>
                  </div>

                  <div className="flex justify-between items-center tracking-wider leading-6 hover:border-b-2 hover:border-gray-400 pb-2 transition-all duration-300 ease-in-out">
                    <p className="text-2xl font-extralight hover:font-bold tracking-wider leading-8 text-white font-mono duration-300">Recent Block Hash:</p>
                    <Badge className="bg-gray-700 text-xl p-2 tracking-wider leading-6 text-white">{details.transaction.message.recentBlockhash.toString()}</Badge>
                  </div>
                </div>
              ) : (
                <p className="text-2xl font-extralight hover:font-bold tracking-wider leading-6 text-white font-mono duration-300">No transaction details available for this signature.</p>
              )}
            </div>
            <DrawerFooter className="flex justify-center items-center">
              <DrawerClose asChild>
                <Button variant="outline" className="border border-gray-600 bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300 w-fit tracking-widest leading-relaxed text-lg">
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default TransactionDetailsPage;
