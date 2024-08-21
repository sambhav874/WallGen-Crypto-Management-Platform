import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "./label";

interface WalletSelectionProps {
  ethWallets: { publicKey: string }[];
  selectedWallet: string;
  setSelectedWallet: (wallet: string) => void;
}

const EthWalletSelection: React.FC<WalletSelectionProps> = ({
  ethWallets,
  selectedWallet,
  setSelectedWallet,
}) => {
  return (
    <div className="mb-6 w-full max-w-md mx-auto">
      <Label className="text-white">Select ETH Wallet</Label>
      <Select
        onValueChange={(value) => setSelectedWallet(value)}
        value={selectedWallet}
      >
        <SelectTrigger className="mt-2 p-2 text-gray-900 bg-white rounded-md w-full">
          <SelectValue placeholder="Select an ETH wallet" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>ETH Wallets</SelectLabel>
            {ethWallets.map((ethWallet) => (
              <SelectItem key={ethWallet.publicKey} value={ethWallet.publicKey}>
                {ethWallet.publicKey}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default EthWalletSelection;
