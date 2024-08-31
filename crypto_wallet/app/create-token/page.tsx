'use client'

import React, { FC, useCallback, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import Image from "next/image";
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  getAssociatedTokenAddress,
  createMintToInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import {
  PROGRAM_ID,
  createCreateMetadataAccountV3Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import axios from "axios";
import { notify } from './../../utils/notifications';
import { ClipLoader } from "react-spinners";
import { useNetworkConfiguration } from "@/contexts/NetworkConfigurationProvider";
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const Token = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { networkConfiguration } = useNetworkConfiguration();
  const [tokenUri, setTokenUri] = useState("");
  const [tokenMintAddress, setTokenMintAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [token, setToken] = useState({
    name: "",
    symbol: "",
    decimals: "",
    amount: "",
    description: "",
    image: "",
  });

  const [imagePreview, setImagePreview] = useState("");

  const handleFormFieldChange = (fieldName, e) => {
    setToken({ ...token, [fieldName]: e.target.value });
  };

  const uploadImagePinata = async (file) => {
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
            pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
          },
        });

        const imgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        setImagePreview(imgHash); // Set the image preview URL
        return imgHash;
      } catch (err) {
        notify({ type: "error", message: "Upload to Pinata image failed." });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const uploadMetadata = async (token) => {
    setIsLoading(true);
    const { name, symbol, description, image } = token;
    
    if (!name || !symbol || !description || !image) {
      setIsLoading(false);
      return;
    }

    const data = JSON.stringify({
      name: name,
      symbol: symbol,
      description: description,
      image: image,
    });

    try {
      const response = await axios({
        method: "POST",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: data,
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
          pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
        },
      });

      const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
      return url;
    } catch (err) {
      notify({ type: "error", message: "Upload to Pinata JSON failed." });
    } finally {
      setIsLoading(false);
    }
  };

  const createToken = useCallback(
    async (token) => {
      if (!publicKey) {
        notify({ type: "error", message: "Please connect your wallet." });
        return;
      }

      setIsLoading(true);

      try {
        const lamports = await getMinimumBalanceForRentExemptMint(connection);
        const mintKeypair = Keypair.generate();
        const tokenAta = await getAssociatedTokenAddress(
          mintKeypair.publicKey,
          publicKey
        );

        const metadataUrl = await uploadMetadata(token);
        if (!metadataUrl) {
          throw new Error("Metadata upload failed.");
        }

        setTokenUri(metadataUrl);

        const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
          {
            metadata: PublicKey.findProgramAddressSync(
              [
                Buffer.from("metadata"),
                PROGRAM_ID.toBuffer(),
                mintKeypair.publicKey.toBuffer(),
              ],
              PROGRAM_ID
            )[0],
            mint: mintKeypair.publicKey,
            mintAuthority: publicKey,
            payer: publicKey,
            updateAuthority: publicKey,
          },
          {
            createMetadataAccountArgsV3: {
              data: {
                name: token.name,
                symbol: token.symbol,
                uri: metadataUrl,
                creators: null,
                sellerFeeBasisPoints: 0,
                uses: null,
                collection: null,
              },
              isMutable: false,
              collectionDetails: null,
            },
          }
        );

        const createNewToken = new Transaction().add(
          SystemProgram.createAccount({
            fromPubkey: publicKey,
            newAccountPubkey: mintKeypair.publicKey,
            space: MINT_SIZE,
            programId: TOKEN_PROGRAM_ID,
            lamports: lamports,
          }),
          createInitializeMintInstruction(
            mintKeypair.publicKey,
            Number(token.decimals),
            publicKey,
            publicKey,
            TOKEN_PROGRAM_ID
          ),
          createAssociatedTokenAccountInstruction(
            publicKey,
            tokenAta,
            publicKey,
            mintKeypair.publicKey
          ),
          createMintToInstruction(
            mintKeypair.publicKey,
            tokenAta,
            publicKey,
            Number(token.amount) * Math.pow(10, Number(token.decimals))
          ),
          createMetadataInstruction
        );

        const signature = await sendTransaction(createNewToken, connection, {
          signers: [mintKeypair],
        });
        setTokenMintAddress(mintKeypair.publicKey.toString());

        notify({
          type: "success",
          message: "Token minted successfully",
          txid: signature,
        });
      } catch (err) {
        notify({ type: "error", message: "Token minting failed." });
      } finally {
        setIsLoading(false);
      }
    },
    [publicKey, connection, sendTransaction]
  );

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const imgUrl = await uploadImagePinata(file);
      if (imgUrl) {
        setToken({ ...token, image: imgUrl });
      }
    }
  };

  return (
    <div className="bg-black flex items-center justify-center min-h-screen min-w-screen p-6">
      <div className="max-w-2xl my-4 min-w-[50%] p-8 bg-slate-950 border border-slate-800 text-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-6">Create Your Token</h2>
        <form className="space-y-6 w-full">
          <div className="space-y-4">
            <Label className="block">Name</Label>
            <Input
              type="text"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md"
              value={token.name}
              onChange={(e) => handleFormFieldChange("name", e)}
              placeholder="Token Name"
            />
          </div>

          <div className="space-y-4">
            <Label className="block">Symbol</Label>
            <Input
              type="text"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md"
              value={token.symbol}
              onChange={(e) => handleFormFieldChange("symbol", e)}
              placeholder="Token Symbol"
            />
          </div>

          <div className="space-y-4">
            <Label className="block">Decimals</Label>
            <Input
              type="number"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md"
              value={token.decimals}
              onChange={(e) => handleFormFieldChange("decimals", e)}
              placeholder="Decimals"
            />
          </div>

          <div className="space-y-4">
            <Label className="block">Amount</Label>
            <Input
              type="number"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md"
              value={token.amount}
              onChange={(e) => handleFormFieldChange("amount", e)}
              placeholder="Amount"
            />
          </div>

          <div className="space-y-4">
            <Label className="block">Description</Label>
            <Textarea
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md"
              value={token.description}
              onChange={(e) => handleFormFieldChange("description", e)}
              placeholder="Description"
            />
          </div>

          <div className="space-y-4">
            <Label className="block">Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md"
            />
            {imagePreview &&<div className="flex justify-center items-center"> <Image src={imagePreview} width={300} height={300} alt="Image Preview" className="mt-4 max-w-xs h-auto" /> </div>}
            
          </div>

          <Button
            type="button"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
            onClick={() => createToken(token)}
          >
            {isLoading ? (
              <ClipLoader color="#ffffff" size={24} />
            ) : (
              "Create Token"
            )}
          </Button>

          {tokenMintAddress && (
            <Card className="mt-4">
              <CardHeader>
                <h3 className="text-xl font-semibold">Token Mint Address</h3>
              </CardHeader>
              <CardContent>
                <div className="break-all overflow-hidden">
                  <a
                    href={`https://solscan.io/token/${tokenMintAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                    title={tokenMintAddress}
                  >
                    {tokenMintAddress}
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {tokenUri && (
            <Card className="mt-4">
              <CardHeader>
                <h3 className="text-xl font-semibold">Token Metadata URI</h3>
              </CardHeader>
              <CardContent>
                <div className="break-all overflow-hidden">
                  <a
                    href={tokenUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                    title={tokenUri}
                  >
                    {tokenUri}
                  </a>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
};

export default Token;