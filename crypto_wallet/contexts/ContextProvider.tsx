'use client';
import React, { FC, ReactNode, useCallback, useMemo } from 'react';
import { WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider as ReactUIWalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter } from '@solana/wallet-adapter-wallets';
import { AutoConnectProvider, useAutoConnect } from './AutoContextProvider'; 
import { notify } from './../utils/notifications';
import { NetworkConfigurationProvider, useNetworkConfiguration } from './NetworkConfigurationProvider';

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { autoConnect } = useAutoConnect();
    const { networkConfiguration } = useNetworkConfiguration();
    const network = networkConfiguration as WalletAdapterNetwork;

    const originalEndpoint = useMemo(() => clusterApiUrl(network), [network]);

    let endpoint: string;
    if (network === 'mainnet-beta') {
    endpoint = `https://solana-mainnet.g.alchemy.com/${process.env.NEXT_PUBLIC_SOL_MAIN_API_ROUTE}`;
} else if (network === 'devnet') {
    endpoint = `https://solana-devnet.g.alchemy.com/${process.env.NEXT_PUBLIC_SOL_API_ROUTE}`;
} else if (network === 'testnet') {
    endpoint = `https://api.testnet.solana.com`;
} else {
    endpoint = originalEndpoint;
}

    const wallets = useMemo(() => [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
        new TorusWalletAdapter(),
    ], [network]);

    const onError = useCallback((error: WalletError) => {
        notify({
            type: "error",
            message: error.message ? `${error.name}: ${error.message}` : error.name,
        });
        console.error(error);
    }, []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} onError={onError} autoConnect={autoConnect}>
                <ReactUIWalletModalProvider>
                    {children}
                </ReactUIWalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};


export const ContextProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <NetworkConfigurationProvider>
            <AutoConnectProvider>
                <WalletContextProvider>
                    {children}
                </WalletContextProvider>
            </AutoConnectProvider>
        </NetworkConfigurationProvider>
    );
};
