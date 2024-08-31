'use client'
import React, { FC, useState, useCallback } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Metadata, PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { ClipLoader } from "react-spinners";
import { notify } from "@/utils/notifications";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./../../components/ui/card";
import { Button } from './../../components/ui/button';
import { Input } from './../../components/ui/input';
import Image from 'next/image';
import { useNetworkConfiguration } from "@/contexts/NetworkConfigurationProvider";

const TokenMetadata: FC = () => {
  const [metadata, setMetadata] = useState(null);
  const { connection } = useConnection();
  const [tokenAddress, setTokenAddress] = useState("");
  const [logo, setLogo] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { networkConfiguration } = useNetworkConfiguration();

  const getMetadata = useCallback(async (form) => {
    setIsLoading(true);

    try {
      const tokenMint = new PublicKey(form);
      const metadataPDA = PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), PROGRAM_ID.toBuffer(), tokenMint.toBuffer()],
        PROGRAM_ID
      )[0];

      const metadataAccount = await connection.getAccountInfo(metadataPDA);
      const [metadata, _] = await Metadata.deserialize(metadataAccount.data);

      let logoRes = await fetch(metadata.data.uri);
      let logoJson = await logoRes.json();
      let { image } = logoJson;

      setMetadata({ metadata, ...metadata.data });
      console.log(metadata);
      setLogo(image);
      setIsLoading(false);
      setLoaded(true);
      setTokenAddress("");
      notify({ type: "success", message: "Successfully fetched token metadata" });
    } catch (err: any) {
      console.error(err);
      notify({ type: "error", message: "Token metadata fetch failed." });
      setIsLoading(false);
    }
  }, [connection]);

  const solanaExplorerUrl = tokenAddress ? `https://explorer.solana.com/address/${tokenAddress}?cluster=${networkConfiguration}` : '';

  return (
    <div className="bg-slate-950 min-h-screen flex justify-center items-center">
      <Card className="max-w-3xl max-h-screen mx-auto mt-10 shadow-lg bg-slate-900 text-white p-6">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Fetch Token Metadata</CardTitle>
        </CardHeader>
        {loaded && metadata && (
          <CardContent className="text-center mb-4">
            <div className="relative w-24 h-24 mb-4 mx-auto">
              <Image 
                src={logo} 
                alt="Token Logo" 
                layout="fill" 
                objectFit="contain" 
                className="rounded-full shadow-md bg-transparent"
              />
            </div>
            <div className="break-words">
              <h2 className="text-2xl font-mono font-bold hover:text-indigo-400 duration-300">{metadata.name}</h2>
              <p className="text-lg text-gray-400 font-mono hover:text-indigo-400 duration-300">{metadata.symbol}</p>
              <p className="text-lg text-gray-400 font-mono hover:text-indigo-400">
                Description: 
                {metadata.description}
              </p>
              <p className="text-lg mt-2 font-mono hover:text-indigo-400 duration-300">URI: {metadata.uri}</p>
              <p className="text-lg font-mono hover:text-indigo-400 duration-300">Seller Fee: {metadata.sellerFeeBasisPoints / 100}%</p>
            </div>
          </CardContent>
        )}
        <CardContent>
          <Input
            placeholder="Enter Token Address"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            className="mb-4 text-black"
          />
          <Button
            onClick={() => getMetadata(tokenAddress)}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            disabled={isLoading}
          >
            {isLoading ? <ClipLoader size={20} color="#ffffff" /> : "Fetch Metadata"}
          </Button>
          
        </CardContent>
        {loaded  && tokenAddress && (
          <CardFooter className="flex justify-center mt-4">
            <a 
              href={solanaExplorerUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="text-2xl text-red-500 hover:underline"
            >
              View on Solana Explorer
            </a>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default TokenMetadata;