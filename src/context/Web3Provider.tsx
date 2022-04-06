import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useMemo,
  useState,
} from 'react';

import { QueryClient, QueryClientProvider } from 'react-query';

import Connector from '../connectors/Connector';
import { NetworkConnector } from '../connectors/NetworkConnector';
import { NetworksConfig } from '../types/networkTypes';
import { MetaMaskConnector } from '../connectors/MetaMaskConnector';
import { getLsItem, setLsItem } from '../utils/localeStorage';
import { WalletConnectConnector } from '../connectors/WalletConnectConnector';

type Web3ContextType = {
  networksConfig: NetworksConfig;

  connector: Connector;
  setConnector: Dispatch<SetStateAction<Connector>>;

  accountAddress: string | null;
  setAccountAddress: Dispatch<SetStateAction<string | null>>;

  connected: boolean;
  setConnected: Dispatch<SetStateAction<boolean>>;

  connecting: boolean;
  setConnecting: Dispatch<SetStateAction<boolean>>;

  selectedNetwork: number | null;
  desiredNetwork: number;
  setNetwork: (network: number | null) => void;
};

const queryClient = new QueryClient();

export const Web3Context = createContext<Web3ContextType>(
  {} as Web3ContextType
);

export const Web3Provider: React.FunctionComponent<{
  networksConfig: NetworksConfig;
}> = ({ networksConfig, children }) => {
  if (!networksConfig.supportedNetworks.length) {
    throw Error('Web3Provider: must support at least 1 network');
  }

  const cachedChainId = useMemo(
    () =>
      networksConfig.supportedNetworks.find(
        (network) => Number(getLsItem('chain-id-cache')) === network.chainId
      )?.chainId ?? networksConfig.supportedNetworks[0].chainId,
    [networksConfig.supportedNetworks]
  );

  const cachedConnector = useMemo(() => {
    const connectorName = getLsItem('connector-cache');

    if (
      connectorName === MetaMaskConnector.name &&
      MetaMaskConnector.isSupported()
    ) {
      return new MetaMaskConnector(networksConfig.supportedNetworks);
    }

    if (
      connectorName === WalletConnectConnector.name &&
      WalletConnectConnector.isSupported()
    ) {
      return new WalletConnectConnector(networksConfig.supportedNetworks);
    }

    return new NetworkConnector(networksConfig.supportedNetworks);
  }, [networksConfig.supportedNetworks]);

  const [connector, setConnector] = useState<Connector>(cachedConnector);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<number | null>(null);
  const [desiredNetwork, setDesiredNetwork] = useState<number>(cachedChainId);

  const setNetwork = (network: number | null) => {
    setSelectedNetwork(network);

    if (
      network &&
      networksConfig.supportedNetworks.find((nt) => nt.chainId === network)
    ) {
      setLsItem('chain-id-cache', network.toString());
      setDesiredNetwork(network);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Web3Context.Provider
        value={{
          networksConfig,
          accountAddress,
          setAccountAddress,
          connector,
          setConnector,
          connected,
          setConnected,
          connecting,
          setConnecting,
          selectedNetwork,
          desiredNetwork,
          setNetwork,
        }}
      >
        {children}
      </Web3Context.Provider>
    </QueryClientProvider>
  );
};
