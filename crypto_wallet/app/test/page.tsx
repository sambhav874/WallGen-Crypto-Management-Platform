import React, { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

const SimpleWalletConnectionTest: FC = () => {
    const { publicKey } = useWallet();

    console.log(publicKey +"Lets test");

    return (
        <div>
            {publicKey && (
                <p>Public Key: {publicKey.toBase58()}</p>
            )}
        </div>
    );
};

export default SimpleWalletConnectionTest;
