'use client';

import React, { useState, useEffect } from 'react';
import { useNetworkConfiguration } from '@/contexts/NetworkConfigurationProvider';
import { PublicKey } from '@solana/web3.js';

const getExplorerUrl = (
    endpoint: string,
    viewTypeOrItemAddress: string,
    itemType = "address"
): string => {
    const getClusterUrlParam = () => {
        let cluster = "";
        if (endpoint.includes("127.0.0.1")) {
            cluster = `custom&customUrl=${encodeURIComponent(
                "https://127.0.0.1:8899"
            )}`;
        } else if (endpoint.includes("devnet")) {
            cluster = "devnet";
        } else if (endpoint.includes("mainnet")) {
            cluster = "mainnet";
        }
        return cluster ? `?cluster=${cluster}` : "";
    };

    return `https://explorer.solana.com/${itemType}/${viewTypeOrItemAddress}${getClusterUrlParam()}`;
};

const ExplorerPage: React.FC = () => {
    const { networkConfiguration } = useNetworkConfiguration();
    const [itemAddress, setItemAddress] = useState<string>('');
    const [url, setUrl] = useState<string>('');

    useEffect(() => {
        const endpoint = networkConfiguration === 'mainnet-beta'
            ? `https://solana-mainnet.g.alchemy.com/${process.env.NEXT_PUBLIC_SOL_MAIN_API_ROUTE}`
            : networkConfiguration === 'devnet'
            ? `https://solana-devnet.g.alchemy.com/${process.env.NEXT_PUBLIC_SOL_API_ROUTE}`
            : `https://api.mainnet-beta.solana.com`; // default or testnet endpoint

        setUrl(getExplorerUrl(endpoint, itemAddress));
    }, [networkConfiguration, itemAddress]);

    return (
        <div>
            <h1>Solana Explorer</h1>
            <input
                type="text"
                value={itemAddress}
                onChange={(e) => setItemAddress(e.target.value)}
                placeholder="Enter address or transaction ID"
                className="border p-2 mb-4 w-full max-w-xs"
            />
            <p>
                <a href={url} target="_blank" rel="noopener noreferrer">
                    View on Explorer
                </a>
            </p>
        </div>
    );
};

export default ExplorerPage;
