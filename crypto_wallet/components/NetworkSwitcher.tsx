'use client';

import React, { FC } from 'react';
import dynamic from 'next/dynamic';
import { useNetworkConfiguration } from '@/contexts/NetworkConfigurationProvider';
import { Select, SelectContent, SelectItem,  SelectTrigger , SelectValue } from './ui/select';
 // Adjust import based on actual path

const NetworkSwitcher: FC = () => {
    const { networkConfiguration, setNetworkConfiguration } = useNetworkConfiguration();
    console.log(networkConfiguration);

    return (
        <div className="flex mt-6 items-center">
            <Select
                value={networkConfiguration}
                onValueChange={(value) => setNetworkConfiguration(value || 'devnet')}
                
            >
                <SelectTrigger className=" bg-slate-950 border border-white outline-0">
                    <SelectValue placeholder="Select Network" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="mainnet-beta">Main</SelectItem>
                    <SelectItem value="devnet">Dev</SelectItem>
                    <SelectItem value="testnet">Test</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
};

export default dynamic(() => Promise.resolve(NetworkSwitcher), { ssr: false });
