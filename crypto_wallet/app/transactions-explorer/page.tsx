'use client'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, Drawer, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Connection } from "@solana/web3.js";
import Link from "next/link";
import { Input } from "../../components/ui/input";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

const lamportsToSOL = (lamports: number): number => lamports / 1e9;

const TransactionDetailsPage = () => {
  const [signature, setSignature] = useState<string>('');
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getTransactionDetails = async (signature: string) => {
    if (!signature) {
      console.log("No signature found");
      return;
    }
    const key = (process.env.NEXT_PUBLIC_SOL_API_ROUTE);
    try {
      const connection = new Connection(
        `https://solana-devnet.g.alchemy.com/${key}`
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

  const handleButtonClick = () => {
    getTransactionDetails(signature);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignature(e.target.value);
  }

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen flex flex-col justify-center items-center space-y-6 md:space-y-4 lg:space-y-8">
      <Link
        href={'/transactions'}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow-sm h-9 border border-gray-600 bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300 p-3 lg:p-4 text-sm md:text-base lg:text-lg"
      >
        View all transactions
      </Link>

      <div className="flex flex-col items-center w-full md:w-2/3 lg:w-1/2 space-y-4">
        <Input
          type="text"
          placeholder="Enter your signature"
          onChange={handleInputChange}
          value={signature}
          className="w-full text-lg lg:text-xl"
        />
        <Button
          onClick={handleButtonClick}
          className="border border-gray-600 bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300 w-full lg:w-auto text-base lg:text-lg"
        >
          Search
        </Button>
      </div>

      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="border border-gray-600 bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300 text-base lg:text-lg"
          >
            View Transaction Details
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-full bg-slate-950 ">
          <div className=" w-full">
            <DrawerHeader >
            <div className="flex flex-col justify-center items-center">
              <DrawerTitle className="text-white text-xl md:text-2xl lg:text-3xl font-sans font-extralight leading-relaxed tracking-widest">
                Transaction Details
              </DrawerTitle>
              <DrawerDescription className="text-white text-lg md:text-xl lg:text-2xl mt-2"> 
                Signature:<Textarea className="bg-slate-800 mt-2 text-white text-sm md:text-sm lg:text-xl w-full " readOnly>{signature}</Textarea>
              </DrawerDescription></div>
            </DrawerHeader>
            <div className="p-2 space-y-0">
              {details ? (
                <div className="p-2 rounded-lg flex md:p-2 md:mb-4 flex-col shadow-md w-full md:space-y-4 space-y-0 bg-slate-950">
                  {[
                    { label: "Block Time:", value: details.blockTime },
                    { label: "Compute Units Consumed:", value: details.meta.computeUnitsConsumed },
                    { label: "Fees:", value: `${lamportsToSOL(details.meta.fee)} SOL` },
                    { label: "Sender's Address:", value: details.transaction.message.accountKeys[0]?.toString() },
                    { label: "Receiver's Address:", value: details.transaction.message.accountKeys[1]?.toString() },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center  tracking-wider leading-6 hover:border-b-2 hover:border-gray-400 pb-2 transition-all duration-300 ease-in-out"
                    >
                      <p className="text-sm md:text-base lg:text-xl tracking-wider leading-6 font-extralight hover:font-bold text-white font-mono duration-300">
                        {item.label}
                      </p>
                      <Badge className="bg-gray-700 text-xs md:text-base  lg:text-xl p-2 text-white">{item.value}</Badge>
                    </div>
                  ))}

                  <div className="flex justify-between gap-4 hover:border-b-2 tracking-wider leading-6 hover:border-gray-400 pb-2 transition-all duration-300 ease-in-out">
                    <p className="text-sm md:text-base lg:text-xl font-extralight tracking-wider leading-6 hover:font-bold text-white font-mono duration-300">
                      Pre Balance:
                    </p>
                    <div className="  flex gap-2">
                      <Badge className="bg-gray-700 text-xs md:text-base lg:text-xl tracking-wider leading-6 p-2 text-white">
                        Sender: {lamportsToSOL(details.meta.preBalances[0])} SOL
                      </Badge>
                      <Badge className="bg-gray-700 text-xs md:text-basee lg:text-xl tracking-wider leading-6 p-2 text-white">
                        Receiver: {lamportsToSOL(details.meta.preBalances[1])} SOL
                      </Badge>
                    </div>
                  </div>

                  <div className="flex justify-between gap-4 hover:border-b-2 tracking-wider leading-6 hover:border-gray-400 pb-2 transition-all duration-300 ease-in-out">
                    <p className="text-sm md:text-base lg:text-xl font-extralight hover:font-bold tracking-wider leading-6 text-white font-mono duration-300">
                      Post Balance:
                    </p>
                    <div className="flex gap-2">
                      <Badge className="bg-gray-700 text-xs md:text-base lg:text-xl p-2 tracking-wider leading-6 text-white">
                        Sender: {lamportsToSOL(details.meta.postBalances[0])} SOL
                      </Badge>
                      <Badge className="bg-gray-700 text-xs md:text-base lg:text-xl p-2 tracking-wider leading-6 text-white">
                        Receiver: {lamportsToSOL(details.meta.postBalances[1])} SOL
                      </Badge>
                    </div>
                  </div>

                  <div className="flex justify-between items-center tracking-wider leading-6 hover:border-b-2 hover:border-gray-400 transition-all duration-300 ease-in-out">
                    <p className="text-sm md:text-base lg:text-xl font-extralight hover:font-bold tracking-wider leading-8 text-white font-mono duration-300">
                      Recent Block Hash:
                    </p>
                    <Badge className="bg-gray-700 text-sm md:text-base lg:text-xl p-2 tracking-wider leading-6 text-white">
                      {details.transaction.message.recentBlockhash.toString()}
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="text-sm md:text-base lg:text-xl font-extralight hover:font-bold tracking-wider leading-6 text-white font-mono duration-300">
                  No transaction details available for this signature.
                </p>
              )}
            </div>
            <DrawerFooter className="flex justify-center items-center">
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  className="border border-gray-600 bg-gray-800 text-white hover:bg-white hover:text-gray-800 transition-colors duration-300 w-fit tracking-widest leading-relaxed text-lg"
                >
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
