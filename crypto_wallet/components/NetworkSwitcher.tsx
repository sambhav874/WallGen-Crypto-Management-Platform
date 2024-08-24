'use client';

import React, { FC } from 'react';
import dynamic from 'next/dynamic';
import { useNetworkConfiguration } from '@/contexts/NetworkConfigurationProvider';

const NetworkSwitcher: FC = () => {
    const { networkConfiguration, setNetworkConfiguration } = useNetworkConfiguration();
    console.log(networkConfiguration);

    return (
        <div className="flex items-center">
            <select
                value={networkConfiguration}
                onChange={(e) => setNetworkConfiguration(e.target.value || 'devnet')}
                className="select max-w-xs border-none bg-transparent outline-0"
            >
                <option value="mainnet-beta">Main</option>
                <option value="devnet">Dev</option>
                <option value="testnet">Test</option>
            </select>
        </div>
    );
};

export default dynamic(() => Promise.resolve(NetworkSwitcher), { ssr: false });
