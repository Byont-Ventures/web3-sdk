import { getNetworkSettings, NetworksConfig } from '@web3-sdk/react';

export const [mainnet] = [
  getNetworkSettings('mainnet', 'https://cloudflare-eth.com/'),
  // Add your network settings
];

export const networksConfig: NetworksConfig = {
  supportedNetworks: [mainnet],
  defaultChainId: mainnet.chainId,
};
