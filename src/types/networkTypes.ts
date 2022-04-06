export type NetworkSettings = {
  chainId: number;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: 18;
  };
  rpcUrl: string;
  blockExplorerUrls?: string[];
  iconUrls?: string[];
  tokenImageTemplate: string;
};

export type NetworksConfig = {
  supportedNetworks: NetworkSettings[];
  defaultChainId: number;
};
