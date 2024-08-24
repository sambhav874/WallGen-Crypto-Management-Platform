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
import { Label } from "./ui/label";

interface WalletSelectionProps {
  solWallets: { publicKey: string }[];
  selectedWallet: string;
  setSelectedWallet: (wallet: string) => void;
}

const SolWalletSelection: React.FC<WalletSelectionProps> = ({
  solWallets,
  selectedWallet,
  setSelectedWallet,
}) => {
  return (
    <div className="mb-6 w-full max-w-md mx-auto">
      <Label className="text-white">Select SOL Wallet</Label>
      <Select
        onValueChange={(value) => setSelectedWallet(value)}
        value={selectedWallet}
      >
        <SelectTrigger className="mt-2 p-2 text-gray-900 bg-white rounded-md w-full">
          <SelectValue placeholder="Select a SOL wallet" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>SOL Wallets</SelectLabel>
            {solWallets.map((solWallet) => (
              <SelectItem key={solWallet.publicKey} value={solWallet.publicKey}>
                {solWallet.publicKey}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SolWalletSelection;
