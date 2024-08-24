import create from 'zustand';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface UserSOLBalanceStore {
  balance: number;
  getUserSOLBalance: (publicKey: PublicKey, connection: Connection) => Promise<void>;
}

const useUserSOLBalanceStore = create<UserSOLBalanceStore>((set) => ({
  balance: 0,
  getUserSOLBalance: async (publicKey, connection) => {
    try {
      const balanceLamports = await connection.getBalance(publicKey, 'confirmed');
      const balance = balanceLamports / LAMPORTS_PER_SOL;
      set({ balance });
      console.log('Balance:', balance);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  },
}));

export default useUserSOLBalanceStore;
