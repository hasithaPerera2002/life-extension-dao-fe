
import { useContext } from 'react';
import { ContractContext } from './ContractProvider';
import { useWallet } from '@/components/wallet/useWallet';

export const useContract = () => {
  const contractContext = useContext(ContractContext);
  const { memberStatus, refreshMemberStatus } = useWallet();

  return {
    ...contractContext,
    memberStatus,
    refreshMemberStatus,
  };
};
