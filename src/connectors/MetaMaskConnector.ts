import { NetworkSettings } from './../types/networkTypes';
import { Web3Provider } from '@ethersproject/providers';
import { Network } from '@ethersproject/networks';
import Connector from './Connector';
import { ConnectionError } from '../errors/ConnectionError';

export class MetaMaskConnector extends Connector {
  private allowedChains: NetworkSettings[];
  private metamaskProvider: any; // Are there any types available?

  public provider: Web3Provider;

  constructor(allowedChains: NetworkSettings[]) {
    super();

    if (!allowedChains.length) {
      throw new Error('NetworkConnector: must supply at least one chain');
    }

    this.allowedChains = allowedChains;

    if (typeof window === 'undefined') {
      throw Error('MetaMaskConnector: Window object not detected');
    }

    const metamaskProvider = (window as any).ethereum;

    if (!metamaskProvider) {
      throw Error('MetaMaskConnector: Metamask not detected');
    }

    this.metamaskProvider = metamaskProvider;

    this.provider = new Web3Provider(metamaskProvider, 'any');
  }

  public static override isSupported(): boolean {
    return (
      typeof window !== 'undefined' && (window as any).ethereum !== undefined
    );
  }

  public async connect(chainId?: number) {
    try {
      const accounts = await this.provider.send('eth_requestAccounts', []);

      if (this.accountChangedCallback && accounts.length > 0) {
        this.accountChangedCallback(accounts[0]);
      } else if (accounts.length === 0) {
        throw Error('MetaMaskConnector: Accounts array is empty');
      }
    } catch (ex) {
      throw new ConnectionError(
        'MetaMaskConnector: User did not accept permissions'
      );
    }

    this.provider.on('network', (newNetwork: Network) => {
      if (this.networkChangedCallback) this.networkChangedCallback(newNetwork);
    });

    this.metamaskProvider.on('accountsChanged', (accounts: string[]) => {
      if (this.connectionChangedCallback)
        this.connectionChangedCallback(accounts.length > 0);

      if (this.accountChangedCallback && accounts.length > 0)
        this.accountChangedCallback(accounts[0]);
    });

    if (this.connectionChangedCallback) this.connectionChangedCallback(true);

    if (chainId) {
      return await this.switchChain(chainId);
    } else {
      return await this.getNetwork();
    }
  }

  public async switchChain(chainId: number) {
    const providerSettings = this.allowedChains.find(
      (settings) => settings.chainId === chainId
    );

    if (undefined === providerSettings) {
      throw new Error('MetaMaskConnector: chainId not in allowed chains');
    }

    try {
      await this.provider.send('wallet_switchEthereumChain', [
        { chainId: `0x${chainId.toString(16)}` },
      ]);
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError && switchError.code === 4902) {
        try {
          await this.provider.send('wallet_addEthereumChain', [
            {
              chainId: `0x${chainId.toString(16)}`,
              chainName: providerSettings.chainName,
              nativeCurrency: providerSettings.nativeCurrency,
              rpcUrls: [providerSettings.rpcUrl],
              blockExplorerUrls: providerSettings.blockExplorerUrls,
            },
          ]);
        } catch (addError) {
          // handle "add" error
        }
      }
      // handle other "switch" errors
    }

    return await this.getNetwork();
  }
}
