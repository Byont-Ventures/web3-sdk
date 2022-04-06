import { Network } from '@ethersproject/networks';
import { Web3Provider, JsonRpcProvider } from '@ethersproject/providers';

export default abstract class Connector {
  public abstract provider: JsonRpcProvider | Web3Provider;
  public abstract connect(chainId?: number): Promise<Network>;
  public abstract switchChain(chainId: number): Promise<Network>;
  public connectorName = 'Connector';

  public connectionChangedCallback?: (connected: boolean) => void;
  public accountChangedCallback?: (account: string) => void;
  public networkChangedCallback?: (network: Network) => void;

  public setConnectionChangedCallback(callback: (connected: boolean) => void) {
    this.connectionChangedCallback = callback;
  }

  public setAccountChangedCallback(callback: (account: string) => void) {
    this.accountChangedCallback = callback;
  }

  public setNetworkChangedCallback(callback: (network: Network) => void) {
    this.networkChangedCallback = callback;
  }

  public static isSupported() {
    return true;
  }

  public disconnect() {
    return;
  }

  public async getNetwork() {
    try {
      return await this.provider.getNetwork();
    } catch (ex) {
      throw new Error(
        'Connector: could not fetch chain data, is JsonRPC valid?'
      );
    }
  }
}
