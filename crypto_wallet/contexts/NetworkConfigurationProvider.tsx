// NetworkConfigurationProvider.tsx
'use client';
import React, { createContext, FC, ReactNode, useContext } from "react";
import useLocalStorage from "@/hooks/useLocalStorage"; // Ensure this path is correct

export interface NetworkConfigurationState {
    networkConfiguration: string;
    setNetworkConfiguration: (networkConfiguration: string) => void;
}

const NetworkConfigurationContext = createContext<NetworkConfigurationState>({} as NetworkConfigurationState);

export function useNetworkConfiguration(): NetworkConfigurationState {
    return useContext(NetworkConfigurationContext);
}

export const NetworkConfigurationProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [networkConfiguration, setNetworkConfiguration] = useLocalStorage<string>("network", "devnet");

    return (
        <NetworkConfigurationContext.Provider value={{ networkConfiguration, setNetworkConfiguration }}>
            {children}
        </NetworkConfigurationContext.Provider>
    );
};
