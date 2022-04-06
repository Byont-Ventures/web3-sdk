import { JsonRpcProvider } from '@ethersproject/providers';
import { NetworkSettings } from '../types/networkTypes';
import Connector from './Connector';

export class NetworkConnector extends Connector {
  private allowedChains: NetworkSettings[];
  public provider: JsonRpcProvider;

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

  public override setConnectionChangedCallback() {
    return;
  }

  public async connect(chainId?: number) {
    if (this.connectionChangedCallback) {
      this.connectionChangedCallback(true);
    }

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
      throw new Error('NetworkConnector: chainId not in allowed chains');
    }

    this.provider = new JsonRpcProvider(
      providerSettings.rpcUrl,
      providerSettings.chainId
    );

    return await this.getNetwork();
  }
}
