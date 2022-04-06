import { NetworkSettings } from '../types/networkTypes';

export const BNB_CURRENCY_INFO: NetworkSettings['nativeCurrency'] = {
  name: 'Binance Coin',
  symbol: 'BNB',
  decimals: 18,
};

export const ETH_CURRENCY_INFO: NetworkSettings['nativeCurrency'] = {
  name: 'Ether',
  symbol: 'ETH',
  decimals: 18,
};

export const MATIC_CURRENCY_INFO: NetworkSettings['nativeCurrency'] = {
  name: 'Matic',
  symbol: 'MATIC',
  decimals: 18,
};

export type CoreNetwork = 'ropsten' | 'mainnet' | 'matic' | 'mumbai' | 'bsc';

export const defaultNetworkSettings: Record<
  CoreNetwork,
  Omit<NetworkSettings, 'rpcUrl'>
> = {
  mainnet: {
    chainId: 1,
    chainName: 'Ethereum',
    nativeCurrency: ETH_CURRENCY_INFO,
    blockExplorerUrls: ['https://etherscan.io/'],
    tokenImageTemplate:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/{}/logo.png',
  },
  ropsten: {
    chainId: 3,
    chainName: 'Ropsten (Testnet)',
    nativeCurrency: ETH_CURRENCY_INFO,
    blockExplorerUrls: ['https://ropsten.etherscan.io/'],
    tokenImageTemplate:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/{}/logo.png',
  },
  matic: {
    chainId: 137,
    chainName: 'Polygon',
    nativeCurrency: MATIC_CURRENCY_INFO,
    blockExplorerUrls: ['https://polygonscan.com/'],
    tokenImageTemplate:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/{}/logo.png',
  },
  mumbai: {
    chainId: 80001,
    chainName: 'Mumbai',
    nativeCurrency: MATIC_CURRENCY_INFO,
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
    tokenImageTemplate:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/{}/logo.png',
  },
  bsc: {
    chainId: 56,
    chainName: 'Binance Smart Chain',
    nativeCurrency: BNB_CURRENCY_INFO,
    blockExplorerUrls: ['https://bscscan.com/'],
    tokenImageTemplate:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/{}/logo.png',
  },
};

export const getNetworkSettings = (
  network: CoreNetwork,
  rpcUrl: string
): NetworkSettings =>
  Object.assign(defaultNetworkSettings[network], { rpcUrl });
