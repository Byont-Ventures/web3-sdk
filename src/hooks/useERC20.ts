import { useProvider, useConnection } from './useWeb3';
import { ERC20__factory } from '../generated';

import { Provider } from '@ethersproject/providers';
import { Signer, BigNumberish, ContractTransaction } from 'ethers';
import { useQuery, useMutation } from 'react-query';

export const useERC20TokenContract = (
  tokenAddress: string,
  signerOrProvider?: Signer | Provider
) => {
  const defaultProvider = useProvider();

  try {
    return ERC20__factory.connect(
      tokenAddress,
      signerOrProvider ?? defaultProvider
    );
  } catch (ex) {
    // Connection will fail when tokenAddress is emtpy. However, queries won't be executed
    // when that is the case so we can safely return an empty object. We might want to think
    // about a better way of handling this case.
    return {} as ReturnType<typeof ERC20__factory.connect>;
  }
};

export const useERC20Decimals = (tokenAddress: string, enabled?: boolean) => {
  const { desiredNetwork } = useConnection();
  const contract = useERC20TokenContract(tokenAddress);

  return useQuery(
    ['useERC20Decimals', desiredNetwork, tokenAddress],
    () => contract.decimals(),
    { enabled }
  );
};

export const useERC20Symbol = (tokenAddress: string, enabled?: boolean) => {
  const { desiredNetwork } = useConnection();
  const contract = useERC20TokenContract(tokenAddress);

  return useQuery(
    ['useERC20Symbol', desiredNetwork, tokenAddress],
    () => contract.symbol(),
    { enabled }
  );
};

export const useERC20Allowance = (
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string,
  enabled?: boolean
) => {
  const { desiredNetwork } = useConnection();
  const contract = useERC20TokenContract(tokenAddress);

  return useQuery(
    [
      'useERC20Allowance',
      desiredNetwork,
      tokenAddress,
      ownerAddress,
      spenderAddress,
    ],
    () => contract.allowance(ownerAddress, spenderAddress),
    { enabled }
  );
};

export const useERC20BalanceOf = (
  tokenAddress: string,
  userAddress?: string,
  enabled?: boolean
) => {
  const { desiredNetwork, accountAddress } = useConnection();

  const contract = useERC20TokenContract(tokenAddress);
  const address = (userAddress || accountAddress) as string;

  return useQuery(
    ['useERC20BalanceOf', desiredNetwork, address, tokenAddress],
    () => contract.balanceOf(address),
    {
      enabled: enabled ?? address !== null,
    }
  );
};

export const useERC20Approve = (
  tokenAddress: string,
  onSuccess?: (data: ContractTransaction) => Promise<void> | void
) => {
  const contract = useERC20TokenContract(
    tokenAddress,
    useProvider().getSigner()
  );

  return useMutation(
    ({ spender, amount }: { spender: string; amount: BigNumberish }) =>
      contract.approve(spender, amount),
    {
      onSuccess,
    }
  );
};
