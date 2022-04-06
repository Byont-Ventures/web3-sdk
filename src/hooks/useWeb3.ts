import { removeLsItem, setLsItem } from './../utils/localeStorage';
import { JsonRpcProvider } from '@ethersproject/providers';
import { NetworkConnector } from './../connectors/NetworkConnector';
import { useContext, useEffect, useMemo } from 'react';
import { Web3Context } from '../context/Web3Provider';
import Connector from '../connectors/Connector';

const useWeb3Context = () => useContext(Web3Context);

export const useNetworkConfig = () => {
  const context = useWeb3Context();

  const currentNetworkSetings = useMemo(
    () =>
      context.networksConfig.supportedNetworks.find(
        (network) => context.desiredNetwork === network.chainId
      ),
    [context.desiredNetwork, context.networksConfig]
  );

  if (undefined === currentNetworkSetings)
    throw new Error('useNetworkConfig: network is not in supported networks');

  return {
    ...context.networksConfig,
    currentNetworkSetings,
  };
};

export const useProvider = (chainId?: number) => {
  const context = useWeb3Context();

  if (undefined === chainId) return context.connector.provider;

  const providerSettings = context.networksConfig.supportedNetworks.find(
    (network) => chainId === network.chainId
  );

  if (undefined === providerSettings) {
    throw new Error('useRPCProvider: network is not in supported networks');
  }

  return new JsonRpcProvider(providerSettings.rpcUrl, providerSettings.chainId);
};

export const useConnection = () => {
  const context = useWeb3Context();

  const connect = async (connector: Connector) => {
    connector.setConnectionChangedCallback((connected) =>
      context.setConnected(connected)
    );

    connector.setAccountChangedCallback((account) =>
      context.setAccountAddress(account)
    );

    connector.setNetworkChangedCallback((network) =>
      context.setNetwork(network.chainId)
    );

    try {
      context.setNetwork(
        (await connector.connect(context.desiredNetwork || undefined)).chainId
      );
      if (context.connector !== connector) context.setConnector(connector);

      setLsItem('connector-cache', connector.constructor.name);
    } catch (ex: any) {
      disconnect();
    } finally {
      context.setConnecting(false);
    }
  };

  const disconnect = () => {
    context.connector.disconnect();
    context.setNetwork(null);
    context.setAccountAddress(null);
    context.setConnector(
      new NetworkConnector(context.networksConfig.supportedNetworks)
    );
    removeLsItem('connector-cache');
    context.setConnected(false);
  };

  const switchChain = async (chainId: number) => {
    context.setNetwork((await context.connector.switchChain(chainId)).chainId);
  };

  useEffect(() => {
    if (context.selectedNetwork === null && !context.connecting)
      connect(context.connector);
  }, [context.selectedNetwork]);

  return {
    connect,
    disconnect,
    switchChain,
    selectedNetwork: context.selectedNetwork,
    desiredNetwork: context.desiredNetwork,
    currentConnector: context.connector,
    isConnected: context.connected,
    isConnecting: context.connecting,
    accountAddress: context.accountAddress,
  };
};
