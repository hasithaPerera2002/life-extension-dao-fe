
import { useContext } from 'react';
import { WalletContext, WalletContextType } from './WalletProvider';

export const useWallet = (): WalletContextType => {
  return useContext(WalletContext);
};
