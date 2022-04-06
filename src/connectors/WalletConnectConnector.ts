import {
  Web3Provider,
  JsonRpcProvider,
  Network,
} from '@ethersproject/providers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { NetworkSettings } from '../types/networkTypes';
import Connector from './Connector';

export class WalletConnectConnector extends Connector {
  public provider: Web3Provider | JsonRpcProvider;

  private wcProvider?: WalletConnectProvider;
  private allowedChains: NetworkSettings[];

  constructor(allowedChains: NetworkSettings[]) {
    super();

    if (!allowedChains.length) {
      throw new Error('NetworkConnector: must supply at least one chain');
    }

    this.allowedChains = allowedChains;

    this.provider = new JsonRpcProvider(
      allowedChains[0].rpcUrl,
      allowedChains[0].chainId
    );
  }

  public async connect(chainId?: number) {
    this.wcProvider = new WalletConnectProvider({
      rpc: this.allowedChains.reduce(
        (prev, curr) => ({ ...prev, [curr.chainId]: curr.rpcUrl }),
        {}
      ),
      chainId: chainId ?? this.allowedChains[0].chainId,
    });

    this.provider = new Web3Provider(this.wcProvider);

    const accounts = await this.wcProvider.enable();

    if (this.accountChangedCallback && accounts.length > 0) {
      this.accountChangedCallback(accounts[0]);
    } else if (accounts.length === 0) {
      throw Error('WalletConnectConnector: Accounts array is empty');
    }

    this.wcProvider.connector.on('accountsChanged', (_, accounts: string[]) => {
      if (this.accountChangedCallback && accounts.length > 0)
        this.accountChangedCallback(accounts[0]);
    });

    this.wcProvider.connector.on('chainChanged', async (_, payload) => {
      console.log(payload);
      if (this.networkChangedCallback)
        this.networkChangedCallback(await this.getNetwork());
    });

    const network = await this.getNetwork();

    if (
      this.allowedChains.find((chain) => chain.chainId === network.chainId) ===
      undefined
    ) {
      await this.wcProvider.disconnect();

      throw new Error(
        'WalletConnectConnector: connected chain id not in allowed chains'
      );
    }

    if (this.connectionChangedCallback) this.connectionChangedCallback(true);

    return network;
  }

  public async switchChain(chainId: number) {
    if (this.wcProvider) {
      await this.wcProvider.disconnect();
    }

    // Hacky but somehow this works.
    return await new Promise((resolve: (value: Network) => void) =>
      setTimeout(async () => resolve(await this.connect(chainId)), 1)
    );
  }
}
