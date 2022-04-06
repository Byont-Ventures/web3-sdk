import {
  MetaMaskConnector,
  useConnection,
  useERC20BalanceOf,
  useNetworkConfig,
} from '@web3-sdk/react';
import { FunctionComponent } from 'react';

const Connector: FunctionComponent = () => {
  const { supportedNetworks } = useNetworkConfig();

  const {
    isConnected,
    isConnecting,
    desiredNetwork,
    selectedNetwork,
    accountAddress,
    connect,
    disconnect,
    switchChain,
  } = useConnection();

  const connectMetamask = async () => {
    await connect(new MetaMaskConnector(supportedNetworks));
  };

  const { data, isLoading } = useERC20BalanceOf(
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    accountAddress ?? undefined,
    accountAddress !== undefined
  );

  return (
    <div className="p-4 bg-gray-50 space-y-1">
      <p>Connected: {String(isConnected)}</p>
      <p>Connecting: {String(isConnecting)}</p>
      <p>Connector Chain ID: {String(selectedNetwork)}</p>
      <p>Selected Chain ID: {String(desiredNetwork)}</p>
      <p>Account: {String(accountAddress)}</p>
      <p>Balance: {data?.toString()}</p>
      <p>Loading Balance: {String(isLoading)}</p>
      <div className="space-x-2">
        <button
          className="bg-blue-500 rounded px-2 py-1 shadow-md text-white hover:bg-blue-400"
          onClick={connectMetamask}
        >
          Connect
        </button>
        <button
          className="bg-blue-500 rounded px-2 py-1 shadow-md text-white hover:bg-blue-400"
          onClick={() => disconnect()}
        >
          Disconnect
        </button>
      </div>
      {selectedNetwork === desiredNetwork ? (
        <p className="text-red-900">
          Try switching Metamask to an unsupported chain
        </p>
      ) : null}
      <button
        onClick={() =>
          selectedNetwork !== desiredNetwork
            ? switchChain(supportedNetworks[0].chainId)
            : null
        }
        className={`bg-blue-500 rounded px-2 py-1 shadow-md text-white hover:bg-blue-400 ${
          selectedNetwork === desiredNetwork
            ? 'opacity-50 cursor-not-allowed'
            : ''
        }`}
      >
        Switch back to Eth
      </button>
    </div>
  );
};

export default Connector;
