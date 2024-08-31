'use client';

import { FC, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import NetworkSwitcher from '@/components/NetworkSwitcher';
import Link from "next/link";
import { Drawer, DrawerTrigger, DrawerContent, DrawerClose } from '@/components/ui/drawer';
import './globals.css';

const imagesUp = [
  '/image-1.jpg',
  '/image-2.jpg',
  '/image-3.jpg',
  '/image-4.jpg'
];

const imagesDown = [
  '/image-5.jpg',
  '/image-6.jpg',
  '/image-7.jpg',
  '/image-8.jpg'
];

const Home: FC = () => {
  

  return (
    <main suppressHydrationWarning className="min-h-screen flex flex-col bg-slate-950 text-white relative overflow-hidden">
      {/* Center Drawer */}
      <Drawer>
        <DrawerTrigger className="absolute left-1/3 right-1/3 top-2/3 bg-gray-900 p-4 rounded-full z-50 text-center mono font-extralight hover:font-bold text-lg text-white duration-300 hover:text-black hover:bg-white">
          Our Services
        </DrawerTrigger>
        <DrawerContent className="bg-slate-950 p-6 w-full   shadow-lg rounded-lg z-50">
          <DrawerClose className="text-white my-4 hover:bg-slate-800 p-2 rounded-full">
            Close
          </DrawerClose>
          <div className="flex flex-col space-y-4">
            <Link href="/generate-wallets" className="block bg-slate-900 p-4 rounded-xl text-center mono font-extralight hover:font-bold text-lg text-white duration-300 hover:text-black hover:bg-white">Create Wallet</Link>
            <Link href="/transactions-explorer" className="block bg-slate-900 p-4 rounded-xl text-center mono font-extralight hover:font-bold text-lg text-white duration-300 hover:text-black hover:bg-white">Transactions Explorer</Link>
            <Link href="/transactions" className="block bg-slate-900 p-4 rounded-xl text-center mono font-extralight hover:font-bold text-lg text-white duration-300 hover:text-black hover:bg-white">Transactions</Link>
            <Link href="/contact" className="block bg-slate-900 p-4 rounded-xl text-center mono font-extralight hover:font-bold text-lg text-white duration-300 hover:text-black hover:bg-white">Contact</Link>
            <Link href="/create-token" className="block bg-slate-900 p-4 rounded-xl text-center mono font-extralight hover:font-bold text-lg text-white duration-300 hover:text-black hover:bg-white">Create Token</Link>
            <Link href="/donate" className="block bg-slate-900 p-4 rounded-xl text-center mono font-extralight hover:font-bold text-lg text-white duration-300 hover:text-black hover:bg-white">Donate</Link>
            <Link href="/req-airdrop" className="block bg-slate-900 p-4 rounded-xl text-center mono font-extralight hover:font-bold text-lg text-white duration-300 hover:text-black hover:bg-white">Request Airdrop</Link>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Marquee Images */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
          <div className="marquee-up">
            <div className="marquee-content flex flex-row">
              {imagesUp.map((src, index) => (
                <img key={index} src={src} alt={`Marquee image ${index + 1}`} className="object-contain w-full h-full" />
              ))}
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full overflow-hidden">
          <div className="marquee-down">
            <div className="marquee-content flex flex-row">
              {imagesDown.map((src, index) => (
                <img key={index} src={src} alt={`Marquee image ${index + 1}`} className="object-contain w-full h-full" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center justify-center p-4 md:p-6 lg:p-8 relative">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-start flex-grow text-center mt-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">Welcome to Wallet Manager</h1>
          <p className="text-lg md:text-xl lg:text-2xl max-w-lg mb-8">Seamlessly manage your wallets, create tokens, and explore transactions. Connect your wallet and switch networks to get started.</p>
          <WalletMultiButton className="bg-gray-800 mt-6 border border-gray-600 rounded-xl px-6 py-2 text-lg mb-6 hover:bg-white hover:text-gray-800 transition-colors duration-300" />
          <NetworkSwitcher />
        </section>
      </div>
    </main>
  );
};

export default Home;